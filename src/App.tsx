import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Utensils,
  ArrowLeftRight,
  Wallet,
  Terminal,
  FileWarning,
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
import { OnboardingReportModal } from './components/ai-shopper/OnboardingReportModal';
import {
  createInitialSurfaceManagerState,
  processA2UIMessage,
  processA2UIMessageBatch,
  mutateSurfaceDataModel,
  recordOutboundActionEvent,
} from './a2ui/SurfaceManager';
import { ProtocolInspectorDrawer } from './a2ui/inspector/ProtocolInspectorDrawer';

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

  // AI Personal Shopper, A2UI v1.0 Surface Manager & Inspector state
  const [isAIShopperOpen, setIsAIShopperOpen] = useState<boolean>(true);
  const [activeScenarioId, setActiveScenarioId] =
    useState<ScenarioId>('meal-planner');
  const [isProtocolInspectorOpen, setIsProtocolInspectorOpen] =
    useState<boolean>(false);
  const [inspectorSurfaceId, setInspectorSurfaceId] = useState<
    string | undefined
  >(undefined);
  const [isOnboardingReportOpen, setIsOnboardingReportOpen] =
    useState<boolean>(false);

  const [surfaceManagerState, setSurfaceManagerState] =
    useState<A2UISurfaceManagerState>(() => createInitialSurfaceManagerState());

  // Store switch handler resets aisle filter if desired while keeping search
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

  const handleInjectInspectorMessages = useCallback(
    (messages: A2UIv1Message | A2UIv1Message[], sourceLabel?: string) => {
      setSurfaceManagerState((prev) => {
        if (Array.isArray(messages)) {
          return processA2UIMessageBatch(
            prev,
            messages,
            sourceLabel ?? 'Inspector Live Inject'
          );
        }
        return processA2UIMessage(prev, messages, {
          sourceLabel: sourceLabel ?? 'Inspector Live Inject',
        });
      });
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
          'Two-Way DataBinding (updateDataModel)'
        )
      );
    },
    []
  );

  const handleClearProtocolLog = useCallback(() => {
    setSurfaceManagerState((prev) => ({
      ...prev,
      log: [],
    }));
  }, []);

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

  const handleOpenProtocolInspector = useCallback((surfaceId?: string) => {
    if (surfaceId) {
      setInspectorSurfaceId(surfaceId);
    }
    setIsProtocolInspectorOpen(true);
  }, []);

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F7F5F0] text-stone-900">
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
        onOpenProtocolInspector={() => handleOpenProtocolInspector()}
        protocolLogCount={surfaceManagerState.log.length}
        onOpenOnboardingReport={() => setIsOnboardingReportOpen(true)}
      />

      {/* Live Order Tracker Banner (renders automatically when an order is placed) */}
      <OrderTrackerBanner />

      {/* Main Content + Docked/Slide-Over AI Personal Shopper Split View */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5">
        {/* Store Switcher Pill Bar */}
        <section aria-label="Store selector" className="mb-5">
          <StoreSwitcherBar
            stores={STORES}
            activeStoreId={activeStoreId}
            onSelectStore={handleSelectStore}
          />
        </section>

        {/* Responsive Split Workspace: Storefront Left + A2UI v1.0 AI Personal Shopper Right */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Primary Storefront Column */}
          <main className="flex-1 min-w-0 w-full space-y-5">
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

            {/* A2UI v1.0 Interactive Surface Showcase Strip */}
            <section
              aria-label="A2UI v1.0 Interactive Surface Showcase"
              className="bg-white border border-emerald-200/90 rounded-2xl p-4 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#073E1E] text-white">
                    <Sparkles className="w-3.5 h-3.5 text-[#0AAD0A]" />
                    A2UI v1.0 Surface Engine
                  </span>
                  <h2 className="text-sm font-bold text-stone-900">
                    Launch an Interactive Agent-to-UI v1.0 Surface
                  </h2>
                </div>
                <span className="text-xs text-stone-500">
                  Live `@path` JSON Pointer bindings · `@call` functions · `@index` templates · `checks` validation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {/* Surface Card 1: Meal Planner */}
                <button
                  type="button"
                  onClick={() => handleLaunchScenario('meal-planner')}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isAIShopperOpen && activeScenarioId === 'meal-planner'
                      ? 'bg-emerald-50/90 border-[#0AAD0A] ring-1 ring-[#0AAD0A]/30'
                      : 'bg-stone-50/70 hover:bg-emerald-50/40 border-stone-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#073E1E]">
                      <Utensils className="w-3.5 h-3.5 text-[#0AAD0A]" />
                      1. Meal Planner Surface
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                      @path · @index
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    Scale servings (`Slider`), filter dietary (`CheckBox`), and add recipe SKU bundles to cart.
                  </p>
                </button>

                {/* Surface Card 2: Smart Cart Optimizer */}
                <button
                  type="button"
                  onClick={() => handleLaunchScenario('cart-optimizer')}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isAIShopperOpen && activeScenarioId === 'cart-optimizer'
                      ? 'bg-emerald-50/90 border-[#0AAD0A] ring-1 ring-[#0AAD0A]/30'
                      : 'bg-stone-50/70 hover:bg-emerald-50/40 border-stone-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#073E1E]">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#0AAD0A]" />
                      2. Smart Cart Swaps
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                      ProductDealCard
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    Analyzes your live cart ({totalItemCount} items) for 1-click Budget, Organic, and Low-Stock swaps.
                  </p>
                </button>

                {/* Surface Card 3: Weekly Budget Builder */}
                <button
                  type="button"
                  onClick={() => handleLaunchScenario('budget-builder')}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isAIShopperOpen && activeScenarioId === 'budget-builder'
                      ? 'bg-emerald-50/90 border-[#0AAD0A] ring-1 ring-[#0AAD0A]/30'
                      : 'bg-stone-50/70 hover:bg-emerald-50/40 border-stone-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#073E1E]">
                      <Wallet className="w-3.5 h-3.5 text-[#0AAD0A]" />
                      3. Budget &amp; Macros
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                      checks · Tabs
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    Two-way `updateDataModel` budget slider, macro summary, and client-side `checks` validation.
                  </p>
                </button>

                {/* Surface Card 4: Protocol Inspector & Onboarding Report */}
                <div className="flex flex-col justify-between p-3 rounded-xl border border-stone-200/90 bg-stone-900 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Terminal className="w-3.5 h-3.5" />
                      4. Developer Tools
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-emerald-300">
                      v1.0 JSON
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenProtocolInspector()}
                      className="flex-1 text-center text-[11px] font-semibold py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                    >
                      Protocol Inspector
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOnboardingReportOpen(true)}
                      className="flex-1 text-center text-[11px] font-semibold py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 transition-colors cursor-pointer"
                    >
                      Audit Report
                    </button>
                  </div>
                </div>
              </div>
            </section>

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

          {/* Right-Hand Docked / Responsive Slide-Over AI Personal Shopper Panel */}
          {isAIShopperOpen && (
            <aside
              aria-label="FreshCart AI Personal Shopper A2UI v1.0 Workspace"
              className="w-full lg:w-[500px] xl:w-[540px] shrink-0 lg:sticky lg:top-20"
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
                onDispatchA2UIMessage={handleDispatchA2UIMessage}
                onRecordOutboundAction={handleRecordOutboundAction}
                onEditDataModelPath={handleEditDataModelPath}
                surfaces={surfaceManagerState.surfaces}
                onOpenProtocolInspector={handleOpenProtocolInspector}
                onOpenOnboardingReport={() => setIsOnboardingReportOpen(true)}
              />
            </aside>
          )}
        </div>
      </div>

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

      {/* Live A2UI v1.0 Protocol Inspector & Playground Drawer */}
      <ProtocolInspectorDrawer
        isOpen={isProtocolInspectorOpen}
        onClose={() => setIsProtocolInspectorOpen(false)}
        surfaces={surfaceManagerState.surfaces}
        activeSurfaceId={inspectorSurfaceId}
        onSelectSurface={(surfaceId) => setInspectorSurfaceId(surfaceId)}
        protocolLog={surfaceManagerState.log}
        onInjectMessage={handleInjectInspectorMessages}
        onEditDataModelPath={handleEditDataModelPath}
        onClearLog={handleClearProtocolLog}
        onOpenOnboardingReport={() => setIsOnboardingReportOpen(true)}
      />

      {/* A2UI v1.0 Onboarding Discovery, Documentation Gaps & Bugs Modal */}
      <OnboardingReportModal
        isOpen={isOnboardingReportOpen}
        onClose={() => setIsOnboardingReportOpen(false)}
        onOpenProtocolInspector={() => {
          setIsOnboardingReportOpen(false);
          setIsProtocolInspectorOpen(true);
        }}
      />

      {/* Floating Toast Notification Stack (User & A2UI v1.0 Shopper Actions) */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all ${
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
                <div className="flex items-center gap-1.5">
                  {toast.source === 'a2ui-shopper' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#0AAD0A] text-white">
                      A2UI v1.0 Action
                    </span>
                  )}
                  <p className="text-xs font-bold truncate">{toast.title}</p>
                </div>
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
