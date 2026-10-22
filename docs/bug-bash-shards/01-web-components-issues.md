# Shard 01 — Web Components & Universal Elements (`01-web-components-issues.md`)

- **Author**: `@sec-a2ui-engine`
- **Source Learnings Document**: `/usr/local/google/home/josemontesp/freshcart-a2ui-prs/01-web-components/docs/PR_01_WEB_COMPONENTS_LEARNINGS.md`
- **Total Issues**: `9` (`5` Bugs + `4` Documentation Gaps)

---

## [ISSUE-01-01] [v1.0][react] Importing `@a2ui/react` in Node.js / SSR crashes with `ReferenceError: HTMLElement is not defined` in `ReactWcHost`
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Web Components & Universal Elements (@a2ui/react)`
- **Title**: `[v1.0][react] Importing @a2ui/react in Node.js / SSR crashes with ReferenceError: HTMLElement is not defined in ReactWcHost`

<!-- ISSUE_BODY_START -->
### Summary
Importing `@a2ui/react` (or `@a2ui/react/v0_9`) in any Node.js or Server-Side Rendering (SSR) environment (Next.js App/Pages Router, Remix, Astro, Vite SSR, or Vitest node environment) immediately throws `ReferenceError: HTMLElement is not defined` at module evaluation time before any component is rendered.

This happens because `ReactWcHost` in `typescript/renderers/react/src/catalog/react_host_element.ts` unconditionally evaluates `export class ReactWcHost extends HTMLElement` at top-level module scope without checking whether `HTMLElement` exists in `globalThis`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/react@0.14.0`
- **File path(s)**:
  - `typescript/renderers/react/src/catalog/react_host_element.ts` (lines 35–78)
  - Published npm bundle: `@a2ui/react@0.14.0/dist/chunk-QAAGXJWH.js` (line 98)

### Steps to Reproduce / Evidence
Run a minimal Node.js one-liner importing `@a2ui/react@0.14.0`:

```bash
npm install @a2ui/react@0.14.0 @a2ui/web_core@0.14.0 react react-dom zod
node -e "import('@a2ui/react')"
```

Output:
```text
file:///.../node_modules/@a2ui/react/dist/chunk-QAAGXJWH.js:98
var ReactWcHost = class extends HTMLElement {
                                ^

ReferenceError: HTMLElement is not defined
    at file:///.../node_modules/@a2ui/react/dist/chunk-QAAGXJWH.js:98:33
```

In `typescript/renderers/react/src/catalog/react_host_element.ts` (line 35):
```ts
/** The behaviour every host shares; `toWebComponent` derives one subclass per tag name. */
export class ReactWcHost extends HTMLElement implements ReactHostElement {
```

### Expected Behavior
Importing `@a2ui/react` in a Node.js or SSR environment should not crash at module evaluation time. Custom element host classes (`ReactWcHost`) should safely fall back to a no-op base class when `typeof HTMLElement === 'undefined'` (or be lazily constructed when running in a browser DOM environment).

### Actual Behavior
Top-level evaluation of `class ReactWcHost extends HTMLElement` throws `ReferenceError: HTMLElement is not defined`, breaking any SSR framework or Node test runner that imports `@a2ui/react`.

### Suggested Fix
Guard `HTMLElement` at module scope in `typescript/renderers/react/src/catalog/react_host_element.ts`:

```ts
const BaseHostElement: typeof HTMLElement =
  typeof HTMLElement !== 'undefined'
    ? HTMLElement
    : (class {} as unknown as typeof HTMLElement);

export class ReactWcHost extends BaseHostElement implements ReactHostElement {
  // ...
}
```
And in `registerUniversalElement` (`typescript/core/web_core/src/universal/register_universal_element.ts`), ensure `typeof customElements !== 'undefined'` is checked before calling `customElements.get` / `customElements.define`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-01-02] [v1.0][web_core] `A2uiLitElement.adoptLightDomStyles()` unconditionally leaks Shadow DOM styles into `document.adoptedStyleSheets`
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Web Components & Universal Elements (@a2ui/web_core)`
- **Title**: `[v1.0][web_core] A2uiLitElement.adoptLightDomStyles() unconditionally leaks Shadow DOM styles into document.adoptedStyleSheets`

<!-- ISSUE_BODY_START -->
### Summary
`A2uiLitElement` inherits `LitElement.createRenderRoot()`, which creates an open `ShadowRoot` by default unless a subclass explicitly overrides `createRenderRoot() { return this; }` to opt into Light DOM.

However, `A2uiLitElement.connectedCallback()` unconditionally calls `this.adoptLightDomStyles()` even when the element is rendering into its own `ShadowRoot`. Furthermore, inside `adoptLightDomStyles()`, `this.getRootNode()` is called on the custom element host (`this`), which returns the enclosing `Document` (not `this.shadowRoot`). As a result, every `A2uiLitElement` subclass using default Shadow DOM has its `:host` selectors rewritten to `tagName` and its styles injected into the global `document.adoptedStyleSheets`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/universal/a2ui-lit-element.ts` (lines 85–201)

### Steps to Reproduce / Evidence
Inspect `typescript/core/web_core/src/universal/a2ui-lit-element.ts` (lines 92–201):

```ts
  protected adoptLightDomStyles() {
    if (typeof document === 'undefined') return;
    const root = this.getRootNode() as Document | ShadowRoot;
    // ...
    // Replaces :host with tagName and prefixes all rules with tagName
    // ...
    const target =
      typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot
        ? root
        : typeof document !== 'undefined'
          ? document
          : undefined;
    // Appends constructor._processedSheet to target.adoptedStyleSheets!
  }

  override connectedCallback() {
    super.connectedCallback();
    this.adoptLightDomStyles();
  }
```

When a developer writes a standard `A2uiLitElement` subclass as shown in `docs/public/guides/authoring-universal-components.md` (lines 79–103):
```ts
@customElement('a2ui-stat-card')
export class StatCardElement extends A2uiLitElement<typeof StatCardApi> {
  static override styles = css`
    :host { display: block; }
    .title { font-size: 0.875rem; }
  `;
  // Uses default Shadow DOM (does not override createRenderRoot)
}
```
1. `super.connectedCallback()` creates `this.renderRoot` as a `ShadowRoot` and adopts `static styles` inside `this.shadowRoot`.
2. Immediately afterward, `this.adoptLightDomStyles()` runs, checks `this.getRootNode()` (which is `document`, because `this` is in the main document tree), rewrites `.title` to `a2ui-stat-card .title`, and pushes a duplicate `CSSStyleSheet` into `document.adoptedStyleSheets`.
3. Any Light DOM descendants or slotted content inside `<a2ui-stat-card>` are now unintentionally styled by the leaked global stylesheet.

### Expected Behavior
`adoptLightDomStyles()` should only execute when the component actually renders into Light DOM (i.e., `this.renderRoot === this`). When `this.renderRoot` is a `ShadowRoot`, Lit already scopes and adopts `static styles` into that `ShadowRoot`.

### Actual Behavior
`adoptLightDomStyles()` runs unconditionally for all `A2uiLitElement` instances and injects rewritten stylesheets into `document.adoptedStyleSheets` even when the element uses Shadow DOM.

### Suggested Fix
In `typescript/core/web_core/src/universal/a2ui-lit-element.ts`:

```ts
  override connectedCallback() {
    super.connectedCallback();
    if (this.renderRoot === this) {
      this.adoptLightDomStyles();
    }
  }
```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-01-03] [v1.0][react] `@a2ui/react@0.14.0` hardcodes `@a2ui/web_core/v0_9` imports and lacks a `./v1_0` export subpath
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Web Components & Universal Elements (@a2ui/react)`
- **Title**: `[v1.0][react] @a2ui/react@0.14.0 hardcodes @a2ui/web_core/v0_9 imports and lacks a ./v1_0 export subpath`

<!-- ISSUE_BODY_START -->
### Summary
While `@a2ui/web_core@0.14.0` ships `./v1_0` and `./catalogs/basic/v1`, `@a2ui/react@0.14.0` only exports `.`, `./v0_8`, and `./v0_9` in `package.json`, and its core Universal Component bridge files (`react_host_element.ts`, `to_web_component.tsx`, `host_registry.tsx`, `A2uiSurface.tsx`) hardcode imports from `@a2ui/web_core/v0_9` and `@a2ui/web_core/v0_9/universal`.

As a result, React applications targeting A2UI v1.0 (`version: "v1.0"`, `{"@path": "/..."}` data bindings, `{"@call": "..."}` functions) cannot import `@a2ui/react/v1_0` or pass a v1.0 `SurfaceModel` / v1.0 `Catalog` from `@a2ui/web_core/v1_0` without TypeScript type mismatches and runtime version conflicts.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/react@0.14.0`
- **File path(s)**:
  - `typescript/renderers/react/package.json` (lines 27–69)
  - `typescript/renderers/react/src/catalog/react_host_element.ts` (lines 17–18)
  - `typescript/renderers/react/src/catalog/to_web_component.tsx` (lines 18–21)

### Steps to Reproduce / Evidence
1. Inspect `typescript/renderers/react/package.json` (lines 27–69):
   - Exports exist for `"."`, `"./v0_8"`, `"./v0_9"`, `"./styles"`, and `"./styles/structural.css"`, but there is no `"./v1_0"` export.
2. Inspect `typescript/renderers/react/src/catalog/react_host_element.ts` (lines 17–18):
   ```ts
   import type {ComponentContext, ComponentNode} from '@a2ui/web_core/v0_9';
   import type {A2uiWebComponentElement} from '@a2ui/web_core/v0_9/universal';
   ```
3. Inspect `typescript/renderers/react/src/catalog/to_web_component.tsx` (lines 18–21):
   ```ts
   import {
     isWebComponentImplementation,
     type WebComponentImplementation,
   } from '@a2ui/web_core/v0_9/universal';
   ```

### Expected Behavior
`@a2ui/react` should expose a `./v1_0` subpath (and/or import version-agnostic core & universal primitives from `@a2ui/web_core` and `@a2ui/web_core/universal`) so React applications can render A2UI v1.0 surfaces and v1.0 Universal Web Components natively.

### Actual Behavior
`@a2ui/react@0.14.0` is coupled to `@a2ui/web_core/v0_9` and lacks `./v1_0` exports.

### Suggested Fix
1. Update `typescript/renderers/react/src/catalog/*` and `src/core/*` to import universal/core types from `@a2ui/web_core` and `@a2ui/web_core/universal` instead of `@a2ui/web_core/v0_9`.
2. Add a `src/v1_0/index.ts` entry point and `"./v1_0"` export map entry in `typescript/renderers/react/package.json` pairing `<A2uiSurface>` with `@a2ui/web_core/v1_0` and `@a2ui/web_core/catalogs/basic/v1`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-01-04] [v1.0][web_core] `toWebComponentImplementation` is omitted from `@a2ui/web_core/universal` barrel export
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Web Components & Universal Elements (@a2ui/web_core)`
- **Title**: `[v1.0][web_core] toWebComponentImplementation is omitted from @a2ui/web_core/universal barrel export`

<!-- ISSUE_BODY_START -->
### Summary
`typescript/core/web_core/src/universal/to_web_component_implementation.ts` defines `toWebComponentImplementation(element, api)` and `TaggedCustomElementConstructor`, which is the official helper used by all 18 v1.0 Basic Catalog Web Components in `typescript/core/web_core/src/catalogs/basic/v1/components/index.ts` to pair a `CustomElementConstructor` with a versioned `ComponentApi`.

However, `typescript/core/web_core/src/universal/index.ts` omits `toWebComponentImplementation` and `TaggedCustomElementConstructor` from its barrel exports, and `package.json` does not expose `./universal/to_web_component_implementation`. External developers cannot import `toWebComponentImplementation` from `@a2ui/web_core/universal`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/universal/index.ts` (lines 17–28)
  - `typescript/core/web_core/src/universal/to_web_component_implementation.ts` (lines 20–50)
  - `typescript/core/web_core/src/catalogs/basic/v1/components/index.ts` (lines 17, 59–82)

### Steps to Reproduce / Evidence
Attempt to import `toWebComponentImplementation` from `@a2ui/web_core/universal`:

```ts
import { toWebComponentImplementation } from '@a2ui/web_core/universal';
// TS2305: Module '"@a2ui/web_core/universal"' has no exported member 'toWebComponentImplementation'.
```

In `typescript/core/web_core/src/universal/index.ts` (lines 17–28):
```ts
export {
  A2uiLitElement,
  type ResolvedChildList,
  type A2uiChildRef,
  type ResolvedChildRef,
} from './a2ui-lit-element.js';
export {A2uiController} from './a2ui-controller.js';
export type {A2uiWebComponentElement} from './a2ui_web_component_element.js';
export {registerUniversalElement} from './register_universal_element.js';
export {isWebComponentImplementation} from './is_web_component_implementation.js';
export {renderA2uiNode} from './render-a2ui-node.js';
export type {WebComponentImplementation} from './web_component_implementation.js';
```
Notice `to_web_component_implementation.js` is never re-exported.

### Expected Behavior
`toWebComponentImplementation` and `type TaggedCustomElementConstructor` should be exported from `typescript/core/web_core/src/universal/index.ts` so external component library authors can pair version-agnostic `A2uiLitElement` subclasses with v0.9 and v1.0 `ComponentApi` schemas using the same helper as the built-in basic catalog.

### Actual Behavior
`toWebComponentImplementation` is inaccessible through `@a2ui/web_core/universal`.

### Suggested Fix
Add the export to `typescript/core/web_core/src/universal/index.ts`:
```ts
export {
  toWebComponentImplementation,
  type TaggedCustomElementConstructor,
} from './to_web_component_implementation.js';
```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-01-05] [v1.0][react] `toWebComponent()` `computeTagName` leaks `<a2ui-react-name-N>` custom element registrations across HMR and unmemoized catalogs
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Web Components & Universal Elements (@a2ui/react)`
- **Title**: `[v1.0][react] toWebComponent() computeTagName leaks <a2ui-react-name-N> custom element registrations across HMR and unmemoized catalogs`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/renderers/react/src/catalog/to_web_component.tsx`, `toWebComponent(implementation)` caches `WebComponentImplementation` wrappers in a `WeakMap<ReactComponentImplementation, WebComponentImplementation>` (`hosted`), while `computeTagName(name)` increments a module-global `Map<string, number>` (`tagNameCounts`).

Whenever a `ReactComponentImplementation` object reference is recreated with the same `.name`—which happens on every Vite/Webpack Hot Module Replacement (HMR) update or whenever a developer constructs a catalog inside a React component or factory function without global memoization—`hosted.get(implementation)` misses, `computeTagName` increments `tagNameCounts`, and a brand-new `class extends ReactWcHost {}` is registered in the global `window.customElements` registry as `<a2ui-react-button-2>`, `<a2ui-react-button-3>`, `<a2ui-react-button-4>`, etc. Because browser `CustomElementRegistry` entries can never be garbage-collected, this permanently leaks classes and DOM tag names.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/react@0.14.0`
- **File path(s)**:
  - `typescript/renderers/react/src/catalog/to_web_component.tsx` (lines 25–67)

### Steps to Reproduce / Evidence
Inspect `typescript/renderers/react/src/catalog/to_web_component.tsx` (lines 25–66):
```ts
const hosted = new WeakMap<ReactComponentImplementation, WebComponentImplementation>();
const tagNameCounts = new Map<string, number>();

function computeTagName(name: string): string {
  const baseTagName = `a2ui-react-${name.toLowerCase()}`;
  const count = (tagNameCounts.get(baseTagName) ?? 0) + 1;
  tagNameCounts.set(baseTagName, count);
  return count === 1 ? baseTagName : `${baseTagName}-${count}`;
}

export function toWebComponent<Schema extends ZodTypeAny = ZodTypeAny>(
  implementation: ReactComponentImplementation<Schema> | WebComponentImplementation<Schema>,
): WebComponentImplementation<Schema> {
  if (isWebComponentImplementation(implementation)) {
    return implementation;
  }

  const cached = hosted.get(implementation);
  if (cached) {
    return cached as WebComponentImplementation<Schema>;
  }

  const entry: WebComponentImplementation<Schema> = {
    ...implementation,
    tagName: computeTagName(implementation.name),
    // `customElements` refuses to define one class under two tag names.
    element: class extends ReactWcHost {},
  };

  hosted.set(implementation, entry);
  return entry;
}
```
Notice that `ReactWcHost` itself holds **zero component-specific implementation** (as stated in `react_host_element.ts` line 24: *"It holds no implementation"*—it simply delegates to `this._node` via `HostRegistry`). Creating a separate custom element tag name and subclass per `ReactComponentImplementation` identity is completely unnecessary!

### Expected Behavior
All React-hosted components with the same component name (or even a single shared `<a2ui-react-host>` custom element, or one element class per normalized component name `a2ui-react-${name}`) should reuse the existing `ReactWcHost` subclass registered in `customElements` rather than minting `-2`, `-3`, `-N` suffixes when object identity changes.

### Actual Behavior
Every new `ReactComponentImplementation` object reference for the same component name increments `tagNameCounts` and defines a new `<a2ui-react-name-N>` custom element in `window.customElements`.

### Suggested Fix
Since `ReactWcHost` is stateless and reads `this.node` at runtime, cache the host element constructor by normalized tag name (`Map<string, CustomElementConstructor>`) so re-creating a `ReactComponentImplementation` with `name: 'Badge'` reuses the same `tagName: 'a2ui-react-badge'` and `element` constructor.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-01-06] [v1.0][docs] `authoring-universal-components.md` exclusively documents `v0.9` imports and legacy `{"path": "..."}` bindings with zero `v1.0` examples
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Web Components & Universal Elements (Documentation)`
- **Title**: `[v1.0][docs] authoring-universal-components.md exclusively documents v0.9 imports and legacy {"path": "..."} bindings with zero v1.0 examples`

<!-- ISSUE_BODY_START -->
### Summary
`docs/public/guides/authoring-universal-components.md` is the primary developer guide for authoring Universal Web Components (`A2uiLitElement` and standard `HTMLElement` implementations). However, every single code snippet and payload example in the guide exclusively uses `v0.9` package subpaths (`@a2ui/web_core/v0_9`, `@a2ui/web_core/v0_9/universal`, `@a2ui/react/v0_9`, `@a2ui/angular/v0_9`, `@a2ui/lit/v0_9`), `version: 'v0.9'` envelopes, and legacy `{"path": "/user/name"}` data bindings.

There is no documentation anywhere in `authoring-universal-components.md` showing:
1. Top-level `@a2ui/web_core/universal` or `@a2ui/web_core/v1_0` imports.
2. `@a2ui/web_core/catalogs/basic/v1` (where the v1.0 Web Component basic catalog lives).
3. A2UI v1.0 wire payloads (`version: "v1.0"`, `{"@path": "/user/name"}`) with Universal Components.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/guides/authoring-universal-components.md` (lines 25–35, 73–76, 170–352, 436, 514–590)

### Steps to Reproduce / Evidence
Excerpts from `docs/public/guides/authoring-universal-components.md`:
- Lines 29–35:
  ```ts
  import {
    type ComponentApi,
    DynamicStringSchema,
    ChildListSchema,
    ActionSchema,
  } from '@a2ui/web_core/v0_9';
  ```
- Lines 73–76:
  ```ts
  import {
    A2uiLitElement,
    type WebComponentImplementation,
  } from '@a2ui/web_core/v0_9/universal';
  ```
- Lines 330–337:
  ```ts
  processor.processMessages([
    {
      version: 'v0.9',
      createSurface: {surfaceId: 'main', catalogId: 'my-catalog'},
    },
  ```
- Line 436:
  > If the agent bound `value` to a data model path (for example, `{"path": "/user/name"}`), calling `props.setValue()` updates that path...

### Expected Behavior
`docs/public/guides/authoring-universal-components.md` should document A2UI v1.0 imports (`@a2ui/web_core/v1_0`, `@a2ui/web_core/universal`, `@a2ui/web_core/catalogs/basic/v1`), v1.0 catalog registration (`version: '1.0'`), and v1.0 wire syntax (`version: 'v1.0'`, `{"@path": "/user/name"}`).

### Actual Behavior
Developers targeting A2UI v1.0 are only shown `v0_9` imports and `{"path": "..."}` syntax, leading to protocol version mismatches when integrating custom Web Components into v1.0 surfaces.

### Suggested Fix
Update `docs/public/guides/authoring-universal-components.md` to use `@a2ui/web_core/v1_0`, `@a2ui/web_core/universal`, and `@a2ui/web_core/catalogs/basic/v1` (or provide version tabs for `v1.0` and `v0.9`), and update line 436 to reference `{"@path": "/user/name"}`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-01-07] [v1.0][docs] `toWebComponentImplementation(element, api)` and `TaggedCustomElementConstructor` are undocumented in `authoring-universal-components.md`
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Web Components & Universal Elements (Documentation)`
- **Title**: `[v1.0][docs] toWebComponentImplementation(element, api)` and `TaggedCustomElementConstructor` are undocumented in `authoring-universal-components.md`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/core/web_core/src/catalogs/basic/v1/components/index.ts` (and `v0_9`), all 18 built-in Basic Catalog Web Components are defined once as version-agnostic `A2uiLitElement` classes with a `static readonly tagName` property and paired with version-specific `ComponentApi` schemas (`v0.9` vs `v1.0`) via `toWebComponentImplementation(ElementClass, Api)`.

However, `docs/public/guides/authoring-universal-components.md` never mentions `toWebComponentImplementation`, `static readonly tagName`, or how to share a single `A2uiLitElement` class across multiple protocol versions (`v0.9` and `v1.0`) by omitting `protected override readonly api` and letting `A2uiLitElement.findCatalogApi()` resolve the schema dynamically from the catalog.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/guides/authoring-universal-components.md` (lines 54–156)
  - `typescript/core/web_core/src/universal/to_web_component_implementation.ts` (lines 20–50)
  - `typescript/core/web_core/src/universal/a2ui-lit-element.ts` (lines 223–240)

### Steps to Reproduce / Evidence
Compare `docs/public/guides/authoring-universal-components.md` (lines 56–60):
> Your class needs to:
> 1. Set `protected override readonly api` to the API object. The base class uses its schema to resolve the incoming properties.

With `typescript/core/web_core/src/universal/a2ui-lit-element.ts` (lines 226–230):
```ts
  /**
   * Version-agnostic elements, such as the basic catalog's, leave `api` unset:
   * one element class is registered in the catalogs of several protocol
   * versions, and the props schema has to match the catalog the component
   * came from.
   */
```
And `typescript/core/web_core/src/catalogs/basic/v1/components/index.ts` (line 60):
```ts
export const A2uiButton = toWebComponentImplementation(A2uiBasicButtonElement, ButtonApi);
```

### Expected Behavior
`docs/public/guides/authoring-universal-components.md` should document `toWebComponentImplementation(ElementClass, Api)` and explain how component libraries supporting both A2UI `v0.9` and `v1.0` can leave `api` unset on the `A2uiLitElement` subclass and bind version-specific `ComponentApi` schemas per catalog.

### Actual Behavior
The guide only shows hardcoding `protected override readonly api = StatCardApi` on the element class and manually constructing `{ ...StatCardApi, tagName, element }`.

### Suggested Fix
Add a section to `docs/public/guides/authoring-universal-components.md` (and export `toWebComponentImplementation` from `@a2ui/web_core/universal`) illustrating how `toWebComponentImplementation(ElementClass, Api)` pairs a `TaggedCustomElementConstructor` with versioned `ComponentApi` definitions.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-01-08] [v1.0][docs][web_core] Contradictory documentation between `A2uiLitElement` JSDoc and `authoring-universal-components.md` on Light DOM vs Shadow DOM default
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Web Components & Universal Elements (Documentation / JSDoc)`
- **Title**: `[v1.0][docs][web_core] Contradictory documentation between A2uiLitElement JSDoc and authoring-universal-components.md on Light DOM vs Shadow DOM default`

<!-- ISSUE_BODY_START -->
### Summary
The TypeScript JSDoc on `A2uiLitElement` (`typescript/core/web_core/src/universal/a2ui-lit-element.ts`) explicitly claims that `A2uiLitElement` renders into the **Light DOM by default** and that subclasses must override `createRenderRoot()` to return `super.createRenderRoot()` if they want Shadow DOM.

In reality, `A2uiLitElement` does **not** override `createRenderRoot()`—only the internal `BasicCatalogA2uiLitElement` subclass overrides `createRenderRoot() { return this; }`. Meanwhile, `docs/public/guides/authoring-universal-components.md` states the exact opposite of the JSDoc: that `A2uiLitElement` renders into a **Shadow Root by default** and that subclasses must override `createRenderRoot() { return this; }` to opt into Light DOM.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `typescript/core/web_core/src/universal/a2ui-lit-element.ts` (lines 48–52, 88–91)
  - `typescript/core/web_core/src/universal/basic_catalog/components/basic-catalog-a2ui-lit-element.ts` (lines 60–65)
  - `docs/public/guides/authoring-universal-components.md` (lines 440–497)

### Steps to Reproduce / Evidence
1. Read `typescript/core/web_core/src/universal/a2ui-lit-element.ts` (lines 48–51 & 88–90):
   ```ts
   /**
    * By default, elements render into the Light DOM (direct children) to enable
    * universal CSS cascade, styling, and cross-framework composition. To opt into
    * Shadow DOM encapsulation, subclasses can override `createRenderRoot()` to return
    * `super.createRenderRoot()`.
    */
   ```
   and:
   ```ts
   /**
    * In Light DOM (the default for A2uiLitElement), the element has no shadow root of its own...
    */
   ```
2. Check the implementation of `A2uiLitElement` in `a2ui-lit-element.ts`: `createRenderRoot()` is **not** defined anywhere in `A2uiLitElement`, so it inherits `LitElement.createRenderRoot()` (Shadow DOM).
3. Read `docs/public/guides/authoring-universal-components.md` (lines 440, 488–494):
   > Like any `LitElement`, an `A2uiLitElement` renders into a Shadow Root by default, so its `static styles` are encapsulated.
   > If you want the host application's global stylesheet, design system, or utility classes (such as Tailwind or Bootstrap) to apply inside your component, opt into the Light DOM by overriding `createRenderRoot()`:
   > ```typescript
   > override createRenderRoot() {
   >   return this;
   > }
   > ```

### Expected Behavior
`A2uiLitElement`'s JSDoc and `docs/public/guides/authoring-universal-components.md` should agree on whether Shadow DOM or Light DOM is the default for `A2uiLitElement`.

### Actual Behavior
IDE hover tooltips (from `A2uiLitElement`'s JSDoc) tell developers that Light DOM is the default, while the actual runtime behavior and `authoring-universal-components.md` use Shadow DOM by default.

### Suggested Fix
Update the JSDoc comments in `typescript/core/web_core/src/universal/a2ui-lit-element.ts` (lines 48–52 and 88–91) to accurately state that `A2uiLitElement` renders into a Shadow Root by default (inheriting from `LitElement`), and that subclasses can opt into Light DOM by overriding `createRenderRoot() { return this; }` (as `BasicCatalogA2uiLitElement` does), in which case `adoptLightDomStyles()` scopes and adopts `static styles` into the enclosing Document or ShadowRoot.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-01-09] [v1.0][docs][react] Undocumented `<a2ui-react-*>` `ReactWcHost` wrapper elements and `display: contents` DOM structure in `@a2ui/react`
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Web Components & Universal Elements (@a2ui/react Documentation)`
- **Title**: `[v1.0][docs][react] Undocumented <a2ui-react-*> ReactWcHost wrapper elements and display: contents DOM structure in @a2ui/react`

<!-- ISSUE_BODY_START -->
### Summary
When using `@a2ui/react` with `<A2uiSurface>`, every React component in a catalog (`ReactComponentImplementation`) is converted by `prepareCatalogs()` → `toWebComponent()` into a Custom Element wrapper (`<a2ui-react-${name}>`, e.g., `<a2ui-react-card>`, `<a2ui-react-button>`) that sets `this.style.display = 'contents'` in `connectedCallback()` and uses `HostRegistry` + `ReactDOM.createPortal` when rendered inside a Web Component container.

None of this DOM structure or behavior is mentioned in `docs/public/guides/authoring-universal-components.md` or the React renderer documentation. This surprises developers writing CSS selectors (such as `.row > .child-item`, which fail to match because `<a2ui-react-*>` sits between the parent and child in the DOM tree even with `display: contents`) or writing DOM queries in tests (`container.querySelector(...)`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `typescript/renderers/react/src/catalog/react_host_element.ts` (lines 22–43)
  - `typescript/renderers/react/src/catalog/to_web_component.tsx` (lines 28–66)
  - `docs/public/guides/authoring-universal-components.md` (lines 213–266)

### Steps to Reproduce / Evidence
In `typescript/renderers/react/src/catalog/react_host_element.ts` (lines 35–43):
```ts
export class ReactWcHost extends HTMLElement implements ReactHostElement {
  // ...
  connectedCallback() {
    this.style.display = 'contents';
    this.register();
  }
```
When a Lit `Row` (`<a2ui-basic-row>`) renders a React child component `MyBadge`, the resulting DOM tree is:
```html
<a2ui-basic-row>
  <a2ui-react-mybadge style="display: contents;">
    <span class="my-badge">...</span>
  </a2ui-react-mybadge>
</a2ui-basic-row>
```
Any direct-child CSS selector (`.row > .my-badge`) breaks because `<a2ui-react-mybadge>` is the direct child in the DOM tree (`display: contents` affects layout box generation, not CSS selector combinator matching).

### Expected Behavior
`docs/public/guides/authoring-universal-components.md` (under the React tab / styling section) should document that `@a2ui/react` wraps React catalog components in `<a2ui-react-${name}>` (`display: contents`) custom elements for cross-framework portal hosting, and advise developers to avoid strict direct-child (`>`) CSS combinators across component boundaries.

### Actual Behavior
The `<a2ui-react-*>` wrapper elements and their impact on CSS direct-child combinators and DOM testing are completely undocumented.

### Suggested Fix
Add a callout in `docs/public/guides/authoring-universal-components.md` under the React section explaining `<a2ui-react-<name>>` host elements, `display: contents`, and why descendant selectors (or targeting the custom element tag directly) should be used instead of `>` combinators across component boundaries.
<!-- ISSUE_BODY_END -->
