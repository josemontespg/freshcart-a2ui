import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_CULINARY_CATALOG_ID,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { Product, StoreId } from '../types/grocery';

export const MIXED_CATALOGS_SURFACE_ID = 'mixed_catalogs_surface' as const;

export interface MixedCatalogsOptions {
  servings?: number;
  organicOnly?: boolean;
  glutenFree?: boolean;
  includeWinePairing?: boolean;
  couponClipped?: boolean;
  activeStoreId?: StoreId;
  products?: Product[];
}

export interface MixedCatalogCourseItem {
  productId: string;
  courseLabel: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  aisle: string;
  checked: boolean;
}

const DEFAULT_COURSES: MixedCatalogCourseItem[] = [
  {
    productId: 'prod-salmon-fillet',
    courseLabel: 'Main Entrée',
    name: 'Wild Alaskan Sockeye Salmon Fillet (2 lb Chef Cut)',
    unit: '2 × 1 lb fillets',
    quantity: 2,
    price: 25.98,
    aisle: 'Aisle 3 · Sustainable Seafood',
    checked: true,
  },
  {
    productId: 'prod-org-quinoa',
    courseLabel: 'Artisan Grain Base',
    name: 'USDA Organic Tri-Color Quinoa',
    unit: '16 oz bag',
    quantity: 1,
    price: 6.49,
    aisle: 'Aisle 5 · Organic Grains',
    checked: true,
  },
  {
    productId: 'prod-org-cherry-tomatoes',
    courseLabel: 'Blistered Garnish',
    name: 'USDA Organic Heirloom Cherry Tomatoes',
    unit: '10 oz pint',
    quantity: 1,
    price: 4.99,
    aisle: 'Aisle 1 · Organic Produce',
    checked: true,
  },
  {
    productId: 'prod-baby-spinach',
    courseLabel: 'Wilted Greens',
    name: 'Triple-Washed USDA Organic Baby Spinach',
    unit: '10 oz clamshell',
    quantity: 1,
    price: 4.49,
    aisle: 'Aisle 1 · Organic Produce',
    checked: true,
  },
];

export function buildMixedCatalogsDataModel(
  options?: MixedCatalogsOptions
): Record<string, unknown> {
  const servings = Math.max(1, Math.min(12, options?.servings ?? 4));
  const scaleFactor = servings / 4;
  const organicOnly = options?.organicOnly ?? true;
  const glutenFree = options?.glutenFree ?? true;
  const includeWinePairing = options?.includeWinePairing ?? true;
  const couponClipped = options?.couponClipped ?? false;

  const courses = DEFAULT_COURSES.map((item) => {
    const scaledQty = Math.max(1, Math.round(item.quantity * scaleFactor));
    const unitPrice = Number((item.price / item.quantity).toFixed(2));
    return {
      ...item,
      quantity: scaledQty,
      price: Number((unitPrice * scaledQty).toFixed(2)),
    };
  });

  const baseIngredientsCost = Number(
    courses
      .filter((c) => c.checked)
      .reduce((acc, c) => acc + c.price, 0)
      .toFixed(2)
  );
  const winePairingPrice = 16.99;
  const couponDiscount = couponClipped ? 5.0 : 0;

  return {
    tastingTitle:
      '## Chef’s Tasting & Sommelier Pairing Experience (3-Catalog Surface)',
    tastingSubtitle:
      'Composes A2UI Basic v1.0 layout & controls + FreshCart Grocery Merchandising v1 + FreshCart Culinary & Sommelier v1 on a single surface',
    servings,
    organicOnly,
    glutenFree,
    includeWinePairing,
    couponClipped,
    couponDiscount,
    winePairingPrice,
    totalCost: baseIngredientsCost,
    dietarySelections: [
      ...(organicOnly ? ['organic'] : []),
      ...(glutenFree ? ['gluten-free'] : []),
      'omega-3-rich',
    ],
    flashCoupon: {
      title: 'Flash Sommelier & Seafood Bundle Coupon',
      subtitle:
        'Clip to unlock $5.00 instant savings when pairing Wild Alaskan Sockeye Salmon with our Artisan Fromager Board',
      promoCode: 'CHEFPAIR5',
      expiresIn: 'Ends in 02:14:00',
    },
    featuredDeal: {
      productId: 'prod-salmon-fillet',
      title: 'Wild Alaskan Sockeye Salmon Fillet (Chef Reserve)',
      originalName: 'Conventional Farmed Atlantic Salmon',
      price: 12.99,
      originalPrice: 15.99,
      savingsAmount: 3.0,
      unit: '1 lb center-cut fillet',
      badgeText: 'CHEF RESERVE · WILD CAUGHT',
      reason:
        'Sustainably harvested in Bristol Bay with 38g complete protein and rich natural astaxanthin.',
      added: false,
    },
    aisleLocator: {
      productId: 'prod-salmon-fillet',
      itemName: 'Wild Alaskan Sockeye Salmon & Artisan Manchego Display',
      aisleCode: 'Aisle 3 · Bay B & Fromager Counter',
      sectionName: 'Sustainable Seafood & Imported Cheese Cave',
      shelfLevel: 'Chilled Case (34°F) · Adjacent Sommelier Endcap',
      stockNote: 'Fresh catch arrived 6:30 AM · 14 chef-cut fillets in stock',
      walkingTime: '45 sec from Produce',
      pinned: false,
    },
    nutrition: {
      calories: 560,
      proteinGrams: 44,
      carbsGrams: 36,
      fatGrams: 24,
      fiberGrams: 8,
    },
    sommelierPairing: {
      pairingTitle: '6-Month Cave-Aged Manchego & Rías Baixas Albariño Pairing',
      beveragePairing:
        'Chilled Rías Baixas Albariño (or Sparkling Meyer Lemon Botanical Spritz)',
      cheeseSelection:
        '6-Month Cave-Aged Artisan Sheep Manchego & Castelvetrano Olives',
      tastingNotes:
        'Crisp Atlantic salinity and white-peach acidity balance the rich wild salmon glaze while buttery sheep’s-milk Manchego bridges the toasted tri-color quinoa.',
      servingTemp: 'Serve chilled at 48°F · Temper cheese 20m',
      pairingPrice: winePairingPrice,
    },
    prepSteps: [
      {
        stepNumber: 1,
        title: 'Score & Dry-Brine Wild Sockeye Fillets',
        instruction:
          'Pat salmon skin bone-dry, score lightly at 1-inch intervals, and season with flaky sea salt and Meyer lemon zest.',
        durationMinutes: 6,
        technique: 'Skin-Crisp Prep',
      },
      {
        stepNumber: 2,
        title: 'Simmer Organic Tri-Color Quinoa in Herbed Broth',
        instruction:
          'Toast quinoa in extra-virgin olive oil for 90 seconds before simmering until fluffy spirals bloom.',
        durationMinutes: 12,
        technique: 'Aromatic Bloom',
      },
      {
        stepNumber: 3,
        title: 'Cast-Iron Sear & Plate with Sommelier Pairing',
        instruction:
          'Sear salmon skin-side down at 415°F for 4 minutes until shatteringly crisp; fold baby spinach and heirloom tomatoes into warm quinoa and serve alongside chilled Albariño & Manchego.',
        durationMinutes: 7,
        technique: '415°F Sear',
      },
    ],
    courses,
    lastActionConfirmation:
      'Active: 3 A2UI v1.0 catalogs mixed on 1 surface (basic/v1.0 + grocery/v1 + culinary/v1)',
  };
}

export function recalculateMixedCatalogsDataModel(
  currentModel: Record<string, unknown>,
  changedPointer: string
): Record<string, unknown> {
  const next = structuredClone(currentModel);
  const servings = Math.max(1, Math.min(12, Number(next.servings ?? 4)));
  next.servings = servings;

  if (changedPointer === '/dietarySelections' && Array.isArray(next.dietarySelections)) {
    const tags = next.dietarySelections as string[];
    next.organicOnly = tags.includes('organic');
    next.glutenFree = tags.includes('gluten-free');
  }

  const rawCourses = Array.isArray(next.courses)
    ? (next.courses as MixedCatalogCourseItem[])
    : DEFAULT_COURSES;

  const scaleFactor = servings / 4;
  const updatedCourses = rawCourses.map((course, idx) => {
    const baseItem = DEFAULT_COURSES[idx] ?? DEFAULT_COURSES[0];
    const unitPrice = Number((baseItem.price / baseItem.quantity).toFixed(2));
    const scaledQty =
      changedPointer === '/servings'
        ? Math.max(1, Math.round(baseItem.quantity * scaleFactor))
        : Math.max(1, Number(course.quantity ?? 1));
    return {
      ...course,
      quantity: scaledQty,
      price: Number((unitPrice * scaledQty).toFixed(2)),
    };
  });

  next.courses = updatedCourses;
  next.totalCost = Number(
    updatedCourses
      .filter((c) => c.checked !== false)
      .reduce((sum, c) => sum + c.price, 0)
      .toFixed(2)
  );
  next.couponDiscount = next.couponClipped ? 5.0 : 0;

  return next;
}

export function buildMixedCatalogsComponents(): A2UIComponentBase[] {
  return [
    // =========================================================================
    // 1. A2UI v1.0 BASIC CATALOG (`https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`)
    //    Inherits surface default catalogId (`A2UI_BASIC_CATALOG_ID`)
    // =========================================================================
    {
      id: 'root',
      component: 'Column',
      children: [
        'hero_card',
        'flash_coupon_banner',
        'experience_tabs',
        'sommelier_pairing_card',
        'aisle_locator_widget',
        'footer_actions_card',
      ],
    },
    {
      id: 'hero_card',
      component: 'Card',
      child: 'hero_col',
    },
    {
      id: 'hero_col',
      component: 'Column',
      children: [
        'hero_title_text',
        'hero_subtitle_text',
        'hero_metrics_row',
        'status_banner_text',
      ],
    },
    {
      id: 'hero_title_text',
      component: 'Text',
      text: { '@path': '/tastingTitle' },
      variant: 'body',
    },
    {
      id: 'hero_subtitle_text',
      component: 'Text',
      text: { '@path': '/tastingSubtitle' },
      variant: 'caption',
    },
    {
      id: 'hero_metrics_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['hero_cost_pill_text', 'hero_harmony_pill_text'],
    },
    // Basic Catalog `Text` invoking a Custom Culinary Catalog `@call` function
    // (`calculatePerServingCost`) via explicit function-level `catalogId`!
    {
      id: 'hero_cost_pill_text',
      component: 'Text',
      text: {
        '@call': 'formatString',
        args: {
          value: 'Guest Estimate: ${perGuest}',
          perGuest: {
            '@call': 'calculatePerServingCost',
            catalogId: FRESHCART_CULINARY_CATALOG_ID,
            args: {
              totalCost: { '@path': '/totalCost' },
              servings: { '@path': '/servings' },
              includeWinePairing: { '@path': '/includeWinePairing' },
              winePairingPrice: { '@path': '/winePairingPrice' },
              discountAmount: { '@path': '/couponDiscount' },
            },
          },
        },
      },
      variant: 'body',
    },
    {
      id: 'hero_harmony_pill_text',
      component: 'Text',
      text: {
        '@call': 'formatString',
        args: {
          value: 'Culinary Harmony Score: ${score}/100',
          score: {
            '@call': 'matchDietaryScore',
            catalogId: FRESHCART_CULINARY_CATALOG_ID,
            args: {
              baseScore: 92,
              isOrganic: { '@path': '/organicOnly' },
              isGlutenFree: { '@path': '/glutenFree' },
              includeWinePairing: { '@path': '/includeWinePairing' },
            },
          },
        },
      },
      variant: 'caption',
    },
    {
      id: 'status_banner_text',
      component: 'Text',
      text: { '@path': '/lastActionConfirmation' },
      variant: 'caption',
    },

    // =========================================================================
    // 2. FRESHCART GROCERY MERCHANDISING CATALOG (`https://freshcart.app/catalogs/grocery/v1/catalog.json`)
    //    Overrides `catalogId` per component (`ComponentCommon.catalogId`)
    // =========================================================================
    {
      id: 'flash_coupon_banner',
      component: 'FlashCouponBanner',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      title: { '@path': '/flashCoupon/title' },
      subtitle: { '@path': '/flashCoupon/subtitle' },
      promoCode: { '@path': '/flashCoupon/promoCode' },
      expiresIn: { '@path': '/flashCoupon/expiresIn' },
      clipped: { '@path': '/couponClipped' },
      badgeText: {
        '@call': 'formatSavingsBadge',
        catalogId: FRESHCART_GROCERY_CATALOG_ID,
        args: {
          originalPrice: 42.97,
          salePrice: 37.97,
          couponSavings: 0,
        },
      },
      action: {
        event: {
          name: 'clip_flash_coupon',
          context: {
            promoCode: { '@path': '/flashCoupon/promoCode' },
            discountAmount: 5.0,
          },
        },
      },
    },

    // =========================================================================
    // BASIC CATALOG `Tabs` organizing mixed-catalog subtrees
    // =========================================================================
    {
      id: 'experience_tabs',
      component: 'Tabs',
      tabs: [
        {
          title: '1. Chef & Macros (Culinary v1)',
          child: 'tab_culinary_col',
        },
        {
          title: '2. Deals & Courses (Grocery v1)',
          child: 'tab_merch_col',
        },
        {
          title: '3. Prep Timeline (Culinary v1)',
          child: 'chef_recipe_timeline',
        },
      ],
    },
    {
      id: 'tab_culinary_col',
      component: 'Column',
      children: ['culinary_macro_summary', 'guest_controls_card'],
    },

    // =========================================================================
    // 3. FRESHCART CULINARY & SOMMELIER CATALOG (`https://freshcart.app/catalogs/culinary/v1/catalog.json`)
    //    Demonstrates both `ComponentCommon.catalogId` AND explicit `FunctionCall.catalogId`
    //    (required because nested `@call` does NOT inherit its parent component's `catalogId`!)
    // =========================================================================
    {
      id: 'culinary_macro_summary',
      component: 'NutritionSummary',
      catalogId: FRESHCART_CULINARY_CATALOG_ID,
      title: 'Chef Tasting Macro & Dietary Harmony Breakdown',
      calories: { '@path': '/nutrition/calories' },
      proteinGrams: { '@path': '/nutrition/proteinGrams' },
      carbsGrams: { '@path': '/nutrition/carbsGrams' },
      fatGrams: { '@path': '/nutrition/fatGrams' },
      fiberGrams: { '@path': '/nutrition/fiberGrams' },
      servings: { '@path': '/servings' },
      dietaryScore: {
        '@call': 'matchDietaryScore',
        catalogId: FRESHCART_CULINARY_CATALOG_ID,
        args: {
          baseScore: 92,
          isOrganic: { '@path': '/organicOnly' },
          isGlutenFree: { '@path': '/glutenFree' },
          includeWinePairing: { '@path': '/includeWinePairing' },
        },
      },
      perServingCostLabel: {
        '@call': 'calculatePerServingCost',
        catalogId: FRESHCART_CULINARY_CATALOG_ID,
        args: {
          totalCost: { '@path': '/totalCost' },
          servings: { '@path': '/servings' },
          includeWinePairing: { '@path': '/includeWinePairing' },
          winePairingPrice: { '@path': '/winePairingPrice' },
          discountAmount: { '@path': '/couponDiscount' },
        },
      },
    },
    {
      id: 'guest_controls_card',
      component: 'Card',
      child: 'guest_controls_col',
    },
    {
      id: 'guest_controls_col',
      component: 'Column',
      children: [
        'servings_slider',
        'dietary_choice_picker',
        'wine_pairing_checkbox',
      ],
    },
    {
      id: 'servings_slider',
      component: 'Slider',
      label: 'Tasting Party Size (Guests)',
      min: 1,
      max: 10,
      value: { '@path': '/servings' },
    },
    {
      id: 'dietary_choice_picker',
      component: 'ChoicePicker',
      label: 'Culinary & Dietary Standards',
      variant: 'multipleSelection',
      displayStyle: 'chips',
      options: [
        { label: 'USDA Organic', value: 'organic' },
        { label: 'Gluten-Free', value: 'gluten-free' },
        { label: 'High Omega-3', value: 'omega-3-rich' },
      ],
      value: { '@path': '/dietarySelections' },
    },
    {
      id: 'wine_pairing_checkbox',
      component: 'CheckBox',
      label:
        'Include Sommelier & Fromager Pairing (Manchego + Albariño / Botanical Spritz)',
      value: { '@path': '/includeWinePairing' },
    },

    // Tab 2: Grocery Merchandising Deal + Dynamic Course List
    {
      id: 'tab_merch_col',
      component: 'Column',
      children: ['merch_deal_card', 'courses_list'],
    },
    {
      id: 'merch_deal_card',
      component: 'ProductDealCard',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      productId: { '@path': '/featuredDeal/productId' },
      title: { '@path': '/featuredDeal/title' },
      originalName: { '@path': '/featuredDeal/originalName' },
      price: { '@path': '/featuredDeal/price' },
      originalPrice: { '@path': '/featuredDeal/originalPrice' },
      savingsAmount: { '@path': '/featuredDeal/savingsAmount' },
      unit: { '@path': '/featuredDeal/unit' },
      badgeText: { '@path': '/featuredDeal/badgeText' },
      reason: { '@path': '/featuredDeal/reason' },
      added: { '@path': '/featuredDeal/added' },
      action: {
        event: {
          name: 'add_featured_deal_to_cart',
          context: {
            productId: { '@path': '/featuredDeal/productId' },
            quantity: 1,
            title: { '@path': '/featuredDeal/title' },
          },
        },
      },
    },
    {
      id: 'courses_list',
      component: 'List',
      direction: 'vertical',
      children: {
        componentId: 'guest_course_row',
        path: '/courses',
      },
    },
    {
      id: 'guest_course_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: [
        'course_index_badge',
        'course_item_checkbox',
        'course_item_price',
      ],
    },
    // System function `@index` belongs to no catalog and MUST NOT specify `catalogId`
    {
      id: 'course_index_badge',
      component: 'Text',
      text: {
        '@call': 'formatString',
        args: {
          value: 'Course #${idx}',
          idx: {
            '@call': '@index',
            args: { offset: 1 },
          },
        },
      },
      variant: 'caption',
    },
    {
      id: 'course_item_checkbox',
      component: 'CheckBox',
      label: { '@path': 'name' },
      value: { '@path': 'checked' },
    },
    {
      id: 'course_item_price',
      component: 'Text',
      text: {
        '@call': 'formatCurrency',
        args: {
          value: { '@path': 'price' },
          currency: 'USD',
        },
      },
      variant: 'body',
    },

    // Tab 3: Culinary Catalog `RecipeStepTimeline`
    {
      id: 'chef_recipe_timeline',
      component: 'RecipeStepTimeline',
      catalogId: FRESHCART_CULINARY_CATALOG_ID,
      title: 'Chef 25-Minute Pan-Sear & Quinoa Bloom Timeline',
      totalPrepMinutes: 25,
      difficulty: 'Chef-Curated · Cast-Iron Technique',
      steps: { '@path': '/prepSteps' },
    },

    // Sommelier & Fromager Pairing Card (`culinary/v1`)
    {
      id: 'sommelier_pairing_card',
      component: 'WineAndCheesePairingCard',
      catalogId: FRESHCART_CULINARY_CATALOG_ID,
      pairingTitle: { '@path': '/sommelierPairing/pairingTitle' },
      beveragePairing: { '@path': '/sommelierPairing/beveragePairing' },
      cheeseSelection: { '@path': '/sommelierPairing/cheeseSelection' },
      tastingNotes: { '@path': '/sommelierPairing/tastingNotes' },
      servingTemp: { '@path': '/sommelierPairing/servingTemp' },
      pairingPrice: { '@path': '/sommelierPairing/pairingPrice' },
      added: { '@path': '/includeWinePairing' },
      pairingScore: {
        '@call': 'matchDietaryScore',
        catalogId: FRESHCART_CULINARY_CATALOG_ID,
        args: {
          baseScore: 92,
          isOrganic: { '@path': '/organicOnly' },
          isGlutenFree: { '@path': '/glutenFree' },
          includeWinePairing: { '@path': '/includeWinePairing' },
        },
      },
      perServingCostLabel: {
        '@call': 'calculatePerServingCost',
        catalogId: FRESHCART_CULINARY_CATALOG_ID,
        args: {
          totalCost: { '@path': '/totalCost' },
          servings: { '@path': '/servings' },
          includeWinePairing: { '@path': '/includeWinePairing' },
          winePairingPrice: { '@path': '/winePairingPrice' },
          discountAmount: { '@path': '/couponDiscount' },
        },
      },
      action: {
        event: {
          name: 'add_sommelier_pairing',
          context: {
            productId: 'prod-aged-cheddar',
            quantity: 1,
            title: { '@path': '/sommelierPairing/pairingTitle' },
          },
        },
      },
    },

    // Grocery Merchandising Catalog `AisleMapLocator` (`grocery/v1`)
    {
      id: 'aisle_locator_widget',
      component: 'AisleMapLocator',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      productId: { '@path': '/aisleLocator/productId' },
      itemName: { '@path': '/aisleLocator/itemName' },
      aisleCode: { '@path': '/aisleLocator/aisleCode' },
      sectionName: { '@path': '/aisleLocator/sectionName' },
      shelfLevel: { '@path': '/aisleLocator/shelfLevel' },
      stockNote: { '@path': '/aisleLocator/stockNote' },
      walkingTime: { '@path': '/aisleLocator/walkingTime' },
      pinned: { '@path': '/aisleLocator/pinned' },
      action: {
        event: {
          name: 'pin_aisle_route',
          context: {
            aisleCode: { '@path': '/aisleLocator/aisleCode' },
          },
        },
      },
    },

    // Footer Action Bar (`basic/v1.0`)
    {
      id: 'footer_actions_card',
      component: 'Card',
      child: 'footer_actions_row',
    },
    {
      id: 'footer_actions_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['footer_total_text', 'add_tasting_bundle_btn'],
    },
    {
      id: 'footer_total_text',
      component: 'Text',
      text: {
        '@call': 'formatString',
        args: {
          value: 'Tasting Basket (${/servings} guests): ${formattedTotal}',
          formattedTotal: {
            '@call': 'formatCurrency',
            args: {
              value: { '@path': '/totalCost' },
              currency: 'USD',
            },
          },
        },
      },
      variant: 'body',
    },
    {
      id: 'add_tasting_bundle_btn_text',
      component: 'Text',
      text: 'Add Full 3-Catalog Chef & Sommelier Bundle to Cart',
      variant: 'body',
    },
    {
      id: 'add_tasting_bundle_btn',
      component: 'Button',
      child: 'add_tasting_bundle_btn_text',
      variant: 'primary',
      action: {
        event: {
          name: 'add_mixed_catalog_bundle',
          context: {
            servings: { '@path': '/servings' },
            courses: { '@path': '/courses' },
            includeWinePairing: { '@path': '/includeWinePairing' },
            couponClipped: { '@path': '/couponClipped' },
          },
        },
      },
    },
  ];
}

export function buildMixedCatalogsStream(
  options?: MixedCatalogsOptions
): A2UIv1Message[] {
  const dataModel = buildMixedCatalogsDataModel(options);
  const components = buildMixedCatalogsComponents();

  return [
    {
      version: A2UI_VERSION,
      createSurface: {
        surfaceId: MIXED_CATALOGS_SURFACE_ID,
        // Default surface catalog is A2UI v1.0 Basic Catalog; domain components &
        // functions override `catalogId` per-component and per-function call!
        catalogId: A2UI_BASIC_CATALOG_ID,
        sendDataModel: true,
      },
    },
    {
      version: A2UI_VERSION,
      updateComponents: {
        surfaceId: MIXED_CATALOGS_SURFACE_ID,
        components,
      },
    },
    {
      version: A2UI_VERSION,
      updateDataModel: {
        surfaceId: MIXED_CATALOGS_SURFACE_ID,
        path: '/',
        value: dataModel,
      },
    },
  ];
}
