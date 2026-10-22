import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  ShoppingCart,
  Sparkles,
  Thermometer,
  Wine,
} from 'lucide-react';
import {
  FRESHCART_CULINARY_CATALOG_ID,
  type A2UIAction,
} from '../../types/a2ui-v1';
import {
  evaluateDynamicValue,
  resolveDynamicBoolean,
  resolveDynamicNumber,
  resolveDynamicString,
} from '../DataModelBinder';
import {
  type A2UIRenderNodeContext,
  ValidationFeedbackList,
} from './basicCatalogRenderer';

/**
 * Culinary Catalog Component 1: `NutritionSummary`
 * (`https://freshcart.app/catalogs/culinary/v1/catalog.json`)
 *
 * Renders a chef-grade macro breakdown with optional `dietaryScore` (computed via
 * `@call: "matchDietaryScore"`) and `perServingCostLabel` (computed via
 * `@call: "calculatePerServingCost"`).
 */
const A2UICulinaryNutritionSummary: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext } = ctx;

  const title = resolveDynamicString(
    component.title ?? component.label,
    evalContext,
    'Chef Macro & Culinary Harmony Summary'
  );
  const calories = resolveDynamicNumber(component.calories, evalContext, 560);
  const proteinGrams = resolveDynamicNumber(
    component.proteinGrams ?? component.proteinG ?? component.protein,
    evalContext,
    42
  );
  const carbsGrams = resolveDynamicNumber(
    component.carbsGrams ?? component.carbsG ?? component.carbs,
    evalContext,
    36
  );
  const fatGrams = resolveDynamicNumber(
    component.fatGrams ?? component.fatG ?? component.fat,
    evalContext,
    24
  );
  const fiberGrams = resolveDynamicNumber(
    component.fiberGrams ?? component.fiberG ?? component.fiber,
    evalContext,
    8
  );
  const servings = resolveDynamicNumber(component.servings, evalContext, 4);
  const dietaryScore = resolveDynamicNumber(
    component.dietaryScore,
    evalContext,
    98
  );
  const perServingCostLabel = resolveDynamicString(
    component.perServingCostLabel,
    evalContext,
    ''
  );

  const totalMacroGrams = Math.max(1, proteinGrams + carbsGrams + fatGrams);
  const proteinPct = Math.round((proteinGrams / totalMacroGrams) * 100);
  const carbsPct = Math.round((carbsGrams / totalMacroGrams) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  const isExplicitCulinaryCatalog =
    component.catalogId === FRESHCART_CULINARY_CATALOG_ID;

  return (
    <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/70 via-white to-rose-50/40 p-4 shadow-xs">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100/90 px-2.5 py-0.5 font-mono text-[10px] font-bold text-violet-900 border border-violet-200">
          {isExplicitCulinaryCatalog
            ? 'culinary/v1 · NutritionSummary'
            : 'NutritionSummary'}
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {dietaryScore > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 border border-emerald-200">
              <Award className="h-3 w-3 text-[#0AAD0A]" />
              Harmony {dietaryScore}/100
            </span>
          )}
          {perServingCostLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-200">
              <Sparkles className="h-3 w-3 text-amber-600" />
              {perServingCostLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/10 text-violet-700">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-stone-900">{title}</h4>
            <p className="text-[11px] text-stone-500">
              Scaled for {servings} {servings === 1 ? 'guest' : 'guests'} · Complete
              Omega-3 &amp; Amino Profile
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-stone-200/80 px-3 py-1 text-right shadow-2xs">
          <span className="text-base font-extrabold text-stone-900">
            {calories}
          </span>
          <span className="ml-1 text-[11px] font-medium text-stone-500">
            kcal
          </span>
        </div>
      </div>

      {/* Macro Proportion Bar */}
      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-stone-200/70">
        <div
          style={{ width: `${proteinPct}%` }}
          className="bg-violet-600 transition-all duration-300"
          title={`Protein: ${proteinPct}%`}
        />
        <div
          style={{ width: `${carbsPct}%` }}
          className="bg-amber-400 transition-all duration-300"
          title={`Carbs: ${carbsPct}%`}
        />
        <div
          style={{ width: `${fatPct}%` }}
          className="bg-rose-400 transition-all duration-300"
          title={`Fat: ${fatPct}%`}
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-stone-200/70 bg-white px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500">
            <span className="h-2 w-2 rounded-full bg-violet-600" />
            Protein
          </div>
          <div className="mt-0.5 text-sm font-bold text-stone-900">
            {proteinGrams}g
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/70 bg-white px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Carbs
          </div>
          <div className="mt-0.5 text-sm font-bold text-stone-900">
            {carbsGrams}g
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/70 bg-white px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Fat
          </div>
          <div className="mt-0.5 text-sm font-bold text-stone-900">
            {fatGrams}g
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/70 bg-white px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Fiber
          </div>
          <div className="mt-0.5 text-sm font-bold text-stone-900">
            {fiberGrams}g
          </div>
        </div>
      </div>
    </div>
  );
};

interface CulinaryTimelineStep {
  stepNumber?: number;
  title: string;
  instruction: string;
  durationMinutes?: number;
  technique?: string;
}

const DEFAULT_TIMELINE_STEPS: CulinaryTimelineStep[] = [
  {
    stepNumber: 1,
    title: 'Score & Dry-Brine Wild Sockeye Fillets',
    instruction:
      'Pat salmon skin bone-dry, score lightly at 1-inch intervals, and season with flaky sea salt and Meyer lemon zest.',
    durationMinutes: 6,
    technique: 'Skin-Crisp Prep',
  },
  {
    stepNumber: 2,
    title: 'Simmer Tri-Color Quinoa in Herbed Broth',
    instruction:
      'Toast quinoa in extra-virgin olive oil for 90 seconds before simmering until fluffy spirals bloom.',
    durationMinutes: 12,
    technique: 'Aromatic Bloom',
  },
  {
    stepNumber: 3,
    title: 'Cast-Iron Sear & Rest with Heirloom Tomatoes',
    instruction:
      'Sear salmon skin-side down at 415°F for 4 minutes until shatteringly crisp; fold spinach and blistered tomatoes into warm quinoa.',
    durationMinutes: 7,
    technique: '415°F Sear',
  },
];

/**
 * Culinary Catalog Component 2: `RecipeStepTimeline`
 * (`https://freshcart.app/catalogs/culinary/v1/catalog.json`)
 *
 * Interactive step-by-step chef preparation timeline with technique badges and
 * interactive completion check-offs.
 */
const A2UIRecipeStepTimeline: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext } = ctx;
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {}
  );

  const title = resolveDynamicString(
    component.title,
    evalContext,
    'Chef Step-by-Step Preparation Timeline'
  );
  const totalPrepMinutes = resolveDynamicNumber(
    component.totalPrepMinutes ?? component.prepMinutes,
    evalContext,
    25
  );
  const difficulty = resolveDynamicString(
    component.difficulty,
    evalContext,
    'Chef-Curated · 3-Pan Technique'
  );

  const rawSteps = evaluateDynamicValue(component.steps, evalContext);
  const steps: CulinaryTimelineStep[] =
    Array.isArray(rawSteps) && rawSteps.length > 0
      ? rawSteps.map((s, idx) => {
          const item = (s ?? {}) as Record<string, unknown>;
          return {
            stepNumber: Number(item.stepNumber ?? idx + 1),
            title: String(item.title ?? `Step ${idx + 1}`),
            instruction: String(item.instruction ?? item.description ?? ''),
            durationMinutes:
              item.durationMinutes !== undefined
                ? Number(item.durationMinutes)
                : undefined,
            technique:
              typeof item.technique === 'string' ? item.technique : undefined,
          };
        })
      : DEFAULT_TIMELINE_STEPS;

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="rounded-2xl border border-violet-200/80 bg-white p-4 shadow-xs">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <ChefHat className="h-4 w-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className="text-xs font-bold text-stone-900">{title}</h4>
              <span className="rounded-full bg-violet-100/90 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-900 border border-violet-200">
                culinary/v1 · RecipeStepTimeline
              </span>
            </div>
            <p className="text-[11px] text-stone-500">{difficulty}</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700">
          <Clock className="h-3 w-3 text-violet-600" />
          {totalPrepMinutes} min total
        </span>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = Boolean(completedSteps[idx]);
          return (
            <div
              key={idx}
              onClick={() => toggleStep(idx)}
              className={`group flex items-start gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-stone-200/80 bg-stone-50/50 hover:border-violet-300 hover:bg-violet-50/20'
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isDone
                    ? 'bg-[#0AAD0A] text-white'
                    : 'bg-violet-600 text-white'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  step.stepNumber ?? idx + 1
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span
                    className={`text-xs font-bold ${
                      isDone
                        ? 'line-through text-stone-500'
                        : 'text-stone-900'
                    }`}
                  >
                    {step.title}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {step.technique && (
                      <span className="rounded-md bg-violet-100/80 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
                        {step.technique}
                      </span>
                    )}
                    {step.durationMinutes !== undefined && (
                      <span className="text-[11px] font-semibold text-stone-500">
                        {step.durationMinutes}m
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">
                  {step.instruction}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Culinary Catalog Component 3: `WineAndCheesePairingCard`
 * (`https://freshcart.app/catalogs/culinary/v1/catalog.json`)
 *
 * Sommelier & Fromager pairing recommendation card with tasting notes, serving
 * temperature, dynamic `pairingScore` (from `@call: "matchDietaryScore"`),
 * dynamic `perServingCostLabel` (from `@call: "calculatePerServingCost"`),
 * and one-click add-pairing action.
 */
const A2UIWineAndCheesePairingCard: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const { component, evalContext, validationState, dispatchAction } = ctx;

  const pairingTitle = resolveDynamicString(
    component.pairingTitle ?? component.title,
    evalContext,
    'Aged Manchego & Crisp Albariño Citrus Pairing'
  );
  const cheeseSelection = resolveDynamicString(
    component.cheeseSelection ?? component.fromagerPick,
    evalContext,
    '6-Month Cave-Aged Artisan Manchego & Castelvetrano Olives'
  );
  const beveragePairing = resolveDynamicString(
    component.beveragePairing ?? component.sommelierPick,
    evalContext,
    'Chilled Rías Baixas Albariño (or Sparkling Meyer Lemon Botanical Spritz)'
  );
  const tastingNotes = resolveDynamicString(
    component.tastingNotes ?? component.description,
    evalContext,
    'Bright saline minerality and stone-fruit acidity cut through rich wild sockeye omega-3 oils while nutty sheep’s-milk cheese echoes the toasted quinoa.'
  );
  const servingTemp = resolveDynamicString(
    component.servingTemp,
    evalContext,
    'Serve chilled at 48°F · Temper cheese 20m'
  );
  const pairingScore = resolveDynamicNumber(
    component.pairingScore,
    evalContext,
    98
  );
  const perServingCostLabel = resolveDynamicString(
    component.perServingCostLabel,
    evalContext,
    '$11.24 / guest (with pairing)'
  );
  const pairingPrice = resolveDynamicNumber(
    component.pairingPrice ?? component.price,
    evalContext,
    16.99
  );
  const isAdded = resolveDynamicBoolean(
    component.added ?? component.includeWinePairing,
    evalContext,
    false
  );
  const actionLabel = resolveDynamicString(
    component.actionLabel,
    evalContext,
    isAdded
      ? 'Sommelier Pairing Added ✓'
      : `Add Pairing Bundle ($${pairingPrice.toFixed(2)})`
  );

  const handleAction = () => {
    if (!validationState.isValid) return;
    dispatchAction(
      component.id,
      component.action as A2UIAction | undefined,
      evalContext
    );
  };

  return (
    <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 via-white to-violet-50/50 p-4 shadow-xs">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-900">
            <Wine className="h-3 w-3 text-rose-700" />
            Sommelier &amp; Fromager Pairing
          </span>
          <span className="rounded-full bg-violet-100/90 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-900 border border-violet-200">
            culinary/v1 · WineAndCheesePairingCard
          </span>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900 border border-emerald-200">
          <Award className="h-3 w-3 text-[#0AAD0A]" />
          {pairingScore}/100 Match
        </span>
      </div>

      <h4 className="text-sm font-bold text-stone-900">{pairingTitle}</h4>

      <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-xl border border-rose-200/60 bg-white/90 p-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Pour / Botanical Pairing
          </div>
          <div className="mt-0.5 text-xs font-semibold text-stone-900">
            {beveragePairing}
          </div>
        </div>

        <div className="rounded-xl border border-violet-200/60 bg-white/90 p-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
            Artisan Fromager Board
          </div>
          <div className="mt-0.5 text-xs font-semibold text-stone-900">
            {cheeseSelection}
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-stone-600">
        {tastingNotes}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-rose-100 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700">
            <Thermometer className="h-3 w-3 text-rose-600" />
            {servingTemp}
          </span>
          {perServingCostLabel && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-violet-100/80 px-2.5 py-1 text-[11px] font-bold text-violet-900">
              <Sparkles className="h-3 w-3 text-violet-700" />
              {perServingCostLabel}
            </span>
          )}
        </div>

        {component.action !== undefined && (
          <button
            type="button"
            onClick={handleAction}
            disabled={!validationState.isValid}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              isAdded
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-rose-700 text-white hover:bg-rose-800 shadow-xs'
            }`}
          >
            {isAdded ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#0AAD0A]" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>

      <ValidationFeedbackList validationState={validationState} compact />
    </div>
  );
};

/**
 * Dispatches custom FreshCart Culinary & Sommelier Catalog components
 * (`NutritionSummary`, `RecipeStepTimeline`, `WineAndCheesePairingCard`).
 */
export function renderCulinaryCatalogComponent(
  ctx: A2UIRenderNodeContext
): React.ReactNode | null {
  switch (ctx.component.component) {
    case 'NutritionSummary':
      return <A2UICulinaryNutritionSummary ctx={ctx} />;
    case 'RecipeStepTimeline':
      return <A2UIRecipeStepTimeline ctx={ctx} />;
    case 'WineAndCheesePairingCard':
      return <A2UIWineAndCheesePairingCard ctx={ctx} />;
    default:
      return null;
  }
}
