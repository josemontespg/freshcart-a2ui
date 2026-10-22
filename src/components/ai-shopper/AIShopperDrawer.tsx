import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Radio,
  Layers,
  Play,
  Terminal,
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
  buildMealPlannerStream,
  recalculateMealPlannerDataModel,
  swapMealIngredientInModel,
  type MealIngredientItem,
  type MealPlanStyleId,
} from '../../scenarios/mealPlannerScenario';
import {
  buildCartOptimizerStream,
  markAllCartSwapsAppliedInModel,
  markCartSwapAppliedInModel,
  type CartSwapRecommendation,
} from '../../scenarios/cartOptimizerScenario';
import {
  buildBudgetBuilderStream,
  recalculateBudgetBuilderDataModel,
  type BudgetBasketItem,
} from '../../scenarios/budgetBuilderScenario';
import {
  buildCompactCartContext,
  buildCompactCatalogContext,
  sliceClientEnvelopesForStreaming,
  streamA2UISurfaceWithGemini,
  type DirectJsonDeliveryMode,
} from '../../services/geminiA2UIService';
import {
  QUICK_PROMPT_CHIPS,
  type ScenarioId,
} from './ScenarioSelector';

export type { ScenarioId };

export interface SurfaceStreamTelemetry {
  surfaceId: string;
  deliveryMode: DirectJsonDeliveryMode;
  isStreaming: boolean;
  currentStep: number;
  totalSteps: number;
  currentStage: 'createSurface' | 'updateComponents' | 'updateDataModel';
  stageLabel: string;
  elapsedMs: number;
  tokenChars?: number;
}

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  surfaceId?: string;
  scenarioHint?: ScenarioId;
  promptUsed?: string;
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
  onDispatchA2UIMessage?: (message: A2UIv1Message, sourceLabel?: string) => void;
  onRecordOutboundAction?: (event: A2UIActionEvent) => void;
  onEditDataModelPath?: (
    surfaceId: string,
    path: string,
    value: unknown
  ) => void;
  surfaces?: Record<string, A2UISurfaceState>;
  onOpenProtocolInspector?: (surfaceId?: string) => void;
  onOpenOnboardingReport?: () => void;
}

const SCENARIO_USER_PROMPTS: Record<ScenarioId, string> = {
  'meal-planner': 'Plan tonight’s dinner for 4 with fresh ingredients',
  'cart-optimizer': 'Find smart savings and backups for items in my cart',
  'budget-builder': 'Build a $120 weekly high-protein grocery plan',
};

const SCENARIO_ASSISTANT_INTROS: Record<ScenarioId, string> = {
  'meal-planner':
    'Here is a chef-curated dinner plan you can customize by servings and dietary preferences:',
  'cart-optimizer':
    'I checked your cart against store inventory and found these smart swaps and backups:',
  'budget-builder':
    'Here is a customizable weekly budget and nutrition plan tailored for your kitchen:',
};

function rewriteEnvelopesSurfaceId(
  envelopes: A2UIv1Message[],
  targetSurfaceId: string
): A2UIv1Message[] {
  return envelopes.map((msg) => {
    if ('createSurface' in msg && msg.createSurface) {
      return {
        ...msg,
        createSurface: {
          ...msg.createSurface,
          surfaceId: targetSurfaceId,
        },
      };
    }
    if ('updateComponents' in msg && msg.updateComponents) {
      return {
        ...msg,
        updateComponents: {
          ...msg.updateComponents,
          surfaceId: targetSurfaceId,
        },
      };
    }
    if ('updateDataModel' in msg && msg.updateDataModel) {
      return {
        ...msg,
        updateDataModel: {
          ...msg.updateDataModel,
          surfaceId: targetSurfaceId,
        },
      };
    }
    if ('deleteSurface' in msg && msg.deleteSurface) {
      return {
        ...msg,
        deleteSurface: {
          ...msg.deleteSurface,
          surfaceId: targetSurfaceId,
        },
      };
    }
    return msg;
  });
}

function inferScenarioFromPrompt(
  promptText: string,
  fallback: ScenarioId = 'meal-planner'
): ScenarioId {
  const lower = promptText.toLowerCase();
  if (
    lower.includes('swap') ||
    lower.includes('cart') ||
    lower.includes('sav') ||
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
    lower.includes('plan for the week') ||
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
}) => {
  const cartCtx = useCart();

  const effectiveStoreId = propStoreId ?? cartCtx.activeStoreId;
  const effectiveStoreName = propStoreName ?? cartCtx.activeStore.name;
  const effectiveProducts = propProducts ?? PRODUCTS;
  const effectiveCartItems = propCartItems ?? cartCtx.items;
  const effectiveActionHandler: ShopperActionHandler =
    propActionHandler ?? cartCtx;

  const [internalManagerState, setInternalManagerState] =
    useState<A2UISurfaceManagerState>(() => createInitialSurfaceManagerState());

  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [deliveryMode, setDeliveryMode] =
    useState<DirectJsonDeliveryMode>('progressive-sse');
  const [streamTelemetryBySurface, setStreamTelemetryBySurface] = useState<
    Record<string, SurfaceStreamTelemetry>
  >({});

  const turnCounterRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const dispatchMessage = useCallback(
    (message: A2UIv1Message, sourceLabel?: string) => {
      setInternalManagerState((prev) =>
        processA2UIMessage(prev, message, { sourceLabel })
      );
      onDispatchA2UIMessage?.(message, sourceLabel);
    },
    [onDispatchA2UIMessage]
  );

  const buildFallbackEnvelopesForPrompt = useCallback(
    (promptText: string, scenarioHint: ScenarioId): A2UIv1Message[] => {
      const lower = promptText.toLowerCase();
      const numMatch = promptText.match(/\$?\b(\d+)\b/);
      const parsedNum = numMatch ? Number(numMatch[1]) : undefined;

      if (scenarioHint === 'cart-optimizer') {
        return buildCartOptimizerStream(
          effectiveCartItems,
          effectiveProducts,
          effectiveStoreId
        );
      }

      if (scenarioHint === 'budget-builder') {
        const budgetCap =
          parsedNum && parsedNum >= 50 && parsedNum <= 400 ? parsedNum : 120;
        const goals: string[] = ['High-Protein'];
        if (lower.includes('organic')) goals.push('USDA Organic');
        if (lower.includes('gluten')) goals.push('Gluten-Free');
        if (lower.includes('prep') || lower.includes('quick')) {
          goals.push('Under 30-Min Prep');
        }
        return buildBudgetBuilderStream({
          weeklyBudget: budgetCap,
          householdGoals: goals,
          products: effectiveProducts,
          activeStoreId: effectiveStoreId,
        });
      }

      const styleId: MealPlanStyleId =
        lower.includes('chicken') ||
        lower.includes('bowl') ||
        lower.includes('prep') ||
        lower.includes('protein')
          ? 'high-protein-bowls'
          : 'mediterranean-salmon';
      const servings =
        parsedNum && parsedNum >= 1 && parsedNum <= 12 ? parsedNum : 4;
      const organicOnly = lower.includes('organic');
      const glutenFree = !lower.includes('regular');

      return buildMealPlannerStream({
        styleId,
        servings,
        organicOnly,
        glutenFree,
        products: effectiveProducts,
        activeStoreId: effectiveStoreId,
      });
    },
    [effectiveCartItems, effectiveProducts, effectiveStoreId]
  );

  const mergedSurfaces = externalSurfaces
    ? { ...internalManagerState.surfaces, ...externalSurfaces }
    : internalManagerState.surfaces;

  // Scroll to bottom when turns or streaming updates change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatTurns.length, isGenerating]);

  // Execute a real SSE stream (or client-side progressive fallback) for a target surfaceId
  const executeSurfaceStream = useCallback(
    async (options: {
      surfaceId: string;
      promptText: string;
      scenarioHint: ScenarioId;
      modeOverride?: DirectJsonDeliveryMode;
      preferBlueprintStream?: boolean;
      assistantTurnId?: string;
    }) => {
      const {
        surfaceId,
        promptText,
        scenarioHint,
        modeOverride,
        preferBlueprintStream = false,
        assistantTurnId,
      } = options;
      const activeMode = modeOverride ?? deliveryMode;
      const startedAt = performance.now();

      const blueprintEnvelopes = rewriteEnvelopesSurfaceId(
        buildFallbackEnvelopesForPrompt(promptText, scenarioHint),
        surfaceId
      );

      setIsGenerating(true);
      setStreamTelemetryBySurface((prev) => ({
        ...prev,
        [surfaceId]: {
          surfaceId,
          deliveryMode: activeMode,
          isStreaming: true,
          currentStep: 0,
          totalSteps: activeMode === 'single-shot-direct-json' ? 1 : 10,
          currentStage: 'createSurface',
          stageLabel:
            activeMode === 'single-shot-direct-json'
              ? 'Dispatching Single-Shot createSurface (inline components + dataModel)...'
              : 'Opening SSE Direct JSON stream (/api/gemini/a2ui-stream)...',
          elapsedMs: 0,
        },
      }));

      try {
        const doneEvent = await streamA2UISurfaceWithGemini(
          {
            prompt: promptText,
            scenarioHint,
            surfaceId,
            deliveryMode: activeMode,
            chunkDelayMs: activeMode === 'single-shot-direct-json' ? 0 : 115,
            preferBlueprintStream,
            clientEnvelopes: preferBlueprintStream ? blueprintEnvelopes : undefined,
            summary: SCENARIO_ASSISTANT_INTROS[scenarioHint],
            activeStore: {
              id: effectiveStoreId,
              name: effectiveStoreName,
            },
            cartItems: buildCompactCartContext(effectiveCartItems),
            availableProducts: buildCompactCatalogContext(
              effectiveProducts,
              effectiveStoreId
            ),
          },
          {
            onTokenProgress: (prog) => {
              setStreamTelemetryBySurface((prev) => {
                const cur = prev[surfaceId];
                if (!cur) return prev;
                return {
                  ...prev,
                  [surfaceId]: {
                    ...cur,
                    tokenChars: prog.accumulatedChars,
                    stageLabel: `Streaming Gemini Direct JSON tokens (${prog.accumulatedChars} chars)...`,
                    elapsedMs: prog.elapsedMs,
                  },
                };
              });
            },
            onEnvelope: (stageEvt) => {
              dispatchMessage(
                stageEvt.envelope,
                `SSE ${stageEvt.stage} [${stageEvt.index}/${stageEvt.total}] — ${stageEvt.label}`
              );
              setStreamTelemetryBySurface((prev) => ({
                ...prev,
                [surfaceId]: {
                  surfaceId,
                  deliveryMode: stageEvt.deliveryMode,
                  isStreaming: stageEvt.index < stageEvt.total,
                  currentStep: stageEvt.index,
                  totalSteps: stageEvt.total,
                  currentStage: stageEvt.stage,
                  stageLabel: stageEvt.label,
                  elapsedMs: stageEvt.elapsedMs,
                },
              }));
            },
          }
        );

        if (assistantTurnId && doneEvent.summary) {
          setChatTurns((prev) =>
            prev.map((t) =>
              t.id === assistantTurnId ? { ...t, text: doneEvent.summary } : t
            )
          );
        }

        setStreamTelemetryBySurface((prev) => {
          const cur = prev[surfaceId];
          return {
            ...prev,
            [surfaceId]: {
              surfaceId,
              deliveryMode: doneEvent.deliveryMode,
              isStreaming: false,
              currentStep: doneEvent.totalEnvelopes,
              totalSteps: doneEvent.totalEnvelopes,
              currentStage: cur?.currentStage ?? 'updateDataModel',
              stageLabel:
                doneEvent.deliveryMode === 'single-shot-direct-json'
                  ? 'Delivered via Single-Shot createSurface (inline components + dataModel)'
                  : `Streamed ${doneEvent.totalEnvelopes} A2UI v1.0 Direct JSON envelopes over SSE`,
              elapsedMs: doneEvent.latencyMs,
            },
          };
        });
      } catch {
        // Fallback: progressively slice & stream client-side if offline
        const packets = sliceClientEnvelopesForStreaming(
          blueprintEnvelopes,
          surfaceId,
          activeMode
        );
        for (let i = 0; i < packets.length; i++) {
          const pkt = packets[i];
          dispatchMessage(
            pkt.envelope,
            `Direct JSON ${pkt.stage} [${i + 1}/${packets.length}] — ${pkt.label}`
          );
          const elapsed = Math.round(performance.now() - startedAt);
          setStreamTelemetryBySurface((prev) => ({
            ...prev,
            [surfaceId]: {
              surfaceId,
              deliveryMode: activeMode,
              isStreaming: i < packets.length - 1,
              currentStep: i + 1,
              totalSteps: packets.length,
              currentStage: pkt.stage,
              stageLabel: pkt.label,
              elapsedMs: elapsed,
            },
          }));
          if (i < packets.length - 1 && activeMode === 'progressive-sse') {
            await sleep(110);
          }
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [
      buildFallbackEnvelopesForPrompt,
      deliveryMode,
      dispatchMessage,
      effectiveCartItems,
      effectiveProducts,
      effectiveStoreId,
      effectiveStoreName,
    ]
  );

  // Seed initial welcome assistant turn with an interactive surface on mount
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialScen = controlledScenarioId ?? initialScenarioId;
    turnCounterRef.current += 1;
    const initSurfaceId = `chat_surface_${turnCounterRef.current}`;
    const promptText = SCENARIO_USER_PROMPTS[initialScen];
    const envelopes = buildFallbackEnvelopesForPrompt(promptText, initialScen);
    const sliced = sliceClientEnvelopesForStreaming(
      envelopes,
      initSurfaceId,
      'progressive-sse'
    );
    sliced.forEach((pkt, idx) => {
      dispatchMessage(
        pkt.envelope,
        `Initial Stream [${idx + 1}/${sliced.length}] — ${pkt.label}`
      );
    });

    setStreamTelemetryBySurface({
      [initSurfaceId]: {
        surfaceId: initSurfaceId,
        deliveryMode: 'progressive-sse',
        isStreaming: false,
        currentStep: sliced.length,
        totalSteps: sliced.length,
        currentStage: 'updateDataModel',
        stageLabel: `Streamed ${sliced.length} A2UI v1.0 Direct JSON envelopes (createSurface → updateComponents → updateDataModel)`,
        elapsedMs: 140,
      },
    });

    setChatTurns([
      {
        id: `turn_${turnCounterRef.current}`,
        role: 'assistant',
        text: `Hi! I'm your AI Personal Shopper for ${effectiveStoreName}. Ask a question or click any suggestion pill below to watch A2UI v1.0 surfaces stream progressively in real time.`,
        surfaceId: initSurfaceId,
        scenarioHint: initialScen,
        promptUsed: promptText,
      },
    ]);
  }, [
    buildFallbackEnvelopesForPrompt,
    controlledScenarioId,
    dispatchMessage,
    effectiveStoreName,
    initialScenarioId,
  ]);

  const sendUserMessage = useCallback(
    async (
      userText: string,
      explicitScenario?: ScenarioId,
      preferBlueprintStream = false,
      modeOverride?: DirectJsonDeliveryMode
    ) => {
      const trimmed = userText.trim();
      if (!trimmed || isGenerating) return;

      const scenarioHint =
        explicitScenario ?? inferScenarioFromPrompt(trimmed, 'meal-planner');
      onScenarioChange?.(scenarioHint);

      turnCounterRef.current += 1;
      const userTurnId = `turn_${turnCounterRef.current}`;
      turnCounterRef.current += 1;
      const assistantTurnNum = turnCounterRef.current;
      const assistantTurnId = `turn_${assistantTurnNum}`;
      const surfaceId = `chat_surface_${assistantTurnNum}`;

      // Mount both the user message and the assistant turn immediately so the
      // surface renders progressively in real time inside the assistant bubble!
      setChatTurns((prev) => [
        ...prev,
        {
          id: userTurnId,
          role: 'user',
          text: trimmed,
        },
        {
          id: assistantTurnId,
          role: 'assistant',
          text: SCENARIO_ASSISTANT_INTROS[scenarioHint],
          surfaceId,
          scenarioHint,
          promptUsed: trimmed,
        },
      ]);

      await executeSurfaceStream({
        surfaceId,
        promptText: trimmed,
        scenarioHint,
        modeOverride,
        preferBlueprintStream,
        assistantTurnId,
      });
    },
    [executeSurfaceStream, isGenerating, onScenarioChange]
  );

  const handleReplaySurface = useCallback(
    (
      surfaceId: string,
      scenarioHint: ScenarioId = 'meal-planner',
      promptUsed?: string,
      modeOverride?: DirectJsonDeliveryMode
    ) => {
      if (isGenerating) return;
      const promptText = promptUsed || SCENARIO_USER_PROMPTS[scenarioHint];
      // Delete existing surface first so user watches it build from scratch
      dispatchMessage(
        {
          version: A2UI_VERSION,
          deleteSurface: { surfaceId },
        },
        `Reset ${surfaceId} for Replay`
      );
      void executeSurfaceStream({
        surfaceId,
        promptText,
        scenarioHint,
        modeOverride,
        preferBlueprintStream: true,
      });
    },
    [dispatchMessage, executeSurfaceStream, isGenerating]
  );

  // Sync external scenario launches from HeroBanner or TopNavbar
  const prevControlledScenarioRef = useRef<ScenarioId | undefined>(
    controlledScenarioId ?? initialScenarioId
  );
  useEffect(() => {
    const incoming = controlledScenarioId ?? initialScenarioId;
    if (incoming && incoming !== prevControlledScenarioRef.current) {
      prevControlledScenarioRef.current = incoming;
      void sendUserMessage(SCENARIO_USER_PROMPTS[incoming], incoming, true);
    }
  }, [controlledScenarioId, initialScenarioId, sendUserMessage]);

  // Listen for CartDrawer's Smart Cart Savings trigger event
  useEffect(() => {
    const handleOptimizeEvent = () => {
      void sendUserMessage(
        SCENARIO_USER_PROMPTS['cart-optimizer'],
        'cart-optimizer',
        true
      );
    };
    window.addEventListener('freshcart:optimize-cart', handleOptimizeEvent);
    return () => {
      window.removeEventListener('freshcart:optimize-cart', handleOptimizeEvent);
    };
  }, [sendUserMessage]);

  const handleResetChat = useCallback(() => {
    turnCounterRef.current += 1;
    const resetSurfaceId = `chat_surface_${turnCounterRef.current}`;
    const promptText = SCENARIO_USER_PROMPTS['meal-planner'];
    setChatTurns([
      {
        id: `turn_${turnCounterRef.current}`,
        role: 'assistant',
        text: `Hi! I'm your AI Personal Shopper for ${effectiveStoreName}. Watch this dinner plan stream progressively via A2UI v1.0 Direct JSON:`,
        surfaceId: resetSurfaceId,
        scenarioHint: 'meal-planner',
        promptUsed: promptText,
      },
    ]);
    void executeSurfaceStream({
      surfaceId: resetSurfaceId,
      promptText,
      scenarioHint: 'meal-planner',
      preferBlueprintStream: true,
    });
  }, [effectiveStoreName, executeSurfaceStream]);

  // Handle two-way input data binding changes on any surface in the chat thread
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
        `Input (${pointerPath})`
      );
      const nextModel =
        updatedTempState.surfaces[surfaceId]?.dataModel ??
        currentSurface.dataModel;

      if (Array.isArray(nextModel.ingredients)) {
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
          `Recipe Recalculation (${pointerPath})`
        );
      } else if (Array.isArray(nextModel.curatedBasket)) {
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
          `Budget Recalculation (${pointerPath})`
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
          `Input (${pointerPath})`
        );
      }
    },
    [dispatchMessage, effectiveProducts, mergedSurfaces]
  );

  // Handle outbound A2UIActionEvent dispatches from any surface in the chat thread
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
            : Array.isArray(context.items)
              ? (context.items as MealIngredientItem[])
              : [];

        const checkedItems = rawIngredients
          .filter((item) => item.checked !== false)
          .map((item) => ({
            productId: item.productId,
            quantity: Math.max(
              1,
              Number(
                item.scaledQty ??
                  (item as unknown as { quantity?: number }).quantity ??
                  1
              )
            ),
          }));

        if (checkedItems.length > 0) {
          const cleanTitle = String(
            context.recipeTitle ?? currentModel.recipeTitle ?? 'Recipe Bundle'
          ).replace(/^#+\s*/, '');
          effectiveActionHandler.addBundleToCart(
            checkedItems,
            `${cleanTitle} (${servings} servings)`
          );

          const confirmationMsg = `Added ${checkedItems.length} ingredients (${servings} servings) to your cart ✓`;
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
                  statusBanner: confirmationMsg,
                },
              },
            },
            'Recipe Bundle Added'
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
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: swappedModel,
            },
          },
          `Swap Ingredient #${idx + 1}`
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
          'Added from AI Personal Shopper'
        );
        const confirmText = `Added ${title} to your cart ✓`;
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/lastActionConfirmation',
              value: confirmText,
            },
          },
          'Chef Pairing Added'
        );
        return;
      }

      if (name === 'apply_cart_swap') {
        const originalProductId = String(context.originalProductId ?? '');
        const replacementProductId = String(context.replacementProductId ?? '');
        const swapId = String(context.swapId ?? originalProductId);
        const quantity = Math.max(1, Number(context.quantity ?? 1));
        const replacementName = String(
          context.replacementName ?? 'Recommended Item'
        );

        if (originalProductId && replacementProductId) {
          effectiveActionHandler.swapCartItem(
            originalProductId,
            replacementProductId,
            quantity
          );
        }

        const updatedModel = markCartSwapAppliedInModel(currentModel, swapId);
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: updatedModel,
            },
          },
          `Cart Swap (${replacementName})`
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
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: updatedModel,
            },
          },
          'All Cart Optimizations Applied'
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
            'Weekly Grocery Basket'
          );
        }

        const autoApplyPromo = Boolean(
          context.autoApplyPromo ?? currentModel.autoApplyPromo ?? true
        );
        if (autoApplyPromo) {
          effectiveActionHandler.applyPromoCode('A2UIV1');
        }

        const confirmText = `Added ${includedBundle.length} weekly essentials to your cart${
          autoApplyPromo ? ' + $10 savings applied' : ''
        } ✓`;

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
                statusBanner: confirmText,
              },
            },
          },
          'Weekly Basket Added'
        );
        return;
      }

      // Generic handler for dynamic Gemini-authored action names
      if (typeof context.productId === 'string' && context.productId) {
        const qty = Math.max(1, Number(context.quantity ?? 1));
        effectiveActionHandler.addItemToCart(
          context.productId,
          qty,
          'Added from AI Personal Shopper'
        );
        const matchedProd = effectiveProducts.find(
          (p) => p.id === context.productId
        );
        const itemLabel = matchedProd?.name ?? 'item';
        const confirmText = `Added ${itemLabel} to your cart ✓`;
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/lastActionConfirmation',
              value: confirmText,
            },
          },
          name
        );
        return;
      }

      if (
        Array.isArray(context.items) ||
        Array.isArray(context.productIds) ||
        Array.isArray(context.recommendedProductIds)
      ) {
        const rawIds =
          (context.productIds as string[] | undefined) ??
          (context.recommendedProductIds as string[] | undefined);
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
          : (rawIds ?? []).map((pid) => ({
              productId: String(pid),
              quantity: 1,
            }));

        if (bundleList.length > 0) {
          effectiveActionHandler.addBundleToCart(
            bundleList,
            'AI Shopper Picks'
          );
          const confirmText = `Added ${bundleList.length} items to your cart ✓`;
          dispatchMessage(
            {
              version: A2UI_VERSION,
              updateDataModel: {
                surfaceId,
                path: '/lastActionConfirmation',
                value: confirmText,
              },
            },
            name
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;
    const text = inputValue;
    setInputValue('');
    void sendUserMessage(text);
  };

  if (!isOpen) return null;

  const containerClasses =
    mode === 'drawer'
      ? 'fixed inset-y-0 right-0 z-40 w-full max-w-[500px] h-dvh shadow-2xl flex flex-col bg-[#FAF8F5] border-l border-stone-200/80 overflow-hidden'
      : 'h-full w-full flex flex-col bg-[#FAF8F5] overflow-hidden';

  return (
    <aside className={containerClasses} aria-label="AI Personal Shopper Chat">
      {/* Chat Header + Direct JSON Streaming Mode Selector */}
      <div className="bg-white border-b border-stone-200/80 px-4 py-3 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0AAD0A] flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-stone-900 truncate">
                  AI Personal Shopper
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  <Radio className="w-2.5 h-2.5 text-[#0AAD0A]" />
                  Direct JSON Stream
                </span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">
                {effectiveStoreName} · A2UI v1.0 Live SSE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onOpenProtocolInspector && (
              <button
                type="button"
                onClick={() => onOpenProtocolInspector()}
                title="Open A2UI v1.0 Protocol Inspector"
                aria-label="Open A2UI v1.0 Protocol Inspector"
                className="p-2 rounded-full text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleResetChat}
              title="Replay initial stream"
              aria-label="Replay initial stream"
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close AI Personal Shopper"
                className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Direct JSON Delivery Mode Toggle Bar (Feature 10 Showcase) */}
        <div
          className="flex items-center justify-between gap-2 bg-stone-100/90 p-1 rounded-xl border border-stone-200/70"
          role="group"
          aria-label="A2UI v1.0 Direct JSON Delivery Mode"
        >
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => setDeliveryMode('progressive-sse')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
              deliveryMode === 'progressive-sse'
                ? 'bg-white text-emerald-900 shadow-2xs border border-emerald-200/80'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Radio className="w-3 h-3 text-[#0AAD0A]" />
            <span>Progressive SSE Stream</span>
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => setDeliveryMode('single-shot-direct-json')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
              deliveryMode === 'single-shot-direct-json'
                ? 'bg-white text-emerald-900 shadow-2xs border border-emerald-200/80'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3 h-3 text-amber-600" />
            <span>Single-Shot createSurface</span>
          </button>
        </div>
      </div>

      {/* Scrollable Chat Thread */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-5">
        {chatTurns.map((turn) => {
          if (turn.role === 'user') {
            return (
              <div key={turn.id} className="flex justify-end">
                <div className="bg-[#0AAD0A] text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-xs shadow-2xs max-w-[85%] leading-relaxed">
                  {turn.text}
                </div>
              </div>
            );
          }

          const surfaceState = turn.surfaceId
            ? mergedSurfaces[turn.surfaceId]
            : undefined;
          const telemetry = turn.surfaceId
            ? streamTelemetryBySurface[turn.surfaceId]
            : undefined;
          const componentCount = surfaceState
            ? Object.keys(surfaceState.componentsById).length
            : 0;
          const progressPct =
            telemetry && telemetry.totalSteps > 0
              ? Math.min(
                  100,
                  Math.round((telemetry.currentStep / telemetry.totalSteps) * 100)
                )
              : 100;

          return (
            <div key={turn.id} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#0AAD0A] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                {turn.text && (
                  <div className="bg-white border border-stone-200/80 text-stone-800 text-sm px-4 py-2.5 rounded-2xl rounded-tl-xs shadow-2xs leading-relaxed">
                    {turn.text}
                  </div>
                )}

                {/* Live Direct JSON Streaming Status & Replay Card */}
                {turn.surfaceId && telemetry && (
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/55 px-3.5 py-2.5 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            telemetry.isStreaming
                              ? 'bg-[#0AAD0A] animate-ping'
                              : 'bg-[#0AAD0A]'
                          }`}
                        />
                        <span className="text-[11px] font-bold text-emerald-950 truncate">
                          {telemetry.deliveryMode === 'single-shot-direct-json'
                            ? 'A2UI v1.0 Single-Shot createSurface'
                            : telemetry.isStreaming
                              ? `Streaming Direct JSON (${telemetry.currentStep}/${telemetry.totalSteps})`
                              : `Progressive SSE Direct JSON (${telemetry.totalSteps} envelopes)`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-medium text-stone-600 bg-white/90 px-2 py-0.5 rounded-full border border-stone-200/80">
                          {componentCount} nodes · {telemetry.elapsedMs}ms
                        </span>
                        <button
                          type="button"
                          disabled={isGenerating}
                          onClick={() =>
                            handleReplaySurface(
                              turn.surfaceId!,
                              turn.scenarioHint ?? 'meal-planner',
                              turn.promptUsed,
                              'progressive-sse'
                            )
                          }
                          title="Watch this surface stream progressively again"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0AAD0A] hover:bg-[#089208] disabled:opacity-50 text-white transition-colors cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Replay Stream</span>
                        </button>
                        <button
                          type="button"
                          disabled={isGenerating}
                          onClick={() =>
                            handleReplaySurface(
                              turn.surfaceId!,
                              turn.scenarioHint ?? 'meal-planner',
                              turn.promptUsed,
                              telemetry.deliveryMode === 'single-shot-direct-json'
                                ? 'progressive-sse'
                                : 'single-shot-direct-json'
                            )
                          }
                          title="Compare Single-Shot createSurface vs Progressive SSE"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white hover:bg-stone-100 disabled:opacity-50 text-stone-700 border border-stone-200/90 transition-colors cursor-pointer"
                        >
                          {telemetry.deliveryMode === 'single-shot-direct-json'
                            ? 'Try Progressive'
                            : 'Try Single-Shot'}
                        </button>
                      </div>
                    </div>

                    {/* Progress bar + live envelope stage label */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-emerald-200/60 overflow-hidden">
                        <div
                          className="h-full bg-[#0AAD0A] transition-all duration-200 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-emerald-900/90 truncate">
                        {telemetry.stageLabel}
                      </p>
                    </div>
                  </div>
                )}

                {surfaceState && (
                  <div className="w-full">
                    <A2UISurfaceRenderer
                      surface={surfaceState}
                      onAction={handleSurfaceAction}
                      onDataModelChange={handleDataModelChange}
                      products={effectiveProducts}
                      showSurfaceBadge={false}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator Bubble when awaiting first envelope */}
        {isGenerating &&
          chatTurns.length > 0 &&
          !mergedSurfaces[chatTurns[chatTurns.length - 1]?.surfaceId ?? ''] && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#0AAD0A] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="bg-white border border-stone-200/80 text-stone-600 text-xs px-4 py-3 rounded-2xl rounded-tl-xs shadow-2xs inline-flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0AAD0A] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0AAD0A] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0AAD0A] animate-bounce" />
                </span>
                <span>Connecting to A2UI v1.0 Direct JSON SSE stream...</span>
              </div>
            </div>
          )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Chat Composer + Quick Suggestion Pills */}
      <div className="bg-white border-t border-stone-200/80 p-3 space-y-2.5 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {QUICK_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={isGenerating}
              onClick={() =>
                void sendUserMessage(chip.prompt, chip.scenarioId, true)
              }
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-stone-700 border border-stone-200/70 transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            disabled={isGenerating}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask for a recipe, meal plan, or cart swap (streams live)..."
            aria-label="Message AI Personal Shopper"
            className="w-full text-sm bg-stone-100/80 border border-stone-200/90 focus:border-[#0AAD0A] focus:bg-white rounded-full pl-4 pr-11 py-2.5 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/15 transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isGenerating || !inputValue.trim()}
            aria-label="Send message"
            className="absolute right-1.5 w-8 h-8 rounded-full bg-[#0AAD0A] hover:bg-[#089208] disabled:bg-stone-200 disabled:text-stone-400 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
