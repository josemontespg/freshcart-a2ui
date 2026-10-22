import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Database,
  FileCode,
  Filter,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Send,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import type {
  A2UIMessageDirection,
  A2UIProtocolLogEntry,
  A2UISurfaceState,
  A2UIv1Message,
} from '../../types/a2ui-v1';
import { A2UISurfaceRenderer } from '../A2UISurfaceRenderer';
import { validateA2UIv1Envelope } from '../SurfaceManager';

export interface ProtocolInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Map of all currently active surfaces from SurfaceManager */
  surfaces: Record<string, A2UISurfaceState>;
  /** Currently selected surface ID for inspection */
  activeSurfaceId?: string;
  /** Callback when the user switches the inspected surface */
  onSelectSurface?: (surfaceId: string) => void;
  /** Chronological protocol log entries (agent_to_renderer & renderer_to_agent) */
  protocolLog: A2UIProtocolLogEntry[];
  /** Injects a custom or replayed A2UI v1.0 message into SurfaceManager */
  onInjectMessage: (message: A2UIv1Message, sourceLabel?: string) => void;
  /** Directly mutates a JSON Pointer path in the selected surface's dataModel */
  onEditDataModelPath?: (
    surfaceId: string,
    pointerPath: string,
    value: unknown
  ) => void;
  /** Clears the protocol log history */
  onClearLog?: () => void;
  /** Optional callback to open the Onboarding Findings Report modal */
  onOpenOnboardingReport?: () => void;
}

type InspectorTabId = 'log' | 'replay' | 'editor' | 'datamodel';

/**
 * Flattens a nested DataModel object into top-level and leaf RFC 6901 JSON Pointer entries
 * for quick inspection and live editing.
 */
function flattenDataModelPointers(
  obj: unknown,
  prefix: string = '',
  maxDepth: number = 3
): Array<{ pointer: string; value: unknown }> {
  const results: Array<{ pointer: string; value: unknown }> = [];
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return [{ pointer: prefix || '/', value: obj }];
  }

  const depth = prefix.split('/').filter(Boolean).length;
  if (depth >= maxDepth) {
    return [{ pointer: prefix || '/', value: obj }];
  }

  if (Array.isArray(obj)) {
    results.push({ pointer: prefix || '/', value: `Array(${obj.length})` });
    obj.slice(0, 8).forEach((item, idx) => {
      const childPrefix = `${prefix}/${idx}`;
      if (typeof item === 'object' && item !== null) {
        results.push(...flattenDataModelPointers(item, childPrefix, maxDepth));
      } else {
        results.push({ pointer: childPrefix, value: item });
      }
    });
    return results;
  }

  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const escapedKey = key.replace(/~/g, '~0').replace(/\//g, '~1');
    const childPrefix = `${prefix}/${escapedKey}`;
    if (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      Object.keys(val as Record<string, unknown>).length > 0
    ) {
      results.push(...flattenDataModelPointers(val, childPrefix, maxDepth));
    } else {
      results.push({ pointer: childPrefix, value: val });
    }
  }
  return results;
}

/**
 * Auto-converts common v0.8/v0.9 mistakes (`"path"` -> `"@path"`, `"call"` -> `"@call"`,
 * hyphenated component IDs -> underscore UAX #31 IDs) inside a parsed JSON object.
 */
function autoFixLegacyA2UIJson(node: unknown, parentKey?: string): unknown {
  if (Array.isArray(node)) {
    return node.map((item) => autoFixLegacyA2UIJson(item, parentKey));
  }
  if (typeof node !== 'object' || node === null) {
    return node;
  }

  const rec = node as Record<string, unknown>;
  const keys = Object.keys(rec);

  // 1. Convert v0.9 data binding `{ "path": "/..." }` -> `{ "@path": "/..." }`
  if (keys.length === 1 && keys[0] === 'path' && typeof rec.path === 'string') {
    return { '@path': rec.path };
  }

  // 2. Convert v0.9 function call `{ "call": "...", "args": {...} }` -> `{ "@call": "...", "args": {...} }`
  if (
    'call' in rec &&
    typeof rec.call === 'string' &&
    !('component' in rec)
  ) {
    const fixedArgs = rec.args
      ? autoFixLegacyA2UIJson(rec.args, 'args')
      : undefined;
    return {
      '@call': rec.call,
      ...(fixedArgs !== undefined ? { args: fixedArgs } : {}),
    };
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (k === 'version' && v !== 'v1.0') {
      out[k] = 'v1.0';
    } else if (
      k === 'id' &&
      typeof v === 'string' &&
      'component' in rec &&
      v.includes('-')
    ) {
      out[k] = v.replace(/-/g, '_');
    } else {
      out[k] = autoFixLegacyA2UIJson(v, k);
    }
  }
  return out;
}

export const ProtocolInspectorDrawer: React.FC<
  ProtocolInspectorDrawerProps
> = ({
  isOpen,
  onClose,
  surfaces,
  activeSurfaceId,
  onSelectSurface,
  protocolLog,
  onInjectMessage,
  onEditDataModelPath,
  onClearLog,
  onOpenOnboardingReport,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTabId>('log');
  const [directionFilter, setDirectionFilter] = useState<
    'all' | A2UIMessageDirection
  >('all');
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>(
    {}
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Replay state
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Live JSON editor state
  const surfaceIds = Object.keys(surfaces);
  const selectedSurfaceId =
    activeSurfaceId && surfaces[activeSurfaceId]
      ? activeSurfaceId
      : surfaceIds[0] ?? 'meal-planner-surface';
  const currentSurface = surfaces[selectedSurfaceId] ?? null;

  const defaultEditorPayload = useMemo(
    () =>
      JSON.stringify(
        {
          version: 'v1.0',
          updateDataModel: {
            surfaceId: selectedSurfaceId,
            path: '/lastActionConfirmation',
            value: 'Updated live via A2UI v1.0 Protocol Inspector!',
          },
        },
        null,
        2
      ),
    [selectedSurfaceId]
  );

  const [editorJsonText, setEditorJsonText] =
    useState<string>(defaultEditorPayload);
  const [injectStatusMessage, setInjectStatusMessage] = useState<string | null>(
    null
  );

  // DataModel quick-edit state
  const [editPointerInput, setEditPointerInput] = useState<string>('/servings');
  const [editValueInput, setEditValueInput] = useState<string>('6');

  // Filter log entries
  const filteredLogs = useMemo(() => {
    return protocolLog.filter((entry) => {
      if (directionFilter !== 'all' && entry.direction !== directionFilter) {
        return false;
      }
      return true;
    });
  }, [protocolLog, directionFilter]);

  // Inbound entries with snapshots for step-by-step replay
  const replayableEntries = useMemo(() => {
    return protocolLog.filter(
      (entry) =>
        entry.direction === 'agent_to_renderer' &&
        entry.surfaceSnapshotAfter !== undefined
    );
  }, [protocolLog]);

  useEffect(() => {
    if (replayableEntries.length > 0) {
      setReplayIndex(replayableEntries.length - 1);
    } else {
      setReplayIndex(0);
    }
  }, [replayableEntries.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    if (replayableEntries.length === 0) {
      setIsAutoPlaying(false);
      return;
    }
    const timer = window.setInterval(() => {
      setReplayIndex((prev) => {
        if (prev >= replayableEntries.length - 1) {
          setIsAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, replayableEntries.length]);

  // Validate editor JSON in real time
  const editorValidation = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(editorJsonText);
      const result = validateA2UIv1Envelope(editorJsonText);
      const hasErrors = result.diagnostics.some((d) => d.severity === 'error');
      return {
        parseError: null as string | null,
        isValid: result.parsed !== null && !hasErrors,
        diagnostics: result.diagnostics,
        parsed,
      };
    } catch (err) {
      return {
        parseError:
          err instanceof Error ? err.message : 'Invalid JSON syntax',
        parsed: null as unknown,
        isValid: false,
        diagnostics: [],
      };
    }
  }, [editorJsonText]);

  if (!isOpen) {
    return null;
  }

  const handleCopyJson = (id: string, payload: unknown) => {
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  const handleLoadPreset = (presetType: 'data' | 'component' | 'v09_bug') => {
    if (presetType === 'data') {
      setEditorJsonText(
        JSON.stringify(
          {
            version: 'v1.0',
            updateDataModel: {
              surfaceId: selectedSurfaceId,
              path: '/servings',
              value: 8,
            },
          },
          null,
          2
        )
      );
    } else if (presetType === 'component') {
      setEditorJsonText(
        JSON.stringify(
          {
            version: 'v1.0',
            updateDataModel: {
              surfaceId: selectedSurfaceId,
              path: '/lastActionConfirmation',
              value: 'Live v1.0 packet injected from Inspector!',
            },
          },
          null,
          2
        )
      );
    } else {
      // Intentional v0.9 vs v1.0 mistake demo to showcase linter & auto-fixer
      setEditorJsonText(
        JSON.stringify(
          {
            version: 'v1.0',
            updateComponents: {
              surfaceId: selectedSurfaceId,
              components: [
                {
                  id: 'legacy-card-node',
                  component: 'Text',
                  text: {
                    call: 'formatString',
                    args: {
                      value: 'Legacy v0.9 binding: ${/recipeTitle}',
                      title: { path: '/recipeTitle' },
                    },
                  },
                },
              ],
            },
          },
          null,
          2
        )
      );
    }
  };

  const handleAutoFixV09 = () => {
    if (!editorValidation.parsed) return;
    const fixed = autoFixLegacyA2UIJson(editorValidation.parsed);
    setEditorJsonText(JSON.stringify(fixed, null, 2));
  };

  const handleInjectFromEditor = () => {
    if (!editorValidation.parsed || !editorValidation.isValid) return;
    onInjectMessage(
      editorValidation.parsed as A2UIv1Message,
      'Inspector Live Editor'
    );
    setInjectStatusMessage('Dispatched v1.0 envelope to SurfaceManager!');
    window.setTimeout(() => setInjectStatusMessage(null), 2500);
  };

  const safeReplayIdx = Math.min(
    Math.max(0, replayIndex),
    Math.max(0, replayableEntries.length - 1)
  );
  const currentReplayEntry = replayableEntries[safeReplayIdx];

  const flattenedPointers = currentSurface
    ? flattenDataModelPointers(currentSurface.dataModel)
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="A2UI v1.0 Protocol Inspector"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-3xl flex-col bg-slate-900 text-slate-100 shadow-2xl border-l border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Code2 className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  A2UI v1.0 Live Protocol Inspector
                </h2>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                  spec v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Real-time JSONL envelope stream, time-travel surface replay &amp;
                RFC 6901 `@path` data model debugger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenOnboardingReport && (
              <button
                type="button"
                onClick={onOpenOnboardingReport}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>v1.0 Discovery Report</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              aria-label="Close Protocol Inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Surface Selector + Tab Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-5 py-2.5">
          <div className="flex gap-1 rounded-xl bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('log')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'log'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Stream Log ({protocolLog.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('replay')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'replay'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>Step Replayer ({replayableEntries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>v1.0 Linter &amp; Inject</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('datamodel')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'datamodel'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>DataModel &amp; Tree</span>
            </button>
          </div>

          {/* Active Surface Picker */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Surface:</span>
            <select
              value={selectedSurfaceId}
              onChange={(e) => onSelectSurface?.(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 font-mono text-xs text-emerald-300 focus:border-emerald-500 focus:outline-none"
            >
              {surfaceIds.length === 0 ? (
                <option value="meal-planner-surface">
                  meal-planner-surface
                </option>
              ) : (
                surfaceIds.map((sid) => (
                  <option key={sid} value={sid}>
                    {sid}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Main Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: LIVE STREAM LOG */}
          {activeTab === 'log' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setDirectionFilter('all')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer ${
                      directionFilter === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({protocolLog.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectionFilter('agent_to_renderer')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer ${
                      directionFilter === 'agent_to_renderer'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Inbound Agent→Renderer
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectionFilter('renderer_to_agent')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer ${
                      directionFilter === 'renderer_to_agent'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Outbound Action→Agent
                  </button>
                </div>

                {onClearLog && protocolLog.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearLog}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400 hover:border-rose-800 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear Log</span>
                  </button>
                )}
              </div>

              {filteredLogs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center">
                  <Activity className="mx-auto mb-2 h-6 w-6 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-400">
                    No A2UI v1.0 protocol messages recorded yet.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Launch the AI Personal Shopper or interact with any surface
                    control to inspect live envelopes.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredLogs.map((entry) => {
                    const isInbound = entry.direction === 'agent_to_renderer';
                    const isExpanded = expandedLogIds[entry.id] ?? true;

                    return (
                      <div
                        key={entry.id}
                        className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                      >
                        <div
                          onClick={() =>
                            setExpandedLogIds((prev) => ({
                              ...prev,
                              [entry.id]: !isExpanded,
                            }))
                          }
                          className="flex cursor-pointer flex-wrap items-center justify-between gap-2 bg-slate-900/70 px-3.5 py-2 hover:bg-slate-900"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            <span className="font-mono text-[11px] font-bold text-slate-400">
                              #{entry.seq}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                isInbound
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {isInbound ? (
                                <ArrowDownLeft className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              {entry.kind}
                            </span>
                            {entry.surfaceId && (
                              <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                                {entry.surfaceId}
                              </code>
                            )}
                            {entry.sourceLabel && (
                              <span className="text-[11px] text-slate-400">
                                · {entry.sourceLabel}
                              </span>
                            )}
                          </div>

                          <div
                            className="flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditorJsonText(
                                  JSON.stringify(entry.payload, null, 2)
                                );
                                setActiveTab('editor');
                              }}
                              className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:border-emerald-600 hover:text-emerald-300 cursor-pointer"
                            >
                              Edit / Lint
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyJson(entry.id, entry.payload)
                              }
                              className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:text-white cursor-pointer"
                            >
                              {copiedId === entry.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <pre className="max-h-64 overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-emerald-200/90">
                            {JSON.stringify(entry.payload, null, 2)}
                          </pre>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP ENVELOPE REPLAYER */}
          {activeTab === 'replay' && (
            <div className="space-y-4">
              {replayableEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950 p-8 text-center">
                  <Play className="mx-auto mb-2 h-6 w-6 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-400">
                    No inbound A2UI v1.0 surface snapshots available to replay.
                  </p>
                </div>
              ) : (
                <>
                  {/* Timeline Scrubber Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white">
                          Step {safeReplayIdx + 1} of {replayableEntries.length}{' '}
                          —{' '}
                          <span className="text-emerald-400">
                            {currentReplayEntry?.kind}
                          </span>
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Scrub through `createSurface` → `updateComponents` →
                          `updateDataModel` to inspect progressive surface
                          hydration
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAutoPlaying(false);
                            setReplayIndex(0);
                          }}
                          className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-300 hover:bg-slate-800 cursor-pointer"
                          title="Reset to first packet"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={safeReplayIdx <= 0}
                          onClick={() =>
                            setReplayIndex((i) => Math.max(0, i - 1))
                          }
                          className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                          title="Previous packet"
                        >
                          <SkipBack className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              !isAutoPlaying &&
                              safeReplayIdx >= replayableEntries.length - 1
                            ) {
                              setReplayIndex(0);
                            }
                            setIsAutoPlaying((v) => !v);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                        >
                          {isAutoPlaying ? (
                            <>
                              <Pause className="h-3.5 w-3.5" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              <span>Auto-Step</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={
                            safeReplayIdx >= replayableEntries.length - 1
                          }
                          onClick={() =>
                            setReplayIndex((i) =>
                              Math.min(replayableEntries.length - 1, i + 1)
                            )
                          }
                          className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                          title="Next packet"
                        >
                          <SkipForward className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, replayableEntries.length - 1)}
                      value={safeReplayIdx}
                      onChange={(e) => {
                        setIsAutoPlaying(false);
                        setReplayIndex(Number(e.target.value));
                      }}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
                    />
                  </div>

                  {/* Side-by-Side Packet JSON & Surface Snapshot */}
                  {currentReplayEntry && (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400">
                            Envelope #{currentReplayEntry.seq} (
                            {currentReplayEntry.kind})
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onInjectMessage(
                                currentReplayEntry.payload as A2UIv1Message,
                                `Replayed #${currentReplayEntry.seq}`
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 cursor-pointer"
                          >
                            <Send className="h-3 w-3" />
                            <span>Re-Dispatch Packet</span>
                          </button>
                        </div>
                        <pre className="max-h-96 overflow-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-200">
                          {JSON.stringify(currentReplayEntry.payload, null, 2)}
                        </pre>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-100 p-3.5 text-slate-900">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Surface Snapshot After Step #{currentReplayEntry.seq}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            {
                              Object.keys(
                                currentReplayEntry.surfaceSnapshotAfter
                                  ?.componentsById ?? {}
                              ).length
                            }{' '}
                            components
                          </span>
                        </div>
                        <div className="max-h-96 overflow-y-auto rounded-xl bg-white p-3 shadow-inner">
                          <A2UISurfaceRenderer
                            surface={currentReplayEntry.surfaceSnapshotAfter}
                            showSurfaceBadge={false}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: LIVE JSON EDITOR & V1.0 SCHEMA LINTER */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-300 mr-1">
                    Load Preset:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('data')}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-slate-800 cursor-pointer"
                  >
                    v1.0 `updateDataModel`
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('component')}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-sky-300 hover:bg-slate-800 cursor-pointer"
                  >
                    v1.0 Status Confirmation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('v09_bug')}
                    className="rounded-lg border border-amber-600/50 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                  >
                    Test v0.9→v1.0 Linter (`path` vs `@path`)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!editorValidation.isValid &&
                    editorValidation.diagnostics.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAutoFixV09}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        <span>Auto-Fix v0.9 → v1.0 Syntax</span>
                      </button>
                    )}

                  <button
                    type="button"
                    disabled={!editorValidation.isValid}
                    onClick={handleInjectFromEditor}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Inject into Surface</span>
                  </button>
                </div>
              </div>

              {injectStatusMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{injectStatusMessage}</span>
                </div>
              )}

              <textarea
                rows={13}
                value={editorJsonText}
                onChange={(e) => setEditorJsonText(e.target.value)}
                spellCheck={false}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-200 focus:border-emerald-500 focus:outline-none"
              />

              {/* Linter Diagnostics Panel */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    A2UI v1.0 Wire Schema Diagnostics
                  </span>
                  {editorValidation.parseError ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                      <AlertCircle className="h-3.5 w-3.5" />
                      JSON Syntax Error
                    </span>
                  ) : editorValidation.isValid ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Valid A2UI v1.0 Envelope
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {editorValidation.diagnostics.length} Issue(s) Detected
                    </span>
                  )}
                </div>

                {editorValidation.parseError && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200">
                    {editorValidation.parseError}
                  </div>
                )}

                {!editorValidation.parseError &&
                  editorValidation.diagnostics.length === 0 && (
                    <p className="text-xs text-slate-400">
                      No v0.8/v0.9 regressions or schema errors found. Ready to
                      dispatch to `SurfaceManager`.
                    </p>
                  )}

                {editorValidation.diagnostics.length > 0 && (
                  <div className="space-y-2">
                    {editorValidation.diagnostics.map((diag, idx) => (
                      <div
                        key={`${diag.code}-${idx}`}
                        className={`rounded-xl border p-3 text-xs ${
                          diag.severity === 'error'
                            ? 'border-rose-500/40 bg-rose-950/40 text-rose-200'
                            : 'border-amber-500/40 bg-amber-950/40 text-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 font-mono text-[11px] font-bold">
                          <span>{diag.code}</span>
                          <span className="rounded bg-black/30 px-1.5 py-0.5">
                            {diag.path}
                          </span>
                        </div>
                        <p className="mt-1">{diag.message}</p>
                        {diag.suggestion && (
                          <p className="mt-1 text-[11px] font-semibold text-emerald-300">
                            Fix: {diag.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RAW DATAMODEL & COMPONENT GRAPH TREE */}
          {activeTab === 'datamodel' && (
            <div className="space-y-4">
              {!currentSurface ? (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950 p-8 text-center text-xs text-slate-400">
                  No active surface state for `{selectedSurfaceId}`.
                </div>
              ) : (
                <>
                  {/* Direct RFC 6901 JSON Pointer Mutation Bar */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <h3 className="mb-2 text-xs font-bold text-white">
                      Live RFC 6901 JSON Pointer Upsert / Delete (`updateDataModel`)
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={editPointerInput}
                        onChange={(e) => setEditPointerInput(e.target.value)}
                        placeholder="/servings"
                        className="w-44 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-emerald-300 focus:border-emerald-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editValueInput}
                        onChange={(e) => setEditValueInput(e.target.value)}
                        placeholder="JSON value (e.g. 6, true, or null to delete)"
                        className="min-w-[180px] flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          let parsedVal: unknown = editValueInput;
                          try {
                            parsedVal = JSON.parse(editValueInput);
                          } catch {
                            parsedVal = editValueInput;
                          }
                          if (onEditDataModelPath) {
                            onEditDataModelPath(
                              currentSurface.surfaceId,
                              editPointerInput,
                              parsedVal
                            );
                          } else {
                            onInjectMessage(
                              {
                                version: 'v1.0',
                                updateDataModel: {
                                  surfaceId: currentSurface.surfaceId,
                                  path: editPointerInput,
                                  value: parsedVal,
                                },
                              },
                              'Inspector Pointer Edit'
                            );
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Apply Pointer Update</span>
                      </button>
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Tip: Pass <code className="text-amber-300">null</code> as
                      the value to test A2UI v1.0 key deletion at `path`.
                    </p>
                  </div>

                  {/* Flattened JSON Pointer Table */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">
                        Active `@path` Pointers in `{currentSurface.surfaceId}`
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Click any row to load into pointer editor
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/70 rounded-xl border border-slate-800 bg-slate-900/60">
                      {flattenedPointers.map((row) => (
                        <button
                          key={row.pointer}
                          type="button"
                          onClick={() => {
                            setEditPointerInput(row.pointer);
                            setEditValueInput(JSON.stringify(row.value));
                          }}
                          className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left font-mono text-[11px] hover:bg-slate-800/70 cursor-pointer"
                        >
                          <span className="text-emerald-300">
                            {row.pointer}
                          </span>
                          <span className="truncate text-slate-300">
                            {JSON.stringify(row.value)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Raw DataModel JSON & Registered Component Graph */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          Raw `dataModel` Tree
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyJson(
                              'raw-dm',
                              currentSurface.dataModel
                            )
                          }
                          className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                        >
                          {copiedId === 'raw-dm' ? 'Copied!' : 'Copy JSON'}
                        </button>
                      </div>
                      <pre className="max-h-72 overflow-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-200">
                        {JSON.stringify(currentSurface.dataModel, null, 2)}
                      </pre>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          Registered `componentsById` (
                          {Object.keys(currentSurface.componentsById).length})
                        </span>
                        <Layers className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                        {Object.values(currentSurface.componentsById).map(
                          (comp) => (
                            <div
                              key={comp.id}
                              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-[11px]"
                            >
                              <div className="flex items-center gap-2">
                                <code className="font-mono font-bold text-emerald-300">
                                  {comp.id}
                                </code>
                                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                                  {comp.component}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {comp.checks && comp.checks.length > 0 && (
                                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                                    {comp.checks.length} checks
                                  </span>
                                )}
                                {comp.catalogId ? (
                                  <span
                                    title={comp.catalogId}
                                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                                      comp.catalogId.includes('/culinary/')
                                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                        : comp.catalogId.includes('/grocery/')
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    }`}
                                  >
                                    {comp.catalogId.includes('/culinary/')
                                      ? 'culinary/v1'
                                      : comp.catalogId.includes('/grocery/')
                                        ? 'grocery/v1'
                                        : 'basic/v1.0'}
                                  </span>
                                ) : (
                                  <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                                    default: basic/v1.0
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
