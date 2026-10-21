import React from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Tag, Zap } from 'lucide-react';
import type { DietaryTag, Store } from '../../types/grocery';

export interface HeroBannerProps {
  store: Store;
  onLaunchAIScenario?: (
    scenarioId: 'meal-planner' | 'cart-optimizer' | 'budget-builder'
  ) => void;
  onOpenAIShopper?: (
    scenarioId?: 'meal-planner' | 'cart-optimizer' | 'budget-builder'
  ) => void;
  onQuickFilterTag?: (tag: DietaryTag) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  store,
  onLaunchAIScenario,
  onOpenAIShopper,
  onQuickFilterTag,
}) => {
  const scenarioId = store.featuredPromoBanner.linkedScenarioId ?? 'meal-planner';

  const handleTriggerScenario = (
    targetScenario: 'meal-planner' | 'cart-optimizer' | 'budget-builder'
  ) => {
    if (onLaunchAIScenario) {
      onLaunchAIScenario(targetScenario);
    } else if (onOpenAIShopper) {
      onOpenAIShopper(targetScenario);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#073E1E] via-[#0B5328] to-[#108910] text-white shadow-md border border-emerald-900/20">
      {/* Decorative radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#0AAD0A]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-emerald-300/10 blur-2xl"
      />

      <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl space-y-3.5">
          {/* Top badge bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-emerald-100 backdrop-blur-xs border border-white/15">
              <span>{store.logoEmoji}</span>
              <span>{store.name}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0AAD0A] text-white shadow-2xs">
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
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleTriggerScenario(scenarioId)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#073E1E] hover:bg-emerald-50 font-bold text-sm shadow-sm transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-[#0AAD0A]" />
              <span>{store.featuredPromoBanner.ctaText}</span>
              <ArrowRight className="w-4 h-4 text-[#0AAD0A] transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={() => handleTriggerScenario('cart-optimizer')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Smart Cart Swaps (A2UI v1.0)</span>
            </button>

            {onQuickFilterTag && (
              <button
                type="button"
                onClick={() => onQuickFilterTag('organic')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-100 text-xs font-medium border border-emerald-400/20 transition-all cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-emerald-300" />
                <span>Filter USDA Organic</span>
              </button>
            )}
          </div>
        </div>

        {/* Right-hand interactive A2UI v1.0 capability card */}
        <div className="lg:w-80 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              A2UI v1.0 Live Engine
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              version: &quot;v1.0&quot;
            </span>
          </div>

          <p className="text-xs text-emerald-50/90 leading-relaxed">
            Interactive grocery surfaces streamed via declarative JSON envelopes with two-way{' '}
            <code className="px-1 py-0.5 rounded bg-black/25 text-emerald-200 font-mono text-[11px]">
              @path
            </code>{' '}
            bindings and{' '}
            <code className="px-1 py-0.5 rounded bg-black/25 text-emerald-200 font-mono text-[11px]">
              @call
            </code>{' '}
            formatters.
          </p>

          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleTriggerScenario('meal-planner')}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-left text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Recipe Scaling &amp; Bundle-to-Cart</span>
              </span>
              <span className="text-[11px] text-emerald-200 font-mono">@index</span>
            </button>
            <button
              type="button"
              onClick={() => handleTriggerScenario('cart-optimizer')}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-left text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Organic &amp; Budget SKU Optimizer</span>
              </span>
              <span className="text-[11px] text-emerald-200 font-mono">Tabs</span>
            </button>
            <button
              type="button"
              onClick={() => handleTriggerScenario('budget-builder')}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-left text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Weekly Macro &amp; Budget Planner</span>
              </span>
              <span className="text-[11px] text-emerald-200 font-mono">checks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
