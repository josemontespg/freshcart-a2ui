import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { Product, StoreId } from '../types/grocery';

export const BUDGET_BUILDER_SURFACE_ID = 'budget-nutrition-surface' as const;

export interface BudgetBasketItem {
  productId: string;
  title: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  proteinGrams: number;
  badgeText: string;
  imageUrl: string;
  included: boolean;
}

export interface BudgetBuilderOptions {
  weeklyBudget?: number;
  householdGoals?: string[];
  maxPrepMinutes?: string;
  customNote?: string;
  autoApplyPromo?: boolean;
  activeStoreId?: StoreId;
  products?: Product[];
}

const DEFAULT_BASKET_BLUEPRINT: Array<{
  productId: string;
  fallbackTitle: string;
  unit: string;
  quantity: number;
  defaultPrice: number;
  proteinGrams: number;
  badgeText: string;
  imageUrl: string;
}> = [
  {
    productId: 'prod-salmon-fillet',
    fallbackTitle: 'Wild Alaskan Sockeye Salmon Fillet',
    unit: '1 lb fillet',
    quantity: 2,
    defaultPrice: 14.99,
    proteinGrams: 44,
    badgeText: 'Omega-3 & 44g Protein',
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
  },
  {
    productId: 'prod-org-chicken-breast',
    fallbackTitle: 'Organic Air-Chilled Chicken Breast',
    unit: '1.5 lb pack',
    quantity: 2,
    defaultPrice: 11.49,
    proteinGrams: 46,
    badgeText: 'Lean Protein Staple',
    imageUrl:
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=500&q=80',
  },
  {
    productId: 'prod-org-greek-yogurt',
    fallbackTitle: 'Organic Whole Milk Greek Yogurt',
    unit: '32 oz tub',
    quantity: 2,
    defaultPrice: 6.99,
    proteinGrams: 18,
    badgeText: 'Probiotic Breakfast',
    imageUrl:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80',
  },
  {
    productId: 'prod-org-quinoa',
    fallbackTitle: 'Organic Tri-Color Quinoa',
    unit: '16 oz bag',
    quantity: 2,
    defaultPrice: 6.49,
    proteinGrams: 8,
    badgeText: 'Complete Plant Amino Acids',
    imageUrl:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
  },
  {
    productId: 'prod-org-avocado',
    fallbackTitle: 'Organic Hass Avocados (4 ct Bag)',
    unit: '4 ct bag',
    quantity: 2,
    defaultPrice: 5.49,
    proteinGrams: 3,
    badgeText: 'Healthy Monounsaturated Fats',
    imageUrl:
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=500&q=80',
  },
  {
    productId: 'prod-baby-spinach',
    fallbackTitle: 'USDA Organic Baby Spinach',
    unit: '5 oz clamshell',
    quantity: 2,
    defaultPrice: 4.49,
    proteinGrams: 2,
    badgeText: 'Iron & Folate Greens',
    imageUrl:
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',
  },
  {
    productId: 'prod-pasture-eggs',
    fallbackTitle: 'Organic Pasture-Raised Brown Eggs',
    unit: '12 ct carton',
    quantity: 1,
    defaultPrice: 6.99,
    proteinGrams: 6,
    badgeText: 'Pasture-Raised · Choline',
    imageUrl:
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=500&q=80',
  },
  {
    productId: 'prod-frozen-berries',
    fallbackTitle: 'Organic Triple Berry Antioxidant Blend',
    unit: '32 oz bag',
    quantity: 1,
    defaultPrice: 8.49,
    proteinGrams: 2,
    badgeText: 'Smoothie & Fiber Boost',
    imageUrl:
      'https://images.unsplash.com/photo-1563746098251-d35aef196e83?auto=format&fit=crop&w=500&q=80',
  },
];

export function buildBudgetBuilderDataModel(
  options: BudgetBuilderOptions = {}
): Record<string, unknown> {
  const weeklyBudget = Math.max(50, Math.min(400, Math.round(options.weeklyBudget ?? 140)));
  const householdGoals = options.householdGoals ?? ['High-Protein', 'USDA Organic'];
  const maxPrepMinutes = options.maxPrepMinutes ?? '30';
  const customNote =
    options.customNote ?? 'Prefer firm avocados and thickest salmon cuts for weekly meal prep.';
  const autoApplyPromo = options.autoApplyPromo ?? true;
  const products = options.products ?? [];

  const curatedBasket: BudgetBasketItem[] = DEFAULT_BASKET_BLUEPRINT.map((item) => {
    const resolved = products.find((p) => p.id === item.productId);
    const unitPrice = resolved ? resolved.price : item.defaultPrice;
    const lineTotal = Number((unitPrice * item.quantity).toFixed(2));
    return {
      productId: item.productId,
      title: resolved ? resolved.name : item.fallbackTitle,
      unit: `${item.quantity}x ${resolved ? resolved.unit : item.unit}`,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      proteinGrams: resolved ? resolved.nutrition.proteinGrams : item.proteinGrams,
      badgeText: item.badgeText,
      imageUrl: resolved ? resolved.imageUrl : item.imageUrl,
      included: true,
    };
  });

  const allocatedSpend = Number(
    curatedBasket
      .filter((item) => item.included)
      .reduce((sum, item) => sum + item.lineTotal, 0)
      .toFixed(2)
  );
  const remainingBudget = Number((weeklyBudget - allocatedSpend).toFixed(2));
  const isBudgetValid = allocatedSpend <= weeklyBudget;

  return {
    plannerTitle: '## Weekly Budget & Nutrition Planner',
    plannerSubtitle:
      'Set your weekly grocery budget and household nutrition goals',
    weeklyBudget,
    allocatedSpend,
    remainingBudget,
    isBudgetValid,
    householdGoals,
    maxPrepMinutes,
    customNote,
    autoApplyPromo,
    promoCodeToApply: 'A2UIV1',
    weeklyNutrition: {
      calories: 2140,
      proteinGrams: 156,
      carbsGrams: 178,
      fatGrams: 76,
      fiberGrams: 34,
      servings: 7,
      dailyCalorieTarget: 2200,
    },
    curatedBasket,
    basketAdded: false,
    lastActionConfirmation: isBudgetValid
      ? `Within budget · $${remainingBudget.toFixed(2)} remaining under your $${weeklyBudget} weekly target ✓`
      : `Over budget by $${Math.abs(remainingBudget).toFixed(2)} — increase your budget or uncheck items`,
  };
}

export function buildBudgetBuilderComponents(): A2UIComponentBase[] {
  return [
    {
      id: 'root',
      component: 'Column',
      children: [
        'header_card',
        'planner_tabs',
        'nutrition_macro_summary',
        'footer_budget_card',
      ],
    },
    {
      id: 'header_card',
      component: 'Card',
      child: 'header_col',
    },
    {
      id: 'header_col',
      component: 'Column',
      children: ['planner_title_text', 'planner_subtitle_text', 'budget_kpi_row'],
    },
    {
      id: 'planner_title_text',
      component: 'Text',
      variant: 'body',
      text: { '@path': '/plannerTitle' },
    },
    {
      id: 'planner_subtitle_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/plannerSubtitle' },
    },
    {
      id: 'budget_kpi_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['kpi_cap_col', 'kpi_allocated_col', 'kpi_remaining_col'],
    },
    {
      id: 'kpi_cap_col',
      component: 'Column',
      children: ['kpi_cap_label', 'kpi_cap_val'],
    },
    {
      id: 'kpi_cap_label',
      component: 'Text',
      variant: 'caption',
      text: 'Weekly Budget Cap',
    },
    {
      id: 'kpi_cap_val',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatCurrency',
        args: {
          value: { '@path': '/weeklyBudget' },
          currency: 'USD',
        },
      },
    },
    {
      id: 'kpi_allocated_col',
      component: 'Column',
      children: ['kpi_allocated_label', 'kpi_allocated_val'],
    },
    {
      id: 'kpi_allocated_label',
      component: 'Text',
      variant: 'caption',
      text: 'Allocated Basket Spend',
    },
    {
      id: 'kpi_allocated_val',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatCurrency',
        args: {
          value: { '@path': '/allocatedSpend' },
          currency: 'USD',
        },
      },
    },
    {
      id: 'kpi_remaining_col',
      component: 'Column',
      children: ['kpi_remaining_label', 'kpi_remaining_val'],
    },
    {
      id: 'kpi_remaining_label',
      component: 'Text',
      variant: 'caption',
      text: 'Remaining Headroom',
    },
    {
      id: 'kpi_remaining_val',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatCurrency',
        args: {
          value: { '@path': '/remainingBudget' },
          currency: 'USD',
        },
      },
    },
    {
      id: 'planner_tabs',
      component: 'Tabs',
      tabs: [
        { title: 'Budget & Goals', child: 'tab_budget_goals' },
        { title: 'Nutrition Guide', child: 'tab_macro_targets' },
        { title: 'Weekly Basket', child: 'tab_curated_basket' },
      ],
    },
    {
      id: 'tab_budget_goals',
      component: 'Card',
      child: 'tab_budget_goals_col',
    },
    {
      id: 'tab_budget_goals_col',
      component: 'Column',
      children: [
        'slider_weekly_budget',
        'picker_household_goals',
        'divider_inputs',
        'input_max_prep',
        'input_custom_note',
        'cb_auto_promo',
      ],
    },
    {
      id: 'slider_weekly_budget',
      component: 'Slider',
      label: 'Weekly Grocery Budget Cap ($50 - $400)',
      min: 50,
      max: 400,
      steps: 35,
      value: { '@path': '/weeklyBudget' },
    },
    {
      id: 'picker_household_goals',
      component: 'ChoicePicker',
      label: 'Household Nutritional & Shopping Goals (Required)',
      variant: 'multipleSelection',
      displayStyle: 'chips',
      value: { '@path': '/householdGoals' },
      options: [
        { label: 'High-Protein (150g+/day)', value: 'High-Protein' },
        { label: 'USDA Organic Priority', value: 'USDA Organic' },
        { label: 'Under 30-Min Prep', value: 'Under 30-Min Prep' },
        { label: 'Gluten-Free Staples', value: 'Gluten-Free' },
        { label: 'Heart-Healthy Omega-3', value: 'Omega-3' },
      ],
      checks: [
        {
          condition: {
            '@call': 'required',
            args: { value: { '@path': '/householdGoals' } },
          },
          message: 'Select at least one nutritional or household goal.',
        },
      ],
    },
    {
      id: 'divider_inputs',
      component: 'Divider',
      axis: 'horizontal',
    },
    {
      id: 'input_max_prep',
      component: 'TextField',
      label: 'Max Daily Cooking Prep Time (Minutes · valid range: 10 to 120)',
      placeholder: 'Enter minutes between 10 and 120',
      variant: 'number',
      value: { '@path': '/maxPrepMinutes' },
      checks: [
        {
          condition: {
            '@call': 'required',
            args: { value: { '@path': '/maxPrepMinutes' } },
          },
          message: 'Maximum prep time is required.',
        },
        {
          condition: {
            '@call': 'numeric',
            args: {
              value: { '@path': '/maxPrepMinutes' },
              min: 10,
              max: 120,
            },
          },
          message: 'Enter a valid prep time between 10 and 120 minutes.',
        },
      ],
    },
    {
      id: 'input_custom_note',
      component: 'TextField',
      label: 'Personal Shopper Fulfillment Note (Max 120 chars)',
      placeholder: 'e.g., Prefer firm avocados and latest expiration dates on dairy',
      variant: 'shortText',
      value: { '@path': '/customNote' },
      checks: [
        {
          condition: {
            '@call': 'length',
            args: {
              value: { '@path': '/customNote' },
              max: 120,
            },
          },
          message: 'Personal shopper note must be 120 characters or fewer.',
        },
      ],
    },
    {
      id: 'cb_auto_promo',
      component: 'CheckBox',
      label: 'Automatically apply $10 weekly planner savings ($10 off $50+)',
      value: { '@path': '/autoApplyPromo' },
    },
    {
      id: 'tab_macro_targets',
      component: 'Card',
      child: 'tab_macro_targets_col',
    },
    {
      id: 'tab_macro_targets_col',
      component: 'Column',
      children: ['macro_explainer_text', 'modal_macro_guide'],
    },
    {
      id: 'macro_explainer_text',
      component: 'Text',
      variant: 'body',
      text: '### Weekly Nutrition Balance\nYour curated 7-day grocery basket targets **156g daily protein**, **34g dietary fiber**, and balanced complex carbohydrates from organic quinoa, wild salmon, pasture-raised eggs, and Greek yogurt.',
    },
    {
      id: 'modal_macro_guide',
      component: 'Modal',
      trigger: 'btn_open_macro_modal',
      content: 'modal_macro_content_col',
    },
    {
      id: 'btn_open_macro_modal',
      component: 'Button',
      variant: 'default',
      child: 'btn_open_macro_modal_label',
      action: {
        event: {
          name: 'open_macro_methodology',
          context: {},
        },
      },
    },
    {
      id: 'btn_open_macro_modal_label',
      component: 'Text',
      variant: 'caption',
      text: 'View Weekly Nutrition & Meal Prep Guide',
    },
    {
      id: 'modal_macro_content_col',
      component: 'Column',
      children: ['modal_macro_title', 'modal_macro_body'],
    },
    {
      id: 'modal_macro_title',
      component: 'Text',
      variant: 'body',
      text: '## Weekly Nutrition & Meal Prep Guide',
    },
    {
      id: 'modal_macro_body',
      component: 'Text',
      variant: 'body',
      text: 'Your curated weekly basket balances lean proteins, heart-healthy omega-3 fats, and high-fiber whole grains:\n- **Wild Alaskan Salmon & Organic Chicken**: 90g+ combined high-quality protein.\n- **Organic Quinoa, Greek Yogurt & Pasture-Raised Eggs**: Steady energy and probiotics for busy mornings.\n- **Fresh Avocados, Spinach & Berries**: Essential micronutrients, antioxidants, and fiber.',
    },
    {
      id: 'tab_curated_basket',
      component: 'Card',
      child: 'tab_curated_basket_col',
    },
    {
      id: 'tab_curated_basket_col',
      component: 'Column',
      children: ['basket_intro_text', 'basket_items_list'],
    },
    {
      id: 'basket_intro_text',
      component: 'Text',
      variant: 'caption',
      text: 'Toggle items below to adjust your allocated weekly spend:',
    },
    {
      id: 'basket_items_list',
      component: 'List',
      direction: 'vertical',
      children: {
        componentId: 'basket_item_row',
        path: '/curatedBasket',
      },
    },
    {
      id: 'basket_item_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['basket_item_left_col', 'basket_item_price_text'],
    },
    {
      id: 'basket_item_left_col',
      component: 'Column',
      weight: 1,
      children: ['basket_item_cb', 'basket_item_meta_text'],
    },
    {
      id: 'basket_item_cb',
      component: 'CheckBox',
      label: { '@path': 'title' },
      value: { '@path': 'included' },
    },
    {
      id: 'basket_item_meta_text',
      component: 'Text',
      variant: 'caption',
      text: {
        '@call': 'formatString',
        args: {
          value: '#${@index(offset:1)} · ${unit} · ${badgeText}',
        },
      },
    },
    {
      id: 'basket_item_price_text',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatCurrency',
        args: {
          value: { '@path': 'lineTotal' },
          currency: 'USD',
        },
      },
    },
    {
      id: 'nutrition_macro_summary',
      component: 'NutritionSummary',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      calories: { '@path': '/weeklyNutrition/calories' },
      proteinGrams: { '@path': '/weeklyNutrition/proteinGrams' },
      carbsGrams: { '@path': '/weeklyNutrition/carbsGrams' },
      fatGrams: { '@path': '/weeklyNutrition/fatGrams' },
      fiberGrams: { '@path': '/weeklyNutrition/fiberGrams' },
      servings: { '@path': '/weeklyNutrition/servings' },
      dailyCalorieTarget: { '@path': '/weeklyNutrition/dailyCalorieTarget' },
    },
    {
      id: 'footer_budget_card',
      component: 'Card',
      child: 'footer_budget_col',
    },
    {
      id: 'footer_budget_col',
      component: 'Column',
      children: ['footer_budget_status_text', 'btn_build_weekly_basket'],
    },
    {
      id: 'footer_budget_status_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/lastActionConfirmation' },
    },
    {
      id: 'btn_build_weekly_basket',
      component: 'Button',
      variant: 'primary',
      child: 'btn_build_weekly_basket_label',
      checks: [
        {
          condition: { '@path': '/isBudgetValid' },
          message:
            'Allocated basket spend exceeds your weekly budget cap! Raise the budget slider or uncheck an item in Tab 3.',
        },
        {
          condition: {
            '@call': 'numeric',
            args: {
              value: { '@path': '/maxPrepMinutes' },
              min: 10,
              max: 120,
            },
          },
          message: 'Max Daily Prep Time must be a number between 10 and 120 minutes.',
        },
        {
          condition: {
            '@call': 'required',
            args: {
              value: { '@path': '/householdGoals' },
            },
          },
          message: 'Select at least one household goal in Tab 1.',
        },
      ],
      action: {
        event: {
          name: 'build_weekly_basket',
          userMessage: 'Build & add curated weekly basket to my cart',
          context: {
            weeklyBudget: { '@path': '/weeklyBudget' },
            allocatedSpend: { '@path': '/allocatedSpend' },
            householdGoals: { '@path': '/householdGoals' },
            maxPrepMinutes: { '@path': '/maxPrepMinutes' },
            customNote: { '@path': '/customNote' },
            autoApplyPromo: { '@path': '/autoApplyPromo' },
            promoCodeToApply: { '@path': '/promoCodeToApply' },
            curatedBasket: { '@path': '/curatedBasket' },
          },
        },
      },
    },
    {
      id: 'btn_build_weekly_basket_label',
      component: 'Text',
      variant: 'body',
      text: 'Build & Add Weekly Basket to Cart',
    },
  ];
}

export function buildBudgetBuilderStream(
  options: BudgetBuilderOptions = {}
): A2UIv1Message[] {
  const fullDataModel = buildBudgetBuilderDataModel(options);
  const components = buildBudgetBuilderComponents();

  const createMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    createSurface: {
      surfaceId: BUDGET_BUILDER_SURFACE_ID,
      catalogId: A2UI_BASIC_CATALOG_ID,
      sendDataModel: true,
      components: [
        {
          id: 'root',
          component: 'Column',
          children: ['header_card'],
        },
        {
          id: 'header_card',
          component: 'Card',
          child: 'planner_title_text',
        },
        {
          id: 'planner_title_text',
          component: 'Text',
          variant: 'body',
          text: '## Initializing Weekly Budget & Macro Planner...',
        },
      ],
      dataModel: {
        plannerTitle: fullDataModel.plannerTitle,
        plannerSubtitle: 'Preparing your weekly budget & nutrition plan...',
        weeklyBudget: fullDataModel.weeklyBudget,
        allocatedSpend: 0,
        remainingBudget: fullDataModel.weeklyBudget,
        isBudgetValid: true,
        householdGoals: fullDataModel.householdGoals,
        maxPrepMinutes: fullDataModel.maxPrepMinutes,
        customNote: fullDataModel.customNote,
        autoApplyPromo: fullDataModel.autoApplyPromo,
        promoCodeToApply: 'A2UIV1',
        weeklyNutrition: fullDataModel.weeklyNutrition,
        curatedBasket: [],
        lastActionConfirmation: 'Preparing your weekly plan...',
      },
    },
  };

  const updateComponentsMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateComponents: {
      surfaceId: BUDGET_BUILDER_SURFACE_ID,
      components,
    },
  };

  const updateDataModelMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateDataModel: {
      surfaceId: BUDGET_BUILDER_SURFACE_ID,
      path: '/',
      value: fullDataModel,
    },
  };

  return [createMsg, updateComponentsMsg, updateDataModelMsg];
}

export function recalculateBudgetBuilderDataModel(
  currentModel: Record<string, unknown>,
  _changedPath: string,
  _products?: Product[]
): Record<string, unknown> {
  const weeklyBudget = Number(currentModel.weeklyBudget ?? 140);
  const rawBasket = Array.isArray(currentModel.curatedBasket)
    ? (currentModel.curatedBasket as BudgetBasketItem[])
    : [];

  const includedItems = rawBasket.filter((item) => item.included !== false);
  const allocatedSpend = Number(
    includedItems.reduce((sum, item) => sum + Number(item.lineTotal ?? 0), 0).toFixed(2)
  );
  const remainingBudget = Number((weeklyBudget - allocatedSpend).toFixed(2));
  const isBudgetValid = allocatedSpend <= weeklyBudget;

  return {
    ...currentModel,
    weeklyBudget,
    allocatedSpend,
    remainingBudget,
    isBudgetValid,
    lastActionConfirmation: isBudgetValid
      ? `Budget valid: $${allocatedSpend.toFixed(2)} of $${weeklyBudget.toFixed(2)} allocated ($${remainingBudget.toFixed(2)} remaining) ✓`
      : `Validation alert: Basket ($${allocatedSpend.toFixed(2)}) exceeds $${weeklyBudget.toFixed(2)} budget cap by $${Math.abs(remainingBudget).toFixed(2)}`,
  };
}
