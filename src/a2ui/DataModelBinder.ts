import {
  A2UI_BASIC_CATALOG_ID,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UICatalogFunctionMetadata,
  type A2UIDataBinding,
  type A2UIFunctionCall,
  type A2UIValidationResult,
} from '../types/a2ui-v1';

export interface ClientLiveBridgeSnapshot {
  cartItemCount: number;
  cartSubtotal: number;
  activeStoreId: string;
  activeStoreName: string;
  deliveryEtaMinutes: number;
  cartItemNames: string[];
}

const DEFAULT_CLIENT_LIVE_BRIDGE: ClientLiveBridgeSnapshot = {
  cartItemCount: 3,
  cartSubtotal: 34.47,
  activeStoreId: 'green-leaf-market',
  activeStoreName: 'GreenLeaf Organic Market',
  deliveryEtaMinutes: 35,
  cartItemNames: [
    'Wild Alaskan Sockeye Salmon Fillet',
    'Organic Hass Avocados (4 ct Bag)',
    'Cold-Pressed Extra Virgin Olive Oil',
  ],
};

let currentClientLiveBridge: ClientLiveBridgeSnapshot = {
  ...DEFAULT_CLIENT_LIVE_BRIDGE,
};

export function setClientLiveBridgeSnapshot(
  snapshot: Partial<ClientLiveBridgeSnapshot>
): void {
  currentClientLiveBridge = {
    ...currentClientLiveBridge,
    ...snapshot,
  };
}

export function getClientLiveBridgeSnapshot(): ClientLiveBridgeSnapshot {
  return currentClientLiveBridge;
}

/**
 * Authoritative Registry of A2UI v1.0 Basic Catalog + FreshCart Grocery Catalog
 * Client-Side and Server-Side Functions (`catalog_definition.json` schema).
 */
export const A2UI_FUNCTION_CATALOG_REGISTRY: Record<
  string,
  A2UICatalogFunctionMetadata
> = {
  '@index': {
    name: '@index',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'number',
    allowedCallers: 'rendererOnly',
    requiresUserActivation: false,
    description:
      'Returns the 0-based collection index (plus optional offset) within a ChildList template scope.',
  },
  formatString: {
    name: 'formatString',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'string',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description:
      'Interpolates ${...} data pointers and expressions into a formatted string.',
  },
  formatNumber: {
    name: 'formatNumber',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'string',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description:
      'Formats a numeric value with configurable decimal precision and thousands grouping.',
  },
  formatCurrency: {
    name: 'formatCurrency',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'string',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Formats a number as an ISO 4217 currency string (e.g. USD).',
  },
  formatDate: {
    name: 'formatDate',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'string',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Formats a date string or timestamp using Unicode TR35 tokens.',
  },
  pluralize: {
    name: 'pluralize',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'string',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description:
      'Selects localized CLDR plural category string (zero/one/two/few/many/other).',
  },
  required: {
    name: 'required',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'validationResult',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description:
      'Validates that a value is non-null, non-empty string, or non-empty list.',
  },
  numeric: {
    name: 'numeric',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'validationResult',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Validates that a value is numeric and within optional min/max bounds.',
  },
  regex: {
    name: 'regex',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'validationResult',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Validates that a string matches a regular expression pattern.',
  },
  length: {
    name: 'length',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'validationResult',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Validates string or array length against min/max bounds.',
  },
  email: {
    name: 'email',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'validationResult',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Validates that a string is a syntactically valid email address.',
  },
  and: {
    name: 'and',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'boolean',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Logical AND across an array of boolean or ValidationResult values.',
  },
  or: {
    name: 'or',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'boolean',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Logical OR across an array of boolean or ValidationResult values.',
  },
  not: {
    name: 'not',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'boolean',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Logical NOT negation of a boolean or ValidationResult value.',
  },
  contains: {
    name: 'contains',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'boolean',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Checks whether a string or array contains a target item.',
  },
  equals: {
    name: 'equals',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'boolean',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description: 'Deep equality comparison between two values.',
  },
  openUrl: {
    name: 'openUrl',
    catalogId: A2UI_BASIC_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'void',
    allowedCallers: 'rendererOnly',
    requiresUserActivation: true,
    description:
      'Opens an external URL in a new browser tab; requires direct user gesture activation.',
  },

  // --- FreshCart Grocery Catalog Client-Side Functions ---
  calculateNetCarbs: {
    name: 'calculateNetCarbs',
    catalogId: FRESHCART_GROCERY_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'number',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description:
      'Client-side reactive formula: computes net digestible carbs (totalCarbs - fiber - sugarAlcohols) per serving or total meal.',
  },
  computeUnitSavings: {
    name: 'computeUnitSavings',
    catalogId: FRESHCART_GROCERY_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'string',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description:
      'Client-side reactive formula: computes final per-serving cost and combined promo + loyalty + server coupon savings.',
  },
  checkDietaryMatch: {
    name: 'checkDietaryMatch',
    catalogId: FRESHCART_GROCERY_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'validationResult',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description:
      'Client-side validation function: checks if net carbs and protein per serving satisfy the active dietary goal (Keto, High-Protein, or Mediterranean).',
  },
  validatePromoCodeFormat: {
    name: 'validatePromoCodeFormat',
    catalogId: FRESHCART_GROCERY_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'validationResult',
    allowedCallers: 'rendererOnly',
    requiresUserActivation: false,
    description:
      'Client-side validation function: validates FreshCart promo code syntax and eligibility before checkout.',
  },
  applyLocalNutritionPreset: {
    name: 'applyLocalNutritionPreset',
    catalogId: FRESHCART_GROCERY_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'object',
    allowedCallers: 'rendererOnly',
    requiresUserActivation: true,
    description:
      'Client-side local action function (rendererOnly, requiresUserActivation): applies a kitchen preset (Keto, High-Protein, Mediterranean) synchronously on the client.',
  },
  copyShoppingSummary: {
    name: 'copyShoppingSummary',
    catalogId: FRESHCART_GROCERY_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'string',
    allowedCallers: 'rendererOnly',
    requiresUserActivation: true,
    description:
      'Client-side local action function (rendererOnly, requiresUserActivation): copies the formatted meal & coupon summary to the clipboard.',
  },
  getClientKitchenAndCartMetrics: {
    name: 'getClientKitchenAndCartMetrics',
    catalogId: FRESHCART_GROCERY_CATALOG_ID,
    executionTarget: 'client',
    returnType: 'object',
    allowedCallers: 'agentOnly',
    requiresUserActivation: false,
    description:
      'Agent-only client inspection function (allowedCallers: agentOnly): invoked by the agent via callRendererFunction to read live cart metrics, store ETA, and browser locale.',
  },

  // --- FreshCart Grocery Catalog Server-Side Functions (Renderer -> Agent RPC) ---
  optimizeLiveStoreCoupons: {
    name: 'optimizeLiveStoreCoupons',
    catalogId: FRESHCART_GROCERY_CATALOG_ID,
    executionTarget: 'server',
    returnType: 'object',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description:
      'Server-side RPC function (callAgentFunction -> agentFunctionResponse): queries live store inventory and stackable digital coupons on the server.',
  },
  analyzeMealMicronutrients: {
    name: 'analyzeMealMicronutrients',
    catalogId: FRESHCART_GROCERY_CATALOG_ID,
    executionTarget: 'server',
    returnType: 'object',
    allowedCallers: 'rendererOrAgent',
    requiresUserActivation: false,
    description:
      'Server-side RPC function (callAgentFunction -> agentFunctionResponse): performs deep server-side micronutrient density, Omega-3, and glycemic load analysis.',
  },
};

export function getCatalogFunctionMetadata(
  fnName: string
): A2UICatalogFunctionMetadata | undefined {
  return A2UI_FUNCTION_CATALOG_REGISTRY[fnName];
}

export interface DataEvaluationContext {
  /** Root dataModel of the active surface */
  rootDataModel: Record<string, unknown>;
  /**
   * Current JSON Pointer scope prefix for ChildList template iteration.
   * Empty string "" at the root scope; e.g. "/ingredients/0" inside a list item.
   */
  scopePath: string;
  /**
   * 0-based iteration index when evaluating inside a ChildList template scope.
   */
  collectionIndex?: number;
  /** Default catalogId of the surface */
  defaultCatalogId?: string;
  /** Whether evaluation is triggered by a direct user gesture (used by openUrl & local actions) */
  isUserActivated?: boolean;
  /** Whether the function is being invoked locally by the renderer or remotely via callRendererFunction */
  callerKind?: 'renderer' | 'agent';
  /** Callback when a local client action function updates the surface DataModel synchronously */
  onLocalStatePatch?: (patch: Record<string, unknown>, label: string) => void;
  /**
   * Spec Fallback Routing callback (`a2ui_protocol.md` § "Fallback Routing"):
   * When a FunctionCall targets a server-side function or a function not locally
   * implemented on the renderer, dispatches `callAgentFunction` over the wire.
   */
  onFallbackServerRpc?: (
    call: A2UIFunctionCall,
    evaluatedArgs: Record<string, unknown>
  ) => void;
}

export function createRootEvaluationContext(
  rootDataModel: Record<string, unknown>,
  defaultCatalogId: string = A2UI_BASIC_CATALOG_ID
): DataEvaluationContext {
  return {
    rootDataModel,
    scopePath: '',
    collectionIndex: undefined,
    defaultCatalogId,
    isUserActivated: false,
    callerKind: 'renderer',
  };
}

export function createScopedEvaluationContext(
  parentContext: DataEvaluationContext,
  itemScopePath: string,
  itemIndex: number
): DataEvaluationContext {
  return {
    ...parentContext,
    scopePath: itemScopePath,
    collectionIndex: itemIndex,
  };
}

export function isDataBinding(val: unknown): val is A2UIDataBinding {
  return (
    typeof val === 'object' &&
    val !== null &&
    !Array.isArray(val) &&
    '@path' in val &&
    typeof (val as Record<string, unknown>)['@path'] === 'string'
  );
}

export function isFunctionCall(val: unknown): val is A2UIFunctionCall {
  return (
    typeof val === 'object' &&
    val !== null &&
    !Array.isArray(val) &&
    '@call' in val &&
    typeof (val as Record<string, unknown>)['@call'] === 'string'
  );
}

export function isValidationResult(val: unknown): val is A2UIValidationResult {
  return (
    typeof val === 'object' &&
    val !== null &&
    !Array.isArray(val) &&
    'valid' in val &&
    typeof (val as Record<string, unknown>).valid === 'boolean'
  );
}

/**
 * Unescapes an RFC 6901 JSON Pointer reference token (~1 -> /, ~0 -> ~).
 */
export function unescapePointerToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

/**
 * Escapes a property key into an RFC 6901 JSON Pointer token (~ -> ~0, / -> ~1).
 */
export function escapePointerToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Resolves a raw `@path` string (either absolute starting with `/` or relative
 * inside a `ChildList` template scope) into a canonical RFC 6901 root pointer.
 */
export function resolvePointerPath(rawPath: string, scopePath: string = ''): string {
  const trimmed = rawPath.trim();
  if (trimmed === '' || trimmed === '/') {
    return '/';
  }
  if (trimmed === '.') {
    return scopePath || '/';
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  const cleanRel = trimmed.startsWith('./') ? trimmed.slice(2) : trimmed;
  if (!cleanRel) {
    return scopePath || '/';
  }
  const cleanScope =
    scopePath && scopePath !== '/'
      ? scopePath.endsWith('/')
        ? scopePath.slice(0, -1)
        : scopePath
      : '';
  return `${cleanScope}/${cleanRel}`;
}

/**
 * Reads a value from `rootDataModel` using a canonical RFC 6901 JSON Pointer path.
 */
export function getValueAtPointer(
  rootDataModel: Record<string, unknown>,
  pointerPath: string
): unknown {
  if (!pointerPath || pointerPath === '/') {
    return rootDataModel;
  }
  const normalized = pointerPath.startsWith('/')
    ? pointerPath.slice(1)
    : pointerPath;
  const tokens = normalized.split('/').map(unescapePointerToken);

  let current: unknown = rootDataModel;
  for (const token of tokens) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (Array.isArray(current)) {
      const idx = Number(token);
      if (!Number.isInteger(idx) || idx < 0 || idx >= current.length) {
        return undefined;
      }
      current = current[idx];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[token];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * If a component's `value` prop is an A2UIDataBinding (`{"@path": "..."}`),
 * returns the canonical root JSON Pointer path for two-way data model updates.
 */
export function resolveWritablePointerPath(
  rawValueProp: unknown,
  context: DataEvaluationContext
): string | null {
  if (!isDataBinding(rawValueProp)) {
    return null;
  }
  return resolvePointerPath(rawValueProp['@path'], context.scopePath);
}

/**
 * Coerces a dynamic value or A2UIValidationResult into a boolean per the
 * A2UI v1.0 DynamicBoolean specification.
 */
export function coerceToBoolean(val: unknown): boolean {
  if (isValidationResult(val)) {
    return val.valid;
  }
  if (typeof val === 'boolean') {
    return val;
  }
  if (typeof val === 'number') {
    return val !== 0 && !Number.isNaN(val);
  }
  if (typeof val === 'string') {
    const lower = val.trim().toLowerCase();
    if (lower === 'false' || lower === '0' || lower === '') return false;
    return true;
  }
  return Boolean(val);
}

/**
 * Formats a Date instance according to Unicode TR35 pattern tokens used by A2UI v1.0 `formatDate`.
 */
function formatTR35Date(date: Date, pattern: string): string {
  if (Number.isNaN(date.getTime())) {
    return String(pattern);
  }
  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const monthsFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysFull = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ];

  const yearFull = String(date.getFullYear());
  const yearShort = yearFull.slice(-2);
  const monthIdx = date.getMonth();
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.getDay();
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  const pad2 = (n: number) => String(n).padStart(2, '0');

  const tokenMap: Record<string, string> = {
    yyyy: yearFull,
    yy: yearShort,
    MMMM: monthsFull[monthIdx],
    MMM: monthsShort[monthIdx],
    MM: pad2(monthIdx + 1),
    M: String(monthIdx + 1),
    EEEE: daysFull[dayOfWeek],
    E: daysShort[dayOfWeek],
    dd: pad2(dayOfMonth),
    d: String(dayOfMonth),
    HH: pad2(hours24),
    H: String(hours24),
    hh: pad2(hours12),
    h: String(hours12),
    mm: pad2(minutes),
    ss: pad2(seconds),
    a: ampm,
  };

  return pattern.replace(
    /yyyy|yy|MMMM|MMM|MM|M|EEEE|E|dd|d|HH|H|hh|h|mm|ss|a/g,
    (match) => tokenMap[match] ?? match
  );
}

/**
 * Evaluates inline `${expression}` placeholders inside `formatString` per A2UI v1.0.
 */
function interpolateFormatString(
  rawTemplate: string,
  evaluatedArgs: Record<string, unknown>,
  context: DataEvaluationContext
): string {
  const ESCAPED_SENTINEL = '\u0000A2UI_ESCAPED_DOLLAR_BRACE\u0000';
  let result = rawTemplate.replace(/\\\$\{/g, ESCAPED_SENTINEL);

  // 1. Replace ${...} expressions (JSON pointers, named args, or inline @index / function calls)
  result = result.replace(/\$\{([^}]+)\}/g, (_full, exprRaw: string) => {
    const expr = exprRaw.trim();
    if (expr in evaluatedArgs) {
      const argVal = evaluatedArgs[expr];
      return argVal === null || argVal === undefined ? '' : String(argVal);
    }
    if (expr === '@index' || expr.startsWith('@index(')) {
      const offsetMatch = expr.match(/offset\s*:\s*(-?\d+)/);
      const offset = offsetMatch ? Number(offsetMatch[1]) : 0;
      const idx = (context.collectionIndex ?? 0) + offset;
      return String(idx);
    }
    if (expr.startsWith('/') || expr.startsWith('./') || !expr.includes('(')) {
      const pointer = resolvePointerPath(expr, context.scopePath);
      const resolved = getValueAtPointer(context.rootDataModel, pointer);
      if (resolved !== undefined && resolved !== null) {
        return String(resolved);
      }
    }
    return '';
  });

  // 2. Also support positional / named `{0}`, `{1}`, `{key}` placeholders used in scenarios
  result = result.replace(/\{([a-zA-Z0-9_]+)\}/g, (full, key: string) => {
    if (key in evaluatedArgs) {
      const v = evaluatedArgs[key];
      return v === null || v === undefined ? '' : String(v);
    }
    return full;
  });

  return result.split(ESCAPED_SENTINEL).join('${');
}

export interface FunctionPolicyEvaluationOutcome {
  ok: boolean;
  value?: unknown;
  error?: {
    code: string;
    message: string;
  };
  metadata?: A2UICatalogFunctionMetadata;
}

/**
 * Evaluates an A2UI v1.0 `{"@call": "...", "args": {...}}` expression while strictly
 * enforcing A2UI v1.0 `allowedCallers` (`rendererOnly` | `agentOnly` | `rendererOrAgent`)
 * and `requiresUserActivation` security boundaries.
 */
export function evaluateFunctionCallWithPolicy(
  call: A2UIFunctionCall,
  context: DataEvaluationContext
): FunctionPolicyEvaluationOutcome {
  const fnName = call['@call'];
  const metadata = getCatalogFunctionMetadata(fnName);
  const callerKind = context.callerKind ?? 'renderer';

  // 1. Enforce A2UI v1.0 allowedCallers boundary
  if (metadata) {
    if (callerKind === 'agent' && metadata.allowedCallers === 'rendererOnly') {
      return {
        ok: false,
        metadata,
        error: {
          code: 'INVALID_FUNCTION_CALL',
          message: `Function '${fnName}' has allowedCallers='rendererOnly' and cannot be invoked remotely by the agent via callRendererFunction.`,
        },
      };
    }

    // Fixes BUG-2 in @a2ui/web_core@0.14.0 where agentOnly functions were not blocked on local UI bindings/actions
    if (callerKind === 'renderer' && metadata.allowedCallers === 'agentOnly') {
      return {
        ok: false,
        metadata,
        error: {
          code: 'INVALID_FUNCTION_CALL',
          message: `Function '${fnName}' has allowedCallers='agentOnly' and is restricted exclusively to agent-initiated callRendererFunction execution.`,
        },
      };
    }

    // 2. Enforce requiresUserActivation gesture policy
    if (metadata.requiresUserActivation && !context.isUserActivated) {
      return {
        ok: false,
        metadata,
        error: {
          code: 'EXPRESSION_ERROR',
          message: `Function '${fnName}' has requiresUserActivation=true and can only be invoked inside a direct user-activated gesture.`,
        },
      };
    }
  }

  // Evaluate all arguments recursively first
  const rawArgs = call.args ?? {};
  const args: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(rawArgs)) {
    args[key] = evaluateDynamicValue(val, context);
  }

  // 3. Spec Fallback Routing (`a2ui_protocol.md` lines 1419-1426):
  // If the function is registered as a server-side function (or not locally implemented),
  // route to `callAgentFunction` when a fallback RPC dispatcher is available.
  if (metadata?.executionTarget === 'server') {
    if (context.onFallbackServerRpc) {
      context.onFallbackServerRpc(call, args);
    }
    const cachedResults = getValueAtPointer(
      context.rootDataModel,
      `/rpcResults/${fnName}`
    );
    return {
      ok: true,
      metadata,
      value: cachedResults ?? { status: 'dispatched_to_agent', fnName },
    };
  }

  const value = executeLocalCatalogFunction(fnName, args, context, call);
  if (value === undefined && !metadata && context.onFallbackServerRpc) {
    // Unknown local function -> fallback to callAgentFunction per spec
    context.onFallbackServerRpc(call, args);
    return {
      ok: true,
      value: { status: 'dispatched_to_agent', fnName },
    };
  }

  return {
    ok: true,
    metadata,
    value,
  };
}

/**
 * Evaluates an A2UI v1.0 `{"@call": "...", "args": {...}}` expression.
 */
export function evaluateFunctionCall(
  call: A2UIFunctionCall,
  context: DataEvaluationContext
): unknown {
  const outcome = evaluateFunctionCallWithPolicy(call, context);
  if (!outcome.ok) {
    return undefined;
  }
  return outcome.value;
}

function executeLocalCatalogFunction(
  fnName: string,
  args: Record<string, unknown>,
  context: DataEvaluationContext,
  rawCall: A2UIFunctionCall
): unknown {
  switch (fnName) {
    case '@index': {
      const offset =
        typeof args.offset === 'number' ? args.offset : Number(args.offset ?? 0);
      const baseIndex =
        typeof context.collectionIndex === 'number' ? context.collectionIndex : 0;
      return baseIndex + (Number.isNaN(offset) ? 0 : offset);
    }

    case 'formatString': {
      const rawTemplate = String(args.value ?? args.template ?? '');
      return interpolateFormatString(rawTemplate, args, context);
    }

    case 'formatNumber': {
      const num = Number(args.value ?? 0);
      const safeNum = Number.isFinite(num) ? num : 0;
      const decimals =
        args.decimals !== undefined && args.decimals !== null
          ? Number(args.decimals)
          : undefined;
      const grouping =
        args.grouping !== undefined ? coerceToBoolean(args.grouping) : true;
      return new Intl.NumberFormat('en-US', {
        useGrouping: grouping,
        minimumFractionDigits:
          decimals !== undefined && Number.isFinite(decimals) ? decimals : undefined,
        maximumFractionDigits:
          decimals !== undefined && Number.isFinite(decimals) ? decimals : undefined,
      }).format(safeNum);
    }

    case 'formatCurrency': {
      const num = Number(args.value ?? 0);
      const safeNum = Number.isFinite(num) ? num : 0;
      const currency =
        typeof args.currency === 'string' && args.currency.trim().length === 3
          ? args.currency.trim().toUpperCase()
          : 'USD';
      const decimals =
        args.decimals !== undefined && args.decimals !== null
          ? Number(args.decimals)
          : 2;
      const grouping =
        args.grouping !== undefined ? coerceToBoolean(args.grouping) : true;
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          useGrouping: grouping,
          minimumFractionDigits: Number.isFinite(decimals) ? decimals : 2,
          maximumFractionDigits: Number.isFinite(decimals) ? decimals : 2,
        }).format(safeNum);
      } catch {
        return `$${safeNum.toFixed(2)}`;
      }
    }

    case 'formatDate': {
      const rawVal = args.value;
      const formatPattern = String(args.format ?? 'MMM dd, yyyy');
      const dateObj =
        typeof rawVal === 'number' || typeof rawVal === 'string'
          ? new Date(rawVal)
          : new Date();
      return formatTR35Date(dateObj, formatPattern);
    }

    case 'pluralize': {
      const count = Number(args.value ?? 0);
      const safeCount = Number.isFinite(count) ? count : 0;
      if (safeCount === 0 && args.zero !== undefined) {
        return interpolateFormatString(
          String(args.zero),
          { ...args, count: safeCount },
          context
        );
      }
      const category = new Intl.PluralRules('en-US').select(safeCount);
      const chosen =
        (category === 'one' && args.one !== undefined
          ? args.one
          : category === 'two' && args.two !== undefined
            ? args.two
            : category === 'few' && args.few !== undefined
              ? args.few
              : category === 'many' && args.many !== undefined
                ? args.many
                : args.other) ?? '';
      return interpolateFormatString(
        String(chosen),
        { ...args, count: safeCount },
        context
      );
    }

    case 'required': {
      const val = args.value;
      const isEmpty =
        val === null ||
        val === undefined ||
        (typeof val === 'string' && val.trim().length === 0) ||
        (Array.isArray(val) && val.length === 0);
      const result: A2UIValidationResult = isEmpty
        ? {
            valid: false,
            code: 'REQUIRED',
            message: 'This field is required.',
            severity: 'error',
          }
        : { valid: true };
      return result;
    }

    case 'numeric': {
      const raw = args.value;
      const strVal = raw === null || raw === undefined ? '' : String(raw).trim();
      const num =
        typeof raw === 'number' ? raw : strVal === '' ? NaN : Number(strVal);
      const min = args.min !== undefined ? Number(args.min) : undefined;
      const max = args.max !== undefined ? Number(args.max) : undefined;

      if (!Number.isFinite(num)) {
        return {
          valid: false,
          code: 'INVALID_NUMBER',
          message: 'Please enter a valid number.',
          severity: 'error',
        } satisfies A2UIValidationResult;
      }
      if (min !== undefined && Number.isFinite(min) && num < min) {
        return {
          valid: false,
          code: 'MIN_VALUE',
          message:
            max !== undefined
              ? `Value must be between ${min} and ${max}.`
              : `Value must be at least ${min}.`,
          severity: 'error',
        } satisfies A2UIValidationResult;
      }
      if (max !== undefined && Number.isFinite(max) && num > max) {
        return {
          valid: false,
          code: 'MAX_VALUE',
          message:
            min !== undefined
              ? `Value must be between ${min} and ${max}.`
              : `Value must be at most ${max}.`,
          severity: 'error',
        } satisfies A2UIValidationResult;
      }
      return { valid: true } satisfies A2UIValidationResult;
    }

    case 'regex': {
      const valStr = String(args.value ?? '');
      const pattern = String(args.pattern ?? '');
      try {
        const re = new RegExp(pattern);
        const valid = re.test(valStr);
        return (
          valid
            ? { valid: true }
            : {
                valid: false,
                code: 'REGEX_MISMATCH',
                message: 'Value does not match the required pattern.',
                severity: 'error',
              }
        ) satisfies A2UIValidationResult;
      } catch {
        return {
          valid: false,
          code: 'INVALID_REGEX',
          message: 'Invalid validation pattern.',
          severity: 'error',
        } satisfies A2UIValidationResult;
      }
    }

    case 'length': {
      const val = args.value;
      const len = Array.isArray(val)
        ? val.length
        : val === null || val === undefined
          ? 0
          : String(val).length;
      const min = args.min !== undefined ? Number(args.min) : undefined;
      const max = args.max !== undefined ? Number(args.max) : undefined;

      if (min !== undefined && Number.isFinite(min) && len < min) {
        return {
          valid: false,
          code: 'MIN_LENGTH',
          message: `Must be at least ${min} characters.`,
          severity: 'error',
        } satisfies A2UIValidationResult;
      }
      if (max !== undefined && Number.isFinite(max) && len > max) {
        return {
          valid: false,
          code: 'MAX_LENGTH',
          message: `Must be ${max} characters or fewer.`,
          severity: 'error',
        } satisfies A2UIValidationResult;
      }
      return { valid: true } satisfies A2UIValidationResult;
    }

    case 'email': {
      const valStr = String(args.value ?? '').trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valStr);
      return (
        valid
          ? { valid: true }
          : {
              valid: false,
              code: 'INVALID_EMAIL',
              message: 'Please enter a valid email address.',
              severity: 'error',
            }
      ) satisfies A2UIValidationResult;
    }

    case 'and': {
      const values = Array.isArray(args.values) ? args.values : [];
      return values.every((item) => coerceToBoolean(item));
    }

    case 'or': {
      const values = Array.isArray(args.values) ? args.values : [];
      return values.some((item) => coerceToBoolean(item));
    }

    case 'not': {
      return !coerceToBoolean(args.value);
    }

    case 'contains': {
      const container = args.list ?? args.value ?? args.array;
      const target = args.item ?? args.substring ?? args.search;
      if (Array.isArray(container)) {
        return container.includes(target);
      }
      if (typeof container === 'string') {
        return container.includes(String(target ?? ''));
      }
      return false;
    }

    case 'equals': {
      const left = args.a ?? args.left ?? args.value;
      const right = args.b ?? args.right ?? args.other;
      return JSON.stringify(left) === JSON.stringify(right);
    }

    case 'openUrl': {
      const url = String(args.url ?? '').trim();
      if (
        typeof window !== 'undefined' &&
        (url.startsWith('https://') || url.startsWith('http://'))
      ) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return undefined;
    }

    // --- FreshCart Grocery Catalog Client-Side Functions ---
    case 'calculateNetCarbs': {
      const totalCarbs = Number(args.totalCarbs ?? 24);
      const fiber = Number(args.fiber ?? 9);
      const sugarAlcohols = Number(args.sugarAlcohols ?? 3);
      const multiplier =
        args.perServing === false ? Math.max(1, Number(args.servings ?? 1)) : 1;
      const netPerServing = Math.max(
        0,
        Number((totalCarbs - fiber - sugarAlcohols).toFixed(1))
      );
      return Number((netPerServing * multiplier).toFixed(1));
    }

    case 'computeUnitSavings': {
      const baseSubtotal = Number(args.subtotal ?? 42.96);
      const servings = Math.max(1, Number(args.servings ?? 4));
      const promoRaw = String(args.promoCode ?? '')
        .trim()
        .toUpperCase();
      const loyaltyMember = coerceToBoolean(args.loyaltyMember ?? true);
      const serverCouponDiscount = Number(args.serverCouponDiscount ?? 0);

      let promoDiscount = 0;
      if (promoRaw === 'KETO20') {
        promoDiscount = Number((baseSubtotal * 0.2).toFixed(2));
      } else if (promoRaw === 'FRESH15') {
        promoDiscount = Number((baseSubtotal * 0.15).toFixed(2));
      } else if (promoRaw === 'A2UIV1') {
        promoDiscount = 10.0;
      } else if (promoRaw === 'ORGANIC10') {
        promoDiscount = Number((baseSubtotal * 0.1).toFixed(2));
      }

      const loyaltyDiscount = loyaltyMember
        ? Number((baseSubtotal * 0.1).toFixed(2))
        : 0;
      const totalSaved = Number(
        (promoDiscount + loyaltyDiscount + serverCouponDiscount).toFixed(2)
      );
      const finalTotal = Math.max(
        9.99,
        Number((baseSubtotal - totalSaved).toFixed(2))
      );
      const perServing = Number((finalTotal / servings).toFixed(2));

      return `$${perServing.toFixed(2)}/serving · Final $${finalTotal.toFixed(2)} (Save $${totalSaved.toFixed(2)})`;
    }

    case 'checkDietaryMatch': {
      const rawGoal = args.dietaryGoal;
      const goal = Array.isArray(rawGoal)
        ? String(rawGoal[0] ?? 'keto')
        : String(rawGoal ?? 'keto');
      const netCarbs = Number(args.netCarbsPerServing ?? 12);
      const protein = Number(args.proteinPerServing ?? 44);

      if (goal === 'keto') {
        if (netCarbs <= 15) {
          return {
            valid: true,
            code: 'KETO_MATCH',
            message: `Keto friendly: ${netCarbs}g net carbs/serving (≤ 15g limit).`,
            severity: 'info',
          } satisfies A2UIValidationResult;
        }
        return {
          valid: false,
          code: 'KETO_CARB_LIMIT_EXCEEDED',
          message: `Net carbs (${netCarbs}g/serving) exceed the 15g strict Keto target. Try applying the Keto Preset or increasing fiber.`,
          severity: 'warning',
        } satisfies A2UIValidationResult;
      }

      if (goal === 'high_protein') {
        if (protein >= 35) {
          return {
            valid: true,
            code: 'HIGH_PROTEIN_MATCH',
            message: `High-Protein target met (${protein}g protein/serving).`,
            severity: 'info',
          } satisfies A2UIValidationResult;
        }
        return {
          valid: false,
          code: 'PROTEIN_BELOW_TARGET',
          message: `Protein (${protein}g/serving) is below the 35g High-Protein goal.`,
          severity: 'warning',
        } satisfies A2UIValidationResult;
      }

      return {
        valid: true,
        code: 'MEDITERRANEAN_MATCH',
        message: 'Balanced Mediterranean macro profile verified.',
        severity: 'info',
      } satisfies A2UIValidationResult;
    }

    case 'validatePromoCodeFormat': {
      const code = String(args.value ?? '')
        .trim()
        .toUpperCase();
      if (!code) {
        return { valid: true } satisfies A2UIValidationResult;
      }
      if (!/^[A-Z0-9]{4,12}$/.test(code)) {
        return {
          valid: false,
          code: 'INVALID_PROMO_SYNTAX',
          message:
            'Promo codes must be 4–12 uppercase letters or digits (try KETO20, FRESH15, or A2UIV1).',
          severity: 'error',
        } satisfies A2UIValidationResult;
      }
      if (code === 'EXPIRED10') {
        return {
          valid: false,
          code: 'PROMO_EXPIRED',
          message:
            'Code EXPIRED10 ended last week. Use KETO20 (20% off) or FRESH15 (15% off) instead.',
          severity: 'warning',
        } satisfies A2UIValidationResult;
      }
      const recognized = ['KETO20', 'FRESH15', 'A2UIV1', 'ORGANIC10'];
      if (!recognized.includes(code)) {
        return {
          valid: false,
          code: 'UNRECOGNIZED_PROMO',
          message: `Code '${code}' is not in your store wallet. Try KETO20, FRESH15, ORGANIC10, or A2UIV1.`,
          severity: 'warning',
        } satisfies A2UIValidationResult;
      }
      return { valid: true } satisfies A2UIValidationResult;
    }

    case 'applyLocalNutritionPreset': {
      const preset = String(args.preset ?? 'keto');
      const servings = Number(args.servings ?? (preset === 'keto' ? 2 : 6));
      const promoCode = String(
        args.promoCode ?? (preset === 'keto' ? 'KETO20' : 'FRESH15')
      );

      const patch: Record<string, unknown> =
        preset === 'keto'
          ? {
              dietaryGoal: ['keto'],
              servings,
              promoCodeInput: promoCode,
              baseCarbs: 19,
              baseFiber: 8,
              sugarAlcohols: 2,
              baseProtein: 44,
              loyaltyMember: true,
              lastClientFunctionStatus:
                'Applied Low-Carb Keto Preset locally on client (9g net carbs/serving, code KETO20) — 0ms local execution ✓',
              statusBanner:
                'Applied Low-Carb Keto Preset (2 servings, 9g net carbs, code KETO20) ✓',
            }
          : preset === 'high_protein'
            ? {
                dietaryGoal: ['high_protein'],
                servings,
                promoCodeInput: promoCode,
                baseCarbs: 28,
                baseFiber: 7,
                sugarAlcohols: 0,
                baseProtein: 52,
                loyaltyMember: true,
                lastClientFunctionStatus:
                  'Applied Family High-Protein Pack locally on client (52g protein/serving, code FRESH15) — 0ms local execution ✓',
                statusBanner:
                  'Applied Family High-Protein Pack (6 servings, 52g protein, code FRESH15) ✓',
              }
            : {
                dietaryGoal: ['mediterranean'],
                servings: 4,
                promoCodeInput: 'ORGANIC10',
                baseCarbs: 24,
                baseFiber: 9,
                sugarAlcohols: 3,
                baseProtein: 42,
                loyaltyMember: true,
                lastClientFunctionStatus:
                  'Applied Mediterranean Heart-Healthy Preset locally on client — 0ms local execution ✓',
                statusBanner:
                  'Applied Mediterranean Heart-Healthy Preset (4 servings, code ORGANIC10) ✓',
              };

      context.onLocalStatePatch?.(
        patch,
        `Client Function @call:${fnName}(${preset})`
      );
      return patch;
    }

    case 'copyShoppingSummary': {
      const title = String(args.title ?? 'FreshCart Smart Kitchen Plan');
      const netCarbs = String(args.netCarbs ?? '12');
      const unitSavings = String(args.unitSavings ?? '$7.99/serving');
      const summaryText = `${title} — ${netCarbs}g net carbs/serving · ${unitSavings}`;
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        void navigator.clipboard.writeText(summaryText).catch(() => {});
      }
      const patch = {
        lastClientFunctionStatus: `Copied "${summaryText}" to clipboard via client function ✓`,
        statusBanner: `Copied shopping summary to clipboard ✓`,
      };
      context.onLocalStatePatch?.(patch, `Client Function @call:${fnName}`);
      return summaryText;
    }

    case 'getClientKitchenAndCartMetrics': {
      const bridge = getClientLiveBridgeSnapshot();
      const rawGoal = args.dietaryGoal ?? context.rootDataModel.dietaryGoal;
      const activeDietaryGoal = Array.isArray(rawGoal)
        ? String(rawGoal[0] ?? 'keto')
        : String(rawGoal ?? 'keto');
      const locale =
        typeof navigator !== 'undefined' && navigator.language
          ? navigator.language
          : 'en-US';
      const timezone =
        typeof Intl !== 'undefined'
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : 'America/Los_Angeles';

      return {
        cartItemCount: bridge.cartItemCount,
        cartSubtotal: Number(bridge.cartSubtotal.toFixed(2)),
        activeStoreId: bridge.activeStoreId,
        activeStoreName: bridge.activeStoreName,
        deliveryEtaMinutes: bridge.deliveryEtaMinutes,
        cartSampleItems: bridge.cartItemNames.slice(0, 4),
        activeDietaryGoal,
        clientLocale: locale,
        clientTimezone: timezone,
        inspectedAt: new Date().toISOString(),
      };
    }

    default: {
      // Check if an existing server RPC result is cached in the data model for this function
      const cached = getValueAtPointer(
        context.rootDataModel,
        `/rpcResults/${rawCall['@call']}`
      );
      return cached;
    }
  }
}

/**
 * Recursively resolves an `A2UIDynamicValue` (literal, `{"@path": "..."}`,
 * `{"@call": "..."}`, array, or object with `@@` escaped keys) against the
 * current `DataEvaluationContext`.
 */
export function evaluateDynamicValue(
  value: unknown,
  context: DataEvaluationContext
): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => evaluateDynamicValue(item, context));
  }

  if (isDataBinding(value)) {
    const canonicalPointer = resolvePointerPath(value['@path'], context.scopePath);
    return getValueAtPointer(context.rootDataModel, canonicalPointer);
  }

  if (isFunctionCall(value)) {
    return evaluateFunctionCall(value, context);
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [rawKey, propVal] of Object.entries(
      value as Record<string, unknown>
    )) {
      // Unescape doubled `@@` prefix to a literal single `@` per A2UI v1.0 spec
      const resolvedKey = rawKey.startsWith('@@') ? rawKey.slice(1) : rawKey;
      out[resolvedKey] = evaluateDynamicValue(propVal, context);
    }
    return out;
  }

  return value;
}

export function resolveDynamicString(
  val: unknown,
  context: DataEvaluationContext,
  fallback: string = ''
): string {
  const evaluated = evaluateDynamicValue(val, context);
  if (evaluated === null || evaluated === undefined) {
    return fallback;
  }
  if (typeof evaluated === 'string') {
    return evaluated;
  }
  if (typeof evaluated === 'number' || typeof evaluated === 'boolean') {
    return String(evaluated);
  }
  return fallback;
}

export function resolveDynamicNumber(
  val: unknown,
  context: DataEvaluationContext,
  fallback: number = 0
): number {
  const evaluated = evaluateDynamicValue(val, context);
  if (typeof evaluated === 'number' && Number.isFinite(evaluated)) {
    return evaluated;
  }
  if (typeof evaluated === 'string' && evaluated.trim() !== '') {
    const parsed = Number(evaluated);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

export function resolveDynamicBoolean(
  val: unknown,
  context: DataEvaluationContext,
  fallback: boolean = false
): boolean {
  const evaluated = evaluateDynamicValue(val, context);
  if (evaluated === null || evaluated === undefined) {
    return fallback;
  }
  return coerceToBoolean(evaluated);
}

export function resolveDynamicStringList(
  val: unknown,
  context: DataEvaluationContext
): string[] {
  const evaluated = evaluateDynamicValue(val, context);
  if (Array.isArray(evaluated)) {
    return evaluated.map((item) => String(item));
  }
  if (typeof evaluated === 'string' && evaluated.trim().length > 0) {
    return [evaluated];
  }
  return [];
}
