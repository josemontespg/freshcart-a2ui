import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { Product, StoreId } from '../types/grocery';
import { buildFreshCartSkillBundle } from '../a2ui/skillGenerator';
import type { MealIngredientItem } from './mealPlannerScenario';

export const SKILL_CHEF_SURFACE_ID = 'skill-chef-surface' as const;

export type SkillChefThemeId = 'farmers-market-salmon' | 'tuscan-harvest-chicken';

export interface SkillChefOptions {
  themeId?: SkillChefThemeId;
  servings?: number;
  organicOnly?: boolean;
  glutenFree?: boolean;
  activeStoreId?: StoreId;
  products?: Product[];
}

interface ChefBlueprintItem {
  defaultProductId: string;
  organicProductId: string;
  fallbackName: string;
  organicFallbackName: string;
  unitLabel: string;
  baseQtyFor4: number;
  defaultPrice: number;
  organicPrice: number;
}

const FARMERS_MARKET_SALMON_BLUEPRINT: ChefBlueprintItem[] = [
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
    defaultProductId: 'prod-org-cherry-tomatoes',
    organicProductId: 'prod-cherry-tomatoes',
    fallbackName: 'USDA Organic Heirloom Medley Cherry Tomatoes',
    organicFallbackName: 'Vine-Ripened Sweet Cherry Tomatoes',
    unitLabel: '10 oz clamshell',
    baseQtyFor4: 1,
    defaultPrice: 4.99,
    organicPrice: 3.49,
  },
  {
    defaultProductId: 'prod-org-avocado',
    organicProductId: 'prod-conv-avocado',
    fallbackName: 'Organic Hass Avocados (Bag)',
    organicFallbackName: 'Large Hass Avocados (Value Pack)',
    unitLabel: '4 ct bag',
    baseQtyFor4: 1,
    defaultPrice: 5.49,
    organicPrice: 3.99,
  },
  {
    defaultProductId: 'prod-baby-spinach',
    organicProductId: 'prod-conv-spinach',
    fallbackName: 'USDA Organic Baby Spinach',
    organicFallbackName: 'Tender Leaf Spinach',
    unitLabel: '5 oz clamshell',
    baseQtyFor4: 1,
    defaultPrice: 4.49,
    organicPrice: 2.99,
  },
  {
    defaultProductId: 'prod-org-quinoa',
    organicProductId: 'prod-quinoa',
    fallbackName: 'Organic Tri-Color Quinoa',
    organicFallbackName: 'Tri-Color Quinoa Grain',
    unitLabel: '16 oz bag',
    baseQtyFor4: 1,
    defaultPrice: 6.49,
    organicPrice: 4.99,
  },
];

const TUSCAN_HARVEST_CHICKEN_BLUEPRINT: ChefBlueprintItem[] = [
  {
    defaultProductId: 'prod-org-chicken-breast',
    organicProductId: 'prod-chicken-breast',
    fallbackName: 'Organic Air-Chilled Chicken Breast',
    organicFallbackName: 'Boneless Skinless Chicken Breast',
    unitLabel: '1.5 lb pack',
    baseQtyFor4: 2,
    defaultPrice: 11.49,
    organicPrice: 7.99,
  },
  {
    defaultProductId: 'prod-org-cherry-tomatoes',
    organicProductId: 'prod-cherry-tomatoes',
    fallbackName: 'USDA Organic Heirloom Medley Cherry Tomatoes',
    organicFallbackName: 'Vine-Ripened Sweet Cherry Tomatoes',
    unitLabel: '10 oz clamshell',
    baseQtyFor4: 1,
    defaultPrice: 4.99,
    organicPrice: 3.49,
  },
  {
    defaultProductId: 'prod-baby-spinach',
    organicProductId: 'prod-conv-spinach',
    fallbackName: 'USDA Organic Baby Spinach',
    organicFallbackName: 'Tender Leaf Spinach',
    unitLabel: '5 oz clamshell',
    baseQtyFor4: 1,
    defaultPrice: 4.49,
    organicPrice: 2.99,
  },
  {
    defaultProductId: 'prod-org-greek-yogurt',
    organicProductId: 'prod-greek-yogurt',
    fallbackName: 'Organic Whole Milk Greek Yogurt',
    organicFallbackName: 'Plain Nonfat Greek Yogurt (0%)',
    unitLabel: '32 oz tub',
    baseQtyFor4: 1,
    defaultPrice: 6.99,
    organicPrice: 5.49,
  },
];

function lookupProduct(
  products: Product[] | undefined,
  productId: string
): Product | undefined {
  if (!products || products.length === 0) return undefined;
  return products.find((p) => p.id === productId);
}

export function buildSkillChefDataModel(
  options: SkillChefOptions = {}
): Record<string, unknown> {
  const themeId: SkillChefThemeId =
    options.themeId ?? 'farmers-market-salmon';
  const servings = Math.max(1, Math.min(12, Math.round(options.servings ?? 4)));
  const organicOnly = options.organicOnly ?? true;
  const glutenFree = options.glutenFree ?? true;
  const products = options.products;

  const isSalmon = themeId === 'farmers-market-salmon';
  const blueprint = isSalmon
    ? FARMERS_MARKET_SALMON_BLUEPRINT
    : TUSCAN_HARVEST_CHICKEN_BLUEPRINT;
  const scaleFactor = servings / 4;

  const skillBundle = buildFreshCartSkillBundle('direct_json');

  const ingredients: MealIngredientItem[] = blueprint.map((item) => {
    const chosenId = organicOnly ? item.defaultProductId : item.organicProductId;
    const swapId = organicOnly ? item.organicProductId : item.defaultProductId;
    const resolvedProd = lookupProduct(products, chosenId);
    const unitPrice = resolvedProd
      ? resolvedProd.price
      : organicOnly
        ? item.defaultPrice
        : item.organicPrice;
    const name = resolvedProd
      ? resolvedProd.name
      : organicOnly
        ? item.fallbackName
        : item.organicFallbackName;
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
      isOrganic: organicOnly,
      checked: true,
      swapLabel: organicOnly ? 'Value Swap' : 'Organic Upgrade',
    };
  });

  const estimatedTotal = Number(
    ingredients
      .filter((i) => i.checked)
      .reduce((sum, i) => sum + i.price, 0)
      .toFixed(2)
  );

  const pairingProd = lookupProduct(products, 'prod-extra-virgin-olive-oil');

  return {
    recipeTitle: isSalmon
      ? "## Chef's Seasonal Farmers Market Salmon Tasting"
      : "## Tuscan Herb & Heirloom Harvest Chicken Dinner",
    recipeSubtitle: `Compiled with A2UI v1.0 SkillSet (${skillBundle.modularSkills.map((s) => s.name).join(' + ')}) · 20 components & 15 functions active`,
    skillBadgeSummary: `Active Agent Skills: ${skillBundle.modularSkills.map((s) => `${s.filename} (${s.lineCount}L)`).join(' · ')}`,
    selectedMealPlan: [
      isSalmon ? 'mediterranean-salmon' : 'high-protein-bowls',
    ],
    servings,
    dietary: {
      glutenFree,
      organicOnly,
    },
    nutrition: {
      calories: isSalmon ? 560 : 610,
      proteinGrams: isSalmon ? 46 : 54,
      carbsGrams: isSalmon ? 34 : 38,
      fatGrams: isSalmon ? 24 : 21,
      fiberGrams: 8,
      dailyCalorieTarget: 2000,
    },
    ingredients,
    featuredPairing: {
      productId: pairingProd?.id ?? 'prod-extra-virgin-olive-oil',
      title: pairingProd?.name ?? 'Cold-Pressed Extra Virgin Olive Oil',
      price: pairingProd?.price ?? 13.99,
      originalPrice: pairingProd?.originalPrice ?? 16.99,
      unit: pairingProd?.unit ?? '16.9 fl oz bottle',
      badgeText: 'a2ui-grocery Skill Pairing · Save $3.00',
      imageUrl:
        pairingProd?.imageUrl ??
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
    },
    estimatedTotal,
    perServingCost: Number((estimatedTotal / servings).toFixed(2)),
    bundleAdded: false,
    lastActionConfirmation: `Skill-guided basket ready: ${ingredients.length} seasonal items (${servings} servings)`,
  };
}

export function buildSkillChefComponents(): A2UIComponentBase[] {
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
      children: [
        'title_text',
        'subtitle_text',
        'skill_badge_text',
        'meal_style_picker',
      ],
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
      id: 'skill_badge_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/skillBadgeSummary' },
    },
    {
      id: 'meal_style_picker',
      component: 'ChoicePicker',
      label: 'Chef Tasting Menu (Guided by a2ui-basic + a2ui-grocery Skills)',
      variant: 'mutuallyExclusive',
      displayStyle: 'chips',
      value: { '@path': '/selectedMealPlan' },
      options: [
        {
          label: 'Farmers Market Wild Salmon',
          value: 'mediterranean-salmon',
        },
        {
          label: 'Tuscan Harvest Chicken',
          value: 'high-protein-bowls',
        },
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
      label: 'Guests at the Table (scales quantities via @path "/servings")',
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
      label: 'Gluten-Free Kitchen',
      value: { '@path': '/dietary/glutenFree' },
    },
    {
      id: 'cb_organic_only',
      component: 'CheckBox',
      label: '100% USDA Organic Harvest',
      value: { '@path': '/dietary/organicOnly' },
    },
    {
      id: 'nutrition_widget',
      component: 'NutritionSummary',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      title: 'Chef Tasting Macros per Guest',
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
      text: '### Seasonal Market Basket (Uncheck pantry items you already own)',
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
          userMessage: 'Swap chef basket ingredient SKU',
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
      actionLabel: 'Add Finishing Olive Oil',
      action: {
        event: {
          name: 'add_pairing_item',
          userMessage: 'Add chef finishing oil pairing to cart',
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
      text: '**Estimated Chef Basket Total**',
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
              value: 'Add ${/servings}-serving Chef Market Basket to FreshCart',
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
      text: "Add Chef's Market Basket to Cart",
    },
  ];
}

export function buildSkillChefStream(
  options: SkillChefOptions = {}
): A2UIv1Message[] {
  const fullDataModel = buildSkillChefDataModel(options);
  const components = buildSkillChefComponents();

  const createMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    createSurface: {
      surfaceId: SKILL_CHEF_SURFACE_ID,
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
        recipeSubtitle: fullDataModel.recipeSubtitle,
        skillBadgeSummary: fullDataModel.skillBadgeSummary,
        selectedMealPlan: fullDataModel.selectedMealPlan,
        servings: fullDataModel.servings,
        dietary: fullDataModel.dietary,
        nutrition: fullDataModel.nutrition,
        ingredients: [],
        featuredPairing: fullDataModel.featuredPairing,
        estimatedTotal: 0,
        lastActionConfirmation: 'Compiling SkillSet (a2ui-core + a2ui-basic + a2ui-grocery)...',
      },
    },
  };

  const updateComponentsMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateComponents: {
      surfaceId: SKILL_CHEF_SURFACE_ID,
      components,
    },
  };

  const updateDataModelMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateDataModel: {
      surfaceId: SKILL_CHEF_SURFACE_ID,
      path: '/',
      value: fullDataModel,
    },
  };

  return [createMsg, updateComponentsMsg, updateDataModelMsg];
}
