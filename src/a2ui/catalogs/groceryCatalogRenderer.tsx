import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Flame,
  Leaf,
  ShoppingCart,
  Sparkles,
  Tag,
} from 'lucide-react';
import type { A2UIAction } from '../../types/a2ui-v1';
import type { Product } from '../../types/grocery';
import {
  evaluateDynamicValue,
  resolveDynamicBoolean,
  resolveDynamicNumber,
  resolveDynamicString,
} from '../DataModelBinder';
import {
  type A2UIRenderNodeContext,
  ValidationFeedbackList,
} from './basicCatalogRenderer';
import {
  FRESHCART_WC_TAGS,
  type AisleStopItem,
  type AisleStepperWCProps,
  type NutritionRingWCProps,
  type PriceSparklineWCProps,
  registerFreshCartWebComponents,
} from '../web-components/freshcartWebComponents';

export interface GroceryCatalogExtraContext {
  products?: Product[];
}

/**
 * Custom Grocery Catalog Component 1: `ProductDealCard`
 *
 * Renders a consumer-friendly grocery deal / smart-swap card with live savings,
 * optional original-vs-replacement comparison, image preview, and one-click action.
 */
const A2UIProductDealCard: React.FC<{
  ctx: A2UIRenderNodeContext;
  extra?: GroceryCatalogExtraContext;
}> = ({ ctx, extra }) => {
  const { component, evalContext, validationState, dispatchAction } = ctx;
  const [imgError, setImgError] = useState(false);

  const productId = resolveDynamicString(
    component.productId ?? component.replacementProductId,
    evalContext,
    ''
  );
  const matchedProduct = extra?.products?.find((p) => p.id === productId);

  const title = resolveDynamicString(
    component.title ?? component.replacementName ?? component.name,
    evalContext,
    matchedProduct?.name ?? 'Featured Grocery Item'
  );
  const originalName = resolveDynamicString(
    component.originalName,
    evalContext,
    ''
  );
  const reasonText = resolveDynamicString(
    component.reason ?? component.subtitle ?? component.description,
    evalContext,
    matchedProduct?.description ?? ''
  );
  const unit = resolveDynamicString(
    component.unit,
    evalContext,
    matchedProduct?.unit ?? 'each'
  );
  const badgeText = resolveDynamicString(
    component.badgeText ?? component.badge ?? component.category,
    evalContext,
    'Recommended'
  );
  const imageUrl = resolveDynamicString(
    component.imageUrl,
    evalContext,
    matchedProduct?.imageUrl ?? ''
  );

  const price = resolveDynamicNumber(
    component.price ?? component.replacementPrice,
    evalContext,
    matchedProduct?.price ?? 0
  );
  const originalPrice = resolveDynamicNumber(
    component.originalPrice,
    evalContext,
    matchedProduct?.originalPrice ?? 0
  );
  const explicitSavings = resolveDynamicNumber(
    component.savingsAmount,
    evalContext,
    0
  );
  const computedSavings =
    explicitSavings > 0
      ? explicitSavings
      : originalPrice > price
        ? Number((originalPrice - price).toFixed(2))
        : 0;

  const isApplied = resolveDynamicBoolean(
    component.applied ?? component.added,
    evalContext,
    false
  );
  const actionLabel = resolveDynamicString(
    component.actionLabel ?? component.ctaLabel,
    evalContext,
    isApplied ? 'Added to Cart' : 'Add to Cart'
  );

  const handleActionClick = () => {
    if (!validationState.isValid) return;
    dispatchAction(
      component.id,
      component.action as A2UIAction | undefined,
      evalContext
    );
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-4 transition-all ${
        isApplied
          ? 'border-[#0AAD0A]/50 bg-emerald-50/40 shadow-xs'
          : 'border-stone-200/90 bg-white shadow-xs hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      {/* Top Deal Badge Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
          <Tag className="h-3 w-3 text-[#0AAD0A]" />
          {badgeText}
        </span>

        {computedSavings > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
            <Sparkles className="h-3 w-3 text-amber-600" />
            Save ${computedSavings.toFixed(2)}
          </span>
        )}
      </div>

      {/* Main Content Row */}
      <div className="flex items-start gap-3.5">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={title}
            onError={() => setImgError(true)}
            className="h-16 w-16 shrink-0 rounded-2xl border border-stone-200/70 bg-stone-100 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50 text-[#0AAD0A]">
            <Leaf className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {originalName && (
            <div className="mb-0.5 flex items-center gap-1 text-[11px] text-stone-400 line-through">
              <ArrowRightLeft className="h-3 w-3 text-stone-400" />
              <span className="truncate">Replaces: {originalName}</span>
            </div>
          )}

          <h4 className="text-sm font-bold leading-snug text-stone-900">
            {title}
          </h4>

          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-base font-extrabold text-[#0AAD0A]">
              ${price.toFixed(2)}
            </span>
            {originalPrice > price && (
              <span className="text-xs font-medium text-stone-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            {unit && (
              <span className="text-[11px] font-medium text-stone-500">
                · {unit}
              </span>
            )}
          </div>

          {reasonText && (
            <p className="mt-1 text-xs leading-relaxed text-stone-600">
              {reasonText}
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {component.action !== undefined && (
        <div className="mt-3.5 flex items-center justify-end border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={handleActionClick}
            disabled={!validationState.isValid}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              isApplied
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-[#0AAD0A] text-white hover:bg-[#089408] shadow-xs'
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{actionLabel}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>{actionLabel}</span>
              </>
            )}
          </button>
        </div>
      )}

      <ValidationFeedbackList validationState={validationState} compact />
    </div>
  );
};

/**
 * Custom Grocery Catalog Component 2: `NutritionSummary`
 *
 * Renders a light, appetizing nutrition & macro breakdown card for recipes and meal plans.
 */
const A2UINutritionSummary: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext } = ctx;

  const title = resolveDynamicString(
    component.title ?? component.label,
    evalContext,
    'Nutrition per Serving'
  );
  const calories = resolveDynamicNumber(component.calories, evalContext, 550);
  const proteinGrams = resolveDynamicNumber(
    component.proteinGrams ?? component.protein,
    evalContext,
    38
  );
  const carbsGrams = resolveDynamicNumber(
    component.carbsGrams ?? component.carbs,
    evalContext,
    42
  );
  const fatGrams = resolveDynamicNumber(
    component.fatGrams ?? component.fat,
    evalContext,
    22
  );
  const fiberGrams = resolveDynamicNumber(
    component.fiberGrams ?? component.fiber,
    evalContext,
    8
  );
  const servings = resolveDynamicNumber(component.servings, evalContext, 4);
  const dailyTarget = resolveDynamicNumber(
    component.dailyCalorieTarget,
    evalContext,
    2000
  );

  const totalMacroGrams = Math.max(1, proteinGrams + carbsGrams + fatGrams);
  const proteinPct = Math.round((proteinGrams / totalMacroGrams) * 100);
  const carbsPct = Math.round((carbsGrams / totalMacroGrams) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);
  const dailyPct = Math.min(
    100,
    Math.round((calories / Math.max(1, dailyTarget)) * 100)
  );

  return (
    <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-white to-stone-50/60 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0AAD0A]/10 text-[#0AAD0A]">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-stone-900">{title}</h4>
            <p className="text-[11px] text-stone-500">
              {servings} {servings === 1 ? 'serving' : 'servings'} · {dailyPct}%
              of daily {dailyTarget} cal goal
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-stone-200/80 px-3 py-1 text-right shadow-2xs">
          <span className="text-base font-extrabold text-stone-900">
            {calories}
          </span>
          <span className="ml-1 text-[11px] font-medium text-stone-500">
            cal
          </span>
        </div>
      </div>

      {/* Stacked Macro Proportion Bar */}
      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-stone-200/70">
        <div
          style={{ width: `${proteinPct}%` }}
          className="bg-[#0AAD0A] transition-all duration-300"
          title={`Protein: ${proteinPct}%`}
        />
        <div
          style={{ width: `${carbsPct}%` }}
          className="bg-amber-400 transition-all duration-300"
          title={`Carbs: ${carbsPct}%`}
        />
        <div
          style={{ width: `${fatPct}%` }}
          className="bg-sky-400 transition-all duration-300"
          title={`Fat: ${fatPct}%`}
        />
      </div>

      {/* 4 Macro Pill Cards */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-stone-200/70 bg-white px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500">
            <span className="h-2 w-2 rounded-full bg-[#0AAD0A]" />
            Protein
          </div>
          <div className="mt-0.5 text-sm font-bold text-stone-900">
            {proteinGrams}g
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/70 bg-white px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Carbs
          </div>
          <div className="mt-0.5 text-sm font-bold text-stone-900">
            {carbsGrams}g
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/70 bg-white px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Fat
          </div>
          <div className="mt-0.5 text-sm font-bold text-stone-900">
            {fatGrams}g
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/70 bg-white px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Fiber
          </div>
          <div className="mt-0.5 text-sm font-bold text-stone-900">
            {fiberGrams}g
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Custom Grocery Web Component 3: `NutritionRingWC` (`<freshcart-nutrition-ring>`)
 *
 * Mounts the real W3C Custom Element `<freshcart-nutrition-ring>`, passes
 * resolved A2UI v1.0 `@path` values via `.wcProps`, and bridges `freshcart-wc-change`
 * custom events back to `updateDataModelPath`.
 */
const A2UINutritionRingWCBridge: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, updateDataModelPath } = ctx;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const wcRef = useRef<(HTMLElement & { wcProps?: Partial<NutritionRingWCProps> }) | null>(
    null
  );

  const rawServings = component.servings as
    | { '@path'?: string }
    | number
    | undefined;
  const inferredServingsPath =
    typeof rawServings === 'object' &&
    rawServings !== null &&
    typeof rawServings['@path'] === 'string'
      ? rawServings['@path']
      : resolveDynamicString(component.servingsPath, evalContext, '/servings');

  const resolvedProps: NutritionRingWCProps = {
    title: resolveDynamicString(
      component.title ?? component.label,
      evalContext,
      'Interactive Macro & Calorie Ring'
    ),
    calories: resolveDynamicNumber(component.calories, evalContext, 540),
    dailyCalorieTarget: resolveDynamicNumber(
      component.dailyCalorieTarget,
      evalContext,
      2000
    ),
    proteinGrams: resolveDynamicNumber(
      component.proteinGrams ?? component.protein,
      evalContext,
      42
    ),
    carbsGrams: resolveDynamicNumber(
      component.carbsGrams ?? component.carbs,
      evalContext,
      46
    ),
    fatGrams: resolveDynamicNumber(
      component.fatGrams ?? component.fat,
      evalContext,
      18
    ),
    fiberGrams: resolveDynamicNumber(
      component.fiberGrams ?? component.fiber,
      evalContext,
      9
    ),
    servings: resolveDynamicNumber(component.servings, evalContext, 4),
    servingsPath: inferredServingsPath,
  };

  useEffect(() => {
    registerFreshCartWebComponents();
    const container = hostRef.current;
    if (!container) return;

    let el = wcRef.current;
    if (!el) {
      el = document.createElement(FRESHCART_WC_TAGS.nutritionRing) as HTMLElement & {
        wcProps?: Partial<NutritionRingWCProps>;
      };
      wcRef.current = el;
      container.replaceChildren(el);
    }

    const handleChange = (evt: Event) => {
      const detail = (evt as CustomEvent<{ path?: string; value?: unknown }>)
        .detail;
      if (detail?.path) {
        updateDataModelPath(detail.path, detail.value);
      }
    };

    el.addEventListener('freshcart-wc-change', handleChange);
    return () => {
      el?.removeEventListener('freshcart-wc-change', handleChange);
    };
  }, [updateDataModelPath]);

  useEffect(() => {
    if (wcRef.current) {
      wcRef.current.wcProps = resolvedProps;
    }
  });

  return <div ref={hostRef} className="w-full" />;
};

/**
 * Custom Grocery Web Component 4: `AisleStepperWC` (`<freshcart-aisle-stepper>`)
 *
 * Mounts the real W3C Custom Element `<freshcart-aisle-stepper>`, syncs resolved
 * A2UI v1.0 `@path` stops & activeStopIndex, and bridges `freshcart-wc-change`
 * and `freshcart-wc-action` events back to the A2UI surface and FreshCart cart.
 */
const A2UIAisleStepperWCBridge: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, updateDataModelPath, dispatchAction } = ctx;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const wcRef = useRef<(HTMLElement & { wcProps?: Partial<AisleStepperWCProps> }) | null>(
    null
  );

  const rawStops = evaluateDynamicValue(component.stops, evalContext);
  const stops: AisleStopItem[] = Array.isArray(rawStops)
    ? (rawStops as AisleStopItem[])
    : [];

  const resolvedProps: AisleStepperWCProps = {
    title: resolveDynamicString(
      component.title,
      evalContext,
      'Smart Store Aisle Route & Express Pickup'
    ),
    storeName: resolveDynamicString(
      component.storeName,
      evalContext,
      'FreshCart Market · Mission Bay'
    ),
    fulfillmentMode: resolveDynamicString(
      component.fulfillmentMode,
      evalContext,
      'Express Aisle Route'
    ),
    activeStopIndex: resolveDynamicNumber(
      component.activeStopIndex,
      evalContext,
      0
    ),
    activeStopPath: resolveDynamicString(
      component.activeStopPath,
      evalContext,
      '/activeStopIndex'
    ),
    stops,
  };

  useEffect(() => {
    registerFreshCartWebComponents();
    const container = hostRef.current;
    if (!container) return;

    let el = wcRef.current;
    if (!el) {
      el = document.createElement(FRESHCART_WC_TAGS.aisleStepper) as HTMLElement & {
        wcProps?: Partial<AisleStepperWCProps>;
      };
      wcRef.current = el;
      container.replaceChildren(el);
    }

    const handleChange = (evt: Event) => {
      const detail = (evt as CustomEvent<{ path?: string; value?: unknown }>)
        .detail;
      if (detail?.path) {
        updateDataModelPath(detail.path, detail.value);
      }
    };

    const handleAction = (evt: Event) => {
      const detail = (
        evt as CustomEvent<{
          actionName?: string;
          productId?: string;
          productName?: string;
          quantity?: number;
        }>
      ).detail;
      if (detail?.productId) {
        dispatchAction(
          component.id,
          {
            event: {
              name: detail.actionName || 'addToCart',
              context: {
                productId: detail.productId,
                quantity: detail.quantity ?? 1,
                title: detail.productName ?? 'Aisle Item',
              },
            },
          },
          evalContext
        );
      }
    };

    el.addEventListener('freshcart-wc-change', handleChange);
    el.addEventListener('freshcart-wc-action', handleAction);
    return () => {
      el?.removeEventListener('freshcart-wc-change', handleChange);
      el?.removeEventListener('freshcart-wc-action', handleAction);
    };
  }, [component.id, dispatchAction, evalContext, updateDataModelPath]);

  useEffect(() => {
    if (wcRef.current) {
      wcRef.current.wcProps = resolvedProps;
    }
  });

  return <div ref={hostRef} className="w-full" />;
};

/**
 * Custom Grocery Web Component 5: `PriceSparklineWC` (`<freshcart-price-sparkline>`)
 *
 * Mounts the real W3C Custom Element `<freshcart-price-sparkline>` and forwards
 * `freshcart-wc-action` events when the user locks the 8-week low deal into their cart.
 */
const A2UIPriceSparklineWCBridge: React.FC<{
  ctx: A2UIRenderNodeContext;
  extra?: GroceryCatalogExtraContext;
}> = ({ ctx, extra }) => {
  const { component, evalContext, dispatchAction } = ctx;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const wcRef = useRef<(HTMLElement & { wcProps?: Partial<PriceSparklineWCProps> }) | null>(
    null
  );

  const productId = resolveDynamicString(
    component.productId,
    evalContext,
    'prod-seafood-salmon'
  );
  const matchedProduct = extra?.products?.find((p) => p.id === productId);

  const rawPrices = evaluateDynamicValue(component.weeklyPrices, evalContext);
  const weeklyPrices: number[] = Array.isArray(rawPrices)
    ? rawPrices.map((n) => Number(n) || 0)
    : [15.99, 15.49, 15.99, 14.99, 14.49, 13.99, 13.49, matchedProduct?.price ?? 12.99];

  const resolvedProps: PriceSparklineWCProps = {
    productId,
    title: resolveDynamicString(
      component.title,
      evalContext,
      matchedProduct?.name ?? 'Wild Alaskan Sockeye Salmon Fillet'
    ),
    unit: resolveDynamicString(
      component.unit,
      evalContext,
      matchedProduct?.unit ?? '12 oz pack'
    ),
    currentPrice: resolveDynamicNumber(
      component.currentPrice ?? component.price,
      evalContext,
      matchedProduct?.price ?? 12.99
    ),
    regularPrice: resolveDynamicNumber(
      component.regularPrice ?? component.originalPrice,
      evalContext,
      matchedProduct?.originalPrice ?? 15.99
    ),
    weeklyPrices,
    badgeText: resolveDynamicString(
      component.badgeText,
      evalContext,
      '8-Week Low Price'
    ),
  };

  useEffect(() => {
    registerFreshCartWebComponents();
    const container = hostRef.current;
    if (!container) return;

    let el = wcRef.current;
    if (!el) {
      el = document.createElement(FRESHCART_WC_TAGS.priceSparkline) as HTMLElement & {
        wcProps?: Partial<PriceSparklineWCProps>;
      };
      wcRef.current = el;
      container.replaceChildren(el);
    }

    const handleAction = (evt: Event) => {
      const detail = (
        evt as CustomEvent<{
          actionName?: string;
          productId?: string;
          productName?: string;
          quantity?: number;
        }>
      ).detail;
      if (detail?.productId) {
        dispatchAction(
          component.id,
          {
            event: {
              name: detail.actionName || 'addToCart',
              context: {
                productId: detail.productId,
                quantity: detail.quantity ?? 1,
                title: detail.productName ?? resolvedProps.title,
              },
            },
          },
          evalContext
        );
      }
    };

    el.addEventListener('freshcart-wc-action', handleAction);
    return () => {
      el?.removeEventListener('freshcart-wc-action', handleAction);
    };
  }, [component.id, dispatchAction, evalContext, resolvedProps.title]);

  useEffect(() => {
    if (wcRef.current) {
      wcRef.current.wcProps = resolvedProps;
    }
  });

  return <div ref={hostRef} className="w-full" />;
};

/**
 * Dispatches custom FreshCart Grocery Catalog components
 * (`ProductDealCard`, `NutritionSummary`, `NutritionRingWC`, `AisleStepperWC`, `PriceSparklineWC`).
 */
export function renderGroceryCatalogComponent(
  ctx: A2UIRenderNodeContext,
  extra?: GroceryCatalogExtraContext
): React.ReactNode | null {
  switch (ctx.component.component) {
    case 'ProductDealCard':
      return <A2UIProductDealCard ctx={ctx} extra={extra} />;
    case 'NutritionSummary':
      return <A2UINutritionSummary ctx={ctx} />;
    case 'NutritionRingWC':
      return <A2UINutritionRingWCBridge ctx={ctx} />;
    case 'AisleStepperWC':
      return <A2UIAisleStepperWCBridge ctx={ctx} />;
    case 'PriceSparklineWC':
      return <A2UIPriceSparklineWCBridge ctx={ctx} extra={extra} />;
    default:
      return null;
  }
}
