# PR 05: A2UI v1.0 Protocol Extensions (`metadata.extensions`) — Discovery, Architecture & Onboarding Learnings

## 1. Zero-Prior-Knowledge Discovery from Public A2UI Data

When approaching A2UI v1.0 as an external developer with zero prior knowledge, searching the public `google/A2UI` repository (`specification/`, `docs/`, `typescript/`) for `"extension"` and `"metadata"` reveals that **"Extensions"** in A2UI v1.0 spans two distinct architectural layers:

### A. Wire-Level Protocol Extensions (`metadata.extensions` — `common_types.json#/$defs/Extensions`)
Introduced in A2UI v1.0 (`specification/v1_0/docs/evolution_guide.md` lines 14, 53, 73, 76, 85), A2UI v1.0 defines a standardized vendor/protocol extensibility map in `specification/v1_0/json/common_types.json` (lines 40–47):

```json
"Extensions": {
  "type": "object",
  "description": "Optional extension metadata. Keys MUST be Unicode identifiers (UAX #31). Keys starting with 'a2ui_' are reserved for official extensions.",
  "patternProperties": {
    "^[\\p{XID_Start}_][\\p{XID_Continue}]*$": {}
  },
  "additionalProperties": false
}
```

`$defs/Extensions` is attached via `metadata.extensions` at **four** points in the A2UI v1.0 specification:
1. **Surface-Level (`createSurface.metadata.extensions`)** — `agent_to_renderer.json#/$defs/CreateSurfaceMessage` (lines 46–55):
   - Because A2UI v1.0 removed the legacy `createSurface.theme` property (`evolution_guide.md` line 73 & 139), surface-level theming, celebratory behaviors, and session telemetry are carried via `createSurface.metadata.extensions`.
2. **Component-Level (`ComponentCommon.metadata.extensions`)** — `common_types.json#/$defs/ComponentCommon` (lines 61–70):
   - Every component instance in `createSurface.components` or `updateComponents.components` can carry `metadata: { extensions: { ... } }` to attach vendor-specific UI decorations, animations, aisle locators, or merchandising provenance without polluting or breaking the component's strict catalog schema.
3. **Outbound Action-Level (`action.metadata.extensions`)** — `renderer_to_agent.json#/properties/action/properties/metadata` (lines 43–52):
   - When a user triggers an action on a surface, the renderer can attach `metadata: { extensions: { ... } }` to the outbound `action` envelope sent back to the agent (e.g., analytics provenance, client viewport/store context, or audit signatures).
4. **Static Catalog Component Definitions (`ComponentDefinition.metadata.extensions`)** — `catalog_definition.json#/$defs/ComponentDefinition` (lines 189–198):
   - Catalog authors can attach static extension metadata to component definitions inside a catalog JSON schema.

### B. Transport-Level A2A Extension (`https://a2ui.org/a2a-extension/a2ui/v1.0`)
- Defined in `specification/v1_0/extensions/a2a/docs/a2ui_extension_specification.md`, this specifies how A2UI v1.0 messages are transported inside Agent-to-Agent (A2A) `DataPart` envelopes (`mimeType: "application/a2ui+json"`), negotiated via `X-A2A-Extensions` and `message.metadata["a2uiRendererCapabilities"]`.

---

## 2. How Protocol Extensions (`metadata.extensions`) Are Showcased in FreshCart

In this PR (`feat/05-extensions`), we implemented end-to-end support for A2UI v1.0 `metadata.extensions` across `SurfaceManager.ts`, `A2UISurfaceRenderer.tsx`, `AIShopperDrawer.tsx`, and a dedicated **Chef's Artisanal Tasting Board (`extensionsShowcaseScenario.ts`)** launched with 1 click via the **`✨ Protocol Extensions`** suggestion pill:

1. **Surface-Level Extensions (`createSurface.metadata.extensions`)**:
   - `freshcart_theme`: Replaces the removed v0.9 `createSurface.theme` field with a reactive v1.0 surface extension supporting three live palettes (`harvest-gold`, `emerald-organic`, and `midnight-cellar`) switchable directly from a `ChoicePicker` inside the surface.
   - `freshcart_confettiOnAction`: Configures celebratory particle bursts (`particleCount: 32`, `celebrationText`) when primary bundle actions are dispatched on the surface.
   - `freshcart_analyticsProvenance` & `a2ui_telemetry`: Tracks campaign attribution (`chef_tasting_extensions_2026`) and protocol session telemetry (`common_types.json#/$defs/Extensions`).
2. **Component-Level Extensions (`ComponentCommon.metadata.extensions`)**:
   - `freshcart_dealSpotlight`: Renders a top promotional spotlight ribbon (`⚡ Chef Reserve Bundle`, `⚡ Sommelier Finishing Touch · Save $3.50`) on `Card` and `ProductDealCard` components without modifying their catalog schemas.
   - `freshcart_aisleHighlight`: Attaches an interactive **"📍 Aisle X · Locate in Store →"** footer bar to components. Clicking it dispatches `freshcart:highlight-aisle`, which filters the left-hand FreshCart storefront to that aisle and opens the product detail modal.
   - `freshcart_animations`: Adds smooth entrance and hover-lift micro-interactions to decorated components.
3. **Outbound Action Extensions (`action.metadata.extensions`)**:
   - When the user clicks **"Add Tasting Board to Cart"** or **"📍 Aisle"**, `A2UISurfaceRenderer` constructs a spec-compliant `action.metadata.extensions` payload merging component-level `freshcart_analyticsProvenance`, renderer-side `freshcart_clientContext`, and `a2ui_telemetry`.
   - Clicking **"Inspect Extensions"** in the surface header opens a live 3-panel inspector showing the surface's `createSurface.metadata.extensions`, all decorated `ComponentCommon.metadata.extensions` nodes, and the captured `action.metadata.extensions` round-trip JSON payload.

---

## 3. Public Documentation Gaps Discovered

| ID | Documentation Gap | Where We Looked | Impact on External Developers |
| :--- | :--- | :--- | :--- |
| **DOC-EXT-01** | **Zero mention of `metadata.extensions` on the public documentation site (`docs/public/`)** | `docs/public/concepts/`, `docs/public/guides/`, `docs/public/reference/` | Searching `docs/public/` for `metadata` only returns v0.9 A2A transport `a2uiClientDataModel` and `a2uiClientCapabilities`. There is no guide or reference page explaining `createSurface.metadata.extensions`, `ComponentCommon.metadata.extensions`, or `action.metadata.extensions`. |
| **DOC-EXT-02** | **UAX #31 extension key constraint (`^[\p{XID_Start}_][\p{XID_Continue}]*$`) is undocumented in prose guides** | `specification/v1_0/docs/a2ui_protocol.md`, `docs/public/` | Developers accustomed to reverse-DNS or kebab-case extension keys (like `freshcart.theme`, `freshcart-theme`, or `freshcart:theme`) have no prose documentation warning them that dots (`.`), hyphens (`-`), and colons (`:`) are illegal under UAX #31 and will fail v1.0 schema validation. Only `common_types.json` and `test/cases/initial_state_validation.json` reveal that underscores (`freshcart_theme`) are required. |
| **DOC-EXT-03** | **No documentation on how replaced `createSurface.theme` maps to `createSurface.metadata.extensions`** | `specification/v1_0/docs/evolution_guide.md` (lines 73, 139) | `evolution_guide.md` states *"Remove the `theme` field from `createSurface` messages. You can pass initial `components`, `dataModel`, and optional `metadata.extensions` directly in the `createSurface` payload"*, but provides no example of how renderers should read surface-level `metadata.extensions` to apply theming. |
| **DOC-EXT-04** | **No documentation on how `@a2ui/react` components access `metadata.extensions`** | `typescript/renderers/react/README.md`, `docs/public/` | React catalog component authors are never told how to read component-level or surface-level `metadata.extensions` inside a custom component implementation (`context.componentModel.metadata?.extensions` vs `context.dataContext.surface.metadata?.extensions`). |

---

## 4. Library Bugs & Conformance Divergences Discovered in `@a2ui/web_core@0.14.0` and `@a2ui/react@0.14.0`

We wrote an automated reproduction suite (`node scripts/verify-extensions-v1.mjs`) against the published `@a2ui/web_core@0.14.0` package and verified the following 4 bugs:

### BUG-EXT-01: `@a2ui/web_core@0.14.0`'s `v1_0` `ExtensionsSchema` Regex Wrongly Accepts Hyphens (`-`) and Colons (`:`)
- **Location**: `node_modules/@a2ui/web_core/src/v1_0/schema/common-types.js` (line 74) and `typescript/core/web_core/src/v1_0/scripts/generate-schemas.mjs` (line 160).
- **Root Cause**:
  - The v1.0 JSON Schema (`specification/v1_0/json/common_types.json` line 44) specifies `^[\p{XID_Start}_][\p{XID_Continue}]*$` and `specification/v1_0/test/cases/initial_state_validation.json` (line 218) explicitly tests that `"invalid-key-with-dashes": true` MUST be rejected as invalid.
  - However, in `@a2ui/web_core@0.14.0`, `src/v1_0/schema/common-types.js` was generated with `/^[\p{XID_Start}_][\p{XID_Continue}:-]*$/u` (including `:-` in the character class!), whereas `src/types/common-types.js` (line 88) used `/^[\p{XID_Start}_][\p{XID_Continue}]*$/u`.
  - Consequently, `CreateSurfaceMessageSchema` and `ActionMessageSchema` in `@a2ui/web_core@0.14.0` wrongly accept hyphenated and colon-separated extension keys, diverging from the v1.0 spec (this was tracked as a known divergence in `conformance_test.mjs` until commit `f295cba` / PR #3329).

### BUG-EXT-02: Dead-Code Bug in `PayloadValidator.validateComponent` Completely Skips Component `metadata.extensions` Validation
- **Location**: `typescript/core/web_core/src/validation/payload-validator.ts` (lines 34, 198, 216, and 256–267) — **present in both `@a2ui/web_core@0.14.0` and `main` HEAD (`f295cba`)**.
- **Root Cause**:
  - On line 34, `COMPONENT_ENVELOPE_KEYS` is defined as `['id', 'component', 'catalogId', 'metadata']`.
  - On line 198 inside `validateComponent(comp)`, `const properties = stripEnvelopeKeys(comp)` deletes `'metadata'` from `properties`.
  - On line 216, `validateComponent` calls `this.validateCommonEnvelopeFields(properties, ...)` which checks:
    ```ts
    if ('metadata' in properties && !knownKeys?.has('metadata')) {
      const metaVal = properties['metadata'];
      delete properties['metadata'];
      const metaResult = ComponentCommonSchema.shape.metadata.safeParse(metaVal);
      ...
    }
    ```
  - Because `stripEnvelopeKeys(comp)` already removed `'metadata'` from `properties` before `validateCommonEnvelopeFields` is called, `'metadata' in properties` is **always `false` (100% dead code)**!
  - Furthermore, because `UpdateComponentsMessageSchema` (`src/v1_0/schema/agent-to-renderer.ts`) types `components` as `z.array(z.record(z.string(), z.any()))`, any component sent via `updateComponents` completely bypasses `ComponentCommonSchema.shape.metadata` validation and stores arbitrary/invalid `metadata` objects and non-UAX #31 extension keys directly onto `ComponentModel.metadata`.

### BUG-EXT-03: `SurfaceModel.dispatchAction` Silently Drops Outbound `action.metadata.extensions`
- **Location**: `typescript/core/web_core/src/state/surface-model.ts` (lines 249–290) and `typescript/core/web_core/src/types/common-types.ts` (lines 187–200).
- **Root Cause**:
  - While `specification/v1_0/json/renderer_to_agent.json` (lines 43–52) defines `action.metadata.extensions` for renderer-to-agent action events, `SurfaceModel.dispatchAction(payload, sourceComponentId)` constructs `actionToDispatch` with only `{ name, surfaceId, sourceComponentId, timestamp, context, catalogId, userMessage }` and **ignores `payload.metadata` / `eventPayload.metadata`**.
  - As a result, components using `context.dispatchAction(...)` in `@a2ui/web_core` cannot attach `metadata.extensions` to outbound actions unless the host application wraps or intercepts the action listener.

### BUG-EXT-04: `ComponentNode` and `@a2ui/react`'s `useNodeView` Omit `metadata` from Resolved Nodes
- **Location**: `typescript/core/web_core/src/resolution/component-node.ts` (lines 50–119, 213–226) and `typescript/renderers/react/src/node-view.tsx` (lines 207–266).
- **Root Cause**:
  - `ComponentModel` stores `public metadata?: Record<string, unknown>`, and `ComponentModel.componentTree` serializes it.
  - However, `ComponentNode` (`MutableComponentNode`) does not expose a `metadata` getter or include `metadata` in `ComponentNode.toJSON()`, and `@a2ui/react`'s `useNodeView(node, buildChild)` only returns `{ viewProps, context, viewBuildChild, rawBuildChild }` where `viewProps` has `metadata` stripped. Custom React components must traverse `context.componentModel.metadata?.extensions` manually.
