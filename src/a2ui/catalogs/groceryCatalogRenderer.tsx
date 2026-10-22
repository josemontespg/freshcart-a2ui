import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Compass,
  Flame,
  Leaf,
  MapPin,
  Navigation,
  ShoppingCart,
  Sparkles,
  Tag,
  TicketPercent,
  Timer,
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
 * Custom Grocery Catalog Component 3: `AisleMapLocator`
 * (`https://freshcart.app/catalogs/grocery/v1/catalog.json`)
 *
 * Interactive in-store aisle, bay, and temperature zone navigator with stock status
 * and quick-add or highlight action.
 */
const A2UIAisleMapLocator: React.FC<{
  ctx: A2UIRenderNodeContext;
  extra?: GroceryCatalogExtraContext;
}> = ({ ctx, extra }) => {
  const { component, evalContext, validationState, dispatchAction } = ctx;

  const productId = resolveDynamicString(component.productId, evalContext, '');
  const matchedProduct = extra?.products?.find((p) => p.id === productId);

  const itemName = resolveDynamicString(
    component.itemName ?? component.title,
    evalContext,
    matchedProduct?.name ?? 'Wild Alaskan Sockeye Salmon Fillet'
  );
  const aisleCode = resolveDynamicString(
    component.aisleCode ?? component.aisle,
    evalContext,
    matchedProduct?.aisleLocation ?? 'Aisle 3 · Bay B'
  );
  const sectionName = resolveDynamicString(
    component.sectionName ?? component.zone,
    evalContext,
    'Sustainable Seafood & Cold Case'
  );
  const shelfLevel = resolveDynamicString(
    component.shelfLevel,
    evalContext,
    'Eye-Level Chilled Display (34°F)'
  );
  const stockNote = resolveDynamicString(
    component.stockNote,
    evalContext,
    'Fresh catch delivered this morning · 14 packs in stock'
  );
  const walkingTime = resolveDynamicString(
    component.walkingTime,
    evalContext,
    '45 sec from Produce'
  );
  const isPinned = resolveDynamicBoolean(
    component.pinned ?? component.located,
    evalContext,
    false
  );
  const actionLabel = resolveDynamicString(
    component.actionLabel,
    evalContext,
    isPinned ? 'Pinned to Store Map ✓' : 'Pin Aisle Route'
  );

  const handleAction = () => {
    if (!validationState.isValid) return;
    dispatchAction(
      component.id,
      component.action as A2UIAction | undefined,
      evalContext
    );
  };

  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/60 via-white to-teal-50/40 p-4 shadow-xs">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
            <MapPin className="h-3 w-3 text-[#0AAD0A]" />
            {aisleCode}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-stone-600 border border-stone-200/80">
            grocery/v1 · AisleMapLocator
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200/70 px-2.5 py-0.5 rounded-full">
          <Compass className="h-3 w-3 text-teal-600" />
          {walkingTime}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h4 className="text-sm font-bold text-stone-900 truncate">
            {itemName}
          </h4>
          <p className="text-xs font-semibold text-emerald-800">
            {sectionName} · <span className="text-stone-600 font-normal">{shelfLevel}</span>
          </p>
          <p className="text-[11px] text-stone-500">{stockNote}</p>
        </div>

        {component.action !== undefined && (
          <button
            type="button"
            onClick={handleAction}
            disabled={!validationState.isValid}
            className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              isPinned
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-[#073E1E] text-white hover:bg-[#0A5226] shadow-2xs'
            }`}
          >
            {isPinned ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0AAD0A]" />
            ) : (
              <Navigation className="h-3.5 w-3.5 text-emerald-300" />
            )}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>

      <ValidationFeedbackList validationState={validationState} compact />
    </div>
  );
};

/**
 * Custom Grocery Catalog Component 4: `FlashCouponBanner`
 * (`https://freshcart.app/catalogs/grocery/v1/catalog.json`)
 *
 * Renders an interactive digital store coupon banner with promo code, savings badge,
 * and one-click clip action.
 */
const A2UIFlashCouponBanner: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, validationState, dispatchAction } = ctx;

  const title = resolveDynamicString(
    component.title ?? component.headline,
    evalContext,
    'Flash Sommelier & Seafood Bundle Coupon'
  );
  const subtitle = resolveDynamicString(
    component.subtitle ?? component.description,
    evalContext,
    'Clip to save $5.00 instantly when pairing Wild Salmon with Artisan Cheese & Olives'
  );
  const promoCode = resolveDynamicString(
    component.promoCode ?? component.code,
    evalContext,
    'CHEFPAIR5'
  );
  const badgeText = resolveDynamicString(
    component.badgeText ?? component.savingsLabel,
    evalContext,
    'SAVE $5.00'
  );
  const expiresIn = resolveDynamicString(
    component.expiresIn,
    evalContext,
    'Ends in 02:14:00'
  );
  const isClipped = resolveDynamicBoolean(
    component.clipped ?? component.applied,
    evalContext,
    false
  );
  const actionLabel = resolveDynamicString(
    component.actionLabel,
    evalContext,
    isClipped ? 'Coupon Clipped ($5.00 Off) ✓' : 'Clip $5.00 Coupon'
  );

  const handleClip = () => {
    if (!validationState.isValid) return;
    dispatchAction(
      component.id,
      component.action as A2UIAction | undefined,
      evalContext
    );
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-dashed p-4 transition-all ${
        isClipped
          ? 'border-[#0AAD0A] bg-emerald-50/70'
          : 'border-amber-400/90 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/80'
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-2xs">
            <TicketPercent className="h-3 w-3" />
            {badgeText}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-900 border border-amber-200/80">
            grocery/v1 · FlashCouponBanner
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
          <Timer className="h-3 w-3 text-amber-600" />
          {expiresIn}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h4 className="text-sm font-bold text-stone-900">{title}</h4>
          <p className="text-xs leading-relaxed text-stone-600">{subtitle}</p>
          <div className="pt-0.5 flex items-center gap-2">
            <span className="text-[11px] text-stone-500">Promo Code:</span>
            <code className="rounded bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-amber-900 border border-amber-300/80">
              {promoCode}
            </code>
          </div>
        </div>

        {component.action !== undefined && (
          <button
            type="button"
            onClick={handleClip}
            disabled={!validationState.isValid}
            className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              isClipped
                ? 'bg-[#0AAD0A] text-white shadow-2xs'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xs'
            }`}
          >
            {isClipped ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <TicketPercent className="h-3.5 w-3.5" />
            )}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>

      <ValidationFeedbackList validationState={validationState} compact />
    </div>
  );
};

/**
 * Dispatches custom FreshCart Grocery Catalog components
 * (`ProductDealCard`, `AisleMapLocator`, `FlashCouponBanner`, `NutritionSummary`).
 */
export function renderGroceryCatalogComponent(
  ctx: A2UIRenderNodeContext,
  extra?: GroceryCatalogExtraContext
): React.ReactNode | null {
  switch (ctx.component.component) {
    case 'ProductDealCard':
      return <A2UIProductDealCard ctx={ctx} extra={extra} />;
    case 'AisleMapLocator':
      return <A2UIAisleMapLocator ctx={ctx} extra={extra} />;
    case 'FlashCouponBanner':
      return <A2UIFlashCouponBanner ctx={ctx} />;
    case 'NutritionSummary':
      return <A2UINutritionSummary ctx={ctx} />;
    default:
      return null;
  }
}
