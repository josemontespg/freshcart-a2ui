# Feature 05: A2UI v1.0 Protocol Extensions (`metadata.extensions`) — Bug Bash Issues Shard

## [ISSUE-05-01] [v1.0][web_core] `PayloadValidator.validateComponent` strips `metadata` before `validateCommonEnvelopeFields` runs (dead code), bypassing `metadata.extensions` validation on `updateComponents`
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

## [ISSUE-05-02] [v1.0][web_core] `@a2ui/web_core@0.14.0` `v1_0` `ExtensionsSchema` regex wrongly accepts colons (`:`) and hyphens (`-`) in `metadata.extensions` keys
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

## [ISSUE-05-03] [v1.0][web_core] `SurfaceModel.dispatchAction` silently drops `metadata.extensions` from outbound renderer-to-agent `action` payloads
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

## [ISSUE-05-04] [v1.0][web_core][react] `ComponentNode` and `@a2ui/react`'s `useNodeView` do not expose component `metadata` (`metadata.extensions`) or include it in `ComponentNode.toJSON()`
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

## [ISSUE-05-05] [v1.0][docs] Public documentation (`docs/public/`) has zero coverage of A2UI v1.0 Protocol Extensions (`metadata.extensions`)
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

## [ISSUE-05-06] [v1.0][docs] UAX #31 identifier requirement on `metadata.extensions` keys (forbidding `.`, `-`, and `:`) is undocumented in prose guides
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

## [ISSUE-05-07] [v1.0][docs] No migration example showing how removed v0.9 `createSurface.theme` maps to v1.0 `createSurface.metadata.extensions`
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

## [ISSUE-05-08] [v1.0][docs][react] Undocumented runtime access path for reading `metadata.extensions` inside `@a2ui/react` and `@a2ui/web_core` custom components
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
