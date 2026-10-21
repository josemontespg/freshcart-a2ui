import type {
  AisleCategory,
  CategoryMeta,
  DietaryTag,
  DietaryTagMeta,
  ProductSortOption,
} from '../types/grocery';

export const AISLE_CATEGORIES: CategoryMeta[] = [
  {
    id: 'all',
    label: 'All Aisles',
    shortLabel: 'All',
    emoji: '🛒',
    description: 'Browse our complete selection across every department',
  },
  {
    id: 'produce',
    label: 'Fresh Produce',
    shortLabel: 'Produce',
    emoji: '🥑',
    description: 'Organic fruits, crisp greens, avocados, and vine-ripened vegetables',
  },
  {
    id: 'dairy-eggs',
    label: 'Dairy & Eggs',
    shortLabel: 'Dairy & Eggs',
    emoji: '🥚',
    description: 'Pasture-raised eggs, Greek yogurt, artisanal cheeses, and plant milks',
  },
  {
    id: 'meat-seafood',
    label: 'Meat & Seafood',
    shortLabel: 'Meat & Seafood',
    emoji: '🐟',
    description: 'Wild-caught salmon, organic poultry, and 100% grass-fed cuts',
  },
  {
    id: 'bakery',
    label: 'Artisanal Bakery',
    shortLabel: 'Bakery',
    emoji: '🥖',
    description: 'Crusty sourdough loaves, butter croissants, and gluten-free baking',
  },
  {
    id: 'pantry',
    label: 'Pantry Staples',
    shortLabel: 'Pantry',
    emoji: '🫒',
    description: 'Ancient grains, cold-pressed olive oils, nut butters, and culinary sauces',
  },
  {
    id: 'frozen',
    label: 'Frozen Foods',
    shortLabel: 'Frozen',
    emoji: '🫐',
    description: 'Organic berries, cauliflower crust pizzas, and quick skillet meals',
  },
  {
    id: 'beverages',
    label: 'Beverages',
    shortLabel: 'Beverages',
    emoji: '🍵',
    description: 'Raw kombucha, cold brew concentrates, plant milks, and sparkling water',
  },
  {
    id: 'snacks',
    label: 'Snacks & Treats',
    shortLabel: 'Snacks',
    emoji: '🍫',
    description: 'Dark chocolate almonds, keto granola clusters, and roasted nuts',
  },
];

export const DIETARY_TAGS: DietaryTagMeta[] = [
  {
    id: 'organic',
    label: 'USDA Organic',
    shortLabel: 'Organic',
    emoji: '🌿',
    badgeColorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'high-protein',
    label: 'High-Protein',
    shortLabel: 'High-Protein',
    emoji: '💪',
    badgeColorClass: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    id: 'gluten-free',
    label: 'Gluten-Free',
    shortLabel: 'Gluten-Free',
    emoji: '🌾',
    badgeColorClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'keto',
    label: 'Keto Friendly',
    shortLabel: 'Keto',
    emoji: '🥑',
    badgeColorClass: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    id: 'vegan',
    label: 'Plant-Based / Vegan',
    shortLabel: 'Vegan',
    emoji: '🌱',
    badgeColorClass: 'bg-green-50 text-green-800 border-green-200',
  },
  {
    id: 'vegetarian',
    label: 'Vegetarian',
    shortLabel: 'Vegetarian',
    emoji: '🥗',
    badgeColorClass: 'bg-lime-50 text-lime-800 border-lime-200',
  },
  {
    id: 'dairy-free',
    label: 'Dairy-Free',
    shortLabel: 'Dairy-Free',
    emoji: '🥥',
    badgeColorClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  },
  {
    id: 'local',
    label: 'Local Farm',
    shortLabel: 'Local',
    emoji: '🚜',
    badgeColorClass: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  {
    id: 'non-gmo',
    label: 'Non-GMO Verified',
    shortLabel: 'Non-GMO',
    emoji: '🦋',
    badgeColorClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
];

export const PRODUCT_SORT_OPTIONS: Array<{
  id: ProductSortOption;
  label: string;
}> = [
  { id: 'featured', label: 'Featured & A2UI Picks' },
  { id: 'savings-desc', label: 'Biggest Deals & Savings' },
  { id: 'rating-desc', label: 'Highest Rated' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
];

export function getCategoryMeta(category: AisleCategory): CategoryMeta {
  return (
    AISLE_CATEGORIES.find((cat) => cat.id === category) ?? AISLE_CATEGORIES[0]
  );
}

export function getDietaryTagMeta(tag: DietaryTag): DietaryTagMeta {
  return (
    DIETARY_TAGS.find((item) => item.id === tag) ?? {
      id: tag,
      label: tag,
      shortLabel: tag,
      emoji: '✨',
      badgeColorClass: 'bg-stone-100 text-stone-700 border-stone-200',
    }
  );
}
