export type FindingCategory =
  | 'discoverability'
  | 'npm-packaging'
  | 'doc-gap'
  | 'spec-mismatch'
  | 'renderer-bug';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface OnboardingFinding {
  id: string;
  title: string;
  category: FindingCategory;
  severity: FindingSeverity;
  affectedTarget: string;
  summary: string;
  reproductionOrEvidence: string;
  freshcartWorkaround: string;
  recommendationForA2UITeam: string;
}

export interface PackageMatrixRow {
  packageName: string;
  npmVersion: string;
  githubPath: string;
  exportSubpaths: string;
  v1SupportStatus:
    | 'Full v1.0 Runtime & Catalog'
    | 'Partial / Undocumented v1.0'
    | 'v0.8 / v0.9 Only'
    | 'Not Published on npm';
  react19PeerDepStatus: string;
  notes: string;
}

export interface WireFormatShiftRow {
  feature: string;
  v08_v09Syntax: string;
  v10Syntax: string;
  breakingImpact: string;
}

export const ONBOARDING_SUMMARY_METRICS = {
  testedAt: '2026-10-21',
  targetSpecVersion: 'v1.0 (Release Candidate)',
  npmReleaseTested: '@a2ui/web_core@0.14.0 & @a2ui/react@0.14.0',
  docGapsCount: 10,
  bugsCount: 9,
  criticalCount: 2,
  highCount: 7,
};

export const PACKAGE_MATRIX: PackageMatrixRow[] = [
  {
    packageName: '@a2ui/web_core',
    npmVersion: '0.14.0',
    githubPath: 'typescript/core/web_core/',
    exportSubpaths:
      '., ./v0_8, ./v0_9, ./v1_0, ./catalogs/basic/v1, ./processing, ./resolution, ./validation, ./rpc',
    v1SupportStatus: 'Full v1.0 Runtime & Catalog',
    react19PeerDepStatus: 'Compatible (framework-agnostic Lit/Signals core)',
    notes:
      'Ships complete v1.0 MessageProcessor, PayloadValidator, @path/@call/@index DataContext, and 18-component basicCatalog (protocolVersion: "1.0").',
  },
  {
    packageName: '@a2ui/react',
    npmVersion: '0.14.0',
    githubPath: 'typescript/renderers/react/',
    exportSubpaths: '., ./v0_8, ./v0_9, ./styles (Missing ./v1_0!)',
    v1SupportStatus: 'Partial / Undocumented v1.0',
    react19PeerDepStatus: 'Supports react@^18.0.0 || ^19.0.0',
    notes:
      'Root export A2uiSurface renders v1.0 surfaces when paired with @a2ui/web_core/v1_0, but lacks a ./v1_0 subpath export and crashes on import in SSR/Node when HTMLElement is undefined.',
  },
  {
    packageName: '@a2ui/markdown-it',
    npmVersion: '0.2.2',
    githubPath: 'typescript/renderers/markdown-it/',
    exportSubpaths: '.',
    v1SupportStatus: 'Full v1.0 Runtime & Catalog',
    react19PeerDepStatus: 'Peer: @a2ui/web_core@^0.14.0',
    notes:
      'Required via MarkdownContext.Provider so <a2ui-basic-text> renders Markdown headings (#, ##, ###) in v1.0.',
  },
  {
    packageName: '@a2ui/lit',
    npmVersion: '0.14.0',
    githubPath: 'typescript/renderers/lit/',
    exportSubpaths: '., ./ui, ./0.8, ./v0_8, ./v0_9 (Missing ./v1_0)',
    v1SupportStatus: 'Partial / Undocumented v1.0',
    react19PeerDepStatus: 'Lit ^3.3.3',
    notes:
      'Used internally by @a2ui/web_core basicCatalog for custom elements (<a2ui-card>, <a2ui-slider>, etc.).',
  },
  {
    packageName: '@a2ui/angular',
    npmVersion: '0.13.0',
    githubPath: 'typescript/renderers/angular/',
    exportSubpaths: '., ./v0_8, ./v0_9, ./testing',
    v1SupportStatus: 'v0.8 / v0.9 Only',
    react19PeerDepStatus: 'Requires @angular/core@^21.2.5',
    notes:
      'Lags at 0.13.0 while web_core, react, and lit are at 0.14.0.',
  },
  {
    packageName: 'a2ui (unscoped trap)',
    npmVersion: '1.0.7 (2016)',
    githubPath: 'N/A (unrelated third-party package)',
    exportSubpaths: 'index.js',
    v1SupportStatus: 'Not Published on npm',
    react19PeerDepStatus: 'Legacy Angular 2 wrapper',
    notes:
      'External developers running `npm install a2ui` get an unrelated 2016 package instead of @a2ui/react + @a2ui/web_core.',
  },
];

export const WIRE_FORMAT_SHIFTS: WireFormatShiftRow[] = [
  {
    feature: 'Top-Level Envelope Version',
    v08_v09Syntax: '"version": "v0.9" (or omitted in v0.8)',
    v10Syntax: '"version": "v1.0" (strictly required on all 6 message types)',
    breakingImpact:
      'Every createSurface, updateComponents, updateDataModel, deleteSurface, callRendererFunction, and action payload must declare "version": "v1.0".',
  },
  {
    feature: 'DataBinding Object Key',
    v08_v09Syntax: '{ "path": "/servings" }',
    v10Syntax: '{ "@path": "/servings" }',
    breakingImpact:
      'Reserved @ prefix introduced in v1.0. Using unprefixed { "path": "/servings" } inside a component property is treated as a literal object instead of a data binding.',
  },
  {
    feature: 'FunctionCall Object Key',
    v08_v09Syntax: '{ "call": "formatCurrency", "args": { ... } }',
    v10Syntax: '{ "@call": "formatCurrency", "args": { ... }, "catalogId"?: "..." }',
    breakingImpact:
      'Function calls must use "@call". Argument names must also be valid UAX #31 identifiers.',
  },
  {
    feature: 'Collection Iteration Index',
    v08_v09Syntax: 'No built-in 1-based offset function in collection templates',
    v10Syntax: '{ "@call": "@index", "args": { "offset": 1 } }',
    breakingImpact:
      'System function @index is valid only inside a ChildList template scope ({ "componentId": "...", "path": "/..." }) and must NOT specify a catalogId.',
  },
  {
    feature: 'Component Instance IDs (UAX #31)',
    v08_v09Syntax: 'Hyphenated IDs allowed ("id": "main-col", "id": "todo-index")',
    v10Syntax: 'UAX #31 identifiers only ("id": "main_col", "id": "ingredient_row")',
    breakingImpact:
      '@a2ui/web_core@0.14.0 PayloadValidator rejects hyphenated component IDs with A2uiValidationError when protocolVersion >= 1.0.',
  },
  {
    feature: 'Text Component Heading Variants',
    v08_v09Syntax: '"variant": "h1" | "h2" | "h3" | "h4" | "h5" | "caption" | "body"',
    v10Syntax: '"variant": "caption" | "body" (Headings use Markdown #, ##, ### in text)',
    breakingImpact:
      'Passing "variant": "h1" or "h2" throws A2uiValidationError on v1.0 basicCatalog.',
  },
  {
    feature: 'Single-Shot createSurface & Theme Removal',
    v08_v09Syntax: 'createSurface had "theme": { "primaryColor": "..." }; required separate updateComponents',
    v10Syntax: 'createSurface removes "theme" and supports inline "components": [...] and "dataModel": {...}',
    breakingImpact:
      'Surfaces can be initialized in a single envelope or streamed incrementally via updateComponents and updateDataModel.',
  },
  {
    feature: 'updateDataModel Key Deletion',
    v08_v09Syntax: 'Omit "value" property to delete key at path',
    v10Syntax: '"value" is required; pass "value": null to delete key at path',
    breakingImpact:
      'Omitting "value" in updateDataModel fails v1.0 schema validation.',
  },
];

export const DOCUMENTATION_GAPS: OnboardingFinding[] = [
  {
    id: 'DOC-GAP-01',
    title: 'Missing React v1.0 Quickstart & Contradictory Version Matrix',
    category: 'discoverability',
    severity: 'critical',
    affectedTarget: 'typescript/renderers/react/README.md, docs/public/reference/renderers.md, README.md',
    summary:
      'Public docs state React v1.0 support is "🚧 Planned" and only document @a2ui/react/v0_9, even though @a2ui/web_core@0.14.0 already ships ./v1_0 and ./catalogs/basic/v1 and works with @a2ui/react.',
    reproductionOrEvidence:
      'docs/public/reference/renderers.md lines 209-215 lists React v1.0 as Planned; typescript/renderers/react/README.md lines 218-239 recommends @a2ui/react/v0_9.',
    freshcartWorkaround:
      'Inspected npm tarballs and internal a2ui_explorer to verify @a2ui/web_core/v1_0 + root @a2ui/react compatibility, and built a spec-faithful v1.0 React + Tailwind engine.',
    recommendationForA2UITeam:
      'Update renderers.md and @a2ui/react/README.md with a working v1.0 quickstart importing @a2ui/web_core/v1_0 and @a2ui/web_core/catalogs/basic/v1.',
  },
  {
    id: 'DOC-GAP-02',
    title: 'client-setup.md Documents Nonexistent React Symbols (<A2UISurface>, useA2UI)',
    category: 'doc-gap',
    severity: 'high',
    affectedTarget: 'docs/public/guides/client-setup.md (Lines 121-134)',
    summary:
      'The React client setup guide tells developers to use a nonexistent `useA2UI()` hook, `<A2UISurface>` (wrong casing instead of `A2uiSurface`), and claims `@a2ui/react` exports `MessageProcessor`, with zero code examples.',
    reproductionOrEvidence:
      'Inspecting `@a2ui/react@0.14.0/dist/src/index.d.ts` confirms it exports `A2uiSurface`, `createComponentImplementation`, and `MarkdownContext` — no `useA2UI()` or `MessageProcessor`.',
    freshcartWorkaround:
      'Documented the true export surface in docs/A2UI_ONBOARDING_DISCOVERY.md and exposed live envelope inspection in the app.',
    recommendationForA2UITeam:
      'Replace the placeholder React bullet points in client-setup.md with a complete, tested React 19 + TypeScript v1.0 example.',
  },
  {
    id: 'DOC-GAP-03',
    title: '"v0.9 and later" Docs Tabs Teach Syntax That Fails in v1.0',
    category: 'doc-gap',
    severity: 'high',
    affectedTarget: 'docs/public/concepts/data-binding.md, components.md, reference/messages.md',
    summary:
      'Concept and Reference pages group v0.9 and v1.0 under a single "v0.9 and later" tab teaching `{"path": "/user/name"}`, `{"call": "formatString"}`, `"variant": "h1"`, and omitting `updateDataModel.value` to delete keys — all of which fail in v1.0.',
    reproductionOrEvidence:
      'In v1.0, DataBinding requires `@path`, FunctionCall requires `@call`, Text.variant only accepts `caption | body`, and `updateDataModel.value` is required (`null` deletes keys).',
    freshcartWorkaround:
      'Added a real-time v0.9-vs-v1.0 migration linter inside ProtocolInspectorDrawer to catch and auto-explain these exact syntax differences.',
    recommendationForA2UITeam:
      'Split "v0.9 and later" documentation tabs into separate "v0.9" and "v1.0" tabs across all concept and reference pages.',
  },
  {
    id: 'DOC-GAP-04',
    title: 'Contradiction Between v1.0 Spec Prose/Examples and UAX #31 Component ID Validation',
    category: 'spec-mismatch',
    severity: 'high',
    affectedTarget: 'specification/v1_0/docs/a2ui_protocol.md (Line 1335) vs PayloadValidator',
    summary:
      'The v1.0 spec prose states UAX #31 applies to catalog entity names (component types, function names, property names) and uses `"id": "todo-index"` (with a hyphen) in its own `@index` example, but `@a2ui/web_core` throws `A2uiValidationError` on any component `id` containing a hyphen.',
    reproductionOrEvidence:
      'Passing the spec\'s own `"id": "todo-index"` example to `@a2ui/web_core/v1_0` throws `A2uiValidationError: Component id \'todo-index\' must be a valid UAX #31 identifier`.',
    freshcartWorkaround:
      'All component IDs across Scenarios A, B, and C use strict UAX #31 underscore identifiers (`main_col`, `ingredient_row`, `btn_add_bundle`).',
    recommendationForA2UITeam:
      'Either relax `PayloadValidator.validateComponent` so `ComponentId` allows hyphens, or update `common_types.json` and all spec examples (`todo_index`) to forbid hyphens.',
  },
  {
    id: 'DOC-GAP-05',
    title: 'Missing MarkdownContext Setup in @a2ui/react README Quick Start',
    category: 'doc-gap',
    severity: 'medium',
    affectedTarget: 'typescript/renderers/react/README.md (Lines 251-288)',
    summary:
      'The React README Quick Start renders `<A2uiSurface />` without wrapping it in `<MarkdownContext.Provider value={renderMarkdown}>`, causing `<a2ui-basic-text>` to log warnings and render unparsed raw markdown.',
    reproductionOrEvidence:
      'Console warning: `[MarkdownDirective] can\'t render markdown because no markdown renderer is configured.`',
    freshcartWorkaround:
      'Our React `Text` catalog renderer natively parses Markdown headings (`#`, `##`, `###`), bold, italics, and inline code without requiring external global directives.',
    recommendationForA2UITeam:
      'Include `<MarkdownContext.Provider>` in the `@a2ui/react` README Quick Start or provide a default markdown renderer fallback.',
  },
  {
    id: 'DOC-GAP-06',
    title: 'Outdated Default Export Claim in @a2ui/react README',
    category: 'doc-gap',
    severity: 'medium',
    affectedTarget: 'typescript/renderers/react/README.md (Line 485)',
    summary:
      'README claims v0.8 is still the default root export of `@a2ui/react`, whereas in `0.14.0` the root export is the modern v0.9/v1.0 `A2uiSurface` and v0.8 is isolated under `@a2ui/react/v0_8`.',
    reproductionOrEvidence:
      'Inspecting `node_modules/@a2ui/react/package.json#exports` shows `"."` points to `./dist/src/index.js` (modern adapter).',
    freshcartWorkaround:
      'Documented the accurate package export map in the Onboarding Report Modal.',
    recommendationForA2UITeam:
      'Update the Backward Compatibility section in `typescript/renderers/react/README.md`.',
  },
  {
    id: 'DOC-GAP-07',
    title: 'Incomplete Custom Catalog Guide for Web Frameworks',
    category: 'doc-gap',
    severity: 'medium',
    affectedTarget: 'docs/public/guides/defining-your-own-catalog.md',
    summary:
      'The Web custom catalog guide contains a placeholder ("Detailed guides for each framework coming soon") and links to v0.9 catalog paths instead of explaining v1.0 multi-catalog `catalogId` mixing.',
    reproductionOrEvidence:
      '`docs/public/guides/defining-your-own-catalog.md` lines 42-58.',
    freshcartWorkaround:
      'Implemented a complete v1.0 custom grocery catalog (`FRESHCART_GROCERY_CATALOG_ID`) with `ProductDealCard` and `NutritionSummary` mixed alongside `A2UI_BASIC_CATALOG_ID`.',
    recommendationForA2UITeam:
      'Add a concrete React + TypeScript custom catalog registration & multi-catalog mixing example for v1.0.',
  },
  {
    id: 'DOC-GAP-08',
    title: 'Official React Sample App (@a2ui/react-shell) Is Still Pinned to v0.9',
    category: 'discoverability',
    severity: 'medium',
    affectedTarget: 'samples/client/react/shell/',
    summary:
      'The only public React sample under `samples/client/react/` is hardcoded to `@a2ui/react/v0_9` and `@a2ui/web_core/v0_9`; no public v1.0 React sample app is linked from the docs.',
    reproductionOrEvidence:
      '`samples/client/react/shell/package.json` and `src/App.tsx` use v0.9 imports and envelopes.',
    freshcartWorkaround:
      'FreshCart serves as a full-featured, production-grade React 19 + TypeScript A2UI v1.0 reference application.',
    recommendationForA2UITeam:
      'Upgrade `samples/client/react/shell` to A2UI v1.0 and link `a2ui_explorer` in the public documentation.',
  },
  {
    id: 'DOC-GAP-09',
    title: 'Broken Historical GitHub Paths After Monorepo Reorganization',
    category: 'discoverability',
    severity: 'low',
    affectedTarget: 'renderers/react -> typescript/renderers/react',
    summary:
      'External links and search results pointing to `renderers/react` or `renderers/web_core` return HTTP 404 after the repository moved packages under `typescript/renderers/*` and `typescript/core/*`.',
    reproductionOrEvidence:
      'Directory layout audit of `github.com/google/A2UI` (`HEAD`).',
    freshcartWorkaround:
      'Mapped all old vs. new repository paths in `docs/A2UI_ONBOARDING_DISCOVERY.md`.',
    recommendationForA2UITeam:
      'Add redirect stubs or a path migration table in the root `README.md`.',
  },
  {
    id: 'DOC-GAP-10',
    title: 'formatString Interpolation Syntax vs. Conceptual Examples Discrepancy',
    category: 'spec-mismatch',
    severity: 'medium',
    affectedTarget: 'catalogs/basic/v1/catalog.json vs docs/public/concepts/data-binding.md',
    summary:
      'In v1.0 `catalog.json`, `formatString` strictly validates `args: { value: "Hello ${/user/name}" }` with embedded `${...}` expressions, whereas conceptual prompts often expect positional `{0}` templates or `contains`/`equals` helpers.',
    reproductionOrEvidence:
      '`FormatStringApi` in `@a2ui/web_core/src/catalogs/basic/v1/functions/basic_functions_api.js` requires `args.value` (`DynamicStringSchema`).',
    freshcartWorkaround:
      'All FreshCart v1.0 scenarios use canonical `formatString(value: "...${...}")` and `formatNumber`/`formatCurrency` so they pass `@a2ui/web_core/v1_0` strict Zod validation, while `DataModelBinder.ts` supports both syntaxes.',
    recommendationForA2UITeam:
      'Document the `${/pointer}` and `${func(arg:val)}` interpolation syntax prominently in the Data Binding guide.',
  },
];

export const FRAMEWORK_BUGS: OnboardingFinding[] = [
  {
    id: 'BUG-01',
    title: 'Importing @a2ui/react in Node.js / SSR Crashes Immediately (HTMLElement is not defined)',
    category: 'renderer-bug',
    severity: 'critical',
    affectedTarget: '@a2ui/react@0.14.0 (catalog/react_host_element.ts / chunk-QAAGXJWH.js:98)',
    summary:
      'Unconditional `class ReactWcHost extends HTMLElement` at module top-level crashes Node.js, Next.js SSR, and Vitest environments with `ReferenceError: HTMLElement is not defined` on `import "@a2ui/react"`.',
    reproductionOrEvidence:
      'Run `node -e "import(\'@a2ui/react\')"` -> throws `ReferenceError: HTMLElement is not defined` at `chunk-QAAGXJWH.js:98`.',
    freshcartWorkaround:
      'FreshCart renders v1.0 surfaces through our pure React `A2UISurfaceRenderer` in browser/SSR without top-level `HTMLElement` inheritance crashes, and guards DOM globals in verification scripts.',
    recommendationForA2UITeam:
      'Lazily define `ReactWcHost` inside `ensureRegistered()` or guard with `typeof HTMLElement !== "undefined"`.',
  },
  {
    id: 'BUG-02',
    title: '@a2ui/react@0.14.0 Is Missing a ./v1_0 Subpath Export in package.json',
    category: 'npm-packaging',
    severity: 'high',
    affectedTarget: '@a2ui/react@0.14.0 (package.json#exports)',
    summary:
      'While `@a2ui/web_core@0.14.0` exports `./v0_8`, `./v0_9`, and `./v1_0`, `@a2ui/react@0.14.0` only exports `.`, `./v0_8`, and `./v0_9`. Importing `@a2ui/react/v1_0` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`.',
    reproductionOrEvidence:
      '`node_modules/@a2ui/react/package.json` exports map omits `"./v1_0"`, even though `./v0_9` is a 1-line re-export of root `index.ts`.',
    freshcartWorkaround:
      'Import from root `@a2ui/react` or use FreshCart\'s native Tailwind v1.0 React renderer.',
    recommendationForA2UITeam:
      'Add `"./v1_0": { "types": "./dist/src/index.d.ts", "default": "./dist/src/index.js" }` to `@a2ui/react/package.json`.',
  },
  {
    id: 'BUG-03',
    title: 'PayloadValidator Rejects Hyphenated ComponentId Strings in v1.0 (UAX #31 Over-Enforcement)',
    category: 'spec-mismatch',
    severity: 'high',
    affectedTarget: '@a2ui/web_core@0.14.0 (src/validation/payload-validator.ts:162)',
    summary:
      '`PayloadValidator.validateComponent` enforces UAX #31 identifier syntax on component instance `id`s, rejecting hyphenated IDs like `"main-col"` or `"todo-index"` even though `common_types.json#/$defs/ComponentId` is `{ "type": "string" }`.',
    reproductionOrEvidence:
      '`this.assertIdentifier(id, "Component id \'...\' must be a valid UAX #31 identifier")` throws `A2uiValidationError` on hyphens.',
    freshcartWorkaround:
      'All FreshCart v1.0 scenario component IDs strictly use underscores (`header_card`, `ingredient_row`, `btn_add_bundle`) and our Protocol Inspector linter warns if a user types a hyphenated component ID.',
    recommendationForA2UITeam:
      'Align `PayloadValidator.validateComponent` with `common_types.json` so `ComponentId` allows hyphens, or add the UAX #31 pattern to `ComponentId` in `common_types.json`.',
  },
  {
    id: 'BUG-04',
    title: '<a2ui-basic-text> Throws EventTarget.dispatchEvent TypeError in JSDOM with @lit/context',
    category: 'renderer-bug',
    severity: 'high',
    affectedTarget: '@a2ui/web_core@0.14.0 (A2uiBasicTextElement + @lit/context)',
    summary:
      'Rendering `<a2ui-basic-text>` inside React 19 + JSDOM throws `TypeError: Failed to execute \'dispatchEvent\' on \'EventTarget\': parameter 1 is not of type \'Event\'` due to cross-realm `Event` constructor mismatch.',
    reproductionOrEvidence:
      '`@lit/context` constructs `ContextRequestEvent` extending Node\'s `globalThis.Event` instead of `window.Event` in JSDOM.',
    freshcartWorkaround:
      'FreshCart\'s native React Basic Catalog renderer uses standard React context and props rather than Shadow DOM CustomEvents.',
    recommendationForA2UITeam:
      'Ensure JSDOM test harnesses alias `globalThis.Event = window.Event` or avoid custom-element context hops in the React renderer.',
  },
  {
    id: 'BUG-05',
    title: '@a2ui/web_core@0.14.0 Publishes .tsbuildinfo and Compiled *.test.js Files to npm',
    category: 'npm-packaging',
    severity: 'medium',
    affectedTarget: '@a2ui/web_core@0.14.0 npm tarball',
    summary:
      'The published npm tarball for `@a2ui/web_core@0.14.0` includes `.tsbuildinfo` (182 KB) and dozens of compiled `*.test.js`, `*.test.d.ts`, and `*.test.js.map` files.',
    reproductionOrEvidence:
      'Verified by inspecting `node_modules/@a2ui/web_core/` contents after `npm install`.',
    freshcartWorkaround:
      'Vite tree-shakes unused test files during production bundle builds.',
    recommendationForA2UITeam:
      'Exclude `**/*.test.*` and `*.tsbuildinfo` in `tsconfig.build.json` and `package.json#files`.',
  },
  {
    id: 'BUG-06',
    title: 'Text Component variant Enum Breakingly Restricted to ["caption", "body"] in v1.0',
    category: 'spec-mismatch',
    severity: 'medium',
    affectedTarget: '@a2ui/web_core@0.14.0 (catalogs/basic/v1/components/basic_components.js:27)',
    summary:
      'In v1.0 `basicCatalog`, `Text.variant` only allows `["caption", "body"]` (`h1`-`h5` from v0.9 were removed and throw `A2uiValidationError`), but `evolution_guide.md` omits this breaking change.',
    reproductionOrEvidence:
      '`Validation failed for component \'Text\': variant: Invalid enum value. Expected \'caption\' | \'body\', received \'h2\'`.',
    freshcartWorkaround:
      'All FreshCart v1.0 scenarios use `"variant": "body" | "caption"` with Markdown `#`, `##`, `###` headings inside `text`, while our renderer also gracefully supports `h1`-`h4` hints.',
    recommendationForA2UITeam:
      'Document the removal of `h1`-`h5` from `Text.variant` in `specification/v1_0/docs/evolution_guide.md`.',
  },
  {
    id: 'BUG-07',
    title: 'MessageProcessorOptions.version Defaults to "v0.9" Even with v1.0 Catalogs',
    category: 'renderer-bug',
    severity: 'medium',
    affectedTarget: '@a2ui/web_core@0.14.0 (src/processing/message-processor.ts:132)',
    summary:
      '`MessageProcessor` defaults `options.version` to `"v0.9"` even when imported from `@a2ui/web_core/v1_0` and initialized exclusively with `protocolVersion: "1.0"` catalogs.',
    reproductionOrEvidence:
      '`src/processing/message-processor.js` line 89 sets `this.version = options?.version ?? "v0.9"`.',
    freshcartWorkaround:
      'Explicitly pass `{ version: "v1.0" }` when instantiating `@a2ui/web_core` `MessageProcessor` in verification tests.',
    recommendationForA2UITeam:
      'Infer the default `MessageProcessor` version from the highest `protocolVersion` of the provided catalogs (`"v1.0"` when `1.0` catalogs are passed).',
  },
  {
    id: 'BUG-08',
    title: 'CreateSurfaceMessageSchema Rejects createSurface.theme in @a2ui/web_core/v1_0',
    category: 'spec-mismatch',
    severity: 'high',
    affectedTarget: '@a2ui/web_core@0.14.0 (src/v1_0/schema/agent-to-renderer.js)',
    summary:
      '`CreateSurfaceMessageSchema` omits `theme` on `createSurface` and applies `.strict()`, throwing `A2uiValidationError: Unrecognized key(s) in object: \'theme\'` even though `V1Point0Adapter` still reads `cs?.theme`.',
    reproductionOrEvidence:
      'Passing `theme` inside `createSurface` in a v1.0 message throws `A2uiValidationError`.',
    freshcartWorkaround:
      'All FreshCart v1.0 `createSurface` messages omit `theme` and style components via the host catalog.',
    recommendationForA2UITeam:
      'Remove dead `cs?.theme` code in `V1Point0Adapter` and clearly document `theme` removal in `createSurface` reference docs.',
  },
  {
    id: 'BUG-09',
    title: 'PayloadValidator.validateComponent Strips Envelope Keys Before Custom Schema Validation',
    category: 'renderer-bug',
    severity: 'medium',
    affectedTarget: '@a2ui/web_core@0.14.0 (src/validation/payload-validator.ts:172)',
    summary:
      '`PayloadValidator.validateComponent` calls `stripEnvelopeKeys(comp)` (deleting `id` and `component`) before running `componentApi.schema.safeParse(properties)`, causing custom `ComponentApi` schemas that extend `ComponentCommonSchema` to fail on missing `id`.',
    reproductionOrEvidence:
      'Verified in `scripts/verify-a2ui-v1.mjs` when registering custom `ProductDealCard` and `NutritionSummary` schemas with `PayloadValidator`.',
    freshcartWorkaround:
      'Define custom `ComponentApi.schema` with only component-specific properties (omitting `id`, `component`, `catalogId`, `metadata`).',
    recommendationForA2UITeam:
      'Document that `ComponentApi.schema` must only describe component-specific properties because envelope keys are stripped prior to `safeParse`.',
  },
];

export function generateOnboardingMarkdownReport(): string {
  const lines: string[] = [
    '# A2UI v1.0 Public Onboarding Discovery, Documentation Gaps & Bugs Report',
    '',
    `- **Tested Date:** ${ONBOARDING_SUMMARY_METRICS.testedAt}`,
    `- **Target Protocol:** ${ONBOARDING_SUMMARY_METRICS.targetSpecVersion}`,
    `- **Packages Audited:** ${ONBOARDING_SUMMARY_METRICS.npmReleaseTested}`,
    `- **Total Findings:** ${ONBOARDING_SUMMARY_METRICS.docGapsCount} Documentation Gaps + ${ONBOARDING_SUMMARY_METRICS.bugsCount} Package/Runtime Bugs`,
    '',
    '## 1. Documentation Gaps (`DOC-GAP-01` – `DOC-GAP-10`)',
    '',
  ];

  for (const gap of DOCUMENTATION_GAPS) {
    lines.push(
      `### ${gap.id} [${gap.severity.toUpperCase()}]: ${gap.title}`,
      `- **Target:** \`${gap.affectedTarget}\``,
      `- **Summary:** ${gap.summary}`,
      `- **Evidence:** ${gap.reproductionOrEvidence}`,
      `- **FreshCart Workaround:** ${gap.freshcartWorkaround}`,
      `- **Recommendation:** ${gap.recommendationForA2UITeam}`,
      ''
    );
  }

  lines.push('## 2. Package & Runtime Bugs (`BUG-01` – `BUG-08`)', '');

  for (const bug of FRAMEWORK_BUGS) {
    lines.push(
      `### ${bug.id} [${bug.severity.toUpperCase()}]: ${bug.title}`,
      `- **Target:** \`${bug.affectedTarget}\``,
      `- **Summary:** ${bug.summary}`,
      `- **Reproduction:** ${bug.reproductionOrEvidence}`,
      `- **FreshCart Workaround:** ${bug.freshcartWorkaround}`,
      `- **Recommendation:** ${bug.recommendationForA2UITeam}`,
      ''
    );
  }

  return lines.join('\n');
}
