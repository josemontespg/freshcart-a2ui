import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Minus,
  Plus,
  Star,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getCategoryMeta, getDietaryTagMeta } from '../../data/categories';
import type { Product } from '../../types/grocery';

export interface ProductCardProps {
  product: Product;
  onSelectProduct?: (product: Product) => void;
  onOpenSubstitutes?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onOpenSubstitutes,
}) => {
  const { items, addItemToCart, updateItemQuantity, openSubstitutionModal } =
    useCart();
  const [imageFailed, setImageFailed] = useState(false);

  const cartItem = items.find((item) => item.product.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const hasDiscount =
    typeof product.originalPrice === 'number' &&
    product.originalPrice > product.price;
  const savingsAmount = hasDiscount
    ? (product.originalPrice! - product.price).toFixed(2)
    : null;

  const categoryMeta = getCategoryMeta(product.category);
  const primaryTags = product.dietaryTags.slice(0, 2);

  const handleOpenDetail = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockStatus === 'out_of_stock') return;
    if (cartQuantity === 0) {
      addItemToCart(product.id, 1);
    } else {
      updateItemQuantity(product.id, cartQuantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartQuantity > 0) {
      updateItemQuantity(product.id, cartQuantity - 1);
    }
  };

  const handleSubstitutionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenSubstitutes) {
      onOpenSubstitutes(product);
    } else if (openSubstitutionModal) {
      openSubstitutionModal(product.id);
    } else if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <article
      onClick={handleOpenDetail}
      className="group relative flex flex-col bg-white rounded-3xl border border-stone-200/70 shadow-2xs hover:shadow-md hover:border-emerald-600/25 transition-all overflow-hidden cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-[#F7F5F0] overflow-hidden">
        {!imageFailed ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F7F5F0] to-emerald-50/60 text-stone-500 p-4">
            <span className="text-4xl mb-1" aria-hidden="true">
              {categoryMeta.emoji}
            </span>
            <span className="text-xs font-medium text-stone-600 text-center line-clamp-1">
              {product.brand}
            </span>
          </div>
        )}

        {/* Top-left clean badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
          {savingsAmount && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-2xs">
              Save ${savingsAmount}
            </span>
          )}
          {product.stockStatus === 'low_stock' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50/95 text-amber-900 border border-amber-200/90 backdrop-blur-xs">
              Low Stock
            </span>
          )}
          {product.stockStatus === 'out_of_stock' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-800/90 text-white">
              Out of Stock
            </span>
          )}
        </div>

        {/* Bottom-right Instant Add / Quantity Stepper */}
        <div
          className="absolute bottom-3 right-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {cartQuantity === 0 ? (
            <button
              type="button"
              disabled={product.stockStatus === 'out_of_stock'}
              onClick={handleIncrement}
              aria-label={`Add ${product.name} to cart`}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#0AAD0A] hover:bg-[#099409] disabled:bg-stone-300 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 bg-[#0AAD0A] text-white rounded-full p-1 shadow-md ring-2 ring-white">
              <button
                type="button"
                onClick={handleDecrement}
                aria-label={`Decrease quantity of ${product.name}`}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/15 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span
                aria-live="polite"
                className="min-w-6 text-center text-xs font-extrabold tabular-nums px-1"
              >
                {cartQuantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label={`Increase quantity of ${product.name}`}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/15 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          {/* Price & unit row */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-stone-900 tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through tabular-nums">
                  ${product.originalPrice!.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-stone-400">
              {product.unit}
            </span>
          </div>

          {/* Product title & brand */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#0AAD0A] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {product.brand} · {product.unitPriceLabel}
            </p>
          </div>

          {/* Clean dietary tag pills */}
          {primaryTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {primaryTags.map((tagId) => {
                const tagMeta = getDietaryTagMeta(tagId);
                return (
                  <span
                    key={tagId}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tagMeta.badgeColorClass}`}
                  >
                    <span aria-hidden="true">{tagMeta.emoji}</span>
                    <span>{tagMeta.shortLabel}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Nutrition & Rating / Sub rule */}
        <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span>{product.nutrition.calories} cal</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-stone-700">
              {product.nutrition.proteinGrams}g protein
            </span>
          </div>

          {cartQuantity > 0 ? (
            <button
              type="button"
              onClick={handleSubstitutionClick}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0AAD0A] hover:underline cursor-pointer"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Backup</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-stone-600 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
