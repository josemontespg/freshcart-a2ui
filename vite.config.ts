import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const FRESHCART_CATALOG_ID = 'https://freshcart.app/catalogs/grocery/v1/catalog.json';
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
const FALLBACK_GEMINI_MODEL = 'gemini-flash-latest';

interface EnvConfig {
  apiKey: string;
  keySource: string;
  model: string;
}

function loadCloudtopGeminiKey(): EnvConfig {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    try {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      const keyMatch =
        content.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m) ||
        content.match(/^VITE_GEMINI_API_KEY\s*=\s*(.+)$/m);
      const sourceMatch = content.match(/^GEMINI_KEY_SOURCE\s*=\s*(.+)$/m);
      if (keyMatch && keyMatch[1].trim()) {
        return {
          apiKey: keyMatch[1].trim().replace(/^["']|["']$/g, ''),
          keySource: sourceMatch ? `cloudtop:.env.local (${sourceMatch[1].trim()})` : 'cloudtop:.env.local',
          model: DEFAULT_GEMINI_MODEL,
        };
      }
    } catch {
      // ignore read errors
    }
  }

  const envKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  return {
    apiKey: envKey,
    keySource: envKey ? 'process.env.GEMINI_API_KEY' : 'unconfigured',
    model: DEFAULT_GEMINI_MODEL,
  };
}

function toValidUax31Id(rawId: unknown, fallback = 'node_id'): string {
  if (typeof rawId !== 'string' || !rawId.trim()) return fallback;
  let cleaned = rawId.trim().replace(/[^A-Za-z0-9_]/g, '_');
  if (/^[0-9]/.test(cleaned)) {
    cleaned = `n_${cleaned}`;
  }
  return cleaned || fallback;
}

function sanitizeSurfaceEnvelopes(
  rawParsed: unknown,
  fallbackSurfaceId = 'gemini_live_surface'
): { envelopes: Record<string, unknown>[]; summary: string } {
  let summary = 'Generated live A2UI v1.0 surface with Gemini.';
  let rawEnvelopes: Record<string, unknown>[] = [];

  if (Array.isArray(rawParsed)) {
    rawEnvelopes = rawParsed.filter((x): x is Record<string, unknown> => Boolean(x && typeof x === 'object'));
  } else if (rawParsed && typeof rawParsed === 'object') {
    const obj = rawParsed as Record<string, unknown>;
    if (typeof obj.summary === 'string' && obj.summary.trim()) {
      summary = obj.summary.trim();
    }
    if (Array.isArray(obj.envelopes)) {
      rawEnvelopes = obj.envelopes.filter((x): x is Record<string, unknown> => Boolean(x && typeof x === 'object'));
    } else if (Array.isArray(obj.messages)) {
      rawEnvelopes = obj.messages.filter((x): x is Record<string, unknown> => Boolean(x && typeof x === 'object'));
    } else if ('createSurface' in obj || 'updateComponents' in obj || 'updateDataModel' in obj) {
      rawEnvelopes = [obj];
    }
  }

  let surfaceId = fallbackSurfaceId;
  for (const env of rawEnvelopes) {
    const cs = env.createSurface as Record<string, unknown> | undefined;
    const uc = env.updateComponents as Record<string, unknown> | undefined;
    if (cs && typeof cs.surfaceId === 'string' && cs.surfaceId.trim()) {
      surfaceId = cs.surfaceId.trim();
      break;
    }
    if (uc && typeof uc.surfaceId === 'string' && uc.surfaceId.trim()) {
      surfaceId = uc.surfaceId.trim();
      break;
    }
  }

  const normalized: Record<string, unknown>[] = [];
  let hasCreateSurface = false;

  for (const env of rawEnvelopes) {
    if (env.createSurface && typeof env.createSurface === 'object') {
      const cs = env.createSurface as Record<string, unknown>;
      hasCreateSurface = true;
      normalized.push({
        version: 'v1.0',
        createSurface: {
          surfaceId: typeof cs.surfaceId === 'string' ? cs.surfaceId : surfaceId,
          catalogId: FRESHCART_CATALOG_ID,
          sendDataModel: true,
        },
      });
    }

    if (env.updateComponents && typeof env.updateComponents === 'object') {
      const uc = env.updateComponents as Record<string, unknown>;
      const rawComponents = Array.isArray(uc.components) ? uc.components : [];
      const idMap = new Map<string, string>();

      for (const comp of rawComponents) {
        if (comp && typeof comp === 'object' && typeof (comp as Record<string, unknown>).id === 'string') {
          const origId = (comp as Record<string, unknown>).id as string;
          idMap.set(origId, origId === 'root' ? 'root' : toValidUax31Id(origId));
        }
      }

      const mapId = (id: unknown): unknown => {
        if (typeof id !== 'string') return id;
        return idMap.get(id) ?? toValidUax31Id(id);
      };

      const extraTextComponents: Record<string, unknown>[] = [];
      const sanitizedComponents = rawComponents
        .filter((c): c is Record<string, unknown> => Boolean(c && typeof c === 'object'))
        .map((comp, idx) => {
          const copy: Record<string, unknown> = { ...comp };
          copy.id = idx === 0 && !idMap.has('root') ? 'root' : mapId(copy.id ?? `comp_${idx}`);

          if (typeof copy.child === 'string') {
            copy.child = mapId(copy.child);
          }
          if (Array.isArray(copy.children)) {
            copy.children = copy.children.map((ch) => (typeof ch === 'string' ? mapId(ch) : ch));
          } else if (copy.children && typeof copy.children === 'object') {
            const chObj = { ...(copy.children as Record<string, unknown>) };
            if (typeof chObj.componentId === 'string') {
              chObj.componentId = mapId(chObj.componentId);
            }
            copy.children = chObj;
          }

          if (Array.isArray(copy.tabs)) {
            copy.tabs = copy.tabs.map((tab) => {
              if (tab && typeof tab === 'object') {
                const t = { ...(tab as Record<string, unknown>) };
                if (typeof t.child === 'string') t.child = mapId(t.child);
                return t;
              }
              return tab;
            });
          }

          if (copy.component === 'Text') {
            if ('usageHint' in copy) {
              delete copy.usageHint;
            }
            if (typeof copy.variant === 'string' && /^h[1-5]$/.test(copy.variant)) {
              const hashes = copy.variant === 'h1' || copy.variant === 'h2' ? '## ' : '### ';
              if (typeof copy.text === 'string' && !copy.text.trim().startsWith('#')) {
                copy.text = `${hashes}${copy.text}`;
              }
              copy.variant = 'body';
            } else if (copy.variant !== 'body' && copy.variant !== 'caption') {
              copy.variant = 'body';
            }
          }

          if (copy.component === 'Row' || copy.component === 'Column') {
            delete copy.gap;
            if ('alignItems' in copy) {
              copy.align = copy.align ?? copy.alignItems;
              delete copy.alignItems;
            }
            if ('justifyContent' in copy) {
              copy.justify = copy.justify ?? copy.justifyContent;
              delete copy.justifyContent;
            }
          }

          if (copy.component === 'Slider') {
            delete copy.step;
          }

          if (copy.component === 'ChoicePicker') {
            if (copy.variant === 'singleSelection') {
              copy.variant = 'mutuallyExclusive';
            }
          }

          if (copy.component === 'Button') {
            if (!copy.child && copy.label) {
              const childId = `${String(copy.id)}_label_text`;
              extraTextComponents.push({
                id: childId,
                component: 'Text',
                text: copy.label,
                variant: 'body',
              });
              copy.child = childId;
              delete copy.label;
            }
            if (
              typeof copy.variant !== 'string' ||
              !['default', 'primary', 'borderless'].includes(copy.variant)
            ) {
              copy.variant = 'primary';
            }
          }

          return copy;
        });

      if (extraTextComponents.length > 0) {
        sanitizedComponents.push(...extraTextComponents);
      }

      normalized.push({
        version: 'v1.0',
        updateComponents: {
          surfaceId: typeof uc.surfaceId === 'string' ? uc.surfaceId : surfaceId,
          components: sanitizedComponents,
        },
      });
    }

    if (env.updateDataModel && typeof env.updateDataModel === 'object') {
      const udm = env.updateDataModel as Record<string, unknown>;
      normalized.push({
        version: 'v1.0',
        updateDataModel: {
          surfaceId: typeof udm.surfaceId === 'string' ? udm.surfaceId : surfaceId,
          path: typeof udm.path === 'string' ? udm.path : '/',
          value: udm.value ?? {},
        },
      });
    }
  }

  if (!hasCreateSurface && normalized.length > 0) {
    normalized.unshift({
      version: 'v1.0',
      createSurface: {
        surfaceId,
        catalogId: FRESHCART_CATALOG_ID,
        sendDataModel: true,
      },
    });
  }

  return { envelopes: normalized, summary };
}

function buildGeminiSystemInstruction(): string {
  return `You are the FreshCart AI Personal Shopper powered by Google Gemini, speaking native A2UI v1.0 protocol.
Your job is to respond to user grocery requests by generating a rich, interactive A2UI v1.0 UI surface using real store products provided in the prompt context.

Return ONLY valid JSON with the following top-level shape:
{
  "summary": "1-sentence natural language summary of what you built for the shopper",
  "envelopes": [
    {
      "version": "v1.0",
      "createSurface": {
        "surfaceId": "gemini_shopper_surface",
        "catalogId": "${FRESHCART_CATALOG_ID}",
        "sendDataModel": true
      }
    },
    {
      "version": "v1.0",
      "updateComponents": {
        "surfaceId": "gemini_shopper_surface",
        "components": [ ... ]
      }
    },
    {
      "version": "v1.0",
      "updateDataModel": {
        "surfaceId": "gemini_shopper_surface",
        "path": "/",
        "value": { ... }
      }
    }
  ]
}

STRICT A2UI v1.0 RULES (MANDATORY):
1. Every envelope MUST include "version": "v1.0".
2. Component IDs MUST be valid UAX #31 identifiers using ONLY letters, digits, and underscores (e.g., "root", "header_card", "servings_slider", "deal_card_1", "add_all_btn"). NEVER use hyphens (-) in component IDs!
3. The root component in updateComponents.components MUST have "id": "root" and "component": "Column" with "children": ["..."].
4. Allowed standard components:
   - "Column": { "id": "...", "component": "Column", "children": ["id1", "id2"], "align": "stretch" }
   - "Row": { "id": "...", "component": "Row", "children": ["id1", "id2"], "justify": "spaceBetween", "align": "center" }
   - "Card": { "id": "...", "component": "Card", "child": "inner_col_id" }
   - "Text": { "id": "...", "component": "Text", "text": "Markdown or plain string or {\\"@path\\": \\"/title\\"}", "variant": "h2" | "h3" | "h4" | "body" | "caption" } (NEVER use subtitle1 or body1!)
   - "Slider": { "id": "...", "component": "Slider", "label": "Servings", "min": 1, "max": 8, "step": 1, "value": { "@path": "/servings" } }
   - "CheckBox": { "id": "...", "component": "CheckBox", "label": "Organic Only", "value": { "@path": "/organicOnly" } }
   - "ChoicePicker": { "id": "...", "component": "ChoicePicker", "label": "Focus", "variant": "mutuallyExclusive", "options": [{"label": "Quick Prep", "value": "quick"}, {"label": "High Protein", "value": "protein"}], "value": { "@path": "/focus" } }
   - "Button": { "id": "...", "component": "Button", "variant": "primary" | "secondary", "child": "btn_text_id", "action": { "event": { "name": "add_recipe_bundle_to_cart", "context": { "recipeTitle": { "@path": "/planTitle" }, "servings": { "@path": "/servings" }, "items": [ { "productId": "prod-salmon-01", "quantity": 1 } ] } } } }
   - "Divider": { "id": "...", "component": "Divider" }
5. Allowed FreshCart custom catalog components (PREFER THESE for rich grocery UX!):
   - "NutritionSummary": {
       "id": "nutrition_summary_card",
       "component": "NutritionSummary",
       "title": "Nutritional Macro Breakdown (Per Serving)",
       "servings": { "@path": "/servings" },
       "calories": 540,
       "proteinGrams": 44,
       "carbsGrams": 36,
       "fatGrams": 22,
       "fiberGrams": 8,
       "dailyCalorieTarget": 2000
     }
   - "ProductDealCard": {
       "id": "deal_card_1",
       "component": "ProductDealCard",
       "productId": "prod-salmon-01",
       "title": "Wild Alaskan Sockeye Salmon",
       "reason": "Rich in Omega-3s · Selected by Gemini for your request",
       "badgeText": "AI Chef Pick",
       "price": 14.99,
       "originalPrice": 17.99,
       "unit": "1.25 lb",
       "imageUrl": "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=600&q=80",
       "actionLabel": "Add to Cart",
       "action": {
         "event": {
           "name": "add_recipe_bundle_to_cart",
           "context": {
             "recipeTitle": "Gemini Pick",
             "servings": 1,
             "items": [{ "productId": "prod-salmon-01", "quantity": 1 }]
           }
         }
       }
     }
6. ALWAYS pick 3 to 5 REAL products from the provided availableProducts list, using their exact productId, name, price, unit, and imageUrl!
7. Include a primary CTA Button at the bottom of the surface with action.event.name = "add_recipe_bundle_to_cart" (and context.items array of { productId, quantity }) or "build_weekly_basket" (with context.recommendedProductIds array of productIds) so clicking it adds the recommended items directly into the user's live FreshCart shopping cart, plus a Text component bound to { "@path": "/statusBanner" } to show cart confirmation.
8. CONSUMER-FRIENDLY COPY RULE: Write warm, natural, appetizing grocery copy in all visible text, headings, labels, badges, and summaries (e.g., "Chef's Pick", "25-Minute Dinner", "Add All Ingredients to Cart"). NEVER output developer or protocol jargon ("A2UI", "v1.0", "@path", "@call", "SKU", "dataModel", or "surface") inside any user-visible string!`;
}

function geminiA2UIMiddlewarePlugin(): Plugin {
  return {
    name: 'freshcart-gemini-a2ui-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        if (req.url.startsWith('/api/gemini/status') && req.method === 'GET') {
          const cfg = loadCloudtopGeminiKey();
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              configured: Boolean(cfg.apiKey),
              model: cfg.model,
              keySource: cfg.keySource,
            })
          );
          return;
        }

        if (req.url.startsWith('/api/gemini/a2ui') && req.method === 'POST') {
          const cfg = loadCloudtopGeminiKey();
          if (!cfg.apiKey) {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'Gemini API key not configured in .env.local',
              })
            );
            return;
          }

          let rawBody = '';
          for await (const chunk of req) {
            rawBody += chunk;
          }

          let body: Record<string, unknown> = {};
          try {
            body = JSON.parse(rawBody || '{}');
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid JSON request body' }));
            return;
          }

          const userPrompt =
            typeof body.prompt === 'string' && body.prompt.trim()
              ? body.prompt.trim()
              : 'Build a healthy, high-protein dinner and weekly grocery bundle with smart deals.';
          const scenarioHint = typeof body.scenarioHint === 'string' ? body.scenarioHint : 'custom';
          const activeStore = body.activeStore ?? {};
          const cartItems = Array.isArray(body.cartItems) ? body.cartItems : [];
          const availableProducts = Array.isArray(body.availableProducts)
            ? body.availableProducts.slice(0, 24)
            : [];
          const actionEvent = body.actionEvent ?? null;

          const surfaceIdByScenario: Record<string, string> = {
            'meal-planner': 'meal-planner-surface',
            'cart-optimizer': 'cart-optimizer-surface',
            'budget-builder': 'budget-nutrition-surface',
            custom: 'gemini-live-surface',
          };
          const targetSurfaceId = surfaceIdByScenario[scenarioHint] || 'gemini-live-surface';

          const promptPayload = {
            userRequest: userPrompt,
            targetSurfaceId,
            scenarioHint,
            activeStore,
            currentCartItems: cartItems,
            actionEvent,
            availableProducts,
          };

          const startTime = Date.now();
          let usedModel = cfg.model;
          let geminiResponseText = '';

          try {
            for (const candidateModel of [DEFAULT_GEMINI_MODEL, FALLBACK_GEMINI_MODEL]) {
              usedModel = candidateModel;
              const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;
              const upstreamRes = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: {
                    parts: [{ text: buildGeminiSystemInstruction() }],
                  },
                  contents: [
                    {
                      role: 'user',
                      parts: [
                        {
                          text: `Generate a complete A2UI v1.0 surface (with surfaceId "${targetSurfaceId}") for this shopper context:\n${JSON.stringify(promptPayload)}`,
                        },
                      ],
                    },
                  ],
                  generationConfig: {
                    temperature: 0.35,
                    responseMimeType: 'application/json',
                    thinkingConfig: { thinkingBudget: 0 },
                  },
                }),
              });

              if (upstreamRes.ok) {
                const upstreamJson = (await upstreamRes.json()) as {
                  candidates?: Array<{
                    content?: { parts?: Array<{ text?: string }> };
                  }>;
                };
                const parts = upstreamJson.candidates?.[0]?.content?.parts ?? [];
                const textPart = parts.find((p) => typeof p.text === 'string' && p.text.trim());
                if (textPart?.text) {
                  geminiResponseText = textPart.text;
                  break;
                }
              } else if (upstreamRes.status !== 404 && upstreamRes.status !== 429 && upstreamRes.status !== 503) {
                const errTxt = await upstreamRes.text();
                throw new Error(`Gemini API HTTP ${upstreamRes.status}: ${errTxt.slice(0, 240)}`);
              }
            }

            if (!geminiResponseText) {
              throw new Error('Empty response from Gemini API');
            }

            const parsedJson = JSON.parse(geminiResponseText);
            const { envelopes, summary } = sanitizeSurfaceEnvelopes(parsedJson, targetSurfaceId);
            const latencyMs = Date.now() - startTime;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                envelopes,
                model: usedModel,
                latencyMs,
                summary,
                rawText: geminiResponseText,
              })
            );
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'Gemini A2UI generation failed',
              })
            );
          }
          return;
        }

        return next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), geminiA2UIMiddlewarePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
});
