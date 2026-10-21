import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import type { Product, SubstitutionPreferenceType } from '../../types/grocery';
import {
  getProductById,
  getProductOptimizationLinks,
  getSubstitutesForProduct,
} from '../../data/products';
import { useCart } from '../../context/CartContext';

export interface SubstitutionModalProps {
  isOpen?: boolean;
  productId?: string | null;
  onClose?: () => void;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  isOpen: externalIsOpen,
  productId: externalProductId,
  onClose: externalOnClose,
}) => {
  const {
    editingSubstitutionProductId,
    closeSubstitutionModal,
    getCartItem,
    setSubstitutionPreference,
    swapCartItem,
  } = useCart();

  const resolvedProductId =
    externalProductId !== undefined
      ? externalProductId
      : editingSubstitutionProductId;

  const isModalOpen =
    externalIsOpen !== undefined
      ? externalIsOpen && Boolean(resolvedProductId)
      : Boolean(resolvedProductId);

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      closeSubstitutionModal();
    }
  };

  const cartItem = resolvedProductId
    ? getCartItem(resolvedProductId)
    : undefined;
  const targetProduct =
    cartItem?.product ??
    (resolvedProductId ? getProductById(resolvedProductId) : undefined);

  const candidateSubstitutes = useMemo<Product[]>(() => {
    if (!targetProduct) return [];
    return getSubstitutesForProduct(targetProduct.id).slice(0, 6);
  }, [targetProduct]);

  const optimizationLinks = useMemo(() => {
    if (!targetProduct) return {};
    return getProductOptimizationLinks(targetProduct.id);
  }, [targetProduct]);

  const [selectedPreference, setSelectedPreference] =
    useState<SubstitutionPreferenceType>('best_match');
  const [selectedReplacementId, setSelectedReplacementId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (!targetProduct) return;
    const currentPref = cartItem?.substitutionPreference ?? 'best_match';
    const currentRepId =
      cartItem?.replacementProductId ??
      targetProduct.suggestedBackupProductId ??
      candidateSubstitutes[0]?.id;
    setSelectedPreference(currentPref);
    setSelectedReplacementId(currentRepId);
  }, [targetProduct, cartItem, candidateSubstitutes]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  if (!isModalOpen || !targetProduct) {
    return null;
  }

  const handleSave = () => {
    setSubstitutionPreference(
      targetProduct.id,
      selectedPreference,
      selectedPreference === 'do_not_substitute'
        ? undefined
        : selectedReplacementId
    );
    handleClose();
  };

  const handleSwapNow = (replacementId: string) => {
    swapCartItem(targetProduct.id, replacementId, cartItem?.quantity ?? 1);
    handleClose();
  };

  const getCandidateBadge = (candidate: Product): {
    label: string;
    className: string;
  } | null => {
    if (optimizationLinks.budgetAlternative?.id === candidate.id) {
      const diff = (targetProduct.price - candidate.price).toFixed(2);
      return {
        label: `Budget Saver · Save $${diff}`,
        className: 'bg-sky-50 text-sky-800 border-sky-200',
      };
    }
    if (optimizationLinks.organicUpgrade?.id === candidate.id) {
      return {
        label: 'USDA Organic Upgrade',
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }
    if (optimizationLinks.backup?.id === candidate.id) {
      return {
        label: 'AI Top Match Backup',
        className: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sub-modal-title"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-[#F7F5F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0AAD0A] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="sub-modal-title"
                className="text-base font-bold text-stone-900"
              >
                Substitution Preferences
              </h3>
              <p className="text-xs text-stone-600">
                Choose what your personal shopper should do if this item is out
                of stock
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200/70 transition-colors"
            aria-label="Close substitution modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Target Cart Item Banner */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-stone-50 border border-stone-200/90">
            <img
              src={targetProduct.imageUrl}
              alt={targetProduct.name}
              className="w-14 h-14 rounded-lg object-cover border border-stone-200 bg-white shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-500">
                  {targetProduct.brand} · {targetProduct.unit}
                </span>
                {targetProduct.stockStatus === 'low_stock' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Low Stock in Store
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-stone-900 truncate">
                {targetProduct.name}
              </h4>
              <p className="text-xs font-semibold text-[#0AAD0A] mt-0.5">
                ${targetProduct.price.toFixed(2)}{' '}
                <span className="text-stone-400 font-normal">
                  ({targetProduct.unitPriceLabel})
                </span>
              </p>
            </div>
          </div>

          {/* 3-Option Radio Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              If unavailable in store:
            </label>

            {/* Option 1: Best Match */}
            <div
              onClick={() => setSelectedPreference('best_match')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                selectedPreference === 'best_match'
                  ? 'border-[#0AAD0A] bg-emerald-50/40 ring-1 ring-[#0AAD0A]'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="sub-pref"
                checked={selectedPreference === 'best_match'}
                onChange={() => setSelectedPreference('best_match')}
                className="mt-1 accent-[#0AAD0A]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-900">
                    Replace with best match
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Your shopper or FreshCart AI selects the closest size, brand,
                  and dietary match.
                </p>
              </div>
            </div>

            {/* Option 2: Specific Replacement */}
            <div
              onClick={() => setSelectedPreference('specific_item')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                selectedPreference === 'specific_item'
                  ? 'border-[#0AAD0A] bg-emerald-50/40 ring-1 ring-[#0AAD0A]'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="sub-pref"
                checked={selectedPreference === 'specific_item'}
                onChange={() => setSelectedPreference('specific_item')}
                className="mt-1 accent-[#0AAD0A]"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-stone-900">
                  Choose a specific replacement SKU
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Pick the exact pre-approved backup item below.
                </p>
              </div>
            </div>

            {/* Option 3: Do Not Substitute */}
            <div
              onClick={() => setSelectedPreference('do_not_substitute')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                selectedPreference === 'do_not_substitute'
                  ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="sub-pref"
                checked={selectedPreference === 'do_not_substitute'}
                onChange={() => setSelectedPreference('do_not_substitute')}
                className="mt-1 accent-amber-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Don&apos;t substitute (Refund item)
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  If this exact item is out of stock, issue an automatic refund
                  instead.
                </p>
              </div>
            </div>
          </div>

          {/* Candidate Replacement SKU Picker */}
          {selectedPreference !== 'do_not_substitute' &&
            candidateSubstitutes.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0AAD0A]" />
                    Select Approved Backup or Swap Now
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {candidateSubstitutes.length} matches in stock
                  </span>
                </div>

                <div className="space-y-2">
                  {candidateSubstitutes.map((candidate) => {
                    const isSelected = selectedReplacementId === candidate.id;
                    const badge = getCandidateBadge(candidate);
                    const priceDelta = candidate.price - targetProduct.price;

                    return (
                      <div
                        key={candidate.id}
                        onClick={() => {
                          setSelectedPreference('specific_item');
                          setSelectedReplacementId(candidate.id);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#0AAD0A] bg-emerald-50/50 shadow-2xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <img
                          src={candidate.imageUrl}
                          alt={candidate.name}
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200 bg-stone-50 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {badge && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            )}
                            <span className="text-[11px] text-stone-500">
                              {candidate.unit}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-stone-900 truncate mt-0.5">
                            {candidate.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold text-stone-800">
                              ${candidate.price.toFixed(2)}
                            </span>
                            <span
                              className={`text-[11px] font-medium ${
                                priceDelta < 0
                                  ? 'text-emerald-700'
                                  : priceDelta > 0
                                    ? 'text-stone-500'
                                    : 'text-stone-400'
                              }`}
                            >
                              {priceDelta < 0
                                ? `(Save $${Math.abs(priceDelta).toFixed(2)})`
                                : priceDelta > 0
                                  ? `(+$${priceDelta.toFixed(2)})`
                                  : '(Same price)'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0AAD0A]">
                              <CheckCircle2 className="w-4 h-4" />
                              Selected
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSwapNow(candidate.id);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#0AAD0A] hover:text-white text-stone-700 transition-colors"
                            title="Replace item in cart immediately"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            Swap Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/70 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0AAD0A] hover:bg-[#099409] text-white shadow-xs transition-all"
          >
            Save Substitution Rule
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubstitutionModal;
