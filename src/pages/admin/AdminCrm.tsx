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
import { saveAgencyProject, AgencyProject } from '../../lib/projectStore';
import { useLanguage } from '../../lib/LanguageContext';
import { useDragToScroll } from '../../lib/useDragToScroll';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { formatAmount, getActiveCurrency, setGlobalCurrency, CurrencyCode, CURRENCY_EVENT } from '../../lib/currency';

export const AdminCrm: React.FC = () => {
  const { language, t } = useLanguage();
  const kanbanScrollRef = useDragToScroll<HTMLDivElement>();
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

  const handleStageChange = (leadId: string, newStage: CrmStage) => {
    updateLeadStage(leadId, newStage);
    const stageDef = CRM_STAGE_DEFINITIONS.find(s => s.key === newStage);
    const stageName = language === 'id' ? (stageDef?.labelId || newStage) : (stageDef?.label || newStage);
    showToast(language === 'id' ? `Tahap deal diperbarui ke ${stageName}` : `Lead stage updated to ${stageName}`);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, stage: newStage } : null);
    }
  };

  const handleConvertToProject = (lead: CrmLead) => {
    const newProj: AgencyProject = {
      id: 'proj_' + Date.now().toString(36),
      name: `${lead.company} — ${lead.servicePillar}`,
      clientName: lead.clientName,
      clientCompany: lead.company,
      clientEmail: lead.email || '',
      crmLeadId: lead.id,
      serviceCategory: lead.servicePillar,
      status: 'in_progress',
      budget: lead.dealValue,
      progressPercent: 15,
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      teamLead: 'Principal Tech Lead',
      teamMembers: ['Senior Frontend Dev', 'UI/UX Specialist'],
      techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS'],
      liveStagingUrl: 'https://staging.app.kapitech.id',
      milestones: [
        { id: 'm_1', title: 'Sprint 1: Architecture & UI Spec', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false },
        { id: 'm_2', title: 'Sprint 2: Core Engineering Handover', dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false }
      ],
      tasks: [
        {
          id: 't_init_1',
          title: `Kickoff sprint architecture and repository setup for ${lead.company}`,
          status: 'in_progress',
          priority: 'high',
          assignedTo: 'Lead Full-Stack Tech',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          subtasks: [
            { id: 'st_1', title: 'Setup GitHub repository with CI/CD', completed: false },
            { id: 'st_2', title: 'Initialize staging domain at kapitech.id', completed: false }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveAgencyProject(newProj);
    showToast(language === 'id' ? `Proyek aktif dibuat di Task Board!` : `Active project created in Projects workspace!`);
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

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
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

    saveCrmLead(leadData);
    setIsAddModalOpen(false);
    showToast(editingLead ? (language === 'id' ? 'Data prospek berhasil diperbarui.' : 'Deal updated successfully.') : (language === 'id' ? 'Deal prospek baru berhasil dibuat.' : 'New deal created successfully.'));
  };

  const handleDeleteLead = (id: string, name: string) => {
    if (window.confirm(language === 'id' ? `Hapus prospek ${name}?` : `Delete lead ${name}?`)) {
      deleteCrmLead(id);
      if (selectedLead && selectedLead.id === id) {
        setIsDrawerOpen(false);
        setSelectedLead(null);
      }
      showToast(language === 'id' ? 'Data deal telah dihapus.' : 'Deal removed from CRM.');
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteText.trim()) return;

    addLeadNote(selectedLead.id, newNoteText.trim(), 'note');
    setNewNoteText('');
    const updated = getCmsLeads().find(l => l.id === selectedLead.id);
    if (updated) setSelectedLead(updated);
    showToast(language === 'id' ? 'Catatan aktivitas ditambahkan.' : 'Activity note added.');
  };

  const getPriorityBadge = (priority: CrmPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-mono font-bold uppercase">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold uppercase">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-mono font-bold uppercase">Medium</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 text-[9px] font-mono font-bold uppercase">Low</span>;
    }
  };

  const getPillarColor = (pillar: CrmServicePillar) => {
    switch (pillar) {
      case 'Web Development':
        return 'text-brand-red bg-brand-red/10 border-brand-red/30';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#30363D]">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Briefcase className="text-brand-red" size={24} />
            <span>{t('admin.crm.title')}</span>
          </h1>
          <p className="text-xs text-[#8A909D] mt-1 font-mono">
            {t('admin.crm.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center rounded-xl bg-[#161B22] border border-[#30363D] p-1 font-mono text-xs">
            <button
              onClick={() => handleCurrencyToggle('IDR')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                currency === 'IDR'
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'text-[#8A909D] hover:text-white'
              }`}
            >
              IDR (Rp)
            </button>
            <button
              onClick={() => handleCurrencyToggle('USD')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                currency === 'USD'
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'text-[#8A909D] hover:text-white'
              }`}
            >
              USD ($)
            </button>
          </div>

          <button
            onClick={() => exportCrmLeadsToCsv(filteredLeads)}
            className="px-3.5 py-2.5 rounded-xl bg-[#161B22] hover:bg-[#1E242C] text-white border border-[#30363D] text-xs font-mono transition-all flex items-center gap-2 min-h-[44px]"
          >
            <Download size={14} className="text-[#8A909D]" />
            <span className="hidden sm:inline">{t('admin.action.exportCsv')}</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('new')}
            className="px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-red/20 min-h-[44px]"
          >
            <Plus size={15} />
            <span>{t('admin.crm.addDeal')}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-300">
          <Check size={15} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-[#161B22] border border-[#30363D] p-5 sm:p-6 rounded-2xl flex flex-col justify-between group hover:border-[#4B5563] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">{t('admin.dash.pipelineValue')}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight break-words font-mono">
              {formatAmount(metrics.totalPipelineValue, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#30363D] text-[11px] font-mono">
            <span className="text-[#8A909D]">{metrics.activeDealsCount} {language === 'id' ? 'Prospek Aktif' : 'Active Deals'}</span>
            <span className="text-emerald-400 font-semibold">{language === 'id' ? 'Tertimbang:' : 'Weighted:'} {formatAmount(metrics.weightedPipelineValue, currency, true)}</span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] p-5 sm:p-6 rounded-2xl flex flex-col justify-between group hover:border-[#4B5563] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">{t('admin.dash.wonRevenue')}</span>
              <div className="w-8 h-8 rounded-lg bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight break-words font-mono">
              {formatAmount(metrics.totalWonValue, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#30363D] text-[11px] font-mono">
            <span className="text-[#8A909D]">{metrics.wonDealsCount} {language === 'id' ? 'Kontrak Ditandatangani' : 'Contracts Signed'}</span>
            <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
              <TrendingUp size={12} />
              <span>Win Rate {metrics.winRate}%</span>
            </span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] p-5 sm:p-6 rounded-2xl flex flex-col justify-between group hover:border-[#4B5563] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">{language === 'id' ? 'Proposal & Negosiasi' : 'In Proposal & Scoping'}</span>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Activity size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight break-words font-mono">
              {formatAmount(metrics.negotiationValue, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#30363D] text-[11px] font-mono">
            <span className="text-[#8A909D]">{language === 'id' ? 'Tahap Penawaran' : 'Proposal / SOW Stage'}</span>
            <span className="text-red-400 font-semibold">{language === 'id' ? 'Potensi Tinggi' : 'High Conversion'}</span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] p-5 sm:p-6 rounded-2xl flex flex-col justify-between group hover:border-[#4B5563] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">{language === 'id' ? 'Rata-rata Nilai Deal' : 'Avg Deal Size'}</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight break-words font-mono">
              {formatAmount(metrics.avgDealSize, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#30363D] text-[11px] font-mono">
            <span className="text-[#8A909D]">{language === 'id' ? 'Per Klien Inbound' : 'Per Client Lead'}</span>
            <span className="text-purple-400 font-semibold">{language === 'id' ? 'Standar Studio' : 'Agency Standard'}</span>
          </div>
        </div>

      </div>

      {/* 3. Filter Bar & View Mode Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#161B22] border border-[#30363D] p-4 sm:p-5 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A909D]" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'id' ? 'Cari prospek, perusahaan, atau kata kunci...' : 'Search leads, companies, or keywords...'}
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-xs text-white placeholder-[#5C626E] focus:outline-none focus:border-brand-red font-mono min-h-[44px]"
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

        <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded-xl border border-[#30363D] self-start md:self-auto shrink-0">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all min-h-[38px] ${
              viewMode === 'kanban'
                ? 'bg-[#161B22] text-white shadow-sm border border-[#30363D]'
                : 'text-[#8A909D] hover:text-white'
            }`}
          >
            <Kanban size={13} />
            <span>{t('admin.crm.kanbanView')}</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all min-h-[38px] ${
              viewMode === 'list'
                ? 'bg-[#161B22] text-white shadow-sm border border-[#30363D]'
                : 'text-[#8A909D] hover:text-white'
            }`}
          >
            <List size={13} />
            <span>{t('admin.crm.listView')}</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN VIEW: KANBAN BOARD OR LIST TABLE */}
      {viewMode === 'kanban' ? (
        <div 
          ref={kanbanScrollRef}
          className="overflow-x-auto pb-4 select-none cursor-grab active:cursor-grabbing"
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
                  className={`bg-[#111317] border rounded-2xl flex flex-col flex-1 min-w-[260px] max-w-[320px] shrink-0 transition-all ${
                    isOver ? 'border-brand-red ring-2 ring-brand-red/30 bg-brand-red/5' : 'border-[#30363D]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-[#30363D] flex items-center justify-between bg-[#161B22] rounded-t-2xl">
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
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0D1117] text-[#8A909D] border border-[#30363D] shrink-0">
                          {stageLeads.length}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-1">
                        {formatAmount(stageSum, currency, true)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAddModal(stageDef.key)}
                      title={`Add deal to ${stageDef.labelId}`}
                      className="p-1 rounded-lg bg-[#0D1117] hover:bg-[#1E242C] text-[#8A909D] hover:text-white border border-[#30363D] transition-colors shrink-0"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Column Cards Stream */}
                  <div className="p-3 space-y-3 overflow-y-auto flex-1 max-h-[calc(100vh-320px)] min-h-[180px] scrollbar-thin">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-[#5C626E] text-[11px] font-mono border border-dashed border-[#30363D] rounded-xl">
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
                            className={`draggable-card kanban-card bg-[#161B22] hover:bg-[#1E242C] border hover:border-brand-red/60 rounded-xl p-3.5 cursor-pointer transition-all shadow-md group relative ${
                              isDragging ? 'opacity-40 scale-95 border-brand-red border-dashed' : 'border-[#30363D]'
                            }`}
                          >
                            {/* Top Card Info */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold truncate max-w-[130px] ${getPillarColor(lead.servicePillar)}`}>
                                {lead.servicePillar}
                              </span>
                              <div className="flex items-center gap-1">
                                {getPriorityBadge(lead.priority)}
                                <div className="text-[#5C626E] group-hover:text-[#8A909D] cursor-grab" data-drag-handle>
                                  <GripVertical size={13} />
                                </div>
                              </div>
                            </div>

                            {/* Client & Company */}
                            <h4 className="text-xs font-bold text-white font-display leading-snug group-hover:text-brand-red transition-colors line-clamp-1">
                              {lead.clientName}
                            </h4>
                            <p className="text-[11px] text-[#8A909D] font-mono truncate mb-3">
                              {lead.company}
                            </p>

                            {/* Deal Value */}
                            <div className="flex items-center justify-between text-xs font-mono pb-2.5 mb-2.5 border-t border-[#30363D] pt-2">
                              <span className="text-emerald-400 font-bold font-display text-sm">
                                {formatAmount(lead.dealValue, currency)}
                              </span>
                              <span className="text-[10px] text-[#5C626E]">
                                {lead.source}
                              </span>
                            </div>

                            {/* Card Bottom: Quick Actions */}
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A909D]" onClick={(e) => e.stopPropagation()}>
                              {/* Quick Move Stage Selector */}
                              <select
                                value={lead.stage}
                                onChange={(e) => handleStageChange(lead.id, e.target.value as CrmStage)}
                                className="bg-[#0D1117] border border-[#30363D] text-[#D0D4DC] rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-brand-red font-mono max-w-[110px]"
                              >
                                {CRM_STAGE_DEFINITIONS.map(s => (
                                  <option key={s.key} value={s.key}>
                                    {language === 'id' ? s.labelId : s.label}
                                  </option>
                                ))}
                              </select>

                              {/* Quick Actions */}
                              <div className="flex items-center gap-1.5">
                                {lead.stage === 'won' && (
                                  <button
                                    onClick={() => handleConvertToProject(lead)}
                                    title="Create active Agency Project"
                                    className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/80 border border-emerald-500/30 transition-colors"
                                  >
                                    <Layers size={11} />
                                  </button>
                                )}
                                {lead.phone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone(lead.phone)}?text=Halo%20${encodeURIComponent(lead.clientName)},%20kami%20dari%20tim%20Kapitech%20Agency...`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Send WhatsApp message"
                                    className="p-1.5 rounded-lg bg-[#0D1117] hover:bg-emerald-950/60 text-emerald-400 border border-[#30363D] transition-colors"
                                  >
                                    <Send size={11} />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleOpenLeadDrawer(lead)}
                                  title="View lead profile"
                                  className="p-1.5 rounded-lg bg-[#0D1117] hover:bg-[#1E242C] text-[#8A909D] hover:text-white border border-[#30363D] transition-colors"
                                >
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
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0D1117] text-[#8A909D] border-b border-[#30363D] uppercase text-[10px] tracking-wider">
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
                    <td colSpan={8} className="py-8 text-center text-[#5C626E] font-mono">
                      {language === 'id' ? 'Tidak ada deal yang cocok.' : 'No matching leads found.'}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => handleOpenLeadDrawer(lead)}
                      className="hover:bg-[#1E242C] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white font-display text-sm">
                          {lead.clientName}
                        </div>
                        <div className="text-[11px] text-[#8A909D]">
                          {lead.company}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getPillarColor(lead.servicePillar)}`}>
                          {lead.servicePillar}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400 font-display text-sm font-mono">
                        {formatAmount(lead.dealValue, currency)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[11px] text-[#D0D4DC]">
                          {language === 'id'
                            ? (CRM_STAGE_DEFINITIONS.find(s => s.key === lead.stage)?.labelId || lead.stage)
                            : (CRM_STAGE_DEFINITIONS.find(s => s.key === lead.stage)?.label || lead.stage)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {getPriorityBadge(lead.priority)}
                      </td>

                      <td className="py-3.5 px-4 text-[#8A909D]">
                        {lead.source}
                      </td>

                      <td className="py-3.5 px-4 text-[#8A909D]">
                        {lead.expectedCloseDate || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.stage === 'won' && (
                            <button
                              onClick={() => handleConvertToProject(lead)}
                              title="Create project"
                              className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/80 border border-emerald-500/30 min-h-[32px] min-w-[32px] flex items-center justify-center"
                            >
                              <Layers size={13} />
                            </button>
                          )}
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${cleanPhone(lead.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-[#0D1117] text-emerald-400 hover:bg-emerald-950/50 border border-[#30363D] min-h-[32px] min-w-[32px] flex items-center justify-center"
                              title="WhatsApp client"
                            >
                              <Send size={13} />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(lead)}
                            className="p-1.5 rounded-lg bg-[#0D1117] text-[#8A909D] hover:text-white border border-[#30363D] min-h-[32px] min-w-[32px] flex items-center justify-center"
                            title="Edit deal"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.clientName)}
                            className="p-1.5 rounded-lg bg-[#0D1117] text-[#8A909D] hover:text-red-400 border border-[#30363D] hover:border-red-500/40 min-h-[32px] min-w-[32px] flex items-center justify-center"
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
      )}

      {/* 5. CLIENT & DEAL PROFILE DRAWER */}
      {isDrawerOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111317] border-l border-[#30363D] w-full sm:max-w-xl h-full flex flex-col justify-between p-5 sm:p-7 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300 font-mono text-xs">
            
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#30363D]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] border font-semibold ${getPillarColor(selectedLead.servicePillar)}`}>
                      {selectedLead.servicePillar}
                    </span>
                    {getPriorityBadge(selectedLead.priority)}
                    <span className="text-[10px] text-[#5C626E]">
                      ID: {selectedLead.id}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    {selectedLead.clientName}
                  </h2>
                  <p className="text-xs text-brand-red font-semibold mt-0.5">
                    {selectedLead.company}
                  </p>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl bg-[#0D1117] hover:bg-[#1E242C] text-[#8A909D] hover:text-white border border-[#30363D] flex items-center justify-center transition-colors text-xs font-mono"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Deal Value & Stage Selector Widget */}
              <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-[#8A909D] uppercase tracking-wider font-semibold">
                    {language === 'id' ? 'Valuasi Prospek' : 'Deal Valuation'}
                  </div>
                  <div className="text-2xl font-bold font-display text-emerald-400 font-mono">
                    {formatAmount(selectedLead.dealValue, currency)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8A909D]">{language === 'id' ? 'Tahap:' : 'Stage:'}</span>
                  <select
                    value={selectedLead.stage}
                    onChange={(e) => handleStageChange(selectedLead.id, e.target.value as CrmStage)}
                    className="px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
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
                <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
                  <div className="flex items-center gap-1.5 text-[#8A909D] mb-1">
                    <Mail size={13} className="text-brand-red" />
                    <span>{language === 'id' ? 'Email Klien' : 'Client Email'}</span>
                  </div>
                  <a 
                    href={`mailto:${selectedLead.email}`}
                    className="text-white hover:text-brand-red transition-colors break-all block"
                  >
                    {selectedLead.email || '-'}
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
                  <div className="flex items-center justify-between text-[#8A909D] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-brand-red" />
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
                <label className="block text-[#8A909D] uppercase tracking-wider mb-2 font-semibold text-[11px]">
                  {language === 'id' ? 'Deskripsi Scope & Catatan Klien' : 'Project Scope & Acceptance Notes'}
                </label>
                <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] text-gray-200 leading-relaxed font-sans text-xs">
                  {selectedLead.description || (language === 'id' ? 'Belum ada catatan scope proyek.' : 'No detailed scope notes provided.')}
                </div>
              </div>

              {/* Activity Log / Notes Stream */}
              <div>
                <label className="block text-[#8A909D] uppercase tracking-wider mb-2 font-semibold text-[11px]">
                  {language === 'id' ? 'Riwayat Aktivitas & Catatan Meeting' : 'Activity Timeline & Meeting Notes'}
                </label>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder={language === 'id' ? 'Catat ringkasan meeting atau jadwal follow-up...' : 'Log call, meeting summary, or follow-up note...'}
                    className="flex-1 px-3.5 py-2 bg-[#0D1117] border border-[#30363D] rounded-xl text-xs text-white placeholder-[#5C626E] focus:outline-none focus:border-brand-red font-mono min-h-[44px]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold transition-colors flex items-center gap-1 shrink-0 min-h-[44px]"
                  >
                    <Plus size={13} />
                    <span>{language === 'id' ? 'Catat' : 'Log'}</span>
                  </button>
                </form>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    selectedLead.notes.slice().reverse().map((note) => (
                      <div key={note.id} className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] text-xs">
                        <div className="flex items-center justify-between text-[10px] text-[#5C626E] mb-1">
                          <span className="text-brand-red font-semibold">{note.author}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[#D0D4DC] leading-snug">{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-[#5C626E]">
                      {language === 'id' ? 'Belum ada catatan aktivitas.' : 'No activity notes logged yet.'}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Bottom Action Buttons */}
            <div className="pt-5 border-t border-[#30363D] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedLead)}
                  className="px-3.5 py-2 rounded-xl bg-[#161B22] hover:bg-[#1E242C] text-white border border-[#30363D] text-xs transition-colors flex items-center gap-1.5 min-h-[40px]"
                >
                  <Edit3 size={13} />
                  <span>{t('admin.action.edit')}</span>
                </button>
                <button
                  onClick={() => handleDeleteLead(selectedLead.id, selectedLead.clientName)}
                  className="p-2 rounded-xl bg-[#161B22] hover:bg-red-950/40 text-[#8A909D] hover:text-red-400 border border-[#30363D] hover:border-red-500/30 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="Delete deal"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {selectedLead.stage === 'won' && (
                <button
                  onClick={() => handleConvertToProject(selectedLead)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 min-h-[40px]"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#30363D]">
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <Briefcase className="text-brand-red" size={20} />
                <span>{editingLead ? (language === 'id' ? 'Edit Data Prospek' : 'Edit CRM Deal') : t('admin.crm.addDeal')}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-[#8A909D] hover:text-white rounded-lg bg-[#0D1117] border border-[#30363D]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">{language === 'id' ? 'Nama PIC Klien *' : 'Client PIC Name *'}</label>
                  <input
                    type="text"
                    required
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    placeholder="e.g. Adrian Wicaksono"
                    className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-brand-red min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">{language === 'id' ? 'Nama Perusahaan / Brand *' : 'Company Name *'}</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Bank Mandiri FinTech Division"
                    className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-brand-red min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="adrian@company.com"
                    className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-brand-red min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-brand-red min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">{language === 'id' ? 'Pilar Layanan' : 'Service Pillar'}</label>
                  <select
                    value={formPillar}
                    onChange={(e) => setFormPillar(e.target.value as CrmServicePillar)}
                    className="w-full px-3 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-brand-red min-h-[44px]"
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
                  <label className="block text-[#8A909D] mb-1 font-semibold">{language === 'id' ? 'Nilai Deal (IDR)' : 'Deal Value (IDR)'}</label>
                  <input
                    type="number"
                    value={formDealValue}
                    onChange={(e) => setFormDealValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-brand-red min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">{language === 'id' ? 'Tahap' : 'Stage'}</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value as CrmStage)}
                    className="w-full px-3 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-brand-red min-h-[44px]"
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
                  <label className="block text-[#8A909D] mb-1 font-semibold">{language === 'id' ? 'Prioritas' : 'Priority'}</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as CrmPriority)}
                    className="w-full px-3 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-brand-red min-h-[44px]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">{language === 'id' ? 'Target Tanggal Closing' : 'Target Close Date'}</label>
                  <input
                    type="date"
                    value={formExpectedClose}
                    onChange={(e) => setFormExpectedClose(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-brand-red min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">{language === 'id' ? 'Ringkasan / Scope Kebutuhan' : 'Brief / Project Scope'}</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={language === 'id' ? 'Kebutuhan teknis, ekspektasi timeline, catatan budget...' : 'Requirements, tech stack expectations, budget notes...'}
                  className="w-full px-3.5 py-2 bg-[#0D1117] border border-[#30363D] rounded-xl text-white focus:outline-none focus:border-brand-red font-sans text-xs"
                />
              </div>

              <div className="pt-4 border-t border-[#30363D] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0D1117] text-[#8A909D] hover:text-white border border-[#30363D] min-h-[44px]"
                >
                  {t('admin.action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-red text-white font-bold hover:bg-brand-red/90 transition-all shadow-md shadow-brand-red/20 min-h-[44px]"
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
