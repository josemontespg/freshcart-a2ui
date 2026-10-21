# A2UI v1.0 Public Packages: Bugs, Packaging Issues & Runtime Pitfalls

**Author:** `a2ui-scout` (Zero-Prior-Knowledge External React Developer Simulation)  
**Date:** October 2026  
**Tested Packages:** `@a2ui/react@0.14.0`, `@a2ui/web_core@0.14.0`, `@a2ui/markdown-it@0.2.2`, `@a2ui/lit@0.14.0`, `@a2ui/angular@0.13.0`

---

## Summary Table of Bugs & Packaging Issues

| ID | Severity | Package / File | Summary |
| :--- | :--- | :--- | :--- |
| **BUG-01** | **CRITICAL** | `@a2ui/react@0.14.0` (`catalog/react_host_element.ts` / `chunk-QAAGXJWH.js:98`) | **Unconditional `class ReactWcHost extends HTMLElement` at module top-level crashes Node.js / SSR** (`ReferenceError: HTMLElement is not defined`) on `import '@a2ui/react'`. |
| **BUG-02** | **HIGH** | `@a2ui/react@0.14.0` (`package.json#exports`) | **Missing `./v1_0` subpath export in `@a2ui/react`**, despite `@a2ui/web_core@0.14.0` exporting `./v1_0` and `./catalogs/basic/v1`. |
| **BUG-03** | **HIGH** | `@a2ui/web_core@0.14.0` (`src/validation/payload-validator.ts:190`) | **Over-strict UAX #31 validation on component instance `id`** rejects hyphenated component IDs (`"main-col"`, `"todo-index"`) that the v1.0 spec itself uses and allows in `common_types.json#/$defs/ComponentId`. |
| **BUG-04** | **HIGH** | `@a2ui/web_core@0.14.0` (`@lit/context` inside `A2uiBasicTextElement`) | **JSDOM / Vitest `TypeError: Failed to execute 'dispatchEvent' on 'EventTarget'`** when rendering `<a2ui-basic-text>` inside React 19 + JSDOM due to cross-realm `Event` constructor mismatch in `@lit/context`. |
| **BUG-05** | **MEDIUM** | `@a2ui/web_core@0.14.0` (npm tarball) | **Bloated npm tarball shipping `.tsbuildinfo` (182 KB) and all `*.test.js` / `*.test.d.ts` / `*.test.js.map` files** directly from `src/` because `files` is not restricted in `package.json`. |
| **BUG-06** | **MEDIUM** | `@a2ui/react@0.14.0` (`src/A2uiSurface.tsx`, `src/adapter.tsx`, `src/node-view.tsx`) | **Hardcoded `@a2ui/web_core/v0_9` internal imports inside `@a2ui/react`**, coupling the React renderer's `setMarkdownRenderer` call to `@a2ui/web_core/v0_9/basic_catalog` (though fortunately both v0.9 and v1.0 re-export the same `universal/basic_catalog/directives` singleton). |
| **BUG-07** | **MEDIUM** | `@a2ui/web_core@0.14.0` (`src/processing/message-processor.ts:132`) | **`MessageProcessorOptions.version` defaults to `'v0.9'`** even when initialized exclusively with v1.0 catalogs (`protocolVersion: '1.0'`) or imported from `@a2ui/web_core/v1_0`. |
| **BUG-08** | **LOW** | `@a2ui/angular@0.13.0` | **Version skew & bleeding-edge peer dependency**: `@a2ui/angular` is stuck at `0.13.0` (while `web_core`, `react`, and `lit` are at `0.14.0`) and requires `@angular/core@^21.2.5` as peer dependency. |

---

## Detailed Bug Reports & Reproduction Steps

### BUG-01: Importing `@a2ui/react` in Node.js / SSR Crashes Immediately (`ReferenceError: HTMLElement is not defined`)
- **Severity:** Critical (breaks Next.js, Remix, Vite SSR, and Node unit tests that import `@a2ui/react` before initializing DOM globals)
- **Package:** `@a2ui/react@0.14.0`
- **Reproduction:**
  ```bash
  node -e "import('@a2ui/react')"
  ```
- **Actual Output:**
  ```text
  file:///.../node_modules/@a2ui/react/chunk-QAAGXJWH.js:98
  var ReactWcHost = class extends HTMLElement {
                    ^
  ReferenceError: HTMLElement is not defined
  ```
- **Root Cause:** In `typescript/renderers/react/src/catalog/react_host_element.ts`, `class ReactWcHost extends HTMLElement` is evaluated eagerly at module load time rather than lazily inside `ensureRegistered()` or guarded with `typeof HTMLElement !== 'undefined'`.
- **Also affects `@a2ui/web_core/v1_0`:** Because `@a2ui/web_core/v1_0` re-exports `catalogs/basic/v1/index.js` (which imports Lit's `reactive-element/css-tag.js`), importing `@a2ui/web_core/v1_0` in a non-browser environment where `globalThis.ShadowRoot` is defined without `globalThis.Document` throws `ReferenceError: Document is not defined`.

---

### BUG-02: `@a2ui/react@0.14.0` Is Missing a `./v1_0` Export Subpath in `package.json`
- **Severity:** High (API inconsistency & discoverability blocker)
- **Package:** `@a2ui/react@0.14.0`
- **Details:**
  - `@a2ui/web_core@0.14.0` provides versioned exports for `./v0_8`, `./v0_9`, `./v1_0`, and `./catalogs/basic/v1`.
  - `@a2ui/react@0.14.0` only defines `.`, `./v0_8`, `./v0_9`, `./styles`, and `./styles/structural.css` in `package.json#exports`.
  - Even though `src/v0_9/index.ts` in `@a2ui/react` is literally just a re-export of `src/index.ts` (which is protocol-version-agnostic for v0.9 and v1.0), attempting `import { A2uiSurface } from '@a2ui/react/v1_0'` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- **Workaround:** Import `{ A2uiSurface, createComponentImplementation, MarkdownContext }` from the root `'@a2ui/react'` package (not `'@a2ui/react/v0_9'`).

---

### BUG-03: `PayloadValidator` Rejects Valid Hyphenated `ComponentId` Strings in v1.0 (`A2uiValidationError: Component id '...' must be a valid UAX #31 identifier`)
- **Severity:** High (Spec vs Implementation conflict)
- **Package:** `@a2ui/web_core@0.14.0` (`src/validation/payload-validator.ts:190`)
- **Reproduction:**
  Feed any v1.0 `createSurface` or `updateComponents` message containing a hyphenated component ID (such as `"id": "main-col"` or `"id": "todo-index"` from line 1335 of `specification/v1_0/docs/a2ui_protocol.md`) into `new MessageProcessor([basicCatalog])`:
  ```text
  A2uiValidationError: Component id 'main-col' must be a valid UAX #31 identifier
      at PayloadValidator.assertIdentifier (payload-validator.js:387:19)
      at PayloadValidator.validateComponent (payload-validator.js:162:14)
  ```
- **Root Cause:**
  - `specification/v1_0/json/common_types.json` defines `ComponentId` simply as `{"type": "string"}` (no UAX #31 regex).
  - `specification/v1_0/docs/a2ui_protocol.md` (Section "Catalog Entity Naming Rules") specifies UAX #31 for **catalog entity identifiers** (*"specifically component names, function names, and argument/property names"*), NOT component instance `id`s.
  - However, `PayloadValidator.validateComponent` calls `this.assertIdentifier(id, ...)` on every component instance `id` when `catalog.protocolVersion >= 1.0`.
- **Mandatory Rule for FreshCart Scenarios:** All component `id`s in our v1.0 scenarios (`mealPlannerScenario.ts`, `cartOptimizerScenario.ts`, `budgetBuilderScenario.ts`) MUST use **valid UAX #31 identifiers** (underscores `main_col` or camelCase `mainCol`, NEVER hyphens `main-col`) so they pass `@a2ui/web_core` v1.0 validation! (Note: `surfaceId` CAN contain hyphens, e.g., `"meal-planner-surface"`, because `surfaceId` is not checked by `assertIdentifier`, only component `id`s are.)

---

### BUG-04: `<a2ui-basic-text>` Throws `EventTarget.dispatchEvent` TypeError in JSDOM When Consuming `@lit/context`
- **Severity:** High (Affects unit/integration tests in JSDOM / Vitest)
- **Package:** `@a2ui/web_core@0.14.0` (`A2uiBasicTextElement` + `@lit/context`)
- **Actual Error in JSDOM:**
  ```text
  TypeError: Failed to execute 'dispatchEvent' on 'EventTarget': parameter 1 is not of type 'Event'.
      at A2uiBasicTextElement.dispatchEvent (.../jsdom/lib/generated/idl/EventTarget.js:221:24)
      at s.dispatchRequest (.../@lit/context/lib/controllers/context-consumer.js:6:720)
  ```
- **Root Cause:** When `@a2ui/web_core`'s Lit custom elements connect in a JSDOM environment where Node's native `globalThis.Event` / `CustomEvent` differs from `dom.window.Event` / `dom.window.CustomEvent`, `@lit/context` constructs a `ContextRequestEvent` extending `globalThis.Event` and dispatches it on a JSDOM `HTMLElement`, which JSDOM's WebIDL converter rejects unless `globalThis.Event = dom.window.Event` and `globalThis.CustomEvent = dom.window.CustomEvent` are explicitly overwritten before importing `@a2ui/web_core`.

---

### BUG-05: `@a2ui/web_core@0.14.0` Publishes Test Files and `.tsbuildinfo` to npm
- **Severity:** Medium (Package hygiene & size bloat)
- **Package:** `@a2ui/web_core@0.14.0`
- **Details:** Running `npm pack @a2ui/web_core@0.14.0` reveals that the published tarball includes:
  - `.tsbuildinfo` (182.2 kB)
  - Dozens of compiled test files (`src/**/*.test.js`, `src/**/*.test.d.ts`, `src/**/*.test.js.map`), e.g., `schema_generator.test.js` (41.4 kB), `schema_serializer.test.js` (40.6 kB), `message-processor.test.js`, etc.

---

### BUG-06: `Text` Component `variant` Enum Changed Breakingly in v1.0 (`['caption', 'body']` Only)
- **Severity:** Medium (Breaking schema change between v0.9 and v1.0 basic catalog not highlighted in Evolution Guide)
- **Package:** `@a2ui/web_core@0.14.0` (`catalogs/basic/v1`) & `catalogs/basic/v1/catalog.json`
- **Details:**
  - In v0.9 `basicCatalog`, `Text.variant` accepted `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'caption' | 'body'`.
  - In v1.0 `basicCatalog` (`typescript/core/web_core/src/catalogs/basic/v1/components/basic_components.ts:43`), `Text.variant` only accepts `z.enum(['caption', 'body'])`. Passing `variant: 'h1'` or `'h2'` throws:
    `A2uiValidationError: Validation failed for component 'Text': variant: Invalid enum value. Expected 'caption' | 'body', received 'h2'`.
  - Importantly, `specification/v1_0/docs/evolution_guide.md` mentions changes to `Video`, `TextField`, and `Slider`, but **never mentions that `h1`–`h5` were removed from `Text.variant`** in favor of Markdown `#`–`#####` in `Text.text`!
  - **Note for FreshCart (`@sec-a2ui-engine` & `@sec-ai-shopper`):** Our FreshCart `basicCatalogRenderer.tsx` should support both standard v1.0 Markdown headings inside `text` (`#`, `##`, `###`) AND gracefully tolerate optional `variant` hints (`caption`, `body`, plus `h1`–`h4` if passed by custom scenarios) while keeping our v1.0 scenario JSON payloads strictly compliant with `variant: "body" | "caption"` and Markdown `#` / `##` / `###` in `text`!

---

### BUG-07: `@a2ui/markdown-it@0.2.2` Has Incompatible Peer Dependency (`lit ^3.2.0` vs `@a2ui/web_core@0.14.0` using `lit 3.3.3`)
- **Severity:** Low / Medium (npm peer resolution warning / potential duplicate Lit context symbols)
- **Package:** `@a2ui/markdown-it@0.2.2`
- **Details:** `@a2ui/markdown-it` is still at `0.2.2` while `@a2ui/web_core` and `@a2ui/react` are at `0.14.0`. If a bundler resolves two separate copies of `@lit/context`, `MarkdownContext` fails to match across packages.

---

### BUG-08: `@a2ui/web_core@0.14.0` `CreateSurfaceMessageSchema` Rejects `createSurface.theme` Due to `.strict()` Omission
- **Severity:** High (Spec vs. Validator mismatch in `@a2ui/web_core/v1_0`)
- **Package:** `@a2ui/web_core@0.14.0` (`src/v1_0/schema/agent-to-renderer.js` & `src/processing/adapters/v1_0.js`)
- **Reproduction:**
  - The public A2UI v1.0 specification (`specification/v1_0/json/server_to_client.json`) defines `theme` on `createSurface` (`"$ref": "catalog.json#/$defs/theme"`), and `basicCatalog` in `@a2ui/web_core/v1_0` defines `BasicCatalogThemeSchema` (`primaryColor`, `iconUrl`, `agentDisplayName`).
  - Furthermore, `V1Point0Adapter.extractOperationsFromObject` (`src/processing/adapters/v1_0.js:39`) explicitly reads `theme: cs?.theme` from `msgObj.createSurface`!
  - **However**, `CreateSurfaceMessageSchema` in `src/v1_0/schema/agent-to-renderer.js` (lines 24–48) omitted `'theme'` from `createSurface` and applied `.strict()`.
  - As a result, passing `theme: { primaryColor: "#108910", agentDisplayName: "FreshCart AI" }` inside a v1.0 `createSurface` message to `MessageProcessor.processMessages` throws at `V1Point0Adapter.extractOperations`:
    `A2uiValidationError: Invalid v1.0 message: createSurface: Unrecognized key(s) in object: 'theme'`.

---

### BUG-09: `PayloadValidator.validateComponent` Strips `id` Before Running `componentApi.schema`, Breaking Custom `ComponentApi` Schemas Extending `ComponentCommonSchema`
- **Severity:** Medium (Confusing DX & runtime validation failure for custom catalog authors)
- **Package:** `@a2ui/web_core@0.14.0` (`src/validation/payload-validator.js:172`)
- **Details:**
  - `@a2ui/web_core/v1_0` exports `ComponentCommonSchema` (`{ id: ComponentIdSchema, catalogId?: string, accessibility?: ..., metadata?: ... }`).
  - A developer defining a custom v1.0 component (e.g. `ProductDealCardApi` or `NutritionSummaryApi`) naturally extends `ComponentCommonSchema.extend({ ... })`.
  - However, `PayloadValidator.validateComponent` calls `const properties = stripEnvelopeKeys(comp)` (line 172), which deletes `id`, `component`, and `catalogId` **before** calling `componentApi.schema.safeParse(properties)` (line 187).
  - Consequently, any custom `ComponentApi` whose Zod schema extends `ComponentCommonSchema` fails at runtime with:
    `A2uiValidationError: Validation failed for component 'NutritionSummary': id: Expected string, received undefined`.

