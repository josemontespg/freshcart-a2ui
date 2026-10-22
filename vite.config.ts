import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const FRESHCART_CATALOG_ID = 'https://freshcart.app/catalogs/grocery/v1/catalog.json';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const FALLBACK_GEMINI_MODEL = 'gemini-flash-latest';

interface EnvConfig {
  apiKey: string;
  keySource: string;
  model: string;
}

export type DirectJsonDeliveryMode = 'progressive-sse' | 'single-shot-direct-json';

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

function sanitizeComponentsArray(rawComponents: unknown[]): Record<string, unknown>[] {
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

  return sanitizedComponents;
}

function sanitizeSurfaceEnvelopes(
  rawParsed: unknown,
  fallbackSurfaceId = 'gemini_live_surface',
  options?: { preserveSingleShotCreateSurface?: boolean }
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

  const surfaceId = fallbackSurfaceId;
  const normalized: Record<string, unknown>[] = [];
  let hasCreateSurface = false;

  for (const env of rawEnvelopes) {
    if (env.createSurface && typeof env.createSurface === 'object') {
      hasCreateSurface = true;
      const cs = env.createSurface as Record<string, unknown>;
      const inlineComponents = Array.isArray(cs.components)
        ? sanitizeComponentsArray(cs.components)
        : undefined;
      const inlineDataModel =
        cs.dataModel && typeof cs.dataModel === 'object' && !Array.isArray(cs.dataModel)
          ? (cs.dataModel as Record<string, unknown>)
          : undefined;

      if (options?.preserveSingleShotCreateSurface && (inlineComponents || inlineDataModel)) {
        normalized.push({
          version: 'v1.0',
          createSurface: {
            surfaceId,
            catalogId: FRESHCART_CATALOG_ID,
            sendDataModel: true,
            ...(inlineComponents ? { components: inlineComponents } : {}),
            ...(inlineDataModel ? { dataModel: inlineDataModel } : {}),
          },
        });
      } else {
        normalized.push({
          version: 'v1.0',
          createSurface: {
            surfaceId,
            catalogId: FRESHCART_CATALOG_ID,
            sendDataModel: true,
          },
        });
        if (inlineComponents && inlineComponents.length > 0) {
          normalized.push({
            version: 'v1.0',
            updateComponents: {
              surfaceId,
              components: inlineComponents,
            },
          });
        }
        if (inlineDataModel) {
          normalized.push({
            version: 'v1.0',
            updateDataModel: {
              surfaceId,
              path: '/',
              value: inlineDataModel,
            },
          });
        }
      }
    }

    if (env.updateComponents && typeof env.updateComponents === 'object') {
      const uc = env.updateComponents as Record<string, unknown>;
      const rawComponents = Array.isArray(uc.components) ? uc.components : [];
      const sanitizedComponents = sanitizeComponentsArray(rawComponents);

      normalized.push({
        version: 'v1.0',
        updateComponents: {
          surfaceId,
          components: sanitizedComponents,
        },
      });
    }

    if (env.updateDataModel && typeof env.updateDataModel === 'object') {
      const udm = env.updateDataModel as Record<string, unknown>;
      normalized.push({
        version: 'v1.0',
        updateDataModel: {
          surfaceId,
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

interface StreamStagePacket {
  stage: 'createSurface' | 'updateComponents' | 'updateDataModel';
  label: string;
  envelope: Record<string, unknown>;
}

function collectSubtreeComponentIds(
  startId: string,
  byId: Map<string, Record<string, unknown>>,
  visited: Set<string>
): string[] {
  if (visited.has(startId)) return [];
  const comp = byId.get(startId);
  if (!comp) return [];

  visited.add(startId);
  const result: string[] = [startId];

  const visitRef = (ref: unknown) => {
    if (typeof ref === 'string' && byId.has(ref) && !visited.has(ref)) {
      result.push(...collectSubtreeComponentIds(ref, byId, visited));
    }
  };

  visitRef(comp.child);
  visitRef(comp.trigger);
  visitRef(comp.content);

  if (Array.isArray(comp.children)) {
    for (const ch of comp.children) {
      visitRef(ch);
    }
  } else if (comp.children && typeof comp.children === 'object') {
    const chObj = comp.children as Record<string, unknown>;
    visitRef(chObj.componentId);
  }

  if (Array.isArray(comp.tabs)) {
    for (const tab of comp.tabs) {
      if (tab && typeof tab === 'object') {
        visitRef((tab as Record<string, unknown>).child);
      }
    }
  }

  return result;
}

function buildSingleShotDirectJsonEnvelope(
  envelopes: Record<string, unknown>[],
  surfaceId: string
): StreamStagePacket[] {
  const allComponents: Record<string, unknown>[] = [];
  let mergedDataModel: Record<string, unknown> = {};

  for (const env of envelopes) {
    if (env.createSurface && typeof env.createSurface === 'object') {
      const cs = env.createSurface as Record<string, unknown>;
      if (Array.isArray(cs.components)) {
        allComponents.push(
          ...(cs.components.filter((c): c is Record<string, unknown> => Boolean(c && typeof c === 'object')))
        );
      }
      if (cs.dataModel && typeof cs.dataModel === 'object' && !Array.isArray(cs.dataModel)) {
        mergedDataModel = { ...mergedDataModel, ...(cs.dataModel as Record<string, unknown>) };
      }
    }
    if (env.updateComponents && typeof env.updateComponents === 'object') {
      const uc = env.updateComponents as Record<string, unknown>;
      if (Array.isArray(uc.components)) {
        allComponents.push(
          ...(uc.components.filter((c): c is Record<string, unknown> => Boolean(c && typeof c === 'object')))
        );
      }
    }
    if (env.updateDataModel && typeof env.updateDataModel === 'object') {
      const udm = env.updateDataModel as Record<string, unknown>;
      if (udm.value && typeof udm.value === 'object' && !Array.isArray(udm.value)) {
        mergedDataModel = { ...mergedDataModel, ...(udm.value as Record<string, unknown>) };
      }
    }
  }

  return [
    {
      stage: 'createSurface',
      label: 'Single-Shot createSurface (inline components + dataModel)',
      envelope: {
        version: 'v1.0',
        createSurface: {
          surfaceId,
          catalogId: FRESHCART_CATALOG_ID,
          sendDataModel: true,
          components: allComponents,
          dataModel: mergedDataModel,
        },
      },
    },
  ];
}

function sliceEnvelopesIntoProgressiveStream(
  envelopes: Record<string, unknown>[],
  surfaceId: string
): StreamStagePacket[] {
  const allComponents: Record<string, unknown>[] = [];
  let fullDataModel: Record<string, unknown> = {};

  for (const env of envelopes) {
    if (env.createSurface && typeof env.createSurface === 'object') {
      const cs = env.createSurface as Record<string, unknown>;
      if (Array.isArray(cs.components)) {
        allComponents.push(
          ...(cs.components.filter((c): c is Record<string, unknown> => Boolean(c && typeof c === 'object')))
        );
      }
      if (cs.dataModel && typeof cs.dataModel === 'object' && !Array.isArray(cs.dataModel)) {
        fullDataModel = { ...fullDataModel, ...(cs.dataModel as Record<string, unknown>) };
      }
    }
    if (env.updateComponents && typeof env.updateComponents === 'object') {
      const uc = env.updateComponents as Record<string, unknown>;
      if (Array.isArray(uc.components)) {
        allComponents.push(
          ...(uc.components.filter((c): c is Record<string, unknown> => Boolean(c && typeof c === 'object')))
        );
      }
    }
    if (env.updateDataModel && typeof env.updateDataModel === 'object') {
      const udm = env.updateDataModel as Record<string, unknown>;
      if (udm.value && typeof udm.value === 'object' && !Array.isArray(udm.value)) {
        fullDataModel = { ...fullDataModel, ...(udm.value as Record<string, unknown>) };
      }
    }
  }

  const packets: StreamStagePacket[] = [];

  // Stage 1: Lightweight createSurface shell
  packets.push({
    stage: 'createSurface',
    label: 'Initialize surface shell (createSurface)',
    envelope: {
      version: 'v1.0',
      createSurface: {
        surfaceId,
        catalogId: FRESHCART_CATALOG_ID,
        sendDataModel: true,
      },
    },
  });

  // Separate scalar fields, nested objects, and collection arrays in dataModel
  const scalarSeed: Record<string, unknown> = {};
  const arrayEntries: Array<[string, unknown[]]> = [];
  const objectEntries: Array<[string, Record<string, unknown>]> = [];
  const deferredKeys = new Set([
    'estimatedTotal',
    'projectedSpend',
    'totalSavings',
    'lastActionConfirmation',
    'statusBanner',
  ]);
  const deferredEntries: Array<[string, unknown]> = [];

  for (const [k, v] of Object.entries(fullDataModel)) {
    if (deferredKeys.has(k)) {
      deferredEntries.push([k, v]);
    } else if (Array.isArray(v)) {
      scalarSeed[k] = [];
      arrayEntries.push([k, v]);
    } else if (v && typeof v === 'object') {
      objectEntries.push([k, v as Record<string, unknown>]);
    } else {
      scalarSeed[k] = v;
    }
  }

  if (Object.keys(scalarSeed).length > 0) {
    packets.push({
      stage: 'updateDataModel',
      label: 'Seed headline & state scalars (updateDataModel /)',
      envelope: {
        version: 'v1.0',
        updateDataModel: {
          surfaceId,
          path: '/',
          value: scalarSeed,
        },
      },
    });
  }

  const byId = new Map<string, Record<string, unknown>>();
  for (const comp of allComponents) {
    if (typeof comp.id === 'string') {
      byId.set(comp.id, comp);
    }
  }

  const rootComp = byId.get('root') ?? allComponents[0];
  const rootChildren =
    rootComp && Array.isArray(rootComp.children)
      ? (rootComp.children.filter((c): c is string => typeof c === 'string'))
      : [];

  if (rootComp && rootChildren.length > 1) {
    const visited = new Set<string>(['root']);
    let nutritionEmitted = false;

    rootChildren.forEach((sectionId, idx) => {
      const subtreeIds = collectSubtreeComponentIds(sectionId, byId, visited);
      const subtreeComps = subtreeIds
        .map((id) => byId.get(id))
        .filter((c): c is Record<string, unknown> => Boolean(c));

      // Include any remaining unvisited components on the final section batch
      if (idx === rootChildren.length - 1) {
        for (const [cid, comp] of byId.entries()) {
          if (!visited.has(cid)) {
            visited.add(cid);
            subtreeComps.push(comp);
          }
        }
      }

      const progressiveRoot: Record<string, unknown> = {
        ...rootComp,
        children: rootChildren.slice(0, idx + 1),
      };

      packets.push({
        stage: 'updateComponents',
        label: `Stream UI section ${idx + 1}/${rootChildren.length}: ${sectionId}`,
        envelope: {
          version: 'v1.0',
          updateComponents: {
            surfaceId,
            components: [progressiveRoot, ...subtreeComps],
          },
        },
      });

      // Interleave nested object updates (e.g., /nutrition) right after the controls/header batch
      if (!nutritionEmitted && idx >= 1 && objectEntries.length > 0) {
        nutritionEmitted = true;
        for (const [objKey, objVal] of objectEntries) {
          packets.push({
            stage: 'updateDataModel',
            label: `Populate /${objKey} data binding`,
            envelope: {
              version: 'v1.0',
              updateDataModel: {
                surfaceId,
                path: `/${objKey}`,
                value: objVal,
              },
            },
          });
        }
      }
    });

    if (!nutritionEmitted && objectEntries.length > 0) {
      for (const [objKey, objVal] of objectEntries) {
        packets.push({
          stage: 'updateDataModel',
          label: `Populate /${objKey} data binding`,
          envelope: {
            version: 'v1.0',
            updateDataModel: {
              surfaceId,
              path: `/${objKey}`,
              value: objVal,
            },
          },
        });
      }
    }
  } else if (allComponents.length > 0) {
    packets.push({
      stage: 'updateComponents',
      label: `Mount ${allComponents.length} components (updateComponents)`,
      envelope: {
        version: 'v1.0',
        updateComponents: {
          surfaceId,
          components: allComponents,
        },
      },
    });
    for (const [objKey, objVal] of objectEntries) {
      packets.push({
        stage: 'updateDataModel',
        label: `Populate /${objKey} data binding`,
        envelope: {
          version: 'v1.0',
          updateDataModel: {
            surfaceId,
            path: `/${objKey}`,
            value: objVal,
          },
        },
      });
    }
  }

  // Stream collection items via granular JSON Pointer paths (e.g., /ingredients/0, /ingredients/1)
  for (const [arrKey, items] of arrayEntries) {
    items.forEach((item, idx) => {
      const itemTitle =
        item && typeof item === 'object'
          ? String(
              (item as Record<string, unknown>).name ??
                (item as Record<string, unknown>).replacementName ??
                `#${idx + 1}`
            )
          : `#${idx + 1}`;
      packets.push({
        stage: 'updateDataModel',
        label: `Stream item /${arrKey}/${idx} (${itemTitle})`,
        envelope: {
          version: 'v1.0',
          updateDataModel: {
            surfaceId,
            path: `/${arrKey}/${idx}`,
            value: item,
          },
        },
      });
    });
  }

  // Emit deferred totals and confirmation paths
  for (const [defKey, defVal] of deferredEntries) {
    packets.push({
      stage: 'updateDataModel',
      label: `Finalize /${defKey} (${String(defVal)})`,
      envelope: {
        version: 'v1.0',
        updateDataModel: {
          surfaceId,
          path: `/${defKey}`,
          value: defVal,
        },
      },
    });
  }

  return packets;
}

function buildServerSideFallbackSurface(
  targetSurfaceId: string,
  userPrompt: string,
  availableProducts: Array<Record<string, unknown>>
): { envelopes: Record<string, unknown>[]; summary: string } {
  const lower = userPrompt.toLowerCase();
  const isChicken = lower.includes('chicken') || lower.includes('bowl') || lower.includes('protein');
  const picked = availableProducts.slice(0, 4);

  const p0 = picked[0] ?? {
    id: 'prod-salmon-01',
    name: isChicken ? 'Organic Pasture-Raised Chicken Breast' : 'Wild Alaskan Sockeye Salmon Fillets',
    price: 14.99,
    unit: '1.25 lb',
    imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=600&q=80',
  };
  const p1 = picked[1] ?? {
    id: 'prod-quinoa-01',
    name: 'Organic Tri-Color Quinoa',
    price: 5.49,
    unit: '16 oz bag',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  };
  const p2 = picked[2] ?? {
    id: 'prod-avocado-01',
    name: 'Organic Hass Avocados (4 ct)',
    price: 4.99,
    unit: '4 count bag',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
  };
  const p3 = picked[3] ?? {
    id: 'prod-olive-oil-01',
    name: 'Cold-Pressed Extra Virgin Olive Oil',
    price: 11.99,
    unit: '500 ml bottle',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  };

  const ingredients = [p0, p1, p2].map((p, idx) => ({
    index: idx,
    productId: String(p.id ?? `prod-item-${idx}`),
    name: String(p.name ?? `Fresh Ingredient ${idx + 1}`),
    category: String(p.category ?? 'Fresh Pick'),
    unit: String(p.unit ?? '1 each'),
    unitPrice: Number(p.price ?? 5.99),
    baseQtyFor4: 1,
    scaledQty: 1,
    lineTotal: Number(p.price ?? 5.99),
    dietaryBadge: 'Chef Pick',
    checked: true,
    canSwap: false,
    swapLabel: 'Best Match',
  }));

  const estimatedTotal = Number(
    ingredients.reduce((acc, it) => acc + it.lineTotal, 0).toFixed(2)
  );

  const components: Record<string, unknown>[] = [
    {
      id: 'root',
      component: 'Column',
      children: ['header_card', 'controls_card', 'ingredients_card', 'pairing_deal_card', 'footer_cta_card'],
      align: 'stretch',
    },
    {
      id: 'header_card',
      component: 'Card',
      child: 'header_col',
    },
    {
      id: 'header_col',
      component: 'Column',
      children: ['recipe_title_text', 'recipe_subtitle_text', 'recipe_meta_row'],
      align: 'stretch',
    },
    {
      id: 'recipe_title_text',
      component: 'Text',
      text: { '@path': '/recipeTitle' },
      variant: 'body',
    },
    {
      id: 'recipe_subtitle_text',
      component: 'Text',
      text: { '@path': '/recipeSubtitle' },
      variant: 'caption',
    },
    {
      id: 'recipe_meta_row',
      component: 'Row',
      children: ['prep_time_badge', 'difficulty_badge'],
      justify: 'start',
      align: 'center',
    },
    {
      id: 'prep_time_badge',
      component: 'Text',
      text: { '@path': '/prepTime' },
      variant: 'caption',
    },
    {
      id: 'difficulty_badge',
      component: 'Text',
      text: { '@path': '/difficulty' },
      variant: 'caption',
    },
    {
      id: 'controls_card',
      component: 'Card',
      child: 'controls_col',
    },
    {
      id: 'controls_col',
      component: 'Column',
      children: ['servings_slider', 'nutrition_summary'],
      align: 'stretch',
    },
    {
      id: 'servings_slider',
      component: 'Slider',
      label: 'Number of Servings',
      min: 1,
      max: 8,
      value: { '@path': '/servings' },
    },
    {
      id: 'nutrition_summary',
      component: 'NutritionSummary',
      catalogId: FRESHCART_CATALOG_ID,
      title: 'Nutrition Per Serving',
      servings: { '@path': '/servings' },
      calories: { '@path': '/nutrition/calories' },
      proteinGrams: { '@path': '/nutrition/proteinGrams' },
      carbsGrams: { '@path': '/nutrition/carbsGrams' },
      fatGrams: { '@path': '/nutrition/fatGrams' },
      fiberGrams: { '@path': '/nutrition/fiberGrams' },
      dailyCalorieTarget: 2000,
    },
    {
      id: 'ingredients_card',
      component: 'Card',
      child: 'ingredients_col',
    },
    {
      id: 'ingredients_col',
      component: 'Column',
      children: ['ingredients_heading', 'ingredients_list'],
      align: 'stretch',
    },
    {
      id: 'ingredients_heading',
      component: 'Text',
      text: '### Scaled Grocery Ingredients',
      variant: 'body',
    },
    {
      id: 'ingredients_list',
      component: 'List',
      direction: 'vertical',
      children: {
        componentId: 'ingredient_row_tpl',
        path: '/ingredients',
      },
    },
    {
      id: 'ingredient_row_tpl',
      component: 'Row',
      children: ['ingredient_check', 'ingredient_price_txt'],
      justify: 'spaceBetween',
      align: 'center',
    },
    {
      id: 'ingredient_check',
      component: 'CheckBox',
      label: { '@path': 'name' },
      value: { '@path': 'checked' },
    },
    {
      id: 'ingredient_price_txt',
      component: 'Text',
      text: {
        '@call': 'formatCurrency',
        args: { value: { '@path': 'lineTotal' }, currency: 'USD' },
      },
      variant: 'caption',
    },
    {
      id: 'pairing_deal_card',
      component: 'ProductDealCard',
      catalogId: FRESHCART_CATALOG_ID,
      productId: String(p3.id ?? 'prod-olive-oil-01'),
      title: String(p3.name ?? 'Cold-Pressed Extra Virgin Olive Oil'),
      reason: 'Chef pairing for finishing tonight’s dinner',
      badgeText: 'Featured Pairing',
      price: Number(p3.price ?? 11.99),
      unit: String(p3.unit ?? '500 ml'),
      imageUrl: String(
        p3.imageUrl ??
          'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'
      ),
      actionLabel: 'Add Pairing',
      action: {
        event: {
          name: 'add_pairing_item',
          context: {
            productId: String(p3.id ?? 'prod-olive-oil-01'),
            title: String(p3.name ?? 'Cold-Pressed Extra Virgin Olive Oil'),
            quantity: 1,
          },
        },
      },
    },
    {
      id: 'footer_cta_card',
      component: 'Card',
      child: 'footer_cta_col',
    },
    {
      id: 'footer_cta_col',
      component: 'Column',
      children: ['add_bundle_btn', 'status_confirm_txt'],
      align: 'stretch',
    },
    {
      id: 'add_bundle_btn',
      component: 'Button',
      variant: 'primary',
      child: 'add_bundle_btn_txt',
      action: {
        event: {
          name: 'add_recipe_bundle_to_cart',
          context: {
            recipeTitle: { '@path': '/recipeTitle' },
            servings: { '@path': '/servings' },
            ingredients: { '@path': '/ingredients' },
          },
        },
      },
    },
    {
      id: 'add_bundle_btn_txt',
      component: 'Text',
      text: 'Add Checked Ingredients to Cart',
      variant: 'body',
    },
    {
      id: 'status_confirm_txt',
      component: 'Text',
      text: { '@path': '/lastActionConfirmation' },
      variant: 'caption',
    },
  ];

  const dataModel: Record<string, unknown> = {
    recipeTitle: isChicken
      ? '## Harvest High-Protein Chicken & Avocado Bowls'
      : '## Mediterranean Herb-Crusted Salmon & Quinoa',
    recipeSubtitle:
      'Streamed progressively via A2UI v1.0 Direct JSON (createSurface → updateComponents → updateDataModel)',
    prepTime: '⏱ 25 mins',
    difficulty: '👨‍🍳 Easy Weeknight',
    servings: 4,
    organicOnly: false,
    glutenFree: true,
    nutrition: {
      calories: 540,
      proteinGrams: 46,
      carbsGrams: 34,
      fatGrams: 22,
      fiberGrams: 8,
    },
    ingredients,
    estimatedTotal,
    lastActionConfirmation: `Ready to add ${ingredients.length} fresh ingredients ($${estimatedTotal.toFixed(2)}) to your cart.`,
  };

  return {
    summary: isChicken
      ? 'Here is a high-protein chicken & avocado bowl plan streamed progressively in real time:'
      : 'Here is a chef-curated Mediterranean salmon dinner plan streamed progressively in real time:',
    envelopes: [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId: targetSurfaceId,
          catalogId: FRESHCART_CATALOG_ID,
          sendDataModel: true,
        },
      },
      {
        version: 'v1.0',
        updateComponents: {
          surfaceId: targetSurfaceId,
          components,
        },
      },
      {
        version: 'v1.0',
        updateDataModel: {
          surfaceId: targetSurfaceId,
          path: '/',
          value: dataModel,
        },
      },
    ],
  };
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
              streamingEndpoint: '/api/gemini/a2ui-stream',
            })
          );
          return;
        }

        // Feature 10: Real Server-Sent Events (SSE) Direct JSON Streaming Endpoint
        if (req.url.startsWith('/api/gemini/a2ui-stream') && req.method === 'POST') {
          const cfg = loadCloudtopGeminiKey();
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
              : 'Plan tonight’s Mediterranean salmon dinner for 4 with scaled ingredients.';
          const scenarioHint = typeof body.scenarioHint === 'string' ? body.scenarioHint : 'meal-planner';
          const deliveryMode: DirectJsonDeliveryMode =
            body.deliveryMode === 'single-shot-direct-json'
              ? 'single-shot-direct-json'
              : 'progressive-sse';
          const chunkDelayMs =
            typeof body.chunkDelayMs === 'number' && body.chunkDelayMs >= 0 && body.chunkDelayMs <= 1000
              ? body.chunkDelayMs
              : 120;
          const preferBlueprintStream = Boolean(body.preferBlueprintStream);
          const clientEnvelopes = Array.isArray(body.clientEnvelopes)
            ? (body.clientEnvelopes as Record<string, unknown>[])
            : undefined;
          const availableProducts = Array.isArray(body.availableProducts)
            ? (body.availableProducts.slice(0, 24) as Array<Record<string, unknown>>)
            : [];

          const targetSurfaceId =
            typeof body.surfaceId === 'string' && body.surfaceId.trim()
              ? body.surfaceId.trim()
              : 'gemini_stream_surface';

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('X-Accel-Buffering', 'no');
          res.flushHeaders?.();

          const writeSse = (event: string, data: unknown) => {
            if (!res.writableEnded) {
              res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            }
          };

          const startTime = Date.now();
          let usedModel = cfg.model;
          let baseEnvelopes: Record<string, unknown>[] = [];
          let summary = 'Here is a personalized plan streamed progressively in real time:';

          try {
            if (clientEnvelopes && clientEnvelopes.length > 0) {
              const sanitized = sanitizeSurfaceEnvelopes(clientEnvelopes, targetSurfaceId, {
                preserveSingleShotCreateSurface: deliveryMode === 'single-shot-direct-json',
              });
              baseEnvelopes = sanitized.envelopes;
              if (typeof body.summary === 'string' && body.summary.trim()) {
                summary = body.summary.trim();
              }
            } else if (!preferBlueprintStream && cfg.apiKey) {
              // Emit immediate stream start notification
              writeSse('meta', {
                surfaceId: targetSurfaceId,
                deliveryMode,
                status: 'connecting_gemini_stream',
                elapsedMs: Date.now() - startTime,
              });

              const promptPayload = {
                userRequest: userPrompt,
                targetSurfaceId,
                scenarioHint,
                activeStore: body.activeStore ?? {},
                currentCartItems: Array.isArray(body.cartItems) ? body.cartItems : [],
                availableProducts,
              };

              let geminiText = '';
              const abortCtrl = new AbortController();
              const timeoutId = setTimeout(() => abortCtrl.abort(), 6500);

              try {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(cfg.apiKey)}`;
                const upstreamRes = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  signal: abortCtrl.signal,
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
                      temperature: 0.3,
                      responseMimeType: 'application/json',
                    },
                  }),
                });

                if (upstreamRes.ok && upstreamRes.body) {
                  const reader = upstreamRes.body.getReader();
                  const decoder = new TextDecoder();
                  let sseBuffer = '';

                  while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    sseBuffer += decoder.decode(value, { stream: true });
                    const lines = sseBuffer.split('\n');
                    sseBuffer = lines.pop() ?? '';

                    for (const line of lines) {
                      const trimmedLine = line.trim();
                      if (!trimmedLine.startsWith('data:')) continue;
                      const dataStr = trimmedLine.slice(5).trim();
                      if (!dataStr || dataStr === '[DONE]') continue;
                      try {
                        const chunkJson = JSON.parse(dataStr) as {
                          candidates?: Array<{
                            content?: { parts?: Array<{ text?: string }> };
                          }>;
                        };
                        const delta = chunkJson.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                        if (delta) {
                          geminiText += delta;
                          writeSse('token_progress', {
                            surfaceId: targetSurfaceId,
                            accumulatedChars: geminiText.length,
                            elapsedMs: Date.now() - startTime,
                          });
                        }
                      } catch {
                        // ignore partial JSON line
                      }
                    }
                  }
                }
              } catch {
                // Fall back cleanly to built-in structured stream on timeout/network error
              } finally {
                clearTimeout(timeoutId);
              }

              if (geminiText.trim()) {
                try {
                  const parsed = JSON.parse(geminiText);
                  const sanitized = sanitizeSurfaceEnvelopes(parsed, targetSurfaceId, {
                    preserveSingleShotCreateSurface: deliveryMode === 'single-shot-direct-json',
                  });
                  baseEnvelopes = sanitized.envelopes;
                  summary = sanitized.summary;
                } catch {
                  // fallback below
                }
              }
            }

            if (baseEnvelopes.length === 0) {
              usedModel = `${cfg.model} (Direct JSON Stream)`;
              const fallback = buildServerSideFallbackSurface(
                targetSurfaceId,
                userPrompt,
                availableProducts
              );
              baseEnvelopes = fallback.envelopes;
              summary = fallback.summary;
            }

            const stagePackets =
              deliveryMode === 'single-shot-direct-json'
                ? buildSingleShotDirectJsonEnvelope(baseEnvelopes, targetSurfaceId)
                : sliceEnvelopesIntoProgressiveStream(baseEnvelopes, targetSurfaceId);

            for (let i = 0; i < stagePackets.length; i++) {
              const pkt = stagePackets[i];
              writeSse('a2ui', {
                index: i + 1,
                total: stagePackets.length,
                stage: pkt.stage,
                label: pkt.label,
                deliveryMode,
                surfaceId: targetSurfaceId,
                elapsedMs: Date.now() - startTime,
                envelope: pkt.envelope,
              });

              if (i < stagePackets.length - 1 && chunkDelayMs > 0) {
                await sleep(chunkDelayMs);
              }
            }

            writeSse('done', {
              surfaceId: targetSurfaceId,
              deliveryMode,
              totalEnvelopes: stagePackets.length,
              model: usedModel,
              summary,
              latencyMs: Date.now() - startTime,
            });
          } catch (err) {
            writeSse('error', {
              surfaceId: targetSurfaceId,
              message: err instanceof Error ? err.message : 'Direct JSON stream failed',
            });
          } finally {
            if (!res.writableEnded) {
              res.end();
            }
          }
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
          const requestedSurfaceId =
            typeof body.surfaceId === 'string' && body.surfaceId.trim()
              ? body.surfaceId.trim()
              : undefined;
          const targetSurfaceId =
            requestedSurfaceId ||
            surfaceIdByScenario[scenarioHint] ||
            'gemini-live-surface';

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
    port: 5190,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5190,
    allowedHosts: true,
  },
});
