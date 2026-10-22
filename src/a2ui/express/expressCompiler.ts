import {
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UICheckRule,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../../types/a2ui-v1';

/**
 * Positional parameter signatures for A2UI v1.0 Basic Catalog + FreshCart Grocery Catalog.
 * Derived from `specification/proposals/express/a2ui_express.md` and `@a2ui/agent` SchemaHelper:
 * required parameters first (in schema definition order), followed by optional parameters,
 * with `checks` at the tail for checkable components.
 */
export const EXPRESS_COMPONENT_SIGNATURES: Record<string, string[]> = {
  // Basic Catalog v1.0
  Text: ['text', 'variant'],
  Image: ['url', 'fit', 'variant'],
  Icon: ['name'],
  Video: ['url'],
  AudioPlayer: ['url', 'description'],
  Row: ['children', 'justify', 'align'],
  Column: ['children', 'justify', 'align'],
  List: ['children', 'direction', 'align'],
  Card: ['child'],
  Tabs: ['tabs'],
  Modal: ['trigger', 'content'],
  Divider: ['axis'],
  Button: ['child', 'action', 'variant', 'checks'],
  TextField: ['label', 'value', 'variant', 'checks'],
  CheckBox: ['label', 'value', 'checks'],
  ChoicePicker: ['options', 'value', 'label', 'variant', 'filterable', 'checks'],
  Slider: ['value', 'min', 'max', 'label', 'checks'],
  DateTimeInput: [
    'value',
    'enableDate',
    'enableTime',
    'min',
    'max',
    'label',
    'checks',
  ],

  // FreshCart Custom Grocery Catalog v1.0
  ProductDealCard: [
    'productId',
    'title',
    'price',
    'originalPrice',
    'unit',
    'badgeText',
    'reason',
    'imageUrl',
    'actionLabel',
    'action',
    'applied',
  ],
  NutritionSummary: [
    'title',
    'calories',
    'proteinGrams',
    'carbsGrams',
    'fatGrams',
    'fiberGrams',
    'servings',
    'dailyCalorieTarget',
  ],
};

/**
 * Positional parameter signatures for A2UI v1.0 built-in functions & validation checks.
 * Note: For `?check(...)` calls, the first parameter `value` is implicitly bound from
 * the enclosing component's `value` data binding (`$/path`).
 */
export const EXPRESS_FUNCTION_SIGNATURES: Record<string, string[]> = {
  required: ['value'],
  regex: ['value', 'pattern'],
  numeric: ['value', 'min', 'max'],
  length: ['value', 'min', 'max'],
  email: ['value'],
  formatString: ['value'],
  formatNumber: ['value', 'decimals', 'grouping'],
  formatCurrency: ['value', 'currency', 'decimals', 'grouping'],
  formatDate: ['value', 'format'],
  pluralize: ['value', 'one', 'other', 'zero', 'two', 'few', 'many'],
  openUrl: ['url'],
  and: ['values'],
  or: ['values'],
  not: ['value'],
};

export interface ExtractedExpressBlock {
  textBefore: string;
  expressDsl: string;
  textAfter: string;
}

export interface ExpressCompilationMetrics {
  expressCharCount: number;
  jsonCharCount: number;
  estimatedExpressTokens: number;
  estimatedJsonTokens: number;
  tokenSavingsPercent: number;
  componentCount: number;
  dataBindingCount: number;
  checkRuleCount: number;
}

export interface ExpressCompilationResult {
  envelopes: A2UIv1Message[];
  surfaceId: string;
  catalogId: string;
  expressDsl: string;
  decompiledDsl: string;
  metrics: ExpressCompilationMetrics;
}

/**
 * Extracts `<a2ui>...</a2ui>` sentinel blocks from an LLM response while
 * respecting `#` line comments, `//` line comments, `/* ... *\/` block comments,
 * and double-quoted strings (`"..."` and `"""..."""`).
 *
 * Fixes the `@a2ui/agent@0.0.1` `BlockLexer` bug where `//` comments were not
 * registered in `singleLineComments` and `'` in `// Chef's 15-minute dinner`
 * opened an unclosed single-quoted string that swallowed `</a2ui>`.
 */
export function extractExpressBlocks(rawText: string): ExtractedExpressBlock[] {
  const OPEN_TAG = '<a2ui>';
  const CLOSE_TAG = '</a2ui>';

  const blocks: ExtractedExpressBlock[] = [];
  let cursor = 0;

  while (cursor < rawText.length) {
    const openIdx = rawText.indexOf(OPEN_TAG, cursor);
    if (openIdx === -1) {
      break;
    }

    const textBefore = rawText.slice(cursor, openIdx).trim();
    const contentStart = openIdx + OPEN_TAG.length;
    let i = contentStart;
    let inString: ' none' | 'double' | 'triple' = ' none';
    let inLineComment = false;
    let inBlockComment = false;
    let closeIdx = -1;

    while (i < rawText.length) {
      const ch = rawText[i];
      const next2 = rawText.slice(i, i + 2);
      const next3 = rawText.slice(i, i + 3);

      if (inLineComment) {
        if (ch === '\n' || ch === '\r') {
          inLineComment = false;
        }
        i += 1;
        continue;
      }

      if (inBlockComment) {
        if (next2 === '*/') {
          inBlockComment = false;
          i += 2;
        } else {
          i += 1;
        }
        continue;
      }

      if (inString === 'triple') {
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (next3 === '"""') {
          inString = ' none';
          i += 3;
          continue;
        }
        i += 1;
        continue;
      }

      if (inString === 'double') {
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === '"') {
          inString = ' none';
        }
        i += 1;
        continue;
      }

      // Normal state inside <a2ui> block:
      if (ch === '#') {
        inLineComment = true;
        i += 1;
        continue;
      }
      if (next2 === '//') {
        inLineComment = true;
        i += 2;
        continue;
      }
      if (next2 === '/*') {
        inBlockComment = true;
        i += 2;
        continue;
      }
      if (next3 === '"""') {
        inString = 'triple';
        i += 3;
        continue;
      }
      if (ch === '"') {
        inString = 'double';
        i += 1;
        continue;
      }

      if (rawText.startsWith(CLOSE_TAG, i)) {
        closeIdx = i;
        break;
      }

      i += 1;
    }

    if (closeIdx === -1) {
      // Unclosed block fallback: take until end of string
      blocks.push({
        textBefore,
        expressDsl: rawText.slice(contentStart).trim(),
        textAfter: '',
      });
      break;
    }

    const expressDsl = rawText.slice(contentStart, closeIdx).trim();
    cursor = closeIdx + CLOSE_TAG.length;
    const nextOpen = rawText.indexOf(OPEN_TAG, cursor);
    const textAfter =
      nextOpen === -1
        ? rawText.slice(cursor).trim()
        : rawText.slice(cursor, nextOpen).trim();

    blocks.push({
      textBefore,
      expressDsl,
      textAfter,
    });
  }

  return blocks;
}

/**
 * Strips outer `<a2ui>` and `</a2ui>` wrapper tags if present at the boundaries
 * without corrupting string literals that mention `<a2ui>` inside the DSL.
 */
function stripOuterSentinelTags(rawDsl: string): string {
  const extracted = extractExpressBlocks(rawDsl);
  if (extracted.length > 0) {
    return extracted.map((b) => b.expressDsl).join('\n');
  }
  return rawDsl
    .trim()
    .replace(/^<a2ui>\s*/i, '')
    .replace(/\s*<\/a2ui>$/i, '')
    .trim();
}

// ============================================================================
// Lexer & Recursive-Descent AST Parser for A2UI Express (`Express.g4`)
// ============================================================================

type TokenType =
  | 'IDENT'
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'NULL'
  | 'PATH'
  | 'CHECK_PREFIX'
  | 'UNDERSCORE'
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'LBRACE'
  | 'RBRACE'
  | 'COLON'
  | 'COMMA'
  | 'EQUALS'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

function tokenizeExpress(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];
    const next2 = input.slice(i, i + 2);
    const next3 = input.slice(i, i + 3);

    // Skip whitespace & optional semicolons (Express.g4 skips both WS and ';')
    if (/\s/.test(ch) || ch === ';') {
      i += 1;
      continue;
    }

    // Single-line comments: `#` or `//`
    if (ch === '#' || next2 === '//') {
      while (i < input.length && input[i] !== '\n' && input[i] !== '\r') {
        i += 1;
      }
      continue;
    }

    // Multi-line comment: `/* ... */`
    if (next2 === '/*') {
      i += 2;
      while (i < input.length && input.slice(i, i + 2) !== '*/') {
        i += 1;
      }
      i += 2;
      continue;
    }

    // Raw string literal: `r"..."` or `r"""..."""`
    if (
      (ch === 'r' || ch === 'R') &&
      input[i + 1] === '"'
    ) {
      const startPos = i;
      i += 1; // skip 'r'
      if (input.slice(i, i + 3) === '"""') {
        i += 3;
        let rawContent = '';
        while (i < input.length && input.slice(i, i + 3) !== '"""') {
          rawContent += input[i];
          i += 1;
        }
        i += 3;
        tokens.push({ type: 'STRING', value: rawContent, pos: startPos });
        continue;
      } else {
        i += 1; // skip '"'
        let rawContent = '';
        while (i < input.length && input[i] !== '"') {
          if (input[i] === '\\' && i + 1 < input.length) {
            // In raw strings, \" escapes quote, other backslashes stay literal
            if (input[i + 1] === '"') {
              rawContent += '"';
              i += 2;
              continue;
            }
          }
          rawContent += input[i];
          i += 1;
        }
        i += 1; // skip closing '"'
        tokens.push({ type: 'STRING', value: rawContent, pos: startPos });
        continue;
      }
    }

    // Triple-quoted string: `"""..."""`
    if (next3 === '"""') {
      const startPos = i;
      i += 3;
      let str = '';
      while (i < input.length && input.slice(i, i + 3) !== '"""') {
        if (input[i] === '\\' && i + 1 < input.length) {
          const esc = input[i + 1];
          str += esc === 'n' ? '\n' : esc === 't' ? '\t' : esc;
          i += 2;
        } else {
          str += input[i];
          i += 1;
        }
      }
      i += 3;
      tokens.push({ type: 'STRING', value: str, pos: startPos });
      continue;
    }

    // Standard double-quoted string: `"..."`
    if (ch === '"') {
      const startPos = i;
      i += 1;
      let str = '';
      while (i < input.length && input[i] !== '"') {
        if (input[i] === '\\' && i + 1 < input.length) {
          const esc = input[i + 1];
          if (esc === 'n') str += '\n';
          else if (esc === 'r') str += '\r';
          else if (esc === 't') str += '\t';
          else if (esc === '"') str += '"';
          else if (esc === '\\') str += '\\';
          else str += `\\${esc}`;
          i += 2;
        } else {
          str += input[i];
          i += 1;
        }
      }
      i += 1;
      tokens.push({ type: 'STRING', value: str, pos: startPos });
      continue;
    }

    // Data binding path: `$/abs/path` or `$rel/path`
    if (ch === '$') {
      const startPos = i;
      i += 1;
      let pathStr = '';
      while (
        i < input.length &&
        /[a-zA-Z0-9_/\-.~]/.test(input[i])
      ) {
        pathStr += input[i];
        i += 1;
      }
      tokens.push({ type: 'PATH', value: pathStr, pos: startPos });
      continue;
    }

    // Check call prefix: `?required`, `?regex`, `?numeric`, etc.
    if (ch === '?') {
      const startPos = i;
      i += 1;
      let ident = '';
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        ident += input[i];
        i += 1;
      }
      tokens.push({ type: 'CHECK_PREFIX', value: ident, pos: startPos });
      continue;
    }

    // Punctuation
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: ch, pos: i++ });
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ch, pos: i++ });
      continue;
    }
    if (ch === '[') {
      tokens.push({ type: 'LBRACKET', value: ch, pos: i++ });
      continue;
    }
    if (ch === ']') {
      tokens.push({ type: 'RBRACKET', value: ch, pos: i++ });
      continue;
    }
    if (ch === '{') {
      tokens.push({ type: 'LBRACE', value: ch, pos: i++ });
      continue;
    }
    if (ch === '}') {
      tokens.push({ type: 'RBRACE', value: ch, pos: i++ });
      continue;
    }
    if (ch === ':') {
      tokens.push({ type: 'COLON', value: ch, pos: i++ });
      continue;
    }
    if (ch === ',') {
      tokens.push({ type: 'COMMA', value: ch, pos: i++ });
      continue;
    }
    if (ch === '=') {
      tokens.push({ type: 'EQUALS', value: ch, pos: i++ });
      continue;
    }

    // Numbers (integer or float, optional leading `-`)
    if (
      /[0-9]/.test(ch) ||
      (ch === '-' && i + 1 < input.length && /[0-9]/.test(input[i + 1]))
    ) {
      const startPos = i;
      let numStr = input[i++];
      while (i < input.length && /[0-9.]/.test(input[i])) {
        numStr += input[i++];
      }
      tokens.push({ type: 'NUMBER', value: numStr, pos: startPos });
      continue;
    }

    // Identifiers, booleans, null, or `_` placeholder (supports Unicode UAX #31 letters per spec!)
    if (/[\p{L}_]/u.test(ch)) {
      const startPos = i;
      let ident = '';
      while (i < input.length && /[\p{L}\p{N}_]/u.test(input[i])) {
        ident += input[i++];
      }
      if (ident === '_') {
        tokens.push({ type: 'UNDERSCORE', value: '_', pos: startPos });
      } else if (ident === 'true' || ident === 'false') {
        tokens.push({ type: 'BOOLEAN', value: ident, pos: startPos });
      } else if (ident === 'null') {
        tokens.push({ type: 'NULL', value: ident, pos: startPos });
      } else {
        tokens.push({ type: 'IDENT', value: ident, pos: startPos });
      }
      continue;
    }

    // Skip any unrecognized character gracefully
    i += 1;
  }

  tokens.push({ type: 'EOF', value: '', pos: input.length });
  return tokens;
}

// AST Node types
interface CallArgAST {
  keyword?: string;
  value: ExprAST;
}

type ExprAST =
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'null' }
  | { kind: 'underscore' }
  | { kind: 'path'; path: string }
  | { kind: 'ident'; name: string }
  | { kind: 'array'; items: ExprAST[] }
  | { kind: 'object'; entries: Array<{ key: string; value: ExprAST }> }
  | { kind: 'call'; name: string; args: CallArgAST[] }
  | { kind: 'check'; name: string; args: CallArgAST[] };

type StatementAST =
  | { kind: 'varAssign'; name: string; expr: ExprAST }
  | { kind: 'pathAssign'; path: string; expr: ExprAST }
  | { kind: 'exprStmt'; expr: ExprAST };

class ExpressASTParser {
  private tokens: Token[];
  private idx = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(offset = 0): Token {
    return (
      this.tokens[this.idx + offset] ??
      this.tokens[this.tokens.length - 1]
    );
  }

  private advance(): Token {
    const tok = this.peek();
    if (tok.type !== 'EOF') {
      this.idx += 1;
    }
    return tok;
  }

  private match(type: TokenType): boolean {
    if (this.peek().type === type) {
      this.advance();
      return true;
    }
    return false;
  }

  private expect(type: TokenType): Token {
    const tok = this.peek();
    if (tok.type !== type) {
      throw new Error(
        `A2UI Express syntax error at pos ${tok.pos}: expected ${type}, got ${tok.type} (${tok.value})`
      );
    }
    return this.advance();
  }

  parseProgram(): StatementAST[] {
    const stmts: StatementAST[] = [];
    while (this.peek().type !== 'EOF') {
      const cur = this.peek();
      const next = this.peek(1);

      if (cur.type === 'IDENT' && next.type === 'EQUALS') {
        const name = this.advance().value;
        this.advance(); // consume '='
        const expr = this.parseExpr();
        stmts.push({ kind: 'varAssign', name, expr });
      } else if (cur.type === 'PATH' && next.type === 'EQUALS') {
        const path = this.advance().value;
        this.advance(); // consume '='
        const expr = this.parseExpr();
        stmts.push({ kind: 'pathAssign', path, expr });
      } else {
        const expr = this.parseExpr();
        stmts.push({ kind: 'exprStmt', expr });
      }
    }
    return stmts;
  }

  parseExpr(): ExprAST {
    const tok = this.peek();

    switch (tok.type) {
      case 'STRING':
        this.advance();
        return { kind: 'string', value: tok.value };

      case 'NUMBER':
        this.advance();
        return { kind: 'number', value: Number(tok.value) };

      case 'BOOLEAN':
        this.advance();
        return { kind: 'boolean', value: tok.value === 'true' };

      case 'NULL':
        this.advance();
        return { kind: 'null' };

      case 'UNDERSCORE':
        this.advance();
        return { kind: 'underscore' };

      case 'PATH':
        this.advance();
        return { kind: 'path', path: tok.value };

      case 'CHECK_PREFIX': {
        const name = this.advance().value;
        const args = this.parseCallArgs();
        return { kind: 'check', name, args };
      }

      case 'IDENT': {
        const name = this.advance().value;
        if (this.peek().type === 'LPAREN') {
          const args = this.parseCallArgs();
          return { kind: 'call', name, args };
        }
        return { kind: 'ident', name };
      }

      case 'LBRACKET': {
        this.advance(); // '['
        const items: ExprAST[] = [];
        while (this.peek().type !== 'RBRACKET' && this.peek().type !== 'EOF') {
          items.push(this.parseExpr());
          this.match('COMMA');
        }
        this.expect('RBRACKET');
        return { kind: 'array', items };
      }

      case 'LBRACE': {
        this.advance(); // '{'
        const entries: Array<{ key: string; value: ExprAST }> = [];
        while (this.peek().type !== 'RBRACE' && this.peek().type !== 'EOF') {
          const keyTok = this.advance();
          const key = keyTok.value;
          this.expect('COLON');
          const value = this.parseExpr();
          entries.push({ key, value });
          this.match('COMMA');
        }
        this.expect('RBRACE');
        return { kind: 'object', entries };
      }

      default:
        // Advance to avoid infinite loop on unexpected token
        this.advance();
        return { kind: 'null' };
    }
  }

  private parseCallArgs(): CallArgAST[] {
    this.expect('LPAREN');
    const args: CallArgAST[] = [];
    while (this.peek().type !== 'RPAREN' && this.peek().type !== 'EOF') {
      if (
        this.peek().type === 'IDENT' &&
        this.peek(1).type === 'EQUALS'
      ) {
        const keyword = this.advance().value;
        this.advance(); // '='
        const value = this.parseExpr();
        args.push({ keyword, value });
      } else {
        const value = this.parseExpr();
        args.push({ value });
      }
      this.match('COMMA');
    }
    this.expect('RPAREN');
    return args;
  }
}

/**
 * Sets a value inside a nested object following a JSON Pointer path (`/a/b/c`).
 */
function setNestedPointerValue(
  target: Record<string, unknown>,
  rawPath: string,
  value: unknown
): void {
  const clean = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
  if (!clean) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(target, value);
    }
    return;
  }
  const parts = clean.split('/');
  let cursor: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (
      typeof cursor[key] !== 'object' ||
      cursor[key] === null ||
      Array.isArray(cursor[key])
    ) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

export interface CompileExpressOptions {
  defaultSurfaceId?: string;
  defaultCatalogId?: string;
  /**
   * When true (default), emits a 3-envelope progressive sequence
   * (`createSurface` -> `updateComponents` -> `updateDataModel`) so
   * FreshCart's SurfaceManager and live renderer process each lifecycle step.
   */
  emitProgressiveEnvelopes?: boolean;
}

/**
 * Compiles an A2UI v1.0 Express DSL string (with or without `<a2ui>...</a2ui>` tags)
 * into validated A2UI v1.0 `A2UIv1Message[]` envelopes and computes token savings metrics.
 */
export function compileA2UIExpress(
  rawExpressInput: string,
  options: CompileExpressOptions = {}
): ExpressCompilationResult {
  const cleanDsl = stripOuterSentinelTags(rawExpressInput);
  const tokens = tokenizeExpress(cleanDsl);
  const parser = new ExpressASTParser(tokens);
  const statements = parser.parseProgram();

  let surfaceId = options.defaultSurfaceId ?? 'express_shopper_surface';
  let catalogId = options.defaultCatalogId ?? FRESHCART_GROCERY_CATALOG_ID;
  let sendDataModel = true;
  let isUpdateOnly = false;
  let deleteSurfaceId: string | null = null;

  const components: A2UIComponentBase[] = [];
  const varNameToComponentId = new Map<string, string>();
  const dataModel: Record<string, unknown> = {};
  const standaloneDataUpdates: Array<{ path: string; value: unknown }> = [];

  let dataBindingCount = 0;
  let checkRuleCount = 0;

  const isComponentName = (name: string): boolean => {
    return (
      name in EXPRESS_COMPONENT_SIGNATURES ||
      /^[A-Z]/.test(name)
    );
  };

  // Pre-pass: map variable names to custom `id="..."` if specified in constructor
  for (const stmt of statements) {
    if (stmt.kind === 'varAssign' && stmt.expr.kind === 'call') {
      const idArg = stmt.expr.args.find((a) => a.keyword === 'id');
      if (idArg && idArg.value.kind === 'string') {
        varNameToComponentId.set(stmt.name, idArg.value.value);
      } else {
        varNameToComponentId.set(stmt.name, stmt.name);
      }
    }
  }

  const compileValueExpr = (
    expr: ExprAST,
    parentComponentId?: string,
    propName?: string,
    childIdx?: number,
    enclosingValueBinding?: { '@path': string }
  ): unknown => {
    switch (expr.kind) {
      case 'string':
      case 'number':
      case 'boolean':
        return expr.value;
      case 'null':
      case 'underscore':
        return undefined;
      case 'path':
        dataBindingCount += 1;
        return { '@path': expr.path };
      case 'ident':
        return varNameToComponentId.get(expr.name) ?? expr.name;
      case 'array':
        return expr.items
          .map((item, idx) =>
            compileValueExpr(
              item,
              parentComponentId,
              propName,
              idx,
              enclosingValueBinding
            )
          )
          .filter((v) => v !== undefined);
      case 'object': {
        const obj: Record<string, unknown> = {};
        for (const entry of expr.entries) {
          obj[entry.key] = compileValueExpr(
            entry.value,
            parentComponentId,
            entry.key,
            undefined,
            enclosingValueBinding
          );
        }
        return obj;
      }
      case 'check': {
        checkRuleCount += 1;
        return compileCheckCall(expr.name, expr.args, enclosingValueBinding);
      }
      case 'call': {
        if (expr.name === '_template') {
          const pathArg = expr.args[0]?.value;
          const compArg = expr.args[1]?.value;
          const rawPath =
            pathArg?.kind === 'path'
              ? pathArg.path
              : pathArg?.kind === 'string'
                ? pathArg.value
                : '/items';
          let compId = 'item_template';
          if (compArg?.kind === 'ident') {
            compId = varNameToComponentId.get(compArg.name) ?? compArg.name;
          } else if (compArg?.kind === 'call') {
            const generatedId = `${parentComponentId ?? 'list'}_template_0`;
            compileComponentConstructor(generatedId, compArg.name, compArg.args);
            compId = generatedId;
          }
          return {
            path: rawPath,
            componentId: compId,
          };
        }

        if (expr.name === 'Event') {
          const eventNameExpr = expr.args.find((a) => !a.keyword || a.keyword === 'name')?.value;
          const contextArg =
            expr.args.find((a) => a.keyword === 'context')?.value ??
            expr.args[1]?.value;
          const eventName =
            eventNameExpr?.kind === 'string'
              ? eventNameExpr.value
              : 'custom_action';
          const compiledContext = contextArg
            ? (compileValueExpr(contextArg, parentComponentId, 'context') as Record<
                string,
                unknown
              >)
            : undefined;
          return {
            event: {
              name: eventName,
              ...(compiledContext ? { context: compiledContext } : {}),
            },
          };
        }

        // Inline nested component constructor (e.g., `Button(Text("Add Bundle"), Event(...))`)
        if (isComponentName(expr.name)) {
          const autoId =
            childIdx !== undefined
              ? `${parentComponentId ?? 'comp'}_${propName ?? 'child'}_${childIdx}`
              : `${parentComponentId ?? 'comp'}_${propName ?? 'child'}_0`;
          return compileComponentConstructor(autoId, expr.name, expr.args);
        }

        // Built-in function call (`formatString`, `formatCurrency`, `openUrl`, etc.)
        const fnCall = compileFunctionCall(expr.name, expr.args);
        if (propName === 'action') {
          return { functionCall: fnCall };
        }
        return fnCall;
      }
    }
  };

  const compileFunctionCall = (
    fnName: string,
    callArgs: CallArgAST[]
  ): { '@call': string; args: Record<string, unknown> } => {
    const paramOrder = EXPRESS_FUNCTION_SIGNATURES[fnName] ?? ['value'];
    const argsObj: Record<string, unknown> = {};
    let posIdx = 0;

    for (const arg of callArgs) {
      if (arg.keyword) {
        if (arg.value.kind !== 'underscore') {
          argsObj[arg.keyword] = compileValueExpr(arg.value);
        }
      } else {
        const paramName = paramOrder[posIdx] ?? `arg${posIdx}`;
        posIdx += 1;
        if (arg.value.kind !== 'underscore') {
          argsObj[paramName] = compileValueExpr(arg.value);
        }
      }
    }

    return {
      '@call': fnName,
      args: argsObj,
    };
  };

  const compileCheckCall = (
    checkName: string,
    callArgs: CallArgAST[],
    enclosingValueBinding?: { '@path': string }
  ): A2UICheckRule => {
    const paramOrder = EXPRESS_FUNCTION_SIGNATURES[checkName] ?? ['value'];
    // Non-value parameters precede the trailing `message` positional argument
    const extraParamNames = paramOrder.slice(1);
    const argsObj: Record<string, unknown> = {
      value: enclosingValueBinding ?? { '@path': '/value' },
    };
    let message = 'Validation check failed.';

    const positionalArgs = callArgs.filter((a) => !a.keyword);
    const keywordArgs = callArgs.filter((a) => Boolean(a.keyword));

    // In Express `?check(arg1, arg2, "Error message")`, the last positional string argument is `message`
    for (let i = 0; i < positionalArgs.length; i++) {
      const pArg = positionalArgs[i];
      const isLast = i === positionalArgs.length - 1;
      if (
        isLast &&
        i >= extraParamNames.length &&
        pArg.value.kind === 'string'
      ) {
        message = pArg.value.value;
      } else if (i < extraParamNames.length) {
        if (pArg.value.kind !== 'underscore') {
          argsObj[extraParamNames[i]] = compileValueExpr(pArg.value);
        }
      } else if (pArg.value.kind === 'string') {
        message = pArg.value.value;
      }
    }

    for (const kArg of keywordArgs) {
      if (!kArg.keyword) continue;
      if (kArg.keyword === 'message' && kArg.value.kind === 'string') {
        message = kArg.value.value;
      } else if (kArg.value.kind !== 'underscore') {
        argsObj[kArg.keyword] = compileValueExpr(kArg.value);
      }
    }

    return {
      condition: {
        '@call': checkName,
        args: argsObj as Record<string, never>,
      },
      message,
    };
  };

  const compileComponentConstructor = (
    defaultComponentId: string,
    compType: string,
    callArgs: CallArgAST[]
  ): string => {
    const signature = EXPRESS_COMPONENT_SIGNATURES[compType] ?? [];
    let resolvedId = defaultComponentId;

    // Check if an explicit `id="..."` keyword argument was provided
    const explicitIdArg = callArgs.find((a) => a.keyword === 'id');
    if (explicitIdArg && explicitIdArg.value.kind === 'string') {
      resolvedId = explicitIdArg.value.value;
    }

    const rawProps = new Map<string, ExprAST>();
    let posIndex = 0;

    for (const arg of callArgs) {
      if (arg.keyword) {
        if (arg.keyword === 'id') continue;
        if (arg.value.kind !== 'underscore') {
          rawProps.set(arg.keyword, arg.value);
        }
      } else {
        const paramName = signature[posIndex];
        posIndex += 1;
        if (paramName && arg.value.kind !== 'underscore') {
          rawProps.set(paramName, arg.value);
        }
      }
    }

    // Determine if this component has a `value` data binding for implicit `?check` wiring
    let valueBinding: { '@path': string } | undefined;
    const rawValExpr = rawProps.get('value');
    if (rawValExpr && rawValExpr.kind === 'path') {
      valueBinding = { '@path': rawValExpr.path };
    }

    const compObj: A2UIComponentBase = {
      id: resolvedId,
      component: compType,
    };

    for (const [propKey, propExpr] of rawProps.entries()) {
      compObj[propKey] = compileValueExpr(
        propExpr,
        resolvedId,
        propKey,
        undefined,
        valueBinding
      );
    }

    components.push(compObj);
    return resolvedId;
  };

  for (const stmt of statements) {
    if (stmt.kind === 'exprStmt' && stmt.expr.kind === 'call') {
      if (stmt.expr.name === 'surface') {
        const firstArg = stmt.expr.args[0]?.value;
        if (firstArg?.kind === 'string') {
          surfaceId = firstArg.value;
        }
        for (const arg of stmt.expr.args) {
          if (arg.keyword === 'sendDataModel' && arg.value.kind === 'boolean') {
            sendDataModel = arg.value.value;
          }
          if (arg.keyword === 'update' && arg.value.kind === 'boolean') {
            isUpdateOnly = arg.value.value;
          }
          if (arg.keyword === 'catalogId' && arg.value.kind === 'string') {
            catalogId = arg.value.value;
          }
        }
      } else if (stmt.expr.name === 'deleteSurface') {
        const firstArg = stmt.expr.args[0]?.value;
        if (firstArg?.kind === 'string') {
          deleteSurfaceId = firstArg.value;
        }
      }
    } else if (stmt.kind === 'pathAssign') {
      const compiledVal = compileValueExpr(stmt.expr);
      standaloneDataUpdates.push({ path: stmt.path, value: compiledVal });
      setNestedPointerValue(dataModel, stmt.path, compiledVal);
    } else if (stmt.kind === 'varAssign' && stmt.expr.kind === 'call') {
      const targetId = varNameToComponentId.get(stmt.name) ?? stmt.name;
      compileComponentConstructor(targetId, stmt.expr.name, stmt.expr.args);
    }
  }

  const envelopes: A2UIv1Message[] = [];

  if (deleteSurfaceId) {
    envelopes.push({
      version: A2UI_VERSION,
      deleteSurface: { surfaceId: deleteSurfaceId },
    });
  } else if (components.length === 0 && standaloneDataUpdates.length > 0) {
    for (const upd of standaloneDataUpdates) {
      envelopes.push({
        version: A2UI_VERSION,
        updateDataModel: {
          surfaceId,
          path: upd.path,
          value: upd.value,
        },
      });
    }
  } else {
    const emitProgressive = options.emitProgressiveEnvelopes ?? true;
    if (!isUpdateOnly) {
      if (emitProgressive) {
        envelopes.push({
          version: A2UI_VERSION,
          createSurface: {
            surfaceId,
            catalogId,
            sendDataModel,
          },
        });
        envelopes.push({
          version: A2UI_VERSION,
          updateComponents: {
            surfaceId,
            components,
          },
        });
        if (Object.keys(dataModel).length > 0) {
          envelopes.push({
            version: A2UI_VERSION,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: dataModel,
            },
          });
        }
      } else {
        envelopes.push({
          version: A2UI_VERSION,
          createSurface: {
            surfaceId,
            catalogId,
            sendDataModel,
            components,
            ...(Object.keys(dataModel).length > 0 ? { dataModel } : {}),
          },
        });
      }
    } else {
      envelopes.push({
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId,
          components,
        },
      });
      if (Object.keys(dataModel).length > 0) {
        envelopes.push({
          version: A2UI_VERSION,
          updateDataModel: {
            surfaceId,
            path: '/',
            value: dataModel,
          },
        });
      }
    }
  }

  const decompiledDsl = decompileA2UIToExpress(envelopes);
  const jsonString = JSON.stringify(envelopes, null, 2);
  const expressWrapped = `<a2ui>\n${cleanDsl}\n</a2ui>`;
  const expressCharCount = expressWrapped.length;
  const jsonCharCount = jsonString.length;
  const estimatedExpressTokens = Math.max(1, Math.round(expressCharCount / 3.8));
  const estimatedJsonTokens = Math.max(1, Math.round(jsonCharCount / 3.8));
  const tokenSavingsPercent =
    estimatedJsonTokens > 0
      ? Math.max(
          0,
          Math.round(
            ((estimatedJsonTokens - estimatedExpressTokens) /
              estimatedJsonTokens) *
              100
          )
        )
      : 0;

  return {
    envelopes,
    surfaceId,
    catalogId,
    expressDsl: expressWrapped,
    decompiledDsl,
    metrics: {
      expressCharCount,
      jsonCharCount,
      estimatedExpressTokens,
      estimatedJsonTokens,
      tokenSavingsPercent,
      componentCount: components.length,
      dataBindingCount,
      checkRuleCount,
    },
  };
}

// ============================================================================
// Lossless Round-Trip A2UI v1.0 -> Express Decompiler
// (Includes fix for `@a2ui/agent@0.0.1` hyphenated component ID crash!)
// ============================================================================

const VALID_EXPRESS_IDENT_RE = /^[\p{L}_][\p{L}\p{N}_]*$/u;

function deriveSafeVariableName(
  rawId: string,
  usedVars: Set<string>
): { varName: string; needsExplicitId: boolean } {
  if (VALID_EXPRESS_IDENT_RE.test(rawId) && !usedVars.has(rawId)) {
    usedVars.add(rawId);
    return { varName: rawId, needsExplicitId: false };
  }

  let sanitized = rawId.replace(/[^\p{L}\p{N}_]/gu, '_');
  if (!sanitized || /^[0-9]/.test(sanitized)) {
    sanitized = `comp_${sanitized}`;
  }
  let candidate = sanitized;
  let suffix = 2;
  while (usedVars.has(candidate)) {
    candidate = `${sanitized}_${suffix++}`;
  }
  usedVars.add(candidate);
  return {
    varName: candidate,
    needsExplicitId: candidate !== rawId,
  };
}

function formatExpressValue(
  val: unknown,
  idToVarName: Map<string, string>,
  isComponentRefProp = false
): string {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'string') {
    if (isComponentRefProp && idToVarName.has(val)) {
      return idToVarName.get(val)!;
    }
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return `[${val
      .map((item) => formatExpressValue(item, idToVarName, isComponentRefProp))
      .join(', ')}]`;
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (typeof obj['@path'] === 'string') {
      const p = obj['@path'];
      return p.startsWith('/') ? `$${p}` : `$${p}`;
    }
    if (
      typeof obj.componentId === 'string' &&
      typeof obj.path === 'string' &&
      Object.keys(obj).length === 2
    ) {
      const refVar = idToVarName.get(obj.componentId) ?? obj.componentId;
      return `_template($${obj.path}, ${refVar})`;
    }
    if (obj.event && typeof obj.event === 'object') {
      const ev = obj.event as Record<string, unknown>;
      const evName = JSON.stringify(String(ev.name ?? 'action'));
      if (ev.context && typeof ev.context === 'object') {
        return `Event(${evName}, ${formatExpressValue(ev.context, idToVarName, false)})`;
      }
      return `Event(${evName})`;
    }
    if (obj.functionCall && typeof obj.functionCall === 'object') {
      return formatExpressValue(obj.functionCall, idToVarName, false);
    }
    if (typeof obj['@call'] === 'string') {
      const fnName = obj['@call'];
      const args = (obj.args as Record<string, unknown>) ?? {};
      const argPairs = Object.entries(args).map(
        ([k, v]) => `${k}=${formatExpressValue(v, idToVarName, false)}`
      );
      return `${fnName}(${argPairs.join(', ')})`;
    }
    if (obj.condition && typeof obj.condition === 'object') {
      const cond = obj.condition as Record<string, unknown>;
      const fnName = typeof cond['@call'] === 'string' ? cond['@call'] : 'required';
      const rawArgs = (cond.args as Record<string, unknown>) ?? {};
      const extraArgs = Object.entries(rawArgs)
        .filter(([k]) => k !== 'value')
        .map(([, v]) => formatExpressValue(v, idToVarName, false));
      if (typeof obj.message === 'string') {
        extraArgs.push(JSON.stringify(obj.message));
      }
      return `?${fnName}(${extraArgs.join(', ')})`;
    }

    const entries = Object.entries(obj).map(([k, v]) => {
      const safeKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)
        ? k
        : JSON.stringify(k);
      return `${safeKey}: ${formatExpressValue(v, idToVarName, false)}`;
    });
    return `{${entries.join(', ')}}`;
  }
  return JSON.stringify(val);
}

/**
 * Decompiles A2UI v1.0 `A2UIv1Message[]` envelopes back into canonical
 * `<a2ui>...</a2ui>` A2UI Express DSL syntax.
 *
 * Implements the `specification/proposals/express/a2ui_express.md` rule for
 * non-identifier component IDs (e.g. `"content-grid"` -> `content_grid = Row(..., id="content-grid")`)
 * which crashes in `@a2ui/agent@0.0.1`.
 */
export function decompileA2UIToExpress(envelopes: A2UIv1Message[]): string {
  const lines: string[] = [];
  let surfaceEmitted = false;
  const allComponents: A2UIComponentBase[] = [];
  let mergedDataModel: Record<string, unknown> = {};

  for (const env of envelopes) {
    if ('createSurface' in env && env.createSurface) {
      const cs = env.createSurface;
      const sendFlag =
        cs.sendDataModel ? ', sendDataModel=true' : '';
      lines.push(`surface(${JSON.stringify(cs.surfaceId)}${sendFlag})`);
      surfaceEmitted = true;
      if (Array.isArray(cs.components)) {
        allComponents.push(...cs.components);
      }
      if (cs.dataModel && typeof cs.dataModel === 'object') {
        mergedDataModel = { ...mergedDataModel, ...cs.dataModel };
      }
    } else if ('updateComponents' in env && env.updateComponents) {
      if (!surfaceEmitted) {
        lines.push(
          `surface(${JSON.stringify(env.updateComponents.surfaceId)}, update=true)`
        );
        surfaceEmitted = true;
      }
      allComponents.push(...env.updateComponents.components);
    } else if ('updateDataModel' in env && env.updateDataModel) {
      const udm = env.updateDataModel;
      if ((!udm.path || udm.path === '/') && typeof udm.value === 'object' && udm.value !== null) {
        mergedDataModel = {
          ...mergedDataModel,
          ...(udm.value as Record<string, unknown>),
        };
      } else if (udm.path) {
        setNestedPointerValue(mergedDataModel, udm.path, udm.value);
      }
    } else if ('deleteSurface' in env && env.deleteSurface) {
      lines.push(`deleteSurface(${JSON.stringify(env.deleteSurface.surfaceId)})`);
    }
  }

  for (const [key, val] of Object.entries(mergedDataModel)) {
    lines.push(`$/${key} = ${formatExpressValue(val, new Map(), false)}`);
  }

  const usedVars = new Set<string>();
  const idToVarMap = new Map<string, { varName: string; needsExplicitId: boolean }>();

  for (const comp of allComponents) {
    idToVarMap.set(comp.id, deriveSafeVariableName(comp.id, usedVars));
  }

  const idToVarNameOnly = new Map<string, string>();
  for (const [id, info] of idToVarMap.entries()) {
    idToVarNameOnly.set(id, info.varName);
  }

  const refProps = new Set(['child', 'children', 'trigger', 'content']);

  for (const comp of allComponents) {
    const info = idToVarMap.get(comp.id) ?? {
      varName: comp.id,
      needsExplicitId: false,
    };
    const sig = EXPRESS_COMPONENT_SIGNATURES[comp.component] ?? [];
    const argStrings: string[] = [];

    // Emit positional args up to the last present positional parameter
    let lastPresentPosIdx = -1;
    for (let i = 0; i < sig.length; i++) {
      if (comp[sig[i]] !== undefined) {
        lastPresentPosIdx = i;
      }
    }

    for (let i = 0; i <= lastPresentPosIdx; i++) {
      const propName = sig[i];
      const propVal = comp[propName];
      if (propVal === undefined) {
        argStrings.push('_');
      } else {
        argStrings.push(
          formatExpressValue(propVal, idToVarNameOnly, refProps.has(propName))
        );
      }
    }

    // Emit any remaining non-positional keyword properties
    const sigSet = new Set(sig);
    for (const [k, v] of Object.entries(comp)) {
      if (k === 'id' || k === 'component' || sigSet.has(k) || v === undefined) {
        continue;
      }
      argStrings.push(
        `${k}=${formatExpressValue(v, idToVarNameOnly, refProps.has(k))}`
      );
    }

    if (info.needsExplicitId) {
      argStrings.push(`id=${JSON.stringify(comp.id)}`);
    }

    lines.push(`${info.varName} = ${comp.component}(${argStrings.join(', ')})`);
  }

  return `<a2ui>\n${lines.join('\n')}\n</a2ui>`;
}

/**
 * Generates the A2UI v1.0 Express System Prompt instructions for Gemini,
 * including both the Basic Catalog and FreshCart's Custom Grocery Catalog signatures.
 */
export function generateExpressSystemPrompt(
  targetSurfaceId = 'express_shopper_surface'
): string {
  const sigLines = Object.entries(EXPRESS_COMPONENT_SIGNATURES)
    .map(([comp, params]) => `- ${comp}(${params.join(', ')})`)
    .join('\n');

  return `You are the FreshCart AI Personal Shopper speaking native A2UI v1.0 Express DSL.
First write a warm 1-sentence natural-language summary for the shopper, then output the interactive UI inside a single <a2ui>...</a2ui> block.

A2UI v1.0 Express DSL Rules:
1. Start with: surface("${targetSurfaceId}", sendDataModel=true)
2. Assign initial data model paths with $/path = value (e.g. $/servings = 2, $/zipCode = "94107").
3. Define the root layout as root = Column([...], "start", "stretch").
4. Component positional signatures (use _ to skip optional positional arguments, or pass keyword=value):
${sigLines}
5. Data bindings use $/path (e.g. $/servings). Event actions use Event("add_recipe_bundle_to_cart", {recipeTitle: $/recipeTitle, servings: $/servings, items: $/ingredients}).
6. Validation checks use ?required("Message") or ?regex(r"^[0-9]{5}$", "Message").
7. Keep all user-visible text warm, appetizing, and consumer-friendly (never show protocol jargon in visible strings).`;
}
