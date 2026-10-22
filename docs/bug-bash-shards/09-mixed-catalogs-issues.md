# Feature 09: Mixed Catalogs (Multi-Catalog Surfaces) — A2UI v1.0 Bug Bash Issues

- **Feature Area**: `Mixed Catalogs (Multi-Catalog Surfaces)`
- **Target Repository**: `https://github.com/google/A2UI` (`main` @ `e9dbcc3`)
- **Packages Tested**: `@a2ui/web_core@0.14.0`, `@a2ui/react@0.14.0`
- **Total Issues**: **14** (`6` Documentation Gaps + `8` Library/Schema Bugs)

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
