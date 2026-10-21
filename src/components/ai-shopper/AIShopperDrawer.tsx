import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  TerminalSquare,
  FileWarning,
  X,
  CheckCircle2,
  Radio,
  Layers,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  A2UI_VERSION,
  type A2UIActionEvent,
  type A2UISurfaceManagerState,
  type A2UISurfaceState,
  type A2UIv1Message,
} from '../../types/a2ui-v1';
import type {
  CartItem,
  Product,
  ShopperActionHandler,
  StoreId,
} from '../../types/grocery';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../data/products';
import { A2UISurfaceRenderer } from '../../a2ui/A2UISurfaceRenderer';
import {
  createInitialSurfaceManagerState,
  mutateSurfaceDataModel,
  processA2UIMessage,
  recordOutboundActionEvent,
} from '../../a2ui/SurfaceManager';
import {
  MEAL_PLANNER_SURFACE_ID,
  buildMealPlannerStream,
  recalculateMealPlannerDataModel,
  swapMealIngredientInModel,
  type MealIngredientItem,
  type MealPlanStyleId,
} from '../../scenarios/mealPlannerScenario';
import {
  CART_OPTIMIZER_SURFACE_ID,
  buildCartOptimizerStream,
  markAllCartSwapsAppliedInModel,
  markCartSwapAppliedInModel,
  type CartSwapRecommendation,
} from '../../scenarios/cartOptimizerScenario';
import {
  BUDGET_BUILDER_SURFACE_ID,
  buildBudgetBuilderStream,
  recalculateBudgetBuilderDataModel,
  type BudgetBasketItem,
} from '../../scenarios/budgetBuilderScenario';
import {
  buildCompactCartContext,
  buildCompactCatalogContext,
  fetchGeminiStatus,
  generateA2UISurfaceWithGemini,
} from '../../services/geminiA2UIService';
import {
  ScenarioSelector,
  type AIEngineMode,
  type GeminiTelemetryState,
  type ScenarioId,
} from './ScenarioSelector';

export type { ScenarioId };

export interface StreamingProgressState {
  isStreaming: boolean;
  currentStepIndex: number;
  totalSteps: number;
  currentEnvelopeType:
    | 'idle'
    | 'createSurface'
    | 'updateComponents'
    | 'updateDataModel'
    | 'deleteSurface'
    | 'complete';
  streamMode: 'simulated' | 'instant';
}

export interface AIShopperDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  mode?: 'docked' | 'drawer';
  activeStoreId?: StoreId;
  storeName?: string;
  products?: Product[];
  cartItems?: CartItem[];
  actionHandler?: ShopperActionHandler;
  initialScenarioId?: ScenarioId;
  activeScenarioId?: ScenarioId;
  onScenarioChange?: (scenarioId: ScenarioId) => void;
  /** Dispatches an inbound A2UI v1.0 message into the shared SurfaceManager & Inspector log */
  onDispatchA2UIMessage?: (message: A2UIv1Message, sourceLabel?: string) => void;
  /** Records an outbound A2UIActionEvent in the Protocol Inspector log */
  onRecordOutboundAction?: (event: A2UIActionEvent) => void;
  /** Optional direct DataModel path mutation callback from App.tsx */
  onEditDataModelPath?: (
    surfaceId: string,
    path: string,
    value: unknown
  ) => void;
  /** Active surface state map from SurfaceManager (optional; falls back to internal state if omitted) */
  surfaces?: Record<string, A2UISurfaceState>;
  /** Opens the Section 3 Protocol Inspector Drawer */
  onOpenProtocolInspector?: (surfaceId?: string) => void;
  /** Opens the Section 4 Onboarding Findings Modal */
  onOpenOnboardingReport?: () => void;
}

const SCENARIO_TO_SURFACE_ID: Record<ScenarioId, string> = {
  'meal-planner': MEAL_PLANNER_SURFACE_ID,
  'cart-optimizer': CART_OPTIMIZER_SURFACE_ID,
  'budget-builder': BUDGET_BUILDER_SURFACE_ID,
};

const SCENARIO_DEFAULT_GEMINI_PROMPTS: Record<ScenarioId, string> = {
  'meal-planner':
    'Create an interactive A2UI v1.0 Meal Planner surface (surfaceId: "meal-planner-surface") for a Mediterranean Herb Salmon & Quinoa Dinner with a Servings Slider bound to {"@path": "/servings"}, dietary CheckBox toggles, NutritionSummary widget, ingredient list with swap/check controls mapped to real store SKUs, and an add_recipe_bundle_to_cart Button.',
  'cart-optimizer':
    'Analyze the user\'s live cart items and generate an A2UI v1.0 Smart Cart Optimizer surface (surfaceId: "cart-optimizer-surface") with Tabs ("All Smart Swaps", "Budget Savers", "Organic Upgrades", "Backup Protection"), custom ProductDealCard components for real store SKU swaps, savings metrics, and apply_cart_swap / apply_all_optimizations actions.',
  'budget-builder':
    'Create an interactive A2UI v1.0 Weekly Budget & Macro Nutrition Builder surface (surfaceId: "budget-nutrition-surface") with a weeklyBudget Slider ($50-$400), householdGoals ChoicePicker, maxPrepMinutes TextField with numeric validation checks, NutritionSummary widget, and a build_weekly_basket Button.',
};

function getEnvelopeKindLabel(
  msg: A2UIv1Message
): StreamingProgressState['currentEnvelopeType'] {
  if ('createSurface' in msg) return 'createSurface';
  if ('updateComponents' in msg) return 'updateComponents';
  if ('updateDataModel' in msg) return 'updateDataModel';
  if ('deleteSurface' in msg) return 'deleteSurface';
  return 'complete';
}

function inferScenarioFromPrompt(
  promptText: string,
  fallback: ScenarioId
): ScenarioId {
  const lower = promptText.toLowerCase();
  if (
    lower.includes('swap') ||
    lower.includes('cart') ||
    lower.includes('substitut') ||
    lower.includes('optimiz') ||
    lower.includes('backup')
  ) {
    return 'cart-optimizer';
  }
  if (
    lower.includes('budget') ||
    lower.includes('weekly') ||
    lower.includes('macro') ||
    lower.includes('check') ||
    lower.includes('cap') ||
    promptText.includes('$')
  ) {
    return 'budget-builder';
  }
  if (
    lower.includes('salmon') ||
    lower.includes('chicken') ||
    lower.includes('dinner') ||
    lower.includes('meal') ||
    lower.includes('recipe') ||
    lower.includes('bowl') ||
    lower.includes('serving')
  ) {
    return 'meal-planner';
  }
  return fallback;
}

export const AIShopperDrawer: React.FC<AIShopperDrawerProps> = ({
  isOpen = true,
  onClose,
  mode = 'docked',
  activeStoreId: propStoreId,
  storeName: propStoreName,
  products: propProducts,
  cartItems: propCartItems,
  actionHandler: propActionHandler,
  initialScenarioId = 'meal-planner',
  activeScenarioId: controlledScenarioId,
  onScenarioChange,
  onDispatchA2UIMessage,
  onRecordOutboundAction,
  surfaces: externalSurfaces,
  onOpenProtocolInspector,
  onOpenOnboardingReport,
}) => {
  const cartCtx = useCart();

  const effectiveStoreId = propStoreId ?? cartCtx.activeStoreId;
  const effectiveStoreName = propStoreName ?? cartCtx.activeStore.name;
  const effectiveProducts = propProducts ?? PRODUCTS;
  const effectiveCartItems = propCartItems ?? cartCtx.items;
  const effectiveActionHandler: ShopperActionHandler =
    propActionHandler ?? cartCtx;

  const [internalScenarioId, setInternalScenarioId] =
    useState<ScenarioId>(initialScenarioId);
  const activeScenarioId = controlledScenarioId ?? internalScenarioId;

  const [customSurfaceIdOverride, setCustomSurfaceIdOverride] = useState<
    string | null
  >(null);

  const [engineMode, setEngineMode] = useState<AIEngineMode>('gemini-live');
  const [geminiTelemetry, setGeminiTelemetry] = useState<GeminiTelemetryState>({
    configured: true,
    model: 'gemini-2.5-flash',
    isGenerating: false,
    error: null,
  });

  const [internalManagerState, setInternalManagerState] =
    useState<A2UISurfaceManagerState>(() => createInitialSurfaceManagerState());

  const [streamProgress, setStreamProgress] = useState<StreamingProgressState>({
    isStreaming: false,
    currentStepIndex: 0,
    totalSteps: 3,
    currentEnvelopeType: 'idle',
    streamMode: 'simulated',
  });

  const [actionBannerText, setActionBannerText] = useState<string | null>(null);
  const streamTimersRef = useRef<number[]>([]);

  const clearStreamTimers = useCallback(() => {
    for (const timerId of streamTimersRef.current) {
      window.clearTimeout(timerId);
    }
    streamTimersRef.current = [];
  }, []);

  // Check Cloudtop Gemini API status on mount
  useEffect(() => {
    let cancelled = false;
    fetchGeminiStatus().then((status) => {
      if (cancelled) return;
      setGeminiTelemetry((prev) => ({
        ...prev,
        configured: status.configured,
        model: status.model || 'gemini-2.5-flash',
        keySource: status.keySource,
      }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const dispatchMessage = useCallback(
    (message: A2UIv1Message, sourceLabel?: string) => {
      setInternalManagerState((prev) =>
        processA2UIMessage(prev, message, { sourceLabel })
      );
      onDispatchA2UIMessage?.(message, sourceLabel);
    },
    [onDispatchA2UIMessage]
  );

  const runEnvelopeStream = useCallback(
    (
      envelopes: A2UIv1Message[],
      sourcePrefix: string,
      overrideMode?: 'simulated' | 'instant'
    ) => {
      clearStreamTimers();
      const modeToUse = overrideMode ?? streamProgress.streamMode;

      if (modeToUse === 'instant' || envelopes.length <= 1) {
        envelopes.forEach((msg, idx) => {
          dispatchMessage(
            msg,
            `${sourcePrefix} [${idx + 1}/${envelopes.length}]`
          );
        });
        setStreamProgress((prev) => ({
          ...prev,
          isStreaming: false,
          currentStepIndex: envelopes.length,
          totalSteps: envelopes.length,
          currentEnvelopeType: 'complete',
        }));
        return;
      }

      setStreamProgress((prev) => ({
        ...prev,
        isStreaming: true,
        currentStepIndex: 1,
        totalSteps: envelopes.length,
        currentEnvelopeType: getEnvelopeKindLabel(envelopes[0]),
      }));
      dispatchMessage(envelopes[0], `${sourcePrefix} [1/${envelopes.length}]`);

      envelopes.slice(1).forEach((msg, idx) => {
        const stepNumber = idx + 2;
        const timerId = window.setTimeout(() => {
          dispatchMessage(
            msg,
            `${sourcePrefix} [${stepNumber}/${envelopes.length}]`
          );
          const isLast = stepNumber === envelopes.length;
          setStreamProgress((prev) => ({
            ...prev,
            isStreaming: !isLast,
            currentStepIndex: stepNumber,
            totalSteps: envelopes.length,
            currentEnvelopeType: isLast ? 'complete' : getEnvelopeKindLabel(msg),
          }));
        }, (idx + 1) * 220);
        streamTimersRef.current.push(timerId);
      });
    },
    [clearStreamTimers, dispatchMessage, streamProgress.streamMode]
  );

  const launchBlueprintScenario = useCallback(
    (
      scenarioId: ScenarioId,
      customNoteLabel?: string,
      overrideMode?: 'simulated' | 'instant'
    ) => {
      setCustomSurfaceIdOverride(null);
      setInternalScenarioId(scenarioId);
      onScenarioChange?.(scenarioId);

      if (scenarioId === 'meal-planner') {
        const packets = buildMealPlannerStream({
          products: effectiveProducts,
          activeStoreId: effectiveStoreId,
        });
        runEnvelopeStream(
          packets,
          customNoteLabel ?? 'AI Shopper · Meal Planner',
          overrideMode
        );
      } else if (scenarioId === 'cart-optimizer') {
        const packets = buildCartOptimizerStream(
          effectiveCartItems,
          effectiveProducts,
          effectiveStoreId
        );
        runEnvelopeStream(
          packets,
          customNoteLabel ?? 'AI Shopper · Cart Optimizer',
          overrideMode
        );
      } else {
        const packets = buildBudgetBuilderStream({
          products: effectiveProducts,
          activeStoreId: effectiveStoreId,
        });
        runEnvelopeStream(
          packets,
          customNoteLabel ?? 'AI Shopper · Budget Builder',
          overrideMode
        );
      }
    },
    [
      effectiveCartItems,
      effectiveProducts,
      effectiveStoreId,
      onScenarioChange,
      runEnvelopeStream,
    ]
  );

  const mergedSurfaces = externalSurfaces
    ? { ...internalManagerState.surfaces, ...externalSurfaces }
    : internalManagerState.surfaces;

  const activeSurfaceId =
    customSurfaceIdOverride ?? SCENARIO_TO_SURFACE_ID[activeScenarioId];
  const activeSurface: A2UISurfaceState | undefined =
    mergedSurfaces[activeSurfaceId];

  /**
   * Calls the live Cloudtop Gemini API (`POST /api/gemini/a2ui`) to synthesize
   * A2UI v1.0 envelopes from the user's prompt, store SKUs, and live CartContext items.
   */
  const runLiveGeminiGeneration = useCallback(
    async (
      promptText: string,
      scenarioHint: ScenarioId,
      actionEventPayload?: A2UIActionEvent
    ) => {
      const targetSurfaceId = SCENARIO_TO_SURFACE_ID[scenarioHint];
      setInternalScenarioId(scenarioHint);
      onScenarioChange?.(scenarioHint);

      setGeminiTelemetry((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
      }));

      try {
        const response = await generateA2UISurfaceWithGemini({
          prompt: promptText,
          scenarioHint,
          surfaceId: targetSurfaceId,
          activeStore: {
            id: effectiveStoreId,
            name: effectiveStoreName,
          },
          cartItems: buildCompactCartContext(effectiveCartItems),
          availableProducts: buildCompactCatalogContext(
            effectiveProducts,
            effectiveStoreId
          ),
          currentSurfaceState: mergedSurfaces[targetSurfaceId] ?? null,
          actionEvent: actionEventPayload,
        });

        setCustomSurfaceIdOverride(
          response.surfaceId !== targetSurfaceId ? response.surfaceId : null
        );

        setGeminiTelemetry((prev) => ({
          ...prev,
          configured: true,
          model: response.model,
          isGenerating: false,
          lastLatencyMs: response.latencyMs,
          lastComponentCount: response.componentCount,
          lastSummary: response.summary,
          error: null,
        }));

        runEnvelopeStream(
          response.envelopes,
          `Live Gemini (${response.model} · ${response.latencyMs}ms)`
        );

        setActionBannerText(
          response.summary
            ? `Gemini (${response.latencyMs}ms): ${response.summary}`
            : `Live Gemini (${response.model}) generated ${response.componentCount} A2UI v1.0 components in ${response.latencyMs}ms ✓`
        );
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : 'Live Gemini request failed';
        setGeminiTelemetry((prev) => ({
          ...prev,
          isGenerating: false,
          error: errMsg,
        }));
        // Graceful fallback to deterministic blueprint so UI never breaks
        launchBlueprintScenario(
          scenarioHint,
          'Fallback Blueprint (Gemini error)'
        );
      }
    },
    [
      effectiveCartItems,
      effectiveProducts,
      effectiveStoreId,
      effectiveStoreName,
      launchBlueprintScenario,
      mergedSurfaces,
      onScenarioChange,
      runEnvelopeStream,
    ]
  );

  // Sync external initialScenarioId changes when triggered from HeroBanner or CartDrawer
  const prevInitialScenarioRef = useRef<ScenarioId>(initialScenarioId);
  useEffect(() => {
    if (
      initialScenarioId &&
      initialScenarioId !== prevInitialScenarioRef.current
    ) {
      prevInitialScenarioRef.current = initialScenarioId;
      launchBlueprintScenario(initialScenarioId);
    }
  }, [initialScenarioId, launchBlueprintScenario]);

  // Initialize initial surface immediately on mount, then trigger live check
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      launchBlueprintScenario(
        activeScenarioId,
        'Initial A2UI v1.0 Surface Stream',
        'instant'
      );
    }
    return () => clearStreamTimers();
  }, [activeScenarioId, clearStreamTimers, launchBlueprintScenario]);

  // Listen for CartDrawer's "Optimize Cart with AI (A2UI v1.0)" custom event
  useEffect(() => {
    const handleOptimizeEvent = () => {
      if (engineMode === 'gemini-live') {
        void runLiveGeminiGeneration(
          SCENARIO_DEFAULT_GEMINI_PROMPTS['cart-optimizer'],
          'cart-optimizer'
        );
      } else {
        launchBlueprintScenario(
          'cart-optimizer',
          'Cart Drawer · Smart Optimizer Trigger'
        );
      }
    };
    window.addEventListener('freshcart:optimize-cart', handleOptimizeEvent);
    return () => {
      window.removeEventListener('freshcart:optimize-cart', handleOptimizeEvent);
    };
  }, [engineMode, launchBlueprintScenario, runLiveGeminiGeneration]);

  // Natural-language prompt handler: calls Live Gemini LLM when in gemini-live mode!
  const handleCustomPromptSubmit = useCallback(
    (promptText: string) => {
      const targetScenario = inferScenarioFromPrompt(
        promptText,
        activeScenarioId
      );

      if (engineMode === 'gemini-live') {
        void runLiveGeminiGeneration(promptText, targetScenario);
        return;
      }

      // Deterministic blueprint mode
      const lower = promptText.toLowerCase();
      const numMatch = promptText.match(/\$?\b(\d+)\b/);
      const parsedNum = numMatch ? Number(numMatch[1]) : undefined;

      if (targetScenario === 'cart-optimizer') {
        setInternalScenarioId('cart-optimizer');
        onScenarioChange?.('cart-optimizer');
        const packets = buildCartOptimizerStream(
          effectiveCartItems,
          effectiveProducts,
          effectiveStoreId
        );
        runEnvelopeStream(packets, `Prompt: "${promptText.slice(0, 32)}"`);
        setActionBannerText(
          `Streamed Cart Optimizer v1.0 surface for "${promptText}"`
        );
        return;
      }

      if (targetScenario === 'budget-builder') {
        setInternalScenarioId('budget-builder');
        onScenarioChange?.('budget-builder');
        const budgetCap =
          parsedNum && parsedNum >= 50 && parsedNum <= 400 ? parsedNum : 110;
        const goals: string[] = ['High-Protein'];
        if (lower.includes('organic')) goals.push('USDA Organic');
        if (lower.includes('gluten')) goals.push('Gluten-Free');
        if (lower.includes('prep') || lower.includes('quick')) {
          goals.push('Under 30-Min Prep');
        }
        const packets = buildBudgetBuilderStream({
          weeklyBudget: budgetCap,
          householdGoals: goals,
          products: effectiveProducts,
          activeStoreId: effectiveStoreId,
        });
        runEnvelopeStream(packets, `Prompt: "${promptText.slice(0, 32)}"`);
        setActionBannerText(
          `Streamed Weekly Budget & Macro v1.0 surface ($${budgetCap} budget cap)`
        );
        return;
      }

      setInternalScenarioId('meal-planner');
      onScenarioChange?.('meal-planner');
      const styleId: MealPlanStyleId =
        lower.includes('chicken') ||
        lower.includes('bowl') ||
        lower.includes('prep') ||
        lower.includes('protein')
          ? 'high-protein-bowls'
          : 'mediterranean-salmon';
      const servings =
        parsedNum && parsedNum >= 1 && parsedNum <= 12 ? parsedNum : 6;
      const organicOnly = lower.includes('organic');
      const glutenFree = !lower.includes('regular');

      const packets = buildMealPlannerStream({
        styleId,
        servings,
        organicOnly,
        glutenFree,
        products: effectiveProducts,
        activeStoreId: effectiveStoreId,
      });
      runEnvelopeStream(packets, `Prompt: "${promptText.slice(0, 32)}"`);
      setActionBannerText(
        `Streamed Meal Planner v1.0 surface (${servings} servings${
          organicOnly ? ' · 100% Organic' : ''
        })`
      );
    },
    [
      activeScenarioId,
      effectiveCartItems,
      effectiveProducts,
      effectiveStoreId,
      engineMode,
      onScenarioChange,
      runEnvelopeStream,
      runLiveGeminiGeneration,
    ]
  );

  // Handle two-way input data binding changes from <A2UISurfaceRenderer />
  const handleDataModelChange = useCallback(
    (surfaceId: string, pointerPath: string, value: unknown) => {
      const currentSurface = mergedSurfaces[surfaceId];
      if (!currentSurface) return;

      const updatedTempState = mutateSurfaceDataModel(
        {
          surfaces: { [surfaceId]: currentSurface },
          log: [],
          outboundResponses: [],
        },
        surfaceId,
        pointerPath,
        value,
        `Two-Way Input (${pointerPath})`
      );
      const nextModel =
        updatedTempState.surfaces[surfaceId]?.dataModel ??
        currentSurface.dataModel;

      if (
        surfaceId === MEAL_PLANNER_SURFACE_ID &&
        Array.isArray(nextModel.ingredients)
      ) {
        const recalculated = recalculateMealPlannerDataModel(
          nextModel,
          pointerPath,
          effectiveProducts
        );
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: recalculated,
            },
          },
          `Reactive @path Recalc (${pointerPath})`
        );
      } else if (
        surfaceId === BUDGET_BUILDER_SURFACE_ID &&
        Array.isArray(nextModel.curatedBasket)
      ) {
        const recalculated = recalculateBudgetBuilderDataModel(
          nextModel,
          pointerPath,
          effectiveProducts
        );
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: recalculated,
            },
          },
          `Reactive Budget Check (${pointerPath})`
        );
      } else {
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: pointerPath,
              value,
            },
          },
          `Two-Way Input (${pointerPath})`
        );
      }
    },
    [dispatchMessage, effectiveProducts, mergedSurfaces]
  );

  // Handle outbound A2UIActionEvent dispatches from <A2UISurfaceRenderer />
  const handleSurfaceAction = useCallback(
    (event: A2UIActionEvent) => {
      setInternalManagerState((prev) => recordOutboundActionEvent(prev, event));
      onRecordOutboundAction?.(event);

      const { name, surfaceId, context } = event.action;
      const currentSurface = mergedSurfaces[surfaceId];
      const currentModel = currentSurface?.dataModel ?? {};

      if (name === 'add_recipe_bundle_to_cart') {
        const servings = Number(context.servings ?? currentModel.servings ?? 4);
        const rawIngredients = Array.isArray(context.ingredients)
          ? (context.ingredients as MealIngredientItem[])
          : Array.isArray(currentModel.ingredients)
            ? (currentModel.ingredients as MealIngredientItem[])
            : [];

        const checkedItems = rawIngredients
          .filter((item) => item.checked !== false)
          .map((item) => ({
            productId: item.productId,
            quantity: Math.max(
              1,
              Number(item.scaledQty ?? (item as unknown as { quantity?: number }).quantity ?? 1)
            ),
          }));

        if (checkedItems.length > 0) {
          const cleanTitle = String(
            context.recipeTitle ?? currentModel.recipeTitle ?? 'AI Recipe Bundle'
          ).replace(/^#+\s*/, '');
          effectiveActionHandler.addBundleToCart(
            checkedItems,
            `${cleanTitle} (${servings} servings)`
          );

          const confirmationMsg = `Added ${checkedItems.length} scaled ingredients (${servings} servings) to FreshCart ✓`;
          setActionBannerText(confirmationMsg);

          dispatchMessage(
            {
              version: A2UI_VERSION,
              updateDataModel: {
                surfaceId,
                path: '/',
                value: {
                  ...currentModel,
                  bundleAdded: true,
                  lastActionConfirmation: confirmationMsg,
                },
              },
            },
            'AI Bridge -> Confirm Recipe Bundle Added'
          );
        }
        return;
      }

      if (name === 'swap_ingredient') {
        const idx = Number(context.index ?? 0);
        const swappedModel = swapMealIngredientInModel(
          currentModel,
          idx,
          effectiveProducts
        );
        setActionBannerText(
          String(swappedModel.lastActionConfirmation ?? 'Swapped ingredient ✓')
        );
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: swappedModel,
            },
          },
          `AI Bridge -> Swap Ingredient #${idx + 1}`
        );
        return;
      }

      if (name === 'add_pairing_item') {
        const productId = String(
          context.productId ?? 'prod-extra-virgin-olive-oil'
        );
        const qty = Number(context.quantity ?? 1);
        const title = String(context.title ?? 'Chef Pairing');
        effectiveActionHandler.addItemToCart(
          productId,
          qty,
          'Added from A2UI Meal Planner Chef Pairing'
        );
        const confirmText = `Added ${title} to Cart ✓`;
        setActionBannerText(confirmText);
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/lastActionConfirmation',
              value: confirmText,
            },
          },
          'AI Bridge -> Confirm Chef Pairing Added'
        );
        return;
      }

      if (name === 'apply_cart_swap') {
        const originalProductId = String(context.originalProductId ?? '');
        const replacementProductId = String(context.replacementProductId ?? '');
        const swapId = String(context.swapId ?? originalProductId);
        const quantity = Math.max(1, Number(context.quantity ?? 1));
        const replacementName = String(
          context.replacementName ?? 'Recommended SKU'
        );

        if (originalProductId && replacementProductId) {
          effectiveActionHandler.swapCartItem(
            originalProductId,
            replacementProductId,
            quantity
          );
        }

        const updatedModel = markCartSwapAppliedInModel(currentModel, swapId);
        setActionBannerText(`Swapped to ${replacementName} in live Cart ✓`);
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: updatedModel,
            },
          },
          `AI Bridge -> Confirm Swap (${replacementName})`
        );
        return;
      }

      if (name === 'apply_all_optimizations') {
        const rawSwaps = Array.isArray(context.swaps)
          ? (context.swaps as CartSwapRecommendation[])
          : Array.isArray(currentModel.swaps)
            ? (currentModel.swaps as CartSwapRecommendation[])
            : [];

        for (const swap of rawSwaps) {
          if (
            !swap.applied &&
            swap.originalProductId &&
            swap.replacementProductId
          ) {
            effectiveActionHandler.swapCartItem(
              swap.originalProductId,
              swap.replacementProductId,
              Math.max(1, Number(swap.quantity ?? 1))
            );
          }
        }

        const updatedModel = markAllCartSwapsAppliedInModel(currentModel);
        setActionBannerText(String(updatedModel.lastActionConfirmation));
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: updatedModel,
            },
          },
          'AI Bridge -> Confirm All Optimizations Applied'
        );
        return;
      }

      if (name === 'build_weekly_basket') {
        const rawBasket = Array.isArray(context.curatedBasket)
          ? (context.curatedBasket as BudgetBasketItem[])
          : Array.isArray(currentModel.curatedBasket)
            ? (currentModel.curatedBasket as BudgetBasketItem[])
            : [];

        const includedBundle = rawBasket
          .filter((item) => item.included !== false)
          .map((item) => ({
            productId: item.productId,
            quantity: Math.max(1, Number(item.quantity ?? 1)),
          }));

        if (includedBundle.length > 0) {
          effectiveActionHandler.addBundleToCart(
            includedBundle,
            'Weekly Macro & Budget Basket'
          );
        }

        const autoApplyPromo = Boolean(
          context.autoApplyPromo ?? currentModel.autoApplyPromo ?? true
        );
        if (autoApplyPromo) {
          effectiveActionHandler.applyPromoCode('A2UIV1');
        }

        const confirmText = `Added ${includedBundle.length} Weekly Basket SKUs to Cart${
          autoApplyPromo ? ' + Promo A2UIV1 Applied' : ''
        } ✓`;
        setActionBannerText(confirmText);

        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: {
                ...currentModel,
                basketAdded: true,
                lastActionConfirmation: confirmText,
              },
            },
          },
          'AI Bridge -> Confirm Weekly Basket Built'
        );
        return;
      }

      // Generic handler for dynamic Gemini-authored action names (e.g. add_to_cart, add_item, add_bundle, swap_item)
      if (typeof context.productId === 'string' && context.productId) {
        const qty = Math.max(1, Number(context.quantity ?? 1));
        effectiveActionHandler.addItemToCart(
          context.productId,
          qty,
          `Added from Live Gemini A2UI action (${name})`
        );
        const confirmText = `Executed "${name}" -> Added ${context.productId} (${qty}x) to Cart ✓`;
        setActionBannerText(confirmText);
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/lastActionConfirmation',
              value: confirmText,
            },
          },
          `AI Bridge -> ${name}`
        );
        return;
      }

      if (Array.isArray(context.items) || Array.isArray(context.productIds)) {
        const bundleList = Array.isArray(context.items)
          ? (
              context.items as Array<{
                productId?: string;
                id?: string;
                quantity?: number;
              }>
            )
              .map((it) => ({
                productId: String(it.productId ?? it.id ?? ''),
                quantity: Math.max(1, Number(it.quantity ?? 1)),
              }))
              .filter((it) => Boolean(it.productId))
          : (context.productIds as string[]).map((pid) => ({
              productId: String(pid),
              quantity: 1,
            }));

        if (bundleList.length > 0) {
          effectiveActionHandler.addBundleToCart(
            bundleList,
            'Live Gemini A2UI Bundle'
          );
          const confirmText = `Executed "${name}" -> Added ${bundleList.length} items to Cart ✓`;
          setActionBannerText(confirmText);
          dispatchMessage(
            {
              version: A2UI_VERSION,
              updateDataModel: {
                surfaceId,
                path: '/lastActionConfirmation',
                value: confirmText,
              },
            },
            `AI Bridge -> ${name}`
          );
        }
      }
    },
    [
      dispatchMessage,
      effectiveActionHandler,
      effectiveProducts,
      mergedSurfaces,
      onRecordOutboundAction,
    ]
  );

  if (!isOpen) return null;

  const containerClasses =
    mode === 'drawer'
      ? 'fixed inset-y-0 right-0 z-40 w-full max-w-[540px] shadow-2xl flex flex-col bg-[#FAF8F5] border-l border-stone-200'
      : 'w-full flex flex-col bg-[#FAF8F5] border border-stone-200/90 rounded-3xl shadow-sm overflow-hidden';

  return (
    <aside
      className={containerClasses}
      aria-label="FreshCart AI Personal Shopper (A2UI v1.0)"
    >
      {/* Forest Green Header */}
      <div className="bg-[#073E1E] text-white px-4 py-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#0AAD0A] flex items-center justify-center shadow-inner shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold tracking-tight truncate">
                FreshCart AI Personal Shopper
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                A2UI v1.0
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 truncate">
              Store: {effectiveStoreName} · Powered by Gemini 2.5 Flash
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenProtocolInspector && (
            <button
              type="button"
              onClick={() => onOpenProtocolInspector(activeSurfaceId)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
              title="Open Live A2UI v1.0 Protocol Inspector & JSON Playground"
            >
              <TerminalSquare className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Inspector</span>
            </button>
          )}

          {onOpenOnboardingReport && (
            <button
              type="button"
              onClick={onOpenOnboardingReport}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 transition-colors cursor-pointer"
              title="View A2UI v1.0 Onboarding Gaps & Bugs Report"
            >
              <FileWarning className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">v1.0 Audit</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI Personal Shopper"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scenario Selector, Live Gemini Bar, Prompt Chips & Custom Prompt Input */}
      <ScenarioSelector
        activeScenarioId={activeScenarioId}
        onSelectScenario={(scenId) => launchBlueprintScenario(scenId)}
        onSubmitCustomPrompt={handleCustomPromptSubmit}
        onGenerateWithLiveGemini={(scenId) => {
          const targetScen = scenId ?? activeScenarioId;
          void runLiveGeminiGeneration(
            SCENARIO_DEFAULT_GEMINI_PROMPTS[targetScen],
            targetScen
          );
        }}
        onReplayStream={() =>
          launchBlueprintScenario(
            activeScenarioId,
            'Manual Replay Stream',
            'simulated'
          )
        }
        streamMode={streamProgress.streamMode}
        onToggleStreamMode={(nextMode) =>
          setStreamProgress((prev) => ({ ...prev, streamMode: nextMode }))
        }
        engineMode={engineMode}
        onToggleEngineMode={(nextEngine) => setEngineMode(nextEngine)}
        geminiTelemetry={geminiTelemetry}
        cartItemCount={effectiveCartItems.reduce(
          (sum, i) => sum + i.quantity,
          0
        )}
        isStreaming={streamProgress.isStreaming}
      />

      {/* Real-Time A2UI v1.0 Envelope Streaming Status Strip */}
      <div className="bg-stone-900 text-stone-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Radio
            className={`w-3.5 h-3.5 ${
              streamProgress.isStreaming || geminiTelemetry.isGenerating
                ? 'text-amber-400 animate-pulse'
                : 'text-emerald-400'
            }`}
          />
          <span className="font-mono text-stone-400">surfaceId:</span>
          <span className="font-mono font-semibold text-emerald-300">
            {activeSurfaceId}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span
            className={`px-1.5 py-0.5 rounded ${
              streamProgress.currentStepIndex >= 1
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                : 'bg-stone-800 text-stone-500'
            }`}
          >
            1.createSurface
          </span>
          <span className="text-stone-600">&rarr;</span>
          <span
            className={`px-1.5 py-0.5 rounded ${
              streamProgress.currentStepIndex >= 2
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                : 'bg-stone-800 text-stone-500'
            }`}
          >
            2.updateComponents
          </span>
          <span className="text-stone-600">&rarr;</span>
          <span
            className={`px-1.5 py-0.5 rounded ${
              streamProgress.currentStepIndex >= 3
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                : 'bg-stone-800 text-stone-500'
            }`}
          >
            3.updateDataModel
          </span>
        </div>
      </div>

      {/* Live Gemini Synthesis Indicator Banner */}
      {geminiTelemetry.isGenerating && (
        <div className="bg-emerald-950 text-emerald-100 border-b border-emerald-800 px-4 py-2.5 flex items-center gap-2.5 text-xs">
          <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-white">
              Calling Cloudtop Gemini API ({geminiTelemetry.model})...
            </span>{' '}
            <span className="text-emerald-200/90">
              Synthesizing declarative A2UI v1.0 surface envelopes with live store SKUs &amp; cart context.
            </span>
          </div>
        </div>
      )}

      {/* Gemini Error Notice (if any) */}
      {geminiTelemetry.error && !geminiTelemetry.isGenerating && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Gemini notice: {geminiTelemetry.error} (rendered fallback v1.0 surface)
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              setGeminiTelemetry((prev) => ({ ...prev, error: null }))
            }
            className="text-amber-700 hover:text-amber-950"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Live Bi-Directional Action Confirmation Banner */}
      {actionBannerText && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between gap-2 text-xs text-emerald-900">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#0AAD0A] shrink-0" />
            <span>{actionBannerText}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => effectiveActionHandler.openCartDrawer()}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0AAD0A] hover:underline cursor-pointer"
            >
              <ShoppingBag className="w-3 h-3" />
              View Cart
            </button>
            <button
              type="button"
              onClick={() => setActionBannerText(null)}
              className="text-stone-400 hover:text-stone-600 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Active A2UI v1.0 Surface Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSurface ? (
          <A2UISurfaceRenderer
            surface={activeSurface}
            onAction={handleSurfaceAction}
            onDataModelChange={handleDataModelChange}
            products={effectiveProducts}
            showSurfaceBadge={true}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
            <Layers className="w-8 h-8 text-stone-400 mx-auto" />
            <div className="text-sm font-semibold text-stone-700">
              Initializing A2UI v1.0 Surface...
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
