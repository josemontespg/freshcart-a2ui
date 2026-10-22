# Feature 07 — Server-Side & Client-Side Functions: Bug Bash Issues Shard (`07-functions-issues.md`)

> **Total Issues in Shard**: 13 (`6` SDK/Schema Bugs + `7` Public Documentation Gaps)
> **Source Commit Verified**: `e9dbcc3` (`https://github.com/google/A2UI`) and `@a2ui/web_core@0.14.0` / `@a2ui/react@0.14.0`

---

## [ISSUE-07-01] [v1.0][web_core] Declarative `@call` functions in UI bindings, checks, and `action.functionCall` never route to `RpcHandler.callAgentFunction` (Spec Fallback Routing missing)
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

## [ISSUE-07-02] [v1.0][web_core] `createCatalogInvoker` never checks `allowedCallers === 'agentOnly'`, allowing UI bindings and local actions to invoke agent-only functions
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

## [ISSUE-07-03] [v1.0][web_core] `DataContext` does not handle `Promise` return values from async `FunctionImplementation.execute`
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

## [ISSUE-07-04] [v1.0][web_core] `ErrorMessageSchema` in `src/v1_0/schema/renderer-to-agent.ts` uses `!z.any().safeParse(value).success` and rejects 100% of error envelopes
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

## [ISSUE-07-05] [v1.0][web_core] `MessageProcessor` and `RpcHandler` emit legacy v0.9 `call` key instead of v1.0 `'@call'` in `callRendererFunction` / `callAgentFunction`
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

## [ISSUE-07-06] [v1.0][web_core][react] `@a2ui/web_core` root index omits `./v1_0` and `./rpc`, and `@a2ui/react@0.14.0` has no v1.0 or `RpcHandler` support
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

## [ISSUE-07-07] [v1.0][docs] `docs/public/reference/messages.md` has no v1.0 tab and omits all four v1.0 function RPC envelopes
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

## [ISSUE-07-08] [v1.0][docs] `docs/public/concepts/actions.md` uses legacy v0.9 `call`/`path` syntax and falsely states functions never make network round-trips
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

## [ISSUE-07-09] [v1.0][docs] `docs/public/concepts/data-binding.md` mislabels v0.9 `{"path": "..."}` syntax as `"v0.9 and later"` and omits `{"@call": "..."}` reactive bindings
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

## [ISSUE-07-10] [v1.0][docs] `docs/public/concepts/catalogs.md` documents v0.9 array-based `functions` schema instead of v1.0 map-based `functions` with `allowedCallers` & `requiresUserActivation`
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

## [ISSUE-07-11] [v1.0][spec/docs] `specification/v1_0/docs/a2ui_custom_functions.md` is unlinked from `docs/public/` and its `getScreenResolution` example fails with `INVALID_FUNCTION_CALL` when called via `callRendererFunction`
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

## [ISSUE-07-12] [v1.0][spec/docs] `specification/v1_0/docs/a2ui_protocol.md` Introduction states there are 4 agent-to-renderer messages instead of 6 (omitting `callRendererFunction` and `agentFunctionResponse`)
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

## [ISSUE-07-13] [v1.0][docs] `docs/public/guides/renderer-development.md` v1.0 tab references non-existent `surfaceProperties` and `a2uiClientCapabilities` and omits `agentFunctionResponse`
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
