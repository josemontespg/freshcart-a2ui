import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getCategoryMeta, getDietaryTagMeta } from '../../data/categories';
import {
  getProductOptimizationLinks,
  getSubstitutesForProduct,
} from '../../data/products';
import type {
  Product,
  SubstitutionPreferenceType,
} from '../../types/grocery';

export interface ProductDetailModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  onSelectRelatedProduct?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen = true,
  onClose,
  onSelectRelatedProduct,
  onSelectProduct,
}) => {
  const {
    items,
    addItemToCart,
    updateItemQuantity,
    swapCartItem,
    setSubstitutionPreference,
  } = useCart();

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product || !isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, isOpen, onClose]);

  if (!product || !isOpen) {
    return null;
  }

  const cartItem = items.find((item) => item.product.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const currentSubPref: SubstitutionPreferenceType =
    cartItem?.substitutionPreference ?? 'best_match';

  const optimizationLinks = getProductOptimizationLinks(product.id);
  const substitutes = getSubstitutesForProduct(product.id).slice(0, 3);
  const categoryMeta = getCategoryMeta(product.category);

  const handleInspectProduct = (target: Product) => {
    if (onSelectRelatedProduct) {
      onSelectRelatedProduct(target);
    } else if (onSelectProduct) {
      onSelectProduct(target);
    }
  };

  const handleSwapOrAddRelated = (target: Product) => {
    if (cartQuantity > 0) {
      swapCartItem(product.id, target.id, cartQuantity);
      handleInspectProduct(target);
    } else {
      addItemToCart(target.id, 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/55 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F7F5F0] border-b border-stone-200/70">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <span>{categoryMeta.emoji}</span>
            <span>{categoryMeta.label}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-stone-500">
              <MapPin className="w-3.5 h-3.5 text-[#0AAD0A]" />
              {product.aisleLocation}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-600 flex items-center justify-center border border-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left column: Product photo & badges */}
            <div className="space-y-3">
              <div className="relative aspect-4/3 rounded-2xl bg-[#F7F5F0] overflow-hidden border border-stone-200/70">
                {!imageFailed ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    onError={() => setImageFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-stone-500">
                    <span className="text-5xl mb-2">{categoryMeta.emoji}</span>
                    <span className="text-xs font-semibold">{product.name}</span>
                  </div>
                )}

                {product.stockStatus === 'low_stock' && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Low Stock · Backup Available
                  </span>
                )}
              </div>

              {/* Dietary tags */}
              <div className="flex flex-wrap gap-1.5">
                {product.dietaryTags.map((tagId) => {
                  const meta = getDietaryTagMeta(tagId);
                  return (
                    <span
                      key={tagId}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeColorClass}`}
                    >
                      <span>{meta.emoji}</span>
                      <span>{meta.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Right column: Core info, price, Cart CTA & Nutrition */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0AAD0A]">
                  {product.brand} · {product.unit}
                </p>
                <h2
                  id="product-detail-modal-title"
                  className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1 leading-snug"
                >
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500">
                  <span className="inline-flex items-center gap-1 font-bold text-stone-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {product.rating.toFixed(1)}
                  </span>
                  <span>({product.reviewCount.toLocaleString()} reviews)</span>
                </div>
              </div>

              {/* Price box */}
              <div className="flex items-baseline justify-between p-4 rounded-2xl bg-[#F7F5F0] border border-stone-200/70">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-stone-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="text-sm text-stone-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                  </div>
                  <p className="text-xs text-stone-500">
                    {product.unitPriceLabel}
                  </p>
                </div>

                {/* Add / Stepper */}
                {cartQuantity === 0 ? (
                  <button
                    type="button"
                    onClick={() => addItemToCart(product.id, 1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0AAD0A] hover:bg-[#099409] text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add to Cart</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-[#0AAD0A] text-white rounded-full p-1.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() =>
                        updateItemQuantity(product.id, cartQuantity - 1)
                      }
                      aria-label="Decrease quantity"
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/15 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="min-w-8 text-center font-extrabold text-sm tabular-nums px-1">
                      {cartQuantity} in cart
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateItemQuantity(product.id, cartQuantity + 1)
                      }
                      aria-label="Increase quantity"
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/15 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>

              {/* Per-item Substitution Preference when in cart */}
              {cartQuantity > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#0AAD0A]" />
                      If Out of Stock
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700">
                      Saved to Cart
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'best_match', label: 'Best Match' },
                        { id: 'specific_item', label: 'Pick Backup' },
                        { id: 'do_not_substitute', label: 'Refund Item' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setSubstitutionPreference(
                            product.id,
                            opt.id,
                            opt.id === 'specific_item'
                              ? product.suggestedBackupProductId
                              : undefined
                          )
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          currentSubPref === opt.id
                            ? 'bg-[#073E1E] text-white border-[#073E1E]'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrition Facts Panel */}
              <div className="rounded-2xl border border-stone-200/80 p-4 space-y-2.5 bg-white">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                    Nutrition Facts
                  </h3>
                  <span className="text-xs text-stone-500">
                    Serving: {product.nutrition.servingSize}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-[#F7F5F0]">
                    <div className="text-base font-extrabold text-stone-900">
                      {product.nutrition.calories}
                    </div>
                    <div className="text-[10px] font-semibold uppercase text-stone-500">
                      Calories
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/70">
                    <div className="text-base font-extrabold text-emerald-900">
                      {product.nutrition.proteinGrams}g
                    </div>
                    <div className="text-[10px] font-semibold uppercase text-emerald-700">
                      Protein
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F5F0]">
                    <div className="text-base font-extrabold text-stone-900">
                      {product.nutrition.carbsGrams}g
                    </div>
                    <div className="text-[10px] font-semibold uppercase text-stone-500">
                      Carbs
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F5F0]">
                    <div className="text-base font-extrabold text-stone-900">
                      {product.nutrition.fatGrams}g
                    </div>
                    <div className="text-[10px] font-semibold uppercase text-stone-500">
                      Fat
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <span>Dietary Fiber: {product.nutrition.fiberGrams}g</span>
                  {typeof product.nutrition.sugarGrams === 'number' && (
                    <span>Sugars: {product.nutrition.sugarGrams}g</span>
                  )}
                  {typeof product.nutrition.sodiumMg === 'number' && (
                    <span>Sodium: {product.nutrition.sodiumMg}mg</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Alternatives & Upgrades */}
          {(optimizationLinks.organicUpgrade ||
            optimizationLinks.budgetAlternative ||
            optimizationLinks.backup ||
            substitutes.length > 0) && (
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0AAD0A]" />
                  <span>Recommended Alternatives &amp; Upgrades</span>
                </h3>
                <span className="text-xs text-stone-500">
                  Hand-picked options for instant swaps or backups
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {optimizationLinks.organicUpgrade && (
                  <div className="p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 flex flex-col justify-between gap-2.5">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-700 text-white mb-1">
                        Organic Upgrade
                      </span>
                      <p className="text-xs font-bold text-stone-900 line-clamp-1">
                        {optimizationLinks.organicUpgrade.name}
                      </p>
                      <p className="text-xs text-stone-600 font-semibold mt-0.5">
                        ${optimizationLinks.organicUpgrade.price.toFixed(2)} ·{' '}
                        {optimizationLinks.organicUpgrade.unit}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleSwapOrAddRelated(
                          optimizationLinks.organicUpgrade!
                        )
                      }
                      className="w-full py-2 px-3 rounded-xl bg-[#0AAD0A] hover:bg-[#099409] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {cartQuantity > 0
                        ? 'Switch to Organic'
                        : 'Add Organic Option'}
                    </button>
                  </div>
                )}

                {optimizationLinks.budgetAlternative && (
                  <div className="p-3.5 rounded-2xl border border-sky-200/80 bg-sky-50/40 flex flex-col justify-between gap-2.5">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-700 text-white mb-1">
                        Value Pick
                      </span>
                      <p className="text-xs font-bold text-stone-900 line-clamp-1">
                        {optimizationLinks.budgetAlternative.name}
                      </p>
                      <p className="text-xs text-stone-600 font-semibold mt-0.5">
                        ${optimizationLinks.budgetAlternative.price.toFixed(2)}{' '}
                        · Save $
                        {Math.max(
                          0,
                          product.price -
                            optimizationLinks.budgetAlternative.price
                        ).toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleSwapOrAddRelated(
                          optimizationLinks.budgetAlternative!
                        )
                      }
                      className="w-full py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {cartQuantity > 0
                        ? 'Switch & Save'
                        : 'Add Value Option'}
                    </button>
                  </div>
                )}

                {optimizationLinks.backup && (
                  <div className="p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/40 flex flex-col justify-between gap-2.5">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-600 text-white mb-1">
                        Suggested Backup
                      </span>
                      <p className="text-xs font-bold text-stone-900 line-clamp-1">
                        {optimizationLinks.backup.name}
                      </p>
                      <p className="text-xs text-stone-600 font-semibold mt-0.5">
                        ${optimizationLinks.backup.price.toFixed(2)} ·{' '}
                        {optimizationLinks.backup.unit}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (cartQuantity > 0) {
                          setSubstitutionPreference(
                            product.id,
                            'specific_item',
                            optimizationLinks.backup!.id
                          );
                        } else {
                          handleInspectProduct(optimizationLinks.backup!);
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {cartQuantity > 0
                          ? 'Save as Backup'
                          : 'View Option'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
