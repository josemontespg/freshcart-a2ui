import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
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
  buildExtensionsShowcaseStream,
  recalculateExtensionsShowcaseDataModel,
  type TastingBoardItem,
} from '../../scenarios/extensionsShowcaseScenario';
import {
  buildCompactCartContext,
  buildCompactCatalogContext,
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
  'extensions-showcase':
    "Curate a Chef's Artisanal Tasting Board showcasing A2UI v1.0 Protocol Extensions (metadata.extensions)",
  'meal-planner': 'Plan tonight’s dinner for 4 with fresh ingredients',
  'cart-optimizer': 'Find smart savings and backups for items in my cart',
  'budget-builder': 'Build a $120 weekly high-protein grocery plan',
};

const SCENARIO_ASSISTANT_INTROS: Record<ScenarioId, string> = {
  'extensions-showcase':
    'Here is a Chef’s Artisanal Tasting Board powered by A2UI v1.0 Protocol Extensions (createSurface.metadata.extensions, ComponentCommon.metadata.extensions, and action.metadata.extensions):',
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
  fallback: ScenarioId = 'extensions-showcase'
): ScenarioId {
  const lower = promptText.toLowerCase();
  if (
    lower.includes('extension') ||
    lower.includes('metadata') ||
    lower.includes('tasting board') ||
    lower.includes('confetti') ||
    lower.includes('aisle highlight')
  ) {
    return 'extensions-showcase';
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
  initialScenarioId = 'extensions-showcase',
  activeScenarioId: controlledScenarioId,
  onScenarioChange,
  onDispatchA2UIMessage,
  onRecordOutboundAction,
  surfaces: externalSurfaces,
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

  const dispatchEnvelopesForSurface = useCallback(
    (envelopes: A2UIv1Message[], surfaceId: string, label: string) => {
      const boundEnvelopes = rewriteEnvelopesSurfaceId(envelopes, surfaceId);
      boundEnvelopes.forEach((msg, idx) => {
        dispatchMessage(msg, `${label} [${idx + 1}/${boundEnvelopes.length}]`);
      });
    },
    [dispatchMessage]
  );

  const buildFallbackEnvelopesForPrompt = useCallback(
    (promptText: string, scenarioHint: ScenarioId): A2UIv1Message[] => {
      const lower = promptText.toLowerCase();
      const numMatch = promptText.match(/\$?\b(\d+)\b/);
      const parsedNum = numMatch ? Number(numMatch[1]) : undefined;

      if (scenarioHint === 'extensions-showcase') {
        const guestCount =
          parsedNum && parsedNum >= 2 && parsedNum <= 10 ? parsedNum : 4;
        return buildExtensionsShowcaseStream({
          storeId: effectiveStoreId,
          products: effectiveProducts,
          guestCount,
        });
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
        text: `Hi! I'm your AI Personal Shopper for ${effectiveStoreName}. Tell me what you'd like to cook, ask for a weekly meal plan, or let me find savings in your cart.`,
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

      if (preferBlueprintInstant || scenarioHint === 'extensions-showcase') {
        const envelopes = buildFallbackEnvelopesForPrompt(trimmed, scenarioHint);
        dispatchEnvelopesForSurface(envelopes, surfaceId, 'Quick Action');
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
      SCENARIO_USER_PROMPTS['extensions-showcase'],
      'extensions-showcase'
    );
    dispatchEnvelopesForSurface(envelopes, resetSurfaceId, 'Reset Chat');
    setChatTurns([
      {
        id: `turn_${turnCounterRef.current}`,
        role: 'assistant',
        text: `Hi! I'm your AI Personal Shopper for ${effectiveStoreName}. Here is our Chef's Artisanal Tasting Board powered by A2UI v1.0 Protocol Extensions (metadata.extensions):`,
        surfaceId: resetSurfaceId,
        scenarioHint: 'extensions-showcase',
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

      if (Array.isArray(nextModel.tastingItems)) {
        const recalculated = recalculateExtensionsShowcaseDataModel(
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
          `Extensions Showcase Recalculation (${pointerPath})`
        );
      } else if (Array.isArray(nextModel.ingredients)) {
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

      const { name, surfaceId, context, metadata: actionMetadata } =
        event.action;
      const currentSurface = mergedSurfaces[surfaceId];
      const currentModel = currentSurface?.dataModel ?? {};
      const outboundExtJson = actionMetadata?.extensions
        ? JSON.stringify(actionMetadata.extensions, null, 2)
        : '';

      if (name === 'add_tasting_board_to_cart') {
        const guestCount = Number(
          context.guestCount ?? currentModel.guestCount ?? 4
        );
        const rawItems = Array.isArray(context.tastingItems)
          ? (context.tastingItems as TastingBoardItem[])
          : Array.isArray(currentModel.tastingItems)
            ? (currentModel.tastingItems as TastingBoardItem[])
            : [];

        const includedBundle = rawItems
          .filter((item) => item.included !== false)
          .map((item) => ({
            productId: item.productId,
            quantity: Math.max(1, Number(item.scaledQty ?? 1)),
          }));

        if (includedBundle.length > 0) {
          effectiveActionHandler.addBundleToCart(
            includedBundle,
            `Artisanal Tasting Board (${guestCount} guests)`
          );
        }

        const extKeyCount = Object.keys(
          actionMetadata?.extensions ?? {}
        ).length;
        const confirmMsg = `Added ${includedBundle.length} artisanal picks (${guestCount} guests) to cart · ${extKeyCount} action.metadata.extensions keys verified ✓`;

        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: {
                ...currentModel,
                lastActionConfirmation: confirmMsg,
                lastOutboundExtensionsJson: outboundExtJson,
              },
            },
          },
          'Tasting Board Bundle Added (with action.metadata.extensions)'
        );
        return;
      }

      if (name === 'locate_aisle_item') {
        const category = String(context.category ?? 'all');
        const productId = String(context.productId ?? '');
        const itemName = String(context.name ?? 'Item');
        const aisleLocation = String(
          context.aisleLocation ?? 'Storefront Aisle'
        );

        window.dispatchEvent(
          new CustomEvent('freshcart:highlight-aisle', {
            detail: {
              category,
              productId,
              aisleLabel: `${itemName} (${aisleLocation})`,
            },
          })
        );

        const confirmMsg = `Highlighted ${aisleLocation} for ${itemName} in storefront ✓`;
        dispatchMessage(
          {
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: {
                ...currentModel,
                lastActionConfirmation: confirmMsg,
                lastOutboundExtensionsJson: outboundExtJson,
              },
            },
          },
          `Locate Aisle (${aisleLocation})`
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
      {/* Minimal Chat Header */}
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

      {/* Bottom Chat Composer + Quick Suggestion Pills */}
      <div className="bg-white border-t border-stone-200/80 p-3 space-y-2.5 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {QUICK_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={isGenerating}
              onClick={() =>
                void sendUserMessage(chip.label, chip.scenarioId)
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
            placeholder="Ask for a recipe, meal plan, or cart swap..."
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
