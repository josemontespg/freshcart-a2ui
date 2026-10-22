import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  ActiveOrder,
  CartItem,
  DeliverySlot,
  OrderStage,
  Product,
  ShopperActionHandler,
  Store,
  StoreId,
  SubstitutionPreferenceType,
} from '../types/grocery';
import { DEFAULT_STORE_ID, getStoreById, STORES } from '../data/stores';
import { getProductById, getProductsByStore } from '../data/products';

export type PromoCodeId = 'FRESH10' | 'A2UIV1' | 'ORGANIC15';

export interface PromoCodeRule {
  code: PromoCodeId;
  label: string;
  description: string;
  discountType: 'flat' | 'percent_all' | 'percent_organic';
  value: number;
  minSubtotal: number;
}

export interface FreeDeliveryProgress {
  threshold: number;
  currentSubtotal: number;
  amountRemaining: number;
  percentComplete: number;
  isUnlocked: boolean;
}

export interface CartToast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'info' | 'warning';
  source: 'user' | 'a2ui-shopper';
  createdAt: number;
}

export interface PlaceOrderInput {
  deliveryAddress: string;
  aptOrSuite?: string;
  deliveryInstructions?: string;
  leaveAtDoor: boolean;
  deliverySlot: DeliverySlot;
  tipAmount: number;
  paymentMethodLabel: string;
}

export interface CartContextValue extends ShopperActionHandler {
  items: CartItem[];
  allStoreItems: Record<StoreId, CartItem[]>;
  activeStoreId: StoreId;
  activeStore: Store;
  setActiveStoreId: (storeId: StoreId) => void;

  totalItemCount: number;
  uniqueItemCount: number;
  getItemQuantity: (productId: string) => number;
  getCartItem: (productId: string) => CartItem | undefined;

  subtotal: number;
  originalSubtotal: number;
  productSavings: number;
  deliveryFee: number;
  serviceFee: number;
  discountAmount: number;
  totalSavings: number;
  estimatedTotalBeforeTip: number;
  promoCode: string | null;
  appliedPromoRule: PromoCodeRule | null;
  promoError: string | null;
  removePromoCode: () => void;
  freeDeliveryProgress: FreeDeliveryProgress;

  removeItemFromCart: (productId: string) => void;
  updateItemNote: (productId: string, note: string) => void;
  clearCart: () => void;
  seedStarterCart: () => void;

  isCartOpen: boolean;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  isCheckoutOpen: boolean;
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;
  editingSubstitutionProductId: string | null;
  openSubstitutionModal: (productId: string) => void;
  closeSubstitutionModal: () => void;

  onRequestOptimizeCart?: () => void;
  triggerOptimizeCartWithAI: () => void;

  activeOrders: ActiveOrder[];
  placeOrder: (input: PlaceOrderInput) => ActiveOrder;
  advanceOrderStage: (orderId: string) => void;
  setOrderStage: (orderId: string, stage: OrderStage) => void;
  dismissOrder: (orderId: string) => void;

  toasts: CartToast[];
  addToast: (toast: Omit<CartToast, 'id' | 'createdAt'>) => void;
  dismissToast: (id: string) => void;
}

export interface CartProviderProps {
  children: React.ReactNode;
  initialStoreId?: StoreId;
  externalActiveStoreId?: StoreId;
  onActiveStoreChange?: (storeId: StoreId) => void;
  onRequestOptimizeCart?: () => void;
}

export const PROMO_CODE_RULES: Record<PromoCodeId, PromoCodeRule> = {
  FRESH10: {
    code: 'FRESH10',
    label: '$10 Off $30+',
    description: '$10.00 off any grocery order of $30.00 or more',
    discountType: 'flat',
    value: 10,
    minSubtotal: 30,
  },
  A2UIV1: {
    code: 'A2UIV1',
    label: '15% Off + Free Delivery',
    description: '15% off your entire order plus free delivery',
    discountType: 'percent_all',
    value: 15,
    minSubtotal: 15,
  },
  ORGANIC15: {
    code: 'ORGANIC15',
    label: '15% Off Organic Items',
    description: '15% off all USDA Organic items in your cart',
    discountType: 'percent_organic',
    value: 15,
    minSubtotal: 0,
  },
};

const CART_STORAGE_KEY = 'freshcart_cart_v1';
const ORDERS_STORAGE_KEY = 'freshcart_orders_v1';
const PROMO_STORAGE_KEY = 'freshcart_promo_v1';

const PERSONAL_SHOPPERS = [
  'Maya Lin · 4.99 ★ (1,420 deliveries)',
  'Carlos Rivera · 4.98 ★ (980 deliveries)',
  'Elena Rostova · 4.97 ★ (1,150 deliveries)',
  'Devon Brooks · 4.99 ★ (2,110 deliveries)',
];

const ORDER_STAGE_SEQUENCE: OrderStage[] = [
  'confirmed',
  'shopper_assigned',
  'shopping',
  'out_for_delivery',
  'delivered',
];

function buildDefaultStoreItems(): Record<StoreId, CartItem[]> {
  const emptyRecord: Record<StoreId, CartItem[]> = {
    'freshcart-organic': [],
    'costco-wholesale': [],
    'sprouts-farmers': [],
    'trader-joes-specialty': [],
  };

  // Seed 4 realistic default items into `freshcart-organic` covering:
  // 1. Conventional item with an organic upgrade (`prod-conv-avocado` -> `prod-org-avocado`)
  // 2. Low-stock item with a budget alternative & backup (`prod-salmon-fillet` -> `prod-atlantic-salmon`)
  // 3. Conventional dairy item with an organic upgrade (`prod-greek-yogurt` -> `prod-org-greek-yogurt`)
  // 4. Low-stock item with a budget alternative & backup (`prod-pasture-eggs` -> `prod-conv-eggs`)
  const defaultSeeds: Array<{
    id: string;
    quantity: number;
    preference: SubstitutionPreferenceType;
    note?: string;
  }> = [
    {
      id: 'prod-conv-avocado',
      quantity: 1,
      preference: 'best_match',
      note: 'Slightly firm for slicing',
    },
    {
      id: 'prod-salmon-fillet',
      quantity: 1,
      preference: 'best_match',
    },
    {
      id: 'prod-greek-yogurt',
      quantity: 1,
      preference: 'best_match',
    },
    {
      id: 'prod-pasture-eggs',
      quantity: 1,
      preference: 'specific_item',
    },
  ];

  const seededFreshCart: CartItem[] = [];
  for (const seed of defaultSeeds) {
    const product = getProductById(seed.id);
    if (product) {
      seededFreshCart.push({
        product,
        quantity: seed.quantity,
        substitutionPreference: seed.preference,
        replacementProductId: product.suggestedBackupProductId,
        note: seed.note,
      });
    }
  }

  // Fallback if canonical IDs differed
  if (seededFreshCart.length === 0) {
    const fallbackProducts = getProductsByStore('freshcart-organic').slice(0, 4);
    for (const product of fallbackProducts) {
      seededFreshCart.push({
        product,
        quantity: 1,
        substitutionPreference: 'best_match',
        replacementProductId: product.suggestedBackupProductId,
      });
    }
  }

  emptyRecord['freshcart-organic'] = seededFreshCart;
  return emptyRecord;
}

function hydrateStoreItemsFromStorage(): Record<StoreId, CartItem[]> {
  if (typeof window === 'undefined') {
    return buildDefaultStoreItems();
  }
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return buildDefaultStoreItems();
    }
    const parsed = JSON.parse(raw) as Partial<
      Record<
        StoreId,
        Array<{
          productId: string;
          quantity: number;
          substitutionPreference: SubstitutionPreferenceType;
          replacementProductId?: string;
          note?: string;
        }>
      >
    >;

    const hydrated: Record<StoreId, CartItem[]> = {
      'freshcart-organic': [],
      'costco-wholesale': [],
      'sprouts-farmers': [],
      'trader-joes-specialty': [],
    };

    let totalHydratedCount = 0;
    (Object.keys(hydrated) as StoreId[]).forEach((storeId) => {
      const savedList = parsed[storeId];
      if (Array.isArray(savedList)) {
        for (const entry of savedList) {
          const liveProduct = getProductById(entry.productId);
          if (liveProduct && entry.quantity > 0) {
            hydrated[storeId].push({
              product: liveProduct,
              quantity: entry.quantity,
              substitutionPreference: entry.substitutionPreference || 'best_match',
              replacementProductId:
                entry.replacementProductId ?? liveProduct.suggestedBackupProductId,
              note: entry.note,
            });
            totalHydratedCount += 1;
          }
        }
      }
    });

    if (totalHydratedCount === 0) {
      return buildDefaultStoreItems();
    }
    return hydrated;
  } catch {
    return buildDefaultStoreItems();
  }
}

function hydrateOrdersFromStorage(): ActiveOrder[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ActiveOrder[]) : [];
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<CartProviderProps> = ({
  children,
  initialStoreId = DEFAULT_STORE_ID,
  externalActiveStoreId,
  onActiveStoreChange,
  onRequestOptimizeCart,
}) => {
  const [internalStoreId, setInternalStoreId] = useState<StoreId>(initialStoreId);
  const activeStoreId = externalActiveStoreId ?? internalStoreId;

  const setActiveStoreId = useCallback(
    (nextStoreId: StoreId) => {
      setInternalStoreId(nextStoreId);
      onActiveStoreChange?.(nextStoreId);
    },
    [onActiveStoreChange]
  );

  const activeStore = useMemo<Store>(() => {
    return getStoreById(activeStoreId) ?? STORES[0];
  }, [activeStoreId]);

  const [allStoreItems, setAllStoreItems] = useState<Record<StoreId, CartItem[]>>(
    () => hydrateStoreItemsFromStorage()
  );

  const [promoCode, setPromoCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(PROMO_STORAGE_KEY) || null;
  });
  const [promoError, setPromoError] = useState<string | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [editingSubstitutionProductId, setEditingSubstitutionProductId] =
    useState<string | null>(null);

  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>(() =>
    hydrateOrdersFromStorage()
  );
  const [toasts, setToasts] = useState<CartToast[]>([]);

  // Persist cart items to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const serializable: Record<
        StoreId,
        Array<{
          productId: string;
          quantity: number;
          substitutionPreference: SubstitutionPreferenceType;
          replacementProductId?: string;
          note?: string;
        }>
      > = {
        'freshcart-organic': [],
        'costco-wholesale': [],
        'sprouts-farmers': [],
        'trader-joes-specialty': [],
      };

      (Object.keys(allStoreItems) as StoreId[]).forEach((storeId) => {
        serializable[storeId] = allStoreItems[storeId].map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          substitutionPreference: item.substitutionPreference,
          replacementProductId: item.replacementProductId,
          note: item.note,
        }));
      });

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Ignore storage quota errors
    }
  }, [allStoreItems]);

  // Persist active orders
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(activeOrders));
    } catch {
      // Ignore storage errors
    }
  }, [activeOrders]);

  // Persist promo code
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (promoCode) {
        window.localStorage.setItem(PROMO_STORAGE_KEY, promoCode);
      } else {
        window.localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [promoCode]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toastInput: Omit<CartToast, 'id' | 'createdAt'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: CartToast = {
        ...toastInput,
        id,
        createdAt: Date.now(),
      };
      setToasts((prev) => [newToast, ...prev].slice(0, 4));
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4500);
      }
    },
    []
  );

  // Active store items
  const items = useMemo(() => {
    return allStoreItems[activeStoreId] ?? [];
  }, [allStoreItems, activeStoreId]);

  const totalItemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const uniqueItemCount = items.length;

  const getItemQuantity = useCallback(
    (productId: string): number => {
      const found = items.find((item) => item.product.id === productId);
      return found ? found.quantity : 0;
    },
    [items]
  );

  const getCartItem = useCallback(
    (productId: string): CartItem | undefined => {
      return items.find((item) => item.product.id === productId);
    },
    [items]
  );

  // Monetary calculations
  const subtotal = useMemo(() => {
    const raw = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    return Number(raw.toFixed(2));
  }, [items]);

  const originalSubtotal = useMemo(() => {
    const raw = items.reduce(
      (sum, item) =>
        sum + (item.product.originalPrice ?? item.product.price) * item.quantity,
      0
    );
    return Number(raw.toFixed(2));
  }, [items]);

  const productSavings = useMemo(() => {
    return Number(Math.max(0, originalSubtotal - subtotal).toFixed(2));
  }, [originalSubtotal, subtotal]);

  const freeDeliveryProgress = useMemo<FreeDeliveryProgress>(() => {
    const threshold = activeStore.freeDeliveryThreshold;
    const amountRemaining = Number(Math.max(0, threshold - subtotal).toFixed(2));
    const percentComplete =
      threshold > 0
        ? Math.min(100, Math.round((subtotal / threshold) * 100))
        : 100;
    const isUnlocked = subtotal >= threshold && subtotal > 0;
    return {
      threshold,
      currentSubtotal: subtotal,
      amountRemaining,
      percentComplete,
      isUnlocked,
    };
  }, [activeStore.freeDeliveryThreshold, subtotal]);

  const appliedPromoRule = useMemo<PromoCodeRule | null>(() => {
    if (!promoCode) return null;
    const normalized = promoCode.trim().toUpperCase() as PromoCodeId;
    return PROMO_CODE_RULES[normalized] ?? null;
  }, [promoCode]);

  const discountAmount = useMemo(() => {
    if (!appliedPromoRule || subtotal === 0) return 0;
    if (subtotal < appliedPromoRule.minSubtotal) return 0;

    if (appliedPromoRule.discountType === 'flat') {
      return Number(Math.min(subtotal, appliedPromoRule.value).toFixed(2));
    }
    if (appliedPromoRule.discountType === 'percent_all') {
      return Number(((subtotal * appliedPromoRule.value) / 100).toFixed(2));
    }
    if (appliedPromoRule.discountType === 'percent_organic') {
      const organicSubtotal = items.reduce((sum, item) => {
        const isOrganic = item.product.dietaryTags.includes('organic');
        return isOrganic ? sum + item.product.price * item.quantity : sum;
      }, 0);
      return Number(
        ((organicSubtotal * appliedPromoRule.value) / 100).toFixed(2)
      );
    }
    return 0;
  }, [appliedPromoRule, items, subtotal]);

  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    if (freeDeliveryProgress.isUnlocked) return 0;
    if (appliedPromoRule?.code === 'A2UIV1') return 0;
    return activeStore.deliveryFee;
  }, [
    subtotal,
    freeDeliveryProgress.isUnlocked,
    appliedPromoRule,
    activeStore.deliveryFee,
  ]);

  const serviceFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return Number(Math.max(1.99, subtotal * 0.05).toFixed(2));
  }, [subtotal]);

  const totalSavings = useMemo(() => {
    const deliverySaved =
      subtotal > 0 && deliveryFee === 0 ? activeStore.deliveryFee : 0;
    return Number((productSavings + discountAmount + deliverySaved).toFixed(2));
  }, [productSavings, discountAmount, subtotal, deliveryFee, activeStore.deliveryFee]);

  const estimatedTotalBeforeTip = useMemo(() => {
    if (subtotal === 0) return 0;
    return Number(
      Math.max(0, subtotal - discountAmount + deliveryFee + serviceFee).toFixed(2)
    );
  }, [subtotal, discountAmount, deliveryFee, serviceFee]);

  // ShopperActionHandler & Cart Mutations
  const addItemToCart = useCallback(
    (productId: string, quantity = 1, note?: string) => {
      const product = getProductById(productId);
      if (!product) return;

      const targetStoreId = activeStoreId;

      setAllStoreItems((prev) => {
        const storeCart = [...(prev[targetStoreId] ?? [])];
        const existingIndex = storeCart.findIndex(
          (item) => item.product.id === productId
        );

        if (existingIndex >= 0) {
          const existing = storeCart[existingIndex];
          const nextQty = existing.quantity + quantity;
          if (nextQty <= 0) {
            storeCart.splice(existingIndex, 1);
          } else {
            storeCart[existingIndex] = {
              ...existing,
              quantity: nextQty,
              note: note !== undefined ? note : existing.note,
            };
          }
        } else if (quantity > 0) {
          storeCart.push({
            product,
            quantity,
            substitutionPreference: 'best_match',
            replacementProductId: product.suggestedBackupProductId,
            note,
          });
        }

        return {
          ...prev,
          [targetStoreId]: storeCart,
        };
      });

      if (note && note.toLowerCase().includes('chef')) {
        addToast({
          title: `Added ${product.name}`,
          description: note,
          variant: 'success',
          source: 'a2ui-shopper',
        });
      }
    },
    [activeStoreId, addToast]
  );

  const addBundleToCart = useCallback(
    (
      bundleItems: Array<{ productId: string; quantity: number }>,
      bundleTitle?: string
    ) => {
      if (!Array.isArray(bundleItems) || bundleItems.length === 0) return;

      const resolvedEntries: Array<{ product: Product; quantity: number }> = [];
      for (const entry of bundleItems) {
        const product = getProductById(entry.productId);
        if (product && entry.quantity > 0) {
          resolvedEntries.push({ product, quantity: entry.quantity });
        }
      }

      if (resolvedEntries.length === 0) return;

      setAllStoreItems((prev) => {
        const storeCart = [...(prev[activeStoreId] ?? [])];

        for (const { product, quantity } of resolvedEntries) {
          const existingIndex = storeCart.findIndex(
            (item) => item.product.id === product.id
          );
          if (existingIndex >= 0) {
            storeCart[existingIndex] = {
              ...storeCart[existingIndex],
              quantity: storeCart[existingIndex].quantity + quantity,
            };
          } else {
            storeCart.push({
              product,
              quantity,
              substitutionPreference: 'best_match',
              replacementProductId: product.suggestedBackupProductId,
              note: bundleTitle ? `From ${bundleTitle}` : undefined,
            });
          }
        }

        return {
          ...prev,
          [activeStoreId]: storeCart,
        };
      });

      const totalUnits = resolvedEntries.reduce((sum, e) => sum + e.quantity, 0);
      addToast({
        title: bundleTitle
          ? `Added "${bundleTitle}" to Cart`
          : 'Items Added to Cart',
        description: `Added ${resolvedEntries.length} items (${totalUnits} total) to your ${activeStore.name} cart.`,
        variant: 'success',
        source: 'a2ui-shopper',
      });
    },
    [activeStoreId, activeStore.name, addToast]
  );

  const swapCartItem = useCallback(
    (
      originalProductId: string,
      replacementProductId: string,
      quantity?: number
    ) => {
      const replacementProduct = getProductById(replacementProductId);
      if (!replacementProduct) return;

      const originalProduct = getProductById(originalProductId);

      setAllStoreItems((prev) => {
        const storeCart = [...(prev[activeStoreId] ?? [])];
        const origIndex = storeCart.findIndex(
          (item) => item.product.id === originalProductId
        );
        const existingReplacementIndex = storeCart.findIndex(
          (item) => item.product.id === replacementProductId
        );

        const resolvedQuantity =
          quantity ?? (origIndex >= 0 ? storeCart[origIndex].quantity : 1);

        if (origIndex >= 0) {
          const origItem = storeCart[origIndex];
          if (
            existingReplacementIndex >= 0 &&
            existingReplacementIndex !== origIndex
          ) {
            storeCart[existingReplacementIndex] = {
              ...storeCart[existingReplacementIndex],
              quantity:
                storeCart[existingReplacementIndex].quantity + resolvedQuantity,
            };
            storeCart.splice(origIndex, 1);
          } else {
            storeCart[origIndex] = {
              product: replacementProduct,
              quantity: resolvedQuantity,
              substitutionPreference: 'best_match',
              replacementProductId: replacementProduct.suggestedBackupProductId,
              note: origItem.note,
            };
          }
        } else if (existingReplacementIndex >= 0) {
          storeCart[existingReplacementIndex] = {
            ...storeCart[existingReplacementIndex],
            quantity: resolvedQuantity,
          };
        } else {
          storeCart.push({
            product: replacementProduct,
            quantity: resolvedQuantity,
            substitutionPreference: 'best_match',
            replacementProductId: replacementProduct.suggestedBackupProductId,
          });
        }

        return {
          ...prev,
          [activeStoreId]: storeCart,
        };
      });

      const priceDiff =
        originalProduct && originalProduct.price > replacementProduct.price
          ? ` (Saved $${(originalProduct.price - replacementProduct.price).toFixed(2)}/ea)`
          : '';

      addToast({
        title: `Smart Swap Applied${priceDiff}`,
        description: `${originalProduct?.name ?? 'Original item'} → ${replacementProduct.name}`,
        variant: 'success',
        source: 'a2ui-shopper',
      });
    },
    [activeStoreId, addToast]
  );

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      setAllStoreItems((prev) => {
        const storeCart = [...(prev[activeStoreId] ?? [])];
        const idx = storeCart.findIndex((item) => item.product.id === productId);

        if (quantity <= 0) {
          if (idx >= 0) {
            storeCart.splice(idx, 1);
          }
        } else if (idx >= 0) {
          storeCart[idx] = {
            ...storeCart[idx],
            quantity,
          };
        } else {
          const product = getProductById(productId);
          if (product) {
            storeCart.push({
              product,
              quantity,
              substitutionPreference: 'best_match',
              replacementProductId: product.suggestedBackupProductId,
            });
          }
        }

        return {
          ...prev,
          [activeStoreId]: storeCart,
        };
      });
    },
    [activeStoreId]
  );

  const removeItemFromCart = useCallback(
    (productId: string) => {
      updateItemQuantity(productId, 0);
    },
    [updateItemQuantity]
  );

  const updateItemNote = useCallback(
    (productId: string, note: string) => {
      setAllStoreItems((prev) => {
        const storeCart = (prev[activeStoreId] ?? []).map((item) =>
          item.product.id === productId ? { ...item, note } : item
        );
        return {
          ...prev,
          [activeStoreId]: storeCart,
        };
      });
    },
    [activeStoreId]
  );

  const setSubstitutionPreference = useCallback(
    (
      productId: string,
      preference: SubstitutionPreferenceType,
      replacementProductId?: string
    ) => {
      setAllStoreItems((prev) => {
        const storeCart = (prev[activeStoreId] ?? []).map((item) => {
          if (item.product.id !== productId) return item;
          return {
            ...item,
            substitutionPreference: preference,
            replacementProductId:
              preference === 'do_not_substitute'
                ? undefined
                : replacementProductId ??
                  item.replacementProductId ??
                  item.product.suggestedBackupProductId,
          };
        });
        return {
          ...prev,
          [activeStoreId]: storeCart,
        };
      });

      const targetProduct = getProductById(productId);
      const replacementProduct = replacementProductId
        ? getProductById(replacementProductId)
        : undefined;

      const prefLabel =
        preference === 'specific_item' && replacementProduct
          ? `Backup: ${replacementProduct.name}`
          : preference === 'do_not_substitute'
            ? 'Refund if unavailable'
            : 'Best match';

      if (targetProduct) {
        addToast({
          title: `Substitution Rule Saved`,
          description: `${targetProduct.name} · ${prefLabel}`,
          variant: 'info',
          source: 'user',
        });
      }
    },
    [activeStoreId, addToast]
  );

  const applyPromoCode = useCallback(
    (rawCode: string): boolean => {
      const normalized = rawCode.trim().toUpperCase() as PromoCodeId;
      if (!normalized) {
        setPromoError('Please enter a promo code.');
        return false;
      }

      const rule = PROMO_CODE_RULES[normalized];
      if (!rule) {
        setPromoError(
          `Unknown code "${normalized}". Try FRESH10, A2UIV1, or ORGANIC15.`
        );
        return false;
      }

      if (subtotal < rule.minSubtotal) {
        setPromoError(
          `Code ${rule.code} requires a minimum subtotal of $${rule.minSubtotal.toFixed(2)} (currently $${subtotal.toFixed(2)}).`
        );
        return false;
      }

      if (rule.discountType === 'percent_organic') {
        const hasOrganic = items.some((item) =>
          item.product.dietaryTags.includes('organic')
        );
        if (!hasOrganic) {
          setPromoError(
            'Add at least one USDA Organic item to your cart to use ORGANIC15.'
          );
          return false;
        }
      }

      setPromoCode(rule.code);
      setPromoError(null);
      addToast({
        title: `Promo ${rule.code} Applied!`,
        description: rule.description,
        variant: 'success',
        source: 'user',
      });
      return true;
    },
    [subtotal, items, addToast]
  );

  const removePromoCode = useCallback(() => {
    setPromoCode(null);
    setPromoError(null);
  }, []);

  const clearCart = useCallback(() => {
    setAllStoreItems((prev) => ({
      ...prev,
      [activeStoreId]: [],
    }));
  }, [activeStoreId]);

  const seedStarterCart = useCallback(() => {
    const defaults = buildDefaultStoreItems();
    const storeSeeds =
      activeStoreId === 'freshcart-organic'
        ? defaults['freshcart-organic']
        : getProductsByStore(activeStoreId)
            .slice(0, 4)
            .map((product) => ({
              product,
              quantity: 1,
              substitutionPreference: 'best_match' as const,
              replacementProductId: product.suggestedBackupProductId,
            }));

    setAllStoreItems((prev) => ({
      ...prev,
      [activeStoreId]: storeSeeds,
    }));

    addToast({
      title: 'Starter Grocery Basket Loaded',
      description: `Added ${storeSeeds.length} popular items from ${activeStore.name}.`,
      variant: 'info',
      source: 'user',
    });
  }, [activeStoreId, activeStore.name, addToast]);

  // Drawer & Modal controls
  const openCartDrawer = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCartDrawer = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const toggleCartDrawer = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const openCheckoutModal = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);

  const closeCheckoutModal = useCallback(() => {
    setIsCheckoutOpen(false);
  }, []);

  const openSubstitutionModal = useCallback((productId: string) => {
    setEditingSubstitutionProductId(productId);
  }, []);

  const closeSubstitutionModal = useCallback(() => {
    setEditingSubstitutionProductId(null);
  }, []);

  const triggerOptimizeCartWithAI = useCallback(() => {
    setIsCartOpen(false);
    onRequestOptimizeCart?.();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('freshcart:open-ai-shopper', {
          detail: { scenarioId: 'cart-optimizer' },
        })
      );
    }
  }, [onRequestOptimizeCart]);

  // Order placement & live tracker progression
  const placeOrder = useCallback(
    (input: PlaceOrderInput): ActiveOrder => {
      const orderId = `FC-${Math.floor(10000 + Math.random() * 90000)}`;
      const shopperName =
        PERSONAL_SHOPPERS[Math.floor(Math.random() * PERSONAL_SHOPPERS.length)];

      const finalDeliveryFee = input.deliverySlot.isExpress
        ? Number((deliveryFee + input.deliverySlot.fee).toFixed(2))
        : freeDeliveryProgress.isUnlocked || appliedPromoRule?.code === 'A2UIV1'
          ? 0
          : input.deliverySlot.fee;

      const total = Number(
        Math.max(
          0,
          subtotal -
            discountAmount +
            finalDeliveryFee +
            serviceFee +
            input.tipAmount
        ).toFixed(2)
      );

      const newOrder: ActiveOrder = {
        orderId,
        store: activeStore,
        items: [...items],
        subtotal,
        deliveryFee: finalDeliveryFee,
        serviceFee,
        discountAmount,
        tipAmount: Number(input.tipAmount.toFixed(2)),
        total,
        deliveryAddress: input.aptOrSuite
          ? `${input.deliveryAddress}, ${input.aptOrSuite}`
          : input.deliveryAddress,
        deliverySlot: input.deliverySlot,
        stage: 'confirmed',
        createdAt: new Date().toISOString(),
        shopperName,
      };

      setActiveOrders((prev) => [newOrder, ...prev]);
      setAllStoreItems((prev) => ({
        ...prev,
        [activeStoreId]: [],
      }));
      setPromoCode(null);

      addToast({
        title: `Order #${orderId} Confirmed!`,
        description: `Assigned to personal shopper ${shopperName.split('·')[0].trim()}.`,
        variant: 'success',
        source: 'user',
      });

      return newOrder;
    },
    [
      deliveryFee,
      freeDeliveryProgress.isUnlocked,
      appliedPromoRule,
      subtotal,
      discountAmount,
      serviceFee,
      activeStore,
      items,
      activeStoreId,
      addToast,
    ]
  );

  const advanceOrderStage = useCallback((orderId: string) => {
    setActiveOrders((prev) =>
      prev.map((order) => {
        if (order.orderId !== orderId) return order;
        const currentIndex = ORDER_STAGE_SEQUENCE.indexOf(order.stage);
        const nextIndex = Math.min(
          ORDER_STAGE_SEQUENCE.length - 1,
          currentIndex + 1
        );
        return {
          ...order,
          stage: ORDER_STAGE_SEQUENCE[nextIndex],
        };
      })
    );
  }, []);

  const setOrderStage = useCallback((orderId: string, stage: OrderStage) => {
    setActiveOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, stage } : order
      )
    );
  }, []);

  const dismissOrder = useCallback((orderId: string) => {
    setActiveOrders((prev) => prev.filter((o) => o.orderId !== orderId));
  }, []);

  const contextValue = useMemo<CartContextValue>(
    () => ({
      items,
      allStoreItems,
      activeStoreId,
      activeStore,
      setActiveStoreId,
      totalItemCount,
      uniqueItemCount,
      getItemQuantity,
      getCartItem,
      subtotal,
      originalSubtotal,
      productSavings,
      deliveryFee,
      serviceFee,
      discountAmount,
      totalSavings,
      estimatedTotalBeforeTip,
      promoCode,
      appliedPromoRule,
      promoError,
      removePromoCode,
      freeDeliveryProgress,
      addItemToCart,
      addBundleToCart,
      swapCartItem,
      updateItemQuantity,
      setSubstitutionPreference,
      applyPromoCode,
      openCartDrawer,
      removeItemFromCart,
      updateItemNote,
      clearCart,
      seedStarterCart,
      isCartOpen,
      closeCartDrawer,
      toggleCartDrawer,
      isCheckoutOpen,
      openCheckoutModal,
      closeCheckoutModal,
      editingSubstitutionProductId,
      openSubstitutionModal,
      closeSubstitutionModal,
      onRequestOptimizeCart,
      triggerOptimizeCartWithAI,
      activeOrders,
      placeOrder,
      advanceOrderStage,
      setOrderStage,
      dismissOrder,
      toasts,
      addToast,
      dismissToast,
    }),
    [
      items,
      allStoreItems,
      activeStoreId,
      activeStore,
      setActiveStoreId,
      totalItemCount,
      uniqueItemCount,
      getItemQuantity,
      getCartItem,
      subtotal,
      originalSubtotal,
      productSavings,
      deliveryFee,
      serviceFee,
      discountAmount,
      totalSavings,
      estimatedTotalBeforeTip,
      promoCode,
      appliedPromoRule,
      promoError,
      removePromoCode,
      freeDeliveryProgress,
      addItemToCart,
      addBundleToCart,
      swapCartItem,
      updateItemQuantity,
      setSubstitutionPreference,
      applyPromoCode,
      openCartDrawer,
      removeItemFromCart,
      updateItemNote,
      clearCart,
      seedStarterCart,
      isCartOpen,
      closeCartDrawer,
      toggleCartDrawer,
      isCheckoutOpen,
      openCheckoutModal,
      closeCheckoutModal,
      editingSubstitutionProductId,
      openSubstitutionModal,
      closeSubstitutionModal,
      onRequestOptimizeCart,
      triggerOptimizeCartWithAI,
      activeOrders,
      placeOrder,
      advanceOrderStage,
      setOrderStage,
      dismissOrder,
      toasts,
      addToast,
      dismissToast,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart() must be used within a <CartProvider>.');
  }
  return ctx;
}
