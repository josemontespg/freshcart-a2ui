import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownUp,
  Code2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Wrench,
} from 'lucide-react';
import {
  evaluateFunctionCall,
  getValueAtPointer,
  resolveDynamicNumber,
  resolveDynamicString,
} from '../DataModelBinder';
import {
  type A2UIRenderNodeContext,
  ValidationFeedbackList,
} from './basicCatalogRenderer';

const PROXY_READY_NOTIFICATION = 'ui/notifications/sandbox-proxy-ready';
const RESOURCE_READY_NOTIFICATION = 'ui/notifications/sandbox-resource-ready';

export const MAX_PAYLOAD_NESTING_DEPTH = 10;
export const MAX_PAYLOAD_SIZE_BYTES = 64 * 1024;
export const FORBIDDEN_PROTOTYPE_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

export interface PayloadValidationResult {
  valid: boolean;
  reason?: string;
}

function validatePayloadStructure(
  value: unknown,
  maxDepth = MAX_PAYLOAD_NESTING_DEPTH,
  currentDepth = 0
): PayloadValidationResult {
  if (currentDepth > maxDepth) {
    return {
      valid: false,
      reason: `Exceeded maximum allowed nesting depth of ${maxDepth} levels`,
    };
  }
  if (value === null || typeof value !== 'object') {
    return { valid: true };
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const res = validatePayloadStructure(item, maxDepth, currentDepth + 1);
      if (!res.valid) return res;
    }
    return { valid: true };
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(record)) {
    if (FORBIDDEN_PROTOTYPE_KEYS.has(key)) {
      return {
        valid: false,
        reason: `Detected forbidden prototype pollution property key: "${key}"`,
      };
    }
    const res = validatePayloadStructure(
      record[key],
      maxDepth,
      currentDepth + 1
    );
    if (!res.valid) return res;
  }
  return { valid: true };
}

export function validateMcpBridgePayload(
  rawMessage: unknown
): PayloadValidationResult {
  if (rawMessage === null || rawMessage === undefined) {
    return { valid: true };
  }
  let serialized: string;
  try {
    serialized = JSON.stringify(rawMessage);
  } catch {
    return {
      valid: false,
      reason: 'Failed to serialize message payload for size inspection',
    };
  }
  if (serialized && serialized.length > MAX_PAYLOAD_SIZE_BYTES) {
    return {
      valid: false,
      reason: `Message payload exceeds maximum allowed size of ${MAX_PAYLOAD_SIZE_BYTES} bytes (${serialized.length} bytes)`,
    };
  }
  return validatePayloadStructure(rawMessage);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null ||
    Array.isArray(a) !== Array.isArray(b)
  ) {
    return false;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((it, idx) => deepEqual(it, b[idx]));
  }
  const recA = a as Record<string, unknown>;
  const recB = b as Record<string, unknown>;
  const keysA = Object.keys(recA).filter((k) => recA[k] !== undefined);
  const keysB = Object.keys(recB).filter((k) => recB[k] !== undefined);
  return (
    keysA.length === keysB.length &&
    keysA.every((k) => k in recB && deepEqual(recA[k], recB[k]))
  );
}

function resolveBoundPointerPath(basePath: string, subpath?: string): string {
  if (!subpath) return basePath;
  const cleanSub = subpath.startsWith('/') ? subpath : `/${subpath}`;
  return basePath === '/' ? cleanSub : `${basePath}${cleanSub}`;
}

export interface McpBridgePacketLog {
  id: string;
  timestamp: string;
  direction: 'app_to_host' | 'host_to_app' | 'security_blocked';
  method: string;
  summary: string;
  payload: unknown;
}

/**
 * A2UI v1.0 `McpApp` Component Renderer (`https://a2ui.org/specification/v1_0/catalogs/mcp/catalog.json`)
 *
 * Renders an untrusted Model Context Protocol (MCP) HTML application inside A2UI's
 * Double-Iframe Sandbox (`/a2ui-sandbox/sandbox.html` -> inner opaque-origin `srcdoc` iframe)
 * and connects it to the A2UI v1.0 surface via the JSON-RPC 2.0 AppBridge protocol.
 */
const A2UIMcpAppComponent: React.FC<{ ctx: A2UIRenderNodeContext }> = ({
  ctx,
}) => {
  const {
    component,
    evalContext,
    validationState,
    dispatchAction,
    updateDataModelPath,
  } = ctx;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [proxyReady, setProxyReady] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  const [frameHeight, setFrameHeight] = useState<number>(() => {
    const initialH = resolveDynamicNumber(component.height, evalContext, 480);
    return Math.max(240, Math.min(2000, initialH));
  });
  const [showBridgeInspector, setShowBridgeInspector] = useState(true);
  const [packetLogs, setPacketLogs] = useState<McpBridgePacketLog[]>([]);
  const [securityStats, setSecurityStats] = useState({
    blockedCalls: 0,
    syncedUpdates: 0,
    executedTools: 0,
    executedFunctions: 0,
  });

  // Track echo suppression write lock and last-sent values per bound key
  const applyingFrameChangeRef = useRef(false);
  const lastSentValuesRef = useRef<Map<string, unknown>>(new Map());
  const lastResizeTimeRef = useRef<number>(0);
  const logSeqRef = useRef(0);

  const rawHtmlContent = resolveDynamicString(
    component.htmlContent ?? component.content,
    evalContext,
    ''
  );
  const decodedHtml = rawHtmlContent.startsWith('url_encoded:')
    ? decodeURIComponent(rawHtmlContent.slice('url_encoded:'.length))
    : rawHtmlContent;

  const title = resolveDynamicString(
    component.title,
    evalContext,
    'FreshCart Sandboxed MCP App'
  );

  const allowedTools: string[] = Array.isArray(component.allowedTools)
    ? component.allowedTools.filter((t): t is string => typeof t === 'string')
    : [];

  const allowedFunctions: Record<string, Record<string, unknown>> =
    component.allowedFunctions &&
    typeof component.allowedFunctions === 'object' &&
    !Array.isArray(component.allowedFunctions)
      ? (component.allowedFunctions as Record<string, Record<string, unknown>>)
      : {};

  const dataPaths: Record<string, string> =
    component.data &&
    typeof component.data === 'object' &&
    !Array.isArray(component.data) &&
    (component.data as { paths?: unknown }).paths &&
    typeof (component.data as { paths?: unknown }).paths === 'object'
      ? ((component.data as { paths: Record<string, string> }).paths ?? {})
      : {};

  const appendPacketLog = useCallback(
    (
      direction: McpBridgePacketLog['direction'],
      method: string,
      summary: string,
      payload: unknown
    ) => {
      logSeqRef.current += 1;
      const entry: McpBridgePacketLog = {
        id: `mcp_pkt_${logSeqRef.current}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        direction,
        method,
        summary,
        payload,
      };
      setPacketLogs((prev) => [entry, ...prev.slice(0, 19)]);
    },
    []
  );

  const postToSandbox = useCallback(
    (message: Record<string, unknown>, summaryLabel?: string) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      win.postMessage(message, window.location.origin);
      const method = String(message.method ?? message.type ?? 'jsonrpc.reply');
      if (summaryLabel) {
        appendPacketLog('host_to_app', method, summaryLabel, message);
      }
    },
    [appendPacketLog]
  );

  // Push current bound data.paths values to the embedded app
  const pushAllBoundPathsToApp = useCallback(() => {
    for (const [key, pointerPath] of Object.entries(dataPaths)) {
      const val = getValueAtPointer(evalContext.rootDataModel, pointerPath);
      lastSentValuesRef.current.set(
        key,
        val !== undefined ? structuredClone(val) : undefined
      );

      if (key === 'toolInput') {
        postToSandbox(
          {
            jsonrpc: '2.0',
            method: 'ui/notifications/tool-input',
            params: { arguments: val },
          },
          `Deliver initial toolInput from ${pointerPath}`
        );
      } else if (key === 'toolResult') {
        postToSandbox(
          {
            jsonrpc: '2.0',
            method: 'ui/notifications/tool-result',
            params: {
              content: [{ type: 'text', text: JSON.stringify(val) }],
              structuredContent: val,
            },
          },
          `Deliver toolResult from ${pointerPath}`
        );
      } else {
        postToSandbox(
          {
            jsonrpc: '2.0',
            method: 'ui/notifications/data-model-update',
            params: { key, value: val },
          },
          `Sync ${key} <- ${pointerPath}`
        );
      }
    }
  }, [dataPaths, evalContext.rootDataModel, postToSandbox]);

  // Watch for changes in the host A2UI Surface DataModel and push diffs to the iframe
  useEffect(() => {
    if (!appInitialized || applyingFrameChangeRef.current) return;

    for (const [key, pointerPath] of Object.entries(dataPaths)) {
      const currentVal = getValueAtPointer(
        evalContext.rootDataModel,
        pointerPath
      );
      const prevVal = lastSentValuesRef.current.get(key);

      if (!deepEqual(currentVal, prevVal)) {
        lastSentValuesRef.current.set(
          key,
          currentVal !== undefined ? structuredClone(currentVal) : undefined
        );

        if (key === 'toolInput') {
          postToSandbox(
            {
              jsonrpc: '2.0',
              method: 'ui/notifications/tool-input',
              params: { arguments: currentVal },
            },
            `Host updated toolInput (${pointerPath})`
          );
        } else if (key === 'toolResult') {
          postToSandbox(
            {
              jsonrpc: '2.0',
              method: 'ui/notifications/tool-result',
              params: {
                content: [{ type: 'text', text: JSON.stringify(currentVal) }],
                structuredContent: currentVal,
              },
            },
            `Host updated toolResult (${pointerPath})`
          );
        } else {
          postToSandbox(
            {
              jsonrpc: '2.0',
              method: 'ui/notifications/data-model-update',
              params: { key, value: currentVal },
            },
            `Host -> App data-model-update (${key})`
          );
        }
        setSecurityStats((s) => ({ ...s, syncedUpdates: s.syncedUpdates + 1 }));
      }
    }
  }, [
    appInitialized,
    dataPaths,
    evalContext.rootDataModel,
    postToSandbox,
  ]);

  // Send `ui/notifications/sandbox-resource-ready` once proxy is ready
  useEffect(() => {
    if (!proxyReady || !decodedHtml) return;
    postToSandbox(
      {
        jsonrpc: '2.0',
        method: RESOURCE_READY_NOTIFICATION,
        params: {
          html: decodedHtml,
          sandbox: 'allow-scripts allow-forms allow-modals',
          permissions: component.permissions ?? {},
          csp: component.csp ?? {},
        },
      },
      'Inject HTML + strict CSP into inner opaque iframe'
    );
  }, [
    component.csp,
    component.permissions,
    decodedHtml,
    postToSandbox,
    proxyReady,
  ]);

  // Listen for JSON-RPC 2.0 messages from the outer sandbox proxy
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      const frameWin = iframeRef.current?.contentWindow;
      if (!frameWin || event.source !== frameWin) return;
      if (event.origin !== window.location.origin) return;

      const rawData = event.data;
      if (!rawData || typeof rawData !== 'object') return;

      // 1. Check structural payload guardrails (Prototype Pollution, Nesting > 10, Size > 64KB)
      const safetyCheck = validateMcpBridgePayload(rawData);
      if (!safetyCheck.valid) {
        setSecurityStats((s) => ({ ...s, blockedCalls: s.blockedCalls + 1 }));
        appendPacketLog(
          'security_blocked',
          'payload_validation_rejected',
          safetyCheck.reason ?? 'Rejected unsafe payload',
          rawData
        );
        return;
      }

      const msg = rawData as Record<string, unknown>;
      const method = typeof msg.method === 'string' ? msg.method : '';
      const rpcId = msg.id;
      const params =
        msg.params && typeof msg.params === 'object'
          ? (msg.params as Record<string, unknown>)
          : {};

      // Phase A1: Sandbox Proxy Ready
      if (method === PROXY_READY_NOTIFICATION) {
        setProxyReady(true);
        appendPacketLog(
          'app_to_host',
          PROXY_READY_NOTIFICATION,
          'Outer sandbox proxy frame initialized',
          msg
        );
        return;
      }

      // Ignore legacy flat A2uiSandboxMessageType duplicate notification
      if (msg.type === 'a2ui_sandbox_proxy_ready') {
        return;
      }

      // Phase B1: MCP App `ui/initialize` Handshake Request
      if (method === 'ui/initialize') {
        appendPacketLog(
          'app_to_host',
          'ui/initialize',
          'Inner MCP App requested capability negotiation',
          msg
        );
        const rect = iframeRef.current?.getBoundingClientRect();
        postToSandbox(
          {
            jsonrpc: '2.0',
            id: rpcId,
            result: {
              protocolVersion: '2026-01-26',
              hostInfo: {
                name: 'FreshCart A2UI v1.0 Host Client',
                version: '1.0.0',
              },
              capabilities: {
                tools: { call: true },
                a2ui: {
                  version: 'v1.0',
                  dataModelSync: true,
                  localFunctionCall: true,
                },
              },
              hostContext: {
                theme: 'light',
                displayMode: 'inline',
                containerDimensions: {
                  width: Math.round(rect?.width ?? 440),
                  height: frameHeight,
                },
              },
            },
          },
          'Accepted ui/initialize handshake (v1.0 capabilities)'
        );
        return;
      }

      // Phase B2: MCP App `ui/notifications/initialized`
      if (method === 'ui/notifications/initialized') {
        setAppInitialized(true);
        appendPacketLog(
          'app_to_host',
          'ui/notifications/initialized',
          'Inner MCP App bridge active (opaque origin)',
          msg
        );
        pushAllBoundPathsToApp();
        return;
      }

      // Outgoing A: `tools/call` (MCP Tool Execution & A2UI Action Dispatch)
      if (method === 'tools/call') {
        const toolName = typeof params.name === 'string' ? params.name : '';
        const toolArgs =
          params.arguments && typeof params.arguments === 'object'
            ? (params.arguments as Record<string, unknown>)
            : {};

        if (!allowedTools.includes(toolName)) {
          setSecurityStats((s) => ({ ...s, blockedCalls: s.blockedCalls + 1 }));
          appendPacketLog(
            'security_blocked',
            `tools/call (${toolName})`,
            `Blocked unauthorized tool "${toolName}" (not in allowedTools)`,
            msg
          );
          if (rpcId !== undefined) {
            postToSandbox(
              {
                jsonrpc: '2.0',
                id: rpcId,
                error: {
                  code: -32601,
                  message: `MCP Security Policy: Tool "${toolName}" is not in allowedTools [${allowedTools.join(', ')}]`,
                },
              },
              `Rejected tools/call "${toolName}" (-32601)`
            );
          }
          return;
        }

        appendPacketLog(
          'app_to_host',
          `tools/call (${toolName})`,
          `Authorized MCP tool -> A2UI Action "${toolName}"`,
          msg
        );
        setSecurityStats((s) => ({ ...s, executedTools: s.executedTools + 1 }));

        // Dispatch as a first-class A2UI v1.0 EventAction on the surface
        dispatchAction(
          component.id,
          {
            event: {
              name: toolName,
              context: toolArgs as Record<string, never>,
            },
          },
          evalContext
        );

        const toolResponsePayload = {
          status: 'ok',
          tool: toolName,
          timestamp: new Date().toISOString(),
          appliedArguments: toolArgs,
        };

        if (rpcId !== undefined) {
          postToSandbox(
            {
              jsonrpc: '2.0',
              id: rpcId,
              result: {
                content: [
                  {
                    type: 'text',
                    text: `Executed ${toolName} via FreshCart A2UI v1.0 Host`,
                  },
                ],
                structuredContent: toolResponsePayload,
                isError: false,
              },
            },
            `Returned CallToolResult for "${toolName}"`
          );
        }
        return;
      }

      // Outgoing B: `ui/notifications/data-model-change` (Two-Way Local Data Binding)
      if (method === 'ui/notifications/data-model-change') {
        const key = typeof params.key === 'string' ? params.key : '';
        const subpath =
          typeof params.subpath === 'string' ? params.subpath : undefined;
        const value = params.value;

        const boundRootPath = dataPaths[key];
        if (!boundRootPath) {
          setSecurityStats((s) => ({ ...s, blockedCalls: s.blockedCalls + 1 }));
          appendPacketLog(
            'security_blocked',
            'ui/notifications/data-model-change',
            `Blocked write to unbound data key "${key}"`,
            msg
          );
          return;
        }

        const targetPointer = resolveBoundPointerPath(boundRootPath, subpath);
        const existingValue = getValueAtPointer(
          evalContext.rootDataModel,
          targetPointer
        );
        if (deepEqual(existingValue, value)) {
          return;
        }

        appendPacketLog(
          'app_to_host',
          'ui/notifications/data-model-change',
          `Write ${targetPointer} = ${JSON.stringify(value)}`,
          msg
        );
        setSecurityStats((s) => ({ ...s, syncedUpdates: s.syncedUpdates + 1 }));

        applyingFrameChangeRef.current = true;
        try {
          updateDataModelPath(targetPointer, value);
        } finally {
          setTimeout(() => {
            applyingFrameChangeRef.current = false;
          }, 0);
        }
        return;
      }

      // Standard MCP `ui/update-model-context` mapped to reserved `modelContext` path
      if (method === 'ui/update-model-context') {
        const modelContextPath = dataPaths['modelContext'];
        if (modelContextPath) {
          const nextContext = params.structuredContent ?? params.content ?? params;
          appendPacketLog(
            'app_to_host',
            'ui/update-model-context',
            `Synced MCP modelContext -> ${modelContextPath}`,
            msg
          );
          updateDataModelPath(modelContextPath, nextContext);
        }
        if (rpcId !== undefined) {
          postToSandbox({
            jsonrpc: '2.0',
            id: rpcId,
            result: { updated: Boolean(modelContextPath) },
          });
        }
        return;
      }

      // Outgoing C: `ui/requests/function-call` (Local Client-Side Function Execution)
      if (method === 'ui/requests/function-call') {
        const fnName = typeof params.call === 'string' ? params.call : '';
        const fnArgs =
          params.args && typeof params.args === 'object'
            ? (params.args as Record<string, unknown>)
            : {};

        if (!(fnName in allowedFunctions)) {
          setSecurityStats((s) => ({ ...s, blockedCalls: s.blockedCalls + 1 }));
          appendPacketLog(
            'security_blocked',
            `ui/requests/function-call (${fnName})`,
            `Blocked unauthorized function "${fnName}" (not in allowedFunctions)`,
            msg
          );
          if (rpcId !== undefined) {
            postToSandbox(
              {
                jsonrpc: '2.0',
                id: rpcId,
                error: {
                  code: -32601,
                  message: `Function "${fnName}" is not listed in allowedFunctions`,
                },
              },
              `Rejected function-call "${fnName}"`
            );
          }
          return;
        }

        try {
          const evaluated = evaluateFunctionCall(
            {
              '@call': fnName,
              args: fnArgs as Record<string, never>,
            },
            evalContext
          );
          setSecurityStats((s) => ({
            ...s,
            executedFunctions: s.executedFunctions + 1,
          }));
          appendPacketLog(
            'app_to_host',
            `ui/requests/function-call (${fnName})`,
            `${fnName}(${JSON.stringify(fnArgs)}) -> ${JSON.stringify(evaluated)}`,
            msg
          );
          if (rpcId !== undefined) {
            postToSandbox(
              {
                jsonrpc: '2.0',
                id: rpcId,
                result: {
                  status: 'success',
                  result: evaluated,
                },
              },
              `Returned result "${String(evaluated)}" for ${fnName}()`
            );
          }
        } catch (err) {
          if (rpcId !== undefined) {
            postToSandbox({
              jsonrpc: '2.0',
              id: rpcId,
              error: {
                code: -32603,
                message:
                  err instanceof Error ? err.message : 'Function call failed',
              },
            });
          }
        }
        return;
      }

      // Outgoing D: `ui/notifications/size-changed` (Clamped 100..2000px, threshold 5px, throttle 100ms)
      if (method === 'ui/notifications/size-changed') {
        const now = Date.now();
        if (now - lastResizeTimeRef.current < 100) return;
        const requestedHeight = Number(params.height);
        if (Number.isFinite(requestedHeight) && requestedHeight > 0) {
          const clamped = Math.max(100, Math.min(2000, requestedHeight));
          setFrameHeight((prev) => {
            if (Math.abs(clamped - prev) < 5) return prev;
            lastResizeTimeRef.current = now;
            return clamped;
          });
        }
        return;
      }

      // Outgoing F: `ui/open-link` (Strict http:/https: scheme check)
      if (method === 'ui/open-link') {
        const rawUrl = typeof params.url === 'string' ? params.url : '';
        let isSafeHttp = false;
        try {
          const parsed = new URL(rawUrl);
          isSafeHttp =
            parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          isSafeHttp = false;
        }
        if (!isSafeHttp) {
          setSecurityStats((s) => ({ ...s, blockedCalls: s.blockedCalls + 1 }));
          appendPacketLog(
            'security_blocked',
            'ui/open-link',
            `Blocked unsafe URL scheme: "${rawUrl}"`,
            msg
          );
          if (rpcId !== undefined) {
            postToSandbox({
              jsonrpc: '2.0',
              id: rpcId,
              error: {
                code: -32602,
                message: 'InvalidParams: Only http: and https: URLs are allowed',
              },
            });
          }
          return;
        }
        window.open(rawUrl, '_blank', 'noopener,noreferrer');
        if (rpcId !== undefined) {
          postToSandbox({
            jsonrpc: '2.0',
            id: rpcId,
            result: { opened: true },
          });
        }
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [
    allowedFunctions,
    allowedTools,
    appendPacketLog,
    component.id,
    dataPaths,
    dispatchAction,
    evalContext,
    frameHeight,
    postToSandbox,
    pushAllBoundPathsToApp,
    updateDataModelPath,
  ]);

  // Interactive Security Audit Trigger: simulate prototype pollution payload check
  const handleSimulatePrototypePollution = () => {
    const maliciousPayload = JSON.parse(
      '{"jsonrpc":"2.0","method":"ui/notifications/data-model-change","params":{"key":"recipeScale","__proto__":{"isAdmin":true}}}'
    );
    const check = validateMcpBridgePayload(maliciousPayload);
    if (!check.valid) {
      setSecurityStats((s) => ({ ...s, blockedCalls: s.blockedCalls + 1 }));
      appendPacketLog(
        'security_blocked',
        '__proto__ Guardrail',
        check.reason ?? 'Blocked prototype pollution',
        maliciousPayload
      );
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-emerald-600/30 bg-white shadow-sm">
      {/* Top Double-Iframe Sandbox Security & Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 px-3.5 py-2.5 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Lock className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight truncate">
                {title}
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                McpApp v1.0
              </span>
            </div>
            <p className="text-[10px] text-stone-300 truncate">
              Double-Iframe Proxy (`/a2ui-sandbox/sandbox.html`) → Inner Opaque
              Origin (`null`)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              appInitialized
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                : proxyReady
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                  : 'bg-stone-700 text-stone-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                appInitialized
                  ? 'bg-emerald-400 animate-pulse'
                  : proxyReady
                    ? 'bg-amber-400'
                    : 'bg-stone-400'
              }`}
            />
            {appInitialized
              ? 'JSON-RPC Bridge Live'
              : proxyReady
                ? 'Proxy Ready'
                : 'Bootstrapping...'}
          </span>

          <button
            type="button"
            onClick={() => setShowBridgeInspector((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-[10px] font-semibold text-stone-100 transition-colors cursor-pointer"
          >
            <Terminal className="h-3 w-3 text-emerald-300" />
            <span>{showBridgeInspector ? 'Hide' : 'Inspect'} Bridge</span>
            <span className="rounded-full bg-emerald-500/30 px-1.5 text-[9px]">
              {packetLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Security Policy Guardrail Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200/70 bg-stone-50 px-3 py-1.5 text-[10px]">
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 font-semibold text-emerald-800">
          <ShieldCheck className="h-3 w-3 text-[#0AAD0A]" />
          allow-same-origin: STRIPPED
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 border border-stone-200/80 px-2 py-0.5 font-medium text-stone-700">
          <Code2 className="h-3 w-3 text-stone-500" />
          CSP: connect-src &apos;none&apos;
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/80 px-2 py-0.5 font-medium text-blue-800">
          <Wrench className="h-3 w-3 text-blue-600" />
          allowedTools: {allowedTools.length}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 border border-purple-200/80 px-2 py-0.5 font-medium text-purple-800">
          <ArrowDownUp className="h-3 w-3 text-purple-600" />
          data.paths: {Object.keys(dataPaths).length}
        </span>
        {securityStats.blockedCalls > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 font-bold text-rose-700">
            <ShieldAlert className="h-3 w-3 text-rose-600" />
            {securityStats.blockedCalls} Blocked
          </span>
        )}
      </div>

      {/* Outer Sandbox Proxy Iframe (`/a2ui-sandbox/sandbox.html?disable_security_self_test=true`) */}
      <div
        className="relative w-full bg-stone-50 transition-[height] duration-200"
        style={{ height: `${frameHeight}px` }}
      >
        <iframe
          ref={iframeRef}
          src="/a2ui-sandbox/sandbox.html?disable_security_self_test=true"
          title={title}
          className="h-full w-full border-0 bg-transparent"
        />
      </div>

      {/* Live JSON-RPC 2.0 AppBridge Wire Inspector */}
      {showBridgeInspector && (
        <div className="border-t border-stone-200 bg-stone-950 p-3 text-stone-200">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-white">
                MCP AppBridge JSON-RPC 2.0 Wire Log
              </span>
              <span className="text-[10px] text-stone-400">
                (Synced: {securityStats.syncedUpdates} · Tools:{' '}
                {securityStats.executedTools} · Fns:{' '}
                {securityStats.executedFunctions} · Blocked:{' '}
                {securityStats.blockedCalls})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSimulatePrototypePollution}
                className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 px-2 py-0.5 text-[10px] font-semibold text-rose-200 transition-colors cursor-pointer"
              >
                <ShieldAlert className="h-3 w-3" />
                Test __proto__ Guardrail
              </button>
              <button
                type="button"
                onClick={() => setPacketLogs([])}
                className="rounded-md bg-stone-800 hover:bg-stone-700 px-2 py-0.5 text-[10px] text-stone-300 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-36 space-y-1 overflow-y-auto font-mono text-[10px]">
            {packetLogs.length === 0 ? (
              <div className="py-2 text-center text-stone-500">
                Waiting for JSON-RPC 2.0 messages over postMessage bridge...
              </div>
            ) : (
              packetLogs.map((pkt) => (
                <div
                  key={pkt.id}
                  className={`flex items-start justify-between gap-2 rounded-md px-2 py-1 ${
                    pkt.direction === 'security_blocked'
                      ? 'bg-rose-950/70 border border-rose-700/50 text-rose-200'
                      : pkt.direction === 'app_to_host'
                        ? 'bg-stone-900/90 text-emerald-300'
                        : 'bg-stone-900/50 text-sky-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 truncate">
                    <span className="mr-1.5 text-stone-500">
                      [{pkt.timestamp}]
                    </span>
                    <span className="mr-1.5 font-bold">
                      {pkt.direction === 'security_blocked'
                        ? '🛡️ BLOCKED'
                        : pkt.direction === 'app_to_host'
                          ? '⬆️ App→Host'
                          : '⬇️ Host→App'}
                    </span>
                    <span className="font-semibold text-white">
                      {pkt.method}
                    </span>
                    <span className="ml-2 text-stone-300">{pkt.summary}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <ValidationFeedbackList validationState={validationState} compact />
    </div>
  );
};

export function renderMcpCatalogComponent(
  ctx: A2UIRenderNodeContext
): React.ReactNode {
  if (ctx.component.component === 'McpApp') {
    return <A2UIMcpAppComponent ctx={ctx} />;
  }
  return null;
}
