# Shard 06 — A2UI Express DSL (`@a2ui/agent` & `specification/proposals/express`) Issues

Total Issues in Shard: **8** (**4 Documentation Gaps** + **4 Library Bugs**)

---

## [ISSUE-06-01] [v1.0][docs] A2UI Express has no guide or reference page on a2ui.org (`docs/public/`) and the glossary links to the wrong GitHub org (`a2ui-project/a2ui`)
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

## [ISSUE-06-02] [v1.0][agent] Published `@a2ui/agent@0.0.1` on npm defaults to `DirectJsonFormatFactory` and is missing APIs documented in `typescript/agents/a2ui_agent/README.md`
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

## [ISSUE-06-03] [v1.0][spec] Contradictions between `a2ui_express.md` specification and `Express.g4` grammar (UAX #31 identifiers, `surfaceParams`, statement separators)
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

## [ISSUE-06-04] [v1.0][spec][agent] `a2ui_express.md` advertises line-by-line progressive streaming, but `ExpressFormat.supportsStreaming` is hardcoded to `false`
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

## [ISSUE-06-05] [v1.0][agent] `ExpressDecompiler` throws `ExpressInvalidIdentifierError` on hyphenated component IDs instead of emitting `id="..."` per spec
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

## [ISSUE-06-06] [v1.0][agent] `ExpressParser` configures `BlockLexer` with single-quote (`'`) strings and omits `//` and `/* */` comments, swallowing `</a2ui>` when a comment contains an apostrophe
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

## [ISSUE-06-07] [v1.0][agent] `ExpressCompiler.compile()` uses naive substring `.includes('<a2ui>')` / `.split('</a2ui>')` stripping that corrupts string literals containing `<a2ui>`
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

## [ISSUE-06-08] [v1.0][agent] `@a2ui/agent` top-level `import * as fs from 'fs'` breaks browser/on-device bundling and `ExpressCompiler` is missing from `src/index.ts` exports
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
