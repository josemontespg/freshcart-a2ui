# PR 06 — A2UI Express: Zero-Prior-Knowledge Developer Discovery, Implementation & Findings

- **Branch**: `feat/06-express`
- **Live Demo URL**: `http://josemontesp.c.googlers.com:5186`
- **Methodology**: Zero-prior-knowledge investigation using strictly public resources (`google/A2UI` repository, public `docs/public/`, and published npm packages `@a2ui/agent@0.0.1` / `@a2ui/web_core@0.14.0`).

---

## 1. How a New External Developer Discovers "Express" in Public A2UI v1.0

When an external developer searches the public `google/A2UI` repository and npm registry for `"express"`, they encounter **two distinct but complementary layers**:

### A. Primary Meaning: A2UI Express DSL (Concise Inference Format `<a2ui>...</a2ui>`)

**A2UI Express** is A2UI v1.0's compact, line-oriented declarative UI domain-specific language (DSL) designed for LLM generation and round-trip agent state injection. Instead of asking an LLM to emit verbose, deeply nested JSON envelopes (`<a2ui-json>...</a2ui-json>`), the model emits concise positional constructor calls inside `<a2ui>...</a2ui>` sentinel tags, reducing output token count by **55%–70%** and lowering time-to-first-render.

Key files discovered in the public `google/A2UI` repository:

| Area | Public Repository Path | Purpose |
| :--- | :--- | :--- |
| **Technical Specification** | `specification/proposals/express/a2ui_express.md` | Normative specification of the A2UI Express language, grammar constructs, compilation rules, and decompilation round-tripping. |
| **Prompt Contract & Examples** | `specification/proposals/express/express_dsl_examples.md` | Side-by-side comparison of Direct JSON vs. A2UI Express prompts and compiled A2UI v1.0 output. |
| **ANTLR4 Grammar** | `specification/inference_formats/express/Express.g4` | Formal grammar defining `program`, `statement`, `varAssign`, `pathAssign`, `expr`, `funcCall`, `checkCall`, and lexer rules. |
| **TypeScript Agent SDK** | `typescript/agents/a2ui_agent/src/inference-formats/express/` | Reference TypeScript implementation (`format.ts`, `parser.ts`, `compiler.ts`, `decompiler.ts`, `prompt-generator.ts`, `schema-helper.ts`). |
| **Known Gaps Tracker** | `typescript/agents/a2ui_agent/KNOWN_GAPS.md` | Tracks known limitations in `@a2ui/agent` (e.g., lack of streaming in Express). |
| **Conformance Suite** | `conformance/agent/express/*.yaml` | Language-agnostic conformance tests for Express compilation, decompilation, and prompt generation. |

#### Core A2UI Express DSL Constructs (`Express.g4` + `a2ui_express.md`)

1. **Sentinel Wrapper & Lifecycle Statements**:
   - `<a2ui> ... </a2ui>` wraps each UI block inside a natural-language assistant reply.
   - `surface("surface_id", sendDataModel=true, update=false)` initializes or updates a surface.
   - `deleteSurface("surface_id")` tears down an existing surface.
2. **Data Model Path Assignments (`$/path = value`)**:
   - `$/servings = 2`, `$/deliveryZip = "94107"`, `$/dietary/organicOnly = true`.
   - When a `root` component is defined in the same block, path assignments populate `createSurface.dataModel` (or `updateDataModel`); when `root` is omitted, each path assignment compiles to a standalone `updateDataModel` envelope.
3. **Positional & Keyword Component Constructors**:
   - Required schema properties come first in catalog definition order, followed by optional properties, with `checks` last on checkable components (`Button`, `TextField`, `CheckBox`, `ChoicePicker`, `Slider`, `DateTimeInput`).
   - `_` skips an optional positional parameter (`TextField("ZIP Code", $/zip, _, [?required("Required")])`).
   - Both flat variable references (`header = Card(header_col)`) and inline nested constructors (`Button(Text("Add Bundle"), Event("add_bundle"), "primary")`) are supported; inline components are flattened to deterministic `<parent>_<prop>_<idx>` IDs.
   - Non-identifier component IDs use the reserved `id="..."` keyword (`deal_grid = Column([c1, c2], id="express-deal-grid")`).
4. **Data Bindings, Dynamic Templates, Actions & Validation Checks**:
   - Absolute data binding: `$/servings` $\rightarrow$ `{"@path": "/servings"}`; relative binding: `$name` $\rightarrow$ `{"@path": "name"}`.
   - Dynamic collection template: `_template($/items, item_row)` $\rightarrow$ `{"path": "/items", "componentId": "item_row"}`.
   - Event action: `Event("add_recipe_bundle_to_cart", {servings: $/servings})` $\rightarrow$ `{"event": {"name": "add_recipe_bundle_to_cart", "context": {"servings": {"@path": "/servings"}}}}`.
   - Validation checks: `?required("Msg")`, `?regex(r"^[0-9]{5}$", "Msg")`, `?numeric(1, 8, "Msg")` $\rightarrow$ compiled to A2UI v1.0 `CheckRule` objects where the enclosing component's bound `value` path is automatically injected as the first (`value`) argument of the check function.

### B. Secondary Meaning: Express.js Server + A2UI Express DSL in `samples/agent/node/restaurant_finder`

In `samples/agent/node/restaurant_finder/`, the Node.js reference agent combines **both** meanings of "Express":
- It runs an **Express.js (`express@^5.2.1`)** HTTP server mounting A2A middleware (`agentCardHandler`, `jsonRpcHandler` from `@a2a-js/sdk/server/express`).
- It configures `@a2ui/agent`'s `A2uiRequestProcessor` with `ExpressFormatFactory` when `A2UI_FORMAT=express` (defaulting to Express DSL in `samples/agent/node/restaurant_finder/agent.ts`).

---

## 2. How We Implemented A2UI Express in FreshCart (`feat/06-express`)

1. **Browser- & Server-Safe A2UI v1.0 Express Compiler & Decompiler (`src/a2ui/express/expressCompiler.ts`)**:
   - Implemented `extractExpressBlocks()`, `compileA2UIExpress()`, `decompileA2UIToExpress()`, and `generateExpressSystemPrompt()` supporting both the **A2UI v1.0 Basic Catalog** (18 components) and **FreshCart's Custom Grocery Catalog** (`ProductDealCard`, `NutritionSummary`).
   - Built with zero Node `fs` dependencies so compilation and round-trip decompilation run identically in the browser client and inside the Vite backend middleware.
   - Includes fixes for all 4 bugs discovered in `@a2ui/agent@0.0.1` (detailed in Section 4 below).
2. **15-Minute Express Skillet & 1-Tap Express Checkout Showcase (`src/scenarios/expressShopperScenario.ts`)**:
   - Authored a full interactive grocery surface in genuine `<a2ui>...</a2ui>` A2UI Express DSL (`buildExpressShopperDslSource()`) that compiles live into A2UI v1.0 `createSurface`, `updateComponents`, and `updateDataModel` envelopes.
   - Showcases `surface(...)`, `$/...` data model assignments, positional and keyword constructors, inline `Button(Text(...), Event(...))` nesting, custom hyphenated IDs (`id="express-deal-grid"`), `?required` and `?regex(r"^[0-9]{5}$", ...)` ZIP code validation checks, `NutritionSummary`, and 4 live `ProductDealCard` skillet ingredients.
3. **First-Position Quick Suggestion Pill & Consumer-Friendly UI (`ScenarioSelector.tsx` & `AIShopperDrawer.tsx`)**:
   - Added `⚡ 15-Min Express Dinner` as the **first quick suggestion pill** in the AI Personal Shopper chat so a single click immediately compiles and renders the Express surface.
   - Dragging the **Dinner Servings** slider (`1..8`), toggling **Prefer USDA Organic**, or editing the **Express Delivery ZIP Code** dynamically recompiles and updates the surface data model and deal cards in real time.
   - Kept the primary shopper UI 100% warm, appetizing, and consumer-friendly (no intrusive developer debug console), with a subtle, collapsed-by-default `"Compiled via A2UI Express · 62% fewer tokens — View DSL"` pill for reviewers who wish to inspect the underlying `<a2ui>` source.

---

## 3. Public Documentation Gaps Discovered

### Gap 1: Near-Zero Visibility on `a2ui.org` (`docs/public/`) & Broken Glossary Link
- **Where**: `docs/public/` (the entire public documentation site source).
- **Finding**: There is no guide, tutorial, or specification page for A2UI Express anywhere under `docs/public/`. A search for `express` across `docs/public/` yields only a single glossary entry in `docs/public/concepts/glossary.md` (lines 211 and 221).
- **Broken / Wrong-Org Link**: That glossary entry links `[A2UI Express]` to `https://github.com/a2ui-project/a2ui/tree/main/python/a2ui_agent/src/a2ui/inference_formats/express` — which points to the wrong GitHub organization (`a2ui-project/a2ui` instead of `google/A2UI`) and links to raw Python source files rather than `specification/proposals/express/a2ui_express.md`.

### Gap 2: Published `@a2ui/agent@0.0.1` on NPM vs. Git `main` README Drift
- **Where**: Published `@a2ui/agent@0.0.1` on npm vs. `typescript/agents/a2ui_agent/README.md` on `main`.
- **Finding 2a (Silent Default Format Mismatch)**: On git `main` (`commit 0968640`), `A2uiRequestProcessor` defaults `formatFactory` to `new ExpressFormatFactory()`. However, in the published npm package `@a2ui/agent@0.0.1` (`dist/src/processor.js:35`), `A2uiRequestProcessor` defaults to `new DirectJsonFormatFactory()`. Any external developer who installs `npm i @a2ui/agent` and follows the README without explicitly passing `formatFactory: new ExpressFormatFactory()` silently gets Direct JSON (`<a2ui-json>`) instead of Express (`<a2ui>`).
- **Finding 2b (Unpublished APIs in README)**: The `README.md` on `main` documents `RendererState`, `validatePayload`, `processor.openStream()`, and `processor.parseResponse(llmReply, { state })` — all of which were added in commits `a2be118` and `c4e0e06` after `@a2ui/agent@0.0.1` was published to npm, without releasing `0.0.2`.

### Gap 3: Contradictions Between `a2ui_express.md` Specification and `Express.g4` Grammar
- **Where**: `specification/proposals/express/a2ui_express.md` vs. `specification/inference_formats/express/Express.g4`.
- **Finding 3a (Unicode UAX #31 vs. ASCII-Only Identifiers)**: `a2ui_express.md` (line 53) states that variable names follow Unicode UAX #31 (`[\p{L}_][\p{L}\p{N}_]*`) so multilingual models can emit non-Latin variable names (`título = Text("Hola")`). However, `Express.g4` (line 80) defines `IDENTIFIER : [a-zA-Z_] [a-zA-Z0-9_]* ;`, rejecting all non-ASCII variable names at lexing time.
- **Finding 3b (Non-Existent `surfaceParams: {}` Property)**: `a2ui_express.md` (line 80) states that `surface("main")` compiles to `{"version": "v1.0", "createSurface": {"surfaceId": "main", "catalogId": "...", "surfaceParams": {}}}`. Neither `agent_to_renderer.json` nor `ExpressCompiler` supports or emits `surfaceParams`.
- **Finding 3c (Statement Separators)**: `a2ui_express.md` states that statements are strictly newline-separated, whereas `Express.g4` skips both newlines (`WS`) and semicolons (`SEMICOLON : ';' -> skip ;`) in the lexer.

### Gap 4: Streaming Advertised in Spec Despite `supportsStreaming = false`
- **Where**: `specification/proposals/express/a2ui_express.md` (line 13) vs. `typescript/agents/a2ui_agent/src/inference-formats/express/format.ts` (line 42) and `KNOWN_GAPS.md` (line 11).
- **Finding**: `a2ui_express.md` pitches *"Streaming compatibility: A line-oriented grammar allows progressive rendering before the model finishes generating."* Yet `ExpressFormat.supportsStreaming` is hardcoded to `false`, `KNOWN_GAPS.md` explicitly notes *"Express does not stream"*, and calling `processor.openStream()` with `ExpressFormatFactory` throws an error because forward references to child component variables cannot be resolved until `root` is parsed.

---

## 4. Library Bugs & Packaging Issues Found in `@a2ui/agent`

### Bug 1: `ExpressDecompiler` Crashes with `ExpressInvalidIdentifierError` on Hyphenated Component IDs Instead of Emitting `id="..."`
- **Location**: `typescript/agents/a2ui_agent/src/inference-formats/express/decompiler.ts:697-700`
- **Spec Requirement**: `specification/proposals/express/a2ui_express.md` (line 54) states:
  > *"When the decompiler encounters a component ID like `"content-grid"`, it derives a valid variable name (`content_grid`) and emits `id="content-grid"`."*
  (Python's `decompiler.py` implements this via `_assign_variable_names()`.)
- **Actual Behavior in TypeScript**: `ExpressDecompiler.formatComponent()` checks `if (!VALID_IDENTIFIER_RE.test(compId))` and immediately throws `new ExpressInvalidIdentifierError(compId)`!
- **Minimal Reproducer**:
  ```ts
  // Compiles cleanly via ExpressCompiler:
  const dsl = `<a2ui>\nsurface("s1")\nroot = Column([], id="content-grid")\n</a2ui>`;
  // Crashes when decompiling the resulting A2UI v1.0 message back to Express:
  // Throws ExpressInvalidIdentifierError: Invalid identifier 'content-grid'
  ```
- **Our Fix in FreshCart**: `deriveSafeVariableName()` in `src/a2ui/express/expressCompiler.ts` converts `"express-deal-grid"` into variable `express_deal_grid` and appends `id="express-deal-grid"` during decompilation, restoring lossless round-tripping.

### Bug 2: `BlockLexer` Single-Quote (`'`) and `//` Comment Desynchronization Swallows Closing `</a2ui>` Tags
- **Location**: `typescript/agents/a2ui_agent/src/inference-formats/express/parser.ts:88-90` & `src/lexer.ts:49-88`
- **Root Cause**:
  1. `Express.g4` supports three comment styles (`#`, `//`, and `/* ... */`) and **only** double-quoted strings (`"..."` and `"""..."""`), **not** single-quoted strings (`'...'`).
  2. However, `ExpressParser` initializes `BlockLexer` with `stringDelimiters = new Set(["'", '"'])` and `singleLineComments = new Set(['#'])` (omitting `'//'` and `'/*'`).
- **Actual Behavior**: When an LLM writes a valid `//` or `/* */` comment containing an apostrophe/contraction (e.g., `// Chef's 15-minute express dinner`), `BlockLexer` does not recognize `//` as a comment, treats the apostrophe `'` in `Chef's` as opening a single-quoted string literal (`LexerState.IN_STRING`), and consumes the rest of the `<a2ui>` block—including the closing `</a2ui>` sentinel tag—inside `IN_STRING`, causing `parseResponse()` to fail with an unclosed block error.
- **Minimal Reproducer**:
  ```text
  <a2ui>
  // Chef's 15-Minute Express Dinner
  surface("dinner")
  root = Text("Ready in 15 minutes")
  </a2ui>
  ```
- **Our Fix in FreshCart**: `extractExpressBlocks()` in `src/a2ui/express/expressCompiler.ts` tracks `#`, `//`, and `/* ... */` comments and restricts string delimiters to `"` and `"""` per `Express.g4`.

### Bug 3: Naive Substring Sentinel Splitting in `ExpressCompiler.compile()` Corrupts String Literals Mentioning `<a2ui>`
- **Location**: `typescript/agents/a2ui_agent/src/inference-formats/express/compiler.ts:501-524`
- **Root Cause**: `ExpressCompiler.compile()` checks `if (dslText.includes('<a2ui>'))` and splits lines on literal `'<a2ui>'` and `'</a2ui>'` substrings without lexer state awareness.
- **Actual Behavior**: If raw DSL (already extracted by `ExpressParser`) contains a string literal mentioning `<a2ui>` (for example, `root = Text("Compiled from <a2ui> block")`), `ExpressCompiler.compile()` mistakes the substring inside the `Text` literal for an opening sentinel tag and discards every line before it (`surface(...)`, data model assignments, and prior components).

### Bug 4: Top-Level `import * as fs from 'fs'` in Single Barrel Entrypoint Blocks Browser/On-Device Bundling & `ExpressCompiler` Is Not Exported
- **Location**: `typescript/agents/a2ui_agent/src/catalog-providers.ts:16` and `typescript/agents/a2ui_agent/src/index.ts:39-48`
- **Root Cause**:
  1. `specification/proposals/express/a2ui_express.md` specifically highlights **on-device models with a client/host-side compiler** as a primary use case for A2UI Express.
  2. However, `@a2ui/agent` exposes only a single package entrypoint (`"."` $\rightarrow$ `./dist/src/index.js`) that unconditionally re-exports `FileSystemCatalogProvider` (`import * as fs from 'fs'`), causing Vite/Webpack browser builds to fail unless Node's `fs` module is shimmed or externalized.
  3. Furthermore, `src/index.ts` exports `ExpressFormat`, `ExpressFormatFactory`, `ExpressDecompiler`, `ExpressPromptGenerator`, and `ExpressParser`, but **omits `ExpressCompiler`**, preventing developers from importing `ExpressCompiler` directly from `@a2ui/agent`.
