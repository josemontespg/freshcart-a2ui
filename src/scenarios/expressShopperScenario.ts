import {
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { Product, StoreId } from '../types/grocery';
import {
  compileA2UIExpress,
  type ExpressCompilationResult,
} from '../a2ui/express/expressCompiler';
import type { MealIngredientItem } from './mealPlannerScenario';

export const EXPRESS_SHOPPER_SURFACE_ID = 'express_dinner_surface' as const;

export interface ExpressShopperOptions {
  servings?: number;
  organicOnly?: boolean;
  deliveryZip?: string;
  activeStoreId?: StoreId;
  products?: Product[];
}

interface ExpressBlueprintIngredient {
  defaultProductId: string;
  organicProductId: string;
  fallbackName: string;
  organicFallbackName: string;
  unitLabel: string;
  baseQtyFor2: number;
  defaultPrice: number;
  organicPrice: number;
  originalPrice: number;
  badgeText: string;
  reason: string;
  imageUrl: string;
}

const EXPRESS_SKILLET_BLUEPRINT: ExpressBlueprintIngredient[] = [
  {
    defaultProductId: 'prod-salmon-fillet',
    organicProductId: 'prod-salmon-fillet',
    fallbackName: 'Wild-Caught Alaskan Sockeye Salmon Fillet',
    organicFallbackName: 'Wild-Caught Alaskan Sockeye Salmon Fillet',
    unitLabel: '1 lb fillet',
    baseQtyFor2: 1,
    defaultPrice: 14.99,
    organicPrice: 14.99,
    originalPrice: 16.99,
    badgeText: '12-Min Pan Sear',
    reason: 'Pre-portioned wild Sockeye fillet · 38g protein per serving',
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    defaultProductId: 'prod-quinoa',
    organicProductId: 'prod-org-quinoa',
    fallbackName: 'Tri-Color Royal Bolivian Quinoa',
    organicFallbackName: 'USDA Organic Sprouted Tri-Color Quinoa',
    unitLabel: '16 oz bag',
    baseQtyFor2: 1,
    defaultPrice: 4.99,
    organicPrice: 6.49,
    originalPrice: 7.29,
    badgeText: 'Quick-Cook Grain',
    reason: 'Sprouted tri-color quinoa · Ready in 12 minutes flat',
    imageUrl:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  },
  {
    defaultProductId: 'prod-conv-spinach',
    organicProductId: 'prod-baby-spinach',
    fallbackName: 'Fresh Tender Leaf Baby Spinach',
    organicFallbackName: 'Triple-Washed Organic Baby Spinach',
    unitLabel: '10 oz tub',
    baseQtyFor2: 1,
    defaultPrice: 2.99,
    organicPrice: 4.49,
    originalPrice: 4.99,
    badgeText: 'Zero-Prep Greens',
    reason: 'Triple-washed tender leaves · Wilts in 60 seconds with lemon zest',
    imageUrl:
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    defaultProductId: 'prod-cherry-tomatoes',
    organicProductId: 'prod-org-cherry-tomatoes',
    fallbackName: 'Vine-Ripened Sweet Cherry Tomatoes',
    organicFallbackName: 'USDA Organic Heirloom Medley Cherry Tomatoes',
    unitLabel: '10 oz clamshell',
    baseQtyFor2: 1,
    defaultPrice: 3.49,
    organicPrice: 4.99,
    originalPrice: 5.49,
    badgeText: 'Blistered Skillet Side',
    reason: 'Sweet heirloom cherry tomatoes · Burst in warm olive oil in 4 mins',
    imageUrl:
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=600&q=80',
  },
];

function lookupStoreProduct(
  products: Product[] | undefined,
  productId: string
): Product | undefined {
  if (!products || products.length === 0) return undefined;
  return products.find((p) => p.id === productId);
}

/**
 * Builds the canonical `<a2ui>...</a2ui>` Express DSL source string for the
 * 15-Minute Express Skillet & 1-Tap Express Checkout scenario.
 *
 * Demonstrates every core construct of the A2UI v1.0 Express specification:
 * - `surface(...)` declaration
 * - `$/path = value` data model assignments
 * - Positional & keyword constructors (`Text`, `Card`, `Row`, `Column`, `Slider`,
 *   `CheckBox`, `ChoicePicker`, `TextField`, `Button`, `NutritionSummary`, `ProductDealCard`)
 * - Inline nested component constructors (`Button(Text("..."), Event(...))`)
 * - Skipped optional positional arguments with `_`
 * - Custom hyphenated ID (`id="express-deal-grid"`)
 * - Validation checks (`?required(...)`, `?regex(r"^[0-9]{5}$", "...")`)
 */
export function buildExpressShopperDslSource(
  options: ExpressShopperOptions = {}
): string {
  const servings = Math.max(1, Math.min(8, Math.round(options.servings ?? 2)));
  const organicOnly = options.organicOnly ?? true;
  const deliveryZip = options.deliveryZip ?? '94107';
  const products = options.products;

  const scaleFactor = servings / 2;

  const ingredients: MealIngredientItem[] = EXPRESS_SKILLET_BLUEPRINT.map(
    (item) => {
      const chosenId = organicOnly
        ? item.organicProductId
        : item.defaultProductId;
      const swapId = organicOnly
        ? item.defaultProductId
        : item.organicProductId;
      const prod = lookupStoreProduct(products, chosenId);
      const unitPrice = prod
        ? prod.price
        : organicOnly
          ? item.organicPrice
          : item.defaultPrice;
      const name = prod
        ? prod.name
        : organicOnly
          ? item.organicFallbackName
          : item.fallbackName;
      const unitText = prod ? prod.unit : item.unitLabel;
      const scaledQty = Math.max(1, Math.ceil(item.baseQtyFor2 * scaleFactor));
      const linePrice = Number((unitPrice * scaledQty).toFixed(2));

      return {
        productId: chosenId,
        swapProductId: swapId,
        name,
        unit: `${scaledQty}x ${unitText}`,
        baseQty: item.baseQtyFor2,
        scaledQty,
        unitPrice,
        price: linePrice,
        isOrganic: organicOnly,
        checked: true,
        swapLabel: organicOnly ? 'Use Standard' : 'Swap Organic',
      };
    }
  );

  const bundleSubtotal = Number(
    ingredients.reduce((sum, item) => sum + item.price, 0).toFixed(2)
  );

  const dealCardsDsl = EXPRESS_SKILLET_BLUEPRINT.map((item, idx) => {
    const ing = ingredients[idx];
    const prod = lookupStoreProduct(products, ing.productId);
    const imageUrl = prod?.imageUrl ?? item.imageUrl;
    const origPrice = prod?.originalPrice ?? item.originalPrice;

    return `deal_card_${idx + 1} = ProductDealCard(${JSON.stringify(
      ing.productId
    )}, ${JSON.stringify(ing.name)}, ${ing.price}, ${origPrice}, ${JSON.stringify(
      ing.unit
    )}, ${JSON.stringify(item.badgeText)}, ${JSON.stringify(
      item.reason
    )}, ${JSON.stringify(imageUrl)}, "Add Item", Event("add_pairing_item", {productId: ${JSON.stringify(
      ing.productId
    )}, quantity: ${ing.scaledQty}, title: ${JSON.stringify(ing.name)}}))`;
  }).join('\n');

  return `<a2ui>
// Chef's 15-Minute Express Skillet & 1-Tap Express Lane Checkout
surface("${EXPRESS_SHOPPER_SURFACE_ID}", sendDataModel=true)

$/isExpressScenario = true
$/recipeTitle = "## 15-Minute Garlic Herb Salmon & Heirloom Tomato Skillet"
$/recipeSubtitle = "One-pan weeknight dinner ready in 15 minutes · Express courier delivery available"
$/servings = ${servings}
$/organicOnly = ${organicOnly}
$/deliveryWindow = ["express-15"]
$/deliveryZip = ${JSON.stringify(deliveryZip)}
$/bundleSubtotal = ${bundleSubtotal}
$/statusBanner = ${JSON.stringify(
    `Express bundle ready: 4 skillet ingredients for ${servings} servings ($${bundleSubtotal.toFixed(2)} total)`
  )}
$/ingredients = ${JSON.stringify(ingredients)}

header_title = Text($/recipeTitle, "h2")
header_subtitle = Text($/recipeSubtitle, "caption")
servings_slider = Slider($/servings, 1, 8, "Dinner Servings")
organic_toggle = CheckBox("Prefer USDA Organic produce & sprouted grains", $/organicOnly)
window_picker = ChoicePicker([{label: "⚡ 15-Min Priority Courier", value: "express-15"}, {label: "🚲 35-Min Eco Bike Window", value: "eco-35"}], $/deliveryWindow, "Express Delivery Window", "mutuallyExclusive")
zip_input = TextField("Express Delivery ZIP Code", $/deliveryZip, "shortText", [?required("ZIP code is required for express courier dispatch"), ?regex(r"^[0-9]{5}$", "Enter a valid 5-digit ZIP code for 15-minute express delivery")])
header_card = Card(Column([header_title, header_subtitle, Divider(), servings_slider, organic_toggle, window_picker, zip_input], "start", "stretch"))

macro_card = NutritionSummary("Nutrition per Serving (15-Min Skillet)", 510, 44, 32, 21, 7, $/servings, 2000)

picks_heading = Text("### Skillet Ingredients (Ready in 15 Mins)", "h3")
${dealCardsDsl}
deal_grid = Column([deal_card_1, deal_card_2, deal_card_3, deal_card_4], "start", "stretch", id="express-deal-grid")

status_text = Text($/statusBanner, "caption")
checkout_btn = Button(Text("Add 15-Min Express Bundle to Cart"), Event("add_recipe_bundle_to_cart", {recipeTitle: $/recipeTitle, servings: $/servings, ingredients: $/ingredients}), "primary")
footer_card = Card(Column([status_text, checkout_btn], "start", "stretch"))

root = Column([header_card, macro_card, picks_heading, deal_grid, footer_card], "start", "stretch")
</a2ui>`;
}

/**
 * Compiles the 15-Minute Express Dinner DSL into A2UI v1.0 envelopes
 * (`createSurface`, `updateComponents`, `updateDataModel`) and returns both
 * the envelopes and the compilation telemetry.
 */
export function buildExpressShopperCompilation(
  options: ExpressShopperOptions = {}
): ExpressCompilationResult {
  const dsl = buildExpressShopperDslSource(options);
  return compileA2UIExpress(dsl, {
    defaultSurfaceId: EXPRESS_SHOPPER_SURFACE_ID,
    defaultCatalogId: FRESHCART_GROCERY_CATALOG_ID,
    emitProgressiveEnvelopes: true,
  });
}

export function buildExpressShopperStream(
  options: ExpressShopperOptions = {}
): A2UIv1Message[] {
  return buildExpressShopperCompilation(options).envelopes;
}

/**
 * Recalculates the Express Dinner surface dataModel when the user drags the
 * Servings slider, toggles USDA Organic, or updates the Express ZIP code.
 */
export function recalculateExpressShopperDataModel(
  currentModel: Record<string, unknown>,
  products?: Product[]
): Record<string, unknown> {
  const servings = Math.max(
    1,
    Math.min(8, Math.round(Number(currentModel.servings ?? 2)))
  );
  const organicOnly = Boolean(currentModel.organicOnly ?? true);
  const scaleFactor = servings / 2;

  const updatedIngredients: MealIngredientItem[] =
    EXPRESS_SKILLET_BLUEPRINT.map((item) => {
      const chosenId = organicOnly
        ? item.organicProductId
        : item.defaultProductId;
      const swapId = organicOnly
        ? item.defaultProductId
        : item.organicProductId;
      const prod = lookupStoreProduct(products, chosenId);
      const unitPrice = prod
        ? prod.price
        : organicOnly
          ? item.organicPrice
          : item.defaultPrice;
      const name = prod
        ? prod.name
        : organicOnly
          ? item.organicFallbackName
          : item.fallbackName;
      const unitText = prod ? prod.unit : item.unitLabel;
      const scaledQty = Math.max(1, Math.ceil(item.baseQtyFor2 * scaleFactor));
      const linePrice = Number((unitPrice * scaledQty).toFixed(2));

      return {
        productId: chosenId,
        swapProductId: swapId,
        name,
        unit: `${scaledQty}x ${unitText}`,
        baseQty: item.baseQtyFor2,
        scaledQty,
        unitPrice,
        price: linePrice,
        isOrganic: organicOnly,
        checked: true,
        swapLabel: organicOnly ? 'Use Standard' : 'Swap Organic',
      };
    });

  const bundleSubtotal = Number(
    updatedIngredients.reduce((sum, item) => sum + item.price, 0).toFixed(2)
  );

  const windowArr = Array.isArray(currentModel.deliveryWindow)
    ? currentModel.deliveryWindow
    : ['express-15'];
  const isFast = windowArr.includes('express-15');
  const windowLabel = isFast ? '15-min priority courier' : '35-min eco bike';

  return {
    ...currentModel,
    isExpressScenario: true,
    servings,
    organicOnly,
    ingredients: updatedIngredients,
    bundleSubtotal,
    statusBanner: `Express bundle ready: 4 skillet ingredients for ${servings} ${
      servings === 1 ? 'serving' : 'servings'
    } ($${bundleSubtotal.toFixed(2)} · ${windowLabel})`,
    versionTag: A2UI_VERSION,
  };
}
