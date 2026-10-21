import React, { useState } from 'react';
import {
  Sparkles,
  UtensilsCrossed,
  ArrowLeftRight,
  Wallet,
  Play,
  Zap,
  Send,
} from 'lucide-react';

export type ScenarioId = 'meal-planner' | 'cart-optimizer' | 'budget-builder';

export interface QuickPromptChip {
  id: string;
  label: string;
  prompt: string;
  scenarioId: ScenarioId;
}

export const QUICK_PROMPT_CHIPS: QuickPromptChip[] = [
  {
    id: 'chip-salmon-6',
    label: 'Salmon dinner for 6',
    prompt: 'Plan a Mediterranean salmon & quinoa dinner for 6 servings',
    scenarioId: 'meal-planner',
  },
  {
    id: 'chip-protein-org',
    label: '100% Organic Protein Bowls',
    prompt: 'High-protein chicken meal prep bowls for 4 with 100% USDA organic ingredients',
    scenarioId: 'meal-planner',
  },
  {
    id: 'chip-cart-swaps',
    label: 'Find Cart Swaps & Savings',
    prompt: 'Analyze my current cart for budget savers, organic upgrades, and low-stock backups',
    scenarioId: 'cart-optimizer',
  },
  {
    id: 'chip-budget-tight',
    label: 'Test $95 Budget Cap Check',
    prompt: 'Weekly high-protein basket with a strict $95 budget cap to test v1.0 checks validation',
    scenarioId: 'budget-builder',
  },
];

export interface ScenarioSelectorProps {
  activeScenarioId: ScenarioId;
  onSelectScenario: (scenarioId: ScenarioId) => void;
  onSubmitCustomPrompt: (promptText: string) => void;
  onReplayStream: () => void;
  streamMode: 'simulated' | 'instant';
  onToggleStreamMode: (mode: 'simulated' | 'instant') => void;
  cartItemCount: number;
  isStreaming: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  activeScenarioId,
  onSelectScenario,
  onSubmitCustomPrompt,
  onReplayStream,
  streamMode,
  onToggleStreamMode,
  cartItemCount,
  isStreaming,
}) => {
  const [promptInput, setPromptInput] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = promptInput.trim();
    if (!trimmed) return;
    onSubmitCustomPrompt(trimmed);
    setPromptInput('');
  };

  const scenarios: Array<{
    id: ScenarioId;
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'meal-planner',
      title: 'Meal Planner',
      subtitle: '@path Slider & @index List',
      badge: 'Recipe -> Cart',
      icon: <UtensilsCrossed className="w-4 h-4" />,
    },
    {
      id: 'cart-optimizer',
      title: 'Cart Optimizer',
      subtitle: 'Live Cart Swaps & Tabs',
      badge: `${cartItemCount} in Cart`,
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      id: 'budget-builder',
      title: 'Budget & Macros',
      subtitle: 'v1.0 checks & Modal',
      badge: 'Validator',
      icon: <Wallet className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white border-b border-stone-200/90 px-4 py-3 space-y-2.5">
      {/* Top Scenario Switcher Grid */}
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="A2UI v1.0 Scenarios">
        {scenarios.map((scen) => {
          const isActive = activeScenarioId === scen.id;
          return (
            <button
              key={scen.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectScenario(scen.id)}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-50/90 border-[#0AAD0A] ring-1 ring-[#0AAD0A]/30 shadow-2xs'
                  : 'bg-stone-50/70 border-stone-200/80 hover:bg-stone-100/80 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`p-1 rounded-lg ${
                    isActive
                      ? 'bg-[#0AAD0A] text-white'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {scen.icon}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {scen.badge}
                </span>
              </div>
              <span
                className={`text-xs font-bold leading-tight ${
                  isActive ? 'text-stone-900' : 'text-stone-800'
                }`}
              >
                {scen.title}
              </span>
              <span className="text-[10px] text-stone-500 truncate w-full mt-0.5">
                {scen.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Prompt Chips & Stream Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full">
          {QUICK_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSubmitCustomPrompt(chip.prompt)}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 border border-stone-200/80 transition-colors whitespace-nowrap cursor-pointer"
              title={chip.prompt}
            >
              <Sparkles className="w-3 h-3 text-[#0AAD0A] shrink-0" />
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() =>
              onToggleStreamMode(streamMode === 'simulated' ? 'instant' : 'simulated')
            }
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 cursor-pointer"
            title="Toggle between progressive 3-packet streaming and instant hydration"
          >
            <Zap
              className={`w-3 h-3 ${
                streamMode === 'simulated' ? 'text-amber-500' : 'text-emerald-600'
              }`}
            />
            {streamMode === 'simulated' ? 'Stream: 220ms/pkt' : 'Stream: Instant'}
          </button>

          <button
            type="button"
            onClick={onReplayStream}
            disabled={isStreaming}
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 disabled:opacity-50 cursor-pointer"
            title="Replay the 3-step A2UI v1.0 packet stream (createSurface -> updateComponents -> updateDataModel)"
          >
            <Play className="w-3 h-3 fill-current" />
            Replay v1.0 Stream
          </button>
        </div>
      </div>

      {/* Natural Language Prompt Bar */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center">
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Ask AI Shopper: e.g. 'organic dinner for 8', 'swap cart to save', 'weekly budget $110'..."
          aria-label="Ask FreshCart AI Personal Shopper"
          className="w-full text-xs bg-stone-50 border border-stone-200/90 focus:border-[#0AAD0A] focus:bg-white rounded-xl pl-3 pr-9 py-2 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/20 transition-all"
        />
        <button
          type="submit"
          aria-label="Send prompt to AI Shopper"
          className="absolute right-1.5 p-1.5 rounded-lg bg-[#0AAD0A] hover:bg-[#089208] text-white transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
