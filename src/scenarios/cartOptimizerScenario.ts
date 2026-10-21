import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { CartItem, Product, StoreId } from '../types/grocery';

export const CART_OPTIMIZER_SURFACE_ID = 'cart-optimizer-surface' as const;

export interface CartSwapRecommendation {
  swapId: string;
  category: 'Budget Saver' | 'Organic Upgrade' | 'Backup Protection';
  originalProductId: string;
  originalName: string;
  originalPrice: number;
  replacementProductId: string;
  replacementName: string;
  replacementPrice: number;
  unit: string;
  quantity: number;
  savingsAmount: number;
  priceDeltaLabel: string;
  badgeText: string;
  imageUrl: string;
  reason: string;
  applied: boolean;
  actionLabel: string;
}

const FALLBACK_SWAPS: CartSwapRecommendation[] = [
  {
    swapId: 'swap_0',
    category: 'Budget Saver',
    originalProductId: 'prod-salmon-fillet',
    originalName: 'Wild Alaskan Sockeye Salmon Fillet',
    originalPrice: 14.99,
    replacementProductId: 'prod-atlantic-salmon',
    replacementName: 'Fresh Atlantic Salmon Portions (Value Pack)',
    replacementPrice: 10.99,
    unit: '16 oz pack',
    quantity: 1,
    savingsAmount: 4.0,
    priceDeltaLabel: 'Save $4.00 per pack',
    badgeText: 'Budget Saver · Save $4.00',
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
    reason: 'Original item is Low Stock; Atlantic portions save $4.00 with high omega-3s.',
    applied: false,
    actionLabel: 'Swap in Cart (Save $4.00)',
  },
  {
    swapId: 'swap_1',
    category: 'Organic Upgrade',
    originalProductId: 'prod-conv-avocado',
    originalName: 'Ripe Hass Avocados',
    originalPrice: 3.99,
    replacementProductId: 'prod-org-avocado',
    replacementName: 'Organic Hass Avocados (4 ct Bag)',
    replacementPrice: 5.49,
    unit: '4 ct bag',
    quantity: 1,
    savingsAmount: 0,
    priceDeltaLabel: '+$1.50 for USDA Organic',
    badgeText: 'USDA Organic Upgrade',
    imageUrl:
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=500&q=80',
    reason: 'Certified USDA Organic California-grown avocados.',
    applied: false,
    actionLabel: 'Upgrade to Organic',
  },
  {
    swapId: 'swap_2',
    category: 'Budget Saver',
    originalProductId: 'prod-extra-virgin-olive-oil',
    originalName: 'Cold-Pressed Extra Virgin Olive Oil',
    originalPrice: 13.99,
    replacementProductId: 'prod-budget-olive-oil',
    replacementName: 'Everyday Mediterranean Olive Oil',
    replacementPrice: 8.99,
    unit: '16.9 fl oz',
    quantity: 1,
    savingsAmount: 5.0,
    priceDeltaLabel: 'Save $5.00 on pantry staple',
    badgeText: 'Budget Saver · Save $5.00',
    imageUrl:
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
    reason: 'Store-brand cold-extracted olive oil at 36% lower price.',
    applied: false,
    actionLabel: 'Swap in Cart (Save $5.00)',
  },
  {
    swapId: 'swap_3',
    category: 'Backup Protection',
    originalProductId: 'prod-sourdough-bread',
    originalName: 'Artisan San Francisco Sourdough Loaf',
    originalPrice: 5.99,
    replacementProductId: 'prod-gf-bread',
    replacementName: 'Seeded Gluten-Free Multigrain Loaf',
    replacementPrice: 6.99,
    unit: '18 oz loaf',
    quantity: 1,
    savingsAmount: 0,
    priceDeltaLabel: 'Low-Stock Backup Ready',
    badgeText: 'Low-Stock Protection',
    imageUrl:
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=500&q=80',
    reason: 'Sourdough loaf is marked Low Stock in Bakery; pre-approve backup.',
    applied: false,
    actionLabel: 'Swap to In-Stock Loaf',
  },
];

export function deriveSwapsFromCart(
  cartItems: CartItem[],
  products: Product[]
): CartSwapRecommendation[] {
  if (!cartItems || cartItems.length === 0) {
    return FALLBACK_SWAPS.map((s) => ({ ...s }));
  }

  const byId = new Map<string, Product>();
  for (const p of products) {
    byId.set(p.id, p);
  }

  const swaps: CartSwapRecommendation[] = [];

  for (const item of cartItems) {
    const prod = item.product;
    const qty = Math.max(1, item.quantity);

    // 1. Check for Budget Alternative
    if (prod.budgetAlternativeProductId) {
      const budgetAlt = byId.get(prod.budgetAlternativeProductId);
      if (budgetAlt && budgetAlt.id !== prod.id) {
        const unitDiff = Math.max(0, Number((prod.price - budgetAlt.price).toFixed(2)));
        const totalSavings = Number((unitDiff * qty).toFixed(2));
        if (totalSavings > 0) {
          swaps.push({
            swapId: `swap_${swaps.length}`,
            category: 'Budget Saver',
            originalProductId: prod.id,
            originalName: prod.name,
            originalPrice: prod.price,
            replacementProductId: budgetAlt.id,
            replacementName: budgetAlt.name,
            replacementPrice: budgetAlt.price,
            unit: budgetAlt.unit,
            quantity: qty,
            savingsAmount: totalSavings,
            priceDeltaLabel: `Save $${totalSavings.toFixed(2)} (${qty}x)`,
            badgeText: `Budget Saver · Save $${totalSavings.toFixed(2)}`,
            imageUrl: budgetAlt.imageUrl,
            reason: `Switch from ${prod.name} ($${prod.price.toFixed(2)}) to ${budgetAlt.name} ($${budgetAlt.price.toFixed(2)}) and save $${totalSavings.toFixed(2)}.`,
            applied: false,
            actionLabel: `Swap & Save $${totalSavings.toFixed(2)}`,
          });
        }
      }
    }

    // 2. Check for Organic Upgrade
    if (prod.organicUpgradeProductId && !prod.dietaryTags.includes('organic')) {
      const orgAlt = byId.get(prod.organicUpgradeProductId);
      if (orgAlt && orgAlt.id !== prod.id) {
        const diff = Number((orgAlt.price - prod.price).toFixed(2));
        swaps.push({
          swapId: `swap_${swaps.length}`,
          category: 'Organic Upgrade',
          originalProductId: prod.id,
          originalName: prod.name,
          originalPrice: prod.price,
          replacementProductId: orgAlt.id,
          replacementName: orgAlt.name,
          replacementPrice: orgAlt.price,
          unit: orgAlt.unit,
          quantity: qty,
          savingsAmount: diff < 0 ? Math.abs(diff * qty) : 0,
          priceDeltaLabel:
            diff > 0 ? `+$${diff.toFixed(2)}/unit for USDA Organic` : 'Same price Organic upgrade',
          badgeText: 'USDA Organic Upgrade',
          imageUrl: orgAlt.imageUrl,
          reason: `Upgrade conventional ${prod.name} to certified USDA Organic ${orgAlt.name}.`,
          applied: false,
          actionLabel: 'Upgrade to Organic',
        });
      }
    }

    // 3. Check for Low-Stock Backup Protection
    if (prod.stockStatus !== 'in_stock' && prod.suggestedBackupProductId) {
      const backupAlt = byId.get(prod.suggestedBackupProductId);
      const alreadyListed = swaps.some(
        (s) => s.originalProductId === prod.id && s.replacementProductId === backupAlt?.id
      );
      if (backupAlt && !alreadyListed) {
        const unitSavings = Math.max(0, Number((prod.price - backupAlt.price).toFixed(2)));
        const totalSavings = Number((unitSavings * qty).toFixed(2));
        swaps.push({
          swapId: `swap_${swaps.length}`,
          category: 'Backup Protection',
          originalProductId: prod.id,
          originalName: prod.name,
          originalPrice: prod.price,
          replacementProductId: backupAlt.id,
          replacementName: backupAlt.name,
          replacementPrice: backupAlt.price,
          unit: backupAlt.unit,
          quantity: qty,
          savingsAmount: totalSavings,
          priceDeltaLabel:
            totalSavings > 0 ? `In Stock · Save $${totalSavings.toFixed(2)}` : 'In-Stock Protection',
          badgeText: 'Low-Stock Backup Ready',
          imageUrl: backupAlt.imageUrl,
          reason: `${prod.name} is currently Low Stock in ${prod.aisleLocation}. Swap now to guarantee fulfillment.`,
          applied: false,
          actionLabel: 'Swap to In-Stock SKU',
        });
      }
    }
  }

  if (swaps.length === 0) {
    return FALLBACK_SWAPS.map((s) => ({ ...s }));
  }

  return swaps;
}

export function buildCartOptimizerDataModel(
  cartItems: CartItem[] = [],
  products: Product[] = [],
  _activeStoreId?: StoreId
): Record<string, unknown> {
  const swaps = deriveSwapsFromCart(cartItems, products);
  const budgetSwaps = swaps.filter((s) => s.category === 'Budget Saver');
  const organicSwaps = swaps.filter((s) => s.category === 'Organic Upgrade');
  const backupSwaps = swaps.filter((s) => s.category === 'Backup Protection');

  const potentialSavings = Number(
    swaps.reduce((sum, s) => sum + Number(s.savingsAmount ?? 0), 0).toFixed(2)
  );
  const lowStockCount =
    cartItems.filter((c) => c.product.stockStatus !== 'in_stock').length || backupSwaps.length;

  const topBudgetSwap = budgetSwaps[0] ?? swaps[0] ?? FALLBACK_SWAPS[0];
  const topOrganicSwap = organicSwaps[0] ?? FALLBACK_SWAPS[1];
  const topBackupSwap = backupSwaps[0] ?? topBudgetSwap;

  return {
    headline: `## Smart Cart Optimizer · ${swaps.length} Live Recommendations`,
    subheadline:
      cartItems.length > 0
        ? `Analyzed ${cartItems.length} items in your cart · Up to $${potentialSavings.toFixed(2)} instant savings`
        : 'Showing sample cart optimization · Click any card to swap SKUs in real time',
    cartItemCount: cartItems.length,
    potentialSavings,
    totalSavingsApplied: 0,
    swapsAppliedCount: 0,
    lowStockCount,
    allApplied: false,
    lastActionConfirmation: `${swaps.length} smart swap opportunities ready (${lowStockCount} low-stock item protected)`,
    swaps,
    topBudgetDeal: topBudgetSwap,
    topOrganicDeal: topOrganicSwap,
    topBackupDeal: topBackupSwap,
  };
}

export function buildCartOptimizerComponents(): A2UIComponentBase[] {
  return [
    {
      id: 'root',
      component: 'Column',
      children: ['summary_card', 'optimizer_tabs', 'footer_card'],
    },
    {
      id: 'summary_card',
      component: 'Card',
      child: 'summary_col',
    },
    {
      id: 'summary_col',
      component: 'Column',
      children: ['headline_text', 'subheadline_text', 'metrics_row'],
    },
    {
      id: 'headline_text',
      component: 'Text',
      variant: 'body',
      text: { '@path': '/headline' },
    },
    {
      id: 'subheadline_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/subheadline' },
    },
    {
      id: 'metrics_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['savings_metric_col', 'applied_metric_col'],
    },
    {
      id: 'savings_metric_col',
      component: 'Column',
      children: ['savings_label_text', 'savings_value_text'],
    },
    {
      id: 'savings_label_text',
      component: 'Text',
      variant: 'caption',
      text: 'Potential Instant Savings',
    },
    {
      id: 'savings_value_text',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatCurrency',
        args: {
          value: { '@path': '/potentialSavings' },
          currency: 'USD',
        },
      },
    },
    {
      id: 'applied_metric_col',
      component: 'Column',
      children: ['applied_label_text', 'applied_value_text'],
    },
    {
      id: 'applied_label_text',
      component: 'Text',
      variant: 'caption',
      text: 'Savings Applied So Far',
    },
    {
      id: 'applied_value_text',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatCurrency',
        args: {
          value: { '@path': '/totalSavingsApplied' },
          currency: 'USD',
        },
      },
    },
    {
      id: 'optimizer_tabs',
      component: 'Tabs',
      tabs: [
        { title: 'All Smart Swaps', child: 'tab_all_swaps' },
        { title: 'Budget Savers', child: 'tab_budget_savers' },
        { title: 'Organic Upgrades', child: 'tab_organic_upgrades' },
        { title: 'Backup Protection', child: 'tab_backup_protection' },
      ],
    },
    {
      id: 'tab_all_swaps',
      component: 'List',
      direction: 'vertical',
      children: {
        componentId: 'swap_item_card',
        path: '/swaps',
      },
    },
    {
      id: 'swap_item_card',
      component: 'Card',
      child: 'swap_item_col',
    },
    {
      id: 'swap_item_col',
      component: 'Column',
      children: ['swap_header_row', 'swap_reason_text', 'swap_deal_widget'],
    },
    {
      id: 'swap_header_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['swap_index_text', 'swap_orig_text'],
    },
    {
      id: 'swap_index_text',
      component: 'Text',
      variant: 'caption',
      text: {
        '@call': 'formatString',
        args: {
          value: 'Swap #${@index(offset:1)} · ${category}',
        },
      },
    },
    {
      id: 'swap_orig_text',
      component: 'Text',
      variant: 'caption',
      text: {
        '@call': 'formatString',
        args: {
          value: 'Replaces: ${originalName}',
        },
      },
    },
    {
      id: 'swap_reason_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': 'reason' },
    },
    {
      id: 'swap_deal_widget',
      component: 'ProductDealCard',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      productId: { '@path': 'replacementProductId' },
      title: { '@path': 'replacementName' },
      price: { '@path': 'replacementPrice' },
      originalPrice: { '@path': 'originalPrice' },
      unit: { '@path': 'unit' },
      badgeText: { '@path': 'badgeText' },
      imageUrl: { '@path': 'imageUrl' },
      quantity: { '@path': 'quantity' },
      actionLabel: { '@path': 'actionLabel' },
      action: {
        event: {
          name: 'apply_cart_swap',
          userMessage: 'Apply recommended cart swap',
          context: {
            swapId: { '@path': 'swapId' },
            index: { '@call': '@index' },
            originalProductId: { '@path': 'originalProductId' },
            replacementProductId: { '@path': 'replacementProductId' },
            replacementName: { '@path': 'replacementName' },
            quantity: { '@path': 'quantity' },
            savingsAmount: { '@path': 'savingsAmount' },
          },
        },
      },
    },
    {
      id: 'tab_budget_savers',
      component: 'Column',
      children: ['budget_intro_text', 'budget_deal_card'],
    },
    {
      id: 'budget_intro_text',
      component: 'Text',
      variant: 'body',
      text: '### Store-Brand & Value Pack Substitutions\nSwitch name-brand items for FreshCart value equivalents to lower your subtotal without sacrificing nutrition.',
    },
    {
      id: 'budget_deal_card',
      component: 'ProductDealCard',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      productId: { '@path': '/topBudgetDeal/replacementProductId' },
      title: { '@path': '/topBudgetDeal/replacementName' },
      price: { '@path': '/topBudgetDeal/replacementPrice' },
      originalPrice: { '@path': '/topBudgetDeal/originalPrice' },
      unit: { '@path': '/topBudgetDeal/unit' },
      badgeText: { '@path': '/topBudgetDeal/badgeText' },
      imageUrl: { '@path': '/topBudgetDeal/imageUrl' },
      actionLabel: { '@path': '/topBudgetDeal/actionLabel' },
      action: {
        event: {
          name: 'apply_cart_swap',
          userMessage: 'Apply top budget saver swap',
          context: {
            swapId: { '@path': '/topBudgetDeal/swapId' },
            originalProductId: { '@path': '/topBudgetDeal/originalProductId' },
            replacementProductId: { '@path': '/topBudgetDeal/replacementProductId' },
            replacementName: { '@path': '/topBudgetDeal/replacementName' },
            quantity: { '@path': '/topBudgetDeal/quantity' },
            savingsAmount: { '@path': '/topBudgetDeal/savingsAmount' },
          },
        },
      },
    },
    {
      id: 'tab_organic_upgrades',
      component: 'Column',
      children: ['organic_intro_text', 'organic_deal_card'],
    },
    {
      id: 'organic_intro_text',
      component: 'Text',
      variant: 'body',
      text: '### Certified USDA Organic Upgrades\nUpgrade conventional produce and dairy in your cart to non-GMO, USDA Organic equivalents.',
    },
    {
      id: 'organic_deal_card',
      component: 'ProductDealCard',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      productId: { '@path': '/topOrganicDeal/replacementProductId' },
      title: { '@path': '/topOrganicDeal/replacementName' },
      price: { '@path': '/topOrganicDeal/replacementPrice' },
      originalPrice: { '@path': '/topOrganicDeal/originalPrice' },
      unit: { '@path': '/topOrganicDeal/unit' },
      badgeText: { '@path': '/topOrganicDeal/badgeText' },
      imageUrl: { '@path': '/topOrganicDeal/imageUrl' },
      actionLabel: { '@path': '/topOrganicDeal/actionLabel' },
      action: {
        event: {
          name: 'apply_cart_swap',
          userMessage: 'Apply USDA Organic upgrade',
          context: {
            swapId: { '@path': '/topOrganicDeal/swapId' },
            originalProductId: { '@path': '/topOrganicDeal/originalProductId' },
            replacementProductId: { '@path': '/topOrganicDeal/replacementProductId' },
            replacementName: { '@path': '/topOrganicDeal/replacementName' },
            quantity: { '@path': '/topOrganicDeal/quantity' },
            savingsAmount: { '@path': '/topOrganicDeal/savingsAmount' },
          },
        },
      },
    },
    {
      id: 'tab_backup_protection',
      component: 'Column',
      children: ['backup_intro_text', 'backup_deal_card'],
    },
    {
      id: 'backup_intro_text',
      component: 'Text',
      variant: 'body',
      text: '### Low-Stock Inventory Protection\nPre-approve high-rated in-stock backups for items currently flagged as Low Stock in your selected store.',
    },
    {
      id: 'backup_deal_card',
      component: 'ProductDealCard',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      productId: { '@path': '/topBackupDeal/replacementProductId' },
      title: { '@path': '/topBackupDeal/replacementName' },
      price: { '@path': '/topBackupDeal/replacementPrice' },
      originalPrice: { '@path': '/topBackupDeal/originalPrice' },
      unit: { '@path': '/topBackupDeal/unit' },
      badgeText: { '@path': '/topBackupDeal/badgeText' },
      imageUrl: { '@path': '/topBackupDeal/imageUrl' },
      actionLabel: { '@path': '/topBackupDeal/actionLabel' },
      action: {
        event: {
          name: 'apply_cart_swap',
          userMessage: 'Apply low-stock backup swap',
          context: {
            swapId: { '@path': '/topBackupDeal/swapId' },
            originalProductId: { '@path': '/topBackupDeal/originalProductId' },
            replacementProductId: { '@path': '/topBackupDeal/replacementProductId' },
            replacementName: { '@path': '/topBackupDeal/replacementName' },
            quantity: { '@path': '/topBackupDeal/quantity' },
            savingsAmount: { '@path': '/topBackupDeal/savingsAmount' },
          },
        },
      },
    },
    {
      id: 'footer_card',
      component: 'Card',
      child: 'footer_col',
    },
    {
      id: 'footer_col',
      component: 'Column',
      children: ['confirm_status_text', 'btn_apply_all'],
    },
    {
      id: 'confirm_status_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/lastActionConfirmation' },
    },
    {
      id: 'btn_apply_all',
      component: 'Button',
      variant: 'primary',
      child: 'btn_apply_all_label',
      action: {
        event: {
          name: 'apply_all_optimizations',
          userMessage: 'Apply all recommended cart optimizations',
          context: {
            swaps: { '@path': '/swaps' },
            potentialSavings: { '@path': '/potentialSavings' },
          },
        },
      },
    },
    {
      id: 'btn_apply_all_label',
      component: 'Text',
      variant: 'body',
      text: 'Apply All Smart Cart Optimizations',
    },
  ];
}

export function buildCartOptimizerStream(
  cartItems: CartItem[] = [],
  products: Product[] = [],
  activeStoreId?: StoreId
): A2UIv1Message[] {
  const fullDataModel = buildCartOptimizerDataModel(cartItems, products, activeStoreId);
  const components = buildCartOptimizerComponents();

  const createMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    createSurface: {
      surfaceId: CART_OPTIMIZER_SURFACE_ID,
      catalogId: A2UI_BASIC_CATALOG_ID,
      sendDataModel: true,
      components: [
        {
          id: 'root',
          component: 'Column',
          children: ['summary_card'],
        },
        {
          id: 'summary_card',
          component: 'Card',
          child: 'headline_text',
        },
        {
          id: 'headline_text',
          component: 'Text',
          variant: 'body',
          text: '## Scanning active cart SKUs for savings & low-stock risks...',
        },
      ],
      dataModel: {
        headline: '## Scanning active cart SKUs...',
        subheadline: 'Evaluating budget alternatives, organic upgrades, and stock status',
        potentialSavings: 0,
        totalSavingsApplied: 0,
        swaps: [],
        lastActionConfirmation: 'Analyzing CartContext items...',
      },
    },
  };

  const updateComponentsMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateComponents: {
      surfaceId: CART_OPTIMIZER_SURFACE_ID,
      components,
    },
  };

  const updateDataModelMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateDataModel: {
      surfaceId: CART_OPTIMIZER_SURFACE_ID,
      path: '/',
      value: fullDataModel,
    },
  };

  return [createMsg, updateComponentsMsg, updateDataModelMsg];
}

export function markCartSwapAppliedInModel(
  currentModel: Record<string, unknown>,
  swapIdOrOriginalId: string
): Record<string, unknown> {
  const rawSwaps = Array.isArray(currentModel.swaps)
    ? [...(currentModel.swaps as CartSwapRecommendation[])]
    : [];

  let appliedSwapName = 'Item';
  let addedSavings = 0;

  const updatedSwaps = rawSwaps.map((s) => {
    if (s.swapId === swapIdOrOriginalId || s.originalProductId === swapIdOrOriginalId) {
      if (!s.applied) {
        addedSavings += Number(s.savingsAmount ?? 0);
      }
      appliedSwapName = s.replacementName;
      return {
        ...s,
        applied: true,
        actionLabel: 'Swap Applied ✓',
      };
    }
    return s;
  });

  const swapsAppliedCount = updatedSwaps.filter((s) => s.applied).length;
  const totalSavingsApplied = Number(
    (Number(currentModel.totalSavingsApplied ?? 0) + addedSavings).toFixed(2)
  );

  return {
    ...currentModel,
    swaps: updatedSwaps,
    swapsAppliedCount,
    totalSavingsApplied,
    allApplied: swapsAppliedCount === updatedSwaps.length && updatedSwaps.length > 0,
    lastActionConfirmation: `Swapped to ${appliedSwapName} in live Cart ✓ ($${totalSavingsApplied.toFixed(2)} total saved)`,
  };
}

export function markAllCartSwapsAppliedInModel(
  currentModel: Record<string, unknown>
): Record<string, unknown> {
  const rawSwaps = Array.isArray(currentModel.swaps)
    ? (currentModel.swaps as CartSwapRecommendation[])
    : [];

  const updatedSwaps = rawSwaps.map((s) => ({
    ...s,
    applied: true,
    actionLabel: 'Swap Applied ✓',
  }));

  const potentialSavings = Number(currentModel.potentialSavings ?? 0);

  return {
    ...currentModel,
    swaps: updatedSwaps,
    swapsAppliedCount: updatedSwaps.length,
    totalSavingsApplied: potentialSavings,
    allApplied: true,
    lastActionConfirmation: `Applied all ${updatedSwaps.length} smart cart optimizations · Saved $${potentialSavings.toFixed(2)} ✓`,
  };
}
