import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  PackagePlus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import {
  PROMO_CODE_RULES,
  type PromoCodeId,
  useCart,
} from '../../context/CartContext';
import { CartItemRow } from './CartItemRow';
import { SubstitutionModal } from './SubstitutionModal';

export interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onProceedToCheckout?: () => void;
  onOptimizeCartWithAI?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onProceedToCheckout: externalOnCheckout,
  onOptimizeCartWithAI,
}) => {
  const {
    items,
    activeStore,
    totalItemCount,
    subtotal,
    productSavings,
    deliveryFee,
    serviceFee,
    discountAmount,
    totalSavings,
    estimatedTotalBeforeTip,
    promoCode,
    appliedPromoRule,
    promoError,
    applyPromoCode,
    removePromoCode,
    freeDeliveryProgress,
    clearCart,
    seedStarterCart,
    isCartOpen,
    closeCartDrawer,
    openCheckoutModal,
    openSubstitutionModal,
    triggerOptimizeCartWithAI,
  } = useCart();

  const resolvedIsOpen =
    externalIsOpen !== undefined ? externalIsOpen : isCartOpen;

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      closeCartDrawer();
    }
  };

  const handleCheckout = () => {
    if (externalOnCheckout) {
      externalOnCheckout();
    } else {
      openCheckoutModal();
    }
  };

  const handleOptimizeWithAI = () => {
    if (onOptimizeCartWithAI) {
      handleClose();
      onOptimizeCartWithAI();
    } else {
      triggerOptimizeCartWithAI();
    }
  };

  const [promoInput, setPromoInput] = useState('');

  useEffect(() => {
    if (!resolvedIsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resolvedIsOpen]);

  // Calculate live AI optimization opportunities in the current cart
  const optimizationStats = useMemo(() => {
    let budgetCount = 0;
    let organicCount = 0;
    let lowStockCount = 0;

    for (const item of items) {
      if (item.product.budgetAlternativeProductId) budgetCount += 1;
      if (
        item.product.organicUpgradeProductId &&
        !item.product.dietaryTags.includes('organic')
      ) {
        organicCount += 1;
      }
      if (item.product.stockStatus === 'low_stock') lowStockCount += 1;
    }

    const totalOpportunities = budgetCount + organicCount + lowStockCount;
    return {
      budgetCount,
      organicCount,
      lowStockCount,
      totalOpportunities,
    };
  }, [items]);

  const handleApplyPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const ok = applyPromoCode(promoInput);
    if (ok) {
      setPromoInput('');
    }
  };

  const handleQuickApplyPromo = (code: PromoCodeId) => {
    setPromoInput(code);
    applyPromoCode(code);
  };

  if (!resolvedIsOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-end bg-stone-950/45 backdrop-blur-xs transition-opacity"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
        onClick={handleClose}
      >
        <div
          className="relative w-full max-w-md bg-[#F7F5F0] h-full shadow-2xl border-l border-stone-200 flex flex-col justify-between overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Store Header */}
          <div className="bg-white border-b border-stone-200 px-5 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-2xs border border-stone-200/80 bg-[#F7F5F0]"
                  aria-hidden="true"
                >
                  {activeStore.logoEmoji}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-stone-900 truncate">
                      {activeStore.name}
                    </h2>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#0AAD0A] border border-emerald-200/80">
                      {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#0AAD0A]" />
                    <span>
                      Personal shopper delivery in ~{activeStore.deliveryEtaMinutes}{' '}
                      mins
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="p-2 rounded-full text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Clear all items from cart"
                    aria-label="Clear cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  aria-label="Close cart drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Free Delivery Progress Bar */}
            <div className="mt-3.5 bg-stone-50 border border-stone-200/80 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                {freeDeliveryProgress.isUnlocked ||
                appliedPromoRule?.code === 'A2UIV1' ? (
                  <span className="font-semibold text-[#0AAD0A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      You&apos;ve unlocked FREE delivery on this order!
                    </span>
                  </span>
                ) : (
                  <span className="font-medium text-stone-700 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#0AAD0A] shrink-0" />
                    <span>
                      Add{' '}
                      <strong className="font-bold text-stone-900">
                        ${freeDeliveryProgress.amountRemaining.toFixed(2)}
                      </strong>{' '}
                      more for{' '}
                      <strong className="text-[#0AAD0A]">FREE delivery</strong>
                    </span>
                  </span>
                )}
                <span className="text-[11px] font-bold text-stone-500 tabular-nums">
                  ${subtotal.toFixed(2)} / $
                  {freeDeliveryProgress.threshold.toFixed(0)}
                </span>
              </div>
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0AAD0A] rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${
                      appliedPromoRule?.code === 'A2UIV1'
                        ? 100
                        : freeDeliveryProgress.percentComplete
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Smart Cart Savings & Swaps Callout */}
            {items.length > 0 && (
              <div className="bg-gradient-to-r from-[#073E1E] via-[#0B5328] to-[#108910] text-white rounded-2xl p-4 shadow-sm border border-emerald-800/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold leading-snug flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>✨ Smart Cart Savings &amp; Swaps</span>
                    </h3>
                    <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                      Compare budget alternatives, organic upgrades, and
                      in-stock backups
                      {optimizationStats.totalOpportunities > 0
                        ? ` (${optimizationStats.totalOpportunities} options ready for your cart).`
                        : '.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOptimizeWithAI}
                  className="mt-3 w-full py-2.5 px-4 rounded-xl bg-white text-[#073E1E] hover:bg-emerald-50 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <span>Review Smart Swaps &amp; Savings</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0AAD0A]" />
                </button>
              </div>
            )}

            {/* Empty Cart State */}
            {items.length === 0 ? (
              <div className="bg-white border border-stone-200/80 rounded-2xl p-8 text-center my-4 shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0AAD0A] flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  Your {activeStore.name} cart is empty
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto leading-relaxed">
                  Browse fresh produce and pantry staples, or ask your AI
                  Personal Shopper for quick dinner ideas.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={seedStarterCart}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0AAD0A] hover:bg-[#099409] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>Fill with Popular Essentials</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOptimizeWithAI}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#0AAD0A]" />
                    <span>Ask AI Personal Shopper</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Item Rows List */}
                <div className="space-y-2.5">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.product.id}
                      item={item}
                      onOpenSubstitutionModal={openSubstitutionModal}
                    />
                  ))}
                </div>

                {/* Promo Code & Discounts Card */}
                <div className="bg-white border border-stone-200/80 rounded-xl p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#0AAD0A]" />
                      Promo Codes &amp; Perks
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Click a chip to apply
                    </span>
                  </div>

                  {/* Quick-Apply Promo Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {(Object.keys(PROMO_CODE_RULES) as PromoCodeId[]).map(
                      (code) => {
                        const rule = PROMO_CODE_RULES[code];
                        const isActive = promoCode === code;
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() =>
                              isActive
                                ? removePromoCode()
                                : handleQuickApplyPromo(code)
                            }
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                              isActive
                                ? 'bg-[#0AAD0A] text-white border-[#0AAD0A] shadow-2xs'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-[#0AAD0A] hover:text-[#0AAD0A]'
                            }`}
                            title={rule.description}
                          >
                            {code} · {rule.label}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Custom Promo Input */}
                  <form
                    onSubmit={handleApplyPromoSubmit}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo code (FRESH10, A2UIV1, ORGANIC15)"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/25 focus:border-[#0AAD0A] uppercase"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
                    >
                      Apply
                    </button>
                  </form>

                  {promoError && (
                    <p className="text-[11px] text-red-600 font-medium mt-2">
                      {promoError}
                    </p>
                  )}

                  {appliedPromoRule && (
                    <div className="mt-2.5 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0AAD0A] shrink-0" />
                        <span>
                          <strong>{appliedPromoRule.code}</strong>:{' '}
                          {appliedPromoRule.description}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
                        aria-label="Remove promo code"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sticky Footer Summary & Checkout Trigger */}
          {items.length > 0 && (
            <div className="bg-white border-t border-stone-200 px-5 py-4 shrink-0 space-y-3 shadow-lg">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Items subtotal ({totalItemCount} units)</span>
                  <span className="font-semibold text-stone-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {productSavings > 0 && (
                  <div className="flex justify-between text-[#0AAD0A]">
                    <span>Store sale savings</span>
                    <span className="font-semibold">
                      -${productSavings.toFixed(2)}
                    </span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#0AAD0A]">
                    <span>Promo discount ({promoCode})</span>
                    <span className="font-semibold">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Estimated delivery</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="line-through text-stone-400">
                          ${activeStore.deliveryFee.toFixed(2)}
                        </span>
                        <strong className="text-[#0AAD0A]">FREE</strong>
                      </span>
                    ) : (
                      <span className="font-semibold text-stone-900">
                        ${deliveryFee.toFixed(2)}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Service fee</span>
                  <span className="font-semibold text-stone-900">
                    ${serviceFee.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm font-bold text-stone-900">
                  <span>Estimated Total</span>
                  <span className="text-base">
                    ${estimatedTotalBeforeTip.toFixed(2)}
                  </span>
                </div>
              </div>

              {totalSavings > 0 && (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-1.5 text-center text-xs font-semibold text-emerald-800">
                  🎉 You are saving <strong>${totalSavings.toFixed(2)}</strong> on
                  this order!
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3.5 px-5 rounded-xl bg-[#0AAD0A] hover:bg-[#099409] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-between shadow-md transition-all cursor-pointer"
              >
                <span>Go to Checkout</span>
                <span className="bg-black/15 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums">
                  ${estimatedTotalBeforeTip.toFixed(2)}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <SubstitutionModal />
    </>
  );
};

export default CartDrawer;
