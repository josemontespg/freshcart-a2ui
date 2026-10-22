import React, { useCallback } from 'react';
import { Layers, Sparkles } from 'lucide-react';
import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_CATALOG_REGISTRY,
  FRESHCART_CULINARY_CATALOG_ID,
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
import {
  type A2UIRenderNodeContext,
  renderBasicCatalogComponent,
} from './catalogs/basicCatalogRenderer';
import { renderGroceryCatalogComponent } from './catalogs/groceryCatalogRenderer';
import { renderCulinaryCatalogComponent } from './catalogs/culinaryCatalogRenderer';

function collectNestedFunctionCatalogs(
  node: unknown,
  defaultCatalogId: string,
  out: Map<string, Set<string>>
): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) {
      collectNestedFunctionCatalogs(item, defaultCatalogId, out);
    }
    return;
  }
  const rec = node as Record<string, unknown>;
  if (typeof rec['@call'] === 'string') {
    const fnName = rec['@call'];
    if (!fnName.startsWith('@')) {
      const catId =
        typeof rec.catalogId === 'string' && rec.catalogId
          ? rec.catalogId
          : defaultCatalogId;
      const set = out.get(catId) ?? new Set<string>();
      set.add(`${fnName}()`);
      out.set(catId, set);
    }
  }
  for (const val of Object.values(rec)) {
    collectNestedFunctionCatalogs(val, defaultCatalogId, out);
  }
}

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
 * Multi-Catalog A2UI Surface Renderer (`<A2UISurfaceRenderer />`)
 */
export const A2UISurfaceRenderer: React.FC<A2UISurfaceRendererProps> = ({
  surface,
  onAction,
  onDataModelChange,
  products,
  className = '',
  showSurfaceBadge = false,
}) => {
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

        const outboundEvent: A2UIActionEvent = {
          version: 'v1.0',
          action: {
            name: action.event.name,
            ...(resolvedUserMessage ? { userMessage: resolvedUserMessage } : {}),
            surfaceId: surface.surfaceId,
            sourceComponentId,
            timestamp: new Date().toISOString(),
            context: resolvedContext,
          },
        };

        onAction?.(outboundEvent);
      }
    },
    [surface, onAction]
  );

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

  const { componentsById, dataModel } = surface;
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
      effectiveCatalogId === FRESHCART_CULINARY_CATALOG_ID ||
      comp.component === 'RecipeStepTimeline' ||
      comp.component === 'WineAndCheesePairingCard'
    ) {
      renderedElement = renderCulinaryCatalogComponent(nodeContext);
    }

    if (
      renderedElement === null &&
      (effectiveCatalogId === FRESHCART_GROCERY_CATALOG_ID ||
        comp.component === 'ProductDealCard' ||
        comp.component === 'AisleMapLocator' ||
        comp.component === 'FlashCouponBanner' ||
        comp.component === 'NutritionSummary')
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

  // Compute active catalog breakdown across components and @call functions
  const defaultCatalogId = surface.catalogId || A2UI_BASIC_CATALOG_ID;
  const compCounts = new Map<string, number>();
  const fnMap = new Map<string, Set<string>>();
  for (const comp of Object.values(componentsById)) {
    const catId = comp.catalogId || defaultCatalogId;
    compCounts.set(catId, (compCounts.get(catId) ?? 0) + 1);
    collectNestedFunctionCatalogs(comp, defaultCatalogId, fnMap);
  }
  const allCatalogIds = Array.from(
    new Set([...compCounts.keys(), ...fnMap.keys()])
  );
  const catalogStats = allCatalogIds.map((catId) => ({
    catalogId: catId,
    descriptor: A2UI_CATALOG_REGISTRY[catId],
    isDefault: catId === defaultCatalogId,
    componentCount: compCounts.get(catId) ?? 0,
    functions: Array.from(fnMap.get(catId) ?? []),
  }));

  const isMultiCatalogSurface = catalogStats.length >= 2;

  return (
    <div
      data-surface-id={surface.surfaceId}
      className={`flex flex-col gap-3.5 ${className}`}
    >
      {(showSurfaceBadge || isMultiCatalogSurface) && (
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/80 via-white to-violet-50/70 px-3.5 py-2.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <Layers className="h-3.5 w-3.5 text-[#0AAD0A]" />
              <span>
                A2UI v1.0 Multi-Catalog Surface ({catalogStats.length} Catalogs
                Active)
              </span>
            </div>
            <span className="font-mono text-[10px] font-semibold text-stone-500">
              {componentKeys.length} nodes
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {catalogStats.map((stat) => {
              const label =
                stat.descriptor?.badgeLabel ??
                stat.catalogId.replace(/^https?:\/\//, '');
              const pillColor =
                stat.descriptor?.domain === 'culinary'
                  ? 'bg-violet-100/90 text-violet-900 border-violet-300/80'
                  : stat.descriptor?.domain === 'grocery'
                    ? 'bg-amber-100/90 text-amber-900 border-amber-300/80'
                    : 'bg-emerald-100/80 text-emerald-900 border-emerald-300/80';
              return (
                <span
                  key={stat.catalogId}
                  title={stat.catalogId}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold ${pillColor}`}
                >
                  <span>{label}</span>
                  {stat.isDefault && (
                    <span className="rounded bg-black/10 px-1 text-[9px] uppercase">
                      default
                    </span>
                  )}
                  <span className="font-sans font-semibold opacity-80">
                    · {stat.componentCount} comp
                    {stat.functions.length > 0
                      ? ` + ${stat.functions.join(', ')}`
                      : ''}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3.5">
        {renderNodeInternal(rootComponentId, rootEvalContext, new Set())}
      </div>
    </div>
  );
};
