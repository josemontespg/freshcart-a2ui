import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIActionEvent,
  type A2UIComponentBase,
  type A2UIEnvelopeKind,
  type A2UILinterDiagnostic,
  type A2UIProtocolLogEntry,
  type A2UIRendererErrorEvent,
  type A2UISurfaceManagerState,
  type A2UISurfaceState,
  type A2UIv1Message,
} from '../types/a2ui-v1';
import {
  createRootEvaluationContext,
  evaluateFunctionCall,
  unescapePointerToken,
} from './DataModelBinder';

let logSeqCounter = 1;

function nextLogId(): { id: string; seq: number } {
  const seq = logSeqCounter++;
  return { id: `a2ui-log-${seq}-${Date.now()}`, seq };
}

function cloneDeep<T>(val: T): T {
  if (val === undefined || val === null || typeof val !== 'object') {
    return val;
  }
  try {
    return structuredClone(val);
  } catch {
    return JSON.parse(JSON.stringify(val)) as T;
  }
}

export function createInitialSurfaceManagerState(): A2UISurfaceManagerState {
  return {
    surfaces: {},
    log: [],
    outboundResponses: [],
  };
}

/**
 * Applies an A2UI v1.0 `updateDataModel` operation at an RFC 6901 JSON Pointer `pointerPath`.
 *
 * Key v1.0 rules:
 * - If `pointerPath` is omitted, `""`, or `"/"`, replaces the root data model object
 *   (or resets to `{}` if `value === null`).
 * - If `value === null` at a nested path, deletes the key from the parent object
 *   (or removes the element if the parent is an array).
 * - Otherwise upserts `value` at `pointerPath`, auto-creating intermediate objects/arrays.
 */
export function applyJSONPointerUpdate(
  rootModel: Record<string, unknown>,
  pointerPath: string | undefined,
  value: unknown
): Record<string, unknown> {
  const trimmedPath = (pointerPath ?? '').trim();

  // Root replacement
  if (trimmedPath === '' || trimmedPath === '/') {
    if (value === null || value === undefined) {
      return {};
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      return cloneDeep(value as Record<string, unknown>);
    }
    return { value: cloneDeep(value) };
  }

  const normalized = trimmedPath.startsWith('/')
    ? trimmedPath.slice(1)
    : trimmedPath;
  const tokens = normalized.split('/').map(unescapePointerToken);

  const nextRoot = cloneDeep(rootModel);
  let cursor: Record<string, unknown> | unknown[] = nextRoot;

  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];
    const nextIsArrayIndex = /^\d+$/.test(nextToken);

    if (Array.isArray(cursor)) {
      const idx = Number(token);
      if (!Number.isInteger(idx) || idx < 0) {
        return nextRoot;
      }
      if (
        cursor[idx] === null ||
        cursor[idx] === undefined ||
        typeof cursor[idx] !== 'object'
      ) {
        cursor[idx] = nextIsArrayIndex ? [] : {};
      }
      cursor = cursor[idx] as Record<string, unknown> | unknown[];
    } else {
      const existing = cursor[token];
      if (
        existing === null ||
        existing === undefined ||
        typeof existing !== 'object'
      ) {
        cursor[token] = nextIsArrayIndex ? [] : {};
      }
      cursor = cursor[token] as Record<string, unknown> | unknown[];
    }
  }

  const lastToken = tokens[tokens.length - 1];
  if (Array.isArray(cursor)) {
    const idx = Number(lastToken);
    if (Number.isInteger(idx) && idx >= 0) {
      if (value === null) {
        cursor.splice(idx, 1);
      } else {
        cursor[idx] = cloneDeep(value);
      }
    }
  } else {
    if (value === null) {
      delete cursor[lastToken];
    } else {
      cursor[lastToken] = cloneDeep(value);
    }
  }

  return nextRoot;
}

function detectEnvelopeKind(message: A2UIv1Message): {
  kind: A2UIEnvelopeKind;
  surfaceId?: string;
} {
  if ('createSurface' in message) {
    return {
      kind: 'createSurface',
      surfaceId: message.createSurface.surfaceId,
    };
  }
  if ('updateComponents' in message) {
    return {
      kind: 'updateComponents',
      surfaceId: message.updateComponents.surfaceId,
    };
  }
  if ('updateDataModel' in message) {
    return {
      kind: 'updateDataModel',
      surfaceId: message.updateDataModel.surfaceId,
    };
  }
  if ('deleteSurface' in message) {
    return {
      kind: 'deleteSurface',
      surfaceId: message.deleteSurface.surfaceId,
    };
  }
  if ('callRendererFunction' in message) {
    return {
      kind: 'callRendererFunction',
      surfaceId: message.callRendererFunction.surfaceId,
    };
  }
  if ('agentFunctionResponse' in message) {
    return {
      kind: 'agentFunctionResponse',
      surfaceId: undefined,
    };
  }
  return { kind: 'error' };
}

/**
 * Processes a single inbound A2UI v1.0 message (`agent_to_renderer.json`)
 * and returns the next immutable `A2UISurfaceManagerState`.
 */
export function processA2UIMessage(
  state: A2UISurfaceManagerState,
  message: A2UIv1Message,
  options?: {
    sourceLabel?: string;
    strictSurfaceUniqueness?: boolean;
  }
): A2UISurfaceManagerState {
  const nowIso = new Date().toISOString();
  const { id, seq } = nextLogId();
  const nextSurfaces = { ...state.surfaces };
  const nextOutbound = [...state.outboundResponses];

  if (!message || message.version !== A2UI_VERSION) {
    const errEvent: A2UIRendererErrorEvent = {
      version: A2UI_VERSION,
      error: {
        code: 'VALIDATION_FAILED',
        path: '/version',
        message: `Expected A2UI envelope version '${A2UI_VERSION}', received '${String(
          (message as unknown as Record<string, unknown>)?.version
        )}'.`,
      },
    };
    nextOutbound.push(errEvent);
    return {
      surfaces: nextSurfaces,
      outboundResponses: nextOutbound,
      log: [
        ...state.log,
        {
          id,
          seq,
          timestamp: nowIso,
          direction: 'renderer_to_agent',
          kind: 'error',
          sourceLabel: options?.sourceLabel,
          payload: errEvent,
        },
      ],
    };
  }

  const { kind, surfaceId } = detectEnvelopeKind(message);

  if ('createSurface' in message) {
    const payload = message.createSurface;
    if (options?.strictSurfaceUniqueness && nextSurfaces[payload.surfaceId]) {
      const errEvent: A2UIRendererErrorEvent = {
        version: A2UI_VERSION,
        error: {
          code: 'VALIDATION_FAILED',
          surfaceId: payload.surfaceId,
          path: '/createSurface/surfaceId',
          message: `Surface '${payload.surfaceId}' already exists. Delete it before recreating in strict mode.`,
        },
      };
      nextOutbound.push(errEvent);
    } else {
      const componentsById: Record<string, A2UIComponentBase> = {};
      if (Array.isArray(payload.components)) {
        for (const comp of payload.components) {
          if (comp && typeof comp.id === 'string' && comp.component !== 'Surface') {
            componentsById[comp.id] = cloneDeep(comp);
          }
        }
      }
      const initialDataModel =
        payload.dataModel && typeof payload.dataModel === 'object'
          ? cloneDeep(payload.dataModel)
          : {};

      nextSurfaces[payload.surfaceId] = {
        surfaceId: payload.surfaceId,
        catalogId: payload.catalogId || A2UI_BASIC_CATALOG_ID,
        sendDataModel: Boolean(payload.sendDataModel),
        componentsById,
        dataModel: initialDataModel,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    }
  } else if ('updateComponents' in message) {
    const payload = message.updateComponents;
    const existing = nextSurfaces[payload.surfaceId];
    if (!existing) {
      const errEvent: A2UIRendererErrorEvent = {
        version: A2UI_VERSION,
        error: {
          code: 'VALIDATION_FAILED',
          surfaceId: payload.surfaceId,
          path: '/updateComponents/surfaceId',
          message: `Cannot updateComponents on non-existent surface '${payload.surfaceId}'. Send createSurface first.`,
        },
      };
      nextOutbound.push(errEvent);
    } else {
      const mergedComponents: Record<string, A2UIComponentBase> = {
        ...existing.componentsById,
      };
      for (const comp of payload.components) {
        if (comp && typeof comp.id === 'string' && comp.component !== 'Surface') {
          mergedComponents[comp.id] = cloneDeep(comp);
        }
      }
      nextSurfaces[payload.surfaceId] = {
        ...existing,
        componentsById: mergedComponents,
        updatedAt: nowIso,
      };
    }
  } else if ('updateDataModel' in message) {
    const payload = message.updateDataModel;
    const existing = nextSurfaces[payload.surfaceId];
    if (!existing) {
      const errEvent: A2UIRendererErrorEvent = {
        version: A2UI_VERSION,
        error: {
          code: 'VALIDATION_FAILED',
          surfaceId: payload.surfaceId,
          path: '/updateDataModel/surfaceId',
          message: `Cannot updateDataModel on non-existent surface '${payload.surfaceId}'. Send createSurface first.`,
        },
      };
      nextOutbound.push(errEvent);
    } else {
      const updatedDataModel = applyJSONPointerUpdate(
        existing.dataModel,
        payload.path,
        payload.value
      );
      nextSurfaces[payload.surfaceId] = {
        ...existing,
        dataModel: updatedDataModel,
        updatedAt: nowIso,
      };
    }
  } else if ('deleteSurface' in message) {
    const targetId = message.deleteSurface.surfaceId;
    delete nextSurfaces[targetId];
  } else if ('callRendererFunction' in message) {
    const { surfaceId: targetSurfaceId, functionCallId, callFunction } =
      message.callRendererFunction;
    const knownCatalogs = new Set<string>([
      A2UI_BASIC_CATALOG_ID,
      FRESHCART_GROCERY_CATALOG_ID,
    ]);
    if (!callFunction.catalogId || !knownCatalogs.has(callFunction.catalogId)) {
      const errEvent: A2UIRendererErrorEvent = {
        version: A2UI_VERSION,
        error: {
          code: 'INVALID_FUNCTION_CALL',
          functionCallId,
          message: `Unknown or unauthorized catalogId '${callFunction.catalogId}' for callRendererFunction.`,
        },
      };
      nextOutbound.push(errEvent);
    } else {
      const targetSurface = targetSurfaceId
        ? nextSurfaces[targetSurfaceId]
        : undefined;
      const evalCtx = createRootEvaluationContext(
        targetSurface?.dataModel ?? {},
        callFunction.catalogId
      );
      const returnVal = evaluateFunctionCall(callFunction, evalCtx);
      nextOutbound.push({
        version: A2UI_VERSION,
        rendererFunctionResponse: {
          functionCallId,
          value: returnVal,
        },
      });
    }
  }

  const snapshotAfter =
    surfaceId && nextSurfaces[surfaceId]
      ? cloneDeep(nextSurfaces[surfaceId])
      : null;

  const logEntry: A2UIProtocolLogEntry = {
    id,
    seq,
    timestamp: nowIso,
    direction: 'agent_to_renderer',
    kind,
    surfaceId,
    sourceLabel: options?.sourceLabel,
    payload: cloneDeep(message),
    surfaceSnapshotAfter: snapshotAfter,
  };

  return {
    surfaces: nextSurfaces,
    outboundResponses: nextOutbound,
    log: [...state.log, logEntry],
  };
}

export function processA2UIMessageBatch(
  state: A2UISurfaceManagerState,
  messages: A2UIv1Message[],
  sourceLabel?: string
): A2UISurfaceManagerState {
  let current = state;
  for (const msg of messages) {
    current = processA2UIMessage(current, msg, { sourceLabel });
  }
  return current;
}

/**
 * Mutates a surface's DataModel directly in response to two-way user input
 * (`Slider`, `CheckBox`, `TextField`, `ChoicePicker`, `DateTimeInput`) or
 * live inspector editing, and logs the synthesized v1.0 `updateDataModel` envelope.
 */
export function mutateSurfaceDataModel(
  state: A2UISurfaceManagerState,
  surfaceId: string,
  pointerPath: string,
  value: unknown,
  sourceLabel: string = 'Two-Way Input Binding'
): A2UISurfaceManagerState {
  const synthMessage: A2UIv1Message = {
    version: A2UI_VERSION,
    updateDataModel: {
      surfaceId,
      path: pointerPath,
      value,
    },
  };
  return processA2UIMessage(state, synthMessage, { sourceLabel });
}

/**
 * Records an outbound `renderer_to_agent` `A2UIActionEvent` in the protocol log.
 */
export function recordOutboundActionEvent(
  state: A2UISurfaceManagerState,
  event: A2UIActionEvent,
  sourceLabel: string = 'User UI Action'
): A2UISurfaceManagerState {
  const { id, seq } = nextLogId();
  const targetSurface = state.surfaces[event.action.surfaceId];
  const logEntry: A2UIProtocolLogEntry = {
    id,
    seq,
    timestamp: event.action.timestamp || new Date().toISOString(),
    direction: 'renderer_to_agent',
    kind: 'action',
    surfaceId: event.action.surfaceId,
    sourceLabel,
    payload: cloneDeep(event),
    surfaceSnapshotAfter: targetSurface ? cloneDeep(targetSurface) : null,
  };
  return {
    ...state,
    log: [...state.log, logEntry],
  };
}

export function clearProtocolLog(
  state: A2UISurfaceManagerState
): A2UISurfaceManagerState {
  return {
    ...state,
    log: [],
  };
}

const UAX31_IDENTIFIER_REGEX = /^[\p{ID_Start}_][\p{ID_Continue}]*$/u;

/**
 * Validates raw JSON text or a parsed object against A2UI v1.0 protocol rules,
 * specifically detecting common v0.8/v0.9 vs v1.0 migration pitfalls discovered
 * during onboarding (`@path` vs `path`, `@call` vs `call`, UAX #31 component IDs,
 * `Text.variant`, `createSurface.theme`, and required `updateDataModel.value`).
 */
export function validateA2UIv1Envelope(rawJsonText: string): {
  parsed: A2UIv1Message[] | null;
  diagnostics: A2UILinterDiagnostic[];
} {
  const diagnostics: A2UILinterDiagnostic[] = [];
  let rawParsed: unknown;

  try {
    rawParsed = JSON.parse(rawJsonText);
  } catch (err) {
    diagnostics.push({
      severity: 'error',
      code: 'JSON_PARSE_ERROR',
      path: '/',
      message: `Invalid JSON syntax: ${(err as Error).message}`,
    });
    return { parsed: null, diagnostics };
  }

  const envelopes = Array.isArray(rawParsed) ? rawParsed : [rawParsed];
  const validMessages: A2UIv1Message[] = [];

  const inspectValueTreeForV09Syntax = (node: unknown, currentPath: string) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((child, idx) =>
        inspectValueTreeForV09Syntax(child, `${currentPath}/${idx}`)
      );
      return;
    }

    const obj = node as Record<string, unknown>;
    const keys = Object.keys(obj);

    // Detect legacy v0.9 {"path": "/..."} used as a DataBinding (not a ChildList {componentId, path})
    if (
      keys.length === 1 &&
      keys[0] === 'path' &&
      typeof obj.path === 'string'
    ) {
      diagnostics.push({
        severity: 'error',
        code: 'V09_LEGACY_PATH_BINDING',
        path: currentPath,
        message: `Found legacy v0.9 '{"path": "${obj.path}"}'. In A2UI v1.0, DataBinding requires the '@' prefix: '{"@path": "${obj.path}"}'.`,
        suggestion: `Replace "path" with "@path"`,
      });
    }

    // Detect legacy v0.9 {"call": "...", "args": ...}
    if ('call' in obj && typeof obj.call === 'string' && !('@call' in obj)) {
      diagnostics.push({
        severity: 'error',
        code: 'V09_LEGACY_FUNCTION_CALL',
        path: currentPath,
        message: `Found legacy v0.9 '{"call": "${obj.call}"}'. In A2UI v1.0, FunctionCall requires the '@' prefix: '{"@call": "${obj.call}"}'.`,
        suggestion: `Replace "call" with "@call"`,
      });
    }

    // Detect ChildList template accidentally using "@path" instead of "path"
    if ('componentId' in obj && '@path' in obj && !('path' in obj)) {
      diagnostics.push({
        severity: 'error',
        code: 'CHILDLIST_INVALID_AT_PATH',
        path: currentPath,
        message: `ChildList template objects must use unprefixed "path" ('{"componentId": "${String(
          obj.componentId
        )}", "path": "${String(obj['@path'])}"}'), not "@path".`,
        suggestion: `Replace "@path" with "path" on ChildList template`,
      });
    }

    for (const [k, v] of Object.entries(obj)) {
      inspectValueTreeForV09Syntax(v, `${currentPath}/${k}`);
    }
  };

  const inspectComponentsArray = (
    components: unknown[],
    basePath: string
  ) => {
    components.forEach((comp, idx) => {
      const compPath = `${basePath}/${idx}`;
      if (!comp || typeof comp !== 'object') return;
      const c = comp as Record<string, unknown>;

      if (typeof c.id !== 'string' || !c.id) {
        diagnostics.push({
          severity: 'error',
          code: 'MISSING_COMPONENT_ID',
          path: `${compPath}/id`,
          message: `Component at ${compPath} is missing a string 'id'.`,
        });
      } else if (!UAX31_IDENTIFIER_REGEX.test(c.id)) {
        diagnostics.push({
          severity: 'warning',
          code: 'NON_UAX31_COMPONENT_ID',
          path: `${compPath}/id`,
          message: `Component id '${c.id}' contains non-UAX #31 characters (such as '-'). @a2ui/web_core@0.14.0's PayloadValidator rejects hyphenated component IDs in v1.0 (BUG-03).`,
          suggestion: `Rename '${c.id}' to '${c.id.replace(/-/g, '_')}'`,
        });
      }

      if (c.component === 'Text' && typeof c.variant === 'string') {
        if (!['caption', 'body'].includes(c.variant)) {
          diagnostics.push({
            severity: 'warning',
            code: 'V09_TEXT_VARIANT',
            path: `${compPath}/variant`,
            message: `Text.variant '${c.variant}' was removed in the v1.0 Basic Catalog (which only allows 'caption' | 'body' and uses Markdown '# / ## / ###' inside Text.text).`,
            suggestion: `Set "variant": "body" and prefix text with "## "`,
          });
        }
      }

      if (c.component === 'TextField' && 'validationRegexp' in c) {
        diagnostics.push({
          severity: 'warning',
          code: 'REMOVED_VALIDATION_REGEXP',
          path: `${compPath}/validationRegexp`,
          message: `TextField.validationRegexp was removed in A2UI v1.0. Use 'checks' with '{"@call": "regex", ...}' instead.`,
        });
      }

      for (const [propKey, propVal] of Object.entries(c)) {
        if (propKey !== 'id' && propKey !== 'component') {
          inspectValueTreeForV09Syntax(propVal, `${compPath}/${propKey}`);
        }
      }
    });
  };

  envelopes.forEach((env, idx) => {
    const envPath = envelopes.length > 1 ? `/[${idx}]` : '';
    if (!env || typeof env !== 'object' || Array.isArray(env)) {
      diagnostics.push({
        severity: 'error',
        code: 'INVALID_ENVELOPE',
        path: envPath || '/',
        message: 'A2UI v1.0 message envelope must be a JSON object.',
      });
      return;
    }

    const obj = env as Record<string, unknown>;
    if (obj.version !== 'v1.0') {
      diagnostics.push({
        severity: 'error',
        code: 'INVALID_VERSION',
        path: `${envPath}/version`,
        message: `A2UI v1.0 envelope must specify '"version": "v1.0"' (found '${String(
          obj.version ?? 'missing'
        )}').`,
        suggestion: `Add "version": "v1.0"`,
      });
    }

    const opKeys = [
      'createSurface',
      'updateComponents',
      'updateDataModel',
      'deleteSurface',
      'callRendererFunction',
      'agentFunctionResponse',
    ].filter((k) => k in obj);

    if (opKeys.length !== 1) {
      diagnostics.push({
        severity: 'error',
        code: 'INVALID_OPERATION_COUNT',
        path: envPath || '/',
        message: `Envelope must contain exactly one v1.0 operation key (createSurface, updateComponents, updateDataModel, deleteSurface, callRendererFunction, or agentFunctionResponse). Found: ${
          opKeys.length === 0 ? 'none' : opKeys.join(', ')
        }.`,
      });
      return;
    }

    if ('createSurface' in obj && obj.createSurface && typeof obj.createSurface === 'object') {
      const cs = obj.createSurface as Record<string, unknown>;
      if ('theme' in cs || 'primaryColor' in cs) {
        diagnostics.push({
          severity: 'warning',
          code: 'REMOVED_CREATE_SURFACE_THEME',
          path: `${envPath}/createSurface/theme`,
          message: `'theme' and 'primaryColor' were removed from createSurface in A2UI v1.0.`,
        });
      }
      if (Array.isArray(cs.components)) {
        inspectComponentsArray(cs.components, `${envPath}/createSurface/components`);
      }
    }

    if (
      'updateComponents' in obj &&
      obj.updateComponents &&
      typeof obj.updateComponents === 'object'
    ) {
      const uc = obj.updateComponents as Record<string, unknown>;
      if (Array.isArray(uc.components)) {
        inspectComponentsArray(uc.components, `${envPath}/updateComponents/components`);
      }
    }

    if (
      'updateDataModel' in obj &&
      obj.updateDataModel &&
      typeof obj.updateDataModel === 'object'
    ) {
      const udm = obj.updateDataModel as Record<string, unknown>;
      if ('@path' in udm && !('path' in udm)) {
        diagnostics.push({
          severity: 'error',
          code: 'UPDATE_DATA_MODEL_AT_PATH',
          path: `${envPath}/updateDataModel/@path`,
          message: `The 'updateDataModel' message envelope uses unprefixed '"path"', not '"@path"'.`,
          suggestion: `Change "@path" to "path" in updateDataModel`,
        });
      }
      if (!('value' in udm)) {
        diagnostics.push({
          severity: 'error',
          code: 'MISSING_UPDATE_DATA_MODEL_VALUE',
          path: `${envPath}/updateDataModel/value`,
          message: `In A2UI v1.0, 'value' is required on 'updateDataModel'. To delete a key at 'path', set '"value": null' explicitly.`,
          suggestion: `Add "value": null`,
        });
      }
    }

    validMessages.push(obj as unknown as A2UIv1Message);
  });

  return {
    parsed: validMessages.length > 0 ? validMessages : null,
    diagnostics,
  };
}
