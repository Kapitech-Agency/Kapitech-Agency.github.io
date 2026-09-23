import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  Download, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Layers, 
  Check, 
  X,
  Send,
  Kanban,
  List,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  GripVertical,
  ArrowRight
} from 'lucide-react';
import { 
  CrmLead, 
  CrmStage, 
  CrmPriority, 
  CrmServicePillar, 
  CrmSource, 
  CRM_STAGE_DEFINITIONS, 
  getCmsLeads, 
  saveCrmLead, 
  deleteCrmLead, 
  updateLeadStage, 
  addLeadNote, 
  computeCrmMetrics, 
  exportCrmLeadsToCsv,
  CRM_EVENT_NAME 
} from '../../lib/crmStore';
import { useLanguage } from '../../lib/LanguageContext';
import { useDragToScroll } from '../../lib/useDragToScroll';
import { ScrollShadowContainer } from '../../components/ui/ScrollShadowContainer';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { formatAmount, getActiveCurrency, setGlobalCurrency, CurrencyCode, CURRENCY_EVENT } from '../../lib/currency';
import { api } from '../../lib/apiClient';
import { hasAdminPermission } from '../../lib/adminAuth';

export const AdminCrm: React.FC = () => {
  const { language, t } = useLanguage();
  const kanbanScrollRef = useDragToScroll<HTMLDivElement>();
  const canManageCrm = hasAdminPermission('canManageCrm');
  const canConvertWonDeal = canManageCrm && hasAdminPermission('canManageProjects') && hasAdminPermission('canManageInvoices') && hasAdminPermission('canManageClients');
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('All');
  
  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<CrmStage | null>(null);

  // Modals & Drawer
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State for Add/Edit
  const [formClientName, setFormClientName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPillar, setFormPillar] = useState<CrmServicePillar>('Web Development');
  const [formDealValue, setFormDealValue] = useState<number>(45000000);
  const [formStage, setFormStage] = useState<CrmStage>('new');
  const [formPriority, setFormPriority] = useState<CrmPriority>('medium');
  const [formSource, setFormSource] = useState<CrmSource>('Website Form');
  const [formDescription, setFormDescription] = useState('');
  const [formExpectedClose, setFormExpectedClose] = useState('');

  const loadLeads = () => {
    setLeads(getCmsLeads());
  };

  useEffect(() => {
    loadLeads();
    const handleUpdate = () => loadLeads();
    window.addEventListener(CRM_EVENT_NAME, handleUpdate);

    const handleCurr = (e: Event) => {
      const custom = e as CustomEvent<{ currency: CurrencyCode }>;
      if (custom.detail?.currency) {
        setCurrency(custom.detail.currency);
      }
    };
    window.addEventListener(CURRENCY_EVENT, handleCurr);

    return () => {
      window.removeEventListener(CRM_EVENT_NAME, handleUpdate);
      window.removeEventListener(CURRENCY_EVENT, handleCurr);
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleCurrencyToggle = (code: CurrencyCode) => {
    setGlobalCurrency(code);
  };

  const cleanPhone = (phone?: string) => {
    if (!phone) return '';
    let p = phone.replace(/[^0-9]/g, '');
    if (p.startsWith('0')) {
      p = '62' + p.substring(1);
    }
    return p;
  };

  // Metrics
  const metrics = useMemo(() => computeCrmMetrics(leads), [leads]);

  // Dynamic stage conversion funnel rates
  const funnelStats = useMemo(() => {
    const total = leads.length;
    if (total === 0) {
      return { leadToScope: 82, scopeToPitch: 71, pitchToSow: 60, sowToWon: 75 };
    }
    const pastNew = leads.filter(l => l.stage !== 'new').length;
    const pastContacted = leads.filter(l => ['proposal', 'negotiation', 'won', 'lost'].includes(l.stage)).length;
    const pastProposal = leads.filter(l => ['negotiation', 'won', 'lost'].includes(l.stage)).length;
    const wonCount = leads.filter(l => l.stage === 'won').length;

    return {
      leadToScope: Math.max(10, Math.min(100, Math.round((pastNew / total) * 100) || 82)),
      scopeToPitch: Math.max(10, Math.min(100, Math.round((pastContacted / Math.max(1, pastNew)) * 100) || 71)),
      pitchToSow: Math.max(10, Math.min(100, Math.round((pastProposal / Math.max(1, pastContacted)) * 100) || 60)),
      sowToWon: Math.max(10, Math.min(100, Math.round((wonCount / Math.max(1, pastProposal)) * 100) || 75))
    };
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          lead.clientName.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          (lead.email && lead.email.toLowerCase().includes(q)) ||
          (lead.description && lead.description.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }
      if (selectedPillar !== 'All' && lead.servicePillar !== selectedPillar) return false;
      if (selectedPriority !== 'All' && lead.priority !== selectedPriority) return false;
      if (selectedStageFilter !== 'All' && lead.stage !== selectedStageFilter) return false;
      return true;
    });
  }, [leads, searchQuery, selectedPillar, selectedPriority, selectedStageFilter]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLeadId(leadId);
  };

  const handleDragOverColumn = (e: React.DragEvent, stageKey: CrmStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageKey) {
      setDragOverStage(stageKey);
    }
  };

  const handleDragLeaveColumn = () => {
    setDragOverStage(null);
  };

  const handleDropOnColumn = (e: React.DragEvent, stageKey: CrmStage) => {
    e.preventDefault();
    if (!canManageCrm) return;
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      handleStageChange(leadId, stageKey);
    }
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  const handleStageChange = async (leadId: string, newStage: CrmStage) => {
    if (!canManageCrm) return;
    try {
      await updateLeadStage(leadId, newStage);
    } catch (error: any) {
      showToast(error?.message || (language === 'id' ? 'Gagal memperbarui tahap deal.' : 'Failed to update deal stage.'));
      return;
    }
    const stageDef = CRM_STAGE_DEFINITIONS.find(s => s.key === newStage);
    const stageName = language === 'id' ? (stageDef?.labelId || newStage) : (stageDef?.label || newStage);
    showToast(language === 'id' ? `Tahap deal diperbarui ke ${stageName}` : `Lead stage updated to ${stageName}`);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, stage: newStage } : null);
    }
  };

  const handleConvertToProject = async (lead: CrmLead) => {
    if (convertingLeadId || !canConvertWonDeal) return;
    setConvertingLeadId(lead.id);

    try {
      const res = await api.crm.convertWonDeal(lead.id);
      if (!res.success || !res.data?.project || !res.data?.invoice || !res.data?.client) {
        throw new Error(res.error || 'Deal conversion failed.');
      }

      showToast(
        res.data.replayed
          ? (language === 'id'
            ? 'Deal ini sudah dikonversi. Data operasional yang sama dikembalikan.'
            : 'This deal was already converted. The existing operational records were returned.')
          : (language === 'id'
            ? 'Deal berhasil dikonversi secara atomic ke Client, Project, dan Invoice.'
            : 'Deal was atomically converted to Client, Project, and Invoice.')
      );
      await loadLeads();
    } catch (error: any) {
      showToast(
        error?.message ||
        (language === 'id'
          ? 'Konversi deal gagal. Tidak ada record parsial yang dibuat.'
          : 'Deal conversion failed. No partial records were created.')
      );
    } finally {
      setConvertingLeadId(null);
    }
  };

  const handleOpenLeadDrawer = (lead: CrmLead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const handleOpenAddModal = (initialStage: CrmStage = 'new') => {
    setEditingLead(null);
    setFormClientName('');
    setFormCompany('');
    setFormEmail('');
    setFormPhone('');
    setFormPillar('Web Development');
    setFormDealValue(45000000);
    setFormStage(initialStage);
    setFormPriority('medium');
    setFormSource('Website Form');
    setFormDescription('');
    setFormExpectedClose('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (lead: CrmLead) => {
    setEditingLead(lead);
    setFormClientName(lead.clientName);
    setFormCompany(lead.company);
    setFormEmail(lead.email || '');
    setFormPhone(lead.phone || '');
    setFormPillar(lead.servicePillar);
    setFormDealValue(lead.dealValue);
    setFormStage(lead.stage);
    setFormPriority(lead.priority);
    setFormSource(lead.source);
    setFormDescription(lead.description || '');
    setFormExpectedClose(lead.expectedCloseDate || '');
    setIsAddModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCrm) return;
    if (!formClientName.trim() || !formCompany.trim()) {
      alert(language === 'id' ? 'Nama klien dan perusahaan wajib diisi.' : 'Client name and company are required.');
      return;
    }

    const leadData: CrmLead = {
      id: editingLead ? editingLead.id : 'lead_' + Date.now().toString(36),
      clientName: formClientName,
      company: formCompany,
      email: formEmail,
      phone: formPhone,
      servicePillar: formPillar,
      dealValue: Number(formDealValue) || 0,
      stage: formStage,
      priority: formPriority,
      source: formSource,
      description: formDescription,
      expectedCloseDate: formExpectedClose,
      assignedTo: editingLead ? editingLead.assignedTo : 'Principal Tech Lead',
      notes: editingLead ? editingLead.notes : [],
      createdAt: editingLead ? editingLead.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await saveCrmLead(leadData);
      setIsAddModalOpen(false);
      showToast(editingLead ? (language === 'id' ? 'Data prospek berhasil diperbarui.' : 'Deal updated successfully.') : (language === 'id' ? 'Deal prospek baru berhasil dibuat.' : 'New deal created successfully.'));
    } catch (error: any) {
      showToast(error?.message || (language === 'id' ? 'Gagal menyimpan deal.' : 'Failed to save deal.'));
    }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!canManageCrm) return;
    if (window.confirm(language === 'id' ? `Hapus prospek ${name}?` : `Delete lead ${name}?`)) {
      try {
        await deleteCrmLead(id);
      } catch (error: any) {
        showToast(error?.message || (language === 'id' ? 'Gagal menghapus deal.' : 'Failed to delete deal.'));
        return;
      }
      if (selectedLead && selectedLead.id === id) {
        setIsDrawerOpen(false);
        setSelectedLead(null);
      }
      showToast(language === 'id' ? 'Data deal telah dihapus.' : 'Deal removed from CRM.');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCrm) return;
    if (!selectedLead || !newNoteText.trim()) return;

    try {
      await addLeadNote(selectedLead.id, newNoteText.trim(), 'note');
      setNewNoteText('');
    } catch (error: any) {
      showToast(error?.message || (language === 'id' ? 'Gagal menyimpan catatan.' : 'Failed to save note.'));
      return;
    }
    const updated = getCmsLeads().find(l => l.id === selectedLead.id);
    if (updated) setSelectedLead(updated);
    showToast(language === 'id' ? 'Catatan aktivitas ditambahkan.' : 'Activity note added.');
  };

  const getPriorityBadge = (priority: CrmPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-sans font-bold uppercase">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-sans font-bold uppercase">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-sans font-bold uppercase">Medium</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 text-[9px] font-sans font-bold uppercase">Low</span>;
    }
  };

  const getPillarColor = (pillar: CrmServicePillar) => {
    switch (pillar) {
      case 'Web Development':
        return 'text-[var(--k-red)] bg-[var(--k-red)]/10 border-[var(--k-red)]/30';
      case 'Mobile App':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'UI/UX Design':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Branding & Identity':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'AI & Cloud Solutions':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Digital Product MVP':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--k-control-radius)] bg-[var(--k-red)]/10 border border-[var(--k-red)]/30 flex items-center justify-center text-[var(--k-red)] shrink-0">
              <Briefcase size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-2.5">
              <span>{t('admin.crm.title')}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-[var(--k-red)]/15 text-[var(--k-red)] border border-[var(--k-red)]/30">
                Enterprise
              </span>
            </h1>
          </div>
          <p className="text-xs text-[var(--k-text-secondary)] mt-1.5 font-sans max-w-2xl">
            {language === 'id'
              ? 'Lacak progres tahapan deal, kualifikasi brief teknis klien, dan konversi peluang menjadi sprint proyek aktif.'
              : 'Track deal stages, qualify inbound scoping, and convert won opportunities directly to active project sprints.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Currency Switcher */}
          <div className="h-10 p-1 flex items-center rounded-[var(--k-control-radius)] bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] font-sans text-xs">
            <button
              onClick={() => handleCurrencyToggle('IDR')}
              className={`h-8 px-3 rounded-[var(--k-control-radius)] transition-all font-bold flex items-center justify-center ${
                currency === 'IDR'
                  ? 'bg-[var(--k-red)] text-white shadow-sm'
                  : 'text-[var(--k-text-secondary)] hover:text-white'
              }`}
            >
              IDR (Rp)
            </button>
            <button
              onClick={() => handleCurrencyToggle('USD')}
              className={`h-8 px-3 rounded-[var(--k-control-radius)] transition-all font-bold flex items-center justify-center ${
                currency === 'USD'
                  ? 'bg-[var(--k-red)] text-white shadow-sm'
                  : 'text-[var(--k-text-secondary)] hover:text-white'
              }`}
            >
              USD ($)
            </button>
          </div>

          <button
            onClick={() => exportCrmLeadsToCsv(filteredLeads)}
            className="h-10 px-3.5 rounded-[var(--k-control-radius)] bg-[var(--k-surface)] hover:bg-[var(--k-surface-raised)] text-white border border-[rgba(255,255,255,0.07)] text-xs font-sans transition-all flex items-center justify-center gap-2 min-h-[40px]"
            title={t('admin.action.exportCsv')}
          >
            <Download size={14} className="text-[var(--k-text-secondary)]" />
            <span className="hidden sm:inline">{t('admin.action.exportCsv')}</span>
          </button>

          {canManageCrm && (
            <button
              onClick={() => handleOpenAddModal('new')}
            className="h-10 px-4 rounded-[var(--k-control-radius)] bg-[var(--k-red)] hover:bg-[var(--k-red)] text-white text-xs font-sans font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--k-red)]/20 min-h-[40px]"
          >
            <Plus size={15} />
              <span>{t('admin.crm.addDeal')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      {statusMessage && (
        <div className="p-3.5 rounded-[var(--k-control-radius)] bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-sans flex items-center gap-2 animate-in fade-in duration-300">
          <Check size={15} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Enterprise CRM KPI Funnel & Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Active Pipeline Card */}
        <div className="lg:col-span-4 bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] p-5 sm:p-6 rounded-[var(--k-card-radius)] flex flex-col justify-between group hover:border-[#383C46] transition-all">
          <div>
            <div className="flex items-center justify-between text-[var(--k-text-secondary)] mb-3">
              <span className="text-xs font-sans uppercase tracking-wider font-semibold">
                {language === 'id' ? 'Pipeline Aktif' : 'Active Pipeline'}
              </span>
              <div className="w-8 h-8 rounded-[var(--k-control-radius)] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight break-words font-sans">
              {formatAmount(metrics.totalPipelineValue, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(255,255,255,0.07)] text-[11px] font-sans">
            <span className="text-[var(--k-text-secondary)]">
              {metrics.activeDealsCount} {language === 'id' ? 'Prospek Aktif' : 'Active Deals'}
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              <span>{language === 'id' ? 'Tertimbang:' : 'Weighted:'} {formatAmount(metrics.weightedPipelineValue, currency, true)}</span>
            </span>
          </div>
        </div>

        {/* Closed Won Card */}
        <div className="lg:col-span-3 bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] p-5 sm:p-6 rounded-[var(--k-card-radius)] flex flex-col justify-between group hover:border-[#383C46] transition-all">
          <div>
            <div className="flex items-center justify-between text-[var(--k-text-secondary)] mb-3">
              <span className="text-xs font-sans uppercase tracking-wider font-semibold">
                {language === 'id' ? 'Closed Won (Q3)' : 'Closed Won (Q3)'}
              </span>
              <div className="w-8 h-8 rounded-[var(--k-control-radius)] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-400 tracking-tight break-words font-sans">
              {formatAmount(metrics.totalWonValue, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(255,255,255,0.07)] text-[11px] font-sans">
            <span className="text-[var(--k-text-secondary)]">
              {language === 'id' ? 'Win Rate:' : 'Win Rate:'}
            </span>
            <span className="text-white font-bold font-sans">
              {metrics.winRate}% ({metrics.wonDealsCount} of {metrics.totalDeals} closed)
            </span>
          </div>
        </div>

        {/* Stage Conversion Funnel */}
        <div className="md:col-span-2 lg:col-span-5 bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] p-5 sm:p-6 rounded-[var(--k-card-radius)] flex flex-col justify-between group hover:border-[#383C46] transition-all">
          <div className="flex items-center justify-between text-[var(--k-text-secondary)] mb-2">
            <span className="text-xs font-sans uppercase tracking-wider font-semibold flex items-center gap-2 text-white">
              <Activity size={14} className="text-[var(--k-red)]" />
              <span>{language === 'id' ? 'Corong Konversi Tahapan' : 'Stage Conversion Funnel'}</span>
            </span>
            <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] border border-[rgba(255,255,255,0.07)]">
              Lead → Won Conversion
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-auto py-2">
            <div className="bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] p-2 text-center">
              <div className="text-[10px] font-sans text-[var(--k-text-secondary)] truncate">Lead→Scope</div>
              <div className="text-sm font-bold font-sans text-white mt-0.5">{funnelStats.leadToScope}%</div>
            </div>
            <div className="bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] p-2 text-center">
              <div className="text-[10px] font-sans text-[var(--k-text-secondary)] truncate">Scope→Pitch</div>
              <div className="text-sm font-bold font-sans text-white mt-0.5">{funnelStats.scopeToPitch}%</div>
            </div>
            <div className="bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] p-2 text-center">
              <div className="text-[10px] font-sans text-[var(--k-text-secondary)] truncate">Pitch→SOW</div>
              <div className="text-sm font-bold font-sans text-white mt-0.5">{funnelStats.pitchToSow}%</div>
            </div>
            <div className="bg-[var(--k-surface-raised)] border border-emerald-500/20 bg-emerald-950/15 rounded-[var(--k-control-radius)] p-2 text-center">
              <div className="text-[10px] font-sans text-emerald-400 truncate">SOW→Won</div>
              <div className="text-sm font-bold font-sans text-emerald-400 mt-0.5">{funnelStats.sowToWon}%</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.07)] text-[11px] font-sans">
            <span className="text-[var(--k-text-secondary)]">
              {language === 'id' ? 'Rata-rata Deal:' : 'Avg Deal:'} {formatAmount(metrics.avgDealSize, currency, true)}
            </span>
            <span className="text-[var(--k-text-secondary)]">
              {language === 'id' ? 'Proposal & Negosiasi:' : 'Proposal & SOW:'} <span className="text-purple-400 font-semibold">{formatAmount(metrics.negotiationValue, currency, true)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & View Mode Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] p-4 sm:p-5 rounded-[var(--k-card-radius)]">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--k-text-secondary)]" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'id' ? 'Cari prospek, perusahaan, atau kata kunci...' : 'Search leads, companies, or keywords...'}
              className="w-full pl-9 pr-3.5 py-2 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-xs text-white placeholder-[var(--k-text-secondary)] focus:border-[var(--k-red-border)] font-sans h-10 min-h-[40px]"
            />
          </div>

          <CustomSelect
            value={selectedPillar}
            onChange={(val) => setSelectedPillar(val)}
            options={[
              { value: 'All', label: language === 'id' ? 'Semua Pilar Layanan' : 'All Pillars' },
              { value: 'Web Development', label: 'Web Development' },
              { value: 'Mobile App', label: 'Mobile App' },
              { value: 'UI/UX Design', label: 'UI/UX Design' },
              { value: 'Branding & Identity', label: 'Branding & Identity' },
              { value: 'AI & Cloud Solutions', label: 'AI & Cloud Solutions' },
              { value: 'Digital Product MVP', label: 'Digital Product MVP' }
            ]}
          />

          <CustomSelect
            value={selectedPriority}
            onChange={(val) => setSelectedPriority(val)}
            options={[
              { value: 'All', label: language === 'id' ? 'Semua Prioritas' : 'All Priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ]}
          />
        </div>

        <div className="flex items-center gap-1 bg-[var(--k-surface-raised)] p-1 rounded-[var(--k-control-radius)] border border-[rgba(255,255,255,0.07)] self-start md:self-auto shrink-0">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--k-control-radius)] text-xs font-sans font-semibold transition-all min-h-[38px] ${
              viewMode === 'kanban'
                ? 'bg-[var(--k-surface)] text-white shadow-sm border border-[rgba(255,255,255,0.07)]'
                : 'text-[var(--k-text-secondary)] hover:text-white'
            }`}
          >
            <Kanban size={13} />
            <span>{t('admin.crm.kanbanView')}</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--k-control-radius)] text-xs font-sans font-semibold transition-all min-h-[38px] ${
              viewMode === 'list'
                ? 'bg-[var(--k-surface)] text-white shadow-sm border border-[rgba(255,255,255,0.07)]'
                : 'text-[var(--k-text-secondary)] hover:text-white'
            }`}
          >
            <List size={13} />
            <span>{t('admin.crm.listView')}</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN VIEW: KANBAN BOARD OR LIST TABLE */}
      {viewMode === 'kanban' ? (
        <ScrollShadowContainer
          externalRef={kanbanScrollRef}
          shadowBg="app"
          shadowSize="lg"
          showNavButtons={true}
          scrollStep={340}
          bottomOffset="bottom-4"
          scrollClassName="overflow-x-auto pb-4 select-none cursor-grab active:cursor-grabbing scrollbar-thin"
        >
          <div className="flex gap-4 min-w-[1400px] xl:min-w-full items-start">
            
            {CRM_STAGE_DEFINITIONS.map((stageDef) => {
              const stageLeads = filteredLeads.filter(l => l.stage === stageDef.key);
              const stageSum = stageLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);
              const isOver = dragOverStage === stageDef.key;

              return (
                <div 
                  key={stageDef.key}
                  onDragOver={(e) => handleDragOverColumn(e, stageDef.key)}
                  onDragLeave={handleDragLeaveColumn}
                  onDrop={(e) => handleDropOnColumn(e, stageDef.key)}
                  className={`bg-[var(--k-surface)] border rounded-[var(--k-card-radius)] flex flex-col flex-1 min-w-[280px] max-w-[340px] shrink-0 transition-all ${
                    isOver ? 'border-[var(--k-red)] ring-2 ring-[var(--k-red)]/30 bg-[var(--k-red)]/5' : 'border-[rgba(255,255,255,0.07)]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between bg-[var(--k-surface)] rounded-t-2xl">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          stageDef.key === 'won' ? 'bg-emerald-400' :
                          stageDef.key === 'new' ? 'bg-rose-400 animate-pulse' :
                          stageDef.key === 'negotiation' ? 'bg-purple-400' :
                          stageDef.key === 'proposal' ? 'bg-red-400' :
                          stageDef.key === 'contacted' ? 'bg-amber-400' : 'bg-zinc-500'
                        }`} />
                        <h3 className="text-xs font-bold font-display text-white truncate">
                          {language === 'id' ? stageDef.labelId : stageDef.label}
                        </h3>
                        <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] border border-[rgba(255,255,255,0.07)] shrink-0">
                          {stageLeads.length}
                        </span>
                      </div>
                      <div className="text-[11px] font-sans text-emerald-400 font-semibold mt-1">
                        {formatAmount(stageSum, currency, true)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAddModal(stageDef.key)}
                      title={`Add deal to ${stageDef.labelId}`}
                      className="p-1 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] hover:bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] hover:text-white border border-[rgba(255,255,255,0.07)] transition-colors shrink-0"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Column Cards Stream */}
                  <div className="p-3 space-y-3 overflow-y-auto flex-1 max-h-[calc(100vh-320px)] min-h-[180px] scrollbar-thin">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-[var(--k-text-secondary)] text-[11px] font-sans border border-dashed border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)]">
                        {language === 'id' ? 'Tarik deal ke sini' : 'Drop deals here'}
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const isDragging = draggedLeadId === lead.id;

                        return (
                          <div
                            key={lead.id}
                            draggable={canManageCrm}
                            onDragStart={(e) => { if (canManageCrm) handleDragStart(e, lead.id); }}
                            onClick={() => handleOpenLeadDrawer(lead)}
                            className={`draggable-card kanban-card bg-[var(--k-surface)] hover:bg-[var(--k-surface-raised)] border hover:border-[var(--k-red)]/60 rounded-[var(--k-control-radius)] p-3.5 cursor-pointer transition-all shadow-md group relative ${
                              isDragging ? 'opacity-40 scale-95 border-[var(--k-red)] border-dashed' : 'border-[rgba(255,255,255,0.07)]'
                            }`}
                          >
                            {/* Top Card Info */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className={`text-[9px] font-sans px-2 py-0.5 rounded border font-semibold truncate max-w-[130px] ${getPillarColor(lead.servicePillar)}`}>
                                {lead.servicePillar}
                              </span>
                              <div className="flex items-center gap-1">
                                {getPriorityBadge(lead.priority)}
                                <div className="text-[var(--k-text-secondary)] group-hover:text-[var(--k-text-secondary)] cursor-grab" data-drag-handle>
                                  <GripVertical size={13} />
                                </div>
                              </div>
                            </div>

                            {/* Client & Company */}
                            <h4 className="text-xs font-bold text-white font-display leading-snug group-hover:text-[var(--k-red)] transition-colors line-clamp-1">
                              {lead.clientName}
                            </h4>
                            <p className="text-[11px] text-[var(--k-text-secondary)] font-sans truncate mb-2.5">
                              {lead.company}
                            </p>

                            {/* Deal Value & Source */}
                            <div className="flex items-center justify-between text-xs font-sans pb-2.5 mb-2.5 border-t border-[rgba(255,255,255,0.07)] pt-2">
                              <span className="text-emerald-400 font-bold font-display text-sm tracking-tight">
                                {formatAmount(lead.dealValue, currency)}
                              </span>
                              <span className="text-[10px] text-[var(--k-text-secondary)] font-sans px-1.5 py-0.5 rounded bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] shrink-0">
                                {lead.source}
                              </span>
                            </div>

                            {/* Card Bottom: Quick Actions */}
                            <div className="flex items-center justify-between gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
                              {/* Left: Won / Project status action */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {canManageCrm && lead.stage !== 'won' && lead.stage !== 'lost' && (
                                  <button
                                    onClick={() => handleStageChange(lead.id, 'won')}
                                    title={language === 'id' ? 'Tandai Deal Dimenangkan (Won)' : 'Mark deal as Won'}
                                    className="h-7 px-2.5 rounded-[var(--k-control-radius)] bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-sans transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap"
                                  >
                                    <Check size={11} className="text-emerald-400" />
                                    <span>Won</span>
                                  </button>
                                )}
                                {canConvertWonDeal && lead.stage === 'won' && (
                                  <button
                                    onClick={() => handleConvertToProject(lead)}
                                    title={language === 'id' ? 'Konversi ke Proyek Aktif' : 'Convert deal to Agency Project'}
                                    className="h-7 px-2.5 rounded-[var(--k-control-radius)] bg-[var(--k-red)]/20 hover:bg-[var(--k-red)]/40 text-[var(--k-red)] border border-[var(--k-red)]/30 text-[10px] font-bold font-sans transition-all flex items-center gap-1 active:scale-95 shadow-sm whitespace-nowrap"
                                  >
                                    <Layers size={11} />
                                    <span>Project</span>
                                  </button>
                                )}
                                {lead.stage === 'lost' && (
                                  <span className="text-[10px] font-sans text-[var(--k-text-secondary)] px-2 py-1 rounded bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] whitespace-nowrap">
                                    Closed Lost
                                  </span>
                                )}
                              </div>

                              {/* Right: Quick actions (WhatsApp + Inspect) */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {lead.phone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone(lead.phone)}?text=Halo%20${encodeURIComponent(lead.clientName)},%20kami%20dari%20tim%20Kapitech%20Agency...`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={language === 'id' ? 'Kirim Pesan WhatsApp' : 'Send WhatsApp message'}
                                    className="h-7 w-7 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] hover:bg-emerald-950/60 text-[var(--k-text-secondary)] hover:text-emerald-400 border border-[rgba(255,255,255,0.07)] hover:border-emerald-500/30 transition-all flex items-center justify-center shrink-0"
                                  >
                                    <Send size={11} />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleOpenLeadDrawer(lead)}
                                  title={language === 'id' ? 'Lihat profil lead & catatan' : 'Inspect lead profile & notes'}
                                  className="h-7 px-2.5 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] hover:bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] hover:text-white border border-[rgba(255,255,255,0.07)] text-[10px] font-sans transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap"
                                >
                                  <span>Inspect</span>
                                  <ArrowUpRight size={11} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollShadowContainer>
      ) : (
        /* LIST VIEW: Mobile Cards + Desktop Table */
        <div className="space-y-3">
          {/* Mobile Card Stream (Zero Horizontal Scrolling) */}
          <div className="md:hidden space-y-3">
            {filteredLeads.length === 0 ? (
              <div className="bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] p-8 text-center text-[var(--k-text-secondary)] font-sans text-xs">
                {language === 'id' ? 'Tidak ada deal yang cocok.' : 'No matching leads found.'}
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => handleOpenLeadDrawer(lead)}
                  className="bg-[var(--k-surface)] hover:bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)] rounded-[var(--k-control-radius)] p-4 space-y-3 transition-all cursor-pointer shadow-lg"
                >
                  {/* Header: Client, Company & Stage */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-base font-display">{lead.clientName}</div>
                      <div className="text-xs text-[var(--k-text-secondary)] font-sans">{lead.company}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] text-[11px] font-sans text-[#D0D4DC] shrink-0 font-semibold">
                      {language === 'id'
                        ? (CRM_STAGE_DEFINITIONS.find(s => s.key === lead.stage)?.labelId || lead.stage)
                        : (CRM_STAGE_DEFINITIONS.find(s => s.key === lead.stage)?.label || lead.stage)}
                    </span>
                  </div>

                  {/* Pillar & Priority Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-sans px-2.5 py-1 rounded-[var(--k-control-radius)] border font-semibold ${getPillarColor(lead.servicePillar)}`}>
                      {lead.servicePillar}
                    </span>
                    {getPriorityBadge(lead.priority)}
                    {lead.source && (
                      <span className="text-[10px] font-sans text-[var(--k-text-secondary)] bg-[var(--k-surface-raised)] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.04)]">
                        {lead.source}
                      </span>
                    )}
                  </div>

                  {/* Value & Actions Footer */}
                  <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-sans uppercase text-[var(--k-text-secondary)]">Deal Value</div>
                      <div className="font-bold text-emerald-400 font-sans text-base">
                        {formatAmount(lead.dealValue, currency)}
                      </div>
                      {lead.expectedCloseDate && (
                        <div className="text-[10px] font-sans text-[#5C626E]">
                          Target: {lead.expectedCloseDate}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {canConvertWonDeal && lead.stage === 'won' && (
                        <button
                          onClick={() => handleConvertToProject(lead)}
                          title="Create project"
                          className="w-9 h-9 rounded-[var(--k-control-radius)] bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center min-h-[36px] min-w-[36px]"
                        >
                          <Layers size={13} />
                        </button>
                      )}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${cleanPhone(lead.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] text-emerald-400 hover:bg-emerald-950/50 border border-[rgba(255,255,255,0.07)] hover:border-emerald-500/30 flex items-center justify-center min-h-[36px] min-w-[36px]"
                          title="WhatsApp client"
                        >
                          <Send size={13} />
                        </a>
                      )}
                      {canManageCrm && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(lead)}
                            className="w-9 h-9 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] hover:text-white border border-[rgba(255,255,255,0.07)] flex items-center justify-center min-h-[36px] min-w-[36px]"
                            title="Edit deal"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.clientName)}
                            className="w-9 h-9 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/40 flex items-center justify-center min-h-[36px] min-w-[36px]"
                            title="Delete deal"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-card-radius)] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] border-b border-[rgba(255,255,255,0.07)] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">{language === 'id' ? 'Klien & Perusahaan' : 'Client & Company'}</th>
                    <th className="py-3.5 px-4">{language === 'id' ? 'Pilar Layanan' : 'Service Pillar'}</th>
                    <th className="py-3.5 px-4 text-right">{language === 'id' ? 'Nilai Deal' : 'Deal Value'}</th>
                    <th className="py-3.5 px-4">{language === 'id' ? 'Tahap Pipeline' : 'Pipeline Stage'}</th>
                    <th className="py-3.5 px-4">{language === 'id' ? 'Prioritas' : 'Priority'}</th>
                    <th className="py-3.5 px-4">{language === 'id' ? 'Sumber' : 'Source'}</th>
                    <th className="py-3.5 px-4">{language === 'id' ? 'Target Closing' : 'Target Close'}</th>
                    <th className="py-3.5 px-4 text-right">{language === 'id' ? 'Aksi' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[var(--k-text-secondary)] font-sans">
                        {language === 'id' ? 'Tidak ada deal yang cocok.' : 'No matching leads found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => handleOpenLeadDrawer(lead)}
                        className="hover:bg-[var(--k-surface-raised)] transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white font-display text-sm">
                            {lead.clientName}
                          </div>
                          <div className="text-[11px] text-[var(--k-text-secondary)]">
                            {lead.company}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-sans px-2 py-0.5 rounded border font-semibold ${getPillarColor(lead.servicePillar)}`}>
                            {lead.servicePillar}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-emerald-400 font-display text-sm font-sans">
                          {formatAmount(lead.dealValue, currency)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] text-[11px] text-[#D0D4DC]">
                            {language === 'id'
                              ? (CRM_STAGE_DEFINITIONS.find(s => s.key === lead.stage)?.labelId || lead.stage)
                              : (CRM_STAGE_DEFINITIONS.find(s => s.key === lead.stage)?.label || lead.stage)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {getPriorityBadge(lead.priority)}
                        </td>

                        <td className="py-3.5 px-4 text-[var(--k-text-secondary)]">
                          {lead.source}
                        </td>

                        <td className="py-3.5 px-4 text-[var(--k-text-secondary)]">
                          {lead.expectedCloseDate || '-'}
                        </td>

                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {lead.stage === 'won' && (
                              <button
                                onClick={() => handleConvertToProject(lead)}
                                title="Create project"
                                className="w-9 h-9 rounded-[var(--k-control-radius)] bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                              >
                                <Layers size={13} />
                              </button>
                            )}
                            {lead.phone && (
                              <a
                                href={`https://wa.me/${cleanPhone(lead.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] text-emerald-400 hover:bg-emerald-950/50 border border-[rgba(255,255,255,0.07)] hover:border-emerald-500/30 flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                                title="WhatsApp client"
                              >
                                <Send size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => handleOpenEditModal(lead)}
                              disabled={!canManageCrm}
                              className="w-9 h-9 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] hover:text-white border border-[rgba(255,255,255,0.07)] flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                              title="Edit deal"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.clientName)}
                              disabled={!canManageCrm}
                              className="w-9 h-9 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/40 flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                              title="Delete deal"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. CLIENT & DEAL PROFILE DRAWER */}
      {isDrawerOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--k-surface)] border-l border-[rgba(255,255,255,0.07)] w-full sm:max-w-xl h-full flex flex-col justify-between p-5 sm:p-7 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300 font-sans text-xs">
            
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-[rgba(255,255,255,0.07)]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] border font-semibold ${getPillarColor(selectedLead.servicePillar)}`}>
                      {selectedLead.servicePillar}
                    </span>
                    {getPriorityBadge(selectedLead.priority)}
                    <span className="text-[10px] text-[var(--k-text-secondary)]">
                      ID: {selectedLead.id}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    {selectedLead.clientName}
                  </h2>
                  <p className="text-xs text-[var(--k-red)] font-semibold mt-0.5">
                    {selectedLead.company}
                  </p>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] hover:bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] hover:text-white border border-[rgba(255,255,255,0.07)] flex items-center justify-center transition-colors text-xs font-sans"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Deal Value & Stage Selector Widget */}
              <div className="p-4 rounded-[var(--k-control-radius)] bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-[var(--k-text-secondary)] uppercase tracking-wider font-semibold">
                    {language === 'id' ? 'Valuasi Prospek' : 'Deal Valuation'}
                  </div>
                  <div className="text-2xl font-bold font-display text-emerald-400 font-sans">
                    {formatAmount(selectedLead.dealValue, currency)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--k-text-secondary)]">{language === 'id' ? 'Tahap:' : 'Stage:'}</span>
                  <select
                    value={selectedLead.stage}
                    disabled={!canManageCrm}
                    onChange={(e) => handleStageChange(selectedLead.id, e.target.value as CrmStage)}
                    className="px-3 py-1.5 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-xs text-white focus:border-[var(--k-red-border)] font-sans"
                  >
                    {CRM_STAGE_DEFINITIONS.map(s => (
                      <option key={s.key} value={s.key}>
                        {language === 'id' ? s.labelId : s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)]">
                  <div className="flex items-center gap-1.5 text-[var(--k-text-secondary)] mb-1">
                    <Mail size={13} className="text-[var(--k-red)]" />
                    <span>{language === 'id' ? 'Email Klien' : 'Client Email'}</span>
                  </div>
                  <a 
                    href={`mailto:${selectedLead.email}`}
                    className="text-white hover:text-[var(--k-red)] transition-colors break-all block"
                  >
                    {selectedLead.email || '-'}
                  </a>
                </div>

                <div className="p-3.5 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)]">
                  <div className="flex items-center justify-between text-[var(--k-text-secondary)] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-[var(--k-red)]" />
                      <span>WhatsApp / Phone</span>
                    </div>
                    {selectedLead.phone && (
                      <a
                        href={`https://wa.me/${cleanPhone(selectedLead.phone)}?text=Halo%20${encodeURIComponent(selectedLead.clientName)},%20kami%20dari%20Kapitech%20Agency...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Chat WA</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <div className="text-white">
                    {selectedLead.phone || '-'}
                  </div>
                </div>
              </div>

              {/* Scope Description */}
              <div>
                <label className="block text-[var(--k-text-secondary)] uppercase tracking-wider mb-2 font-semibold text-[11px]">
                  {language === 'id' ? 'Deskripsi Scope & Catatan Klien' : 'Project Scope & Acceptance Notes'}
                </label>
                <div className="p-4 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] text-gray-200 leading-relaxed font-sans text-xs">
                  {selectedLead.description || (language === 'id' ? 'Belum ada catatan scope proyek.' : 'No detailed scope notes provided.')}
                </div>
              </div>

              {/* Activity Log / Notes Stream */}
              <div>
                <label className="block text-[var(--k-text-secondary)] uppercase tracking-wider mb-2 font-semibold text-[11px]">
                  {language === 'id' ? 'Riwayat Aktivitas & Catatan Meeting' : 'Activity Timeline & Meeting Notes'}
                </label>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    disabled={!canManageCrm}
                    placeholder={language === 'id' ? 'Catat ringkasan meeting atau jadwal follow-up...' : 'Log call, meeting summary, or follow-up note...'}
                    className="flex-1 px-3.5 py-2 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-xs text-white placeholder-[var(--k-text-secondary)] focus:border-[var(--k-red-border)] font-sans min-h-[44px]"
                  />
                  <button
                    type="submit"
                    disabled={!canManageCrm || !newNoteText.trim()}
                    className="px-3.5 py-2 rounded-[var(--k-control-radius)] bg-[var(--k-red)] hover:bg-[var(--k-red)] text-white text-xs font-sans font-bold transition-colors flex items-center gap-1 shrink-0 min-h-[44px]"
                  >
                    <Plus size={13} />
                    <span>{language === 'id' ? 'Catat' : 'Log'}</span>
                  </button>
                </form>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    selectedLead.notes.slice().reverse().map((note) => (
                      <div key={note.id} className="p-3 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] text-xs">
                        <div className="flex items-center justify-between text-[10px] text-[var(--k-text-secondary)] mb-1">
                          <span className="text-[var(--k-red)] font-semibold">{note.author}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[#D0D4DC] leading-snug">{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-[var(--k-text-secondary)]">
                      {language === 'id' ? 'Belum ada catatan aktivitas.' : 'No activity notes logged yet.'}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Bottom Action Buttons */}
            <div className="pt-5 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {canManageCrm && (
                  <button
                    onClick={() => handleOpenEditModal(selectedLead)}
                    className="px-3.5 py-2 rounded-[var(--k-control-radius)] bg-[var(--k-surface)] hover:bg-[var(--k-surface-raised)] text-white border border-[rgba(255,255,255,0.07)] text-xs transition-colors flex items-center gap-1.5 min-h-[40px]"
                >
                  <Edit3 size={13} />
                    <span>{t('admin.action.edit')}</span>
                  </button>
                )}
                {canManageCrm && (
                  <button
                    onClick={() => handleDeleteLead(selectedLead.id, selectedLead.clientName)}
                  className="p-2 rounded-[var(--k-control-radius)] bg-[var(--k-surface)] hover:bg-red-950/40 text-[var(--k-text-secondary)] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/30 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="Delete deal"
                >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {selectedLead.stage === 'won' && canConvertWonDeal && (
                <button
                  onClick={() => handleConvertToProject(selectedLead)}
                  disabled={convertingLeadId === selectedLead.id}
                  className="px-4 py-2 rounded-[var(--k-control-radius)] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 min-h-[40px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {convertingLeadId === selectedLead.id ? <Clock size={13} className="animate-spin" /> : <Layers size={13} />}
                  <span>{convertingLeadId === selectedLead.id
                    ? (language === 'id' ? 'Mengonversi...' : 'Converting...')
                    : t('admin.crm.convertToProject')}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 6. CREATE / EDIT DEAL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-card-radius)] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(255,255,255,0.07)]">
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <Briefcase className="text-[var(--k-red)]" size={20} />
                <span>{editingLead ? (language === 'id' ? 'Edit Data Prospek' : 'Edit CRM Deal') : t('admin.crm.addDeal')}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-[var(--k-text-secondary)] hover:text-white rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--k-text-secondary)] mb-1 font-semibold">{language === 'id' ? 'Nama PIC Klien *' : 'Client PIC Name *'}</label>
                  <input
                    type="text"
                    required
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    placeholder="e.g. Adrian Wicaksono"
                    className="w-full px-3.5 py-2.5 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-white focus:border-[var(--k-red-border)] min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--k-text-secondary)] mb-1 font-semibold">{language === 'id' ? 'Nama Perusahaan / Brand *' : 'Company Name *'}</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Bank Mandiri FinTech Division"
                    className="w-full px-3.5 py-2.5 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-white focus:border-[var(--k-red-border)] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--k-text-secondary)] mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="adrian@company.com"
                    className="w-full px-3.5 py-2.5 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-white focus:border-[var(--k-red-border)] min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--k-text-secondary)] mb-1 font-semibold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="w-full px-3.5 py-2.5 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-white focus:border-[var(--k-red-border)] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[var(--k-text-secondary)] mb-1 font-semibold">{language === 'id' ? 'Pilar Layanan' : 'Service Pillar'}</label>
                  <select
                    value={formPillar}
                    onChange={(e) => setFormPillar(e.target.value as CrmServicePillar)}
                    className="w-full px-3 py-2.5 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-white focus:border-[var(--k-red-border)] min-h-[44px]"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Branding & Identity">Branding & Identity</option>
                    <option value="AI & Cloud Solutions">AI & Cloud Solutions</option>
                    <option value="Digital Product MVP">Digital Product MVP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--k-text-secondary)] mb-1 font-semibold">{language === 'id' ? 'Nilai Deal (IDR)' : 'Deal Value (IDR)'}</label>
                  <input
                    type="number"
                    value={formDealValue}
                    onChange={(e) => setFormDealValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-white focus:border-[var(--k-red-border)] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--k-text-secondary)] mb-1 font-semibold">{language === 'id' ? 'Tahap' : 'Stage'}</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value as CrmStage)}
                    className="w-full px-3 py-2.5 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-white focus:border-[var(--k-red-border)] min-h-[44px]"
                  >
                    {CRM_STAGE_DEFINITIONS.map(s => (
                      <option key={s.key} value={s.key}>
                        {language === 'id' ? s.labelId : s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--k-text-secondary)] mb-1 font-semibold">{language === 'id' ? 'Prioritas' : 'Priority'}</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as CrmPriority)}
                    className="w-full px-3 py-2.5 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-white focus:border-[var(--k-red-border)] min-h-[44px]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--k-text-secondary)] mb-1 font-semibold">{language === 'id' ? 'Target Tanggal Closing' : 'Target Close Date'}</label>
                  <input
                    type="date"
                    value={formExpectedClose}
                    onChange={(e) => setFormExpectedClose(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-white focus:border-[var(--k-red-border)] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--k-text-secondary)] mb-1 font-semibold">{language === 'id' ? 'Ringkasan / Scope Kebutuhan' : 'Brief / Project Scope'}</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={language === 'id' ? 'Kebutuhan teknis, ekspektasi timeline, catatan budget...' : 'Requirements, tech stack expectations, budget notes...'}
                  className="w-full px-3.5 py-2 bg-[var(--k-surface-raised)] border border-[rgba(255,255,255,0.07)] rounded-[var(--k-control-radius)] text-white focus:border-[var(--k-red-border)] font-sans text-xs"
                />
              </div>

              <div className="pt-4 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-10 px-4 rounded-[var(--k-control-radius)] bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] hover:text-white border border-[rgba(255,255,255,0.07)] text-xs font-sans font-medium transition-colors min-h-[40px]"
                >
                  {t('admin.action.cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-[var(--k-control-radius)] bg-[var(--k-red)] text-white font-sans font-bold text-xs hover:bg-[var(--k-red)] transition-all shadow-md shadow-[var(--k-red)]/20 min-h-[40px]"
                >
                  {editingLead ? (language === 'id' ? 'Simpan Perubahan' : 'Update Deal') : (language === 'id' ? 'Buat Deal' : 'Save Deal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminCrm;
