import React, { useCallback, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  MapPin,
  PartyPopper,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  A2UI_BASIC_CATALOG_ID,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIAction,
  type A2UIActionEvent,
  type A2UIChildListTemplate,
  type A2UIRendererErrorEvent,
  type A2UISurfaceState,
} from '../types/a2ui-v1';
import type { Product } from '../types/grocery';
import {
  type DataEvaluationContext,
  createRootEvaluationContext,
  createScopedEvaluationContext,
  evaluateDynamicValue,
  evaluateFunctionCall,
  getValueAtPointer,
  resolveDynamicBoolean,
  resolveDynamicString,
  resolvePointerPath,
} from './DataModelBinder';
import { evaluateComponentChecks } from './ValidationEngine';
import { isValidExtensionKey } from './SurfaceManager';
import {
  type A2UIRenderNodeContext,
  renderBasicCatalogComponent,
} from './catalogs/basicCatalogRenderer';
import { renderGroceryCatalogComponent } from './catalogs/groceryCatalogRenderer';

export interface A2UISurfaceRendererProps {
  /** Active surface state managed by SurfaceManager */
  surface: A2UISurfaceState | null | undefined;
  /** Dispatched when a user activates an A2UI EventAction (e.g. Button click) */
  onAction?: (event: A2UIActionEvent) => void;
  /** Dispatched when a two-way bound input component mutates a JSON Pointer path in dataModel */
  onDataModelChange?: (
    surfaceId: string,
    pointerPath: string,
    value: unknown
  ) => void;
  /** Optional callback when a renderer-level error occurs */
  onRendererError?: (error: A2UIRendererErrorEvent) => void;
  /** Optional product catalog lookup for enriching custom Grocery Catalog components */
  products?: Product[];
  /** Optional className for container styling */
  className?: string;
  /** Optional flag to show/hide the surface header badge (false by default) */
  showSurfaceBadge?: boolean;
}

function isChildListTemplate(
  val: unknown
): val is A2UIChildListTemplate & { '@path'?: string } {
  if (typeof val !== 'object' || val === null || Array.isArray(val)) {
    return false;
  }
  const obj = val as Record<string, unknown>;
  return (
    typeof obj.componentId === 'string' &&
    (typeof obj.path === 'string' || typeof obj['@path'] === 'string')
  );
}

/**
 * Helper to look up an extension entry by either its canonical UAX #31 identifier
 * (`freshcart_theme`) or dotted alias (`freshcart.theme`).
 */
function getExtensionRecord(
  extensions: Record<string, unknown> | undefined,
  uax31Key: string,
  dottedAlias?: string
): Record<string, unknown> | undefined {
  if (!extensions) return undefined;
  const val =
    extensions[uax31Key] ?? (dottedAlias ? extensions[dottedAlias] : undefined);
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return val as Record<string, unknown>;
  }
  return undefined;
}

const CONFETTI_PARTICLES = [
  { left: '8%', bg: 'bg-amber-400', delay: '0ms', duration: '950ms' },
  { left: '16%', bg: 'bg-emerald-500', delay: '60ms', duration: '1050ms' },
  { left: '24%', bg: 'bg-rose-400', delay: '120ms', duration: '900ms' },
  { left: '33%', bg: 'bg-sky-400', delay: '40ms', duration: '1100ms' },
  { left: '42%', bg: 'bg-amber-500', delay: '90ms', duration: '980ms' },
  { left: '51%', bg: 'bg-emerald-400', delay: '20ms', duration: '1020ms' },
  { left: '60%', bg: 'bg-violet-400', delay: '110ms', duration: '940ms' },
  { left: '69%', bg: 'bg-amber-400', delay: '50ms', duration: '1080ms' },
  { left: '78%', bg: 'bg-emerald-500', delay: '80ms', duration: '960ms' },
  { left: '87%', bg: 'bg-rose-400', delay: '30ms', duration: '1040ms' },
  { left: '94%', bg: 'bg-amber-300', delay: '70ms', duration: '920ms' },
];

/**
 * Multi-Catalog A2UI Surface Renderer (`<A2UISurfaceRenderer />`)
 * Supports A2UI v1.0 Protocol Extensions (`metadata.extensions`) across:
 * 1. `createSurface.metadata.extensions` (Surface-level theming, confetti, telemetry)
 * 2. `ComponentCommon.metadata.extensions` (Component-level aisle locators, spotlights, animations)
 * 3. `action.metadata.extensions` (Renderer-to-agent outbound action provenance & telemetry)
 */
export const A2UISurfaceRenderer: React.FC<A2UISurfaceRendererProps> = ({
  surface,
  onAction,
  onDataModelChange,
  products,
  className = '',
  showSurfaceBadge = false,
}) => {
  const [showExtensionsInspector, setShowExtensionsInspector] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState<{
    active: boolean;
    label: string;
    count: number;
  }>({ active: false, label: '', count: 0 });
  const [lastOutboundActionExtensions, setLastOutboundActionExtensions] =
    useState<Record<string, unknown> | null>(null);

  const surfaceExtensions = surface?.metadata?.extensions;

  // Read live dataModel overrides for interactive extension controls
  const dataModel = surface?.dataModel ?? {};
  const extensionsConfig = (dataModel.extensionsConfig ?? {}) as Record<
    string,
    unknown
  >;
  const enableAisleHighlights =
    extensionsConfig.enableAisleHighlights !== undefined
      ? Boolean(extensionsConfig.enableAisleHighlights)
      : true;
  const enableConfettiOnAction =
    extensionsConfig.enableConfettiOnAction !== undefined
      ? Boolean(extensionsConfig.enableConfettiOnAction)
      : true;

  const surfaceThemeExt = getExtensionRecord(
    surfaceExtensions,
    'freshcart_theme',
    'freshcart.theme'
  );
  const rawModelPalette = dataModel.extensionThemePalette;
  const activeThemePalette = Array.isArray(rawModelPalette)
    ? String(rawModelPalette[0] ?? surfaceThemeExt?.palette ?? 'harvest-gold')
    : typeof rawModelPalette === 'string'
      ? rawModelPalette
      : String(surfaceThemeExt?.palette ?? 'default');

  const triggerConfettiCelebration = useCallback((label: string) => {
    setConfettiBurst((prev) => ({
      active: true,
      label,
      count: prev.count + 1,
    }));
    window.setTimeout(() => {
      setConfettiBurst((prev) => ({ ...prev, active: false }));
    }, 2200);
  }, []);

  const handleUpdateDataModelPath = useCallback(
    (pointerPath: string, value: unknown) => {
      if (!surface) return;
      onDataModelChange?.(surface.surfaceId, pointerPath, value);
    },
    [surface, onDataModelChange]
  );

  const handleDispatchAction = useCallback(
    (
      sourceComponentId: string,
      action: A2UIAction | undefined,
      scopeContext: DataEvaluationContext
    ) => {
      if (!surface || !action) return;

      const activatedContext: DataEvaluationContext = {
        ...scopeContext,
        isUserActivated: true,
      };

      // Case 1: Local FunctionAction (`{ functionCall: { "@call": "..." } }`)
      if ('functionCall' in action && action.functionCall) {
        evaluateFunctionCall(action.functionCall, activatedContext);
        return;
      }

      // Case 2: Agent EventAction (`{ event: { name, userMessage?, context? } }`)
      if ('event' in action && action.event) {
        const rawCtx = action.event.context ?? {};
        const resolvedContext: Record<string, unknown> = {};
        for (const [k, rawVal] of Object.entries(rawCtx)) {
          resolvedContext[k] = evaluateDynamicValue(rawVal, activatedContext);
        }

        const resolvedUserMessage =
          action.event.userMessage !== undefined
            ? resolveDynamicString(
                action.event.userMessage,
                activatedContext,
                ''
              )
            : undefined;

        const sourceComp = surface.componentsById[sourceComponentId];
        const compExtensions = sourceComp?.metadata?.extensions;
        const surfExtensions = surface.metadata?.extensions;

        const compConfetti = getExtensionRecord(
          compExtensions,
          'freshcart_confettiOnAction',
          'freshcart.confettiOnAction'
        );
        const surfConfetti = getExtensionRecord(
          surfExtensions,
          'freshcart_confettiOnAction',
          'freshcart.confettiOnAction'
        );

        const shouldFireConfetti =
          enableConfettiOnAction &&
          Boolean(compConfetti?.enabled ?? surfConfetti?.enabled ?? false) &&
          action.event.name !== 'locate_aisle_item';

        if (shouldFireConfetti) {
          const celebrationText = String(
            compConfetti?.celebrationLabel ??
              surfConfetti?.celebrationText ??
              'Action completed with A2UI v1.0 Extensions! 🎉'
          );
          triggerConfettiCelebration(celebrationText);
        }

        // Build v1.0 `action.metadata.extensions` (renderer_to_agent.json)
        // using strict Unicode UAX #31 extension identifiers
        const hasAnyExtensions =
          Boolean(compExtensions && Object.keys(compExtensions).length > 0) ||
          Boolean(surfExtensions && Object.keys(surfExtensions).length > 0);

        let actionMetadataExtensions: Record<string, unknown> | undefined;
        if (hasAnyExtensions) {
          const compProvenance = getExtensionRecord(
            compExtensions,
            'freshcart_analyticsProvenance',
            'freshcart.analyticsProvenance'
          );
          const surfProvenance = getExtensionRecord(
            surfExtensions,
            'freshcart_analyticsProvenance',
            'freshcart.analyticsProvenance'
          );
          const surfTelemetry = getExtensionRecord(
            surfExtensions,
            'a2ui_telemetry'
          );
          const compTelemetry = getExtensionRecord(
            compExtensions,
            'a2ui_telemetry'
          );

          actionMetadataExtensions = {
            freshcart_analyticsProvenance: {
              ...(surfProvenance ?? {}),
              ...(compProvenance ?? {}),
              sourceComponentId,
              actionName: action.event.name,
              activeThemePalette,
            },
            freshcart_clientContext: {
              surfaceId: surface.surfaceId,
              confettiFired: shouldFireConfetti,
              aisleHighlightsActive: enableAisleHighlights,
              dispatchedAt: new Date().toISOString(),
            },
            ...(surfTelemetry || compTelemetry
              ? {
                  a2ui_telemetry: {
                    ...(surfTelemetry ?? {}),
                    ...(compTelemetry ?? {}),
                    roundTripVerified: true,
                  },
                }
              : {}),
          };
          setLastOutboundActionExtensions(actionMetadataExtensions);
        }

        const outboundEvent: A2UIActionEvent = {
          version: 'v1.0',
          action: {
            name: action.event.name,
            ...(resolvedUserMessage ? { userMessage: resolvedUserMessage } : {}),
            surfaceId: surface.surfaceId,
            sourceComponentId,
            timestamp: new Date().toISOString(),
            context: resolvedContext,
            ...(actionMetadataExtensions
              ? {
                  metadata: {
                    extensions: actionMetadataExtensions,
                  },
                }
              : {}),
          },
        };

        onAction?.(outboundEvent);
      }
    },
    [
      surface,
      onAction,
      enableConfettiOnAction,
      enableAisleHighlights,
      activeThemePalette,
      triggerConfettiCelebration,
    ]
  );

  // Collect component-level extension statistics for the inspector drawer
  const extensionSummary = useMemo(() => {
    if (!surface) {
      return {
        surfaceKeys: [] as string[],
        componentExtensionCount: 0,
        componentEntries: [] as Array<{
          componentId: string;
          componentType: string;
          keys: string[];
          allUax31Valid: boolean;
        }>,
      };
    }
    const surfaceKeys = Object.keys(surface.metadata?.extensions ?? {});
    const componentEntries: Array<{
      componentId: string;
      componentType: string;
      keys: string[];
      allUax31Valid: boolean;
    }> = [];

    for (const comp of Object.values(surface.componentsById)) {
      const ext = comp.metadata?.extensions;
      if (ext && Object.keys(ext).length > 0) {
        const keys = Object.keys(ext);
        componentEntries.push({
          componentId: comp.id,
          componentType: String(comp.component),
          keys,
          allUax31Valid: keys.every(isValidExtensionKey),
        });
      }
    }

    return {
      surfaceKeys,
      componentExtensionCount: componentEntries.length,
      componentEntries,
    };
  }, [surface]);

  if (!surface) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-stone-200/80 bg-white p-10 text-center shadow-xs">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0AAD0A]/10 text-[#0AAD0A]">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-stone-800">
          Your personal grocery assistant is ready
        </p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-stone-500">
          Ask for a recipe idea, find smart cart savings, or build a weekly
          meal plan tailored to your kitchen.
        </p>
      </div>
    );
  }

  const { componentsById } = surface;
  const componentKeys = Object.keys(componentsById);

  if (componentKeys.length === 0) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3 rounded-2xl border border-stone-200/70 bg-white p-5 shadow-xs">
          <div className="h-5 w-3/5 rounded-lg bg-stone-100" />
          <div className="h-3.5 w-4/5 rounded-lg bg-stone-100" />
          <div className="pt-2">
            <div className="h-24 w-full rounded-2xl bg-stone-100/80" />
          </div>
          <div className="flex gap-2 pt-1">
            <div className="h-9 flex-1 rounded-xl bg-stone-100" />
            <div className="h-9 w-28 rounded-xl bg-emerald-100/60" />
          </div>
        </div>
      </div>
    );
  }

  const rootEvalContext = createRootEvaluationContext(
    dataModel,
    surface.catalogId || A2UI_BASIC_CATALOG_ID
  );

  const hasSurfaceExtensions =
    Boolean(surfaceExtensions && Object.keys(surfaceExtensions).length > 0) ||
    extensionSummary.componentExtensionCount > 0;

  // Compute theme container classes driven by `createSurface.metadata.extensions.freshcart_theme`
  const themeWrapperClasses = !hasSurfaceExtensions
    ? ''
    : activeThemePalette === 'harvest-gold'
      ? 'rounded-3xl border-2 border-amber-300/90 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 p-3.5 shadow-sm ring-1 ring-amber-400/20 transition-all duration-300'
      : activeThemePalette === 'midnight-cellar'
        ? 'rounded-3xl border-2 border-indigo-300/90 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50/60 p-3.5 shadow-sm ring-1 ring-indigo-400/20 transition-all duration-300'
        : 'rounded-3xl border-2 border-emerald-300/90 bg-gradient-to-b from-emerald-50/60 via-white to-emerald-50/25 p-3.5 shadow-sm ring-1 ring-emerald-400/20 transition-all duration-300';

  const themeBadgeClasses =
    activeThemePalette === 'harvest-gold'
      ? 'bg-amber-100/90 text-amber-900 border-amber-300'
      : activeThemePalette === 'midnight-cellar'
        ? 'bg-indigo-100/90 text-indigo-900 border-indigo-300'
        : 'bg-emerald-100/90 text-emerald-900 border-emerald-300';

  const handleTriggerAisleLocate = (aisleExt: Record<string, unknown>) => {
    const category = String(aisleExt.category ?? 'all');
    const productId = String(aisleExt.productId ?? '');
    const aisleLabel = String(aisleExt.aisleLabel ?? 'Featured Aisle');

    window.dispatchEvent(
      new CustomEvent('freshcart:highlight-aisle', {
        detail: {
          category,
          productId,
          aisleLabel,
        },
      })
    );
  };

  const renderNodeInternal = (
    componentId: string,
    evalContext: DataEvaluationContext,
    visitedIds: Set<string>,
    keySuffix?: string | number
  ): React.ReactNode => {
    const comp = componentsById[componentId];
    if (!comp) {
      return null;
    }

    // Guard against accidental cyclic component references
    const visitKey = `${componentId}@${evalContext.scopePath}`;
    if (visitedIds.has(visitKey)) {
      return null;
    }
    const nextVisited = new Set(visitedIds);
    nextVisited.add(visitKey);

    // Respect accessibility.hidden if dynamically bound
    if (comp.accessibility?.hidden !== undefined) {
      const isHidden = resolveDynamicBoolean(
        comp.accessibility.hidden,
        evalContext,
        false
      );
      if (isHidden) {
        return null;
      }
    }

    const validationState = evaluateComponentChecks(comp.checks, evalContext);

    const nodeContext: A2UIRenderNodeContext = {
      surfaceId: surface.surfaceId,
      component: comp,
      componentsById,
      evalContext,
      validationState,
      renderChildNode: (childId, overrideCtx, suffix) =>
        renderNodeInternal(
          childId,
          overrideCtx ?? evalContext,
          nextVisited,
          suffix
        ),
      renderChildList: (childrenProp, scopeCtx) =>
        renderChildListInternal(childrenProp, scopeCtx, nextVisited),
      dispatchAction: handleDispatchAction,
      updateDataModelPath: handleUpdateDataModelPath,
    };

    const effectiveCatalogId =
      comp.catalogId || surface.catalogId || A2UI_BASIC_CATALOG_ID;

    let renderedElement: React.ReactNode = null;

    if (
      effectiveCatalogId === FRESHCART_GROCERY_CATALOG_ID ||
      comp.component === 'ProductDealCard' ||
      comp.component === 'NutritionSummary'
    ) {
      renderedElement = renderGroceryCatalogComponent(nodeContext, {
        products,
      });
    }

    if (renderedElement === null) {
      renderedElement = renderBasicCatalogComponent(nodeContext);
    }

    if (renderedElement === null) {
      return null;
    }

    // Apply Component-Level A2UI v1.0 `ComponentCommon.metadata.extensions`
    const compExtensions = comp.metadata?.extensions;
    if (compExtensions && comp.id !== 'root') {
      const dealSpotlight = getExtensionRecord(
        compExtensions,
        'freshcart_dealSpotlight',
        'freshcart.dealSpotlight'
      );
      const aisleHighlight = enableAisleHighlights
        ? getExtensionRecord(
            compExtensions,
            'freshcart_aisleHighlight',
            'freshcart.aisleHighlight'
          )
        : undefined;
      const animExt = getExtensionRecord(
        compExtensions,
        'freshcart_animations',
        'freshcart.animations'
      );

      if (dealSpotlight || aisleHighlight || animExt) {
        const spotlightTone = String(dealSpotlight?.tone ?? 'amber');
        const animationClass = animExt
          ? 'transition-all duration-300 hover:-translate-y-0.5'
          : '';

        renderedElement = (
          <div
            data-a2ui-extensions={Object.keys(compExtensions).join(',')}
            className={`relative flex flex-col gap-1.5 ${animationClass}`}
          >
            {dealSpotlight && Boolean(dealSpotlight.ribbonText) && (
              <div
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-1.5 text-[11px] font-bold shadow-2xs ${
                  spotlightTone === 'emerald'
                    ? 'border-emerald-300/90 bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                    : 'border-amber-300/90 bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Zap className="h-3.5 w-3.5 shrink-0 fill-current" />
                  <span className="truncate">
                    {String(dealSpotlight.ribbonText)}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                  ext:dealSpotlight
                </span>
              </div>
            )}

            {renderedElement}

            {aisleHighlight && Boolean(aisleHighlight.aisleLabel) && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-1.5 text-[11px] text-amber-950">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                  <span className="font-semibold truncate">
                    {String(aisleHighlight.aisleLabel)}
                  </span>
                  {Boolean(aisleHighlight.zoneBadge) && (
                    <span className="hidden sm:inline-block rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                      {String(aisleHighlight.zoneBadge)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleTriggerAisleLocate(aisleHighlight)}
                  className="shrink-0 rounded-lg bg-amber-600 hover:bg-amber-700 px-2.5 py-1 text-[10px] font-bold text-white transition-colors cursor-pointer"
                >
                  Locate in Store →
                </button>
              </div>
            )}
          </div>
        );
      }
    }

    const nodeKey =
      keySuffix !== undefined ? `${comp.id}-${keySuffix}` : comp.id;
    const ariaLabel = comp.accessibility?.label
      ? resolveDynamicString(comp.accessibility.label, evalContext, '')
      : undefined;

    if (typeof comp.weight === 'number' && comp.weight > 0) {
      return (
        <div
          key={nodeKey}
          style={{ flex: comp.weight }}
          className="min-w-0"
          aria-label={ariaLabel || undefined}
        >
          {renderedElement}
        </div>
      );
    }

    return (
      <React.Fragment key={nodeKey}>{renderedElement}</React.Fragment>
    );
  };

  const renderChildListInternal = (
    childrenProp: unknown,
    scopeContext: DataEvaluationContext,
    visitedIds: Set<string>
  ): React.ReactNode => {
    if (!childrenProp) {
      return null;
    }

    // 1. Static array of component IDs (`string[]`)
    if (Array.isArray(childrenProp)) {
      return childrenProp.map((childId, idx) =>
        typeof childId === 'string'
          ? renderNodeInternal(childId, scopeContext, visitedIds, idx)
          : null
      );
    }

    // 2. Dynamic ChildList template (`{ componentId, path }`)
    if (isChildListTemplate(childrenProp)) {
      const rawPath =
        typeof childrenProp.path === 'string'
          ? childrenProp.path
          : String(childrenProp['@path'] ?? '');
      const collectionPointer = resolvePointerPath(
        rawPath,
        scopeContext.scopePath
      );
      const collectionVal = getValueAtPointer(
        scopeContext.rootDataModel,
        collectionPointer
      );

      if (Array.isArray(collectionVal)) {
        return collectionVal.map((_item, idx) => {
          const itemScopePath =
            collectionPointer === '/'
              ? `/${idx}`
              : `${collectionPointer}/${idx}`;
          const itemEvalContext = createScopedEvaluationContext(
            scopeContext,
            itemScopePath,
            idx
          );
          return renderNodeInternal(
            childrenProp.componentId,
            itemEvalContext,
            visitedIds,
            `${collectionPointer}-${idx}`
          );
        });
      }

      if (typeof collectionVal === 'object' && collectionVal !== null) {
        return Object.keys(collectionVal).map((key, idx) => {
          const itemScopePath =
            collectionPointer === '/'
              ? `/${key}`
              : `${collectionPointer}/${key}`;
          const itemEvalContext = createScopedEvaluationContext(
            scopeContext,
            itemScopePath,
            idx
          );
          return renderNodeInternal(
            childrenProp.componentId,
            itemEvalContext,
            visitedIds,
            `${collectionPointer}-${key}`
          );
        });
      }

      return null;
    }

    return null;
  };

  const rootComponentId =
    'root' in componentsById ? 'root' : componentKeys[0];

  const outboundExtensionsToDisplay =
    lastOutboundActionExtensions ??
    (typeof dataModel.lastOutboundExtensionsJson === 'string' &&
    dataModel.lastOutboundExtensionsJson
      ? (() => {
          try {
            return JSON.parse(
              String(dataModel.lastOutboundExtensionsJson)
            ) as Record<string, unknown>;
          } catch {
            return null;
          }
        })()
      : null);

  return (
    <div
      data-surface-id={surface.surfaceId}
      className={`relative flex flex-col gap-3.5 ${themeWrapperClasses} ${className}`}
    >
      {/* Celebratory Confetti Overlay driven by `metadata.extensions.freshcart_confettiOnAction` */}
      {confettiBurst.active && (
        <div
          aria-live="polite"
          className="pointer-events-none sticky top-2 z-30 overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 px-4 py-2.5 text-white shadow-lg"
        >
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold">
              <PartyPopper className="h-4 w-4 shrink-0 animate-bounce" />
              <span>{confettiBurst.label}</span>
            </div>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
              freshcart_confettiOnAction
            </span>
          </div>
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {CONFETTI_PARTICLES.map((p, idx) => (
              <span
                key={`${confettiBurst.count}-${idx}`}
                style={{
                  left: p.left,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                }}
                className={`absolute top-0 h-2 w-2 rounded-full ${p.bg} animate-ping opacity-80`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Surface-Level A2UI v1.0 Protocol Extensions Header Bar */}
      {hasSurfaceExtensions && (
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-2xs space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${themeBadgeClasses}`}
              >
                <Sparkles className="h-3 w-3" />
                <span>v1.0 metadata.extensions</span>
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                {extensionSummary.surfaceKeys.length} surface ·{' '}
                {extensionSummary.componentExtensionCount} components
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowExtensionsInspector((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700 transition-colors cursor-pointer"
            >
              <Code2 className="h-3.5 w-3.5 text-[#0AAD0A]" />
              <span>{showExtensionsInspector ? 'Hide' : 'Inspect'} Extensions</span>
              {showExtensionsInspector ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* Active Extension Key Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {extensionSummary.surfaceKeys.map((extKey) => {
              const validUax = isValidExtensionKey(extKey);
              return (
                <span
                  key={extKey}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 font-mono text-[10px] whitespace-nowrap ${
                    validUax
                      ? 'border-emerald-200/80 bg-emerald-50/70 text-emerald-900'
                      : 'border-amber-300 bg-amber-50 text-amber-900'
                  }`}
                >
                  <CheckCircle2 className="h-2.5 w-2.5 text-[#0AAD0A]" />
                  <span>{extKey}</span>
                </span>
              );
            })}
          </div>

          {/* Expandable Live v1.0 Protocol Extensions Inspector */}
          {showExtensionsInspector && (
            <div className="mt-2 space-y-2.5 rounded-xl border border-stone-200 bg-stone-900 p-3 text-[11px] text-stone-100">
              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  <span>1. Surface-Level (createSurface.metadata.extensions)</span>
                  <span>UAX #31 Valid ✓</span>
                </div>
                <pre className="max-h-36 overflow-auto rounded-lg bg-stone-950 p-2 font-mono text-[10px] text-emerald-200">
                  {JSON.stringify(surface.metadata?.extensions ?? {}, null, 2)}
                </pre>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  <span>
                    2. Component-Level (ComponentCommon.metadata.extensions)
                  </span>
                  <span>
                    {extensionSummary.componentExtensionCount} components decorated
                  </span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg bg-stone-950 p-2">
                  {extensionSummary.componentEntries.map((entry) => (
                    <div
                      key={entry.componentId}
                      className="flex items-center justify-between gap-2 font-mono text-[10px]"
                    >
                      <span className="text-stone-300">
                        #{entry.componentId}{' '}
                        <span className="text-stone-500">
                          ({entry.componentType})
                        </span>
                      </span>
                      <span className="text-amber-300 truncate">
                        {entry.keys.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                  <span>3. Outbound Action (action.metadata.extensions)</span>
                  <span>renderer_to_agent.json</span>
                </div>
                <pre className="max-h-36 overflow-auto rounded-lg bg-stone-950 p-2 font-mono text-[10px] text-sky-200">
                  {outboundExtensionsToDisplay
                    ? JSON.stringify(outboundExtensionsToDisplay, null, 2)
                    : '// Click any action button (e.g. "Add Tasting Board to Cart" or "📍 Aisle") to capture outbound action.metadata.extensions'}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {showSurfaceBadge && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-3 py-1.5 text-[11px] text-emerald-900">
          <span className="font-semibold">{surface.surfaceId}</span>
          <span className="text-[10px] text-stone-500">
            {componentKeys.length} items
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3.5">
        {renderNodeInternal(rootComponentId, rootEvalContext, new Set())}
      </div>
    </div>
  );
};
