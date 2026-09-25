import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  RefreshCw, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Kanban,
  CheckCircle2,
  Calendar,
  User,
  Activity,
  FolderOpen
} from 'lucide-react';
import { api } from '../../lib/apiClient';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, CURRENCY_EVENT, CurrencyCode } from '../../lib/currency';

interface ExecutiveOverviewData {
  metrics: {
    revenueCollected: number | null;
    totalBilled: number | null;
    outstandingReceivables: number | null;
    overdueReceivables: number | null;
    activePipeline: number | null;
    activeProjects: number;
    projectsAtRisk: number;
    pendingApprovals: number;
    overdueTasks: number;
    openLeads: number;
  };
  todayAtKapitech: {
    openLeadsCount: number;
    dealsInPipelineCount: number;
    pipelineValue: number | null;
    proposalsAwaitingCount: number;
    projectsAtRiskCount: number;
    overdueInvoicesCount: number;
  };
  financials: {
    revenueThisMonth: number | null;
    cashCollected: number | null;
    outstandingReceivables: number | null;
    operatingExpenses: number | null;
    netOperatingProfit: number | null;
    margin: string | null;
  };
  pipelineByStage: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
  attentionItems: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'danger' | 'warning' | 'info';
    category: string;
    linkUrl: string;
  }>;
  projects: Array<any>;
  recentActivity: Array<any>;
}

export const GlobalExecutiveDashboard: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<ExecutiveOverviewData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCurrencyChange = (e: Event) => {
      const custom = e as CustomEvent<{ currency: CurrencyCode }>;
      if (custom.detail?.currency) {
        setCurrency(custom.detail.currency);
      }
    };
    window.addEventListener(CURRENCY_EVENT, handleCurrencyChange);
    return () => window.removeEventListener(CURRENCY_EVENT, handleCurrencyChange);
  }, []);

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.executive.getOverview();
      if (res.success) {
        const payload = (res.data || res) as ExecutiveOverviewData;
        setData(payload);
        setLastRefreshed(new Date());
      } else {
        setError(res.error || 'Failed to load executive metrics.');
      }
    } catch {
      setError('Network communication failed while fetching executive overview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return language === 'id' ? 'Terbatas' : 'Restricted';
    if (currency === 'USD') {
      const usdVal = Math.round(val / 16000);
      return `$${usdVal.toLocaleString()}`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const metrics = data?.metrics || {
    revenueCollected: 0,
    totalBilled: 0,
    outstandingReceivables: 0,
    overdueReceivables: 0,
    activePipeline: 0,
    activeProjects: 0,
    projectsAtRisk: 0,
    pendingApprovals: 0,
    overdueTasks: 0,
    openLeads: 0
  };

  const attentionItems = data?.attentionItems || [];
  const pipelineStages = data?.pipelineByStage || [];
  const recentProjects = data?.projects || [];
  const recentLogs = data?.recentActivity || [];

  return (
    <div className="ams-dashboard-page space-y-6 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER WITH SERVER STATUS & REFRESH */}
      {/* ------------------------------------------------------------- */}
      <div className="ams-dashboard-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="ams-page-title">
              {language === 'id' ? 'Executive Briefing & Kendali Operasi' : 'Executive Overview & Operations'}
            </h1>
          </div>
          <p className="text-[13px] leading-[18px] font-sans text-[var(--muted)] mt-1">
            {language === 'id'
              ? 'Snapshot server saat ini untuk pipeline, piutang, risiko proyek, dan prioritas tindakan.'
              : 'Current server snapshot for sales pipeline, receivables, project delivery, and action priorities.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-sans text-[var(--muted)]">
            {language === 'id' ? 'Diperbarui:' : 'Synced:'} {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            onClick={fetchOverview}
            disabled={isLoading}
            className="ams-action flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh metrics from server"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-[var(--accent)]' : 'text-[var(--muted)]'} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-card bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--text)] text-xs font-sans flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchOverview} className="underline hover:text-[var(--text)]">Retry</button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CORE KPI ROW */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Collected */}
        <div className="kapi-card ams-kpi flex flex-col justify-between hover:border-[var(--line)] transition-colors">
          <div className="flex items-center justify-between text-xs font-sans text-[var(--muted)]">
            <span>{language === 'id' ? 'Pendapatan Diterima' : 'Revenue Collected'}</span>
            <div className="w-7 h-7 rounded-control bg-[var(--success)]/10 border border-[var(--success)]/20 flex items-center justify-center text-[var(--success)]">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="ams-kpi-value">
              {formatCurrency(metrics.revenueCollected)}
            </div>
            <div className="ams-meta mt-1 flex items-center gap-1">
              <span>Billed Total:</span>
              <span className="text-[var(--text)] font-semibold">{formatCurrency(metrics.totalBilled)}</span>
            </div>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="kapi-card ams-kpi flex flex-col justify-between hover:border-[var(--line)] transition-colors">
          <div className="flex items-center justify-between text-xs font-sans text-[var(--muted)]">
            <span>{language === 'id' ? 'Piutang Berjalan' : 'Outstanding Receivables'}</span>
            <div className={`w-7 h-7 rounded-control flex items-center justify-center ${metrics.overdueReceivables > 0 ? 'bg-[var(--danger)]/10 border border-red-500/30 text-[var(--danger)]' : 'bg-[var(--warning)]/10 border border-[var(--warning)]/20 text-[var(--warning)]'}`}>
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="ams-kpi-value">
              {formatCurrency(metrics.outstandingReceivables)}
            </div>
            <div className="ams-meta mt-1 flex items-center gap-1">
              {metrics.overdueReceivables > 0 ? (
                <span className="text-[var(--danger)] font-semibold flex items-center gap-1">
                  <AlertTriangle size={11} />
                  {formatCurrency(metrics.overdueReceivables)} Overdue
                </span>
              ) : (
                <span className="text-[var(--success)]">All within payment terms</span>
              )}
            </div>
          </div>
        </div>

        {/* Active Pipeline */}
        <div className="kapi-card ams-kpi flex flex-col justify-between hover:border-[var(--line)] transition-colors">
          <div className="flex items-center justify-between text-xs font-sans text-[var(--muted)]">
            <span>{language === 'id' ? 'Nilai Pipeline Aktif' : 'Active Pipeline'}</span>
            <div className="w-7 h-7 rounded-control bg-[var(--info)]/10 border border-[var(--info)]/20 flex items-center justify-center text-[var(--info)]">
              <Kanban size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="ams-kpi-value">
              {formatCurrency(metrics.activePipeline)}
            </div>
            <div className="ams-meta mt-1 flex items-center gap-1">
              <span>Active Deals:</span>
              <span className="text-[var(--text)] font-semibold">{data?.todayAtKapitech?.dealsInPipelineCount || 0}</span>
              <span className="text-[var(--muted)]">•</span>
              <span>Leads:</span>
              <span className="text-[var(--text)] font-semibold">{metrics.openLeads}</span>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="kapi-card ams-kpi flex flex-col justify-between hover:border-[var(--line)] transition-colors">
          <div className="flex items-center justify-between text-xs font-sans text-[var(--muted)]">
            <span>{language === 'id' ? 'Proyek Berjalan' : 'Active Projects'}</span>
            <div className="w-7 h-7 rounded-control bg-[var(--info)]/10 border border-[var(--info)]/20 flex items-center justify-center text-[var(--info)]">
              <Layers size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="ams-kpi-value">
              {metrics.activeProjects}
            </div>
            <div className="ams-meta mt-1 flex items-center gap-1">
              {metrics.projectsAtRisk > 0 ? (
                <span className="text-[var(--warning)] font-semibold flex items-center gap-1">
                  <AlertTriangle size={11} />
                  {metrics.projectsAtRisk} At Risk / Delayed
                </span>
              ) : (
                <span className="text-[var(--success)] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  No risk flags
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. NEEDS ATTENTION: ACTIONABLE OPERATIONAL SIGNALS */}
      {/* ------------------------------------------------------------- */}
      <div className="kapi-card ams-panel p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {attentionItems.length > 0 ? (
              <AlertTriangle className="text-[var(--accent)] shrink-0" size={16} />
            ) : (
              <CheckCircle2 className="text-[var(--success)] shrink-0" size={16} />
            )}
            <h2 className="text-sm font-semibold font-sans text-[var(--text)] truncate">
              {language === 'id' ? 'Prioritas Tindakan Eksekutif' : 'Executive Action Priorities'}
            </h2>
            <span className={`px-2 py-0.5 rounded-badge text-[10px] font-sans font-semibold shrink-0 ${
              attentionItems.length > 0
                ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                : 'bg-[var(--success)]/10 text-[var(--success)]'
            }`}>
              {attentionItems.length}
            </span>
          </div>
        </div>

        {attentionItems.length === 0 ? (
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-control bg-[var(--success)]/5 border border-[var(--success)]/15">
            <CheckCircle2 className="text-[var(--success)] shrink-0" size={18} />
            <div className="min-w-0">
              <p className="text-xs font-sans text-[var(--text)] font-medium">
                {language === 'id' ? 'Tidak ada tindakan yang perlu dilakukan.' : 'No action required.'}
              </p>
              <p className="text-[11px] font-sans text-[var(--muted)]">
                {language === 'id' ? 'Tidak ada invoice jatuh tempo, proyek terblokir, atau persetujuan tertunda.' : 'No overdue invoices, blocked projects, or pending approvals.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attentionItems.map((item) => {
              const isDanger = item.severity === 'danger';
              return (
                <div
                  key={item.id}
                  className={`kapi-card ams-inbox-item border flex items-start justify-between gap-3 transition-all ${
                    isDanger 
                      ? 'bg-[var(--danger)]/10 border-[var(--danger)]/30 hover:border-[var(--danger)]/50' 
                      : 'bg-[var(--warning)]/10 border-[var(--warning)]/30 hover:border-[var(--warning)]/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-sans uppercase font-semibold ${
                        isDanger ? 'bg-[var(--danger)]/10 text-[var(--danger)]' : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                      }`}>
                        {item.category}
                      </span>
                      <h4 className="text-xs font-semibold text-[var(--text)]">{item.title}</h4>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] leading-relaxed">{item.description}</p>
                  </div>
                  <Link
                    to={item.linkUrl}
                    className="min-h-10 min-w-10 px-2 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] shrink-0 text-xs font-sans flex items-center gap-1 hover:border-[var(--accent)] transition-colors"
                  >
                    <span>Resolve</span>
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. TWO-COLUMN OPERATIONAL SPLIT: PIPELINE & FINANCIALS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Pipeline Breakdown */}
        <div className="kapi-card ams-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold font-sans text-[var(--text)] flex items-center gap-2">
                <Kanban size={15} className="text-[var(--accent)]" />
                <span>{language === 'id' ? 'Sebaran Tahapan Pipeline CRM' : 'Sales Pipeline by Stage'}</span>
              </h3>
              <p className="text-[10px] font-sans text-[var(--muted)] mt-0.5">Current deal distribution</p>
            </div>
            <Link
              to="/admin/crm"
              className="text-xs font-sans text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <span>Open CRM</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {pipelineStages.length === 0 ? (
              <div className="p-6 text-center text-xs font-sans text-[var(--muted)]">
                No deals currently in pipeline.
              </div>
            ) : (
              pipelineStages.map((st) => (
                <div key={st.stage} className="p-2.5 rounded-control bg-[var(--panel)] border border-[var(--line)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    <span className="font-sans uppercase text-[var(--text)] text-[11px] font-semibold">{st.stage}</span>
                    <span className="text-[10px] font-sans text-[var(--muted)]">({st.count} deals)</span>
                  </div>
                  <span className="font-sans text-[var(--text)] font-semibold">{formatCurrency(st.value)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Financial Operating Summary */}
        <div className="kapi-card ams-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold font-sans text-[var(--text)] flex items-center gap-2">
                <DollarSign size={15} className="text-[var(--success)]" />
                <span>{language === 'id' ? 'Ringkasan Keuangan Operasional' : 'Financial Operating Summary'}</span>
              </h3>
              <p className="text-[10px] font-sans text-[var(--muted)] mt-0.5">Current financial snapshot</p>
            </div>
            <Link
              to="/admin/invoicing"
              className="text-xs font-sans text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <span>Invoicing</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-control bg-[var(--panel)] border border-[var(--line)]">
              <div className="text-[10px] font-sans text-[var(--muted)]">Operating Expenses (OpEx)</div>
              <div className="text-base font-semibold font-sans text-[var(--text)] mt-1">
                {formatCurrency(data?.financials?.operatingExpenses || 0)}
              </div>
            </div>

            <div className="p-3 rounded-control bg-[var(--panel)] border border-[var(--line)]">
              <div className="text-[10px] font-sans text-[var(--muted)]">Net Operating Margin</div>
              <div className="text-base font-semibold font-sans text-[var(--success)] mt-1">
                {data?.financials?.margin || '0'}%
              </div>
            </div>

            <div className="p-3 rounded-control bg-[var(--panel)] border border-[var(--line)]">
              <div className="text-[10px] font-sans text-[var(--muted)]">Net Operating Profit</div>
              <div className={`text-base font-semibold font-sans mt-1 ${(data?.financials?.netOperatingProfit || 0) >= 0 ? 'text-[var(--text)]' : 'text-[var(--danger)]'}`}>
                {formatCurrency(data?.financials?.netOperatingProfit || 0)}
              </div>
            </div>

            <div className="p-3 rounded-control bg-[var(--panel)] border border-[var(--line)]">
              <div className="text-[10px] font-sans text-[var(--muted)]">Proposals Awaiting Approval</div>
              <div className="text-base font-semibold font-sans text-[var(--text)] mt-1">
                {data?.todayAtKapitech?.proposalsAwaitingCount || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. ACTIVE PROJECTS STATUS (DELIVERY HEALTH) */}
      {/* ------------------------------------------------------------- */}
      <div className="kapi-card ams-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold font-sans text-[var(--text)] flex items-center gap-2">
              <Layers size={15} className="text-[var(--accent)]" />
              <span>{language === 'id' ? 'Status Eksekusi Proyek Klien' : 'Client Project Delivery Status'}</span>
            </h3>
            <p className="text-[10px] font-sans text-[var(--muted)] mt-0.5">Current active engagements from project registry</p>
          </div>
          <Link
            to="/admin/projects"
            className="text-xs font-sans text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            <span>All Projects</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="ams-empty-state">
            No active projects currently enrolled in registry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] text-[10px] font-sans text-[var(--muted)] uppercase">
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Health</th>
                  <th className="py-2.5 px-3">Budget / Value</th>
                  <th className="py-2.5 px-3">Deadline</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[var(--text)]">
                {recentProjects.map((p) => {
                  const isAtRisk = p.health === 'At Risk' || p.health === 'Delayed';
                  return (
                    <tr key={p.id} className="hover:bg-panel-hover transition-colors">
                      <td className="py-3 px-3 font-semibold text-[var(--text)]">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[220px]">{p.title || p.name || 'Untitled Project'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[var(--muted)] font-sans text-[11px]">
                        {p.client || 'Internal'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-sans uppercase font-semibold ${
                          p.health === 'On Track'
                            ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
                            : isAtRisk
                            ? 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20'
                            : 'bg-[var(--panel)] text-[var(--muted)]'
                        }`}>
                          {p.health || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-[11px] text-[var(--text)]">
                        {formatCurrency(p.contractValue || p.budget || 0)}
                      </td>
                      <td className="py-3 px-3 font-sans text-[11px] text-[var(--muted)]">
                        {p.deadline || p.targetDeliveryDate || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate('/admin/projects')}
                          className="min-h-10 inline-flex items-center text-[11px] font-sans text-[var(--accent)] hover:underline"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. RECENT AUDIT ACTIVITY (IMMUTABLE SERVER ACTIVITY TRAIL) */}
      {/* ------------------------------------------------------------- */}
      <div className="kapi-card ams-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold font-sans text-[var(--text)] flex items-center gap-2">
              <Activity size={15} className="text-[var(--accent)]" />
              <span>{language === 'id' ? 'Log Aktivitas Sistem & Audit Trail' : 'System Audit Trail & Operations Feed'}</span>
            </h3>
            <p className="text-[10px] font-sans text-[var(--muted)] mt-0.5">Events recorded by the server audit log</p>
          </div>
          <Link
            to="/admin/settings"
            className="text-xs font-sans text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1"
          >
            <span>Full Audit Logs</span>
            <ExternalLink size={11} />
          </Link>
        </div>

        <div className="space-y-2">
          {recentLogs.length === 0 ? (
            <div className="p-6 text-center text-xs font-sans text-[var(--muted)]">
              No audit activities recorded.
            </div>
          ) : (
            recentLogs.slice(0, 6).map((log, idx) => (
              <div key={log.id || idx} className="p-2.5 rounded-control bg-[var(--panel)] border border-[var(--line)] flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    log.severity === 'danger' ? 'bg-[var(--danger)]' : log.severity === 'warning' ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'
                  }`} />
                  <span className="font-semibold text-[var(--text)] uppercase text-[10px] shrink-0">{log.action}</span>
                  <span className="text-[var(--muted)] truncate">{log.details || log.message}</span>
                </div>
                <div className="text-[10px] text-[var(--muted)] shrink-0 ml-2">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalExecutiveDashboard;
