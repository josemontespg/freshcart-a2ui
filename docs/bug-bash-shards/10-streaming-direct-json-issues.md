# Shard 10: Streaming in Direct JSON (`10-streaming-direct-json`) — Self-Contained GitHub Issues

Total Issues in Shard: **9** (**4 Documentation Gaps** + **5 Bugs**)

---

## [ISSUE-10-01] [Docs][Transports] `docs/public/concepts/transports.md` contains placeholder `// TODO: Add an example` blocks for HTTP/REST, WebSockets, and Server-Sent Events (SSE)
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

## [ISSUE-10-02] [Docs][v1.0] `docs/public/concepts/data-flow.md` and `docs/public/reference/messages.md` omit A2UI v1.0, inline `createSurface.components`/`dataModel`, required `updateDataModel.value`, and `@path`/`@call`
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

## [ISSUE-10-03] [Docs][Agent Guide] `docs/public/guides/agent-development.md` only covers v0.8/v0.9, references non-existent `'render'`/`'update'` schema operations, and ends with an unfinished TODO
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

## [ISSUE-10-04] [v1.0][Spec] `specification/v1_0/json/agent_to_renderer.json` `CreateSurfaceMessage` description contradicts v1.0 inline `components` and `dataModel` support
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

## [ISSUE-10-05] [v1.0][agent] `DirectJsonResponseStream` cannot progressively stream v1.0 single-message `createSurface` with inline `components` and `dataModel`
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

## [ISSUE-10-06] [v1.0][web_core] `MessageProcessor` with `STRICT_VALIDATION` throws `A2uiIntegrityError` (`Dangling reference`) on top-down streaming recommended by `DirectJsonFormat`
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

## [ISSUE-10-07] [v1.0][web_core] `MessageProcessor` constructor silently ignores `STRICT_VALIDATION` / `RELAXED_VALIDATION` when passed directly as the 3rd argument instead of `{ validationConfig }`
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

## [ISSUE-10-08] [v1.0][agent] `DirectJsonResponseStream` sets `wholeItemKeys: ['components']` in v1.0, disabling `progressiveKeys: ['text']` streaming inside `updateComponents`
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

## [ISSUE-10-09] [v1.0][web_core] `V1Point0Adapter.extractOperationsFromObject` extracts dead `cs?.theme` field rejected by `.strict()` `CreateSurfaceMessageSchema`
- **Status**: `[ ] PENDING`
- **GitHub Issue**: _Not created yet_
- **Label**: `v1-bug-bash`
- **Type**: `Bug`
- **Feature Area**: `Streaming in Direct JSON / v1.0 Adapter`
- **Title**: `[v1.0][web_core] V1Point0Adapter.extractOperationsFromObject extracts dead 'cs?.theme' field rejected by .strict() CreateSurfaceMessageSchema`

<!-- ISSUE_BODY_START -->
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
