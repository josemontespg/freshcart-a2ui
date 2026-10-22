import {
  A2UI_BASIC_CATALOG_ID,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIAction,
  type A2UIComponentBase,
  type A2UIDataBinding,
  type A2UIDynamicString,
  type A2UIDynamicValue,
  type A2UIv1Message,
} from '../../types/a2ui-v1';

/**
 * Error thrown when a macro name collides with an existing base catalog component.
 * Matches `CatalogError` in the public `google/A2UI` conformance specification (`09_macro_name_collision_error`).
 */
export class A2UICatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'A2UICatalogError';
  }
}

/**
 * Error thrown when recursive macro expansion exceeds `maxDepth` or contains a cycle.
 * Matches `RecursionError` in the public `google/A2UI` conformance specification (`08_cyclic_macro_detection`).
 */
export class A2UIRecursionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'A2UIRecursionError';
  }
}

export type MacroParameterType =
  | 'DynamicString'
  | 'DynamicNumber'
  | 'DynamicBoolean'
  | 'ComponentId'
  | 'ChildList'
  | 'Action'
  | 'CheckRuleList'
  | 'AccessibilityAttributes'
  | 'enum'
  | 'object'
  | 'array';

export interface MacroParameterSpec {
  type: MacroParameterType;
  description: string;
  required?: boolean;
  defaultValue?: unknown;
  enumValues?: string[];
}

export interface MacroExpansionContext {
  instanceId: string;
  /**
   * Allocates a deterministic double-underscore child component ID:
   * `${instanceId}__${componentType.toLowerCase()}_${counter}`
   * matching `IdAllocator` in `google/A2UI`.
   */
  allocId: (componentType: string) => string;
}

export interface MacroExpansionNodeResult {
  /**
   * Internal child components emitted in post-order before the stitched root component.
   */
  children: A2UIComponentBase[];
  /**
   * Root component of the macro expansion. Its `id` will be stitched to `instanceId`.
   */
  root: A2UIComponentBase;
  /**
   * External component IDs preserved via `ComponentId` or `ChildList` slots.
   */
  preservedSlotIds?: string[];
}

export interface A2UIMacroDefinition {
  name: string;
  description: string;
  parameters: Record<string, MacroParameterSpec>;
  expand: (
    params: Record<string, unknown>,
    ctx: MacroExpansionContext
  ) => MacroExpansionNodeResult;
}

export interface MacroExpansionTrace {
  instanceId: string;
  macroName: string;
  rootComponentType: string;
  generatedIds: string[];
  preservedSlotIds: string[];
  rawMacroComponent: A2UIComponentBase;
  expandedComponents: A2UIComponentBase[];
}

export interface MacroExpansionReport {
  surfaceId: string;
  expandedMacroCount: number;
  generatedComponentCount: number;
  totalOutputComponentCount: number;
  traces: MacroExpansionTrace[];
}

export interface InferenceCatalogSchema {
  catalogId?: string;
  components: Record<string, Record<string, unknown>>;
  $defs?: {
    anyComponent?: {
      oneOf?: Array<{ $ref: string }>;
    };
    [key: string]: unknown;
  };
}

/**
 * Deterministic per-instance ID allocator matching `python/a2ui_agent/src/a2ui/builder/core/id_allocator.py`.
 * Generates IDs in the format `${prefix}__${componentType.toLowerCase()}_${counter}`.
 */
export class MacroIdAllocator {
  private readonly prefix: string;
  private readonly counts = new Map<string, number>();

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  allocate(componentType: string): string {
    const normalizedType = componentType.replace(/^@macro:/i, '').toLowerCase();
    const nextCount = (this.counts.get(normalizedType) ?? 0) + 1;
    this.counts.set(normalizedType, nextCount);
    return `${this.prefix}__${normalizedType}_${nextCount}`;
  }
}

/**
 * Coerces a raw macro parameter into a valid A2UI v1.0 dynamic value (`@path` binding or literal).
 * Upgrades legacy v0.9 `{"path": "/..."}` bindings to v1.0 `{"@path": "/..."}` (`05_data_binding_coercion`).
 */
export function coerceMacroDynamicValue(
  value: unknown,
  fallback?: A2UIDynamicValue
): A2UIDynamicValue {
  if (value === undefined || value === null) {
    return fallback ?? '';
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    if (typeof obj['@path'] === 'string') {
      return { '@path': obj['@path'] } as A2UIDataBinding;
    }
    if (typeof obj.path === 'string' && Object.keys(obj).length === 1) {
      return { '@path': obj.path } as A2UIDataBinding;
    }
  }
  return value as A2UIDynamicValue;
}

/**
 * Converts a string path (like `"/servings"` or `"ingredients/0/name"`) or existing binding object
 * into a canonical A2UI v1.0 `{"@path": "..."}` object.
 */
export function coercePathBinding(
  rawPathOrBinding: unknown,
  fallbackPath: string
): A2UIDataBinding {
  if (typeof rawPathOrBinding === 'string' && rawPathOrBinding.trim()) {
    return { '@path': rawPathOrBinding.trim() };
  }
  if (rawPathOrBinding && typeof rawPathOrBinding === 'object') {
    const obj = rawPathOrBinding as Record<string, unknown>;
    if (typeof obj['@path'] === 'string') {
      return { '@path': obj['@path'] };
    }
    if (typeof obj.path === 'string') {
      return { '@path': obj.path };
    }
  }
  return { '@path': fallbackPath };
}

/**
 * Coerces a shorthand action string or bare event object into a canonical A2UI v1.0 `A2UIAction`
 * (`04_action_string_coercion`).
 */
export function coerceMacroAction(
  rawAction: unknown,
  defaultEventName: string,
  defaultContext?: Record<string, A2UIDynamicValue>,
  defaultUserMessage?: A2UIDynamicString
): A2UIAction {
  if (typeof rawAction === 'string' && rawAction.trim()) {
    return {
      event: {
        name: rawAction.trim(),
        ...(defaultUserMessage ? { userMessage: defaultUserMessage } : {}),
        ...(defaultContext ? { context: defaultContext } : {}),
      },
    };
  }

  if (rawAction && typeof rawAction === 'object') {
    const obj = rawAction as Record<string, unknown>;
    if (obj.event && typeof obj.event === 'object') {
      const ev = obj.event as Record<string, unknown>;
      return {
        event: {
          name: typeof ev.name === 'string' ? ev.name : defaultEventName,
          ...(ev.userMessage !== undefined
            ? { userMessage: ev.userMessage as A2UIDynamicString }
            : defaultUserMessage
              ? { userMessage: defaultUserMessage }
              : {}),
          context:
            ev.context && typeof ev.context === 'object'
              ? {
                  ...defaultContext,
                  ...(ev.context as Record<string, A2UIDynamicValue>),
                }
              : defaultContext,
        },
      };
    }

    if (typeof obj.name === 'string') {
      return {
        event: {
          name: obj.name,
          ...(obj.userMessage !== undefined
            ? { userMessage: obj.userMessage as A2UIDynamicString }
            : defaultUserMessage
              ? { userMessage: defaultUserMessage }
              : {}),
          context:
            obj.context && typeof obj.context === 'object'
              ? {
                  ...defaultContext,
                  ...(obj.context as Record<string, A2UIDynamicValue>),
                }
              : defaultContext,
        },
      };
    }
  }

  return {
    event: {
      name: defaultEventName,
      ...(defaultUserMessage ? { userMessage: defaultUserMessage } : {}),
      ...(defaultContext ? { context: defaultContext } : {}),
    },
  };
}

/**
 * Coerces a single-child slot parameter (`ComponentId`), preserving external component references
 * (`02_slot_boundary_preservation`).
 */
export function coerceSlotComponentId(rawSlot: unknown): string | undefined {
  if (typeof rawSlot === 'string' && rawSlot.trim()) {
    return rawSlot.trim();
  }
  if (rawSlot && typeof rawSlot === 'object') {
    const obj = rawSlot as Record<string, unknown>;
    if (typeof obj.id === 'string' && obj.id.trim()) {
      return obj.id.trim();
    }
  }
  return undefined;
}

/**
 * Coerces a multi-child slot list parameter (`ChildList`), preserving external component references
 * (`03_multi_slot_list_coercion`).
 */
export function coerceSlotComponentList(rawList: unknown): string[] {
  if (!Array.isArray(rawList)) return [];
  const ids: string[] = [];
  for (const item of rawList) {
    const id = coerceSlotComponentId(item);
    if (id) ids.push(id);
  }
  return ids;
}

/**
 * TypeScript implementation of the A2UI `MacroExpander` & `MacroProcessor` transformer
 * (`conformance/agent/macros/macros.yaml` & `python/a2ui_agent/src/a2ui/transformers/macros/`),
 * upgraded for A2UI v1.0 (`version: "v1.0"` and `{"@path": "/..."}` bindings).
 */
export class A2UIMacroExpander {
  private readonly macros = new Map<string, A2UIMacroDefinition>();
  private readonly maxDepth: number;

  constructor(macros: A2UIMacroDefinition[] = [], options?: { maxDepth?: number }) {
    this.maxDepth = options?.maxDepth ?? 16;
    for (const macro of macros) {
      this.registerMacro(macro);
    }
  }

  registerMacro(macro: A2UIMacroDefinition): void {
    const cleanName = macro.name.replace(/^@macro:/i, '');
    this.macros.set(cleanName, { ...macro, name: cleanName });
  }

  getMacro(componentType: string): A2UIMacroDefinition | undefined {
    const cleanName = componentType.replace(/^@macro:/i, '');
    return this.macros.get(cleanName);
  }

  getRegisteredMacros(): A2UIMacroDefinition[] {
    return Array.from(this.macros.values());
  }

  /**
   * Transforms a base primitive catalog into an LLM inference catalog containing
   * synthesized JSON Schemas for all registered macros (`10_inference_catalog_schema_synthesis`,
   * `11_inference_catalog_with_passthrough_filtering`, `09_macro_name_collision_error`).
   */
  transformToInferenceCatalog(
    baseCatalog: InferenceCatalogSchema,
    options?: { passthroughComponents?: string[] }
  ): InferenceCatalogSchema {
    const baseComponents = baseCatalog.components ?? {};

    for (const macroName of this.macros.keys()) {
      if (macroName in baseComponents) {
        throw new A2UICatalogError(
          `Macro name '${macroName}' collides with an existing base catalog component.`
        );
      }
    }

    const filteredComponents: Record<string, Record<string, unknown>> = {};
    const passthroughSet = options?.passthroughComponents
      ? new Set(options.passthroughComponents)
      : null;

    for (const [compName, compSchema] of Object.entries(baseComponents)) {
      if (!passthroughSet || passthroughSet.has(compName)) {
        filteredComponents[compName] = structuredClone(compSchema);
      }
    }

    for (const [macroName, macro] of this.macros.entries()) {
      const properties: Record<string, unknown> = {
        id: { type: 'string', description: 'Unique UAX #31 component identifier' },
        component: { const: `@macro:${macroName}` },
      };
      const required: string[] = ['id', 'component'];

      for (const [paramName, paramSpec] of Object.entries(macro.parameters)) {
        properties[paramName] = this.mapParameterSpecToJsonSchema(paramSpec);
        if (paramSpec.required && paramSpec.defaultValue === undefined) {
          required.push(paramName);
        }
      }

      filteredComponents[macroName] = {
        type: 'object',
        description: macro.description,
        properties,
        required,
        additionalProperties: false,
      };
    }

    const oneOfRefs = Object.keys(filteredComponents).map((name) => ({
      $ref: `#/components/${name}`,
    }));

    return {
      ...baseCatalog,
      components: filteredComponents,
      $defs: {
        ...(baseCatalog.$defs ?? {}),
        anyComponent: {
          oneOf: oneOfRefs,
        },
      },
    };
  }

  private mapParameterSpecToJsonSchema(spec: MacroParameterSpec): Record<string, unknown> {
    const refMap: Record<string, string> = {
      DynamicString: 'common_types.json#/$defs/DynamicString',
      DynamicNumber: 'common_types.json#/$defs/DynamicNumber',
      DynamicBoolean: 'common_types.json#/$defs/DynamicBoolean',
      ComponentId: 'common_types.json#/$defs/ComponentId',
      ChildList: 'common_types.json#/$defs/ChildList',
      Action: 'common_types.json#/$defs/Action',
      CheckRuleList: 'common_types.json#/$defs/CheckRuleList',
      AccessibilityAttributes: 'common_types.json#/$defs/AccessibilityAttributes',
    };

    if (spec.type === 'enum') {
      return {
        type: 'string',
        enum: spec.enumValues ?? [],
        description: spec.description,
        ...(spec.defaultValue !== undefined ? { default: spec.defaultValue } : {}),
      };
    }

    if (spec.type in refMap) {
      return {
        $ref: refMap[spec.type],
        description: spec.description,
        ...(spec.defaultValue !== undefined ? { default: spec.defaultValue } : {}),
      };
    }

    return {
      type: spec.type,
      description: spec.description,
      ...(spec.defaultValue !== undefined ? { default: spec.defaultValue } : {}),
    };
  }

  /**
   * Expands a flat array of components that may contain macro instances into a pure
   * primitive/catalog component array in post-order, stitching each macro root to the
   * macro instance's `id`.
   */
  expandComponentList(
    components: A2UIComponentBase[],
    surfaceId = 'default'
  ): { components: A2UIComponentBase[]; report: MacroExpansionReport } {
    const traces: MacroExpansionTrace[] = [];

    const expandSingleComponent = (
      comp: A2UIComponentBase,
      depth: number,
      activeStack: Set<string>
    ): A2UIComponentBase[] => {
      if (depth > this.maxDepth) {
        throw new A2UIRecursionError(
          `Macro expansion exceeded maximum recursion depth of ${this.maxDepth} at component '${comp.id}'.`
        );
      }

      const macro = this.getMacro(comp.component);
      if (!macro) {
        return [comp];
      }

      if (activeStack.has(macro.name)) {
        throw new A2UIRecursionError(
          `Cyclic macro definition detected while expanding '${macro.name}' at component '${comp.id}'.`
        );
      }

      const nextStack = new Set(activeStack);
      nextStack.add(macro.name);

      // Apply default parameter values for omitted parameters (`06_parameter_defaults_and_overrides`)
      const resolvedParams: Record<string, unknown> = {};
      for (const [paramName, paramSpec] of Object.entries(macro.parameters)) {
        if (comp[paramName] !== undefined) {
          resolvedParams[paramName] = comp[paramName];
        } else if (paramSpec.defaultValue !== undefined) {
          resolvedParams[paramName] = structuredClone(paramSpec.defaultValue);
        }
      }
      // Also preserve any extra properties passed on the macro object
      for (const [key, val] of Object.entries(comp)) {
        if (key !== 'id' && key !== 'component' && !(key in resolvedParams)) {
          resolvedParams[key] = val;
        }
      }

      const allocator = new MacroIdAllocator(comp.id);
      const expansion = macro.expand(resolvedParams, {
        instanceId: comp.id,
        allocId: (type: string) => allocator.allocate(type),
      });

      // Stitch the macro root's ID to the macro instance's ID
      const stitchedRoot: A2UIComponentBase = {
        ...expansion.root,
        id: comp.id,
        ...(comp.weight !== undefined && expansion.root.weight === undefined
          ? { weight: comp.weight }
          : {}),
      };

      const rawPostOrder = [...expansion.children, stitchedRoot];
      const fullyExpanded: A2UIComponentBase[] = [];

      for (const node of rawPostOrder) {
        const subExpanded = expandSingleComponent(node, depth + 1, nextStack);
        fullyExpanded.push(...subExpanded);
      }

      traces.push({
        instanceId: comp.id,
        macroName: macro.name,
        rootComponentType: stitchedRoot.component,
        generatedIds: fullyExpanded.map((c) => c.id),
        preservedSlotIds: expansion.preservedSlotIds ?? [],
        rawMacroComponent: comp,
        expandedComponents: fullyExpanded,
      });

      return fullyExpanded;
    };

    const outputComponents: A2UIComponentBase[] = [];
    for (const comp of components) {
      const expanded = expandSingleComponent(comp, 0, new Set());
      outputComponents.push(...expanded);
    }

    const generatedComponentCount = traces.reduce(
      (sum, t) => sum + t.expandedComponents.length,
      0
    );

    return {
      components: outputComponents,
      report: {
        surfaceId,
        expandedMacroCount: traces.length,
        generatedComponentCount,
        totalOutputComponentCount: outputComponents.length,
        traces,
      },
    };
  }

  /**
   * Intercepts A2UI v1.0 `createSurface` and `updateComponents` envelopes and expands any
   * macro instances into standard v1.0 components (`14_end_to_end_envelope_transformation`,
   * `15_mixed_primitive_and_macro_envelope`).
   */
  transformMessage(message: A2UIv1Message): {
    message: A2UIv1Message;
    report: MacroExpansionReport | null;
  } {
    if ('createSurface' in message && Array.isArray(message.createSurface.components)) {
      const { components, report } = this.expandComponentList(
        message.createSurface.components,
        message.createSurface.surfaceId
      );
      return {
        message: {
          ...message,
          createSurface: {
            ...message.createSurface,
            components,
          },
        },
        report: report.expandedMacroCount > 0 ? report : null,
      };
    }

    if ('updateComponents' in message && Array.isArray(message.updateComponents.components)) {
      const { components, report } = this.expandComponentList(
        message.updateComponents.components,
        message.updateComponents.surfaceId
      );
      return {
        message: {
          ...message,
          updateComponents: {
            ...message.updateComponents,
            components,
          },
        },
        report: report.expandedMacroCount > 0 ? report : null,
      };
    }

    return { message, report: null };
  }
}

/**
 * Built-in FreshCart Grocery UI Macro Definitions showcasing all conformance features:
 * 1. `RecipeBundleCard` (`@macro:RecipeBundleCard`):
 *    - Parameterized recipe hero card with style selector, prep time pill, servings slider,
 *      and single-child slot boundary preservation (`headerSlot`).
 * 2. `MacroNutrientBar` (`@macro:MacroNutrientBar`):
 *    - Combines `NutritionSummary` with a multi-child slot list (`extraControlsSlot`) for dietary checkboxes.
 * 3. `SmartSwapRow` (`@macro:SmartSwapRow`):
 *    - Parameterized ingredient swap row with `@path` binding coercion, `@call: formatCurrency`,
 *      and shorthand action string coercion (`swapAction: "swap_macro_ingredient"`).
 * 4. `OneClickBundleFooter` (`@macro:OneClickBundleFooter`):
 *    - Reusable bundle checkout footer with total price badge, confirmation banner, and action coercion.
 */
export const FRESHCART_GROCERY_MACROS: A2UIMacroDefinition[] = [
  {
    name: 'RecipeBundleCard',
    description:
      'Reusable recipe kit header card macro with style selector, prep time badge, interactive servings slider, and an optional headerSlot for custom badges.',
    parameters: {
      titlePath: {
        type: 'DynamicString',
        description: 'JSON Pointer path or string for the recipe kit heading',
        defaultValue: { '@path': '/recipeTitle' },
      },
      subtitlePath: {
        type: 'DynamicString',
        description: 'JSON Pointer path or string for the recipe subtitle',
        defaultValue: { '@path': '/recipeSubtitle' },
      },
      prepBadgeText: {
        type: 'DynamicString',
        description: 'Prep time and chef curation callout text',
        defaultValue: '⏱️ 20-Min Chef Meal Kit · Fresh Local Ingredients',
      },
      stylePickerPath: {
        type: 'DynamicString',
        description: 'Data model path for the recipe style ChoicePicker',
        defaultValue: '/selectedKitStyle',
      },
      servingsPath: {
        type: 'DynamicNumber',
        description: 'Data model path for the interactive servings Slider',
        defaultValue: '/servings',
      },
      headerSlot: {
        type: 'ComponentId',
        description: 'Optional external component ID slotted into the top header row',
      },
    },
    expand: (params, { allocId }) => {
      const colId = allocId('Column');
      const topRowId = allocId('Row');
      const titleTextId = allocId('Text');
      const prepBadgeTextId = allocId('Text');
      const subtitleTextId = allocId('Text');
      const stylePickerId = allocId('ChoicePicker');
      const dividerId = allocId('Divider');
      const servingsSliderId = allocId('Slider');

      const slottedHeaderId = coerceSlotComponentId(params.headerSlot);
      const preservedSlotIds = slottedHeaderId ? [slottedHeaderId] : [];

      const topRowChildren = slottedHeaderId
        ? [prepBadgeTextId, slottedHeaderId]
        : [prepBadgeTextId];

      const styleOptions = Array.isArray(params.styleOptions)
        ? (params.styleOptions as Array<{ label: string; value: string }>)
        : [
            { label: 'Salmon & Herb Quinoa Kit', value: 'salmon-quinoa-kit' },
            { label: 'Artisan Pesto Pasta & Greens Kit', value: 'pesto-pasta-kit' },
          ];

      const children: A2UIComponentBase[] = [
        {
          id: prepBadgeTextId,
          component: 'Text',
          variant: 'caption',
          text: coerceMacroDynamicValue(
            params.prepBadgeText,
            '⏱️ 20-Min Chef Meal Kit · Fresh Local Ingredients'
          ),
        },
        {
          id: topRowId,
          component: 'Row',
          justify: 'spaceBetween',
          align: 'center',
          children: topRowChildren,
        },
        {
          id: titleTextId,
          component: 'Text',
          variant: 'body',
          text:
            typeof params.titlePath === 'string' && params.titlePath.startsWith('/')
              ? coercePathBinding(params.titlePath, '/recipeTitle')
              : coerceMacroDynamicValue(params.titlePath, { '@path': '/recipeTitle' }),
        },
        {
          id: subtitleTextId,
          component: 'Text',
          variant: 'caption',
          text:
            typeof params.subtitlePath === 'string' && params.subtitlePath.startsWith('/')
              ? coercePathBinding(params.subtitlePath, '/recipeSubtitle')
              : coerceMacroDynamicValue(params.subtitlePath, {
                  '@path': '/recipeSubtitle',
                }),
        },
        {
          id: stylePickerId,
          component: 'ChoicePicker',
          label: 'Select Chef Meal Kit',
          variant: 'mutuallyExclusive',
          displayStyle: 'chips',
          value: coercePathBinding(params.stylePickerPath, '/selectedKitStyle'),
          options: styleOptions,
        },
        {
          id: dividerId,
          component: 'Divider',
          axis: 'horizontal',
        },
        {
          id: servingsSliderId,
          component: 'Slider',
          label: 'Servings (automatically scales kit quantities & nutrition)',
          min: 1,
          max: 8,
          steps: 7,
          value: coercePathBinding(params.servingsPath, '/servings'),
        },
        {
          id: colId,
          component: 'Column',
          children: [
            topRowId,
            titleTextId,
            subtitleTextId,
            stylePickerId,
            dividerId,
            servingsSliderId,
          ],
        },
      ];

      const root: A2UIComponentBase = {
        id: 'placeholder_root',
        component: 'Card',
        child: colId,
      };

      return { children, root, preservedSlotIds };
    },
  },
  {
    name: 'MacroNutrientBar',
    description:
      'Parameterized nutrition & dietary filter macro that combines NutritionSummary with a multi-child slot list (extraControlsSlot) for dietary toggles.',
    parameters: {
      caloriesPath: {
        type: 'DynamicNumber',
        description: 'Data model path for calories per serving',
        defaultValue: '/nutrition/calories',
      },
      proteinPath: {
        type: 'DynamicNumber',
        description: 'Data model path for protein grams',
        defaultValue: '/nutrition/proteinGrams',
      },
      carbsPath: {
        type: 'DynamicNumber',
        description: 'Data model path for carbohydrate grams',
        defaultValue: '/nutrition/carbsGrams',
      },
      fatPath: {
        type: 'DynamicNumber',
        description: 'Data model path for fat grams',
        defaultValue: '/nutrition/fatGrams',
      },
      fiberPath: {
        type: 'DynamicNumber',
        description: 'Data model path for fiber grams',
        defaultValue: '/nutrition/fiberGrams',
      },
      servingsPath: {
        type: 'DynamicNumber',
        description: 'Data model path for servings count',
        defaultValue: '/servings',
      },
      dailyCalorieTargetPath: {
        type: 'DynamicNumber',
        description: 'Data model path for daily calorie target',
        defaultValue: '/nutrition/dailyCalorieTarget',
      },
      extraControlsSlot: {
        type: 'ChildList',
        description: 'External dietary control component IDs slotted into the bottom bar',
      },
    },
    expand: (params, { allocId }) => {
      const wrapperColId = allocId('Column');
      const nutritionWidgetId = allocId('NutritionSummary');
      const dietaryCardId = allocId('Card');
      const dietaryRowId = allocId('Row');

      const slotIds = coerceSlotComponentList(params.extraControlsSlot);

      const children: A2UIComponentBase[] = [
        {
          id: nutritionWidgetId,
          component: 'NutritionSummary',
          catalogId: FRESHCART_GROCERY_CATALOG_ID,
          calories: coercePathBinding(params.caloriesPath, '/nutrition/calories'),
          proteinGrams: coercePathBinding(params.proteinPath, '/nutrition/proteinGrams'),
          carbsGrams: coercePathBinding(params.carbsPath, '/nutrition/carbsGrams'),
          fatGrams: coercePathBinding(params.fatPath, '/nutrition/fatGrams'),
          fiberGrams: coercePathBinding(params.fiberPath, '/nutrition/fiberGrams'),
          servings: coercePathBinding(params.servingsPath, '/servings'),
          dailyCalorieTarget: coercePathBinding(
            params.dailyCalorieTargetPath,
            '/nutrition/dailyCalorieTarget'
          ),
        },
      ];

      const rootChildren = [nutritionWidgetId];

      if (slotIds.length > 0) {
        children.push(
          {
            id: dietaryRowId,
            component: 'Row',
            justify: 'spaceBetween',
            align: 'center',
            children: slotIds,
          },
          {
            id: dietaryCardId,
            component: 'Card',
            child: dietaryRowId,
          }
        );
        rootChildren.push(dietaryCardId);
      }

      const root: A2UIComponentBase = {
        id: wrapperColId,
        component: 'Column',
        children: rootChildren,
      };

      return {
        children,
        root,
        preservedSlotIds: slotIds,
      };
    },
  },
  {
    name: 'SmartSwapRow',
    description:
      'Reusable ingredient row macro with checkbox toggle, formatted line price, and 1-click organic/value swap button supporting action string coercion.',
    parameters: {
      itemIndex: {
        type: 'DynamicNumber',
        description: '0-based index of the ingredient in `/ingredients`',
        required: true,
      },
      namePath: {
        type: 'DynamicString',
        description: 'Data model path for ingredient display name',
        required: true,
      },
      unitPath: {
        type: 'DynamicString',
        description: 'Data model path for scaled quantity & unit description',
        required: true,
      },
      pricePath: {
        type: 'DynamicNumber',
        description: 'Data model path for scaled line price',
        required: true,
      },
      checkedPath: {
        type: 'DynamicBoolean',
        description: 'Data model path for whether the ingredient is included',
        required: true,
      },
      swapLabelPath: {
        type: 'DynamicString',
        description: 'Data model path for the swap button label',
        defaultValue: 'Swap Organic',
      },
      swapAction: {
        type: 'Action',
        description: 'Action event name string or object triggered when swapping this ingredient',
        defaultValue: 'swap_macro_ingredient',
      },
    },
    expand: (params, { allocId }) => {
      const leftColId = allocId('Column');
      const checkboxId = allocId('CheckBox');
      const unitTextId = allocId('Text');
      const rightRowId = allocId('Row');
      const priceTextId = allocId('Text');
      const swapBtnId = allocId('Button');
      const swapBtnLabelId = allocId('Text');

      const idx = typeof params.itemIndex === 'number' ? params.itemIndex : 0;
      const basePath = `/ingredients/${idx}`;

      const nameBinding = coercePathBinding(params.namePath, `${basePath}/name`);
      const unitBinding = coercePathBinding(params.unitPath, `${basePath}/unit`);
      const priceBinding = coercePathBinding(params.pricePath, `${basePath}/price`);
      const checkedBinding = coercePathBinding(params.checkedPath, `${basePath}/checked`);
      const swapLabelBinding =
        typeof params.swapLabelPath === 'string' && params.swapLabelPath.startsWith('/')
          ? coercePathBinding(params.swapLabelPath, `${basePath}/swapLabel`)
          : coerceMacroDynamicValue(params.swapLabelPath, {
              '@path': `${basePath}/swapLabel`,
            });

      const actionObj = coerceMacroAction(
        params.swapAction,
        'swap_macro_ingredient',
        {
          index: idx,
          productId: { '@path': `${basePath}/productId` },
          swapProductId: { '@path': `${basePath}/swapProductId` },
          currentName: nameBinding,
        },
        `Swap kit ingredient #${idx + 1}`
      );

      const children: A2UIComponentBase[] = [
        {
          id: checkboxId,
          component: 'CheckBox',
          label: nameBinding,
          value: checkedBinding,
        },
        {
          id: unitTextId,
          component: 'Text',
          variant: 'caption',
          text: unitBinding,
        },
        {
          id: leftColId,
          component: 'Column',
          weight: 1,
          children: [checkboxId, unitTextId],
        },
        {
          id: priceTextId,
          component: 'Text',
          variant: 'body',
          text: {
            '@call': 'formatCurrency',
            args: {
              value: priceBinding,
              currency: 'USD',
            },
          },
        },
        {
          id: swapBtnLabelId,
          component: 'Text',
          variant: 'caption',
          text: swapLabelBinding,
        },
        {
          id: swapBtnId,
          component: 'Button',
          variant: 'default',
          child: swapBtnLabelId,
          action: actionObj,
        },
        {
          id: rightRowId,
          component: 'Row',
          justify: 'end',
          align: 'center',
          children: [priceTextId, swapBtnId],
        },
      ];

      const root: A2UIComponentBase = {
        id: 'placeholder_swap_row',
        component: 'Row',
        justify: 'spaceBetween',
        align: 'center',
        children: [leftColId, rightRowId],
      };

      return { children, root };
    },
  },
  {
    name: 'OneClickBundleFooter',
    description:
      'Reusable meal kit checkout footer macro with formatted bundle total, live status confirmation, and primary CTA button.',
    parameters: {
      totalLabel: {
        type: 'DynamicString',
        description: 'Label for the estimated bundle total',
        defaultValue: '**Chef Kit Total**',
      },
      totalValuePath: {
        type: 'DynamicNumber',
        description: 'Data model path for total price',
        defaultValue: '/estimatedTotal',
      },
      statusTextPath: {
        type: 'DynamicString',
        description: 'Data model path for confirmation status text',
        defaultValue: '/lastActionConfirmation',
      },
      ctaLabel: {
        type: 'DynamicString',
        description: 'Text label for the primary Add to Cart button',
        defaultValue: 'Add Complete Chef Kit to Cart',
      },
      ctaAction: {
        type: 'Action',
        description: 'Action string or object for adding the bundle to the shopping cart',
        defaultValue: 'add_recipe_bundle_to_cart',
      },
    },
    expand: (params, { allocId }) => {
      const colId = allocId('Column');
      const totalsRowId = allocId('Row');
      const totalLabelId = allocId('Text');
      const totalValueId = allocId('Text');
      const statusTextId = allocId('Text');
      const ctaBtnId = allocId('Button');
      const ctaBtnLabelId = allocId('Text');

      const totalBinding = coercePathBinding(params.totalValuePath, '/estimatedTotal');
      const statusBinding = coercePathBinding(params.statusTextPath, '/lastActionConfirmation');

      const actionObj = coerceMacroAction(
        params.ctaAction,
        'add_recipe_bundle_to_cart',
        {
          servings: { '@path': '/servings' },
          recipeTitle: { '@path': '/recipeTitle' },
          ingredients: { '@path': '/ingredients' },
          estimatedTotal: totalBinding,
        },
        'Add Chef Meal Kit to FreshCart'
      );

      const children: A2UIComponentBase[] = [
        {
          id: totalLabelId,
          component: 'Text',
          variant: 'body',
          text: coerceMacroDynamicValue(params.totalLabel, '**Chef Kit Total**'),
        },
        {
          id: totalValueId,
          component: 'Text',
          variant: 'body',
          text: {
            '@call': 'formatCurrency',
            args: {
              value: totalBinding,
              currency: 'USD',
            },
          },
        },
        {
          id: totalsRowId,
          component: 'Row',
          justify: 'spaceBetween',
          align: 'center',
          children: [totalLabelId, totalValueId],
        },
        {
          id: statusTextId,
          component: 'Text',
          variant: 'caption',
          text: statusBinding,
        },
        {
          id: ctaBtnLabelId,
          component: 'Text',
          variant: 'body',
          text: coerceMacroDynamicValue(
            params.ctaLabel,
            'Add Complete Chef Kit to Cart'
          ),
        },
        {
          id: ctaBtnId,
          component: 'Button',
          variant: 'primary',
          child: ctaBtnLabelId,
          action: actionObj,
        },
        {
          id: colId,
          component: 'Column',
          children: [totalsRowId, statusTextId, ctaBtnId],
        },
      ];

      const root: A2UIComponentBase = {
        id: 'placeholder_footer_card',
        component: 'Card',
        child: colId,
      };

      return { children, root };
    },
  },
];

/**
 * Singleton FreshCart MacroExpander pre-registered with the 4 Grocery UI Macros.
 */
export const freshCartMacroExpander = new A2UIMacroExpander(FRESHCART_GROCERY_MACROS);

/**
 * Convenience helper used by `SurfaceManager.ts` to transparently expand any A2UI v1.0
 * message containing macro components before rendering and returns any expansion report.
 */
export function expandFreshCartMacrosInMessage(message: A2UIv1Message): {
  message: A2UIv1Message;
  report: MacroExpansionReport | null;
} {
  return freshCartMacroExpander.transformMessage(message);
}

/**
 * Synthesizes the augmented FreshCart + Macros inference catalog for LLM system prompts
 * and interactive inspection.
 */
export function getFreshCartMacroInferenceCatalog(): InferenceCatalogSchema {
  return freshCartMacroExpander.transformToInferenceCatalog({
    catalogId: A2UI_BASIC_CATALOG_ID,
    components: {
      Column: { type: 'object', description: 'Vertical layout container' },
      Row: { type: 'object', description: 'Horizontal layout container' },
      Card: { type: 'object', description: 'Surface card container' },
      Text: { type: 'object', description: 'Typography text node' },
      Button: { type: 'object', description: 'Interactive action button' },
      CheckBox: { type: 'object', description: 'Boolean checkbox control' },
      Slider: { type: 'object', description: 'Numeric range slider control' },
      ChoicePicker: { type: 'object', description: 'Single or multi-select chip picker' },
      Divider: { type: 'object', description: 'Visual divider line' },
      ProductDealCard: { type: 'object', description: 'FreshCart product deal card' },
      NutritionSummary: { type: 'object', description: 'FreshCart macro nutrition summary' },
    },
  });
}
