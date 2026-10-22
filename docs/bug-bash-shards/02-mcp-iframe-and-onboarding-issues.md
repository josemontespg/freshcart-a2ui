# Shard 02 — MCP Component + Double-Iframe Sandbox (`@a2ui/catalog-mcp`) & Core v1.0 React Onboarding Issues

**Author:** `@a2ui-scout`  
**Total Issues in Shard:** 23 (12 Bugs + 11 Documentation Gaps)

---

## [ISSUE-02-01] [v1.0][catalog-mcp] @a2ui/catalog-mcp@0.0.1-alpha.1 ships v0.9 catalog.json and omits v1.0 McpApp component & sandbox.html
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `MCP Component & Iframe (@a2ui/catalog-mcp)`
- **Title**: `[v1.0][catalog-mcp] @a2ui/catalog-mcp@0.0.1-alpha.1 ships v0.9 catalog.json and omits v1.0 McpApp component & sandbox.html`

<!-- ISSUE_BODY_START -->
### Summary
In the repository, `catalogs/mcp/v1/catalog.json` (`https://a2ui.org/specification/v1_0/catalogs/mcp/catalog.json`, `protocolVersion: "1.0"`) and `catalogs/mcp/v1/mcp_app_specification.md` define the A2UI v1.0 `McpApp` component and `callMcpTool` function, and `typescript/catalogs/shared/sandbox/` contains the v1.0 double-iframe host implementation (`SandboxedFrameElement`, `ComponentContextFrameHost`, `DataModelSync`, `FrameSizing`, `sandbox.ts`).

However, the published `@a2ui/catalog-mcp@0.0.1-alpha.1` package on npm (and `typescript/catalogs/mcp/`) only ships the v0.9 `catalog.json` (`https://a2ui.org/specification/v0_9/catalogs/mcp/mcp_catalog.json`), imports from `@a2ui/web_core/v0_9`, only exports `createCallMcpToolFunction`, and omits both the `McpApp` component implementation and the compiled `sandbox.html` double-iframe proxy.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/catalog-mcp@0.0.1-alpha.1`
- **File path(s)**:
  - `typescript/catalogs/mcp/scripts/copy-catalog.js` (lines 7–13)
  - `typescript/catalogs/mcp/src/index.ts` (lines 17–56)
  - `typescript/catalogs/mcp/package.json` (lines 16–39)
  - `catalogs/mcp/v1/catalog.json` (lines 1–160)

### Steps to Reproduce / Evidence
1. Inspect `typescript/catalogs/mcp/scripts/copy-catalog.js`:
   ```js
   const src = join(__dirname, '../../../catalogs/mcp/catalog.json');
   const destDir = join(__dirname, '../dist');
   const dest = join(destDir, 'catalog.json');
   ```
   It copies `catalogs/mcp/catalog.json` (v0.9) instead of `catalogs/mcp/v1/catalog.json` (v1.0).
2. Inspect `typescript/catalogs/mcp/src/index.ts`:
   ```ts
   import { FunctionImplementation } from '@a2ui/web_core/v0_9';
   ...
   export const MCP_CATALOG_ID =
     'https://a2ui.org/specification/v0_9/catalogs/mcp/mcp_catalog.json';
   ```
3. Run `npm view @a2ui/catalog-mcp@0.0.1-alpha.1 exports`:
   ```json
   {
     ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
     "./catalog.json": "./dist/catalog.json"
   }
   ```

### Expected Behavior
`@a2ui/catalog-mcp` should provide a `./v1_0` (or root v1.0) export with `MCP_CATALOG_ID = 'https://a2ui.org/specification/v1_0/catalogs/mcp/catalog.json'`, export the `McpApp` component implementation (wrapping `SandboxedFrameElement` / `ComponentContextFrameHost`) alongside `createCallMcpToolFunction` for `@a2ui/web_core/v1_0`, and bundle `./v1/catalog.json` and `./sandbox/sandbox.html`.

### Actual Behavior
Installing `@a2ui/catalog-mcp` only provides v0.9 `createCallMcpToolFunction` and v0.9 `catalog.json`, with no `McpApp` component or `sandbox.html` asset.

### Suggested Fix
1. Update `typescript/catalogs/mcp/scripts/copy-catalog.js` to also copy `catalogs/mcp/v1/catalog.json` into `dist/v1/catalog.json`.
2. Add a `v1_0` entrypoint in `typescript/catalogs/mcp` targeting `@a2ui/web_core/v1_0` that exports the v1.0 `McpApp` component definition, `createCallMcpToolFunction`, and prebuilt `sandbox.html`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-02] [Security][mcp-apps] Community Lit MCP App sample passes allow-same-origin to inner sandbox iframe, defeating double-iframe isolation
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `MCP Component & Iframe (@a2ui/catalog-mcp)`
- **Title**: `[Security][mcp-apps] Community Lit MCP App sample passes allow-same-origin to inner sandbox iframe, defeating double-iframe isolation`

<!-- ISSUE_BODY_START -->
### Summary
Both `docs/public/guides/mcp-apps-in-a2ui.md` (lines 19–29) and `catalogs/mcp/v1/mcp_app_specification.md` (Section "1. Double-Iframe Sandboxing") explicitly warn that the inner iframe **MUST NOT** include `allow-same-origin` because combining `allow-scripts` with `allow-same-origin` allows the untrusted MCP App to access the parent window and remove its own `sandbox` attribute.

However, in `samples/community/client/lit/mcp-apps-in-a2ui-sample/ui/custom-components/mcp-apps-component.ts`, `sendSandboxResourceReady()` explicitly sends `sandbox: 'allow-scripts allow-forms allow-popups allow-modals allow-same-origin'`, and `samples/community/client/shared/mcp_apps_inner_iframe/sandbox.ts` applies that `sandbox` string verbatim to the inner iframe without stripping `allow-same-origin`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `samples/community/client/lit/mcp-apps-in-a2ui-sample/ui/custom-components/mcp-apps-component.ts` (lines 186–200)
  - `samples/community/client/shared/mcp_apps_inner_iframe/sandbox.ts` (lines 147–156)

### Steps to Reproduce / Evidence
1. Inspect `samples/community/client/lit/mcp-apps-in-a2ui-sample/ui/custom-components/mcp-apps-component.ts` (lines 186–198):
   ```ts
   private sendSandboxResourceReady() {
     if (this.iframeRef.value?.contentWindow && this.content) {
       const message: McpUiSandboxResourceReadyNotification = {
         jsonrpc: '2.0',
         method: 'ui/notifications/sandbox-resource-ready',
         params: {
           html: this.content,
           sandbox:
             'allow-scripts allow-forms allow-popups allow-modals allow-same-origin',
         },
       };
   ```
2. Inspect `samples/community/client/shared/mcp_apps_inner_iframe/sandbox.ts` (lines 148–152):
   ```ts
   if (typeof sandbox === 'string') {
     inner.setAttribute('sandbox', sandbox);
   }
   ```
3. Because both the outer iframe (`sandbox="allow-scripts allow-same-origin"`) and the inner iframe (`sandbox="... allow-same-origin"`) have `allow-scripts` + `allow-same-origin`, the untrusted `html` inside the inner iframe shares the host's origin (`window.origin !== "null"`), can read `window.top.document` / `localStorage`, and can escape the sandbox completely.

### Expected Behavior
`mcp-apps-component.ts` must never pass `allow-same-origin` in `params.sandbox`, and `samples/community/client/shared/mcp_apps_inner_iframe/sandbox.ts` must defensively strip `allow-same-origin` (and `allow-top-navigation*`, `allow-popups*`) before calling `inner.setAttribute('sandbox', ...)`.

### Actual Behavior
The inner iframe receives `allow-same-origin`, giving untrusted MCP App HTML full same-origin access to the outer proxy and host application.

### Suggested Fix
Remove `allow-same-origin` and `allow-popups` from `mcp-apps-component.ts:194` and add a strict allowlist/blocklist filter on `sandbox` tokens in `samples/community/client/shared/mcp_apps_inner_iframe/sandbox.ts:150`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-03] [v1.0][sandbox] typescript/catalogs/shared/sandbox/sandbox.ts only filters allow-same-origin and fails to strip allow-top-navigation and allow-popups
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `MCP Component & Iframe (@a2ui/catalog-mcp)`
- **Title**: `[v1.0][sandbox] typescript/catalogs/shared/sandbox/sandbox.ts only filters allow-same-origin and fails to strip allow-top-navigation and allow-popups`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/catalogs/shared/sandbox/sandbox.ts`, the security architecture comment (lines 55–59) states:
> `allow-top-navigation` and `allow-popups` are omitted to prevent frame-busting and clickjacking exfiltration.

However, when `ui/notifications/sandbox-resource-ready` provides a `payload.sandbox` string (lines 426–431), `sandbox.ts` only filters out `allow-same-origin` and allows `allow-top-navigation`, `allow-top-navigation-by-user-activation`, `allow-popups`, and `allow-popups-to-escape-sandbox` to be set on the inner iframe.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `typescript/catalogs/shared/sandbox/sandbox.ts` (lines 55–59 and lines 424–433)

### Steps to Reproduce / Evidence
Inspect `typescript/catalogs/shared/sandbox/sandbox.ts` (lines 424–433):
```ts
if (typeof payload.sandbox === 'string') {
  // Never allow the inner frame to have allow-same-origin, even if requested.
  const safeSandbox = payload.sandbox
    .split(/\s+/)
    .filter((flag) => flag.toLowerCase() !== 'allow-same-origin')
    .join(' ');
  inner.setAttribute('sandbox', safeSandbox);
}
```
If a caller passes `sandbox: "allow-scripts allow-top-navigation allow-popups allow-popups-to-escape-sandbox"`, all of those flags remain in `safeSandbox` and are applied to the inner iframe.

### Expected Behavior
`sandbox.ts` should strip all dangerous sandbox tokens (`allow-same-origin`, `allow-top-navigation`, `allow-top-navigation-by-user-activation`, `allow-popups`, `allow-popups-to-escape-sandbox`, `allow-pointer-lock`) or restrict flags to an explicit allowlist (`allow-scripts`, `allow-forms`, `allow-modals`).

### Actual Behavior
Only `allow-same-origin` is filtered out when `payload.sandbox` is provided.

### Suggested Fix
Filter `payload.sandbox` against an explicit `ALLOWED_INNER_SANDBOX_FLAGS = new Set(['allow-scripts', 'allow-forms', 'allow-modals'])` in `typescript/catalogs/shared/sandbox/sandbox.ts:427`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-04] [v1.0][catalog-mcp] catalogs/mcp/v1/catalog.json omits 'height' property on McpApp despite SandboxedFrameElement reading frameHeightFromProp
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `MCP Component & Iframe (@a2ui/catalog-mcp)`
- **Title**: `[v1.0][catalog-mcp] catalogs/mcp/v1/catalog.json omits 'height' property on McpApp despite SandboxedFrameElement reading frameHeightFromProp`

<!-- ISSUE_BODY_START -->
### Summary
In `catalogs/mcp/v1/catalog.json`, the `McpApp` component schema sets `"unevaluatedProperties": false` and defines `resourceUri`, `htmlContent`, `serverConfig`, `title`, `allowedTools`, `allowedFunctions`, and `data` (lines 23–87), but omits `height`.

Meanwhile, `SandboxedFrameElement` in `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts` (line 29, `frameHeightFromProp`) and the Lit/Angular `McpApp` implementations expect an optional `height` property on the component to set the initial iframe height before dynamic `ui/notifications/size-changed` notifications arrive.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `catalogs/mcp/v1/catalog.json` (lines 17–95)
  - `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts` (lines 28–34, 71–77)

### Steps to Reproduce / Evidence
1. Inspect `catalogs/mcp/v1/catalog.json` (`components.McpApp`):
   - `"unevaluatedProperties": false` is set on line 88.
   - `properties` only lists `component`, `resourceUri`, `htmlContent`, `serverConfig`, `title`, `allowedTools`, `allowedFunctions`, and `data`.
2. Validate an `McpApp` component containing `"height": 360`:
   ```json
   {
     "id": "kitchen_converter_app",
     "component": "McpApp",
     "title": "Kitchen Converter",
     "height": 360,
     "htmlContent": "<div>...</div>"
   }
   ```
   Strict JSON Schema validation against `catalogs/mcp/v1/catalog.json` fails because `height` is an unevaluated property.

### Expected Behavior
`catalogs/mcp/v1/catalog.json` should declare an optional `height` property (number or string) on `McpApp.properties` matching `SandboxedFrameElement.frameHeightFromProp`.

### Actual Behavior
`height` is rejected by `catalogs/mcp/v1/catalog.json` due to `"unevaluatedProperties": false`.

### Suggested Fix
Add `"height"` (`{ "type": ["number", "string"], "description": "Optional initial height of the sandboxed iframe in pixels." }`) to `components.McpApp.properties` in `catalogs/mcp/v1/catalog.json`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-05] [v1.0][catalog-mcp] callMcpTool.ts hardcodes version: 'v0.9' in ensureMessageVersion and ignores v1.0 targetDataPath
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `MCP Component & Iframe (@a2ui/catalog-mcp)`
- **Title**: `[v1.0][catalog-mcp] callMcpTool.ts hardcodes version: 'v0.9' in ensureMessageVersion and ignores v1.0 targetDataPath`

<!-- ISSUE_BODY_START -->
### Summary
In `catalogs/mcp/v1/catalog.json` (lines 110–155), the v1.0 `callMcpTool` function defines four arguments: `serverUrl`, `toolName`, `arguments`, and `targetDataPath` ("Optional JSON pointer path in the local DataModel where a non-UI data result should be written").

However, `typescript/catalogs/mcp/src/functions/callMcpTool.ts`:
1. Omits `targetDataPath` from `CallMcpToolArgsSchema` (lines 67–74).
2. Hardcodes `version: 'v0.9'` in `ensureMessageVersion()` (line 387) when injecting A2UI envelopes returned by an MCP tool into `context.MessageProcessor.processMessages()`, causing v1.0 surfaces to fail or misroute messages.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/catalog-mcp@0.0.1-alpha.1`
- **File path(s)**:
  - `typescript/catalogs/mcp/src/functions/callMcpTool.ts` (lines 67–74 and lines 382–390)
  - `catalogs/mcp/v1/catalog.json` (lines 110–155)

### Steps to Reproduce / Evidence
1. Inspect `typescript/catalogs/mcp/src/functions/callMcpTool.ts` (lines 67–74):
   ```ts
   export const CallMcpToolArgsSchema = z.object({
     serverUrl: z.string().describe('The URL of the MCP server to connect to'),
     toolName: z.string().describe('The name of the MCP tool to call'),
     arguments: z
       .record(z.string(), z.unknown())
       .optional()
       .describe('Arguments to pass to the MCP tool'),
   });
   ```
2. Inspect `ensureMessageVersion` at lines 382–390:
   ```ts
   function ensureMessageVersion(msg: Record<string, unknown>): A2uiMessage {
     if (!('version' in msg)) {
       return {
         ...msg,
         version: 'v0.9',
       } as unknown as A2uiMessage;
     }
     return msg as unknown as A2uiMessage;
   }
   ```

### Expected Behavior
`CallMcpToolArgsSchema` should include `targetDataPath: z.string().optional()`, write non-UI tool results to `targetDataPath` on the surface's `dataModel` when specified, and preserve/default `version: 'v1.0'` when running in a v1.0 `MessageProcessor`.

### Actual Behavior
`targetDataPath` is ignored and unversioned MCP tool envelopes are stamped with `version: 'v0.9'`.

### Suggested Fix
Add `targetDataPath: z.string().optional()` to `CallMcpToolArgsSchema`, write structured tool output to `context.dataContext.set(targetDataPath, result)` when provided, and default `ensureMessageVersion` to `'v1.0'` for the v1.0 MCP catalog.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-06] [Docs][catalog-mcp] catalogs/mcp/README.md does not document v0.9-only status or missing McpApp component in @a2ui/catalog-mcp
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `MCP Component & Iframe (@a2ui/catalog-mcp)`
- **Title**: `[Docs][catalog-mcp] catalogs/mcp/README.md does not document v0.9-only status or missing McpApp component in @a2ui/catalog-mcp`

<!-- ISSUE_BODY_START -->
### Summary
`catalogs/mcp/README.md` (which is also published as the npm README for `@a2ui/catalog-mcp`) sits right next to `catalogs/mcp/v1/catalog.json` and `catalogs/mcp/v1/mcp_app_specification.md`, which define the v1.0 `McpApp` component and `callMcpTool` function. However, `catalogs/mcp/README.md` does not clarify that `@a2ui/catalog-mcp@0.0.1-alpha.1` only targets `@a2ui/web_core/v0_9` and does not include the `McpApp` component.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/catalog-mcp@0.0.1-alpha.1`
- **File path(s)**:
  - `catalogs/mcp/README.md` (lines 1–120)
  - `catalogs/mcp/v1/mcp_app_specification.md`

### Steps to Reproduce / Evidence
Read `catalogs/mcp/README.md`:
- It instructs running `npm install @a2ui/catalog-mcp @modelcontextprotocol/sdk` and registering `createCallMcpToolFunction()`, without stating which A2UI protocol version it supports or how to render `McpApp` from `catalogs/mcp/v1/catalog.json`.

### Expected Behavior
`catalogs/mcp/README.md` should clearly state protocol version compatibility (`v0.9` vs `v1.0`), link to `catalogs/mcp/v1/mcp_app_specification.md`, and explain how `McpApp` and `callMcpTool` are registered in v1.0 renderers.

### Actual Behavior
External developers installing `@a2ui/catalog-mcp` for an A2UI v1.0 project discover only at compile time that it requires `@a2ui/web_core/v0_9` and lacks `McpApp`.

### Suggested Fix
Update `catalogs/mcp/README.md` with a version support table (`v0.9` vs `v1.0`) and usage instructions for both `McpApp` and `callMcpTool`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-07] [Docs][mcp-apps] docs/public/guides/mcp-apps-in-a2ui.md uses legacy v0.8/v0.9 "type": "custom" schema instead of v1.0 "component": "McpApp"
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `MCP Component & Iframe (@a2ui/catalog-mcp)`
- **Title**: `[Docs][mcp-apps] docs/public/guides/mcp-apps-in-a2ui.md uses legacy v0.8/v0.9 "type": "custom" schema instead of v1.0 "component": "McpApp"`

<!-- ISSUE_BODY_START -->
### Summary
The public guide `docs/public/guides/mcp-apps-in-a2ui.md` (lines 71–95) teaches developers to emit an `McpApp` component using a legacy `"type": "custom", "name": "McpApp", "properties": { "content": "..." }` payload structure instead of the normative A2UI v1.0 `McpApp` schema defined in `catalogs/mcp/v1/catalog.json` (`"component": "McpApp", "htmlContent": "...", "allowedTools": [...], "allowedFunctions": {...}, "data": { "paths": {...} }`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/guides/mcp-apps-in-a2ui.md` (lines 71–95)
  - `catalogs/mcp/v1/catalog.json` (lines 17–95)

### Steps to Reproduce / Evidence
In `docs/public/guides/mcp-apps-in-a2ui.md` (lines 74–90):
```json
{
  "id": "mcp-app-1",
  "type": "custom",
  "name": "McpApp",
  "properties": {
    "content": "<div>... raw HTML/JS from MCP resource ...</div>",
    "title": "Calculator",
    "allowedTools": ["calculate", "clear"]
  }
}
```
In A2UI v1.0 (`catalogs/mcp/v1/catalog.json` and `catalogs/mcp/v1/mcp_app_specification.md`), this payload is invalid and must be written as:
```json
{
  "id": "mcp_app_1",
  "component": "McpApp",
  "catalogId": "https://a2ui.org/specification/v1_0/catalogs/mcp/catalog.json",
  "title": "Calculator",
  "htmlContent": "url_encoded:...",
  "allowedTools": ["calculate", "clear"]
}
```

### Expected Behavior
`docs/public/guides/mcp-apps-in-a2ui.md` should show the canonical A2UI v1.0 `McpApp` component syntax matching `catalogs/mcp/v1/catalog.json` and `catalogs/mcp/v1/mcp_app_specification.md`.

### Actual Behavior
The guide shows an obsolete `"type": "custom"` wrapper with `"content"` instead of `"component": "McpApp"` and `"htmlContent"`.

### Suggested Fix
Update `docs/public/guides/mcp-apps-in-a2ui.md` lines 71–95 to match `catalogs/mcp/v1/catalog.json` and link to `catalogs/mcp/v1/mcp_app_specification.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-08] [Docs][mcp-apps] Broken relative link to mcp-apps-component.ts in docs/public/guides/mcp-apps-in-a2ui.md
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `MCP Component & Iframe (@a2ui/catalog-mcp)`
- **Title**: `[Docs][mcp-apps] Broken relative link to mcp-apps-component.ts in docs/public/guides/mcp-apps-in-a2ui.md`

<!-- ISSUE_BODY_START -->
### Summary
Line 138 of `docs/public/guides/mcp-apps-in-a2ui.md` contains a broken relative link to `mcp-apps-component.ts` because the sample was moved under `samples/community/client/lit/mcp-apps-in-a2ui-sample/`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/guides/mcp-apps-in-a2ui.md` (line 138)

### Steps to Reproduce / Evidence
Inspect `docs/public/guides/mcp-apps-in-a2ui.md` line 138:
```markdown
See the full implementation in [mcp-apps-component.ts](../../../samples/client/lit/mcp-apps-in-a2ui-sample/ui/custom-components/mcp-apps-component.ts).
```
The path `samples/client/lit/mcp-apps-in-a2ui-sample/...` does not exist; the file is located at `samples/community/client/lit/mcp-apps-in-a2ui-sample/ui/custom-components/mcp-apps-component.ts`.

### Expected Behavior
The link should resolve to the existing file in the repository (or to `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts`).

### Actual Behavior
Clicking the link in `docs/public/guides/mcp-apps-in-a2ui.md` results in a 404 Not Found error.

### Suggested Fix
Update the relative link on line 138 of `docs/public/guides/mcp-apps-in-a2ui.md` to `../../../samples/community/client/lit/mcp-apps-in-a2ui-sample/ui/custom-components/mcp-apps-component.ts` (and reference `typescript/catalogs/shared/sandbox/`).
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-09] [Docs][v1.0][mcp] Undocumented 'url_encoded:' prefix convention for McpApp.htmlContent in catalogs/mcp/v1/mcp_app_specification.md
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `MCP Component & Iframe (@a2ui/catalog-mcp)`
- **Title**: `[Docs][v1.0][mcp] Undocumented 'url_encoded:' prefix convention for McpApp.htmlContent in catalogs/mcp/v1/mcp_app_specification.md`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts` (lines 38–49), `getDecodedHtmlContent()` checks if `htmlContent` starts with `"url_encoded:"` and runs `decodeURIComponent(this.htmlContent.slice('url_encoded:'.length))`. Similarly, `catalogs/mcp/v1/mcp_app_specification.md` (line 153) uses `"htmlContent": "url_encoded:..."` in a JSON example, yet neither `catalogs/mcp/v1/catalog.json` nor `mcp_app_specification.md` documents what the `url_encoded:` prefix is, when agents should emit it, or whether raw HTML strings without the prefix are also valid.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `catalogs/mcp/v1/mcp_app_specification.md` (line 153)
  - `catalogs/mcp/v1/catalog.json` (lines 31–34)
  - `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts` (lines 38–49)

### Steps to Reproduce / Evidence
1. Inspect `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts` (lines 38–49):
   ```ts
   protected getDecodedHtmlContent(): string {
     if (!this.htmlContent) return '';
     if (this.htmlContent.startsWith('url_encoded:')) {
       try {
         return decodeURIComponent(
           this.htmlContent.slice('url_encoded:'.length),
         );
       } catch (e) { ... }
     }
     return this.htmlContent;
   }
   ```
2. Inspect `catalogs/mcp/v1/catalog.json` (lines 31–34):
   ```json
   "htmlContent": {
     "type": "string",
     "description": "Self-contained HTML/JS payload to be rendered directly inside the sandboxed iframe via srcdoc."
   }
   ```
   There is no mention of `url_encoded:` in `catalog.json` or in the normative prose of `mcp_app_specification.md`.

### Expected Behavior
`catalogs/mcp/v1/catalog.json` and `catalogs/mcp/v1/mcp_app_specification.md` should explicitly document that `htmlContent` accepts either raw HTML or a `"url_encoded:<percent-encoded-html>"` string and specify that compliant renderers MUST decode the `url_encoded:` prefix before injecting `srcdoc`.

### Actual Behavior
The `url_encoded:` prefix appears in an example on line 153 of `mcp_app_specification.md` without any specification of its semantics or decoding rules.

### Suggested Fix
Document the `url_encoded:` prefix contract in both `catalogs/mcp/v1/catalog.json` (`htmlContent.description`) and `catalogs/mcp/v1/mcp_app_specification.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-10] [Docs][react][mcp] Missing React integration guide and /a2ui-sandbox/sandbox.html hosting instructions for McpApp
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `MCP Component & Iframe (@a2ui/catalog-mcp)`
- **Title**: `[Docs][react][mcp] Missing React integration guide and /a2ui-sandbox/sandbox.html hosting instructions for McpApp`

<!-- ISSUE_BODY_START -->
### Summary
`typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts` defaults `sandboxUrl` to `'/a2ui-sandbox/sandbox.html'` (line 36). However, neither `docs/public/guides/mcp-apps-in-a2ui.md`, `catalogs/mcp/v1/mcp_app_specification.md`, nor `typescript/renderers/react/README.md` documents how a host web application (Vite, Next.js, Webpack, etc.) must serve `/a2ui-sandbox/sandbox.html` or how to register `McpApp` in `@a2ui/react`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts` (line 36)
  - `docs/public/guides/mcp-apps-in-a2ui.md`
  - `typescript/renderers/react/README.md`

### Steps to Reproduce / Evidence
In `typescript/catalogs/shared/sandbox/sandboxed_frame_element.ts`:
```ts
@property({type: String}) sandboxUrl = '/a2ui-sandbox/sandbox.html';
```
If a developer mounts an `McpApp` component without configuring their bundler/static server to serve `sandbox.html` at `/a2ui-sandbox/sandbox.html` (or SPA fallback returns the main `index.html` instead), the outer iframe silently loads a recursive copy of the host app instead of the sandbox proxy, never emits `ui/notifications/sandbox-proxy-ready`, and hangs indefinitely.

### Expected Behavior
Public documentation should explain:
1. Where to obtain the compiled `sandbox.html` asset and how to serve it at `/a2ui-sandbox/sandbox.html` (including warning against SPA fallback returning the main app `index.html`).
2. How to register `McpApp` with `@a2ui/react`.

### Actual Behavior
There is zero documentation on `/a2ui-sandbox/sandbox.html` asset hosting or React `McpApp` registration.

### Suggested Fix
Add a "Hosting the Sandbox Proxy (`/a2ui-sandbox/sandbox.html`)" section and a React integration example to `docs/public/guides/mcp-apps-in-a2ui.md` and `catalogs/mcp/README.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-11] [v1.0][react] @a2ui/react@0.14.0 missing './v1_0' subpath export in package.json#exports
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[v1.0][react] @a2ui/react@0.14.0 missing './v1_0' subpath export in package.json#exports`

<!-- ISSUE_BODY_START -->
### Summary
`@a2ui/web_core@0.14.0` provides versioned subpath exports for `./v0_8`, `./v0_9`, and `./v1_0` (as well as `./catalogs/basic/v1`). However, `@a2ui/react@0.14.0` only defines `.`, `./v0_8`, `./v0_9`, `./styles`, and `./styles/structural.css` in `package.json#exports`, omitting `./v1_0`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/react@0.14.0`
- **File path(s)**:
  - `typescript/renderers/react/package.json` (lines 27–69)
  - `typescript/renderers/react/src/v0_9/index.ts`

### Steps to Reproduce / Evidence
1. Inspect `typescript/renderers/react/package.json` (lines 27–58):
   - Exports `.`, `./v0_8`, and `./v0_9`, with no `./v1_0` entry.
2. Inspect `typescript/renderers/react/src/v0_9/index.ts`:
   ```ts
   export * from '../index.js';
   ```
3. Attempt to import `@a2ui/react/v1_0` alongside `@a2ui/web_core/v1_0`:
   ```ts
   import { MessageProcessor } from '@a2ui/web_core/v1_0';
   import { A2uiSurface } from '@a2ui/react/v1_0';
   ```
   Throws `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './v1_0' is not defined by "exports" in .../node_modules/@a2ui/react/package.json`.

### Expected Behavior
`@a2ui/react` should expose a `./v1_0` subpath export in `package.json#exports` (symmetric with `@a2ui/web_core/v1_0` and `@a2ui/react/v0_9`).

### Actual Behavior
Importing from `@a2ui/react/v1_0` throws `ERR_PACKAGE_PATH_NOT_EXPORTED`.

### Suggested Fix
Add `src/v1_0/index.ts` (`export * from '../index.js';`) and the `"./v1_0"` entry to `typescript/renderers/react/package.json#exports`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-12] [v1.0][web_core] PayloadValidator.validateComponent enforces UAX #31 on component instance 'id', rejecting hyphenated IDs used in the v1.0 spec
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[v1.0][web_core] PayloadValidator.validateComponent enforces UAX #31 on component instance 'id', rejecting hyphenated IDs used in the v1.0 spec`

<!-- ISSUE_BODY_START -->
### Summary
There is a direct contradiction between the A2UI v1.0 specification and `@a2ui/web_core@0.14.0`'s `PayloadValidator`:
1. `specification/v1_0/docs/a2ui_protocol.md` (Section "Catalog Entity Naming Rules", lines 546–568) states that UAX #31 variable naming rules apply to **catalog entity identifiers** (*"specifically component names, function names, and argument/property names"*), NOT component instance `id`s (`ComponentId`).
2. `specification/v1_0/json/common_types.json` defines `"ComponentId": { "type": "string" }` with no UAX #31 regex pattern.
3. Line 1335 of `specification/v1_0/docs/a2ui_protocol.md` (the official `@index` example) uses a hyphenated component instance ID: `"id": "todo-index"`.
4. `docs/public/concepts/components.md` ("Best Practices") explicitly recommends: `1. Descriptive IDs: Use "user-profile-card" not "c1"`.

However, `PayloadValidator.validateComponent` in `typescript/core/web_core/src/validation/payload-validator.ts` (line 186) calls `this.assertIdentifier(id, "Component id '...' must be a valid UAX #31 identifier")`, which rejects any component instance `id` containing a hyphen (`-`) when `protocolVersion >= 1.0`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/validation/payload-validator.ts` (line 186)
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 546–568, line 1335)
  - `specification/v1_0/json/common_types.json` (`$defs/ComponentId`)

### Steps to Reproduce / Evidence
Run the official `@index` example from `specification/v1_0/docs/a2ui_protocol.md` (line 1335) through `@a2ui/web_core/v1_0`'s `MessageProcessor`:
```ts
import { MessageProcessor, basicCatalog } from '@a2ui/web_core/v1_0';

const processor = new MessageProcessor([basicCatalog]);
processor.processMessages([
  {
    version: 'v1.0',
    createSurface: {
      surfaceId: 's1',
      catalogId: basicCatalog.id,
      components: [
        { id: 'root', component: 'Column', children: ['todo-index'] },
        { id: 'todo-index', component: 'Text', text: '1' },
      ],
    },
  },
]);
```
Throws:
```text
A2uiValidationError: Component id 'todo-index' must be a valid UAX #31 identifier
```

### Expected Behavior
Either `PayloadValidator.validateComponent` should not enforce UAX #31 on component instance `id`s (matching `common_types.json#/$defs/ComponentId` and the `todo-index` spec example), OR `common_types.json`, `a2ui_protocol.md`, and `docs/public/concepts/components.md` must be updated to mandate UAX #31 for `ComponentId` and replace `"todo-index"` / `"user-profile-card"`.

### Actual Behavior
Spec-valid v1.0 payloads with hyphenated component `id`s (including the v1.0 specification's own example) throw `A2uiValidationError` at runtime in `@a2ui/web_core@0.14.0`.

### Suggested Fix
Align `PayloadValidator.validateComponent` (`payload-validator.ts:186`) and `specification/v1_0/json/common_types.json#/$defs/ComponentId` so the spec and validator agree on whether `ComponentId` allows hyphens.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-13] [v1.0][web_core] A2uiBasicTextElement throws EventTarget.dispatchEvent TypeError in JSDOM when consuming @lit/context
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[v1.0][web_core] A2uiBasicTextElement throws EventTarget.dispatchEvent TypeError in JSDOM when consuming @lit/context`

<!-- ISSUE_BODY_START -->
### Summary
When rendering `<A2uiSurface>` in a Node.js + JSDOM test environment (e.g. Vitest or Jest), mounting `<a2ui-basic-text>` (`A2uiBasicTextElement`) throws `TypeError: Failed to execute 'dispatchEvent' on 'EventTarget': parameter 1 is not of type 'Event'` inside `@lit/context`'s `ContextConsumer` unless the consumer manually overwrites `globalThis.Event = window.Event` and `globalThis.CustomEvent = window.CustomEvent` before importing `@a2ui/web_core`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/catalogs/basic/universal/components/text.ts`
  - `typescript/renderers/react/src/A2uiSurface.tsx`

### Steps to Reproduce / Evidence
In a Node.js test using `jsdom` where `window` and `document` are attached to `globalThis` without overriding Node's built-in `globalThis.Event`:
```text
TypeError: Failed to execute 'dispatchEvent' on 'EventTarget': parameter 1 is not of type 'Event'.
    at A2uiBasicTextElement.dispatchEvent (.../jsdom/lib/generated/idl/EventTarget.js:221:24)
    at s.dispatchRequest (.../@lit/context/lib/controllers/context-consumer.js:6:720)
```
Because Node 20+ defines a native `globalThis.Event` class that is a different realm constructor from JSDOM's `dom.window.Event`, `@lit/context`'s `new ContextRequestEvent(...)` inherits from Node's `globalThis.Event` and is rejected by JSDOM's `HTMLElement.prototype.dispatchEvent`.

### Expected Behavior
Testing `<A2uiSurface>` with JSDOM should either work out of the box or have documented JSDOM setup requirements in `@a2ui/react/README.md`.

### Actual Behavior
Unit tests rendering `Text` components crash in JSDOM with an opaque WebIDL `EventTarget.dispatchEvent` error.

### Suggested Fix
Document the required JSDOM globals (`globalThis.Event = window.Event; globalThis.CustomEvent = window.CustomEvent;`) in `typescript/renderers/react/README.md` and test helpers.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-14] [Packaging][web_core] @a2ui/web_core@0.14.0 npm tarball ships .tsbuildinfo (182 KB) and compiled *.test.js / *.test.d.ts files
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[Packaging][web_core] @a2ui/web_core@0.14.0 npm tarball ships .tsbuildinfo (182 KB) and compiled *.test.js / *.test.d.ts files`

<!-- ISSUE_BODY_START -->
### Summary
The published `@a2ui/web_core@0.14.0` npm package ships TypeScript incremental build cache `.tsbuildinfo` (182.2 KB) and dozens of compiled unit test files (`*.test.js`, `*.test.d.ts`, `*.test.js.map`) in its npm tarball.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/package.json`
  - `typescript/core/web_core/tsconfig.json`

### Steps to Reproduce / Evidence
Run `npm pack --dry-run @a2ui/web_core@0.14.0`:
- Includes `.tsbuildinfo` (`182.2 kB`)
- Includes `catalogs/basic/v0_9/catalog.test.js`, `schema_generator.test.js` (`41.4 kB`), `schema_serializer.test.js` (`40.6 kB`), `message-processor.test.js`, and corresponding `.test.d.ts` and `.test.js.map` files.

### Expected Behavior
The published npm tarball should exclude `.tsbuildinfo` and `**/*.test.*` artifacts.

### Actual Behavior
Test artifacts and incremental TypeScript build caches are published to npm, inflating package size.

### Suggested Fix
Add a `.npmignore` (or `files` filter / build cleanup step in `scripts/prepare-publish.mjs`) excluding `*.tsbuildinfo` and `**/*.test.*`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-15] [v1.0][web_core] MessageProcessor options.version defaults to 'v0.9' even when initialized exclusively with v1.0 catalogs
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[v1.0][web_core] MessageProcessor options.version defaults to 'v0.9' even when initialized exclusively with v1.0 catalogs`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/core/web_core/src/processing/message-processor.ts` (lines 132 and 172), `MessageProcessor` defaults `this.version` to `'v0.9'` even when imported from `@a2ui/web_core/v1_0` and initialized exclusively with v1.0 catalogs (`catalog.protocolVersion === '1.0'`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/processing/message-processor.ts` (lines 132, 171–174)

### Steps to Reproduce / Evidence
Inspect `typescript/core/web_core/src/processing/message-processor.ts` (lines 171–174):
```ts
const opts = this.normalizeOptions(options);
this.version = opts?.version ?? 'v0.9';
```
When a developer writes:
```ts
import { MessageProcessor, basicCatalog } from '@a2ui/web_core/v1_0';
const processor = new MessageProcessor([basicCatalog], actionHandler);
```
`processor` defaults its fallback adapter version to `'v0.9'` instead of inferring `'v1.0'` from `basicCatalog.protocolVersion` (`'1.0'`).

### Expected Behavior
When `options.version` is not explicitly provided, `MessageProcessor` should infer the default protocol version from the registered catalogs (e.g. `'v1.0'` when any registered catalog has `protocolVersion === '1.0'`), or `@a2ui/web_core/v1_0` should default `version` to `'v1.0'`.

### Actual Behavior
`this.version` unconditionally defaults to `'v0.9'`.

### Suggested Fix
In `MessageProcessor` constructor (`message-processor.ts:172`), infer the default version from `catalogs` (`catalogs.some(c => c.protocolVersion === '1.0') ? 'v1.0' : 'v0.9'`) when `opts?.version` is omitted.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-16] [v1.0][web_core] V1Point0Adapter reads createSurface.theme, but CreateSurfaceMessageSchema rejects 'theme' due to .strict()
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[v1.0][web_core] V1Point0Adapter reads createSurface.theme, but CreateSurfaceMessageSchema rejects 'theme' due to .strict()`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/core/web_core/src/processing/adapters/v1_0.ts` (line 44), `V1Point0Adapter.extractOperationsFromObject` explicitly extracts `theme: cs?.theme` from `msgObj.createSurface`. Furthermore, `typescript/core/web_core/src/catalogs/basic/v1/index.ts` exports `BasicCatalogThemeSchema` (`primaryColor`, `iconUrl`, `agentDisplayName`).

However, `CreateSurfaceMessageSchema` in `typescript/core/web_core/src/v1_0/schema/agent-to-renderer.ts` (lines 31–61) uses `.strict()` and omits `'theme'`, so any v1.0 `createSurface` message containing `theme` is rejected before `extractOperationsFromObject` line 44 can ever execute.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/processing/adapters/v1_0.ts` (line 44)
  - `typescript/core/web_core/src/v1_0/schema/agent-to-renderer.ts` (lines 31–61)
  - `typescript/core/web_core/src/catalogs/basic/v1/index.ts`

### Steps to Reproduce / Evidence
```ts
import { MessageProcessor, basicCatalog } from '@a2ui/web_core/v1_0';

const processor = new MessageProcessor([basicCatalog]);
processor.processMessages([
  {
    version: 'v1.0',
    createSurface: {
      surfaceId: 'main',
      catalogId: basicCatalog.id,
      theme: { primaryColor: '#0AAD0A', agentDisplayName: 'Shopper' },
    },
  },
]);
```
Throws:
```text
A2uiValidationError: Invalid v1.0 message: createSurface: Unrecognized key(s) in object: 'theme'
```
even though `adapters/v1_0.ts` line 44 has `theme: cs?.theme` and `catalogs/basic/v1` defines `BasicCatalogThemeSchema`.

### Expected Behavior
`V1Point0Adapter`, `CreateSurfaceMessageSchema`, and `catalogs/basic/v1` should be consistent: either `theme` is removed from `V1Point0Adapter` and `BasicCatalogThemeSchema` (if `metadata.extensions` completely replaced `createSurface.theme` in v1.0), or `theme: z.record(z.string(), z.any()).optional()` is allowed in `CreateSurfaceMessageSchema`.

### Actual Behavior
`V1Point0Adapter` and `catalogs/basic/v1` include `theme` handling code that is dead/unreachable because `CreateSurfaceMessageSchema` rejects `theme` with `.strict()`.

### Suggested Fix
Either allow optional `theme` in `specification/v1_0/json/agent_to_renderer.json` / `CreateSurfaceMessageSchema` or remove the dead `theme: cs?.theme` and `BasicCatalogThemeSchema` from v1.0 code and document the migration to `createSurface.metadata.extensions`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-17] [v1.0][web_core] PayloadValidator.stripEnvelopeKeys deletes 'id' before running componentApi.schema, breaking custom schemas extending ComponentCommonSchema
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[v1.0][web_core] PayloadValidator.stripEnvelopeKeys deletes 'id' before running componentApi.schema, breaking custom schemas extending ComponentCommonSchema`

<!-- ISSUE_BODY_START -->
### Summary
`@a2ui/web_core/v1_0` exports `ComponentCommonSchema` (`{ id: ComponentIdSchema, accessibility?: ..., weight?: ..., metadata?: ... }`). A developer authoring a custom v1.0 `ComponentApi` naturally defines their component schema using `ComponentCommonSchema.extend({ component: z.literal('MyCard'), ... })` (matching the structure in `specification/v1_0/json/common_types.json#/$defs/ComponentCommon`).

However, `PayloadValidator.validateComponent` in `typescript/core/web_core/src/validation/payload-validator.ts` (line 198) calls `const properties = stripEnvelopeKeys(comp)` (which strips `'id'`, `'component'`, `'catalogId'`, and `'metadata'`) **before** calling `componentApi.schema.safeParse(properties)` (line 218). As a result, any custom `ComponentApi` schema that extends `ComponentCommonSchema` always fails validation with `id: Expected string, received undefined`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/validation/payload-validator.ts` (lines 34, 198, 218)
  - `typescript/core/web_core/src/v1_0/schema/common-types.ts` (`ComponentCommonSchema`)

### Steps to Reproduce / Evidence
```ts
import { z } from 'zod';
import { Catalog, ComponentCommonSchema, MessageProcessor } from '@a2ui/web_core/v1_0';

const DealCardApi = {
  name: 'DealCard',
  schema: ComponentCommonSchema.extend({
    title: z.string(),
  }),
};

const customCatalog = new Catalog('https://example.com/catalog.json', '1.0', [DealCardApi], []);
const processor = new MessageProcessor([customCatalog]);
processor.processMessages([
  {
    version: 'v1.0',
    createSurface: {
      surfaceId: 's1',
      catalogId: customCatalog.id,
      components: [{ id: 'root', component: 'DealCard', title: 'Organic Apples' }],
    },
  },
]);
```
Throws:
```text
A2uiValidationError: Validation failed for component 'DealCard' (root): id: Expected string, received undefined
```

### Expected Behavior
Custom `ComponentApi` schemas that extend the exported `ComponentCommonSchema` should validate cleanly, or `ComponentCommonSchema` / `PayloadValidator` should not conflict on envelope keys (`id`, `component`, `metadata`).

### Actual Behavior
`stripEnvelopeKeys(comp)` deletes `id` before `componentApi.schema.safeParse(properties)` runs, causing `ComponentCommonSchema` to fail on `id`.

### Suggested Fix
In `PayloadValidator.validateComponent` (`payload-validator.ts:198`), only strip keys in `ENVELOPE_KEYS` that are not declared in `knownKeys` (`getKnownSchemaKeys(componentApi.schema)`), or provide a `ComponentPropertiesCommonSchema` (without `id`) for component authors.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-18] [Docs][v1.0][react] Public docs list React v1.0 support as '🚧 Planned' and omit a React v1.0 quickstart despite @a2ui/web_core@0.14.0 shipping './v1_0'
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[Docs][v1.0][react] Public docs list React v1.0 support as '🚧 Planned' and omit a React v1.0 quickstart despite @a2ui/web_core@0.14.0 shipping './v1_0'`

<!-- ISSUE_BODY_START -->
### Summary
Across the public documentation (`docs/public/reference/renderers.md`, `docs/public/guides/client-setup.md`, and `typescript/renderers/react/README.md`), A2UI v1.0 support for React is either listed as `🚧 Planned` or omitted entirely, and all React code snippets instruct importing `@a2ui/react/v0_9` and `@a2ui/web_core/v0_9/basic_catalog`.

In reality, `@a2ui/web_core@0.14.0` already ships `./v1_0` and `./catalogs/basic/v1`, and `@a2ui/react@0.14.0` renders v1.0 surfaces when connected to a v1.0 `MessageProcessor`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/reference/renderers.md` (lines 209–215)
  - `docs/public/guides/client-setup.md` (lines 7–13)
  - `typescript/renderers/react/README.md` (lines 218, 232–288)

### Steps to Reproduce / Evidence
1. In `docs/public/reference/renderers.md` (lines 209–215), the status table lists **Lit**, **Angular**, and **React** under `v1.0` as `🚧 Planned`.
2. In `docs/public/guides/client-setup.md` (lines 7–13), the renderer compatibility table only has columns for `v0.8` and `v0.9`.
3. In `typescript/renderers/react/README.md` (lines 232–239), the Quick Start only imports from `@a2ui/react/v0_9` and `@a2ui/web_core/v0_9/basic_catalog` and sends `"version": "v0.9"` messages.

### Expected Behavior
`renderers.md`, `client-setup.md`, and `typescript/renderers/react/README.md` should include an A2UI v1.0 React quickstart showing how to pair `@a2ui/web_core/v1_0` (`MessageProcessor`, `basicCatalog`) with `@a2ui/react` (`A2uiSurface`, `MarkdownContext`).

### Actual Behavior
An external developer evaluating A2UI v1.0 for React is told by the docs that v1.0 React support is only `🚧 Planned` and has no v1.0 setup example.

### Suggested Fix
Update the renderer status matrices in `renderers.md` and `client-setup.md`, and update `typescript/renderers/react/README.md` with a v1.0 Quick Start using `@a2ui/web_core/v1_0` and `"version": "v1.0"`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-19] [Docs][react] docs/public/guides/client-setup.md references nonexistent <A2UISurface> and useA2UI() hook and has no React code example
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[Docs][react] docs/public/guides/client-setup.md references nonexistent <A2UISurface> and useA2UI() hook and has no React code example`

<!-- ISSUE_BODY_START -->
### Summary
In `docs/public/guides/client-setup.md` (lines 121–134, `## React`), all three documented exports are either misnamed, exported by a different package, or do not exist at all, and there is no React code snippet.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/guides/client-setup.md` (lines 121–134)
  - `typescript/renderers/react/src/index.ts`

### Steps to Reproduce / Evidence
Inspect `docs/public/guides/client-setup.md` (lines 121–134):
```markdown
## React
...
The React renderer provides:

- `MessageProcessor` class: A class that manages the A2UI message processor and reactive model.
- `<A2UISurface>` component: Renders A2UI surfaces in your React app
- `useA2UI()` hook: Accesses the message processor from any component
```
Compare with actual exports in `typescript/renderers/react/src/index.ts`:
1. `MessageProcessor` is exported by `@a2ui/web_core/v1_0` (or `@a2ui/web_core/v0_9`), **not** `@a2ui/react`.
2. The React component is named `<A2uiSurface>` (lowercase `ui`), **not** `<A2UISurface>`.
3. There is **no `useA2UI()` hook** anywhere in `@a2ui/react`.

### Expected Behavior
`docs/public/guides/client-setup.md` should document the real exports (`A2uiSurface`, `createComponentImplementation`, `MarkdownContext` from `@a2ui/react`, and `MessageProcessor`, `basicCatalog` from `@a2ui/web_core/v1_0`) with a working TSX snippet.

### Actual Behavior
`client-setup.md` lists nonexistent symbols (`<A2UISurface>`, `useA2UI()`) and includes zero code examples for React.

### Suggested Fix
Replace lines 121–134 of `docs/public/guides/client-setup.md` with accurate `@a2ui/react` + `@a2ui/web_core/v1_0` documentation and a complete TSX snippet.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-20] [Docs][v1.0] 'v0.9 and later' tabs in public docs teach {"path": "..."}, {"call": "..."}, and Text variant "h1" which fail validation in v1.0
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[Docs][v1.0] 'v0.9 and later' tabs in public docs teach {"path": "..."}, {"call": "..."}, and Text variant "h1" which fail validation in v1.0`

<!-- ISSUE_BODY_START -->
### Summary
Multiple core concept and reference pages in `docs/public/` group v0.9 and v1.0 together under a tab labeled `=== "v0.9 and later"` and instruct developers to write syntax that is invalid in A2UI v1.0:
1. `{"path": "/user/name"}` instead of v1.0 `{"@path": "/user/name"}`.
2. `{"call": "formatString", "args": {...}}` instead of v1.0 `{"@call": "formatString", "args": {...}}`.
3. `{"component": "Text", "text": "...", "variant": "h1"}` — in v1.0 `catalogs/basic/v1/catalog.json`, `Text.variant` only allows `"caption" | "body"`, so `"variant": "h1"` throws `A2uiValidationError: Invalid enum value. Expected 'caption' | 'body', received 'h1'`.
4. `docs/public/reference/messages.md` states for `updateDataModel`: *"Omit `value` to delete."* In v1.0 (`specification/v1_0/json/agent_to_renderer.json`), `value` is in `required: ["surfaceId", "value"]`, so omitting `value` fails schema validation (deletion in v1.0 uses `"value": null`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/concepts/data-binding.md`
  - `docs/public/concepts/components.md`
  - `docs/public/reference/messages.md`

### Steps to Reproduce / Evidence
1. Inspect `docs/public/concepts/data-binding.md` and `docs/public/reference/messages.md` under `=== "v0.9 and later"`.
2. Pass a `Text` component with `"variant": "h1"` or an `updateDataModel` message omitting `"value"` into `@a2ui/web_core/v1_0`'s `MessageProcessor`:
   - `"variant": "h1"` throws `A2uiValidationError: Validation failed for component 'Text': variant: Invalid enum value. Expected 'caption' | 'body', received 'h1'`.
   - Omitting `value` on `updateDataModel` throws `A2uiValidationError: Invalid v1.0 message: updateDataModel.value: Required`.

### Expected Behavior
`docs/public/` should separate `=== "v1.0"` tabs from `=== "v0.9"` tabs and show canonical v1.0 syntax (`@path`, `@call`, `Text.variant: "body" | "caption"` with Markdown `#` headings, and `updateDataModel` with `"value": null` for deletion).

### Actual Behavior
The `"v0.9 and later"` tabs teach v0.9-only syntax that fails validation in v1.0.

### Suggested Fix
Split the `=== "v0.9 and later"` content tabs across `docs/public/concepts/` and `docs/public/reference/messages.md` into separate `=== "v1.0"` and `=== "v0.9"` tabs.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-21] [Docs][react] typescript/renderers/react/README.md omits required MarkdownContext.Provider setup and makes outdated v0.8 default export claim
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[Docs][react] typescript/renderers/react/README.md omits required MarkdownContext.Provider setup and makes outdated v0.8 default export claim`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/renderers/react/README.md`:
1. The Quick Start example (lines 251–288) renders `<A2uiSurface key={surface.id} surface={surface} />` without wrapping it in `<MarkdownContext.Provider value={renderMarkdown}>` (from `@a2ui/markdown-it`). Without `MarkdownContext`, every `<a2ui-basic-text>` element logs a console warning (`[MarkdownDirective] can't render markdown because no markdown renderer is configured`) and outputs unparsed Markdown text (e.g. literal `## Heading`) inside `<span class="no-markdown-renderer">`.
2. Line 485 claims: *"A2UI v0.8 is maintained for backward compatibility. While it remains the default export for the `@a2ui/react` package, it is recommended to transition to v0.9."* In `@a2ui/react@0.14.0`, this is false: the root `.` export (`src/index.ts`) is the modern v0.9/v1.0 `A2uiSurface`, while v0.8 is under `@a2ui/react/v0_8`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/react@0.14.0`
- **File path(s)**:
  - `typescript/renderers/react/README.md` (lines 251–288 and line 485)

### Steps to Reproduce / Evidence
1. Copy the Quick Start from `typescript/renderers/react/README.md` (lines 251–288) and render a `Text` component with `"text": "## Welcome"`.
2. Observe console warning:
   `[MarkdownDirective] can't render markdown because no markdown renderer is configured. Use @a2ui/markdown-it, or your own markdown renderer.`
   and raw `## Welcome` rendered in the DOM.

### Expected Behavior
`typescript/renderers/react/README.md` should include `<MarkdownContext.Provider value={renderMarkdown}>` in its Quick Start and accurately state that the root `@a2ui/react` export is the modern renderer (`A2uiSurface`), while legacy v0.8 is at `@a2ui/react/v0_8`.

### Actual Behavior
Following the README Quick Start produces unparsed Markdown and console warnings, and line 485 misleads developers about the default package export.

### Suggested Fix
Update `typescript/renderers/react/README.md` lines 251–288 to wrap `<A2uiSurface>` in `<MarkdownContext.Provider value={renderMarkdown}>` and correct line 485.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-22] [Docs][v1.0][evolution_guide] specification/v1_0/docs/evolution_guide.md omits breaking removal of h1–h5 from Text.variant
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[Docs][v1.0][evolution_guide] specification/v1_0/docs/evolution_guide.md omits breaking removal of h1–h5 from Text.variant`

<!-- ISSUE_BODY_START -->
### Summary
In A2UI v0.9 (`specification/v0_9/json/basic_catalog.json`), `Text.variant` accepted `["h1", "h2", "h3", "h4", "h5", "caption", "body"]`. In A2UI v1.0 (`catalogs/basic/v1/catalog.json` and `typescript/core/web_core/src/catalogs/basic/v1/components/basic_components.ts:43`), `h1`–`h5` were removed from `Text.variant`, leaving only `["caption", "body"]` (with headings expressed via Markdown `#`–`#####` in `Text.text`).

However, `specification/v1_0/docs/evolution_guide.md` (Section "Basic Catalog Component Updates") documents changes to `Video`, `TextField`, and `Slider`, while completely omitting this breaking change to `Text.variant`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `specification/v1_0/docs/evolution_guide.md`
  - `catalogs/basic/v1/catalog.json`
  - `typescript/core/web_core/src/catalogs/basic/v1/components/basic_components.ts` (line 43)

### Steps to Reproduce / Evidence
1. Inspect `specification/v1_0/docs/evolution_guide.md` under "Basic Catalog Component Updates": `Text.variant` is not mentioned.
2. Migrate any v0.9 surface containing `{ "id": "title", "component": "Text", "text": "Hello", "variant": "h2" }` to v1.0:
   Throws `A2uiValidationError: Validation failed for component 'Text' (title): variant: Invalid enum value. Expected 'caption' | 'body', received 'h2'`.

### Expected Behavior
`specification/v1_0/docs/evolution_guide.md` should explicitly document that `Text.variant` in v1.0 only accepts `"body"` and `"caption"` and that headings `h1`–`h5` must now be written using Markdown `#`–`#####` prefixes in `Text.text`.

### Actual Behavior
The breaking change to `Text.variant` is undocumented in `evolution_guide.md`.

### Suggested Fix
Add a "`Text` Component (`variant` enum narrowed to `'body' | 'caption'`)" subsection to `specification/v1_0/docs/evolution_guide.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-02-23] [Docs][v1.0][web_core] Undocumented Catalog(id, protocolVersion, components, functions) parameter order and dual @path/path & @call/call schema support
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Core React Onboarding (@a2ui/react & @a2ui/web_core)`
- **Title**: `[Docs][v1.0][web_core] Undocumented Catalog(id, protocolVersion, components, functions) parameter order and dual @path/path & @call/call schema support`

<!-- ISSUE_BODY_START -->
### Summary
1. `docs/public/guides/defining-your-own-catalog.md` (lines 42–58) contains a placeholder (*"Detailed guides for each framework coming soon"*) and does not document the `Catalog` constructor signature in `@a2ui/web_core/v1_0`: `new Catalog(id, protocolVersion, components, functions, options)` where `protocolVersion` (`'1.0'`) is the **second** positional argument (unlike v0.9 `new Catalog(id, components, functions)`). Passing `components` as the second argument causes silent type coercion in JS or crashes `serializeCatalogDocument` with `TypeError: Cannot read properties of undefined (reading 'startsWith')`.
2. Furthermore, `specification/v1_0/json/common_types.json` defines `DataBinding` and `FunctionCall` using `path` and `call`, while `@a2ui/web_core/v1_0` (`src/v1_0/schema/common-types.ts`) accepts both `{"@path": "..."}` / `{"path": "..."}` and `{"@call": "..."}` / `{"call": "..."}`. This dual syntax and the canonical v1.0 `@path` / `@call` sigils are not explained in `defining-your-own-catalog.md` or `common_types.json`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/guides/defining-your-own-catalog.md` (lines 42–58)
  - `typescript/core/web_core/src/catalog/types.ts` (`Catalog` constructor)
  - `typescript/core/web_core/src/v1_0/schema/common-types.ts`

### Steps to Reproduce / Evidence
1. Inspect `docs/public/guides/defining-your-own-catalog.md` lines 42–58:
   ```markdown
   === "Web (Lit / Angular / React)"
   ...
   _Detailed guides for each framework coming soon._
   ```
2. Inspect `typescript/core/web_core/src/catalog/types.ts`:
   ```ts
   constructor(
     public readonly id: string,
     public readonly protocolVersion: CatalogProtocolVersion,
     components: T[] = [],
     functions: FunctionImplementation[] = [],
     options?: CatalogOptions<T>,
   )
   ```

### Expected Behavior
`docs/public/guides/defining-your-own-catalog.md` should provide a complete TypeScript example showing `new Catalog('https://...', '1.0', [MyComponentImpl], [myFunctionImpl])` and explain the v1.0 `@path` / `@call` sigil conventions.

### Actual Behavior
The guide has a `"coming soon"` placeholder and links only to v0.9 catalog paths.

### Suggested Fix
Replace the placeholder in `docs/public/guides/defining-your-own-catalog.md` with working v1.0 Lit, Angular, and React catalog registration examples.
<!-- ISSUE_BODY_END -->
