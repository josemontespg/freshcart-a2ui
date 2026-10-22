export const A2UI_VERSION = 'v1.0' as const;

export const A2UI_BASIC_CATALOG_ID =
  'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json' as const;

export const FRESHCART_GROCERY_CATALOG_ID =
  'https://freshcart.app/catalogs/grocery/v1/catalog.json' as const;

/**
 * A2UI v1.0 DataBinding uses the reserved `@path` key pointing to a
 * JSON Pointer (RFC 6901) path in the surface DataModel (or relative path
 * inside a ChildList template scope).
 */
export interface A2UIDataBinding {
  '@path': string;
}

/**
 * A2UI v1.0 FunctionCall uses the reserved `@call` key.
 * Includes built-in `@index` for Collection Scope template evaluation.
 */
export interface A2UIFunctionCall {
  '@call': string;
  catalogId?: string;
  args?: Record<string, A2UIDynamicValue>;
}

/**
 * A2UI v1.0 Function Execution Policy Metadata (`catalog_definition.json`)
 */
export type A2UIAllowedCallers =
  | 'rendererOnly'
  | 'agentOnly'
  | 'rendererOrAgent';

export type A2UIFunctionReturnType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'validationResult'
  | 'any'
  | 'void';

export interface A2UICatalogFunctionMetadata {
  name: string;
  catalogId: string;
  executionTarget: 'client' | 'server';
  returnType: A2UIFunctionReturnType;
  allowedCallers: A2UIAllowedCallers;
  requiresUserActivation: boolean;
  description: string;
}

export type A2UIDynamicValue =
  | string
  | number
  | boolean
  | null
  | A2UIDynamicValue[]
  | { [key: string]: A2UIDynamicValue }
  | A2UIDataBinding
  | A2UIFunctionCall;

export type A2UIDynamicString = string | A2UIDataBinding | A2UIFunctionCall;
export type A2UIDynamicNumber = number | A2UIDataBinding | A2UIFunctionCall;
export type A2UIDynamicBoolean = boolean | A2UIDataBinding | A2UIFunctionCall;
export type A2UIDynamicStringList =
  | string[]
  | A2UIDataBinding
  | A2UIFunctionCall;

export interface A2UIAccessibilityAttributes {
  label?: A2UIDynamicString;
  description?: A2UIDynamicString;
  live?: 'off' | 'polite' | 'assertive';
  hidden?: A2UIDynamicBoolean;
}

export interface A2UIValidationResult {
  valid: boolean;
  code?: string;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface A2UICheckRule {
  condition: A2UIDataBinding | A2UIFunctionCall;
  message?: string;
}

export interface A2UIChildListTemplate {
  componentId: string;
  path: string; // Note: ChildList template keeps unprefixed `path` in v1.0
}

export type A2UIChildList = string[] | A2UIChildListTemplate;

export interface A2UIEventAction {
  event: {
    name: string;
    userMessage?: A2UIDynamicString;
    context?: Record<string, A2UIDynamicValue>;
  };
}

export interface A2UIFunctionAction {
  functionCall: A2UIFunctionCall;
}

export type A2UIAction = A2UIEventAction | A2UIFunctionAction;

export type A2UIBasicComponentType =
  | 'Text'
  | 'Image'
  | 'Icon'
  | 'Video'
  | 'AudioPlayer'
  | 'Row'
  | 'Column'
  | 'List'
  | 'Card'
  | 'Tabs'
  | 'Modal'
  | 'Divider'
  | 'Button'
  | 'TextField'
  | 'CheckBox'
  | 'ChoicePicker'
  | 'Slider'
  | 'DateTimeInput';

export type A2UIGroceryComponentType = 'ProductDealCard' | 'NutritionSummary';

export type A2UIComponentType =
  | A2UIBasicComponentType
  | A2UIGroceryComponentType;

export interface A2UIComponentBase {
  id: string;
  component: A2UIComponentType | string;
  catalogId?: string;
  weight?: number;
  accessibility?: A2UIAccessibilityAttributes;
  checks?: A2UICheckRule[];
  metadata?: {
    extensions?: Record<string, unknown>;
  };
  [prop: string]: unknown;
}

/**
 * Agent-to-Renderer v1.0 Envelope Messages (`agent_to_renderer.json`)
 */
export interface A2UICreateSurfaceMessage {
  version: 'v1.0';
  createSurface: {
    surfaceId: string;
    catalogId?: string;
    sendDataModel?: boolean;
    components?: A2UIComponentBase[];
    dataModel?: Record<string, unknown>;
    metadata?: {
      extensions?: Record<string, unknown>;
    };
  };
}

export interface A2UIUpdateComponentsMessage {
  version: 'v1.0';
  updateComponents: {
    surfaceId: string;
    components: A2UIComponentBase[];
  };
}

export interface A2UIUpdateDataModelMessage {
  version: 'v1.0';
  updateDataModel: {
    surfaceId: string;
    path?: string; // JSON Pointer path; omitted or "/" replaces root object
    value: unknown; // Required in v1.0; explicit `null` deletes the key at `path`
  };
}

export interface A2UIDeleteSurfaceMessage {
  version: 'v1.0';
  deleteSurface: {
    surfaceId: string;
  };
}

export interface A2UICallRendererFunctionMessage {
  version: 'v1.0';
  callRendererFunction: {
    surfaceId?: string;
    functionCallId: string;
    callFunction: A2UIFunctionCall & { catalogId: string };
  };
}

export interface A2UIFunctionResponsePayload {
  functionCallId: string;
  value?: unknown;
  error?: {
    code: string;
    message: string;
  };
}

export interface A2UIAgentFunctionResponseMessage {
  version: 'v1.0';
  agentFunctionResponse: A2UIFunctionResponsePayload;
}

export type A2UIv1Message =
  | A2UICreateSurfaceMessage
  | A2UIUpdateComponentsMessage
  | A2UIUpdateDataModelMessage
  | A2UIDeleteSurfaceMessage
  | A2UICallRendererFunctionMessage
  | A2UIAgentFunctionResponseMessage;

/**
 * Renderer-to-Agent v1.0 Outbound Event & RPC Envelopes (`renderer_to_agent.json`)
 */
export interface A2UIActionEvent {
  version: 'v1.0';
  action: {
    name: string;
    userMessage?: string;
    surfaceId: string;
    sourceComponentId: string;
    timestamp: string; // ISO 8601
    context: Record<string, unknown>;
    metadata?: {
      extensions?: Record<string, unknown>;
    };
  };
}

export interface A2UICallAgentFunctionMessage {
  version: 'v1.0';
  callAgentFunction: {
    surfaceId: string;
    functionCallId: string;
    callFunction: A2UIFunctionCall;
  };
}

export interface A2UIRendererFunctionResponseMessage {
  version: 'v1.0';
  rendererFunctionResponse: A2UIFunctionResponsePayload;
}

export interface A2UIRendererErrorEvent {
  version: 'v1.0';
  error: {
    code:
      | 'VALIDATION_FAILED'
      | 'UNALLOWED_PARENT'
      | 'UNALLOWED_CHILD'
      | 'INVALID_FUNCTION_CALL'
      | string;
    surfaceId?: string;
    functionCallId?: string;
    path?: string;
    message: string;
  };
}

export type A2UIRendererToAgentMessage =
  | A2UIActionEvent
  | A2UICallAgentFunctionMessage
  | A2UIRendererFunctionResponseMessage
  | A2UIRendererErrorEvent;

export interface A2UISurfaceState {
  surfaceId: string;
  catalogId: string;
  sendDataModel: boolean;
  componentsById: Record<string, A2UIComponentBase>;
  dataModel: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type A2UIMessageDirection = 'agent_to_renderer' | 'renderer_to_agent';

export type A2UIEnvelopeKind =
  | 'createSurface'
  | 'updateComponents'
  | 'updateDataModel'
  | 'deleteSurface'
  | 'callRendererFunction'
  | 'agentFunctionResponse'
  | 'callAgentFunction'
  | 'action'
  | 'rendererFunctionResponse'
  | 'error';

export interface A2UIProtocolLogEntry {
  id: string;
  seq: number;
  timestamp: string;
  direction: A2UIMessageDirection;
  kind: A2UIEnvelopeKind;
  surfaceId?: string;
  sourceLabel?: string;
  payload:
    | A2UIv1Message
    | A2UIRendererToAgentMessage
    | Record<string, unknown>;
  /** Snapshot of the target surface state immediately after this message was applied */
  surfaceSnapshotAfter?: A2UISurfaceState | null;
}

export interface A2UISurfaceManagerState {
  surfaces: Record<string, A2UISurfaceState>;
  log: A2UIProtocolLogEntry[];
  outboundResponses: Array<
    | A2UIRendererErrorEvent
    | A2UIRendererFunctionResponseMessage
    | A2UICallAgentFunctionMessage
  >;
}

export interface A2UILinterDiagnostic {
  severity: 'error' | 'warning' | 'info';
  code: string;
  path: string;
  message: string;
  suggestion?: string;
}
