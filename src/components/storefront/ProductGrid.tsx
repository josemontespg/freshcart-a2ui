import React, { useMemo } from 'react';
import { PackageSearch, RotateCcw, Sparkles } from 'lucide-react';
import { getCategoryMeta } from '../../data/categories';
import type {
  AisleCategory,
  DietaryTag,
  Product,
  ProductSortOption,
} from '../../types/grocery';
import { ProductCard } from './ProductCard';

export interface ProductGridProps {
  products: Product[];
  selectedCategory?: AisleCategory;
  selectedDietaryTags?: DietaryTag[];
  searchQuery?: string;
  sortBy?: ProductSortOption;
  onlyOnSale?: boolean;
  onSelectProduct?: (product: Product) => void;
  onOpenSubstitutes?: (product: Product) => void;
  onResetFilters?: () => void;
  onLaunchAIScenario?: (
    scenarioId:
      | 'meal-planner'
      | 'cart-optimizer'
      | 'budget-builder'
      | 'mixed-catalogs'
  ) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory = 'all',
  selectedDietaryTags = [],
  searchQuery = '',
  sortBy = 'featured',
  onlyOnSale = false,
  onSelectProduct,
  onOpenSubstitutes,
  onResetFilters,
  onLaunchAIScenario,
}) => {
  const filteredAndSortedProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      if (
        onlyOnSale &&
        (!product.originalPrice || product.originalPrice <= product.price)
      ) {
        return false;
      }
      if (selectedDietaryTags.length > 0) {
        const matchesAllTags = selectedDietaryTags.every((tag) =>
          product.dietaryTags.includes(tag)
        );
        if (!matchesAllTags) {
          return false;
        }
      }
      if (normalizedQuery.length > 0) {
        const haystack = `${product.name} ${product.brand} ${product.category} ${product.description} ${product.dietaryTags.join(' ')}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }
      return true;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        sorted.sort(
          (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount
        );
        break;
      case 'savings-desc':
        sorted.sort((a, b) => {
          const savingsA = a.originalPrice ? a.originalPrice - a.price : 0;
          const savingsB = b.originalPrice ? b.originalPrice - b.price : 0;
          return savingsB - savingsA;
        });
        break;
      case 'featured':
      default:
        break;
    }

    return sorted;
  }, [
    products,
    selectedCategory,
    selectedDietaryTags,
    searchQuery,
    sortBy,
    onlyOnSale,
  ]);

  const activeCategoryMeta = getCategoryMeta(selectedCategory);

  if (filteredAndSortedProducts.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200/70 p-8 sm:p-12 text-center max-w-xl mx-auto my-6 shadow-2xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0AAD0A] flex items-center justify-center mx-auto">
          <PackageSearch className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-stone-900">
            No groceries match your filters
          </h3>
          <p className="text-sm text-stone-500">
            Try clearing an aisle or dietary filter, or ask your AI Personal
            Shopper to recommend ingredients for your meal.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0AAD0A] hover:bg-[#099409] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
          {onLaunchAIScenario && (
            <button
              type="button"
              onClick={() => onLaunchAIScenario('meal-planner')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#0AAD0A]" />
              <span>Ask AI Shopper</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Product catalog grid" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              {activeCategoryMeta.emoji}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
              {activeCategoryMeta.label}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200/70 text-stone-600">
              {filteredAndSortedProducts.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {activeCategoryMeta.description}
          </p>
        </div>
      </div>

      {/* Responsive 4-Column Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredAndSortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelectProduct={onSelectProduct}
            onOpenSubstitutes={onOpenSubstitutes}
          />
        ))}
      </div>
    </section>
  );
};
