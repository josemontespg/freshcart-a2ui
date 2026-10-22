import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { Product, StoreId } from '../types/grocery';

export const MEAL_PLANNER_SURFACE_ID = 'meal-planner-surface' as const;

export type MealPlanStyleId = 'mediterranean-salmon' | 'high-protein-bowls';

export interface MealIngredientItem {
  productId: string;
  swapProductId: string;
  name: string;
  unit: string;
  baseQty: number;
  scaledQty: number;
  unitPrice: number;
  price: number;
  isOrganic: boolean;
  checked: boolean;
  swapLabel: string;
}

export interface MealPlannerOptions {
  styleId?: MealPlanStyleId;
  servings?: number;
  glutenFree?: boolean;
  organicOnly?: boolean;
  activeStoreId?: StoreId;
  products?: Product[];
}

interface RecipeBlueprintItem {
  defaultProductId: string;
  organicProductId: string;
  fallbackName: string;
  organicFallbackName: string;
  unitLabel: string;
  baseQtyFor4: number;
  defaultPrice: number;
  organicPrice: number;
}

const MEDITERRANEAN_SALMON_BLUEPRINT: RecipeBlueprintItem[] = [
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
  {
    defaultProductId: 'prod-cherry-tomatoes',
    organicProductId: 'prod-org-cherry-tomatoes',
    fallbackName: 'Sweet Cherry Tomatoes',
    organicFallbackName: 'Organic Heirloom Cherry Tomatoes',
    unitLabel: '10 oz pint',
    baseQtyFor4: 1,
    defaultPrice: 3.49,
    organicPrice: 4.99,
  },
  {
    defaultProductId: 'prod-lemons',
    organicProductId: 'prod-english-cucumber',
    fallbackName: 'Fresh Meyer Lemons',
    organicFallbackName: 'Organic Seedless English Cucumber',
    unitLabel: '2 lb bag',
    baseQtyFor4: 1,
    defaultPrice: 3.99,
    organicPrice: 2.49,
  },
];

const HIGH_PROTEIN_BOWLS_BLUEPRINT: RecipeBlueprintItem[] = [
  {
    defaultProductId: 'prod-chicken-breast',
    organicProductId: 'prod-org-chicken-breast',
    fallbackName: 'Boneless Skinless Chicken Breast',
    organicFallbackName: 'Organic Air-Chilled Chicken Breast',
    unitLabel: '1.5 lb pack',
    baseQtyFor4: 2,
    defaultPrice: 7.99,
    organicPrice: 11.49,
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
    defaultProductId: 'prod-greek-yogurt',
    organicProductId: 'prod-org-greek-yogurt',
    fallbackName: 'Plain Nonfat Greek Yogurt (0%)',
    organicFallbackName: 'Organic Whole Milk Greek Yogurt',
    unitLabel: '32 oz tub',
    baseQtyFor4: 1,
    defaultPrice: 5.49,
    organicPrice: 6.99,
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
  {
    defaultProductId: 'prod-conv-eggs',
    organicProductId: 'prod-pasture-eggs',
    fallbackName: ' Cage-Free Large Brown Eggs',
    organicFallbackName: 'Organic Pasture-Raised Brown Eggs',
    unitLabel: '12 ct carton',
    baseQtyFor4: 1,
    defaultPrice: 4.29,
    organicPrice: 6.99,
  },
];

function lookupProduct(products: Product[] | undefined, productId: string): Product | undefined {
  if (!products || products.length === 0) return undefined;
  return products.find((p) => p.id === productId);
}

export function buildMealPlannerDataModel(options: MealPlannerOptions = {}): Record<string, unknown> {
  const styleId: MealPlanStyleId = options.styleId ?? 'mediterranean-salmon';
  const servings = Math.max(1, Math.min(12, Math.round(options.servings ?? 4)));
  const glutenFree = options.glutenFree ?? true;
  const organicOnly = options.organicOnly ?? false;
  const products = options.products;

  const isSalmon = styleId === 'mediterranean-salmon';
  const blueprint = isSalmon ? MEDITERRANEAN_SALMON_BLUEPRINT : HIGH_PROTEIN_BOWLS_BLUEPRINT;

  const scaleFactor = servings / 4;

  const ingredients: MealIngredientItem[] = blueprint.map((item) => {
    const useOrganic = organicOnly;
    const chosenId = useOrganic ? item.organicProductId : item.defaultProductId;
    const swapId = useOrganic ? item.defaultProductId : item.organicProductId;

    const resolvedProd = lookupProduct(products, chosenId);
    const unitPrice = resolvedProd ? resolvedProd.price : useOrganic ? item.organicPrice : item.defaultPrice;
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

  const pairingProd = lookupProduct(
    products,
    isSalmon ? 'prod-extra-virgin-olive-oil' : 'prod-dark-chocolate-almonds'
  );

  return {
    recipeTitle: isSalmon
      ? '## Mediterranean Herb Salmon & Quinoa Dinner'
      : '## High-Protein Harvest Chicken & Avocado Bowls',
    recipeSubtitle: isSalmon
      ? 'Chef-curated 25-minute dinner · Adjust servings to scale ingredients automatically'
      : 'Balanced meal prep bowls · 52g protein per serving · Ready in 20 minutes',
    selectedMealPlan: [styleId],
    servings,
    prepTimeMinutes: isSalmon ? 25 : 20,
    dietary: {
      glutenFree,
      organicOnly,
    },
    nutrition: isSalmon
      ? {
          calories: 590,
          proteinGrams: 44,
          carbsGrams: 36,
          fatGrams: 26,
          fiberGrams: 7,
          dailyCalorieTarget: 2000,
        }
      : {
          calories: 640,
          proteinGrams: 52,
          carbsGrams: 42,
          fatGrams: 22,
          fiberGrams: 9,
          dailyCalorieTarget: 2000,
        },
    ingredients,
    featuredPairing: {
      productId: pairingProd?.id ?? (isSalmon ? 'prod-extra-virgin-olive-oil' : 'prod-dark-chocolate-almonds'),
      title: pairingProd?.name ?? (isSalmon ? 'Cold-Pressed Extra Virgin Olive Oil' : 'Dark Chocolate Sea Salt Almonds'),
      price: pairingProd?.price ?? (isSalmon ? 13.99 : 6.49),
      originalPrice: pairingProd?.originalPrice ?? (isSalmon ? 16.99 : 7.99),
      unit: pairingProd?.unit ?? (isSalmon ? '16.9 fl oz bottle' : '8 oz pouch'),
      badgeText: isSalmon ? 'Chef Pairing · Save $3.00' : 'Post-Prep Treat · Save $1.50',
      imageUrl:
        pairingProd?.imageUrl ??
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
    },
    estimatedTotal,
    perServingCost: Number((estimatedTotal / servings).toFixed(2)),
    bundleAdded: false,
    lastActionConfirmation: `${ingredients.length} fresh ingredients ready for ${servings} servings`,
  };
}

export function buildMealPlannerComponents(): A2UIComponentBase[] {
  return [
    {
      id: 'root',
      component: 'Column',
      children: [
        'header_card',
        'controls_card',
        'nutrition_widget',
        'ingredients_card',
        'pairing_deal_card',
        'footer_action_card',
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
      children: ['title_text', 'subtitle_text', 'meal_style_picker'],
    },
    {
      id: 'title_text',
      component: 'Text',
      variant: 'body',
      text: { '@path': '/recipeTitle' },
    },
    {
      id: 'subtitle_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/recipeSubtitle' },
    },
    {
      id: 'meal_style_picker',
      component: 'ChoicePicker',
      label: 'Recipe Style',
      variant: 'mutuallyExclusive',
      displayStyle: 'chips',
      value: { '@path': '/selectedMealPlan' },
      options: [
        { label: 'Mediterranean Salmon & Quinoa', value: 'mediterranean-salmon' },
        { label: 'High-Protein Chicken Bowls', value: 'high-protein-bowls' },
      ],
    },
    {
      id: 'controls_card',
      component: 'Card',
      child: 'controls_col',
    },
    {
      id: 'controls_col',
      component: 'Column',
      children: ['servings_slider', 'dietary_divider', 'dietary_row'],
    },
    {
      id: 'servings_slider',
      component: 'Slider',
      label: 'Servings (scales ingredient quantities automatically)',
      min: 1,
      max: 12,
      steps: 11,
      value: { '@path': '/servings' },
    },
    {
      id: 'dietary_divider',
      component: 'Divider',
      axis: 'horizontal',
    },
    {
      id: 'dietary_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['cb_gluten_free', 'cb_organic_only'],
    },
    {
      id: 'cb_gluten_free',
      component: 'CheckBox',
      label: 'Strict Gluten-Free',
      value: { '@path': '/dietary/glutenFree' },
    },
    {
      id: 'cb_organic_only',
      component: 'CheckBox',
      label: '100% USDA Organic Upgrade',
      value: { '@path': '/dietary/organicOnly' },
    },
    {
      id: 'nutrition_widget',
      component: 'NutritionSummary',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      calories: { '@path': '/nutrition/calories' },
      proteinGrams: { '@path': '/nutrition/proteinGrams' },
      carbsGrams: { '@path': '/nutrition/carbsGrams' },
      fatGrams: { '@path': '/nutrition/fatGrams' },
      fiberGrams: { '@path': '/nutrition/fiberGrams' },
      servings: { '@path': '/servings' },
      dailyCalorieTarget: { '@path': '/nutrition/dailyCalorieTarget' },
    },
    {
      id: 'ingredients_card',
      component: 'Card',
      child: 'ingredients_col',
    },
    {
      id: 'ingredients_col',
      component: 'Column',
      children: ['ingredients_header_text', 'ingredients_list'],
    },
    {
      id: 'ingredients_header_text',
      component: 'Text',
      variant: 'body',
      text: '### Recipe Ingredients (Uncheck items you already have at home)',
    },
    {
      id: 'ingredients_list',
      component: 'List',
      direction: 'vertical',
      children: {
        componentId: 'ingredient_row',
        path: '/ingredients',
      },
    },
    {
      id: 'ingredient_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['ing_left_row', 'ing_right_row'],
    },
    {
      id: 'ing_left_row',
      component: 'Row',
      justify: 'start',
      align: 'center',
      weight: 1,
      children: ['ing_index_badge', 'ing_meta_col'],
    },
    {
      id: 'ing_index_badge',
      component: 'Text',
      variant: 'caption',
      text: {
        '@call': 'formatNumber',
        args: {
          value: { '@call': '@index', args: { offset: 1 } },
          decimals: 0,
        },
      },
    },
    {
      id: 'ing_meta_col',
      component: 'Column',
      children: ['ing_checkbox', 'ing_unit_text'],
    },
    {
      id: 'ing_checkbox',
      component: 'CheckBox',
      label: { '@path': 'name' },
      value: { '@path': 'checked' },
    },
    {
      id: 'ing_unit_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': 'unit' },
    },
    {
      id: 'ing_right_row',
      component: 'Row',
      justify: 'end',
      align: 'center',
      children: ['ing_price_text', 'ing_swap_btn'],
    },
    {
      id: 'ing_price_text',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatCurrency',
        args: {
          value: { '@path': 'price' },
          currency: 'USD',
        },
      },
    },
    {
      id: 'ing_swap_btn',
      component: 'Button',
      variant: 'default',
      child: 'ing_swap_btn_label',
      action: {
        event: {
          name: 'swap_ingredient',
          userMessage: 'Swap recipe ingredient SKU',
          context: {
            index: { '@call': '@index' },
            itemNumber: { '@call': '@index', args: { offset: 1 } },
            productId: { '@path': 'productId' },
            swapProductId: { '@path': 'swapProductId' },
            currentName: { '@path': 'name' },
          },
        },
      },
    },
    {
      id: 'ing_swap_btn_label',
      component: 'Text',
      variant: 'caption',
      text: { '@path': 'swapLabel' },
    },
    {
      id: 'pairing_deal_card',
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
    {
      id: 'footer_action_card',
      component: 'Card',
      child: 'footer_col',
    },
    {
      id: 'footer_col',
      component: 'Column',
      children: ['footer_totals_row', 'status_confirm_text', 'btn_add_bundle'],
    },
    {
      id: 'footer_totals_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['total_label_text', 'total_cost_text'],
    },
    {
      id: 'total_label_text',
      component: 'Text',
      variant: 'body',
      text: '**Estimated Bundle Total**',
    },
    {
      id: 'total_cost_text',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatCurrency',
        args: {
          value: { '@path': '/estimatedTotal' },
          currency: 'USD',
        },
      },
    },
    {
      id: 'status_confirm_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/lastActionConfirmation' },
    },
    {
      id: 'btn_add_bundle',
      component: 'Button',
      variant: 'primary',
      child: 'btn_add_bundle_label',
      action: {
        event: {
          name: 'add_recipe_bundle_to_cart',
          userMessage: {
            '@call': 'formatString',
            args: {
              value: 'Add ${/servings}-serving recipe bundle to FreshCart',
            },
          },
          context: {
            servings: { '@path': '/servings' },
            recipeTitle: { '@path': '/recipeTitle' },
            dietary: { '@path': '/dietary' },
            ingredients: { '@path': '/ingredients' },
            estimatedTotal: { '@path': '/estimatedTotal' },
          },
        },
      },
    },
    {
      id: 'btn_add_bundle_label',
      component: 'Text',
      variant: 'body',
      text: 'Add Recipe Ingredients to Cart',
    },
  ];
}

/**
 * Generates the 3-step A2UI v1.0 streaming message sequence for the Meal Planner scenario:
 * 1. `createSurface` (initializes surface & skeleton dataModel)
 * 2. `updateComponents` (streams full interactive component tree)
 * 3. `updateDataModel` (streams full SKU & nutrition data model)
 */
export function buildMealPlannerStream(options: MealPlannerOptions = {}): A2UIv1Message[] {
  const fullDataModel = buildMealPlannerDataModel(options);
  const components = buildMealPlannerComponents();

  const createMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    createSurface: {
      surfaceId: MEAL_PLANNER_SURFACE_ID,
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
          child: 'title_text',
        },
        {
          id: 'title_text',
          component: 'Text',
          variant: 'body',
          text: { '@path': '/recipeTitle' },
        },
      ],
      dataModel: {
        recipeTitle: fullDataModel.recipeTitle,
        recipeSubtitle: 'Preparing recipe ingredients for your kitchen...',
        selectedMealPlan: fullDataModel.selectedMealPlan,
        servings: fullDataModel.servings,
        dietary: fullDataModel.dietary,
        nutrition: fullDataModel.nutrition,
        ingredients: [],
        featuredPairing: fullDataModel.featuredPairing,
        estimatedTotal: 0,
        lastActionConfirmation: 'Preparing your recipe...',
      },
    },
  };

  const updateComponentsMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateComponents: {
      surfaceId: MEAL_PLANNER_SURFACE_ID,
      components,
    },
  };

  const updateDataModelMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateDataModel: {
      surfaceId: MEAL_PLANNER_SURFACE_ID,
      path: '/',
      value: fullDataModel,
    },
  };

  return [createMsg, updateComponentsMsg, updateDataModelMsg];
}

/**
 * Reactive recalculator invoked when the user changes `/servings`, `/selectedMealPlan`,
 * `/dietary/organicOnly`, `/dietary/glutenFree`, or `/ingredients/{i}/checked` via two-way bindings.
 */
export function recalculateMealPlannerDataModel(
  currentModel: Record<string, unknown>,
  changedPath: string,
  products?: Product[]
): Record<string, unknown> {
  const selectedArr = Array.isArray(currentModel.selectedMealPlan)
    ? (currentModel.selectedMealPlan as string[])
    : ['mediterranean-salmon'];
  const styleId: MealPlanStyleId =
    selectedArr[0] === 'high-protein-bowls' ? 'high-protein-bowls' : 'mediterranean-salmon';
  const servings = Math.max(1, Math.min(12, Number(currentModel.servings ?? 4)));
  const dietary = (currentModel.dietary as { glutenFree?: boolean; organicOnly?: boolean }) ?? {};
  const glutenFree = Boolean(dietary.glutenFree ?? true);
  const organicOnly = Boolean(dietary.organicOnly ?? false);

  // If the user switched meal plan style or toggled organicOnly, rebuild from blueprint while keeping servings
  if (
    changedPath.startsWith('/selectedMealPlan') ||
    changedPath === '/dietary/organicOnly'
  ) {
    const rebuilt = buildMealPlannerDataModel({
      styleId,
      servings,
      glutenFree,
      organicOnly,
      products,
    });
    rebuilt.lastActionConfirmation = organicOnly
      ? `Upgraded all ingredients to USDA Organic for ${servings} servings ✓`
      : `Updated recipe plan for ${servings} servings ✓`;
    return rebuilt;
  }

  // Otherwise scale existing ingredients in place so individual swaps and check states are preserved
  const rawIngredients = Array.isArray(currentModel.ingredients)
    ? (currentModel.ingredients as MealIngredientItem[])
    : [];
  const scaleFactor = servings / 4;

  const updatedIngredients: MealIngredientItem[] = rawIngredients.map((ing) => {
    const baseQty = Number(ing.baseQty ?? 1);
    const scaledQty = Math.max(1, Math.ceil(baseQty * scaleFactor));
    const unitPrice = Number(ing.unitPrice ?? 4.99);
    const linePrice = Number((unitPrice * scaledQty).toFixed(2));
    const prod = lookupProduct(products, ing.productId);
    const baseUnitLabel = prod?.unit ?? ing.unit.replace(/^\d+x\s+/, '').replace(/\s+\(for.*\)$/, '');

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
    lastActionConfirmation: `${checkedCount} of ${updatedIngredients.length} ingredients selected · ${servings} servings ($${estimatedTotal.toFixed(2)})`,
  };
}

/**
 * Swaps a single ingredient row between its current SKU and its alternative SKU when `swap_ingredient` fires.
 */
export function swapMealIngredientInModel(
  currentModel: Record<string, unknown>,
  index: number,
  products?: Product[]
): Record<string, unknown> {
  const rawIngredients = Array.isArray(currentModel.ingredients)
    ? [...(currentModel.ingredients as MealIngredientItem[])]
    : [];
  const target = rawIngredients[index];
  if (!target) return currentModel;

  const newProductId = target.swapProductId || 'prod-org-avocado';
  const prevProductId = target.productId;
  const resolvedNew = lookupProduct(products, newProductId);

  const newUnitPrice = resolvedNew ? resolvedNew.price : Number((target.unitPrice * 1.15).toFixed(2));
  const newName = resolvedNew ? resolvedNew.name : `${target.name} (Swapped)`;
  const newUnit = resolvedNew ? resolvedNew.unit : '1 pack';
  const servings = Number(currentModel.servings ?? 4);
  const scaledQty = Number(target.scaledQty ?? 1);
  const newPrice = Number((newUnitPrice * scaledQty).toFixed(2));

  rawIngredients[index] = {
    ...target,
    productId: newProductId,
    swapProductId: prevProductId,
    name: newName,
    unitPrice: newUnitPrice,
    price: newPrice,
    unit: `${scaledQty}x ${newUnit} (for ${servings} servings)`,
    isOrganic: resolvedNew?.dietaryTags.includes('organic') ?? !target.isOrganic,
    swapLabel: 'Swapped ✓',
  };

  const estimatedTotal = Number(
    rawIngredients
      .filter((i) => i.checked !== false)
      .reduce((sum, i) => sum + Number(i.price ?? 0), 0)
      .toFixed(2)
  );

  return {
    ...currentModel,
    ingredients: rawIngredients,
    estimatedTotal,
    perServingCost: Number((estimatedTotal / servings).toFixed(2)),
    lastActionConfirmation: `Swapped item #${index + 1} to ${newName} ($${newUnitPrice.toFixed(2)}) ✓`,
  };
}
