# FreshCart × A2UI v1.0 — 10-Feature Zero-Prior-Knowledge Onboarding, Live Demos, PRs & SDK Audit

This report synthesizes the findings of a 10-agent engineering swarm tasked with discovering, implementing, and auditing **10 A2UI v1.0 features** inside **FreshCart** (`https://github.com/josemontespg/freshcart-a2ui`) assuming **zero prior internal knowledge**—using strictly public data (`https://github.com/google/A2UI`, `https://a2ui.org`, and public npm `@a2ui/*` packages).

---

## 1. Master Directory of the 10 Feature PRs & Dedicated Live Preview Servers

Each feature is isolated in its own Git branch, Pull Request against `main`, and running Vite dev server (`http://josemontesp.c.googlers.com:5181` through `:5190`), alongside the base app on port `5173` (`http://josemontesp.c.googlers.com:5173`):

| # | A2UI v1.0 Feature | GitHub Pull Request | Branch | Live Preview URL | Detailed Learnings Doc (in PR) |
|---|---|---|---|---|---|
| **01** | **Web Components** (`<a2ui-basic-*>`, `ReactWcHost`, Custom Elements) | [PR #1](https://github.com/josemontespg/freshcart-a2ui/pull/1) | `feat/01-web-components` | `http://josemontesp.c.googlers.com:5181` | `docs/PR_01_WEB_COMPONENTS_LEARNINGS.md` |
| **02** | **MCP Component + Double-Iframe Sandbox** (`McpApp`, `callMcpTool`) | [PR #4](https://github.com/josemontespg/freshcart-a2ui/pull/4) | `feat/02-mcp-iframe` | `http://josemontesp.c.googlers.com:5182` | `docs/PR_02_MCP_IFRAME_LEARNINGS.md` |
| **03** | **Macros** (`A2UIMacroExpander`, `@macro:*` Composite Templates) | [PR #3](https://github.com/josemontespg/freshcart-a2ui/pull/3) | `feat/03-macros` | `http://josemontesp.c.googlers.com:5183` | `docs/PR_03_MACROS_LEARNINGS.md` |
| **04** | **Skill Generation** (`Skill`, `SkillSet`, `SkillGenerator`, `Catalog.toJson()`) | [PR #7](https://github.com/josemontespg/freshcart-a2ui/pull/7) | `feat/04-skill-generation` | `http://josemontesp.c.googlers.com:5184` | `docs/PR_04_SKILL_GENERATION_LEARNINGS.md` |
| **05** | **Protocol Extensions** (`metadata.extensions` on Surface, Component & Action) | [PR #2](https://github.com/josemontespg/freshcart-a2ui/pull/2) | `feat/05-extensions` | `http://josemontesp.c.googlers.com:5185` | `docs/PR_05_EXTENSIONS_LEARNINGS.md` |
| **06** | **Express DSL** (`<a2ui>...</a2ui>` Compiler, Decompiler & Express Flow) | [PR #6](https://github.com/josemontespg/freshcart-a2ui/pull/6) | `feat/06-express` | `http://josemontesp.c.googlers.com:5186` | `docs/PR_06_EXPRESS_LEARNINGS.md` |
| **07** | **Server-Side & Client-Side Functions** (`@call`, `callAgentFunction`, `callRendererFunction`) | [PR #10](https://github.com/josemontespg/freshcart-a2ui/pull/10) | `feat/07-server-client-functions` | `http://josemontesp.c.googlers.com:5187` | `docs/PR_07_FUNCTIONS_LEARNINGS.md` |
| **08** | **Accessibility** (`AccessibilityAttributes`: `label`, `description`, `live`, `hidden`) | [PR #8](https://github.com/josemontespg/freshcart-a2ui/pull/8) | `feat/08-accessibility` | `http://josemontesp.c.googlers.com:5188` | `docs/PR_08_ACCESSIBILITY_LEARNINGS.md` |
| **09** | **Mixed Catalogs** (3-Catalog Composition on a Single v1.0 Surface) | [PR #9](https://github.com/josemontespg/freshcart-a2ui/pull/9) | `feat/09-mixed-catalogs` | `http://josemontesp.c.googlers.com:5189` | `docs/PR_09_MIXED_CATALOGS_LEARNINGS.md` |
| **10** | **Streaming in Direct JSON** (Progressive SSE & Single-Shot `createSurface`) | [PR #5](https://github.com/josemontespg/freshcart-a2ui/pull/5) | `feat/10-streaming-direct-json` | `http://josemontesp.c.googlers.com:5190` | `docs/PR_10_STREAMING_DIRECT_JSON_LEARNINGS.md` |

---

## 2. Per-Feature Implementation, Public Discovery, Documentation Gaps & Library Bugs

### Feature 01 — Web Components ([PR #1](https://github.com/josemontespg/freshcart-a2ui/pull/1) · `http://josemontesp.c.googlers.com:5181`)
- **How Discovered from Public Data**: Inspected `typescript/core/web_core/src/v0_9/catalog/universal/adapter.ts` (`toWebComponentImplementation`), `typescript/renderers/lit/src/v0_9/base/a2ui-lit-element.ts`, and `typescript/renderers/react/src/core/ReactWcHost.tsx`.
- **FreshCart Implementation**: Registered 3 interactive W3C Custom Elements (`<freshcart-nutrition-ring>`, `<freshcart-aisle-stepper>`, `<freshcart-price-sparkline>`) inside the Grocery Catalog (`groceryCatalogRenderer.tsx`), dispatching composed `freshcart-wc-change` and `freshcart-wc-action` events that mutate the live A2UI v1.0 `dataModel` and React `CartContext`.
- **Public Documentation Gaps**:
  - `DOC-GAP-WC-01`: `docs/public/guides/authoring-universal-components.md` exclusively documents `v0_9` imports (`@a2ui/web_core/v0_9`, `@a2ui/lit/v0_9`) and legacy `{"path": "..."}` syntax.
  - `DOC-GAP-WC-02`: `toWebComponentImplementation` (used by all 18 v1.0 components in `catalogs/basic/v1`) has zero public documentation.
  - `DOC-GAP-WC-03`: `A2uiLitElement` JSDoc contradicts `authoring-universal-components.md` regarding Light DOM vs. Shadow DOM defaults.
  - `DOC-GAP-WC-04`: Portal `<a2ui-react-*>` custom element tags created by `ReactWcHost` are undocumented.
- **Public Library Bugs**:
  - `BUG-WC-01`: `@a2ui/react@0.14.0` crashes on import in Node/SSR (`ReferenceError: HTMLElement is not defined` at `class ReactWcHost extends HTMLElement`).
  - `BUG-WC-02`: `A2uiLitElement.adoptLightDomStyles()` pushes component Shadow DOM stylesheets into global `document.adoptedStyleSheets`, leaking styles across the host page.
  - `BUG-WC-03`: `@a2ui/react@0.14.0` hardcodes `@a2ui/web_core/v0_9` and rejects `@a2ui/web_core/v1_0` catalogs.
  - `BUG-WC-04`: `toWebComponentImplementation` is omitted from `universal/index.ts`.
  - `BUG-WC-05`: `computeTagName` increments a module-level counter across HMR without reusing tags, leaking CustomElementRegistry entries.

---

### Feature 02 — MCP Component + Double-Iframe Sandbox ([PR #4](https://github.com/josemontespg/freshcart-a2ui/pull/4) · `http://josemontesp.c.googlers.com:5182`)
- **How Discovered from Public Data**: Inspected `specification/v1_0/json/catalogs/mcp/catalog.json`, `docs/public/guides/mcp-apps-in-a2ui.md`, `typescript/catalogs/mcp/`, and `typescript/catalogs/shared/sandbox/sandbox.ts`, plus `npm view @a2ui/catalog-mcp`.
- **FreshCart Implementation**: Built the Double-Iframe Sandbox Proxy (`public/a2ui-sandbox/sandbox.html`) enforcing opaque `"null"` origin + strict CSP, and implemented the React `McpApp` host (`mcpCatalogRenderer.tsx`) + `@call: "callMcpTool"` with two-way `ui/notifications/data-model-update` / `data-model-change`, `ui/requests/function-call`, and `tools/call` (`add_mcp_pairing_to_cart`, `apply_kitchen_scaling`) for an embedded **Culinary Studio & Kitchen Converter MCP App**.
- **Public Documentation Gaps**:
  - `MCP-DOC-GAP-01`: `@a2ui/catalog-mcp` README never mentions that only v0.9 `callMcpTool` is exported or that `McpApp` is missing from npm.
  - `MCP-DOC-GAP-02`: `docs/public/guides/mcp-apps-in-a2ui.md` uses legacy `"type": "custom", "name": "McpApp"` instead of v1.0 `"component": "McpApp", "htmlContent": "..."`.
  - `MCP-DOC-GAP-03`: Broken link to non-existent `samples/agent/adk/mcp_app_proxy/` in `mcp-apps-in-a2ui.md`.
  - `MCP-DOC-GAP-04`: Undocumented `url_encoded:` prefix required on `McpApp.htmlContent`.
  - `MCP-DOC-GAP-05`: No instructions for serving `/a2ui-sandbox/sandbox.html` in React/Vite apps.
- **Public Library & Security Bugs**:
  - `MCP-BUG-01`: Published `@a2ui/catalog-mcp@0.0.1-alpha.1` bundles v0.9 `catalog.json` and omits `McpApp`, `SandboxedFrameElement`, and `v1/catalog.json`.
  - `MCP-BUG-02` (**Critical Security**): Public sample `mcp-apps-component.ts:194` passes `allow-same-origin` to the inner sandbox iframe, defeating double-iframe isolation.
  - `MCP-BUG-03`: `typescript/catalogs/shared/sandbox/sandbox.ts:426` only strips `allow-same-origin` and fails to strip `allow-top-navigation` or `allow-popups`.
  - `MCP-BUG-04`: `specification/v1_0/json/catalogs/mcp/catalog.json` omits `height` from `McpApp.properties` with `"additionalProperties": false`, causing strict validators to reject `height`.
  - `MCP-BUG-05`: `callMcpTool.ts:387` hardcodes `version: 'v0.9'` and ignores v1.0 `targetDataPath`.

---

### Feature 03 — Macros ([PR #3](https://github.com/josemontespg/freshcart-a2ui/pull/3) · `http://josemontesp.c.googlers.com:5183`)
- **How Discovered from Public Data**: Searched `/tmp/public-google-a2ui` (`conformance/agent/macros/macros.yaml`, `python/a2ui_agent/src/a2ui/macros/expander.py`, `processor.py`, `conformance_test.mjs`).
- **FreshCart Implementation**: Built a full TypeScript `A2UIMacroExpander` (`src/a2ui/macros/macroExpander.ts`) supporting deterministic double-underscore ID allocation (`${instanceId}__${type}_${n}`), post-order root stitching, `ComponentId`/`ChildList` slot preservation, action coercion, v1.0 `@path` bindings, and cycle detection (`A2UIRecursionError`), powering 4 reusable grocery macros (`@macro:RecipeBundleCard`, `@macro:MacroNutrientBar`, `@macro:SmartSwapRow`, `@macro:OneClickBundleFooter`).
- **Public Documentation Gaps**:
  - `DOC-GAP-MACRO-01`: Zero mention of `MacroExpander` or `@macro` on `a2ui.org` (`docs/public/`) or `specification/v1_0/`.
  - `DOC-GAP-MACRO-02`: `conformance/agent/macros/macros.yaml` and `python/a2ui_agent/README.md` only show v0.9 syntax (`version: "v0.9"`, `{"path": "..."}`).
  - `DOC-GAP-MACRO-03`: Declarative `{$param}` / `{$spreadParam}` AST sentinels in `macros.yaml` vs imperative Python `Macro.expand()` are undocumented.
- **Public Library Bugs**:
  - `BUG-MACRO-01`: Macros are completely unimplemented in TypeScript (`@a2ui/agent`, `@a2ui/web_core`, `@a2ui/react`); `conformance_test.mjs:193` skips `'macros.yaml'`.
  - `BUG-MACRO-02`: Python `MacroProcessor._coerce_params` (`processor.py:163`) only checks `"path" in p_val`, dropping v1.0 `"@path"` bindings, and `expander.py:147` hardcodes `ProtocolVersion.V0_9_1`.
  - `BUG-MACRO-03`: `@a2ui/web_core/v1_0` `PayloadValidator` rejects unexpanded `@macro:*` envelopes with `UNKNOWN_COMPONENT` and lacks a pre-validation macro expansion hook.

---

### Feature 04 — Skill Generation ([PR #7](https://github.com/josemontespg/freshcart-a2ui/pull/7) · `http://josemontesp.c.googlers.com:5184`)
- **How Discovered from Public Data**: Inspected `blueprints/features/skill_generator.blueprint.md`, `conformance/agent/skill.yaml`, `python/a2ui_agent/src/a2ui/skill/`, and `typescript/core/web_core/src/v1_0/catalog/schema_serializer.ts` (`Catalog.toJson()`).
- **FreshCart Implementation**: Implemented `Skill`, `SkillSet` (with 3-tier `get(query)` resolution), `DirectJsonSkillPromptGenerator`, `ExpressSkillPromptGenerator`, and `SkillGenerator` in TypeScript (`src/a2ui/skillGenerator.ts`), compiling live `@a2ui/web_core/v1_0` `Catalog.toJson()` schemas into `a2ui-core/SKILL.md`, `a2ui-basic/SKILL.md`, `a2ui-grocery/SKILL.md`, and `a2ui/SKILL.md`, exposed at `GET /api/a2ui/skills` and injected into Gemini's `systemInstruction`.
- **Public Documentation Gaps**:
  - `DOC-GAP-01`: Zero mention of `SkillGenerator`, `Skill`, or `SkillSet` in `README.md`, `docs/public/`, or `typescript/agents/a2ui_agent/README.md`.
  - `DOC-GAP-02`: No documentation explaining how `@a2ui/web_core` `Catalog.toJson()` connects to agent skill/prompt generation.
  - `DOC-GAP-03`: `.agents/AGENTS.md` and `.agents/skills/a2ui-<catalog>/SKILL.md` workspace conventions are only mentioned in `blueprints/`.
- **Public Library Bugs**:
  - `BUG-01`: `@a2ui/agent@0.0.1` in TypeScript completely omits `Skill`, `SkillSet`, and `SkillGenerator` (`SKILL_ACTION_HANDLERS = {}` in `skill-conformance.test.ts:22`; `loader.ts:109` skips all 4 actions), and `KNOWN_GAPS.md` fails to disclose it.
  - `BUG-02`: `conformance/test_data/skills/express_base_rules.txt:65` hardcodes `root = Card(...)` inside catalog-agnostic base rules, violating Requirement 1 of `skill_generator.blueprint.md`.
  - `BUG-03`: `basicCatalog` in `@a2ui/web_core@0.14.0` is created without `options.instructions`, dropping the `## Catalog Guidelines` block in `toJson()`.
  - `BUG-04`: Heading mismatch (`### Examples:` in `generator.py:71` vs `## Examples` in `express_basic_catalog.skill.md:193`) and zero `format: direct_json` tests in `conformance/agent/skill.yaml`.
  - `BUG-05`: Python `clean_catalog_name(catalog)` (`skill.py:29`) only checks `catalog.catalog_id` and ignores `catalog.id` used by `@a2ui/web_core`.

---

### Feature 05 — Protocol Extensions (`metadata.extensions`) ([PR #2](https://github.com/josemontespg/freshcart-a2ui/pull/2) · `http://josemontesp.c.googlers.com:5185`)
- **How Discovered from Public Data**: Inspected `specification/v1_0/json/common_types.json#/$defs/Extensions`, `agent_to_renderer.json`, `renderer_to_agent.json`, `a2ui_protocol.md`, and `@a2ui/web_core` (`validation/payload-validator.ts`, `state/surface-model.ts`, `resolution/component-node.ts`).
- **FreshCart Implementation**: Implemented 3-layer `metadata.extensions` across Surface (`freshcart_theme` replacing removed v0.9 `createSurface.theme`, `freshcart_confettiOnAction`), Component (`freshcart_dealSpotlight`, `freshcart_aisleHighlight` interactive storefront locator), and Outbound Action (`freshcart_analyticsProvenance`, `freshcart_clientContext`, `a2ui_telemetry`).
- **Public Documentation Gaps**:
  - `DOC-EXT-01`: Zero occurrences of `metadata.extensions` across `docs/public/`.
  - `DOC-EXT-02`: Strict UAX #31 key pattern (`^[\p{XID_Start}_][\p{XID_Continue}]*$`, forbidding `.`, `-`, `:`) is undocumented in prose guides.
  - `DOC-EXT-03`: No migration guide showing how removed v0.9 `createSurface.theme` maps to `createSurface.metadata.extensions`.
  - `DOC-EXT-04`: Undocumented React custom component access path (`context.componentModel.metadata?.extensions`).
- **Public Library Bugs**:
  - `BUG-EXT-01`: `@a2ui/web_core`'s `ExtensionsSchema` regex (`/^[\\p{XID_Start}_][\\p{XID_Continue}:-]*$/u` in `v1_0/schema/common-types.ts`) wrongly accepts `-` and `:`, diverging from `common_types.json`.
  - `BUG-EXT-02`: Dead-code bug in `PayloadValidator.validateComponent` (`payload-validator.ts:34,198,256`): `stripEnvelopeKeys(comp)` strips `'metadata'` before `validateCommonEnvelopeFields(properties)` runs, so component `metadata.extensions` in `updateComponents` is never validated!
  - `BUG-EXT-03`: `SurfaceModel.dispatchAction` (`surface-model.ts:249-290`) silently drops `metadata.extensions` on outbound `ActionPayload` events.
  - `BUG-EXT-04`: `ComponentNode` (`component-node.ts`) and `@a2ui/react`'s `useNodeView` omit `metadata` from resolved view nodes and `toJSON()`.

---

### Feature 06 — Express DSL ([PR #6](https://github.com/josemontespg/freshcart-a2ui/pull/6) · `http://josemontesp.c.googlers.com:5186`)
- **How Discovered from Public Data**: Inspected `specification/proposals/express/a2ui_express.md`, `specification/inference_formats/express/Express.g4`, `typescript/agents/a2ui_agent/src/inference-formats/express/`, and `samples/agent/node/restaurant_finder/`.
- **FreshCart Implementation**: Built a browser- and server-safe A2UI v1.0 Express DSL compiler & decompiler (`src/a2ui/express/expressCompiler.ts`) supporting `<a2ui>...</a2ui>` blocks (~62% fewer tokens than raw JSON) across both Basic and FreshCart Grocery catalogs, powering the **15-Minute Express Dinner** showcase.
- **Public Documentation Gaps**:
  - `DOC-EXP-01`: Zero guides for A2UI Express on `a2ui.org` (`docs/public/`); the single glossary link points to a broken repo URL (`a2ui-project/a2ui`).
  - `DOC-EXP-02`: `@a2ui/agent@0.0.1` on npm defaults `A2uiRequestProcessor` to `DirectJsonFormatFactory`, contradicting the `main` README which claims `ExpressFormatFactory` is default.
  - `DOC-EXP-03`: `a2ui_express.md` contradicts `Express.g4` on Unicode UAX #31 vs ASCII identifiers, references non-existent `surfaceParams: {}`, and claims streaming support while `ExpressFormat.supportsStreaming = false`.
- **Public Library Bugs**:
  - `BUG-EXP-01`: `ExpressDecompiler.formatComponent` (`decompiler.ts:697`) throws `ExpressInvalidIdentifierError` on hyphenated component IDs (`id="content-grid"`) instead of deriving a variable name and emitting `id="..."`.
  - `BUG-EXP-02`: `ExpressParser` (`parser.ts:88`) initializes `BlockLexer` with `stringDelimiters = new Set(["'", '"'])` and omits `'//'` from `singleLineComments`, so any apostrophe inside a `//` comment opens an unclosed string literal and swallows `</a2ui>`.
  - `BUG-EXP-03`: `ExpressCompiler.compile()` (`compiler.ts:501-524`) splits on literal `'<a2ui>'` substrings without lexer state, corrupting string literals mentioning `<a2ui>`.
  - `BUG-EXP-04`: `@a2ui/agent`'s barrel `src/index.ts` imports Node `fs` at top level (`catalog-providers.ts:16`), breaking browser bundling, and fails to export `ExpressCompiler`.

---

### Feature 07 — Server-Side & Client-Side Functions ([PR #10](https://github.com/josemontespg/freshcart-a2ui/pull/10) · `http://josemontesp.c.googlers.com:5187`)
- **How Discovered from Public Data**: Inspected `specification/v1_0/json/agent_to_renderer.json` (`callRendererFunction`, `agentFunctionResponse`), `renderer_to_agent.json` (`callAgentFunction`, `rendererFunctionResponse`), `a2ui_protocol.md` (§"Fallback Routing"), `specification/v1_0/docs/a2ui_custom_functions.md`, and `@a2ui/web_core/src/v1_0/`.
- **FreshCart Implementation**: Built a 3-tab showcase (`smartFunctionsScenario.ts` + `POST /api/a2ui/rpc` in `vite.config.ts`) exercising: (1) 0ms client-side `@call` formulas (`calculateNetCarbs`, `computeUnitSavings`, `@index`), reactive `checks` (`ValidationResult`), and `action.functionCall` (`requiresUserActivation`); (2) Spec Fallback Routing to server-side `callAgentFunction` → `agentFunctionResponse` (`optimizeLiveStoreCoupons`, `analyzeMealMicronutrients`); and (3) Agent-initiated `callRendererFunction` → `rendererFunctionResponse` (`getClientKitchenAndCartMetrics` with `allowedCallers: 'agentOnly'`).
- **Public Documentation Gaps**:
  - `DOC-FN-01`: `docs/public/reference/messages.md` has no v1.0 tab and omits all 4 function RPC envelopes.
  - `DOC-FN-02`: `docs/public/concepts/actions.md` uses v0.9 `call`/`path` and falsely states functions never make network calls (contradicting v1.0 Fallback Routing).
  - `DOC-FN-03`: `docs/public/concepts/data-binding.md` mislabels v0.9 `{"path": "..."}` as `"v0.9 and later"` and omits `{"@call": "..."}` and `@index`.
  - `DOC-FN-04`: `docs/public/concepts/catalogs.md` omits v1.0 map-based `functions`, `allowedCallers`, `requiresUserActivation`, and `ValidationResult`.
  - `DOC-FN-05`: `specification/v1_0/docs/a2ui_custom_functions.md` defines `getScreenResolution` without `allowedCallers: "agentOnly" | "rendererOrAgent"`, so calling it via `callRendererFunction` fails with `INVALID_FUNCTION_CALL`.
- **Public Library Bugs**:
  - `BUG-FN-01`: `@a2ui/web_core` `DataContext` and `Catalog.invoker` throw synchronously on unimplemented functions instead of routing to `RpcHandler.callAgentFunction`, and `SurfaceModel.dispatchAction` ignores `action.functionCall`.
  - `BUG-FN-02`: `createCatalogInvoker` (`v1_0/catalog/types.ts:921`) never checks `allowedCallers`, allowing UI bindings and `action.functionCall` to invoke `agentOnly` functions.
  - `BUG-FN-03`: `DataContext.resolveDynamicValue` does not await `Promise` return values from async `FunctionImplementation`s, rendering `[object Promise]` and treating `Promise<ValidationResult>` as truthy in `checks`.
  - `BUG-FN-04`: `ErrorMessageSchema` (`v1_0/schema/renderer-to-agent.ts:138-152`) checks `!z.any().safeParse(value).success` (always `false`), rejecting 100% of valid `error` messages.
  - `BUG-FN-05`: `MessageProcessor` (`:690, :718`) reconstructs `callFunction` with `{ call: ... }` instead of `{ '@call': ... }`.

---

### Feature 08 — Accessibility (`AccessibilityAttributes`) ([PR #8](https://github.com/josemontespg/freshcart-a2ui/pull/8) · `http://josemontesp.c.googlers.com:5188`)
- **How Discovered from Public Data**: Inspected `specification/v1_0/json/common_types.json#/$defs/AccessibilityAttributes`, `a2ui_protocol.md` (lines 519–528), `conformance/core/accessibility.yaml`, and `typescript/renderers/lit/src/v0_9/catalogs/basic/basic-catalog-a2ui-lit-element.ts`.
- **FreshCart Implementation**: Wired dynamic `accessibility.label`, `accessibility.description` (`.sr-only` nodes linked via `aria-describedby`), `accessibility.live` (`polite` / `assertive` with `aria-atomic="true"`), `accessibility.hidden` (`hidden` + `inert`), and v1.0 semantic label inference across all Basic and Grocery catalog components, showcased in the **Accessible & Allergen-Safe Shopper** surface (`accessibilityShowcaseScenario.ts`) with an Assertive Allergen Guardrail Banner, Hands-Free Audio Cooking Guide, High-Contrast AA mode, and Live `aria-live` Announcement Monitor.
- **Public Documentation Gaps**:
  - `DOC-A11Y-01`: `docs/public/roadmap.md` still lists Accessibility under Future Considerations despite `AccessibilityAttributes` shipping in v1.0.
  - `DOC-A11Y-02`: `docs/public/reference/components.md:608` documents `accessibility (label, role)` — `role` is rejected by `.strict()` `AccessibilityAttributesSchema`, while `description`, `live`, `hidden`, and dynamic `@path`/`@call` bindings are undocumented.
  - `DOC-A11Y-03`: No guide in `docs/public/` explains `aria-live`, `accessibility.hidden` focus suppression, or semantic label inference.
- **Public Library Bugs**:
  - `BUG-A11Y-01`: `BasicCatalogA2uiLitElement.applyAccessibilityAttributes()` sets `aria-label`, `aria-description`, `aria-live`, and `aria-hidden` on the roleless outer custom element host (`<a2ui-basic-button>`, `<a2ui-basic-textfield>`) instead of the inner focusable `<button>`/`<input>`.
  - `BUG-A11Y-02`: Public `A2uiLitElement` and `@a2ui/react`'s `createComponentImplementation` / `ReactWcHost` have zero automatic `accessibility` attribute plumbing for custom catalog components.
  - `BUG-A11Y-03`: Setting `accessibility.hidden: true` applies `aria-hidden="true"` without `inert`, leaving focusable children in the keyboard tab order (violating `conformance/core/accessibility.yaml`'s `aria-hidden-focus` check).
  - `BUG-A11Y-04`: `a2ui_protocol.md:525` specifies `aria-describedby`, whereas `BasicCatalogA2uiLitElement` sets `aria-description` without an `aria-describedby` fallback.
  - `BUG-A11Y-05`: `conformance_test.mjs:193` skips `'accessibility.yaml'` in `SKIP_TEST_SUITES`.

---

### Feature 09 — Mixed Catalogs ([PR #9](https://github.com/josemontespg/freshcart-a2ui/pull/9) · `http://josemontesp.c.googlers.com:5189`)
- **How Discovered from Public Data**: Inspected `specification/v1_0/docs/a2ui_protocol.md` (Per-Component `ComponentCommon.catalogId` and Per-Function `FunctionCommon.catalogId`), `typescript/core/web_core/src/v1_0/processing/message-processor.ts`, `validation/payload-validator.ts`, and `catalog/schema_generator.ts`.
- **FreshCart Implementation**: Built a 33-component surface (`mixedCatalogsScenario.ts`) combining **3 distinct A2UI v1.0 catalogs**: (1) `basic/v1.0` (`Column`, `Row`, `Card`, `Tabs`, `List`, `Slider`, `ChoicePicker`, `formatString`, `formatCurrency`, `@index`), (2) `freshcart/grocery/v1` (`FlashCouponBanner`, `ProductDealCard`, `AisleMapLocator`, `@call: formatSavingsBadge`), and (3) `freshcart/culinary/v1` (`NutritionSummary`, `WineAndCheesePairingCard`, `RecipeStepTimeline`, `@call: calculatePerServingCost`, `@call: matchDietaryScore`), with a Multi-Catalog Provenance Bar and per-component catalog badges.
- **Public Documentation Gaps**:
  - `DOC-GAP-MC-01` & `02`: `docs/public/concepts/catalogs.md` and `guides/defining-your-own-catalog.md` falsely state that a surface is locked to a single catalog and instruct developers to clone `[...BASIC_COMPONENTS]` into monolithic catalogs.
  - `DOC-GAP-MC-03`: Undocumented **Non-Inheritance Rule** for nested `@call` inside custom-catalog components (`nestedCallRunsInCatalog` resolves omitted `call.catalogId` against `surface.defaultCatalog`, not the enclosing component's `catalogId`).
  - `DOC-GAP-MC-04`: Undocumented `ChildSchema` / `markChildRef` WeakSet requirement for custom container components.
- **Public Library Bugs**:
  - `BUG-MC-01`: `generateValidationSchema` (`schema_generator.js:908-912`) scopes `#/$defs/anyFunction` to a single catalog (or `{"not": {}}` on component-only catalogs), causing `catalog.validationSchema` to reject cross-catalog `@call`s and all `@call`s inside component-only catalogs.
  - `BUG-MC-02`: Default `MessageProcessor` leaves `validationConfig` `undefined` (`allowUnknown = true`), silently binding custom components with omitted `catalogId` to `basicCatalog`.
  - `BUG-MC-03`: `ComponentModel.componentTree` (`component-model.js:60-67`) strips `catalogId` on serialization.
  - `BUG-MC-05`: `serializeComponentModel` (`schema_serializer.js:255-267`) emits inner `unevaluatedProperties: false` on custom `.strict()` components in `toJson()`, breaking `Catalog.fromJson()` round-trips for `ComponentCommon` fields (`id`, `catalogId`, `accessibility`, `metadata`).

---

### Feature 10 — Streaming in Direct JSON ([PR #5](https://github.com/josemontespg/freshcart-a2ui/pull/5) · `http://josemontesp.c.googlers.com:5190`)
- **How Discovered from Public Data**: Inspected `specification/v1_0/json/agent_to_renderer.json` (`CreateSurfaceMessage` inline `components` & `dataModel`), `docs/public/concepts/transports.md`, `data-flow.md`, and `typescript/agents/a2ui_agent/src/inference-formats/direct-json/response-stream.ts`.
- **FreshCart Implementation**: Added `POST /api/gemini/a2ui-stream` in `vite.config.ts` (connecting to Gemini `:streamGenerateContent?alt=sse` and emitting real-time `text/event-stream` SSE envelopes) and wired `AIShopperDrawer.tsx` to support both **Progressive SSE Stream** (`createSurface` shell → incremental `updateComponents` subtree batches → granular RFC 6901 `updateDataModel` patches) and **Single-Shot Direct JSON** (`createSurface` with inline `components` and `dataModel`).
- **Public Documentation Gaps**:
  - `GAP-1`: `docs/public/concepts/transports.md` (lines 54–71) has literal `// TODO: Add an example` placeholders for HTTP/REST, WebSockets, and SSE.
  - `GAP-2`: `docs/public/concepts/data-flow.md` and `reference/messages.md` omit v1.0, inline `createSurface.components`/`dataModel`, and required `updateDataModel.value`.
  - `GAP-3`: `docs/public/guides/agent-development.md` only lists `V0_8`/`V0_9` and ends with an unfinished `TODO:`.
  - `GAP-4`: `agent_to_renderer.json` (`CreateSurfaceMessage.description`) still says the renderer expects separate `updateComponents`/`updateDataModel` messages even when `components` and `dataModel` are provided inline.
- **Public Library Bugs**:
  - `BUG-1`: **Single-Shot vs. Streaming Paradox** — `@a2ui/agent`'s `DirectJsonResponseStream` (`response-stream.ts:50`) excludes `createSurface` from `GROWING_KEYS` because `MessageProcessor` throws `A2uiIntegrityError: Surface <id> already exists` on duplicate `createSurface`. Thus inline `createSurface.components`/`dataModel` buffers the entire payload until closing `}`, defeating progressive streaming.
  - `BUG-2`: `MessageProcessor` with `{ validationConfig: STRICT_VALIDATION }` throws `A2uiIntegrityError` (`Dangling reference`) during top-down streaming when `root.children` lists child IDs arriving in later chunks (requires incremental `root.children` growth per batch).
  - `BUG-3`: `new MessageProcessor(catalogs, handler, STRICT_VALIDATION)` silently ignores `STRICT_VALIDATION` (expects `{ validationConfig: STRICT_VALIDATION }` as 3rd arg).
  - `BUG-4`: `DirectJsonResponseStream` (`response-stream.ts:282`) sets `wholeItemKeys: ['components']` in v1.0, preventing `progressiveKeys: ['text']` from streaming `Text.text` strings progressively inside `updateComponents`.
  - `BUG-5`: `V1Point0Adapter.extractOperationsFromObject` (`adapters/v1_0.ts:44`) still reads `cs?.theme` even though `CreateSurfaceMessageSchema` removed `theme` and enforces `.strict()`.
