import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';
import type {
  AisleCategory,
  DietaryTag,
  Product,
  ProductSortOption,
  StoreId,
} from './types/grocery';
import type {
  A2UIv1Message,
  A2UIActionEvent,
  A2UISurfaceManagerState,
} from './types/a2ui-v1';
import { STORES } from './data/stores';
import { PRODUCTS, getProductsByStore } from './data/products';
import { CartProvider, useCart } from './context/CartContext';
import { TopNavbar } from './components/layout/TopNavbar';
import { StoreSwitcherBar } from './components/storefront/StoreSwitcherBar';
import { HeroBanner } from './components/storefront/HeroBanner';
import { CategoryFilterBar } from './components/storefront/CategoryFilterBar';
import { ProductGrid } from './components/storefront/ProductGrid';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { SubstitutionModal } from './components/cart/SubstitutionModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderTrackerBanner } from './components/checkout/OrderTrackerBanner';
import {
  AIShopperDrawer,
  type ScenarioId,
} from './components/ai-shopper/AIShopperDrawer';
import {
  createInitialSurfaceManagerState,
  processA2UIMessage,
  mutateSurfaceDataModel,
  recordOutboundActionEvent,
} from './a2ui/SurfaceManager';

const FreshCartWorkspace: React.FC = () => {
  const cart = useCart();
  const {
    activeStoreId,
    activeStore,
    setActiveStoreId,
    items: cartItems,
    totalItemCount,
    subtotal,
    freeDeliveryProgress,
    openCartDrawer,
    closeCartDrawer,
    toasts,
    dismissToast,
  } = cart;

  // Storefront filter & modal state
  const [selectedCategory, setSelectedCategory] = useState<AisleCategory>('all');
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<DietaryTag[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<ProductSortOption>('featured');
  const [onlyOnSale, setOnlyOnSale] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // AI Personal Shopper & Surface Manager state
  const [isAIShopperOpen, setIsAIShopperOpen] = useState<boolean>(true);
  const [activeScenarioId, setActiveScenarioId] =
    useState<ScenarioId>('mcp-kitchen');

  const [surfaceManagerState, setSurfaceManagerState] =
    useState<A2UISurfaceManagerState>(() => createInitialSurfaceManagerState());

  // Store switch handler resets aisle filter while preserving search
  const handleSelectStore = useCallback(
    (storeId: StoreId) => {
      setActiveStoreId(storeId);
      setSelectedCategory('all');
    },
    [setActiveStoreId]
  );

  const handleToggleDietaryTag = useCallback((tag: DietaryTag) => {
    setSelectedDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedDietaryTags([]);
    setSearchQuery('');
    setSortBy('featured');
    setOnlyOnSale(false);
  }, []);

  // Products for the active store
  const storeProducts = useMemo(
    () => getProductsByStore(activeStoreId),
    [activeStoreId]
  );

  // Filtered count for CategoryFilterBar summary
  const filteredProductsCount = useMemo(() => {
    return storeProducts.filter((product) => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      if (
        selectedDietaryTags.length > 0 &&
        !selectedDietaryTags.every((tag) => product.dietaryTags.includes(tag))
      ) {
        return false;
      }
      if (
        onlyOnSale &&
        (!product.originalPrice || product.originalPrice <= product.price)
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesTags = product.dietaryTags.some((t) =>
          t.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesTags) {
          return false;
        }
      }
      return true;
    }).length;
  }, [
    storeProducts,
    selectedCategory,
    selectedDietaryTags,
    onlyOnSale,
    searchQuery,
  ]);

  // A2UI v1.0 message dispatchers
  const handleDispatchA2UIMessage = useCallback(
    (message: A2UIv1Message, sourceLabel?: string) => {
      setSurfaceManagerState((prev) =>
        processA2UIMessage(prev, message, { sourceLabel })
      );
    },
    []
  );

  const handleRecordOutboundAction = useCallback((event: A2UIActionEvent) => {
    setSurfaceManagerState((prev) => recordOutboundActionEvent(prev, event));
  }, []);

  const handleEditDataModelPath = useCallback(
    (surfaceId: string, pointerPath: string, value: unknown) => {
      setSurfaceManagerState((prev) =>
        mutateSurfaceDataModel(
          prev,
          surfaceId,
          pointerPath,
          value,
          'Surface State Update'
        )
      );
    },
    []
  );

  // Scenario launcher helper
  const handleLaunchScenario = useCallback(
    (scenarioId: ScenarioId) => {
      setActiveScenarioId(scenarioId);
      setIsAIShopperOpen(true);
      closeCartDrawer();
    },
    [closeCartDrawer]
  );

  // Listen for custom event from CartDrawer / CartContext ("freshcart:open-ai-shopper")
  useEffect(() => {
    const handleCustomOpenShopper = (event: Event) => {
      const customEvent = event as CustomEvent<{ scenarioId?: ScenarioId }>;
      const targetScenario =
        customEvent.detail?.scenarioId ?? 'cart-optimizer';
      setActiveScenarioId(targetScenario);
      setIsAIShopperOpen(true);
      closeCartDrawer();
    };
    window.addEventListener(
      'freshcart:open-ai-shopper',
      handleCustomOpenShopper
    );
    return () => {
      window.removeEventListener(
        'freshcart:open-ai-shopper',
        handleCustomOpenShopper
      );
    };
  }, [closeCartDrawer]);

  return (
    <div id="top" className="h-dvh overflow-hidden flex bg-[#F7F5F0] text-stone-900">
      {/* Left Independent Scrollable Storefront Column */}
      <div className="flex-1 min-w-0 h-dvh overflow-y-auto flex flex-col">
        {/* Sticky Top Navigation Bar */}
        <TopNavbar
          activeStore={activeStore}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalItemCount={totalItemCount}
          subtotal={subtotal}
          isFreeDeliveryUnlocked={freeDeliveryProgress.isUnlocked}
          amountToFreeDelivery={freeDeliveryProgress.amountRemaining}
          onOpenCart={openCartDrawer}
          isAIShopperOpen={isAIShopperOpen}
          onToggleAIShopper={() => setIsAIShopperOpen((prev) => !prev)}
          onLaunchScenario={handleLaunchScenario}
        />

        {/* Live Order Tracker Banner (renders automatically when an order is placed) */}
        <OrderTrackerBanner />

        {/* Primary Storefront Content */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
          {/* Store Switcher Pill Bar */}
          <section aria-label="Store selector">
            <StoreSwitcherBar
              stores={STORES}
              activeStoreId={activeStoreId}
              onSelectStore={handleSelectStore}
            />
          </section>

          {/* Store Promotional Hero Banner */}
          <HeroBanner
            store={activeStore}
            onLaunchAIScenario={(scenarioId) =>
              handleLaunchScenario(scenarioId)
            }
            onQuickFilterTag={(tag) => {
              if (!selectedDietaryTags.includes(tag)) {
                setSelectedDietaryTags((prev) => [...prev, tag]);
              }
            }}
          />

          {/* Category & Dietary Filter Bar */}
          <CategoryFilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedDietaryTags={selectedDietaryTags}
            onToggleDietaryTag={handleToggleDietaryTag}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onlyOnSale={onlyOnSale}
            onToggleOnSale={() => setOnlyOnSale((prev) => !prev)}
            onClearFilters={handleClearFilters}
            totalMatchingCount={filteredProductsCount}
          />

          {/* Storefront Product Catalog Grid */}
          <ProductGrid
            products={storeProducts}
            selectedCategory={selectedCategory}
            selectedDietaryTags={selectedDietaryTags}
            searchQuery={searchQuery}
            sortBy={sortBy}
            onlyOnSale={onlyOnSale}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onResetFilters={handleClearFilters}
            onLaunchAIScenario={(scenarioId) =>
              handleLaunchScenario(scenarioId)
            }
          />
        </main>
      </div>

      {/* Full-Viewport-Height Right Side Panel for AI Personal Shopper Chat */}
      {isAIShopperOpen && (
        <aside
          aria-label="FreshCart AI Personal Shopper"
          className="fixed inset-y-0 right-0 z-40 w-full sm:w-[440px] lg:static lg:z-auto lg:w-[440px] xl:w-[480px] shrink-0 h-dvh border-l border-stone-200/90 bg-[#FAF8F5] shadow-2xl lg:shadow-none"
        >
          <AIShopperDrawer
            isOpen={isAIShopperOpen}
            onClose={() => setIsAIShopperOpen(false)}
            activeStoreId={activeStoreId}
            storeName={activeStore.name}
            products={PRODUCTS}
            cartItems={cartItems}
            actionHandler={cart}
            initialScenarioId={activeScenarioId}
            activeScenarioId={activeScenarioId}
            onScenarioChange={setActiveScenarioId}
            onDispatchA2UIMessage={handleDispatchA2UIMessage}
            onRecordOutboundAction={handleRecordOutboundAction}
            onEditDataModelPath={handleEditDataModelPath}
            surfaces={surfaceManagerState.surfaces}
          />
        </aside>
      )}

      {/* Product Detail Modal (Nutrition Facts & Smart Alternatives) */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onSelectRelatedProduct={(related) => setSelectedProduct(related)}
      />

      {/* Slide-Over Cart Drawer */}
      <CartDrawer
        onOptimizeCartWithAI={() => handleLaunchScenario('cart-optimizer')}
      />

      {/* Per-Item Substitution Preference Modal */}
      <SubstitutionModal />

      {/* Multi-Step Checkout Modal */}
      <CheckoutModal />

      {/* Floating Toast Notification Stack */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-lg border backdrop-blur-md transition-all ${
                toast.source === 'a2ui-shopper'
                  ? 'bg-[#073E1E]/95 text-white border-emerald-500/40'
                  : toast.variant === 'warning'
                  ? 'bg-amber-950/95 text-amber-50 border-amber-500/40'
                  : 'bg-stone-900/95 text-white border-stone-700'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {toast.source === 'a2ui-shopper' ? (
                  <Sparkles className="w-4 h-4 text-[#0AAD0A]" />
                ) : toast.variant === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : toast.variant === 'info' ? (
                  <Info className="w-4 h-4 text-sky-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#0AAD0A]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-stone-200/90 mt-0.5 leading-snug">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-stone-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CartProvider>
      <FreshCartWorkspace />
    </CartProvider>
  );
};

export default App;
