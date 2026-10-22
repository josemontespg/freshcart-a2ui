import {
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import type { Product, StoreId } from '../types/grocery';

export const ACCESSIBLE_SHOPPER_SURFACE_ID = 'accessible-shopper-surface';

export interface AccessibleIngredientItem {
  id: string;
  productId: string;
  name: string;
  unit: string;
  unitPrice: number;
  originalPrice?: number;
  baseQty: number;
  scaledQty: number;
  lineTotal: number;
  lineTotalFormatted: string;
  checked: boolean;
  allergenBadge: string;
  prepNote: string;
  imageUrl: string;
  a11yLabel: string;
  a11yDescription: string;
}

export interface AccessibleShopperScenarioOptions {
  servings?: number;
  selectedAllergens?: string[];
  easyOpenPackaging?: boolean;
  showVoiceCookingGuide?: boolean;
  showAllergenBanner?: boolean;
  products?: Product[];
  activeStoreId?: StoreId;
}

/**
 * Generates a short, pleasant 1.2-second warm chime WAV data URI so `<audio controls>`
 * in `AudioPlayer` plays cleanly without external network dependencies.
 */
function createPleasantChimeWavDataUri(): string {
  const sampleRate = 8000;
  const durationSeconds = 1.2;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Warm C5 + E5 + G5 arpeggio chime
  const freqs = [523.25, 659.25, 783.99];
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-3.2 * t);
    let sample = 0;
    for (let fIdx = 0; fIdx < freqs.length; fIdx++) {
      const start = fIdx * 0.12;
      if (t >= start) {
        sample += Math.sin(2 * Math.PI * freqs[fIdx] * (t - start)) * 0.28;
      }
    }
    const pcm = Math.max(-1, Math.min(1, sample * env));
    view.setInt16(44 + i * 2, Math.floor(pcm * 32767), true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 =
    typeof btoa === 'function' ? btoa(binary) : '';
  return base64 ? `data:audio/wav;base64,${base64}` : '';
}

const AUDIO_CHIME_DATA_URI = createPleasantChimeWavDataUri();

const ALLERGEN_LABELS: Record<string, string> = {
  'dairy-free': 'Dairy & Lactose Free',
  'gluten-free': 'Gluten & Wheat Free',
  'nut-free': 'Tree Nut & Peanut Free',
  'shellfish-free': 'Shellfish Free',
};

function buildAccessibleIngredients(
  servings: number,
  selectedAllergens: string[],
  easyOpenPackaging: boolean,
  products?: Product[]
): AccessibleIngredientItem[] {
  const scale = Math.max(1, Math.round(servings)) / 4;
  const isDairyFree = selectedAllergens.includes('dairy-free');
  const isGlutenFree = selectedAllergens.includes('gluten-free');

  const findProduct = (id: string, fallbackName: string, fallbackPrice: number, fallbackUnit: string, fallbackImg: string) => {
    const found = products?.find((p) => p.id === id);
    return {
      productId: id,
      name: found?.name ?? fallbackName,
      unitPrice: found?.price ?? fallbackPrice,
      originalPrice: found?.originalPrice,
      unit: found?.unit ?? fallbackUnit,
      imageUrl: found?.imageUrl ?? fallbackImg,
    };
  };

  const rawSpecs = [
    {
      id: 'item-salmon',
      ...findProduct(
        'prod-salmon-fillet',
        'Wild-Caught Alaskan Sockeye Salmon Fillet',
        14.99,
        '1 lb fillet',
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80'
      ),
      baseQty: 1,
      allergenBadge: '100% Allergen-Safe · Omega-3 Rich',
      prepNote: easyOpenPackaging
        ? 'Boneless skin-scored portion in peel-open vacuum pack — no descaling required'
        : 'Center-cut wild fillet ready for 15-minute sheet-pan roasting',
    },
    {
      id: 'item-quinoa',
      ...findProduct(
        'prod-org-quinoa',
        'USDA Organic Sprouted Tri-Color Quinoa',
        6.49,
        '16 oz bag',
        'https://images.unsplash.com/photo-1586201375761-83862001e31c?auto=format&fit=crop&w=600&q=80'
      ),
      baseQty: 1,
      allergenBadge: isGlutenFree
        ? 'Certified Gluten-Free Ancient Grain'
        : 'Pre-Washed Sprouted Grain',
      prepNote: easyOpenPackaging
        ? 'Pre-rinsed in easy-pour resealable stand-up pouch; cooks in 12 minutes'
        : 'Provides all 9 essential amino acids and 7g protein per serving',
    },
    {
      id: 'item-greens',
      ...findProduct(
        'prod-baby-spinach',
        'Triple-Washed Organic Baby Spinach',
        4.49,
        '10 oz tub',
        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'
      ),
      baseQty: 1,
      allergenBadge: 'Triple-Washed · Ready to Eat',
      prepNote: easyOpenPackaging
        ? 'Wide-grip pop-top clamshell tub — zero washing, chopping, or stemming needed'
        : 'Tender organic baby spinach leaves packed with iron and folate',
    },
    isDairyFree
      ? {
          id: 'item-creamy-swap',
          ...findProduct(
            'prod-org-avocado',
            'Organic Hass Avocados (Bag)',
            5.49,
            '4 ct bag',
            'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80'
          ),
          baseQty: 1,
          allergenBadge: 'Dairy-Free Swap (Replaces Feta Cheese)',
          prepNote:
            'Automatically substituted for Sheep Milk Feta to keep your meal 100% dairy- and lactose-free',
        }
      : {
          id: 'item-creamy-swap',
          ...findProduct(
            'prod-feta-cheese',
            'Traditional Sheep Milk Crumbled Feta',
            5.99,
            '8 oz tub',
            'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=600&q=80'
          ),
          baseQty: 1,
          allergenBadge: 'Pre-Crumbled · Contains Dairy',
          prepNote: easyOpenPackaging
            ? 'Pre-crumbled in easy-open flip tub — no block slicing required'
            : 'Tangy Mediterranean crumbled feta cheese',
        },
    isGlutenFree
      ? {
          id: 'item-bread-swap',
          ...findProduct(
            'prod-gf-bread',
            'Organic Ancient Grain Gluten-Free Sliced Bread',
            6.99,
            '18 oz loaf',
            'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
          ),
          baseQty: 1,
          allergenBadge: 'Celiac-Safe Swap (Replaces Sourdough)',
          prepNote:
            'Pre-sliced gluten-free millet & chia loaf — automatically swapped for wheat sourdough',
        }
      : {
          id: 'item-bread-swap',
          ...findProduct(
            'prod-sourdough-bread',
            'San Francisco Country Sourdough Boule',
            5.99,
            '24 oz loaf',
            'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80'
          ),
          baseQty: 1,
          allergenBadge: 'Artisanal Bakery · Contains Wheat',
          prepNote: '24-hour naturally leavened country sourdough loaf',
        },
  ];

  return rawSpecs.map((spec) => {
    const scaledQty = Math.max(1, Math.ceil(spec.baseQty * scale));
    const lineTotal = Number((scaledQty * spec.unitPrice).toFixed(2));
    const lineTotalFormatted = `$${lineTotal.toFixed(2)}`;
    return {
      id: spec.id,
      productId: spec.productId,
      name: spec.name,
      unit: spec.unit,
      unitPrice: spec.unitPrice,
      originalPrice: spec.originalPrice,
      baseQty: spec.baseQty,
      scaledQty,
      lineTotal,
      lineTotalFormatted,
      checked: true,
      allergenBadge: spec.allergenBadge,
      prepNote: spec.prepNote,
      imageUrl: spec.imageUrl,
      a11yLabel: `${spec.name}, ${scaledQty} × ${spec.unit} (${lineTotalFormatted}) — ${spec.allergenBadge}`,
      a11yDescription: spec.prepNote,
    };
  });
}

export function buildAccessibilityShowcaseDataModel(
  options: AccessibleShopperScenarioOptions = {}
): Record<string, unknown> {
  const servings = Math.max(1, Math.min(8, Math.round(options.servings ?? 4)));
  const selectedAllergens = options.selectedAllergens ?? [
    'dairy-free',
    'gluten-free',
    'nut-free',
  ];
  const easyOpenPackaging = options.easyOpenPackaging ?? true;
  const showVoiceCookingGuide = options.showVoiceCookingGuide ?? true;
  const showAllergenBanner = options.showAllergenBanner ?? true;

  const ingredients = buildAccessibleIngredients(
    servings,
    selectedAllergens,
    easyOpenPackaging,
    options.products
  );

  return recalculateAccessibilityShowcaseDataModel(
    {
      planTitle: 'Allergen-Safe Mediterranean Salmon & Sprouted Quinoa Dinner',
      planSubtitle:
        'Screen-reader optimized · Automatic allergen swaps · Easy-open prep options',
      servings,
      selectedAllergens,
      easyOpenPackaging,
      showVoiceCookingGuide,
      showAllergenBanner,
      deliveryAccessNotes:
        'Please ring doorbell twice, allow 2 minutes to answer, and place bags on the raised porch bench.',
      audioUrl: AUDIO_CHIME_DATA_URI,
      ingredients,
      bundleAdded: false,
      statusBanner:
        'Ready: Use Tab and Arrow keys to customize allergen guardrails, servings, or hands-free cooking steps.',
    },
    '/',
    options.products
  );
}

export function recalculateAccessibilityShowcaseDataModel(
  currentModel: Record<string, unknown>,
  changedPath: string,
  products?: Product[]
): Record<string, unknown> {
  const servings = Math.max(
    1,
    Math.min(8, Math.round(Number(currentModel.servings ?? 4)))
  );
  const selectedAllergens = Array.isArray(currentModel.selectedAllergens)
    ? (currentModel.selectedAllergens as string[])
    : ['dairy-free', 'gluten-free', 'nut-free'];
  const easyOpenPackaging = Boolean(currentModel.easyOpenPackaging ?? true);
  const showVoiceCookingGuide = Boolean(
    currentModel.showVoiceCookingGuide ?? true
  );
  const showAllergenBanner = Boolean(currentModel.showAllergenBanner ?? true);

  const shouldRebuildItems =
    changedPath === '/' ||
    changedPath.startsWith('/selectedAllergens') ||
    changedPath.startsWith('/easyOpenPackaging') ||
    !Array.isArray(currentModel.ingredients);

  const scale = servings / 4;
  const rawIngredients: AccessibleIngredientItem[] = shouldRebuildItems
    ? buildAccessibleIngredients(
        servings,
        selectedAllergens,
        easyOpenPackaging,
        products
      )
    : (currentModel.ingredients as AccessibleIngredientItem[]).map((item) => {
        const scaledQty = Math.max(1, Math.ceil((item.baseQty || 1) * scale));
        const lineTotal = Number((scaledQty * item.unitPrice).toFixed(2));
        const lineTotalFormatted = `$${lineTotal.toFixed(2)}`;
        return {
          ...item,
          scaledQty,
          lineTotal,
          lineTotalFormatted,
          a11yLabel: `${item.name}, ${scaledQty} × ${item.unit} (${lineTotalFormatted}) — ${item.allergenBadge}`,
        };
      });

  // Preserve checked state if we rebuilt items
  if (shouldRebuildItems && Array.isArray(currentModel.ingredients)) {
    const prevById = new Map(
      (currentModel.ingredients as AccessibleIngredientItem[]).map((i) => [
        i.id,
        i.checked,
      ])
    );
    for (const item of rawIngredients) {
      if (prevById.has(item.id)) {
        item.checked = Boolean(prevById.get(item.id));
      }
    }
  }

  const checkedItems = rawIngredients.filter((i) => i.checked !== false);
  const checkedCount = checkedItems.length;
  const totalCost = Number(
    checkedItems.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2)
  );
  const totalCostFormatted = `$${totalCost.toFixed(2)}`;
  const costPerServingFormatted = `$${(totalCost / servings).toFixed(2)} / serving`;

  const activeAllergenNames =
    selectedAllergens.length > 0
      ? selectedAllergens.map((a) => ALLERGEN_LABELS[a] ?? a).join(', ')
      : 'No allergen restrictions active';

  const isDairyFree = selectedAllergens.includes('dairy-free');
  const isGlutenFree = selectedAllergens.includes('gluten-free');

  const swappedSummaryParts: string[] = [];
  if (isDairyFree) {
    swappedSummaryParts.push(
      'swapped Sheep Milk Feta for Organic Hass Avocados (100% dairy-free)'
    );
  }
  if (isGlutenFree) {
    swappedSummaryParts.push(
      'swapped Wheat Sourdough for Canyon Bakehouse Gluten-Free Ancient Grain Bread'
    );
  }

  const allergenAlertTitle =
    swappedSummaryParts.length > 0
      ? `Allergen Guardrail Active: ${swappedSummaryParts.length} Automatic Safe ${
          swappedSummaryParts.length === 1 ? 'Swap' : 'Swaps'
        } Applied`
      : 'Allergen Guardrail Review';

  const allergenAlertDetail =
    swappedSummaryParts.length > 0
      ? `Protected for ${activeAllergenNames}. FreshCart automatically ${swappedSummaryParts.join(
          ' and '
        )}. Zero cross-contact risk detected across all ${checkedCount} selected items.`
      : `Current selection (${activeAllergenNames}) includes traditional dairy feta and wheat sourdough. Select Dairy-Free or Gluten-Free above to automatically substitute allergen-safe alternatives.`;

  const hideAllergenAlert = !showAllergenBanner;
  const hideVoiceCookingGuide = !showVoiceCookingGuide;

  const liveStatusLabel = `Accessible meal plan status: ${checkedCount} safe items for ${servings} servings, total ${totalCostFormatted}`;
  const liveStatusSummary = `${checkedCount} ingredients selected for ${servings} ${
    servings === 1 ? 'serving' : 'servings'
  } (${totalCostFormatted}, ${costPerServingFormatted}). Active guardrails: ${activeAllergenNames}.${
    easyOpenPackaging ? ' Easy-open & pre-washed packaging prioritized.' : ''
  }`;

  const audioGuideTitle = `Spoken Prep Guide (${servings} ${
    servings === 1 ? 'serving' : 'servings'
  } · 20 mins total)`;

  const cookingStepsMarkdown = [
    `- **Step 1 — Zero-Chop Tray Setup (3 mins):** Preheat oven to 400°F (200°C). Line a rimmed baking sheet with foil for tactile edge guidance. Place the peel-open Wild Alaskan Salmon fillets in the center.`,
    `- **Step 2 — Simmer Pre-Rinsed Quinoa (12 mins):** Pour ${Math.max(
      1,
      Math.ceil(servings / 2)
    )} cup(s) of pre-washed Sprouted Quinoa into a saucepan with twice the volume of water. Bring to a gentle boil, cover, and set a 12-minute audio timer.`,
    `- **Step 3 — Fold Greens & Serve (5 mins):** Toss the triple-washed Organic Baby Spinach directly from the pop-top tub into the warm quinoa until wilted. Top with flaked salmon and ${
      isDairyFree ? 'sliced Hass avocado' : 'crumbled feta'
    }.`,
  ].join('\n');

  const calories = isDairyFree ? 520 : 545;
  const proteinGrams = 42;
  const carbsGrams = isGlutenFree ? 34 : 38;
  const fatGrams = isDairyFree ? 21 : 23;
  const fiberGrams = isDairyFree ? 9 : 6;

  const nutritionA11yLabel = `Nutrition per serving (${servings} servings): ${calories} calories, ${proteinGrams} grams protein, ${carbsGrams} grams carbohydrates, ${fatGrams} grams fat, ${fiberGrams} grams dietary fiber`;
  const nutritionA11yDescription = `Verified compliant with your household guardrails: ${activeAllergenNames}.`;

  const spokenSummaryScript = `FreshCart Accessible Meal Plan: ${String(
    currentModel.planTitle ??
      'Allergen-Safe Mediterranean Salmon and Sprouted Quinoa Dinner'
  )}. Scaled for ${servings} servings at ${totalCostFormatted} total (${costPerServingFormatted}). Active allergen guardrails: ${activeAllergenNames}. ${
    swappedSummaryParts.length > 0
      ? `Automatic safety swaps applied: ${swappedSummaryParts.join('; ')}. `
      : ''
  }Step 1: Roast wild salmon at 400 degrees for 12 to 15 minutes. Step 2: Simmer pre-rinsed sprouted quinoa for 12 minutes. Step 3: Fold in triple-washed baby spinach and serve.`;

  return {
    ...currentModel,
    servings,
    selectedAllergens,
    easyOpenPackaging,
    showVoiceCookingGuide,
    showAllergenBanner,
    hideAllergenAlert,
    hideVoiceCookingGuide,
    ingredients: rawIngredients,
    checkedCount,
    totalCost,
    totalCostFormatted,
    costPerServingFormatted,
    activeAllergenNames,
    allergenAlertTitle,
    allergenAlertDetail,
    liveStatusLabel,
    liveStatusSummary,
    audioGuideTitle,
    cookingStepsMarkdown,
    calories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    fiberGrams,
    nutritionA11yLabel,
    nutritionA11yDescription,
    spokenSummaryScript,
  };
}

export function buildAccessibilityShowcaseComponents(): A2UIComponentBase[] {
  return [
    {
      id: 'root',
      component: 'Column',
      children: [
        'hero_header_card',
        'allergen_alert_card',
        'polite_status_card',
        'controls_card',
        'voice_cooking_guide_card',
        'main_tabs',
        'cta_footer_card',
      ],
      accessibility: {
        label: 'Accessible and Allergen-Safe Meal Planner Surface',
        description:
          'Interactive meal planner with live screen reader announcements, allergen guardrails, keyboard navigation, and hands-free cooking steps',
      },
    },
    {
      id: 'hero_header_card',
      component: 'Card',
      variant: 'emerald',
      title: { '@path': '/planTitle' },
      subtitle: { '@path': '/planSubtitle' },
      badge: 'Screen-Reader Ready',
      child: 'hero_header_body',
      accessibility: {
        label: { '@path': '/planTitle' },
        description: { '@path': '/planSubtitle' },
      },
    },
    {
      id: 'hero_header_body',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['hero_cost_summary_text', 'read_aloud_btn'],
    },
    {
      id: 'hero_cost_summary_text',
      component: 'Text',
      variant: 'caption',
      text: {
        '@call': 'formatString',
        args: {
          value:
            '**${/checkedCount} Verified Ingredients** · **${/totalCostFormatted}** (${/costPerServingFormatted})',
        },
      },
    },
    {
      id: 'read_aloud_btn',
      component: 'Button',
      variant: 'secondary',
      icon: 'volumeUp',
      child: 'read_aloud_btn_text',
      accessibility: {
        label: 'Read recipe and allergen safety summary aloud',
        description:
          'Uses speech synthesis and updates the polite live region with the complete meal plan and cooking steps',
      },
      action: {
        event: {
          name: 'read_accessible_summary_aloud',
          context: {
            spokenScript: { '@path': '/spokenSummaryScript' },
          },
        },
      },
    },
    {
      id: 'read_aloud_btn_text',
      component: 'Text',
      variant: 'body',
      text: 'Read Summary Aloud',
    },

    // 1. Assertive Live Region + Dynamic Hidden via @path
    {
      id: 'allergen_alert_card',
      component: 'Card',
      variant: 'alert',
      title: { '@path': '/allergenAlertTitle' },
      badge: 'Allergen Guardrail',
      child: 'allergen_alert_text',
      accessibility: {
        label: { '@path': '/allergenAlertTitle' },
        description: { '@path': '/allergenAlertDetail' },
        live: 'assertive',
        hidden: { '@path': '/hideAllergenAlert' },
      },
    },
    {
      id: 'allergen_alert_text',
      component: 'Text',
      variant: 'body',
      text: { '@path': '/allergenAlertDetail' },
    },

    // 2. Polite Live Region announcing real-time state updates
    {
      id: 'polite_status_card',
      component: 'Card',
      variant: 'subtle',
      title: 'Live Screen-Reader Summary',
      badge: 'Polite Live Region',
      child: 'polite_status_text',
      accessibility: {
        label: { '@path': '/liveStatusLabel' },
        description: { '@path': '/liveStatusSummary' },
        live: 'polite',
      },
    },
    {
      id: 'polite_status_text',
      component: 'Text',
      variant: 'body',
      text: { '@path': '/liveStatusSummary' },
    },

    // 3. Interactive Accessibility & Allergen Controls Card
    {
      id: 'controls_card',
      component: 'Card',
      title: 'Personalize Allergen Guardrails & Kitchen Preferences',
      subtitle:
        'Every adjustment updates quantities and announces changes to assistive technologies',
      child: 'controls_col',
      accessibility: {
        label: 'Allergen Guardrails and Kitchen Preferences',
        description:
          'Configure household allergens, servings count, easy-open packaging, and audio prep steps',
      },
    },
    {
      id: 'controls_col',
      component: 'Column',
      children: [
        'allergen_guardrail_picker',
        'servings_slider',
        'easy_open_checkbox',
        'voice_guide_toggle_checkbox',
        'allergen_banner_toggle_checkbox',
      ],
    },
    {
      id: 'allergen_guardrail_picker',
      component: 'ChoicePicker',
      label: 'Household Allergen Guardrails',
      variant: 'multipleSelection',
      displayStyle: 'chips',
      value: { '@path': '/selectedAllergens' },
      options: [
        { label: '🥛 Dairy-Free', value: 'dairy-free' },
        { label: '🌾 Gluten-Free', value: 'gluten-free' },
        { label: '🥜 Nut-Free', value: 'nut-free' },
        { label: '🦐 Shellfish-Free', value: 'shellfish-free' },
      ],
      accessibility: {
        label: 'Household Allergen Guardrails (multi-select)',
        description:
          'Toggle allergens to automatically substitute unsafe ingredients with verified safe alternatives',
      },
    },
    {
      id: 'servings_slider',
      component: 'Slider',
      label: 'Dinner Servings',
      min: 1,
      max: 8,
      step: 1,
      suffix: 'servings',
      value: { '@path': '/servings' },
      accessibility: {
        label: {
          '@call': 'formatString',
          args: {
            value:
              'Dinner servings slider, currently ${/servings} servings (${/totalCostFormatted} total)',
          },
        },
        description:
          'Use Left and Right arrow keys to scale ingredient quantities and nutrition per serving',
      },
    },
    {
      id: 'easy_open_checkbox',
      component: 'CheckBox',
      label: 'Prefer Easy-Open & Pre-Chopped Packaging',
      description:
        'Selects pop-top tubs, pre-washed greens, and peel-open pouches for low-dexterity convenience',
      value: { '@path': '/easyOpenPackaging' },
      accessibility: {
        label: 'Prefer easy-open and pre-chopped packaging',
        description:
          'Prioritizes arthritis-friendly resealable tubs and triple-washed produce requiring zero knife prep',
      },
    },
    {
      id: 'voice_guide_toggle_checkbox',
      component: 'CheckBox',
      label: 'Show Hands-Free Audio Cooking Guide',
      description:
        'Uncheck to hide the step-by-step audio prep card from both visual display and screen readers',
      value: { '@path': '/showVoiceCookingGuide' },
      accessibility: {
        label: 'Show hands-free audio cooking guide',
        description:
          'Dynamically controls accessibility.hidden on the hands-free kitchen prep card',
      },
    },
    {
      id: 'allergen_banner_toggle_checkbox',
      component: 'CheckBox',
      label: 'Show Allergen Safety Substitution Banner',
      description:
        'Displays the assertive allergen safety alert above when ingredients are adapted',
      value: { '@path': '/showAllergenBanner' },
      accessibility: {
        label: 'Show allergen safety substitution banner',
        description:
          'Dynamically controls accessibility.hidden on the assertive allergen guardrail alert card',
      },
    },

    // 4. Hands-Free Audio Cooking Guide Card (with dynamic accessibility.hidden via @path)
    {
      id: 'voice_cooking_guide_card',
      component: 'Card',
      variant: 'highlighted',
      title: 'Hands-Free Kitchen Prep & Audio Guide',
      subtitle:
        'Step-by-step instructions with tactile cues and audio playback',
      badge: '20 Mins · Zero Knife Prep',
      child: 'voice_cooking_guide_col',
      accessibility: {
        label: 'Hands-Free Kitchen Prep and Audio Guide',
        description:
          'Three accessible cooking steps with audio chime and screen-reader narration',
        hidden: { '@path': '/hideVoiceCookingGuide' },
      },
    },
    {
      id: 'voice_cooking_guide_col',
      component: 'Column',
      children: ['cooking_audio_player', 'cooking_steps_text'],
    },
    {
      id: 'cooking_audio_player',
      component: 'AudioPlayer',
      url: { '@path': '/audioUrl' },
      description: { '@path': '/audioGuideTitle' },
      accessibility: {
        label: { '@path': '/audioGuideTitle' },
        description:
          'Play the kitchen timer chime or press Read Summary Aloud above for full voice narration',
      },
    },
    {
      id: 'cooking_steps_text',
      component: 'Text',
      variant: 'body',
      text: { '@path': '/cookingStepsMarkdown' },
      accessibility: {
        label: 'Step-by-step accessible cooking instructions',
      },
    },

    // 5. Accessible Tabs (Keyboard navigable via ArrowLeft / ArrowRight / Home / End)
    {
      id: 'main_tabs',
      component: 'Tabs',
      accessibility: {
        label: 'Accessible meal plan details',
        description:
          'Use Left and Right arrow keys to switch between Safe Ingredients, Delivery Notes, and Nutrition',
      },
      tabs: [
        {
          title: 'Safe Ingredients',
          child: 'tab_ingredients_col',
        },
        {
          title: 'Delivery & Doorbell Notes',
          child: 'tab_delivery_notes_card',
        },
        {
          title: 'Nutrition & Allergen Check',
          child: 'tab_nutrition_col',
        },
      ],
    },
    {
      id: 'tab_ingredients_col',
      component: 'Column',
      children: ['ingredients_list'],
    },
    {
      id: 'ingredients_list',
      component: 'List',
      direction: 'vertical',
      children: {
        componentId: 'ingredient_deal_card_tpl',
        path: '/ingredients',
      },
      accessibility: {
        label: 'Allergen-verified recipe ingredients',
        description:
          'Each card announces product name, scaled quantity, price, and allergen safety status',
      },
    },
    {
      id: 'ingredient_deal_card_tpl',
      component: 'ProductDealCard',
      productId: { '@path': 'productId' },
      title: { '@path': 'name' },
      badgeText: { '@path': 'allergenBadge' },
      price: { '@path': 'lineTotal' },
      originalPrice: { '@path': 'originalPrice' },
      unit: {
        '@call': 'formatString',
        args: { value: '${scaledQty} × ${unit}' },
      },
      reason: { '@path': 'prepNote' },
      imageUrl: { '@path': 'imageUrl' },
      applied: { '@path': 'checked' },
      actionLabel: 'Add Item to Cart',
      accessibility: {
        label: { '@path': 'a11yLabel' },
        description: { '@path': 'a11yDescription' },
      },
      action: {
        event: {
          name: 'add_pairing_item',
          context: {
            productId: { '@path': 'productId' },
            quantity: { '@path': 'scaledQty' },
            title: { '@path': 'name' },
          },
        },
      },
    },
    {
      id: 'tab_delivery_notes_card',
      component: 'Card',
      title: 'Accessible Delivery & Courier Preferences',
      subtitle:
        'Saved with your order so your shopper places groceries where they are easiest to reach',
      child: 'delivery_notes_col',
      accessibility: {
        label: 'Accessible Delivery and Courier Preferences',
      },
    },
    {
      id: 'delivery_notes_col',
      component: 'Column',
      children: ['delivery_notes_textfield', 'delivery_notes_preview_text'],
    },
    {
      id: 'delivery_notes_textfield',
      component: 'TextField',
      label: 'Courier Doorbell & Placement Instructions',
      variant: 'longText',
      placeholder:
        'e.g., Please ring doorbell twice, wait 2 minutes, and place bags on the raised porch bench...',
      value: { '@path': '/deliveryAccessNotes' },
      accessibility: {
        label: 'Courier doorbell and placement instructions',
        description:
          'Specify raised bench placement, knock volume, or phone call arrival alerts for your delivery driver',
      },
    },
    {
      id: 'delivery_notes_preview_text',
      component: 'Text',
      variant: 'caption',
      text: {
        '@call': 'formatString',
        args: {
          value: '**Active Courier Note:** "${/deliveryAccessNotes}"',
        },
      },
      accessibility: {
        live: 'polite',
        label: 'Updated courier delivery note preview',
      },
    },
    {
      id: 'tab_nutrition_col',
      component: 'Column',
      children: ['nutrition_summary_card', 'allergen_matrix_card'],
    },
    {
      id: 'nutrition_summary_card',
      component: 'NutritionSummary',
      title: 'Allergen-Safe Nutrition per Serving',
      servings: { '@path': '/servings' },
      calories: { '@path': '/calories' },
      proteinGrams: { '@path': '/proteinGrams' },
      carbsGrams: { '@path': '/carbsGrams' },
      fatGrams: { '@path': '/fatGrams' },
      fiberGrams: { '@path': '/fiberGrams' },
      dailyCalorieTarget: 2000,
      accessibility: {
        label: { '@path': '/nutritionA11yLabel' },
        description: { '@path': '/nutritionA11yDescription' },
      },
    },
    {
      id: 'allergen_matrix_card',
      component: 'Card',
      variant: 'subtle',
      title: 'Verified Household Guardrail Compliance',
      child: 'allergen_matrix_text',
      accessibility: {
        label: 'Verified Household Guardrail Compliance',
        description: { '@path': '/allergenAlertDetail' },
      },
    },
    {
      id: 'allergen_matrix_text',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatString',
        args: {
          value:
            '**Active Guardrails:** ${/activeAllergenNames}\n\n${/allergenAlertDetail}',
        },
      },
    },

    // 6. Primary Action Footer Card + Polite Live Confirmation
    {
      id: 'cta_footer_card',
      component: 'Card',
      variant: 'emerald',
      child: 'cta_footer_col',
      accessibility: {
        label: 'Add Allergen-Safe Meal Bundle to Cart',
      },
    },
    {
      id: 'cta_footer_col',
      component: 'Column',
      children: ['cta_summary_row', 'status_confirmation_text'],
    },
    {
      id: 'cta_summary_row',
      component: 'Row',
      justify: 'spaceBetween',
      align: 'center',
      children: ['cta_price_col', 'add_accessible_bundle_btn'],
    },
    {
      id: 'cta_price_col',
      component: 'Column',
      children: ['cta_total_heading', 'cta_subtext'],
    },
    {
      id: 'cta_total_heading',
      component: 'Text',
      variant: 'h3',
      text: {
        '@call': 'formatString',
        args: {
          value: 'Total: ${/totalCostFormatted} (${/servings} servings)',
        },
      },
    },
    {
      id: 'cta_subtext',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/activeAllergenNames' },
    },
    {
      id: 'add_accessible_bundle_btn',
      component: 'Button',
      variant: 'primary',
      icon: 'shoppingCart',
      child: 'add_accessible_bundle_btn_text',
      accessibility: {
        label: {
          '@call': 'formatString',
          args: {
            value:
              'Add ${/checkedCount} allergen-safe ingredients for ${/servings} servings (${/totalCostFormatted}) to cart',
          },
        },
        description:
          'Adds all verified allergen-safe ingredients and easy-open items directly to your FreshCart cart',
      },
      action: {
        event: {
          name: 'add_recipe_bundle_to_cart',
          context: {
            recipeTitle: { '@path': '/planTitle' },
            servings: { '@path': '/servings' },
            ingredients: { '@path': '/ingredients' },
          },
        },
      },
    },
    {
      id: 'add_accessible_bundle_btn_text',
      component: 'Text',
      variant: 'body',
      text: {
        '@call': 'formatString',
        args: {
          value: 'Add ${/checkedCount} Safe Items (${/totalCostFormatted})',
        },
      },
    },
    {
      id: 'status_confirmation_text',
      component: 'Text',
      variant: 'caption',
      text: { '@path': '/statusBanner' },
      accessibility: {
        label: 'Cart action status announcement',
        live: 'polite',
      },
    },
  ];
}

export function buildAccessibilityShowcaseStream(
  options: AccessibleShopperScenarioOptions = {}
): A2UIv1Message[] {
  const surfaceId = ACCESSIBLE_SHOPPER_SURFACE_ID;
  const components = buildAccessibilityShowcaseComponents();
  const dataModel = buildAccessibilityShowcaseDataModel(options);

  return [
    {
      version: A2UI_VERSION,
      createSurface: {
        surfaceId,
        catalogId: FRESHCART_GROCERY_CATALOG_ID,
        sendDataModel: true,
      },
    },
    {
      version: A2UI_VERSION,
      updateComponents: {
        surfaceId,
        components,
      },
    },
    {
      version: A2UI_VERSION,
      updateDataModel: {
        surfaceId,
        path: '/',
        value: dataModel,
      },
    },
  ];
}
