## [ISSUE-04-01] [v1.0][docs] Document Agent Skill Generation (`SkillGenerator`, `Skill`, `SkillSet`, and `SKILL.md` compilation) in public guides and `@a2ui/agent` README
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][docs] Document Agent Skill Generation (SkillGenerator, Skill, SkillSet, and SKILL.md compilation) in public guides and @a2ui/agent README`

<!-- ISSUE_BODY_START -->
### Summary
A2UI v1.0 introduces an Agent Skill Generation architecture (`Skill`, `SkillSet`, `SkillGenerator`, and decomposed `PromptGenerator` methods `generateBaseRules`, `generateCatalogInstructions`, `generateExamples`) specified in `blueprints/features/skill_generator.blueprint.md`, tested in `conformance/agent/skill.yaml`, and implemented in `python/a2ui_agent/src/a2ui/skill/`. However, there is zero mention of `SkillGenerator`, `Skill`, `SkillSet`, or `SKILL.md` package compilation anywhere in the public documentation (`docs/public/`), root `README.md`, `python/a2ui_agent/README.md`, or `typescript/agents/a2ui_agent/README.md`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/agent@0.0.1`
- **File path(s)**:
  - `docs/public/guides/agent-development.md`
  - `typescript/agents/a2ui_agent/README.md`
  - `python/a2ui_agent/README.md`
  - `blueprints/features/skill_generator.blueprint.md` (lines 1–280)
  - `conformance/agent/skill.yaml` (lines 1–51)

### Steps to Reproduce / Evidence
1. Search `docs/public/` and all package `README.md` files for `SkillGenerator`, `SkillSet`, or `SKILL.md`:
   ```bash
   git grep -i "SkillGenerator" -- docs/ README.md typescript/ python/
   ```
2. Observe that `SkillGenerator` appears only in `blueprints/features/skill_generator.blueprint.md` and `python/a2ui_agent/src/a2ui/skill/` (plus tests), with zero user-facing documentation explaining how to compile A2UI catalogs into monolithic (`a2ui/SKILL.md`) or modular (`a2ui-core/SKILL.md` + `a2ui-<catalog>/SKILL.md`) agent skills.

### Expected Behavior
The public Agent Development Guide (`docs/public/guides/agent-development.md`) and SDK READMEs (`python/a2ui_agent/README.md` and `typescript/agents/a2ui_agent/README.md`) should document:
1. When to use monolithic (`generate_skill()`) vs. modular (`generate_skillset()`) A2UI skills.
2. How `SkillSet.get(query)` resolves skills (exact filename, exact skill name, or substring match for queries $\ge 3$ characters).
3. How `SkillSet.export_to_directory(".agents/skills")` safely updates `a2ui-*` skill directories while preserving sibling non-A2UI skills.

### Actual Behavior
Developers have no way to discover the Skill Generation feature without reading internal architectural blueprints (`blueprints/features/skill_generator.blueprint.md`) and YAML conformance fixtures (`conformance/agent/skill.yaml`).

### Suggested Fix
Add a dedicated **"Compiling Catalogs into Agent Skills (`SKILL.md`)"** section to `docs/public/guides/agent-development.md`, `python/a2ui_agent/README.md`, and `typescript/agents/a2ui_agent/README.md` with runnable Python and TypeScript examples for `SkillGenerator`, `Skill`, and `SkillSet`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-02] [v1.0][docs] Document programmatic `@a2ui/web_core` `Catalog.toJson()` schema serialization and `InMemoryCatalogProvider` usage in `@a2ui/agent`
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][docs] Document programmatic @a2ui/web_core Catalog.toJson() schema serialization and InMemoryCatalogProvider usage in @a2ui/agent`

<!-- ISSUE_BODY_START -->
### Summary
`typescript/agents/a2ui_agent/README.md` only demonstrates loading a catalog from a filesystem path (`CatalogConfig.fromPath('path/to/catalog.json')`). It never documents how programmatic catalogs constructed in code with `@a2ui/web_core`'s `new Catalog(...)` (using Zod `ComponentApi` and `FunctionApi` schemas) can be serialized via `catalog.toJson()` or registered via `InMemoryCatalogProvider` for prompt and skill generation.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm packages `@a2ui/agent@0.0.1`, `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/README.md` (lines 1–95)
  - `typescript/agents/a2ui_agent/src/processor/catalog-providers.ts` (lines 1–95)
  - `typescript/core/web_core/src/catalog/types.ts` (`Catalog.toJson()`, `Catalog.validationSchema`)

### Steps to Reproduce / Evidence
1. Inspect `typescript/agents/a2ui_agent/README.md`.
2. Notice that the only documented catalog configuration is `CatalogConfig.fromPath('path/to/catalog.json')`, which relies on Node `fs` (`FileSystemCatalogProvider`) and fails in browser/edge environments or when components are authored in TypeScript with Zod (`ComponentApi`).

### Expected Behavior
`typescript/agents/a2ui_agent/README.md` should show how to pass an `@a2ui/web_core` `Catalog` instance (or its `catalog.toJson()` document) into `InMemoryCatalogProvider` / `PromptGenerator` / `SkillGenerator` without requiring a static `catalog.json` file on disk.

### Actual Behavior
Developers authoring custom component catalogs in TypeScript with `@a2ui/web_core` have no documented path for feeding those catalogs into `@a2ui/agent`'s prompt or skill generators.

### Suggested Fix
Document `catalog.toJson()` and `InMemoryCatalogProvider` in `typescript/agents/a2ui_agent/README.md` alongside `CatalogConfig.fromPath(...)`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-03] [v1.0][docs] Document `.agents/AGENTS.md` and `.agents/skills/` workspace layout conventions for A2UI skill packages
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][docs] Document .agents/AGENTS.md and .agents/skills/ workspace layout conventions for A2UI skill packages`

<!-- ISSUE_BODY_START -->
### Summary
`blueprints/features/skill_generator.blueprint.md` defines specific target directory conventions for deploying compiled A2UI skills into managed agent workspaces (`.agents/AGENTS.md`, `.agents/skills/a2ui-core/SKILL.md`, `.agents/skills/a2ui-<catalog>/SKILL.md`, and `.agents/skills/a2ui/SKILL.md`), as well as scoped directory-wiping semantics in `SkillSet.export_to_directory()`. None of these conventions are documented in `docs/public/`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `blueprints/features/skill_generator.blueprint.md` (lines 150–265)
  - `python/a2ui_agent/src/a2ui/skill/skill.py` (lines 129–174)
  - `docs/public/guides/agent-development.md`

### Steps to Reproduce / Evidence
1. Inspect `python/a2ui_agent/src/a2ui/skill/skill.py` lines 129–174 (`SkillSet.export_to_directory`).
2. Compare with `docs/public/guides/agent-development.md`, which contains no mention of `.agents/skills/`, YAML frontmatter requirements (`name`, `description`, `metadata`), or how `a2ui-core` interacts with `a2ui-<catalog>` skills.

### Expected Behavior
Public documentation should specify the `.agents/skills/<skill-name>/SKILL.md` directory structure, frontmatter schema, and scoped cleanup behavior of `export_to_directory()`.

### Actual Behavior
The `.agents/skills/` layout and frontmatter contract exist only in internal blueprint and docstring comments.

### Suggested Fix
Add the `.agents/skills/` directory layout diagram and frontmatter specification from `blueprints/features/skill_generator.blueprint.md` to `docs/public/guides/agent-development.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-04] [v1.0][agent] `@a2ui/agent` TypeScript SDK is missing `Skill`, `SkillSet`, and `SkillGenerator` (all `conformance/agent/skill.yaml` cases skipped)
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][agent] @a2ui/agent TypeScript SDK is missing Skill, SkillSet, and SkillGenerator (all conformance/agent/skill.yaml cases skipped)`

<!-- ISSUE_BODY_START -->
### Summary
`blueprints/features/skill_generator.blueprint.md` requires all A2UI agent SDKs (`a2ui-python`, `a2ui-node`) to implement `Skill`, `SkillSet`, and `SkillGenerator` and pass `conformance/agent/skill.yaml`. While the TypeScript `@a2ui/agent` SDK implemented the `PromptGenerator` decomposition (`generateBaseRules`, `generateCatalogInstructions`, `generateExamples`), it completely omits `Skill`, `SkillSet`, and `SkillGenerator`. In `typescript/agents/a2ui_agent/tests/conformance/skill-conformance.test.ts`, `SKILL_ACTION_HANDLERS` is `{}` and all 4 skill conformance actions (`from_format`, `core_syntax`, `from_catalog`, `skill_set`) are hardcoded in `UNIMPLEMENTED_ACTIONS` in `tests/conformance/loader.ts`. Furthermore, `typescript/agents/a2ui_agent/KNOWN_GAPS.md` fails to list `agent/skill.yaml` among the unimplemented blueprint suites.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/agent@0.0.1`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/src/index.ts` (lines 1–131 — no `Skill`, `SkillSet`, or `SkillGenerator` exports)
  - `typescript/agents/a2ui_agent/tests/conformance/skill-conformance.test.ts` (line 22: `const SKILL_ACTION_HANDLERS = {};`)
  - `typescript/agents/a2ui_agent/tests/conformance/loader.ts` (lines 109–114: `UNIMPLEMENTED_ACTIONS`)
  - `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (lines 37–43)

### Steps to Reproduce / Evidence
1. Inspect `typescript/agents/a2ui_agent/tests/conformance/loader.ts` lines 109–114:
   ```ts
   const UNIMPLEMENTED_ACTIONS = new Map<string, string>([
     ['from_format', 'skill generation is not implemented'],
     ['core_syntax', 'skill generation is not implemented'],
     ['from_catalog', 'skill generation is not implemented'],
     ['skill_set', 'skill generation is not implemented'],
   ]);
   ```
2. Inspect `typescript/agents/a2ui_agent/tests/conformance/skill-conformance.test.ts` line 22:
   ```ts
   const SKILL_ACTION_HANDLERS: Record<string, (testCase: LoadedCase) => void | Promise<void>> = {};
   ```
3. Run the TypeScript conformance test suite for `skill.yaml`:
   ```bash
   cd typescript/agents/a2ui_agent && npx vitest run tests/conformance/skill-conformance.test.ts
   ```
   All 4 test cases in `conformance/agent/skill.yaml` are skipped (`4 skipped`).

### Expected Behavior
`@a2ui/agent` should export `Skill`, `SkillSet`, `SkillGenerator`, and `cleanCatalogName` from `src/skill/` (and re-export them from `src/index.ts`), and `tests/conformance/skill-conformance.test.ts` should execute and pass all cases in `conformance/agent/skill.yaml`.

### Actual Behavior
`Skill`, `SkillSet`, and `SkillGenerator` do not exist in `@a2ui/agent`, all `conformance/agent/skill.yaml` tests are skipped, and `KNOWN_GAPS.md` line 39 omits `agent/skill.yaml` when listing unimplemented blueprint conformance suites (`agent/builder/` and `agent/macros/`).

### Suggested Fix
1. Implement `src/skill/skill.ts` (`Skill`, `SkillSet`, `cleanCatalogName`) and `src/skill/generator.ts` (`SkillGenerator`) in `typescript/agents/a2ui_agent/src/skill/` matching `python/a2ui_agent/src/a2ui/skill/`.
2. Export `Skill`, `SkillSet`, and `SkillGenerator` from `typescript/agents/a2ui_agent/src/index.ts`.
3. Wire `from_format`, `core_syntax`, `from_catalog`, and `skill_set` in `tests/conformance/skill-conformance.test.ts` and remove them from `UNIMPLEMENTED_ACTIONS` in `tests/conformance/loader.ts`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-05] [v1.0][conformance] Contradiction between `conformance/test_data/skills/express_base_rules.txt` (`root = Card(...)`) and `catalog_transformer.yaml` pruning conformance
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][conformance] Contradiction between conformance/test_data/skills/express_base_rules.txt (root = Card(...)) and catalog_transformer.yaml pruning conformance`

<!-- ISSUE_BODY_START -->
### Summary
Requirement 1 of `blueprints/features/skill_generator.blueprint.md` mandates that `PromptGenerator.generate_base_rules()` must be **completely catalog-agnostic**, and `conformance/agent/catalog_transformer.yaml` (`test_express_snippet_omits_a_pruned_component`) asserts that when `Card` is pruned from a catalog, `"Card"` must not appear anywhere in the generated Express prompt. However, `python/a2ui_agent`'s `EXPRESS_RULES` and the skill conformance golden files (`conformance/test_data/skills/express_base_rules.txt`, `express_core.skill.md`, and `express_basic_monolithic.skill.md`) hardcode `root = Card(...)`, `DateTimeInput`, and `itemTemplate = Image($url)`. As a result, no SDK can simultaneously pass both `conformance/agent/skill.yaml` (`test_express_core_skill`) and `conformance/agent/catalog_transformer.yaml` (`test_express_snippet_omits_a_pruned_component`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `conformance/test_data/skills/express_base_rules.txt` (lines 27, 49, 60)
  - `conformance/test_data/skills/express_core.skill.md` (lines 32, 54, 65)
  - `conformance/test_data/skills/express_basic_monolithic.skill.md` (lines 32, 54, 65)
  - `python/a2ui_agent/src/a2ui/inference_formats/express/prompt_generator.py` (`EXPRESS_RULES`)
  - `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (lines 135–142)

### Steps to Reproduce / Evidence
1. Inspect `conformance/test_data/skills/express_base_rules.txt` lines 49 and 60:
   ```text
   49:     itemTemplate = Image($url)
   ...
   58: 15. Surface targeting: Output `surface(surfaceId)` to specify or target a user interface surface:
   59:     surface("dashboard-surface-1")
   60:     root = Card(...)
   ```
2. Compare with `typescript/agents/a2ui_agent/src/inference-formats/express/prompt-generator.ts` (which replaced `Card(...)` with `ComponentA(...)` to pass `test_express_snippet_omits_a_pruned_component` in `conformance/agent/catalog_transformer.yaml`) and `typescript/agents/a2ui_agent/KNOWN_GAPS.md` lines 139–140:
   > "The conformance suite contradicts itself: the skill golden `conformance/test_data/skills/express_base_rules.txt` still contains `Card(...)`, which the pruning conformance case `test_express_snippet_omits_a_pruned_component` forbids."

### Expected Behavior
`EXPRESS_RULES` in `python/a2ui_agent` and the golden files in `conformance/test_data/skills/` (`express_base_rules.txt`, `express_core.skill.md`, `express_basic_monolithic.skill.md`) should use catalog-agnostic placeholder component names (`ComponentA`, `ComponentB`, `ComponentC`) so both `conformance/agent/skill.yaml` and `conformance/agent/catalog_transformer.yaml` can pass together.

### Actual Behavior
`conformance/test_data/skills/express_base_rules.txt` and `python/a2ui_agent` hardcode basic-catalog component names (`Card`, `Image`, `DateTimeInput`) inside supposedly catalog-agnostic base rules.

### Suggested Fix
Update `EXPRESS_RULES` in `python/a2ui_agent/src/a2ui/inference_formats/express/prompt_generator.py` to match the catalog-agnostic rules in TypeScript (`typescript/agents/a2ui_agent/src/inference-formats/express/prompt-generator.ts`) and regenerate `conformance/test_data/skills/express_base_rules.txt`, `express_core.skill.md`, and `express_basic_monolithic.skill.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-06] [v1.0][web_core] `@a2ui/web_core/catalogs/basic/v1` fails to export `BASIC_COMPONENTS` and `BASIC_CATALOG_DOCUMENT_OPTIONS`
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][web_core] @a2ui/web_core/catalogs/basic/v1 fails to export BASIC_COMPONENTS and BASIC_CATALOG_DOCUMENT_OPTIONS`

<!-- ISSUE_BODY_START -->
### Summary
In `@a2ui/web_core`, `typescript/core/web_core/src/catalogs/basic/v1/components/basic_components.ts` defines and exports `BASIC_COMPONENTS` (line 681) and `BASIC_CATALOG_DOCUMENT_OPTIONS` (line 705, which carries the full `instructions`, `schemaUri`, `title`, and `description` of the v1.0 Basic Catalog). However, neither `components/index.ts` nor `catalogs/basic/v1/index.ts` re-exports `BASIC_COMPONENTS` or `BASIC_CATALOG_DOCUMENT_OPTIONS` (whereas `BASIC_FUNCTIONS` and `BASIC_FUNCTION_APIS` *are* exported in `catalogs/basic/v1/index.ts` lines 19 and 50). Consequently, downstream consumers and custom catalogs extending the v1.0 Basic Catalog cannot import `BASIC_COMPONENTS` or `BASIC_CATALOG_DOCUMENT_OPTIONS` from `@a2ui/web_core/v1_0` or `@a2ui/web_core/catalogs/basic/v1`, leading `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (lines 92–97) to report that `BASIC_COMPONENTS` and its `instructions` are missing programmatically.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/catalogs/basic/v1/components/basic_components.ts` (lines 681–714)
  - `typescript/core/web_core/src/catalogs/basic/v1/components/index.ts` (lines 1–60)
  - `typescript/core/web_core/src/catalogs/basic/v1/index.ts` (lines 17–54)
  - `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (lines 92–97)

### Steps to Reproduce / Evidence
1. Run Node against `@a2ui/web_core/v1_0`:
   ```js
   import * as v1 from '@a2ui/web_core/v1_0';
   console.log('BASIC_FUNCTIONS:', Array.isArray(v1.BASIC_FUNCTIONS)); // true
   console.log('BASIC_COMPONENTS:', v1.BASIC_COMPONENTS); // undefined
   console.log('BASIC_CATALOG_DOCUMENT_OPTIONS:', v1.BASIC_CATALOG_DOCUMENT_OPTIONS); // undefined
   ```
2. Observe that `BASIC_FUNCTIONS` is exported, but `BASIC_COMPONENTS` and `BASIC_CATALOG_DOCUMENT_OPTIONS` are `undefined` because `typescript/core/web_core/src/catalogs/basic/v1/components/index.ts` exports individual `TextApi`, `ImageApi`, etc. without re-exporting `BASIC_COMPONENTS` or `BASIC_CATALOG_DOCUMENT_OPTIONS`.

### Expected Behavior
`@a2ui/web_core/catalogs/basic/v1` (and `@a2ui/web_core/v1_0`) should export `BASIC_COMPONENTS` and `BASIC_CATALOG_DOCUMENT_OPTIONS` alongside `BASIC_FUNCTIONS` and `BASIC_FUNCTION_APIS` so developers extending the v1.0 Basic Catalog can preserve its component schemas and `instructions` metadata.

### Actual Behavior
`BASIC_COMPONENTS` and `BASIC_CATALOG_DOCUMENT_OPTIONS` are trapped inside an unexported internal module (`components/basic_components.js`).

### Suggested Fix
Re-export `BASIC_COMPONENTS` and `BASIC_CATALOG_DOCUMENT_OPTIONS` from `typescript/core/web_core/src/catalogs/basic/v1/components/index.ts` and `typescript/core/web_core/src/catalogs/basic/v1/index.ts`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-07] [v1.0][skill] Heading mismatch (`### Examples:` vs `## Examples`) in `SkillGenerator` and zero `direct_json` test cases in `conformance/agent/skill.yaml`
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][skill] Heading mismatch (### Examples: vs ## Examples) in SkillGenerator and zero direct_json test cases in conformance/agent/skill.yaml`

<!-- ISSUE_BODY_START -->
### Summary
In `python/a2ui_agent/src/a2ui/skill/generator.py` (lines 71 and 130) and `blueprints/features/skill_generator.blueprint.md` (line 99), `SkillGenerator` appends examples using the heading `### Examples:\n\n{examples}` whenever `prompt_generator.generate_examples(catalog)` returns a non-empty string. However, in the `express` conformance goldens (`conformance/test_data/skills/express_basic_catalog.skill.md` line 193 and `express_basic_monolithic.skill.md` line 253), the heading is `## Examples` because `ExpressPromptGenerator.generate_examples()` returns `""` (embedding `## Examples` inside `catalog.instructions` during `generate_catalog_instructions()`), whereas `DirectJsonPromptGenerator.generate_examples()` returns a non-empty string that triggers `### Examples:`. Moreover, `conformance/agent/skill.yaml` has 4 test cases for `format: express` and **zero** test cases for `format: direct_json`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `python/a2ui_agent/src/a2ui/skill/generator.py` (lines 70–71, 129–130)
  - `conformance/agent/skill.yaml` (lines 17–51)
  - `conformance/test_data/skills/express_basic_catalog.skill.md` (line 193)
  - `conformance/test_data/skills/express_basic_monolithic.skill.md` (line 253)

### Steps to Reproduce / Evidence
1. Inspect `python/a2ui_agent/src/a2ui/skill/generator.py` lines 70–71 and 129–130:
   ```python
   if ex_blocks:
       body_parts.append("### Examples:\n\n" + "\n\n".join(ex_blocks))
   ```
   and:
   ```python
   if examples:
       cat_body += f"\n\n### Examples:\n\n{examples}"
   ```
2. Inspect `conformance/test_data/skills/express_basic_catalog.skill.md` line 193:
   ```markdown
   ## Examples

   Example 1: Dynamic text form
   ```
3. Inspect `conformance/agent/skill.yaml` lines 17–51: every single test case uses `format: express`; `format: direct_json` is never tested.

### Expected Behavior
1. `SkillGenerator` and `PromptGenerator` should use a consistent Markdown heading (`## Examples` or `### Examples:`) across both `express` and `direct_json` formats, and `ExpressPromptGenerator.generate_examples()` should return the catalog examples rather than hiding them inside `generate_catalog_instructions()` (so `generate_catalog_skill(..., include_examples=False)` in `generator.py:91` actually omits examples for `express`!).
2. `conformance/agent/skill.yaml` should include conformance test cases for `format: direct_json`.

### Actual Behavior
Calling `SkillGenerator(express_format).generate_catalog_skill(catalog, include_examples=False)` (`generator.py:91`) **still includes all examples** in the generated `SKILL.md` for `express` because `ExpressPromptGenerator` leaves `## Examples` inside `generate_catalog_instructions()` instead of `generate_examples()`, and `conformance/agent/skill.yaml` has zero test coverage for `direct_json`.

### Suggested Fix
1. Extract the `## Examples` section out of `generate_catalog_instructions()` into `generate_examples()` in `ExpressPromptGenerator` so `include_examples=False` works as documented.
2. Add `direct_json` conformance test cases (`test_direct_json_monolithic_skill`, `test_direct_json_core_skill`, `test_direct_json_catalog_skill`, `test_direct_json_skill_set`) to `conformance/agent/skill.yaml`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-08] [v1.0][skill] `_clean_catalog_name(catalog)` in `python/a2ui_agent/src/a2ui/skill/skill.py` ignores `catalog.id` and fails on URLs ending in `/catalog.json` without a `vN` segment
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][skill] _clean_catalog_name(catalog) in python/a2ui_agent/src/a2ui/skill/skill.py ignores catalog.id and fails on URLs ending in /catalog.json without a vN segment`

<!-- ISSUE_BODY_START -->
### Summary
In `blueprints/features/skill_generator.blueprint.md` (line 234), `clean_catalog_name(catalog)` is specified to check both `catalog.id` and `catalog.catalog_id`:
```python
raw_id = getattr(catalog, "id", getattr(catalog, "catalog_id", "basic"))
```
However, `_clean_catalog_name(catalog)` in `python/a2ui_agent/src/a2ui/skill/skill.py` (lines 27–40) only reads `getattr(catalog, "catalog_id", "basic")` and strips path segments ending in `.json` (`[p for p in raw_id.split("/") if p and not p.endswith(".json")]`). Furthermore, when given a canonical v1.0 catalog URI such as `"https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json"`, `parts[-1]` is `"basic"`, which happens to work only because `catalog.json` ends in `.json`; if a catalog ID is `"https://example.com/catalogs/travel/catalog"` or an object with `.id` instead of `.catalog_id`, `_clean_catalog_name` returns `"catalog"` or `"basic"` instead of `"travel"`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `python/a2ui_agent/src/a2ui/skill/skill.py` (lines 27–40)
  - `blueprints/features/skill_generator.blueprint.md` (lines 232–249)

### Steps to Reproduce / Evidence
1. Inspect `python/a2ui_agent/src/a2ui/skill/skill.py` lines 27–40:
   ```python
   def _clean_catalog_name(catalog: Any) -> str:
       """Derives a clean, LLM-friendly catalog name from a catalog ID or URL."""
       raw_id = getattr(catalog, "catalog_id", "basic")
       if not raw_id:
           return "basic"
       if "/" in raw_id or "\\" in raw_id:
           raw_id = raw_id.replace("\\", "/")
           parts = [p for p in raw_id.split("/") if p and not p.endswith(".json")]
           if parts:
               cand = parts[-1]
               if cand.startswith("v") and len(parts) > 1:
                   cand = parts[-2]
               raw_id = cand
       return raw_id.lower()
   ```
2. Run Python to test `_clean_catalog_name` with a catalog carrying `.id` or a non-alphanumeric slug:
   ```python
   from types import SimpleNamespace
   from a2ui.skill.skill import _clean_catalog_name

   print(_clean_catalog_name(SimpleNamespace(id="https://freshcart.app/catalogs/grocery/v1/catalog.json")))
   # Actual: "basic" (expected: "grocery")
   ```

### Expected Behavior
`_clean_catalog_name(catalog)` should check `getattr(catalog, "id", None) or getattr(catalog, "catalog_id", None) or "basic"`, ignore generic trailing `"catalog"` segments, and sanitize non-alphanumeric characters into lowercase hyphens as specified in `blueprints/features/skill_generator.blueprint.md`.

### Actual Behavior
Catalogs exposing `.id` (the property name used by `@a2ui/web_core`'s `Catalog` and required by `skill_generator.blueprint.md` line 234) fall back to `"basic"`, producing colliding `a2ui-basic/SKILL.md` filenames for custom catalogs.

### Suggested Fix
Update `_clean_catalog_name` in `python/a2ui_agent/src/a2ui/skill/skill.py` to check both `catalog.id` and `catalog.catalog_id`, filter out generic `"catalog"` path segments, and normalize non-alphanumeric characters to `-`.
<!-- ISSUE_BODY_END -->
