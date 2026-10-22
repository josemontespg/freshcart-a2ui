import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { AisleCategory, Product, StoreId } from '../types/grocery';

export const EXTENSIONS_SHOWCASE_SURFACE_ID = 'extensions_showcase_surface';

export type ExtensionThemePalette =
  | 'harvest-gold'
  | 'emerald-organic'
  | 'midnight-cellar';

export interface TastingBoardItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  category: Exclude<AisleCategory, 'all'>;
  aisleLocation: string;
  unit: string;
  unitPrice: number;
  baseQty: number;
  scaledQty: number;
  lineTotal: number;
  included: boolean;
  pairingNote: string;
}

interface RawTastingSpec {
  productId: string;
  fallbackName: string;
  fallbackBrand: string;
  fallbackCategory: Exclude<AisleCategory, 'all'>;
  fallbackAisle: string;
  fallbackUnit: string;
  fallbackPrice: number;
  baseQtyFor4: number;
  pairingNote: string;
}

const TASTING_BOARD_SPECS: RawTastingSpec[] = [
  {
    productId: 'prod-salmon-fillet',
    fallbackName: 'Wild Alaskan Sockeye Salmon Fillet',
    fallbackBrand: 'Pacific Catch Reserve',
    fallbackCategory: 'meat-seafood',
    fallbackAisle: 'Aisle 2 · Seafood Counter',
    fallbackUnit: '1 lb fillet',
    fallbackPrice: 14.99,
    baseQtyFor4: 1,
    pairingNote: 'Cold-smoked style centerpiece with citrus & dill',
  },
  {
    productId: 'prod-feta-cheese',
    fallbackName: 'Artisanal Barrel-Aged Feta Cheese',
    fallbackBrand: ' Mt. Olympus Creamery',
    fallbackCategory: 'dairy-eggs',
    fallbackAisle: 'Aisle 3 · Specialty Cheese',
    fallbackUnit: '8 oz block',
    fallbackPrice: 6.49,
    baseQtyFor4: 1,
    pairingNote: 'Creamy sheep-milk brine block for warm sourdough',
  },
  {
    productId: 'prod-sourdough-bread',
    fallbackName: 'Rustic Country Sourdough Boule',
    fallbackBrand: 'Hearth & Crumb Bakery',
    fallbackCategory: 'bakery',
    fallbackAisle: 'Aisle 1 · Artisan Bakery',
    fallbackUnit: '24 oz loaf',
    fallbackPrice: 5.99,
    baseQtyFor4: 1,
    pairingNote: 'Slow-fermented 36-hour crust, sliced for crostini',
  },
  {
    productId: 'prod-extra-virgin-olive-oil',
    fallbackName: 'Cold-Pressed Extra Virgin Olive Oil',
    fallbackBrand: 'Terra Verde Estate',
    fallbackCategory: 'pantry',
    fallbackAisle: 'Aisle 6 · Oils & Vinegars',
    fallbackUnit: '16.9 fl oz',
    fallbackPrice: 12.99,
    baseQtyFor4: 1,
    pairingNote: 'First-harvest peppery finishing drizzle with herbs',
  },
  {
    productId: 'prod-dark-chocolate-almonds',
    fallbackName: 'Dark Chocolate Sea Salt Roasted Almonds',
    fallbackBrand: 'Orchard Reserve',
    fallbackCategory: 'snacks',
    fallbackAisle: 'Aisle 8 · Artisanal Snacks',
    fallbackUnit: '10 oz pouch',
    fallbackPrice: 6.99,
    baseQtyFor4: 1,
    pairingNote: '70% cacao sweet-savory finish for the tasting board',
  },
];

function hydrateTastingItems(
  guestCount: number,
  products: Product[],
  existingItems?: TastingBoardItem[]
): TastingBoardItem[] {
  const scaleFactor = Math.max(0.5, guestCount / 4);
  return TASTING_BOARD_SPECS.map((spec, index) => {
    const matched = products.find((p) => p.id === spec.productId);
    const prev = existingItems?.[index];
    const included = prev ? prev.included !== false : true;
    const unitPrice = matched?.price ?? spec.fallbackPrice;
    const scaledQty = Math.max(1, Math.round(spec.baseQtyFor4 * scaleFactor));
    const lineTotal = Number((unitPrice * scaledQty).toFixed(2));

    return {
      id: `tasting_item_${index + 1}`,
      productId: spec.productId,
      name: matched?.name ?? spec.fallbackName,
      brand: matched?.brand ?? spec.fallbackBrand,
      category: matched?.category ?? spec.fallbackCategory,
      aisleLocation: matched?.aisleLocation ?? spec.fallbackAisle,
      unit: matched?.unit ?? spec.fallbackUnit,
      unitPrice,
      baseQty: spec.baseQtyFor4,
      scaledQty,
      lineTotal,
      included,
      pairingNote: spec.pairingNote,
    };
  });
}

export function buildExtensionsShowcaseDataModel(options: {
  guestCount?: number;
  palette?: ExtensionThemePalette;
  enableConfetti?: boolean;
  enableAisleHighlights?: boolean;
  enableAnimations?: boolean;
  products: Product[];
  existingItems?: TastingBoardItem[];
  lastActionConfirmation?: string;
  lastOutboundExtensionsJson?: string;
}): Record<string, unknown> {
  const guestCount = Math.min(10, Math.max(2, Number(options.guestCount ?? 4)));
  const palette: ExtensionThemePalette = options.palette ?? 'harvest-gold';
  const enableConfetti = options.enableConfetti ?? true;
  const enableAisleHighlights = options.enableAisleHighlights ?? true;
  const enableAnimations = options.enableAnimations ?? true;

  const tastingItems = hydrateTastingItems(
    guestCount,
    options.products,
    options.existingItems
  );

  const includedItems = tastingItems.filter((item) => item.included);
  const bundleSubtotal = Number(
    includedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );
  const perGuestCost = Number((bundleSubtotal / guestCount).toFixed(2));

  const paletteMeta: Record<
    ExtensionThemePalette,
    { label: string; subtitle: string; accentHex: string }
  > = {
    'harvest-gold': {
      label: 'Harvest Gold Reserve',
      subtitle: 'Warm artisanal amber & stone accents via freshcart_theme',
      accentHex: '#D97706',
    },
    'emerald-organic': {
      label: 'Emerald Organic Market',
      subtitle: 'Botanical forest green palette via freshcart_theme',
      accentHex: '#0AAD0A',
    },
    'midnight-cellar': {
      label: 'Midnight Sommelier Cellar',
      subtitle: 'Deep slate & indigo evening tasting theme via freshcart_theme',
      accentHex: '#4F46E5',
    },
  };

  return {
    boardTitle: "### Chef's Artisanal Tasting & Pairing Board",
    boardSubtitle: `${paletteMeta[palette].label} · Curated for ${guestCount} guests (${includedItems.length} artisanal picks)`,
    guestCount,
    extensionThemePalette: [palette],
    activePaletteName: paletteMeta[palette].label,
    activePaletteSubtitle: paletteMeta[palette].subtitle,
    activeAccentHex: paletteMeta[palette].accentHex,
    extensionsConfig: {
      enableConfettiOnAction: enableConfetti,
      enableAisleHighlights,
      enableAnimations,
    },
    tastingItems,
    bundleSubtotal,
    perGuestCost,
    includedCount: includedItems.length,
    nutrition: {
      calories: Math.round(540 * (guestCount / 4)),
      proteinG: Math.round(38 * (guestCount / 4)),
      carbsG: Math.round(34 * (guestCount / 4)),
      fatG: Math.round(26 * (guestCount / 4)),
      fiberG: Math.round(6 * (guestCount / 4)),
      servings: guestCount,
    },
    featuredDeal: {
      productId: 'prod-extra-virgin-olive-oil',
      title: 'Cold-Pressed Estate Extra Virgin Olive Oil',
      brand: 'Terra Verde Estate · 16.9 fl oz',
      price: 12.99,
      originalPrice: 16.49,
      badge: 'Chef Extension Pick · Save $3.50',
      aisleLocation: 'Aisle 6 · Oils & Vinegars',
      imageUrl:
        options.products.find((p) => p.id === 'prod-extra-virgin-olive-oil')
          ?.imageUrl ??
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    },
    lastActionConfirmation: options.lastActionConfirmation ?? '',
    lastOutboundExtensionsJson: options.lastOutboundExtensionsJson ?? '',
  };
}

export function recalculateExtensionsShowcaseDataModel(
  currentModel: Record<string, unknown>,
  changedPointerPath: string,
  products: Product[]
): Record<string, unknown> {
  const rawPaletteList = currentModel.extensionThemePalette;
  const paletteCandidate = Array.isArray(rawPaletteList)
    ? String(rawPaletteList[0] ?? 'harvest-gold')
    : String(rawPaletteList ?? 'harvest-gold');
  const palette: ExtensionThemePalette =
    paletteCandidate === 'emerald-organic' ||
    paletteCandidate === 'midnight-cellar'
      ? paletteCandidate
      : 'harvest-gold';

  const extCfg = (currentModel.extensionsConfig ?? {}) as Record<
    string,
    unknown
  >;
  const existingItems = Array.isArray(currentModel.tastingItems)
    ? (currentModel.tastingItems as TastingBoardItem[])
    : undefined;

  return buildExtensionsShowcaseDataModel({
    guestCount: Number(currentModel.guestCount ?? 4),
    palette,
    enableConfetti: Boolean(extCfg.enableConfettiOnAction ?? true),
    enableAisleHighlights: Boolean(extCfg.enableAisleHighlights ?? true),
    enableAnimations: Boolean(extCfg.enableAnimations ?? true),
    products,
    existingItems,
    lastActionConfirmation:
      changedPointerPath.startsWith('/extensionThemePalette')
        ? `Switched surface freshcart_theme extension to "${palette}" ✓`
        : String(currentModel.lastActionConfirmation ?? ''),
    lastOutboundExtensionsJson: String(
      currentModel.lastOutboundExtensionsJson ?? ''
    ),
  });
}

export function buildExtensionsShowcaseComponents(): A2UIComponentBase[] {
  return [
    {
      id: 'root',
      component: 'Column',
      children: [
        'hero_card',
        'theme_controls_card',
        'items_card',
        'featured_oil_card',
        'nutrition_summary_card',
        'checkout_bar_card',
      ],
      metadata: {
        extensions: {
          freshcart_animations: {
            entrance: 'fade-in-up',
            staggerChildrenMs: 60,
          },
          freshcart_analyticsProvenance: {
            surfaceRole: 'extensions_showcase_root',
            specVersion: 'v1.0',
          },
        },
      },
    },
    {
      id: 'hero_card',
      component: 'Card',
      child: 'hero_col',
      metadata: {
        extensions: {
          freshcart_dealSpotlight: {
            ribbonText:
              '✨ A2UI v1.0 Protocol Extensions · Surface + Component + Action Metadata',
            tone: 'amber',
          },
          freshcart_animations: {
            entrance: 'shimmer-highlight',
            elevation: 'featured',
          },
          freshcart_analyticsProvenance: {
            slotId: 'hero_tasting_banner',
            campaign: 'autumn_artisanal_2026',
          },
        },
      },
    },
    {
      id: 'hero_col',
      component: 'Column',
      children: ['hero_title', 'hero_subtitle', 'hero_Confirm_text'],
    },
    {
      id: 'hero_title',
      component: 'Text',
      text: { '@path': '/boardTitle' },
      variant: 'body',
    },
    {
      id: 'hero_subtitle',
      component: 'Text',
      text: { '@path': '/boardSubtitle' },
      variant: 'caption',
    },
    {
      id: 'hero_Confirm_text',
      component: 'Text',
      text: { '@path': '/lastActionConfirmation' },
      variant: 'caption',
      accessibility: {
        live: 'polite',
        hidden: {
          '@call': ' equals',
          args: {
            a: { '@path': '/lastActionConfirmation' },
            b: '',
          },
        },
      },
    },
    {
      id: 'theme_controls_card',
      component: 'Card',
      child: 'theme_controls_col',
      metadata: {
        extensions: {
          freshcart_animations: {
            entrance: 'float-up',
          },
          freshcart_analyticsProvenance: {
            widgetType: 'extension_live_controls',
            bindsTo: '/extensionThemePalette',
          },
        },
      },
    },
    {
      id: 'theme_controls_col',
      component: 'Column',
      children: [
        'palette_picker',
        'guest_slider',
        'extension_toggles_row',
      ],
    },
    {
      id: 'palette_picker',
      component: 'ChoicePicker',
      label: 'Surface Extension Theme (metadata.extensions.freshcart_theme)',
      variant: 'mutuallyExclusive',
      displayStyle: 'chips',
      value: { '@path': '/extensionThemePalette' },
      options: [
        { label: '🍯 Harvest Gold', value: 'harvest-gold' },
        { label: '🌿 Emerald Organic', value: 'emerald-organic' },
        { label: '🍷 Midnight Cellar', value: 'midnight-cellar' },
      ],
    },
    {
      id: 'guest_slider',
      component: 'Slider',
      label: 'Tasting Board Guests (scales quantities & macros)',
      min: 2,
      max: 10,
      step: 2,
      value: { '@path': '/guestCount' },
    },
    {
      id: 'extension_toggles_row',
      component: 'Row',
      children: ['toggle_aisle_ext', 'toggle_confetti_ext'],
    },
    {
      id: 'toggle_aisle_ext',
      component: 'CheckBox',
      label: 'Show Aisle Locator Extensions (freshcart_aisleHighlight)',
      value: { '@path': '/extensionsConfig/enableAisleHighlights' },
      weight: 1,
    },
    {
      id: 'toggle_confetti_ext',
      component: 'CheckBox',
      label: 'Celebration Confetti on Action (freshcart_confettiOnAction)',
      value: { '@path': '/extensionsConfig/enableConfettiOnAction' },
      weight: 1,
    },
    {
      id: 'items_card',
      component: 'Card',
      child: 'items_col',
      metadata: {
        extensions: {
          freshcart_aisleHighlight: {
            aisleLabel: 'Aisles 1–3 · Artisanal Bakery, Seafood & Cheese',
            category: 'dairy-eggs',
            productId: 'prod-feta-cheese',
            zoneBadge: 'In-Store Guided Route',
          },
          freshcart_analyticsProvenance: {
            section: 'tasting_board_items',
            templateBinding: '/tastingItems',
          },
        },
      },
    },
    {
      id: 'items_col',
      component: 'Column',
      children: ['items_header_text', 'items_list'],
    },
    {
      id: 'items_header_text',
      component: 'Text',
      text: '**Curated Tasting Board Components** *(each item carries component-level metadata.extensions)*',
      variant: 'caption',
    },
    {
      id: 'items_list',
      component: 'Column',
      children: {
        componentId: 'tasting_item_row',
        path: '/tastingItems',
      },
    },
    {
      id: 'tasting_item_row',
      component: 'Row',
      align: 'center',
      children: [
        'item_check',
        'item_info_col',
        'item_price_text',
        'item_locate_btn',
      ],
      metadata: {
        extensions: {
          freshcart_animations: {
            entrance: 'slide-in-right',
          },
          freshcart_analyticsProvenance: {
            templateRow: true,
            tracksSelection: true,
          },
        },
      },
    },
    {
      id: 'item_check',
      component: 'CheckBox',
      label: { '@path': 'name' },
      value: { '@path': 'included' },
      weight: 2,
    },
    {
      id: 'item_info_col',
      component: 'Column',
      children: ['item_meta_caption', 'item_pairing_caption'],
      weight: 2,
    },
    {
      id: 'item_meta_caption',
      component: 'Text',
      text: {
        '@call': 'formatString',
        args: {
          template: '{0} × {1} · 📍 {2}',
          values: [
            { '@path': 'scaledQty' },
            { '@path': 'unit' },
            { '@path': 'aisleLocation' },
          ],
        },
      },
      variant: 'caption',
    },
    {
      id: 'item_pairing_caption',
      component: 'Text',
      text: { '@path': 'pairingNote' },
      variant: 'caption',
    },
    {
      id: 'item_price_text',
      component: 'Text',
      text: {
        '@call': 'formatCurrency',
        args: {
          amount: { '@path': 'lineTotal' },
          currency: 'USD',
        },
      },
      variant: 'body',
    },
    {
      id: 'item_locate_btn',
      component: 'Button',
      variant: 'borderless',
      child: 'item_locate_btn_label',
      action: {
        event: {
          name: 'locate_aisle_item',
          userMessage: 'Highlight item aisle in storefront',
          context: {
            productId: { '@path': 'productId' },
            name: { '@path': 'name' },
            category: { '@path': 'category' },
            aisleLocation: { '@path': 'aisleLocation' },
          },
        },
      },
      metadata: {
        extensions: {
          freshcart_analyticsProvenance: {
            actionType: 'aisle_highlight_navigation',
            sourceExtension: 'freshcart_aisleHighlight',
          },
        },
      },
    },
    {
      id: 'item_locate_btn_label',
      component: 'Text',
      text: '📍 Aisle',
      variant: 'caption',
    },
    {
      id: 'featured_oil_card',
      component: 'ProductDealCard',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      productId: { '@path': '/featuredDeal/productId' },
      title: { '@path': '/featuredDeal/title' },
      brand: { '@path': '/featuredDeal/brand' },
      price: { '@path': '/featuredDeal/price' },
      originalPrice: { '@path': '/featuredDeal/originalPrice' },
      badge: { '@path': '/featuredDeal/badge' },
      imageUrl: { '@path': '/featuredDeal/imageUrl' },
      action: {
        event: {
          name: 'add_pairing_item',
          userMessage: 'Add Estate Extra Virgin Olive Oil to cart',
          context: {
            productId: { '@path': '/featuredDeal/productId' },
            title: { '@path': '/featuredDeal/title' },
            quantity: 1,
          },
        },
      },
      metadata: {
        extensions: {
          freshcart_dealSpotlight: {
            ribbonText: '⚡ Sommelier Finishing Touch · Save $3.50',
            tone: 'emerald',
          },
          freshcart_aisleHighlight: {
            aisleLabel: 'Aisle 6 · Cold-Pressed Oils & Vinegars',
            category: 'pantry',
            productId: 'prod-extra-virgin-olive-oil',
            zoneBadge: 'Estate Bottled',
          },
          freshcart_animations: {
            entrance: 'pulse-border',
          },
          freshcart_analyticsProvenance: {
            placement: 'sommelier_finishing_upsell',
            experimentCohort: 'v1_extensions_spotlight',
          },
        },
      },
    },
    {
      id: 'nutrition_summary_card',
      component: 'NutritionSummary',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      calories: { '@path': '/nutrition/calories' },
      proteinG: { '@path': '/nutrition/proteinG' },
      carbsG: { '@path': '/nutrition/carbsG' },
      fatG: { '@path': '/nutrition/fatG' },
      fiberG: { '@path': '/nutrition/fiberG' },
      servings: { '@path': '/nutrition/servings' },
      metadata: {
        extensions: {
          freshcart_analyticsProvenance: {
            macroCalculator: 'per_board_total',
            verifiedBy: 'freshcart_nutrition_engine',
          },
        },
      },
    },
    {
      id: 'checkout_bar_card',
      component: 'Card',
      child: 'checkout_bar_row',
      metadata: {
        extensions: {
          freshcart_confettiOnAction: {
            enabled: true,
            particleCount: 30,
            celebrationLabel: 'Tasting Board Added with v1.0 Action Extensions! 🎉',
          },
          freshcart_analyticsProvenance: {
            ctaRegion: 'bottom_bundle_action_bar',
          },
        },
      },
    },
    {
      id: 'checkout_bar_row',
      component: 'Row',
      align: 'center',
      justify: 'spaceBetween',
      children: ['checkout_totals_col', 'add_tasting_board_btn'],
    },
    {
      id: 'checkout_totals_col',
      component: 'Column',
      children: ['checkout_total_label', 'checkout_per_guest_label'],
      weight: 1,
    },
    {
      id: 'checkout_total_label',
      component: 'Text',
      text: {
        '@call': 'formatCurrency',
        args: {
          amount: { '@path': '/bundleSubtotal' },
          currency: 'USD',
        },
      },
      variant: 'body',
    },
    {
      id: 'checkout_per_guest_label',
      component: 'Text',
      text: {
        '@call': 'formatString',
        args: {
          template: '{0} items · ${1} per guest',
          values: [
            { '@path': '/includedCount' },
            { '@path': '/perGuestCost' },
          ],
        },
      },
      variant: 'caption',
    },
    {
      id: 'add_tasting_board_btn',
      component: 'Button',
      variant: 'primary',
      child: 'add_tasting_board_btn_text',
      action: {
        event: {
          name: 'add_tasting_board_to_cart',
          userMessage: 'Add Artisanal Tasting Board bundle to cart',
          context: {
            guestCount: { '@path': '/guestCount' },
            tastingItems: { '@path': '/tastingItems' },
            bundleSubtotal: { '@path': '/bundleSubtotal' },
            activePaletteName: { '@path': '/activePaletteName' },
          },
        },
      },
      metadata: {
        extensions: {
          freshcart_confettiOnAction: {
            enabled: true,
            burstStyle: 'harvest-celebration',
            particleCount: 32,
          },
          freshcart_analyticsProvenance: {
            conversionEvent: 'add_tasting_board_bundle',
            attributionModel: 'a2ui_v1_action_metadata_extension',
            funnelStage: 'one_click_bundle_add',
          },
          a2ui_telemetry: {
            emitsActionMetadataExtensions: true,
            specSchema: 'renderer_to_agent.json#/properties/action/properties/metadata',
          },
        },
      },
    },
    {
      id: 'add_tasting_board_btn_text',
      component: 'Text',
      text: 'Add Tasting Board to Cart',
      variant: 'body',
    },
  ];
}

export function buildExtensionsShowcaseStream(options: {
  storeId: StoreId;
  products: Product[];
  palette?: ExtensionThemePalette;
  guestCount?: number;
}): A2UIv1Message[] {
  const palette = options.palette ?? 'harvest-gold';
  const dataModel = buildExtensionsShowcaseDataModel({
    guestCount: options.guestCount ?? 4,
    palette,
    products: options.products,
  });
  const components = buildExtensionsShowcaseComponents();

  return [
    {
      version: A2UI_VERSION,
      createSurface: {
        surfaceId: EXTENSIONS_SHOWCASE_SURFACE_ID,
        catalogId: A2UI_BASIC_CATALOG_ID,
        sendDataModel: true,
        metadata: {
          extensions: {
            freshcart_theme: {
              palette,
              accentColor: '#D97706',
              surfaceStyle: 'chef-reserve',
              badgeLabel: 'A2UI v1.0 Protocol Extensions',
            },
            freshcart_confettiOnAction: {
              enabled: true,
              particleCount: 32,
              celebrationText: 'Tasting Board Added to Cart! 🎉',
            },
            freshcart_aisleHighlight: {
              storeId: options.storeId,
              interactiveStorefrontSync: true,
            },
            freshcart_animations: {
              surfaceTransition: 'smooth-reveal',
              cardHoverLift: true,
            },
            freshcart_analyticsProvenance: {
              campaignId: 'chef_tasting_extensions_2026',
              storeId: options.storeId,
              protocolFeature: 'metadata.extensions',
              uax31Validated: true,
            },
            a2ui_telemetry: {
              sessionId: 'fc_ext_session_v1',
              specRef: 'common_types.json#/$defs/Extensions',
            },
          },
        },
      },
    },
    {
      version: A2UI_VERSION,
      updateComponents: {
        surfaceId: EXTENSIONS_SHOWCASE_SURFACE_ID,
        components,
      },
    },
    {
      version: A2UI_VERSION,
      updateDataModel: {
        surfaceId: EXTENSIONS_SHOWCASE_SURFACE_ID,
        path: '/',
        value: dataModel,
      },
    },
  ];
}
