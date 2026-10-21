import React, { useState } from 'react';
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
  resolveDynamicBoolean,
  resolveDynamicNumber,
  resolveDynamicString,
} from '../DataModelBinder';
import {
  type A2UIRenderNodeContext,
  ValidationFeedbackList,
} from './basicCatalogRenderer';

export interface GroceryCatalogExtraContext {
  products?: Product[];
}

/**
 * Custom Grocery Catalog Component 1: `ProductDealCard`
 * (`catalogId: "https://freshcart.app/catalogs/grocery/v1/catalog.json"`)
 *
 * Renders a rich grocery SKU deal / smart-swap card with live savings calculation,
 * optional original-vs-replacement comparison, image preview, dietary badges,
 * and one-click `A2UIAction` dispatch.
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
    'Smart Pick'
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
      className={`group relative overflow-hidden rounded-2xl border p-3.5 transition-all ${
        isApplied
          ? 'border-emerald-400 bg-emerald-50/50 shadow-xs'
          : 'border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/30 shadow-xs hover:border-emerald-400 hover:shadow-md'
      }`}
    >
      {/* Top Deal Badge Bar */}
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
          <Tag className="h-3 w-3 text-emerald-600" />
          {badgeText}
        </span>

        {computedSavings > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
            <Sparkles className="h-3 w-3 text-amber-600" />
            Save ${computedSavings.toFixed(2)}
          </span>
        )}
      </div>

      {/* Main Content Row */}
      <div className="flex items-start gap-3">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={title}
            onError={() => setImgError(true)}
            className="h-16 w-16 shrink-0 rounded-xl border border-slate-200/70 bg-slate-100 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
            <Leaf className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {originalName && (
            <div className="mb-0.5 flex items-center gap-1 text-[11px] text-slate-400 line-through">
              <ArrowRightLeft className="h-3 w-3 text-slate-400" />
              <span className="truncate">Instead of: {originalName}</span>
            </div>
          )}

          <h4 className="text-sm font-bold leading-snug text-slate-900">
            {title}
          </h4>

          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-base font-extrabold text-emerald-700">
              ${price.toFixed(2)}
            </span>
            {originalPrice > price && (
              <span className="text-xs font-medium text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            {unit && (
              <span className="text-[11px] font-medium text-slate-500">
                · {unit}
              </span>
            )}
          </div>

          {reasonText && (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {reasonText}
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {component.action !== undefined && (
        <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-2.5">
          <button
            type="button"
            onClick={handleActionClick}
            disabled={!validationState.isValid}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isApplied
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
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
 * (`catalogId: "https://freshcart.app/catalogs/grocery/v1/catalog.json"`)
 *
 * Renders an interactive macro & calorie breakdown widget with proportion bars
 * for Protein, Carbs, Fat, and Fiber per serving.
 */
const A2UINutritionSummary: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext } = ctx;

  const title = resolveDynamicString(
    component.title ?? component.label,
    evalContext,
    'Nutritional Macro Breakdown (Per Serving)'
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
    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 p-4 text-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold tracking-wide text-emerald-100 uppercase">
              {title}
            </h4>
            <p className="text-[11px] text-emerald-300/80">
              Scaled for {servings} {servings === 1 ? 'serving' : 'servings'} ·{' '}
              {dailyPct}% of {dailyTarget} kcal daily target
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white/10 px-3 py-1 text-right backdrop-blur-xs">
          <span className="text-lg font-extrabold text-white">{calories}</span>
          <span className="ml-1 text-[11px] font-medium text-emerald-200">
            kcal / serving
          </span>
        </div>
      </div>

      {/* Stacked Macro Proportion Bar */}
      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          style={{ width: `${proteinPct}%` }}
          className="bg-emerald-400 transition-all duration-300"
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
        <div className="rounded-xl bg-white/10 px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300 uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Protein
          </div>
          <div className="mt-0.5 text-sm font-bold text-white">
            {proteinGrams}g
          </div>
        </div>

        <div className="rounded-xl bg-white/10 px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 uppercase">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Carbs
          </div>
          <div className="mt-0.5 text-sm font-bold text-white">
            {carbsGrams}g
          </div>
        </div>

        <div className="rounded-xl bg-white/10 px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-sky-300 uppercase">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Healthy Fat
          </div>
          <div className="mt-0.5 text-sm font-bold text-white">{fatGrams}g</div>
        </div>

        <div className="rounded-xl bg-white/10 px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-purple-300 uppercase">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            Dietary Fiber
          </div>
          <div className="mt-0.5 text-sm font-bold text-white">
            {fiberGrams}g
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Dispatches custom FreshCart Grocery Catalog components
 * (`ProductDealCard`, `NutritionSummary`).
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
    default:
      return null;
  }
}
