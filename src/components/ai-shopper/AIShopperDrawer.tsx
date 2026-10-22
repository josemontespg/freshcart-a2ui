import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Code2,
  RotateCcw,
  Send,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import {
  A2UI_VERSION,
  type A2UIActionEvent,
  type A2UICallAgentFunctionMessage,
  type A2UIRendererFunctionResponseMessage,
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
  setClientLiveBridgeSnapshot,
} from '../../a2ui/DataModelBinder';
import {
  createInitialSurfaceManagerState,
  mutateSurfaceDataModel,
  processA2UIMessage,
  recordOutboundActionEvent,
  recordOutboundCallAgentFunction,
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
  buildSmartFunctionsStream,
  type SmartBundleItem,
} from '../../scenarios/smartFunctionsScenario';
import {
  buildAgentToRendererInspectionCall,
  buildCompactCartContext,
  buildCompactCatalogContext,
  buildFollowupDataModelFromRendererResponse,
  executeServerFunctionRpc,
  generateA2UISurfaceWithGemini,
} from '../../services/geminiA2UIService';
import {
  QUICK_PROMPT_CHIPS,
  type ScenarioId,
} from './ScenarioSelector';

export type { ScenarioId };

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  surfaceId?: string;
  scenarioHint?: ScenarioId;
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
  onDispatchA2UIMessage?: (
    message: A2UIv1Message,
    sourceLabel?: string,
    targetSurfaceId?: string
  ) => void;
  onRecordOutboundAction?: (event: A2UIActionEvent) => void;
  onRecordOutboundRpc?: (rpcMessage: A2UICallAgentFunctionMessage) => void;
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
  'smart-functions':
    'Calculate live store coupons, net-carb nutrition targets, and personalized kitchen matches for my cart',
  'meal-planner': 'Plan tonight’s dinner for 4 with fresh ingredients',
  'cart-optimizer': 'Find smart savings and backups for items in my cart',
  'budget-builder': 'Build a $120 weekly high-protein grocery plan',
};

const SCENARIO_ASSISTANT_INTROS: Record<ScenarioId, string> = {
  'smart-functions':
    'Here is your interactive Smart Kitchen Calculator with instant client-side nutrition & promo validation, live server-side coupon RPC, and cart sync:',
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
    lower.includes('coupon') ||
    lower.includes('net-carb') ||
    lower.includes('net carb') ||
    lower.includes('calculator') ||
    lower.includes('function') ||
    lower.includes('rpc')
  ) {
    return 'smart-functions';
  }
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
  onRecordOutboundRpc,
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

  // Keep the client live bridge snapshot synchronized for `callRendererFunction`
  useEffect(() => {
    const subtotal = effectiveCartItems.reduce(
      (sum, it) => sum + it.product.price * it.quantity,
      0
    );
    const totalCount = effectiveCartItems.reduce(
      (sum, it) => sum + it.quantity,
      0
    );
    setClientLiveBridgeSnapshot({
      cartItemCount: totalCount,
      cartSubtotal: Number(subtotal.toFixed(2)),
      activeStoreId: effectiveStoreId,
      activeStoreName: effectiveStoreName,
      deliveryEtaMinutes: cartCtx.activeStore.deliveryEtaMinutes,
      cartItemNames: effectiveCartItems.map((it) => it.product.name),
    });
  }, [
    cartCtx.activeStore.deliveryEtaMinutes,
    effectiveCartItems,
    effectiveStoreId,
    effectiveStoreName,
  ]);

  const [internalManagerState, setInternalManagerState] =
    useState<A2UISurfaceManagerState>(() => createInitialSurfaceManagerState());

  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRpcTelemetryOpen, setIsRpcTelemetryOpen] = useState(false);

  const turnCounterRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const dispatchMessage = useCallback(
    (
      message: A2UIv1Message,
      sourceLabel?: string,
      targetSurfaceId?: string
    ) => {
      setInternalManagerState((prev) =>
        processA2UIMessage(prev, message, { sourceLabel, targetSurfaceId })
      );
      onDispatchA2UIMessage?.(message, sourceLabel, targetSurfaceId);
    },
    [onDispatchA2UIMessage]
  );

  const dispatchEnvelopesForSurface = useCallback(
    (envelopes: A2UIv1Message[], surfaceId: string, label: string) => {
      const boundEnvelopes = rewriteEnvelopesSurfaceId(envelopes, surfaceId);
      boundEnvelopes.forEach((msg, idx) => {
        dispatchMessage(
          msg,
          `${label} [${idx + 1}/${boundEnvelopes.length}]`,
          surfaceId
        );
      });
    },
    [dispatchMessage]
  );

  const buildFallbackEnvelopesForPrompt = useCallback(
    (promptText: string, scenarioHint: ScenarioId): A2UIv1Message[] => {
      const lower = promptText.toLowerCase();
      const numMatch = promptText.match(/\$?\b(\d+)\b/);
      const parsedNum = numMatch ? Number(numMatch[1]) : undefined;

      if (scenarioHint === 'smart-functions') {
        return buildSmartFunctionsStream(
          effectiveCartItems,
          effectiveProducts,
          effectiveStoreId
        );
      }

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

  // Scroll to bottom when turns or loading state change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatTurns.length, isGenerating]);

  // Seed initial welcome assistant turn with an interactive surface on mount
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialScen = controlledScenarioId ?? initialScenarioId;
    turnCounterRef.current += 1;
    const initSurfaceId = `chat_surface_${turnCounterRef.current}`;
    const envelopes = buildFallbackEnvelopesForPrompt(
      SCENARIO_USER_PROMPTS[initialScen],
      initialScen
    );
    dispatchEnvelopesForSurface(envelopes, initSurfaceId, 'Welcome Turn');

    setChatTurns([
      {
        id: `turn_${turnCounterRef.current}`,
        role: 'assistant',
        text: `Hi! I'm your AI Personal Shopper for ${effectiveStoreName}. Click "⚡ Smart Coupons & Nutrition Calculator" below to try live client & server functions, or ask for a meal plan or cart savings.`,
        surfaceId: initSurfaceId,
        scenarioHint: initialScen,
      },
    ]);
  }, [
    buildFallbackEnvelopesForPrompt,
    controlledScenarioId,
    dispatchEnvelopesForSurface,
    effectiveStoreName,
    initialScenarioId,
  ]);

  const sendUserMessage = useCallback(
    async (
      userText: string,
      explicitScenario?: ScenarioId,
      preferBlueprintInstant = false
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

      setChatTurns((prev) => [
        ...prev,
        {
          id: userTurnId,
          role: 'user',
          text: trimmed,
        },
      ]);

      // Always render the Smart Functions showcase blueprint deterministically so all 3
      // Client/Server/Agent->Renderer RPC tabs and interactive controls are immediately live
      if (preferBlueprintInstant || scenarioHint === 'smart-functions') {
        const envelopes = buildFallbackEnvelopesForPrompt(trimmed, scenarioHint);
        dispatchEnvelopesForSurface(
          envelopes,
          surfaceId,
          scenarioHint === 'smart-functions'
            ? 'Smart Functions Showcase'
            : 'Quick Action'
        );
        setChatTurns((prev) => [
          ...prev,
          {
            id: assistantTurnId,
            role: 'assistant',
            text: SCENARIO_ASSISTANT_INTROS[scenarioHint],
            surfaceId,
            scenarioHint,
          },
        ]);
        return;
      }

      setIsGenerating(true);
      try {
        const response = await generateA2UISurfaceWithGemini({
          prompt: trimmed,
          scenarioHint,
          surfaceId,
          activeStore: {
            id: effectiveStoreId,
            name: effectiveStoreName,
          },
          cartItems: buildCompactCartContext(effectiveCartItems),
          availableProducts: buildCompactCatalogContext(
            effectiveProducts,
            effectiveStoreId
          ),
          currentSurfaceState: null,
        });

        dispatchEnvelopesForSurface(
          response.envelopes,
          surfaceId,
          'AI Shopper Reply'
        );

        setChatTurns((prev) => [
          ...prev,
          {
            id: assistantTurnId,
            role: 'assistant',
            text:
              response.summary || SCENARIO_ASSISTANT_INTROS[scenarioHint],
            surfaceId,
            scenarioHint,
          },
        ]);
      } catch {
        const fallbackEnvelopes = buildFallbackEnvelopesForPrompt(
          trimmed,
          scenarioHint
        );
        dispatchEnvelopesForSurface(
          fallbackEnvelopes,
          surfaceId,
          'AI Shopper Reply'
        );
        setChatTurns((prev) => [
          ...prev,
          {
            id: assistantTurnId,
            role: 'assistant',
            text: SCENARIO_ASSISTANT_INTROS[scenarioHint],
            surfaceId,
            scenarioHint,
          },
        ]);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      buildFallbackEnvelopesForPrompt,
      dispatchEnvelopesForSurface,
      effectiveCartItems,
      effectiveProducts,
      effectiveStoreId,
      effectiveStoreName,
      isGenerating,
      onScenarioChange,
    ]
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
    const envelopes = buildFallbackEnvelopesForPrompt(
      SCENARIO_USER_PROMPTS['meal-planner'],
      'meal-planner'
    );
    dispatchEnvelopesForSurface(envelopes, resetSurfaceId, 'Reset Chat');
    setChatTurns([
      {
        id: `turn_${turnCounterRef.current}`,
        role: 'assistant',
        text: `Hi! I'm your AI Personal Shopper for ${effectiveStoreName}. Click "⚡ Smart Coupons & Nutrition Calculator" below to try live client & server functions, or ask for a meal plan or cart savings.`,
        surfaceId: resetSurfaceId,
        scenarioHint: 'meal-planner',
      },
    ]);
  }, [
    buildFallbackEnvelopesForPrompt,
    dispatchEnvelopesForSurface,
    effectiveStoreName,
  ]);

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
          `Recipe Recalculation (${pointerPath})`,
          surfaceId
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
          `Budget Recalculation (${pointerPath})`,
          surfaceId
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
          `Input (${pointerPath})`,
          surfaceId
        );
      }
    },
    [dispatchMessage, effectiveProducts, mergedSurfaces]
  );

  // Handle synchronous client-side function patches (`action.functionCall` with executionTarget='client')
  const handleLocalFunctionPatch = useCallback(
    (
      surfaceId: string,
      patch: Record<string, unknown>,
      sourceLabel: string
    ) => {
      const currentSurface = mergedSurfaces[surfaceId];
      if (!currentSurface) return;
      dispatchMessage(
        {
          version: A2UI_VERSION,
          updateDataModel: {
            surfaceId,
            path: '/',
            value: {
              ...currentSurface.dataModel,
              ...patch,
            },
          },
        },
        sourceLabel,
        surfaceId
      );
    },
    [dispatchMessage, mergedSurfaces]
  );

  // Handle outbound Server-Side Function RPC (`callAgentFunction` -> `agentFunctionResponse`)
  const handleCallAgentFunction = useCallback(
    async (rpcMessage: A2UICallAgentFunctionMessage) => {
      const surfaceId = rpcMessage.callAgentFunction.surfaceId;
      const fnName = rpcMessage.callAgentFunction.callFunction['@call'];

      setInternalManagerState((prev) =>
        recordOutboundCallAgentFunction(
          prev,
          rpcMessage,
          `Renderer -> Agent RPC (${fnName})`
        )
      );
      onRecordOutboundRpc?.(rpcMessage);

      const agentResponse = await executeServerFunctionRpc(rpcMessage);
      dispatchMessage(
        agentResponse,
        `Agent RPC Response (${fnName})`,
        surfaceId
      );
    },
    [dispatchMessage, onRecordOutboundRpc]
  );

  // Handle outbound A2UIActionEvent dispatches from any surface in the chat thread
  const handleSurfaceAction = useCallback(
    (event: A2UIActionEvent) => {
      setInternalManagerState((prev) => recordOutboundActionEvent(prev, event));
      onRecordOutboundAction?.(event);

      const { name, surfaceId, context } = event.action;
      const currentSurface = mergedSurfaces[surfaceId];
      const currentModel = currentSurface?.dataModel ?? {};

      // Feature 07: Agent-Initiated Client Inspection (`callRendererFunction` -> `rendererFunctionResponse`)
      if (name === 'trigger_agent_call_renderer_function') {
        const callRendererMsg = buildAgentToRendererInspectionCall(
          surfaceId,
          'sync_cart',
          context.dietaryGoal ?? currentModel.dietaryGoal
        );

        let capturedResponse: A2UIRendererFunctionResponseMessage | undefined;
        setInternalManagerState((prev) => {
          const nextState = processA2UIMessage(prev, callRendererMsg, {
            sourceLabel: 'Agent -> Renderer RPC (getClientKitchenAndCartMetrics)',
            targetSurfaceId: surfaceId,
          });
          const lastOutbound =
            nextState.outboundResponses[nextState.outboundResponses.length - 1];
          if (lastOutbound && 'rendererFunctionResponse' in lastOutbound) {
            capturedResponse = lastOutbound;
          }
          return nextState;
        });
        onDispatchA2UIMessage?.(
          callRendererMsg,
          'Agent -> Renderer RPC (getClientKitchenAndCartMetrics)',
          surfaceId
        );

        // Now complete the round-trip by streaming the Agent's tailored updateDataModel based on the client response
        const tempEvalState = processA2UIMessage(
          {
            surfaces: currentSurface ? { [surfaceId]: currentSurface } : {},
            log: [],
            outboundResponses: [],
          },
          callRendererMsg,
          { targetSurfaceId: surfaceId }
        );
        const latestOutbound =
          capturedResponse ??
          (tempEvalState.outboundResponses.find(
            (r): r is A2UIRendererFunctionResponseMessage =>
              'rendererFunctionResponse' in r
          ) as A2UIRendererFunctionResponseMessage | undefined);

        if (latestOutbound) {
          const followupMsg = buildFollowupDataModelFromRendererResponse(
            surfaceId,
            latestOutbound,
            tempEvalState.surfaces[surfaceId]?.dataModel ?? currentModel
          );
          if (followupMsg) {
            dispatchMessage(
              followupMsg,
              'Agent Follow-Up after rendererFunctionResponse',
              surfaceId
            );
          }
        }
        return;
      }

      // Feature 07: Security Boundary Test (Agent attempts `callRendererFunction` on a `rendererOnly` function)
      if (name === 'trigger_unauthorized_renderer_function') {
        const unauthorizedCallMsg = buildAgentToRendererInspectionCall(
          surfaceId,
          'test_security_guard'
        );
        dispatchMessage(
          unauthorizedCallMsg,
          'Agent -> Renderer Security Test (rendererOnly Violation)',
          surfaceId
        );
        return;
      }

      if (name === 'add_single_smart_item') {
        const productId = String(context.productId ?? 'prod-salmon-fillet');
        const qty = Math.max(1, Number(context.quantity ?? 1));
        const title = String(context.title ?? 'Smart Pick');
        effectiveActionHandler.addItemToCart(
          productId,
          qty,
          'Added from Smart Kitchen Calculator'
        );
        const confirmMsg = `Added ${qty}x ${title} to your cart ✓`;
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/statusBanner',
              value: confirmMsg,
            },
          },
          'Smart Item Added',
          surfaceId
        );
        return;
      }

      if (name === 'add_smart_functions_bundle_to_cart') {
        const rawItems = Array.isArray(context.items)
          ? (context.items as SmartBundleItem[])
          : Array.isArray(currentModel.bundleItems)
            ? (currentModel.bundleItems as SmartBundleItem[])
            : [];
        const bundleList = rawItems
          .filter((it) => it.included !== false)
          .map((it) => ({
            productId: it.productId,
            quantity: Math.max(1, Number(it.quantity ?? 1)),
          }));

        if (bundleList.length > 0) {
          effectiveActionHandler.addBundleToCart(
            bundleList,
            'Smart Kitchen Bundle'
          );
        }

        const promoCode = String(
          context.promoCode ?? currentModel.promoCodeInput ?? 'KETO20'
        )
          .trim()
          .toUpperCase();
        if (promoCode) {
          effectiveActionHandler.applyPromoCode('A2UIV1');
        }

        const confirmText = `Added ${bundleList.length} bundle items + applied promo ${promoCode} to your cart ✓`;
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: {
                ...currentModel,
                bundleAdded: true,
                statusBanner: confirmText,
              },
            },
          },
          'Smart Bundle & Coupon Added',
          surfaceId
        );
        return;
      }

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
            'Recipe Bundle Added',
            surfaceId
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
          `Swap Ingredient #${idx + 1}`,
          surfaceId
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
          'Chef Pairing Added',
          surfaceId
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
          `Cart Swap (${replacementName})`,
          surfaceId
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
          'All Cart Optimizations Applied',
          surfaceId
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
          'Weekly Basket Added',
          surfaceId
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
          name,
          surfaceId
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
            name,
            surfaceId
          );
        }
      }
    },
    [
      dispatchMessage,
      effectiveActionHandler,
      effectiveProducts,
      mergedSurfaces,
      onDispatchA2UIMessage,
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

  // Filter RPC & Function logs for the live telemetry drawer
  const rpcLogEntries = useMemo(() => {
    return internalManagerState.log.filter(
      (entry) =>
        entry.kind === 'callAgentFunction' ||
        entry.kind === 'agentFunctionResponse' ||
        entry.kind === 'callRendererFunction' ||
        entry.kind === 'rendererFunctionResponse' ||
        (entry.sourceLabel && entry.sourceLabel.includes('Client Function'))
    );
  }, [internalManagerState.log]);

  if (!isOpen) return null;

  const containerClasses =
    mode === 'drawer'
      ? 'fixed inset-y-0 right-0 z-40 w-full max-w-[500px] h-dvh shadow-2xl flex flex-col bg-[#FAF8F5] border-l border-stone-200/80 overflow-hidden'
      : 'h-full w-full flex flex-col bg-[#FAF8F5] overflow-hidden';

  return (
    <aside className={containerClasses} aria-label="AI Personal Shopper Chat">
      {/* Chat Header */}
      <div className="bg-white border-b border-stone-200/80 px-4 py-3.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#0AAD0A] flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-stone-900 truncate">
              AI Personal Shopper
            </h2>
            <p className="text-[11px] text-stone-500 truncate">
              {effectiveStoreName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onOpenProtocolInspector && (
            <button
              type="button"
              onClick={() => onOpenProtocolInspector()}
              title="Open Protocol & Function Inspector"
              aria-label="Open Protocol & Function Inspector"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200/80 transition-colors cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-[#0AAD0A]" />
              <span>Inspector</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleResetChat}
            title="Start new chat"
            aria-label="Start new chat"
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

                {surfaceState && (
                  <div className="w-full">
                    <A2UISurfaceRenderer
                      surface={surfaceState}
                      onAction={handleSurfaceAction}
                      onDataModelChange={handleDataModelChange}
                      onLocalFunctionPatch={handleLocalFunctionPatch}
                      onCallAgentFunction={handleCallAgentFunction}
                      products={effectiveProducts}
                      showSurfaceBadge={false}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator Bubble */}
        {isGenerating && (
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
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Collapsible Live Function & RPC Telemetry Drawer (appears when RPC or Client Functions run) */}
      {rpcLogEntries.length > 0 && (
        <div className="border-t border-slate-800 bg-slate-950 text-slate-100 shrink-0">
          <button
            type="button"
            onClick={() => setIsRpcTelemetryOpen((prev) => !prev)}
            className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Function &amp; RPC Envelope Log ({rpcLogEntries.length} events)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
              <span>{isRpcTelemetryOpen ? 'Hide JSON' : 'Inspect JSON'}</span>
              {isRpcTelemetryOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {isRpcTelemetryOpen && (
            <div className="max-h-48 overflow-y-auto px-3 pb-2.5 space-y-2 border-t border-slate-800 pt-2">
              {rpcLogEntries
                .slice()
                .reverse()
                .map((entry) => {
                  const isInbound = entry.direction === 'agent_to_renderer';
                  return (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-[11px]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold uppercase px-1.5 py-0.5 rounded text-[10px] ${
                            isInbound
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {isInbound ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {entry.kind}
                        </span>
                        <span className="text-slate-400 truncate">
                          {entry.sourceLabel}
                        </span>
                      </div>
                      <pre className="overflow-x-auto font-mono text-[10px] text-emerald-200/90 leading-snug">
                        {JSON.stringify(entry.payload, null, 2)}
                      </pre>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Bottom Chat Composer + Quick Suggestion Pills */}
      <div className="bg-white border-t border-stone-200/80 p-3 space-y-2.5 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {QUICK_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={isGenerating}
              onClick={() =>
                void sendUserMessage(
                  chip.label,
                  chip.scenarioId,
                  chip.scenarioId === 'smart-functions'
                )
              }
              className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer ${
                chip.featured
                  ? 'bg-emerald-50 text-[#073E1E] border-[#0AAD0A]/50 hover:bg-emerald-100/80 shadow-2xs'
                  : 'bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-stone-700 border-stone-200/70'
              }`}
            >
              {chip.featured && <Zap className="w-3.5 h-3.5 text-[#0AAD0A]" />}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            disabled={isGenerating}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask for live store coupons, net-carb calculator, or a meal plan..."
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
