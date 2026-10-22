import React, { useState } from 'react';
import {
  Sparkles,
  UtensilsCrossed,
  ArrowLeftRight,
  Wallet,
  Send,
  Loader2,
} from 'lucide-react';

export type ScenarioId = 'meal-planner' | 'cart-optimizer' | 'budget-builder';

export type AIEngineMode = 'gemini-live' | 'blueprint';

export interface GeminiTelemetryState {
  configured: boolean;
  model: string;
  keySource?: string;
  isGenerating: boolean;
  lastLatencyMs?: number;
  lastComponentCount?: number;
  lastSummary?: string;
  error?: string | null;
}

export interface QuickPromptChip {
  id: string;
  label: string;
  prompt: string;
  scenarioId: ScenarioId;
}

export const QUICK_PROMPT_CHIPS: QuickPromptChip[] = [
  {
    id: 'chip-salmon-4',
    label: '🥗 Salmon dinner for 4',
    prompt:
      'Plan a Mediterranean salmon & quinoa dinner for 4 servings with scaled ingredients, nutrition breakdown, and one-click add to cart.',
    scenarioId: 'meal-planner',
  },
  {
    id: 'chip-protein-bowls',
    label: '🥑 High-protein bowls',
    prompt:
      'Build high-protein harvest chicken & avocado bowls for 4 servings using organic ingredients.',
    scenarioId: 'meal-planner',
  },
  {
    id: 'chip-cart-swaps',
    label: '💰 Find savings in my cart',
    prompt:
      'Find smart budget savers, organic upgrades, and in-stock backups for the items in my cart.',
    scenarioId: 'cart-optimizer',
  },
  {
    id: 'chip-budget-weekly',
    label: '📋 $120 weekly meal plan',
    prompt:
      'Create a $120 weekly grocery plan focused on high-protein meals under 30 minutes of prep time.',
    scenarioId: 'budget-builder',
  },
];

export interface ScenarioSelectorProps {
  activeScenarioId: ScenarioId;
  onSelectScenario: (scenarioId: ScenarioId) => void;
  onSubmitCustomPrompt: (promptText: string) => void;
  onGenerateWithLiveGemini?: (scenarioId?: ScenarioId) => void;
  onReplayStream?: () => void;
  streamMode?: 'simulated' | 'instant';
  onToggleStreamMode?: (mode: 'simulated' | 'instant') => void;
  engineMode?: AIEngineMode;
  onToggleEngineMode?: (mode: AIEngineMode) => void;
  geminiTelemetry?: GeminiTelemetryState;
  cartItemCount: number;
  isStreaming?: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  activeScenarioId,
  onSelectScenario,
  onSubmitCustomPrompt,
  geminiTelemetry,
  cartItemCount,
}) => {
  const [promptInput, setPromptInput] = useState('');

  const isGeminiBusy = Boolean(geminiTelemetry?.isGenerating);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = promptInput.trim();
    if (!trimmed || isGeminiBusy) return;
    onSubmitCustomPrompt(trimmed);
    setPromptInput('');
  };

  const scenarios: Array<{
    id: ScenarioId;
    title: string;
    subtitle: string;
    badge?: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'meal-planner',
      title: 'Meal Planner',
      subtitle: 'Recipes & ingredients',
      icon: <UtensilsCrossed className="w-4 h-4" />,
    },
    {
      id: 'cart-optimizer',
      title: 'Cart Savings',
      subtitle: 'Smart swaps & backups',
      badge: cartItemCount > 0 ? `${cartItemCount} in cart` : undefined,
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      id: 'budget-builder',
      title: 'Weekly Planner',
      subtitle: 'Budget & nutrition',
      icon: <Wallet className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white border-b border-stone-200/80 px-4 py-3.5 space-y-3">
      {/* Natural Language Prompt Bar */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center">
        <Sparkles className="w-4 h-4 text-[#0AAD0A] absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={promptInput}
          disabled={isGeminiBusy}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder={
            isGeminiBusy
              ? 'Personalizing ideas for your kitchen...'
              : 'Ask for a recipe, meal plan, or cart savings...'
          }
          aria-label="Ask AI Personal Shopper"
          className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200/90 focus:border-[#0AAD0A] focus:bg-white rounded-2xl pl-9 pr-10 py-2.5 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/15 transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isGeminiBusy || !promptInput.trim()}
          aria-label="Send request"
          className="absolute right-1.5 p-2 rounded-xl bg-[#0AAD0A] hover:bg-[#089208] disabled:bg-stone-200 disabled:text-stone-400 text-white transition-colors cursor-pointer"
        >
          {isGeminiBusy ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Friendly Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {QUICK_PROMPT_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            disabled={isGeminiBusy}
            onClick={() => onSubmitCustomPrompt(chip.prompt)}
            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-stone-100/90 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-stone-700 border border-stone-200/70 transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 3 Clean Navigation Tabs */}
      <div
        className="grid grid-cols-3 gap-2"
        role="tablist"
        aria-label="Shopping assistant tools"
      >
        {scenarios.map((scen) => {
          const isActive = activeScenarioId === scen.id;
          return (
            <button
              key={scen.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectScenario(scen.id)}
              className={`flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-50/70 border-[#0AAD0A] ring-1 ring-[#0AAD0A]/25 shadow-2xs'
                  : 'bg-stone-50/60 border-stone-200/80 hover:bg-stone-100/70 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#0AAD0A] text-white'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {scen.icon}
                </span>
                {scen.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200/70 text-stone-600'
                    }`}
                  >
                    {scen.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-bold leading-tight ${
                  isActive ? 'text-stone-900' : 'text-stone-800'
                }`}
              >
                {scen.title}
              </span>
              <span className="text-[11px] text-stone-500 truncate w-full mt-0.5">
                {scen.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
