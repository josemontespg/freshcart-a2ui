import React from 'react';
import {
  ArrowUpDown,
  Check,
  Flame,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  AISLE_CATEGORIES,
  DIETARY_TAGS,
  PRODUCT_SORT_OPTIONS,
} from '../../data/categories';
import type {
  AisleCategory,
  DietaryTag,
  ProductSortOption,
} from '../../types/grocery';

export interface CategoryFilterBarProps {
  selectedCategory: AisleCategory;
  onSelectCategory: (category: AisleCategory) => void;
  selectedDietaryTags: DietaryTag[];
  onToggleDietaryTag: (tag: DietaryTag) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: ProductSortOption;
  onSortChange?: (sort: ProductSortOption) => void;
  onlyOnSale?: boolean;
  onToggleOnSale?: () => void;
  onClearFilters?: () => void;
  totalMatchingCount?: number;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedDietaryTags,
  onToggleDietaryTag,
  searchQuery = '',
  onSearchChange,
  sortBy = 'featured',
  onSortChange,
  onlyOnSale = false,
  onToggleOnSale,
  onClearFilters,
  totalMatchingCount,
}) => {
  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedDietaryTags.length > 0 ||
    onlyOnSale ||
    searchQuery.trim().length > 0;

  return (
    <div className="bg-white rounded-3xl border border-stone-200/70 shadow-2xs p-4 sm:p-5 space-y-3.5">
      {/* Row 1: Department / Aisle Navigation Pills */}
      <div className="flex items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Grocery aisles"
          className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
        >
          {AISLE_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectCategory(category.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0AAD0A] text-white shadow-xs'
                    : 'bg-[#F7F5F0] hover:bg-stone-200/60 text-stone-700'
                }`}
              >
                <span aria-hidden="true" className="text-base">
                  {category.emoji}
                </span>
                <span>{category.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Sort selector on desktop */}
        {onSortChange && (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <label htmlFor="storefront-sort-select" className="sr-only">
              Sort products
            </label>
            <select
              id="storefront-sort-select"
              value={sortBy}
              onChange={(e) =>
                onSortChange(e.target.value as ProductSortOption)
              }
              className="bg-[#F7F5F0] border border-stone-200/80 rounded-full px-3.5 py-1.5 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0AAD0A] cursor-pointer"
            >
              {PRODUCT_SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Row 2: Dietary filter chips, On-Sale toggle, optional inline search & reset */}
      <div className="pt-3 border-t border-stone-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          {onToggleOnSale && (
            <button
              type="button"
              onClick={onToggleOnSale}
              aria-pressed={onlyOnSale}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
                onlyOnSale
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-red-50/70 hover:bg-red-100/80 text-red-700 border-red-200/80'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Deals</span>
              {onlyOnSale && <Check className="w-3 h-3" />}
            </button>
          )}

          {DIETARY_TAGS.map((tag) => {
            const isActive = selectedDietaryTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggleDietaryTag(tag.id)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#073E1E] text-white border-[#073E1E] shadow-2xs'
                    : 'bg-stone-50/80 hover:bg-stone-100 text-stone-600 border-stone-200/80'
                }`}
              >
                <span aria-hidden="true">{tag.emoji}</span>
                <span>{tag.shortLabel}</span>
                {isActive && <Check className="w-3 h-3 text-emerald-300" />}
              </button>
            );
          })}
        </div>

        {/* Right side: inline search (if provided) + result count + reset */}
        <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
          {onSearchChange && (
            <div className="relative w-full sm:w-52">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filter items..."
                aria-label="Filter products by keyword"
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F7F5F0] border border-stone-200/80 rounded-full text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {typeof totalMatchingCount === 'number' && (
            <span className="text-xs font-medium text-stone-500 whitespace-nowrap">
              <strong className="text-stone-800">{totalMatchingCount}</strong>{' '}
              {totalMatchingCount === 1 ? 'item' : 'items'}
            </span>
          )}

          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
