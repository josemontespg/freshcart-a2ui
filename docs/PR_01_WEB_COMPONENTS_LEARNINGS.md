# PR 01 — A2UI v1.0 Web Components & Universal Elements (`feat/01-web-components`)

- **Branch**: `feat/01-web-components`
- **Dedicated Live Preview Port**: `5181` (`http://josemontesp.c.googlers.com:5181`)
- **Author**: `@sec-a2ui-engine`
- **Protocol Target**: A2UI v1.0 (`version: "v1.0"`)

---

## 1. How We Discovered & Used It (Zero-Prior-Knowledge Evaluation)

Following the strict zero-prior-knowledge simulation rules, we discovered A2UI's Web Component and Universal Element architecture exclusively through public sources:
1. **Public GitHub (`google/A2UI`)**:
   - `docs/public/guides/authoring-universal-components.md`
   - `typescript/core/web_core/src/universal/` (`a2ui-lit-element.ts`, `a2ui-controller.ts`, `register.ts`, `types.ts`, `to_web_component_implementation.ts`, `render_node.ts`)
   - `typescript/core/web_core/src/catalogs/basic/v1/` (`basic_catalog_a2ui_lit_element.ts`, `catalog.ts`, and all 18 v1.0 Basic Catalog Web Component implementations)
   - `typescript/renderers/react/src/catalog/` (`to_web_component.tsx`, `react_host_element.ts`, `host_registry.tsx`)
   - `typescript/renderers/react/src/core/A2uiSurface.tsx`
2. **Public npm Packages (`@a2ui/web_core@0.14.0` and `@a2ui/react@0.14.0`)**:
   - Inspected `node_modules/@a2ui/web_core/package.json` exports (`./universal`, `./catalogs/basic/v1`, `./v1_0`) and `node_modules/@a2ui/react/chunk-QAAGXJWH.js`.

### Architectural Findings
- **Every v1.0 Basic Component in `@a2ui/web_core` is a Lit Custom Element**: Under `typescript/core/web_core/src/catalogs/basic/v1/`, all 18 v1.0 Basic Catalog components (`<a2ui-basic-button>`, `<a2ui-basic-text>`, `<a2ui-basic-column>`, `<a2ui-basic-row>`, `<a2ui-card>`, `<a2ui-slider>`, `<a2ui-choicepicker>`, `<a2ui-checkbox>`, `<a2ui-tabs>`, `<a2ui-modal>`, etc.) extend `BasicCatalogA2uiLitElement` (which extends `A2uiLitElement<Api>`).
- **Universal Registration & Reactive Binding**: `registerUniversalElement(tagName, elementClass)` registers the Custom Element with `customElements.define(tagName, elementClass)` and returns `{ tagName }`. When `renderA2uiNode(node, catalog)` mounts an element, it attaches `element.node = node` and `element.catalog = catalog`. Inside `A2uiLitElement`, `A2uiController` subscribes to `node.context` via `@preact/signals-core` `effect()` and calls `onUpdate(resolvedProperties)` whenever bound DataModel paths change.
- **React ↔ Web Component Portal Bridge (`@a2ui/react`)**: `@a2ui/react` converts React catalog entries into Custom Elements via `toWebComponent()`, generating a dynamic `class extends ReactWcHost` (`<a2ui-react-${name}>` with `display: contents`) that registers with `HostRegistry` so `<A2uiSurface>` can render a `ReactDOM.createPortal(...)` directly into the Custom Element host while preserving React contexts across arbitrary React ↔ Web Component nesting levels.

---

## 2. What We Built in This PR

We created a live, consumer-friendly **Web Components Showcase** inside FreshCart's AI Personal Shopper (`src/a2ui/web-components/freshcartWebComponents.ts`, bridged in `src/a2ui/catalogs/groceryCatalogRenderer.tsx` and `src/a2ui/A2UISurfaceRenderer.tsx`):

1. **`<freshcart-nutrition-ring>` (`NutritionRingWC`)**:
   - A W3C Custom Element registered via `customElements.define('freshcart-nutrition-ring', FreshCartNutritionRingElement)`.
   - Renders an interactive 3-ring concentric SVG radial macro & calorie gauge (Protein in `#0AAD0A` emerald, Carbs in `#F59E0B` amber, Healthy Fat in `#0EA5E9` sky blue) with clickable macro inspection cards.
   - Includes interactive `-` / `+` serving steppers inside the Web Component that dispatch `CustomEvent('freshcart-wc-change', { detail: { path: '/servings', value }, bubbles: true, composed: true })`, updating the A2UI v1.0 surface `dataModel` at `/servings` and staying two-way synchronized with the standard A2UI v1.0 `Slider` and `Button` components on the same surface.

2. **`<freshcart-aisle-stepper>` (`AisleStepperWC`)**:
   - A W3C Custom Element registered via `customElements.define('freshcart-aisle-stepper', FreshCartAisleStepperElement)`.
   - Renders an interactive in-store aisle route & express pickup navigator (`Aisle 1 · Organic Produce` → `Aisle 4 · Seafood & Butcher` → `Aisle 7 · Artisan Bakery`).
   - Clicking any aisle stop dispatches `freshcart-wc-change` to update `/activeStopIndex` in the A2UI v1.0 `dataModel`. Clicking **"+ Add Stop Item"** dispatches `CustomEvent('freshcart-wc-action', { detail: { actionName: 'addToCart', productId, quantity: 1 }, bubbles: true, composed: true })`, adding the real store product directly into FreshCart's live shopping cart.

3. **`<freshcart-price-sparkline>` (`PriceSparklineWC`)**:
   - A W3C Custom Element registered via `customElements.define('freshcart-price-sparkline', FreshCartPriceSparklineElement)`.
   - Renders an interactive 8-week SVG price trend sparkline with clickable week markers and a **"🔒 Lock Deal & Add to Cart"** button that dispatches `freshcart-wc-action` to add the deal item to the FreshCart cart.

4. **1-Click Starter Chip & Default Showcase**:
   - Added the **`🧩 Interactive Web Components`** starter chip in `ScenarioSelector.tsx` / `AIShopperDrawer.tsx` and configured the AI Personal Shopper on port `5181` to open directly into the interactive Web Components Showcase.
   - Taught the live Gemini A2UI v1.0 system instruction in `vite.config.ts` how to emit `NutritionRingWC`, `AisleStepperWC`, and `PriceSparklineWC`.

---

## 3. Public Documentation Gaps & Friction

### `DOC-GAP-WC-01`: `authoring-universal-components.md` Exclusively Documents `v0.9` Imports & Wire Syntax
- **Location**: `docs/public/guides/authoring-universal-components.md` (lines 76–260, 502–569)
- **What is missing**: Every single code snippet in the official Universal Components guide imports from `@a2ui/web_core/v0_9`, `@a2ui/web_core/v0_9/universal`, and `@a2ui/react/v0_9`, and feeds `version: 'v0.9'` envelopes with legacy `{"path": "/user/name"}` bindings. There is zero documentation of:
  - `@a2ui/web_core/universal` (the unversioned top-level export in `@a2ui/web_core@0.14.0`)
  - `@a2ui/web_core/catalogs/basic/v1` (where the v1.0 Lit Web Components actually live)
  - `@a2ui/web_core/v1_0` or v1.0 `{"@path": "/..."}` bindings inside Universal Components.

### `DOC-GAP-WC-02`: `toWebComponentImplementation(element, api)` Is Used by All 18 v1.0 Components but Undocumented
- **Location**: `typescript/core/web_core/src/universal/to_web_component_implementation.ts` & `typescript/core/web_core/src/catalogs/basic/v1/catalog.ts`
- **What is missing**: The guide tells developers to manually call `registerUniversalElement('my-counter', MyCounter)` and assemble `{ ...CounterApi, tagName }`. Meanwhile, every official v1.0 component in `catalogs/basic/v1/catalog.ts` uses `toWebComponentImplementation(ButtonElement, ButtonApi)` which auto-derives the hyphenated tag name (`a2ui-${lowercaseName}`) and registers the element. This helper is neither documented in `authoring-universal-components.md` nor re-exported from `src/universal/index.ts`.

### `DOC-GAP-WC-03`: Direct Contradiction Between `A2uiLitElement` JSDoc and Guide on Shadow DOM vs. Light DOM Default
- **Location**:
  - `typescript/core/web_core/src/universal/a2ui-lit-element.ts:48-51`
  - `docs/public/guides/authoring-universal-components.md:440-495`
  - `typescript/core/web_core/src/catalogs/basic/v1/basic_catalog_a2ui_lit_element.ts:25-30`
- **Details**: The JSDoc on `A2uiLitElement` states: *"By default, it renders into the Light DOM (`createRenderRoot` returns `this`) to simplify styling and DOM traversal for child components."* However, `A2uiLitElement` does **not** override `createRenderRoot()`; only `BasicCatalogA2uiLitElement` overrides `createRenderRoot() { return this; }`. Subclasses of `A2uiLitElement` actually render into **Shadow DOM** by default unless the author manually overrides `createRenderRoot()`.

### `DOC-GAP-WC-04`: Undocumented `<a2ui-react-*>` Custom Element Wrapping & Tag Collision Behavior in `@a2ui/react`
- **Location**: `typescript/renderers/react/src/catalog/to_web_component.tsx`
- **Details**: Developers inspecting the DOM in `@a2ui/react` see `<a2ui-react-button>`, `<a2ui-react-text-2>`, etc., with `display: contents`, because `@a2ui/react` wraps every `ReactComponentImplementation` into a generated Custom Element (`ReactWcHost`) and portals React children into it. This architecture—and its implications for CSS child selectors (`.parent > .child`) and DevTools inspection—is completely undocumented.

---

## 4. Bugs, Spec Mismatches & Broken Expectations

### `BUG-WC-01` (Critical): `@a2ui/react@0.14.0` Crashes at Module Import Time in SSR / Node.js (`ReferenceError: HTMLElement is not defined`)
- **Location**: `node_modules/@a2ui/react/chunk-QAAGXJWH.js:98` (`typescript/renderers/react/src/catalog/react_host_element.ts:35`)
- **Reproduction**:
  ```bash
  node -e "import('@a2ui/react')"
  # ReferenceError: HTMLElement is not defined
  #   at chunk-QAAGXJWH.js:98:32
  ```
- **Root Cause**: `class ReactWcHost extends HTMLElement` is evaluated unconditionally at top-level module scope when `@a2ui/react` is imported. Any Next.js, Remix, Astro, or Vite SSR build that imports `@a2ui/react` crashes immediately on the server before any component renders.
- **Recommended Fix**: Guard the base class (`const BaseElement = typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as typeof HTMLElement)`) and guard `customElements.define` with `typeof customElements !== 'undefined'`.

### `BUG-WC-02` (High): `A2uiLitElement.adoptLightDomStyles()` Leaks Shadow DOM Styles into `document.adoptedStyleSheets`
- **Location**: `typescript/core/web_core/src/universal/a2ui-lit-element.ts:62-97`
- **Root Cause**: `A2uiLitElement.connectedCallback()` unconditionally calls `this.adoptLightDomStyles()`. Inside `adoptLightDomStyles()`, it calls `const root = this.getRootNode() as Document | ShadowRoot`. Because `this` is the Custom Element host itself (attached to the main document), `this.getRootNode()` returns the outer `Document` even when `this` uses its own `shadowRoot` (`this.renderRoot !== this`). It then rewrites `:host` to the element's tag name and appends the stylesheet to `document.adoptedStyleSheets`.
- **Impact**: Every `A2uiLitElement` subclass using default Shadow DOM needlessly duplicates its styles into the global `document.adoptedStyleSheets`.
- **Recommended Fix**: Only run `adoptLightDomStyles()` when `this.renderRoot === this` (i.e., when the element actually opted into Light DOM).

### `BUG-WC-03` (High): `@a2ui/react@0.14.0` Hardcodes `@a2ui/web_core/v0_9` and Lacks a `./v1_0` Export
- **Location**: `node_modules/@a2ui/react/package.json` & `node_modules/@a2ui/react/chunk-QAAGXJWH.js:1-9`
- **Root Cause**: `@a2ui/react@0.14.0` only exports `.` and `./v0_9`, and its bundle hardcodes imports from `@a2ui/web_core/v0_9` (`NodeResolver`, `GenericBinder`, `setMarkdownRenderer`, `registerUniversalElement`). It cannot natively process v1.0 surfaces (`version: "v1.0"`, `{"@path": "..."}`, `{"@call": "..."}`) without a custom v1.0 surface engine or adapter.

### `BUG-WC-04` (Medium): `toWebComponentImplementation` Omitted from `@a2ui/web_core/universal` Barrel Export
- **Location**: `typescript/core/web_core/src/universal/index.ts`
- **Root Cause**: `src/universal/index.ts` exports `A2uiLitElement`, `A2uiController`, `registerUniversalElement`, `isWebComponentImplementation`, and `renderA2uiNode`, but forgets to export `toWebComponentImplementation` from `./to_web_component_implementation.js`. External catalog authors cannot import it from `@a2ui/web_core/universal`.

### `BUG-WC-05` (Medium): `computeTagName` in `@a2ui/react` Leaks Custom Element Registrations Across HMR / Non-Memoized Catalogs
- **Location**: `typescript/renderers/react/src/catalog/to_web_component.tsx:24-48`
- **Root Cause**: `tagNameCache` is a `WeakMap<ReactComponentImplementation, string>`, whereas `tagNameCounts` is a module-global `Map<string, number>`. If a developer creates a catalog object inline or triggers Vite HMR (creating a new `ReactComponentImplementation` object identity with the same `component.name`), `tagNameCache.has(impl)` is `false`, `tagNameCounts` increments, and a new `<a2ui-react-text-2>`, `<a2ui-react-text-3>`, etc. class is permanently defined in `window.customElements`.
