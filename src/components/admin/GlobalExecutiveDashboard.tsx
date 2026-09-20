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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER WITH AUTHORITATIVE STATUS & REFRESH */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
              {language === 'id' ? 'Executive Briefing & Kendali Operasi' : 'Executive Overview & Operations'}
            </h1>
          </div>
          <p className="text-xs font-mono text-[#8A94A6] mt-1">
            {language === 'id'
              ? 'Laporan agregasi real-time status pipeline, piutang tertagih, risiko proyek, dan prioritas tindakan.'
              : 'Real-time authoritative telemetry across sales pipeline, receivables, project delivery, and action priorities.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono text-[#8A94A6]">
            {language === 'id' ? 'Diperbarui:' : 'Synced:'} {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            onClick={fetchOverview}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-[#181B22] hover:bg-[#21252F] text-white border border-white/[0.07] text-xs font-mono flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Refresh metrics from server"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#E50914]' : 'text-[#8A94A6]'} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchOverview} className="underline hover:text-white">Retry</button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CORE KPI ROW (AUTHORITATIVE BUSINESS METRICS) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Collected */}
        <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6]">
            <span>{language === 'id' ? 'Pendapatan Diterima' : 'Revenue Collected'}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-sans text-white tracking-tight">
              {formatCurrency(metrics.revenueCollected)}
            </div>
            <div className="text-[10px] font-mono text-[#8A94A6] mt-1 flex items-center gap-1">
              <span>Billed Total:</span>
              <span className="text-zinc-300 font-semibold">{formatCurrency(metrics.totalBilled)}</span>
            </div>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6]">
            <span>{language === 'id' ? 'Piutang Berjalan' : 'Outstanding Receivables'}</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${metrics.overdueReceivables > 0 ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-sans text-white tracking-tight">
              {formatCurrency(metrics.outstandingReceivables)}
            </div>
            <div className="text-[10px] font-mono mt-1 flex items-center gap-1">
              {metrics.overdueReceivables > 0 ? (
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <AlertTriangle size={11} />
                  {formatCurrency(metrics.overdueReceivables)} Overdue
                </span>
              ) : (
                <span className="text-emerald-400">All within payment terms</span>
              )}
            </div>
          </div>
        </div>

        {/* Active Pipeline */}
        <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6]">
            <span>{language === 'id' ? 'Nilai Pipeline Aktif' : 'Active Pipeline'}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Kanban size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-sans text-white tracking-tight">
              {formatCurrency(metrics.activePipeline)}
            </div>
            <div className="text-[10px] font-mono text-[#8A94A6] mt-1 flex items-center gap-1">
              <span>Active Deals:</span>
              <span className="text-zinc-300 font-semibold">{data?.todayAtKapitech?.dealsInPipelineCount || 0}</span>
              <span className="text-zinc-500">•</span>
              <span>Leads:</span>
              <span className="text-zinc-300 font-semibold">{metrics.openLeads}</span>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6]">
            <span>{language === 'id' ? 'Proyek Berjalan' : 'Active Projects'}</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-sans text-white tracking-tight">
              {metrics.activeProjects}
            </div>
            <div className="text-[10px] font-mono mt-1 flex items-center gap-1">
              {metrics.projectsAtRisk > 0 ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle size={11} />
                  {metrics.projectsAtRisk} At Risk / Delayed
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
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
      <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-[#FF1E27]" size={16} />
            <h2 className="text-sm font-bold font-sans text-white">
              {language === 'id' ? 'Prioritas Tindakan Eksekutif (Needs Attention)' : 'Executive Action Priorities (Needs Attention)'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E50914]/20 text-[#FF1E27]">
              {attentionItems.length}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#8A94A6]">
            {language === 'id' ? 'Dipicu otomatis dari data operasional' : 'Auto-derived from system records'}
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="p-6 text-center rounded-lg bg-[#181B22]/40 border border-white/[0.04]">
            <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={24} />
            <p className="text-xs font-sans text-white font-medium">
              {language === 'id' ? 'Semua parameter operasional dalam batas normal.' : 'All operational parameters are currently healthy.'}
            </p>
            <p className="text-[11px] font-mono text-[#8A94A6] mt-0.5">
              No overdue invoices, blocked projects, or pending authorizations requiring immediate partner signoff.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attentionItems.map((item) => {
              const isDanger = item.severity === 'danger';
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                    isDanger 
                      ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50' 
                      : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${
                        isDanger ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.category}
                      </span>
                      <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] leading-relaxed">{item.description}</p>
                  </div>
                  <Link
                    to={item.linkUrl}
                    className="p-1.5 rounded-lg bg-[#181B22] hover:bg-[#21252F] text-white border border-white/[0.07] shrink-0 text-xs font-mono flex items-center gap-1 hover:border-[#E50914] transition-colors"
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
        <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-sans text-white flex items-center gap-2">
                <Kanban size={15} className="text-[#FF1E27]" />
                <span>{language === 'id' ? 'Sebaran Tahapan Pipeline CRM' : 'Sales Pipeline by Stage'}</span>
              </h3>
              <p className="text-[10px] font-mono text-[#8A94A6] mt-0.5">Current deal distribution</p>
            </div>
            <Link
              to="/admin/crm"
              className="text-xs font-mono text-[#FF1E27] hover:underline flex items-center gap-1"
            >
              <span>Open CRM</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {pipelineStages.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-[#8A94A6]">
                No deals currently in pipeline.
              </div>
            ) : (
              pipelineStages.map((st) => (
                <div key={st.stage} className="p-2.5 rounded-lg bg-[#181B22] border border-white/[0.04] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                    <span className="font-mono uppercase text-[#F8FAFC] text-[11px] font-semibold">{st.stage}</span>
                    <span className="text-[10px] font-mono text-[#8A94A6]">({st.count} deals)</span>
                  </div>
                  <span className="font-mono text-zinc-300 font-bold">{formatCurrency(st.value)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Financial Operating Summary */}
        <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-sans text-white flex items-center gap-2">
                <DollarSign size={15} className="text-emerald-400" />
                <span>{language === 'id' ? 'Ringkasan Keuangan Operasional' : 'Financial Operating Summary'}</span>
              </h3>
              <p className="text-[10px] font-mono text-[#8A94A6] mt-0.5">Current financial snapshot</p>
            </div>
            <Link
              to="/admin/invoicing"
              className="text-xs font-mono text-[#FF1E27] hover:underline flex items-center gap-1"
            >
              <span>Invoicing</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#181B22] border border-white/[0.04]">
              <div className="text-[10px] font-mono text-[#8A94A6]">Operating Expenses (OpEx)</div>
              <div className="text-base font-bold font-sans text-white mt-1">
                {formatCurrency(data?.financials?.operatingExpenses || 0)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#181B22] border border-white/[0.04]">
              <div className="text-[10px] font-mono text-[#8A94A6]">Net Operating Margin</div>
              <div className="text-base font-bold font-sans text-emerald-400 mt-1">
                {data?.financials?.margin || '0'}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#181B22] border border-white/[0.04]">
              <div className="text-[10px] font-mono text-[#8A94A6]">Net Operating Profit</div>
              <div className={`text-base font-bold font-sans mt-1 ${(data?.financials?.netOperatingProfit || 0) >= 0 ? 'text-white' : 'text-red-400'}`}>
                {formatCurrency(data?.financials?.netOperatingProfit || 0)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#181B22] border border-white/[0.04]">
              <div className="text-[10px] font-mono text-[#8A94A6]">Proposals Awaiting Approval</div>
              <div className="text-base font-bold font-sans text-zinc-300 mt-1">
                {data?.todayAtKapitech?.proposalsAwaitingCount || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. ACTIVE PROJECTS STATUS (DELIVERY HEALTH) */}
      {/* ------------------------------------------------------------- */}
      <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-sans text-white flex items-center gap-2">
              <Layers size={15} className="text-[#FF1E27]" />
              <span>{language === 'id' ? 'Status Eksekusi Proyek Klien' : 'Client Project Delivery Status'}</span>
            </h3>
            <p className="text-[10px] font-mono text-[#8A94A6] mt-0.5">Current active engagements from project registry</p>
          </div>
          <Link
            to="/admin/projects"
            className="text-xs font-mono text-[#FF1E27] hover:underline flex items-center gap-1"
          >
            <span>All Projects</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#8A94A6] rounded-lg bg-[#181B22]/30 border border-white/[0.04]">
            No active projects currently enrolled in registry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.07] text-[10px] font-mono text-[#8A94A6] uppercase">
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Health</th>
                  <th className="py-2.5 px-3">Budget / Value</th>
                  <th className="py-2.5 px-3">Deadline</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {recentProjects.map((p) => {
                  const isAtRisk = p.health === 'At Risk' || p.health === 'Delayed';
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[220px]">{p.title || p.name || 'Untitled Project'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                        {p.client || 'Internal'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          p.health === 'On Track'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isAtRisk
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {p.health || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-white">
                        {formatCurrency(p.contractValue || p.budget || 0)}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#8A94A6]">
                        {p.deadline || p.targetDeliveryDate || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate('/admin/projects')}
                          className="text-[11px] font-mono text-[#FF1E27] hover:underline"
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
      <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-sans text-white flex items-center gap-2">
              <Activity size={15} className="text-[#FF1E27]" />
              <span>{language === 'id' ? 'Log Aktivitas Sistem & Audit Trail' : 'System Audit Trail & Operations Feed'}</span>
            </h3>
            <p className="text-[10px] font-mono text-[#8A94A6] mt-0.5">Authoritative events recorded by server audit engine</p>
          </div>
          <Link
            to="/admin/settings"
            className="text-xs font-mono text-[#8A94A6] hover:text-white flex items-center gap-1"
          >
            <span>Full Audit Logs</span>
            <ExternalLink size={11} />
          </Link>
        </div>

        <div className="space-y-2">
          {recentLogs.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-[#8A94A6]">
              No audit activities recorded.
            </div>
          ) : (
            recentLogs.slice(0, 6).map((log, idx) => (
              <div key={log.id || idx} className="p-2.5 rounded-lg bg-[#181B22] border border-white/[0.04] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    log.severity === 'danger' ? 'bg-red-500' : log.severity === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className="font-bold text-white uppercase text-[10px] shrink-0">{log.action}</span>
                  <span className="text-[#8A94A6] truncate">{log.details || log.message}</span>
                </div>
                <div className="text-[10px] text-[#8A94A6] shrink-0 ml-2">
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
