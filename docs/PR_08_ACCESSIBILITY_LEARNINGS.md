# PR 08: A2UI v1.0 Accessibility (`AccessibilityAttributes`) — Specification Analysis, FreshCart Showcase & SDK Audit

## 1. How A2UI v1.0 Defines `AccessibilityAttributes`

### 1.1 JSON Schema Definition (`specification/v1_0/json/common_types.json`)

In A2UI v1.0, `AccessibilityAttributes` is defined in `specification/v1_0/json/common_types.json` (`#/$defs/AccessibilityAttributes`, lines 15–39) and attached to every component via `ComponentCommon` (`lines 41–57`):

```json
"AccessibilityAttributes": {
  "type": "object",
  "description": "Attributes to enhance accessibility when using assistive technologies like screen readers.",
  "properties": {
    "label": {
      "$ref": "#/$defs/DynamicString",
      "description": "A short string, typically 1 to 3 words, used by assistive technologies to convey the purpose or intent of an element. For example, an input field might have an accessible label of 'User ID', or a button might be labeled 'Submit'."
    },
    "description": {
      "$ref": "#/$defs/DynamicString",
      "description": "Additional information provided by assistive technologies about an element such as instructions, format requirements, or result of an action. For example, a help button might have a label of 'Help' and a description of 'Opens a dialog with additional instructions'."
    },
    "live": {
      "type": "string",
      "enum": ["off", "polite", "assertive"],
      "default": "off",
      "description": "Indicates that an element will be updated dynamically, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region."
    },
    "hidden": {
      "$ref": "#/$defs/DynamicBoolean",
      "default": false,
      "description": "Indicates whether the element and its children are hidden from assistive technologies."
    }
  },
  "additionalProperties": false
}
```

Key protocol properties:
1. **Envelope-Level Placement (`a2ui_protocol.md`, Rule 5, line 614)**: `accessibility` is a top-level property on the flat component object (`{ id, component, accessibility, ... }`), sibling to `id`, `component`, `weight`, and `checks`.
2. **Dynamic Data Binding Support (`@path` and `@call`)**:
   - `accessibility.label` and `accessibility.description` are typed as `DynamicString`, meaning they accept literal strings, JSON Pointer data-model bindings (`{ "@path": "/liveStatusLabel" }`), or reactive function calls (`{ "@call": "formatString", "args": { "value": "Servings slider, currently ${/servings} servings" } }`).
   - `accessibility.hidden` is typed as `DynamicBoolean`, accepting literal booleans, `{ "@path": "/hideVoiceCookingGuide" }`, or boolean `@call` expressions.
   - `accessibility.live` (newly introduced in v1.0 per `specification/v1_0/docs/evolution_guide.md`, line 35) accepts `"off" | "polite" | "assertive"` to configure WAI-ARIA live region announcements.
3. **Strict Schema Enforcement (`additionalProperties: false`)**: Only `label`, `description`, `live`, and `hidden` are permitted inside `accessibility`.

### 1.2 Catalog-Agnostic Accessibility Requirements (`specification/v1_0/docs/a2ui_protocol.md`, lines 519–528)

The v1.0 protocol specification mandates three core renderer responsibilities under **"Catalog-Agnostic Accessibility Requirements"**:
1. **Plumb Accessibility Attributes**: Renderers must map `AccessibilityAttributes` (`label`, `description`, `live`, `hidden`) from `ComponentCommon` to the underlying platform's accessibility API (e.g., `aria-label`, `aria-describedby`, `aria-live`, `aria-hidden` on the web, `Semantics` in Flutter, `Modifier.semantics` in Jetpack Compose).
2. **Infer Default Semantics**: When explicit `AccessibilityAttributes` are omitted, renderers must infer sensible defaults from visible component properties (such as a `Card`'s `title`, a `Button`'s child `Text`, or an input's `label`). Explicit `AccessibilityAttributes` always override inferred defaults.
3. **SDK Linter Checks**: Catalog tooling must verify that interactive component schemas declare accessible label requirements or fallbacks.

### 1.3 Conformance Test Suite (`conformance/core/accessibility.yaml`)

The v1.0 conformance suite defines 6 normative accessibility test cases:
- `test_accessibility_attributes_plumbing`: Verifies `label`, `description`, and `live: "polite"` plumb to platform ARIA attributes and pass axe-core `button-name` and `aria-allowed-attr`.
- `test_accessibility_live_region_assertive`: Verifies `live: "assertive"` announces urgent alerts on dynamic `Text` updates.
- `test_accessibility_hidden_subtree`: Verifies `hidden: true` hides a `Row` and its child `Button` from assistive technologies while passing axe-core `aria-hidden-focus`.
- `test_accessibility_implicit_label_inference`: Verifies a `Button` without `accessibility.label` infers its accessible name from its child `Text` component (`"Implicitly Labeled Button"`).
- `test_accessibility_interactive_roles_and_states`: Verifies `CheckBox`, `Slider`, and `TextField` expose native interactive roles and states (`checked`, `valuemin`/`valuemax`/`valuenow`) and pass axe-core `label` checks.
- `test_accessibility_dynamic_label_and_hidden_binding`: Verifies reactive `updateDataModel` mutations update `accessibility.label: { "@path": "/dynamicLabel" }` and `accessibility.hidden: { "@path": "/isHidden" }` in real time.

---

## 2. How Accessibility Is Showcased in FreshCart

In FreshCart (`feat/08-accessibility`), we built the **Accessible & Allergen-Safe Grocery Shopper Showcase** (`src/scenarios/accessibilityShowcaseScenario.ts`) and upgraded the A2UI v1.0 React surface renderer (`src/a2ui/A2UISurfaceRenderer.tsx`, `src/a2ui/catalogs/basicCatalogRenderer.tsx`, `src/a2ui/catalogs/groceryCatalogRenderer.tsx`) and AI Shopper drawer (`src/components/ai-shopper/AIShopperDrawer.tsx`):

1. **1-Click Suggestion Pill & Default Welcome Showcase**:
   - Added the prominent `♿ Accessible & Allergen-Safe Shopper` suggestion pill at the front of `QUICK_PROMPT_CHIPS` in `src/components/ai-shopper/ScenarioSelector.tsx` and `src/components/ai-shopper/AIShopperDrawer.tsx`.
   - Set `'accessible-shopper'` as the initial showcase in `src/App.tsx` and `AIShopperDrawer.tsx` so opening the demo immediately presents the Accessible & Allergen-Safe Meal Planner surface.
2. **Assertive Live Region (`accessibility.live: 'assertive'`) + Dynamic `@path` Visibility (`accessibility.hidden`)**:
   - `allergen_alert_card` uses `accessibility: { label: { '@path': '/allergenAlertTitle' }, description: { '@path': '/allergenAlertDetail' }, live: 'assertive', hidden: { '@path': '/hideAllergenAlert' } }`.
   - Toggling household allergens (`🥛 Dairy-Free`, `🌾 Gluten-Free`, `🥜 Nut-Free`, `🦐 Shellfish-Free`) automatically substitutes unsafe items (swapping *Sheep Milk Feta* for *Organic Hass Avocados* and *Wheat Sourdough* for *Canyon Bakehouse Gluten-Free Bread*) and triggers an immediate assertive announcement.
3. **Polite Live Region (`accessibility.live: 'polite'`) + Dynamic `@path` & `@call: formatString` Labels**:
   - `polite_status_card` uses `accessibility: { label: { '@path': '/liveStatusLabel' }, description: { '@path': '/liveStatusSummary' }, live: 'polite' }` to politely announce ingredient count, scaled servings cost, and active allergen guardrails whenever the shopper adjusts controls.
   - `servings_slider` uses `accessibility.label: { '@call': 'formatString', args: { value: 'Dinner servings slider, currently ${/servings} servings (${/totalCostFormatted} total)' } }` and `aria-valuetext` so screen readers announce both the serving count and recalculated basket price on every Left/Right arrow press.
4. **Dynamic Subtree Hiding (`accessibility.hidden: { '@path': '/hideVoiceCookingGuide' }`)**:
   - `voice_cooking_guide_card` (containing an `AudioPlayer` with an embedded synthesized WAV chime and 3 zero-knife cooking steps) is bound to `accessibility.hidden: { '@path': '/hideVoiceCookingGuide' }`, controlled by the `Show Hands-Free Audio Cooking Guide` `CheckBox`.
5. **Web Speech API Read-Aloud & Live Screen-Reader Announcement Monitor**:
   - Clicking **Read Summary Aloud** dispatches the `read_accessible_summary_aloud` A2UI action, invoking `window.speechSynthesis` and logging the announcement in the **Live Screen-Reader Announcement Feed (`aria-live` Monitor)** banner at the top of the AI Shopper drawer.
   - Added an **AA Contrast** (`High-Contrast & Large-Text Mode`) toggle button (`aria-pressed`) in the AI Shopper header.
6. **Full WAI-ARIA Control Semantics & Keyboard Navigation**:
   - Linked `<label htmlFor>` to `<input id>` / `<textarea id>` across `TextField`, `CheckBox`, `Slider`, and `DateTimeInput`.
   - Added `aria-describedby` pointing to rendered `.sr-only` description nodes whenever `accessibility.description` is defined.
   - Added `ArrowLeft`, `ArrowRight`, `Home`, and `End` keyboard navigation and `aria-controls` / `aria-labelledby` wiring on `Tabs`, and `Escape` key dismissal on `Modal`.

---

## 3. Public Documentation Gaps (`docs/public/`)

Auditing `/tmp/public-google-a2ui/docs/` against `/tmp/public-google-a2ui/specification/v1_0/` revealed three significant documentation gaps:

1. **Outdated Roadmap Claims (`docs/public/roadmap.md`, lines 133–141)**:
   - `docs/public/roadmap.md` still lists **"Accessibility Features"** (*"First-class accessibility support: ARIA attribute generation, Screen reader optimization, Keyboard navigation standards, Contrast and color guidance"*) under unimplemented **Future Considerations**, even though `AccessibilityAttributes` (`label`, `description`, `live`, `hidden`), `conformance/core/accessibility.yaml`, and `BasicCatalogA2uiLitElement.applyAccessibilityAttributes()` are already shipped in A2UI v1.0.
2. **Inaccurate Property List in Component Reference (`docs/public/reference/components.md`, line 608)**:
   - Under v0.9/v1.0 `ComponentCommon`, `docs/public/reference/components.md` (line 608) states:
     `- accessibility: Accessibility attributes (label, role).`
   - **Why this is a critical trap for developers and LLM prompts**: `role` is **not** a valid property in `AccessibilityAttributes` (`common_types.json` sets `"additionalProperties": false` and `@a2ui/web_core`'s `AccessibilityAttributesSchema` uses `z.object({ label, description, live, hidden }).strict()`). Passing `accessibility: { label: "...", role: "..." }` causes `PayloadValidator.validateUpdateComponents()` to throw a schema validation error!
   - Meanwhile, the actual v1.0 properties — `description` (`DynamicString`), `live` (`"off" | "polite" | "assertive"`), `hidden` (`DynamicBoolean`), and dynamic `@path` / `@call` bindings on accessibility attributes — are never mentioned in `docs/public/reference/components.md`.
3. **Missing Guide for Live Regions, Subtree Hiding, and Semantic Inference**:
   - None of the guides in `docs/public/guides/` document how agents should use `accessibility.live: "polite"` vs `"assertive"` for streaming/reactive updates, how `accessibility.hidden` interacts with focusable children, or how renderers infer accessible names when `accessibility.label` is omitted.

---

## 4. Bugs & Gaps in `@a2ui/web_core`, `@a2ui/lit`, and `@a2ui/react`

Auditing the public TypeScript packages in `/tmp/public-google-a2ui/typescript/` revealed five concrete implementation bugs/gaps:

### Bug 1: `BasicCatalogA2uiLitElement` Places ARIA Attributes on the Outer Custom Element Wrapper Instead of the Inner Focusable Control
- **Location**: `typescript/core/web_core/src/universal/basic_catalog/components/basic-catalog-a2ui-lit-element.ts` (lines 128–137) and interactive components (`Button.ts` lines 48–60, `TextField.ts` lines 65–88, `CheckBox.ts` lines 49–59, `Slider.ts` lines 78–103, `ChoicePicker.ts` lines 88–135).
- **Root Cause**: `applyAccessibilityAttributes()` sets `this.setAttribute('aria-label', ...)`, `this.setAttribute('aria-description', ...)`, `this.setAttribute('aria-live', ...)`, and `this.setAttribute('aria-hidden', ...)` on `this` (the outer `<a2ui-basic-button>`, `<a2ui-basic-textfield>`, `<a2ui-checkbox>`, `<a2ui-slider>`, `<a2ui-choicepicker>` custom element host), which has no ARIA role and is not focusable.
- Meanwhile, the inner focusable `<button>`, `<input>`, and `<textarea>` elements never receive `aria-label` or `aria-describedby`. Worse still:
  - `TextField.ts` (lines 71–85) renders `<label>${props.label}</label><input ... />` **without** `for`/`id` association or wrapping `<label>`.
  - `Slider.ts` (lines 78–101) renders `<span class="a2ui-slider-label">${props.label}</span><input type="range" ... />` with no `<label>` or `aria-label` on `<input type="range">`.
- **Impact**: When a keyboard or screen-reader user tabs to the `<input>` or `<button>`, assistive technologies inspect the focusable element and find an unlabelled control, failing `a2ui_framework_adapter.blueprint.md` (line 86: *"reach the platform accessibility API on the focusable element"*) and `conformance/core/accessibility.yaml` (`button-name`, `label`).

### Bug 2: Public `A2uiLitElement` and `@a2ui/react` Adapter Do Not Plumb `accessibility` Attributes to Custom Components
- **Location**:
  - `typescript/renderers/lit/src/v1_0/a2ui-lit-element.ts` (lines 1–169)
  - `typescript/renderers/react/src/v1_0/adapter.tsx` (lines 43–77)
  - `typescript/core/web_core/src/v1_0/adapter/react_host_element.ts` (lines 31–116)
- **Root Cause**: `applyAccessibilityAttributes()` is implemented only inside the internal `BasicCatalogA2uiLitElement` subclass in `@a2ui/web_core`, **not** in the public `A2uiLitElement` base class exported by `@a2ui/lit`. In `@a2ui/react`, `createComponentImplementation()` wraps React components in `ReactWcHost` (`style.display = 'contents'`) and passes `props` to the React component, but neither `ReactWcHost` nor `adapter.tsx` resolves or applies `accessibility` attributes (`label`, `description`, `live`, `hidden`) to the DOM.

### Bug 3: `accessibility.hidden: true` Leaves Focusable Descendants in the Tab Order (`aria-hidden-focus` Violation)
- **Location**: `typescript/core/web_core/src/universal/basic_catalog/components/basic-catalog-a2ui-lit-element.ts` (line 136).
- **Root Cause**: When `accessibility.hidden` evaluates to `true`, `BasicCatalogA2uiLitElement` executes `this.setAttribute('aria-hidden', 'true')` on the outer element without setting `this.inert = true` or removing descendant `<button>`/`<input>` elements from the keyboard tab order.
- **Impact**: Directly violates WAI-ARIA rules and fails `conformance/core/accessibility.yaml`'s `test_accessibility_hidden_subtree` (`axeRules: [aria-hidden-focus]`, lines 97–128).

### Bug 4: `aria-description` vs. Spec-Mandated `aria-describedby`
- **Location**: `typescript/core/web_core/src/universal/basic_catalog/components/basic-catalog-a2ui-lit-element.ts` (line 131) vs. `specification/v1_0/docs/a2ui_protocol.md` (line 525).
- **Root Cause**: `a2ui_protocol.md` (line 525) explicitly lists `aria-describedby` for plumbing `accessibility.description`, whereas `BasicCatalogA2uiLitElement` only sets `aria-description` (a WAI-ARIA 1.3 draft attribute with incomplete support across older screen readers) without rendering a linked `aria-describedby` helper node.

### Bug 5: Conformance Runner Skips `accessibility.yaml`
- **Location**: `typescript/core/web_core/tests/conformance/conformance_test.mjs` (line 193 and lines 1071–1073).
- **Root Cause**: `'accessibility.yaml'` is hardcoded in `SKIP_TEST_SUITES`, and `validateAccessibilityCheckTestCase()` is a stub (`// No-op for now as accessibility tests are skipped`), allowing the above regressions in `BasicCatalogA2uiLitElement` to go undetected in CI.
