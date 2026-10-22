import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { Product, StoreId } from '../types/grocery';
import {
  freshCartMacroExpander,
  type MacroExpansionReport,
} from '../a2ui/macros/macroExpander';
import type { MealIngredientItem } from './mealPlannerScenario';

export const MACRO_SHOWCASE_SURFACE_ID = 'macro-showcase-surface' as const;

export type MacroKitStyleId = 'salmon-quinoa-kit' | 'pesto-pasta-kit';

export interface MacroShowcaseOptions {
  kitStyleId?: MacroKitStyleId;
  servings?: number;
  glutenFree?: boolean;
  organicOnly?: boolean;
  activeStoreId?: StoreId;
  products?: Product[];
}

interface KitIngredientBlueprint {
  defaultProductId: string;
  organicProductId: string;
  fallbackName: string;
  organicFallbackName: string;
  unitLabel: string;
  baseQtyFor4: number;
  defaultPrice: number;
  organicPrice: number;
}

const SALMON_QUINOA_KIT_BLUEPRINT: KitIngredientBlueprint[] = [
  {
    defaultProductId: 'prod-salmon-fillet',
    organicProductId: 'prod-atlantic-salmon',
    fallbackName: 'Wild Alaskan Sockeye Salmon Fillet',
    organicFallbackName: 'Fresh Atlantic Salmon Portions (Value Pack)',
    unitLabel: '1 lb fillet',
    baseQtyFor4: 2,
    defaultPrice: 14.99,
    organicPrice: 10.99,
  },
  {
    defaultProductId: 'prod-quinoa',
    organicProductId: 'prod-org-quinoa',
    fallbackName: 'Tri-Color Quinoa Grain',
    organicFallbackName: 'Organic Tri-Color Quinoa',
    unitLabel: '16 oz bag',
    baseQtyFor4: 1,
    defaultPrice: 4.99,
    organicPrice: 6.49,
  },
  {
    defaultProductId: 'prod-conv-avocado',
    organicProductId: 'prod-org-avocado',
    fallbackName: 'Ripe Hass Avocados',
    organicFallbackName: 'Organic Hass Avocados (Bag)',
    unitLabel: '4 ct bag',
    baseQtyFor4: 1,
    defaultPrice: 3.99,
    organicPrice: 5.49,
  },
  {
    defaultProductId: 'prod-conv-spinach',
    organicProductId: 'prod-baby-spinach',
    fallbackName: 'Tender Leaf Spinach',
    organicFallbackName: 'USDA Organic Baby Spinach',
    unitLabel: '5 oz clamshell',
    baseQtyFor4: 1,
    defaultPrice: 2.99,
    organicPrice: 4.49,
  },
];

const PESTO_GREENS_KIT_BLUEPRINT: KitIngredientBlueprint[] = [
  {
    defaultProductId: 'prod-sourdough-boule',
    organicProductId: 'prod-gf-multigrain-bread',
    fallbackName: 'San Francisco Country Sourdough Boule',
    organicFallbackName: 'Gluten-Free Ancient Grain Sliced Loaf',
    unitLabel: '24 oz loaf',
    baseQtyFor4: 1,
    defaultPrice: 5.99,
    organicPrice: 6.99,
  },
  {
    defaultProductId: 'prod-cherry-tomatoes',
    organicProductId: 'prod-org-cherry-tomatoes',
    fallbackName: 'Sweet Cherry Tomatoes',
    organicFallbackName: 'Organic Heirloom Cherry Tomatoes',
    unitLabel: '10 oz pint',
    baseQtyFor4: 2,
    defaultPrice: 3.49,
    organicPrice: 4.99,
  },
  {
    defaultProductId: 'prod-extra-virgin-olive-oil',
    organicProductId: 'prod-avocado-oil',
    fallbackName: 'Cold-Pressed Extra Virgin Olive Oil',
    organicFallbackName: '100% Pure Expeller-Pressed Avocado Oil',
    unitLabel: '16.9 fl oz bottle',
    baseQtyFor4: 1,
    defaultPrice: 13.99,
    organicPrice: 14.99,
  },
  {
    defaultProductId: 'prod-conv-spinach',
    organicProductId: 'prod-baby-spinach',
    fallbackName: 'Tender Leaf Spinach',
    organicFallbackName: 'USDA Organic Baby Spinach',
    unitLabel: '5 oz clamshell',
    baseQtyFor4: 1,
    defaultPrice: 2.99,
    organicPrice: 4.49,
  },
];

function findProduct(products: Product[] | undefined, productId: string): Product | undefined {
  if (!products || products.length === 0) return undefined;
  return products.find((p) => p.id === productId);
}

export function buildMacroShowcaseDataModel(
  options: MacroShowcaseOptions = {}
): Record<string, unknown> {
  const kitStyleId: MacroKitStyleId = options.kitStyleId ?? 'salmon-quinoa-kit';
  const servings = Math.max(1, Math.min(8, Math.round(options.servings ?? 4)));
  const glutenFree = options.glutenFree ?? true;
  const organicOnly = options.organicOnly ?? false;
  const products = options.products;

  const isSalmonKit = kitStyleId === 'salmon-quinoa-kit';
  const blueprint = isSalmonKit ? SALMON_QUINOA_KIT_BLUEPRINT : PESTO_GREENS_KIT_BLUEPRINT;
  const scaleFactor = servings / 4;

  const ingredients: MealIngredientItem[] = blueprint.map((item) => {
    const useOrganic = organicOnly;
    const chosenId = useOrganic ? item.organicProductId : item.defaultProductId;
    const swapId = useOrganic ? item.defaultProductId : item.organicProductId;

    const resolvedProd = findProduct(products, chosenId);
    const unitPrice = resolvedProd
      ? resolvedProd.price
      : useOrganic
        ? item.organicPrice
        : item.defaultPrice;
    const name = resolvedProd
      ? resolvedProd.name
      : useOrganic
        ? item.organicFallbackName
        : item.fallbackName;
    const unitText = resolvedProd ? resolvedProd.unit : item.unitLabel;

    const scaledQty = Math.max(1, Math.ceil(item.baseQtyFor4 * scaleFactor));
    const linePrice = Number((unitPrice * scaledQty).toFixed(2));

    return {
      productId: chosenId,
      swapProductId: swapId,
      name,
      unit: `${scaledQty}x ${unitText} (for ${servings} servings)`,
      baseQty: item.baseQtyFor4,
      scaledQty,
      unitPrice,
      price: linePrice,
      isOrganic: useOrganic || (resolvedProd?.dietaryTags.includes('organic') ?? false),
      checked: true,
      swapLabel: useOrganic ? 'Use Standard' : 'Swap Organic',
    };
  });

  const estimatedTotal = Number(
    ingredients
      .filter((ing) => ing.checked)
      .reduce((sum, ing) => sum + ing.price, 0)
      .toFixed(2)
  );

  const pairingProd = findProduct(
    products,
    isSalmonKit ? 'prod-lemons' : 'prod-dark-chocolate-almonds'
  );

  return {
    recipeTitle: isSalmonKit
      ? '## Chef’s Wild Salmon & Herb Quinoa Meal Kit'
      : '## Artisan Sourdough, Heirloom Tomato & Greens Kit',
    recipeSubtitle: isSalmonKit
      ? 'Pre-portioned 20-minute dinner kit · Scale servings or swap any ingredient to USDA Organic in 1 click'
      : 'Mediterranean market kit · Cold-pressed olive oil, blistered cherry tomatoes, and tender greens',
    seasonalBadgeText: isSalmonKit ? '🌟 Chef’s Seasonal Pick' : '🌿 Market Favorite',
    selectedKitStyle: [kitStyleId],
    servings,
    dietary: {
      glutenFree,
      organicOnly,
    },
    nutrition: isSalmonKit
      ? {
          calories: 560,
          proteinGrams: 44,
          carbsGrams: 34,
          fatGrams: 24,
          fiberGrams: 7,
          dailyCalorieTarget: 2000,
        }
      : {
          calories: 510,
          proteinGrams: 18,
          carbsGrams: 48,
          fatGrams: 26,
          fiberGrams: 8,
          dailyCalorieTarget: 2000,
        },
    ingredients,
    featuredPairing: {
      productId: pairingProd?.id ?? (isSalmonKit ? 'prod-lemons' : 'prod-dark-chocolate-almonds'),
      title:
        pairingProd?.name ??
        (isSalmonKit ? 'Fresh Meyer Lemons (2 lb Bag)' : 'Dark Chocolate Sea Salt Almonds'),
      price: pairingProd?.price ?? (isSalmonKit ? 3.99 : 6.49),
      originalPrice: pairingProd?.originalPrice ?? (isSalmonKit ? 4.99 : 7.99),
      unit: pairingProd?.unit ?? (isSalmonKit ? '2 lb bag' : '8 oz pouch'),
      badgeText: isSalmonKit ? 'Bright Citrus Finish · Save $1.00' : 'Sweet Finish · Save $1.50',
      imageUrl:
        pairingProd?.imageUrl ??
        'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=500&q=80',
    },
    estimatedTotal,
    perServingCost: Number((estimatedTotal / servings).toFixed(2)),
    lastActionConfirmation: `${ingredients.length} chef-selected ingredients ready for ${servings} servings ($${estimatedTotal.toFixed(2)})`,
  };
}

/**
 * Builds the unexpanded A2UI v1.0 component list authored with reusable `@macro:*` components:
 * - `@macro:RecipeBundleCard` (with `headerSlot: "chef_seasonal_badge"` demonstrating single-slot boundary preservation)
 * - `@macro:MacroNutrientBar` (with `extraControlsSlot: ["cb_gluten_free", "cb_organic_only"]` demonstrating multi-slot list coercion)
 * - 4x `@macro:SmartSwapRow` (demonstrating parameterized `@path` bindings, `@call: formatCurrency`, and action string coercion)
 * - `@macro:OneClickBundleFooter` (demonstrating reusable checkout footer macro with shorthand action coercion)
 */
export function buildMacroShowcaseComponents(): A2UIComponentBase[] {
  return [
    {
      id: 'root',
      component: 'Column',
      children: [
        'kit_hero_macro',
        'kit_nutrition_macro',
        'kit_ingredients_card',
        'kit_pairing_deal',
        'kit_footer_macro',
      ],
    },
    // Slotted external component passed into `@macro:RecipeBundleCard` via `headerSlot`
    {
      id: 'chef_seasonal_badge',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/seasonalBadgeText' },
    },
    // Macro #1: `@macro:RecipeBundleCard`
    {
      id: 'kit_hero_macro',
      component: '@macro:RecipeBundleCard',
      titlePath: '/recipeTitle',
      subtitlePath: '/recipeSubtitle',
      prepBadgeText: '⏱️ 20-Min Chef Meal Kit · Fresh Local Ingredients',
      stylePickerPath: '/selectedKitStyle',
      servingsPath: '/servings',
      headerSlot: 'chef_seasonal_badge',
      styleOptions: [
        { label: 'Salmon & Herb Quinoa Kit', value: 'salmon-quinoa-kit' },
        { label: 'Artisan Sourdough & Tomato Kit', value: 'pesto-pasta-kit' },
      ],
    },
    // Slotted external components passed into `@macro:MacroNutrientBar` via `extraControlsSlot`
    {
      id: 'cb_gluten_free',
      component: 'CheckBox',
      label: 'Gluten-Free Friendly',
      value: { '@path': '/dietary/glutenFree' },
    },
    {
      id: 'cb_organic_only',
      component: 'CheckBox',
      label: '100% USDA Organic Upgrade',
      value: { '@path': '/dietary/organicOnly' },
    },
    // Macro #2: `@macro:MacroNutrientBar`
    {
      id: 'kit_nutrition_macro',
      component: '@macro:MacroNutrientBar',
      caloriesPath: '/nutrition/calories',
      proteinPath: '/nutrition/proteinGrams',
      carbsPath: '/nutrition/carbsGrams',
      fatPath: '/nutrition/fatGrams',
      fiberPath: '/nutrition/fiberGrams',
      servingsPath: '/servings',
      dailyCalorieTargetPath: '/nutrition/dailyCalorieTarget',
      extraControlsSlot: ['cb_gluten_free', 'cb_organic_only'],
    },
    // Container card holding 4 instances of `@macro:SmartSwapRow`
    {
      id: 'kit_ingredients_card',
      component: 'Card',
      child: 'kit_ingredients_col',
    },
    {
      id: 'kit_ingredients_col',
      component: 'Column',
      children: [
        'kit_ingredients_heading',
        'swap_row_0',
        'swap_divider_0',
        'swap_row_1',
        'swap_divider_1',
        'swap_row_2',
        'swap_divider_2',
        'swap_row_3',
      ],
    },
    {
      id: 'kit_ingredients_heading',
      component: 'Text',
      variant: 'body',
      text: '### Included Kit Ingredients (Uncheck items you already have at home)',
    },
    // Macro #3a..3d: 4 instances of `@macro:SmartSwapRow`
    {
      id: 'swap_row_0',
      component: '@macro:SmartSwapRow',
      itemIndex: 0,
      namePath: '/ingredients/0/name',
      unitPath: '/ingredients/0/unit',
      pricePath: '/ingredients/0/price',
      checkedPath: '/ingredients/0/checked',
      swapLabelPath: '/ingredients/0/swapLabel',
      swapAction: 'swap_macro_ingredient',
    },
    {
      id: 'swap_divider_0',
      component: 'Divider',
      axis: 'horizontal',
    },
    {
      id: 'swap_row_1',
      component: '@macro:SmartSwapRow',
      itemIndex: 1,
      namePath: '/ingredients/1/name',
      unitPath: '/ingredients/1/unit',
      pricePath: '/ingredients/1/price',
      checkedPath: '/ingredients/1/checked',
      swapLabelPath: '/ingredients/1/swapLabel',
      swapAction: 'swap_macro_ingredient',
    },
    {
      id: 'swap_divider_1',
      component: 'Divider',
      axis: 'horizontal',
    },
    {
      id: 'swap_row_2',
      component: '@macro:SmartSwapRow',
      itemIndex: 2,
      namePath: '/ingredients/2/name',
      unitPath: '/ingredients/2/unit',
      pricePath: '/ingredients/2/price',
      checkedPath: '/ingredients/2/checked',
      swapLabelPath: '/ingredients/2/swapLabel',
      swapAction: 'swap_macro_ingredient',
    },
    {
      id: 'swap_divider_2',
      component: 'Divider',
      axis: 'horizontal',
    },
    {
      id: 'swap_row_3',
      component: '@macro:SmartSwapRow',
      itemIndex: 3,
      namePath: '/ingredients/3/name',
      unitPath: '/ingredients/3/unit',
      pricePath: '/ingredients/3/price',
      checkedPath: '/ingredients/3/checked',
      swapLabelPath: '/ingredients/3/swapLabel',
      swapAction: 'swap_macro_ingredient',
    },
    // Featured Chef Pairing card
    {
      id: 'kit_pairing_deal',
      component: 'ProductDealCard',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      productId: { '@path': '/featuredPairing/productId' },
      title: { '@path': '/featuredPairing/title' },
      price: { '@path': '/featuredPairing/price' },
      originalPrice: { '@path': '/featuredPairing/originalPrice' },
      unit: { '@path': '/featuredPairing/unit' },
      badgeText: { '@path': '/featuredPairing/badgeText' },
      imageUrl: { '@path': '/featuredPairing/imageUrl' },
      actionLabel: 'Add Pairing to Cart',
      action: {
        event: {
          name: 'add_pairing_item',
          userMessage: 'Add chef pairing item to cart',
          context: {
            productId: { '@path': '/featuredPairing/productId' },
            title: { '@path': '/featuredPairing/title' },
            quantity: 1,
          },
        },
      },
    },
    // Macro #4: `@macro:OneClickBundleFooter`
    {
      id: 'kit_footer_macro',
      component: '@macro:OneClickBundleFooter',
      totalLabel: '**Estimated Meal Kit Total**',
      totalValuePath: '/estimatedTotal',
      statusTextPath: '/lastActionConfirmation',
      ctaLabel: 'Add Complete Chef Meal Kit to Cart',
      ctaAction: 'add_recipe_bundle_to_cart',
    },
  ];
}

/**
 * Returns a snapshot of the macro expansion report for the Chef Meal Kit scenario so the UI
 * can show an interactive "Macro Expansion Inspector" pill.
 */
export function getMacroShowcaseExpansionPreview(): {
  rawComponents: A2UIComponentBase[];
  expandedComponents: A2UIComponentBase[];
  report: MacroExpansionReport;
} {
  const rawComponents = buildMacroShowcaseComponents();
  const { components: expandedComponents, report } = freshCartMacroExpander.expandComponentList(
    rawComponents,
    MACRO_SHOWCASE_SURFACE_ID
  );
  return { rawComponents, expandedComponents, report };
}

/**
 * Generates the 3-step A2UI v1.0 streaming message sequence for the Chef Meal Kit Macro scenario.
 * Note that `updateComponents` emits the unexpanded `@macro:*` components directly into the stream;
 * `SurfaceManager.processA2UIMessage` intercepts and expands them via `freshCartMacroExpander`!
 */
export function buildMacroShowcaseStream(options: MacroShowcaseOptions = {}): A2UIv1Message[] {
  const fullDataModel = buildMacroShowcaseDataModel(options);
  const macroComponents = buildMacroShowcaseComponents();

  const createMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    createSurface: {
      surfaceId: MACRO_SHOWCASE_SURFACE_ID,
      catalogId: A2UI_BASIC_CATALOG_ID,
      sendDataModel: true,
      components: [
        {
          id: 'root',
          component: 'Column',
          children: ['loading_card'],
        },
        {
          id: 'loading_card',
          component: 'Card',
          child: 'loading_text',
        },
        {
          id: 'loading_text',
          component: 'Text',
          variant: 'body',
          text: { '@path': '/recipeTitle' },
        },
      ],
      dataModel: {
        recipeTitle: fullDataModel.recipeTitle,
        recipeSubtitle: 'Assembling your customizable Chef Meal Kit...',
        seasonalBadgeText: fullDataModel.seasonalBadgeText,
        selectedKitStyle: fullDataModel.selectedKitStyle,
        servings: fullDataModel.servings,
        dietary: fullDataModel.dietary,
        nutrition: fullDataModel.nutrition,
        ingredients: fullDataModel.ingredients,
        featuredPairing: fullDataModel.featuredPairing,
        estimatedTotal: fullDataModel.estimatedTotal,
        lastActionConfirmation: 'Preparing kit ingredients...',
      },
    },
  };

  const updateComponentsMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateComponents: {
      surfaceId: MACRO_SHOWCASE_SURFACE_ID,
      components: macroComponents,
    },
  };

  const updateDataModelMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateDataModel: {
      surfaceId: MACRO_SHOWCASE_SURFACE_ID,
      path: '/',
      value: fullDataModel,
    },
  };

  return [createMsg, updateComponentsMsg, updateDataModelMsg];
}

/**
 * Reactive recalculator invoked when the user interacts with `/servings`, `/selectedKitStyle`,
 * `/dietary/organicOnly`, or `/ingredients/{i}/checked` inside the expanded Macro Meal Kit surface.
 */
export function recalculateMacroShowcaseDataModel(
  currentModel: Record<string, unknown>,
  changedPath: string,
  products?: Product[]
): Record<string, unknown> {
  const selectedArr = Array.isArray(currentModel.selectedKitStyle)
    ? (currentModel.selectedKitStyle as string[])
    : ['salmon-quinoa-kit'];
  const kitStyleId: MacroKitStyleId =
    selectedArr[0] === 'pesto-pasta-kit' ? 'pesto-pasta-kit' : 'salmon-quinoa-kit';
  const servings = Math.max(1, Math.min(8, Number(currentModel.servings ?? 4)));
  const dietary = (currentModel.dietary as { glutenFree?: boolean; organicOnly?: boolean }) ?? {};
  const glutenFree = Boolean(dietary.glutenFree ?? true);
  const organicOnly = Boolean(dietary.organicOnly ?? false);

  if (
    changedPath.startsWith('/selectedKitStyle') ||
    changedPath === '/dietary/organicOnly'
  ) {
    const rebuilt = buildMacroShowcaseDataModel({
      kitStyleId,
      servings,
      glutenFree,
      organicOnly,
      products,
    });
    rebuilt.lastActionConfirmation = organicOnly
      ? `Upgraded all kit ingredients to USDA Organic for ${servings} servings ✓`
      : `Updated Chef Meal Kit for ${servings} servings ✓`;
    return rebuilt;
  }

  const rawIngredients = Array.isArray(currentModel.ingredients)
    ? (currentModel.ingredients as MealIngredientItem[])
    : [];
  const scaleFactor = servings / 4;

  const updatedIngredients: MealIngredientItem[] = rawIngredients.map((ing) => {
    const baseQty = Number(ing.baseQty ?? 1);
    const scaledQty = Math.max(1, Math.ceil(baseQty * scaleFactor));
    const unitPrice = Number(ing.unitPrice ?? 4.99);
    const linePrice = Number((unitPrice * scaledQty).toFixed(2));
    const prod = findProduct(products, ing.productId);
    const baseUnitLabel =
      prod?.unit ?? ing.unit.replace(/^\d+x\s+/, '').replace(/\s+\(for.*\)$/, '');

    return {
      ...ing,
      scaledQty,
      price: linePrice,
      unit: `${scaledQty}x ${baseUnitLabel} (for ${servings} servings)`,
    };
  });

  const checkedCount = updatedIngredients.filter((i) => i.checked !== false).length;
  const estimatedTotal = Number(
    updatedIngredients
      .filter((i) => i.checked !== false)
      .reduce((sum, i) => sum + Number(i.price ?? 0), 0)
      .toFixed(2)
  );

  return {
    ...currentModel,
    servings,
    ingredients: updatedIngredients,
    estimatedTotal,
    perServingCost: Number((estimatedTotal / servings).toFixed(2)),
    lastActionConfirmation: `${checkedCount} of ${updatedIngredients.length} kit ingredients selected · ${servings} servings ($${estimatedTotal.toFixed(2)})`,
  };
}
