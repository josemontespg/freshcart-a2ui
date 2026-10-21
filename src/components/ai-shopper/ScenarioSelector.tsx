import React, { useState } from 'react';
import {
  Sparkles,
  UtensilsCrossed,
  ArrowLeftRight,
  Wallet,
  Play,
  Zap,
  Send,
  Bot,
  Loader2,
  Cpu,
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
    id: 'chip-salmon-6',
    label: 'Salmon dinner for 6',
    prompt:
      'Create an interactive A2UI v1.0 Meal Planner surface for a Mediterranean salmon & quinoa dinner for 6 servings with a servings slider, organic checkbox, nutrition summary, and recipe-to-cart action.',
    scenarioId: 'meal-planner',
  },
  {
    id: 'chip-protein-org',
    label: '100% Organic Protein Bowls',
    prompt:
      'Build a High-Protein Chicken & Avocado Power Bowls A2UI v1.0 surface for 4 servings using 100% USDA organic store SKUs, nutrition summary, and 1-click bundle add.',
    scenarioId: 'meal-planner',
  },
  {
    id: 'chip-cart-swaps',
    label: 'AI Cart Swaps & Savings',
    prompt:
      'Analyze my live cart items and generate an A2UI v1.0 Smart Cart Optimizer surface with ProductDealCard swaps for budget savings, organic upgrades, and low-stock backups.',
    scenarioId: 'cart-optimizer',
  },
  {
    id: 'chip-budget-tight',
    label: '$110 Weekly Macro Planner',
    prompt:
      'Create an interactive A2UI v1.0 Weekly Budget & Macro Planner surface with a $110 weekly budget slider, household goals ChoicePicker, prep time TextField with numeric checks, and curated high-protein grocery basket.',
    scenarioId: 'budget-builder',
  },
];

export interface ScenarioSelectorProps {
  activeScenarioId: ScenarioId;
  onSelectScenario: (scenarioId: ScenarioId) => void;
  onSubmitCustomPrompt: (promptText: string) => void;
  onGenerateWithLiveGemini?: (scenarioId?: ScenarioId) => void;
  onReplayStream: () => void;
  streamMode: 'simulated' | 'instant';
  onToggleStreamMode: (mode: 'simulated' | 'instant') => void;
  engineMode?: AIEngineMode;
  onToggleEngineMode?: (mode: AIEngineMode) => void;
  geminiTelemetry?: GeminiTelemetryState;
  cartItemCount: number;
  isStreaming: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  activeScenarioId,
  onSelectScenario,
  onSubmitCustomPrompt,
  onGenerateWithLiveGemini,
  onReplayStream,
  streamMode,
  onToggleStreamMode,
  engineMode = 'gemini-live',
  onToggleEngineMode,
  geminiTelemetry,
  cartItemCount,
  isStreaming,
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
      {/* Live Gemini LLM Telemetry & Engine Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-950/95 text-white px-3 py-2 rounded-xl border border-emerald-800/80 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                geminiTelemetry?.configured !== false
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                geminiTelemetry?.configured !== false
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
          </span>
          <Cpu className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span className="text-[11px] font-bold tracking-tight truncate">
            {geminiTelemetry?.model
              ? `Gemini (${geminiTelemetry.model}) · Live LLM`
              : 'Gemini 2.5 Flash · Live LLM'}
          </span>

          {geminiTelemetry?.lastLatencyMs !== undefined && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/90 text-emerald-200 border border-emerald-700/60">
              {geminiTelemetry.lastLatencyMs}ms ·{' '}
              {geminiTelemetry.lastComponentCount ?? 0} nodes
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {onToggleEngineMode && (
            <button
              type="button"
              onClick={() =>
                onToggleEngineMode(
                  engineMode === 'gemini-live' ? 'blueprint' : 'gemini-live'
                )
              }
              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                engineMode === 'gemini-live'
                  ? 'bg-[#0AAD0A] text-white border-emerald-400/50'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
              title="Switch between Live Gemini LLM generation and deterministic A2UI v1.0 blueprints"
            >
              {engineMode === 'gemini-live'
                ? 'Mode: Live Gemini LLM'
                : 'Mode: Deterministic Blueprint'}
            </button>
          )}

          {onGenerateWithLiveGemini && (
            <button
              type="button"
              disabled={isGeminiBusy}
              onClick={() => onGenerateWithLiveGemini(activeScenarioId)}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white text-[#073E1E] hover:bg-emerald-50 disabled:opacity-60 transition-colors cursor-pointer shadow-2xs"
              title="Call the live Cloudtop Gemini API to generate a fresh A2UI v1.0 surface for this scenario"
            >
              {isGeminiBusy ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-[#0AAD0A]" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-[#0AAD0A]" />
                  Generate with Live Gemini
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Top Scenario Switcher Grid */}
      <div
        className="grid grid-cols-3 gap-2"
        role="tablist"
        aria-label="A2UI v1.0 Scenarios"
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
              disabled={isGeminiBusy}
              onClick={() => onSubmitCustomPrompt(chip.prompt)}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 border border-stone-200/80 transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
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
              onToggleStreamMode(
                streamMode === 'simulated' ? 'instant' : 'simulated'
              )
            }
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 cursor-pointer"
            title="Toggle between progressive 3-packet streaming and instant hydration"
          >
            <Zap
              className={`w-3 h-3 ${
                streamMode === 'simulated'
                  ? 'text-amber-500'
                  : 'text-emerald-600'
              }`}
            />
            {streamMode === 'simulated' ? 'Stream: 220ms/pkt' : 'Stream: Instant'}
          </button>

          <button
            type="button"
            onClick={onReplayStream}
            disabled={isStreaming || isGeminiBusy}
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 disabled:opacity-50 cursor-pointer"
            title="Replay the 3-step A2UI v1.0 packet stream (createSurface -> updateComponents -> updateDataModel)"
          >
            <Play className="w-3 h-3 fill-current" />
            Replay Stream
          </button>
        </div>
      </div>

      {/* Natural Language Prompt Bar (wired to Live Gemini LLM) */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center">
        <input
          type="text"
          value={promptInput}
          disabled={isGeminiBusy}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder={
            isGeminiBusy
              ? 'Gemini 2.5 Flash is synthesizing A2UI v1.0 envelopes...'
              : "Ask Live Gemini AI Shopper: e.g. 'keto salmon dinner for 5', 'swap cart to organic'..."
          }
          aria-label="Ask FreshCart AI Personal Shopper"
          className="w-full text-xs bg-stone-50 border border-stone-200/90 focus:border-[#0AAD0A] focus:bg-white rounded-xl pl-3 pr-9 py-2.5 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0AAD0A]/20 transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isGeminiBusy || !promptInput.trim()}
          aria-label="Send prompt to Live Gemini AI Shopper"
          className="absolute right-1.5 p-1.5 rounded-lg bg-[#0AAD0A] hover:bg-[#089208] disabled:bg-stone-300 text-white transition-colors cursor-pointer"
        >
          {isGeminiBusy ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
    </div>
  );
};
