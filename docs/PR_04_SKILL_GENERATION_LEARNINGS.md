# PR 04 — A2UI v1.0 Skill Generation (`Skill`, `SkillSet`, `SkillGenerator`, & `Catalog.toJson()`)

## 1. How Skill Generation Works in A2UI v1.0 (Public Repo & NPM Discovery)

Using a zero-prior-knowledge investigation of the public `google/A2UI` repository (`/tmp/public-google-a2ui`) and published npm packages (`@a2ui/agent@0.0.1` and `@a2ui/web_core@0.14.0`), we traced the complete A2UI v1.0 **Catalog-to-Skill Generation** architecture across four public artifacts:

1. **Architecture Blueprint (`blueprints/features/skill_generator.blueprint.md`)**:
   - Defines how A2UI component/function `Catalog` schemas and `InferenceFormat` prompt rules (`direct_json` and `express`) are compiled into standardized `SKILL.md` files with YAML frontmatter (`name`, `description`, `metadata`) for managed agent platforms (Google Antigravity Managed Agent API, Vertex AI Agent Builder, Anthropic API with Skills, and MCP sandboxes).
   - **Requirement 1 — `PromptGenerator` Decomposition**:
     - Splits monolithic prompt generation into three granular methods:
       - `generateBaseRules()`: Catalog-agnostic core syntax, flat adjacency-list topology, and `@path` / `@call` data-binding instructions.
       - `generateCatalogInstructions(catalog?)`: Component and function schema reference + catalog `instructions` guidelines.
       - `generateExamples(catalog?)`: Concrete few-shot examples for the target catalog and inference format.
       - `generate()`: Template method combining `generateBaseRules()` + `generateCatalogInstructions()` + `generateExamples()`.
   - **Requirement 2 — `Skill` Domain Model**:
     - Immutable data model (`name`, `description`, `content`, `metadata`) with computed `filename = "${name}/SKILL.md"` and `toMarkdown()` serializer producing standard YAML frontmatter + Markdown content.
   - **Requirement 3 — `SkillSet` Domain Collection**:
     - Manages multiple `Skill` instances with `add(skill)`, `toDict()`, `exportToDirectory(outputDir)` (with scoped cleanup of matching `a2ui-*` subdirectories so unrelated agent skills in `.agents/skills/` are preserved), and **3-tier skill resolution** via `get(query)`:
       1. Exact `filename` match (e.g., `"a2ui-core/SKILL.md"`)
       2. Exact `name` match (e.g., `"a2ui-core"`)
       3. Substring match on `skill.name` when `query.length >= 3` (e.g., `"basic"` $\rightarrow$ `"a2ui-basic"`, whereas 2-character queries like `"ui"` return `undefined`).
   - **Requirement 4 — `SkillGenerator` Compiler & `cleanCatalogName(catalog)`**:
     - `generateCoreSkill()`: Emits `a2ui-core/SKILL.md` (`generateBaseRules()`).
     - `generateCatalogSkill(catalog, description?, examples?, name?)`: Emits `a2ui-<catalog>/SKILL.md` (`generateCatalogInstructions(catalog)` + `### Examples:`).
     - `generateSkill(catalog?, description?, examples?, name?)`: Emits the self-contained monolithic `a2ui/SKILL.md`.
     - `generateSkillset(catalog, ...)`: Emits a modular `SkillSet` containing `a2ui-core/SKILL.md` + `a2ui-<catalog>/SKILL.md`.
2. **Cross-Language Conformance Suite (`conformance/agent/skill.yaml` & `conformance/test_data/skills/*`)**:
   - Specifies 5 declarative conformance test cases across 4 actions (`from_format`, `core_syntax`, `from_catalog`, `skill_set`) and golden files (`express_core.skill.md`, `express_basic_catalog.skill.md`, `express_basic_monolithic.skill.md`).
3. **Python Reference Implementation (`python/a2ui_agent/src/a2ui/skill/{skill.py,generator.py}`)**:
   - Implements `Skill`, `SkillSet`, `SkillGenerator`, and `clean_catalog_name(catalog)` in Python and runs `tests/conformance/test_skill_conformance.py`.
4. **TypeScript Runtime Catalog Schema Serialization (`@a2ui/web_core/v1_0`)**:
   - `Catalog.toJson()` and `Catalog.validationSchema` (`typescript/core/web_core/src/catalog/{schema_generator.ts,schema_serializer.ts}`) convert programmatic `ComponentApi` and `FunctionApi` Zod schemas into standard A2UI v1.0 JSON Schema documents (`components`, `functions`, `$defs.anyComponent`, `$defs.anyFunction`).

---

## 2. How Skill Generation Is Implemented & Showcased in FreshCart

1. **`src/a2ui/skillGenerator.ts` — Full TypeScript Implementation of A2UI v1.0 `Skill`, `SkillSet`, & `SkillGenerator`**:
   - Registers FreshCart's custom Grocery Catalog (`ProductDealCard`, `NutritionSummary`) using `@a2ui/web_core/v1_0` Zod schemas (`DynamicStringSchema`, `DynamicNumberSchema`, `DynamicBooleanSchema`, `ActionSchema`) alongside `basicCatalog` (18 standard components + 15 built-in functions).
   - Implements `cleanCatalogName(catalog)`, `Skill`, `SkillSet` (with 3-tier `get(query)` lookup), `DirectJsonSkillPromptGenerator`, `ExpressSkillPromptGenerator`, `SkillGenerator` (`generateCoreSkill`, `generateCatalogSkill`, `generateSkill`, `generateSkillset`, `generateMultiCatalogSkillset`), and `buildFreshCartSkillBundle(format)`.
2. **`vite.config.ts` — Dynamic `SKILL.md` Injection into Gemini & `/api/a2ui/skills` Endpoint**:
   - Exposes `GET /api/a2ui/skills?format=direct_json|express`, returning the live-compiled `a2ui-core/SKILL.md`, `a2ui-basic/SKILL.md`, `a2ui-grocery/SKILL.md`, monolithic `a2ui/SKILL.md`, and serialized `Catalog.toJson()` schemas.
   - Injects `buildFreshCartSkillBundle('direct_json').monolithicSkill.markdown` directly into `buildGeminiSystemInstruction()` so every live `/api/gemini/a2ui` call is guided by the compiled A2UI v1.0 catalog skills.
3. **`src/scenarios/skillGenerationScenario.ts` & `src/components/ai-shopper/AIShopperDrawer.tsx` — Consumer Showcase & Interactive `SKILL.md` Package Viewer**:
   - Adds a 1-click starter suggestion chip (**`🧑‍🍳 Chef Skill: Seasonal Market Basket`**) in the AI Personal Shopper that renders an interactive **Chef's Seasonal Farmers Market Salmon Tasting** surface (`skill-chef-surface`) combining `a2ui-core`, `a2ui-basic` (`ChoicePicker`, `Slider`, `CheckBox`, `List` with `@index(offset: 1)`), and `a2ui-grocery` (`NutritionSummary`, `ProductDealCard`).
   - Adds a **`SKILL.md (3)`** inspector button in the AI Personal Shopper header that opens an interactive **Catalog-to-Skill Compiler Viewer** where developers can switch between `direct_json` and `express` formats, inspect `a2ui-core/SKILL.md`, `a2ui-basic/SKILL.md`, `a2ui-grocery/SKILL.md`, and `a2ui/SKILL.md`, test the 3-tier `SkillSet.get(query)` resolver in real time, and copy or download the generated `SKILL.md` files.

---

## 3. Public Documentation Gaps (`DOC-GAP-*`)

| ID | Severity | Location | Description & Developer Impact |
| :--- | :--- | :--- | :--- |
| **DOC-GAP-01** | **High** | `README.md`, `docs/`, `typescript/agents/a2ui_agent/README.md` | **Zero documentation on `SkillGenerator`, `Skill`, `SkillSet`, or `SKILL.md` compilation in any user-facing README or docs site.** A developer onboarding to A2UI has no way to know that A2UI supports compiling `Catalog` definitions into portable `SKILL.md` packages unless they manually read `blueprints/features/skill_generator.blueprint.md` and `conformance/agent/skill.yaml`. |
| **DOC-GAP-02** | **Medium** | `typescript/agents/a2ui_agent/README.md` | **Outdated/incomplete TypeScript catalog & prompt-generation quickstart.** The README shows `CatalogConfig.fromPath('path/to/catalog.json')` and `processor.promptSnippet`, but never documents how programmatic catalogs created with `@a2ui/web_core`'s `new Catalog(...)` are serialized via `catalog.toJson()` into `InMemoryCatalogProvider`, `PromptGenerator`, or `SkillGenerator`. |
| **DOC-GAP-03** | **Medium** | `blueprints/features/skill_generator.blueprint.md` | **Undocumented `.agents/` directory conventions in public guides.** The remote agent workspace layout (`.agents/AGENTS.md`, `.agents/skills/a2ui-core/SKILL.md`, `.agents/skills/a2ui-<catalog>/SKILL.md`, `.agents/skills/a2ui/SKILL.md`) is described only inside the internal feature blueprint and is absent from agent integration guides. |

---

## 4. Bugs & Missing Implementations in Public Packages (`BUG-*`)

| ID | Severity | Package / File | Root Cause & Reproduction | FreshCart Workaround / Fix |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | **Critical** | `@a2ui/agent@0.0.1` (`typescript/agents/a2ui_agent/src/index.ts`, `tests/conformance/skill-conformance.test.ts:22`, `tests/conformance/loader.ts:109-114`) | **TypeScript `@a2ui/agent` completely omits `Skill`, `SkillSet`, and `SkillGenerator`.** While `skill_generator.blueprint.md` requires every language SDK (`a2ui-python`, `a2ui-node`) to expose `Skill`, `SkillSet`, and `SkillGenerator`, the TypeScript SDK only implemented `PromptGenerator` decomposition (`generateBaseRules`, `generateCatalogInstructions`, `generateExamples`). In `skill-conformance.test.ts`, `SKILL_ACTION_HANDLERS` is `{}` and all 4 conformance actions (`from_format`, `core_syntax`, `from_catalog`, `skill_set`) are skipped with `'skill generation is not implemented'`. Furthermore, `typescript/agents/a2ui_agent/KNOWN_GAPS.md:39` omits `agent/skill.yaml` from its list of skipped conformance suites. | Implemented the complete spec-compliant TypeScript `Skill`, `SkillSet`, `SkillGenerator`, and `cleanCatalogName` in `src/a2ui/skillGenerator.ts`. |
| **BUG-02** | **High** | `conformance/test_data/skills/express_base_rules.txt:65` & `typescript/agents/a2ui_agent/KNOWN_GAPS.md:135-142` | **Contradiction between `skill.yaml` golden (`express_base_rules.txt`) and `catalog_transformer.yaml` pruning conformance.** `express_base_rules.txt` (and `express_core.skill.md` line 65) hardcodes `root = Card(...)` inside `generate_base_rules()`, violating Requirement 1 of `skill_generator.blueprint.md` (*"`generate_base_rules()` ... Must be completely catalog-agnostic"*) and causing `test_express_snippet_omits_a_pruned_component` in `catalog_transformer.yaml` to fail whenever `Card` is pruned. | Made `generateBaseRules()` in `src/a2ui/skillGenerator.ts` strictly catalog-agnostic (`root = <Component>(...)`). |
| **BUG-03** | **High** | `@a2ui/web_core@0.14.0` (`src/catalogs/basic/v1/index.ts` & `KNOWN_GAPS.md:92-97`) | **`basicCatalog` in `@a2ui/web_core/v1_0` drops the catalog `instructions` field.** `catalogs/basic/v1/catalog.json` defines a multi-paragraph `instructions` field (`"For layout, use the Row and Column components..."` + `## Catalog Guidelines`) required by `express_basic_catalog.skill.md:180-191`. However, `basicCatalog` in `@a2ui/web_core/v1_0` is constructed without `options.instructions`, so `basicCatalog.instructions` is `undefined` and `basicCatalog.toJson()` drops `instructions`. | Created `patchedBasicCatalog` in `src/a2ui/skillGenerator.ts` that passes `BASIC_CATALOG_V1_INSTRUCTIONS` via `CatalogOptions.instructions`. |
| **BUG-04** | **Medium** | `python/a2ui_agent/src/a2ui/skill/generator.py:71,130` vs `conformance/test_data/skills/express_basic_catalog.skill.md:193` | **Heading mismatch (`### Examples:` vs `## Examples`) and zero `direct_json` test cases in `conformance/agent/skill.yaml`.** `skill_generator.blueprint.md:99` and `generator.py:71,130` emit `### Examples:\n\n` when `generate_examples()` is non-empty, whereas the golden files contain `## Examples` because `ExpressPromptGenerator` embeds `## Examples` inside `generate_catalog_instructions()` and returns `""` from `generate_examples()`. Moreover, `conformance/agent/skill.yaml` has zero test cases for `format: direct_json`. | Implemented clean `generateExamples(catalog)` separation for both `direct_json` and `express` in `src/a2ui/skillGenerator.ts`. |
| **BUG-05** | **Medium** | `python/a2ui_agent/src/a2ui/skill/skill.py:29` vs `@a2ui/web_core` `Catalog.id` | **Property name mismatch in `clean_catalog_name(catalog)` (`catalog.catalog_id` vs `catalog.id`).** `skill_generator.blueprint.md:234` specifies checking `getattr(catalog, "id", getattr(catalog, "catalog_id", "basic"))`, but `skill.py:29` only checks `getattr(catalog, "catalog_id", "basic")`. Passing an `@a2ui/web_core` `Catalog` (which uses `.id`) falls back to `"basic"` instead of extracting `"grocery"`. | `cleanCatalogName(catalog)` in `src/a2ui/skillGenerator.ts` checks `catalog.id ?? catalog.catalog_id ?? catalog.catalogId`. |
