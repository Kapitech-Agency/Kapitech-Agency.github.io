import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  User, 
  Users,
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
import { CrmLead, CrmStage, CrmPriority, CrmServicePillar, CrmSource, CRM_STAGE_DEFINITIONS, computeCrmMetrics, exportCrmLeadsToCsv } from '../../lib/crmStore';
import { useLanguage } from '../../lib/LanguageContext';
import { useDragToScroll } from '../../lib/useDragToScroll';
import { ScrollShadowContainer } from '../../components/ui/ScrollShadowContainer';
import { formatAmount, getActiveCurrency, setGlobalCurrency, CurrencyCode, CURRENCY_EVENT } from '../../lib/currency';
import { hasAdminPermission } from '../../lib/adminAuth';
import { api } from '../../lib/apiClient';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Modal } from '../../components/ui/Modal';

export const AdminCrm: React.FC = () => {
  const { language, t } = useLanguage();
  const kanbanScrollRef = useDragToScroll<HTMLDivElement>();
  const canManageCrm = hasAdminPermission('canManageCrm');
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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

  const loadLeads = async () => {
    try {
      const res = await api.crm.getDeals();
      if (res.success && Array.isArray(res.data?.deals)) setLeads(res.data.deals as CrmLead[]);
    } catch { showToast(language === 'id' ? 'Gagal memuat CRM.' : 'Failed to load CRM.'); }
  };

  useEffect(() => {
    void loadLeads();

    const handleCurr = (e: Event) => {
      const custom = e as CustomEvent<{ currency: CurrencyCode }>;
      if (custom.detail?.currency) {
        setCurrency(custom.detail.currency);
      }
    };
    window.addEventListener(CURRENCY_EVENT, handleCurr);

    return () => {
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
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      handleStageChange(leadId, stageKey);
    }
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  const handleStageChange = async (leadId: string, newStage: CrmStage) => {
    const res = await api.crm.updateDeal(leadId, { stage: newStage });
    if (!res.success) { showToast(res.error || (language === 'id' ? 'Tahap deal gagal diperbarui.' : 'Failed to update deal stage.')); return; }
    await loadLeads();
    const stageDef = CRM_STAGE_DEFINITIONS.find(s => s.key === newStage);
    const stageName = language === 'id' ? (stageDef?.labelId || newStage) : (stageDef?.label || newStage);
    showToast(language === 'id' ? `Tahap deal diperbarui ke ${stageName}` : `Lead stage updated to ${stageName}`);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, stage: newStage } : null);
    }
  };

  const handleConvertToProject = async (lead: CrmLead) => {
    if (!canManageCrm) {
      showToast(language === 'id' ? 'Anda tidak memiliki izin mengelola CRM.' : 'You do not have CRM permission.');
      return;
    }
    try {
      const res = await api.crm.convertWonDeal(lead.id);
      if (!res.success) {
        showToast(res.error || (language === 'id' ? 'Konversi deal gagal.' : 'Deal conversion failed.'));
        return;
      }
      showToast(
        res.data?.replayed
          ? (language === 'id' ? 'Konversi deal sudah pernah diproses.' : 'This deal conversion was already processed.')
          : (language === 'id'
            ? 'Deal berhasil dikonversi melalui workflow server.'
            : 'Deal converted through the server workflow.')
      );
    } catch {
      showToast(language === 'id' ? 'Konversi deal gagal.' : 'Deal conversion failed.');
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
      showToast(language === 'id' ? 'Nama klien dan perusahaan wajib diisi.' : 'Client name and company are required.');
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

    const res = editingLead ? await api.crm.updateDeal(leadData.id, leadData) : await api.crm.createDeal(leadData);
    if (!res.success) { showToast(res.error || (language === 'id' ? 'Deal gagal disimpan.' : 'Deal could not be saved.')); return; }
    await loadLeads();
    setIsAddModalOpen(false);
    showToast(editingLead ? (language === 'id' ? 'Data prospek berhasil diperbarui.' : 'Deal updated successfully.') : (language === 'id' ? 'Deal prospek baru berhasil dibuat.' : 'New deal created successfully.'));
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!canManageCrm) return;
    setDeleteTarget({ id, name });
  };

  const confirmDeleteLead = async (id: string) => {
    const res = await api.crm.deleteDeal(id);
    if (!res.success) { showToast(res.error || 'Delete failed.'); setDeleteTarget(null); return; }
    await loadLeads();
    if (selectedLead && selectedLead.id === id) { setIsDrawerOpen(false); setSelectedLead(null); }
    setDeleteTarget(null);
    showToast(language === 'id' ? 'Data deal telah dihapus.' : 'Deal removed from CRM.');
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteText.trim()) return;

    const nextNotes = [...(selectedLead.notes || []), { id: `note_${Date.now().toString(36)}`, text: newNoteText.trim(), type: 'note', createdAt: new Date().toISOString() }];
    const res = await api.crm.updateDeal(selectedLead.id, { notes: nextNotes });
    if (!res.success) { showToast(res.error || (language === 'id' ? 'Catatan gagal disimpan.' : 'Note could not be saved.')); return; }
    await loadLeads();
    setNewNoteText('');
    const updated = leads.find(l => l.id === selectedLead.id);
    if (updated) setSelectedLead(updated);
    showToast(language === 'id' ? 'Catatan aktivitas ditambahkan.' : 'Activity note added.');
  };

  const getPriorityBadge = (priority: CrmPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 text-[9px] font-sans font-semibold normal-case">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30 text-[9px] font-sans font-semibold normal-case">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 text-[9px] font-sans font-semibold normal-case">Medium</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded bg-[var(--panel-hover)] text-[var(--muted)] border border-[var(--line)] text-[9px] font-sans font-semibold normal-case">Low</span>;
    }
  };

  const getPillarColor = (pillar: CrmServicePillar) => {
    switch (pillar) {
      case 'Web Development':
        return 'text-[var(--danger)] bg-[var(--accent)]/10 border-[var(--accent)]/30';
      case 'Mobile App':
        return 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/30';
      case 'UI/UX Design':
        return 'text-[var(--info)] bg-[var(--info)]/10 border-[var(--info)]/30';
      case 'Branding & Identity':
        return 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/30';
      case 'AI & Cloud Solutions':
        return 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/30';
      case 'Digital Product MVP':
        return 'text-[var(--info)] bg-[var(--info)]/10 border-[var(--info)]/30';
      default:
        return 'text-[var(--muted)] bg-[var(--panel)]/50 border-[var(--line)]';
    }
  };

  return (
    <>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm" title={language === 'id' ? 'Hapus prospek?' : 'Delete lead?'} description={language === 'id' ? `Prospek ${deleteTarget?.name || ''} akan dihapus dari CRM.` : `Lead ${deleteTarget?.name || ''} will be removed from CRM.`}>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button type="button" onClick={() => setDeleteTarget(null)} className="min-h-10 px-4 rounded-control border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--muted)]">Cancel</button>
          <button type="button" onClick={() => deleteTarget && void confirmDeleteLead(deleteTarget.id)} className="min-h-10 px-4 rounded-control bg-[var(--danger)] text-white text-xs font-semibold">Delete</button>
        </div>
      </Modal>
      <div className="space-y-5 sm:space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="ams-dashboard-header flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-control bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--danger)] shrink-0">
              <Users size={18} />
            </div>
            <h1 className="ams-page-title flex items-center gap-2.5">
              <span>{t('admin.crm.title')}</span>
              <span className="px-2 py-0.5 rounded-badge text-[10px] font-sans font-semibold normal-case tracking-normal bg-[var(--accent)]/15 text-[var(--danger)] border border-[var(--accent)]/30">
                Enterprise
              </span>
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1.5 font-sans max-w-2xl">
            {language === 'id'
              ? 'Lacak progres tahapan deal, kualifikasi brief teknis klien, dan konversi peluang menjadi sprint proyek aktif.'
              : 'Track deal stages, qualify inbound scoping, and convert won opportunities directly to active project sprints.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Currency Switcher */}
          <div className="h-10 p-1 flex items-center rounded-control bg-[var(--panel)] border border-[var(--line)] font-sans text-xs">
            <button
              onClick={() => handleCurrencyToggle('IDR')}
              className={`min-h-10 px-3 rounded-control transition-colors font-medium flex items-center justify-center ${
                currency === 'IDR'
                  ? 'bg-[var(--accent)] text-[var(--text)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              IDR (Rp)
            </button>
            <button
              onClick={() => handleCurrencyToggle('USD')}
              className={`min-h-10 px-3 rounded-control transition-colors font-medium flex items-center justify-center ${
                currency === 'USD'
                  ? 'bg-[var(--accent)] text-[var(--text)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              USD ($)
            </button>
          </div>

          <button
            onClick={() => exportCrmLeadsToCsv(filteredLeads)}
            className="min-h-10 px-3.5 rounded-control bg-[var(--panel)] hover:bg-[var(--panel-hover)] text-[var(--text)] border border-[var(--line)] text-xs font-sans transition-colors flex items-center justify-center gap-2"
            title={t('admin.action.exportCsv')}
          >
            <Download size={14} className="text-[var(--muted)]" />
            <span className="hidden sm:inline">{t('admin.action.exportCsv')}</span>
          </button>

          {canManageCrm && (
                        <>
                          <button
                            onClick={() => handleOpenAddModal('new')}
                            disabled={!canManageCrm}
                            className="min-h-10 px-4 rounded-control bg-[var(--accent)] hover:brightness-110 text-white text-xs font-sans font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus size={15} />
                            <span>{t('admin.crm.addDeal')}</span>
                          </button>
                        </>
                      )}
        </div>
      </div>

      {/* Toast Alert */}
      {statusMessage && (
        <div className="p-3 rounded-card bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-xs font-sans flex items-center gap-2 animate-in fade-in duration-300">
          <Check size={15} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Enterprise CRM KPI Funnel & Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Active Pipeline Card */}
        <div className="lg:col-span-4 bg-[var(--panel)] border border-[var(--line)] p-5 sm:p-6 rounded-card flex flex-col justify-between group hover:border-[var(--line)] transition-all">
          <div>
            <div className="flex items-center justify-between text-[var(--muted)] mb-3">
              <span className="text-xs font-sans normal-case tracking-normal font-semibold">
                {language === 'id' ? 'Pipeline Aktif' : 'Active Pipeline'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 flex items-center justify-center text-[var(--success)]">
                <Layers size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-sans font-semibold text-[var(--text)] tracking-tight break-words font-sans">
              {formatAmount(metrics.totalPipelineValue, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--line)] text-[11px] font-sans">
            <span className="text-[var(--muted)]">
              {metrics.activeDealsCount} {language === 'id' ? 'Prospek Aktif' : 'Active Deals'}
            </span>
            <span className="text-[var(--success)] font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              <span>{language === 'id' ? 'Tertimbang:' : 'Weighted:'} {formatAmount(metrics.weightedPipelineValue, currency, true)}</span>
            </span>
          </div>
        </div>

        {/* Closed Won Card */}
        <div className="lg:col-span-3 bg-[var(--panel)] border border-[var(--line)] p-5 sm:p-6 rounded-card flex flex-col justify-between group hover:border-[var(--line)] transition-all">
          <div>
            <div className="flex items-center justify-between text-[var(--muted)] mb-3">
              <span className="text-xs font-sans normal-case tracking-normal font-semibold">
                {language === 'id' ? 'Closed Won (Q3)' : 'Closed Won (Q3)'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 flex items-center justify-center text-[var(--success)]">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-sans font-semibold text-[var(--success)] tracking-tight break-words font-sans">
              {formatAmount(metrics.totalWonValue, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--line)] text-[11px] font-sans">
            <span className="text-[var(--muted)]">
              {language === 'id' ? 'Win Rate:' : 'Win Rate:'}
            </span>
            <span className="text-[var(--text)] font-semibold font-sans">
              {metrics.winRate}% ({metrics.wonDealsCount} of {metrics.totalDeals} closed)
            </span>
          </div>
        </div>

        {/* Stage Conversion Funnel */}
        <div className="md:col-span-2 lg:col-span-5 bg-[var(--panel)] border border-[var(--line)] p-5 sm:p-6 rounded-card flex flex-col justify-between group hover:border-[var(--line)] transition-all">
          <div className="flex items-center justify-between text-[var(--muted)] mb-2">
            <span className="text-xs font-sans normal-case tracking-normal font-semibold flex items-center gap-2 text-[var(--text)]">
              <Activity size={14} className="text-[var(--danger)]" />
              <span>{language === 'id' ? 'Corong Konversi Tahapan' : 'Stage Conversion Funnel'}</span>
            </span>
            <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[var(--panel)] text-[var(--muted)] border border-[var(--line)]">
              Lead → Won Conversion
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 my-auto py-2">
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card p-2 text-center">
              <div className="text-[10px] font-sans text-[var(--muted)] truncate">Lead→Scope</div>
              <div className="text-sm font-semibold font-sans text-[var(--text)] mt-0.5">{funnelStats.leadToScope}%</div>
            </div>
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card p-2 text-center">
              <div className="text-[10px] font-sans text-[var(--muted)] truncate">Scope→Pitch</div>
              <div className="text-sm font-semibold font-sans text-[var(--text)] mt-0.5">{funnelStats.scopeToPitch}%</div>
            </div>
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card p-2 text-center">
              <div className="text-[10px] font-sans text-[var(--muted)] truncate">Pitch→SOW</div>
              <div className="text-sm font-semibold font-sans text-[var(--text)] mt-0.5">{funnelStats.pitchToSow}%</div>
            </div>
            <div className="bg-[var(--panel)] border border-[var(--success)]/20 bg-emerald-950/15 rounded-card p-2 text-center">
              <div className="text-[10px] font-sans text-[var(--success)] truncate">SOW→Won</div>
              <div className="text-sm font-semibold font-sans text-[var(--success)] mt-0.5">{funnelStats.sowToWon}%</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--line)] text-[11px] font-sans">
            <span className="text-[var(--muted)]">
              {language === 'id' ? 'Rata-rata Deal:' : 'Avg Deal:'} {formatAmount(metrics.avgDealSize, currency, true)}
            </span>
            <span className="text-[var(--muted)]">
              {language === 'id' ? 'Proposal & Negosiasi:' : 'Proposal & SOW:'} <span className="text-[var(--info)] font-semibold">{formatAmount(metrics.negotiationValue, currency, true)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & View Mode Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[var(--panel)] border border-[var(--line)] p-3 sm:p-4 rounded-card">
        <div className="flex flex-row items-center gap-2.5 flex-1 min-w-0 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <div className="relative shrink-0 w-[240px] sm:flex-1 sm:min-w-0 sm:w-auto sm:max-w-none lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'id' ? 'Cari prospek, perusahaan, atau kata kunci...' : 'Search leads, companies, or keywords...'}
              className="w-full pl-9 pr-3.5 py-2 rounded-control bg-[var(--panel)] border border-[var(--line)] text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] font-sans min-h-10"
            />
          </div>

          <CustomSelect
            className="shrink-0 w-[180px] sm:w-auto"
            value={selectedPillar}
            onChange={(val) => setSelectedPillar(val)}
            options={[
              { value: 'All', label: language === 'id' ? 'Semua Pilar Layanan' : 'All Pillars' },
              { value: 'Web Development', label: 'Web Development' },
                            { value: 'UI/UX Design', label: 'UI/UX Design' },
              { value: 'Branding & Identity', label: 'Branding & Identity' },
              { value: 'AI & Cloud Solutions', label: 'AI & Cloud Solutions' },
              { value: 'Digital Product MVP', label: 'Digital Product MVP' }
            ]}
          />

          <CustomSelect
            className="shrink-0 w-[160px] sm:w-auto"
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

        <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-card border border-[var(--line)] self-stretch lg:self-auto shrink-0">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-control text-xs font-sans font-semibold transition-all min-h-10 ${
              viewMode === 'kanban'
                ? 'bg-[var(--panel)] text-[var(--text)] border border-[var(--line)]'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Kanban size={13} />
            <span>{t('admin.crm.kanbanView')}</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-control text-xs font-sans font-semibold transition-all min-h-10 ${
              viewMode === 'list'
                ? 'bg-[var(--panel)] text-[var(--text)] border border-[var(--line)]'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
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
          <div className="ams-kanban-scroll flex gap-4 min-w-[1400px] xl:min-w-full items-start">
            
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
                  className={`bg-[var(--panel)] border rounded-card flex flex-col flex-1 min-w-[280px] max-w-[340px] shrink-0 transition-all ${
                    isOver ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 bg-[var(--accent)]/5' : 'border-[var(--line)]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)] rounded-t-card">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          stageDef.key === 'won' ? 'bg-emerald-400' :
                          stageDef.key === 'new' ? 'bg-rose-400 animate-pulse' :
                          stageDef.key === 'negotiation' ? 'bg-purple-400' :
                          stageDef.key === 'proposal' ? 'bg-red-400' :
                          stageDef.key === 'contacted' ? 'bg-amber-400' : 'bg-[var(--muted)]'
                        }`} />
                        <h3 className="text-xs font-semibold font-sans text-[var(--text)] truncate">
                          {language === 'id' ? stageDef.labelId : stageDef.label}
                        </h3>
                        <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-[var(--panel)] text-[var(--muted)] border border-[var(--line)] shrink-0">
                          {stageLeads.length}
                        </span>
                      </div>
                      <div className="text-[11px] font-sans text-[var(--success)] font-semibold mt-1">
                        {formatAmount(stageSum, currency, true)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAddModal(stageDef.key)}
                      title={`Add deal to ${stageDef.labelId}`}
                      className="min-h-10 min-w-10 p-1.5 rounded-control bg-[var(--panel)] hover:bg-[var(--panel-hover)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] transition-colors flex items-center justify-center shrink-0"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Column Cards Stream */}
                  <div className="p-3 space-y-3 overflow-y-auto flex-1 max-h-[calc(100dvh-320px)] min-h-[180px] scrollbar-thin">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-[var(--muted)] text-[11px] font-sans border border-dashed border-[var(--line)] rounded-card">
                        {language === 'id' ? 'Tarik deal ke sini' : 'Drop deals here'}
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const isDragging = draggedLeadId === lead.id;

                        return (
                          <div
                            key={lead.id}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, lead.id)}
                            onClick={() => handleOpenLeadDrawer(lead)}
                            className={`draggable-card kanban-card bg-[var(--panel)] hover:bg-[var(--panel)] border hover:border-[var(--accent)]/60 rounded-card p-3 cursor-pointer transition-all group relative ${
                              isDragging ? 'opacity-40 scale-95 border-[var(--accent)] border-dashed' : 'border-[var(--line)]'
                            }`}
                          >
                            {/* Top Card Info */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className={`text-[9px] font-sans px-2 py-0.5 rounded border font-semibold truncate max-w-[130px] ${getPillarColor(lead.servicePillar)}`}>
                                {lead.servicePillar}
                              </span>
                              <div className="flex items-center gap-1">
                                {getPriorityBadge(lead.priority)}
                                <div className="text-[var(--muted)] group-hover:text-[var(--muted)] cursor-grab" data-drag-handle>
                                  <GripVertical size={13} />
                                </div>
                              </div>
                            </div>

                            {/* Client & Company */}
                            <h4 className="text-xs font-semibold text-[var(--text)] font-sans leading-snug group-hover:text-[var(--danger)] transition-colors line-clamp-1">
                              {lead.clientName}
                            </h4>
                            <p className="text-[11px] text-[var(--muted)] font-sans truncate mb-2.5">
                              {lead.company}
                            </p>

                            {/* Deal Value & Source */}
                            <div className="flex items-center justify-between text-xs font-sans pb-2.5 mb-2.5 border-t border-[var(--line)] pt-2">
                              <span className="text-[var(--success)] font-semibold font-sans text-sm tracking-tight">
                                {formatAmount(lead.dealValue, currency)}
                              </span>
                              <span className="text-[10px] text-[var(--muted)] font-sans px-1.5 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)] shrink-0">
                                {lead.source}
                              </span>
                            </div>

                            {/* Card Bottom: Quick Actions */}
                            <div className="flex items-center justify-between gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
                              {/* Left: Won / Project status action */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {lead.stage !== 'won' && lead.stage !== 'lost' && (
                                  <button
                                    onClick={() => handleStageChange(lead.id, 'won')}
                                    title={language === 'id' ? 'Tandai Deal Dimenangkan (Won)' : 'Mark deal as Won'}
                                    className="h-10 sm:h-7 min-h-10 sm:min-h-0 px-2.5 rounded-control bg-[var(--success)]/10 hover:bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30 text-[10px] font-semibold font-sans transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap"
                                  >
                                    <Check size={11} className="text-[var(--success)]" />
                                    <span>Won</span>
                                  </button>
                                )}
                                {lead.stage === 'won' && (
                                  <button
                                    onClick={() => handleConvertToProject(lead)}
                                    title={language === 'id' ? 'Konversi ke Proyek Aktif' : 'Convert deal to Agency Project'}
                                    className="h-10 sm:h-7 min-h-10 sm:min-h-0 px-2.5 rounded-control bg-[var(--accent)]/20 hover:bg-[var(--accent)]/40 text-[var(--danger)] border border-[var(--accent)]/30 text-[10px] font-semibold font-sans transition-colors flex items-center gap-1 whitespace-nowrap"
                                  >
                                    <Layers size={11} />
                                    <span>Project</span>
                                  </button>
                                )}
                                {lead.stage === 'lost' && (
                                  <span className="text-[10px] font-sans text-[var(--muted)] px-2 py-1 rounded bg-[var(--panel)] border border-[var(--line)] whitespace-nowrap">
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
                                    className="min-h-10 min-w-10 rounded-control bg-[var(--panel)] hover:bg-[var(--success)]/10 text-[var(--muted)] hover:text-[var(--success)] border border-[var(--line)] hover:border-[var(--success)]/30 transition-all flex items-center justify-center shrink-0"
                                  >
                                    <Send size={11} />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleOpenLeadDrawer(lead)}
                                  title={language === 'id' ? 'Lihat profil lead & catatan' : 'Inspect lead profile & notes'}
                                  className="h-10 sm:h-7 min-h-10 sm:min-h-0 px-2.5 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] text-[10px] font-sans transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap"
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
              <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card p-8 text-center text-[var(--muted)] font-sans text-xs">
                {language === 'id' ? 'Tidak ada deal yang cocok.' : 'No matching leads found.'}
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => handleOpenLeadDrawer(lead)}
                  className="bg-[var(--panel)] hover:bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--line)] rounded-card p-4 space-y-3 transition-all cursor-pointer"
                >
                  {/* Header: Client, Company & Stage */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-[var(--text)] text-base font-sans">{lead.clientName}</div>
                      <div className="text-xs text-[var(--muted)] font-sans">{lead.company}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[11px] font-sans text-[var(--text)] shrink-0 font-semibold">
                      {language === 'id'
                        ? (CRM_STAGE_DEFINITIONS.find(s => s.key === lead.stage)?.labelId || lead.stage)
                        : (CRM_STAGE_DEFINITIONS.find(s => s.key === lead.stage)?.label || lead.stage)}
                    </span>
                  </div>

                  {/* Pillar & Priority Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-sans px-2.5 py-1 rounded-lg border font-semibold ${getPillarColor(lead.servicePillar)}`}>
                      {lead.servicePillar}
                    </span>
                    {getPriorityBadge(lead.priority)}
                    {lead.source && (
                      <span className="text-[10px] font-sans text-[var(--muted)] bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--line)]">
                        {lead.source}
                      </span>
                    )}
                  </div>

                  {/* Value & Actions Footer */}
                  <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-sans normal-case text-[var(--muted)]">Deal Value</div>
                      <div className="font-semibold text-[var(--success)] font-sans text-base">
                        {formatAmount(lead.dealValue, currency)}
                      </div>
                      {lead.expectedCloseDate && (
                        <div className="text-[10px] font-sans text-[var(--muted)]">
                          Target: {lead.expectedCloseDate}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {lead.stage === 'won' && (
                        <button
                          onClick={() => handleConvertToProject(lead)}
                          title="Create project"
                          className="w-10 h-10 rounded-control bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/15 border border-[var(--success)]/30 flex items-center justify-center min-h-10 min-w-10"
                        >
                          <Layers size={13} />
                        </button>
                      )}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${cleanPhone(lead.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-control bg-[var(--panel)] text-[var(--success)] hover:bg-[var(--success)]/15 border border-[var(--line)] hover:border-[var(--success)]/30 flex items-center justify-center min-h-10 min-w-10"
                          title="WhatsApp client"
                        >
                          <Send size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(lead)}
                        className="w-10 h-10 rounded-control bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] flex items-center justify-center min-h-10 min-w-10"
                        title="Edit deal"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id, lead.clientName)}
                        className="w-9 h-9 rounded-control bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--danger)] border border-[var(--line)] hover:border-[var(--danger)]/40 flex items-center justify-center min-h-10 min-w-10"
                        title="Delete deal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-[var(--panel)] border border-[var(--line)] rounded-card overflow-hidden shadow-none">
            <div className="ams-table-scroll overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[var(--panel)] text-[var(--muted)] border-b border-[var(--line)] normal-case text-[10px] tracking-normal">
                  <tr>
                    <th className="py-3 px-4">{language === 'id' ? 'Klien & Perusahaan' : 'Client & Company'}</th>
                    <th className="py-3 px-4">{language === 'id' ? 'Pilar Layanan' : 'Service Pillar'}</th>
                    <th className="py-3 px-4 text-right">{language === 'id' ? 'Nilai Deal' : 'Deal Value'}</th>
                    <th className="py-3 px-4">{language === 'id' ? 'Tahap Pipeline' : 'Pipeline Stage'}</th>
                    <th className="py-3 px-4">{language === 'id' ? 'Prioritas' : 'Priority'}</th>
                    <th className="py-3 px-4">{language === 'id' ? 'Sumber' : 'Source'}</th>
                    <th className="py-3 px-4">{language === 'id' ? 'Target Closing' : 'Target Close'}</th>
                    <th className="py-3 px-4 text-right">{language === 'id' ? 'Aksi' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[var(--muted)] font-sans">
                        {language === 'id' ? 'Tidak ada deal yang cocok.' : 'No matching leads found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => handleOpenLeadDrawer(lead)}
                        className="hover:bg-[var(--panel)] transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[var(--text)] font-sans text-sm">
                            {lead.clientName}
                          </div>
                          <div className="text-[11px] text-[var(--muted)]">
                            {lead.company}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-sans px-2 py-0.5 rounded border font-semibold ${getPillarColor(lead.servicePillar)}`}>
                            {lead.servicePillar}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-semibold text-[var(--success)] font-sans text-sm font-sans">
                          {formatAmount(lead.dealValue, currency)}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)] text-[11px] text-[var(--text)]">
                            {language === 'id'
                              ? (CRM_STAGE_DEFINITIONS.find(s => s.key === lead.stage)?.labelId || lead.stage)
                              : (CRM_STAGE_DEFINITIONS.find(s => s.key === lead.stage)?.label || lead.stage)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {getPriorityBadge(lead.priority)}
                        </td>

                        <td className="py-3 px-4 text-[var(--muted)]">
                          {lead.source}
                        </td>

                        <td className="py-3 px-4 text-[var(--muted)]">
                          {lead.expectedCloseDate || '-'}
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {lead.stage === 'won' && (
                              <button
                                onClick={() => handleConvertToProject(lead)}
                                title="Create project"
                                className="w-9 h-9 rounded-control bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/15 border border-[var(--success)]/30 flex items-center justify-center transition-colors min-h-10 min-w-10"
                              >
                                <Layers size={13} />
                              </button>
                            )}
                            {lead.phone && (
                              <a
                                href={`https://wa.me/${cleanPhone(lead.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-control bg-[var(--panel)] text-[var(--success)] hover:bg-[var(--success)]/15 border border-[var(--line)] hover:border-[var(--success)]/30 flex items-center justify-center transition-colors min-h-10 min-w-10"
                                title="WhatsApp client"
                              >
                                <Send size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => handleOpenEditModal(lead)}
                              className="w-10 h-10 rounded-control bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] flex items-center justify-center transition-colors min-h-10 min-w-10"
                              title="Edit deal"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.clientName)}
                              className="w-9 h-9 rounded-control bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--danger)] border border-[var(--line)] hover:border-[var(--danger)]/40 flex items-center justify-center transition-colors min-h-10 min-w-10"
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 ">
          <div className="bg-[var(--panel)] border-l border-[var(--line)] w-full sm:max-w-xl h-full flex flex-col justify-between p-5 sm:p-7 overflow-y-auto shadow-none animate-in slide-in-from-right duration-300 font-sans text-xs">
            
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-[var(--line)]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] border font-semibold ${getPillarColor(selectedLead.servicePillar)}`}>
                      {selectedLead.servicePillar}
                    </span>
                    {getPriorityBadge(selectedLead.priority)}
                    <span className="text-[10px] text-[var(--muted)]">
                      ID: {selectedLead.id}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold font-sans text-[var(--text)]">
                    {selectedLead.clientName}
                  </h2>
                  <p className="text-xs text-[var(--danger)] font-semibold mt-0.5">
                    {selectedLead.company}
                  </p>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] flex items-center justify-center transition-colors text-xs font-sans"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Deal Value & Stage Selector Widget */}
              <div className="p-4 rounded-card bg-[var(--panel)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-[var(--muted)] normal-case tracking-normal font-semibold">
                    {language === 'id' ? 'Valuasi Prospek' : 'Deal Valuation'}
                  </div>
                  <div className="text-2xl font-semibold font-sans text-[var(--success)] font-sans">
                    {formatAmount(selectedLead.dealValue, currency)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)]">{language === 'id' ? 'Tahap:' : 'Stage:'}</span>
                  <CustomSelect value={selectedLead.stage} onChange={(value) => handleStageChange(selectedLead.id, value as CrmStage)} options={CRM_STAGE_DEFINITIONS.map(s => ({ value: s.key, label: language === 'id' ? s.labelId : s.label }))} />
                </div>
              </div>

              {/* Client Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-card bg-[var(--panel)] border border-[var(--line)]">
                  <div className="flex items-center gap-1.5 text-[var(--muted)] mb-1">
                    <Mail size={13} className="text-[var(--danger)]" />
                    <span>{language === 'id' ? 'Email Klien' : 'Client Email'}</span>
                  </div>
                  <a 
                    href={`mailto:${selectedLead.email}`}
                    className="text-[var(--text)] hover:text-[var(--danger)] transition-colors break-all block"
                  >
                    {selectedLead.email || '-'}
                  </a>
                </div>

                <div className="p-3 rounded-card bg-[var(--panel)] border border-[var(--line)]">
                  <div className="flex items-center justify-between text-[var(--muted)] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-[var(--danger)]" />
                      <span>WhatsApp / Phone</span>
                    </div>
                    {selectedLead.phone && (
                      <a
                        href={`https://wa.me/${cleanPhone(selectedLead.phone)}?text=Halo%20${encodeURIComponent(selectedLead.clientName)},%20kami%20dari%20Kapitech%20Agency...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[var(--success)] hover:underline flex items-center gap-0.5"
                      >
                        <span>Chat WA</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <div className="text-[var(--text)]">
                    {selectedLead.phone || '-'}
                  </div>
                </div>
              </div>

              {/* Scope Description */}
              <div>
                <label className="block text-[var(--muted)] normal-case tracking-normal mb-2 font-semibold text-[11px]">
                  {language === 'id' ? 'Deskripsi Scope & Catatan Klien' : 'Project Scope & Acceptance Notes'}
                </label>
                <div className="p-4 rounded-card bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] leading-relaxed font-sans text-xs">
                  {selectedLead.description || (language === 'id' ? 'Belum ada catatan scope proyek.' : 'No detailed scope notes provided.')}
                </div>
              </div>

              {/* Activity Log / Notes Stream */}
              <div>
                <label className="block text-[var(--muted)] normal-case tracking-normal mb-2 font-semibold text-[11px]">
                  {language === 'id' ? 'Riwayat Aktivitas & Catatan Meeting' : 'Activity Timeline & Meeting Notes'}
                </label>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder={language === 'id' ? 'Catat ringkasan meeting atau jadwal follow-up...' : 'Log call, meeting summary, or follow-up note...'}
                    className="flex-1 px-3.5 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-control text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] font-sans min-h-10"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-control bg-[var(--accent)] hover:bg-[var(--accent)] text-[var(--text)] text-xs font-sans font-semibold transition-colors flex items-center gap-1 shrink-0 min-h-10"
                  >
                    <Plus size={13} />
                    <span>{language === 'id' ? 'Catat' : 'Log'}</span>
                  </button>
                </form>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    selectedLead.notes.slice().reverse().map((note) => (
                      <div key={note.id} className="p-3 rounded-card bg-[var(--panel)] border border-[var(--line)] text-xs">
                        <div className="flex items-center justify-between text-[10px] text-[var(--muted)] mb-1">
                          <span className="text-[var(--danger)] font-semibold">{note.author}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[var(--text)] leading-snug">{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-[var(--muted)]">
                      {language === 'id' ? 'Belum ada catatan aktivitas.' : 'No activity notes logged yet.'}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Bottom Action Buttons */}
            <div className="pt-5 border-t border-[var(--line)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedLead)}
                  className="px-3.5 py-2 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] text-xs transition-colors flex items-center gap-1.5 min-h-10"
                >
                  <Edit3 size={13} />
                  <span>{t('admin.action.edit')}</span>
                </button>
                <button
                  onClick={() => handleDeleteLead(selectedLead.id, selectedLead.clientName)}
                  className="p-2 rounded-card bg-[var(--panel)] hover:bg-[var(--danger)]/15 text-[var(--muted)] hover:text-[var(--danger)] border border-[var(--line)] hover:border-[var(--danger)]/30 transition-colors min-h-10 min-w-[40px] flex items-center justify-center"
                  title="Delete deal"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {selectedLead.stage === 'won' && (
                <button
                  onClick={() => handleConvertToProject(selectedLead)}
                  className="px-4 py-2 rounded-control bg-[var(--accent)] hover:brightness-110 text-white font-semibold text-xs flex items-center gap-1.5 shadow-none min-h-10"
                >
                  <Layers size={13} />
                  <span>{t('admin.crm.convertToProject')}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 6. CREATE / EDIT DEAL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80  flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card w-full max-w-xl max-h-[calc(100dvh-24px)] overflow-y-auto p-6 shadow-none">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--line)]">
              <h3 className="font-sans font-semibold text-[var(--text)] text-lg flex items-center gap-2">
                <Briefcase className="text-[var(--danger)]" size={20} />
                <span>{editingLead ? (language === 'id' ? 'Edit Data Prospek' : 'Edit CRM Deal') : t('admin.crm.addDeal')}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="min-h-10 min-w-10 p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded-control bg-[var(--panel)] border border-[var(--line)]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Nama PIC Klien *' : 'Client PIC Name *'}</label>
                  <input
                    type="text"
                    required
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    placeholder="e.g. Adrian Wicaksono"
                    className="w-full px-3.5 py-2.5 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-10"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Nama Perusahaan / Brand *' : 'Company Name *'}</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Bank Mandiri FinTech Division"
                    className="w-full px-3.5 py-2.5 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="adrian@company.com"
                    className="w-full px-3.5 py-2.5 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-10"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="w-full px-3.5 py-2.5 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Pilar Layanan' : 'Service Pillar'}</label>
                  <CustomSelect value={formPillar} onChange={(value) => setFormPillar(value as CrmServicePillar)} options={[{value:'Web Development',label:'Web Development'},{value:'UI/UX Design',label:'UI/UX Design'},{value:'Branding & Identity',label:'Branding & Identity'},{value:'AI & Cloud Solutions',label:'AI & Cloud Solutions'},{value:'Digital Product MVP',label:'Digital Product MVP'}]} />
                </div>

                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Nilai Deal (IDR)' : 'Deal Value (IDR)'}</label>
                  <input
                    type="number"
                    value={formDealValue}
                    onChange={(e) => setFormDealValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-10"
                  />
                </div>

                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Tahap' : 'Stage'}</label>
                  <CustomSelect value={formStage} onChange={(value) => setFormStage(value as CrmStage)} options={CRM_STAGE_DEFINITIONS.map(s => ({ value: s.key, label: language === 'id' ? s.labelId : s.label }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Prioritas' : 'Priority'}</label>
                  <CustomSelect value={formPriority} onChange={(value) => setFormPriority(value as CrmPriority)} options={[{value:'low',label:'Low'},{value:'medium',label:'Medium'},{value:'high',label:'High'},{value:'urgent',label:'Urgent'}]} />
                </div>

                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Target Tanggal Closing' : 'Target Close Date'}</label>
                  <input
                    type="date"
                    value={formExpectedClose}
                    onChange={(e) => setFormExpectedClose(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Ringkasan / Scope Kebutuhan' : 'Brief / Project Scope'}</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={language === 'id' ? 'Kebutuhan teknis, ekspektasi timeline, catatan budget...' : 'Requirements, tech stack expectations, budget notes...'}
                  className="w-full px-3.5 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-sans text-xs"
                />
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-10 px-4 rounded-control bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] text-xs font-sans font-medium transition-colors"
                >
                  {t('admin.action.cancel')}
                </button>
                <button
                  type="submit"
                  className="min-h-10 px-5 rounded-control bg-[var(--accent)] text-white font-sans font-semibold text-xs hover:bg-[var(--accent)] transition-colors"
                >
                  {editingLead ? (language === 'id' ? 'Simpan Perubahan' : 'Update Deal') : (language === 'id' ? 'Buat Deal' : 'Save Deal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </>
  );
};
export default AdminCrm;
