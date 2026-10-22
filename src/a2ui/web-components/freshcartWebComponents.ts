import {
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIv1Message,
} from '../../types/a2ui-v1';
import type { Product } from '../../types/grocery';

export const FRESHCART_WC_TAGS = {
  nutritionRing: 'freshcart-nutrition-ring',
  aisleStepper: 'freshcart-aisle-stepper',
  priceSparkline: 'freshcart-price-sparkline',
} as const;

export interface AisleStopItem {
  aisleNumber: string;
  zoneName: string;
  productId: string;
  productName: string;
  price: number;
  unit: string;
  etaMinutes: number;
  picked?: boolean;
}

export interface NutritionRingWCProps {
  title: string;
  calories: number;
  dailyCalorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  servings: number;
  servingsPath?: string;
}

export interface AisleStepperWCProps {
  title: string;
  storeName: string;
  fulfillmentMode: string;
  activeStopIndex: number;
  activeStopPath?: string;
  stops: AisleStopItem[];
}

export interface PriceSparklineWCProps {
  productId: string;
  title: string;
  unit: string;
  currentPrice: number;
  regularPrice: number;
  weeklyPrices: number[];
  badgeText: string;
  added?: boolean;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 1. `<freshcart-nutrition-ring>` (`NutritionRingWC`)
 *
 * W3C Custom Element rendering an interactive multi-ring SVG radial nutrition
 * & macro gauge. Dispatches `freshcart-wc-change` (`bubbles: true, composed: true`)
 * when the shopper adjusts servings via `-` / `+` buttons inside the custom element,
 * updating the A2UI v1.0 surface `dataModel` at `servingsPath` (`/servings`).
 */
class FreshCartNutritionRingElement extends HTMLElement {
  private _props: NutritionRingWCProps = {
    title: 'Interactive Macro & Calorie Ring',
    calories: 540,
    dailyCalorieTarget: 2000,
    proteinGrams: 42,
    carbsGrams: 46,
    fatGrams: 18,
    fiberGrams: 9,
    servings: 4,
    servingsPath: '/servings',
  };

  private _selectedMacro: 'all' | 'protein' | 'carbs' | 'fat' = 'all';

  set wcProps(next: Partial<NutritionRingWCProps>) {
    this._props = {
      ...this._props,
      ...next,
    };
    this.render();
  }

  get wcProps(): NutritionRingWCProps {
    return this._props;
  }

  connectedCallback(): void {
    this.style.display = 'block';
    this.render();
  }

  private emitServingsChange(nextServings: number): void {
    const clamped = Math.max(1, Math.min(12, nextServings));
    this._props = { ...this._props, servings: clamped };
    this.render();
    this.dispatchEvent(
      new CustomEvent('freshcart-wc-change', {
        detail: {
          path: this._props.servingsPath || '/servings',
          value: clamped,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private render(): void {
    const {
      title,
      calories,
      dailyCalorieTarget,
      proteinGrams,
      carbsGrams,
      fatGrams,
      fiberGrams,
      servings,
    } = this._props;

    const scale = Math.max(1, servings) / 4;
    const scaledCalories = Math.round(calories * scale);
    const scaledProtein = Math.round(proteinGrams * scale);
    const scaledCarbs = Math.round(carbsGrams * scale);
    const scaledFat = Math.round(fatGrams * scale);
    const scaledFiber = Math.round(fiberGrams * scale);

    const totalMacros = Math.max(1, scaledProtein + scaledCarbs + scaledFat);
    const proteinPct = Math.round((scaledProtein / totalMacros) * 100);
    const carbsPct = Math.round((scaledCarbs / totalMacros) * 100);
    const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

    const calPct = Math.min(
      100,
      Math.round((scaledCalories / Math.max(1, dailyCalorieTarget)) * 100)
    );

    // SVG concentric circle geometry
    const outerR = 46;
    const midR = 36;
    const innerR = 26;
    const outerCirc = +(2 * Math.PI * outerR).toFixed(2);
    const midCirc = +(2 * Math.PI * midR).toFixed(2);
    const innerCirc = +(2 * Math.PI * innerR).toFixed(2);

    const outerOffset = +(outerCirc * (1 - proteinPct / 100)).toFixed(2);
    const midOffset = +(midCirc * (1 - carbsPct / 100)).toFixed(2);
    const innerOffset = +(innerCirc * (1 - fatPct / 100)).toFixed(2);

    const centerLabel =
      this._selectedMacro === 'protein'
        ? `${scaledProtein}g`
        : this._selectedMacro === 'carbs'
          ? `${scaledCarbs}g`
          : this._selectedMacro === 'fat'
            ? `${scaledFat}g`
            : `${scaledCalories}`;
    const centerSub =
      this._selectedMacro === 'protein'
        ? 'Protein'
        : this._selectedMacro === 'carbs'
          ? 'Carbs'
          : this._selectedMacro === 'fat'
            ? 'Healthy Fat'
            : 'kcal total';

    this.innerHTML = `
      <div class="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-stone-50/80 p-4 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center rounded-md bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-900 uppercase">
                &lt;freshcart-nutrition-ring&gt;
              </span>
              <span class="text-[11px] font-medium text-stone-500">
                W3C Custom Element
              </span>
            </div>
            <h4 class="mt-1 text-sm font-bold text-stone-900">${escapeHtml(title)}</h4>
          </div>

          <div class="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 shadow-2xs">
            <button
              type="button"
              data-wc-role="dec-servings"
              class="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer transition-colors"
              aria-label="Decrease servings"
            >
              −
            </button>
            <span class="min-w-[4.5rem] text-center text-xs font-bold text-stone-800">
              ${servings} ${servings === 1 ? 'serving' : 'servings'}
            </span>
            <button
              type="button"
              data-wc-role="inc-servings"
              class="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer transition-colors"
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
        </div>

        <div class="mt-3.5 flex flex-col items-center gap-4 sm:flex-row">
          <div class="relative flex h-32 w-32 shrink-0 items-center justify-center">
            <svg viewBox="0 0 112 112" class="h-32 w-32 -rotate-90 transform">
              <circle cx="56" cy="56" r="${outerR}" fill="none" stroke="#e7e5e4" stroke-width="7" />
              <circle cx="56" cy="56" r="${midR}" fill="none" stroke="#e7e5e4" stroke-width="7" />
              <circle cx="56" cy="56" r="${innerR}" fill="none" stroke="#e7e5e4" stroke-width="7" />

              <circle
                cx="56"
                cy="56"
                r="${outerR}"
                fill="none"
                stroke="#0AAD0A"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${outerCirc}"
                stroke-dashoffset="${outerOffset}"
              />
              <circle
                cx="56"
                cy="56"
                r="${midR}"
                fill="none"
                stroke="#f59e0b"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${midCirc}"
                stroke-dashoffset="${midOffset}"
              />
              <circle
                cx="56"
                cy="56"
                r="${innerR}"
                fill="none"
                stroke="#0ea5e9"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${innerCirc}"
                stroke-dashoffset="${innerOffset}"
              />
            </svg>
            <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-sm font-extrabold text-stone-900">${centerLabel}</span>
              <span class="text-[10px] font-semibold text-stone-500">${centerSub}</span>
            </div>
          </div>

          <div class="grid flex-1 grid-cols-2 gap-2 w-full">
            <button
              type="button"
              data-wc-macro="protein"
              class="flex flex-col rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                this._selectedMacro === 'protein'
                  ? 'border-[#0AAD0A] bg-emerald-50/70 shadow-2xs'
                  : 'border-stone-200/80 bg-white hover:border-emerald-300'
              }"
            >
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
                  <span class="h-2.5 w-2.5 rounded-full bg-[#0AAD0A]"></span>
                  Protein
                </span>
                <span class="text-[10px] font-bold text-[#0AAD0A]">${proteinPct}%</span>
              </div>
              <span class="mt-1 text-sm font-extrabold text-stone-900">${scaledProtein}g</span>
            </button>

            <button
              type="button"
              data-wc-macro="carbs"
              class="flex flex-col rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                this._selectedMacro === 'carbs'
                  ? 'border-amber-500 bg-amber-50/70 shadow-2xs'
                  : 'border-stone-200/80 bg-white hover:border-amber-300'
              }"
            >
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
                  <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  Carbs
                </span>
                <span class="text-[10px] font-bold text-amber-600">${carbsPct}%</span>
              </div>
              <span class="mt-1 text-sm font-extrabold text-stone-900">${scaledCarbs}g</span>
            </button>

            <button
              type="button"
              data-wc-macro="fat"
              class="flex flex-col rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                this._selectedMacro === 'fat'
                  ? 'border-sky-500 bg-sky-50/70 shadow-2xs'
                  : 'border-stone-200/80 bg-white hover:border-sky-300'
              }"
            >
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
                  <span class="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                  Healthy Fat
                </span>
                <span class="text-[10px] font-bold text-sky-600">${fatPct}%</span>
              </div>
              <span class="mt-1 text-sm font-extrabold text-stone-900">${scaledFat}g</span>
            </button>

            <button
              type="button"
              data-wc-macro="all"
              class="flex flex-col rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                this._selectedMacro === 'all'
                  ? 'border-stone-800 bg-stone-100/80 shadow-2xs'
                  : 'border-stone-200/80 bg-white hover:border-stone-300'
              }"
            >
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
                  <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  Fiber &amp; Goal
                </span>
                <span class="text-[10px] font-bold text-stone-600">${calPct}% DV</span>
              </div>
              <span class="mt-1 text-sm font-extrabold text-stone-900">${scaledFiber}g fiber</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const decBtn = this.querySelector('[data-wc-role="dec-servings"]');
    const incBtn = this.querySelector('[data-wc-role="inc-servings"]');

    decBtn?.addEventListener('click', () => {
      this.emitServingsChange(this._props.servings - 1);
    });
    incBtn?.addEventListener('click', () => {
      this.emitServingsChange(this._props.servings + 1);
    });

    this.querySelectorAll('[data-wc-macro]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const macro = btn.getAttribute('data-wc-macro') as
          | 'all'
          | 'protein'
          | 'carbs'
          | 'fat';
        this._selectedMacro = macro || 'all';
        this.render();
      });
    });
  }
}

/**
 * 2. `<freshcart-aisle-stepper>` (`AisleStepperWC`)
 *
 * W3C Custom Element rendering an interactive in-store aisle navigation &
 * express pickup route stepper. Shoppers can step through aisles (two-way bound
 * to `/activeStopIndex` in the A2UI v1.0 `dataModel`) and click "Add Stop Item"
 * to dispatch an A2UI `addToCart` action directly to the FreshCart cart.
 */
class FreshCartAisleStepperElement extends HTMLElement {
  private _props: AisleStepperWCProps = {
    title: 'Smart Store Aisle Route & Express Pickup',
    storeName: 'FreshCart Market · Mission Bay',
    fulfillmentMode: 'In-Store Aisle Fast-Track',
    activeStopIndex: 0,
    activeStopPath: '/activeStopIndex',
    stops: [],
  };

  private _addedProductIds = new Set<string>();

  set wcProps(next: Partial<AisleStepperWCProps>) {
    this._props = {
      ...this._props,
      ...next,
    };
    this.render();
  }

  get wcProps(): AisleStepperWCProps {
    return this._props;
  }

  connectedCallback(): void {
    this.style.display = 'block';
    this.render();
  }

  private selectStop(index: number): void {
    const clamped = Math.max(
      0,
      Math.min(this._props.stops.length - 1, index)
    );
    this._props = { ...this._props, activeStopIndex: clamped };
    this.render();
    this.dispatchEvent(
      new CustomEvent('freshcart-wc-change', {
        detail: {
          path: this._props.activeStopPath || '/activeStopIndex',
          value: clamped,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private addStopItemToCart(stop: AisleStopItem): void {
    this._addedProductIds.add(stop.productId);
    this.render();
    this.dispatchEvent(
      new CustomEvent('freshcart-wc-action', {
        detail: {
          actionName: 'addToCart',
          productId: stop.productId,
          productName: stop.productName,
          price: stop.price,
          quantity: 1,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private render(): void {
    const { title, storeName, fulfillmentMode, activeStopIndex, stops } =
      this._props;

    const safeStops: AisleStopItem[] =
      Array.isArray(stops) && stops.length > 0
        ? stops
        : [
            {
              aisleNumber: 'Aisle 1',
              zoneName: 'Organic Produce',
              productId: 'prod-produce-avocados',
              productName: 'Organic Hass Avocados (4 ct)',
              price: 4.99,
              unit: '4 ct bag',
              etaMinutes: 1,
            },
            {
              aisleNumber: 'Aisle 4',
              zoneName: 'Seafood & Butcher',
              productId: 'prod-seafood-salmon',
              productName: 'Wild Alaskan Sockeye Salmon',
              price: 12.99,
              unit: '12 oz',
              etaMinutes: 3,
            },
            {
              aisleNumber: 'Aisle 7',
              zoneName: 'Artisan Bakery',
              productId: 'prod-bakery-sourdough',
              productName: 'San Francisco Country Sourdough',
              price: 5.49,
              unit: '24 oz loaf',
              etaMinutes: 5,
            },
          ];

    const currentIdx = Math.max(
      0,
      Math.min(safeStops.length - 1, Number(activeStopIndex) || 0)
    );
    const activeStop = safeStops[currentIdx];
    const isAdded = this._addedProductIds.has(activeStop.productId);

    const pillsHtml = safeStops
      .map((stop, idx) => {
        const isCurrent = idx === currentIdx;
        const isPicked = this._addedProductIds.has(stop.productId);
        return `
          <button
            type="button"
            data-wc-stop-idx="${idx}"
            class="flex flex-1 flex-col rounded-xl border px-3 py-2 text-left transition-all cursor-pointer ${
              isCurrent
                ? 'border-[#0AAD0A] bg-emerald-50/90 shadow-2xs'
                : 'border-stone-200/80 bg-stone-50/70 hover:border-stone-300 hover:bg-white'
            }"
          >
            <div class="flex items-center justify-between gap-1">
              <span class="text-[10px] font-extrabold uppercase tracking-wider ${
                isCurrent ? 'text-[#0AAD0A]' : 'text-stone-500'
              }">
                ${escapeHtml(stop.aisleNumber)}
              </span>
              <span class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                isPicked
                  ? 'bg-[#0AAD0A] text-white'
                  : isCurrent
                    ? 'bg-emerald-200 text-emerald-950'
                    : 'bg-stone-200 text-stone-600'
              }">
                ${isPicked ? '✓' : idx + 1}
              </span>
            </div>
            <span class="mt-0.5 truncate text-xs font-bold text-stone-900">
              ${escapeHtml(stop.zoneName)}
            </span>
          </button>
        `;
      })
      .join('');

    this.innerHTML = `
      <div class="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center rounded-md bg-amber-100/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-900 uppercase">
                &lt;freshcart-aisle-stepper&gt;
              </span>
              <span class="text-[11px] font-medium text-stone-500">
                ${escapeHtml(storeName)}
              </span>
            </div>
            <h4 class="mt-1 text-sm font-bold text-stone-900">${escapeHtml(title)}</h4>
          </div>

          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            ⚡ ${escapeHtml(fulfillmentMode)}
          </span>
        </div>

        <div class="mt-3 grid grid-cols-3 gap-2">
          ${pillsHtml}
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="rounded-md bg-[#0AAD0A] px-2 py-0.5 text-[10px] font-bold text-white">
                Stop ${currentIdx + 1} of ${safeStops.length} · ${escapeHtml(activeStop.aisleNumber)}
              </span>
              <span class="text-[11px] font-medium text-stone-500">
                ~${activeStop.etaMinutes} min walk
              </span>
            </div>
            <p class="mt-1 truncate text-sm font-bold text-stone-900">
              ${escapeHtml(activeStop.productName)}
            </p>
            <p class="text-xs font-medium text-stone-600">
              <span class="font-extrabold text-[#0AAD0A]">$${activeStop.price.toFixed(2)}</span>
              · ${escapeHtml(activeStop.unit)}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              data-wc-action="add-stop-item"
              class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isAdded
                  ? 'border border-emerald-300 bg-white text-emerald-800'
                  : 'bg-[#0AAD0A] text-white hover:bg-[#089408] shadow-xs'
              }"
            >
              ${isAdded ? '✓ Added to Cart' : '+ Add Stop Item'}
            </button>
          </div>
        </div>
      </div>
    `;

    this.querySelectorAll('[data-wc-stop-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-wc-stop-idx') ?? 0);
        this.selectStop(idx);
      });
    });

    const addBtn = this.querySelector('[data-wc-action="add-stop-item"]');
    addBtn?.addEventListener('click', () => {
      this.addStopItemToCart(activeStop);
    });
  }
}

/**
 * 3. `<freshcart-price-sparkline>` (`PriceSparklineWC`)
 *
 * W3C Custom Element rendering an interactive 8-week SVG price history sparkline
 * with clickable week markers and a 1-click "Lock Deal & Add" action button that
 * dispatches `freshcart-wc-action` to add the deal item to the live FreshCart cart.
 */
class FreshCartPriceSparklineElement extends HTMLElement {
  private _props: PriceSparklineWCProps = {
    productId: 'prod-seafood-salmon',
    title: 'Wild Alaskan Sockeye Salmon Fillet',
    unit: '12 oz vacuum pack',
    currentPrice: 12.99,
    regularPrice: 15.99,
    weeklyPrices: [15.99, 15.49, 15.99, 14.99, 14.49, 13.99, 13.49, 12.99],
    badgeText: '8-Week Low Price',
    added: false,
  };

  private _selectedWeekIdx = 7;
  private _isAdded = false;

  set wcProps(next: Partial<PriceSparklineWCProps>) {
    this._props = {
      ...this._props,
      ...next,
    };
    if (next.added !== undefined) {
      this._isAdded = Boolean(next.added);
    }
    this.render();
  }

  get wcProps(): PriceSparklineWCProps {
    return this._props;
  }

  connectedCallback(): void {
    this.style.display = 'block';
    this.render();
  }

  private handleLockDeal(): void {
    this._isAdded = true;
    this.render();
    this.dispatchEvent(
      new CustomEvent('freshcart-wc-action', {
        detail: {
          actionName: 'addToCart',
          productId: this._props.productId,
          productName: this._props.title,
          price: this._props.currentPrice,
          quantity: 1,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private render(): void {
    const {
      title,
      unit,
      currentPrice,
      regularPrice,
      weeklyPrices,
      badgeText,
    } = this._props;

    const prices =
      Array.isArray(weeklyPrices) && weeklyPrices.length >= 2
        ? weeklyPrices
        : [15.99, 15.49, 15.99, 14.99, 14.49, 13.99, 13.49, currentPrice];

    const minP = Math.min(...prices) - 0.5;
    const maxP = Math.max(...prices) + 0.5;
    const range = Math.max(0.5, maxP - minP);

    const width = 240;
    const height = 56;
    const padX = 12;
    const padY = 10;

    const points = prices.map((p, idx) => {
      const x =
        padX +
        (idx / Math.max(1, prices.length - 1)) * (width - padX * 2);
      const y =
        padY + (1 - (p - minP) / range) * (height - padY * 2);
      return { x: +x.toFixed(1), y: +y.toFixed(1), price: p, idx };
    });

    const polylinePoints = points.map((pt) => `${pt.x},${pt.y}`).join(' ');
    const areaPoints = `${points[0].x},${height} ${polylinePoints} ${points[points.length - 1].x},${height}`;

    const activeIdx = Math.max(
      0,
      Math.min(points.length - 1, this._selectedWeekIdx)
    );
    const selectedPt = points[activeIdx];
    const savings = Math.max(0, +(regularPrice - currentPrice).toFixed(2));

    const circlesHtml = points
      .map((pt) => {
        const isSel = pt.idx === activeIdx;
        return `
          <circle
            cx="${pt.x}"
            cy="${pt.y}"
            r="${isSel ? 5 : 3.2}"
            fill="${isSel ? '#0AAD0A' : '#ffffff'}"
            stroke="#0AAD0A"
            stroke-width="2"
            data-wc-week="${pt.idx}"
            class="cursor-pointer"
          />
        `;
      })
      .join('');

    this.innerHTML = `
      <div class="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="inline-flex items-center rounded-md bg-sky-100/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-sky-900 uppercase">
              &lt;freshcart-price-sparkline&gt;
            </span>
            <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              ${escapeHtml(badgeText)}
            </span>
          </div>
          ${
            savings > 0
              ? `<span class="text-xs font-bold text-[#0AAD0A]">Save $${savings.toFixed(2)} today</span>`
              : ''
          }
        </div>

        <div class="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div class="min-w-0 flex-1">
            <h4 class="truncate text-sm font-bold text-stone-900">${escapeHtml(title)}</h4>
            <div class="mt-0.5 flex items-baseline gap-2">
              <span class="text-base font-extrabold text-[#0AAD0A]">$${currentPrice.toFixed(2)}</span>
              ${
                regularPrice > currentPrice
                  ? `<span class="text-xs text-stone-400 line-through">$${regularPrice.toFixed(2)}</span>`
                  : ''
              }
              <span class="text-[11px] text-stone-500">· ${escapeHtml(unit)}</span>
            </div>
            <p class="mt-1 text-[11px] font-medium text-stone-500">
              ${
                activeIdx === points.length - 1
                  ? `This week: $${selectedPt.price.toFixed(2)} (lowest in 8 wks)`
                  : `Week -${points.length - 1 - activeIdx}: $${selectedPt.price.toFixed(2)} (click dots to compare)`
              }
            </p>
          </div>

          <div class="flex flex-col items-end gap-2">
            <svg viewBox="0 0 ${width} ${height}" class="h-14 w-56 overflow-visible rounded-xl bg-stone-50/80 border border-stone-200/60 p-1">
              <polygon points="${areaPoints}" fill="rgba(10, 173, 10, 0.10)" />
              <polyline
                fill="none"
                stroke="#0AAD0A"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
                points="${polylinePoints}"
              />
              ${circlesHtml}
            </svg>

            <button
              type="button"
              data-wc-action="lock-deal"
              class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                this._isAdded
                  ? 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'bg-[#0AAD0A] text-white hover:bg-[#089408] shadow-xs'
              }"
            >
              ${this._isAdded ? '✓ Deal Locked in Cart' : '🔒 Lock Deal & Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    `;

    this.querySelectorAll('[data-wc-week]').forEach((circle) => {
      circle.addEventListener('click', () => {
        const idx = Number(circle.getAttribute('data-wc-week') ?? 7);
        this._selectedWeekIdx = idx;
        this.render();
      });
    });

    const lockBtn = this.querySelector('[data-wc-action="lock-deal"]');
    lockBtn?.addEventListener('click', () => {
      this.handleLockDeal();
    });
  }
}

let isRegistered = false;

/**
 * Safely registers FreshCart's W3C Custom Elements (`<freshcart-nutrition-ring>`,
 * `<freshcart-aisle-stepper>`, `<freshcart-price-sparkline>`) in the browser
 * `CustomElementRegistry`. Guards against SSR (`typeof customElements === 'undefined'`)
 * and duplicate registration during Vite HMR.
 */
export function registerFreshCartWebComponents(): void {
  if (
    isRegistered ||
    typeof window === 'undefined' ||
    typeof customElements === 'undefined'
  ) {
    return;
  }

  if (!customElements.get(FRESHCART_WC_TAGS.nutritionRing)) {
    customElements.define(
      FRESHCART_WC_TAGS.nutritionRing,
      FreshCartNutritionRingElement
    );
  }

  if (!customElements.get(FRESHCART_WC_TAGS.aisleStepper)) {
    customElements.define(
      FRESHCART_WC_TAGS.aisleStepper,
      FreshCartAisleStepperElement
    );
  }

  if (!customElements.get(FRESHCART_WC_TAGS.priceSparkline)) {
    customElements.define(
      FRESHCART_WC_TAGS.priceSparkline,
      FreshCartPriceSparklineElement
    );
  }

  isRegistered = true;
}

/**
 * Generates an A2UI v1.0 multi-envelope stream (`createSurface`, `updateComponents`,
 * `updateDataModel`) showcasing W3C Custom Elements (`NutritionRingWC`,
 * `AisleStepperWC`, `PriceSparklineWC`) working seamlessly alongside standard
 * A2UI v1.0 Basic Catalog components (`Card`, `Slider`, `ChoicePicker`, `Button`)
 * with shared reactive `@path` data bindings.
 */
export function buildWebComponentsShowcaseStream(
  products: Product[],
  activeStoreName = 'FreshCart Market · Mission Bay'
): A2UIv1Message[] {
  const salmon =
    products.find((p) => p.id.includes('salmon')) ??
    products[0] ?? {
      id: 'prod-seafood-salmon',
      name: 'Wild Alaskan Sockeye Salmon Fillet',
      price: 12.99,
      originalPrice: 15.99,
      unit: '12 oz fillet',
    };

  const avocados =
    products.find((p) => p.id.includes('avocado')) ??
    products[1] ?? {
      id: 'prod-produce-avocados',
      name: 'Organic Hass Avocados (4 ct Bag)',
      price: 4.99,
      unit: '4 ct bag',
    };

  const sourdough =
    products.find((p) => p.id.includes('sourdough')) ??
    products[2] ?? {
      id: 'prod-bakery-sourdough',
      name: 'San Francisco Country Sourdough',
      price: 5.49,
      unit: '24 oz loaf',
    };

  const surfaceId = 'freshcart-web-components-showcase';

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
      updateDataModel: {
        surfaceId,
        path: '/',
        value: {
          title: 'Smart Kitchen & In-Store Aisle Companion',
          servings: 4,
          dailyCalorieTarget: 2000,
          activeStopIndex: 0,
          fulfillmentMode: ['In-Store Fast-Track'],
          storeName: activeStoreName,
          aisleStops: [
            {
              aisleNumber: 'Aisle 1',
              zoneName: 'Organic Produce',
              productId: avocados.id,
              productName: avocados.name,
              price: avocados.price,
              unit: avocados.unit,
              etaMinutes: 1,
            },
            {
              aisleNumber: 'Aisle 4',
              zoneName: 'Seafood & Butcher',
              productId: salmon.id,
              productName: salmon.name,
              price: salmon.price,
              unit: salmon.unit,
              etaMinutes: 3,
            },
            {
              aisleNumber: 'Aisle 7',
              zoneName: 'Artisan Bakery',
              productId: sourdough.id,
              productName: sourdough.name,
              price: sourdough.price,
              unit: sourdough.unit,
              etaMinutes: 5,
            },
          ],
          sparklinePrices: [15.99, 15.49, 15.99, 14.99, 14.49, 13.99, 13.49, salmon.price],
        },
      },
    },
    {
      version: A2UI_VERSION,
      updateComponents: {
        surfaceId,
        components: [
          {
            id: 'root',
            component: 'Column',
            children: [
              'header-card',
              'wc-nutrition-ring',
              'wc-aisle-stepper',
              'wc-price-sparkline',
              'controls-card',
            ],
          },
          {
            id: 'header-card',
            component: 'Card',
            child: 'header-col',
          },
          {
            id: 'header-col',
            component: 'Column',
            children: ['header-title', 'header-sub'],
          },
          {
            id: 'header-title',
            component: 'Text',
            variant: 'h3',
            text: { '@path': '/title' },
          },
          {
            id: 'header-sub',
            component: 'Text',
            variant: 'body',
            text: 'Powered by W3C Custom Elements (<freshcart-nutrition-ring>, <freshcart-aisle-stepper>, <freshcart-price-sparkline>) two-way bound to the A2UI v1.0 surface dataModel.',
          },
          {
            id: 'wc-nutrition-ring',
            component: 'NutritionRingWC',
            title: 'Live Meal Macro & Calorie Ring',
            calories: 540,
            dailyCalorieTarget: { '@path': '/dailyCalorieTarget' },
            proteinGrams: 42,
            carbsGrams: 46,
            fatGrams: 18,
            fiberGrams: 9,
            servings: { '@path': '/servings' },
            servingsPath: '/servings',
          },
          {
            id: 'wc-aisle-stepper',
            component: 'AisleStepperWC',
            title: 'Interactive Store Aisle Navigator',
            storeName: { '@path': '/storeName' },
            fulfillmentMode: 'Express Aisle Route',
            activeStopIndex: { '@path': '/activeStopIndex' },
            activeStopPath: '/activeStopIndex',
            stops: { '@path': '/aisleStops' },
          },
          {
            id: 'wc-price-sparkline',
            component: 'PriceSparklineWC',
            productId: salmon.id,
            title: salmon.name,
            unit: salmon.unit,
            currentPrice: salmon.price,
            regularPrice: salmon.originalPrice ?? 15.99,
            weeklyPrices: { '@path': '/sparklinePrices' },
            badgeText: '8-Week Lowest Price',
          },
          {
            id: 'controls-card',
            component: 'Card',
            child: 'controls-col',
          },
          {
            id: 'controls-col',
            component: 'Column',
            children: ['servings-slider', 'add-all-btn'],
          },
          {
            id: 'servings-slider',
            component: 'Slider',
            label: 'Sync Servings Across React & Web Components',
            min: 1,
            max: 12,
            step: 1,
            value: { '@path': '/servings' },
          },
          {
            id: 'add-all-btn',
            component: 'Button',
            variant: 'primary',
            child: 'add-all-label',
            action: {
              event: {
                name: 'addRecipeIngredientsToCart',
                context: {
                  recipeTitle: { '@path': '/title' },
                  servings: { '@path': '/servings' },
                  items: [
                    { productId: avocados.id, quantity: 1 },
                    { productId: salmon.id, quantity: 1 },
                    { productId: sourdough.id, quantity: 1 },
                  ],
                },
              },
            },
          },
          {
            id: 'add-all-label',
            component: 'Text',
            text: {
              '@call': 'formatString',
              args: {
                template: 'Add All 3 Aisle Picks ({servings} Servings) to Cart',
                servings: { '@path': '/servings' },
              },
            },
          },
        ],
      },
    },
  ];
}
