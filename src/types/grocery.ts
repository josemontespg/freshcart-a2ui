export type StoreId =
  | 'freshcart-organic'
  | 'costco-wholesale'
  | 'sprouts-farmers'
  | 'trader-joes-specialty';

export type AisleCategory =
  | 'all'
  | 'produce'
  | 'dairy-eggs'
  | 'meat-seafood'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'beverages'
  | 'snacks';

export type DietaryTag =
  | 'organic'
  | 'gluten-free'
  | 'vegan'
  | 'vegetarian'
  | 'keto'
  | 'high-protein'
  | 'dairy-free'
  | 'local'
  | 'non-gmo';

export type ProductSortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'savings-desc';

export interface CategoryMeta {
  id: AisleCategory;
  label: string;
  shortLabel: string;
  emoji: string;
  description: string;
}

export interface DietaryTagMeta {
  id: DietaryTag;
  label: string;
  shortLabel: string;
  emoji: string;
  badgeColorClass: string;
}

export interface NutritionFacts {
  servingSize: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams?: number;
  sodiumMg?: number;
}

export interface Store {
  id: StoreId;
  name: string;
  tagline: string;
  logoEmoji: string;
  primaryColor: string;
  accentColor: string;
  deliveryEtaMinutes: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  rating: number;
  reviewCount: number;
  featuredPromoBanner: {
    title: string;
    subtitle: string;
    badgeText: string;
    ctaText: string;
    linkedScenarioId?: 'meal-planner' | 'cart-optimizer' | 'budget-builder' | 'macro-showcase';
  };
}

export interface Product {
  id: string;
  storeId: StoreId;
  name: string;
  brand: string;
  category: Exclude<AisleCategory, 'all'>;
  price: number;
  originalPrice?: number;
  unit: string; // e.g., "16 oz", "1 lb", "per bunch", "12 ct"
  unitPriceLabel: string; // e.g., "$0.31 / oz"
  imageUrl: string;
  description: string;
  dietaryTags: DietaryTag[];
  nutrition: NutritionFacts;
  rating: number;
  reviewCount: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  aisleLocation: string; // e.g., "Aisle 4 · Organic Produce"
  suggestedBackupProductId?: string;
  organicUpgradeProductId?: string;
  budgetAlternativeProductId?: string;
}

export type SubstitutionPreferenceType =
  | 'best_match'
  | 'specific_item'
  | 'do_not_substitute';

export interface CartItem {
  product: Product;
  quantity: number;
  substitutionPreference: SubstitutionPreferenceType;
  replacementProductId?: string;
  note?: string;
}

export interface DeliverySlot {
  id: string;
  label: string; // e.g., "Today, 2:00 PM - 4:00 PM"
  windowText: string;
  fee: number;
  isExpress?: boolean;
  badge?: string;
}

export type OrderStage =
  | 'confirmed'
  | 'shopper_assigned'
  | 'shopping'
  | 'out_for_delivery'
  | 'delivered';

export interface ActiveOrder {
  orderId: string;
  store: Store;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discountAmount: number;
  tipAmount: number;
  total: number;
  deliveryAddress: string;
  deliverySlot: DeliverySlot;
  stage: OrderStage;
  createdAt: string;
  shopperName: string;
}

/**
 * Callback interface exposed by CartContext (sec-cart-checkout) and consumed
 * by the A2UI Action Event Bridge (sec-a2ui-engine & sec-ai-shopper) so A2UI
 * v1.0 surfaces can mutate real application state.
 */
export interface ShopperActionHandler {
  addItemToCart: (productId: string, quantity: number, note?: string) => void;
  addBundleToCart: (
    items: Array<{ productId: string; quantity: number }>,
    bundleTitle?: string
  ) => void;
  swapCartItem: (
    originalProductId: string,
    replacementProductId: string,
    quantity?: number
  ) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  setSubstitutionPreference: (
    productId: string,
    preference: SubstitutionPreferenceType,
    replacementProductId?: string
  ) => void;
  applyPromoCode: (code: string) => boolean;
  openCartDrawer: () => void;
}
