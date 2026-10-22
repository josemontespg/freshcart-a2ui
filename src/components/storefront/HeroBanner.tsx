import React from 'react';
import {
  ArrowRight,
  CalendarHeart,
  ChevronRight,
  PiggyBank,
  Sparkles,
  Tag,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import type { DietaryTag, Store } from '../../types/grocery';
import type { ScenarioId } from '../ai-shopper/ScenarioSelector';

export interface HeroBannerProps {
  store: Store;
  onLaunchAIScenario?: (scenarioId: ScenarioId) => void;
  onOpenAIShopper?: (scenarioId?: ScenarioId) => void;
  onQuickFilterTag?: (tag: DietaryTag) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  store,
  onLaunchAIScenario,
  onOpenAIShopper,
  onQuickFilterTag,
}) => {
  const scenarioId =
    store.featuredPromoBanner.linkedScenarioId ?? 'meal-planner';

  const handleTriggerScenario = (targetScenario: ScenarioId) => {
    if (onLaunchAIScenario) {
      onLaunchAIScenario(targetScenario);
    } else if (onOpenAIShopper) {
      onOpenAIShopper(targetScenario);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#073E1E] via-[#0A5226] to-[#0E7A35] text-white shadow-sm border border-emerald-900/15">
      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-24 w-96 h-96 rounded-full bg-[#0AAD0A]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 left-1/4 w-80 h-80 rounded-full bg-emerald-300/10 blur-3xl"
      />

      <div className="relative z-10 px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
        <div className="max-w-2xl space-y-4">
          {/* Store & promo pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/12 text-emerald-50 backdrop-blur-xs border border-white/15">
              <span>{store.logoEmoji}</span>
              <span>{store.name}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0AAD0A] text-white shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              {store.featuredPromoBanner.badgeText}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {store.featuredPromoBanner.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed max-w-xl">
            {store.featuredPromoBanner.subtitle}
          </p>

          {/* Action CTA row */}
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleTriggerScenario(scenarioId)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#073E1E] hover:bg-emerald-50 font-bold text-sm shadow-sm transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-[#0AAD0A]" />
              <span>{store.featuredPromoBanner.ctaText}</span>
              <ArrowRight className="w-4 h-4 text-[#0AAD0A] transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={() => handleTriggerScenario('smart-functions')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/25 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>Smart Coupons &amp; Nutrition</span>
            </button>

            {onQuickFilterTag && (
              <button
                type="button"
                onClick={() => onQuickFilterTag('organic')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-950/35 hover:bg-emerald-950/55 text-emerald-100 text-xs font-semibold border border-emerald-300/20 transition-all cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-emerald-300" />
                <span>Shop USDA Organic</span>
              </button>
            )}
          </div>
        </div>

        {/* Right-hand consumer-friendly "Shop Smarter with AI" quick-launch card */}
        <div className="lg:w-84 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-white">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Shop Smarter with AI</span>
            </span>
            <span className="text-[11px] font-medium text-emerald-100/90">
              Personal Assistant
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleTriggerScenario('smart-functions')}
              className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-emerald-300/25 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-[#0AAD0A] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">
                    Smart Coupons &amp; Nutrition
                  </div>
                  <div className="text-[11px] text-emerald-100/90 truncate">
                    Live store coupons, net-carb calc &amp; cart sync
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={() => handleTriggerScenario('meal-planner')}
              className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-200" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">
                    Plan Tonight&apos;s Dinner
                  </div>
                  <div className="text-[11px] text-emerald-100/80 truncate">
                    Custom recipes &amp; scaled ingredients
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={() => handleTriggerScenario('cart-optimizer')}
              className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <PiggyBank className="w-4 h-4 text-emerald-200" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">
                    Find Cart Savings
                  </div>
                  <div className="text-[11px] text-emerald-100/80 truncate">
                    Value swaps, organic upgrades &amp; backups
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={() => handleTriggerScenario('budget-builder')}
              className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <CalendarHeart className="w-4 h-4 text-emerald-200" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">
                    Build a Weekly Plan
                  </div>
                  <div className="text-[11px] text-emerald-100/80 truncate">
                    Stay on budget &amp; hit nutrition goals
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
