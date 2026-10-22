# A2UI v1.0 Bug Bash — Self-Contained GitHub Issues Specification & Tracker

- **Target Repository**: [`https://github.com/google/A2UI`](https://github.com/google/A2UI) (`commit e9dbcc3`)
- **GitHub Issue Label**: `v1-bug-bash`
- **Total Deduplicated Issues**: **104** (**55 Bugs** + **49 Documentation Gaps**)
- **Filing Progress**: **0 / 104 Created**

---

## Master Progress Tracker Table

| # | Issue ID | Type | Feature Area | Title | Status | GitHub Issue |
|---|---|---|---|---|---|---|
| 1 | `ISSUE-01-01` | `Bug` | Web Components & Universal Elements (@a2ui/react) | [v1.0][react] Importing @a2ui/react in Node.js / SSR crashes with ReferenceError: HTMLElement is not defined in ReactWcHost | `[ ] PENDING` | _Not created yet_ |
| 2 | `ISSUE-01-02` | `Bug` | Web Components & Universal Elements (@a2ui/web_core) | [v1.0][web_core] A2uiLitElement.adoptLightDomStyles() unconditionally leaks Shadow DOM styles into document.adoptedStyleSheets | `[ ] PENDING` | _Not created yet_ |
| 3 | `ISSUE-01-03` | `Bug` | Web Components & Universal Elements (@a2ui/react) | [v1.0][react] @a2ui/react@0.14.0 hardcodes @a2ui/web_core/v0_9 imports and lacks a ./v1_0 export subpath | `[ ] PENDING` | _Not created yet_ |
| 4 | `ISSUE-01-04` | `Bug` | Web Components & Universal Elements (@a2ui/web_core) | [v1.0][web_core] toWebComponentImplementation is omitted from @a2ui/web_core/universal barrel export | `[ ] PENDING` | _Not created yet_ |
| 5 | `ISSUE-01-05` | `Bug` | Web Components & Universal Elements (@a2ui/react) | [v1.0][react] toWebComponent() computeTagName leaks <a2ui-react-name-N> custom element registrations across HMR and unmemoized catalogs | `[ ] PENDING` | _Not created yet_ |
| 6 | `ISSUE-01-06` | `Documentation Gap` | Web Components & Universal Elements (Documentation) | [v1.0][docs] authoring-universal-components.md exclusively documents v0.9 imports and legacy {"path": "..."} bindings with zero v1.0 examples | `[ ] PENDING` | _Not created yet_ |
| 7 | `ISSUE-01-07` | `Documentation Gap` | Web Components & Universal Elements (Documentation) | [v1.0][docs] toWebComponentImplementation(element, api) and TaggedCustomElementConstructor are undocumented in authoring-universal-components.md | `[ ] PENDING` | _Not created yet_ |
| 8 | `ISSUE-01-08` | `Documentation Gap` | Web Components & Universal Elements (Documentation / JSDoc) | [v1.0][docs][web_core] Contradictory documentation between A2uiLitElement JSDoc and authoring-universal-components.md on Light DOM vs Shadow DOM default | `[ ] PENDING` | _Not created yet_ |
| 9 | `ISSUE-01-09` | `Documentation Gap` | Web Components & Universal Elements (@a2ui/react Documentation) | [v1.0][docs][react] Undocumented <a2ui-react-*> ReactWcHost wrapper elements and display: contents DOM structure in @a2ui/react | `[ ] PENDING` | _Not created yet_ |
| 10 | `ISSUE-02-01` | `Bug` | MCP Component & Iframe (@a2ui/catalog-mcp) | [v1.0][catalog-mcp] @a2ui/catalog-mcp@0.0.1-alpha.1 ships v0.9 catalog.json and omits v1.0 McpApp component & sandbox.html | `[ ] PENDING` | _Not created yet_ |
| 11 | `ISSUE-02-02` | `Bug` | MCP Component & Iframe (@a2ui/catalog-mcp) | [Security][mcp-apps] Community Lit MCP App sample passes allow-same-origin to inner sandbox iframe, defeating double-iframe isolation | `[ ] PENDING` | _Not created yet_ |
| 12 | `ISSUE-02-03` | `Bug` | MCP Component & Iframe (@a2ui/catalog-mcp) | [v1.0][sandbox] typescript/catalogs/shared/sandbox/sandbox.ts only filters allow-same-origin and fails to strip allow-top-navigation and allow-popups | `[ ] PENDING` | _Not created yet_ |
| 13 | `ISSUE-02-04` | `Bug` | MCP Component & Iframe (@a2ui/catalog-mcp) | [v1.0][catalog-mcp] catalogs/mcp/v1/catalog.json omits 'height' property on McpApp despite SandboxedFrameElement reading frameHeightFromProp | `[ ] PENDING` | _Not created yet_ |
| 14 | `ISSUE-02-05` | `Bug` | MCP Component & Iframe (@a2ui/catalog-mcp) | [v1.0][catalog-mcp] callMcpTool.ts hardcodes version: 'v0.9' in ensureMessageVersion and ignores v1.0 targetDataPath | `[ ] PENDING` | _Not created yet_ |
| 15 | `ISSUE-02-06` | `Documentation Gap` | MCP Component & Iframe (@a2ui/catalog-mcp) | [Docs][catalog-mcp] catalogs/mcp/README.md does not document v0.9-only status or missing McpApp component in @a2ui/catalog-mcp | `[ ] PENDING` | _Not created yet_ |
| 16 | `ISSUE-02-07` | `Documentation Gap` | MCP Component & Iframe (@a2ui/catalog-mcp) | [Docs][mcp-apps] docs/public/guides/mcp-apps-in-a2ui.md uses legacy v0.8/v0.9 "type": "custom" schema instead of v1.0 "component": "McpApp" | `[ ] PENDING` | _Not created yet_ |
| 17 | `ISSUE-02-08` | `Documentation Gap` | MCP Component & Iframe (@a2ui/catalog-mcp) | [Docs][mcp-apps] Broken relative link to mcp-apps-component.ts in docs/public/guides/mcp-apps-in-a2ui.md | `[ ] PENDING` | _Not created yet_ |
| 18 | `ISSUE-02-09` | `Documentation Gap` | MCP Component & Iframe (@a2ui/catalog-mcp) | [Docs][v1.0][mcp] Undocumented 'url_encoded:' prefix convention for McpApp.htmlContent in catalogs/mcp/v1/mcp_app_specification.md | `[ ] PENDING` | _Not created yet_ |
| 19 | `ISSUE-02-10` | `Documentation Gap` | MCP Component & Iframe (@a2ui/catalog-mcp) | [Docs][react][mcp] Missing React integration guide and /a2ui-sandbox/sandbox.html hosting instructions for McpApp | `[ ] PENDING` | _Not created yet_ |
| 20 | `ISSUE-02-12` | `Bug` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [v1.0][web_core] PayloadValidator.validateComponent enforces UAX #31 on component instance 'id', rejecting hyphenated IDs used in the v1.0 spec | `[ ] PENDING` | _Not created yet_ |
| 21 | `ISSUE-02-13` | `Bug` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [v1.0][web_core] A2uiBasicTextElement throws EventTarget.dispatchEvent TypeError in JSDOM when consuming @lit/context | `[ ] PENDING` | _Not created yet_ |
| 22 | `ISSUE-02-14` | `Bug` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [Packaging][web_core] @a2ui/web_core@0.14.0 npm tarball ships .tsbuildinfo (182 KB) and compiled *.test.js / *.test.d.ts files | `[ ] PENDING` | _Not created yet_ |
| 23 | `ISSUE-02-15` | `Bug` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [v1.0][web_core] MessageProcessor options.version defaults to 'v0.9' even when initialized exclusively with v1.0 catalogs | `[ ] PENDING` | _Not created yet_ |
| 24 | `ISSUE-02-16` | `Bug` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [v1.0][web_core] V1Point0Adapter reads createSurface.theme, but CreateSurfaceMessageSchema rejects 'theme' due to .strict() | `[ ] PENDING` | _Not created yet_ |
| 25 | `ISSUE-02-17` | `Bug` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [v1.0][web_core] PayloadValidator.stripEnvelopeKeys deletes 'id' before running componentApi.schema, breaking custom schemas extending ComponentCommonSchema | `[ ] PENDING` | _Not created yet_ |
| 26 | `ISSUE-02-18` | `Documentation Gap` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [Docs][v1.0][react] Public docs list React v1.0 support as '🚧 Planned' and omit a React v1.0 quickstart despite @a2ui/web_core@0.14.0 shipping './v1_0' | `[ ] PENDING` | _Not created yet_ |
| 27 | `ISSUE-02-19` | `Documentation Gap` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [Docs][react] docs/public/guides/client-setup.md references nonexistent <A2UISurface> and useA2UI() hook and has no React code example | `[ ] PENDING` | _Not created yet_ |
| 28 | `ISSUE-02-20` | `Documentation Gap` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [Docs][v1.0] 'v0.9 and later' tabs in public docs teach {"path": "..."}, {"call": "..."}, and Text variant "h1" which fail validation in v1.0 | `[ ] PENDING` | _Not created yet_ |
| 29 | `ISSUE-02-21` | `Documentation Gap` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [Docs][react] typescript/renderers/react/README.md omits required MarkdownContext.Provider setup and makes outdated v0.8 default export claim | `[ ] PENDING` | _Not created yet_ |
| 30 | `ISSUE-02-22` | `Documentation Gap` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [Docs][v1.0][evolution_guide] specification/v1_0/docs/evolution_guide.md omits breaking removal of h1–h5 from Text.variant | `[ ] PENDING` | _Not created yet_ |
| 31 | `ISSUE-02-23` | `Documentation Gap` | Core React Onboarding (@a2ui/react & @a2ui/web_core) | [Docs][v1.0][web_core] Undocumented Catalog(id, protocolVersion, components, functions) parameter order and dual @path/path & @call/call schema support | `[ ] PENDING` | _Not created yet_ |
| 32 | `ISSUE-03-01` | `Documentation Gap` | Macros | [Docs][v1.0] Complete absence of UI Macros (MacroExpander, @macro, slot boundaries, ID stitching) on a2ui.org and in specification/v1_0 | `[ ] PENDING` | _Not created yet_ |
| 33 | `ISSUE-03-02` | `Documentation Gap` | Macros | [Docs][v1.0] Macro README and conformance/agent/macros/macros.yaml exclusively use legacy v0.9 syntax ({"path": ...}, variant: "h3", v0_9 builder) | `[ ] PENDING` | _Not created yet_ |
| 34 | `ISSUE-03-03` | `Documentation Gap` | Macros | [Docs][Macros] Mismatch between declarative YAML macro templates ($param, $spreadParam) in conformance/agent/macros/ and imperative Python @macro API | `[ ] PENDING` | _Not created yet_ |
| 35 | `ISSUE-03-04` | `Bug` | Macros | [v1.0][TypeScript] MacroExpander, MacroProcessor, and IdAllocator are completely unimplemented in @a2ui/agent and @a2ui/web_core (macros.yaml skipped) | `[ ] PENDING` | _Not created yet_ |
| 36 | `ISSUE-03-05` | `Bug` | Macros | [v1.0][Python a2ui_agent] MacroProcessor and MacroExpander hardcode v0_9 builders/versions and fail to coerce A2UI v1.0 {"@path": "/..."} data bindings | `[ ] PENDING` | _Not created yet_ |
| 37 | `ISSUE-03-06` | `Bug` | Macros | [Python a2ui_agent] MacroExpander._expand_component_list swallows non-recursion macro exceptions, leaving unexpanded macro nodes that fail schema validation downstream | `[ ] PENDING` | _Not created yet_ |
| 38 | `ISSUE-04-01` | `Documentation Gap` | Skill Generation | [v1.0][docs] Document Agent Skill Generation (SkillGenerator, Skill, SkillSet, and SKILL.md compilation) in public guides and @a2ui/agent README | `[ ] PENDING` | _Not created yet_ |
| 39 | `ISSUE-04-02` | `Documentation Gap` | Skill Generation | [v1.0][docs] Document programmatic @a2ui/web_core Catalog.toJson() schema serialization and InMemoryCatalogProvider usage in @a2ui/agent | `[ ] PENDING` | _Not created yet_ |
| 40 | `ISSUE-04-03` | `Documentation Gap` | Skill Generation | [v1.0][docs] Document .agents/AGENTS.md and .agents/skills/ workspace layout conventions for A2UI skill packages | `[ ] PENDING` | _Not created yet_ |
| 41 | `ISSUE-04-04` | `Bug` | Skill Generation | [v1.0][agent] @a2ui/agent TypeScript SDK is missing Skill, SkillSet, and SkillGenerator (all conformance/agent/skill.yaml cases skipped) | `[ ] PENDING` | _Not created yet_ |
| 42 | `ISSUE-04-05` | `Bug` | Skill Generation | [v1.0][conformance] Contradiction between conformance/test_data/skills/express_base_rules.txt (root = Card(...)) and catalog_transformer.yaml pruning conformance | `[ ] PENDING` | _Not created yet_ |
| 43 | `ISSUE-04-06` | `Bug` | Skill Generation | [v1.0][web_core] @a2ui/web_core/catalogs/basic/v1 fails to export BASIC_COMPONENTS and BASIC_CATALOG_DOCUMENT_OPTIONS | `[ ] PENDING` | _Not created yet_ |
| 44 | `ISSUE-04-07` | `Bug` | Skill Generation | [v1.0][skill] Heading mismatch (### Examples: vs ## Examples) in SkillGenerator and zero direct_json test cases in conformance/agent/skill.yaml | `[ ] PENDING` | _Not created yet_ |
| 45 | `ISSUE-04-08` | `Bug` | Skill Generation | [v1.0][skill] _clean_catalog_name(catalog) in python/a2ui_agent/src/a2ui/skill/skill.py ignores catalog.id and fails on URLs ending in /catalog.json without a vN segment | `[ ] PENDING` | _Not created yet_ |
| 46 | `ISSUE-05-01` | `Bug` | Protocol Extensions (metadata.extensions) | [v1.0][web_core] PayloadValidator.validateComponent strips 'metadata' before validating metadata.extensions | `[ ] PENDING` | _Not created yet_ |
| 47 | `ISSUE-05-02` | `Bug` | Protocol Extensions (metadata.extensions) | [v1.0][web_core] Published @a2ui/web_core@0.14.0 v1_0 ExtensionsSchema accepts non-UAX #31 '-' and ':' characters in extension keys | `[ ] PENDING` | _Not created yet_ |
| 48 | `ISSUE-05-03` | `Bug` | Protocol Extensions (metadata.extensions) | [v1.0][web_core] SurfaceModel.dispatchAction silently drops metadata.extensions on outbound actions | `[ ] PENDING` | _Not created yet_ |
| 49 | `ISSUE-05-04` | `Bug` | Protocol Extensions (metadata.extensions) | [v1.0][web_core][react] ComponentNode and useNodeView omit component metadata.extensions from resolved nodes and toJSON() | `[ ] PENDING` | _Not created yet_ |
| 50 | `ISSUE-05-05` | `Documentation Gap` | Protocol Extensions (metadata.extensions) | [v1.0][docs] Document A2UI v1.0 Protocol Extensions (metadata.extensions) on createSurface, ComponentCommon, ComponentDefinition, and action | `[ ] PENDING` | _Not created yet_ |
| 51 | `ISSUE-05-06` | `Documentation Gap` | Protocol Extensions (metadata.extensions) | [v1.0][docs] Document UAX #31 identifier syntax requirement for metadata.extensions keys (no dots, hyphens, or colons) | `[ ] PENDING` | _Not created yet_ |
| 52 | `ISSUE-05-07` | `Documentation Gap` | Protocol Extensions (metadata.extensions) | [v1.0][docs] Provide migration example for replacing v0.9 createSurface.theme with v1.0 createSurface.metadata.extensions | `[ ] PENDING` | _Not created yet_ |
| 53 | `ISSUE-05-08` | `Documentation Gap` | Protocol Extensions (metadata.extensions) | [v1.0][docs][react] Document how custom components in @a2ui/react and @a2ui/web_core access surface and component metadata.extensions | `[ ] PENDING` | _Not created yet_ |
| 54 | `ISSUE-06-01` | `Documentation Gap` | Express DSL | [v1.0][docs] A2UI Express has no guide or reference page on a2ui.org (docs/public/) and the glossary links to the wrong GitHub org (a2ui-project/a2ui) | `[ ] PENDING` | _Not created yet_ |
| 55 | `ISSUE-06-02` | `Documentation Gap` | Express DSL | [v1.0][agent] Published @a2ui/agent@0.0.1 on npm defaults to DirectJsonFormatFactory and is missing APIs documented in typescript/agents/a2ui_agent/README.md | `[ ] PENDING` | _Not created yet_ |
| 56 | `ISSUE-06-03` | `Documentation Gap` | Express DSL | [v1.0][spec] Contradictions between a2ui_express.md specification and Express.g4 grammar (UAX #31 identifiers, surfaceParams, statement separators) | `[ ] PENDING` | _Not created yet_ |
| 57 | `ISSUE-06-04` | `Documentation Gap` | Express DSL | [v1.0][spec][agent] a2ui_express.md advertises line-by-line progressive streaming, but ExpressFormat.supportsStreaming is hardcoded to false | `[ ] PENDING` | _Not created yet_ |
| 58 | `ISSUE-06-05` | `Bug` | Express DSL | [v1.0][agent] ExpressDecompiler throws ExpressInvalidIdentifierError on hyphenated component IDs instead of emitting id="..." per spec | `[ ] PENDING` | _Not created yet_ |
| 59 | `ISSUE-06-06` | `Bug` | Express DSL | [v1.0][agent] ExpressParser configures BlockLexer with single-quote (') strings and omits // and /* */ comments, swallowing </a2ui> when a comment contains an apostrophe | `[ ] PENDING` | _Not created yet_ |
| 60 | `ISSUE-06-07` | `Bug` | Express DSL | [v1.0][agent] ExpressCompiler.compile() uses naive substring .includes('<a2ui>') / .split('</a2ui>') stripping that corrupts string literals containing <a2ui> | `[ ] PENDING` | _Not created yet_ |
| 61 | `ISSUE-06-08` | `Bug` | Express DSL | [v1.0][agent] @a2ui/agent top-level 'import * as fs from "fs"' breaks browser/on-device bundling and ExpressCompiler is missing from src/index.ts exports | `[ ] PENDING` | _Not created yet_ |
| 62 | `ISSUE-07-01` | `Bug` | Server-Side & Client-Side Functions | [v1.0][web_core] Declarative @call functions in UI bindings, checks, and action.functionCall never route to RpcHandler.callAgentFunction | `[ ] PENDING` | _Not created yet_ |
| 63 | `ISSUE-07-02` | `Bug` | Server-Side & Client-Side Functions | [v1.0][web_core] createCatalogInvoker never checks allowedCallers === 'agentOnly', allowing UI bindings and actions to execute agent-only functions | `[ ] PENDING` | _Not created yet_ |
| 64 | `ISSUE-07-03` | `Bug` | Server-Side & Client-Side Functions | [v1.0][web_core] DataContext does not handle Promise return values from async FunctionImplementation.execute | `[ ] PENDING` | _Not created yet_ |
| 65 | `ISSUE-07-04` | `Bug` | Server-Side & Client-Side Functions | [v1.0][web_core] ErrorMessageSchema in src/v1_0/schema/renderer-to-agent.ts uses !z.any().safeParse(value).success and rejects 100% of error messages | `[ ] PENDING` | _Not created yet_ |
| 66 | `ISSUE-07-05` | `Bug` | Server-Side & Client-Side Functions | [v1.0][web_core] MessageProcessor and RpcHandler use legacy v0.9 'call' key instead of v1.0 '@call' in function RPC payloads | `[ ] PENDING` | _Not created yet_ |
| 67 | `ISSUE-07-06` | `Bug` | Server-Side & Client-Side Functions | [v1.0][web_core][react] @a2ui/web_core root entrypoint omits ./v1_0 and ./rpc, and @a2ui/react@0.14.0 has no v1.0 or RpcHandler integration | `[ ] PENDING` | _Not created yet_ |
| 68 | `ISSUE-07-07` | `Documentation Gap` | Server-Side & Client-Side Functions | [v1.0][docs] docs/public/reference/messages.md has no v1.0 tab and omits callRendererFunction, agentFunctionResponse, callAgentFunction, and rendererFunctionResponse | `[ ] PENDING` | _Not created yet_ |
| 69 | `ISSUE-07-08` | `Documentation Gap` | Server-Side & Client-Side Functions | [v1.0][docs] docs/public/concepts/actions.md uses legacy v0.9 call/path syntax and contradicts v1.0 callAgentFunction / callRendererFunction RPC | `[ ] PENDING` | _Not created yet_ |
| 70 | `ISSUE-07-09` | `Documentation Gap` | Server-Side & Client-Side Functions | [v1.0][docs] docs/public/concepts/data-binding.md mislabels v0.9 {"path": "..."} as "v0.9 and later" and omits v1.0 @path, @call, and @index | `[ ] PENDING` | _Not created yet_ |
| 71 | `ISSUE-07-10` | `Documentation Gap` | Server-Side & Client-Side Functions | [v1.0][docs] docs/public/concepts/catalogs.md documents v0.9 array-based functions schema instead of v1.0 map-based functions with allowedCallers | `[ ] PENDING` | _Not created yet_ |
| 72 | `ISSUE-07-11` | `Documentation Gap` | Server-Side & Client-Side Functions | [v1.0][spec/docs] a2ui_custom_functions.md is unlinked from docs/public/ and its getScreenResolution example omits allowedCallers, failing with INVALID_FUNCTION_CALL | `[ ] PENDING` | _Not created yet_ |
| 73 | `ISSUE-07-12` | `Documentation Gap` | Server-Side & Client-Side Functions | [v1.0][spec/docs] a2ui_protocol.md Introduction states there are 4 agent-to-renderer messages instead of 6 | `[ ] PENDING` | _Not created yet_ |
| 74 | `ISSUE-07-13` | `Documentation Gap` | Server-Side & Client-Side Functions | [v1.0][docs] docs/public/guides/renderer-development.md v1.0 tab references non-existent surfaceProperties and a2uiClientCapabilities and omits agentFunctionResponse | `[ ] PENDING` | _Not created yet_ |
| 75 | `ISSUE-08-01` | `Documentation Gap` | Accessibility | [docs][v1.0] reference/components.md documents invalid 'accessibility.role' property and omits 'description', 'live', and 'hidden' | `[ ] PENDING` | _Not created yet_ |
| 76 | `ISSUE-08-02` | `Documentation Gap` | Accessibility | [docs][v1.0] docs/public/roadmap.md lists Accessibility & ARIA attribute generation as future work despite shipping in v1.0 | `[ ] PENDING` | _Not created yet_ |
| 77 | `ISSUE-08-03` | `Documentation Gap` | Accessibility | [docs][v1.0] Missing public documentation for AccessibilityAttributes ('live' regions, 'hidden' subtrees, and semantic label inference) | `[ ] PENDING` | _Not created yet_ |
| 78 | `ISSUE-08-04` | `Bug` | Accessibility | [v1.0][web_core] BasicCatalogA2uiLitElement sets ARIA attributes on outer custom element host instead of inner focusable control | `[ ] PENDING` | _Not created yet_ |
| 79 | `ISSUE-08-05` | `Bug` | Accessibility | [v1.0][web_core][react] Public A2uiLitElement and @a2ui/react adapters do not plumb ComponentCommon.accessibility attributes | `[ ] PENDING` | _Not created yet_ |
| 80 | `ISSUE-08-06` | `Bug` | Accessibility | [v1.0][web_core] accessibility.hidden=true sets aria-hidden="true" without inert, violating axe-core aria-hidden-focus | `[ ] PENDING` | _Not created yet_ |
| 81 | `ISSUE-08-07` | `Bug` | Accessibility | [v1.0][web_core] BasicCatalogA2uiLitElement only sets 'aria-description' without 'aria-describedby' fallback required by a2ui_protocol.md | `[ ] PENDING` | _Not created yet_ |
| 82 | `ISSUE-08-08` | `Bug` | Accessibility | [v1.0][web_core] Conformance test runner skips 'accessibility.yaml' and leaves validateAccessibilityCheckTestCase() unimplemented | `[ ] PENDING` | _Not created yet_ |
| 83 | `ISSUE-09-01` | `Documentation Gap` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][docs] Public catalog guides still state surfaces are locked to a single catalog for their lifetime | `[ ] PENDING` | _Not created yet_ |
| 84 | `ISSUE-09-02` | `Documentation Gap` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][docs] concepts/catalogs.md instructs developers to clone all BASIC_COMPONENTS into custom catalogs instead of using v1.0 multi-catalog composition | `[ ] PENDING` | _Not created yet_ |
| 85 | `ISSUE-09-03` | `Documentation Gap` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][docs] Undocumented non-inheritance rule for nested @call expressions inside components with an explicit catalogId | `[ ] PENDING` | _Not created yet_ |
| 86 | `ISSUE-09-04` | `Documentation Gap` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][docs] Undocumented ChildSchema / ChildListSchema (markChildRef) requirement for custom container components | `[ ] PENDING` | _Not created yet_ |
| 87 | `ISSUE-09-05` | `Documentation Gap` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][docs] Undocumented catalog reset on incremental updateComponents when catalogId is omitted in v1.0 | `[ ] PENDING` | _Not created yet_ |
| 88 | `ISSUE-09-06` | `Documentation Gap` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][docs] Missing React implementation guide for registering and mixing multiple Catalog instances | `[ ] PENDING` | _Not created yet_ |
| 89 | `ISSUE-09-07` | `Bug` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][web_core] generateValidationSchema localizes #/$defs/anyFunction to a single catalog, rejecting cross-catalog @calls and all @calls in component-only catalogs | `[ ] PENDING` | _Not created yet_ |
| 90 | `ISSUE-09-08` | `Bug` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][web_core] MessageProcessor defaults validationConfig to undefined (allowUnknownElements = true), silently binding unknown components to defaultCatalog | `[ ] PENDING` | _Not created yet_ |
| 91 | `ISSUE-09-09` | `Bug` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][web_core] ComponentModel.componentTree strips catalogId, losing per-component catalog overrides upon serialization | `[ ] PENDING` | _Not created yet_ |
| 92 | `ISSUE-09-10` | `Bug` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][web_core] SurfaceModel.dispatchAction checks unreachable action.catalogId rejected by strict ActionSchema and omits source component catalogId | `[ ] PENDING` | _Not created yet_ |
| 93 | `ISSUE-09-11` | `Bug` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][web_core] serializeComponentModel emits inner unevaluatedProperties: false in Catalog.toJson(), breaking Catalog.fromJson() round-trips for ComponentCommon fields | `[ ] PENDING` | _Not created yet_ |
| 94 | `ISSUE-09-12` | `Bug` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][web_core] Component composition constraint validation (allowedParents / allowedChildren) ignores catalogId namespaces | `[ ] PENDING` | _Not created yet_ |
| 95 | `ISSUE-09-13` | `Bug` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][web_core] RpcHandler.resolveFunctionImplementation ignores surface.defaultCatalog when catalogId is omitted and defaults allowedCallers to rendererOnly | `[ ] PENDING` | _Not created yet_ |
| 96 | `ISSUE-09-14` | `Bug` | Mixed Catalogs (Multi-Catalog Surfaces) | [v1.0][react] @a2ui/react prepareCatalogs mutates shared Catalog.components Map in-place and Catalog.componentRefMap hardcodes V09_CHILD_REF_OPTIONS | `[ ] PENDING` | _Not created yet_ |
| 97 | `ISSUE-10-01` | `Documentation Gap` | Streaming in Direct JSON / Transports | [Docs][Transports] docs/public/concepts/transports.md contains placeholder '// TODO: Add an example' blocks for HTTP/REST, WebSockets, and Server-Sent Events (SSE) | `[ ] PENDING` | _Not created yet_ |
| 98 | `ISSUE-10-02` | `Documentation Gap` | Streaming in Direct JSON / Core Protocol Docs | [Docs][v1.0] docs/public/concepts/data-flow.md and docs/public/reference/messages.md omit A2UI v1.0, inline createSurface.components/dataModel, required updateDataModel.value, and @path/@call | `[ ] PENDING` | _Not created yet_ |
| 99 | `ISSUE-10-03` | `Documentation Gap` | Streaming in Direct JSON / Agent Development | [Docs][Agent Guide] docs/public/guides/agent-development.md only covers v0.8/v0.9, references non-existent 'render'/'update' schema operations, and ends with an unfinished TODO | `[ ] PENDING` | _Not created yet_ |
| 100 | `ISSUE-10-04` | `Documentation Gap` | Streaming in Direct JSON / Specification Schema | [v1.0][Spec] specification/v1_0/json/agent_to_renderer.json CreateSurfaceMessage description contradicts v1.0 inline components and dataModel support | `[ ] PENDING` | _Not created yet_ |
| 101 | `ISSUE-10-05` | `Bug` | Streaming in Direct JSON | [v1.0][agent] DirectJsonResponseStream cannot progressively stream v1.0 single-message createSurface with inline components and dataModel | `[ ] PENDING` | _Not created yet_ |
| 102 | `ISSUE-10-06` | `Bug` | Streaming in Direct JSON | [v1.0][web_core] MessageProcessor with STRICT_VALIDATION throws A2uiIntegrityError (Dangling reference) on top-down streaming recommended by DirectJsonFormat | `[ ] PENDING` | _Not created yet_ |
| 103 | `ISSUE-10-07` | `Bug` | Streaming in Direct JSON / MessageProcessor Validation | [v1.0][web_core] MessageProcessor constructor silently ignores STRICT_VALIDATION / RELAXED_VALIDATION when passed directly as the 3rd argument instead of { validationConfig } | `[ ] PENDING` | _Not created yet_ |
| 104 | `ISSUE-10-08` | `Bug` | Streaming in Direct JSON | [v1.0][agent] DirectJsonResponseStream sets wholeItemKeys: ['components'] in v1.0, disabling progressiveKeys: ['text'] streaming inside updateComponents | `[ ] PENDING` | _Not created yet_ |

---

## [ISSUE-01-01] [v1.0][react] Importing @a2ui/react in Node.js / SSR crashes with ReferenceError: HTMLElement is not defined in ReactWcHost
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

## [ISSUE-01-02] [v1.0][web_core] A2uiLitElement.adoptLightDomStyles() unconditionally leaks Shadow DOM styles into document.adoptedStyleSheets
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

## [ISSUE-01-03] [v1.0][react] @a2ui/react@0.14.0 hardcodes @a2ui/web_core/v0_9 imports and lacks a ./v1_0 export subpath
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

---

### Additional Onboarding Evidence (`package.json#exports` Audit)

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

## [ISSUE-01-04] [v1.0][web_core] toWebComponentImplementation is omitted from @a2ui/web_core/universal barrel export
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

## [ISSUE-01-05] [v1.0][react] toWebComponent() computeTagName leaks <a2ui-react-name-N> custom element registrations across HMR and unmemoized catalogs
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

## [ISSUE-01-06] [v1.0][docs] authoring-universal-components.md exclusively documents v0.9 imports and legacy {"path": "..."} bindings with zero v1.0 examples
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

## [ISSUE-01-07] [v1.0][docs] toWebComponentImplementation(element, api) and TaggedCustomElementConstructor are undocumented in authoring-universal-components.md
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Web Components & Universal Elements (Documentation)`
- **Title**: `[v1.0][docs] toWebComponentImplementation(element, api) and TaggedCustomElementConstructor are undocumented in authoring-universal-components.md`

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

## [ISSUE-01-08] [v1.0][docs][web_core] Contradictory documentation between A2uiLitElement JSDoc and authoring-universal-components.md on Light DOM vs Shadow DOM default
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

## [ISSUE-01-09] [v1.0][docs][react] Undocumented <a2ui-react-*> ReactWcHost wrapper elements and display: contents DOM structure in @a2ui/react
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

---

### Additional Adapter Inspection (`V1Point0Adapter.extractOperationsFromObject`)

### Summary
In A2UI v1.0 (`specification/v1_0/json/agent_to_renderer.json` lines 25–58 and `typescript/core/web_core/src/v1_0/schema/agent-to-renderer.ts` lines 31–60), `theme` was removed from `createSurface` and `CreateSurfaceMessageSchema` enforces `.strict()` (`additionalProperties: false`).

However, `V1Point0Adapter.extractOperationsFromObject` (`typescript/core/web_core/src/processing/adapters/v1_0.ts` line 44) still reads `theme: cs?.theme` from `msgObj.createSurface`, and `MessageProcessor.processCreateSurfaceOp` (`message-processor.ts` lines 764–780) still runs `PayloadValidator.validateTheme(theme)`. Because `BaseVersionAdapter.adaptMessage` validates `msgObj` against `CreateSurfaceMessageSchema` before calling `extractOperationsFromObject`, any v1.0 `createSurface` message containing `theme` fails with a Zod `unrecognized_keys` error before line 44 is ever reached, while `catalog.themeSchema` on v1.0 catalogs can never be populated via `createSurface`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/processing/adapters/v1_0.ts` (lines 38–59)
  - `typescript/core/web_core/src/v1_0/schema/agent-to-renderer.ts` (lines 31–60)
  - `typescript/core/web_core/src/processing/message-processor.ts` (lines 764–780)

### Steps to Reproduce / Evidence
Run the following standalone script against `@a2ui/web_core@0.14.0`:

```bash
node -e '
import("@a2ui/web_core/v1_0").then((v10) => {
  const mp = new v10.MessageProcessor([v10.basicCatalog]);
  try {
    mp.processMessages([{
      version: "v1.0",
      createSurface: {
        surfaceId: "s1",
        catalogId: v10.basicCatalog.id,
        theme: { primaryColor: "#0AAD0A" }
      }
    }]);
  } catch (err) {
    console.log("Error:", err.name, err.message);
  }
});
'
```

Output:
```text
Error: A2uiValidationError Validation failed for v1.0 message: Unrecognized key(s) in object: 'theme' at "createSurface"
```

Yet `typescript/core/web_core/src/processing/adapters/v1_0.ts` lines 40–45 still has:
```ts
      ops.push({
        type: 'createSurface',
        surfaceId: String(cs?.surfaceId || ''),
        catalogId: typeof cs?.catalogId === 'string' ? cs.catalogId : undefined,
        theme: cs?.theme,
        sendDataModel: Boolean(cs?.sendDataModel),
```

### Expected Behavior
`V1Point0Adapter` and `CreateSurfaceMessageSchema` should be consistent:
- Since v1.0 removed `theme` from `createSurface` in `specification/v1_0/json/agent_to_renderer.json` (and `evolution_guide.md`), remove dead `theme: cs?.theme` from `V1Point0Adapter.extractOperationsFromObject` (and clarify how or if `BasicCatalogThemeSchema` is used in v1.0).

### Actual Behavior
`V1Point0Adapter` extracts `theme: cs?.theme` and `v1_0/index.ts` exports `BasicCatalogThemeSchema`, even though `CreateSurfaceMessageSchema` strictly rejects `theme` on `createSurface`.

### Suggested Fix
Remove `theme: cs?.theme` from `typescript/core/web_core/src/processing/adapters/v1_0.ts` line 44 (leaving `theme` extraction only in `V0Point9Adapter` and `V0Point8Adapter`), or document that `theme` is v0.8/v0.9-only.
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

---

## [ISSUE-03-01] [Docs][v1.0] Complete absence of UI Macros (MacroExpander, @macro, slot boundaries, ID stitching) on a2ui.org and in specification/v1_0
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Macros`
- **Title**: `[Docs][v1.0] Complete absence of UI Macros (MacroExpander, @macro, slot boundaries, ID stitching) on a2ui.org and in specification/v1_0`

<!-- ISSUE_BODY_START -->
### Summary
A2UI includes a complete composite UI macro subsystem — backed by an 18-case language-agnostic conformance suite (`conformance/agent/macros/macros.yaml`), 10 golden fixtures (`conformance/agent/macros/golden/`), and a Python reference implementation (`python/a2ui_agent/src/a2ui/transformers/macros/`) — that lets agents expose high-level parameterized components to LLMs during inference (`transform_to_inference_catalog`) and expand them into flat primitive component trees before transport (`transform_to_transport`).

However, searching the published documentation site (`docs/` in `google/A2UI`, served at `https://a2ui.org`) and the formal protocol specifications (`specification/v0_9/`, `specification/v1_0/`) returns **zero mentions** of `MacroExpander`, `MacroProcessor`, `@macro`, macro ID namespacing (`${instance_id}__${component_type_lower}_${counter}`), root stitching, or slot boundary preservation (`ComponentId` / `ChildList`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/` (entire MkDocs site source for `https://a2ui.org`)
  - `mkdocs.yaml` (navigation tree omits any Macros guide)
  - `specification/v1_0/` (no specification of macro catalog synthesis or post-order expansion rules)
  - Existing unlinked internal READMEs: `conformance/agent/macros/README.md` (lines 1–75) and `python/a2ui_agent/src/a2ui/transformers/macros/README.md` (lines 1–128)

### Steps to Reproduce / Evidence
Run a repository-wide search across `docs/` and `specification/` in `google/A2UI`:
```bash
git grep -i "MacroExpander\|MacroProcessor\|@macro" docs/ specification/
```
**Output:** (empty — 0 matches).

Meanwhile, the feature exists in:
- `conformance/agent/macros/macros.yaml` (lines 1–612)
- `python/a2ui_agent/src/a2ui/transformers/macros/expander.py` (lines 32–267)
- `samples/community/macros/README.md`

### Expected Behavior
`https://a2ui.org` (`docs/`) and `specification/v1_0/` should include a dedicated **UI Macros & Composite Components** guide and specification section covering:
1. When to use server-side/pipeline `MacroExpander` vs. client-registered custom catalog components.
2. Inference catalog schema synthesis (`transform_to_inference_catalog` and `passthrough_components`).
3. Deterministic double-underscore child ID allocation (`${instance_id}__${type_lower}_${counter}`) and post-order root ID stitching.
4. Single-child (`ComponentId`) and multi-child (`ChildList`) slot boundary preservation.

### Actual Behavior
Developers reading `https://a2ui.org` or `specification/v1_0/` have no way to discover that A2UI supports UI macros unless they manually browse `conformance/agent/macros/` or `python/a2ui_agent/src/a2ui/transformers/macros/`.

### Suggested Fix
1. Promote and expand `python/a2ui_agent/src/a2ui/transformers/macros/README.md` and `conformance/agent/macros/README.md` into a public page under `docs/concepts/macros.md` and wire it into `mkdocs.yaml`.
2. Add a normative section to `specification/v1_0/` defining the macro expansion invariants (ID allocation, root stitching, slot preservation, and recursion limit `max_depth = 16`).
<!-- ISSUE_BODY_END -->

---

## [ISSUE-03-02] [Docs][v1.0] Macro README and conformance/agent/macros/macros.yaml exclusively use legacy v0.9 syntax ({"path": ...}, variant: "h3", v0_9 builder)
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Macros`
- **Title**: `[Docs][v1.0] Macro README and conformance/agent/macros/macros.yaml exclusively use legacy v0.9 syntax ({"path": ...}, variant: "h3", v0_9 builder)`

<!-- ISSUE_BODY_START -->
### Summary
Both `python/a2ui_agent/src/a2ui/transformers/macros/README.md` and `conformance/agent/macros/macros.yaml` document and test A2UI Macros exclusively using legacy A2UI `v0.9` syntax:
- Importing from `a2ui.builder.v0_9`
- Setting `"version": "v0.9"` on envelopes
- Using unprefixed `{"path": "/system/cpu"}` `DataBinding` objects instead of A2UI v1.0 `{"@path": "/system/cpu"}`
- Using removed `Text.variant` values such as `"h3"` and `"h4"` instead of A2UI v1.0 `'body' | 'caption'` with Markdown `#` prefixes.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `python/a2ui_agent/src/a2ui/transformers/macros/README.md` (lines 14–48)
  - `conformance/agent/macros/macros.yaml` (lines 140–175, 480–590)
  - `conformance/agent/macros/golden/05_data_binding_coercion.json` (lines 1–20)
  - `conformance/agent/macros/golden/14_end_to_end_envelope_transformation.json` (lines 1–42)

### Steps to Reproduce / Evidence
1. In `python/a2ui_agent/src/a2ui/transformers/macros/README.md` (lines 16–30):
   ```python
   from a2ui.builder.v0_9 import Card, Column, Row, Text, Icon, DynamicString
   from a2ui.transformers.macros import macro, MacroExpander

   @macro
   def StatusBadge(status: DynamicString, label: DynamicString) -> Card:
       return Card(
           child=Row(children=[Icon(name="check"), Text(text=label, variant="caption")])
       )
   ```
2. In `conformance/agent/macros/macros.yaml` (`05_data_binding_coercion`, lines 142–167):
   ```yaml
   - id: 05_data_binding_coercion
     description: >
       Macro parameters accepting DynamicString/DynamicNumber must coerce raw
       {"path": "/..."} objects into DataBinding nodes in the expanded output.
     input:
       components:
         - id: metric_1
           component: MetricCard
           title: CPU Load
           value:
             path: /system/cpu
   ```
3. In `conformance/agent/macros/golden/14_end_to_end_envelope_transformation.json`:
   ```json
   [
     {
       "version": "v0.9",
       "createSurface": {
         "surfaceId": "main",
         "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json"
       }
     }
   ]
   ```

### Expected Behavior
Macro documentation and conformance fixtures should include A2UI `v1.0` examples and test cases using:
- `"version": "v1.0"`
- `"catalogId": "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json"`
- `{"@path": "/system/cpu"}` for `DataBinding`
- `{"@call": "..."}` for `FunctionCall`
- Valid v1.0 `Text.variant` values (`"body"` | `"caption"`).

### Actual Behavior
Developers copying any macro example or golden fixture from the repository into a `v1.0` application hit immediate schema validation errors because `{"path": "/..."}` and `Text.variant: "h3"` are rejected by the `v1.0` basic catalog validator.

### Suggested Fix
Update `python/a2ui_agent/src/a2ui/transformers/macros/README.md` and `conformance/agent/macros/macros.yaml` to cover A2UI `v1.0` envelopes and `{"@path": "/..."}` data bindings alongside `v0.9`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-03-03] [Docs][Macros] Mismatch between declarative YAML macro templates ($param, $spreadParam) in conformance/agent/macros/ and imperative Python @macro API
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Macros`
- **Title**: `[Docs][Macros] Mismatch between declarative YAML macro templates ($param, $spreadParam) in conformance/agent/macros/ and imperative Python @macro API`

<!-- ISSUE_BODY_START -->
### Summary
`conformance/agent/macros/README.md` and `conformance/agent/macros/macros.yaml` define macros using a declarative JSON/YAML template DSL with special sentinel objects (`{"$param": "name"}`, `{"$spreadParam": "items"}`, and inline string interpolation `"${label}: "`).

However, neither the Python SDK (`python/a2ui_agent/src/a2ui/transformers/macros/`) nor the TypeScript SDK implements a parser for `$param` or `$spreadParam` declarative macro definitions; the Python SDK only accepts imperative Python functions decorated with `@macro` that return `ComponentBuilderNode` trees, while the Python conformance test runner (`python/a2ui_agent/tests/conformance/test_macros_conformance.py`) translates those YAML fixtures inside the test harness itself.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `conformance/agent/macros/README.md` (lines 25–65)
  - `conformance/agent/macros/macros.yaml` (lines 18–138)
  - `python/a2ui_agent/src/a2ui/transformers/macros/macro.py` (lines 456–531)
  - `python/a2ui_agent/src/a2ui/transformers/macros/processor.py` (lines 112–214)

### Steps to Reproduce / Evidence
In `conformance/agent/macros/macros.yaml` (lines 80–115), macros are declared as JSON/YAML data structures using `$param` and `$spreadParam`:
```yaml
macros:
  Toolbar:
    description: A horizontal toolbar with leading/trailing items.
    parameters:
      title:
        type: DynamicString
        required: true
      items:
        type: ChildList
        required: true
    template:
      component: Row
      children:
        - component: Text
          text:
            $param: title
        - $spreadParam: items
```
Yet searching `python/a2ui_agent/src/` and `typescript/` for `$param` or `$spreadParam` returns zero matches in runtime SDK code:
```bash
git grep "spreadParam" python/a2ui_agent/src/ typescript/
```
**Output:** (empty — 0 matches).

### Expected Behavior
The documentation should clearly explain whether `$param` / `$spreadParam` is strictly a test-fixture representation in `conformance/agent/macros/macros.yaml` or a supported portable JSON macro format that SDKs can load at runtime.

### Actual Behavior
Developers reading `conformance/agent/macros/` expect to be able to register JSON/YAML macro templates with `$param` and `$spreadParam` in `MacroExpander`, which fails because `MacroExpander.__init__` only accepts `@macro`-decorated Python callables (`ValueError: Callable '...' is not decorated with @macro`).

### Suggested Fix
1. Document the distinction between the declarative conformance fixture DSL (`$param`, `$spreadParam`) and the language-native `@macro` builder API in `conformance/agent/macros/README.md`.
2. Consider adding a `Macro.from_template(dict)` helper to `a2ui.transformers.macros` (and TypeScript `@a2ui/agent`) so declarative JSON macro definitions can be loaded directly at runtime.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-03-04] [v1.0][TypeScript] MacroExpander, MacroProcessor, and IdAllocator are completely unimplemented in @a2ui/agent and @a2ui/web_core (macros.yaml skipped)
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Macros`
- **Title**: `[v1.0][TypeScript] MacroExpander, MacroProcessor, and IdAllocator are completely unimplemented in @a2ui/agent and @a2ui/web_core (macros.yaml skipped)`

<!-- ISSUE_BODY_START -->
### Summary
The A2UI TypeScript ecosystem (`@a2ui/agent@0.0.1`, `@a2ui/web_core@0.14.0`, and `@a2ui/react@0.14.0`) has no implementation of `MacroExpander`, `MacroProcessor`, `IdAllocator`, or the component builder API (`builder.yaml` / `macros.yaml`). Both the `@a2ui/web_core` conformance runner and the `@a2ui/agent` conformance runner skip `conformance/agent/macros/macros.yaml`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm packages `@a2ui/agent@0.0.1`, `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/tests/conformance/conformance_test.mjs` (lines 185–193)
  - `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (lines 37–43)
  - `typescript/agents/a2ui_agent/src/index.ts`

### Steps to Reproduce / Evidence
1. Inspect `typescript/core/web_core/tests/conformance/conformance_test.mjs` at line 193:
   ```js
   const SKIP_TEST_SUITES = new Set(['accessibility.yaml', 'builder.yaml', 'macros.yaml']);
   ```
2. Inspect `typescript/agents/a2ui_agent/KNOWN_GAPS.md` at lines 39–40:
   ```markdown
   - **What it is:** ... `agent/builder/` and `agent/macros/` do not run.
   - **Why it exists:** Those suites exercise blueprint APIs this package does not implement yet.
   ```
3. Attempt to import `MacroExpander` or `macro` in a TypeScript agent or client:
   ```ts
   import { MacroExpander } from '@a2ui/agent';
   // TS2305: Module '"@a2ui/agent"' has no exported member 'MacroExpander'.
   ```

### Expected Behavior
`@a2ui/agent` (and/or `@a2ui/web_core`) should export a TypeScript `MacroExpander` implementation that passes all 18 conformance cases in `conformance/agent/macros/macros.yaml`:
- `transformToInferenceCatalog(baseCatalog)` with collision detection (`A2uiCatalogError`) and `passthroughComponents` filtering.
- `transformToTransport(messages)` with post-order flattening, deterministic double-underscore child IDs (`${instanceId}__${type_lower}_${n}`), root ID stitching, single/multi-child slot preservation, action string coercion, data-binding coercion, and cycle detection (`A2uiRecursionError`, `maxDepth = 16`).

### Actual Behavior
TypeScript agents and browser/React clients cannot define or expand A2UI macros without writing a custom macro expander from scratch.

### Suggested Fix
Port `MacroExpander`, `MacroProcessor`, `IdAllocator`, and `flattenComponentTree` to TypeScript in `@a2ui/agent` and enable `conformance/agent/macros/macros.yaml` in the TypeScript conformance test suite.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-03-05] [v1.0][Python a2ui_agent] MacroProcessor and MacroExpander hardcode v0_9 builders/versions and fail to coerce A2UI v1.0 {"@path": "/..."} data bindings
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Macros`
- **Title**: `[v1.0][Python a2ui_agent] MacroProcessor and MacroExpander hardcode v0_9 builders/versions and fail to coerce A2UI v1.0 {"@path": "/..."} data bindings`

<!-- ISSUE_BODY_START -->
### Summary
In `python/a2ui_agent`, the macro transformer subsystem (`macro.py`, `processor.py`, `expander.py`) is hardcoded to A2UI `v0.9` / `v0.9.1` in three places:
1. `macro.py` (line 36) and `processor.py` (line 26) import AST types exclusively from `a2ui.builder.v0_9` (`DataBinding`, `FunctionCall`, `Action`, `ActionEvent`, `AccessibilityAttributes`). There is no `a2ui.builder.v1_0` module in `python/a2ui_agent/src/a2ui/builder/`.
2. `processor.py` (lines 163–169) only checks for `"path" in p_val` when coercing incoming data-binding dictionaries into `DataBinding` instances, completely ignoring A2UI v1.0's `"@path"` key (`{"@path": "/..."}`).
3. `expander.py` (line 147) hardcodes `ProtocolVersion.V0_9_1` inside `MacroExpander.to_catalog()`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `python/a2ui_agent/src/a2ui/transformers/macros/macro.py` (lines 36–48)
  - `python/a2ui_agent/src/a2ui/transformers/macros/processor.py` (lines 26–31, 162–170)
  - `python/a2ui_agent/src/a2ui/transformers/macros/expander.py` (lines 140–173)

### Steps to Reproduce / Evidence
1. Inspect `python/a2ui_agent/src/a2ui/transformers/macros/processor.py` lines 162–170:
   ```python
   # 3. Coerce DataBinding dictionary: {"path": "/..."}
   elif (
       isinstance(p_val, dict)
       and "path" in p_val
       and len(p_val) == 1
       and not isinstance(p_val, DataBinding)
   ):
       coerced_args[p_name] = DataBinding(path=p_val["path"])
   ```
2. When an LLM operating in A2UI `v1.0` emits a macro invocation with a standard v1.0 data binding:
   ```json
   {
     "id": "metric_1",
     "component": "MetricCard",
     "title": "CPU Load",
     "value": { "@path": "/system/cpu" }
   }
   ```
   `_MacroProcessor.expand()` fails to match `"path" in p_val`, skips `DataBinding` coercion, and passes the raw `{"@path": "/system/cpu"}` dictionary into the v0.9 `ComponentBuilderNode` (which expects a v0.9 `DataBinding(path=...)` or serializes v0.9 `"path"` instead of v1.0 `"@path"`).
3. Inspect `python/a2ui_agent/src/a2ui/transformers/macros/expander.py` line 147:
   ```python
   def to_catalog(self) -> CatalogApi:
       # catalog_definition.json writes the version without the leading "v".
       version = to_version_number(ProtocolVersion.V0_9_1)
   ```

### Expected Behavior
1. `_MacroProcessor.expand()` should recognize both v1.0 `{"@path": "/..."}` and v0.9 `{"path": "/..."}` data-binding dicts and emit `"@path"` when lowering a `v1.0` envelope (`version == "v1.0"`).
2. `MacroExpander.to_catalog()` should accept a `protocol_version: ProtocolVersion = ProtocolVersion.V1_0` parameter instead of hardcoding `ProtocolVersion.V0_9_1`.
3. `a2ui.builder` should provide `v1_0` builder types (or version-aware serialization on `DataBinding` and `FunctionCall` so `@path` and `@call` are emitted for `v1.0`).

### Actual Behavior
`MacroExpander` cannot be used with A2UI `v1.0` envelopes containing `{"@path": "/..."}` bindings or `{"@call": "..."}` function calls without failing validation or emitting invalid v0.9 `"path"` keys inside v1.0 components.

### Suggested Fix
1. Update `processor.py` lines 163–169 to accept both `"@path"` and `"path"` keys:
   ```python
   elif (
       isinstance(p_val, dict)
       and ("@path" in p_val or "path" in p_val)
       and len(p_val) == 1
       and not isinstance(p_val, DataBinding)
   ):
       raw_path = p_val.get("@path") or p_val.get("path")
       coerced_args[p_name] = DataBinding(path=raw_path)
   ```
2. Make `flatten_component_tree` and `MacroExpander.transform_to_transport` serialize `DataBinding` as `{"@path": ...}` and `FunctionCall` as `{"@call": ...}` when the enclosing message envelope has `"version": "v1.0"`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-03-06] [Python a2ui_agent] MacroExpander._expand_component_list swallows non-recursion macro exceptions, leaving unexpanded macro nodes that fail schema validation downstream
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Macros`
- **Title**: `[Python a2ui_agent] MacroExpander._expand_component_list swallows non-recursion macro exceptions, leaving unexpanded macro nodes that fail schema validation downstream`

<!-- ISSUE_BODY_START -->
### Summary
In `python/a2ui_agent/src/a2ui/transformers/macros/expander.py` (lines 256–260), `_expand_component_list` catches `Exception`, logs it via `logger.error`, and appends the **unexpanded** macro dictionary (`expanded.append(comp)`) back into the transport component list.

Immediately afterward, `transform_to_transport` (line 202) calls `type(msg).model_validate(msg_dict)` (or sends the message to the renderer), which either raises a confusing Pydantic/schema validation error complaining about unknown macro properties on a primitive union, or sends an unexpanded macro component over the wire to the client renderer (where `@a2ui/web_core` throws `A2uiValidationError: Unknown component`), masking the real Python exception (`TypeError`, `KeyError`, or missing required macro argument).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `python/a2ui_agent/src/a2ui/transformers/macros/expander.py` (lines 202, 241–260)

### Steps to Reproduce / Evidence
Inspect `python/a2ui_agent/src/a2ui/transformers/macros/expander.py` lines 241–260:
```python
try:
    expanded_macro = self.processor.expand(
        c_name, params, instance_id=c_id
    )
    # Spliced components may themselves contain macros
    expanded.extend(
        self._expand_component_list(
            expanded_macro, depth=depth + 1, max_depth=max_depth
        )
    )
except (A2uiRecursionError, RecursionError):
    raise A2uiRecursionError(
        "Macro expansion exceeded maximum recursion depth of"
        f" {max_depth}."
    )
except Exception as e:
    logger.error(
        "Failed to expand macro %r: %s", c_name, e, exc_info=True
    )
    expanded.append(comp)
```
When an LLM omits a required macro parameter (e.g. `title` on `StatusBadge(status, title)`), `self.processor.expand()` raises `TypeError: StatusBadge() missing 1 required positional argument: 'title'`.
- If `expanded.append(comp)` is executed, `comp` (with `"component": "StatusBadge"`) remains in `components`.
- If the message is validated against the base transport catalog (which does not contain `"StatusBadge"`), validation fails with `Unknown component 'StatusBadge'` rather than reporting that `StatusBadge` was missing its required `'title'` argument.

### Expected Behavior
Missing required macro parameters or invalid macro parameter types should raise a structured `A2uiValidationError` (so the agent SDK's self-healing / retry loop can feed the exact missing-parameter error back to the LLM) rather than silently keeping the unexpanded macro node in the transport payload.

### Actual Behavior
The root-cause `TypeError` / `ValidationError` inside `processor.expand()` is swallowed by `except Exception`, leaving an unexpanded macro component in the transport message.

### Suggested Fix
Raise `A2uiValidationError` (with the macro name, instance ID, and original error message) when `self.processor.expand()` fails due to missing or invalid macro arguments instead of appending the unexpanded `comp` back into `expanded`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-01] [v1.0][docs] Document Agent Skill Generation (SkillGenerator, Skill, SkillSet, and SKILL.md compilation) in public guides and @a2ui/agent README
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][docs] Document Agent Skill Generation (SkillGenerator, Skill, SkillSet, and SKILL.md compilation) in public guides and @a2ui/agent README`

<!-- ISSUE_BODY_START -->
### Summary
A2UI v1.0 introduces an Agent Skill Generation architecture (`Skill`, `SkillSet`, `SkillGenerator`, and decomposed `PromptGenerator` methods `generateBaseRules`, `generateCatalogInstructions`, `generateExamples`) specified in `blueprints/features/skill_generator.blueprint.md`, tested in `conformance/agent/skill.yaml`, and implemented in `python/a2ui_agent/src/a2ui/skill/`. However, there is zero mention of `SkillGenerator`, `Skill`, `SkillSet`, or `SKILL.md` package compilation anywhere in the public documentation (`docs/public/`), root `README.md`, `python/a2ui_agent/README.md`, or `typescript/agents/a2ui_agent/README.md`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/agent@0.0.1`
- **File path(s)**:
  - `docs/public/guides/agent-development.md`
  - `typescript/agents/a2ui_agent/README.md`
  - `python/a2ui_agent/README.md`
  - `blueprints/features/skill_generator.blueprint.md` (lines 1–280)
  - `conformance/agent/skill.yaml` (lines 1–51)

### Steps to Reproduce / Evidence
1. Search `docs/public/` and all package `README.md` files for `SkillGenerator`, `SkillSet`, or `SKILL.md`:
   ```bash
   git grep -i "SkillGenerator" -- docs/ README.md typescript/ python/
   ```
2. Observe that `SkillGenerator` appears only in `blueprints/features/skill_generator.blueprint.md` and `python/a2ui_agent/src/a2ui/skill/` (plus tests), with zero user-facing documentation explaining how to compile A2UI catalogs into monolithic (`a2ui/SKILL.md`) or modular (`a2ui-core/SKILL.md` + `a2ui-<catalog>/SKILL.md`) agent skills.

### Expected Behavior
The public Agent Development Guide (`docs/public/guides/agent-development.md`) and SDK READMEs (`python/a2ui_agent/README.md` and `typescript/agents/a2ui_agent/README.md`) should document:
1. When to use monolithic (`generate_skill()`) vs. modular (`generate_skillset()`) A2UI skills.
2. How `SkillSet.get(query)` resolves skills (exact filename, exact skill name, or substring match for queries $\ge 3$ characters).
3. How `SkillSet.export_to_directory(".agents/skills")` safely updates `a2ui-*` skill directories while preserving sibling non-A2UI skills.

### Actual Behavior
Developers have no way to discover the Skill Generation feature without reading internal architectural blueprints (`blueprints/features/skill_generator.blueprint.md`) and YAML conformance fixtures (`conformance/agent/skill.yaml`).

### Suggested Fix
Add a dedicated **"Compiling Catalogs into Agent Skills (`SKILL.md`)"** section to `docs/public/guides/agent-development.md`, `python/a2ui_agent/README.md`, and `typescript/agents/a2ui_agent/README.md` with runnable Python and TypeScript examples for `SkillGenerator`, `Skill`, and `SkillSet`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-02] [v1.0][docs] Document programmatic @a2ui/web_core Catalog.toJson() schema serialization and InMemoryCatalogProvider usage in @a2ui/agent
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][docs] Document programmatic @a2ui/web_core Catalog.toJson() schema serialization and InMemoryCatalogProvider usage in @a2ui/agent`

<!-- ISSUE_BODY_START -->
### Summary
`typescript/agents/a2ui_agent/README.md` only demonstrates loading a catalog from a filesystem path (`CatalogConfig.fromPath('path/to/catalog.json')`). It never documents how programmatic catalogs constructed in code with `@a2ui/web_core`'s `new Catalog(...)` (using Zod `ComponentApi` and `FunctionApi` schemas) can be serialized via `catalog.toJson()` or registered via `InMemoryCatalogProvider` for prompt and skill generation.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm packages `@a2ui/agent@0.0.1`, `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/README.md` (lines 1–95)
  - `typescript/agents/a2ui_agent/src/processor/catalog-providers.ts` (lines 1–95)
  - `typescript/core/web_core/src/catalog/types.ts` (`Catalog.toJson()`, `Catalog.validationSchema`)

### Steps to Reproduce / Evidence
1. Inspect `typescript/agents/a2ui_agent/README.md`.
2. Notice that the only documented catalog configuration is `CatalogConfig.fromPath('path/to/catalog.json')`, which relies on Node `fs` (`FileSystemCatalogProvider`) and fails in browser/edge environments or when components are authored in TypeScript with Zod (`ComponentApi`).

### Expected Behavior
`typescript/agents/a2ui_agent/README.md` should show how to pass an `@a2ui/web_core` `Catalog` instance (or its `catalog.toJson()` document) into `InMemoryCatalogProvider` / `PromptGenerator` / `SkillGenerator` without requiring a static `catalog.json` file on disk.

### Actual Behavior
Developers authoring custom component catalogs in TypeScript with `@a2ui/web_core` have no documented path for feeding those catalogs into `@a2ui/agent`'s prompt or skill generators.

### Suggested Fix
Document `catalog.toJson()` and `InMemoryCatalogProvider` in `typescript/agents/a2ui_agent/README.md` alongside `CatalogConfig.fromPath(...)`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-03] [v1.0][docs] Document .agents/AGENTS.md and .agents/skills/ workspace layout conventions for A2UI skill packages
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][docs] Document .agents/AGENTS.md and .agents/skills/ workspace layout conventions for A2UI skill packages`

<!-- ISSUE_BODY_START -->
### Summary
`blueprints/features/skill_generator.blueprint.md` defines specific target directory conventions for deploying compiled A2UI skills into managed agent workspaces (`.agents/AGENTS.md`, `.agents/skills/a2ui-core/SKILL.md`, `.agents/skills/a2ui-<catalog>/SKILL.md`, and `.agents/skills/a2ui/SKILL.md`), as well as scoped directory-wiping semantics in `SkillSet.export_to_directory()`. None of these conventions are documented in `docs/public/`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `blueprints/features/skill_generator.blueprint.md` (lines 150–265)
  - `python/a2ui_agent/src/a2ui/skill/skill.py` (lines 129–174)
  - `docs/public/guides/agent-development.md`

### Steps to Reproduce / Evidence
1. Inspect `python/a2ui_agent/src/a2ui/skill/skill.py` lines 129–174 (`SkillSet.export_to_directory`).
2. Compare with `docs/public/guides/agent-development.md`, which contains no mention of `.agents/skills/`, YAML frontmatter requirements (`name`, `description`, `metadata`), or how `a2ui-core` interacts with `a2ui-<catalog>` skills.

### Expected Behavior
Public documentation should specify the `.agents/skills/<skill-name>/SKILL.md` directory structure, frontmatter schema, and scoped cleanup behavior of `export_to_directory()`.

### Actual Behavior
The `.agents/skills/` layout and frontmatter contract exist only in internal blueprint and docstring comments.

### Suggested Fix
Add the `.agents/skills/` directory layout diagram and frontmatter specification from `blueprints/features/skill_generator.blueprint.md` to `docs/public/guides/agent-development.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-04] [v1.0][agent] @a2ui/agent TypeScript SDK is missing Skill, SkillSet, and SkillGenerator (all conformance/agent/skill.yaml cases skipped)
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][agent] @a2ui/agent TypeScript SDK is missing Skill, SkillSet, and SkillGenerator (all conformance/agent/skill.yaml cases skipped)`

<!-- ISSUE_BODY_START -->
### Summary
`blueprints/features/skill_generator.blueprint.md` requires all A2UI agent SDKs (`a2ui-python`, `a2ui-node`) to implement `Skill`, `SkillSet`, and `SkillGenerator` and pass `conformance/agent/skill.yaml`. While the TypeScript `@a2ui/agent` SDK implemented the `PromptGenerator` decomposition (`generateBaseRules`, `generateCatalogInstructions`, `generateExamples`), it completely omits `Skill`, `SkillSet`, and `SkillGenerator`. In `typescript/agents/a2ui_agent/tests/conformance/skill-conformance.test.ts`, `SKILL_ACTION_HANDLERS` is `{}` and all 4 skill conformance actions (`from_format`, `core_syntax`, `from_catalog`, `skill_set`) are hardcoded in `UNIMPLEMENTED_ACTIONS` in `tests/conformance/loader.ts`. Furthermore, `typescript/agents/a2ui_agent/KNOWN_GAPS.md` fails to list `agent/skill.yaml` among the unimplemented blueprint suites.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/agent@0.0.1`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/src/index.ts` (lines 1–131 — no `Skill`, `SkillSet`, or `SkillGenerator` exports)
  - `typescript/agents/a2ui_agent/tests/conformance/skill-conformance.test.ts` (line 22: `const SKILL_ACTION_HANDLERS = {};`)
  - `typescript/agents/a2ui_agent/tests/conformance/loader.ts` (lines 109–114: `UNIMPLEMENTED_ACTIONS`)
  - `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (lines 37–43)

### Steps to Reproduce / Evidence
1. Inspect `typescript/agents/a2ui_agent/tests/conformance/loader.ts` lines 109–114:
   ```ts
   const UNIMPLEMENTED_ACTIONS = new Map<string, string>([
     ['from_format', 'skill generation is not implemented'],
     ['core_syntax', 'skill generation is not implemented'],
     ['from_catalog', 'skill generation is not implemented'],
     ['skill_set', 'skill generation is not implemented'],
   ]);
   ```
2. Inspect `typescript/agents/a2ui_agent/tests/conformance/skill-conformance.test.ts` line 22:
   ```ts
   const SKILL_ACTION_HANDLERS: Record<string, (testCase: LoadedCase) => void | Promise<void>> = {};
   ```
3. Run the TypeScript conformance test suite for `skill.yaml`:
   ```bash
   cd typescript/agents/a2ui_agent && npx vitest run tests/conformance/skill-conformance.test.ts
   ```
   All 4 test cases in `conformance/agent/skill.yaml` are skipped (`4 skipped`).

### Expected Behavior
`@a2ui/agent` should export `Skill`, `SkillSet`, `SkillGenerator`, and `cleanCatalogName` from `src/skill/` (and re-export them from `src/index.ts`), and `tests/conformance/skill-conformance.test.ts` should execute and pass all cases in `conformance/agent/skill.yaml`.

### Actual Behavior
`Skill`, `SkillSet`, and `SkillGenerator` do not exist in `@a2ui/agent`, all `conformance/agent/skill.yaml` tests are skipped, and `KNOWN_GAPS.md` line 39 omits `agent/skill.yaml` when listing unimplemented blueprint conformance suites (`agent/builder/` and `agent/macros/`).

### Suggested Fix
1. Implement `src/skill/skill.ts` (`Skill`, `SkillSet`, `cleanCatalogName`) and `src/skill/generator.ts` (`SkillGenerator`) in `typescript/agents/a2ui_agent/src/skill/` matching `python/a2ui_agent/src/a2ui/skill/`.
2. Export `Skill`, `SkillSet`, and `SkillGenerator` from `typescript/agents/a2ui_agent/src/index.ts`.
3. Wire `from_format`, `core_syntax`, `from_catalog`, and `skill_set` in `tests/conformance/skill-conformance.test.ts` and remove them from `UNIMPLEMENTED_ACTIONS` in `tests/conformance/loader.ts`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-05] [v1.0][conformance] Contradiction between conformance/test_data/skills/express_base_rules.txt (root = Card(...)) and catalog_transformer.yaml pruning conformance
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][conformance] Contradiction between conformance/test_data/skills/express_base_rules.txt (root = Card(...)) and catalog_transformer.yaml pruning conformance`

<!-- ISSUE_BODY_START -->
### Summary
Requirement 1 of `blueprints/features/skill_generator.blueprint.md` mandates that `PromptGenerator.generate_base_rules()` must be **completely catalog-agnostic**, and `conformance/agent/catalog_transformer.yaml` (`test_express_snippet_omits_a_pruned_component`) asserts that when `Card` is pruned from a catalog, `"Card"` must not appear anywhere in the generated Express prompt. However, `python/a2ui_agent`'s `EXPRESS_RULES` and the skill conformance golden files (`conformance/test_data/skills/express_base_rules.txt`, `express_core.skill.md`, and `express_basic_monolithic.skill.md`) hardcode `root = Card(...)`, `DateTimeInput`, and `itemTemplate = Image($url)`. As a result, no SDK can simultaneously pass both `conformance/agent/skill.yaml` (`test_express_core_skill`) and `conformance/agent/catalog_transformer.yaml` (`test_express_snippet_omits_a_pruned_component`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `conformance/test_data/skills/express_base_rules.txt` (lines 27, 49, 60)
  - `conformance/test_data/skills/express_core.skill.md` (lines 32, 54, 65)
  - `conformance/test_data/skills/express_basic_monolithic.skill.md` (lines 32, 54, 65)
  - `python/a2ui_agent/src/a2ui/inference_formats/express/prompt_generator.py` (`EXPRESS_RULES`)
  - `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (lines 135–142)

### Steps to Reproduce / Evidence
1. Inspect `conformance/test_data/skills/express_base_rules.txt` lines 49 and 60:
   ```text
   49:     itemTemplate = Image($url)
   ...
   58: 15. Surface targeting: Output `surface(surfaceId)` to specify or target a user interface surface:
   59:     surface("dashboard-surface-1")
   60:     root = Card(...)
   ```
2. Compare with `typescript/agents/a2ui_agent/src/inference-formats/express/prompt-generator.ts` (which replaced `Card(...)` with `ComponentA(...)` to pass `test_express_snippet_omits_a_pruned_component` in `conformance/agent/catalog_transformer.yaml`) and `typescript/agents/a2ui_agent/KNOWN_GAPS.md` lines 139–140:
   > "The conformance suite contradicts itself: the skill golden `conformance/test_data/skills/express_base_rules.txt` still contains `Card(...)`, which the pruning conformance case `test_express_snippet_omits_a_pruned_component` forbids."

### Expected Behavior
`EXPRESS_RULES` in `python/a2ui_agent` and the golden files in `conformance/test_data/skills/` (`express_base_rules.txt`, `express_core.skill.md`, `express_basic_monolithic.skill.md`) should use catalog-agnostic placeholder component names (`ComponentA`, `ComponentB`, `ComponentC`) so both `conformance/agent/skill.yaml` and `conformance/agent/catalog_transformer.yaml` can pass together.

### Actual Behavior
`conformance/test_data/skills/express_base_rules.txt` and `python/a2ui_agent` hardcode basic-catalog component names (`Card`, `Image`, `DateTimeInput`) inside supposedly catalog-agnostic base rules.

### Suggested Fix
Update `EXPRESS_RULES` in `python/a2ui_agent/src/a2ui/inference_formats/express/prompt_generator.py` to match the catalog-agnostic rules in TypeScript (`typescript/agents/a2ui_agent/src/inference-formats/express/prompt-generator.ts`) and regenerate `conformance/test_data/skills/express_base_rules.txt`, `express_core.skill.md`, and `express_basic_monolithic.skill.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-06] [v1.0][web_core] @a2ui/web_core/catalogs/basic/v1 fails to export BASIC_COMPONENTS and BASIC_CATALOG_DOCUMENT_OPTIONS
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][web_core] @a2ui/web_core/catalogs/basic/v1 fails to export BASIC_COMPONENTS and BASIC_CATALOG_DOCUMENT_OPTIONS`

<!-- ISSUE_BODY_START -->
### Summary
In `@a2ui/web_core`, `typescript/core/web_core/src/catalogs/basic/v1/components/basic_components.ts` defines and exports `BASIC_COMPONENTS` (line 681) and `BASIC_CATALOG_DOCUMENT_OPTIONS` (line 705, which carries the full `instructions`, `schemaUri`, `title`, and `description` of the v1.0 Basic Catalog). However, neither `components/index.ts` nor `catalogs/basic/v1/index.ts` re-exports `BASIC_COMPONENTS` or `BASIC_CATALOG_DOCUMENT_OPTIONS` (whereas `BASIC_FUNCTIONS` and `BASIC_FUNCTION_APIS` *are* exported in `catalogs/basic/v1/index.ts` lines 19 and 50). Consequently, downstream consumers and custom catalogs extending the v1.0 Basic Catalog cannot import `BASIC_COMPONENTS` or `BASIC_CATALOG_DOCUMENT_OPTIONS` from `@a2ui/web_core/v1_0` or `@a2ui/web_core/catalogs/basic/v1`, leading `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (lines 92–97) to report that `BASIC_COMPONENTS` and its `instructions` are missing programmatically.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/catalogs/basic/v1/components/basic_components.ts` (lines 681–714)
  - `typescript/core/web_core/src/catalogs/basic/v1/components/index.ts` (lines 1–60)
  - `typescript/core/web_core/src/catalogs/basic/v1/index.ts` (lines 17–54)
  - `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (lines 92–97)

### Steps to Reproduce / Evidence
1. Run Node against `@a2ui/web_core/v1_0`:
   ```js
   import * as v1 from '@a2ui/web_core/v1_0';
   console.log('BASIC_FUNCTIONS:', Array.isArray(v1.BASIC_FUNCTIONS)); // true
   console.log('BASIC_COMPONENTS:', v1.BASIC_COMPONENTS); // undefined
   console.log('BASIC_CATALOG_DOCUMENT_OPTIONS:', v1.BASIC_CATALOG_DOCUMENT_OPTIONS); // undefined
   ```
2. Observe that `BASIC_FUNCTIONS` is exported, but `BASIC_COMPONENTS` and `BASIC_CATALOG_DOCUMENT_OPTIONS` are `undefined` because `typescript/core/web_core/src/catalogs/basic/v1/components/index.ts` exports individual `TextApi`, `ImageApi`, etc. without re-exporting `BASIC_COMPONENTS` or `BASIC_CATALOG_DOCUMENT_OPTIONS`.

### Expected Behavior
`@a2ui/web_core/catalogs/basic/v1` (and `@a2ui/web_core/v1_0`) should export `BASIC_COMPONENTS` and `BASIC_CATALOG_DOCUMENT_OPTIONS` alongside `BASIC_FUNCTIONS` and `BASIC_FUNCTION_APIS` so developers extending the v1.0 Basic Catalog can preserve its component schemas and `instructions` metadata.

### Actual Behavior
`BASIC_COMPONENTS` and `BASIC_CATALOG_DOCUMENT_OPTIONS` are trapped inside an unexported internal module (`components/basic_components.js`).

### Suggested Fix
Re-export `BASIC_COMPONENTS` and `BASIC_CATALOG_DOCUMENT_OPTIONS` from `typescript/core/web_core/src/catalogs/basic/v1/components/index.ts` and `typescript/core/web_core/src/catalogs/basic/v1/index.ts`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-07] [v1.0][skill] Heading mismatch (### Examples: vs ## Examples) in SkillGenerator and zero direct_json test cases in conformance/agent/skill.yaml
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][skill] Heading mismatch (### Examples: vs ## Examples) in SkillGenerator and zero direct_json test cases in conformance/agent/skill.yaml`

<!-- ISSUE_BODY_START -->
### Summary
In `python/a2ui_agent/src/a2ui/skill/generator.py` (lines 71 and 130) and `blueprints/features/skill_generator.blueprint.md` (line 99), `SkillGenerator` appends examples using the heading `### Examples:\n\n{examples}` whenever `prompt_generator.generate_examples(catalog)` returns a non-empty string. However, in the `express` conformance goldens (`conformance/test_data/skills/express_basic_catalog.skill.md` line 193 and `express_basic_monolithic.skill.md` line 253), the heading is `## Examples` because `ExpressPromptGenerator.generate_examples()` returns `""` (embedding `## Examples` inside `catalog.instructions` during `generate_catalog_instructions()`), whereas `DirectJsonPromptGenerator.generate_examples()` returns a non-empty string that triggers `### Examples:`. Moreover, `conformance/agent/skill.yaml` has 4 test cases for `format: express` and **zero** test cases for `format: direct_json`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `python/a2ui_agent/src/a2ui/skill/generator.py` (lines 70–71, 129–130)
  - `conformance/agent/skill.yaml` (lines 17–51)
  - `conformance/test_data/skills/express_basic_catalog.skill.md` (line 193)
  - `conformance/test_data/skills/express_basic_monolithic.skill.md` (line 253)

### Steps to Reproduce / Evidence
1. Inspect `python/a2ui_agent/src/a2ui/skill/generator.py` lines 70–71 and 129–130:
   ```python
   if ex_blocks:
       body_parts.append("### Examples:\n\n" + "\n\n".join(ex_blocks))
   ```
   and:
   ```python
   if examples:
       cat_body += f"\n\n### Examples:\n\n{examples}"
   ```
2. Inspect `conformance/test_data/skills/express_basic_catalog.skill.md` line 193:
   ```markdown
   ## Examples

   Example 1: Dynamic text form
   ```
3. Inspect `conformance/agent/skill.yaml` lines 17–51: every single test case uses `format: express`; `format: direct_json` is never tested.

### Expected Behavior
1. `SkillGenerator` and `PromptGenerator` should use a consistent Markdown heading (`## Examples` or `### Examples:`) across both `express` and `direct_json` formats, and `ExpressPromptGenerator.generate_examples()` should return the catalog examples rather than hiding them inside `generate_catalog_instructions()` (so `generate_catalog_skill(..., include_examples=False)` in `generator.py:91` actually omits examples for `express`!).
2. `conformance/agent/skill.yaml` should include conformance test cases for `format: direct_json`.

### Actual Behavior
Calling `SkillGenerator(express_format).generate_catalog_skill(catalog, include_examples=False)` (`generator.py:91`) **still includes all examples** in the generated `SKILL.md` for `express` because `ExpressPromptGenerator` leaves `## Examples` inside `generate_catalog_instructions()` instead of `generate_examples()`, and `conformance/agent/skill.yaml` has zero test coverage for `direct_json`.

### Suggested Fix
1. Extract the `## Examples` section out of `generate_catalog_instructions()` into `generate_examples()` in `ExpressPromptGenerator` so `include_examples=False` works as documented.
2. Add `direct_json` conformance test cases (`test_direct_json_monolithic_skill`, `test_direct_json_core_skill`, `test_direct_json_catalog_skill`, `test_direct_json_skill_set`) to `conformance/agent/skill.yaml`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-04-08] [v1.0][skill] _clean_catalog_name(catalog) in python/a2ui_agent/src/a2ui/skill/skill.py ignores catalog.id and fails on URLs ending in /catalog.json without a vN segment
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Skill Generation`
- **Title**: `[v1.0][skill] _clean_catalog_name(catalog) in python/a2ui_agent/src/a2ui/skill/skill.py ignores catalog.id and fails on URLs ending in /catalog.json without a vN segment`

<!-- ISSUE_BODY_START -->
### Summary
In `blueprints/features/skill_generator.blueprint.md` (line 234), `clean_catalog_name(catalog)` is specified to check both `catalog.id` and `catalog.catalog_id`:
```python
raw_id = getattr(catalog, "id", getattr(catalog, "catalog_id", "basic"))
```
However, `_clean_catalog_name(catalog)` in `python/a2ui_agent/src/a2ui/skill/skill.py` (lines 27–40) only reads `getattr(catalog, "catalog_id", "basic")` and strips path segments ending in `.json` (`[p for p in raw_id.split("/") if p and not p.endswith(".json")]`). Furthermore, when given a canonical v1.0 catalog URI such as `"https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json"`, `parts[-1]` is `"basic"`, which happens to work only because `catalog.json` ends in `.json`; if a catalog ID is `"https://example.com/catalogs/travel/catalog"` or an object with `.id` instead of `.catalog_id`, `_clean_catalog_name` returns `"catalog"` or `"basic"` instead of `"travel"`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `python/a2ui_agent/src/a2ui/skill/skill.py` (lines 27–40)
  - `blueprints/features/skill_generator.blueprint.md` (lines 232–249)

### Steps to Reproduce / Evidence
1. Inspect `python/a2ui_agent/src/a2ui/skill/skill.py` lines 27–40:
   ```python
   def _clean_catalog_name(catalog: Any) -> str:
       """Derives a clean, LLM-friendly catalog name from a catalog ID or URL."""
       raw_id = getattr(catalog, "catalog_id", "basic")
       if not raw_id:
           return "basic"
       if "/" in raw_id or "\\" in raw_id:
           raw_id = raw_id.replace("\\", "/")
           parts = [p for p in raw_id.split("/") if p and not p.endswith(".json")]
           if parts:
               cand = parts[-1]
               if cand.startswith("v") and len(parts) > 1:
                   cand = parts[-2]
               raw_id = cand
       return raw_id.lower()
   ```
2. Run Python to test `_clean_catalog_name` with a catalog carrying `.id` or a non-alphanumeric slug:
   ```python
   from types import SimpleNamespace
   from a2ui.skill.skill import _clean_catalog_name

   print(_clean_catalog_name(SimpleNamespace(id="https://freshcart.app/catalogs/grocery/v1/catalog.json")))
   # Actual: "basic" (expected: "grocery")
   ```

### Expected Behavior
`_clean_catalog_name(catalog)` should check `getattr(catalog, "id", None) or getattr(catalog, "catalog_id", None) or "basic"`, ignore generic trailing `"catalog"` segments, and sanitize non-alphanumeric characters into lowercase hyphens as specified in `blueprints/features/skill_generator.blueprint.md`.

### Actual Behavior
Catalogs exposing `.id` (the property name used by `@a2ui/web_core`'s `Catalog` and required by `skill_generator.blueprint.md` line 234) fall back to `"basic"`, producing colliding `a2ui-basic/SKILL.md` filenames for custom catalogs.

### Suggested Fix
Update `_clean_catalog_name` in `python/a2ui_agent/src/a2ui/skill/skill.py` to check both `catalog.id` and `catalog.catalog_id`, filter out generic `"catalog"` path segments, and normalize non-alphanumeric characters to `-`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-05-01] [v1.0][web_core] PayloadValidator.validateComponent strips 'metadata' before validating metadata.extensions
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Protocol Extensions (metadata.extensions)`
- **Title**: `[v1.0][web_core] PayloadValidator.validateComponent strips 'metadata' before validating metadata.extensions`

<!-- ISSUE_BODY_START -->
### Summary
In `@a2ui/web_core` (both published `@a2ui/web_core@0.14.0` and `main` @ `e9dbcc3`), `PayloadValidator.validateComponent` intends to validate component-level `metadata` (`ComponentCommonSchema.shape.metadata`, including `metadata.extensions` UAX #31 identifier keys and `.strict()` property checks) inside `validateCommonEnvelopeFields()`.

However, `stripEnvelopeKeys(comp)` is called **before** `validateCommonEnvelopeFields()`, and `COMPONENT_ENVELOPE_KEYS` includes `'metadata'`. As a result, `'metadata'` is deleted from `properties` before `validateCommonEnvelopeFields()` executes, making the `'metadata' in properties` check 100% dead code. Consequently, components sent via `updateComponents` completely bypass `ComponentCommon.metadata` validation.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) and npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/validation/payload-validator.ts` (lines 34, 198, 216, and 256–267)
  - `typescript/core/web_core/src/v1_0/schema/agent-to-renderer.ts` (`UpdateComponentsMessageSchema` defines `components: z.array(z.record(z.string(), z.any()))`)

### Steps to Reproduce / Evidence
 In `typescript/core/web_core/src/validation/payload-validator.ts`:
```ts
// Line 34: 'metadata' is listed in COMPONENT_ENVELOPE_KEYS
const COMPONENT_ENVELOPE_KEYS = ['id', 'component', 'catalogId', 'metadata'] as const;

// Line 198 inside validateComponent(comp):
const properties = stripEnvelopeKeys(comp); // <-- deletes 'metadata' from `properties`!
...
// Line 216:
this.validateCommonEnvelopeFields(properties, knownKeys, componentType, id, componentCatalogId);

// Lines 256-267 inside validateCommonEnvelopeFields():
if ('metadata' in properties && !knownKeys?.has('metadata')) { // <-- ALWAYS FALSE (dead code)
  const metaVal = properties['metadata'];
  delete properties['metadata'];
  const metaResult = ComponentCommonSchema.shape.metadata.safeParse(metaVal);
  ...
}
```

Minimal standalone reproduction using `@a2ui/web_core`:
```mjs
import { PayloadValidator, STRICT_VALIDATION, basicCatalog } from '@a2ui/web_core/v1_0';

const validator = new PayloadValidator(basicCatalog, STRICT_VALIDATION);

// Should throw A2uiValidationError because:
// 1. `unrecognizedKey` violates ComponentCommon.metadata `additionalProperties: false`
// 2. `123-invalid.key!` violates UAX #31 identifier syntax in `metadata.extensions`
validator.validateComponent({
  id: 'root',
  component: 'Text',
  text: 'Hello world',
  metadata: {
    unrecognizedKey: true,
    extensions: {
      '123-invalid.key!': true,
    },
  },
});
console.log('No error thrown! Invalid component metadata bypassed validation.');
```

### Expected Behavior
`PayloadValidator.validateComponent` (and `MessageProcessor.processMessages` on `updateComponents`) should validate `comp.metadata` against `ComponentCommonSchema.shape.metadata` and throw `A2uiValidationError` when `metadata` contains unrecognized properties or when `metadata.extensions` contains keys violating UAX #31 identifier syntax (`^[\p{XID_Start}_][\p{XID_Continue}]*$`).

### Actual Behavior
`stripEnvelopeKeys(comp)` removes `metadata` before `validateCommonEnvelopeFields` runs, so `ComponentCommonSchema.shape.metadata.safeParse` is never executed. Any component sent via `updateComponents` with malformed `metadata` or invalid `metadata.extensions` keys is silently accepted and stored onto `ComponentModel.metadata`.

### Suggested Fix
Remove `'metadata'` from `COMPONENT_ENVELOPE_KEYS` in `typescript/core/web_core/src/validation/payload-validator.ts` (since `validateCommonEnvelopeFields` already deletes `properties['metadata']` after validating it when `!knownKeys?.has('metadata')`), or validate `comp['metadata']` directly in `validateComponent` before calling `stripEnvelopeKeys(comp)`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-05-02] [v1.0][web_core] Published @a2ui/web_core@0.14.0 v1_0 ExtensionsSchema accepts non-UAX #31 '-' and ':' characters in extension keys
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Protocol Extensions (metadata.extensions)`
- **Title**: `[v1.0][web_core] Published @a2ui/web_core@0.14.0 v1_0 ExtensionsSchema accepts non-UAX #31 '-' and ':' characters in extension keys`

<!-- ISSUE_BODY_START -->
### Summary
According to `specification/v1_0/json/common_types.json#/$defs/Extensions` (lines 40–47), keys inside `metadata.extensions` MUST be Unicode UAX #31 identifiers matching `^[\p{XID_Start}_][\p{XID_Continue}]*$`. Official conformance test cases in `specification/v1_0/test/cases/initial_state_validation.json` (lines 218–232) explicitly require keys with dashes (such as `"invalid-key-with-dashes"`) to be rejected.

In the published npm package `@a2ui/web_core@0.14.0`, `src/v1_0/schema/common-types.js` was generated with `/^[\p{XID_Start}_][\p{XID_Continue}:-]*$/u` (including `:-`), causing `CreateSurfaceMessageSchema`, `ActionMessageSchema`, and `V10.ExtensionsSchema` in `@a2ui/web_core@0.14.0` to accept invalid hyphenated and colon-separated extension keys.

### Affected Component / Files
- **Repository commit / npm package**: Published npm package `@a2ui/web_core@0.14.0` (`node_modules/@a2ui/web_core/src/v1_0/schema/common-types.js` lines 70–83; fixed on `main` in commit `f295cba` / PR #3329, not yet published to npm)
- **File path(s)**:
  - `typescript/core/web_core/src/v1_0/schema/common-types.ts` (line 107)
  - `typescript/core/web_core/src/v1_0/scripts/generate-schemas.mjs` (line 160)
  - `specification/v1_0/json/common_types.json` (lines 40–47)

### Steps to Reproduce / Evidence
Run with the latest published `@a2ui/web_core@0.14.0`:
```mjs
import { CreateSurfaceMessageSchema, ExtensionsSchema } from '@a2ui/web_core/v1_0';

// Conformance case from specification/v1_0/test/cases/initial_state_validation.json (line 218):
// "Invalid: createSurface with extension key violating UAX #31 identifier pattern"
const result = CreateSurfaceMessageSchema.safeParse({
  version: 'v1.0',
  createSurface: {
    surfaceId: 'test_surface',
    catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
    metadata: {
      extensions: {
        'invalid-key-with-dashes': true,
        'vendor:colon:key': 123,
      },
    },
  },
});

console.log('Accepted by @a2ui/web_core@0.14.0:', result.success); // prints `true` (should be `false`)
```

### Expected Behavior
`ExtensionsSchema` and `CreateSurfaceMessageSchema` in the published `@a2ui/web_core` npm package should enforce `/^[\p{XID_Start}_][\p{XID_Continue}]*$/u` and reject extension keys containing `-` or `:`.

### Actual Behavior
`@a2ui/web_core@0.14.0` on npm still contains `/^[\p{XID_Start}_][\p{XID_Continue}:-]*$/u` in `src/v1_0/schema/common-types.js`, accepting `-` and `:` in `metadata.extensions` keys and diverging from `specification/v1_0/json/common_types.json` and `src/types/common-types.js`.

### Suggested Fix
Publish a new release of `@a2ui/web_core` (`0.14.1` / `0.15.0`) to npm containing commit `f295cba` so npm consumers receive the UAX #31 regex fix in `src/v1_0/schema/common-types.js`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-05-03] [v1.0][web_core] SurfaceModel.dispatchAction silently drops metadata.extensions on outbound actions
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Protocol Extensions (metadata.extensions)`
- **Title**: `[v1.0][web_core] SurfaceModel.dispatchAction silently drops metadata.extensions on outbound actions`

<!-- ISSUE_BODY_START -->
### Summary
In A2UI v1.0, `specification/v1_0/json/renderer_to_agent.json` (lines 43–52) and `specification/v1_0/test/cases/renderer_messages.json` (lines 125–144) define optional `metadata.extensions` on the renderer-to-agent `action` message:
```json
"metadata": {
  "type": "object",
  "description": "Optional renderer-side metadata to send back to the agent with the action.",
  "properties": {
    "extensions": {
      "$ref": "common_types.json#/$defs/Extensions"
    }
  },
  "additionalProperties": false
}
```
However, `SurfaceModel.dispatchAction(payload, sourceComponentId)` in `typescript/core/web_core/src/state/surface-model.ts` (lines 249–290) only copies `name`, `surfaceId`, `sourceComponentId`, `timestamp`, `context`, `catalogId`, and `userMessage` into `actionToDispatch`, silently dropping any `metadata` (`{ extensions: { ... } }`) passed on `payload` or `payload.event`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) and npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/state/surface-model.ts` (lines 39–60 and 249–290)
  - `specification/v1_0/json/renderer_to_agent.json` (lines 43–52)

### Steps to Reproduce / Evidence
```mjs
import { MessageProcessor, basicCatalog } from '@a2ui/web_core/v1_0';

let receivedAction = null;
const processor = new MessageProcessor(
  [basicCatalog],
  (action) => {
    receivedAction = action;
  },
  { version: 'v1.0' }
);

processor.processMessages([
  {
    version: 'v1.0',
    createSurface: {
      surfaceId: 'main',
      catalogId: basicCatalog.id,
      components: [{ id: 'root', component: 'Text', text: 'Hello' }],
    },
  },
]);

const surface = processor.model.getSurface('main');
await surface.dispatchAction(
  {
    event: {
      name: 'submit',
      context: { foo: 'bar' },
      metadata: {
        extensions: {
          client_audit: { signature: 'abc123token' },
        },
      },
    },
    metadata: {
      extensions: {
        client_audit: { signature: 'abc123token' },
      },
    },
  },
  'root'
);

console.log('Dispatched action:', receivedAction);
// Actual output:
// {
//   name: 'submit',
//   surfaceId: 'main',
//   sourceComponentId: 'root',
//   timestamp: '...',
//   context: { foo: 'bar' }
// }
// `receivedAction.metadata` is `undefined`!
```

### Expected Behavior
`ActionPayload` (`surface-model.ts` line 40) should include `metadata?: { extensions?: Record<string, unknown> }`, and `SurfaceModel.dispatchAction` should preserve valid `metadata` (from `eventPayload.metadata ?? payload.metadata`) on `actionToDispatch` so renderer components and host applications can emit v1.0 `action.metadata.extensions` conforming to `renderer_to_agent.json`.

### Actual Behavior
`SurfaceModel.dispatchAction` ignores `metadata` on both `payload` and `payload.event`, making it impossible for components calling `context.dispatchAction(...)` to populate `action.metadata.extensions`.

### Suggested Fix
In `typescript/core/web_core/src/state/surface-model.ts` (around line 288):
```ts
const rawMetadata = eventPayload.metadata ?? payload.metadata;
if (rawMetadata && typeof rawMetadata === 'object' && !Array.isArray(rawMetadata)) {
  actionToDispatch.metadata = rawMetadata as Record<string, unknown>;
}
```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-05-04] [v1.0][web_core][react] ComponentNode and useNodeView omit component metadata.extensions from resolved nodes and toJSON()
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Protocol Extensions (metadata.extensions)`
- **Title**: `[v1.0][web_core][react] ComponentNode and useNodeView omit component metadata.extensions from resolved nodes and toJSON()`

<!-- ISSUE_BODY_START -->
### Summary
When `MessageProcessor.applyComponentUpdate` processes a v1.0 component carrying `metadata: { extensions: { ... } }`, it stores `metadata` on `ComponentModel.metadata` (`typescript/core/web_core/src/state/component-model.ts` line 45).

However, when `NodeResolver` builds the reactive `ComponentNode` tree (`typescript/core/web_core/src/resolution/component-node.ts` and `node-resolver.ts`):
1. `ComponentNode` (`MutableComponentNode`) has no `metadata` property or getter.
2. `ComponentNode.toJSON()` (lines 213–226 of `component-node.ts`) serializes `{ id, type, ...props }` and completely omits `metadata` (unlike `ComponentModel.componentTree`, which includes `...(this.metadata !== undefined ? {metadata: this.metadata} : {})`).
3. When `ComponentModel.metadata` is updated on an existing component (`existing.metadata = metadata; existing.properties = properties;` at `message-processor.ts` lines 1059–1060), if `properties` are shallow-equal (`setProps` in `component-node.ts` line 238), `node.props` does not emit and React views subscribed via `useNodeView` in `@a2ui/react` do not re-render on a metadata-only update.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) and npm packages `@a2ui/web_core@0.14.0`, `@a2ui/react@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/resolution/component-node.ts` (lines 50–119, 213–241)
  - `typescript/core/web_core/src/resolution/node-resolver.ts` (lines 380–450)
  - `typescript/renderers/react/src/node-view.tsx` (lines 207–266)

### Steps to Reproduce / Evidence
```mjs
import { MessageProcessor, NodeResolver, basicCatalog } from '@a2ui/web_core/v1_0';

const processor = new MessageProcessor([basicCatalog], undefined, { version: 'v1.0' });
processor.processMessages([
  {
    version: 'v1.0',
    createSurface: {
      surfaceId: 's1',
      catalogId: basicCatalog.id,
      components: [
        {
          id: 'root',
          component: 'Text',
          text: 'Hello',
          metadata: {
            extensions: {
              custom_theme: { variant: 'dark' },
            },
          },
        },
      ],
    },
  },
]);

const surface = processor.model.getSurface('s1');
const resolver = new NodeResolver(surface);
const rootNode = resolver.rootNode.peek();

console.log('ComponentModel.componentTree:', surface.componentsModel.get('root').componentTree);
// Includes: metadata: { extensions: { custom_theme: { variant: 'dark' } } }

console.log('ComponentNode.toJSON():', rootNode.toJSON());
// Actual output: { id: 'root', type: 'Text', text: 'Hello', variant: 'body' }
// `metadata` is completely missing from ComponentNode and rootNode.toJSON()!
```

### Expected Behavior
1. `ComponentNode` should expose `metadata` (or reactive `metadata` signal/property from `context?.componentModel.metadata`) and include `metadata` in `ComponentNode.toJSON()` when defined.
2. Updating a component's `metadata.extensions` via `updateComponents` should notify `NodeResolver` / `useNodeView` subscribers even when component schema properties (`text`, `variant`, etc.) are unchanged.

### Actual Behavior
`ComponentNode` omits `metadata` from its interface and `toJSON()`, and metadata-only `updateComponents` payloads do not trigger `node.props` updates when schema properties are unchanged.

### Suggested Fix
Expose `readonly metadata?: Record<string, unknown>` on `ComponentNode` (backed by `this.context?.componentModel.metadata`), include `metadata` in `MutableComponentNode.toJSON()` when defined, and include `metadata` in `NodeResolver`'s change detection when `ComponentModel.onUpdated` fires.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-05-05] [v1.0][docs] Document A2UI v1.0 Protocol Extensions (metadata.extensions) on createSurface, ComponentCommon, ComponentDefinition, and action
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Protocol Extensions (metadata.extensions)`
- **Title**: `[v1.0][docs] Document A2UI v1.0 Protocol Extensions (metadata.extensions) on createSurface, ComponentCommon, ComponentDefinition, and action`

<!-- ISSUE_BODY_START -->
### Summary
A2UI v1.0 introduced protocol-wide vendor/official extensibility via `common_types.json#/$defs/Extensions` (`metadata.extensions`) across four schema locations:
1. `createSurface.metadata.extensions` (`agent_to_renderer.json#/$defs/CreateSurfaceMessage`)
2. `ComponentCommon.metadata.extensions` (`common_types.json#/$defs/ComponentCommon`)
3. `action.metadata.extensions` (`renderer_to_agent.json#/properties/action/properties/metadata`)
4. `ComponentDefinition.metadata.extensions` (`catalog_definition.json#/$defs/ComponentDefinition`)

However, the public documentation website source (`docs/public/`) has **zero mentions** of `metadata.extensions`. Searching `docs/public/` for `metadata` or `extensions` only returns v0.8/v0.9 A2A transport documentation (`a2uiClientDataModel`, `a2uiClientCapabilities`, and `X-A2A-Extensions`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/concepts/actions.md`
  - `docs/public/concepts/catalogs.md`
  - `docs/public/concepts/components.md`
  - `specification/v1_0/docs/a2ui_protocol.md`

### Steps to Reproduce / Evidence
Searching the entire `docs/public/` directory for `metadata.extensions` or `common_types.json#/$defs/Extensions`:
```bash
grep -rn "metadata\.extensions" docs/public/ specification/v1_0/docs/a2ui_protocol.md
```
- `docs/public/` returns **0 matches**.
- `specification/v1_0/docs/a2ui_protocol.md` only mentions `metadata` once in the `createSurface` property list (line 189: `- metadata (object, optional): Surface-level metadata containing an optional extensions map (common_types.json#/$defs/Extensions).`), with no JSON example and no mention of component-level `ComponentCommon.metadata.extensions` or action-level `action.metadata.extensions`.

### Expected Behavior
`docs/public/` and `specification/v1_0/docs/a2ui_protocol.md` should include a dedicated section or guide explaining:
1. All 4 places where `metadata.extensions` can be attached (`createSurface`, `ComponentCommon`, `action`, `ComponentDefinition`).
2. Concrete JSON examples for surface-level, component-level, and outbound action extensions.
3. The reserved `a2ui_` prefix for official extensions vs vendor-prefixed keys (e.g., `acme_theme`, `acme_telemetry`).

### Actual Behavior
External developers reading `docs/public/` or `a2ui_protocol.md` cannot discover how to attach vendor metadata to components or actions without manually reading raw JSON Schema `$defs` in `specification/v1_0/json/`.

### Suggested Fix
Add a **"Protocol Extensions (`metadata.extensions`)"** section to `specification/v1_0/docs/a2ui_protocol.md` and `docs/public/concepts/` showing surface-level, component-level, catalog-level, and outbound action `metadata.extensions` payloads.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-05-06] [v1.0][docs] Document UAX #31 identifier syntax requirement for metadata.extensions keys (no dots, hyphens, or colons)
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Protocol Extensions (metadata.extensions)`
- **Title**: `[v1.0][docs] Document UAX #31 identifier syntax requirement for metadata.extensions keys (no dots, hyphens, or colons)`

<!-- ISSUE_BODY_START -->
### Summary
In JSON APIs (such as OpenAPI `x-*`, CloudEvents, or MCP), extension keys conventionally use hyphens (`x-custom-ext`), colons (`vendor:feature`), or reverse-DNS dots (`com.example.theme`).

In A2UI v1.0, `specification/v1_0/json/common_types.json#/$defs/Extensions` (lines 40–47) strictly restricts `metadata.extensions` keys to **Unicode UAX #31 identifiers** (`^[\p{XID_Start}_][\p{XID_Continue}]*$`), meaning dots (`.`), hyphens (`-`), and colons (`:`) are **rejected** by schema validation. However, neither `specification/v1_0/docs/a2ui_protocol.md` nor `docs/public/` explains this constraint or provides valid naming examples.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `specification/v1_0/docs/a2ui_protocol.md` (line 189)
  - `specification/v1_0/docs/evolution_guide.md` (lines 14, 76, 85)
  - `specification/v1_0/json/common_types.json` (lines 40–47)

### Steps to Reproduce / Evidence
1. In `specification/v1_0/docs/a2ui_protocol.md` (line 189), `metadata` is described only as:
   > `- metadata (object, optional): Surface-level metadata containing an optional extensions map (common_types.json#/$defs/Extensions).`
2. If a developer writes a natural reverse-DNS or kebab-case extension key:
   ```json
   {
     "version": "v1.0",
     "createSurface": {
       "surfaceId": "main",
       "metadata": {
         "extensions": {
           "acme.theme": { "palette": "dark" },
           "acme-telemetry": { "sessionId": "123" }
         }
       }
     }
   }
   ```
   Validation fails because `.` and `-` are not valid UAX #31 identifier characters (`specification/v1_0/test/cases/initial_state_validation.json` lines 218–232 and `renderer_messages.json` lines 146–163).

### Expected Behavior
`specification/v1_0/docs/a2ui_protocol.md` should explicitly call out the UAX #31 identifier syntax rule for `metadata.extensions` keys, showing both valid examples (`acme_theme`, `_internal_tag`) and invalid examples (`acme.theme`, `acme-theme`, `acme:theme`, `123_tag`), and noting that `a2ui_*` is reserved for official protocol extensions.

### Actual Behavior
The UAX #31 restriction on extension keys is only discoverable by inspecting `common_types.json` or test failure messages.

### Suggested Fix
Update `specification/v1_0/docs/a2ui_protocol.md` under `createSurface`, `updateComponents`, and `action` to document the UAX #31 key rule (`^[\p{XID_Start}_][\p{XID_Continue}]*$`) and the reserved `a2ui_` prefix with valid/invalid key examples.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-05-07] [v1.0][docs] Provide migration example for replacing v0.9 createSurface.theme with v1.0 createSurface.metadata.extensions
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Protocol Extensions (metadata.extensions)`
- **Title**: `[v1.0][docs] Provide migration example for replacing v0.9 createSurface.theme with v1.0 createSurface.metadata.extensions`

<!-- ISSUE_BODY_START -->
### Summary
In A2UI v0.9, `createSurface` accepted a top-level `theme` object (e.g., `primaryColor`, `agentDisplayName`, `iconUrl`). In A2UI v1.0, `createSurface` uses `"additionalProperties": false` and removed `theme` from `agent_to_renderer.json#/$defs/CreateSurfaceMessage`.

`specification/v1_0/docs/evolution_guide.md` (lines 73 and 139) tells developers:
> *"Remove the `theme` field from `createSurface` messages. You can pass initial `components`, `dataModel`, and optional `metadata.extensions` directly in the `createSurface` payload"*

However, there is no before/after migration snippet in `evolution_guide.md` or `docs/public/guides/theming.md` showing how to migrate a v0.9 `createSurface.theme` payload into v1.0 `createSurface.metadata.extensions` or how a renderer reads it.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `specification/v1_0/docs/evolution_guide.md` (lines 73, 139)
  - `docs/public/guides/theming.md`

### Steps to Reproduce / Evidence
1. Inspect `specification/v1_0/docs/evolution_guide.md` lines 73 & 139: no JSON example is provided for `metadata.extensions`.
2. Furthermore, in `@a2ui/web_core`'s `V1Point0Adapter` (`typescript/core/web_core/src/processing/adapters/v1_0.ts` line 44), `extractOperationsFromObject` still reads `theme: cs?.theme`, even though `AgentToRendererMessageSchema` (`CreateSurfaceMessageSchema`) is `.strict()` and rejects `createSurface.theme` at validation time!

### Expected Behavior
`specification/v1_0/docs/evolution_guide.md` and `docs/public/guides/theming.md` should provide a clear before/after JSON comparison showing how v0.9 `createSurface.theme` is replaced by `createSurface.metadata.extensions` (e.g., `metadata: { extensions: { vendor_theme: { ... } } }`) in v1.0.

### Actual Behavior
Developers migrating from v0.9 to v1.0 encounter strict schema rejection on `createSurface.theme` without a concrete example of the v1.0 `metadata.extensions` replacement pattern.

### Suggested Fix
Add a before/after JSON example to `specification/v1_0/docs/evolution_guide.md` (Section 3, Migration Checklist) and update `docs/public/guides/theming.md` for v1.0.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-05-08] [v1.0][docs][react] Document how custom components in @a2ui/react and @a2ui/web_core access surface and component metadata.extensions
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Protocol Extensions (metadata.extensions)`
- **Title**: `[v1.0][docs][react] Document how custom components in @a2ui/react and @a2ui/web_core access surface and component metadata.extensions`

<!-- ISSUE_BODY_START -->
### Summary
When a developer authors a custom component in `@a2ui/react` or `@a2ui/web_core`, component envelope keys (`id`, `component`, `catalogId`, `metadata`) are stripped from the component's resolved `props` by `stripEnvelopeKeys()`.

Neither `typescript/renderers/react/README.md`, `typescript/core/web_core/README.md`, nor `docs/public/guides/` documents where `createSurface.metadata.extensions` and `ComponentCommon.metadata.extensions` are stored at runtime or how a custom component view can read them.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `typescript/renderers/react/README.md`
  - `typescript/core/web_core/README.md`
  - `typescript/core/web_core/src/resolution/component-context.ts` (lines 30–83)

### Steps to Reproduce / Evidence
In `@a2ui/react`, a custom component receives `{ props, context, buildChild }`:
- `props` does **not** contain `metadata` (it is stripped as an envelope key).
- `ComponentContext` (`typescript/core/web_core/src/resolution/component-context.ts`) exposes `componentModel`, `dataContext`, `surfaceComponents`, and `theme`, but does not have a direct `metadata` or `extensions` getter.
- To read component-level extensions, a developer must discover by reading source code that they need `context.componentModel.metadata?.extensions`.
- To read surface-level extensions, a developer must traverse `context.dataContext.surface.metadata?.extensions`.

### Expected Behavior
1. Document `context.componentModel.metadata?.extensions` (component-level) and `context.dataContext.surface.metadata?.extensions` (surface-level) in `@a2ui/react` and `@a2ui/web_core` READMEs/guides.
2. Optionally provide convenience getters on `ComponentContext` (e.g., `context.componentMetadata` and `context.surfaceMetadata`).

### Actual Behavior
There is zero documentation in `@a2ui/react` or `@a2ui/web_core` on how component implementations access `metadata.extensions` after envelope stripping.

### Suggested Fix
Document how to read surface-level and component-level `metadata.extensions` via `ComponentContext` in `typescript/core/web_core/README.md` and `typescript/renderers/react/README.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-06-01] [v1.0][docs] A2UI Express has no guide or reference page on a2ui.org (docs/public/) and the glossary links to the wrong GitHub org (a2ui-project/a2ui)
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Express DSL`
- **Title**: `[v1.0][docs] A2UI Express has no guide or reference page on a2ui.org (docs/public/) and the glossary links to the wrong GitHub org (a2ui-project/a2ui)`

<!-- ISSUE_BODY_START -->
### Summary
Although **A2UI Express** (`<a2ui>...</a2ui>`) is the default inference format in `A2uiGenerator` / `A2uiRequestProcessor` on `main` (`typescript/agents/a2ui_agent/src/processor/generator.ts`), there is no guide, tutorial, or specification page for A2UI Express anywhere on the public documentation site (`docs/public/`).

Furthermore, the only mention of Express across the entire `docs/public/` directory is a single glossary entry (`docs/public/concepts/glossary.md`), and its hyperlink points to a non-existent/wrong GitHub organization (`https://github.com/a2ui-project/a2ui/...`) instead of `https://github.com/google/A2UI/...`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/concepts/glossary.md` (lines 211–221)
  - `specification/proposals/express/a2ui_express.md`
  - `specification/proposals/express/express_dsl_examples.md`

### Steps to Reproduce / Evidence
1. Search `docs/public/` for `express`:
   ```bash
   grep -rn -i "express" docs/public/
   ```
   Output:
   ```text
   docs/public/concepts/glossary.md:211:The format of the structured UI blocks in model-to-agent messages, for example JSON, [Express DSL syntax](https://github.com/a2ui-project/a2ui/tree/main/python/a2ui_agent/src/a2ui/inference_formats/express), or Elemental HTML tags.
   docs/public/concepts/glossary.md:221:* **[A2UI Express](https://github.com/a2ui-project/a2ui/tree/main/python/a2ui_agent/src/a2ui/inference_formats/express)**: A concise DSL format for A2UI messages that reduces token usage compared to full JSON.
   ```
2. Click the `[A2UI Express]` link in `docs/public/concepts/glossary.md` — it points to `github.com/a2ui-project/a2ui` instead of `github.com/google/A2UI` and links to raw Python source files rather than the normative specification (`specification/proposals/express/a2ui_express.md`).

### Expected Behavior
1. `docs/public/` should include a dedicated A2UI Express specification/guide page (publishing or linking `specification/proposals/express/a2ui_express.md` and `express_dsl_examples.md`) and document how to use `ExpressFormatFactory` in `@a2ui/agent`.
2. `docs/public/concepts/glossary.md` (lines 211 and 221) should link to the canonical `google/A2UI` specification or public documentation page instead of `https://github.com/a2ui-project/a2ui/...`.

### Actual Behavior
External developers browsing `a2ui.org` (`docs/public/`) cannot find any syntax reference or usage guide for A2UI Express, and clicking the glossary link takes them to `github.com/a2ui-project/a2ui`.

### Suggested Fix
- Publish `specification/proposals/express/a2ui_express.md` and `specification/proposals/express/express_dsl_examples.md` under `docs/public/` (e.g., `docs/public/specification/v1.0-express.md` or `docs/public/guides/express-dsl.md`) and add it to `mkdocs.yml`.
- Update the two links in `docs/public/concepts/glossary.md` (lines 211 and 221) to point to the public docs page or `https://github.com/google/A2UI/blob/main/specification/proposals/express/a2ui_express.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-06-02] [v1.0][agent] Published @a2ui/agent@0.0.1 on npm defaults to DirectJsonFormatFactory and is missing APIs documented in typescript/agents/a2ui_agent/README.md
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Express DSL`
- **Title**: `[v1.0][agent] Published @a2ui/agent@0.0.1 on npm defaults to DirectJsonFormatFactory and is missing APIs documented in typescript/agents/a2ui_agent/README.md`

<!-- ISSUE_BODY_START -->
### Summary
There is a breaking mismatch between `typescript/agents/a2ui_agent/README.md` on `main` and the published `@a2ui/agent@0.0.1` package on npm:
1. **Default Inference Format Drift**: On `main` (changed in commit `0968640`), `A2uiGenerator` (`src/processor/generator.ts`) defaults `formatFactory` to `new ExpressFormatFactory()`. However, in published `@a2ui/agent@0.0.1` (`dist/src/processor.js:35`), `A2uiRequestProcessor` defaults `formatFactory` to `new DirectJsonFormatFactory()`. Developers installing `@a2ui/agent@0.0.1` from npm and omitting `formatFactory` silently get Direct JSON (`<a2ui-json>`) instead of Express (`<a2ui>`).
2. **Unpublished APIs in README**: `typescript/agents/a2ui_agent/README.md` documents `RendererState`, `validatePayload`, `processor.openStream()`, and `processor.parseResponse(llmReply, { state })`, which were added in commits `a2be118` and `c4e0e06` after `@a2ui/agent@0.0.1` was published to npm without publishing a `0.0.2` release.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) vs. npm package `@a2ui/agent@0.0.1`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/README.md` (lines 1–180)
  - `typescript/agents/a2ui_agent/package.json` (`"version": "0.0.1"`)
  - `typescript/agents/a2ui_agent/src/processor/generator.ts`

### Steps to Reproduce / Evidence
```bash
npm pack @a2ui/agent@0.0.1
tar -xzf a2ui-agent-0.0.1.tgz
grep -n "DirectJsonFormatFactory" package/dist/src/processor.js
grep -rn "RendererState\|validatePayload\|openStream" package/dist/
```
- `package/dist/src/processor.js:35` shows:
  ```js
  this.formatFactory = options.formatFactory ?? new DirectJsonFormatFactory();
  ```
- Searching `package/dist/` for `RendererState`, `validatePayload`, or `openStream` returns 0 matches in `@a2ui/agent@0.0.1`.

### Expected Behavior
The published npm package `@a2ui/agent` should match the API and default inference format (`ExpressFormatFactory`) documented in `typescript/agents/a2ui_agent/README.md`.

### Actual Behavior
Developers installing `@a2ui/agent@0.0.1` from npm encounter missing exports (`RendererState`, `validatePayload`, `openStream`) and silently receive `DirectJsonFormatFactory` instead of `ExpressFormatFactory` when following the README.

### Suggested Fix
- Bump `typescript/agents/a2ui_agent/package.json` to `0.0.2` (or `0.1.0`) and publish a new release of `@a2ui/agent` to npm from `main`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-06-03] [v1.0][spec] Contradictions between a2ui_express.md specification and Express.g4 grammar (UAX #31 identifiers, surfaceParams, statement separators)
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Express DSL`
- **Title**: `[v1.0][spec] Contradictions between a2ui_express.md specification and Express.g4 grammar (UAX #31 identifiers, surfaceParams, statement separators)`

<!-- ISSUE_BODY_START -->
### Summary
The A2UI Express specification (`specification/proposals/express/a2ui_express.md`) contradicts the formal ANTLR4 grammar (`specification/inference_formats/express/Express.g4`) and the A2UI v1.0 JSON schema (`specification/v1_0/json/agent_to_renderer.json`) in three places:

1. **Unicode UAX #31 vs. ASCII-Only Identifiers**:
   - `a2ui_express.md` (lines 36–45) mandates that variable identifiers conform to Unicode UAX #31 (`[\p{L}_][\p{L}\p{N}_]*`) to support multilingual models (e.g., `título = Text("Hola")`).
   - However, `Express.g4` (line 163) defines `IDENTIFIER : [a-zA-Z_] [a-zA-Z0-9_]* ;`, and `typescript/agents/a2ui_agent/src/inference-formats/express/identifier.ts` enforces `/^[a-zA-Z_][a-zA-Z0-9_]*$/`, rejecting any non-ASCII variable name with a syntax error.
2. **Non-Existent `surfaceParams: {}` in `createSurface` Example**:
   - `a2ui_express.md` (line 293) states that `surface("main")` compiles into a `createSurface` payload containing `"surfaceParams": {}`.
   - In `specification/v1_0/json/agent_to_renderer.json`, `CreateSurfaceMessage` has `additionalProperties: false` and no `surfaceParams` field; any envelope containing `"surfaceParams": {}` fails v1.0 schema validation.
3. **Statement Separators**:
   - `a2ui_express.md` states that Express statements are newline-separated, whereas `Express.g4` skips both newlines (`WS`) and semicolons (`SEMICOLON : ';' -> skip ;`) at the lexer level.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `specification/proposals/express/a2ui_express.md` (lines 36–45, 293)
  - `specification/inference_formats/express/Express.g4` (line 163)
  - `typescript/agents/a2ui_agent/src/inference-formats/express/identifier.ts`

### Steps to Reproduce / Evidence
```ts
import { ExpressParser } from '@a2ui/agent';
import { basicCatalog } from '@a2ui/web_core/v1_0';

const parser = new ExpressParser(basicCatalog, 'main', 'v1.0');
// Throws ExpressSyntaxError despite a2ui_express.md lines 36-45 stating UAX #31 Unicode identifiers are supported:
parser.parseResponse('<a2ui>\nsurface("main")\nroot = Text("Hola")\ntítulo = Text("Sub")\n</a2ui>');
```

### Expected Behavior
`specification/proposals/express/a2ui_express.md`, `specification/inference_formats/express/Express.g4`, and `identifier.ts` should agree on whether identifiers are ASCII-only (`[a-zA-Z_][a-zA-Z0-9_]*`) or Unicode UAX #31, and `a2ui_express.md` line 293 should not include the invalid `"surfaceParams": {}` key.

### Actual Behavior
Multilingual variable names allowed by `a2ui_express.md` fail ANTLR lexing in `Express.g4`, and the `createSurface` JSON example in `a2ui_express.md` (line 293) is invalid under `agent_to_renderer.json`.

### Suggested Fix
- Remove `"surfaceParams": {}` from `specification/proposals/express/a2ui_express.md` (line 293).
- Either update `Express.g4` (`IDENTIFIER`) and `identifier.ts` to support Unicode UAX #31 letters, or update `a2ui_express.md` (lines 36–45) to document that Express variable identifiers are ASCII (`[a-zA-Z_][a-zA-Z0-9_]*`) while arbitrary component IDs use `id="..."`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-06-04] [v1.0][spec][agent] a2ui_express.md advertises line-by-line progressive streaming, but ExpressFormat.supportsStreaming is hardcoded to false
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Express DSL`
- **Title**: `[v1.0][spec][agent] a2ui_express.md advertises line-by-line progressive streaming, but ExpressFormat.supportsStreaming is hardcoded to false`

<!-- ISSUE_BODY_START -->
### Summary
In `specification/proposals/express/a2ui_express.md` (line 11), one of the primary design goals touted for A2UI Express is:
> *"Streaming compatibility. The line-oriented grammar allows the client host to parse and build the component hierarchy line-by-line, enabling progressive rendering of the interface before the model finishes its output."*

However, in `@a2ui/agent`, `ExpressFormat.supportsStreaming` is hardcoded to `false` (`typescript/agents/a2ui_agent/src/inference-formats/express/format.ts:40`), `typescript/agents/a2ui_agent/KNOWN_GAPS.md:11` explicitly states *"Express does not stream"*, and calling `processor.openStream()` when configured with `ExpressFormatFactory` throws an error.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `specification/proposals/express/a2ui_express.md` (line 11)
  - `typescript/agents/a2ui_agent/src/inference-formats/express/format.ts` (line 40)
  - `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (line 11)

### Steps to Reproduce / Evidence
```ts
import { A2uiGenerator, ExpressFormatFactory, InMemoryCatalogProvider } from '@a2ui/agent';
import { basicCatalog } from '@a2ui/web_core/v1_0';

const generator = new A2uiGenerator({
  catalogProvider: new InMemoryCatalogProvider([basicCatalog]),
  formatFactory: new ExpressFormatFactory(),
});
const processor = generator.createProcessor();
// Throws because ExpressFormat.supportsStreaming === false:
processor.openStream();
```

### Expected Behavior
`specification/proposals/express/a2ui_express.md` and `typescript/agents/a2ui_agent/README.md` should clearly document that `ExpressFormat` currently operates in buffered whole-block mode (`supportsStreaming = false`, whereas `DirectJsonFormat` supports incremental streaming via `openStream()`), or `ExpressFormat` should implement incremental statement streaming.

### Actual Behavior
Developers choosing A2UI Express based on the streaming pitch in `a2ui_express.md` discover at runtime that `processor.openStream()` is unsupported for Express.

### Suggested Fix
- Document in `specification/proposals/express/a2ui_express.md` and `typescript/agents/a2ui_agent/README.md` that `ExpressFormat` currently requires full `<a2ui>...</a2ui>` block completion (`supportsStreaming = false`), and recommend `DirectJsonFormatFactory` when incremental token-by-token streaming via `openStream()` is required.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-06-05] [v1.0][agent] ExpressDecompiler throws ExpressInvalidIdentifierError on hyphenated component IDs instead of emitting id="..." per spec
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Express DSL`
- **Title**: `[v1.0][agent] ExpressDecompiler throws ExpressInvalidIdentifierError on hyphenated component IDs instead of emitting id="..." per spec`

<!-- ISSUE_BODY_START -->
### Summary
`specification/proposals/express/a2ui_express.md` (lines 47–54) explicitly specifies how non-identifier component IDs (such as `"content-grid"`, which contains a hyphen `-`) work in both compilation and decompilation:
> *"To produce an A2UI component `"id"` that contains characters like hyphens, assign the component to a valid Express variable name (such as `grid`), reference that variable in parent child lists, and pass the target A2UI ID via the reserved `id=` keyword argument: `grid = Row([left, right], id="content-grid")` ... When the decompiler encounters a component ID like `"content-grid"`, it derives a valid variable name (`content_grid`) and emits `id="content-grid"`."*

While Python's `decompiler.py` (`_assign_variable_names`) implements this variable derivation and `id="..."` emission, TypeScript's `ExpressDecompiler.formatComponent` (`typescript/agents/a2ui_agent/src/inference-formats/express/decompiler.ts:697-699`) never implemented variable derivation and instead immediately throws `ExpressInvalidIdentifierError(compId)`. As a result, a valid Express program using `id="content-grid"` compiles cleanly via `ExpressCompiler`, but crashes `ExpressDecompiler` when decompiling the resulting A2UI v1.0 message!

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/agent@0.0.1`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/src/inference-formats/express/decompiler.ts` (lines 689–699)
  - `specification/proposals/express/a2ui_express.md` (lines 47–54)

### Steps to Reproduce / Evidence
```ts
import { ExpressParser, ExpressDecompiler } from '@a2ui/agent';
import { basicCatalog } from '@a2ui/web_core/v1_0';

const parser = new ExpressParser(basicCatalog, 'main', 'v1.0');
const decompiler = new ExpressDecompiler(basicCatalog, 'v1.0');

// 1. Compile valid Express DSL using the spec's exact `id="content-grid"` example:
const parts = parser.parseResponse(`
<a2ui>
surface("main")
left = Text("Left")
right = Text("Right")
grid = Row([left, right], id="content-grid")
root = Card(grid)
</a2ui>
`);

const messages = parts.filter(p => p.type === 'a2ui').flatMap(p => p.payload);

// 2. Decompile the compiled A2UI v1.0 message back to Express:
// Throws ExpressInvalidIdentifierError: Invalid identifier 'content-grid'
const roundTripDsl = decompiler.decompile(messages);
```

In `typescript/agents/a2ui_agent/src/inference-formats/express/decompiler.ts` (lines 695–699):
```ts
const compId = typeof comp.id === 'string' ? comp.id : '';
const compName = typeof comp.component === 'string' ? comp.component : '';
if (compId && !isExpressIdentifier(compId)) {
  throw new ExpressInvalidIdentifierError(compId);
}
```

### Expected Behavior
`ExpressDecompiler` should derive a valid Express variable identifier (e.g., `content_grid`), map all parent references (`"content-grid"` $\rightarrow$ `content_grid`), and emit `id="content-grid"` on the component constructor, matching `specification/proposals/express/a2ui_express.md` (line 54) and Python's `decompiler.py`.

### Actual Behavior
`ExpressDecompiler` throws `ExpressInvalidIdentifierError: Invalid identifier 'content-grid'` whenever any component in a surface has a hyphenated or non-identifier `id`.

### Suggested Fix
Port `_assign_variable_names()` from Python's `decompiler.py` to `typescript/agents/a2ui_agent/src/inference-formats/express/decompiler.ts` so non-identifier component IDs are sanitized to valid variable names (with collision deduplication) and emitted with the trailing `id="..."` keyword argument.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-06-06] [v1.0][agent] ExpressParser configures BlockLexer with single-quote (') strings and omits // and /* */ comments, swallowing </a2ui> when a comment contains an apostrophe
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Express DSL`
- **Title**: `[v1.0][agent] ExpressParser configures BlockLexer with single-quote (') strings and omits // and /* */ comments, swallowing </a2ui> when a comment contains an apostrophe`

<!-- ISSUE_BODY_START -->
### Summary
In `specification/inference_formats/express/Express.g4` (lines 166–181), A2UI Express supports three comment styles (`#`, `//`, and `/* ... */`) and **only** double-quoted string literals (`"..."` and `"""..."""`), **not** single-quoted strings (`'...'`).

However, in `typescript/agents/a2ui_agent/src/inference-formats/express/parser.ts` (lines 85–90), `ExpressParser` initializes `BlockLexer` with:
```ts
this.lexer = new BlockLexer(
  A2UI_INFERENCE_OPEN_TAG,
  A2UI_INFERENCE_CLOSE_TAG,
  new Set(["'", '"']),
  new Set(['#']),
);
```
Because `BlockLexer` is not told that `//` and `/* ... */` are comments in Express, and is mistakenly told that `'` is a string delimiter:
- Whenever an LLM writes a valid `//` or `/* */` comment inside `<a2ui>...</a2ui>` that contains an apostrophe/contraction (e.g., `// Chef's 15-minute dinner` or `// User's profile card`), `BlockLexer` treats the `'` in `Chef's` as opening a single-quoted string (`LexerState.IN_STRING`).
- `BlockLexer` then remains stuck in `LexerState.IN_STRING` for the rest of the block and consumes the closing `</a2ui>` sentinel tag as part of the string, causing `ExpressParser.parseResponse()` to fail with an unclosed `<a2ui>` block `ParseError`!

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/agent@0.0.1`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/src/inference-formats/express/parser.ts` (lines 85–90)
  - `typescript/agents/a2ui_agent/src/parser/lexer.ts` (lines 49–88)
  - `specification/inference_formats/express/Express.g4` (lines 166–181)

### Steps to Reproduce / Evidence
```ts
import { ExpressParser } from '@a2ui/agent';
import { basicCatalog } from '@a2ui/web_core/v1_0';

const parser = new ExpressParser(basicCatalog, 'main', 'v1.0');

// Valid Express DSL per Express.g4 (`//` comment with an apostrophe):
const llmReply = `Here is your card:
<a2ui>
// User's profile summary
surface("main")
root = Text("Hello World")
</a2ui>`;

// Throws ParseError: Unclosed block starting with <a2ui> because `'` in `User's`
// puts BlockLexer into LexerState.IN_STRING and swallows `</a2ui>`!
parser.parseResponse(llmReply);
```

### Expected Behavior
`BlockLexer` used by `ExpressParser` should match `Express.g4`:
1. Only `"` (and `"""`) should be treated as string delimiters (`new Set(['"'])`), not `'`.
2. `#`, `//`, and `/* ... */` should all be recognized as comments so characters inside comments never alter lexer string/tag state.

### Actual Behavior
Any apostrophe (`'`) inside a `//` or `/* ... */` comment (or inside a double-quoted string if unbalanced after a comment) desynchronizes `BlockLexer` and swallows the closing `</a2ui>` tag.

### Suggested Fix
1. In `typescript/agents/a2ui_agent/src/inference-formats/express/parser.ts` (line 88), change `new Set(["'", '"'])` to `new Set(['"'])` and include `'//'` in `singleLineComments`.
2. Update `BlockLexer` (`typescript/agents/a2ui_agent/src/parser/lexer.ts`) to support multi-character comment prefixes (`//` and `/* ... */`).
<!-- ISSUE_BODY_END -->

---

## [ISSUE-06-07] [v1.0][agent] ExpressCompiler.compile() uses naive substring .includes('<a2ui>') / .split('</a2ui>') stripping that corrupts string literals containing <a2ui>
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Express DSL`
- **Title**: `[v1.0][agent] ExpressCompiler.compile() uses naive substring .includes('<a2ui>') / .split('</a2ui>') stripping that corrupts string literals containing <a2ui>`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/agents/a2ui_agent/src/inference-formats/express/compiler.ts` (lines 501–524), `ExpressCompiler.compile(dslText)` performs line-by-line substring checks (`dslText.includes('<a2ui>')`, `trimmed.includes('<a2ui>')`, `curLine.split('</a2ui>')[0]`) without lexer state awareness.

Because `ExpressParser` already strips `<a2ui>` and `</a2ui>` before passing `dslBody` to `ExpressCompiler.compile()`, if `dslText` does not have outer sentinel tags but contains a string literal mentioning `<a2ui>` or `</a2ui>` (for example, `root = Text("Generated with <a2ui> Express")` or documentation/code tutor surfaces), `dslText.includes('<a2ui>')` evaluates to `true`! As a result:
- `insideA2ui` starts as `false`, so **every statement before the line containing `"<a2ui>"` (including `surface(...)` and prior component definitions) is silently discarded**;
- The line containing `"<a2ui>"` has `<a2ui>` deleted from inside the string literal; and
- Any line containing `"</a2ui>"` inside a string literal is truncated mid-string via `curLine.split('</a2ui>')[0]`, causing an ANTLR syntax error or undefined root error!

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/agent@0.0.1`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/src/inference-formats/express/compiler.ts` (lines 500–524)

### Steps to Reproduce / Evidence
```ts
import { ExpressParser } from '@a2ui/agent';
import { basicCatalog } from '@a2ui/web_core/v1_0';

const parser = new ExpressParser(basicCatalog, 'main', 'v1.0');

const reply = `
<a2ui>
surface("doc_surface")
header = Text("Welcome to A2UI")
body = Text("Wrap your DSL in <a2ui> and </a2ui> tags.")
root = Column([header, body])
</a2ui>
`;

// Fails compilation because ExpressParser strips the outer <a2ui>...</a2ui> tags,
// and then ExpressCompiler.compile() sees `<a2ui>` inside `body = Text(...)`,
// discards `surface("doc_surface")` and `header`, and truncates `body` at `</a2ui>`!
parser.parseResponse(reply);
```

### Expected Behavior
`ExpressCompiler.compile()` should only strip `<a2ui>` / `</a2ui>` when they appear as outer wrapper tags (or use `BlockLexer`), never when `<a2ui>` or `</a2ui>` appears inside a quoted string literal.

### Actual Behavior
Any string literal containing `<a2ui>` or `</a2ui>` inside an Express program causes `ExpressCompiler.compile()` to discard preceding lines and truncate the string literal, crashing compilation.

### Suggested Fix
In `typescript/agents/a2ui_agent/src/inference-formats/express/compiler.ts` (lines 500–524), only strip `<a2ui>` / `</a2ui>` at the trimmed start/end boundaries of `dslText` (or tokenize with `BlockLexer`), rather than running `.includes('<a2ui>')` and `.split('</a2ui>')` across every line.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-06-08] [v1.0][agent] @a2ui/agent top-level 'import * as fs from "fs"' breaks browser/on-device bundling and ExpressCompiler is missing from src/index.ts exports
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Express DSL`
- **Title**: `[v1.0][agent] @a2ui/agent top-level 'import * as fs from "fs"' breaks browser/on-device bundling and ExpressCompiler is missing from src/index.ts exports`

<!-- ISSUE_BODY_START -->
### Summary
`specification/proposals/express/a2ui_express.md` (lines 9–15) highlights **on-device / client-host compilation** as a primary architecture for A2UI Express, where an on-device or browser host compiles `<a2ui>...</a2ui>` directly into A2UI v1.0 messages.

However, `@a2ui/agent` has two packaging defects in `typescript/agents/a2ui_agent/src/index.ts`:
1. **Unconditional Node `fs` Import in Single Barrel Entrypoint**: `package.json` defines only a single `"."` export (`./dist/src/index.js`), which re-exports `FileSystemCatalogProvider` from `./processor/catalog-providers.js` (`typescript/agents/a2ui_agent/src/processor/catalog-providers.ts:17`: `import * as fs from 'fs';`). Importing anything from `@a2ui/agent` in a browser bundler (Vite, Webpack, Rollup) fails because Node's `fs` module is pulled into the client bundle.
2. **Missing `ExpressCompiler` Public Export**: `typescript/agents/a2ui_agent/src/index.ts` (lines 100–109) exports `ExpressFormat`, `ExpressFormatFactory`, `ExpressParser`, `ExpressPromptGenerator`, and `ExpressDecompiler`, but omits `ExpressCompiler` (`./inference-formats/express/compiler.js`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/agent@0.0.1`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/src/processor/catalog-providers.ts` (line 17)
  - `typescript/agents/a2ui_agent/src/index.ts` (lines 68–72, 100–109)
  - `typescript/agents/a2ui_agent/package.json`

### Steps to Reproduce / Evidence
1. Check exports in `typescript/agents/a2ui_agent/src/index.ts` (lines 100–109):
   ```ts
   // Express inference format
   export {
     type ExpressFormatOptions,
     ExpressFormat,
     ExpressFormatFactory,
   } from './inference-formats/express/format.js';
   export {ExpressParser} from './inference-formats/express/parser.js';
   export {ExpressPromptGenerator} from './inference-formats/express/prompt-generator.js';
   export {ExpressDecompiler} from './inference-formats/express/decompiler.js';
   // ExpressCompiler is NOT exported!
   ```
2. Import `@a2ui/agent` in a browser Vite/Rollup project:
   ```ts
   import { ExpressParser } from '@a2ui/agent';
   ```
   Bundling fails or emits Node builtin errors because `src/index.ts` re-exports `FileSystemCatalogProvider` (`import * as fs from 'fs'` at `src/processor/catalog-providers.ts:17`).

### Expected Behavior
1. `ExpressCompiler` should be exported from `typescript/agents/a2ui_agent/src/index.ts` alongside `ExpressDecompiler` and `ExpressParser`.
2. Browser/client-host consumers should be able to import `ExpressCompiler`, `ExpressDecompiler`, `ExpressParser`, and `InMemoryCatalogProvider` without pulling in top-level `import * as fs from 'fs'` (either via dynamic `await import('node:fs')` inside `FileSystemCatalogProvider` or a separate `@a2ui/agent/node` entrypoint).

### Actual Behavior
`ExpressCompiler` cannot be imported from `@a2ui/agent`, and importing `@a2ui/agent` in browser/on-device environments pulls in top-level Node `fs`.

### Suggested Fix
- Export `ExpressCompiler` from `typescript/agents/a2ui_agent/src/index.ts`:
  ```ts
  export {ExpressCompiler} from './inference-formats/express/compiler.js';
  ```
- Lazy-load `fs` inside `FileSystemCatalogProvider` (or move `FileSystemCatalogProvider` to a `@a2ui/agent/node` subpath export) so the root `@a2ui/agent` entrypoint is environment-agnostic.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-01] [v1.0][web_core] Declarative @call functions in UI bindings, checks, and action.functionCall never route to RpcHandler.callAgentFunction
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][web_core] Declarative @call functions in UI bindings, checks, and action.functionCall never route to RpcHandler.callAgentFunction`

<!-- ISSUE_BODY_START -->
### Summary
The A2UI v1.0 protocol specification (`specification/v1_0/docs/a2ui_protocol.md`, § *"Fallback Routing"*, lines 1419–1426 and § *"Client-to-Server Execution (`callAgentFunction`)"*, lines 1520–1545) specifies that when a renderer encounters a `FunctionCall` (`{"@call": "..."}`) in a property binding, validation check, or `action.functionCall` that is not implemented locally on the renderer, the renderer falls back to dispatching a `callAgentFunction` envelope over the wire and resolving when `agentFunctionResponse` arrives.

In `@a2ui/web_core@0.14.0`, `DataContext`, `Catalog.invoker`, and `SurfaceModel.dispatchAction` have no integration with `MessageProcessor.rpc` (`RpcHandler`). Any declarative `{"@call": "..."}` referencing a server/agent function (or a schema-only `FunctionApi` loaded via `Catalog.fromJson()`) immediately throws `A2uiExpressionError` instead of invoking `RpcHandler.callAgentFunction()`, and `SurfaceModel.dispatchAction()` silently ignores `action.functionCall` altogether.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/v1_0/catalog/types.ts` (lines 914–937 — `createCatalogInvoker`)
  - `typescript/core/web_core/src/common/context/data-context.ts` (lines 206–275 — `resolveDynamicValue` / `resolveSignal`)
  - `typescript/core/web_core/src/common/model/surface-model.ts` (lines 140–170 — `dispatchAction`)
  - `typescript/core/web_core/src/v1_0/processing/message-processor.ts` (lines 180–265)
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 1419–1426, 1520–1545)

### Steps to Reproduce / Evidence
1. Define a catalog JSON with a server-side function (e.g., `optimizeCoupons`) and load it via `Catalog.fromJson(catalogJson)` (which creates a schema-only `FunctionApi` without a local `execute` callback), or reference an agent-side function in a `Button`'s `action.functionCall`:
   ```ts
   import { MessageProcessor, Catalog } from '@a2ui/web_core/v1_0';

   const catalog = Catalog.fromJson({
     catalogId: 'https://example.com/catalog.json',
     components: {},
     functions: {
       calculateRemoteTax: {
         description: 'Server-calculated tax',
         returnType: 'number',
         properties: { type: 'object', properties: { subtotal: { type: 'number' } } }
       }
     }
   });

   const processor = new MessageProcessor([catalog]);
   processor.rpc.addOutboundListener((msg) => {
     console.log('Outbound RPC:', msg);
   });

   // Invoking via catalog.invoker (used by DataContext):
   catalog.invoker('calculateRemoteTax', { subtotal: 50 }, {} as any);
   ```
2. Observe `createCatalogInvoker` in `typescript/core/web_core/src/v1_0/catalog/types.ts` (lines 931–936):
   ```ts
   if (!('execute' in fn)) {
     throw new A2uiExpressionError(
       `Function '${name}' in catalog '${catalog.id}' is schema-only and has no implementation.`,
       name,
     );
   }
   ```
3. Furthermore, inspect `SurfaceModel.dispatchAction` (`typescript/core/web_core/src/common/model/surface-model.ts`): it only checks `if ('event' in action)` and completely ignores `if ('functionCall' in action)`.

### Expected Behavior
1. When `SurfaceModel.dispatchAction(action)` receives `{ functionCall: { "@call": "...", args: {...} } }`, it should execute the function via the surface's `DataContext` / `Catalog.invoker` (with `userActivation: true`).
2. When a function is schema-only or not locally implemented on the renderer, the invoker / `DataContext` should fall back to `processor.rpc.callAgentFunction(surfaceId, { "@call": name, catalogId, args })` as described in `a2ui_protocol.md` lines 1419–1426.

### Actual Behavior
- `catalog.invoker` immediately throws `A2uiExpressionError: Function '...' is schema-only and has no implementation` or `Function not found in catalog`.
- `SurfaceModel.dispatchAction({ functionCall: ... })` is a silent no-op.
- `RpcHandler.callAgentFunction` is unreachable from declarative A2UI v1.0 JSON envelopes.

### Suggested Fix
1. Pass a fallback RPC callback from `MessageProcessor` (`this.rpc.callAgentFunction.bind(this.rpc)`) into `SurfaceModel` / `DataContext` / `createCatalogInvoker`.
2. Update `SurfaceModel.dispatchAction()` to handle `'functionCall' in action` by invoking the surface's function evaluator with `userActivation: true`, routing unimplemented or schema-only functions through `rpc.callAgentFunction(this.id, action.functionCall)`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-02] [v1.0][web_core] createCatalogInvoker never checks allowedCallers === 'agentOnly', allowing UI bindings and actions to execute agent-only functions
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][web_core] createCatalogInvoker never checks allowedCallers === 'agentOnly', allowing UI bindings and actions to execute agent-only functions`

<!-- ISSUE_BODY_START -->
### Summary
Per `specification/v1_0/docs/a2ui_protocol.md` (line 327) and `specification/v1_0/json/catalog_definition.json` (lines 79–87):
> *"Functions configured as `'agentOnly'` CANNOT be bound to UI component properties or executed by renderer UI actions; they are restricted exclusively to agent-initiated `callRendererFunction` execution."*

While `RpcHandler.checkExecutionPermissions()` (`typescript/core/web_core/src/v1_0/rpc/rpc-handler.ts`, lines 518–531) enforces `allowedCallers === 'rendererOnly'` for inbound `callRendererFunction` requests, `createCatalogInvoker()` (`typescript/core/web_core/src/v1_0/catalog/types.ts`, lines 914–937) **only** calls `assertUserActivation(fn, ctx)` and never checks `fn.allowedCallers === 'agentOnly'`. Consequently, any UI property binding (`DynamicValue`) or `CheckRule` can freely invoke `"agentOnly"` functions locally.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/v1_0/catalog/types.ts` (lines 914–937 — `createCatalogInvoker` & `assertUserActivation`)
  - `typescript/core/web_core/src/v1_0/rpc/rpc-handler.ts` (lines 518–531 — `checkExecutionPermissions`)

### Steps to Reproduce / Evidence
Inspect `typescript/core/web_core/src/v1_0/catalog/types.ts` (lines 904–937):
```ts
function assertUserActivation(fn: FunctionApi, ctx: DataContext): void {
  if (fn.requiresUserActivation && !ctx.userActivation) {
    throw new A2uiExpressionError(
      `Function '${fn.name}' requires user activation (e.g. a button click) and cannot be evaluated in a reactive data binding.`,
      fn.name,
    );
  }
}

export function createCatalogInvoker<T extends FunctionApi>(
  catalog: Catalog<ComponentApi, T>,
  fallbackInvoker?: FunctionInvoker,
): FunctionInvoker {
  return (name, rawArgs, ctx, catalogId) => {
    if (!catalogId || catalogId === catalog.id) {
      const fn = catalog.functions.get(name);
      if (fn) {
        assertUserActivation(fn, ctx);
        // BUG: Missing check for fn.allowedCallers === 'agentOnly'!
        const parsedArgs = fn.ArgumentSchema.parse(rawArgs);
        if ('execute' in fn) {
          return fn.execute(parsedArgs, ctx);
        }
```
If a function is defined with `allowedCallers: 'agentOnly'`, binding `{"@call": "getSensitiveClientMetrics"}` inside a `Text` component's `text` property executes `fn.execute(...)` without throwing an error.

### Expected Behavior
`createCatalogInvoker` should check `if (fn.allowedCallers === 'agentOnly')` and throw an `A2uiExpressionError` (e.g., `"Function '${fn.name}' has allowedCallers='agentOnly' and cannot be invoked by renderer UI bindings or actions"`).

### Actual Behavior
`createCatalogInvoker` ignores `fn.allowedCallers` completely and executes `'agentOnly'` functions when bound to UI component properties or check rules.

### Suggested Fix
Add an explicit `allowedCallers` guard in `createCatalogInvoker` (`typescript/core/web_core/src/v1_0/catalog/types.ts` right before `assertUserActivation(fn, ctx)`):
```ts
if (fn.allowedCallers === 'agentOnly') {
  throw new A2uiExpressionError(
    `Function '${fn.name}' is restricted to allowedCallers='agentOnly' and cannot be evaluated in renderer UI bindings or actions.`,
    fn.name,
  );
}
```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-03] [v1.0][web_core] DataContext does not handle Promise return values from async FunctionImplementation.execute
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][web_core] DataContext does not handle Promise return values from async FunctionImplementation.execute`

<!-- ISSUE_BODY_START -->
### Summary
In `@a2ui/web_core`, `RpcHandler.executeFunctionSafely()` (`typescript/core/web_core/src/v1_0/rpc/rpc-handler.ts`, line 581) awaits async catalog functions via `await Promise.resolve(funcImpl.execute(args, context))`. However, when a catalog function returns a `Promise<T>` (or is an `async` function) and is evaluated through `DataContext.resolveDynamicValue()` or `DataContext.resolveSignal()` (`typescript/core/web_core/src/common/context/data-context.ts`, lines 213–270), `DataContext` only checks `if (isSignal(res))` and never checks if `res instanceof Promise` (or `typeof res?.then === 'function'`).

As a result:
1. Dynamic properties bound to an async `@call` receive a raw `[object Promise]` object instead of the resolved value `T`.
2. In `Checkable.checks`, a `Promise<ValidationResult>` or `Promise<boolean>` is treated as a truthy object, causing failing async validation checks to erroneously pass.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/common/context/data-context.ts` (lines 213–270)
  - `typescript/core/web_core/src/v1_0/rpc/rpc-handler.ts` (lines 575–590)

### Steps to Reproduce / Evidence
Inspect `typescript/core/web_core/src/common/context/data-context.ts` (lines 252–268):
```ts
const res = this.functionInvoker(callName, evaluatedArgs, this, catalogId);
if (isSignal(res)) {
  return res.get();
}
return res as V;
```
And in `resolveSignal` (lines 234–245):
```ts
return computed(() => {
  const evaluatedArgs: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(argSignals)) {
    evaluatedArgs[k] = v.get();
  }
  const res = this.functionInvoker!(callName, evaluatedArgs, this, catalogId);
  return isSignal(res) ? (res as Signal<V>).get() : (res as V);
});
```
If `functionInvoker` returns `Promise.resolve("Hello")`, `resolveSignal` emits the `Promise` instance itself as the signal's value.

### Expected Behavior
When a function implementation returns a `Promise<V>` in `DataContext.resolveSignal()`, `DataContext` should convert the `Promise` into a reactive `Signal<V | undefined>` that updates once the promise settles (or explicitly reject async functions in synchronous bindings with a clear `A2uiExpressionError` if only `Signal<V>` is supported for reactive async state).

### Actual Behavior
`DataContext` returns the raw `Promise` instance as `V`, rendering `[object Promise]` in UI components and treating unresolved promises as truthy in validation checks.

### Suggested Fix
In `DataContext.resolveSignal()`, detect `res instanceof Promise` (or `typeof (res as any)?.then === 'function'`), create an internal `signal<V | undefined>(undefined)`, attach `.then((val) => s.set(val))`, and return `s.get()` so the `computed` signal automatically re-notifies subscribers when the `Promise` resolves.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-04] [v1.0][web_core] ErrorMessageSchema in src/v1_0/schema/renderer-to-agent.ts uses !z.any().safeParse(value).success and rejects 100% of error messages
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][web_core] ErrorMessageSchema in src/v1_0/schema/renderer-to-agent.ts uses !z.any().safeParse(value).success and rejects 100% of error messages`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/core/web_core/src/v1_0/schema/renderer-to-agent.ts` (lines 138–152), `ErrorMessageSchema` (and consequently `RendererToAgentMessageSchema`) contains a broken Zod refinement generated by `scripts/generate-schemas.mjs` for the JSON Schema `"oneOf"` rule (`{"required": ["surfaceId"], "not": {"required": ["functionCallId"]}}` vs `{"required": ["functionCallId"], "not": {"required": ["surfaceId"]}}` from `specification/v1_0/json/renderer_to_agent.json` lines 133–142).

The generator translated `"not": {"required": [...]}` into:
```ts
z.any().refine((value) => !z.any().safeParse(value).success, 'Invalid input: Should NOT be valid against schema')
```
Because `z.any().safeParse(value).success` is **always `true`** for every possible JavaScript value, `!z.any().safeParse(value).success` is **always `false`**. Both branches of the `.or(...)` union fail unconditionally, causing `ErrorMessageSchema.safeParse()` and `RendererToAgentMessageSchema.safeParse()` to reject **100% of valid `error` envelopes** (including `INVALID_FUNCTION_CALL` RPC errors with `functionCallId` and `VALIDATION_FAILED` surface errors with `surfaceId`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/v1_0/schema/renderer-to-agent.ts` (lines 118–155)
  - `typescript/core/web_core/scripts/generate-schemas.mjs`
  - `specification/v1_0/json/renderer_to_agent.json` (lines 110–145)

### Steps to Reproduce / Evidence
Inspect `typescript/core/web_core/src/v1_0/schema/renderer-to-agent.ts` (lines 135–153):
```ts
        .and(
          z
            .object({ surfaceId: z.string() })
            .catchall(z.any())
            .and(
              z
                .any()
                .refine(
                  (value) => !z.any().safeParse(value).success,
                  'Invalid input: Should NOT be valid against schema',
                ),
            )
            .or(
              z
                .object({ functionCallId: z.string() })
                .catchall(z.any())
                .and(
                  z
                    .any()
                    .refine(
                      (value) => !z.any().safeParse(value).success,
                      'Invalid input: Should NOT be valid against schema',
                    ),
                ),
            ),
        ),
```
Run a minimal reproduction with Node:
```ts
import { ErrorMessageSchema, RendererToAgentMessageSchema } from '@a2ui/web_core/v1_0';

const validRpcError = {
  version: 'v1.0',
  error: {
    code: 'INVALID_FUNCTION_CALL',
    functionCallId: 'req-42',
    message: 'Function is rendererOnly'
  }
};

console.log(ErrorMessageSchema.safeParse(validRpcError));
// => { success: false, error: ZodError: Invalid input: Should NOT be valid against schema }
```

### Expected Behavior
`ErrorMessageSchema.safeParse(validRpcError)` and `ErrorMessageSchema.safeParse({ version: 'v1.0', error: { code: ' custom_err', surfaceId: 'main', message: 'failed' } })` must return `{ success: true }` whenever exact one of `surfaceId` or `functionCallId` is present.

### Actual Behavior
`ErrorMessageSchema.safeParse(...)` returns `{ success: false }` for every input because `!z.any().safeParse(value).success` is a contradiction (`false`).

### Suggested Fix
Fix the `"not": {"required": ["prop"]}` translation in `typescript/core/web_core/scripts/generate-schemas.mjs` (or replace the refinement in `renderer-to-agent.ts`) so that `"not": {"required": ["functionCallId"]}` compiles to:
```ts
z.object({ surfaceId: z.string(), functionCallId: z.undefined() }).passthrough()
  .or(z.object({ functionCallId: z.string(), surfaceId: z.undefined() }).passthrough())
```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-05] [v1.0][web_core] MessageProcessor and RpcHandler use legacy v0.9 'call' key instead of v1.0 '@call' in function RPC payloads
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][web_core] MessageProcessor and RpcHandler use legacy v0.9 'call' key instead of v1.0 '@call' in function RPC payloads`

<!-- ISSUE_BODY_START -->
### Summary
In A2UI v1.0 (`specification/v1_0/json/common_types.json#/$defs/FunctionCall`, lines 183–204), `FunctionCall` requires the `'@call'` property (`"required": ["@call"]`), whereas v0.9 used `"call"`.

There are two `'@call'` vs `'call'` mismatches in `@a2ui/web_core@0.14.0`:
1. **`MessageProcessor.processOperation` (line 690) and `processOperationAsync` (line 718)**: After `V1Point0Adapter.adaptMessage()` normalizes `callRendererFunction.callFunction['@call']` into `op.call`, `MessageProcessor` reconstructs a synthetic `callRendererFunction` message for `this.rpc.handleCallRendererFunction()` using the v0.9 property name `call` instead of `'@call'`:
   ```ts
   callFunction: {
     call: op.call,
     catalogId: op.catalogId,
     args: op.args,
   }
   ```
2. **`RpcHandler.sendOutboundMessage` (`src/v1_0/rpc/rpc-handler.ts`, line 717)**: Because `RpcHandler` accepts both `{ call: string }` and `{ '@call': string }` in `extractCallName(call)` (lines 686–694), callers passing `{ call: 'myFn', args: {} }` to `rpc.callAgentFunction(surfaceId, call)` have `callFunction: call` emitted verbatim onto the wire without normalizing `call` → `'@call'`, producing an invalid v1.0 `callAgentFunction` envelope that fails `renderer_to_agent.json` schema validation.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/v1_0/processing/message-processor.ts` (lines 685–725)
  - `typescript/core/web_core/src/v1_0/rpc/rpc-handler.ts` (lines 686–723)

### Steps to Reproduce / Evidence
1. Inspect `typescript/core/web_core/src/v1_0/processing/message-processor.ts` (lines 685–696 and 713–724):
   ```ts
   case 'callRendererFunction': {
     this.rpc.handleCallRendererFunction({
       version: 'v1.0',
       callRendererFunction: {
         surfaceId: op.surfaceId,
         functionCallId: op.functionCallId,
         callFunction: {
           call: op.call,
           catalogId: op.catalogId,
           args: op.args,
         },
       },
     });
     break;
   }
   ```
2. Inspect `typescript/core/web_core/src/v1_0/rpc/rpc-handler.ts` (lines 710–721):
   ```ts
   const message: RendererToAgentMessage = {
     version: 'v1.0',
     callAgentFunction: {
       surfaceId,
       functionCallId,
       callFunction: call, // Not normalized to '@call'!
     },
   };
   ```

### Expected Behavior
1. `MessageProcessor` should construct `callFunction: { '@call': op.call, catalogId: op.catalogId, args: op.args }` matching `AgentToRendererMessage` (`agent_to_renderer.json`).
2. `RpcHandler.sendOutboundMessage` should normalize `callFunction` so the serialized wire payload always uses `'@call'` (and never emits legacy `call`).

### Actual Behavior
`MessageProcessor` passes `{ call: op.call, ... }` (which requires `as any` or loose typing in `RpcHandler.extractCallName`), and `RpcHandler.callAgentFunction` emits `{ call: ... }` on the wire if given a normalized `FunctionCall` object.

### Suggested Fix
1. In `typescript/core/web_core/src/v1_0/processing/message-processor.ts` (lines 690 and 718), change `call: op.call` to `'@call': op.call`.
2. In `typescript/core/web_core/src/v1_0/rpc/rpc-handler.ts` (`sendOutboundMessage`, line 717), normalize `callFunction` before emitting:
   ```ts
   callFunction: {
     '@call': this.extractCallName(call),
     ...(call.catalogId ? { catalogId: call.catalogId } : {}),
     ...(call.args ? { args: call.args } : {}),
   }
   ```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-06] [v1.0][web_core][react] @a2ui/web_core root entrypoint omits ./v1_0 and ./rpc, and @a2ui/react@0.14.0 has no v1.0 or RpcHandler integration
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][web_core][react] @a2ui/web_core root entrypoint omits ./v1_0 and ./rpc, and @a2ui/react@0.14.0 has no v1.0 or RpcHandler integration`

<!-- ISSUE_BODY_START -->
### Summary
1. **`@a2ui/web_core@0.14.0` root entrypoint (`src/index.ts`)**: Only exports `./v0_8` and `./v0_9`, omitting `./v1_0` and `./v1_0/rpc` (`RpcHandler`, `A2uiRpcError`, `RpcErrorCode`). Furthermore, `./v1_0/index.ts` does not re-export `A2uiRpcError` or `RpcErrorCode`, requiring deep imports or separate subpath discovery (`@a2ui/web_core/rpc`).
2. **`@a2ui/react@0.14.0` locks users out of v1.0 functions & RPC**: `@a2ui/react@0.14.0` hardcodes imports from `@a2ui/web_core/v0_9`, offers no `@a2ui/react/v1_0` entrypoint, and provides no React provider/hook integration for `MessageProcessor.rpc` (`addOutboundListener` for `rendererFunctionResponse` / `callAgentFunction`, or `callAgentFunction` invocation).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm packages `@a2ui/web_core@0.14.0`, `@a2ui/react@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/index.ts`
  - `typescript/core/web_core/src/v1_0/index.ts`
  - `typescript/renderers/react/src/index.ts`

### Steps to Reproduce / Evidence
1. Inspect `typescript/core/web_core/src/index.ts`:
   ```ts
   import * as v0_8 from './v0_8/index.js';
   import * as v0_9 from './v0_9/index.js';

   export { v0_8, v0_9 };
   ```
   `v1_0` is missing from the root barrel export.
2. Inspect `typescript/core/web_core/src/v1_0/index.ts`: `RpcHandler`, `A2uiRpcError`, and `RpcErrorCode` are not re-exported from `@a2ui/web_core/v1_0`.
3. Inspect `@a2ui/react@0.14.0` (`dist/index.js`): it instantiates `v0_9.MessageProcessor`, which does not have `.rpc` (`RpcHandler`) and rejects v1.0 `"version": "v1.0"` messages (`callRendererFunction`, `agentFunctionResponse`, `@call`).

### Expected Behavior
- `@a2ui/web_core` root `index.ts` should export `v1_0` alongside `v0_8` and `v0_9`, and `@a2ui/web_core/v1_0` should re-export `RpcHandler`, `A2uiRpcError`, `RpcErrorCode`, and `RpcOptions`.
- `@a2ui/react` should support v1.0 `MessageProcessor` and expose an `onOutboundMessage` / `rpc` hook so React applications can send `rendererFunctionResponse` and `callAgentFunction` messages back to the agent.

### Actual Behavior
Developers importing from `@a2ui/web_core` or `@a2ui/react` cannot access v1.0 `MessageProcessor` or `RpcHandler` without bypassing `@a2ui/react` and using subpath imports (`@a2ui/web_core/v1_0` and `@a2ui/web_core/rpc`).

### Suggested Fix
1. Export `v1_0` from `typescript/core/web_core/src/index.ts` and re-export `./rpc/index.js` from `typescript/core/web_core/src/v1_0/index.ts`.
2. Add v1.0 `MessageProcessor` and `rpc.addOutboundListener` support to `@a2ui/react`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-07] [v1.0][docs] docs/public/reference/messages.md has no v1.0 tab and omits callRendererFunction, agentFunctionResponse, callAgentFunction, and rendererFunctionResponse
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][docs] docs/public/reference/messages.md has no v1.0 tab and omits callRendererFunction, agentFunctionResponse, callAgentFunction, and rendererFunctionResponse`

<!-- ISSUE_BODY_START -->
### Summary
The public Reference documentation page for A2UI Messages (`docs/public/reference/messages.md`, lines 1–268) only provides tabs for `=== "v0.8 Message Types"` and `=== "v0.9 Message Types"`. There is **no v1.0 tab**, and all four v1.0 bidirectional function RPC envelopes defined in `specification/v1_0/json/agent_to_renderer.json` and `specification/v1_0/json/renderer_to_agent.json` are completely undocumented in the public Reference:
- `callRendererFunction` (Agent → Renderer)
- `agentFunctionResponse` (Agent → Renderer)
- `callAgentFunction` (Renderer → Agent)
- `rendererFunctionResponse` (Renderer → Agent)

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/reference/messages.md` (lines 1–268)
  - `specification/v1_0/json/agent_to_renderer.json` (lines 126–182)
  - `specification/v1_0/json/renderer_to_agent.json` (lines 66–108)

### Steps to Reproduce / Evidence
Inspect `docs/public/reference/messages.md` (lines 17–32):
```markdown
=== "v0.8 Message Types"

    *   **`surfaceUpdate`**: Defines or updates UI components.
    *   **`dataModelUpdate`**: Provides or updates data.
    *   **`beginRendering`**: Signals the client to render.
    *   **`deleteSurface`**: Removes a UI surface.

=== "v0.9 Message Types"

    *   **`createSurface`**: Initializes a new UI surface and sets its catalog.
    *   **`updateComponents`**: Defines or updates UI components on a surface.
    *   **`updateDataModel`**: Provides or updates data for a surface.
    *   **`deleteSurface`**: Removes a UI surface.
```
Neither `=== "v1.0 Message Types"` nor any mention of `callRendererFunction`, `agentFunctionResponse`, `callAgentFunction`, or `rendererFunctionResponse` exists anywhere in `docs/public/reference/messages.md`.

### Expected Behavior
`docs/public/reference/messages.md` should include a `=== "v1.0 Message Types"` tab documenting all 6 Agent-to-Renderer messages (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`, `callRendererFunction`, `agentFunctionResponse`) and all 4 Renderer-to-Agent messages (`action`, `callAgentFunction`, `rendererFunctionResponse`, `error`), including `functionCallId` correlation and `FunctionResponse` (`value` vs `error` `oneOf` semantics).

### Actual Behavior
Developers reading the Reference docs see only v0.8 and v0.9 messages and have no way of discovering the v1.0 RPC envelopes.

### Suggested Fix
Add a `=== "v1.0 Message Types"` tab to `docs/public/reference/messages.md` with JSON examples and field tables for `callRendererFunction`, `agentFunctionResponse`, `callAgentFunction`, and `rendererFunctionResponse` matching `specification/v1_0/docs/a2ui_protocol.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-08] [v1.0][docs] docs/public/concepts/actions.md uses legacy v0.9 call/path syntax and contradicts v1.0 callAgentFunction / callRendererFunction RPC
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][docs] docs/public/concepts/actions.md uses legacy v0.9 call/path syntax and contradicts v1.0 callAgentFunction / callRendererFunction RPC`

<!-- ISSUE_BODY_START -->
### Summary
`docs/public/concepts/actions.md` (lines 38–125) has two major issues for A2UI v1.0 developers:
1. **Uses invalid v0.9 `"call"` and `"path"` syntax without version tabs**:
   ```json
   "action": {
     "functionCall": {
       "call": "openUrl",
       "args": {
         "url": "https://example.com/help"
       }
     }
   }
   ```
   In A2UI v1.0 (`common_types.json#/$defs/FunctionCall`), `"@call"` and `"@path"` are required; using `"call"` fails schema validation.
2. **Contradicts v1.0 Server-Side & Agent-Initiated Function RPC**: Lines 84–86 state:
   > *"Functions execute immediate behavior on the renderer without a network round-trip. The agent is not informed of local function calls."*
   This directly contradicts `specification/v1_0/docs/a2ui_protocol.md` (§ *"Fallback Routing"*, lines 1419–1426 & § *"Client-to-Server Execution (`callAgentFunction`)"*, lines 1520–1545), where `functionCall` can invoke server-side agent functions via `callAgentFunction` → `agentFunctionResponse`, and agents can invoke client functions via `callRendererFunction` → `rendererFunctionResponse`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/concepts/actions.md` (lines 38–125)
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 310–392, 1403–1545)

### Steps to Reproduce / Evidence
Inspect `docs/public/concepts/actions.md` (lines 80–124):
- Line 94: `"call": "openUrl"` (v0.9 syntax, no `@` prefix).
- Line 115: `"path": "/user/website"` (v0.9 syntax, no `@` prefix).
- No mention of `callAgentFunction`, `agentFunctionResponse`, `callRendererFunction`, `rendererFunctionResponse`, `allowedCallers`, or `requiresUserActivation`.

### Expected Behavior
`docs/public/concepts/actions.md` should use `"@call"` and `"@path"` for v1.0 (or provide v1.0 vs v0.9 tabs) and explain both local client-side execution (`rendererOnly` / `rendererOrAgent`, `requiresUserActivation`) and remote function RPC (`callAgentFunction` → `agentFunctionResponse` and `callRendererFunction` → `rendererFunctionResponse`).

### Actual Behavior
The page presents v0.9-only JSON syntax as current and states that functions never involve network communication with the agent.

### Suggested Fix
Update `docs/public/concepts/actions.md` to add v1.0 examples with `"@call"` / `"@path"`, document `requiresUserActivation` for user-gesture actions (like `openUrl`), and add a section explaining Server-Side Function RPC (`callAgentFunction`) and Agent-Initiated Client Function RPC (`callRendererFunction`).
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-09] [v1.0][docs] docs/public/concepts/data-binding.md mislabels v0.9 {"path": "..."} as "v0.9 and later" and omits v1.0 @path, @call, and @index
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][docs] docs/public/concepts/data-binding.md mislabels v0.9 {"path": "..."} as "v0.9 and later" and omits v1.0 @path, @call, and @index`

<!-- ISSUE_BODY_START -->
### Summary
In `docs/public/concepts/data-binding.md` (lines 16–35), the tab is titled `=== "v0.9 and later"` and instructs developers to write:
```json
{
  "id": "user_name",
  "component": "Text",
  "text": {"path": "/user/name"}
}
```
In A2UI v1.0 (`specification/v1_0/json/common_types.json#/$defs/DataBinding`, lines 134–144), `DataBinding` requires `"@path"` (`{"@path": "/user/name"}`), and unprefixed `{"path": "/user/name"}` is rejected or treated as a raw object. Furthermore, the page does not document v1.0 reactive computed bindings (`{"@call": "formatCurrency", "args": {...}}`), string interpolation (`${/path}` and `${fn()}` inside `formatString`), or the built-in `@index` system function (`{"@call": "@index", "args": {"offset": 1}}`) for collection templates.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/concepts/data-binding.md` (lines 16–150)
  - `specification/v1_0/json/common_types.json` (lines 134–204)

### Steps to Reproduce / Evidence
Inspect `docs/public/concepts/data-binding.md` (lines 16–26):
```markdown
=== "v0.9 and later"

    ```json
    {
      "id": "user_name",
      "component": "Text",
      "text": {"path": "/user/name"}
    }
    ```
```
If a developer passes `"text": {"path": "/user/name"}` to a v1.0 renderer (`@a2ui/web_core/v1_0`), `DynamicString` schema validation fails because `"@path"` is required in v1.0.

### Expected Behavior
`docs/public/concepts/data-binding.md` should separate `=== "v1.0"` from `=== "v0.9"`, show `{"@path": "/user/name"}` and `{"@call": "..."}` (plus `@index`) under `v1.0`, and explain reactive computed function bindings.

### Actual Behavior
The tab claims `{"path": "/user/name"}` applies to `"v0.9 and later"` and omits `@path`, `@call`, and `@index`.

### Suggested Fix
Rename the existing tab to `=== "v0.9"` and add a new `=== "v1.0"` tab in `docs/public/concepts/data-binding.md` covering `{"@path": "..."}`, reactive `{"@call": "..."}` expressions, and `{"@call": "@index", "args": {"offset": 1}}`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-10] [v1.0][docs] docs/public/concepts/catalogs.md documents v0.9 array-based functions schema instead of v1.0 map-based functions with allowedCallers
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][docs] docs/public/concepts/catalogs.md documents v0.9 array-based functions schema instead of v1.0 map-based functions with allowedCallers`

<!-- ISSUE_BODY_START -->
### Summary
`docs/public/concepts/catalogs.md` (lines 39–62) shows the catalog schema defining `functions` as a JSON array:
```json
"functions": {
  "type": "array",
  "description": "List of functions defined in this catalog.",
  "items": {
    "$ref": "#/$defs/FunctionDefinition"
  }
}
```
In A2UI v1.0 (`specification/v1_0/json/catalog_definition.json`, lines 25–29 and 64–106; see also `specification/v1_0/json/catalogs/basic/catalog.json`, lines 876–1286), `functions` is a **keyed object map** (`"type": "object", "additionalProperties": { "$ref": "#/$defs/functionSchema" }`) where each entry specifies `returnType`, `allowedCallers` (`"rendererOnly" | "agentOnly" | "rendererOrAgent"`), `requiresUserActivation` (`boolean`), and `properties` (`args` schema), alongside `$defs.anyFunction.oneOf`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/concepts/catalogs.md` (lines 39–62)
  - `specification/v1_0/json/catalog_definition.json` (lines 25–29, 64–106)

### Steps to Reproduce / Evidence
Compare `docs/public/concepts/catalogs.md` (lines 51–58) with `specification/v1_0/json/catalog_definition.json` (lines 25–29):
```json
"functions": {
  "type": "object",
  "description": "A map of function names to their JSON Schema definitions.",
  "additionalProperties": { "$ref": "#/$defs/functionSchema" }
}
```
Passing a v0.9-style `"functions": [...]` array to `Catalog.fromJson()` in `@a2ui/web_core/v1_0` fails Zod validation (`CatalogSchema` expects `functions: z.record(z.string(), ...)`).

### Expected Behavior
`docs/public/concepts/catalogs.md` should document the v1.0 map-based `functions` schema, `$defs.anyFunction`, `returnType` (including `"validationResult"` and `"void"`), `allowedCallers` (`"rendererOnly"`, `"agentOnly"`, `"rendererOrAgent"`), and `requiresUserActivation` (including the schema constraint that `requiresUserActivation: true` requires `allowedCallers: "rendererOnly"`).

### Actual Behavior
`docs/public/concepts/catalogs.md` only shows the legacy v0.9 array structure and omits `allowedCallers`, `requiresUserActivation`, and `ValidationResult`.

### Suggested Fix
Update `docs/public/concepts/catalogs.md` with the v1.0 `catalog_definition.json` structure and explain `allowedCallers` and `requiresUserActivation`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-11] [v1.0][spec/docs] a2ui_custom_functions.md is unlinked from docs/public/ and its getScreenResolution example omits allowedCallers, failing with INVALID_FUNCTION_CALL
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][spec/docs] a2ui_custom_functions.md is unlinked from docs/public/ and its getScreenResolution example omits allowedCallers, failing with INVALID_FUNCTION_CALL`

<!-- ISSUE_BODY_START -->
### Summary
There are two issues with `specification/v1_0/docs/a2ui_custom_functions.md`:
1. **Unpublished in `docs/public/`**: `specification/v1_0/docs/a2ui_custom_functions.md` is a dedicated v1.0 custom functions guide, but it is neither copied into `docs/public/` nor linked from `mkdocs.yml` or any page under `docs/public/`.
2. **Broken `getScreenResolution` Example (Spec Self-Contradiction)**:
   - In `specification/v1_0/docs/a2ui_protocol.md` (lines 333–346), `getScreenResolution` is used as the canonical example of an agent calling a client function via `callRendererFunction`:
     ```json
     {
       "version": "v1.0",
       "callRendererFunction": {
         "surfaceId": "main-content",
         "functionCallId": "req-001",
         "callFunction": {
           "@call": "getScreenResolution",
           "catalogId": "https://example.com/a2ui/custom-catalog/v1"
         }
       }
     }
     ```
   - However, in `specification/v1_0/docs/a2ui_custom_functions.md` (lines 78–83), the catalog definition for `getScreenResolution` omits `allowedCallers`:
     ```json
     "getScreenResolution": {
       "description": "Returns the current screen width and height in pixels.",
       "returnType": "object",
       "properties": { "type": "object", "properties": {}, "additionalProperties": false }
     }
     ```
   - Because `allowedCallers` defaults to `"rendererOnly"` (`specification/v1_0/json/catalog_definition.json` line 82, and `RpcHandler.checkExecutionPermissions` in `typescript/core/web_core/src/v1_0/rpc/rpc-handler.ts` lines 522–525: `const allowedCallers = funcImpl.allowedCallers ?? 'rendererOnly'; if (allowedCallers === 'rendererOnly') throw new A2uiRpcError(RpcErrorCode.INVALID_FUNCTION_CALL, ...)`), calling `getScreenResolution` via `callRendererFunction` **always fails at runtime with `INVALID_FUNCTION_CALL`**!

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `specification/v1_0/docs/a2ui_custom_functions.md` (lines 72–97)
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 322–346)
  - `specification/v1_0/json/catalog_definition.json` (lines 79–87)
  - `typescript/core/web_core/src/v1_0/rpc/rpc-handler.ts` (lines 518–531)

### Steps to Reproduce / Evidence
1. Define `getScreenResolution` exactly as shown in `specification/v1_0/docs/a2ui_custom_functions.md` (lines 78–83, without `allowedCallers`).
2. Send the `callRendererFunction` message from `specification/v1_0/docs/a2ui_protocol.md` (lines 333–346) into `MessageProcessor.processMessages()`.
3. `RpcHandler.checkExecutionPermissions()` defaults `allowedCallers` to `'rendererOnly'` and rejects the call with:
   ```json
   {
     "version": "v1.0",
     "rendererFunctionResponse": {
       "functionCallId": "req-001",
       "error": {
         "code": "INVALID_FUNCTION_CALL",
         "message": "Function 'getScreenResolution' is restricted to 'rendererOnly' and cannot be called by the agent."
       }
     }
   }
   ```

### Expected Behavior
1. `specification/v1_0/docs/a2ui_custom_functions.md` should include `"allowedCallers": "rendererOrAgent"` (or `"agentOnly"`) on `getScreenResolution` and explain how `allowedCallers` governs `callRendererFunction` vs UI bindings.
2. The guide should be published/linked in `docs/public/guides/` (`mkdocs.yml`).

### Actual Behavior
Following the official specification examples verbatim causes `getScreenResolution` to be rejected with `INVALID_FUNCTION_CALL`.

### Suggested Fix
1. Add `"allowedCallers": "rendererOrAgent"` to `getScreenResolution` in `specification/v1_0/docs/a2ui_custom_functions.md` (line 80).
2. Surface `a2ui_custom_functions.md` in `docs/public/guides/` and link it in `mkdocs.yml`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-12] [v1.0][spec/docs] a2ui_protocol.md Introduction states there are 4 agent-to-renderer messages instead of 6
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][spec/docs] a2ui_protocol.md Introduction states there are 4 agent-to-renderer messages instead of 6`

<!-- ISSUE_BODY_START -->
### Summary
In `specification/v1_0/docs/a2ui_protocol.md`, the Introduction (lines 24–29) states:
> *"The agent-to-renderer protocol defines four message types:*
> *- **`createSurface`**: Initializes a new UI surface and sets its catalog.*
> *- **`updateComponents`**: Defines or updates UI components on a surface.*
> *- **`updateDataModel`**: Provides or updates data for a surface.*
> *- **`deleteSurface`**: Removes a UI surface."*

Later in the same document, Section *"Envelope (Agent-to-Renderer)"* (line 172) states:
> *"Every message sent from the Agent to the Renderer MUST be a JSON object containing `"version": "v1.0"` and **exactly one** of the six action keys (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`, `callRendererFunction`, `agentFunctionResponse`)."*

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 24–29 vs line 172)

### Steps to Reproduce / Evidence
Compare lines 24–29 of `specification/v1_0/docs/a2ui_protocol.md` with line 172 of the same file and `specification/v1_0/json/agent_to_renderer.json` (lines 184–191).

### Expected Behavior
The Introduction of `specification/v1_0/docs/a2ui_protocol.md` (lines 24–29) should list all **six** agent-to-renderer message types (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`, `callRendererFunction`, `agentFunctionResponse`), as well as summarize the four renderer-to-agent message types (`action`, `callAgentFunction`, `rendererFunctionResponse`, `error`).

### Actual Behavior
Line 24 claims the agent-to-renderer protocol defines only four message types, contradicting line 172 and `agent_to_renderer.json`.

### Suggested Fix
Update lines 24–29 of `specification/v1_0/docs/a2ui_protocol.md` to list all six agent-to-renderer message types including `callRendererFunction` and `agentFunctionResponse`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-07-13] [v1.0][docs] docs/public/guides/renderer-development.md v1.0 tab references non-existent surfaceProperties and a2uiClientCapabilities and omits agentFunctionResponse
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Server-Side & Client-Side Functions`
- **Title**: `[v1.0][docs] docs/public/guides/renderer-development.md v1.0 tab references non-existent surfaceProperties and a2uiClientCapabilities and omits agentFunctionResponse`

<!-- ISSUE_BODY_START -->
### Summary
In `docs/public/guides/renderer-development.md`, the `=== "v1.0"` tab (lines 25–43) and capability reporting section (line 138) contain multiple inaccuracies with respect to `specification/v1_0/json/`:
1. **Non-existent `surfaceProperties` message (line 37)**: Lists `surfaceProperties: Updates surface-level configuration (like theme)` as a v1.0 message type. No `surfaceProperties` message exists in `agent_to_renderer.json`.
2. **Omits `agentFunctionResponse` (lines 25–43)**: Mentions `callRendererFunction` on line 39, but omits `agentFunctionResponse` (the agent's response to a renderer-initiated `callAgentFunction`), as well as `allowedCallers` and `requiresUserActivation` enforcement rules.
3. **Wrong capability object name (line 138)**: Instructs v1.0 renderers to advertise capabilities in `a2uiClientCapabilities` (the v0.9 name), whereas `specification/v1_0/json/renderer_capabilities.json` and `a2ui_protocol.md` (line 1611) rename this object to `a2uiRendererCapabilities`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/guides/renderer-development.md` (lines 25–43, 134–158)
  - `specification/v1_0/json/agent_to_renderer.json`
  - `specification/v1_0/json/renderer_capabilities.json`

### Steps to Reproduce / Evidence
Inspect `docs/public/guides/renderer-development.md` (lines 25–42):
```markdown
=== "v1.0"

    *   **JSON Processing**: Parse incoming JSON messages (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`, `surfaceProperties`, `callRendererFunction`).
    ...
    *   **`surfaceProperties`**: Updates surface-level configuration (like theme).
    *   **`callRendererFunction`**: Invokes a function defined on the renderer and expects a `rendererFunctionResponse`.
```
And line 138:
```markdown
In **v0.9 and v1.0**, capabilities are advertised in the `a2uiClientCapabilities` object...
```

### Expected Behavior
The `=== "v1.0"` checklist in `docs/public/guides/renderer-development.md` should:
1. Remove the non-existent `surfaceProperties` message.
2. Document both `callRendererFunction` → `rendererFunctionResponse` (including `allowedCallers` / `requiresUserActivation` enforcement) and `callAgentFunction` → `agentFunctionResponse`.
3. Reference `a2uiRendererCapabilities` (`v1.0` array of catalog URIs) for v1.0 capability negotiation.

### Actual Behavior
The v1.0 renderer development guide tells implementers to handle a non-existent `surfaceProperties` message, use the v0.9 `a2uiClientCapabilities` key, and omits `agentFunctionResponse` and function execution permissions.

### Suggested Fix
Update `docs/public/guides/renderer-development.md` lines 25–43 and 134–158 to match `specification/v1_0/json/agent_to_renderer.json`, `renderer_to_agent.json`, and `renderer_capabilities.json`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-08-01] [docs][v1.0] reference/components.md documents invalid 'accessibility.role' property and omits 'description', 'live', and 'hidden'
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

## [ISSUE-08-02] [docs][v1.0] docs/public/roadmap.md lists Accessibility & ARIA attribute generation as future work despite shipping in v1.0
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

## [ISSUE-08-03] [docs][v1.0] Missing public documentation for AccessibilityAttributes ('live' regions, 'hidden' subtrees, and semantic label inference)
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

## [ISSUE-08-04] [v1.0][web_core] BasicCatalogA2uiLitElement sets ARIA attributes on outer custom element host instead of inner focusable control
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

## [ISSUE-08-05] [v1.0][web_core][react] Public A2uiLitElement and @a2ui/react adapters do not plumb ComponentCommon.accessibility attributes
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

## [ISSUE-08-06] [v1.0][web_core] accessibility.hidden=true sets aria-hidden="true" without inert, violating axe-core aria-hidden-focus
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

## [ISSUE-08-07] [v1.0][web_core] BasicCatalogA2uiLitElement only sets 'aria-description' without 'aria-describedby' fallback required by a2ui_protocol.md
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

## [ISSUE-08-08] [v1.0][web_core] Conformance test runner skips 'accessibility.yaml' and leaves validateAccessibilityCheckTestCase() unimplemented
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

---

## [ISSUE-09-01] [v1.0][docs] Public catalog guides still state surfaces are locked to a single catalog for their lifetime
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][docs] Public catalog guides still state surfaces are locked to a single catalog for their lifetime`

<!-- ISSUE_BODY_START -->
### Summary
In A2UI v1.0, a single surface can compose components and function calls from multiple catalogs registered on the renderer (`surface.availableCatalogs`) by specifying `catalogId` per component (`ComponentCommon.catalogId`) or per function call (`FunctionCommon.catalogId`), and `createSurface.catalogId` is optional (allowing catalogless surfaces where every item declares its own `catalogId`).

However, the public conceptual and developer guides in `docs/public/concepts/catalogs.md` and `docs/public/guides/defining-your-own-catalog.md` still state that a surface is locked to a single catalog selected at `createSurface` time for the lifetime of the surface.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/concepts/catalogs.md` (lines 375–386)
  - `docs/public/guides/defining-your-own-catalog.md` (lines 24–25)
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 211–252, "Support for Multiple Catalogs")

### Steps to Reproduce / Evidence
1. Inspect `docs/public/concepts/catalogs.md` (lines 375–386):
   > *"3. Surface Creation (Agent to Client): When the agent creates a new surface, it selects the best match from the client's `supportedCatalogIds` list. This choice is locked for the lifetime of that surface."*
2. Inspect `docs/public/guides/defining-your-own-catalog.md` (lines 24–25):
   > *"Each surface renders using a single catalog, selected when the surface is created."*
3. Compare with `specification/v1_0/docs/a2ui_protocol.md` (lines 211–252) and `specification/v1_0/json/common_types.json` (`#/$defs/ComponentCommon` and `#/$defs/FunctionCommon`), which explicitly define per-component and per-function `catalogId` overrides on multi-catalog surfaces.

### Expected Behavior
`docs/public/concepts/catalogs.md` and `docs/public/guides/defining-your-own-catalog.md` should document A2UI v1.0's multi-catalog surface model:
- `createSurface.catalogId` sets the surface's optional `defaultCatalog` (rather than locking the surface to a single catalog).
- Individual components in `updateComponents` can override the surface default via `ComponentCommon.catalogId`.
- Individual function calls (`@call`) can override the surface default via `FunctionCommon.catalogId`.
- `createSurface` may omit `catalogId` altogether in v1.0 when every component and function call on the surface specifies an explicit `catalogId`.

### Actual Behavior
The public conceptual and custom-catalog guides tell developers that each surface is locked to a single catalog for its lifetime, contradicting the v1.0 specification and hiding multi-catalog composition.

### Suggested Fix
Update `docs/public/concepts/catalogs.md` (section "Catalog Negotiation & Surface Creation") and `docs/public/guides/defining-your-own-catalog.md` to explain how v1.0 surfaces resolve `createSurface.catalogId` (`defaultCatalog`) alongside per-component `ComponentCommon.catalogId` and per-function `FunctionCommon.catalogId` overrides across `surface.availableCatalogs`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-02] [v1.0][docs] concepts/catalogs.md instructs developers to clone all BASIC_COMPONENTS into custom catalogs instead of using v1.0 multi-catalog composition
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][docs] concepts/catalogs.md instructs developers to clone all BASIC_COMPONENTS into custom catalogs instead of using v1.0 multi-catalog composition`

<!-- ISSUE_BODY_START -->
### Summary
`docs/public/concepts/catalogs.md` instructs developers creating a custom catalog to spread `[...BASIC_COMPONENTS, customComponent]` and `[...BASIC_FUNCTIONS]` into their custom `Catalog` instance, warning that if they do not clone the Basic Catalog into their custom catalog, the agent will be unable to render standard layout primitives (`Row`, `Column`, `Card`, `Text`, `Button`) on the same surface. While that workaround was required in v0.8/v0.9, A2UI v1.0 natively supports keeping domain catalogs small and modular while using `basicCatalog` as the surface's `defaultCatalog`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/concepts/catalogs.md` (lines 189–245 and 295–309)

### Steps to Reproduce / Evidence
In `docs/public/concepts/catalogs.md` (lines 189–245 and 295–309), the guide recommends:
```ts
const myCustomCatalog = new Catalog(
  'https://my-company.com/catalogs/v1/custom.json',
  [...BASIC_COMPONENTS, customComponent],
  [...BASIC_FUNCTIONS],
);
```
and warns that omitting `BASIC_COMPONENTS` means *"the agent won't be able to use standard layout components like Row, Column, or Text on any surface using your catalog."*

### Expected Behavior
The guide should present v1.0 multi-catalog composition as the primary pattern:
1. Register `[basicCatalog, domainCatalogA, domainCatalogB]` with `MessageProcessor`.
2. Set `createSurface.catalogId` to `https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json` so layout primitives (`Column`, `Row`, `Card`, `Text`) need no `catalogId` property.
3. Keep `domainCatalogA` and `domainCatalogB` focused solely on domain-specific components and functions, referencing them via per-component and per-function `catalogId` overrides.

### Actual Behavior
Developers are taught to duplicate all Basic Catalog components and functions into every custom catalog, bloating `inlineCatalogs` payloads and defeating per-catalog modularity in v1.0.

### Suggested Fix
Update `docs/public/concepts/catalogs.md` to distinguish between:
- **v1.0 Multi-Catalog Surfaces (Recommended)**: Mixing `basicCatalog` with modular domain catalogs on the same surface via per-component/per-function `catalogId`.
- **Single-Catalog Extension (Legacy / Self-Contained)**: Cloning `BASIC_COMPONENTS` when targeting v0.8/v0.9 or when a single self-contained catalog URI is required.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-03] [v1.0][docs] Undocumented non-inheritance rule for nested @call expressions inside components with an explicit catalogId
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][docs] Undocumented non-inheritance rule for nested @call expressions inside components with an explicit catalogId`

<!-- ISSUE_BODY_START -->
### Summary
When a component in `updateComponents` specifies an explicit `"catalogId"` (e.g., `"https://example.com/catalogs/culinary/v1/catalog.json"`) on a surface whose `createSurface.catalogId` is `basicCatalog`, any nested function call (`{"@call": "calculatePerServingCost", "args": {...}}`) inside that component's properties does **not** inherit the enclosing component's `catalogId`. Instead, if the `@call` object omits `catalogId`, `@a2ui/web_core` resolves the function call against `surface.defaultCatalog` (`createSurface.catalogId`).

This critical non-inheritance rule is enforced in `@a2ui/web_core` (`nestedCallRunsInCatalog` in `payload-validator.ts`, `validateNestedFunctionCalls` in `message-processor.ts`, and `resolveDynamicValue` in `data-context.ts`), but is not documented in `specification/v1_0/docs/a2ui_protocol.md` or the public catalog guides.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 221–244, "Referencing Catalogs in Components and Functions")
  - `typescript/core/web_core/src/validation/payload-validator.ts` (lines 80–101, `nestedCallRunsInCatalog`)
  - `typescript/core/web_core/src/processing/message-processor.ts` (lines 853–884 and 925–1004, `validateNestedFunctionCalls`)
  - `typescript/core/web_core/src/resolution/data-context.ts` (lines 210–230)

### Steps to Reproduce / Evidence
Suppose a surface is created with `catalogId: "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json"`, and a custom component from `culinaryCatalog` (`https://example.com/catalogs/culinary/v1/catalog.json`) invokes a function from `culinaryCatalog` without repeating `catalogId` on the `@call` object:
```json
{
  "id": "pairing_card",
  "component": "WineAndCheesePairingCard",
  "catalogId": "https://example.com/catalogs/culinary/v1/catalog.json",
  "costPerServingLabel": {
    "@call": "calculatePerServingCost",
    "args": { "totalPrice": 28.5, "servings": 4 }
  }
}
```
In `typescript/core/web_core/src/validation/payload-validator.ts` (lines 92–101):
```ts
export function nestedCallRunsInCatalog(
  callCatalogId: string | undefined,
  catalogId: string,
  {catalogIsDefault}: {catalogIsDefault: boolean},
): boolean {
  if (callCatalogId === undefined) {
    return catalogIsDefault;
  }
  return callCatalogId === catalogId;
}
```
Because `callCatalogId` is `undefined` and `culinaryCatalog` is not the surface's `defaultCatalog`, `MessageProcessor.validateNestedFunctionCalls` resolves `calculatePerServingCost` against `surface.defaultCatalog` (`basicCatalog`), throwing:
`A2uiValidationError: Unknown function 'calculatePerServingCost' in catalog 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json'`.

### Expected Behavior
`specification/v1_0/docs/a2ui_protocol.md` ("Referencing Catalogs in Components and Functions") should explicitly state:
1. Function calls (`@call`) resolve their catalog **independently** of their enclosing component: if `FunctionCommon.catalogId` is omitted, the function call falls back directly to `createSurface.catalogId` (`surface.defaultCatalog`), **never** to the enclosing component's `ComponentCommon.catalogId`.
2. Conversely, system functions prefixed with `@` (such as `{"@call": "@index"}`) belong to no catalog and **must not** specify `catalogId` (enforced by `assertSystemCallNamesNoCatalog` in `payload-validator.ts` lines 60–66).

### Actual Behavior
Neither the non-inheritance of enclosing component `catalogId` on nested `@call` objects nor the prohibition of `catalogId` on `@index` system functions is documented in `a2ui_protocol.md`, leading agent authors to omit `catalogId` on domain `@call` expressions inside domain components.

### Suggested Fix
Document the exact 3-step catalog resolution rule for both components and nested `@call` expressions (plus the `@index` system function exception) in `specification/v1_0/docs/a2ui_protocol.md` (lines 221–244) with a concrete JSON example showing a custom-catalog component containing both a `basicCatalog` `@call` (no `catalogId` needed) and a custom-catalog `@call` (explicit `catalogId` required).
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-04] [v1.0][docs] Undocumented ChildSchema / ChildListSchema (markChildRef) requirement for custom container components
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][docs] Undocumented ChildSchema / ChildListSchema (markChildRef) requirement for custom container components`

<!-- ISSUE_BODY_START -->
### Summary
In `@a2ui/web_core`, topology validation (`buildComponentRefMap` / `getComponentReferences` in `integrity-checker.ts`) and runtime child node resolution (`NodeResolver`) determine which properties of a component hold child component IDs by inspecting an internal `WeakSet` brand attached by `markChildRef` to `ComponentIdSchema`, `ChildSchema`, and `ChildListSchema`.

If a developer defines a custom container component in a custom catalog using plain Zod (`z.string()` or `z.array(z.string())`) instead of `ChildSchema` or `ChildListSchema` from `@a2ui/web_core/v1_0`, `@a2ui/web_core` fails to recognize those properties as child component references. This requirement is completely undocumented in the public guides.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `docs/public/concepts/catalogs.md`
  - `docs/public/guides/defining-your-own-catalog.md`
  - `typescript/core/web_core/src/types/child-ref-helpers.ts` (`markChildRef`, `isChildRef`)
  - `typescript/core/web_core/src/catalog/reference-map.ts` (lines 34–41, `buildComponentRefMap`)
  - `typescript/core/web_core/src/v1_0/schema/common-types.ts` (lines 22–29 and 140–161, `ComponentIdSchema`, `ChildSchema`, `ChildListSchema`)

### Steps to Reproduce / Evidence
1. Define a custom container component using standard Zod `z.string()` for its `child` property:
   ```ts
   import { z } from 'zod';
   import { Catalog, STRICT_VALIDATION, MessageProcessor } from '@a2ui/web_core/v1_0';

   const CustomSpotlightBoxApi = {
     name: 'CustomSpotlightBox',
     schema: z.object({
       title: z.string(),
       child: z.string(), // Plain z.string() instead of ChildSchema
     }),
   };
   ```
2. Process an `updateComponents` message under `STRICT_VALIDATION` where `root` is a `CustomSpotlightBox` referencing `child: "inner_text"`.
3. `buildComponentRefMap` (`reference-map.ts`) does not record `child` in `singleRefs` because `z.string()` is not branded with `markChildRef`.
4. `SurfaceComponentsModel.validateTopology` throws:
   `A2uiValidationError: Orphaned component 'inner_text' is not reachable from root 'root'`.

### Expected Behavior
`docs/public/concepts/catalogs.md` and `docs/public/guides/defining-your-own-catalog.md` should document that custom container components **must** use `ChildSchema` (or `ComponentIdSchema`) for single child references and `ChildListSchema` for child arrays/templates imported from `@a2ui/web_core/v1_0` (`CommonSchemas.Child` / `CommonSchemas.ChildList`).

### Actual Behavior
Neither `docs/public/concepts/catalogs.md` nor `docs/public/guides/defining-your-own-catalog.md` mentions `ChildSchema`, `ChildListSchema`, or `markChildRef`, causing custom container components written with `z.string()` to fail topology reachability checks and runtime child node resolution.

### Suggested Fix
Add a "Defining Custom Container Components (`ChildSchema` & `ChildListSchema`)" section to `docs/public/concepts/catalogs.md` and `docs/public/guides/defining-your-own-catalog.md` with a code example importing `ChildSchema` and `ChildListSchema` from `@a2ui/web_core/v1_0`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-05] [v1.0][docs] Undocumented catalog reset on incremental updateComponents when catalogId is omitted in v1.0
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][docs] Undocumented catalog reset on incremental updateComponents when catalogId is omitted in v1.0`

<!-- ISSUE_BODY_START -->
### Summary
In A2UI v0.8 and v0.9, sending a follow-up `updateComponents` message for an existing component ID without specifying `catalogId` preserved the component's previously resolved catalog (`existing.catalog`). In A2UI v1.0 (`atLeastV1`), `MessageProcessor.resolveComponentCatalog` intentionally re-evaluates the catalog from scratch on every `updateComponents` message. Consequently, if an agent updates a custom-catalog component in a subsequent `updateComponents` message and omits `"catalogId"`, the component's catalog is silently reset to `surface.defaultCatalog` (`createSurface.catalogId`).

This v1.0 behavioral change is not documented in `specification/v1_0/docs/a2ui_protocol.md`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `specification/v1_0/docs/a2ui_protocol.md` (lines 211–252 and "Updating Components")
  - `typescript/core/web_core/src/processing/message-processor.ts` (lines 901–923, `resolveComponentCatalog`, and lines 1044–1061, `applyComponentUpdate`)

### Steps to Reproduce / Evidence
Inspect `typescript/core/web_core/src/processing/message-processor.ts` (lines 901–923):
```ts
private resolveComponentCatalog(
  comp: Record<string, unknown>,
  surface: SurfaceModel<T>,
  atLeastV1 = this.isSurfaceAtLeastV1(surface),
): Catalog<T> {
  if (!atLeastV1) {
    const id = comp['id'];
    const existing = typeof id === 'string' ? surface.componentsModel.get(id) : undefined;
    if (existing) {
      return existing.catalog as Catalog<T>;
    }
  }
  const raw = comp['catalogId'];
  const catalogId = typeof raw === 'string' ? raw : undefined;
  return surface.resolveCatalog(catalogId, `Component '${comp['id']}'`);
}
```
And in `applyComponentUpdate` (lines 1046–1055):
```ts
if (componentType !== existing.type || existing.catalog.id !== targetCatalog.id) {
  surface.componentsModel.removeComponent(id);
  surface.componentsModel.addComponent(
    new ComponentModel(id, componentType, properties, targetCatalog, metadata),
  );
}
```
If component `deal_card_1` is created with `catalogId: "https://example.com/catalogs/grocery/v1/catalog.json"` on a surface whose `defaultCatalog` is `basicCatalog`, and a subsequent `updateComponents` updates `deal_card_1` without repeating `catalogId`, `resolveComponentCatalog` returns `basicCatalog`, replacing the `ComponentModel` with one bound to `basicCatalog` (or failing strict validation because `ProductDealCard` is not in `basicCatalog`).

### Expected Behavior
`specification/v1_0/docs/a2ui_protocol.md` should explicitly document that `updateComponents` in v1.0 performs full component replacement including catalog binding: every `updateComponents` entry for a non-default-catalog component **must** repeat its `"catalogId"` property.

### Actual Behavior
`a2ui_protocol.md` does not mention that omitting `catalogId` on a subsequent `updateComponents` entry resets the component's catalog to the surface's `defaultCatalog`.

### Suggested Fix
Add a callout in `specification/v1_0/docs/a2ui_protocol.md` under "Support for Multiple Catalogs" / "Updating Components" clarifying that `updateComponents` entries in v1.0 do not inherit `catalogId` from prior revisions of the same component `id`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-06] [v1.0][docs] Missing React implementation guide for registering and mixing multiple Catalog instances
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][docs] Missing React implementation guide for registering and mixing multiple Catalog instances`

<!-- ISSUE_BODY_START -->
### Summary
`docs/public/guides/defining-your-own-catalog.md` contains a placeholder (`"Detailed guides for each framework coming soon"`) and provides no instructions or examples for registering multiple `Catalog` instances (`createComponentImplementation`, `createFunctionImplementation`) with `@a2ui/react` and `@a2ui/web_core/v1_0`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/react@0.14.0`
- **File path(s)**:
  - `docs/public/guides/defining-your-own-catalog.md` (line 39)

### Steps to Reproduce / Evidence
Inspect `docs/public/guides/defining-your-own-catalog.md` (line 39):
> *"Detailed guides for each framework coming soon."*

Developers using `@a2ui/react` with `@a2ui/web_core/v1_0` have no documentation explaining:
1. How to wrap a Zod component schema with `createComponentImplementation(api, renderFn)` and a function schema with `createFunctionImplementation(api, executeFn)`.
2. How to pass an array of `Catalog` instances (`[basicCatalog, domainCatalogA, domainCatalogB]`) to `MessageProcessor` so that `surface.availableCatalogs` contains all catalogs for a v1.0 mixed-catalog surface.

### Expected Behavior
`docs/public/guides/defining-your-own-catalog.md` should include a complete end-to-end TypeScript/React example showing how to define a custom `Catalog` with `createComponentImplementation` and `createFunctionImplementation`, register it alongside `basicCatalog` in `MessageProcessor`, and render a multi-catalog v1.0 surface.

### Actual Behavior
The guide stops at a `"coming soon"` placeholder with no React or multi-catalog example.

### Suggested Fix
Replace the placeholder in `docs/public/guides/defining-your-own-catalog.md` with a working `@a2ui/react` + `@a2ui/web_core/v1_0` multi-catalog registration and rendering example.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-07] [v1.0][web_core] generateValidationSchema localizes #/$defs/anyFunction to a single catalog, rejecting cross-catalog @calls and all @calls in component-only catalogs
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][web_core] generateValidationSchema localizes #/$defs/anyFunction to a single catalog, rejecting cross-catalog @calls and all @calls in component-only catalogs`

<!-- ISSUE_BODY_START -->
### Summary
In `specification/v1_0/json/common_types.json`, `FunctionCall` is defined as:
```json
"FunctionCall": {
  "allOf": [
    { "$ref": "#/$defs/FunctionCommon" },
    { "$ref": "catalog.json#/$defs/anyFunction" }
  ]
}
```
When `@a2ui/web_core` generates `catalog.validationSchema` in `generateValidationSchema` (`typescript/core/web_core/src/catalog/schema_generator.ts`), it rewrites `catalog.json#/$defs/anyFunction` to the local `#/$defs/anyFunction` of **that single catalog only**. Worse still, if a custom catalog defines components but `0` functions, `buildCatalogDefinitions` sets `#/$defs/anyFunction` to `{ "not": {} }`.

As a result:
1. Validating a payload against `catalog.validationSchema` fails whenever a component in Catalog A invokes a `@call` from Catalog B (even when `FunctionCommon.catalogId` explicitly names Catalog B).
2. If a custom catalog defines components and `0` functions, its `#/$defs/anyFunction` is `{ "not": {} }`, so its JSON Schema rejects **every** dynamic `@call` (even `basicCatalog` functions like `formatString` or `formatCurrency`) inside any property (`DynamicString`, `DynamicNumber`, `DynamicBoolean`, `DynamicValue`) of that catalog's components!

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/catalog/schema_generator.ts` (lines 850–880, 915–931, and 1071–1100)
  - `specification/v1_0/json/common_types.json` (`#/$defs/FunctionCall`)

### Steps to Reproduce / Evidence
In `typescript/core/web_core/src/catalog/schema_generator.ts` (lines 1071–1100):
```ts
const functionNames = Object.keys(functions);
if (functionNames.length > 0) {
  defs['anyFunction'] = {
    oneOf: functionNames.map(name => ({$ref: `#/$defs/functions/${name}`})),
  };
} else {
  defs['anyFunction'] = {not: {}};
}
```
And in `localizeCommonTypesDefs` (lines 915–931), `catalog.json#/$defs/anyFunction` inside `FunctionCall` is rewritten to `#/$defs/anyFunction`.

Reproduction snippet:
```ts
import { z } from 'zod';
import { Catalog, DynamicStringSchema } from '@a2ui/web_core/v1_0';

// A component-only domain catalog (0 functions of its own):
const dealCatalog = new Catalog(
  'https://example.com/catalogs/grocery/v1/catalog.json',
  [
    {
      name: 'ProductDealCard',
      schema: z.object({
        title: DynamicStringSchema,
      }),
    },
  ],
  [], // 0 functions in this catalog
  { protocolVersion: '1.0' },
);

console.log(JSON.stringify(dealCatalog.validationSchema.$defs.anyFunction));
// Prints: {"not":{}}
// Any ProductDealCard that uses {"@call": "formatString", ...} in `title` is rejected by dealCatalog.validationSchema!
```

### Expected Behavior
1. In a v1.0 multi-catalog environment, a `FunctionCall` inside a component property may target `surface.defaultCatalog` or any catalog in `surface.availableCatalogs` via `FunctionCommon.catalogId`, or invoke a system function (`@index`).
2. A component-only catalog (`functions: []`) must not emit `anyFunction: { not: {} }` in a way that forbids its `DynamicString` / `DynamicNumber` / `DynamicBoolean` properties from invoking functions from `basicCatalog` or other catalogs on the surface.

### Actual Behavior
`generateValidationSchema` locks `#/$defs/anyFunction` to the single catalog's local functions and emits `{ "not": {} }` when `functions` is empty, making `catalog.validationSchema` unusable for mixed-catalog surfaces and component-only domain catalogs.

### Suggested Fix
1. Allow `generateValidationSchema` (or a multi-catalog schema composer) to accept linked/companion `Catalog` instances so `#/$defs/anyFunction` and `#/$defs/anyComponent` include the union of available catalogs on the surface, plus `IndexSystemFunction`.
2. For a standalone catalog schema where external catalogs may be mixed at runtime, allow `FunctionCall` when `FunctionCommon.catalogId` is a valid catalog URI distinct from the current catalog's ID, or when the catalog has no local functions.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-08] [v1.0][web_core] MessageProcessor defaults validationConfig to undefined (allowUnknownElements = true), silently binding unknown components to defaultCatalog
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][web_core] MessageProcessor defaults validationConfig to undefined (allowUnknownElements = true), silently binding unknown components to defaultCatalog`

<!-- ISSUE_BODY_START -->
### Summary
When constructing `new MessageProcessor([basicCatalog, customCatalog])` without explicitly passing `{ validationConfig: STRICT_VALIDATION }` (or `allowUnknownElements: false`), `this.validationConfig` defaults to `undefined`. In `PayloadValidator` (`typescript/core/web_core/src/validation/payload-validator.ts`), an undefined `config` sets `this.allowUnknown = true`, which completely skips unknown-component and unknown-function errors!

On a mixed-catalog surface, if an agent forgets to include `"catalogId"` on a custom component (e.g., `ProductDealCard` from `groceryCatalog`), `MessageProcessor` resolves the component's catalog to `surface.defaultCatalog` (`basicCatalog`), `PayloadValidator` silently ignores the fact that `ProductDealCard` does not exist in `basicCatalog`, and `MessageProcessor` stores `new ComponentModel(id, 'ProductDealCard', props, basicCatalog)` with the wrong catalog attached.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/processing/message-processor.ts` (lines 196–206 and 1018–1061)
  - `typescript/core/web_core/src/validation/payload-validator.ts` (lines 155–165 and 200–213)

### Steps to Reproduce / Evidence
In `typescript/core/web_core/src/validation/payload-validator.ts` (lines 162–164 and 200–205):
```ts
private get allowUnknown(): boolean {
  return this.config ? (this.config.allowUnknownElements ?? false) : true;
}
...
const componentApi = this.catalog.components.get(componentType);
if (!componentApi) {
  if (!this.allowUnknown) {
    throw new A2uiValidationError(
      `Unknown component type '${componentType}' not found in catalog '${this.catalog.id}'.`,
    );
  }
  this.validateNestedFunctions(properties, componentCatalogId);
  return;
}
```
Reproduction snippet:
```ts
import { z } from 'zod';
import { Catalog, MessageProcessor, basicCatalog } from '@a2ui/web_core/v1_0';

const groceryCatalog = new Catalog(
  'https://example.com/catalogs/grocery/v1/catalog.json',
  [{ name: 'ProductDealCard', schema: z.object({ title: z.string() }) }],
  [],
  { protocolVersion: '1.0' },
);

// Default constructor (no validationConfig passed):
const processor = new MessageProcessor([basicCatalog, groceryCatalog]);
processor.processMessages([
  {
    version: 'v1.0',
    createSurface: {
      surfaceId: 'shop',
      catalogId: basicCatalog.id,
    },
  },
  {
    version: 'v1.0',
    updateComponents: {
      surfaceId: 'shop',
      components: [
        // Agent forgot `catalogId: groceryCatalog.id`
        { id: 'root', component: 'ProductDealCard', title: 'Organic Strawberries' },
      ],
    },
  },
]);

const surface = processor.model.getSurface('shop')!;
console.log(surface.componentsModel.get('root')?.catalog.id);
// Actual: "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json" (silently bound to basicCatalog!)
```

### Expected Behavior
1. `MessageProcessor` should reject unknown component types and unknown functions by default (`allowUnknownElements: false`), or at minimum when a component type is not found in the resolved catalog (`basicCatalog`) on a multi-catalog surface, check whether it exists in another catalog in `surface.availableCatalogs` and emit a clear validation error or warning indicating the missing `catalogId`.

### Actual Behavior
With default `MessageProcessor` options, omitting `catalogId` on a custom component silently binds `ComponentModel.catalog` to `basicCatalog` without any validation error, causing downstream renderers to fail later when looking up the component implementation in `basicCatalog`.

### Suggested Fix
Default `allowUnknownElements` to `false` for v1.0 surfaces (or set `this.validationConfig = options?.validationConfig ?? { allowUnknownElements: false }`), and enhance the error message in `MessageProcessor` when `componentType` exists in a sibling catalog in `surface.availableCatalogs`:
```ts
// Hint when componentType exists in another available catalog on the surface:
`Unknown component type '${componentType}' not found in catalog '${targetCatalog.id}'. (Found in available catalog '${matchingSiblingCatalog.id}' — did you forget to set "catalogId"?)`
```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-09] [v1.0][web_core] ComponentModel.componentTree strips catalogId, losing per-component catalog overrides upon serialization
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][web_core] ComponentModel.componentTree strips catalogId, losing per-component catalog overrides upon serialization`

<!-- ISSUE_BODY_START -->
### Summary
In `MessageProcessor.applyComponentUpdate` (`typescript/core/web_core/src/processing/message-processor.ts`, line 1038), `catalogId` is destructured and stripped from `properties` before creating `new ComponentModel(id, componentType, properties, targetCatalog, metadata)`. However, `ComponentModel.componentTree` (`typescript/core/web_core/src/state/component-model.ts`, lines 72–78) reconstructs the serialized component object using only `id`, `component`, `this._properties`, and `metadata`, omitting `catalogId: this.catalog.id`.

Consequently, reading `componentModel.componentTree` on any multi-catalog surface loses the component's `catalogId`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/state/component-model.ts` (lines 72–78)
  - `typescript/core/web_core/src/processing/message-processor.ts` (line 1038)

### Steps to Reproduce / Evidence
In `typescript/core/web_core/src/state/component-model.ts` (lines 72–78):
```ts
  /**
   * Serialized JSON representation of the component definition.
   */
  get componentTree(): any {
    return {
      ...this._properties,
      id: this.id,
      component: this.type,
      ...(this.metadata !== undefined ? {metadata: this.metadata} : {}),
    };
  }
```
Reproduction snippet:
```ts
const compModel = surface.componentsModel.get('deal_card_1')!;
console.log(compModel.catalog.id);
// "https://example.com/catalogs/grocery/v1/catalog.json"

console.log(compModel.componentTree);
// { id: "deal_card_1", component: "ProductDealCard", title: "..." }
// Notice `catalogId` is completely missing!
```

### Expected Behavior
`ComponentModel.componentTree` should preserve `catalogId: this.catalog.id` (at least whenever `this.catalog?.id` is present) so that serialized component definitions accurately reflect the component's catalog in v1.0 multi-catalog surfaces and can be round-tripped through `updateComponents`.

### Actual Behavior
`ComponentModel.componentTree` drops `catalogId`, causing any round-trip or inspection of `componentTree` on a mixed-catalog surface to lose per-component catalog bindings.

### Suggested Fix
Update `ComponentModel.componentTree` in `typescript/core/web_core/src/state/component-model.ts`:
```ts
  get componentTree(): any {
    return {
      ...this._properties,
      id: this.id,
      component: this.type,
      ...(this.catalog?.id ? {catalogId: this.catalog.id} : {}),
      ...(this.metadata !== undefined ? {metadata: this.metadata} : {}),
    };
  }
```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-10] [v1.0][web_core] SurfaceModel.dispatchAction checks unreachable action.catalogId rejected by strict ActionSchema and omits source component catalogId
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][web_core] SurfaceModel.dispatchAction checks unreachable action.catalogId rejected by strict ActionSchema and omits source component catalogId`

<!-- ISSUE_BODY_START -->
### Summary
In `SurfaceModel.dispatchAction` (`typescript/core/web_core/src/state/surface-model.ts`, lines 280–283), the method checks:
```ts
const catalogId = eventPayload.catalogId ?? payload.catalogId;
if (typeof catalogId === 'string' && catalogId) {
  actionToDispatch.catalogId = catalogId;
}
```
However:
1. `ActionSchema` in `typescript/core/web_core/src/v1_0/schema/common-types.ts` (lines 235–262) and `specification/v1_0/json/common_types.json` (`#/$defs/Action`) applies `.strict()` (`additionalProperties: false`) to both the outer `{ event: ... }` object and the inner `event` object (`{ name, userMessage, context }`), and **neither** schema permits a `catalogId` property. Any component payload that includes `catalogId` on an `action` or `action.event` fails `PayloadValidator` validation with `Unrecognized key(s) in object: 'catalogId'`.
2. When a user triggers an action from a component belonging to a non-default catalog on a mixed-catalog surface (e.g., `ProductDealCard` from `groceryCatalog`), `dispatchAction` receives `sourceComponentId` but never looks up `this.componentsModel.get(sourceComponentId)?.catalog.id`, so the emitted `ActionPayload` lacks `catalogId`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/state/surface-model.ts` (lines 51–56 and 280–283)
  - `typescript/core/web_core/src/v1_0/schema/common-types.ts` (lines 235–262, `ActionSchema`)
  - `specification/v1_0/json/common_types.json` (`#/$defs/Action`)

### Steps to Reproduce / Evidence
1. In `typescript/core/web_core/src/v1_0/schema/common-types.ts` (lines 235–254):
   ```ts
   export const ActionSchema = z.union([
     z.object({
       'event': z.object({
         'name': z.string(),
         'userMessage': DynamicStringSchema.optional(),
         'context': z.record(z.string(), DynamicValueSchema).optional(),
       }).strict(),
     }).strict(),
     z.object({'functionCall': FunctionCallSchema}).strict(),
   ]);
   ```
2. Passing `{ event: { name: 'clipCoupon', catalogId: 'https://example.com/catalogs/grocery/v1/catalog.json' } }` on a `Button` action is rejected by `ActionSchema.safeParse` because `.strict()` forbids `catalogId`.
3. Passing `{ event: { name: 'clipCoupon' } }` from a component whose `ComponentModel.catalog.id` is `https://example.com/catalogs/grocery/v1/catalog.json` emits an `ActionPayload` where `action.catalogId` is `undefined`.

### Expected Behavior
1. Either `ActionSchema` (`#/$defs/Action` in `common_types.json` and `common-types.ts`) should allow an optional `catalogId?: string` on `event`, **or** `SurfaceModel.dispatchAction` should fall back to the source component's catalog (`this.componentsModel.get(sourceComponentId)?.catalog.id`) when `sourceComponentId` belongs to a non-default catalog on the surface.

### Actual Behavior
`eventPayload.catalogId ?? payload.catalogId` in `SurfaceModel.dispatchAction` is unreachable for any schema-validated component action, and actions dispatched from custom-catalog components on a mixed-catalog surface never carry `catalogId`.

### Suggested Fix
1. Add optional `'catalogId': z.string().optional()` to `ActionSchema`'s `event` object in `specification/v1_0/json/common_types.json` and `typescript/core/web_core/src/v1_0/schema/common-types.ts`.
2. In `SurfaceModel.dispatchAction` (`surface-model.ts`, line 280), fall back to the source component's catalog ID when it differs from `this.defaultCatalog?.id`:
   ```ts
   const sourceCatalogId = this.componentsModel.get(sourceComponentId)?.catalog?.id;
   const catalogId =
     eventPayload.catalogId ??
     payload.catalogId ??
     (sourceCatalogId && sourceCatalogId !== this.defaultCatalog?.id ? sourceCatalogId : undefined);
   ```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-11] [v1.0][web_core] serializeComponentModel emits inner unevaluatedProperties: false in Catalog.toJson(), breaking Catalog.fromJson() round-trips for ComponentCommon fields
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][web_core] serializeComponentModel emits inner unevaluatedProperties: false in Catalog.toJson(), breaking Catalog.fromJson() round-trips for ComponentCommon fields`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/core/web_core/src/catalog/schema_serializer.ts` (lines 309–338, `serializeComponentModel`), serializing a code-defined `Catalog` to JSON via `catalog.toJson()` unconditionally adds `unevaluatedProperties: false` to the inner component object schema (unless the component was marked with internal `specComponent()` metadata used only by `basicCatalog`), **without** adding `{ $ref: 'common_types.json#/$defs/ComponentCommon' }` to that inner object.

When that serialized catalog JSON is subsequently loaded via `Catalog.fromJson(catalog.toJson())` (for example, when transmitting `inlineCatalogs` or generating `catalog.validationSchema`), `authoredClosure(source)` in `schema_generator.ts` (lines 663–700) sees `unevaluatedProperties: false` on the inner component schema and treats it as closed. As a result, **every** `ComponentCommon` envelope property (`id`, `catalogId`, `accessibility`, `metadata`) is rejected by both `Catalog.fromJson()`'s Zod validator and `catalog.validationSchema`!

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/catalog/schema_serializer.ts` (lines 309–338, `serializeComponentModel`)
  - `typescript/core/web_core/src/catalog/schema_generator.ts` (lines 663–700, `processSingleComponent` / `authoredClosure`)
  - `typescript/core/web_core/src/catalog/schema_parser.ts` (lines 380–420)

### Steps to Reproduce / Evidence
In `typescript/core/web_core/src/catalog/schema_serializer.ts` (lines 325–337):
```ts
  if (version === '1.0') {
    delete jsonSchema['additionalProperties'];
    if (!specMeta?.openEnded) {
      jsonSchema['unevaluatedProperties'] =
        typeof extra === 'boolean' || isObject(extra) ? extra : false;
    }
  }
```
Reproduction snippet:
```ts
import { z } from 'zod';
import { Catalog, MessageProcessor, STRICT_VALIDATION } from '@a2ui/web_core/v1_0';

const originalCatalog = new Catalog(
  'https://example.com/catalogs/grocery/v1/catalog.json',
  [
    {
      name: 'ProductDealCard',
      schema: z.object({
        title: z.string(),
      }),
    },
  ],
  [],
  { protocolVersion: '1.0' },
);

// Round-trip the catalog through JSON (as used by inlineCatalogs):
const roundTrippedCatalog = Catalog.fromJson(originalCatalog.toJson());

const processor = new MessageProcessor([roundTrippedCatalog], {
  validationConfig: STRICT_VALIDATION,
});

processor.processMessages([
  {
    version: 'v1.0',
    createSurface: {
      surfaceId: 's1',
      catalogId: roundTrippedCatalog.id,
    },
  },
  {
    version: 'v1.0',
    updateComponents: {
      surfaceId: 's1',
      components: [
        {
          id: 'root',
          component: 'ProductDealCard',
          title: 'Sale',
          accessibility: { label: 'Sale card' }, // ComponentCommon property!
        },
      ],
    },
  },
]);
```
Running this throws or fails schema validation on `ComponentCommon` fields (`id`, `catalogId`, `accessibility`, `metadata`) because `originalCatalog.toJson().components.ProductDealCard` has `unevaluatedProperties: false` on the inner schema without `allOf: [{ $ref: 'common_types.json#/$defs/ComponentCommon' }, ...]`.

### Expected Behavior
`catalog.toJson()` for a v1.0 `Catalog` must either:
1. Wrap the serialized component schema in `allOf: [{ $ref: 'common_types.json#/$defs/ComponentCommon' }, { type: 'object', properties: ... }]` before placing `unevaluatedProperties: false` on the outer schema (matching the official `specification/v1_0/json/catalogs/basic/catalog.json` structure), **or**
2. Omit `unevaluatedProperties: false` on the inner component body so `generateValidationSchema` and `Catalog.fromJson` can wrap it with `ComponentCommon` and apply outer `unevaluatedProperties: false`.

### Actual Behavior
`serializeComponentModel` emits `unevaluatedProperties: false` directly on the inner component body without `ComponentCommon`, breaking `Catalog.fromJson(catalog.toJson())` and `catalog.validationSchema` for `ComponentCommon` properties (`id`, `catalogId`, `accessibility`, `metadata`).

### Suggested Fix
In `typescript/core/web_core/src/catalog/schema_serializer.ts` (`serializeComponentModel`, lines 325–337), include `{ $ref: 'common_types.json#/$defs/ComponentCommon' }` in an `allOf` wrapper when emitting `unevaluatedProperties: false` for v1.0 components, matching `specification/v1_0/json/catalogs/basic/catalog.json`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-12] [v1.0][web_core] Component composition constraint validation (allowedParents / allowedChildren) ignores catalogId namespaces
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][web_core] Component composition constraint validation (allowedParents / allowedChildren) ignores catalogId namespaces`

<!-- ISSUE_BODY_START -->
### Summary
In `typescript/core/web_core/src/state/validation-helpers.ts` (lines 226–284 and 348–501), component composition rules (`allowedParents` and `allowedChildren`) compare bare component `type` strings (`!allowedParents.includes(parentInfo.parentType)` and `!allowedChildren.includes(childType)`) without qualifying by or checking each component's `catalog.id`.

On a mixed-catalog surface where two catalogs define components with the same name (for example, `Card` in `basicCatalog` vs. `Card` in a custom domain catalog, or `ListItem` in two domain catalogs), `validateParentConstraints` and `validateChildConstraints` cannot distinguish which catalog the parent or child component belongs to.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/state/validation-helpers.ts` (lines 259–284 and 348–501, `validateParentConstraints`, `validateChildConstraints`, `buildCompositionTopology`, `validateCompositionConstraints`)

### Steps to Reproduce / Evidence
Inspect `typescript/core/web_core/src/state/validation-helpers.ts` (lines 370–398):
```ts
  for (const parentInfo of parents) {
    if (!allowedParents.includes(parentInfo.parentType)) {
      throw new A2uiValidationError(
        `Component '${id}' (${componentType}) cannot be placed under parent '${parentInfo.parentId}' (${parentInfo.parentType || 'unknown'}). Allowed parents: ${JSON.stringify(allowedParents)}.`,
        undefined,
        'UNALLOWED_PARENT',
      );
    }
  }
...
function validateChildConstraints(
  id: string,
  componentType: string,
  allowedChildren: string[],
  children: readonly string[],
  typeMap: {get(id: string): string | undefined},
): void {
  for (const childId of children) {
    const childType = typeMap.get(childId);
    if (childType && !allowedChildren.includes(childType)) {
      ...
```
Neither `parentInfo` nor `typeMap` checks `compCatalogMap.get(parentId)` or `compCatalogMap.get(childId)`.

### Expected Behavior
Composition constraints (`allowedParents` / `allowedChildren`) on a multi-catalog surface should either scope unprefixed component names to the declaring component's own catalog (or `surface.defaultCatalog`) and support catalog-qualified names (e.g. `${catalogId}#${componentName}`), or verify catalog identity when two catalogs define the same component name.

### Actual Behavior
`validateParentConstraints` and `validateChildConstraints` match bare `componentType` strings across all catalogs on the surface, causing false positives or false negatives when two catalogs on the same surface share a component name.

### Suggested Fix
Pass `compCatalogMap` into `validateParentConstraints` and `validateChildConstraints` in `typescript/core/web_core/src/state/validation-helpers.ts` so composition constraints can verify the parent/child's `Catalog` instance (and support optional `${catalogId}#${type}` entries for cross-catalog constraints).
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-13] [v1.0][web_core] RpcHandler.resolveFunctionImplementation ignores surface.defaultCatalog when catalogId is omitted and defaults allowedCallers to rendererOnly
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][web_core] RpcHandler.resolveFunctionImplementation ignores surface.defaultCatalog when catalogId is omitted and defaults allowedCallers to rendererOnly`

<!-- ISSUE_BODY_START -->
### Summary
When an agent sends a v1.0 `callRendererFunction` message on a multi-catalog surface, `RpcHandler` (`typescript/core/web_core/src/rpc/rpc-handler.ts`) has two bugs that break function resolution and execution:
1. **Ignores `surface.defaultCatalog` when `callFunction.catalogId` is omitted**: In `RpcHandler.resolveFunctionImplementation` (lines 400–418), if `callFunction.catalogId` is omitted (`undefined`), `catalog` is only resolved when `this.catalogs.size === 1`. Whenever `this.catalogs.size > 1` (every multi-catalog renderer!) or when `this.catalogs` is empty and catalogs live on `context.surface`, `catalog` remains `undefined` and `resolveFunctionImplementation` returns `{ error: 'No catalog available for function resolution.' }` instead of falling back to `context?.surface?.defaultCatalog`!
2. **`createFunctionImplementation` leaves `allowedCallers` `undefined` (`'rendererOnly'`)**: In `typescript/core/web_core/src/catalog/types.ts` (lines 141–172), `createFunctionImplementation(api, execute)` does not accept or copy an `allowedCallers` option unless manually mutated onto `api`. In `RpcHandler.checkExecutionPermissions` (lines 517–526), `const allowedCallers = fn.allowedCallers ?? 'rendererOnly'` rejects all `callRendererFunction` RPCs with `ExecutionDenied` unless `allowedCallers: 'rendererOrAgent'` or `'agentOnly'` was manually attached.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/rpc/rpc-handler.ts` (lines 400–418, `resolveFunctionImplementation`, and lines 517–526, `checkExecutionPermissions`)
  - `typescript/core/web_core/src/catalog/types.ts` (lines 141–172, `createFunctionImplementation`)

### Steps to Reproduce / Evidence
Inspect `typescript/core/web_core/src/rpc/rpc-handler.ts` (lines 400–418):
```ts
  private resolveFunctionImplementation(
    funcName: string,
    catalogId: string | undefined,
    context?: DataContext,
  ): {fn?: FunctionImplementation; error?: string} {
    let catalog: Catalog<ComponentApi, FunctionImplementation> | undefined;

    if (catalogId) {
      catalog =
        this.catalogs.get(catalogId) ??
        (context?.surface?.availableCatalogs?.get(catalogId) as
          | Catalog<ComponentApi, FunctionImplementation>
          | undefined);
      if (!catalog) {
        return {error: `Catalog '${catalogId}' not found.`};
      }
    } else if (this.catalogs.size === 1) {
      catalog = this.catalogs.values().next().value;
    }

    if (!catalog) {
      return {error: 'No catalog available for function resolution.'};
    }
```
Notice that when `catalogId` is `undefined` and `this.catalogs.size > 1` (e.g., `[basicCatalog, groceryCatalog, culinaryCatalog]`), `context?.surface?.defaultCatalog` is never checked!

### Expected Behavior
1. When `catalogId` is omitted on `callRendererFunction.callFunction`, `RpcHandler.resolveFunctionImplementation` should resolve against `context?.surface?.defaultCatalog` (matching `SurfaceModel.resolveCatalog` and the v1.0 specification: *"If `catalogId` is omitted, falls back to the `catalogId` specified in `createSurface`"*), before falling back to `this.catalogs.size === 1`.
2. `createFunctionImplementation` should document and accept an optional `{ allowedCallers?: AllowedCallers }` parameter (or preserve `api.allowedCallers`).

### Actual Behavior
On any renderer with 2+ catalogs registered, `callRendererFunction` fails with `'No catalog available for function resolution.'` whenever `callFunction.catalogId` is omitted, even when the target `surfaceId` has a valid `defaultCatalog`.

### Suggested Fix
In `typescript/core/web_core/src/rpc/rpc-handler.ts` (lines 415–418), fall back to `context?.surface?.defaultCatalog`:
```ts
    } else if (context?.surface?.defaultCatalog) {
      catalog = context.surface.defaultCatalog as Catalog<ComponentApi, FunctionImplementation>;
    } else if (this.catalogs.size === 1) {
      catalog = this.catalogs.values().next().value;
    }
```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-09-14] [v1.0][react] @a2ui/react prepareCatalogs mutates shared Catalog.components Map in-place and Catalog.componentRefMap hardcodes V09_CHILD_REF_OPTIONS
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Title**: `[v1.0][react] @a2ui/react prepareCatalogs mutates shared Catalog.components Map in-place and Catalog.componentRefMap hardcodes V09_CHILD_REF_OPTIONS`

<!-- ISSUE_BODY_START -->
### Summary
Two closely related catalog-handling bugs affect `@a2ui/react@0.14.0` and `@a2ui/web_core@0.14.0` when rendering multi-catalog v1.0 surfaces:
1. **`@a2ui/react` `prepareCatalogs(surface)` mutates `Catalog.components` in-place**: When `@a2ui/react` prepares a surface for rendering, `prepareCatalogs(surface)` iterates over `surface.availableCatalogs` and mutates `(catalog.components as Map).set(name, toWebComponent(implementation))` directly on the shared `Catalog` instance (even though `Catalog.components` is typed as `ReadonlyMap<string, T>`). Across multiple surfaces or re-renders sharing the same `Catalog` instances, this mutates the global catalog registry in-place.
2. **`Catalog.componentRefMap` hardcodes `V09_CHILD_REF_OPTIONS` regardless of `this.protocolVersion`**: In `typescript/core/web_core/src/catalog/types.ts` (line 289), `get componentRefMap()` calls `buildComponentRefMap(this, V09_CHILD_REF_OPTIONS)` unconditionally instead of selecting `V10_CHILD_REF_OPTIONS` when `this.protocolVersion === '1.0'` (or `V08_CHILD_REF_OPTIONS` for `0.8`).

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm packages `@a2ui/web_core@0.14.0`, `@a2ui/react@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/catalog/types.ts` (lines 285–292, `get componentRefMap()`)
  - `renderers/react/src/` (compiled in `@a2ui/react@0.14.0` `dist/chunk-QAAGXJWH.js`, lines 183–199, `prepareCatalogs`)

### Steps to Reproduce / Evidence
1. Inspect `typescript/core/web_core/src/catalog/types.ts` (lines 285–292):
   ```ts
   get componentRefMap(): ComponentRefMap {
     if (!this._componentRefMap) {
       this._componentRefMap = buildComponentRefMap(this, V09_CHILD_REF_OPTIONS);
     }
     return this._componentRefMap;
   }
   ```
   Even though `V10_CHILD_REF_OPTIONS` is defined and exported in `typescript/core/web_core/src/v1_0/standard_defs.ts`, `Catalog.componentRefMap` never uses `V10_CHILD_REF_OPTIONS` for v1.0 catalogs!
2. Inspect `@a2ui/react@0.14.0` (`dist/chunk-QAAGXJWH.js`, lines 183–199):
   ```js
   function prepareCatalogs(surface) {
     const catalogs = surface.availableCatalogs?.length
       ? surface.availableCatalogs
       : surface.defaultCatalog ? [surface.defaultCatalog] : [];
     for (const catalog of catalogs) {
       for (const [name, implementation] of catalog.components.entries()) {
         if (!isWebComponent(implementation)) {
           catalog.components.set(name, toWebComponent(implementation));
         }
       }
     }
   }
   ```
   Note also that in `@a2ui/web_core@0.14.0`, `surface.availableCatalogs` is a `ReadonlyMap<string, Catalog>` (not an `Array`), so checking `surface.availableCatalogs?.length` evaluates to `undefined` (`falsy`) on `Map` instances, causing `prepareCatalogs` to fall back to `[surface.defaultCatalog]` and **skip preparing all non-default catalogs in `surface.availableCatalogs`**!

### Expected Behavior
1. In `@a2ui/react`, `prepareCatalogs(surface)` must iterate `surface.availableCatalogs.values()` (since `surface.availableCatalogs` is a `ReadonlyMap`, not an array!) so non-default catalogs on a multi-catalog surface are prepared, and should cache web-component wrappers in a `WeakMap` rather than mutating `Catalog.components` in-place.
2. In `typescript/core/web_core/src/catalog/types.ts`, `Catalog.componentRefMap` should select `V10_CHILD_REF_OPTIONS` when `isAtLeastVersion(this.protocolVersion, '1.0')`.

### Actual Behavior
1. `surface.availableCatalogs?.length` in `@a2ui/react`'s `prepareCatalogs` is always `undefined` because `surface.availableCatalogs` is a `Map`, causing `@a2ui/react` to ignore every non-default catalog on a mixed-catalog surface, while mutating `surface.defaultCatalog.components` in-place.
2. `Catalog.componentRefMap` hardcodes `V09_CHILD_REF_OPTIONS` even for v1.0 catalogs.

### Suggested Fix
1. In `@a2ui/react`, update `prepareCatalogs` to read `Array.from(surface.availableCatalogs?.values() ?? [])` instead of checking `.length`, and store wrapped implementations in a `WeakMap<ComponentImplementation, WebComponentImplementation>` instead of mutating `catalog.components`.
2. In `typescript/core/web_core/src/catalog/types.ts` (line 288), select `V10_CHILD_REF_OPTIONS` when `isAtLeastVersion(this.protocolVersion, '1.0')`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-10-01] [Docs][Transports] docs/public/concepts/transports.md contains placeholder '// TODO: Add an example' blocks for HTTP/REST, WebSockets, and Server-Sent Events (SSE)
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Streaming in Direct JSON / Transports`
- **Title**: `[Docs][Transports] docs/public/concepts/transports.md contains placeholder '// TODO: Add an example' blocks for HTTP/REST, WebSockets, and Server-Sent Events (SSE)`

<!-- ISSUE_BODY_START -->
### Summary
The public transport documentation in `docs/public/concepts/transports.md` lists **REST API**, **WebSockets**, and **SSE (Server-Sent Events)** under "Available Transports" and "Custom Transports", but every code block under "Custom Transports" (lines 54–71) is a literal `// TODO: Add an example` placeholder, and the A2A section (line 40) also contains a `TODO: Add a detailed guide.` placeholder. Developers implementing progressive Direct JSON streaming over SSE or NDJSON have no reference on how to frame A2UI v1.0 envelopes or wire them into `MessageProcessor`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**: `docs/public/concepts/transports.md` (lines 40, 50–71)

### Steps to Reproduce / Evidence
Inspect `docs/public/concepts/transports.md` lines 50–71:

````markdown
## Custom Transports

You can use any transport that sends JSON:

**HTTP/REST:**

```javascript
// TODO: Add an example
```

**WebSockets:**

```javascript
// TODO: Add an example
```

**Server-Sent Events:**

```javascript
// TODO: Add an example
```
````

### Expected Behavior
`docs/public/concepts/transports.md` should provide working server and client examples for:
1. **HTTP/REST** (returning a single-shot v1.0 `createSurface` with inline `components` and `dataModel`, or `{ "messages": [...] }` matching `agent_to_renderer_list_wrapper.json`).
2. **Server-Sent Events (SSE) / NDJSON** (streaming `createSurface`, incremental `updateComponents` batches, and JSON Pointer `updateDataModel` updates into `MessageProcessor.processMessages([envelope])`).
3. **WebSockets** (bidirectional streaming of `agent_to_renderer.json` and `renderer_to_agent.json` `action` / `rendererFunctionResponse` envelopes).

### Actual Behavior
All three custom transport code blocks render literal `// TODO: Add an example` comments on the public docs site.

### Suggested Fix
Replace the `// TODO: Add an example` blocks in `docs/public/concepts/transports.md` with concise, copy-pasteable TypeScript/JavaScript examples showing how to stream A2UI v1.0 Direct JSON envelopes over `fetch` / `EventSource` / `WebSocket` and apply each message via `processor.processMessages([msg])`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-10-02] [Docs][v1.0] docs/public/concepts/data-flow.md and docs/public/reference/messages.md omit A2UI v1.0, inline createSurface.components/dataModel, required updateDataModel.value, and @path/@call
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Streaming in Direct JSON / Core Protocol Docs`
- **Title**: `[Docs][v1.0] docs/public/concepts/data-flow.md and docs/public/reference/messages.md omit A2UI v1.0, inline createSurface.components/dataModel, required updateDataModel.value, and @path/@call`

<!-- ISSUE_BODY_START -->
### Summary
Although A2UI v1.0 is implemented in `specification/v1_0/json/agent_to_renderer.json` and exported in `@a2ui/web_core@0.14.0` (`@a2ui/web_core/v1_0`), the two primary message and streaming documentation pages — `docs/public/concepts/data-flow.md` and `docs/public/reference/messages.md` — only contain tabs and examples for **v0.8** and **v0.9**. Neither page documents A2UI v1.0 or its Direct JSON changes.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**:
  - `docs/public/concepts/data-flow.md` (lines 18–92)
  - `docs/public/reference/messages.md` (lines 1–271)

### Steps to Reproduce / Evidence
1. In `docs/public/concepts/data-flow.md` (lines 18–50), the protocol version tabs only include `=== "v0.8"` and `=== "v0.9"`.
2. In `docs/public/reference/messages.md` (lines 11–268), every message section (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`) only includes `=== "v0.9"` and `=== "v0.8"` tabs and teaches v0.9 syntax that fails v1.0 schema validation:
   - Shows `"version": "v0.9"` instead of `"version": "v1.0"`.
   - Shows DataBinding as `{"path": "/user/name"}` (line 138) instead of v1.0's required `@`-prefixed `{"@path": "/user/name"}`.
   - States in `updateDataModel` (lines 201–211) that omitting `value` deletes the key at `path`, whereas in v1.0 (`specification/v1_0/json/agent_to_renderer.json` line 138) `value` is **required** (`"required": ["surfaceId", "value"]`) and deleting a key requires explicit `"value": null`.
   - Omits v1.0's new single-message Direct JSON capability where `createSurface` accepts inline `components` and `dataModel` (`specification/v1_0/json/agent_to_renderer.json` lines 38–45).

### Expected Behavior
`docs/public/concepts/data-flow.md` and `docs/public/reference/messages.md` should include `=== "v1.0"` tabs (defaulting to v1.0) that document:
- `"version": "v1.0"`
- Single-shot `createSurface` with inline `components` and `dataModel` vs. progressive multi-message streaming (`createSurface` → `updateComponents` → `updateDataModel`)
- Required `value` in `updateDataModel` (and `"value": null` for key deletion)
- Reserved `@path` and `@call` sigils

### Actual Behavior
Developers reading `data-flow.md` and `reference/messages.md` only see v0.8 and v0.9 schemas and emit v0.9 payloads that are rejected by `@a2ui/web_core/v1_0`.

### Suggested Fix
Add `=== "v1.0"` tabs to `docs/public/concepts/data-flow.md` and `docs/public/reference/messages.md` reflecting `specification/v1_0/json/agent_to_renderer.json` and `specification/v1_0/docs/a2ui_protocol.md`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-10-03] [Docs][Agent Guide] docs/public/guides/agent-development.md only covers v0.8/v0.9, references non-existent 'render'/'update' schema operations, and ends with an unfinished TODO
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Streaming in Direct JSON / Agent Development`
- **Title**: `[Docs][Agent Guide] docs/public/guides/agent-development.md only covers v0.8/v0.9, references non-existent 'render'/'update' schema operations, and ends with an unfinished TODO`

<!-- ISSUE_BODY_START -->
### Summary
`docs/public/guides/agent-development.md` is the main public guide for generating and streaming Direct JSON A2UI messages from LLMs (`DirectJsonFormat`), but it contains three major issues:
1. It only mentions `ProtocolVersion.V0_8` and `ProtocolVersion.V0_9` (lines 132–135), omitting `V1_0`.
2. Under `## Understanding the Output` (lines 159–162), it states that `A2UI_SCHEMA` defines operations named `render` and `update`, which do not exist in any version of A2UI (v0.8, v0.9, or v1.0).
3. It cuts off abruptly at line 182 with `TODO: Continue this guide with examples of how to parse, validate, and send the output to the client renderer without the A2A extension.` — omitting how `DirectJsonFormat` wraps output in `<a2ui-json>...</a2ui-json>` tags and how `DirectJsonResponseStream` / `parseStream()` progressively parses streamed LLM chunks.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`)
- **File path(s)**: `docs/public/guides/agent-development.md` (lines 132–182)

### Steps to Reproduce / Evidence
Inspect `docs/public/guides/agent-development.md` lines 131–135 and 159–182:

```python
# Initialize the inference format with the Basic Catalog
inference_format = DirectJsonFormat(
    [BasicCatalog(ProtocolVersion.V0_8)],  # Use ProtocolVersion.V0_9 for newer protocol
    examples_path="examples/0.8",
)
```

And lines 159–182:
```markdown
The `A2UI_SCHEMA` that we imported is a standard JSON schema that defines valid operations like:

- `render` (displaying a UI)
- `update` (changing data in an existing UI)
...
TODO: Continue this guide with examples of how to parse, validate, and send the output to the client renderer without the A2A extension.
```

### Expected Behavior
`docs/public/guides/agent-development.md` should:
1. Use `ProtocolVersion.V1_0` as the primary example.
2. Accurately list the v1.0 `agent_to_renderer.json` operations (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`, `callRendererFunction`, `agentFunctionResponse`) instead of non-existent `render` and `update` operations.
3. Replace the trailing `TODO` on line 182 with a complete example showing both:
   - Unstructured conversational streaming with `<a2ui-json>...</a2ui-json>` and `DirectJsonFormat.openStream()` / `feed()` / `close()`.
   - Structured JSON output (`responseMimeType: "application/json"`) using `specification/v1_0/json/agent_to_renderer_list_wrapper.json` (`{ "messages": [...] }`).

### Actual Behavior
The guide lists non-existent `render` and `update` operations, omits v1.0, and ends with a `TODO` before explaining how to parse or stream Direct JSON output to a renderer.

### Suggested Fix
Update `docs/public/guides/agent-development.md` lines 131–182 to use v1.0, list the real `agent_to_renderer.json` envelope keys, and provide a working `DirectJsonFormat` streaming parser example.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-10-04] [v1.0][Spec] specification/v1_0/json/agent_to_renderer.json CreateSurfaceMessage description contradicts v1.0 inline components and dataModel support
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Documentation Gap`
- **Feature Area**: `Streaming in Direct JSON / Specification Schema`
- **Title**: `[v1.0][Spec] specification/v1_0/json/agent_to_renderer.json CreateSurfaceMessage description contradicts v1.0 inline components and dataModel support`

<!-- ISSUE_BODY_START -->
### Summary
In A2UI v1.0 (`specification/v1_0/json/agent_to_renderer.json`), `CreateSurfaceMessage.properties.createSurface` added optional `components` (`$ref: "#/$defs/ComponentsList"`) and `dataModel` (`type: "object"`) properties so a complete UI surface can be instantiated in a single `createSurface` message. However, the schema `description` on `createSurface` (line 24) was copied unchanged from v0.9 and still states:
> *"When this message is sent, the renderer expects 'updateComponents' and/or 'updateDataModel' messages for the same surfaceId to define the component tree."*

Because `DirectJsonFormat` embeds `agent_to_renderer.json` directly into the LLM system prompt, this contradictory description misleads both developers and LLMs about whether `createSurface` requires subsequent `updateComponents`/`updateDataModel` messages when `components` and `dataModel` are already provided inline.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `specification/v1_0/json/agent_to_renderer.json` (lines 22–45)
  - `typescript/core/web_core/src/v1_0/schema/agent-to-renderer.ts` (lines 28–55)

### Steps to Reproduce / Evidence
Inspect `specification/v1_0/json/agent_to_renderer.json` lines 22–45:

```json
        "createSurface": {
          "type": "object",
          "description": "Signals the renderer to create a new surface and begin rendering it. Creating a surface implicitly instantiates the canonical 'Surface' container component ('common_types.json#/$defs/Surface') with 'child': 'root'. It is an error to try to create a surface with an existing ID without first deleting it; surfaceId MUST be globally unique for the renderer's lifetime. When this message is sent, the renderer expects 'updateComponents' and/or 'updateDataModel' messages for the same surfaceId to define the component tree.",
          "properties": {
            "surfaceId": { ... },
            "catalogId": { ... },
            "sendDataModel": { ... },
            "components": {
              "$ref": "#/$defs/ComponentsList"
            },
            "dataModel": {
              "type": "object",
              "description": "The initial root data model object for the surface.",
              "additionalProperties": true
            },
```

### Expected Behavior
The `description` of `createSurface` in `specification/v1_0/json/agent_to_renderer.json` (and `typescript/core/web_core/src/v1_0/schema/agent-to-renderer.ts`) should clarify that:
- Initial `components` and `dataModel` MAY be embedded inline inside `createSurface` for single-message surface creation, OR omitted/extended via subsequent `updateComponents` and `updateDataModel` messages for progressive streaming.

### Actual Behavior
The schema description states that the renderer expects separate `updateComponents` and/or `updateDataModel` messages to define the component tree, contradicting the inline `components` and `dataModel` properties on `createSurface`.

### Suggested Fix
Update the final sentence of `CreateSurfaceMessage.properties.createSurface.description` in `specification/v1_0/json/agent_to_renderer.json` and `typescript/core/web_core/src/v1_0/schema/agent-to-renderer.ts` to:
> *"The component tree and initial root data model may be provided inline via 'components' and 'dataModel', or streamed incrementally via subsequent 'updateComponents' and/or 'updateDataModel' messages for the same surfaceId."*
<!-- ISSUE_BODY_END -->

---

## [ISSUE-10-05] [v1.0][agent] DirectJsonResponseStream cannot progressively stream v1.0 single-message createSurface with inline components and dataModel
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Streaming in Direct JSON`
- **Title**: `[v1.0][agent] DirectJsonResponseStream cannot progressively stream v1.0 single-message createSurface with inline components and dataModel`

<!-- ISSUE_BODY_START -->
### Summary
In A2UI v1.0, `createSurface` added inline `components` and `dataModel` properties (`specification/v1_0/json/agent_to_renderer.json` lines 38–45) so an LLM can output a single `createSurface` message containing the surface metadata, components, and initial data model.

However, in `@a2ui/agent` (`typescript/agents/a2ui_agent/src/inference-formats/direct-json/response-stream.ts` line 50), `DirectJsonResponseStream` defines:
```ts
const GROWING_KEYS = ['updateComponents', 'updateDataModel'];
```
`createSurface` is excluded from `GROWING_KEYS` because `MessageProcessor.processCreateSurfaceOp` (`typescript/core/web_core/src/processing/message-processor.ts` lines 760–762) throws `A2uiIntegrityError("Surface ${surfaceId} already exists.")` if `createSurface` is applied more than once for the same `surfaceId`.

Consequently, when an LLM uses v1.0's inline `createSurface.components` and `createSurface.dataModel`, `DirectJsonResponseStream` **buffers the entire `createSurface` message until its final closing `}` token arrives**, completely defeating progressive UI streaming.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm packages `@a2ui/agent@0.0.1`, `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/src/inference-formats/direct-json/response-stream.ts` (lines 45–50, 98–101, 412–435)
  - `typescript/core/web_core/src/processing/message-processor.ts` (lines 760–762, 806–819)

### Steps to Reproduce / Evidence
1. Inspect `typescript/agents/a2ui_agent/src/inference-formats/direct-json/response-stream.ts` lines 45–50:
   ```ts
   /**
    * Envelope keys of the messages a renderer applies again as they grow, so a stream emits them
    * before their object closes. Any other message is applied once, so it is held until it
    * closes: creating a surface twice fails, a deleted surface cannot be restored, and a
    * function runs each time it is called.
    */
   const GROWING_KEYS = ['updateComponents', 'updateDataModel'];
   ```
2. Feed a streamed v1.0 `createSurface` block with inline `components` into `DirectJsonFormat.openStream()` in two chunks:
   - Chunk 1: `<a2ui-json>[{"version":"v1.0","createSurface":{"surfaceId":"s1","catalogId":"https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json","components":[{"id":"root","component":"Column","children":["t1"]},{"id":"t1","component":"Text","text":"First card"}`
   - Chunk 2: `,{"id":"t2","component":"Text","text":"Second card"}]}}]</a2ui-json>`
3. Observe that `stream.feed(chunk1)` returns `[]` (0 messages emitted) because `createSurface` is classified as `kind: 'other'` and held until the entire `createSurface` object closes in `chunk2`.

### Expected Behavior
Streaming a v1.0 `createSurface` message that contains inline `components` and/or `dataModel` should progressively emit the surface creation and incremental component/data updates as tokens arrive (or `DirectJsonFormat`'s v1.0 prompt generator should explicitly instruct the LLM never to inline `components` and `dataModel` inside `createSurface` when streaming is enabled).

### Actual Behavior
`DirectJsonResponseStream` holds the entire `createSurface` envelope in memory until the closing `}` of `createSurface` arrives, resulting in zero progressive rendering whenever an LLM uses v1.0's inline `createSurface.components` / `createSurface.dataModel` syntax.

### Suggested Fix
In `DirectJsonResponseStream`, when an unclosed `createSurface` envelope is growing and its `surfaceId` (and optional `catalogId`/`sendDataModel`) has been read:
1. Emit a bare `createSurface` envelope (`{ version: 'v1.0', createSurface: { surfaceId, catalogId, sendDataModel } }`) once to create the surface in `RendererState` / `MessageProcessor`.
2. As `createSurface.components` and `createSurface.dataModel` grow in subsequent chunks, synthesize and emit incremental `updateComponents` and `updateDataModel` envelopes for that `surfaceId`.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-10-06] [v1.0][web_core] MessageProcessor with STRICT_VALIDATION throws A2uiIntegrityError (Dangling reference) on top-down streaming recommended by DirectJsonFormat
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Streaming in Direct JSON`
- **Title**: `[v1.0][web_core] MessageProcessor with STRICT_VALIDATION throws A2uiIntegrityError (Dangling reference) on top-down streaming recommended by DirectJsonFormat`

<!-- ISSUE_BODY_START -->
### Summary
`@a2ui/agent`'s `DirectJsonFormat` system prompt (`typescript/agents/a2ui_agent/src/inference-formats/direct-json/format.ts` line 116) explicitly instructs the LLM to stream components top-down:
> *"Component Ordering: Inside any components array, always output the root component first (`"id": "root"`), followed by its children, and so on top-down. Do NOT generate component definitions before their parent has been defined and referenced them; the renderer cannot display orphaned components while streaming."*

When an LLM follows this rule and streams `root` first (`{ "id": "root", "component": "Column", "children": ["header_card", "future_card"] }`) along with `"header_card"` in chunk 1 while `"future_card"` arrives in chunk 2, `@a2ui/web_core`'s `MessageProcessor` configured with `{ validationConfig: STRICT_VALIDATION }` (or any custom `validationConfig` where `allowDanglingReferences` defaults to `false` in `message-processor.ts` lines 196–203) immediately throws `A2uiIntegrityError: Component 'root' references non-existent component 'future_card' in field 'children[1]' (Dangling reference 'future_card' in component 'root')`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**:
  - `typescript/core/web_core/src/processing/message-processor.ts` (lines 196–204, 1091–1097)
  - `typescript/core/web_core/src/validation/integrity-checker.ts` (lines 118–131)
  - `typescript/agents/a2ui_agent/src/inference-formats/direct-json/format.ts` (line 116)

### Steps to Reproduce / Evidence
Run the following standalone reproduction against `@a2ui/web_core@0.14.0`:

```bash
node -e '
import("@a2ui/web_core/v1_0").then((v10) => {
  const mp = new v10.MessageProcessor(
    [v10.basicCatalog],
    undefined,
    { validationConfig: v10.STRICT_VALIDATION }
  );
  mp.processMessages([{
    version: "v1.0",
    createSurface: {
      surfaceId: "stream_strict",
      catalogId: v10.basicCatalog.id
    }
  }]);
  // Chunk 1 of top-down streaming: root + first child arrive before second child
  mp.processMessages([{
    version: "v1.0",
    updateComponents: {
      surfaceId: "stream_strict",
      components: [
        { id: "root", component: "Column", children: ["header_card", "future_card"] },
        { id: "header_card", component: "Text", text: "Header arrived" }
      ]
    }
  }]);
});
'
```

Output:
```text
A2uiIntegrityError: Component 'root' references non-existent component 'future_card' in field 'children[1]' (Dangling reference 'future_card' in component 'root')
  code: 'INTEGRITY_ERROR'
```

### Expected Behavior
`@a2ui/web_core` should export an `IN_PROGRESS_VALIDATION` preset (`{ allowMissingRoot: false, allowOrphanComponents: false, allowDanglingReferences: true, allowUnknownElements: false }`) matched to `DirectJsonFormat`'s top-down streaming rule, and allow callers to run final strict dangling-reference verification once the stream closes.

### Actual Behavior
Only `STRICT_VALIDATION` (which rejects top-down streaming due to `allowDanglingReferences: false`) and `RELAXED_VALIDATION` (which disables all root, orphan, dangling, and unknown element checks) are exported in `integrity-checker.ts`. Furthermore, passing a partial `validationConfig` such as `{ allowOrphanComponents: false }` to `new MessageProcessor` defaults `allowDanglingReferences` to `false` (`message-processor.ts` lines 197–202), breaking top-down streaming.

### Suggested Fix
1. Export `IN_PROGRESS_VALIDATION` (`{ allowOrphanComponents: false, allowDanglingReferences: true, allowMissingRoot: false, allowUnknownElements: false }`) from `typescript/core/web_core/src/validation/integrity-checker.ts` and `@a2ui/web_core/v1_0`.
2. Add a `finalizeSurface(surfaceId)` or `validateSurface(surfaceId, STRICT_VALIDATION)` method on `MessageProcessor` so applications can stream with `IN_PROGRESS_VALIDATION` and enforce zero dangling references when the stream completes.
<!-- ISSUE_BODY_END -->

---

## [ISSUE-10-07] [v1.0][web_core] MessageProcessor constructor silently ignores STRICT_VALIDATION / RELAXED_VALIDATION when passed directly as the 3rd argument instead of { validationConfig }
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Streaming in Direct JSON / MessageProcessor Validation`
- **Title**: `[v1.0][web_core] MessageProcessor constructor silently ignores STRICT_VALIDATION / RELAXED_VALIDATION when passed directly as the 3rd argument instead of { validationConfig }`

<!-- ISSUE_BODY_START -->
### Summary
`@a2ui/web_core/v1_0` exports `STRICT_VALIDATION` and `RELAXED_VALIDATION` (`ValidationConfig` objects with `{ allowOrphanComponents, allowDanglingReferences, allowMissingRoot, allowUnknownElements }`). However, `MessageProcessor`'s constructor (`typescript/core/web_core/src/processing/message-processor.ts` lines 183–206) takes `options?: MessageProcessorOptions` (`{ validationConfig?: Partial<ValidationConfig>, ... }`) as its 3rd parameter and checks `if (options?.validationConfig)`.

In JavaScript (or loosely typed callers), passing `new MessageProcessor([basicCatalog], undefined, STRICT_VALIDATION)` directly as the 3rd argument causes `options?.validationConfig` to evaluate to `undefined`, which sets `this.validationConfig = undefined` and **silently disables topology validation** instead of applying `STRICT_VALIDATION`.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/web_core@0.14.0`
- **File path(s)**: `typescript/core/web_core/src/processing/message-processor.ts` (lines 183–206)

### Steps to Reproduce / Evidence
Run the following standalone script against `@a2ui/web_core@0.14.0`:

```bash
node -e '
import("@a2ui/web_core/v1_0").then((v10) => {
  // Passing STRICT_VALIDATION directly as the 3rd argument:
  const mp = new v10.MessageProcessor([v10.basicCatalog], undefined, v10.STRICT_VALIDATION);
  console.log("mp.validationConfig =", mp.validationConfig);

  // Even a surface missing "root" and containing dangling references is silently accepted:
  mp.processMessages([
    { version: "v1.0", createSurface: { surfaceId: "s1", catalogId: v10.basicCatalog.id } },
    {
      version: "v1.0",
      updateComponents: {
        surfaceId: "s1",
        components: [{ id: "orphan_node", component: "Column", children: ["non_existent_child"] }]
      }
    }
  ]);
  console.log("Processed invalid topology without error!");
});
'
```

Output:
```text
mp.validationConfig = undefined
Processed invalid topology without error!
```

### Expected Behavior
If a `ValidationConfig` object (containing `allowOrphanComponents` / `allowDanglingReferences` / `allowMissingRoot` / `allowUnknownElements`) is passed directly as the 3rd argument to `new MessageProcessor(...)`, `MessageProcessor` should either recognize it as `validationConfig` or throw a descriptive configuration error rather than silently setting `this.validationConfig = undefined`.

### Actual Behavior
`this.validationConfig` is silently set to `undefined`, disabling all component graph and unknown-element validation.

### Suggested Fix
In `typescript/core/web_core/src/processing/message-processor.ts` (lines 196–206), detect direct `ValidationConfig` objects or validate `options` keys:
```ts
const rawValidationConfig =
  options?.validationConfig ??
  (options &&
  ('allowOrphanComponents' in options ||
    'allowDanglingReferences' in options ||
    'allowMissingRoot' in options ||
    'allowUnknownElements' in options)
    ? (options as unknown as Partial<ValidationConfig>)
    : undefined);
```
<!-- ISSUE_BODY_END -->

---

## [ISSUE-10-08] [v1.0][agent] DirectJsonResponseStream sets wholeItemKeys: ['components'] in v1.0, disabling progressiveKeys: ['text'] streaming inside updateComponents
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Streaming in Direct JSON`
- **Title**: `[v1.0][agent] DirectJsonResponseStream sets wholeItemKeys: ['components'] in v1.0, disabling progressiveKeys: ['text'] streaming inside updateComponents`

<!-- ISSUE_BODY_START -->
### Summary
In `@a2ui/agent`, `DirectJsonFormat` configures `progressiveKeys: new Set(['text'])` so that long markdown or text strings inside `Text` components (`{ "id": "t1", "component": "Text", "text": "..." }`) stream progressively token-by-token before the component JSON object closes.

In A2UI v0.9, this works as intended. However, in A2UI v1.0, `DirectJsonResponseStream.emitReady` (`typescript/agents/a2ui_agent/src/inference-formats/direct-json/response-stream.ts` lines 281–286) passes:
```ts
const read = readPartialMessages(this.block, this.parser.progressiveKeys, {
  wholeItemKeys: this.v10 ? ['components'] : [],
  cache: this.readCache,
  start,
  end: trailingFenceStart(this.block, start, end),
});
```
Because `wholeItemKeys` includes `'components'` whenever `this.v10` is `true`, `readPartialMessages` refuses to emit any partial component item inside `updateComponents.components` until that component's closing `}` arrives. As a result, `progressiveKeys: ['text']` is completely dead inside `updateComponents` in A2UI v1.0.

### Affected Component / Files
- **Repository commit**: `e9dbcc3` (`main`) / npm package `@a2ui/agent@0.0.1`
- **File path(s)**:
  - `typescript/agents/a2ui_agent/src/inference-formats/direct-json/response-stream.ts` (lines 150, 281–286, 482–494)
  - `typescript/agents/a2ui_agent/src/inference-formats/direct-json/json-reader.ts` (lines 71–78)
  - `typescript/agents/a2ui_agent/KNOWN_GAPS.md` (lines 11–18)

### Steps to Reproduce / Evidence
1. Inspect `typescript/agents/a2ui_agent/src/inference-formats/direct-json/response-stream.ts` lines 281–286:
   ```ts
   const read = readPartialMessages(this.block, this.parser.progressiveKeys, {
     wholeItemKeys: this.v10 ? ['components'] : [],
     cache: this.readCache,
     start,
     end: trailingFenceStart(this.block, start, end),
   });
   ```
2. Inspect `conformance/agent/direct_json/response_streaming.yaml`: the progressive `Text.text` streaming conformance test (`progressive_text_in_component`) specifically pins the catalog to `v0.9` because in `v1.0` `wholeItemKeys: ['components']` blocks partial component emission until the component object closes.

### Expected Behavior
In A2UI v1.0, streaming a `Text` component with a long literal `text` property inside `updateComponents.components` should progressively emit partial `Text.text` strings as tokens arrive, just as in v0.9 (unless a component explicitly changes its `catalogId` mid-stream, which `DirectJsonFormat`'s prompt can require to be emitted before `component` / `text` properties, alongside `"id"` and `"component"`).

### Actual Behavior
In v1.0, `wholeItemKeys: ['components']` forces `readPartialMessages` to wait for the entire component object to close before yielding it, disabling progressive text streaming for all inline `Text.text` literals inside `updateComponents`.

### Suggested Fix
1. In `DirectJsonFormat`'s v1.0 prompt instructions (`format.ts`), require `"id"`, `"component"`, and (if present) `"catalogId"` to be the first keys of every component object.
2. Remove `'components'` from `wholeItemKeys` in `response-stream.ts` line 282 so `progressiveKeys` (`'text'`) works identically in v1.0 and v0.9.
<!-- ISSUE_BODY_END -->

---
