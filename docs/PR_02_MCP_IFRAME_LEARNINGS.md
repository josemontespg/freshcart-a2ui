# PR 02 — A2UI v1.0 MCP Component (`McpApp` + Sandboxed Double-Iframe + `callMcpTool`) Onboarding & Learnings

**Branch:** `feat/02-mcp-iframe`  
**Live Demo URL:** `http://josemontesp.c.googlers.com:5182`  
**Specification Targeted:** `https://a2ui.org/specification/v1_0/catalogs/mcp/catalog.json` (`protocolVersion: "1.0"`)

---

## 1. Public Onboarding Discovery: How an External React Developer Discovers A2UI v1.0 MCP Apps Today

Simulating a zero-prior-knowledge external React developer looking to embed interactive MCP Apps (`McpApp`) and invoke MCP tools (`callMcpTool`) inside an A2UI v1.0 application, we audited public npm and the public `google/A2UI` GitHub repository:

### 1.1 Public npm Registry Audit (`@a2ui/catalog-mcp`)
Running `npm view @a2ui/catalog-mcp` reveals a single published package version:
- **Package:** `@a2ui/catalog-mcp@0.0.1-alpha.1`
- **Published Exports:**
  - `.`: `./dist/index.js` (`MCP_CATALOG_ID`, `MCP_CATALOG_DEFINITIONS`, `createCallMcpToolFunction`, `McpCatalogOptions`)
  - `./catalog.json`: `./dist/catalog.json`
- **Dependencies:** `@modelcontextprotocol/sdk: ^1.29.0`, `zod: ^4.1.12`
- **Peer Dependencies:** `@a2ui/web_core: ^0.9.1`

### 1.2 Public GitHub Repository Audit (`google/A2UI`)
Inspecting the public `google/A2UI` repository reveals a stark split between the **v1.0 MCP Catalog Specification + Shared Sandbox Infrastructure** and the **published `@a2ui/catalog-mcp` package**:

| Artifact in Public `google/A2UI` | Protocol Version | What It Contains | Published to npm? |
| :--- | :--- | :--- | :--- |
| `catalogs/mcp/v1/catalog.json` | **`"1.0"`** (`https://a2ui.org/specification/v1_0/catalogs/mcp/catalog.json`) | Normative v1.0 JSON Schema for the **`McpApp`** component (`htmlContent`, `resourceUri`, `serverConfig`, `allowedTools`, `allowedFunctions`, `data.paths`) and **`callMcpTool`** function (`serverUrl`, `toolName`, `arguments`, `targetDataPath`). | **No** (`@a2ui/catalog-mcp` copies `catalogs/mcp/catalog.json` v0.9 instead) |
| `catalogs/mcp/v1/mcp_app_specification.md` | **`"1.0"`** | Normative specification for `McpApp`: double-iframe sandbox security model, Phase A (`ui/notifications/sandbox-proxy-ready` $\rightarrow$ `ui/notifications/sandbox-resource-ready`) & Phase B (`ui/initialize` $\rightarrow$ `ui/notifications/initialized`) handshakes, two-way `data.paths` sync (`ui/notifications/data-model-update` & `ui/notifications/data-model-change`), `ui/requests/function-call`, and `tools/call`. | **No** |
| `typescript/catalogs/shared/sandbox/` | **`v1_0`** | Shared TypeScript double-iframe host primitives (`SandboxedFrameElement`, `ComponentContextFrameHost`, `DataModelSync`, `FrameSizing`, `payload_validation.ts`, `sandbox.ts`). | **No** (`"private": true`, no React wrapper) |
| `typescript/catalogs/mcp/` (`@a2ui/catalog-mcp@0.0.1-alpha.1`) | **`v0.9` only** | Exports `MCP_CATALOG_ID = 'https://a2ui.org/specification/v0_9/catalogs/mcp/mcp_catalog.json'` and `createCallMcpToolFunction` importing from `@a2ui/web_core/v0_9`. Does **not** export `McpApp` or include `sandbox.html`. | **Yes** (`0.0.1-alpha.1`, v0.9 only) |
| `docs/public/guides/mcp-apps-in-a2ui.md` | **v0.8 / v0.9 draft** | Public guide explaining the double-iframe architecture and `AppBridge`, but its JSON example uses legacy `"type": "custom", "name": "McpApp", "properties": { "content": "..." }` syntax instead of v1.0 `"component": "McpApp", "htmlContent": "..."`. | Docs only |
| `samples/community/client/lit/mcp-apps-in-a2ui-sample/` | **v0.8 Lit sample** | Community Lit sample demonstrating an embedded MCP App iframe. | Sample only |

---

## 2. How FreshCart Showcases A2UI v1.0 `McpApp` + Sandboxed Double-Iframe + `callMcpTool`

Because `@a2ui/catalog-mcp@0.0.1-alpha.1` on npm only ships v0.9 `callMcpTool` and `@a2ui/react` has no `McpApp` implementation, we implemented a specification-compliant **A2UI v1.0 MCP Catalog Renderer** in FreshCart covering both `McpApp` and `callMcpTool` from `https://a2ui.org/specification/v1_0/catalogs/mcp/catalog.json`:

1. **Normative Double-Iframe Sandbox Proxy ([public/a2ui-sandbox/sandbox.html](file:///usr/local/google/home/josemontesp/freshcart-a2ui-prs/02-mcp-iframe/public/a2ui-sandbox/sandbox.html)):**
   - Enforces `window.self !== window.top` and validates `document.referrer` origin.
   - Dynamically creates the inner iframe with `sandbox="allow-scripts allow-forms allow-modals"` and explicitly strips `allow-same-origin`, `allow-top-navigation`, `allow-top-navigation-by-user-activation`, `allow-popups`, and `allow-popups-to-escape-sandbox` so the inner MCP App runs in a true opaque origin (`window.origin === "null"`).
   - Injects a strict `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none';">` into the inner `srcdoc` HTML to prevent network exfiltration.
   - Completes Phase A (`ui/notifications/sandbox-proxy-ready` $\rightarrow$ `ui/notifications/sandbox-resource-ready`) and relays JSON-RPC 2.0 `postMessage` frames between the A2UI Host and the inner guest iframe.
2. **React `McpApp` Host & Bridge ([src/a2ui/catalogs/mcpCatalogRenderer.tsx](file:///usr/local/google/home/josemontesp/freshcart-a2ui-prs/02-mcp-iframe/src/a2ui/catalogs/mcpCatalogRenderer.tsx)):**
   - Decodes `url_encoded:` HTML payloads in `htmlContent`.
   - Enforces `validateMcpBridgePayload` on every inbound JSON-RPC message (rejects `__proto__`/`constructor`/`prototype` keys, object depth > 10, or payloads > 64 KB).
   - Completes Phase B (`ui/initialize` $\rightarrow$ `ui/notifications/initialized`) and auto-resizes the iframe via `ui/notifications/size-changed`.
   - Synchronizes two-way `data.paths` bindings:
     - **Host $\rightarrow$ App (`ui/notifications/data-model-update`)**: Moving the native A2UI `Slider` (`/mcpState/recipeScale/servings`) or `ChoicePicker` (`/mcpState/recipeScale/panStyle`) outside the iframe immediately pushes updated state into the sandboxed MCP App.
     - **App $\rightarrow$ Host (`ui/notifications/data-model-change`)**: Clicking Metric/Imperial or `−`/`+` Servings inside the sandboxed iframe resolves the relative subpath against `data.paths`, performs deep-equality and echo-suppression checks, and mutates the parent A2UI surface's `DataModel` live.
   - Evaluates `ui/requests/function-call` against `allowedFunctions` (`formatCurrency`, `formatNumber`) via `DataModelBinder.evaluateFunctionCall` and returns the formatted result over JSON-RPC.
   - Evaluates `tools/call` against `allowedTools` (`add_mcp_pairing_to_cart`, `apply_kitchen_scaling`, `sync_pantry_staples`): authorized calls add real culinary bundles to FreshCart's live shopping cart and return an MCP `CallToolResult`; unauthorized calls (e.g. `clear_entire_cart`) are blocked with JSON-RPC `-32601` and logged in the built-in **MCP AppBridge JSON-RPC 2.0 Wire Log**.
3. **Declarative `callMcpTool` Catalog Function ([src/a2ui/DataModelBinder.ts](file:///usr/local/google/home/josemontesp/freshcart-a2ui-prs/02-mcp-iframe/src/a2ui/DataModelBinder.ts)):**
   - Implements `@call: "callMcpTool"` with v1.0 `targetDataPath` support so native A2UI `Button` components can invoke MCP tools declaratively and write their structured response into the surface `DataModel`.

---

## 3. Public Documentation Gaps Discovered (`MCP-DOC-GAP-*`)

| ID | Location | Severity | Description & Impact on External Developers |
| :--- | :--- | :--- | :--- |
| **`MCP-DOC-GAP-01`** | `catalogs/mcp/README.md` & npm `@a2ui/catalog-mcp` | **High** | **`@a2ui/catalog-mcp` README does not mention v0.9-only status or missing `McpApp` component.** A developer installing `@a2ui/catalog-mcp` expecting the `McpApp` component documented in `catalogs/mcp/v1/mcp_app_specification.md` discovers only `createCallMcpToolFunction` targeting `@a2ui/web_core/v0_9`. |
| **`MCP-DOC-GAP-02`** | `docs/public/guides/mcp-apps-in-a2ui.md` (lines 71–95) | **High** | **Outdated component schema in public MCP Apps guide.** The guide instructs developers to emit `"type": "custom", "name": "McpApp", "properties": { "content": "<div>...</div>" }`, whereas A2UI v1.0 (`catalogs/mcp/v1/catalog.json`) requires `"component": "McpApp", "htmlContent": "..."` with top-level properties (`allowedTools`, `allowedFunctions`, `data.paths`). |
| **`MCP-DOC-GAP-03`** | `docs/public/guides/mcp-apps-in-a2ui.md` (line 138) | **Medium** | **Broken relative link to sample component.** Line 138 links to `[mcp-apps-component.ts](../../../samples/client/lit/mcp-apps-in-a2ui-sample/ui/custom-components/mcp-apps-component.ts)`, which 404s because the sample was moved under `samples/community/client/lit/mcp-apps-in-a2ui-sample/`. |
| **`MCP-DOC-GAP-04`** | `catalogs/mcp/v1/mcp_app_specification.md` | **Medium** | **Undocumented `url_encoded:` prefix convention on `htmlContent`.** `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts` (lines 38–49) checks for and decodes a `url_encoded:` prefix on `htmlContent`, and `mcp_app_specification.md` line 153 shows `"htmlContent": "url_encoded:..."` in a snippet, but neither `catalog.json` nor the prose specification defines the `url_encoded:` prefix contract. |
| **`MCP-DOC-GAP-05`** | `renderers/react/README.md` & `docs/public/guides/mcp-apps-in-a2ui.md` | **High** | **Zero React documentation or hosting instructions for `/a2ui-sandbox/sandbox.html`.** Neither `@a2ui/react` nor the MCP guide explains how a React/Vite host should serve `sandbox.html` or wire `McpApp` into a React surface renderer. |

---

## 4. Public Library & Specification Bugs Discovered (`MCP-BUG-*`)

### `MCP-BUG-01` (High): `@a2ui/catalog-mcp@0.0.1-alpha.1` Ships v0.9 `catalog.json` and Omits `McpApp` & `v1/catalog.json`
- **Where:** `typescript/catalogs/mcp/scripts/copy-catalog.js` (line 8) and `typescript/catalogs/mcp/src/index.ts` (line 27).
- **Evidence:** `copy-catalog.js` copies `../../../catalogs/mcp/catalog.json` (which is v0.9 `https://a2ui.org/specification/v0_9/catalogs/mcp/mcp_catalog.json`) instead of `../../../catalogs/mcp/v1/catalog.json`. Furthermore, `src/index.ts` only exports `createCallMcpToolFunction` for `@a2ui/web_core/v0_9` and does not export `McpApp` or bundle `sandbox.html`.

### `MCP-BUG-02` (Critical Security): Public Lit Sample Passes `allow-same-origin` to the Inner Sandbox Iframe, Defeating Double-Iframe Isolation
- **Where:**
  - `samples/community/client/lit/mcp-apps-in-a2ui-sample/ui/custom-components/mcp-apps-component.ts` (line 194)
  - `samples/community/client/shared/mcp_apps_inner_iframe/sandbox.ts` (line 150)
- **Evidence:** Both `docs/public/guides/mcp-apps-in-a2ui.md` (lines 19–29) and `catalogs/mcp/v1/mcp_app_specification.md` (Section "1. Double-Iframe Sandboxing") state that the inner iframe **MUST NOT** include `allow-same-origin` because combining `allow-scripts` with `allow-same-origin` allows the untrusted MCP App to access the parent window and strip its own `sandbox` attribute. Yet `mcp-apps-component.ts` line 194 sends:
  ```ts
  sandbox: 'allow-scripts allow-forms allow-popups allow-modals allow-same-origin',
  ```
  and `samples/community/client/shared/mcp_apps_inner_iframe/sandbox.ts` line 150 sets `inner.setAttribute('sandbox', sandbox)` directly without stripping `allow-same-origin`!

### `MCP-BUG-03` (Medium Security): `typescript/catalogs/shared/sandbox/sandbox.ts` Only Filters `allow-same-origin` When Overriding Inner Iframe `sandbox` Attribute
- **Where:** `typescript/catalogs/shared/sandbox/sandbox.ts` (lines 426–431 vs. lines 55–59).
- **Evidence:** Lines 55–59 document that `allow-top-navigation` and `allow-popups` must be omitted from the inner iframe to prevent frame-busting and clickjacking exfiltration. However, when `payload.sandbox` is provided in `ui/notifications/sandbox-resource-ready` (lines 426–431), `sandbox.ts` only filters `flag.toLowerCase() !== 'allow-same-origin'`, allowing `allow-top-navigation`, `allow-top-navigation-by-user-activation`, `allow-popups`, and `allow-popups-to-escape-sandbox` to be injected into the inner iframe.
- **Our Fix in FreshCart:** [public/a2ui-sandbox/sandbox.html](file:///usr/local/google/home/josemontesp/freshcart-a2ui-prs/02-mcp-iframe/public/a2ui-sandbox/sandbox.html) filters against the full `FORBIDDEN_SANDBOX_FLAGS` set (`allow-same-origin`, `allow-top-navigation`, `allow-top-navigation-by-user-activation`, `allow-popups`, `allow-popups-to-escape-sandbox`, `allow-pointer-lock`).

### `MCP-BUG-04` (Medium Schema Mismatch): `catalogs/mcp/v1/catalog.json` Omits `height` Property on `McpApp`
- **Where:** `catalogs/mcp/v1/catalog.json` (`components.McpApp.properties`, lines 23–87) vs. `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts` (line 29, `frameHeightFromProp`).
- **Evidence:** The v1.0 `McpApp` schema sets `"unevaluatedProperties": false` and lists `resourceUri`, `htmlContent`, `serverConfig`, `title`, `allowedTools`, `allowedFunctions`, and `data`, but omits `height`. Meanwhile, `SandboxedFrameElement` in `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts` expects a `height` property (`frameHeightFromProp`). Strict JSON Schema validation against `catalogs/mcp/v1/catalog.json` rejects `McpApp` components that pass `height`.

### `MCP-BUG-05` (Medium Protocol Mismatch): `callMcpTool.ts` Hardcodes `version: 'v0.9'` and Ignores `targetDataPath`
- **Where:** `typescript/catalogs/mcp/src/functions/callMcpTool.ts` (lines 67–74 and line 387).
- **Evidence:** `catalogs/mcp/v1/catalog.json` (lines 139–142) defines `targetDataPath` on `callMcpTool` ("Optional JSON pointer path in the local DataModel where a non-UI data result should be written") and sets `"protocolVersion": "1.0"`. However, `callMcpTool.ts` omits `targetDataPath` from `CallMcpToolArgsSchema` and hardcodes `version: 'v0.9'` in `ensureMessageVersion` (line 387), causing v1.0 surfaces to reject returned messages.
