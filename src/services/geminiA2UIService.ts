import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIActionEvent,
  type A2UIAgentFunctionResponseMessage,
  type A2UICallAgentFunctionMessage,
  type A2UICallRendererFunctionMessage,
  type A2UIComponentBase,
  type A2UIRendererFunctionResponseMessage,
  type A2UISurfaceState,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { CartItem, Product, StoreId } from '../types/grocery';

export interface GeminiStatusResponse {
  configured: boolean;
  model: string;
  keySource?: string;
  error?: string;
}

export interface CompactProductContext {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  dietaryTags: string[];
  stockStatus: string;
  imageUrl: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  organicUpgradeProductId?: string;
  budgetAlternativeProductId?: string;
  suggestedBackupProductId?: string;
}

export interface CompactCartItemContext {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  stockStatus: string;
  organicUpgradeProductId?: string;
  budgetAlternativeProductId?: string;
  suggestedBackupProductId?: string;
}

export interface GeminiA2UIRequest {
  prompt: string;
  scenarioHint?:
    | 'meal-planner'
    | 'cart-optimizer'
    | 'budget-builder'
    | 'smart-functions';
  surfaceId?: string;
  activeStore?: {
    id: StoreId;
    name: string;
  };
  cartItems?: CompactCartItemContext[];
  availableProducts?: CompactProductContext[];
  currentSurfaceState?: A2UISurfaceState | null;
  actionEvent?: A2UIActionEvent;
}

export interface GeminiA2UIResponse {
  envelopes: A2UIv1Message[];
  model: string;
  latencyMs: number;
  rawText?: string;
  summary?: string;
  componentCount: number;
  surfaceId: string;
}

export function buildCompactCatalogContext(
  products: Product[],
  activeStoreId?: StoreId
): CompactProductContext[] {
  const storeFiltered = activeStoreId
    ? products.filter((p) => p.storeId === activeStoreId)
    : products;
  const sourceList = storeFiltered.length > 0 ? storeFiltered : products;

  return sourceList.slice(0, 32).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice,
    unit: p.unit,
    dietaryTags: p.dietaryTags,
    stockStatus: p.stockStatus,
    imageUrl: p.imageUrl,
    calories: p.nutrition.calories,
    proteinGrams: p.nutrition.proteinGrams,
    carbsGrams: p.nutrition.carbsGrams,
    fatGrams: p.nutrition.fatGrams,
    fiberGrams: p.nutrition.fiberGrams,
    organicUpgradeProductId: p.organicUpgradeProductId,
    budgetAlternativeProductId: p.budgetAlternativeProductId,
    suggestedBackupProductId: p.suggestedBackupProductId,
  }));
}

export function buildCompactCartContext(
  cartItems: CartItem[]
): CompactCartItemContext[] {
  return cartItems.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    unit: item.product.unit,
    stockStatus: item.product.stockStatus,
    organicUpgradeProductId: item.product.organicUpgradeProductId,
    budgetAlternativeProductId: item.product.budgetAlternativeProductId,
    suggestedBackupProductId: item.product.suggestedBackupProductId,
  }));
}

function sanitizeUax31Id(id: unknown): string {
  if (typeof id !== 'string' || !id.trim()) return 'node_item';
  const cleaned = id.trim().replace(/[^a-zA-Z0-9_]/g, '_');
  return /^[0-9]/.test(cleaned) ? `c_${cleaned}` : cleaned;
}

function sanitizeComponentIds(components: A2UIComponentBase[]): A2UIComponentBase[] {
  return components.map((comp) => {
    const next: A2UIComponentBase = {
      ...comp,
      id: sanitizeUax31Id(comp.id),
    };

    if (typeof next.child === 'string') {
      next.child = sanitizeUax31Id(next.child);
    }
    if (typeof next.trigger === 'string') {
      next.trigger = sanitizeUax31Id(next.trigger);
    }
    if (typeof next.content === 'string') {
      next.content = sanitizeUax31Id(next.content);
    }
    if (Array.isArray(next.children)) {
      next.children = next.children.map((c) => sanitizeUax31Id(c));
    } else if (
      typeof next.children === 'object' &&
      next.children !== null &&
      'componentId' in next.children
    ) {
      const tpl = next.children as { componentId: string; path: string };
      next.children = {
        ...tpl,
        componentId: sanitizeUax31Id(tpl.componentId),
      };
    }
    if (Array.isArray(next.tabs)) {
      next.tabs = (
        next.tabs as Array<{ title: unknown; child: string }>
      ).map((t) => ({
        ...t,
        child: sanitizeUax31Id(t.child),
      }));
    }

    return next;
  });
}

/**
 * Normalizes raw Gemini JSON output into a valid, multi-step A2UI v1.0 envelope array
 * (`createSurface`, `updateComponents`, `updateDataModel`) targeting `targetSurfaceId`.
 */
export function normalizeGeminiEnvelopes(
  rawEnvelopes: unknown,
  targetSurfaceId: string
): { envelopes: A2UIv1Message[]; componentCount: number; surfaceId: string } {
  const list: Record<string, unknown>[] = Array.isArray(rawEnvelopes)
    ? (rawEnvelopes as Record<string, unknown>[])
    : typeof rawEnvelopes === 'object' && rawEnvelopes !== null
      ? Array.isArray((rawEnvelopes as Record<string, unknown>).envelopes)
        ? ((rawEnvelopes as Record<string, unknown>).envelopes as Record<
            string,
            unknown
          >[])
        : Array.isArray((rawEnvelopes as Record<string, unknown>).messages)
          ? ((rawEnvelopes as Record<string, unknown>).messages as Record<
              string,
              unknown
            >[])
          : [rawEnvelopes as Record<string, unknown>]
      : [];

  let resolvedSurfaceId = targetSurfaceId;
  let componentCount = 0;
  const normalized: A2UIv1Message[] = [];

  for (const item of list) {
    if (!item || typeof item !== 'object') continue;

    if ('createSurface' in item && typeof item.createSurface === 'object' && item.createSurface !== null) {
      const cs = item.createSurface as Record<string, unknown>;
      const sid = typeof cs.surfaceId === 'string' && cs.surfaceId ? cs.surfaceId : targetSurfaceId;
      resolvedSurfaceId = sid;
      const rawComps = Array.isArray(cs.components)
        ? sanitizeComponentIds(cs.components as A2UIComponentBase[])
        : undefined;
      if (rawComps) componentCount += rawComps.length;
      const rawDataModel =
        typeof cs.dataModel === 'object' && cs.dataModel !== null && !Array.isArray(cs.dataModel)
          ? (cs.dataModel as Record<string, unknown>)
          : undefined;

      if (list.length === 1 && rawComps && rawComps.length > 1) {
        const rootComp = rawComps.find((c) => c.id === 'root') ?? rawComps[0];
        normalized.push({
          version: A2UI_VERSION,
          createSurface: {
            surfaceId: sid,
            catalogId:
              typeof cs.catalogId === 'string' && cs.catalogId
                ? cs.catalogId
                : A2UI_BASIC_CATALOG_ID,
            sendDataModel: true,
            components: [rootComp],
            dataModel: rawDataModel ?? {},
          },
        });
        normalized.push({
          version: A2UI_VERSION,
          updateComponents: {
            surfaceId: sid,
            components: rawComps,
          },
        });
        if (rawDataModel) {
          normalized.push({
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId: sid,
              path: '/',
              value: rawDataModel,
            },
          });
        }
      } else {
        normalized.push({
          version: A2UI_VERSION,
          createSurface: {
            surfaceId: sid,
            catalogId:
              typeof cs.catalogId === 'string' && cs.catalogId
                ? cs.catalogId
                : A2UI_BASIC_CATALOG_ID,
            sendDataModel: cs.sendDataModel !== false,
            ...(rawComps ? { components: rawComps } : {}),
            ...(rawDataModel ? { dataModel: rawDataModel } : {}),
          },
        });
      }
      continue;
    }

    if ('updateComponents' in item && typeof item.updateComponents === 'object' && item.updateComponents !== null) {
      const uc = item.updateComponents as Record<string, unknown>;
      const sid = typeof uc.surfaceId === 'string' && uc.surfaceId ? uc.surfaceId : resolvedSurfaceId;
      const rawComps = Array.isArray(uc.components)
        ? sanitizeComponentIds(uc.components as A2UIComponentBase[])
        : [];
      componentCount += rawComps.length;
      normalized.push({
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: sid,
          components: rawComps,
        },
      });
      continue;
    }

    if ('updateDataModel' in item && typeof item.updateDataModel === 'object' && item.updateDataModel !== null) {
      const udm = item.updateDataModel as Record<string, unknown>;
      const sid = typeof udm.surfaceId === 'string' && udm.surfaceId ? udm.surfaceId : resolvedSurfaceId;
      normalized.push({
        version: A2UI_VERSION,
        updateDataModel: {
          surfaceId: sid,
          path: typeof udm.path === 'string' ? udm.path : '/',
          value: 'value' in udm ? udm.value : {},
        },
      });
      continue;
    }

    if ('deleteSurface' in item && typeof item.deleteSurface === 'object' && item.deleteSurface !== null) {
      const ds = item.deleteSurface as Record<string, unknown>;
      const sid = typeof ds.surfaceId === 'string' && ds.surfaceId ? ds.surfaceId : resolvedSurfaceId;
      normalized.push({
        version: A2UI_VERSION,
        deleteSurface: { surfaceId: sid },
      });
    }
  }

  return {
    envelopes: normalized,
    componentCount,
    surfaceId: resolvedSurfaceId,
  };
}

export async function fetchGeminiStatus(): Promise<GeminiStatusResponse> {
  try {
    const res = await fetch('/api/gemini/status', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return {
        configured: false,
        model: 'gemini-2.5-flash',
        error: `HTTP ${res.status}`,
      };
    }
    const data = (await res.json()) as Partial<GeminiStatusResponse>;
    return {
      configured: Boolean(data.configured),
      model: data.model ?? 'gemini-2.5-flash',
      keySource: data.keySource,
      error: data.error,
    };
  } catch (err) {
    return {
      configured: false,
      model: 'gemini-2.5-flash',
      error: err instanceof Error ? err.message : 'Status check failed',
    };
  }
}

export async function generateA2UISurfaceWithGemini(
  request: GeminiA2UIRequest
): Promise<GeminiA2UIResponse> {
  const startedAt = performance.now();
  const res = await fetch('/api/gemini/a2ui', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const payload = (await res.json()) as Record<string, unknown>;
  if (!res.ok || payload.error) {
    throw new Error(
      typeof payload.error === 'string'
        ? payload.error
        : `Gemini API request failed with HTTP ${res.status}`
    );
  }

  const targetSurfaceId =
    request.surfaceId ??
    (request.scenarioHint === 'cart-optimizer'
      ? 'cart-optimizer-surface'
      : request.scenarioHint === 'budget-builder'
        ? 'budget-nutrition-surface'
        : request.scenarioHint === 'smart-functions'
          ? 'smart-functions-surface'
          : 'meal-planner-surface');

  const { envelopes, componentCount, surfaceId } = normalizeGeminiEnvelopes(
    payload.envelopes ?? payload.messages ?? payload,
    targetSurfaceId
  );

  if (envelopes.length === 0) {
    throw new Error('Gemini returned 0 valid A2UI v1.0 envelopes.');
  }

  const latencyMs =
    typeof payload.latencyMs === 'number'
      ? payload.latencyMs
      : Math.round(performance.now() - startedAt);

  return {
    envelopes,
    model: typeof payload.model === 'string' ? payload.model : 'gemini-2.5-flash',
    latencyMs,
    rawText: typeof payload.rawText === 'string' ? payload.rawText : undefined,
    summary: typeof payload.summary === 'string' ? payload.summary : undefined,
    componentCount,
    surfaceId,
  };
}

/**
 * Dispatches an outbound A2UI v1.0 `callAgentFunction` message to `/api/a2ui/rpc`
 * and returns the inbound `agentFunctionResponse` envelope (`agent_to_renderer.json`).
 */
export async function executeServerFunctionRpc(
  rpcMessage: A2UICallAgentFunctionMessage
): Promise<A2UIAgentFunctionResponseMessage> {
  try {
    const res = await fetch('/api/a2ui/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcMessage),
    });
    if (res.ok) {
      const data = (await res.json()) as A2UIAgentFunctionResponseMessage;
      if (data && data.version === 'v1.0' && 'agentFunctionResponse' in data) {
        return data;
      }
    }
  } catch {
    // Fall back to deterministic local server simulator if endpoint is unreachable
  }

  const { functionCallId, callFunction } = rpcMessage.callAgentFunction;
  const fnName = callFunction['@call'];
  const args = (callFunction.args ?? {}) as Record<string, unknown>;

  if (fnName === 'optimizeLiveStoreCoupons') {
    const servings = Math.max(1, Number(args.servings ?? 4));
    const promoCode = String(args.promoCode ?? 'KETO20')
      .trim()
      .toUpperCase();
    const loyaltyMember = Boolean(args.loyaltyMember ?? true);
    const digitalCouponSavings = Number((4.5 + servings * 0.75).toFixed(2));
    const breakdownText = `**Verified 3 Stackable Store Coupons (Save $${digitalCouponSavings.toFixed(2)} extra):**\n- **$3.00 Off** Wild Alaskan Sockeye Salmon (Seafood Digital Clip)\n- **$${(servings * 0.75).toFixed(2)} Multi-Buy Bonus** (${servings} servings scale)\n- **In-Stock Guarantee:** All 4 items verified in Cold Storage & Produce (${
      loyaltyMember ? 'FreshCart+ Priority' : 'Standard'
    } · Code ${promoCode || 'NONE'})`;

    return {
      version: 'v1.0',
      agentFunctionResponse: {
        functionCallId,
        value: {
          fnName,
          serverCouponDiscount: digitalCouponSavings,
          appliedCoupons: [
            'SEAFOOD3 ($3.00 Off Wild Sockeye)',
            `MULTIBUY ($${(servings * 0.75).toFixed(2)} Bundle Bonus)`,
          ],
          stockStatus: 'All 4 bundle items verified in stock',
          dataModelPatch: {
            serverCouponDiscount: digitalCouponSavings,
            serverCouponBreakdown: breakdownText,
            statusBanner: `Live Store Coupons Applied: Extra $${digitalCouponSavings.toFixed(2)} manufacturer savings stacked ✓`,
          },
        },
      },
    };
  }

  if (fnName === 'analyzeMealMicronutrients') {
    const servings = Math.max(1, Number(args.servings ?? 4));
    const netCarbs = Number(args.netCarbs ?? 11);
    const rawGoal = args.dietaryGoal;
    const goal = Array.isArray(rawGoal)
      ? String(rawGoal[0] ?? 'keto')
      : String(rawGoal ?? 'keto');
    const omega3Mg = 1840 + servings * 60;
    const glycemicLoad = Math.max(2, Math.round(netCarbs * 0.35));
    const summaryText = `**Server Dietitian Report (${servings} servings · ${goal.toUpperCase()}):** ${omega3Mg}mg Omega-3 (EPA+DHA) · Ultra-Low Glycemic Load (**GL ${glycemicLoad}**) · **112% Daily Vitamin D** · **94% Daily Folate & Potassium** ✓`;

    return {
      version: 'v1.0',
      agentFunctionResponse: {
        functionCallId,
        value: {
          fnName,
          omega3Mg,
          glycemicLoad,
          vitaminDPercent: 112,
          folatePercent: 94,
          dataModelPatch: {
            serverAuditSummary: summaryText,
            statusBanner: `Dietitian Micronutrient Audit Complete: GL ${glycemicLoad}, ${omega3Mg}mg Omega-3 ✓`,
          },
        },
      },
    };
  }

  return {
    version: 'v1.0',
    agentFunctionResponse: {
      functionCallId,
      error: {
        code: 'UNKNOWN_SERVER_FUNCTION',
        message: `Server function '${fnName}' is not registered.`,
      },
    },
  };
}

let agentRendererCallSeq = 1;

/**
 * Builds an inbound A2UI v1.0 `callRendererFunction` envelope sent from the Agent/Server
 * to inspect client state (`getClientKitchenAndCartMetrics`) or to test the `rendererOnly`
 * security boundary (`applyLocalNutritionPreset`).
 */
export function buildAgentToRendererInspectionCall(
  surfaceId: string,
  mode: 'sync_cart' | 'test_security_guard',
  dietaryGoal?: unknown
): A2UICallRendererFunctionMessage {
  const seq = agentRendererCallSeq++;
  if (mode === 'test_security_guard') {
    return {
      version: 'v1.0',
      callRendererFunction: {
        surfaceId,
        functionCallId: `rpc_renderer_sec_${seq}`,
        callFunction: {
          '@call': 'applyLocalNutritionPreset',
          catalogId: FRESHCART_GROCERY_CATALOG_ID,
          args: {
            preset: 'keto',
            servings: 2,
          },
        },
      },
    };
  }

  return {
    version: 'v1.0',
    callRendererFunction: {
      surfaceId,
      functionCallId: `rpc_renderer_sync_${seq}`,
      callFunction: {
        '@call': 'getClientKitchenAndCartMetrics',
        catalogId: FRESHCART_GROCERY_CATALOG_ID,
        args: {
          includeCartItems: true,
          ...(dietaryGoal !== undefined
            ? { dietaryGoal: dietaryGoal as string | string[] }
            : {}),
        },
      },
    },
  };
}

/**
 * Generates an Agent `updateDataModel` follow-up envelope after receiving a
 * `rendererFunctionResponse` from the client.
 */
export function buildFollowupDataModelFromRendererResponse(
  surfaceId: string,
  responseMsg: A2UIRendererFunctionResponseMessage,
  currentDataModel: Record<string, unknown>
): A2UIv1Message | null {
  const payload = responseMsg.rendererFunctionResponse;
  if (payload.error) {
    return {
      version: 'v1.0',
      updateDataModel: {
        surfaceId,
        path: '/',
        value: {
          ...currentDataModel,
          securityBoundaryStatus: `Verified: Client rejected remote agent call with error code '${payload.error.code}' ("${payload.error.message}") ✓`,
          statusBanner: `Permission Check Passed: Blocked remote agent call (${payload.error.code}) ✓`,
        },
      },
    };
  }

  const val = (payload.value ?? {}) as Record<string, unknown>;
  const cartCount = Number(val.cartItemCount ?? 0);
  const cartSub = Number(val.cartSubtotal ?? 0);
  const storeName = String(val.activeStoreName ?? 'FreshCart');
  const eta = Number(val.deliveryEtaMinutes ?? 35);
  const goal = String(val.activeDietaryGoal ?? 'keto').toUpperCase();
  const sampleItems = Array.isArray(val.cartSampleItems)
    ? (val.cartSampleItems as string[])
    : [];

  const syncText = `**Synced with ${storeName} (${eta} min delivery):**\n- **Live Cart:** ${cartCount} items ($${cartSub.toFixed(2)} subtotal)${
    sampleItems.length > 0 ? ` — *${sampleItems.slice(0, 2).join(', ')}*` : ''
  }\n- **Active Kitchen Goal:** ${goal} · Tailored $6.00 extra bundle credit unlocked ✓`;

  return {
    version: 'v1.0',
    updateDataModel: {
      surfaceId,
      path: '/',
      value: {
        ...currentDataModel,
        serverCouponDiscount: 6.0,
        clientSyncSummary: syncText,
        statusBanner: `Synced live cart (${cartCount} items at ${storeName}) & unlocked $6.00 bundle credit ✓`,
      },
    },
  };
}
