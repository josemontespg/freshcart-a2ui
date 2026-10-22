# Shard 08: A2UI v1.0 Accessibility (`AccessibilityAttributes`) — Bug Bash Issues

- **Feature Area**: `Accessibility`
- **Source Learnings Doc**: `/usr/local/google/home/josemontesp/freshcart-a2ui-prs/08-accessibility/docs/PR_08_ACCESSIBILITY_LEARNINGS.md`
- **Total Issues**: 8 (`3` Documentation Gaps + `5` Bugs)

---

## [ISSUE-08-01] [docs] `docs/public/reference/components.md` documents non-existent `accessibility.role` property (which fails strict v1.0 schema validation) and omits `description`, `live`, and `hidden`
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Accessibility`
- **Title**: `[docs][v1.0] reference/components.md documents invalid 'accessibility.role' property and omits 'description', 'live', and 'hidden'`

<!-- ISSUE_BODY_START -->
### Summary
In `docs/public/reference/components.md`, the **Common Properties** section states that `accessibility` accepts `(label, role)`. However, in both the A2UI v1.0 JSON Schema (`specification/v1_0/json/common_types.json#/$defs/AccessibilityAttributes`) and `@a2ui/web_core`'s Zod validator (`AccessibilityAttributesSchema`), `AccessibilityAttributes` uses `additionalProperties: false` / `.strict()` and only allows `{ label, description, live, hidden }`. Passing `accessibility.role` causes `PayloadValidator` to reject the component with a validation error, while the actual v1.0 properties (`description`, `live`, `hidden`, and dynamic `@path` / `@call` bindings) are undocumented.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `docs/public/reference/components.md` (lines 603–610)
  - `specification/v1_0/json/common_types.json` (lines 15–39)
  - `typescript/core/web_core/src/v1_0/types/common-types.ts` (lines 28–33)

### Steps to Reproduce / Evidence
1. Inspect `docs/public/reference/components.md` (lines 603–610):
   ```markdown
   ## Common Properties

   All components share:

   - `id` (required): Unique identifier within the surface.
   - `accessibility`: Accessibility attributes (label, role).
   - `weight`: Flex-grow value when inside a Row or Column.
   ```
2. Compare against `specification/v1_0/json/common_types.json` (lines 15–39):
   ```json
   "AccessibilityAttributes": {
     "type": "object",
     "properties": {
       "label": { "$ref": "#/$defs/DynamicString" },
       "description": { "$ref": "#/$defs/DynamicString" },
       "live": {
         "type": "string",
         "enum": ["off", "polite", "assertive"],
         "default": "off"
       },
       "hidden": {
         "$ref": "#/$defs/DynamicBoolean",
         "default": false
       }
     },
     "additionalProperties": false
   }
   ```
3. Validate a component following the documentation's `(label, role)` hint using `@a2ui/web_core/v1_0`:
   ```ts
   import { PayloadValidator, basicCatalog } from '@a2ui/web_core/v1_0';

   const validator = new PayloadValidator([basicCatalog]);
   const errors = validator.validateUpdateComponents('main', [
     {
       id: 'root',
       component: 'Text',
       text: 'Alert banner',
       accessibility: { label: 'Alert', role: 'alert' } as any,
     },
   ]);
   console.log(errors);
   // Validation fails: Unrecognized key(s) in object: 'role'
   ```

### Expected Behavior
`docs/public/reference/components.md` should accurately document the four `AccessibilityAttributes` properties defined in `common_types.json`:
- `label` (`DynamicString`: literal string, `{"@path": "..."}`, or `{"@call": "..."}`)
- `description` (`DynamicString`: literal string, `{"@path": "..."}`, or `{"@call": "..."}`)
- `live` (`"off" | "polite" | "assertive"`, default `"off"`)
- `hidden` (`DynamicBoolean`: literal boolean, `{"@path": "..."}`, or `{"@call": "..."}`, default `false`)

### Actual Behavior
`docs/public/reference/components.md` claims `accessibility` accepts `(label, role)`, misleading developers and LLM system prompts into emitting `accessibility.role`, which is rejected by strict v1.0 schema validation.

### Suggested Fix
Update `docs/public/reference/components.md` (line 608) to remove `role` and list `label`, `description`, `live` (`"off" | "polite" | "assertive"`), and `hidden` (`DynamicBoolean`), including an example showing static and dynamic (`@path` / `@call`) accessibility bindings.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-08-02] [docs] `docs/public/roadmap.md` lists Accessibility and ARIA attribute generation as unimplemented future work despite shipping in v1.0
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Accessibility`
- **Title**: `[docs][v1.0] docs/public/roadmap.md lists Accessibility & ARIA attribute generation as future work despite shipping in v1.0`

<!-- ISSUE_BODY_START -->
### Summary
`docs/public/roadmap.md` lists **"Accessibility Features"** (including *"ARIA attribute generation"* and *"Screen reader optimization"*) under unimplemented future considerations, even though `AccessibilityAttributes` (`label`, `description`, `live`, `hidden`), the Catalog-Agnostic Accessibility Requirements in `a2ui_protocol.md`, the conformance test suite (`conformance/core/accessibility.yaml`), and `BasicCatalogA2uiLitElement.applyAccessibilityAttributes()` are already shipped in A2UI v1.0.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/roadmap.md` (lines 133–141)
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 519–528)
  - `specification/v1_0/docs/evolution_guide.md` (line 35)
  - `conformance/core/accessibility.yaml` (lines 1–211)

### Steps to Reproduce / Evidence
1. Inspect `docs/public/roadmap.md` (lines 133–141):
   ```markdown
   ### Accessibility Features

   First-class accessibility support:

   - ARIA attribute generation
   - Screen reader optimization
   - Keyboard navigation standards
   - Contrast and color guidance
   ```
2. Compare against `specification/v1_0/docs/a2ui_protocol.md` (lines 519–528, *"Catalog-Agnostic Accessibility Requirements"*) and `specification/v1_0/docs/evolution_guide.md` (line 35: *"Added `live` property (`off`, `polite`, `assertive`) to `AccessibilityAttributes`"*).

### Expected Behavior
`docs/public/roadmap.md` should reflect that `AccessibilityAttributes` (`label`, `description`, `live`, `hidden`), dynamic `@path`/`@call` bindings on accessibility properties, and semantic label inference are shipped in v1.0, and link to reference documentation for using them.

### Actual Behavior
Readers consulting `docs/public/roadmap.md` are told that ARIA attribute generation and screen-reader support do not exist yet in A2UI.

### Suggested Fix
Update `docs/public/roadmap.md` (lines 133–141) to move v1.0 `AccessibilityAttributes` (`label`, `description`, `live`, `hidden`) and semantic label inference to shipped capabilities, leaving only future enhancements (such as automated contrast themes or custom focus-trap primitives) under Future Considerations.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-08-03] [docs] Missing public guide/reference for A2UI v1.0 `AccessibilityAttributes` (`live` regions, `hidden` subtrees, and semantic label inference)
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Accessibility`
- **Title**: `[docs][v1.0] Missing public documentation for AccessibilityAttributes ('live' regions, 'hidden' subtrees, and semantic label inference)`

<!-- ISSUE_BODY_START -->
### Summary
Although `specification/v1_0/docs/a2ui_protocol.md` (lines 519–528) and `conformance/core/accessibility.yaml` define comprehensive accessibility rules for A2UI v1.0 — including `live: "polite" | "assertive"` announcements, `hidden` subtree hiding (`DynamicBoolean`), explicit vs. inferred accessible labels, and reactive `@path`/`@call` bindings on `label` and `hidden` — none of these capabilities are documented anywhere in `docs/public/`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/reference/components.md` (lines 603–610)
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 519–528)
  - `conformance/core/accessibility.yaml` (lines 1–211)

### Steps to Reproduce / Evidence
1. Search `docs/public/` for `aria-live`, `assertive`, `AccessibilityAttributes`, or `accessibility.hidden` — zero matches exist across the public documentation site (`a2ui.org`).
2. Compare against `specification/v1_0/docs/a2ui_protocol.md` (lines 519–528):
   - **Plumb Accessibility Attributes**: Map `label`, `description`, `live`, and `hidden` to platform accessibility APIs (`aria-label`, `aria-describedby`, `aria-live`, `aria-hidden`).
   - **Infer Default Semantics**: Infer accessible names from visible text properties (`title`, `label`, or child `Text` on `Button`) when explicit `AccessibilityAttributes` are omitted.
   - **Dynamic Bindings**: Bind `accessibility.label`, `accessibility.description`, and `accessibility.hidden` to `@path` or `@call`.

### Expected Behavior
`docs/public/` should document:
1. All four properties of `AccessibilityAttributes` (`label`, `description`, `live`, `hidden`) and their types (`DynamicString`, `'off' | 'polite' | 'assertive'`, `DynamicBoolean`).
2. When agents should use `live: "polite"` (status updates, counters) vs. `live: "assertive"` (urgent alerts, validation errors).
3. How renderer authors must implement the "Plumb Accessibility Attributes" and "Infer Default Semantics" rules from `a2ui_protocol.md`.

### Actual Behavior
Public documentation (`docs/public/`) has no coverage of v1.0 accessibility features.

### Suggested Fix
Add an Accessibility section to `docs/public/reference/components.md` (and/or a dedicated guide under `docs/public/guides/`) covering `AccessibilityAttributes`, dynamic `@path`/`@call` bindings, `live` regions, `hidden` subtrees, and semantic label inference.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-08-04] [web_core] `BasicCatalogA2uiLitElement` sets ARIA attributes on the roleless outer custom element host instead of the inner focusable `<button>` / `<input>` control
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Accessibility`
- **Title**: `[v1.0][web_core] BasicCatalogA2uiLitElement sets ARIA attributes on outer custom element host instead of inner focusable control`

<!-- ISSUE_BODY_START -->
### Summary
`BasicCatalogA2uiLitElement.applyAccessibilityAttributes()` sets `aria-label`, `aria-description`, `aria-live`, and `aria-hidden` on `this` (the outer custom element host such as `<a2ui-basic-button>`, `<a2ui-basic-textfield>`, `<a2ui-checkbox>`, `<a2ui-slider>`, or `<a2ui-choicepicker>`) rather than on the inner focusable native HTML control (`<button>`, `<input>`, `<textarea>`). In addition, `TextField.ts` renders `<label>${props.label}</label><input ... />` without `for`/`id` association, and `Slider.ts` renders `<span class="a2ui-slider-label">${props.label}</span><input type="range" ... />` with no label or `aria-label` on `<input type="range">`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/universal/basic_catalog/components/basic-catalog-a2ui-lit-element.ts` (lines 128–145)
  - `typescript/core/web_core/src/universal/basic_catalog/components/Button.ts` (lines 101–113)
  - `typescript/core/web_core/src/universal/basic_catalog/components/TextField.ts` (lines 97–114)
  - `typescript/core/web_core/src/universal/basic_catalog/components/Slider.ts` (lines 76–93)
  - `typescript/core/web_core/src/universal/basic_catalog/components/CheckBox.ts` (lines 49–59)

### Steps to Reproduce / Evidence
1. In `basic-catalog-a2ui-lit-element.ts` (lines 128–137), `applyAccessibilityAttributes` mutates attributes on `this` (the custom element host):
   ```ts
   private applyAccessibilityAttributes(a11y?: ResolvedAccessibilityAttributes): void {
     this.setOrRemoveAttribute('aria-label', a11y?.label);
     this.setOrRemoveAttribute('aria-description', a11y?.description);
     this.setOrRemoveAttribute('aria-live', a11y?.live);
     if (typeof a11y?.hidden === 'boolean') {
       this.setAttribute('aria-hidden', String(a11y.hidden));
     } else {
       this.removeAttribute('aria-hidden');
     }
   }
   ```
2. Meanwhile, `TextField.ts` (lines 97–114) renders an unassociated `<label>` and an `<input>` without `id` or `aria-label`:
   ```ts
   return html`
     ${props.label ? html`<label>${props.label}</label>` : nothing}
     ${props.variant === 'longText'
       ? html`<textarea class=${classMap(classes)} ...></textarea>`
       : html`<input type=${type} class=${classMap(classes)} ... />`}
   `;
   ```
3. And `Slider.ts` (lines 78–90) renders a `<span>` and an `<input type="range">` with no `<label>` or `aria-label`:
   ```ts
   <div class="a2ui-slider-header">
     <span class="a2ui-slider-label">${props.label}</span>
     <span class="a2ui-slider-value">${props.value}</span>
   </div>
   <input type="range" min=${min} max=${max} ... class="a2ui-slider" />
   ```
4. Render an icon-only `Button` with `accessibility: { label: "Close dialog" }` or a `Slider` / `TextField`:
   - The resulting DOM is `<a2ui-basic-button aria-label="Close dialog"><button type="button">...</button></a2ui-basic-button>`.
   - Because `<a2ui-basic-button>` has no ARIA `role`, setting `aria-label` on it triggers WAI-ARIA `aria-prohibited-attr` / `aria-allowed-attr` warnings, while the inner focusable `<button>` has an empty accessible name (`""`), failing `conformance/core/accessibility.yaml` (`button-name`, `label`).

### Expected Behavior
Per `conformance/core/accessibility.yaml` (`test_accessibility_attributes_plumbing` and `test_accessibility_interactive_roles_and_states`) and `specification/v1_0/docs/a2ui_protocol.md` (lines 519–528):
- Interactive components (`Button`, `TextField`, `CheckBox`, `Slider`, `DateTimeInput`, `ChoicePicker`) must apply `aria-label` and `aria-describedby` / `aria-description` directly to the focusable native control (`<button>`, `<input>`, `<textarea>`) or associate `<label for="...">` with `<input id="...">`.

### Actual Behavior
`aria-label` and `aria-description` are placed only on the non-focusable, roleless outer custom element tag, leaving the inner `<button>`, `<input>`, and `<textarea>` unlabelled to screen readers and failing axe-core `button-name` and `label` rules.

### Suggested Fix
1. Provide a helper on `BasicCatalogA2uiLitElement` (or forward `props.accessibility` in `Button.ts`, `TextField.ts`, `Slider.ts`, `CheckBox.ts`, `DateTimeInput.ts`, `ChoicePicker.ts`) so interactive components bind `aria-label={props.accessibility?.label || props.label || nothing}` and `aria-describedby` directly onto the inner focusable `<button>`, `<input>`, or `<textarea>`.
2. In `TextField.ts` and `Slider.ts`, associate `<label for=${inputId}>` with `<input id=${inputId}>`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-08-05] [web_core / lit / react] Custom catalog components extending `A2uiLitElement` or `@a2ui/react` `createComponentImplementation` receive zero automatic `accessibility` attribute plumbing
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Accessibility`
- **Title**: `[v1.0][web_core][react] Public A2uiLitElement and @a2ui/react adapters do not plumb ComponentCommon.accessibility attributes`

<!-- ISSUE_BODY_START -->
### Summary
`specification/v1_0/docs/a2ui_protocol.md` (lines 519–528, *"Catalog-Agnostic Accessibility Requirements"*) states that plumbing `AccessibilityAttributes` (`label`, `description`, `live`, `hidden`) from `ComponentCommon` is a catalog-agnostic renderer responsibility. However, in the TypeScript SDKs:
1. `applyAccessibilityAttributes()` is implemented only on the `@internal` `BasicCatalogA2uiLitElement` subclass, **not** on the public `A2uiLitElement` base class (`typescript/core/web_core/src/universal/a2ui-lit-element.ts`).
2. In `@a2ui/react`, neither `createComponentImplementation()` (`typescript/renderers/react/src/adapter.tsx`) nor `ReactWcHost` (`typescript/renderers/react/src/catalog/react_host_element.ts`) resolves or applies `accessibility` (`label`, `description`, `live`, `hidden`) to the DOM.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm packages `@a2ui/web_core@0.14.0`, `@a2ui/lit`, `@a2ui/react@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/universal/a2ui-lit-element.ts` (lines 57–329)
  - `typescript/core/web_core/src/universal/basic_catalog/components/basic-catalog-a2ui-lit-element.ts` (lines 56–146)
  - `typescript/renderers/react/src/adapter.tsx` (lines 38–106)
  - `typescript/renderers/react/src/catalog/react_host_element.ts` (lines 35–78)

### Steps to Reproduce / Evidence
1. Author a custom catalog component using `A2uiLitElement` (or `createComponentImplementation` in `@a2ui/react`):
   ```ts
   import { A2uiLitElement } from '@a2ui/web_core/v1_0';
   import { html } from 'lit';

   export class CustomCardElement extends A2uiLitElement<typeof CustomCardApi> {
     override render() {
       return html`<div class="custom-card">${this.controller.props?.title}</div>`;
     }
   }
   ```
2. Send an `updateComponents` message with `accessibility: { label: "Featured Deal", live: "polite", hidden: false }` on `CustomCard`.
3. Inspect the rendered DOM: neither `A2uiLitElement` nor `ReactWcHost` applies `aria-label`, `aria-description`/`aria-describedby`, `aria-live`, or `aria-hidden`.

### Expected Behavior
`A2uiLitElement` (for Lit/Universal web components) and `@a2ui/react`'s component wrapper should automatically resolve and plumb `ComponentCommon.accessibility` (`label`, `description`, `live`, `hidden`) so custom catalog components inherit catalog-agnostic accessibility support by default.

### Actual Behavior
Only internal Basic Catalog components extending `BasicCatalogA2uiLitElement` process `props.accessibility`; all custom Lit and React catalog components silently ignore `accessibility` unless every component author manually re-implements ARIA attribute plumbing.

### Suggested Fix
Move `applyAccessibilityAttributes()` (and `weight` flex handling) from `BasicCatalogA2uiLitElement` up into `A2uiLitElement.willUpdate()` in `typescript/core/web_core/src/universal/a2ui-lit-element.ts`, and handle `accessibility` in `@a2ui/react`'s `createComponentImplementation` / `ReactWcHost`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-08-06] [web_core] `accessibility.hidden: true` sets `aria-hidden="true"` without `inert`, leaving descendant `<button>` and `<input>` elements focusable (`aria-hidden-focus` violation)
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Accessibility`
- **Title**: `[v1.0][web_core] accessibility.hidden=true sets aria-hidden="true" without inert, violating axe-core aria-hidden-focus`

<!-- ISSUE_BODY_START -->
### Summary
When `accessibility.hidden` is `true` (or dynamically resolves to `true` via `@path`), `BasicCatalogA2uiLitElement.applyAccessibilityAttributes()` sets `aria-hidden="true"` on the element without setting `inert` (or hiding/disabling focusable descendants). When a container component (`Row`, `Column`, `Card`) has `accessibility: { hidden: true }` and contains an interactive child (`Button`, `TextField`, `CheckBox`), keyboard users can still Tab into the `aria-hidden="true"` subtree, violating WAI-ARIA rules and failing the `test_accessibility_hidden_subtree` conformance test in `conformance/core/accessibility.yaml`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/universal/basic_catalog/components/basic-catalog-a2ui-lit-element.ts` (lines 132–136)
  - `conformance/core/accessibility.yaml` (lines 97–128)

### Steps to Reproduce / Evidence
1. Inspect `conformance/core/accessibility.yaml` (lines 97–128, `test_accessibility_hidden_subtree`):
   ```yaml
   - name: test_accessibility_hidden_subtree
     description: >
       Verifies that setting hidden: true on a container hides both the
       container and its interactive children from the accessibility tree,
       and does not leave focusable elements inside an aria-hidden subtree.
     steps:
       - action: process_messages
         messages:
           - version: v1.0
             createSurface:
               surfaceId: main
               catalogId: https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json
           - version: v1.0
             updateComponents:
               surfaceId: main
               components:
                 - id: root
                   component: Row
                   accessibility:
                     hidden: true
                   children: [hidden_btn]
                 - id: hidden_btn
                   component: Button
                   child: hidden_btn_text
                   action:
                     event:
                       name: noop
     expect:
       accessibilityCheck:
         axeRules:
           - aria-hidden-focus
   ```
2. Inspect `basic-catalog-a2ui-lit-element.ts` (lines 132–136):
   ```ts
   if (typeof a11y?.hidden === 'boolean') {
     this.setAttribute('aria-hidden', String(a11y.hidden));
   } else {
     this.removeAttribute('aria-hidden');
   }
   ```
3. Because `<a2ui-row aria-hidden="true">` contains `<a2ui-basic-button><button type="button">...</button></a2ui-basic-button>` and `inert` is not set on `<a2ui-row>`, the inner `<button>` remains in the tab order, which triggers an immediate axe-core `aria-hidden-focus` failure.

### Expected Behavior
When `accessibility.hidden` is `true`, the element and its subtree must be hidden from assistive technologies **and** prevented from receiving keyboard focus (e.g., by setting `this.inert = true` alongside `aria-hidden="true"`), passing axe-core's `aria-hidden-focus` rule.

### Actual Behavior
`this.setAttribute('aria-hidden', 'true')` is set without `this.inert = true`, leaving descendant `<button>` and `<input>` elements focusable inside an `aria-hidden="true"` container.

### Suggested Fix
In `BasicCatalogA2uiLitElement.applyAccessibilityAttributes()` (and `A2uiLitElement`):
```ts
if (a11y?.hidden === true) {
  this.setAttribute('aria-hidden', 'true');
  this.inert = true;
} else {
  this.removeAttribute('aria-hidden');
  this.inert = false;
}
```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-08-07] [web_core] `BasicCatalogA2uiLitElement` uses `aria-description` instead of `aria-describedby` mandated by `a2ui_protocol.md`
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Accessibility`
- **Title**: `[v1.0][web_core] BasicCatalogA2uiLitElement only sets 'aria-description' without 'aria-describedby' fallback required by a2ui_protocol.md`

<!-- ISSUE_BODY_START -->
### Summary
`specification/v1_0/docs/a2ui_protocol.md` (line 525) specifies that renderers must plumb `AccessibilityAttributes` to web ARIA attributes using `aria-label`, `aria-describedby`, `aria-live`, and `aria-hidden`. However, `BasicCatalogA2uiLitElement.applyAccessibilityAttributes()` (`basic-catalog-a2ui-lit-element.ts:130`) only sets `aria-description` (a WAI-ARIA 1.3 draft attribute with incomplete support across browsers/screen readers) and never renders or links an `aria-describedby` target element.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/universal/basic_catalog/components/basic-catalog-a2ui-lit-element.ts` (line 130)
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 523–525)

### Steps to Reproduce / Evidence
1. Inspect `specification/v1_0/docs/a2ui_protocol.md` (lines 523–525):
   ```markdown
   1. **Plumb Accessibility Attributes**: Renderers MUST map the `AccessibilityAttributes` (`label`, `description`, `live`, `hidden`) defined in `ComponentCommon` to the underlying platform's accessibility API (e.g., `Semantics` in Flutter, `aria-label`/`aria-describedby`/`aria-live`/`aria-hidden` in Web, `Modifier.semantics` in Jetpack Compose).
   ```
2. Inspect `basic-catalog-a2ui-lit-element.ts` (line 130):
   ```ts
   this.setOrRemoveAttribute('aria-description', a11y?.description);
   ```

### Expected Behavior
Renderers should render a visually hidden description element (`<span id="..." class="sr-only">`) and link it via `aria-describedby` on the target element (optionally alongside `aria-description`), matching `a2ui_protocol.md` (line 525) and ensuring compatibility across WAI-ARIA 1.1/1.2 screen readers.

### Actual Behavior
Only `aria-description` is set on the outer host element, and `aria-describedby` is never populated.

### Suggested Fix
When `accessibility.description` is non-empty, render a visually-hidden `<span id="a2ui-desc-${componentId}">` and set `aria-describedby="a2ui-desc-${componentId}"` on the focusable/semantic element.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-08-08] [web_core] Conformance runner skips `accessibility.yaml` and leaves `validateAccessibilityCheckTestCase()` as a no-op stub
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Accessibility`
- **Title**: `[v1.0][web_core] Conformance test runner skips 'accessibility.yaml' and leaves validateAccessibilityCheckTestCase() unimplemented`

<!-- ISSUE_BODY_START -->
### Summary
`conformance/core/accessibility.yaml` defines 6 normative accessibility conformance tests for A2UI v1.0 (`test_accessibility_attributes_plumbing`, `test_accessibility_live_region_assertive`, `test_accessibility_hidden_subtree`, `test_accessibility_implicit_label_inference`, `test_accessibility_interactive_roles_and_states`, and `test_accessibility_dynamic_label_and_hidden_binding`). However, `typescript/core/web_core/tests/conformance/conformance_test.mjs` skips `accessibility.yaml` in `SKIP_TEST_SUITES` (line 193) and leaves `validateAccessibilityCheckTestCase()` as an empty no-op function (lines 1071–1074), and there is no DOM/Lit/React conformance runner executing `accessibility.yaml`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `typescript/core/web_core/tests/conformance/conformance_test.mjs` (lines 193, 1071–1074)
  - `conformance/core/accessibility.yaml` (lines 1–211)

### Steps to Reproduce / Evidence
1. Inspect `typescript/core/web_core/tests/conformance/conformance_test.mjs` (line 193):
   ```js
   const SKIP_TEST_SUITES = new Set(['accessibility.yaml', 'builder.yaml', 'macros.yaml']);
   ```
2. Inspect `typescript/core/web_core/tests/conformance/conformance_test.mjs` (lines 1071–1074):
   ```js
   function validateAccessibilityCheckTestCase() {
     // Accessibility tree rendering is handled by UI framework renderers (Lit, React, Angular, Flutter, SwiftUI),
     // not headless web_core state engines.
   }
   ```
3. Check `typescript/renderers/lit/src/tests/` and `typescript/renderers/react/`: neither package runs `conformance/core/accessibility.yaml` either.

### Expected Behavior
`conformance/core/accessibility.yaml` should be executed in CI against the Universal Web Components / Lit / React DOM renderers (checking resolved `accessibility` props, `targetId`, `expectedRole`, `expectedLabel`, `expectedDescription`, `expectedLive`, `expectedHidden`, `expectedChecked`, `expectedValueNow`, and `axeRules`).

### Actual Behavior
`accessibility.yaml` is completely skipped in `web_core` and not wired into `renderers/lit` or `renderers/react`, allowing DOM accessibility regressions (such as `aria-hidden-focus` and unlabelled `<input>`/`<button>` controls) to pass CI undetected.

### Suggested Fix
Implement `validateAccessibilityCheckTestCase()` against the rendered DOM tree (using the Universal Basic Catalog web components in `web_core` / `renderers/lit`) and remove `'accessibility.yaml'` from `SKIP_TEST_SUITES`.
<!-- ISSUE_BODY_END -->
