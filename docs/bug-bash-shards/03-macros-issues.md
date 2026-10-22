# Shard 03: A2UI v1.0 Macros (`MacroExpander` / `MacroProcessor`) — Bug Bash Issues

## [ISSUE-03-01] [Docs][v1.0] Complete absence of UI Macros (`MacroExpander`, `@macro`, slot boundaries, ID stitching) on `a2ui.org` and in `specification/v1_0`
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

## [ISSUE-03-02] [Docs][v1.0] Macro README and `conformance/agent/macros/macros.yaml` exclusively use legacy v0.9 syntax (`{"path": ...}`, `variant: "h3"`, `v0_9` builder)
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

## [ISSUE-03-03] [Docs][Macros] Mismatch between declarative YAML macro templates (`$param`, `$spreadParam`) in `conformance/agent/macros/` and imperative Python `@macro` API
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

## [ISSUE-03-04] [v1.0][TypeScript] `MacroExpander`, `MacroProcessor`, and `IdAllocator` are completely unimplemented in `@a2ui/agent` and `@a2ui/web_core` (`macros.yaml` skipped)
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

## [ISSUE-03-05] [v1.0][Python `a2ui_agent`] `MacroProcessor` and `MacroExpander` hardcode `v0_9` builders/versions and fail to coerce A2UI v1.0 `{"@path": "/..."}` data bindings
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

## [ISSUE-03-06] [Python `a2ui_agent`] `MacroExpander._expand_component_list` swallows non-recursion macro exceptions, leaving unexpanded macro nodes that fail schema validation downstream
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
