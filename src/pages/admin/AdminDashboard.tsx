import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  TrendingUp, 
  Users, 
  FolderKanban, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  MessageSquare, 
  Briefcase, 
  Globe, 
  Sparkles,
  ShieldCheck,
  Plus,
  Mail,
  Send,
  Calendar,
  Activity,
  ChevronRight,
  ExternalLink,
  DollarSign,
  Download,
  Flame,
  Check,
  TrendingDown
} from 'lucide-react';
import { subscribeToInbox, ContactSubmission, submitToInbox } from '../../lib/submissions';
import { getAuditLogs, SecurityAuditLog } from '../../lib/adminAuth';
import { getCmsProjects } from '../../lib/cmsStore';
import { 
  CrmLead, 
  getCmsLeads, 
  computeCrmMetrics, 
  formatIDR, 
  formatShortIDR, 
  CRM_STAGE_DEFINITIONS,
  exportCrmLeadsToCsv,
  CRM_EVENT_NAME 
} from '../../lib/crmStore';
import { useLanguage } from '../../lib/LanguageContext';

export const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [crmLeads, setCrmLeads] = useState<CrmLead[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [testSending, setTestSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1. Subscribe to submissions
    const unsub = subscribeToInbox((items) => {
      setSubmissions(items);
    });

    // 2. Load CRM Leads & metrics
    const loadCrm = () => setCrmLeads(getCmsLeads());
    loadCrm();
    window.addEventListener(CRM_EVENT_NAME, loadCrm);

    // 3. Load audit logs & CMS count
    setAuditLogs(getAuditLogs());
    setProjectsCount(getCmsProjects().length);

    return () => {
      unsub();
      window.removeEventListener(CRM_EVENT_NAME, loadCrm);
    };
  }, []);

  // Compute metrics
  const totalLeads = submissions.length;
  const unreadLeads = submissions.filter(s => s.status === 'new').length;
  const inReviewLeads = submissions.filter(s => s.status === 'in-review').length;
  const contactedLeads = submissions.filter(s => s.status === 'contacted').length;
  const closedLeads = submissions.filter(s => s.status === 'closed').length;

  const clientInquiries = submissions.filter(s => !s.type || s.type === 'inquiry').length;
  const careerApplications = submissions.filter(s => s.type === 'career').length;
  const vendorSubmissions = submissions.filter(s => s.type === 'vendor').length;
  const newsletterSubmissions = submissions.filter(s => s.type === 'newsletter').length;

  const crmMetrics = computeCrmMetrics(crmLeads);

  const handleSimulateLead = async () => {
    setTestSending(true);
    try {
      const sampleNames = ['Pratama Wijaya', 'Nathalie Chen', 'Hendro Salim', 'Karin Sudarsono'];
      const sampleCompanies = ['PT Fintek Inovasi Asia', 'Aura Luxury Estates', 'Nexus Supply Logistics', 'Vanguard Studio'];
      const sampleServices = [['UI/UX Design', 'MVP Development'], ['Company Profile Website'], ['ERP / CRM System'], ['Branding & Identity']];
      
      const rand = Math.floor(Math.random() * sampleNames.length);
      await submitToInbox({
        fullName: sampleNames[rand],
        email: `${sampleNames[rand].toLowerCase().replace(/\s+/g, '.')}@client.com`,
        company: sampleCompanies[rand],
        phone: '+62 812-9876-' + Math.floor(1000 + Math.random() * 9000),
        services: sampleServices[rand],
        budget: '$10,000 - $25,000',
        message: 'Halo Kapitech, kami tertarik mendiskusikan pengembangan produk digital baru kami. Mohon feedback dan estimasi jadwal kerja sama.',
        source: 'Admin Simulated Live Lead',
        type: 'inquiry'
      });
      setStatusMsg('Lead simulasi baru berhasil dibuat dan masuk ke database.');
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err) {
      console.debug('Simulation error:', err);
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. WELCOME BANNER & QUICK ACTIONS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-[#16181D] border border-[#262930] p-5 sm:p-6 lg:p-7 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-brand-red/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-red text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck size={16} />
            <span>Master Control Subsystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Kapitech Studio Executive Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#8A909D] mt-1.5 max-w-xl leading-relaxed">
            Pantau pertumbuhan valuasi pipeline deal (IDR), prospek klien inbound, status proposal, dan portofolio digital studio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={handleSimulateLead}
            disabled={testSending}
            className="px-3.5 py-2.5 rounded-xl bg-[#0B0C0E] hover:bg-[#1E222A] text-white border border-[#262930] text-xs font-mono transition-all flex items-center gap-2"
          >
            <Plus size={14} className={testSending ? 'animate-spin text-brand-red' : 'text-brand-red'} />
            <span>{testSending ? (language === 'id' ? 'Membuat Lead...' : 'Generating...') : (language === 'id' ? 'Simulasi Lead Klien' : 'Simulate Client Lead')}</span>
          </button>

          <button
            onClick={() => exportCrmLeadsToCsv(crmLeads)}
            className="px-3.5 py-2.5 rounded-xl bg-[#0B0C0E] hover:bg-[#1E222A] text-white border border-[#262930] text-xs font-mono transition-all flex items-center gap-1.5"
            title="Download CSV CRM"
          >
            <Download size={14} className="text-[#8A909D]" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/admin/crm"
            className="px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-red/20"
          >
            <Briefcase size={14} />
            <span>Buka CRM Pipeline</span>
          </Link>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-300">
          <Check size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. PRIMARY ANALYTICS METRICS WIDGETS (1 Col Mobile, 2 Col Tablet, 4 Col Desktop) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Total Pipeline Value in IDR */}
        <div className="bg-[#16181D] border border-[#262930] p-5 sm:p-6 rounded-2xl flex flex-col justify-between h-full group hover:border-[#383C46] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Total Pipeline Value</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight break-words">
              {formatIDR(crmMetrics.totalPipelineValue)}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8A909D] mt-4 pt-3 border-t border-[#262930] font-mono">
            <span>{crmMetrics.activeDealsCount} Prospek Aktif</span>
            <span className="text-emerald-400 font-semibold">Weighted: {formatShortIDR(crmMetrics.weightedPipelineValue)}</span>
          </div>
        </div>

        {/* Metric 2: Closed Won Revenue */}
        <div className="bg-[#16181D] border border-[#262930] p-5 sm:p-6 rounded-2xl flex flex-col justify-between h-full group hover:border-[#383C46] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Closed Won (Deals)</span>
              <div className="w-8 h-8 rounded-lg bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight break-words">
              {formatIDR(crmMetrics.totalWonValue)}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8A909D] mt-4 pt-3 border-t border-[#262930] font-mono">
            <span>{crmMetrics.wonDealsCount} Kontrak Deal</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              <span>Win Rate {crmMetrics.winRate}%</span>
            </span>
          </div>
        </div>

        {/* Metric 3: Total Submissions & Inquiries */}
        <div className="bg-[#16181D] border border-[#262930] p-5 sm:p-6 rounded-2xl flex flex-col justify-between h-full group hover:border-[#383C46] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Inbound Leads</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Inbox size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-display font-bold text-white">{totalLeads}</span>
              <span className="text-xs font-mono text-emerald-400 flex items-center">
                <TrendingUp size={12} className="mr-0.5" />
                Live Sync
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8A909D] mt-4 pt-3 border-t border-[#262930] font-mono">
            <span className="text-rose-400 font-bold">{unreadLeads} unread</span>
            <span>{contactedLeads} contacted</span>
          </div>
        </div>

        {/* Metric 4: CMS Case Studies */}
        <div className="bg-[#16181D] border border-[#262930] p-5 sm:p-6 rounded-2xl flex flex-col justify-between h-full group hover:border-[#383C46] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Portofolio CMS</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FolderKanban size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-display font-bold text-white">{projectsCount}</span>
              <span className="text-xs font-mono text-purple-300">Case Studies</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8A909D] mt-4 pt-3 border-t border-[#262930] font-mono">
            <span>Avg Deal: {formatShortIDR(crmMetrics.avgDealSize)}</span>
            <span className="text-emerald-400">Published</span>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CRM DEAL PIPELINE & FUNNEL BREAKDOWN */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: CRM Stage Funnel */}
        <div className="lg:col-span-7 bg-[#16181D] border border-[#262930] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-[#262930]">
              <div>
                <h3 className="font-display font-bold text-white text-base sm:text-lg flex items-center gap-2">
                  <Briefcase size={17} className="text-brand-red" />
                  <span>Agency CRM Pipeline Stages</span>
                </h3>
                <p className="text-xs text-[#8A909D] mt-0.5">Tahapan konversi deal dan nilai kumulatif per status</p>
              </div>
              <Link to="/admin/crm" className="text-xs font-mono text-brand-red hover:underline flex items-center gap-1">
                <span>Kanban Board</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {CRM_STAGE_DEFINITIONS.map((s) => {
                const stageDeals = crmLeads.filter(l => l.stage === s.key);
                const stageSum = stageDeals.reduce((sum, l) => sum + (l.dealValue || 0), 0);
                const percentage = crmMetrics.totalPipelineValue > 0 
                  ? Math.round((stageSum / crmMetrics.totalPipelineValue) * 100) 
                  : 0;

                return (
                  <div key={s.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#D0D4DC] flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          s.key === 'won' ? 'bg-emerald-400' :
                          s.key === 'new' ? 'bg-rose-400 animate-pulse' :
                          s.key === 'negotiation' ? 'bg-purple-400' :
                          s.key === 'proposal' ? 'bg-blue-400' :
                          s.key === 'contacted' ? 'bg-amber-400' : 'bg-zinc-500'
                        }`} />
                        <span>{s.labelId} ({stageDeals.length})</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-semibold">{formatShortIDR(stageSum)}</span>
                        <span className="text-[10px] text-[#5C626E]">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0B0C0E] overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          s.key === 'won' ? 'bg-emerald-500' :
                          s.key === 'new' ? 'bg-rose-500' :
                          s.key === 'negotiation' ? 'bg-purple-500' :
                          s.key === 'proposal' ? 'bg-blue-500' :
                          s.key === 'contacted' ? 'bg-amber-500' : 'bg-zinc-600'
                        }`}
                        style={{ width: `${Math.max(percentage, stageDeals.length > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#262930] flex flex-wrap items-center justify-between text-xs font-mono text-[#8A909D] gap-2">
            <span>Total CRM Database: {crmLeads.length} Deals</span>
            <span className="text-emerald-400 font-semibold">Total Pipeline: {formatIDR(crmMetrics.totalPipelineValue)}</span>
          </div>
        </div>

        {/* Right: Submission by Form Category */}
        <div className="lg:col-span-5 bg-[#16181D] border border-[#262930] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="mb-5 pb-3.5 border-b border-[#262930]">
              <h3 className="font-display font-bold text-white text-base sm:text-lg">Kategori Formulir Masuk</h3>
              <p className="text-xs text-[#8A909D] mt-0.5">Distribusi tipe lead dari seluruh halaman website</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              
              <div className="p-4 rounded-xl bg-[#0B0C0E] border border-[#262930]">
                <div className="flex items-center gap-2 text-brand-red text-xs font-mono mb-1.5">
                  <MessageSquare size={14} />
                  <span>Konsultasi Klien</span>
                </div>
                <div className="text-2xl font-display font-bold text-white">{clientInquiries}</div>
                <p className="text-[10px] text-[#8A909D] font-mono mt-1">Form /contact</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0C0E] border border-[#262930]">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-mono mb-1.5">
                  <Briefcase size={14} />
                  <span>Lamaran Karir</span>
                </div>
                <div className="text-2xl font-display font-bold text-white">{careerApplications}</div>
                <p className="text-[10px] text-[#8A909D] font-mono mt-1">Form /careers</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0C0E] border border-[#262930]">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1.5">
                  <Globe size={14} />
                  <span>Freelance Talent</span>
                </div>
                <div className="text-2xl font-display font-bold text-white">{vendorSubmissions}</div>
                <p className="text-[10px] text-[#8A909D] font-mono mt-1">Vendor network</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0C0E] border border-[#262930]">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1.5">
                  <Sparkles size={14} />
                  <span>Newsletter</span>
                </div>
                <div className="text-2xl font-display font-bold text-white">{newsletterSubmissions}</div>
                <p className="text-[10px] text-[#8A909D] font-mono mt-1">Subscribers</p>
              </div>

            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-[#0B0C0E] border border-[#262930] flex flex-wrap items-center justify-between text-xs font-mono gap-2">
            <span className="text-[#8A909D]">Forwarding Target:</span>
            <span className="text-white font-bold">kapitechagency@gmail.com</span>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. HIGH PRIORITY DEALS & RECENT INBOX STREAM */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Top High-Value Pipeline Deals */}
        <div className="lg:col-span-7 bg-[#16181D] border border-[#262930] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262930]">
            <div>
              <h3 className="font-display font-bold text-white text-base sm:text-lg">Top Active CRM Deals</h3>
              <p className="text-xs text-[#8A909D] mt-0.5">Prospek bernilai tinggi dalam pipeline aktif</p>
            </div>
            <Link to="/admin/crm" className="text-xs font-mono text-brand-red hover:underline">
              Lihat Semua ({crmLeads.length})
            </Link>
          </div>

          {crmLeads.length === 0 ? (
            <div className="py-12 text-center text-[#8A909D] text-xs font-mono border border-dashed border-[#262930] rounded-xl">
              Belum ada deal di CRM.
            </div>
          ) : (
            <div className="space-y-2.5">
              {crmLeads.slice(0, 5).map((deal) => (
                <Link
                  key={deal.id}
                  to="/admin/crm"
                  className="p-3.5 rounded-xl bg-[#0B0C0E] border border-[#262930] hover:border-[#383C46] transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        deal.stage === 'won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        deal.stage === 'negotiation' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                        deal.stage === 'proposal' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                        'bg-[#16181D] text-[#8A909D] border border-[#262930]'
                      }`}>
                        {deal.stage.toUpperCase()}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-brand-red transition-colors">
                        {deal.clientName}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#8A909D] truncate">
                      {deal.company} • {deal.servicePillar}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-emerald-400 font-display">
                      {formatIDR(deal.dealValue)}
                    </div>
                    <div className="text-[10px] font-mono text-[#5C626E]">
                      {deal.priority.toUpperCase()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Security & Activity Audit Log */}
        <div className="lg:col-span-5 bg-[#16181D] border border-[#262930] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262930]">
            <div>
              <h3 className="font-display font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <Activity size={17} className="text-brand-red" />
                <span>Security Audit Trail</span>
              </h3>
              <p className="text-xs text-[#8A909D] mt-0.5">Log aktivitas autentikasi & sistem</p>
            </div>
            <Link to="/admin/settings" className="text-xs font-mono text-brand-red hover:underline">
              Kelola
            </Link>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-[#8A909D] text-xs font-mono border border-dashed border-[#262930] rounded-xl">
              Audit log bersih. Belum ada aktivitas tercatat.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {auditLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#0B0C0E] border border-[#262930] text-xs font-mono"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#5C626E] mb-1">
                    <span className={`font-bold ${
                      log.severity === 'critical' ? 'text-red-400' : log.severity === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {log.action}
                    </span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-[#D0D4DC] leading-snug">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default AdminDashboard;
