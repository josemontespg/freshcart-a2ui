import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIActionEvent,
  type A2UIComponentBase,
  type A2UISurfaceState,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { CartItem, Product, StoreId } from '../types/grocery';

export type DirectJsonDeliveryMode = 'progressive-sse' | 'single-shot-direct-json';

export interface GeminiStatusResponse {
  configured: boolean;
  model: string;
  keySource?: string;
  streamingEndpoint?: string;
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
  scenarioHint?: 'meal-planner' | 'cart-optimizer' | 'budget-builder';
  surfaceId?: string;
  deliveryMode?: DirectJsonDeliveryMode;
  chunkDelayMs?: number;
  preferBlueprintStream?: boolean;
  clientEnvelopes?: A2UIv1Message[];
  summary?: string;
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

export interface A2UIStreamStageEvent {
  index: number;
  total: number;
  stage: 'createSurface' | 'updateComponents' | 'updateDataModel';
  label: string;
  deliveryMode: DirectJsonDeliveryMode;
  surfaceId: string;
  elapsedMs: number;
  envelope: A2UIv1Message;
}

export interface A2UIStreamTokenProgressEvent {
  surfaceId: string;
  accumulatedChars: number;
  elapsedMs: number;
}

export interface A2UIStreamDoneEvent {
  surfaceId: string;
  deliveryMode: DirectJsonDeliveryMode;
  totalEnvelopes: number;
  model: string;
  summary: string;
  latencyMs: number;
}

export interface A2UIStreamCallbacks {
  onEnvelope: (event: A2UIStreamStageEvent) => void;
  onTokenProgress?: (progress: A2UIStreamTokenProgressEvent) => void;
  onDone?: (done: A2UIStreamDoneEvent) => void;
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

function collectClientSubtreeIds(
  startId: string,
  byId: Map<string, A2UIComponentBase>,
  visited: Set<string>
): string[] {
  if (visited.has(startId)) return [];
  const comp = byId.get(startId);
  if (!comp) return [];

  visited.add(startId);
  const result: string[] = [startId];

  const visitRef = (ref: unknown) => {
    if (typeof ref === 'string' && byId.has(ref) && !visited.has(ref)) {
      result.push(...collectClientSubtreeIds(ref, byId, visited));
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
    const chObj = comp.children as { componentId?: string };
    visitRef(chObj.componentId);
  }

  if (Array.isArray(comp.tabs)) {
    for (const tab of comp.tabs) {
      if (tab && typeof tab === 'object') {
        visitRef((tab as { child?: string }).child);
      }
    }
  }

  return result;
}

/**
 * Slices an A2UI v1.0 surface envelope list into either:
 * 1. `'single-shot-direct-json'`: A single `createSurface` envelope containing inline
 *    `components` and `dataModel` (per `specification/v1_0/json/agent_to_renderer.json`).
 * 2. `'progressive-sse'`: A multi-stage stream starting with a lightweight `createSurface`
 *    shell, followed by top-down `updateComponents` subtree batches (`root.children` growing
 *    section by section with zero dangling references) and granular JSON Pointer `updateDataModel`
 *    patches (`/nutrition`, `/ingredients/0`, `/ingredients/1`, ..., `/estimatedTotal`).
 */
export function sliceClientEnvelopesForStreaming(
  envelopes: A2UIv1Message[],
  targetSurfaceId: string,
  deliveryMode: DirectJsonDeliveryMode = 'progressive-sse'
): Array<{
  stage: 'createSurface' | 'updateComponents' | 'updateDataModel';
  label: string;
  envelope: A2UIv1Message;
}> {
  const allComponents: A2UIComponentBase[] = [];
  let fullDataModel: Record<string, unknown> = {};
  let catalogId: string = FRESHCART_GROCERY_CATALOG_ID;

  for (const env of envelopes) {
    if ('createSurface' in env && env.createSurface) {
      if (env.createSurface.catalogId) {
        catalogId = env.createSurface.catalogId;
      }
      if (Array.isArray(env.createSurface.components)) {
        allComponents.push(...sanitizeComponentIds(env.createSurface.components));
      }
      if (env.createSurface.dataModel && typeof env.createSurface.dataModel === 'object') {
        fullDataModel = { ...fullDataModel, ...env.createSurface.dataModel };
      }
    }
    if ('updateComponents' in env && env.updateComponents) {
      if (Array.isArray(env.updateComponents.components)) {
        allComponents.push(...sanitizeComponentIds(env.updateComponents.components));
      }
    }
    if ('updateDataModel' in env && env.updateDataModel) {
      const val = env.updateDataModel.value;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        fullDataModel = { ...fullDataModel, ...(val as Record<string, unknown>) };
      }
    }
  }

  // Deduplicate components by ID (latest wins)
  const byId = new Map<string, A2UIComponentBase>();
  for (const comp of allComponents) {
    byId.set(comp.id, comp);
  }
  const uniqueComponents = Array.from(byId.values());

  if (deliveryMode === 'single-shot-direct-json') {
    return [
      {
        stage: 'createSurface',
        label: 'Single-Shot createSurface (inline components + dataModel)',
        envelope: {
          version: A2UI_VERSION,
          createSurface: {
            surfaceId: targetSurfaceId,
            catalogId,
            sendDataModel: true,
            components: uniqueComponents,
            dataModel: fullDataModel,
          },
        },
      },
    ];
  }

  const packets: Array<{
    stage: 'createSurface' | 'updateComponents' | 'updateDataModel';
    label: string;
    envelope: A2UIv1Message;
  }> = [];

  // Stage 1: Lightweight createSurface shell
  packets.push({
    stage: 'createSurface',
    label: 'Initialize surface shell (createSurface)',
    envelope: {
      version: A2UI_VERSION,
      createSurface: {
        surfaceId: targetSurfaceId,
        catalogId,
        sendDataModel: true,
      },
    },
  });

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
        version: A2UI_VERSION,
        updateDataModel: {
          surfaceId: targetSurfaceId,
          path: '/',
          value: scalarSeed,
        },
      },
    });
  }

  const rootComp = byId.get('root') ?? uniqueComponents[0];
  const rootChildren =
    rootComp && Array.isArray(rootComp.children)
      ? rootComp.children.filter((c): c is string => typeof c === 'string')
      : [];

  if (rootComp && rootChildren.length > 1) {
    const visited = new Set<string>(['root']);
    let objectsEmitted = false;

    rootChildren.forEach((sectionId, idx) => {
      const subtreeIds = collectClientSubtreeIds(sectionId, byId, visited);
      const subtreeComps = subtreeIds
        .map((id) => byId.get(id))
        .filter((c): c is A2UIComponentBase => Boolean(c));

      if (idx === rootChildren.length - 1) {
        for (const [cid, comp] of byId.entries()) {
          if (!visited.has(cid)) {
            visited.add(cid);
            subtreeComps.push(comp);
          }
        }
      }

      const progressiveRoot: A2UIComponentBase = {
        ...rootComp,
        children: rootChildren.slice(0, idx + 1),
      };

      packets.push({
        stage: 'updateComponents',
        label: `Stream UI section ${idx + 1}/${rootChildren.length}: ${sectionId}`,
        envelope: {
          version: A2UI_VERSION,
          updateComponents: {
            surfaceId: targetSurfaceId,
            components: [progressiveRoot, ...subtreeComps],
          },
        },
      });

      if (!objectsEmitted && idx >= 1 && objectEntries.length > 0) {
        objectsEmitted = true;
        for (const [objKey, objVal] of objectEntries) {
          packets.push({
            stage: 'updateDataModel',
            label: `Populate /${objKey} data binding`,
            envelope: {
              version: A2UI_VERSION,
              updateDataModel: {
                surfaceId: targetSurfaceId,
                path: `/${objKey}`,
                value: objVal,
              },
            },
          });
        }
      }
    });

    if (!objectsEmitted && objectEntries.length > 0) {
      for (const [objKey, objVal] of objectEntries) {
        packets.push({
          stage: 'updateDataModel',
          label: `Populate /${objKey} data binding`,
          envelope: {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId: targetSurfaceId,
              path: `/${objKey}`,
              value: objVal,
            },
          },
        });
      }
    }
  } else if (uniqueComponents.length > 0) {
    packets.push({
      stage: 'updateComponents',
      label: `Mount ${uniqueComponents.length} components (updateComponents)`,
      envelope: {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: targetSurfaceId,
          components: uniqueComponents,
        },
      },
    });
    for (const [objKey, objVal] of objectEntries) {
      packets.push({
        stage: 'updateDataModel',
        label: `Populate /${objKey} data binding`,
        envelope: {
          version: A2UI_VERSION,
          updateDataModel: {
            surfaceId: targetSurfaceId,
            path: `/${objKey}`,
            value: objVal,
          },
        },
      });
    }
  }

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
          version: A2UI_VERSION,
          updateDataModel: {
            surfaceId: targetSurfaceId,
            path: `/${arrKey}/${idx}`,
            value: item,
          },
        },
      });
    });
  }

  for (const [defKey, defVal] of deferredEntries) {
    packets.push({
      stage: 'updateDataModel',
      label: `Finalize /${defKey}`,
      envelope: {
        version: A2UI_VERSION,
        updateDataModel: {
          surfaceId: targetSurfaceId,
          path: `/${defKey}`,
          value: defVal,
        },
      },
    });
  }

  return packets;
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
      streamingEndpoint: data.streamingEndpoint,
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

/**
 * Consumes the Server-Sent Events (SSE) Direct JSON streaming endpoint (`/api/gemini/a2ui-stream`)
 * via `fetch` + `ReadableStream`, invoking `callbacks.onEnvelope` in real time as each
 * `createSurface`, `updateComponents`, or `updateDataModel` envelope arrives over the wire.
 */
export async function streamA2UISurfaceWithGemini(
  request: GeminiA2UIRequest,
  callbacks: A2UIStreamCallbacks
): Promise<A2UIStreamDoneEvent> {
  const startedAt = performance.now();
  const targetSurfaceId =
    request.surfaceId ??
    (request.scenarioHint === 'cart-optimizer'
      ? 'cart-optimizer-surface'
      : request.scenarioHint === 'budget-builder'
        ? 'budget-nutrition-surface'
        : 'meal-planner-surface');
  const deliveryMode: DirectJsonDeliveryMode = request.deliveryMode ?? 'progressive-sse';

  const res = await fetch('/api/gemini/a2ui-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      ...request,
      surfaceId: targetSurfaceId,
      deliveryMode,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`SSE streaming endpoint returned HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = 'message';
  let receivedEnvelopes = 0;
  let donePayload: A2UIStreamDoneEvent | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        currentEvent = 'message';
        continue;
      }
      if (line.startsWith('event:')) {
        currentEvent = line.slice(6).trim();
        continue;
      }
      if (line.startsWith('data:')) {
        const jsonStr = line.slice(5).trim();
        if (!jsonStr) continue;
        try {
          const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
          if (currentEvent === 'a2ui' && parsed.envelope) {
            receivedEnvelopes += 1;
            const stageEvent: A2UIStreamStageEvent = {
              index: typeof parsed.index === 'number' ? parsed.index : receivedEnvelopes,
              total: typeof parsed.total === 'number' ? parsed.total : receivedEnvelopes,
              stage:
                parsed.stage === 'createSurface' ||
                parsed.stage === 'updateComponents' ||
                parsed.stage === 'updateDataModel'
                  ? parsed.stage
                  : 'updateComponents',
              label: typeof parsed.label === 'string' ? parsed.label : `Stream envelope #${receivedEnvelopes}`,
              deliveryMode:
                parsed.deliveryMode === 'single-shot-direct-json'
                  ? 'single-shot-direct-json'
                  : 'progressive-sse',
              surfaceId: typeof parsed.surfaceId === 'string' ? parsed.surfaceId : targetSurfaceId,
              elapsedMs:
                typeof parsed.elapsedMs === 'number'
                  ? parsed.elapsedMs
                  : Math.round(performance.now() - startedAt),
              envelope: parsed.envelope as A2UIv1Message,
            };
            callbacks.onEnvelope(stageEvent);
          } else if (currentEvent === 'token_progress') {
            callbacks.onTokenProgress?.({
              surfaceId: typeof parsed.surfaceId === 'string' ? parsed.surfaceId : targetSurfaceId,
              accumulatedChars: typeof parsed.accumulatedChars === 'number' ? parsed.accumulatedChars : 0,
              elapsedMs:
                typeof parsed.elapsedMs === 'number'
                  ? parsed.elapsedMs
                  : Math.round(performance.now() - startedAt),
            });
          } else if (currentEvent === 'done') {
            donePayload = {
              surfaceId: typeof parsed.surfaceId === 'string' ? parsed.surfaceId : targetSurfaceId,
              deliveryMode:
                parsed.deliveryMode === 'single-shot-direct-json'
                  ? 'single-shot-direct-json'
                  : deliveryMode,
              totalEnvelopes:
                typeof parsed.totalEnvelopes === 'number' ? parsed.totalEnvelopes : receivedEnvelopes,
              model: typeof parsed.model === 'string' ? parsed.model : 'gemini-2.5-flash',
              summary:
                typeof parsed.summary === 'string'
                  ? parsed.summary
                  : 'Streamed A2UI v1.0 surface in real time.',
              latencyMs:
                typeof parsed.latencyMs === 'number'
                  ? parsed.latencyMs
                  : Math.round(performance.now() - startedAt),
            };
            callbacks.onDone?.(donePayload);
          } else if (currentEvent === 'error') {
            throw new Error(
              typeof parsed.message === 'string' ? parsed.message : 'SSE stream error'
            );
          }
        } catch (err) {
          if (currentEvent === 'error') throw err;
        }
      }
    }
  }

  if (receivedEnvelopes === 0) {
    throw new Error('SSE stream completed with 0 A2UI envelopes');
  }

  return (
    donePayload ?? {
      surfaceId: targetSurfaceId,
      deliveryMode,
      totalEnvelopes: receivedEnvelopes,
      model: 'gemini-2.5-flash',
      summary: 'Streamed A2UI v1.0 surface in real time.',
      latencyMs: Math.round(performance.now() - startedAt),
    }
  );
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
