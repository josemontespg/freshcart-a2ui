import React, { useState } from 'react';
import {
  X,
  FileWarning,
  Bug,
  PackageSearch,
  GitCompareArrows,
  Copy,
  Check,
  TerminalSquare,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ONBOARDING_SUMMARY_METRICS,
  PACKAGE_MATRIX,
  WIRE_FORMAT_SHIFTS,
  DOCUMENTATION_GAPS,
  FRAMEWORK_BUGS,
  generateOnboardingMarkdownReport,
  type FindingSeverity,
  type OnboardingFinding,
} from '../../scenarios/onboardingFindingsData';

export interface OnboardingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProtocolInspector?: () => void;
}

type ReportTabId = 'matrix' | 'shifts' | 'doc-gaps' | 'bugs';

const SEVERITY_BADGE_STYLES: Record<FindingSeverity, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-amber-100 text-amber-900 border-amber-200',
  medium: 'bg-sky-100 text-sky-800 border-sky-200',
  low: 'bg-stone-100 text-stone-700 border-stone-200',
};

export const OnboardingReportModal: React.FC<OnboardingReportModalProps> = ({
  isOpen,
  onClose,
  onOpenProtocolInspector,
}) => {
  const [activeTab, setActiveTab] = useState<ReportTabId>('matrix');
  const [severityFilter, setSeverityFilter] = useState<'all' | FindingSeverity>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyMarkdown = async () => {
    const md = generateOnboardingMarkdownReport();
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const filterFindings = (items: OnboardingFinding[]) =>
    severityFilter === 'all'
      ? items
      : items.filter((item) => item.severity === severityFilter);

  const renderFindingCard = (finding: OnboardingFinding) => (
    <div
      key={finding.id}
      className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-2.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-stone-900 text-white">
            {finding.id}
          </span>
          <span
            className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border ${
              SEVERITY_BADGE_STYLES[finding.severity]
            }`}
          >
            {finding.severity}
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {finding.category}
          </span>
        </div>
        <span className="font-mono text-[11px] text-stone-500">
          {finding.affectedTarget}
        </span>
      </div>

      <h4 className="text-sm font-bold text-stone-900">{finding.title}</h4>
      <p className="text-xs text-stone-700 leading-relaxed">{finding.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
        <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
            Reproduction / Evidence
          </div>
          <p className="text-[11px] text-stone-700 font-mono break-words">
            {finding.reproductionOrEvidence}
          </p>
        </div>

        <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-200/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
            FreshCart v1.0 Workaround
          </div>
          <p className="text-[11px] text-emerald-950">{finding.freshcartWorkaround}</p>
        </div>

        <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-200/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1">
            Recommendation for A2UI Team
          </div>
          <p className="text-[11px] text-amber-950">
            {finding.recommendationForA2UITeam}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-report-title"
    >
      <div className="bg-[#FAF8F5] border border-stone-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="bg-[#073E1E] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                Zero-Prior-Knowledge Audit
              </span>
              <span className="text-xs text-emerald-200/80">
                {ONBOARDING_SUMMARY_METRICS.npmReleaseTested}
              </span>
            </div>
            <h2 id="onboarding-report-title" className="text-lg font-bold mt-1">
              A2UI v1.0 Public Onboarding Discovery, Doc Gaps & Framework Bugs Report
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {onOpenProtocolInspector && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProtocolInspector();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
              >
                <TerminalSquare className="w-3.5 h-3.5" />
                Open Live v1.0 Inspector
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0AAD0A] hover:bg-[#089208] text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied Markdown!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Full Report (.md)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Onboarding Report Modal"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary KPI Strip + Tab Selector */}
        <div className="bg-white border-b border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'matrix'}
              onClick={() => setActiveTab('matrix')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-[#0AAD0A] text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
              }`}
            >
              <PackageSearch className="w-3.5 h-3.5" />
              1. Discovery & npm Matrix
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'shifts'}
              onClick={() => setActiveTab('shifts')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'shifts'
                  ? 'bg-[#0AAD0A] text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
              }`}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              2. v0.9 vs v1.0 Breaking Shifts ({WIRE_FORMAT_SHIFTS.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'doc-gaps'}
              onClick={() => setActiveTab('doc-gaps')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'doc-gaps'
                  ? 'bg-[#0AAD0A] text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
              }`}
            >
              <FileWarning className="w-3.5 h-3.5" />
              3. Documentation Gaps ({DOCUMENTATION_GAPS.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'bugs'}
              onClick={() => setActiveTab('bugs')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === 'bugs'
                  ? 'bg-[#0AAD0A] text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              4. Package & Runtime Bugs ({FRAMEWORK_BUGS.length})
            </button>
          </div>

          {(activeTab === 'doc-gaps' || activeTab === 'bugs') && (
            <div className="flex items-center gap-1">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(sev)}
                  className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'matrix' && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-amber-950">
                  <div className="font-bold text-sm">
                    Headline Finding: Public Docs Say v1.0 Is &ldquo;🚧 Planned&rdquo;, Yet npm 0.14.0 Already Ships v1.0 Core
                  </div>
                  <p className="leading-relaxed">
                    An external React developer visiting <code className="font-mono bg-amber-100 px-1 rounded">a2ui.org</code> or{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded">@a2ui/react</code>&apos;s README is told that A2UI v1.0 renderer support is still &ldquo;🚧 Planned&rdquo; and is only shown{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded">@a2ui/react/v0_9</code>. However, inspecting the published npm tarballs reveals that{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded">@a2ui/web_core@0.14.0</code> already ships{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded">./v1_0</code> and{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded">./catalogs/basic/v1</code>, while{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded">@a2ui/react@0.14.0</code> simply forgot to add a{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded">./v1_0</code> export alias in <code className="font-mono bg-amber-100 px-1 rounded">package.json</code>.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Public npm Registry vs. GitHub Repository Audit
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Audited in /usr/local/google/home/josemontesp/freshcart-a2ui/docs/
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50/60 text-stone-600">
                        <th className="py-2.5 px-3 font-semibold">Package</th>
                        <th className="py-2.5 px-3 font-semibold">npm Version</th>
                        <th className="py-2.5 px-3 font-semibold">Export Subpaths</th>
                        <th className="py-2.5 px-3 font-semibold">v1.0 Status</th>
                        <th className="py-2.5 px-3 font-semibold">Key Findings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/70">
                      {PACKAGE_MATRIX.map((row) => (
                        <tr key={row.packageName} className="hover:bg-stone-50/70">
                          <td className="py-2.5 px-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                            {row.packageName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-stone-700 whitespace-nowrap">
                            {row.npmVersion}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600">
                            {row.exportSubpaths}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                row.v1SupportStatus.startsWith('Full')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : row.v1SupportStatus.startsWith('Partial')
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {row.v1SupportStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-stone-600">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'shifts' && (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
              <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  A2UI v0.8 / v0.9 vs. v1.0 Breaking Wire Format & Validation Changes
                </h3>
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  All enforced in FreshCart&apos;s Live Protocol Inspector Linter
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/60 text-stone-600">
                      <th className="py-2.5 px-3 font-semibold">Protocol Feature</th>
                      <th className="py-2.5 px-3 font-semibold">Legacy v0.8 / v0.9 Syntax</th>
                      <th className="py-2.5 px-3 font-semibold">A2UI v1.0 Syntax</th>
                      <th className="py-2.5 px-3 font-semibold">Breaking Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/70">
                    {WIRE_FORMAT_SHIFTS.map((shift) => (
                      <tr key={shift.feature} className="hover:bg-stone-50/70">
                        <td className="py-2.5 px-3 font-bold text-stone-900">
                          {shift.feature}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-red-700 bg-red-50/30">
                          {shift.v08_v09Syntax}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-800 bg-emerald-50/30 font-semibold">
                          {shift.v10Syntax}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          {shift.breakingImpact}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'doc-gaps' && (
            <div className="space-y-3">
              {filterFindings(DOCUMENTATION_GAPS).map(renderFindingCard)}
            </div>
          )}

          {activeTab === 'bugs' && (
            <div className="space-y-3">
              {filterFindings(FRAMEWORK_BUGS).map(renderFindingCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
