import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  MessageSquare,
  Minus,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import type { CartItem } from '../../types/grocery';
import { getProductById } from '../../data/products';
import { useCart } from '../../context/CartContext';

export interface CartItemRowProps {
  item: CartItem;
  onOpenSubstitutionModal: (productId: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onOpenSubstitutionModal,
}) => {
  const { updateItemQuantity, updateItemNote } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(item.note ?? '');

  const { product, quantity, substitutionPreference, replacementProductId, note } =
    item;

  const lineTotal = (product.price * quantity).toFixed(2);
  const hasDiscount =
    product.originalPrice !== undefined && product.originalPrice > product.price;
  const originalLineTotal = hasDiscount
    ? ((product.originalPrice as number) * quantity).toFixed(2)
    : null;

  const replacementProduct = replacementProductId
    ? getProductById(replacementProductId)
    : product.suggestedBackupProductId
      ? getProductById(product.suggestedBackupProductId)
      : undefined;

  const handleSaveNote = () => {
    updateItemNote(product.id, draftNote.trim());
    setIsEditingNote(false);
  };

  const renderSubstitutionBadge = () => {
    if (substitutionPreference === 'do_not_substitute') {
      return (
        <button
          type="button"
          onClick={() => onOpenSubstitutionModal(product.id)}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
          title="Change substitution preference"
        >
          <ShieldAlert className="w-3 h-3 shrink-0 text-amber-600" />
          <span>Don&apos;t substitute (Refund)</span>
        </button>
      );
    }

    if (substitutionPreference === 'specific_item' && replacementProduct) {
      return (
        <button
          type="button"
          onClick={() => onOpenSubstitutionModal(product.id)}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors max-w-full"
          title="Change specific replacement item"
        >
          <RefreshCw className="w-3 h-3 shrink-0 text-sky-600" />
          <span className="truncate">
            Sub: {replacementProduct.name} (${replacementProduct.price.toFixed(2)})
          </span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onOpenSubstitutionModal(product.id)}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200/80 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition-colors max-w-full"
        title="Configure substitution rule"
      >
        <RefreshCw className="w-3 h-3 shrink-0 text-[#0AAD0A]" />
        <span className="truncate">
          Sub: Best match
          {replacementProduct ? ` (${replacementProduct.name})` : ''}
        </span>
      </button>
    );
  };

  return (
    <div className="group bg-white border border-stone-200/80 rounded-xl p-3.5 shadow-2xs hover:border-stone-300 transition-all">
      <div className="flex items-start gap-3">
        {/* Product Thumbnail */}
        <div className="relative w-15 h-15 rounded-lg overflow-hidden bg-stone-100 border border-stone-200/70 shrink-0">
          {!imageFailed ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold text-xs text-center p-1">
              {product.brand.slice(0, 8)}
            </div>
          )}
          {product.stockStatus === 'low_stock' && (
            <span
              className="absolute bottom-0 inset-x-0 bg-amber-500/95 text-white text-[9px] font-bold text-center py-0.5 leading-none"
              title="Low stock in store — backup recommended"
            >
              LOW STOCK
            </span>
          )}
        </div>

        {/* Product Info & Price */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-stone-500 truncate">
                {product.brand} · {product.unit}
              </p>
              <h4 className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2">
                {product.name}
              </h4>
            </div>

            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-stone-900">${lineTotal}</div>
              {originalLineTotal && (
                <div className="text-[11px] text-stone-400 line-through">
                  ${originalLineTotal}
                </div>
              )}
              {quantity > 1 && (
                <div className="text-[10px] text-stone-500">
                  ${product.price.toFixed(2)} ea
                </div>
              )}
            </div>
          </div>

          {/* Dietary & Low Stock Pill Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {product.dietaryTags.includes('organic') && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                USDA Organic
              </span>
            )}
            {product.stockStatus === 'low_stock' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                High substitution chance
              </span>
            )}
            {product.organicUpgradeProductId &&
              !product.dietaryTags.includes('organic') && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200/60">
                  Organic swap available
                </span>
              )}
            {product.budgetAlternativeProductId && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-800 border border-sky-200/60">
                Budget saver available
              </span>
            )}
          </div>

          {/* Bottom Controls: Substitution Rule + Stepper */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-100">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {renderSubstitutionBadge()}

              <button
                type="button"
                onClick={() => {
                  setDraftNote(note ?? '');
                  setIsEditingNote((prev) => !prev);
                }}
                className={`p-1 rounded-full border transition-colors shrink-0 ${
                  note
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-stone-200 text-stone-400 hover:text-stone-700'
                }`}
                title={note ? `Shopper note: ${note}` : 'Add shopper note'}
                aria-label="Shopper note"
              >
                <MessageSquare className="w-3 h-3" />
              </button>
            </div>

            {/* Animated +/- Quantity Stepper */}
            <div className="inline-flex items-center bg-[#0AAD0A] text-white rounded-full p-0.5 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => updateItemQuantity(product.id, quantity - 1)}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#088c08] active:scale-95 transition-all"
                aria-label={
                  quantity === 1
                    ? `Remove ${product.name} from cart`
                    : `Decrease ${product.name} quantity`
                }
              >
                {quantity === 1 ? (
                  <Trash2 className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
              </button>
              <span className="px-2.5 text-xs font-bold tabular-nums select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => updateItemQuantity(product.id, quantity + 1)}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#088c08] active:scale-95 transition-all"
                aria-label={`Increase ${product.name} quantity`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Shopper Note Display or Inline Editor */}
          {note && !isEditingNote && (
            <div
              onClick={() => {
                setDraftNote(note);
                setIsEditingNote(true);
              }}
              className="mt-2 text-[11px] text-stone-600 bg-stone-50 border border-stone-200/70 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-stone-100 transition-colors"
            >
              <span className="font-semibold text-stone-700">Shopper note:</span>{' '}
              {note}
            </div>
          )}

          {isEditingNote && (
            <div className="mt-2 flex items-center gap-1.5">
              <input
                type="text"
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNote();
                  if (e.key === 'Escape') setIsEditingNote(false);
                }}
                placeholder="e.g., Greenest bananas or firmest avocados..."
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/30 focus:border-[#0AAD0A]"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveNote}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0AAD0A] text-white text-xs font-semibold hover:bg-[#099409]"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;
