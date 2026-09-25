import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Trash2,
  Edit3,
  Check,
  X,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Activity
} from 'lucide-react';
import { AgencyClient } from '../../lib/clientStore';
import { formatAmount, getActiveCurrency, CURRENCY_EVENT, CurrencyCode } from '../../lib/currency';
import { useLanguage } from '../../lib/LanguageContext';
import { hasAdminPermission } from '../../lib/adminAuth';
import { api } from '../../lib/apiClient';
import { useDragToScroll } from '../../lib/useDragToScroll';
import { ScrollShadowContainer } from '../../components/ui/ScrollShadowContainer';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Modal } from '../../components/ui/Modal';

export const AdminClients: React.FC = () => {
  const canManageClients = hasAdminPermission('canManageClients');
  const { t, language } = useLanguage();
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Drag-to-scroll hook for horizontal table
  const tableScrollRef = useDragToScroll<HTMLDivElement>();

  // Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editingClient, setEditingClient] = useState<AgencyClient | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('Jakarta, Indonesia');
  const [industry, setIndustry] = useState('Real Estate & Luxury Property');
  const [clientStatus, setClientStatus] = useState<AgencyClient['status']>('active');
  const [totalSpend, setTotalSpend] = useState<number>(50000000);
  const [projectsCount, setProjectsCount] = useState<number>(1);
  const [role, setRole] = useState('Managing Director');
  const [notes, setNotes] = useState('');
  const [slaDailyBudget, setSlaDailyBudget] = useState<number>(5000000);
  const [currentDailySpend, setCurrentDailySpend] = useState<number>(3500000);

  const loadData = async () => {
    try {
      const res = await api.clients.getAll();
      if (res.success && Array.isArray(res.data?.clients)) setClients(res.data.clients as AgencyClient[]);
    } catch {
      showToast(language === 'id' ? 'Gagal memuat client.' : 'Failed to load clients.');
    }
  };

  useEffect(() => {
    loadData();

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail?.currency || getActiveCurrency());
    };
    window.addEventListener(CURRENCY_EVENT, handleCurrencyChange);

    return (
    <>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm" title={language === 'id' ? 'Hapus klien?' : 'Delete client?'} description={language === 'id' ? `Catatan klien ${deleteTarget?.name || ''} akan dihapus.` : `Client record ${deleteTarget?.name || ''} will be removed.`}><div className="flex flex-col-reverse sm:flex-row justify-end gap-2"><button type="button" onClick={() => setDeleteTarget(null)} className="min-h-10 px-4 rounded-control border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--muted)]">Cancel</button><button type="button" onClick={() => deleteTarget && void confirmDeleteClient(deleteTarget.id)} className="min-h-10 px-4 rounded-control bg-[var(--danger)] text-white text-xs font-semibold">Delete</button></div></Modal>
      <div>) => {
      window.removeEventListener(CURRENCY_EVENT, handleCurrencyChange);
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  const activeAccountsCount = useMemo(() => clients.filter(c => c.status === 'active').length, [clients]);
  const totalLifetimeSpend = useMemo(() => clients.reduce((sum, c) => sum + (c.totalSpend || 0), 0), [clients]);
  
  // SLA Warnings Check
  const clientsExceedingSla = useMemo(() => {
    return clients.filter(c => {
      if (c.slaDailyAdSpendBudget && c.currentDailyAdSpend) {
        return c.currentDailyAdSpend > c.slaDailyAdSpendBudget;
      }
      return false;
    });
  }, [clients]);

  const handleOpenCreateClient = () => {
    setEditingClient(null);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setWebsite('');
    setLocation('Jakarta, Indonesia');
    setIndustry('Real Estate & PropTech');
    setClientStatus('active');
    setTotalSpend(65000000);
    setProjectsCount(1);
    setRole('Head of Product');
    setNotes('');
    setSlaDailyBudget(5000000);
    setCurrentDailySpend(3500000);
    setIsClientModalOpen(true);
  };

  const handleOpenEditClient = (c: AgencyClient) => {
    setEditingClient(c);
    setName(c.name);
    setCompany(c.company);
    setEmail(c.email);
    setPhone(c.phone);
    setWebsite(c.website || '');
    setLocation(c.location);
    setIndustry(c.industry);
    setClientStatus(c.status);
    setTotalSpend(c.totalSpend);
    setProjectsCount(c.projectsCount);
    setRole(c.contactPersonRole);
    setNotes(c.notes || '');
    setSlaDailyBudget(c.slaDailyAdSpendBudget || 5000000);
    setCurrentDailySpend(c.currentDailyAdSpend || 0);
    setIsClientModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageClients) return;
    if (!name.trim() || !company.trim()) {
      alert('Client Name and Company are required.');
      return;
    }

    const clientData: AgencyClient = {
      id: editingClient?.id || 'client_' + Date.now().toString(36),
      name,
      company,
      email,
      phone,
      website,
      location,
      industry,
      status: clientStatus,
      totalSpend: Number(totalSpend) || 0,
      projectsCount: Number(projectsCount) || 1,
      contactPersonRole: role,
      notes,
      slaDailyAdSpendBudget: Number(slaDailyBudget) || 0,
      currentDailyAdSpend: Number(currentDailySpend) || 0,
      createdAt: editingClient?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!canManageClients) return;
    const res = editingClient
      ? await api.clients.update(clientData.id, clientData)
      : await api.clients.create(clientData);
    if (!res.success || !res.data?.client) {
      setStatusMessage(res.error || (language === 'id' ? 'Client gagal disimpan.' : 'Failed to save client.'));
      return;
    }
    setClients(prev => editingClient ? prev.map(item => item.id === clientData.id ? res.data!.client as AgencyClient : item) : [res.data!.client as AgencyClient, ...prev]);
    setIsClientModalOpen(false);
    showToast(language === 'id' ? 'Klien berhasil disimpan.' : 'Client record saved.');
  };

  const handleDeleteClient = (id: string, clientName: string) => {
    if (!canManageClients) return;
    setDeleteTarget({ id, name: clientName });
  };

  const confirmDeleteClient = async (id: string) => {
    const res = await api.clients.delete(id);
    if (!res.success) setStatusMessage(res.error || 'Failed to delete client.');
    else {
      setClients(prev => prev.filter(item => item.id !== id));
      showToast(language === 'id' ? 'Klien dihapus.' : 'Client deleted.');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="ams-dashboard-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="ams-page-title flex items-center gap-3">
            <Users className="text-[var(--accent)]" size={26} />
            <span>{t('admin.client.title')}</span>
          </h1>
          <p className="text-xs font-sans text-[var(--muted)] mt-1">
            {t('admin.client.subtitle')}
          </p>
        </div>

        {canManageClients && (
          <button
            onClick={handleOpenCreateClient}
            className="min-h-10 px-4 rounded-control bg-[var(--accent)] hover:bg-[var(--accent)] text-[var(--accent-text)] text-xs font-sans font-medium transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>{t('admin.client.addClient')}</span>
          </button>
        )}
      </div>

      {/* Critical SLA Ad-Spend Alert Banner */}
      {clientsExceedingSla.length > 0 && (
        <div className="p-4 rounded-card bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--text)] space-y-2">
          <div className="flex items-center gap-2.5 text-[var(--danger)] font-medium font-sans text-xs normal-case tracking-normal">
            <ShieldAlert size={16} />
            <span>CRITICAL SLA VIOLATION WARNING: Daily Ad-Spend Exceeded Cap</span>
          </div>
          <div className="text-xs font-sans text-[var(--danger)]">
            {clientsExceedingSla.map(c => (
              <div key={c.id} className="flex items-center justify-between py-1 border-t border-[var(--danger)]/20 mt-1">
                <span>{c.company} ({c.name})</span>
                <span className="font-semibold text-[var(--danger)]">
                  Actual: {formatAmount(c.currentDailyAdSpend || 0, currency)} / SLA Cap: {formatAmount(c.slaDailyAdSpendBudget || 0, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-3 rounded-card bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-xs font-sans flex items-center gap-2">
          <Check size={14} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Key Metrics Summary (3 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        <div className="w-full h-full bg-[var(--panel)] border border-[var(--line)] p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--muted)] mb-2">
            <span className="text-xs font-sans normal-case font-semibold">{t('admin.client.totalClients')}</span>
            <div className="w-8 h-8 rounded-control bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center text-[var(--text)]">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-sans font-semibold text-[var(--text)] tracking-tight">
            {clients.length}
          </div>
          <div className="mt-3 pt-2 border-t border-[var(--line)] text-[11px] font-sans text-[var(--muted)]">
            {language === 'id' ? 'Klien Enterprise & SME' : 'Across Enterprise & SME tiers'}
          </div>
        </div>

        <div className="w-full h-full bg-[var(--panel)] border border-[var(--line)] p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--muted)] mb-2">
            <span className="text-xs font-sans normal-case font-semibold">{t('admin.client.activeAccounts')}</span>
            <div className="w-8 h-8 rounded-control bg-[var(--success)]/10 border border-[var(--success)]/30 flex items-center justify-center text-[var(--success)]">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="text-3xl font-sans font-semibold text-[var(--success)] tracking-tight">
            {activeAccountsCount}
          </div>
          <div className="mt-3 pt-2 border-t border-[var(--line)] text-[11px] font-sans text-[var(--success)]">
            {language === 'id' ? 'Retainer & Sprint Aktif' : 'Active Retainers & Sprints'}
          </div>
        </div>

        <div className="w-full h-full bg-[var(--panel)] border border-[var(--line)] p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--muted)] mb-2">
            <span className="text-xs font-sans normal-case font-semibold">{t('admin.client.lifetimeSpend')}</span>
            <div className="w-8 h-8 rounded-control bg-[var(--panel-hover)] border border-[var(--line)] flex items-center justify-center text-[var(--muted)]">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-sans font-semibold text-[var(--text)] tracking-tight">
            {formatAmount(totalLifetimeSpend, currency)}
          </div>
          <div className="mt-3 pt-2 border-t border-[var(--line)] text-[11px] font-sans text-[var(--muted)]">
            {language === 'id' ? 'Total Nilai Kontrak Billed' : 'Cumulative Billed Value'}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--panel)] border border-[var(--line)] p-4 rounded-card">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.client.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] font-sans"
          />
        </div>

        <div className="w-full sm:w-48">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'lead', label: 'Lead' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
        </div>
      </div>

      {/* 4. Clients Data Table & Mobile Card Stream */}
      {/* Mobile View: Clean Client Cards (Zero Horizontal Scrolling) */}
      <div className="md:hidden space-y-3">
        {filteredClients.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted)] bg-[var(--panel)] border border-[var(--line)] rounded-card text-xs font-sans">
            {language === 'id' ? 'Tidak ada data klien yang sesuai.' : 'No clients found.'}
          </div>
        ) : (
          filteredClients.map((client) => {
            const isOverBudget = client.slaDailyAdSpendBudget && client.currentDailyAdSpend && client.currentDailyAdSpend > client.slaDailyAdSpendBudget;
            return (
              <div 
                key={client.id}
                className={`bg-[var(--panel)] border rounded-card p-4 space-y-3 transition-all shadow-none ${
                  isOverBudget ? 'border-[var(--danger)]/40 bg-[var(--danger)]/10' : 'border-[var(--line)] hover:border-[var(--line)]'
                }`}
              >
                {/* Header: Name, Role & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[var(--text)] text-base">{client.name}</div>
                    <div className="text-[11px] text-[var(--danger)] font-semibold">{client.contactPersonRole}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-control text-[10px] font-sans font-semibold normal-case shrink-0 ${
                    client.status === 'active'
                      ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30'
                      : client.status === 'completed'
                      ? 'bg-[var(--info)]/10 text-[var(--info)] border border-[var(--info)]/30'
                      : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30'
                  }`}>
                    {client.status}
                  </span>
                </div>

                {/* Company & Industry */}
                <div className="flex items-center gap-2 text-xs font-sans text-[var(--text)] bg-[var(--panel)]/60 p-2.5 rounded-control border border-[var(--line)]">
                  <Building2 size={13} className="text-[var(--muted)] shrink-0" />
                  <span className="font-semibold text-[var(--text)]">{client.company}</span>
                  <span className="text-[var(--muted)]">•</span>
                  <span className="text-[11px] text-[var(--muted)] truncate">{client.industry}</span>
                </div>

                {/* Contact: Email & Phone */}
                <div className="grid grid-cols-1 gap-1.5 text-xs font-sans text-[var(--muted)]">
                  <a 
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-1.5 text-[var(--text)] hover:text-[var(--text)] transition-colors truncate"
                  >
                    <Mail size={12} className="text-[var(--muted)] shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </a>
                  {client.phone && (
                    <a 
                      href={`tel:${client.phone}`}
                      className="flex items-center gap-1.5 text-[var(--text)] hover:text-[var(--text)] transition-colors"
                    >
                      <Phone size={12} className="text-[var(--muted)] shrink-0" />
                      <span>{client.phone}</span>
                    </a>
                  )}
                  {client.location && (
                    <div className="flex items-center gap-1.5 text-[var(--muted)] text-[11px]">
                      <MapPin size={12} className="shrink-0" />
                      <span>{client.location}</span>
                    </div>
                  )}
                </div>

                {/* SLA Ad-Spend Status & Actions */}
                <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between gap-2">
                  <div>
                    {client.slaDailyAdSpendBudget ? (
                      <div>
                        <div className="text-[10px] normal-case font-sans text-[var(--muted)]">Daily SLA Ad-Spend</div>
                        <div className={`font-semibold font-sans text-sm flex items-center gap-1 ${isOverBudget ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                          {isOverBudget && <AlertTriangle size={12} className="text-[var(--danger)] shrink-0" />}
                          <span>{formatAmount(client.currentDailyAdSpend || 0, currency)}</span>
                        </div>
                        <div className="text-[10px] font-sans text-[var(--muted)]">
                          Cap: {formatAmount(client.slaDailyAdSpendBudget, currency)}/day
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[10px] normal-case font-sans text-[var(--muted)]">Lifetime Spend</div>
                        <div className="font-semibold font-sans text-[var(--text)] text-sm">
                          {formatAmount(client.totalSpend || 0, currency)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {client.phone && (
                      <a
                        href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-9 h-9 rounded-control bg-[var(--panel)] hover:bg-emerald-950/40 text-[var(--success)] border border-[var(--line)] hover:border-[var(--success)]/30 flex items-center justify-center transition-colors min-h-10 min-w-10"
                        title="Chat WhatsApp"
                      >
                        <Phone size={13} />
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenEditClient(client)}
                      className="w-9 h-9 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] flex items-center justify-center transition-colors min-h-10 min-w-10"
                      title="Edit Client"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      className="w-9 h-9 rounded-control bg-[var(--panel)] hover:bg-red-950/40 text-[var(--muted)] hover:text-[var(--danger)] border border-[var(--line)] hover:border-red-500/30 flex items-center justify-center transition-colors min-h-10 min-w-10"
                      title="Delete Client"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop View: Full Data Table with Edge Shadows */}
      <ScrollShadowContainer
        externalRef={tableScrollRef}
        shadowBg="surface"
        shadowSize="md"
        className="hidden md:block w-full rounded-card overflow-hidden"
        scrollClassName="w-full bg-[var(--panel)] border border-[var(--line)] rounded-card overflow-x-auto select-none cursor-grab active:cursor-grabbing custom-scrollbar max-h-[750px] overflow-y-auto"
      >
        <table className="w-full text-left text-xs font-sans min-w-[760px]">
          <thead className="sticky top-0 z-10 bg-[var(--panel)]">
            <tr className="border-b border-[var(--line)] text-[var(--muted)] bg-[var(--panel)] font-sans text-[11px]">
              <th className="py-3 px-4 font-semibold">{t('admin.client.colName')}</th>
              <th className="py-3 px-4 font-semibold">{t('admin.client.colCompany')}</th>
              <th className="py-3 px-4 font-semibold">{t('admin.client.colContact')}</th>
              <th className="py-3 px-4 font-semibold">{t('admin.client.colLocation')}</th>
              <th className="py-3 px-4 font-semibold">SLA Ad-Spend / Cap</th>
              <th className="py-3 px-4 font-semibold">{t('admin.client.colStatus')}</th>
              <th className="py-3 px-4 font-semibold text-right">{t('admin.client.colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[var(--muted)]">
                  {language === 'id' ? 'Tidak ada data klien yang sesuai.' : 'No clients found.'}
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const isOverBudget = client.slaDailyAdSpendBudget && client.currentDailyAdSpend && client.currentDailyAdSpend > client.slaDailyAdSpendBudget;
                return (
                  <tr key={client.id} className={`hover:bg-[var(--panel)] transition-colors group ${isOverBudget ? 'bg-[var(--danger)]/10' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[var(--text)] text-sm">{client.name}</div>
                      <div className="text-[10px] text-[var(--accent)] font-semibold">{client.contactPersonRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                        <Building2 size={12} className="text-[var(--muted)]" />
                        <span>{client.company}</span>
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">{client.industry}</div>
                    </td>
                    <td className="py-3 px-4 text-[var(--muted)] space-y-0.5 text-[11px]">
                      <div className="flex items-center gap-1 text-[var(--text)]">
                        <Mail size={11} className="text-[var(--muted)]" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={11} className="text-[var(--muted)]" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[var(--muted)]">
                      <div className="flex items-center gap-1">
                        <MapPin size={11} className="text-[var(--muted)]" />
                        <span>{client.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans text-xs">
                      {client.slaDailyAdSpendBudget ? (
                        <div>
                          <div className={`font-semibold flex items-center gap-1 ${isOverBudget ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                            {isOverBudget && <AlertTriangle size={12} className="text-[var(--danger)] shrink-0" />}
                            <span>{formatAmount(client.currentDailyAdSpend || 0, currency)}</span>
                          </div>
                          <div className="text-[10px] text-[var(--muted)]">
                            Cap: {formatAmount(client.slaDailyAdSpendBudget, currency)}/day
                          </div>
                        </div>
                      ) : (
                        <span className="text-[var(--muted)] text-[11px]">No SLA Cap</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold normal-case ${
                        client.status === 'active'
                          ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30'
                          : client.status === 'completed'
                          ? 'bg-[var(--info)]/10 text-[var(--info)] border border-[var(--info)]/30'
                          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditClient(client)}
                          className="w-9 h-9 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] flex items-center justify-center transition-colors min-h-10 min-w-10"
                          title="Edit Client"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          className="w-9 h-9 rounded-control bg-[var(--panel)] hover:bg-red-950/40 text-[var(--muted)] hover:text-[var(--danger)] border border-[var(--line)] hover:border-red-500/30 flex items-center justify-center transition-colors min-h-10 min-w-10"
                          title="Delete Client"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ScrollShadowContainer>

      {/* 5. Create / Edit Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80  flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card w-full max-w-lg p-6 space-y-4 shadow-none my-8 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h2 className="text-base font-semibold font-sans text-[var(--text)] flex items-center gap-2">
                <Users className="text-[var(--accent)]" size={18} />
                <span>{editingClient ? (language === 'id' ? 'Edit Profil Klien' : 'Edit Client Profile') : (language === 'id' ? 'Tambah Klien Baru' : 'Add New Client')}</span>
              </h2>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-control text-[var(--muted)] hover:text-[var(--text)] bg-[var(--panel)] border border-[var(--line)]"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Nama Kontak (PIC) *' : 'Contact Person (PIC) *'}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-control text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Perusahaan Klien *' : 'Company Name *'}</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Global Tech"
                    className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">PIC Role / Title</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Managing Director, VP Engineering..."
                    className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Fintech, Real Estate, E-Commerce..."
                    className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Email Klien</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 811-XXXX-XXXX"
                    className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* SLA Ad Spend Cap Section */}
              <div className="p-3 bg-[var(--panel)] border border-[var(--line)] rounded-card space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Activity size={13} />
                  <span>SLA Daily Ad-Spend Cap & Tracking (IDR)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">SLA Agreed Daily Budget Cap</label>
                    <input
                      type="number"
                      value={slaDailyBudget}
                      onChange={(e) => setSlaDailyBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Current Actual Daily Spend</label>
                    <input
                      type="number"
                      value={currentDailySpend}
                      onChange={(e) => setCurrentDailySpend(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Lokasi' : 'Location'}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Jakarta, Indonesia"
                    className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Account Status</label>
                  <CustomSelect
                    value={clientStatus}
                    onChange={(val) => setClientStatus(val as any)}
                    options={[
                      { value: 'active', label: 'Active', badge: 'Active', badgeColor: 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20' },
                      { value: 'completed', label: 'Completed', badge: 'Completed', badgeColor: 'bg-[var(--info)]/10 text-[var(--info)] border border-blue-500/20' },
                      { value: 'lead', label: 'Lead', badge: 'Lead', badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
                      { value: 'inactive', label: 'Inactive', badge: 'Inactive', badgeColor: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' }
                    ]}
                    className="w-full"
                    triggerClassName="w-full justify-between"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--muted)] mb-1 font-semibold">{language === 'id' ? 'Catatan & Preferensi Klien' : 'Client Notes & Requirements'}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special client preferences, NDA details, billing notes..."
                  className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="h-10 px-4 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] font-sans text-xs transition-colors min-h-10"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-card bg-[var(--accent)] hover:bg-[var(--panel-hover)] text-[var(--text)] font-sans font-semibold text-xs shadow-none transition-all min-h-10"
                >
                  {language === 'id' ? 'Simpan Klien' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminClients;
