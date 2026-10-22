import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { CartItem, Product, StoreId } from '../types/grocery';

export const SMART_FUNCTIONS_SURFACE_ID = 'smart-functions-surface' as const;

export interface SmartBundleItem {
  productId: string;
  title: string;
  unit: string;
  quantity: number;
  price: number;
  originalPrice: number;
  savingsAmount: number;
  netCarbsGrams: number;
  proteinGrams: number;
  badgeText: string;
  reason: string;
  imageUrl: string;
  included: boolean;
}

const DEFAULT_SMART_ITEMS: SmartBundleItem[] = [
  {
    productId: 'prod-salmon-fillet',
    title: 'Wild Alaskan Sockeye Salmon Fillet',
    unit: '1 lb fillet',
    quantity: 2,
    price: 14.99,
    originalPrice: 17.99,
    savingsAmount: 3.0,
    netCarbsGrams: 0,
    proteinGrams: 44,
    badgeText: '0g Net Carbs · 44g Protein',
    reason: 'Zero-carb Omega-3 centerpiece with $3.00 store deal.',
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80',
    included: true,
  },
  {
    productId: 'prod-org-avocado',
    title: 'Organic Hass Avocados (4 ct Bag)',
    unit: '4 ct bag',
    quantity: 1,
    price: 5.49,
    originalPrice: 6.49,
    savingsAmount: 1.0,
    netCarbsGrams: 2,
    proteinGrams: 3,
    badgeText: 'High Fiber · 2g Net Carbs',
    reason: '9g dietary fiber offsets total carbs for keto & heart-healthy goals.',
    imageUrl:
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=500&q=80',
    included: true,
  },
  {
    productId: 'prod-baby-spinach',
    title: 'USDA Organic Baby Spinach',
    unit: '5 oz clamshell',
    quantity: 1,
    price: 4.49,
    originalPrice: 4.99,
    savingsAmount: 0.5,
    netCarbsGrams: 1,
    proteinGrams: 2,
    badgeText: 'USDA Organic · Folate & Iron',
    reason: 'Nutrient-dense leafy green base with only 1g net carbs per serving.',
    imageUrl:
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',
    included: true,
  },
  {
    productId: 'prod-extra-virgin-olive-oil',
    title: 'Cold-Pressed Extra Virgin Olive Oil',
    unit: '16.9 fl oz bottle',
    quantity: 1,
    price: 12.99,
    originalPrice: 14.99,
    savingsAmount: 2.0,
    netCarbsGrams: 0,
    proteinGrams: 0,
    badgeText: 'Polyphenol Rich · Save $2.00',
    reason: 'First-cold-pressed Mediterranean finishing oil.',
    imageUrl:
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
    included: true,
  },
];

export function buildSmartFunctionsDataModel(
  cartItems: CartItem[] = [],
  products: Product[] = [],
  _activeStoreId?: StoreId
): Record<string, unknown> {
  const byId = new Map<string, Product>();
  for (const p of products) {
    byId.set(p.id, p);
  }

  const bundleItems: SmartBundleItem[] = DEFAULT_SMART_ITEMS.map((item) => {
    const liveProd = byId.get(item.productId);
    if (!liveProd) return { ...item };
    const origPrice = liveProd.originalPrice ?? Number((liveProd.price + 1.5).toFixed(2));
    return {
      ...item,
      title: liveProd.name,
      unit: liveProd.unit,
      price: liveProd.price,
      originalPrice: origPrice,
      savingsAmount: Math.max(0, Number((origPrice - liveProd.price).toFixed(2))),
      imageUrl: liveProd.imageUrl,
    };
  });

  const bundleSubtotal = Number(
    bundleItems
      .reduce((sum, it) => sum + it.price * it.quantity, 0)
      .toFixed(2)
  );

  return {
    headline: '## Smart Kitchen Calculator & Live Store Coupons',
    subheadline:
      'Customize servings, net-carb targets, and stackable store coupons with instant nutrition & savings updates',
    servings: 4,
    dietaryGoal: ['keto'],
    loyaltyMember: true,
    promoCodeInput: 'KETO20',
    bundleSubtotal,
    baseCalories: 520,
    baseProtein: 44,
    baseCarbs: 21,
    baseFiber: 8,
    sugarAlcohols: 2,
    baseFat: 28,
    serverCouponDiscount: 4.5,
    lastClientFunctionStatus:
      'Ready: Adjust servings, dietary goal, or promo code above to trigger instant client-side @call recalculations.',
    serverCouponBreakdown:
      'Stackable Digital Coupons Ready: Click "Verify Live Store Coupons & Stock" to run server-side coupon & inventory optimization.',
    serverAuditSummary:
      'Dietitian Micronutrient Audit: 1,840mg Omega-3 EPA/DHA · Low Glycemic Load (GL 4) · 100% Daily Vitamin D.',
    clientSyncSummary:
      cartItems.length > 0
        ? `Connected to live cart (${cartItems.length} items). Click "Sync My Live Cart & Delivery Zone" to run agent-to-renderer inspection.`
        : 'Click "Sync My Live Cart & Delivery Zone" to let the assistant inspect your current cart & delivery zone.',
    securityBoundaryStatus:
      'Client-only functions are protected against unauthorized remote invocation.',
    statusBanner:
      '4 chef-selected items ready · Code KETO20 + FreshCart+ savings active',
    bundleAdded: false,
    bundleItems,
  };
}

export function buildSmartFunctionsComponents(): A2UIComponentBase[] {
  return [
    {
      id: 'root',
      component: 'Column',
      children: [
        'calculator_header_card',
        'functions_mode_tabs',
        'bundle_cta_footer_card',
      ],
    },
    {
      id: 'calculator_header_card',
      component: 'Card',
      variant: 'emerald',
      child: 'calculator_header_col',
    },
    {
      id: 'calculator_header_col',
      component: 'Column',
      children: [
        'headline_text',
        'subheadline_text',
        'live_metrics_banner_card',
        'servings_slider',
        'dietary_goal_picker',
        'promo_and_loyalty_row',
      ],
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
      id: 'live_metrics_banner_card',
      component: 'Card',
      variant: 'subtle',
      child: 'live_metrics_banner_col',
    },
    {
      id: 'live_metrics_banner_col',
      component: 'Column',
      children: ['net_carbs_computed_text', 'unit_savings_computed_text'],
    },
    {
      id: 'net_carbs_computed_text',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatString',
        args: {
          value:
            '**Live Nutrition Formula:** ${netCarbs}g Net Carbs/serving (${/baseCarbs}g total - ${/baseFiber}g fiber - ${/sugarAlcohols}g sugar alcohols) · **${/baseProtein}g Protein**',
          netCarbs: {
            '@call': 'calculateNetCarbs',
            catalogId: FRESHCART_GROCERY_CATALOG_ID,
            args: {
              totalCarbs: { '@path': '/baseCarbs' },
              fiber: { '@path': '/baseFiber' },
              sugarAlcohols: { '@path': '/sugarAlcohols' },
            },
          },
        },
      },
    },
    {
      id: 'unit_savings_computed_text',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatString',
        args: {
          value: '**Live Price & Coupon Estimator:** ${savingsText}',
          savingsText: {
            '@call': 'computeUnitSavings',
            catalogId: FRESHCART_GROCERY_CATALOG_ID,
            args: {
              subtotal: { '@path': '/bundleSubtotal' },
              servings: { '@path': '/servings' },
              promoCode: { '@path': '/promoCodeInput' },
              loyaltyMember: { '@path': '/loyaltyMember' },
              serverCouponDiscount: { '@path': '/serverCouponDiscount' },
            },
          },
        },
      },
    },
    {
      id: 'servings_slider',
      component: 'Slider',
      label: 'Household Servings',
      min: 1,
      max: 8,
      step: 1,
      suffix: 'servings',
      value: { '@path': '/servings' },
    },
    {
      id: 'dietary_goal_picker',
      component: 'ChoicePicker',
      label: 'Nutritional Focus',
      variant: 'mutuallyExclusive',
      options: [
        { label: 'Low-Carb Keto (≤15g Net Carbs)', value: 'keto' },
        { label: 'High-Protein Athlete (≥35g Protein)', value: 'high_protein' },
        { label: 'Mediterranean Heart-Healthy', value: 'mediterranean' },
      ],
      value: { '@path': '/dietaryGoal' },
      checks: [
        {
          condition: {
            '@call': 'checkDietaryMatch',
            catalogId: FRESHCART_GROCERY_CATALOG_ID,
            args: {
              dietaryGoal: { '@path': '/dietaryGoal' },
              netCarbsPerServing: {
                '@call': 'calculateNetCarbs',
                catalogId: FRESHCART_GROCERY_CATALOG_ID,
                args: {
                  totalCarbs: { '@path': '/baseCarbs' },
                  fiber: { '@path': '/baseFiber' },
                  sugarAlcohols: { '@path': '/sugarAlcohols' },
                },
              },
              proteinPerServing: { '@path': '/baseProtein' },
            },
          },
        },
      ],
    },
    {
      id: 'promo_and_loyalty_row',
      component: 'Column',
      children: ['promo_code_input', 'loyalty_checkbox'],
    },
    {
      id: 'promo_code_input',
      component: 'TextField',
      label: 'Store Promo Code (Try KETO20, FRESH15, A2UIV1, or EXPIRED10)',
      placeholder: 'Enter promo code...',
      value: { '@path': '/promoCodeInput' },
      checks: [
        {
          condition: {
            '@call': 'validatePromoCodeFormat',
            catalogId: FRESHCART_GROCERY_CATALOG_ID,
            args: {
              value: { '@path': '/promoCodeInput' },
            },
          },
        },
      ],
    },
    {
      id: 'loyalty_checkbox',
      component: 'CheckBox',
      label: 'Apply FreshCart+ Member 10% Produce & Seafood Discount',
      value: { '@path': '/loyaltyMember' },
    },

    // --- 3 Tabs Showcasing Client-Side Functions, Server-Side Functions, and Agent->Renderer RPC ---
    {
      id: 'functions_mode_tabs',
      component: 'Tabs',
      tabs: [
        { title: '⚡ Instant Presets & Picks', child: 'tab_client_functions' },
        { title: '🏷️ Live Store Coupons', child: 'tab_server_functions' },
        { title: '🔄 Sync Kitchen & Cart', child: 'tab_agent_to_renderer_rpc' },
      ],
    },

    // TAB 1: Client-Side Functions (@call & local functionCall actions)
    {
      id: 'tab_client_functions',
      component: 'Column',
      children: [
        'client_presets_card',
        'bundle_items_list',
      ],
    },
    {
      id: 'client_presets_card',
      component: 'Card',
      title: 'One-Click Kitchen Presets (Instant Client Execution)',
      subtitle:
        'Applies macro targets and promo codes immediately in your browser with zero network delay',
      badge: 'Client-Side',
      child: 'client_presets_col',
    },
    {
      id: 'client_presets_col',
      component: 'Column',
      children: [
        'client_preset_buttons_row',
        'client_copy_row',
        'client_status_text',
      ],
    },
    {
      id: 'client_preset_buttons_row',
      component: 'Row',
      wrap: true,
      children: ['btn_preset_keto', 'btn_preset_protein'],
    },
    {
      id: 'btn_preset_keto',
      component: 'Button',
      variant: 'secondary',
      icon: 'flame',
      child: 'btn_preset_keto_text',
      action: {
        functionCall: {
          '@call': 'applyLocalNutritionPreset',
          catalogId: FRESHCART_GROCERY_CATALOG_ID,
          args: {
            preset: 'keto',
            servings: 2,
            promoCode: 'KETO20',
          },
        },
      },
    },
    {
      id: 'btn_preset_keto_text',
      component: 'Text',
      variant: 'body',
      text: 'Low-Carb Keto Dinner (2 Servings)',
    },
    {
      id: 'btn_preset_protein',
      component: 'Button',
      variant: 'secondary',
      icon: 'sparkles',
      child: 'btn_preset_protein_text',
      action: {
        functionCall: {
          '@call': 'applyLocalNutritionPreset',
          catalogId: FRESHCART_GROCERY_CATALOG_ID,
          args: {
            preset: 'high_protein',
            servings: 6,
            promoCode: 'FRESH15',
          },
        },
      },
    },
    {
      id: 'btn_preset_protein_text',
      component: 'Text',
      variant: 'body',
      text: 'Family High-Protein Pack (6 Servings)',
    },
    {
      id: 'client_copy_row',
      component: 'Row',
      wrap: true,
      children: ['btn_copy_summary'],
    },
    {
      id: 'btn_copy_summary',
      component: 'Button',
      variant: 'default',
      icon: 'share',
      child: 'btn_copy_summary_text',
      action: {
        functionCall: {
          '@call': 'copyShoppingSummary',
          catalogId: FRESHCART_GROCERY_CATALOG_ID,
          args: {
            title: { '@path': '/headline' },
            netCarbs: {
              '@call': 'calculateNetCarbs',
              catalogId: FRESHCART_GROCERY_CATALOG_ID,
              args: {
                totalCarbs: { '@path': '/baseCarbs' },
                fiber: { '@path': '/baseFiber' },
                sugarAlcohols: { '@path': '/sugarAlcohols' },
              },
            },
            unitSavings: {
              '@call': 'computeUnitSavings',
              catalogId: FRESHCART_GROCERY_CATALOG_ID,
              args: {
                subtotal: { '@path': '/bundleSubtotal' },
                servings: { '@path': '/servings' },
                promoCode: { '@path': '/promoCodeInput' },
                loyaltyMember: { '@path': '/loyaltyMember' },
                serverCouponDiscount: { '@path': '/serverCouponDiscount' },
              },
            },
          },
        },
      },
    },
    {
      id: 'btn_copy_summary_text',
      component: 'Text',
      variant: 'body',
      text: 'Copy Plan & Coupon Summary',
    },
    {
      id: 'client_status_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/lastClientFunctionStatus' },
    },
    {
      id: 'bundle_items_list',
      component: 'List',
      direction: 'vertical',
      children: {
        componentId: 'fn_bundle_item_card',
        path: '/bundleItems',
      },
    },
    {
      id: 'fn_bundle_item_card',
      component: 'Card',
      child: 'fn_bundle_item_col',
    },
    {
      id: 'fn_bundle_item_col',
      component: 'Column',
      children: ['fn_item_index_label', 'fn_item_deal_card'],
    },
    {
      id: 'fn_item_index_label',
      component: 'Text',
      variant: 'caption',
      text: {
        '@call': 'formatString',
        args: {
          value:
            'Ingredient #${@index(offset:1)} · ${netCarbsGrams}g Net Carbs · ${proteinGrams}g Protein',
        },
      },
    },
    {
      id: 'fn_item_deal_card',
      component: 'ProductDealCard',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      productId: { '@path': 'productId' },
      title: { '@path': 'title' },
      price: { '@path': 'price' },
      originalPrice: { '@path': 'originalPrice' },
      unit: { '@path': 'unit' },
      badgeText: { '@path': 'badgeText' },
      reason: { '@path': 'reason' },
      imageUrl: { '@path': 'imageUrl' },
      actionLabel: 'Add Item to Cart',
      action: {
        event: {
          name: 'add_single_smart_item',
          userMessage: 'Add item to cart',
          context: {
            productId: { '@path': 'productId' },
            title: { '@path': 'title' },
            quantity: { '@path': 'quantity' },
          },
        },
      },
    },

    // TAB 2: Server-Side Functions (callAgentFunction -> agentFunctionResponse)
    {
      id: 'tab_server_functions',
      component: 'Column',
      children: [
        'server_coupons_card',
        'server_nutrition_audit_card',
      ],
    },
    {
      id: 'server_coupons_card',
      component: 'Card',
      title: 'Live Store Coupon & Inventory Verification',
      subtitle:
        'Calls the store backend to stack digital manufacturer coupons and verify real-time aisle inventory',
      badge: 'Server RPC',
      child: 'server_coupons_col',
    },
    {
      id: 'server_coupons_col',
      component: 'Column',
      children: [
        'server_coupon_breakdown_text',
        'btn_run_server_coupons',
      ],
    },
    {
      id: 'server_coupon_breakdown_text',
      component: 'Text',
      variant: 'body',
      text: { '@path': '/serverCouponBreakdown' },
    },
    {
      id: 'btn_run_server_coupons',
      component: 'Button',
      variant: 'primary',
      icon: 'tag',
      child: 'btn_run_server_coupons_text',
      action: {
        functionCall: {
          '@call': 'optimizeLiveStoreCoupons',
          catalogId: FRESHCART_GROCERY_CATALOG_ID,
          args: {
            promoCode: { '@path': '/promoCodeInput' },
            servings: { '@path': '/servings' },
            loyaltyMember: { '@path': '/loyaltyMember' },
            subtotal: { '@path': '/bundleSubtotal' },
          },
        },
      },
    },
    {
      id: 'btn_run_server_coupons_text',
      component: 'Text',
      variant: 'body',
      text: 'Verify Live Store Coupons & Stock',
    },
    {
      id: 'server_nutrition_audit_card',
      component: 'Card',
      title: 'Deep Dietitian & Micronutrient Analysis',
      subtitle:
        'Computes Omega-3 EPA/DHA density, glycemic load, and vitamin coverage on the server',
      badge: 'Server RPC',
      child: 'server_nutrition_audit_col',
    },
    {
      id: 'server_nutrition_audit_col',
      component: 'Column',
      children: [
        'nutrition_summary_widget',
        'server_audit_summary_text',
        'btn_run_server_nutrition',
      ],
    },
    {
      id: 'nutrition_summary_widget',
      component: 'NutritionSummary',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      title: 'Macro & Fiber Profile (Per Serving)',
      servings: { '@path': '/servings' },
      calories: { '@path': '/baseCalories' },
      proteinGrams: { '@path': '/baseProtein' },
      carbsGrams: { '@path': '/baseCarbs' },
      fatGrams: { '@path': '/baseFat' },
      fiberGrams: { '@path': '/baseFiber' },
      dailyCalorieTarget: 2000,
    },
    {
      id: 'server_audit_summary_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/serverAuditSummary' },
    },
    {
      id: 'btn_run_server_nutrition',
      component: 'Button',
      variant: 'secondary',
      icon: 'sparkles',
      child: 'btn_run_server_nutrition_text',
      action: {
        functionCall: {
          '@call': 'analyzeMealMicronutrients',
          catalogId: FRESHCART_GROCERY_CATALOG_ID,
          args: {
            servings: { '@path': '/servings' },
            dietaryGoal: { '@path': '/dietaryGoal' },
            netCarbs: {
              '@call': 'calculateNetCarbs',
              catalogId: FRESHCART_GROCERY_CATALOG_ID,
              args: {
                totalCarbs: { '@path': '/baseCarbs' },
                fiber: { '@path': '/baseFiber' },
                sugarAlcohols: { '@path': '/sugarAlcohols' },
              },
            },
          },
        },
      },
    },
    {
      id: 'btn_run_server_nutrition_text',
      component: 'Text',
      variant: 'body',
      text: 'Run Deep Dietitian & Micronutrient Audit',
    },

    // TAB 3: Agent-to-Renderer RPC (callRendererFunction -> rendererFunctionResponse)
    {
      id: 'tab_agent_to_renderer_rpc',
      component: 'Column',
      children: [
        'agent_sync_card',
        'security_guard_card',
      ],
    },
    {
      id: 'agent_sync_card',
      component: 'Card',
      title: 'Sync Live Cart & Delivery Zone with Assistant',
      subtitle:
        'Allows the assistant to inspect your current cart items, store ETA, and dietary preference from your browser',
      badge: 'Agent → Client RPC',
      child: 'agent_sync_col',
    },
    {
      id: 'agent_sync_col',
      component: 'Column',
      children: [
        'client_sync_summary_text',
        'btn_trigger_agent_sync',
      ],
    },
    {
      id: 'client_sync_summary_text',
      component: 'Text',
      variant: 'body',
      text: { '@path': '/clientSyncSummary' },
    },
    {
      id: 'btn_trigger_agent_sync',
      component: 'Button',
      variant: 'primary',
      icon: 'refresh',
      child: 'btn_trigger_agent_sync_text',
      action: {
        event: {
          name: 'trigger_agent_call_renderer_function',
          userMessage: 'Sync live cart and delivery zone',
          context: {
            dietaryGoal: { '@path': '/dietaryGoal' },
          },
        },
      },
    },
    {
      id: 'btn_trigger_agent_sync_text',
      component: 'Text',
      variant: 'body',
      text: 'Sync My Live Cart & Delivery Zone',
    },
    {
      id: 'security_guard_card',
      component: 'Card',
      variant: 'subtle',
      title: 'Client Permission Guard Verification',
      subtitle:
        'Verifies that user-gesture-only client functions cannot be triggered silently by a remote server message',
      badge: 'Permission Check',
      child: 'security_guard_col',
    },
    {
      id: 'security_guard_col',
      component: 'Column',
      children: [
        'security_guard_status_text',
        'btn_test_security_guard',
      ],
    },
    {
      id: 'security_guard_status_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/securityBoundaryStatus' },
    },
    {
      id: 'btn_test_security_guard',
      component: 'Button',
      variant: 'default',
      icon: 'lock',
      child: 'btn_test_security_guard_text',
      action: {
        event: {
          name: 'trigger_unauthorized_renderer_function',
          userMessage: 'Verify client permission guard',
          context: {},
        },
      },
    },
    {
      id: 'btn_test_security_guard_text',
      component: 'Text',
      variant: 'body',
      text: 'Verify Client Permission Guard',
    },

    // Footer CTA Card
    {
      id: 'bundle_cta_footer_card',
      component: 'Card',
      child: 'bundle_cta_footer_col',
    },
    {
      id: 'bundle_cta_footer_col',
      component: 'Column',
      children: ['status_banner_text', 'btn_add_smart_bundle'],
    },
    {
      id: 'status_banner_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/statusBanner' },
    },
    {
      id: 'btn_add_smart_bundle',
      component: 'Button',
      variant: 'primary',
      icon: 'shoppingCart',
      child: 'btn_add_smart_bundle_text',
      checks: [
        {
          condition: {
            '@call': 'validatePromoCodeFormat',
            catalogId: FRESHCART_GROCERY_CATALOG_ID,
            args: {
              value: { '@path': '/promoCodeInput' },
            },
          },
        },
      ],
      action: {
        event: {
          name: 'add_smart_functions_bundle_to_cart',
          userMessage: 'Add smart bundle and apply coupon to cart',
          context: {
            servings: { '@path': '/servings' },
            promoCode: { '@path': '/promoCodeInput' },
            items: { '@path': '/bundleItems' },
          },
        },
      },
    },
    {
      id: 'btn_add_smart_bundle_text',
      component: 'Text',
      variant: 'body',
      text: 'Add Bundle & Apply Coupon to Cart',
    },
  ];
}

export function buildSmartFunctionsStream(
  cartItems: CartItem[] = [],
  products: Product[] = [],
  activeStoreId?: StoreId
): A2UIv1Message[] {
  const fullDataModel = buildSmartFunctionsDataModel(
    cartItems,
    products,
    activeStoreId
  );
  const components = buildSmartFunctionsComponents();

  const createMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    createSurface: {
      surfaceId: SMART_FUNCTIONS_SURFACE_ID,
      catalogId: A2UI_BASIC_CATALOG_ID,
      sendDataModel: true,
      components: [
        {
          id: 'root',
          component: 'Column',
          children: ['calculator_header_card'],
        },
        {
          id: 'calculator_header_card',
          component: 'Card',
          child: 'headline_text',
        },
        {
          id: 'headline_text',
          component: 'Text',
          variant: 'body',
          text: '## Loading Smart Kitchen Calculator & Live Store Coupons...',
        },
      ],
      dataModel: fullDataModel,
    },
  };

  const updateComponentsMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateComponents: {
      surfaceId: SMART_FUNCTIONS_SURFACE_ID,
      components,
    },
  };

  const updateDataModelMsg: A2UIv1Message = {
    version: A2UI_VERSION,
    updateDataModel: {
      surfaceId: SMART_FUNCTIONS_SURFACE_ID,
      path: '/',
      value: fullDataModel,
    },
  };

  return [createMsg, updateComponentsMsg, updateDataModelMsg];
}
