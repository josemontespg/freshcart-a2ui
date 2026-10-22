import {
  A2UI_BASIC_CATALOG_ID,
  FRESHCART_CULINARY_CATALOG_ID,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIDataBinding,
  type A2UIFunctionCall,
  type A2UIValidationResult,
} from '../types/a2ui-v1';

/**
 * Resolves the effective `catalogId` for an A2UI v1.0 `@call` invocation using
 * `@a2ui/web_core/v1_0`'s strict 3-step resolution order (`resolveSurfaceCatalog`):
 * 1. Explicit `call.catalogId` on the FunctionCall object.
 * 2. Fallback to `surface.defaultCatalogId` (`createSurface.catalogId`).
 *    NOTE: Nested `@call` expressions inside a custom-catalog component do NOT
 *    inherit the enclosing component's `catalogId`!
 * 3. System functions (`@index`) belong to no catalog (`undefined`).
 */
export function resolveFunctionCallCatalogId(
  call: A2UIFunctionCall,
  context: DataEvaluationContext
): string | undefined {
  if (call['@call'].startsWith('@')) {
    return undefined;
  }
  if (call.catalogId !== undefined) {
    return call.catalogId;
  }
  return context.defaultCatalogId;
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
  /** Whether evaluation is triggered by a direct user gesture (used by openUrl) */
  isUserActivated?: boolean;
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
  // Temporary sentinel for escaped `\${`
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

/**
 * Evaluates an A2UI v1.0 `{"@call": "...", "args": {...}}` expression.
 */
export function evaluateFunctionCall(
  call: A2UIFunctionCall,
  context: DataEvaluationContext
): unknown {
  const fnName = call['@call'];
  const rawArgs = call.args ?? {};

  // Evaluate all arguments recursively first
  const args: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(rawArgs)) {
    args[key] = evaluateDynamicValue(val, context);
  }

  switch (fnName) {
    case '@index': {
      const offset = typeof args.offset === 'number' ? args.offset : Number(args.offset ?? 0);
      const baseIndex = typeof context.collectionIndex === 'number' ? context.collectionIndex : 0;
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
        return interpolateFormatString(String(args.zero), { ...args, count: safeCount }, context);
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
      return interpolateFormatString(String(chosen), { ...args, count: safeCount }, context);
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
      const num = typeof raw === 'number' ? raw : strVal === '' ? NaN : Number(strVal);
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

    /**
     * Custom Culinary Catalog Function 1 (`https://freshcart.app/catalogs/culinary/v1/catalog.json`):
     * `calculatePerServingCost`
     * Computes the per-guest cost of a chef meal & optional sommelier pairing, returning a formatted label.
     */
    case 'calculatePerServingCost': {
      const resolvedCatalog = resolveFunctionCallCatalogId(call, context);
      if (
        resolvedCatalog &&
        resolvedCatalog !== FRESHCART_CULINARY_CATALOG_ID
      ) {
        // In v1.0, calling a culinary function without explicit catalogId on a basicCatalog
        // surface resolves to basicCatalog and fails unless catalogId is explicitly set.
      }
      const totalCost = Number(args.totalCost ?? 0);
      const servings = Math.max(1, Number(args.servings ?? 4));
      const includeWinePairing = coerceToBoolean(
        args.includeWinePairing ?? false
      );
      const winePairingPrice = Number(args.winePairingPrice ?? 16.99);
      const discountAmount = Number(args.discountAmount ?? 0);

      const effectiveTotal = Math.max(
        0,
        (Number.isFinite(totalCost) ? totalCost : 0) +
          (includeWinePairing && Number.isFinite(winePairingPrice)
            ? winePairingPrice
            : 0) -
          (Number.isFinite(discountAmount) ? discountAmount : 0)
      );
      const perGuest = effectiveTotal / servings;
      const suffix = includeWinePairing
        ? ' / guest (with pairing)'
        : ' / guest';
      return `$${perGuest.toFixed(2)}${suffix}`;
    }

    /**
     * Custom Culinary Catalog Function 2 (`https://freshcart.app/catalogs/culinary/v1/catalog.json`):
     * `matchDietaryScore`
     * Computes a 0-100 culinary & dietary harmony score from recipe & guest preferences.
     */
    case 'matchDietaryScore': {
      const baseScore = Number(args.baseScore ?? 91);
      const isOrganic = coerceToBoolean(args.isOrganic ?? true);
      const isGlutenFree = coerceToBoolean(args.isGlutenFree ?? true);
      const includeWinePairing = coerceToBoolean(
        args.includeWinePairing ?? true
      );
      let score = Number.isFinite(baseScore) ? baseScore : 91;
      if (isOrganic) score += 4;
      if (isGlutenFree) score += 2;
      if (includeWinePairing) score += 2;
      return Math.min(100, Math.max(50, Math.round(score)));
    }

    /**
     * Custom Grocery Merchandising Catalog Function (`https://freshcart.app/catalogs/grocery/v1/catalog.json`):
     * `formatSavingsBadge`
     */
    case 'formatSavingsBadge': {
      const originalPrice = Number(args.originalPrice ?? 0);
      const salePrice = Number(args.salePrice ?? 0);
      const couponSavings = Number(args.couponSavings ?? 0);
      const totalSaved = Math.max(
        0,
        (originalPrice > salePrice ? originalPrice - salePrice : 0) +
          (Number.isFinite(couponSavings) ? couponSavings : 0)
      );
      if (totalSaved <= 0) {
        return 'EVERYDAY LOW PRICE';
      }
      if (originalPrice > 0) {
        const pct = Math.round((totalSaved / originalPrice) * 100);
        return `SAVE $${totalSaved.toFixed(2)} (${pct}% OFF)`;
      }
      return `SAVE $${totalSaved.toFixed(2)}`;
    }

    default:
      return undefined;
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
    for (const [rawKey, propVal] of Object.entries(value as Record<string, unknown>)) {
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
