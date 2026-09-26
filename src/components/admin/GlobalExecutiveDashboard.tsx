import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  CircleDollarSign,
  ClipboardCheck,
  FolderKanban,
  RefreshCw,
  ShieldAlert,
  WalletCards,
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
  financials: {
    revenueThisMonth: number | null;
    cashCollected: number | null;
    outstandingReceivables: number | null;
    operatingExpenses: number | null;
    netOperatingProfit: number | null;
    margin: string | null;
  };
  pipelineByStage: Array<{ stage: string; count: number; value: number }>;
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

const cardClass = 'rounded-card border border-line bg-panel p-4';
const ghostLinkClass = 'inline-flex min-h-10 items-center gap-1.5 rounded-control px-2.5 text-xs font-medium text-muted transition-colors hover:bg-bg hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

function EmptyState({
  icon: Icon,
  message,
  description,
  action,
}: {
  icon: React.ElementType;
  message: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[176px] flex-col items-center justify-center rounded-card border border-line bg-bg px-4 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-control border border-line bg-panel text-muted">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <p className="mt-3 text-sm font-medium text-fg">{message}</p>
      {description && (
        <p className="mt-1 max-w-[52ch] text-xs leading-relaxed text-muted">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  meta,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone: 'accent' | 'success' | 'warning' | 'info';
  meta?: React.ReactNode;
}) {
  const iconClasses = {
    accent: 'border-accent/25 bg-accent/10 text-accent-text',
    success: 'border-success/25 bg-success/10 text-success',
    warning: 'border-warning/25 bg-warning/10 text-warning',
    info: 'border-info/25 bg-info/10 text-info',
  }[tone];

  return (
    <section className="min-w-0 bg-transparent" aria-label={label}>
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 text-xs leading-4 text-muted">{label}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-control border ${iconClasses}`} aria-hidden="true">
          <Icon size={16} strokeWidth={1.8} />
        </span>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-medium leading-8 tracking-tight tabular-nums text-fg">{value}</div>
        {meta && <div className="mt-1 text-xs leading-4 text-muted">{meta}</div>}
      </div>
    </section>
  );
}

function Card({
  title,
  action,
  children,
  className = '',
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`${cardClass} ${className}`}>
      <div className="flex min-h-7 items-center justify-between gap-3">
        <h2 className="text-sm font-semibold leading-5 text-fg">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export const GlobalExecutiveDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ExecutiveOverviewData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCurrencyChange = (event: Event) => {
      const custom = event as CustomEvent<{ currency: CurrencyCode }>;
      if (custom.detail?.currency) setCurrency(custom.detail.currency);
    };
    window.addEventListener(CURRENCY_EVENT, handleCurrencyChange);
    return () => window.removeEventListener(CURRENCY_EVENT, handleCurrencyChange);
  }, []);

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.executive.getOverview();
      if (response.success) {
        const payload = (response.data || response) as ExecutiveOverviewData;
        setData(payload);
        setLastRefreshed(new Date());
      } else {
        setError(response.error || 'Failed to load executive metrics.');
      }
    } catch {
      setError('Network communication failed while fetching executive overview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchOverview();
  }, []);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return language === 'id' ? 'Terbatas' : 'Restricted';
    if (currency === 'USD') return `$${Math.round(value / 16000).toLocaleString('en-US')}`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const metrics = data?.metrics ?? {
    revenueCollected: 0,
    totalBilled: 0,
    outstandingReceivables: 0,
    overdueReceivables: 0,
    activePipeline: 0,
    activeProjects: 0,
    projectsAtRisk: 0,
    pendingApprovals: 0,
    overdueTasks: 0,
    openLeads: 0,
  };

  const financials = data?.financials ?? {
    revenueThisMonth: 0,
    cashCollected: 0,
    outstandingReceivables: 0,
    operatingExpenses: 0,
    netOperatingProfit: 0,
    margin: '0%',
  };

  const attentionItems = data?.attentionItems ?? [];
  const pipelineStages = data?.pipelineByStage ?? [];
  const projects = data?.projects ?? [];
  const recentActivity = data?.recentActivity ?? [];

  const retryLabel = language === 'id' ? 'Coba lagi' : 'Retry';
  const openCrmLabel = language === 'id' ? 'Buka CRM' : 'Open CRM';
  const invoicingLabel = language === 'id' ? 'Invoicing' : 'Invoicing';
  const projectsLabel = language === 'id' ? 'Semua proyek' : 'All Projects';
  const auditLabel = language === 'id' ? 'Log audit lengkap' : 'Full Audit Logs';

  return (
    <div className="space-y-6">
      <header className="ams-page-header flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="ams-page-title text-xl font-semibold leading-7 tracking-tight text-fg">
            <BarChart3 aria-hidden="true" />
            <span>Executive Overview &amp; Operations</span>
          </h1>
          <p className="mt-1 text-xs leading-4 text-muted">
            Current operational snapshot for pipeline, receivables, project delivery, and priorities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="text-[11px] leading-4 text-muted tabular-nums">
            Synced {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            type="button"
            onClick={() => void fetchOverview()}
            disabled={isLoading}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-control border border-line bg-transparent px-3 text-xs font-medium text-muted transition-[background-color,border-color,color,transform] hover:bg-panel hover:text-fg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-accent-text' : ''} />
            {isLoading ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-card border border-danger bg-danger/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <ShieldAlert className="mt-0.5 shrink-0 text-danger" size={17} />
          <p className="text-xs leading-5 text-fg">MFA is required before accessing protected AMS functions.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => void fetchOverview()}
            disabled={isLoading}
            className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-control border border-danger/40 bg-danger/10 px-3 text-xs font-semibold text-danger transition-colors hover:bg-danger/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger sm:w-auto"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Retrying...' : retryLabel}
          </button>
          <Link
            to="/admin/settings?tab=security"
            className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-control border border-line bg-panel px-3 text-xs font-medium text-muted transition-colors hover:bg-panel-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
          >
            Security &amp; MFA <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-card border border-danger bg-danger/10 px-4 py-3 text-xs leading-5 text-fg" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-[900px]:grid-cols-3 min-[1100px]:grid-cols-4">
        <MetricCard
          label="Revenue Collected"
          value={formatCurrency(metrics.revenueCollected)}
          icon={CircleDollarSign}
          tone="accent"
          meta={<>Billed total: <span className="font-medium tabular-nums text-fg">{formatCurrency(metrics.totalBilled)}</span></>}
        />
        <MetricCard
          label="Outstanding Receivables"
          value={formatCurrency(metrics.outstandingReceivables)}
          icon={WalletCards}
          tone="warning"
          meta={metrics.overdueReceivables > 0 ? (
            <span className="inline-flex items-center gap-1 text-danger">
              <AlertTriangle size={12} />
              {formatCurrency(metrics.overdueReceivables)} overdue
            </span>
          ) : 'All within payment terms'}
        />
        <MetricCard
          label="Active Pipeline"
          value={formatCurrency(metrics.activePipeline)}
          icon={FolderKanban}
          tone="info"
          meta={<>Active deals: <span className="font-medium tabular-nums text-fg">{data?.pipelineByStage?.reduce((sum, stage) => sum + stage.count, 0) || 0}</span></>}
        />
        <MetricCard
          label="Active Projects"
          value={metrics.activeProjects}
          icon={ClipboardCheck}
          tone="success"
          meta={metrics.projectsAtRisk > 0 ? (
            <span className="text-warning">{metrics.projectsAtRisk} at risk</span>
          ) : (
            <span className="text-success">No risk flags</span>
          )}
        />
      </div>

      <Card
        title="Executive Action Priorities"
        action={
          <span className="rounded-badge bg-success/10 px-2 py-0.5 text-[10px] font-semibold leading-4 text-success">
            {attentionItems.length}
          </span>
        }
      >
        {attentionItems.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            message="No action required."
            description="No overdue invoices, blocked projects, or pending approvals."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {attentionItems.map((item) => (
              <div key={item.id} className="rounded-control border border-line bg-bg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-badge px-1.5 py-0.5 text-[10px] font-semibold leading-4 ${item.severity === 'danger' ? 'bg-danger/10 text-danger' : item.severity === 'warning' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
                        {item.category}
                      </span>
                      <h3 className="text-xs font-semibold text-fg">{item.title}</h3>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted">{item.description}</p>
                  </div>
                  <Link to={item.linkUrl} className={ghostLinkClass}>
                    Resolve <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <Card
          title="Sales Pipeline by Stage"
          className="lg:col-span-3"
          action={
            <Link to="/admin/crm" className={ghostLinkClass}>
              {openCrmLabel} <ArrowUpRight size={13} />
            </Link>
          }
        >
          {pipelineStages.length === 0 ? (
            <EmptyState icon={FolderKanban} message="No deals currently in pipeline." />
          ) : (
            <div className="divide-y divide-line rounded-control border border-line">
              {pipelineStages.map((stage) => (
                <div key={stage.stage} className="flex items-center justify-between gap-4 px-3 py-3 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <span className="truncate text-fg">{stage.stage}</span>
                    <span className="shrink-0 text-muted tabular-nums">{stage.count}</span>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums text-fg">{formatCurrency(stage.value)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Financial Operating Summary"
          className="lg:col-span-2"
          action={
            <Link to="/admin/invoicing" className={ghostLinkClass}>
              {invoicingLabel} <ArrowUpRight size={13} />
            </Link>
          }
        >
          <div className="grid grid-cols-2 divide-x divide-y divide-line rounded-control border border-line">
            <div className="min-w-0 p-3">
              <span className="text-xs text-muted">OpEx</span>
              <p className="mt-1 truncate text-sm font-medium tabular-nums text-fg">{formatCurrency(financials.operatingExpenses)}</p>
            </div>
            <div className="min-w-0 p-3">
              <span className="text-xs text-muted">Net Margin</span>
              <p className="mt-1 truncate text-sm font-medium tabular-nums text-fg">{financials.margin ?? '0%'}</p>
            </div>
            <div className="min-w-0 p-3">
              <span className="text-xs text-muted">Profit</span>
              <p className="mt-1 truncate text-sm font-medium tabular-nums text-fg">{formatCurrency(financials.netOperatingProfit)}</p>
            </div>
            <div className="min-w-0 p-3">
              <span className="text-xs text-muted">Proposals</span>
              <p className="mt-1 text-sm font-medium tabular-nums text-fg">{data?.metrics.pendingApprovals ?? 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Client Project Delivery Status"
        action={
          <Link to="/admin/projects" className={ghostLinkClass}>
            {projectsLabel} <ArrowUpRight size={13} />
          </Link>
        }
      >
        {projects.length === 0 ? (
          <EmptyState icon={FolderKanban} message="No active projects currently enrolled in registry." />
        ) : (
          <div className="overflow-hidden rounded-control border border-line">
            {projects.slice(0, 6).map((project, index) => (
              <div key={project.id ?? index} className="flex flex-col gap-2 border-b border-line px-3 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-fg">{project.name ?? project.title ?? 'Untitled project'}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">{project.clientName ?? project.client ?? 'Client'}</p>
                </div>
                <span className="text-xs text-muted">{project.status ?? 'Active'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="System Audit Trail & Operations Feed"
        action={
          <Link to="/admin/settings" className={ghostLinkClass}>
            {auditLabel} <ArrowUpRight size={13} />
          </Link>
        }
      >
        {recentActivity.length === 0 ? (
          <EmptyState icon={Activity} message="No audit events recorded yet." />
        ) : (
          <div className="overflow-hidden rounded-control border border-line">
            {recentActivity.slice(0, 8).map((event, index) => (
              <div key={event.id ?? index} className="flex items-start gap-3 border-b border-line px-3 py-3 last:border-b-0">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-control border border-line bg-bg text-muted">
                  <Activity size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs leading-5 text-fg">{event.action ?? event.title ?? 'System activity'}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted">{event.description ?? event.actor ?? 'AMS operation'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="sr-only" aria-live="polite">
        {isLoading ? 'Refreshing executive dashboard' : 'Executive dashboard ready'}
      </div>
    </div>
  );
};
export default GlobalExecutiveDashboard;
