# A2UI v1.0 Public Documentation Gaps & Onboarding Friction Log

**Author:** `a2ui-scout` (Zero-Prior-Knowledge External React Developer Simulation)  
**Date:** October 2026  
**Scope:** `https://a2ui.org`, `github.com/google/A2UI` (`docs/public/`, `specification/v1_0/`, `typescript/renderers/react/`, `samples/client/react/`)

---

## Summary Table of Documentation Gaps

| ID | Severity | Location | Summary of Documentation Gap |
| :--- | :--- | :--- | :--- |
| **DOC-GAP-01** | **CRITICAL** | `typescript/renderers/react/README.md`, `docs/public/reference/renderers.md`, `README.md` | Public docs state React v1.0 support is `🚧 Planned` and provide **zero v1.0 React quickstart**, even though `@a2ui/web_core@0.14.0` already ships `./v1_0` and `./catalogs/basic/v1` and works with `@a2ui/react`. |
| **DOC-GAP-02** | **HIGH** | `docs/public/guides/client-setup.md` (Lines 121–134) | React setup guide references nonexistent APIs (`<A2UISurface>` with capital `UI` instead of `A2uiSurface`, and a nonexistent `useA2UI()` hook) and has no code example at all. |
| **DOC-GAP-03** | **HIGH** | `docs/public/concepts/data-binding.md`, `docs/public/concepts/components.md`, `docs/public/reference/messages.md` | Concept & Reference pages use tabs labeled `"v0.9 and later"` that teach `{"path": "/user/name"}` and `"variant": "h1"`, which are **syntax/validation errors in v1.0** (`{"@path": "/user/name"}` and Markdown headings with `variant: "body" \| "caption"`). |
| **DOC-GAP-04** | **HIGH** | `specification/v1_0/docs/a2ui_protocol.md` (Line 1335) vs `PayloadValidator` | The v1.0 spec states UAX #31 applies to *catalog entity names* (component types, function names, property names) and uses `"id": "todo-index"` (with a hyphen) in its own `@index` example, but `@a2ui/web_core` enforces UAX #31 on component instance `id`s and throws `A2uiValidationError` on `"todo-index"`. |
| **DOC-GAP-05** | **MEDIUM** | `typescript/renderers/react/README.md` (Lines 260, 270–271) | The React README Quick Start calls `processor.onSurfaceCreated(sync)` and `processor.onSurfaceDeleted(sync)`, whereas `a2ui_explorer` uses `processor.model.onSurfaceCreated.subscribe(sync)` and omits required `<MarkdownContext.Provider value={renderMarkdown}>`. |
| **DOC-GAP-06** | **MEDIUM** | `typescript/renderers/react/README.md` (Line 485) | Claims *"While [v0.8] remains the default export for the `@a2ui/react` package, it is recommended to transition to v0.9"*, which is false in `0.14.0` — the root `@a2ui/react` export is now the v0.9/v1.0 `A2uiSurface`, not v0.8. |
| **DOC-GAP-07** | **MEDIUM** | `docs/public/guides/defining-your-own-catalog.md` | Links to v0.9 catalog paths and says *"Detailed guides for each framework coming soon"* instead of documenting `new Catalog(id, '1.0', components, functions)` and `createComponentImplementation`. |
| **DOC-GAP-08** | **MEDIUM** | `samples/client/react/shell/` | The only official React sample app (`@a2ui/react-shell`) is still pinned to `@a2ui/react/v0_9` and `@a2ui/web_core/v0_9` with `"version": "v0.9"`; there is no public React sample app using v1.0 outside the internal test harness `a2ui_explorer`. |
| **DOC-GAP-09** | **LOW** | Search engine / Ecosystem links (`renderers/react`, `renderers/web_core`) | External links and older docs pointing to `github.com/google/A2UI/tree/main/renderers/react` 404 because packages moved under `typescript/renderers/react` and `typescript/core/web_core`. |
| **DOC-GAP-10** | **MEDIUM** | `catalogs/basic/v1/catalog.json` vs `docs/public/concepts/data-binding.md` | `formatString` in `catalog.json` requires `args: { value: "Hello ${/user/name}" }` with embedded `${...}` expressions and only defines 14 catalog functions (`required`, `regex`, `length`, `numeric`, `email`, `formatString`, `formatNumber`, `formatCurrency`, `formatDate`, `pluralize`, `openUrl`, `and`, `or`, `not`), whereas conceptual guides and prompts frequently reference `contains`, `equals`, or positional `template` arguments. |

---

## Detailed Findings

### DOC-GAP-01: Missing React v1.0 Quickstart & Contradictory Version Matrix (CRITICAL)
- **Where:**
  - Root `README.md` (line 13): *"A2UI's current production release is v0.9.1... The v1.0 specification is a release candidate"*
  - `docs/public/reference/renderers.md` (lines 209–215): Lists **React**, **Lit**, and **Angular** under `v1.0` as `🚧 Planned`.
  - `docs/public/guides/client-setup.md` (lines 7–13): Table only has columns for `v0.8` and `v0.9` (doesn't even list a `v1.0` column).
  - `typescript/renderers/react/README.md` (lines 218, 232–239): States *"v0.9 Native: Built specifically for the A2UI v0.9 protocol... For new projects, it is recommended to use the v0.9 protocol"* and instructs importing `@a2ui/react/v0_9` and `@a2ui/web_core/v0_9/basic_catalog`.
- **Reality:**
  - `@a2ui/web_core@0.14.0` already ships full v1.0 support under `@a2ui/web_core/v1_0` and `@a2ui/web_core/catalogs/basic/v1`, and `@a2ui/react@0.14.0` renders v1.0 surfaces when given a surface from a v1.0 `MessageProcessor`!
- **Impact on Onboarding:** An external developer asked to build an A2UI v1.0 React app has no documentation telling them how to import `@a2ui/web_core/v1_0` + `@a2ui/react`, or whether `@a2ui/react` supports v1.0 at all.

### DOC-GAP-02: `docs/public/guides/client-setup.md` Documents Nonexistent React Symbols (HIGH)
- **Where:** `docs/public/guides/client-setup.md` lines 121–134 (`## React`).
- **What it says:**
  ```markdown
  The React renderer provides:
  - `MessageProcessor` class: A class that manages the A2UI message processor and reactive model.
  - `<A2UISurface>` component: Renders A2UI surfaces in your React app
  - `useA2UI()` hook: Accesses the message processor from any component
  ```
- **Reality:**
  1. `@a2ui/react` does **not** export `MessageProcessor` (it is exported by `@a2ui/web_core`).
  2. The component is named `<A2uiSurface>` (camelCase `ui`), **not** `<A2UISurface>`.
  3. There is **no `useA2UI()` hook** anywhere in `@a2ui/react` (`index.ts` only exports `A2uiSurface`, `createComponentImplementation`, `createBinderlessComponentImplementation`, `useSignalValue`, `MarkdownContext`, `useMarkdownRenderer`). Even in legacy `@a2ui/react/v0_8`, the hook was `useA2UIComponent`.
  4. Unlike the Angular section right above it (which has a 30-line TypeScript snippet), the React section in `client-setup.md` has **zero lines of example code**.

### DOC-GAP-03: `"v0.9 and later"` Tabs in Docs Teach Syntax That Fails in v1.0 (HIGH)
- **Where:** `docs/public/concepts/data-binding.md`, `docs/public/concepts/components.md`, `docs/public/concepts/actions.md`, `docs/public/reference/messages.md`.
- **What it says:** Multiple documentation pages group v0.9 and v1.0 under a single tab titled `=== "v0.9 and later"` and show:
  - Data binding as `{"text": {"path": "/user/name"}}` (instead of v1.0 `{"text": {"@path": "/user/name"}}`).
  - Function calls as `{"call": "formatString", "args": {...}}` (instead of v1.0 `{"@call": "formatString", "args": {...}}`).
  - `Text` component with `"variant": "h1"` (in v1.0 `Text.variant` only allows `"caption" | "body"`, and `"h1"` throws `A2uiValidationError: Invalid enum value. Expected 'caption' | 'body', received 'h1'`).
  - `updateDataModel` usage notes in `reference/messages.md` state: *"Omit `value` to delete."* In v1.0, `value` is **required** and omitting it is a schema validation error; deletion requires `"value": null`.
- **Impact on Onboarding:** Any developer following the `"v0.9 and later"` tabs to author v1.0 payloads will get immediate runtime validation errors.

### DOC-GAP-04: Contradiction Between v1.0 Spec Prose/Examples and Runtime UAX #31 Validation on Component `id`s (HIGH)
- **Where:** `specification/v1_0/docs/a2ui_protocol.md` (lines 546–568 and line 1335) vs `specification/v1_0/json/common_types.json` vs `typescript/core/web_core/src/validation/payload-validator.ts` (line 190).
- **Details:**
  - The v1.0 specification section **"Catalog Entity Naming Rules"** states: *"all catalog entity identifiers—specifically **component names**, **function names**, and **argument/property names**—MUST adhere strictly to Unicode Standard Annex #31 (UAX #31) variable naming rules."* It does **not** list component instance `id` (`ComponentId`) as a catalog entity.
  - Furthermore, `common_types.json` defines `"ComponentId": { "type": "string" }` with no regex pattern.
  - And line 1335 of `specification/v1_0/docs/a2ui_protocol.md` (the `@index` example) explicitly uses a hyphenated component ID:
    ```json
    {
      "id": "todo-index",
      "component": "Text",
      ...
    }
    ```
  - Similarly, `docs/public/concepts/components.md` ("Best Practices") states: `1. Descriptive IDs: Use "user-profile-card" not "c1"`.
  - **Yet** `@a2ui/web_core`'s `PayloadValidator.validateComponent` (line 190) runs:
    ```ts
    this.assertIdentifier(id, `Component id '${id}' must be a valid UAX #31 identifier`);
    ```
    which rejects any component `id` containing a hyphen (`-`) when the catalog's `protocolVersion >= 1.0`!

### DOC-GAP-05: Missing `MarkdownContext` Setup in `@a2ui/react` README Quick Start (MEDIUM)
- **Where:** `typescript/renderers/react/README.md` (lines 251–288).
- **Details:** The Quick Start renders `<A2uiSurface key={surface.id} surface={surface} />` without wrapping it in `<MarkdownContext.Provider value={renderMarkdown}>` (from `@a2ui/markdown-it`). When rendered without `MarkdownContext`, `@a2ui/web_core`'s `<a2ui-basic-text>` logs a console warning:
  `[MarkdownDirective] can't render markdown because no markdown renderer is configured. Use @a2ui/markdown-it, or your own markdown renderer.`
  and renders raw unparsed Markdown syntax (e.g. literal `## Heading`) inside `<span class="no-markdown-renderer">`.

### DOC-GAP-06: Outdated Default Export Claim in `@a2ui/react` README (MEDIUM)
- **Where:** `typescript/renderers/react/README.md` (line 485).
- **Details:** States *"A2UI v0.8 is maintained for backward compatibility. While it remains the default export for the `@a2ui/react` package, it is recommended to transition to v0.9"*. In `@a2ui/react@0.14.0`, the root `.` export (`src/index.ts`) exports the modern `A2uiSurface` and `createComponentImplementation`, while v0.8 is isolated under `@a2ui/react/v0_8`.

### DOC-GAP-07: Incomplete Custom Catalog Guide (`defining-your-own-catalog.md`) (MEDIUM)
- **Where:** `docs/public/guides/defining-your-own-catalog.md` (lines 42–58).
- **Details:** Under `=== "Web (Lit / Angular / React)"`, the guide contains only 3 bullet points and says *"_Detailed guides for each framework coming soon._"* It also links to `specification/v0_9/catalogs/basic/catalog.json` instead of the v1.0 catalog specification and does not mention how v1.0 catalogs require `"protocolVersion": "1.0"` (or `'1.0'` in `new Catalog(id, '1.0', ...)`).

### DOC-GAP-08: Undocumented `formatString` v1.0 Argument Signature (`{ value }` with `${...}` Interpolation) (MEDIUM)
- **Where:** `specification/v1_0/docs/evolution_guide.md` & `catalogs/basic/v1/catalog.json`.
- **Details:** In v1.0 `basicCatalog`, `formatString` takes `args: { value: DynamicString }` where `value` contains `${...}` expressions (such as `"#${@index(offset: 1)}"` or `"${/user/name}"`). There is no public React/Web example showing how `formatString` interpolation interacts with JSON Pointers and `@index(offset)` in v1.0.

### DOC-GAP-09: Undocumented Dual Syntax for DataBinding (`@path` vs `path`) and FunctionCall (`@call` vs `call`) (MEDIUM)
- **Where:** `specification/v1_0/json/common_types.json` vs `@a2ui/web_core/v1_0` (`src/v1_0/schema/common-types.js`).
- **Details:** The JSON schema in `specification/v1_0/json/common_types.json` shows `path` and `call`, while the Evolution Guide (`specification/v1_0/docs/evolution_guide.md`) uses `@index(offset: 1)` and `@a2ui/web_core/v1_0` (`DataBindingSchema` / `FunctionCommonSchema`) accepts both `{"@path": "..."}` and `{"path": "..."}` as well as `{"@call": "..."}` and `{"call": "..."}`. This dual syntax is never explained in the public docs.

### DOC-GAP-10: Undocumented `new Catalog(id, protocolVersion, components, functions)` Constructor Parameter Order & `stripEnvelopeKeys` Behavior (MEDIUM)
- **Where:** `@a2ui/web_core/v1_0` (`Catalog` class & `PayloadValidator`).
- **Details:** No public documentation explains that:
  1. `new Catalog(id, protocolVersion, components, functions, options)` takes `protocolVersion` (`'1.0'`) as its **second** parameter (passing it as the 4th parameter corrupts `catalog.functions` and crashes `serializeCatalogDocument` with `TypeError: Cannot read properties of undefined (reading 'startsWith')`).
  2. Custom `ComponentApi` Zod schemas must **not** extend `ComponentCommonSchema` (`id` is stripped by `PayloadValidator.stripEnvelopeKeys` prior to `componentApi.schema.safeParse`).

