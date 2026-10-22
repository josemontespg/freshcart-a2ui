import { z } from 'zod';
import {
  ActionSchema,
  Catalog,
  type CatalogInterface,
  type ComponentApi,
  DynamicBooleanSchema,
  DynamicNumberSchema,
  DynamicStringSchema,
  type FunctionApi,
  basicCatalog,
} from '@a2ui/web_core/v1_0';
import {
  A2UI_BASIC_CATALOG_ID,
  FRESHCART_GROCERY_CATALOG_ID,
} from '../types/a2ui-v1';

/**
 * Canonical Basic v1.0 catalog instructions from `catalogs/basic/v1/catalog.json`.
 *
 * Workaround for BUG-03 in `@a2ui/web_core@0.14.0`: `basicCatalog` in
 * `@a2ui/web_core/v1_0` is instantiated without `options.instructions`, leaving
 * `basicCatalog.instructions === undefined` and dropping the `## Catalog Guidelines`
 * block during `basicCatalog.toJson()` and `SkillGenerator` compilation.
 */
export const BASIC_CATALOG_V1_INSTRUCTIONS = `For layout, use the Row and Column components to organize other components. Wait to create a component until its children are defined.
Use Card to group related information nicely.

## Catalog Guidelines
- Always create a root component with \`id: "root"\` (typically a \`Column\` or \`Card\`).
- Bind interactive input components (\`Slider\`, \`CheckBox\`, \`ChoicePicker\`, \`TextField\`) to the surface data model using \`{"@path": "/json/pointer"}\`.
- Use \`List\` with \`children: {"componentId": "row_template", "path": "/items"}\` for repeating collections, and reference item fields using relative paths (\`{"@path": "name"}\`) and 1-based numbers using \`{"@call": "@index", "args": {"offset": 1}}\`.`;

export const GROCERY_CATALOG_V1_INSTRUCTIONS = `Use FreshCart's custom Grocery Catalog components (\`ProductDealCard\` and \`NutritionSummary\`) alongside the A2UI v1.0 Basic Catalog whenever presenting grocery SKUs, smart-swap savings, chef pairings, or per-serving nutritional macro breakdowns.

## Grocery Catalog Guidelines
- Use \`ProductDealCard\` to showcase a featured store SKU, smart substitution, or chef pairing with live savings badges (\`badgeText\`, \`price\`, \`originalPrice\`, \`savingsAmount\`) and a one-click cart action (\`action\`).
- Use \`NutritionSummary\` to render a visual macro bar and calorie breakdown (\`calories\`, \`proteinGrams\`, \`carbsGrams\`, \`fatGrams\`, \`fiberGrams\`, \`servings\`, \`dailyCalorieTarget\`) bound to \`{"@path": "/nutrition/..."}\`.
- Always include \`"catalogId": "${FRESHCART_GROCERY_CATALOG_ID}"\` on custom grocery components when mixing them into a surface.`;

/**
 * Custom Grocery Component 1: `ProductDealCard`
 * Defined with `@a2ui/web_core/v1_0` Zod schemas so `Catalog.toJson()` and
 * `Catalog.validationSchema` serialize its properties into JSON Schema automatically.
 */
export const ProductDealCardComponentApi: ComponentApi = {
  name: 'ProductDealCard',
  schema: z
    .object({
      weight: z.number().optional().describe('Flex grow weight inside a Row or Column.'),
      productId: DynamicStringSchema.describe('Store SKU identifier (e.g., "prod-salmon-fillet").'),
      title: DynamicStringSchema.optional().describe('Display name of the grocery product.'),
      originalName: DynamicStringSchema.optional().describe('Replaced product name when used for a smart swap.'),
      reason: DynamicStringSchema.optional().describe('Chef note or savings explanation shown on the card.'),
      unit: DynamicStringSchema.optional().describe('Package size or unit label (e.g., "16 oz bag").'),
      badgeText: DynamicStringSchema.optional().describe('Top highlight pill text (e.g., "Chef Pairing · Save $3.00").'),
      imageUrl: DynamicStringSchema.optional().describe('Product thumbnail URL.'),
      price: DynamicNumberSchema.optional().describe('Current deal or SKU price in USD.'),
      originalPrice: DynamicNumberSchema.optional().describe('Regular price in USD before savings.'),
      savingsAmount: DynamicNumberSchema.optional().describe('Explicit dollar savings amount.'),
      applied: DynamicBooleanSchema.optional().describe('Whether this deal or swap has been added to the cart.'),
      actionLabel: DynamicStringSchema.optional().describe('CTA button text (e.g., "Add Pairing to Cart").'),
      action: ActionSchema.optional().describe('Action dispatched when the shopper clicks the deal CTA button.'),
    })
    .passthrough()
    .describe(
      'Renders a FreshCart grocery deal, chef pairing, or smart-swap card with live savings badge, price comparison, and one-click cart action.'
    ),
};

/**
 * Custom Grocery Component 2: `NutritionSummary`
 * Defined with `@a2ui/web_core/v1_0` Zod schemas so `Catalog.toJson()` and
 * `Catalog.validationSchema` serialize its properties into JSON Schema automatically.
 */
export const NutritionSummaryComponentApi: ComponentApi = {
  name: 'NutritionSummary',
  schema: z
    .object({
      weight: z.number().optional().describe('Flex grow weight inside a Row or Column.'),
      title: DynamicStringSchema.optional().describe('Header title (defaults to "Nutrition per Serving").'),
      calories: DynamicNumberSchema.describe('Calories per serving.'),
      proteinGrams: DynamicNumberSchema.describe('Protein in grams per serving.'),
      carbsGrams: DynamicNumberSchema.describe('Carbohydrates in grams per serving.'),
      fatGrams: DynamicNumberSchema.describe('Total fat in grams per serving.'),
      fiberGrams: DynamicNumberSchema.optional().describe('Dietary fiber in grams per serving.'),
      servings: DynamicNumberSchema.optional().describe('Number of servings in the meal plan or bundle.'),
      dailyCalorieTarget: DynamicNumberSchema.optional().describe('Daily calorie benchmark (defaults to 2000).'),
    })
    .passthrough()
    .describe(
      'Renders an interactive FreshCart nutrition and macronutrient breakdown card with stacked protein/carbs/fat proportion bars.'
    ),
};

/**
 * Patched A2UI v1.0 Basic Catalog carrying its canonical `instructions` metadata.
 */
export const patchedBasicCatalog = new Catalog(
  basicCatalog.id || A2UI_BASIC_CATALOG_ID,
  '1.0',
  Array.from(basicCatalog.components.values()),
  Array.from(basicCatalog.functions.values()),
  {
    title: 'A2UI Basic Catalog (v1.0)',
    description:
      'Standard A2UI v1.0 Basic Component & Function Catalog (18 components, 15 functions).',
    instructions: BASIC_CATALOG_V1_INSTRUCTIONS,
  }
);

/**
 * Domain-specific FreshCart Grocery Extension Catalog (`ProductDealCard`, `NutritionSummary`).
 */
export const freshCartGroceryExtensionCatalog = new Catalog(
  FRESHCART_GROCERY_CATALOG_ID,
  '1.0',
  [ProductDealCardComponentApi, NutritionSummaryComponentApi],
  [],
  {
    title: 'FreshCart Grocery Domain Catalog (v1.0)',
    description:
      'Custom grocery merchandising, smart-swap deal cards, and nutritional macro visualization components for FreshCart.',
    instructions: GROCERY_CATALOG_V1_INSTRUCTIONS,
  }
);

/**
 * Unified FreshCart + A2UI v1.0 Catalog combining all 18 Basic components,
 * 2 custom Grocery components (`ProductDealCard`, `NutritionSummary`), and 15 functions.
 */
export const unifiedFreshCartCatalog = new Catalog(
  FRESHCART_GROCERY_CATALOG_ID,
  '1.0',
  [
    ...Array.from(basicCatalog.components.values()),
    ProductDealCardComponentApi,
    NutritionSummaryComponentApi,
  ],
  Array.from(basicCatalog.functions.values()),
  {
    title: 'FreshCart Unified A2UI v1.0 Catalog (Basic + Grocery)',
    description:
      'Complete FreshCart A2UI v1.0 catalog combining the 18 standard Basic components, 15 built-in functions, and 2 custom Grocery components (ProductDealCard, NutritionSummary).',
    instructions: `${BASIC_CATALOG_V1_INSTRUCTIONS}\n\n${GROCERY_CATALOG_V1_INSTRUCTIONS}`,
  }
);

export type SkillInferenceFormat = 'direct_json' | 'express';

export interface CatalogLike {
  readonly id?: string;
  readonly catalog_id?: string;
  readonly catalogId?: string;
  readonly protocolVersion?: string;
  readonly title?: string;
  readonly description?: string;
  readonly instructions?: string;
  readonly components?: ReadonlyMap<string, ComponentApi>;
  readonly functions?: ReadonlyMap<string, FunctionApi>;
  toJson?: () => Record<string, unknown>;
}

export function getCatalogIdString(
  catalog?: CatalogInterface | CatalogLike | null,
  fallback: string = A2UI_BASIC_CATALOG_ID
): string {
  if (!catalog) return fallback;
  const rec = catalog as unknown as Record<string, unknown>;
  const raw = rec.id ?? rec.catalog_id ?? rec.catalogId;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : fallback;
}

/**
 * Extracts a clean, URL-safe, lowercase hyphenated identifier from a catalog's ID.
 *
 * Implements `clean_catalog_name(catalog)` from `blueprints/features/skill_generator.blueprint.md`
 * while fixing BUG-05: checks both `catalog.id` (used by TypeScript `@a2ui/web_core` `Catalog`)
 * and `catalog.catalog_id` (used by Python `a2ui-agent`).
 */
export function cleanCatalogName(
  catalog?: CatalogInterface | CatalogLike | null
): string {
  if (!catalog) return 'basic';
  const rawId = getCatalogIdString(catalog, 'basic');

  const trimmed = String(rawId)
    .replace(/\.json$/i, '')
    .replace(/\/catalog$/i, '');

  const segments = trimmed
    .split(/[/:?#]+/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 0 &&
        !/^https?$/i.test(s) &&
        !/^v?\d+([._]\d+)*$/i.test(s) &&
        s.toLowerCase() !== 'catalogs' &&
        s.toLowerCase() !== 'specification' &&
        s.toLowerCase() !== 'a2ui.org' &&
        s.toLowerCase() !== 'freshcart.app'
    );

  const chosen = segments[segments.length - 1] || 'basic';
  const cleaned = chosen
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleaned || 'basic';
}

/**
 * Immutable data representation of an Agent Skill (`SKILL.md`).
 *
 * Implements the `Skill` specification from `blueprints/features/skill_generator.blueprint.md`,
 * missing from `@a2ui/agent@0.0.1` (BUG-01).
 */
export class Skill {
  public readonly name: string;
  public readonly description: string;
  public readonly content: string;
  public readonly metadata: Readonly<Record<string, string>>;

  constructor(params: {
    name: string;
    description: string;
    content: string;
    metadata?: Record<string, string>;
  }) {
    this.name = params.name;
    this.description = params.description;
    this.content = params.content;
    this.metadata = Object.freeze({ ...(params.metadata ?? {}) });
  }

  /**
   * Relative skill file path (`"{name}/SKILL.md"`).
   */
  public get filename(): string {
    return `${this.name}/SKILL.md`;
  }

  /**
   * Remote agent workspace path convention (`.agents/skills/{name}/SKILL.md`).
   */
  public get agentWorkspacePath(): string {
    return `.agents/skills/${this.filename}`;
  }

  /**
   * Compiles the YAML frontmatter (`name`, `description`, optional `metadata`)
   * and Markdown body into a standard `SKILL.md` document.
   */
  public toMarkdown(): string {
    const lines: string[] = ['---'];
    lines.push(`name: ${this.name}`);
    lines.push(`description: ${this.description}`);

    const metaEntries = Object.entries(this.metadata);
    if (metaEntries.length > 0) {
      lines.push('metadata:');
      for (const [k, v] of metaEntries) {
        lines.push(`  ${k}: ${JSON.stringify(v)}`);
      }
    }

    lines.push('---');
    lines.push('');
    lines.push(this.content.trim());
    lines.push('');
    return lines.join('\n');
  }
}

/**
 * Collection class for managing, querying, and exporting multiple `Skill` instances.
 *
 * Implements `SkillSet` from `blueprints/features/skill_generator.blueprint.md`,
 * including 3-tier resolution (`get(query)` by exact filename, exact name, or
 * substring match when `query.length >= 3`).
 */
export class SkillSet {
  private readonly _skills: Skill[] = [];

  constructor(initialSkills: Iterable<Skill> = []) {
    for (const s of initialSkills) {
      this._skills.push(s);
    }
  }

  public get skills(): readonly Skill[] {
    return this._skills;
  }

  public add(skill: Skill): void {
    const existingIdx = this._skills.findIndex((s) => s.name === skill.name);
    if (existingIdx >= 0) {
      this._skills[existingIdx] = skill;
    } else {
      this._skills.push(skill);
    }
  }

  /**
   * 3-tier skill lookup per `conformance/agent/skill.yaml`:
   * 1. Exact filename match (e.g., `"a2ui-core/SKILL.md"`)
   * 2. Exact skill name match (e.g., `"a2ui-core"`)
   * 3. Substring match on `skill.name` if `query.length >= 3` (e.g., `"basic"` -> `"a2ui-basic"`)
   */
  public get(query: string): Skill | undefined {
    if (!query) return undefined;

    const exactFilename = this._skills.find((s) => s.filename === query);
    if (exactFilename) return exactFilename;

    const exactName = this._skills.find((s) => s.name === query);
    if (exactName) return exactName;

    if (query.length >= 3) {
      return this._skills.find((s) => s.name.includes(query));
    }

    return undefined;
  }

  /**
   * Serializes the SkillSet into a dictionary mapping `skill.filename` -> `skill.toMarkdown()`.
   */
  public toDict(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const skill of this._skills) {
      out[skill.filename] = skill.toMarkdown();
    }
    return out;
  }
}

/**
 * Decomposed `PromptGenerator` interface per Requirement 1 of
 * `blueprints/features/skill_generator.blueprint.md`.
 */
export interface DecomposedPromptGenerator {
  readonly formatName: SkillInferenceFormat;
  generateBaseRules(): string;
  generateCatalogInstructions(catalog?: CatalogInterface | CatalogLike): string;
  generateExamples(catalog?: CatalogInterface | CatalogLike): string;
  generate(options?: {
    catalog?: CatalogInterface | CatalogLike;
    examples?: string;
    systemInstruction?: string;
  }): string;
}

/**
 * Formats a compact, readable component & function reference from a `Catalog.toJson()` schema.
 */
function formatCatalogSchemaReference(
  catalog: CatalogInterface | CatalogLike,
  formatName: SkillInferenceFormat
): string {
  const rawDoc =
    typeof catalog.toJson === 'function' ? catalog.toJson() : {};
  const catalogId =
    (typeof rawDoc.catalogId === 'string' && rawDoc.catalogId) ||
    getCatalogIdString(catalog, A2UI_BASIC_CATALOG_ID);
  const version =
    (typeof rawDoc.protocolVersion === 'string' && rawDoc.protocolVersion) ||
    catalog.protocolVersion ||
    '1.0';

  const sections: string[] = [];
  sections.push(`- **Catalog ID**: \`${catalogId}\``);
  sections.push(`- **Protocol Version**: \`v${String(version).replace(/^v/, '')}\``);

  const componentsObj =
    typeof rawDoc.components === 'object' && rawDoc.components !== null
      ? (rawDoc.components as Record<string, Record<string, unknown>>)
      : {};
  const componentNames = Object.keys(componentsObj);

  if (componentNames.length > 0) {
    sections.push('');
    sections.push(`### Registered Components (${componentNames.length})`);
    sections.push('');
    for (const compName of componentNames) {
      const compSchema = componentsObj[compName] ?? {};
      const desc =
        typeof compSchema.description === 'string'
          ? compSchema.description
          : `A2UI v1.0 \`${compName}\` component.`;

      // Extract property keys from direct `properties` or `allOf[*].properties`
      const propKeys = new Set<string>(['id', 'component']);
      const requiredKeys = new Set<string>(['id', 'component']);

      const collectProps = (node: Record<string, unknown>) => {
        if (typeof node.properties === 'object' && node.properties !== null) {
          for (const k of Object.keys(node.properties as Record<string, unknown>)) {
            propKeys.add(k);
          }
        }
        if (Array.isArray(node.required)) {
          for (const r of node.required) {
            if (typeof r === 'string') requiredKeys.add(r);
          }
        }
        if (Array.isArray(node.allOf)) {
          for (const sub of node.allOf) {
            if (typeof sub === 'object' && sub !== null) {
              collectProps(sub as Record<string, unknown>);
            }
          }
        }
      };
      collectProps(compSchema);

      const propList = Array.from(propKeys)
        .map((k) => (requiredKeys.has(k) ? `\`${k}*\`` : `\`${k}\``))
        .join(', ');

      if (formatName === 'express') {
        sections.push(`- **\`${compName}(...)\`**: ${desc} *(Props: ${propList})*`);
      } else {
        sections.push(`- **\`"${compName}"\`**: ${desc} *(Props: ${propList})*`);
      }
    }
  }

  const functionsRaw = rawDoc.functions;
  const functionNames: string[] = [];
  if (Array.isArray(functionsRaw)) {
    for (const fn of functionsRaw) {
      if (typeof fn === 'object' && fn !== null && typeof (fn as Record<string, unknown>).name === 'string') {
        functionNames.push((fn as Record<string, unknown>).name as string);
      }
    }
  } else if (typeof functionsRaw === 'object' && functionsRaw !== null) {
    functionNames.push(...Object.keys(functionsRaw as Record<string, unknown>));
  }

  if (functionNames.length > 0) {
    sections.push('');
    sections.push(`### Built-in Functions (${functionNames.length})`);
    sections.push('');
    sections.push(
      functionNames.map((fn) => `\`${fn}\``).join(', ')
    );
  }

  const instructions =
    (typeof rawDoc.instructions === 'string' && rawDoc.instructions) ||
    catalog.instructions;
  if (instructions) {
    sections.push('');
    sections.push(instructions.trim());
  }

  return sections.join('\n');
}

/**
 * `DirectJsonSkillPromptGenerator` — Decomposed `PromptGenerator` for `direct_json` A2UI v1.0 wire envelopes.
 *
 * Completely catalog-agnostic in `generateBaseRules()` (avoiding BUG-02 where
 * `ExpressPromptGenerator` hardcoded `Card(...)` inside base rules).
 */
export class DirectJsonSkillPromptGenerator implements DecomposedPromptGenerator {
  public readonly formatName: SkillInferenceFormat = 'direct_json';

  public generateBaseRules(): string {
    return `## A2UI v1.0 Core Wire Protocol Rules (direct_json)

You are an A2UI v1.0 Generative UI Agent. Output valid A2UI v1.0 JSON envelopes using the flat adjacency-list component model and JSON Pointer data bindings:

1. **Envelope Types (\`version: "v1.0"\`)**:
   - \`createSurface\`: Initializes a target \`surfaceId\`, declares \`catalogId\`, sets \`sendDataModel: true\`, and optionally seeds initial \`components\` and \`dataModel\`.
   - \`updateComponents\`: Streams a flat array of components (\`components: [{ "id": "root", "component": "...", ... }]\`). Never nest component objects inside \`children\`; always reference child component IDs by string!
   - \`updateDataModel\`: Updates the reactive JSON data model at \`path\` (default \`"/"\`) with \`value\`.
2. **Flat Adjacency-List Topology & UAX #31 IDs**:
   - Every surface MUST include a component with \`"id": "root"\`.
   - All component \`id\` strings MUST use valid UAX #31 alphanumeric/underscore identifiers (e.g., \`"root"\`, \`"header_card"\`, \`"servings_slider"\` — no hyphens or spaces).
3. **Reactive Data Bindings (\`{"@path": "..."}\`) & Function Calls (\`{"@call": "..."}\`)**:
   - Bind component properties to the surface data model using \`{"@path": "/json/pointer"}\`.
   - Inside a repeating \`List\` template (\`children: {"componentId": "item_row", "path": "/items"}\`), use relative paths (\`{"@path": "name"}\`, \`{"@path": "price"}\`) and 1-based item indices via \`{"@call": "@index", "args": {"offset": 1}}\`.
   - Format prices with \`{"@call": "formatCurrency", "args": {"value": {"@path": "price"}, "currency": "USD"}}\`.`;
  }

  public generateCatalogInstructions(catalog?: CatalogInterface | CatalogLike): string {
    const targetCatalog = catalog ?? unifiedFreshCartCatalog;
    const slug = cleanCatalogName(targetCatalog);
    const header = `## Component & Function Catalog (\`a2ui-${slug}\`)`;
    return `${header}\n\n${formatCatalogSchemaReference(targetCatalog, 'direct_json')}`;
  }

  public generateExamples(catalog?: CatalogInterface | CatalogLike): string {
    const slug = cleanCatalogName(catalog);
    if (slug.includes('grocery')) {
      return `\`\`\`json
[
  {
    "version": "v1.0",
    "createSurface": {
      "surfaceId": "meal-planner-surface",
      "catalogId": "${FRESHCART_GROCERY_CATALOG_ID}",
      "sendDataModel": true
    }
  },
  {
    "version": "v1.0",
    "updateComponents": {
      "surfaceId": "meal-planner-surface",
      "components": [
        {
          "id": "root",
          "component": "Column",
          "children": ["nutrition_widget", "featured_deal"]
        },
        {
          "id": "nutrition_widget",
          "component": "NutritionSummary",
          "catalogId": "${FRESHCART_GROCERY_CATALOG_ID}",
          "calories": { "@path": "/nutrition/calories" },
          "proteinGrams": { "@path": "/nutrition/proteinGrams" },
          "carbsGrams": { "@path": "/nutrition/carbsGrams" },
          "fatGrams": { "@path": "/nutrition/fatGrams" },
          "fiberGrams": { "@path": "/nutrition/fiberGrams" },
          "servings": { "@path": "/servings" }
        },
        {
          "id": "featured_deal",
          "component": "ProductDealCard",
          "catalogId": "${FRESHCART_GROCERY_CATALOG_ID}",
          "productId": { "@path": "/featuredPairing/productId" },
          "title": { "@path": "/featuredPairing/title" },
          "price": { "@path": "/featuredPairing/price" },
          "originalPrice": { "@path": "/featuredPairing/originalPrice" },
          "badgeText": { "@path": "/featuredPairing/badgeText" },
          "actionLabel": "Add Pairing to Cart",
          "action": {
            "event": {
              "name": "add_pairing_item",
              "context": {
                "productId": { "@path": "/featuredPairing/productId" },
                "quantity": 1
              }
            }
          }
        }
      ]
    }
  }
]
\`\`\``;
    }

    return `\`\`\`json
[
  {
    "version": "v1.0",
    "createSurface": {
      "surfaceId": "main-surface",
      "catalogId": "${A2UI_BASIC_CATALOG_ID}",
      "sendDataModel": true
    }
  },
  {
    "version": "v1.0",
    "updateComponents": {
      "surfaceId": "main-surface",
      "components": [
        { "id": "root", "component": "Card", "child": "body_col" },
        { "id": "body_col", "component": "Column", "children": ["headline_text"] },
        { "id": "headline_text", "component": "Text", "variant": "body", "text": { "@path": "/headline" } }
      ]
    }
  },
  {
    "version": "v1.0",
    "updateDataModel": {
      "surfaceId": "main-surface",
      "path": "/",
      "value": { "headline": "### FreshCart Seasonal Selection" }
    }
  }
]
\`\`\``;
  }

  public generate(options?: {
    catalog?: CatalogInterface | CatalogLike;
    examples?: string;
    systemInstruction?: string;
  }): string {
    const parts: string[] = [];
    if (options?.systemInstruction) {
      parts.push(options.systemInstruction.trim());
    }
    parts.push(this.generateBaseRules());
    parts.push(this.generateCatalogInstructions(options?.catalog));
    const ex = options?.examples ?? this.generateExamples(options?.catalog);
    if (ex) {
      parts.push(`### Examples:\n\n${ex}`);
    }
    return parts.join('\n\n');
  }
}

/**
 * `ExpressSkillPromptGenerator` — Decomposed `PromptGenerator` for the `express` DSL format.
 */
export class ExpressSkillPromptGenerator implements DecomposedPromptGenerator {
  public readonly formatName: SkillInferenceFormat = 'express';

  public generateBaseRules(): string {
    return `## A2UI Express DSL Core Syntax Rules

1. **Root Assignment**: Every A2UI Express block MUST assign a top-level component to \`root = <Component>(...)\`.
2. **Data Bindings & Reactive State**:
   - Reference JSON Pointer paths in the surface data model with \`path("/json/pointer")\`.
   - Invoke catalog functions with \`call("formatCurrency", value=path("price"), currency="USD")\`.
3. **Initial Data Model**:
   - Declare initial surface state in a \`data_model = { ... }\` block following the component tree.`;
  }

  public generateCatalogInstructions(catalog?: CatalogInterface | CatalogLike): string {
    const targetCatalog = catalog ?? patchedBasicCatalog;
    const slug = cleanCatalogName(targetCatalog);
    return `## Express Catalog Constructors (\`a2ui-${slug}\`)\n\n${formatCatalogSchemaReference(targetCatalog, 'express')}`;
  }

  public generateExamples(catalog?: CatalogInterface | CatalogLike): string {
    const slug = cleanCatalogName(catalog);
    if (slug.includes('grocery')) {
      return `\`\`\`python
root = Column(
  children=[
    NutritionSummary(
      calories=path("/nutrition/calories"),
      proteinGrams=path("/nutrition/proteinGrams"),
      carbsGrams=path("/nutrition/carbsGrams"),
      fatGrams=path("/nutrition/fatGrams"),
      servings=path("/servings"),
    ),
    ProductDealCard(
      productId=path("/featuredPairing/productId"),
      title=path("/featuredPairing/title"),
      price=path("/featuredPairing/price"),
      badgeText="Chef Pairing · Save $3.00",
    ),
  ]
)
\`\`\``;
    }

    return `\`\`\`python
root = Card(
  child=Column(
    children=[
      Text(text=path("/recipeTitle"), variant="body"),
      Slider(label="Servings", min=1, max=12, value=path("/servings")),
    ]
  )
)
\`\`\``;
  }

  public generate(options?: {
    catalog?: CatalogInterface | CatalogLike;
    examples?: string;
    systemInstruction?: string;
  }): string {
    const parts: string[] = [];
    if (options?.systemInstruction) {
      parts.push(options.systemInstruction.trim());
    }
    parts.push(this.generateBaseRules());
    parts.push(this.generateCatalogInstructions(options?.catalog));
    const ex = options?.examples ?? this.generateExamples(options?.catalog);
    if (ex) {
      parts.push(`### Examples:\n\n${ex}`);
    }
    return parts.join('\n\n');
  }
}

/**
 * Spec-compliant TypeScript `SkillGenerator` implementation per
 * `blueprints/features/skill_generator.blueprint.md` and `conformance/agent/skill.yaml`.
 *
 * Fills the missing TypeScript `SkillGenerator` gap in `@a2ui/agent@0.0.1` (BUG-01).
 */
export class SkillGenerator {
  public readonly promptGenerator: DecomposedPromptGenerator;

  constructor(format: SkillInferenceFormat | DecomposedPromptGenerator = 'direct_json') {
    if (typeof format === 'string') {
      this.promptGenerator =
        format === 'express'
          ? new ExpressSkillPromptGenerator()
          : new DirectJsonSkillPromptGenerator();
    } else {
      this.promptGenerator = format;
    }
  }

  /**
   * Generates the catalog-agnostic Core Syntax & Wire Protocol Skill (`a2ui-core/SKILL.md`).
   */
  public generateCoreSkill(): Skill {
    const fmt = this.promptGenerator.formatName;
    return new Skill({
      name: 'a2ui-core',
      description: `Core syntax, flat adjacency-list topology, and @path/@call data-binding rules for A2UI v1.0 (${fmt}).`,
      content: `# A2UI Core Syntax & Wire Protocol (${fmt})\n\n${this.promptGenerator.generateBaseRules()}`,
      metadata: {
        protocolVersion: 'v1.0',
        inferenceFormat: fmt,
        layer: 'core',
      },
    });
  }

  /**
   * Generates a modular Catalog Skill (`a2ui-<catalog>/SKILL.md`) that depends on `a2ui-core`.
   */
  public generateCatalogSkill(options?: {
    catalog?: CatalogInterface | CatalogLike;
    description?: string;
    examples?: string;
    name?: string;
  }): Skill {
    const targetCatalog = options?.catalog ?? patchedBasicCatalog;
    const catSlug = cleanCatalogName(targetCatalog);
    const skillName = options?.name ?? `a2ui-${catSlug}`;
    const desc =
      options?.description ??
      targetCatalog.description ??
      `Component and function schemas for the ${catSlug} A2UI v1.0 catalog. Requires a2ui-core.`;

    const instructions = this.promptGenerator.generateCatalogInstructions(targetCatalog);
    const examples =
      options?.examples ?? this.promptGenerator.generateExamples(targetCatalog);

    const bodyParts = [
      `# A2UI Catalog Skill: ${skillName}`,
      `> **Prerequisite Skill**: Load \`a2ui-core\` (\`a2ui-core/SKILL.md\`) alongside this catalog skill for core A2UI v1.0 wire envelope and data-binding rules.`,
      instructions,
    ];

    if (examples && examples.trim().length > 0) {
      bodyParts.push(`### Examples:\n\n${examples.trim()}`);
    }

    return new Skill({
      name: skillName,
      description: desc,
      content: bodyParts.join('\n\n'),
      metadata: {
        protocolVersion: 'v1.0',
        inferenceFormat: this.promptGenerator.formatName,
        catalogId: getCatalogIdString(targetCatalog, A2UI_BASIC_CATALOG_ID),
        dependsOn: 'a2ui-core',
      },
    });
  }

  /**
   * Generates a self-contained monolithic Skill (`a2ui/SKILL.md`) combining core rules,
   * catalog schemas, guidelines, and examples in a single file.
   */
  public generateSkill(options?: {
    catalog?: CatalogInterface | CatalogLike;
    description?: string;
    examples?: string;
    name?: string;
  }): Skill {
    const targetCatalog = options?.catalog ?? unifiedFreshCartCatalog;
    const catSlug = cleanCatalogName(targetCatalog);
    const skillName = options?.name ?? 'a2ui';
    const desc =
      options?.description ??
      `Self-contained A2UI v1.0 skill combining core wire protocol rules and the ${catSlug} component catalog.`;

    const baseRules = this.promptGenerator.generateBaseRules();
    const catInstructions =
      this.promptGenerator.generateCatalogInstructions(targetCatalog);
    const examples =
      options?.examples ?? this.promptGenerator.generateExamples(targetCatalog);

    const bodyParts = [
      `# A2UI v1.0 Complete Agent Skill (${skillName})`,
      baseRules,
      catInstructions,
    ];
    if (examples && examples.trim().length > 0) {
      bodyParts.push(`### Examples:\n\n${examples.trim()}`);
    }

    return new Skill({
      name: skillName,
      description: desc,
      content: bodyParts.join('\n\n'),
      metadata: {
        protocolVersion: 'v1.0',
        inferenceFormat: this.promptGenerator.formatName,
        catalogId: getCatalogIdString(
          targetCatalog,
          FRESHCART_GROCERY_CATALOG_ID
        ),
        bundleMode: 'monolithic',
      },
    });
  }

  /**
   * Generates a modular `SkillSet` containing `a2ui-core/SKILL.md` + `a2ui-<catalog>/SKILL.md`.
   */
  public generateSkillset(options?: {
    catalog?: CatalogInterface | CatalogLike;
    catalogDescription?: string;
    examples?: string;
    catalogName?: string;
  }): SkillSet {
    const set = new SkillSet();
    set.add(this.generateCoreSkill());
    set.add(
      this.generateCatalogSkill({
        catalog: options?.catalog ?? patchedBasicCatalog,
        description: options?.catalogDescription,
        examples: options?.examples,
        name: options?.catalogName,
      })
    );
    return set;
  }

  /**
   * Generates a multi-catalog modular `SkillSet` containing `a2ui-core/SKILL.md`
   * plus one `a2ui-<catalog>/SKILL.md` for each registered catalog.
   */
  public generateMultiCatalogSkillset(
    catalogs: ReadonlyArray<{
      catalog: CatalogInterface | CatalogLike;
      name?: string;
      description?: string;
    }>
  ): SkillSet {
    const set = new SkillSet();
    set.add(this.generateCoreSkill());
    for (const entry of catalogs) {
      set.add(
        this.generateCatalogSkill({
          catalog: entry.catalog,
          name: entry.name,
          description: entry.description,
        })
      );
    }
    return set;
  }
}

export interface FreshCartCompiledSkillEntry {
  name: string;
  filename: string;
  agentWorkspacePath: string;
  description: string;
  markdown: string;
  lineCount: number;
  charCount: number;
  metadata: Record<string, string>;
}

export interface FreshCartSkillBundle {
  format: SkillInferenceFormat;
  generatedAt: string;
  modularSkills: FreshCartCompiledSkillEntry[];
  monolithicSkill: FreshCartCompiledSkillEntry;
  catalogSchemas: {
    basicCatalogJson: Record<string, unknown>;
    groceryCatalogJson: Record<string, unknown>;
    unifiedCatalogJson: Record<string, unknown>;
  };
}

function toSkillEntry(skill: Skill): FreshCartCompiledSkillEntry {
  const markdown = skill.toMarkdown();
  return {
    name: skill.name,
    filename: skill.filename,
    agentWorkspacePath: skill.agentWorkspacePath,
    description: skill.description,
    markdown,
    lineCount: markdown.split('\n').length,
    charCount: markdown.length,
    metadata: { ...skill.metadata },
  };
}

/**
 * Compiles the full FreshCart A2UI v1.0 SkillSet (`a2ui-core`, `a2ui-basic`, `a2ui-grocery`)
 * and monolithic `a2ui/SKILL.md` directly from `@a2ui/web_core/v1_0` `Catalog.toJson()`.
 */
export function buildFreshCartSkillBundle(
  format: SkillInferenceFormat = 'direct_json'
): FreshCartSkillBundle {
  const generator = new SkillGenerator(format);

  const modularSkillSet = generator.generateMultiCatalogSkillset([
    {
      catalog: patchedBasicCatalog,
      name: 'a2ui-basic',
      description:
        'Standard A2UI v1.0 Basic Catalog (18 UI components & 15 functions) serialized from @a2ui/web_core Catalog.toJson(). Requires a2ui-core.',
    },
    {
      catalog: freshCartGroceryExtensionCatalog,
      name: 'a2ui-grocery',
      description:
        'FreshCart Grocery Domain Catalog (ProductDealCard & NutritionSummary) serialized from @a2ui/web_core Catalog.toJson(). Requires a2ui-core.',
    },
  ]);

  const monolithicSkill = generator.generateSkill({
    catalog: unifiedFreshCartCatalog,
    name: 'a2ui',
    description:
      'Complete FreshCart A2UI v1.0 Agent Skill combining Core Wire Rules, 18 Basic Components, 15 Built-in Functions, and 2 Grocery Domain Components.',
  });

  return {
    format,
    generatedAt: new Date().toISOString(),
    modularSkills: modularSkillSet.skills.map(toSkillEntry),
    monolithicSkill: toSkillEntry(monolithicSkill),
    catalogSchemas: {
      basicCatalogJson: patchedBasicCatalog.toJson(),
      groceryCatalogJson: freshCartGroceryExtensionCatalog.toJson(),
      unifiedCatalogJson: unifiedFreshCartCatalog.toJson(),
    },
  };
}
