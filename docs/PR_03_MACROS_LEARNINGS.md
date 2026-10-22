# PR 03 learnings: A2UI v1.0 macros

**Audience:** A2UI specification authors, SDK maintainers, and frontend engineers integrating parameterized UI macros into A2UI v1.0 applications.

**Scope:** This document covers the discovery, architecture, and implementation of A2UI v1.0 UI macros in the FreshCart grocery application (`feat/03-macros`), followed by public documentation gaps and SDK bugs identified in the `google/A2UI` repository (`@a2ui/web_core@0.14.0`, `@a2ui/react@0.14.0`, and `a2ui_agent`). It does not cover server-side MCP transport or WebSocket transport framing.

**Summary of findings:** A2UI macros provide an asymmetric catalog and message transformation layer (`MacroExpander`) that exposes high-level composite components to an LLM during inference and expands them into flat primitive component trees before rendering. While the conformance suite (`conformance/agent/macros/macros.yaml`) and Python reference package (`python/a2ui_agent/src/a2ui/transformers/macros/`) define 18 macro transformation behaviors, macros are completely absent from the published documentation on `a2ui.org` and unimplemented in the TypeScript SDKs (`@a2ui/web_core`, `@a2ui/react`, and `@a2ui/agent`). Furthermore, the Python reference implementation hardcodes A2UI v0.9 builders and fails to coerce A2UI v1.0 `{"@path": "/..."}` data bindings.

---

## Discovery in public sources

We investigated how an external developer discovers A2UI macros using only public sources (`https://a2ui.org`, web search, and the public `https://github.com/google/A2UI` repository):

1. Searching `https://a2ui.org` and the `docs/` and `specification/` directories in `google/A2UI` for `MacroExpander`, `MacroProcessor`, or `@macro` returns zero documentation pages. The only match for `macros` in `mkdocs.yaml` is the MkDocs build plugin (`mkdocs-macros-plugin`).
2. Searching the file tree of `google/A2UI` reveals three locations that define and implement A2UI macros:
   * `conformance/agent/macros/README.md`, `conformance/agent/macros/macros.yaml` (18 language-agnostic conformance test cases), and 10 golden JSON fixtures in `conformance/agent/macros/golden/`.
   * `python/a2ui_agent/src/a2ui/transformers/macros/` (`README.md`, `macro.py`, `expander.py`, `processor.py`) and `python/a2ui_agent/src/a2ui/builder/core/` (`flattener.py`, `id_allocator.py`).
   * `samples/community/macros/`, a community sample combining a Python FastAPI backend with a React Vite frontend ("A2UI Macro Studio").
3. Inspecting `conformance/agent/macros/macros.yaml` and `python/a2ui_agent/src/a2ui/transformers/macros/processor.py` clarifies the exact contract of an A2UI macro transformer:
   * **Inference catalog synthesis (`transform_to_inference_catalog`):** The transformer inspects each macro's parameter annotations (`DynamicString`, `DynamicNumber`, `DynamicBoolean`, `ComponentId` for single-child slots, `ChildList` for multi-child slot lists, `Action`, `CheckRuleList`, and `AccessibilityAttributes`), synthesizes a JSON Schema definition under `#/components/<MacroName>`, and appends a `$ref` to `$defs.anyComponent.oneOf`. If a macro name collides with an existing base catalog component (such as `Text`), the transformer raises `CatalogError` (conformance test `09_macro_name_collision_error`).
   * **Transport expansion (`transform_to_transport`):** When the agent emits a `createSurface` or `updateComponents` envelope containing a macro instance (`"component": "RecipeBundleCard"` or `"component": "@macro:RecipeBundleCard"`), the expander recursively expands the macro up to `max_depth = 16` (raising `RecursionError` on cycles per test `08_cyclic_macro_detection`).
   * **Deterministic double-underscore ID allocation and root stitching:** Internal components generated inside a macro instance with `id: "kit_hero_macro"` receive deterministic IDs formatted as `${instance_id}__${component_type_lower}_${counter}` (for example, `kit_hero_macro__column_1`, `kit_hero_macro__text_1`, `kit_hero_macro__slider_1`). The root component returned by the macro adopts the macro instance's own ID (`"kit_hero_macro"`) and is emitted last (post-order) so parent containers referencing `"kit_hero_macro"` require no rewriting.
   * **Slot boundary preservation:** External component IDs passed into a `ComponentId` or `ChildList` slot parameter are referenced directly in the expanded container's `child` or `children` list without re-namespacing or re-emitting the external components (tests `02_slot_boundary_preservation` and `03_multi_slot_list_coercion`).
   * **Action and data-binding coercion:** Shorthand action strings (such as `"swap_macro_ingredient"`) coerce into canonical event objects (`{"event": {"name": "swap_macro_ingredient", ...}}` per test `04_action_string_coercion`), and data-binding objects coerce into `DataBinding` nodes (test `05_data_binding_coercion`).

---

## How FreshCart implements and showcases A2UI v1.0 macros

Because `@a2ui/web_core@0.14.0` and `@a2ui/react@0.14.0` do not implement macro expansion, we built a TypeScript A2UI v1.0 macro engine in `src/a2ui/macros/macroExpander.ts` and wired it directly into `processA2UIMessage` in `src/a2ui/SurfaceManager.ts` and the Chef Macro Meal Kit scenario in `src/scenarios/macroShowcaseScenario.ts`.

### 1. TypeScript `A2UIMacroExpander` (`src/a2ui/macros/macroExpander.ts`)

`A2UIMacroExpander` implements the conformance rules from `conformance/agent/macros/macros.yaml` adapted for A2UI v1.0:

* **Deterministic ID allocator (`MacroIdAllocator`):** Tracks per-component-type counters for each macro instance and allocates `${instanceId}__${type.toLowerCase()}_${n}` IDs that satisfy UAX #31 identifier validation.
* **Post-order flattening and root stitching (`expandComponentList`):** Emits all internal child nodes before the macro root and stitches the root component's `id` to `instanceId`.
* **Cycle detection and recursion cap:** Tracks active macro names on the expansion stack, throwing `A2UIRecursionError` on self-referencing or mutually recursive macros (`maxDepth = 16`).
* **Single-slot and multi-slot boundary preservation (`coerceSlotComponentId`, `coerceSlotComponentList`):** Preserves external component IDs passed into `headerSlot` or `extraControlsSlot` without re-namespacing them.
* **Action and v1.0 `@path` coercion (`coerceMacroAction`, `coerceMacroDynamicValue`):** Converts shorthand action strings into canonical `{"event": {"name": ..., "context": ...}}` objects and upgrades legacy v0.9 `{"path": "/..."}` bindings to A2UI v1.0 `{"@path": "/..."}` bindings.
* **Inference catalog synthesis (`transformToInferenceCatalog`):** Generates JSON Schema definitions for all registered macros, enforces collision checks via `A2UICatalogError`, and supports `passthroughComponents` filtering.

### 2. Four reusable grocery UI macros

We registered four domain-specific grocery macros in `FRESHCART_GROCERY_MACROS`:

| Macro name | Purpose | Conformance features exercised | Root & generated child nodes |
| :--- | :--- | :--- | :--- |
| `@macro:RecipeBundleCard` | Recipe kit hero card with style selector, prep badge, and interactive servings slider | Parameter defaults, `@path` coercion, single-child slot boundary (`headerSlot`) | Root `Card` + 8 internal nodes (`__column_1`, `__row_1`, `__text_1..3`, `__choicepicker_1`, `__divider_1`, `__slider_1`) |
| `@macro:MacroNutrientBar` | Combines `NutritionSummary` with a dietary filter bar | Multi-child slot list coercion (`extraControlsSlot: ["cb_gluten_free", "cb_organic_only"]`) | Root `Column` + 3 internal nodes (`__nutritionsummary_1`, `__card_1`, `__row_1`) |
| `@macro:SmartSwapRow` | Reusable ingredient row with checkbox, formatted currency, and 1-click organic swap button | Shorthand action string coercion (`swapAction: "swap_macro_ingredient"`), `@call: formatCurrency` | Root `Row` + 7 internal nodes (`__column_1`, `__checkbox_1`, `__text_1..3`, `__row_1`, `__button_1`) |
| `@macro:OneClickBundleFooter` | Bundle checkout footer with total price calculation and primary CTA button | Shorthand action string coercion (`ctaAction: "add_recipe_bundle_to_cart"`), `@path` status binding | Root `Card` + 7 internal nodes (`__column_1`, `__row_1`, `__text_1..4`, `__button_1`) |

### 3. Interactive Chef Macro Meal Kit showcase (`src/scenarios/macroShowcaseScenario.ts`)

In the AI Personal Shopper panel (`AIShopperDrawer.tsx`) and storefront hero banner (`HeroBanner.tsx`), users can click **Chef Macro Meal Kit** to stream the `macro-showcase-surface` envelope sequence:

* The `updateComponents` envelope authors 17 top-level component entries (including 7 `@macro:*` component instances and 3 slotted external components).
* `SurfaceManager.processA2UIMessage` intercepts the envelope and expands the 7 macro instances into 39 primitive and custom catalog nodes (for a total of 49 rendered A2UI v1.0 components).
* Beneath the rendered meal kit, a collapsible **A2UI v1.0 Macro Expansion Trace** drawer displays every macro instance ID, its stitched root component, its generated `instance__type_N` child IDs, and its preserved slot IDs (`chef_seasonal_badge`, `cb_gluten_free`, `cb_organic_only`).

---

## Public documentation gaps

### DOC-GAP-MACRO-01 (Critical): Complete absence of macro documentation on `a2ui.org` and in `specification/`

* **Observation:** Neither the published documentation site (`docs/` in `google/A2UI`, served at `https://a2ui.org`) nor the formal protocol specification (`specification/v0_8`, `specification/v0_9`, `specification/v1_0`) mentions UI macros, `MacroExpander`, `MacroProcessor`, or how composite macros map to primitive catalogs.
* **Impact:** Developers reading `a2ui.org` cannot discover that A2UI has a macro system or learn when to use server-side macro expansion versus custom catalog components.
* **Recommendation:** Add a dedicated "UI Macros & Composite Components" guide under `docs/concepts/` and document the macro expansion contract in `specification/v1_0/`.

### DOC-GAP-MACRO-02 (High): Existing macro READMEs and conformance fixtures only show v0.9 syntax

* **Observation:** Both `python/a2ui_agent/src/a2ui/transformers/macros/README.md` and `conformance/agent/macros/macros.yaml` use A2UI v0.9 syntax (`from a2ui.builder.v0_9 import ...`, `"version": "v0.9"`, `{"path": "/system/cpu"}`, and `Text.variant: "h3"`). Neither document explains how macros work with A2UI v1.0 (`"version": "v1.0"`, `{"@path": "/..."}` `DataBinding` objects, `{"@call": "..."}` `FunctionCall` objects, and Markdown-prefixed `Text` variants).
* **Impact:** Copy-pasting any example from `conformance/agent/macros/macros.yaml` into an A2UI v1.0 surface fails schema and runtime validation because v1.0 requires `@path` instead of `path` and restricts `Text.variant` to `'body' | 'caption'`.
* **Recommendation:** Update `conformance/agent/macros/macros.yaml` and `python/a2ui_agent/src/a2ui/transformers/macros/README.md` with A2UI v1.0 envelopes and `@path` bindings.

### DOC-GAP-MACRO-03 (Medium): Undocumented declarative AST template sentinels (`{$param}`, `{$spreadParam}`, `${name}`)

* **Observation:** `conformance/agent/macros/macros.yaml` defines macros using declarative JSON AST sentinels: `{"$param": "title"}` for direct parameter substitution, `{"$spreadParam": "items"}` for splicing `ChildList` slot arrays into `children`, and `"${label}: "` for inline string interpolation. However, `python/a2ui_agent/src/a2ui/transformers/macros/` does not parse `$param` or `$spreadParam` JSON templates at all; it requires Python subclasses of `Macro` that imperatively construct `v0_9` builder objects in `expand()`.
* **Impact:** Developers reading `conformance/agent/macros/macros.yaml` assume they can register declarative JSON macro templates in the SDK, only to find that the Python SDK only accepts imperative Python classes and the TypeScript SDK has no macro parser.
* **Recommendation:** Document the distinction between the language-agnostic YAML conformance fixture format (`$param` / `$spreadParam`) and the imperative SDK `Macro.expand()` API, or support declarative JSON macro templates directly in both SDKs.

---

## SDK and runtime bugs and gaps

### BUG-MACRO-01 (Critical): Macros and builder APIs are unimplemented in TypeScript (`@a2ui/agent`, `@a2ui/web_core`, `@a2ui/react`)

* **Location:**
  * `typescript/core/web_core/tests/conformance/conformance_test.mjs:193`:
    ```js
    const SKIP_TEST_SUITES = new Set(['accessibility.yaml', 'builder.yaml', 'macros.yaml']);
    ```
  * `typescript/agents/a2ui_agent/KNOWN_GAPS.md:39`:
    ```markdown
    - `agent/builder/` and `agent/macros/` do not run.
      Why it exists: Those suites exercise blueprint APIs this package does not implement yet.
    ```
* **Observation:** None of the published TypeScript packages (`@a2ui/web_core@0.14.0`, `@a2ui/react@0.14.0`, or `@a2ui/agent`) export `Macro`, `MacroExpander`, `MacroProcessor`, or `IdAllocator`. The TypeScript conformance runner explicitly skips `macros.yaml`.
* **Impact:** Full-stack TypeScript/Node.js agents and React clients cannot define or expand A2UI macros using official npm packages.
* **Workaround in FreshCart:** We implemented `A2UIMacroExpander`, `MacroIdAllocator`, slot boundary coercion, action coercion, and inference catalog schema synthesis in `src/a2ui/macros/macroExpander.ts`.

### BUG-MACRO-02 (High): Python `MacroProcessor` hardcodes `a2ui.builder.v0_9` and drops A2UI v1.0 `{"@path": "/..."}` bindings

* **Location:**
  * `python/a2ui_agent/src/a2ui/transformers/macros/macro.py:36` and `processor.py:26` (`from a2ui.builder.v0_9 import ...`).
  * `python/a2ui_agent/src/a2ui/transformers/macros/processor.py:163-169`:
    ```python
    if isinstance(p_val, dict) and "path" in p_val and len(p_val) == 1:
      coerced_kwargs[p_name] = DataBinding(path=p_val["path"])
    ```
  * `python/a2ui_agent/src/a2ui/transformers/macros/expander.py:147`:
    ```python
    version=ProtocolVersion.V0_9_1,
    ```
* **Observation:**
  1. `python/a2ui_agent/src/a2ui/builder/` only contains `v0_8` and `v0_9`; there is no `v1_0` builder package.
  2. When coercing macro arguments in `MacroProcessor._coerce_params`, lines 163-169 check exclusively for `"path" in p_val` (v0.9 syntax) and do not check for `"@path" in p_val` (v1.0 syntax). Passing a v1.0 `{"@path": "/servings"}` binding to a Python macro leaves it as an uncoerced dict or fails builder validation.
  3. `MacroExpander.to_catalog()` hardcodes `ProtocolVersion.V0_9_1`.
* **Impact:** Even when using the Python `a2ui_agent` backend, developers cannot use `MacroExpander` to emit A2UI v1.0 envelopes or coerce v1.0 `@path` data bindings.
* **Workaround in FreshCart:** `coerceMacroDynamicValue` and `coercePathBinding` in `src/a2ui/macros/macroExpander.ts` accept both v1.0 `{"@path": "/..."}` and legacy v0.9 `{"path": "/..."}` objects and normalize them to A2UI v1.0 `{"@path": "/..."}` bindings.

### BUG-MACRO-03 (Medium): Client-side `@a2ui/web_core/v1_0` `PayloadValidator` rejects unexpanded macro envelopes without a client hook

* **Location:** `@a2ui/web_core/v1_0` `MessageProcessor` / `PayloadValidator` (`catalog.components` lookup).
* **Observation:** If an agent streams an envelope containing `"component": "@macro:RecipeBundleCard"` directly to the browser without server-side pre-expansion, `@a2ui/web_core/v1_0` rejects the envelope with `A2uiValidationError: Unknown component '@macro:RecipeBundleCard'` because `MessageProcessor` provides no pre-validation message transformer hook.
* **Impact:** Applications that run LLM inference directly from a lightweight proxy or edge route cannot register client-side macros on `MessageProcessor`.
* **Workaround in FreshCart:** We run `expandFreshCartMacrosInMessage(message)` at the entry of `processA2UIMessage` in `src/a2ui/SurfaceManager.ts` before component lookup and state merging, allowing both server-expanded and client-received `@macro:*` envelopes to render transparently.
