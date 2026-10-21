# A2UI v1.0 Public Onboarding Discovery Report

**Author:** `a2ui-scout` (Zero-Prior-Knowledge External React Developer Simulation)  
**Date:** October 2026  
**Target Protocol Version:** A2UI `v1.0` (Release Candidate)  
**Target Stack:** React 19 + TypeScript + Tailwind CSS (FreshCart Grocery Delivery App)

---

## 1. Executive Summary: What an External React Developer Finds Today

When an external React developer with zero prior knowledge searches the web, npm, and GitHub for **A2UI v1.0** (`a2ui.org`, `github.com/google/A2UI` / `github.com/a2ui-project/a2ui`, and the public npm registry), they encounter a striking mismatch between **public documentation** and **actual shipped code**:

1. **Public Documentation Claims v1.0 Renderer Support Is Still "Planned":**
   - The root `README.md`, `docs/public/reference/renderers.md`, and `@a2ui/react`'s own `README.md` all state that `v0.9.1` is current, mark `v1.0` across React/Lit/Angular renderers as `🚧 Planned`, and show only `@a2ui/react/v0_9` / `@a2ui/web_core/v0_9` in every quickstart and code snippet.
2. **Yet `@a2ui/web_core@0.14.0` and `@a2ui/react@0.14.0` on npm ALREADY Ship Working v1.0 Support Under the Hood:**
   - `@a2ui/web_core@0.14.0` exports `./v1_0` (`@a2ui/web_core/v1_0`) and `./catalogs/basic/v1` (`@a2ui/web_core/catalogs/basic/v1`), complete with a full v1.0 `MessageProcessor`, `PayloadValidator`, UAX #31 identifier checker, `@path` / `@call` / `@index` `DataContext` resolver, `RpcHandler` (`callRendererFunction` / `callAgentFunction`), and the 18-component `basicCatalog` for protocol version `'1.0'`.
   - `@a2ui/react@0.14.0` exports `A2uiSurface`, `createComponentImplementation`, `createBinderlessComponentImplementation`, and `MarkdownContext` at its root (`@a2ui/react`), while `@a2ui/react/v0_9` is literally a 1-line re-export of `../index`. There is **no `@a2ui/react/v1_0` subpath export**, which tricks developers into thinking `@a2ui/react` only supports v0.8 and v0.9.
   - Only by digging into the unadvertised internal `typescript/renderers/react/a2ui_explorer/src/App.tsx` in the GitHub repo does a developer discover that `<A2uiSurface surface={surface} />` from `@a2ui/react` renders v1.0 surfaces when paired with `basicCatalog` from `@a2ui/web_core/catalogs/basic/v1` (or `@a2ui/web_core/v1_0`).

---

## 2. Public Discovery Channels & Repository Layout Changes

### 2.1 Web & Documentation Site (`https://a2ui.org`)
- **Primary site:** `https://a2ui.org` (built from `docs/public/` via `mkdocs.yaml` in `github.com/google/A2UI`, which also aliases to `github.com/a2ui-project/a2ui`).
- **Specification section on `a2ui.org`:** Lists four specification tracks:
  - `v1.0 (Candidate)` — `specification/v1_0/docs/a2ui_protocol.md`, `evolution_guide.md`, `a2ui_custom_functions.md`, `sdks_spec.md`, plus `catalogs/basic/v1/basic_catalog_implementation_guide.md`.
  - `v0.9.1 (Current)`
  - `v0.9 (Previous Stable)`
  - `v0.8 (Legacy)`

### 2.2 Repository Structure Reorganization (`renderers/` → `typescript/`)
Older blog posts and search results reference `renderers/react` or `renderers/web_core` at the repo root, which now return `HTTP 404` on GitHub. The monorepo was reorganized by language:

| Path in `google/A2UI` | Purpose |
| :--- | :--- |
| `specification/v1_0/docs/` | Normative v1.0 protocol spec (`a2ui_protocol.md`), `evolution_guide.md`, `a2ui_custom_functions.md`, `sdks_spec.md` |
| `specification/v1_0/json/` | Normative JSON Schemas (`agent_to_renderer.json`, `renderer_to_agent.json`, `common_types.json`, `catalog_definition.json`, `renderer_capabilities.json`, `agent_capabilities.json`, `renderer_data_model.json`) |
| `catalogs/basic/v1/` | Canonical v1.0 Basic Catalog JSON Schema (`catalog.json`), implementation guide (`basic_catalog_implementation_guide.md`), and 43 v1.0 sample JSON envelopes (`examples/00_*.json` – `36_modal.json`) |
| `typescript/core/web_core/` | Source for `@a2ui/web_core` (`src/v1_0/`, `src/catalogs/basic/v1/`, `src/processing/`, `src/resolution/`, `src/state/`, `src/validation/`, `src/rpc/`) |
| `typescript/renderers/react/` | Source for `@a2ui/react` (`src/A2uiSurface.tsx`, `src/adapter.tsx`, `src/node-view.tsx`, `a2ui_explorer/`) |
| `typescript/renderers/lit/` | Source for `@a2ui/lit` |
| `typescript/renderers/angular/` | Source for `@a2ui/angular` |
| `typescript/renderers/markdown-it/` | Source for `@a2ui/markdown-it` |
| `samples/client/react/shell/` | Sample React app (still hardcoded to `@a2ui/react/v0_9` and `@a2ui/web_core/v0_9`) |

---

## 3. Public npm Registry Audit (`@a2ui/*` & Ecosystem)

Querying `https://registry.npmjs.org` reveals the following official and community packages:

### 3.1 Official `@a2ui/*` Packages on npm

| Package | Latest Version | Export Subpaths (`package.json#exports`) | Dependencies & Peer Dependencies | v1.0 Support Status |
| :--- | :--- | :--- | :--- | :--- |
| **`@a2ui/web_core`** | `0.14.0` | `.`, `./v0_8`, `./v0_8/basic_catalog`, `./v0_9`, `./v0_9/universal`, `./v0_9/basic_catalog`, **`./v1_0`**, **`./catalogs/basic/v1`**, `./catalog`, `./state`, `./processing`, `./resolution`, `./validation`, `./reactivity`, `./expressions`, `./adapters`, `./rpc`, `./universal` | Deps: `lit@^3.3.3`, `@lit/context@^1.1.6`, `@preact/signals-core@^1.14.2`, `zod@^3.25.76`, `zod-to-json-schema@^3.25.2`, `redos-detector@^6.1.4`, `validate-color@^2.2.4` | **YES** — Full v1.0 runtime, schemas, `MessageProcessor`, and `basicCatalog` (`protocolVersion: '1.0'`) |
| **`@a2ui/react`** | `0.14.0` | `.`, `./v0_8`, `./v0_9`, `./styles`, `./styles/structural.css` *(Missing `./v1_0`!)* | Deps: `@a2ui/web_core@^0.14.0`, `@a2ui/markdown-it@^0.2.2`, `clsx@^2.1.1`, `markdown-it@^14.2.0`, `zod@^3.25.76`. Peers: `react@^18.0.0 \|\| ^19.0.0`, `react-dom@^18.0.0 \|\| ^19.0.0`, `zod@^3.25.76` | **PARTIAL / UNDOCUMENTED** — Root `@a2ui/react` (`A2uiSurface`) works with v1.0 `SurfaceModel`, but lacks `./v1_0` export and crashes in SSR/Node if `HTMLElement` is undefined |
| **`@a2ui/markdown-it`** | `0.2.2` | `.` | Deps: `dompurify@3.4.11`, `markdown-it@^14.2.0`. Peer: `@a2ui/web_core@^0.14.0` | **YES** — Used via `MarkdownContext.Provider` |
| **`@a2ui/lit`** | `0.14.0` | `.`, `./ui`, `./0.8`, `./v0_8`, `./v0_9` *(Missing `./v1_0`)* | Deps: `@a2ui/web_core@^0.14.0`, `lit@^3.3.3`, `zod@^3.25.76` | Partial (no `./v1_0` export) |
| **`@a2ui/angular`** | `0.13.0` | `.`, `./v0_8`, `./v0_9`, `./testing` | lags at `0.13.0`; peers require `@angular/core@^21.2.5` | v0.8 / v0.9 only |
| **`@a2ui/agent`** | *Unpublished* | In repo at `typescript/agents/a2ui_agent/` | Marked "Not published yet" in root README | Not on npm |

> **Warning on `npm install a2ui`:** The unscoped `a2ui` package on npm (`v1.0.7`, published in 2016) is an unrelated legacy Angular 2 Bootstrap wrapper! External developers must install scoped `@a2ui/react` and `@a2ui/web_core`.

---

## 4. Deep Dive: How the A2UI v1.0 Wire Format Works

Based on `specification/v1_0/docs/a2ui_protocol.md`, `specification/v1_0/docs/evolution_guide.md`, `specification/v1_0/json/*.json`, and `catalogs/basic/v1/catalog.json`:

### 4.1 Top-Level Message Envelopes (`agent_to_renderer.json`)
Every agent-to-renderer message is a JSON object with `"version": "v1.0"` and **exactly one** of six operation keys:

1. **`createSurface`**:
   ```json
   {
     "version": "v1.0",
     "createSurface": {
       "surfaceId": "meal_planner_surface",
       "catalogId": "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",
       "sendDataModel": true,
       "components": [ ... ],
       "dataModel": { ... },
       "metadata": { "extensions": { ... } }
     }
   }
   ```
   - **New in v1.0:** `components` and `dataModel` can be embedded directly inside `createSurface` for single-message UI instantiation!
   - **Removed in v1.0:** `theme` (and `primaryColor`) was removed from `createSurface` to decouple layout from host branding.
   - **Optional Default `catalogId`:** `catalogId` on `createSurface` is optional in v1.0 and sets the surface's default catalog.
   - **Surface Uniqueness:** `surfaceId` must be globally unique across the renderer session. Sending `createSurface` for an already-existing `surfaceId` (without `deleteSurface` first) throws `A2uiIntegrityError` (`INTEGRITY_ERROR`).
   - **Implicit `Surface` Root Container:** `createSurface` implicitly creates a reserved `Surface` container whose child is `"root"`. One component in `components` must have `"id": "root"`.

2. **`updateComponents`**:
   ```json
   {
     "version": "v1.0",
     "updateComponents": {
       "surfaceId": "meal_planner_surface",
       "components": [
         { "id": "root", "component": "Card", "child": "main_col" },
         { "id": "main_col", "component": "Column", "children": ["title_text"] },
         { "id": "title_text", "component": "Text", "text": { "@path": "/title" } }
       ]
     }
   }
   ```
   - Uses an **adjacency list** (flat array of component definitions referencing children by `ComponentId`).
   - **CRITICAL v1.0 Identifier Rule:** All component `id`s, component type names, function names, and argument keys are validated against Unicode UAX #31 (`^[\p{XID_Start}_][\p{XID_Continue}]*$`) by `@a2ui/web_core`'s `PayloadValidator`. **Hyphens (`-`) in component `id`s (like `"main-col"`) throw `A2uiValidationError` in v1.0!** Always use underscores (`main_col`) or camelCase (`mainCol`) for component `id`s.

3. **`updateDataModel`**:
   ```json
   {
     "version": "v1.0",
     "updateDataModel": {
       "surfaceId": "meal_planner_surface",
       "path": "/servings",
       "value": 6
     }
   }
   ```
   - `path` is an optional RFC 6901 JSON Pointer (defaults to `"/"`).Note that `path` on the `updateDataModel` envelope is an **unprefixed** property name (`"path"`, NOT `"@path"`).
   - **New in v1.0:** `value` is **required** (omitting `value` fails schema validation). To delete a key at `path`, set `"value": null`.

4. **`deleteSurface`**:
   ```json
   {
     "version": "v1.0",
     "deleteSurface": {
       "surfaceId": "meal_planner_surface"
     }
   }
   ```

5. **`callRendererFunction`** (New in v1.0 — Bidirectional RPC):
   ```json
   {
     "version": "v1.0",
     "callRendererFunction": {
       "surfaceId": "meal_planner_surface",
       "functionCallId": "call_123",
       "callFunction": {
         "@call": "getViewportWidth",
         "catalogId": "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",
         "args": {}
       }
     }
   }
   ```

6. **`agentFunctionResponse`** (New in v1.0 — Response to `callAgentFunction`):
   ```json
   {
     "version": "v1.0",
     "agentFunctionResponse": {
       "functionCallId": "req_456",
       "value": { "couponValid": true, "discount": 5.00 }
     }
   }
   ```

### 4.2 Reserved `@` Directive Namespace (`@path`, `@call`, `@index`)
One of the most important breaking changes from v0.9 to v1.0 is the **reserved `@` prefix** on dynamic objects:
- **`DataBinding` (`{"@path": "..."}`)**: Binds a property to a JSON Pointer in the surface's `DataModel`:
  - Absolute path: `{"@path": "/servings"}` (resolves from root `/`).
  - Relative path inside a `ChildList` template: `{"@path": "name"}` (resolves to `/ingredients/0/name`, `/ingredients/1/name`, etc.).
- **`FunctionCall` (`{"@call": "...", "args": {...}, "catalogId"?: "..."}`)**: Invokes a catalog or system function:
  - Example: `{"@call": "formatCurrency", "args": {"value": {"@path": "/totalCost"}, "currency": "USD"}}`
  - String interpolation: `{"@call": "formatString", "args": {"value": "Total for ${/servings} servings: ${formatCurrency(value: ${/totalCost}, currency: 'USD')}"}}`
- **`@index` System Function (`{"@call": "@index", "args": {"offset": 1}}`)**:
  - Returns the 0-based iteration index inside a `ChildList` template scope (or 1-based when `offset: 1`). Calling `@index` outside a collection template scope is an evaluation error, and `@index` must NOT specify a `catalogId`.
- **Where `path` is NOT prefixed with `@`:**
  1. `updateDataModel.path` (`{"updateDataModel": {"surfaceId": "s1", "path": "/user", "value": ...}}`)
  2. `ChildList` template objects (`"children": {"componentId": "ingredient_row", "path": "/ingredients"}`)

### 4.3 Multi-Catalog Mixing & Resolution Rules in v1.0
In v1.0, a single surface can mix components and functions from multiple catalogs (e.g., the standard Basic Catalog `https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json` + a custom FreshCart Grocery Catalog `https://freshcart.a2ui.org/specification/v1_0/catalogs/grocery/catalog.json`):
1. Renderer checks explicit component-level or function-call-level `catalogId` first.
2. Falls back to the surface's default `catalogId` (from `createSurface.catalogId`).
3. If neither is defined, resolution fails immediately with an error (there is **no fallback** to capabilities).
4. All mixed catalogs on a surface must declare compatible protocol versions (`"1.0"` / `"v1.0"`).

### 4.4 Actions (`renderer_to_agent.json`)
Interactive components (`Button`, custom components) declare an `action` property which is either an **agent event** or a **local functionCall**:
- **Component definition (`Action`):**
  ```json
  "action": {
    "event": {
      "name": "add_recipe_bundle_to_cart",
      "userMessage": {
        "@call": "formatString",
        "args": { "value": "Add ${/servings}-serving bundle to cart" }
      },
      "context": {
        "recipeId": "mediterranean_salmon_bowl",
        "servings": { "@path": "/servings" },
        "organicOnly": { "@path": "/dietary/organicOnly" }
      }
    }
  }
  ```
- **Resolved outbound `action` message emitted by renderer:**
  ```json
  {
    "version": "v1.0",
    "action": {
      "name": "add_recipe_bundle_to_cart",
      "surfaceId": "meal_planner_surface",
      "sourceComponentId": "add_bundle_btn",
      "timestamp": "2026-10-21T22:05:43.135Z",
      "userMessage": "Add 4-serving bundle to cart",
      "context": {
        "recipeId": "mediterranean_salmon_bowl",
        "servings": 4,
        "organicOnly": true
      }
    }
  }
  ```

### 4.5 Validation Rules (`checks` and `ValidationResult`)
Components mixing in `Checkable` (`Button`, `TextField`, `CheckBox`, `ChoicePicker`, `Slider`, `DateTimeInput`) accept a `checks` array of `CheckRule` objects:
```json
"checks": [
  {
    "condition": {
      "@call": "numeric",
      "args": { "value": { "@path": "/weeklyBudget" }, "min": 25, "max": 1000 }
    },
    "message": "Weekly budget must be between $25 and $1,000."
  }
]
```
In v1.0, validation functions return a structured `ValidationResult` (`{ valid: boolean, code?: string, message?: string, severity?: "error" | "warning" | "info" }`) or a boolean coerced to `ValidationResult`. Failed checks display validation messages on input components and automatically disable `Button` components.

### 4.6 Complete v1.0 Basic Catalog (18 Components & 15 Functions)
- **Catalog ID:** `https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`
- **18 Components:**
  1. `Text`: `{ text: DynamicString, variant?: 'caption' | 'body', weight?: number }` *(Note: `h1`–`h5` variants from v0.9 were removed in v1.0; headings use Markdown `#` / `##` / `###` inside `text`!)*
  2. `Image`: `{ url: DynamicString, description?: DynamicString, fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scaleDown', variant?: 'icon' | 'avatar' | 'smallFeature' | 'mediumFeature' | 'largeFeature' | 'header', weight?: number }`
  3. `Icon`: `{ name: IconNameEnum | { svgPath: DynamicString } | DataBinding, weight?: number }`
  4. `Video`: `{ url: DynamicString, posterUrl?: DynamicString, weight?: number }` *(v1.0 added `posterUrl`)*
  5. `AudioPlayer`: `{ url: DynamicString, description?: DynamicString, weight?: number }`
  6. `Row`: `{ children: ChildList, justify?: 'center' | 'end' | 'spaceAround' | 'spaceBetween' | 'spaceEvenly' | 'start' | 'stretch', align?: 'start' | 'center' | 'end' | 'stretch', weight?: number }`
  7. `Column`: `{ children: ChildList, justify?: 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly' | 'stretch', align?: 'center' | 'end' | 'start' | 'stretch', weight?: number }`
  8. `List`: `{ children: ChildList, direction?: 'vertical' | 'horizontal', align?: 'start' | 'center' | 'end' | 'stretch', weight?: number }`
  9. `Card`: `{ child: ComponentId, weight?: number }`
  10. `Tabs`: `{ tabs: Array<{ title: DynamicString, child: ComponentId }>, weight?: number }`
  11. `Modal`: `{ trigger: ComponentId, content: ComponentId, weight?: number }`
  12. `Divider`: `{ axis?: 'horizontal' | 'vertical', weight?: number }`
  13. `Button`: `{ child: ComponentId, action: Action, variant?: 'default' | 'primary' | 'borderless', checks?: CheckRule[], weight?: number }`
  14. `TextField`: `{ label: DynamicString, value?: DynamicString, placeholder?: DynamicString, variant?: 'longText' | 'number' | 'shortText' | 'obscured', checks?: CheckRule[], weight?: number }` *(v1.0 added `placeholder` and removed `validationRegexp` in favor of `checks`)*
  15. `CheckBox`: `{ label: DynamicString, value: DynamicBoolean, checks?: CheckRule[], weight?: number }`
  16. `ChoicePicker`: `{ options: Array<{ label: DynamicString, value: string }>, value: DynamicStringList, label?: DynamicString, variant?: 'multipleSelection' | 'mutuallyExclusive', displayStyle?: 'checkbox' | 'chips', filterable?: boolean, checks?: CheckRule[], weight?: number }`
  17. `Slider`: `{ value: DynamicNumber, max: number, min?: number, steps?: number, label?: DynamicString, checks?: CheckRule[], weight?: number }` *(v1.0 added `steps`)*
  18. `DateTimeInput`: `{ value: DynamicString, label?: DynamicString, enableDate?: boolean, enableTime?: boolean, min?: DynamicString, max?: DynamicString, checks?: CheckRule[], weight?: number }`
- **15 Functions:** `@index`, `required`, `regex`, `length`, `numeric`, `email`, `formatString`, `formatNumber`, `formatCurrency`, `formatDate`, `pluralize`, `openUrl`, `and`, `or`, `not`.

---

## 5. How `@a2ui/react@0.14.0` Works & Concrete Strategy for FreshCart

### 5.1 How `@a2ui/react@0.14.0` + `@a2ui/web_core@0.14.0` Actually Work Together
We verified by inspecting the npm tarballs and running a live DOM integration test in Node + JSDOM + React 19 that:
1. `@a2ui/web_core/v1_0` exports `MessageProcessor`, `Catalog`, `CommonSchemas`, `basicCatalog` (`https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`, `protocolVersion: '1.0'`), `createFunctionImplementation`, and all v1.0 schema validators.
2. `@a2ui/react` exports `A2uiSurface`, `createComponentImplementation`, `createBinderlessComponentImplementation`, and `MarkdownContext`.
3. Under the hood, `@a2ui/web_core`'s `basicCatalog` implements the 18 basic components as **Lit Web Components** (`<a2ui-card>`, `<a2ui-basic-column>`, `<a2ui-basic-text>`, `<a2ui-slider>`, `<a2ui-basic-button>`, etc.), while `@a2ui/react`'s `createComponentImplementation` wraps custom React components in a custom element host (`<a2ui-react-*>`) and uses `ReactDOM.createPortal` + `useSyncExternalStore` + `GenericBinder` to render React subtrees inside the surface!

### 5.2 Concrete Strategy for FreshCart (`sec-a2ui-engine` & `architect`)
To make **FreshCart** both an extraordinary, Instacart-grade Tailwind UI showcase AND a genuine testbed for the public A2UI v1.0 specification and packages:
1. **Install the Real Public Packages (`@a2ui/react@^0.14.0`, `@a2ui/web_core@^0.14.0`, `@a2ui/markdown-it@^0.2.2`, `zod@^3.25.76`):**
   - Having them installed in `package.json` validates real npm resolution, peer dependencies, and bundle compatibility with Vite + React 19 + TypeScript.
2. **Faithful A2UI v1.0 Engine + Native Tailwind React Catalog (`src/a2ui/`):**
   - Why a native React Tailwind renderer or custom React component catalog on top of the v1.0 protocol contract is essential:
     - `@a2ui/web_core`'s built-in `basicCatalog` renders Lit Shadow DOM custom elements (`<a2ui-card>`, `<a2ui-slider>`, etc.) with generic unstyled/Lit CSS that does not inherit Tailwind utility classes across Shadow DOM boundaries and throws `dispatchEvent` errors in JSDOM test environments.
     - By implementing all 18 v1.0 Basic Catalog components + FreshCart's custom `ProductDealCard` and `NutritionSummary` components as native React + Tailwind components (matching the exact v1.0 schema contract, `@path` / `@call` / `@index` evaluation rules, UAX #31 identifier rules, `Text.variant: 'caption' | 'body'`, `createSurface` inline `components`/`dataModel`, and `ValidationResult` `checks`), and optionally cross-validating payloads with `@a2ui/web_core/v1_0`, FreshCart gets:
       - Pixel-perfect Instacart emerald/cream styling across all 18 basic + 2 custom components;
       - 100% compliance with the official `specification/v1_0` schemas (`agent_to_renderer.json`, `renderer_to_agent.json`, `common_types.json`, `catalogs/basic/v1/catalog.json`);
       - Full SSR/Vitest/JSDOM compatibility without the `HTMLElement is not defined` or Lit Shadow DOM `dispatchEvent` crashes;
       - A live **Protocol Inspector & Onboarding Report Drawer** that highlights every real finding discovered in our public onboarding audit.
