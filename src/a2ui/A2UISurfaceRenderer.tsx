import React, { useCallback } from 'react';
import { Code2, Layers, Sparkles } from 'lucide-react';
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
  /** Optional flag to show/hide the v1.0 surface header badge */
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
 * Multi-Catalog A2UI v1.0 Surface Renderer (`<A2UISurfaceRenderer />`)
 *
 * Renders an `A2UISurfaceState` component tree with:
 * - RFC 6901 JSON Pointer `@path` data bindings (root and relative `ChildList` scopes)
 * - Built-in v1.0 `@call` functions (`formatString`, `formatCurrency`, `@index`, etc.)
 * - Client-side `checks` validation via `ValidationEngine`
 * - 18 Basic Catalog components + Custom FreshCart Grocery Catalog (`ProductDealCard`, `NutritionSummary`)
 * - Outbound v1.0 `A2UIActionEvent` resolution and two-way `@path` data model updates
 */
export const A2UISurfaceRenderer: React.FC<A2UISurfaceRendererProps> = ({
  surface,
  onAction,
  onDataModelChange,
  products,
  className = '',
  showSurfaceBadge = true,
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
        <Sparkles className="mb-2 h-6 w-6 text-emerald-600" />
        <p className="text-xs font-semibold text-slate-700">
          Waiting for A2UI v1.0 surface stream...
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Select a shopping scenario or send a prompt to stream `createSurface`.
        </p>
      </div>
    );
  }

  const { componentsById, dataModel } = surface;
  const componentKeys = Object.keys(componentsById);

  if (componentKeys.length === 0) {
    return (
      <div className="animate-pulse space-y-3 rounded-2xl border border-emerald-200/70 bg-white p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <Layers className="h-4 w-4 animate-spin" />
          <span>
            Surface `{surface.surfaceId}` initialized (`createSurface`) — awaiting
            `updateComponents`...
          </span>
        </div>
        <div className="h-5 w-2/3 rounded-lg bg-slate-100" />
        <div className="h-16 w-full rounded-xl bg-slate-100" />
        <div className="h-10 w-1/2 rounded-xl bg-slate-100" />
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
      // Unknown component fallback card
      renderedElement = (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-800">
          Unsupported A2UI v1.0 component:{' '}
          <code className="font-mono font-semibold">{comp.component}</code> (id:{' '}
          <code className="font-mono">{comp.id}</code>)
        </div>
      );
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

    // 2. Dynamic A2UI v1.0 ChildList template (`{ componentId, path }`)
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

  // Resolve root component ID: "root" is required by A2UI v1.0 updateComponents
  const rootComponentId =
    'root' in componentsById ? 'root' : componentKeys[0];

  const hasGroceryComponents = Object.values(componentsById).some(
    (c) =>
      c.catalogId === FRESHCART_GROCERY_CATALOG_ID ||
      c.component === 'ProductDealCard' ||
      c.component === 'NutritionSummary'
  );

  return (
    <div
      data-surface-id={surface.surfaceId}
      className={`flex flex-col gap-3 ${className}`}
    >
      {showSurfaceBadge && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-3 py-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
            <Code2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>A2UI v1.0 Surface:</span>
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-emerald-800 shadow-2xs">
              {surface.surfaceId}
            </code>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="rounded-full bg-white px-2 py-0.5 font-medium text-slate-600 shadow-2xs">
              {componentKeys.length} components
            </span>
            {hasGroceryComponents && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                +Grocery Catalog
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {renderNodeInternal(rootComponentId, rootEvalContext, new Set())}
      </div>
    </div>
  );
};
