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
  Activity,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { AgencyClient } from '../../lib/clientStore';
import { formatAmount, getActiveCurrency, CURRENCY_EVENT, CurrencyCode } from '../../lib/currency';
import { useLanguage } from '../../lib/LanguageContext';
import { hasAdminPermission } from '../../lib/adminAuth';
import { api } from '../../lib/apiClient';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Modal } from '../../components/ui/Modal';

export const AdminClients: React.FC = () => {
  const canManageClients = hasAdminPermission('canManageClients');
  const { t, language } = useLanguage();
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<'name' | 'company' | 'updatedAt' | 'projectsCount'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
    return () => {
      window.removeEventListener(CURRENCY_EVENT, handleCurrencyChange);
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = clients.filter(c => {
      const matchSearch = !query || [c.name, c.company, c.email, c.contactPersonRole, c.industry, c.id].some(value => value.toLowerCase().includes(query));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
    return [...result].sort((a, b) => {
      const left = sortKey === 'projectsCount' ? a.projectsCount : sortKey === 'updatedAt' ? a.updatedAt : sortKey === 'company' ? a.company : a.name;
      const right = sortKey === 'projectsCount' ? b.projectsCount : sortKey === 'updatedAt' ? b.updatedAt : sortKey === 'company' ? b.company : b.name;
      const comparison = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), undefined, { sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [clients, searchQuery, statusFilter, sortKey, sortDirection]);

  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, sortKey, sortDirection]);
  const pageCount = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const paginatedClients = useMemo(() => filteredClients.slice((page - 1) * pageSize, page * pageSize), [filteredClients, page]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

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
    setLocation('');
    setIndustry('');
    setClientStatus('active');
    setTotalSpend(0);
    setProjectsCount(0);
    setRole('');
    setNotes('');
    setSlaDailyBudget(0);
    setCurrentDailySpend(0);
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
    setSlaDailyBudget(c.slaDailyAdSpendBudget || 0);
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
    <div className="space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="ams-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="ams-page-title flex items-center gap-2.5">
            <Users className="text-accent-text shrink-0" size={22} />
            <span>{t('admin.client.title')}</span>
          </h1>
          <p className="text-xs font-sans text-text-muted mt-1">
            {t('admin.client.subtitle')}
          </p>
        </div>

        {canManageClients && (
          <button
            onClick={handleOpenCreateClient}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-control bg-accent px-3.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>{t('admin.client.addClient')}</span>
          </button>
        )}
      </div>

      {/* Critical SLA Ad-Spend Alert Banner */}
      {clientsExceedingSla.length > 0 && (
        <div className="p-4 rounded-card bg-text-danger/10 border border-text-danger/30 text-text-fg space-y-2">
          <div className="flex items-center gap-2.5 text-text-danger font-medium font-sans text-xs normal-case tracking-normal">
            <ShieldAlert size={16} />
            <span>Critical SLA warning: daily ad spend exceeded the cap</span>
          </div>
          <div className="text-xs font-sans text-text-danger">
            {clientsExceedingSla.map(c => (
              <div key={c.id} className="flex items-center justify-between py-1 border-t border-text-danger/20 mt-1">
                <span>{c.company} ({c.name})</span>
                <span className="font-semibold text-text-danger">
                  Actual: {formatAmount(c.currentDailyAdSpend || 0, currency)} / SLA Cap: {formatAmount(c.slaDailyAdSpendBudget || 0, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-3 rounded-card bg-text-success/10 border border-text-success/30 text-text-success text-xs font-sans flex items-center gap-2">
          <Check size={14} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Key Metrics Summary (3 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        <div className="w-full h-full bg-bg-panel border border-border-line p-4 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-sans normal-case font-semibold">{t('admin.client.totalClients')}</span>
            <div className="w-8 h-8 rounded-control bg-bg-panel border border-border-line flex items-center justify-center text-text-fg">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-sans font-semibold text-text-fg tracking-tight">
            {clients.length}
          </div>
          <div className="mt-3 pt-2 border-t border-border-line text-[11px] font-sans text-text-muted">
            {language === 'id' ? 'Klien Enterprise & SME' : 'Across Enterprise & SME tiers'}
          </div>
        </div>

        <div className="w-full h-full bg-bg-panel border border-border-line p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-sans normal-case font-semibold">{t('admin.client.activeAccounts')}</span>
            <div className="w-8 h-8 rounded-control bg-text-success/10 border border-text-success/30 flex items-center justify-center text-text-success">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="text-3xl font-sans font-semibold text-text-success tracking-tight">
            {activeAccountsCount}
          </div>
          <div className="mt-3 pt-2 border-t border-border-line text-[11px] font-sans text-text-success">
            {language === 'id' ? 'Retainer & Sprint Aktif' : 'Active Retainers & Sprints'}
          </div>
        </div>

        <div className="w-full h-full bg-bg-panel border border-border-line p-5 rounded-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-sans normal-case font-semibold">{t('admin.client.lifetimeSpend')}</span>
            <div className="w-8 h-8 rounded-control bg-bg-bg border border-border-line flex items-center justify-center text-text-muted">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-sans font-semibold text-text-fg tracking-tight">
            {formatAmount(totalLifetimeSpend, currency)}
          </div>
          <div className="mt-3 pt-2 border-t border-border-line text-[11px] font-sans text-text-muted">
            {language === 'id' ? 'Total Nilai Kontrak Billed' : 'Cumulative Billed Value'}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-panel border border-border-line p-4 rounded-card">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.client.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-bg-panel border border-border-line rounded-control text-xs text-text-fg placeholder:text-text-muted focus:outline-none focus:border-bg-accent font-sans min-h-10"
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

      {/* 4. Clients Data Table */}
      <section className="overflow-hidden rounded-card border border-line bg-panel" aria-label={language === 'id' ? 'Daftar klien' : 'Client list'}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-panel">
              <tr className="border-b border-line text-muted">
                {[
                  ['name', t('admin.client.colName')],
                  ['company', t('admin.client.colCompany')],
                  ['updatedAt', language === 'id' ? 'Terakhir diperbarui' : 'Last updated'],
                  ['projectsCount', language === 'id' ? 'Proyek' : 'Projects']
                ].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 font-medium">
                    <button type="button" onClick={() => { const next = key as typeof sortKey; setSortDirection(sortKey === next && sortDirection === 'asc' ? 'desc' : 'asc'); setSortKey(next); }} className="inline-flex min-h-8 items-center gap-1.5 rounded-control text-left text-[11px] font-medium text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                      {label}<ArrowUpDown size={12} aria-hidden="true" />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 font-medium">{t('admin.client.colContact')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.client.colStatus')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('admin.client.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted">{language === 'id' ? 'Tidak ada data klien yang sesuai.' : 'No clients found.'}</td></tr>
              ) : paginatedClients.map((client) => {
                const isOverBudget = Boolean(client.slaDailyAdSpendBudget && client.currentDailyAdSpend && client.currentDailyAdSpend > client.slaDailyAdSpendBudget);
                return <tr key={client.id} className="border-b border-line last:border-b-0 hover:bg-bg">
                  <td className="px-4 py-3 align-top"><div className="font-medium text-fg">{client.name}</div><div className="mt-0.5 text-[11px] text-muted">{client.contactPersonRole || client.id}</div></td>
                  <td className="px-4 py-3 align-top"><div className="font-medium text-fg">{client.company}</div><div className="mt-0.5 text-[11px] text-muted">{client.industry}</div></td>
                  <td className="px-4 py-3 align-top text-muted">{new Date(client.updatedAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="px-4 py-3 align-top tabular-nums text-fg">{client.projectsCount}</td>
                  <td className="px-4 py-3 align-top"><div className="flex max-w-[260px] flex-col gap-1"><a href={client.email ? 'mailto:' + client.email : undefined} className="truncate text-fg hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">{client.email || '—'}</a>{client.phone && <a href={'tel:' + client.phone} className="text-muted hover:text-fg">{client.phone}</a>}</div></td>
                  <td className="px-4 py-3 align-top"><span className={'inline-flex items-center gap-1.5 rounded-badge border px-2 py-1 text-[11px] font-medium ' + (client.status === 'active' ? 'border-success/20 bg-success/10 text-success' : client.status === 'completed' ? 'border-info/20 bg-info/10 text-info' : client.status === 'lead' ? 'border-warning/20 bg-warning/10 text-warning' : 'border-line bg-bg text-muted')}>{client.status === 'active' ? 'Active' : client.status === 'completed' ? 'Completed' : client.status === 'lead' ? 'Lead' : 'Inactive'}{isOverBudget && <AlertTriangle size={12} aria-label="SLA exceeded" />}</span></td>
                  <td className="px-4 py-3 text-right align-top"><div className="flex justify-end gap-1.5">{client.phone && <a href={'https://wa.me/' + client.phone.replace(/\\D/g, '')} target="_blank" rel="noreferrer" aria-label={'WhatsApp ' + client.name} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-line text-muted hover:bg-bg hover:text-success focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Phone size={14} /></a>}<button type="button" onClick={() => handleOpenEditClient(client)} aria-label={'Edit ' + client.name} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-line text-muted hover:bg-bg hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Edit3 size={14} /></button><button type="button" onClick={() => handleDeleteClient(client.id, client.name)} aria-label={'Delete ' + client.name} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-line text-muted hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Trash2 size={14} /></button></div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        {filteredClients.length > 0 && <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredClients.length)} of {filteredClients.length}</p><div className="flex items-center gap-1.5"><button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-line text-muted hover:bg-bg hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><ChevronLeft size={15} /></button><span className="min-w-16 text-center text-xs tabular-nums text-fg">{page} / {pageCount}</span><button type="button" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount} aria-label="Next page" className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-line text-muted hover:bg-bg hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><ChevronRight size={15} /></button></div></div>}
      </section>

      {/* 5. Create / Edit Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-bg/80  flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-panel border border-border-line rounded-card w-full max-w-lg p-6 space-y-4  my-8 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-border-line">
              <h2 className="text-base font-semibold font-sans text-text-fg flex items-center gap-2">
                <Users className="text-bg-accent" size={18} />
                <span>{editingClient ? (language === 'id' ? 'Edit Profil Klien' : 'Edit Client Profile') : (language === 'id' ? 'Tambah Klien Baru' : 'Add New Client')}</span>
              </h2>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-control text-text-muted hover:text-text-fg bg-bg-panel border border-border-line"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">{language === 'id' ? 'Nama Kontak (PIC) *' : 'Contact Person (PIC) *'}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-bg-panel border border-border-line rounded-control text-text-fg focus:outline-none focus:border-bg-accent"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">{language === 'id' ? 'Perusahaan Klien *' : 'Company Name *'}</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Global Tech"
                    className="w-full px-3 py-2 bg-bg-panel border border-border-line rounded-control text-text-fg focus:outline-none focus:border-bg-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">PIC Role / Title</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Managing Director, VP Engineering..."
                    className="w-full px-3 py-2 bg-bg-panel border border-border-line rounded-control text-text-fg focus:outline-none focus:border-bg-accent"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Fintech, Real Estate, E-Commerce..."
                    className="w-full px-3 py-2 bg-bg-panel border border-border-line rounded-control text-text-fg focus:outline-none focus:border-bg-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">Email Klien</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2 bg-bg-panel border border-border-line rounded-control text-text-fg focus:outline-none focus:border-bg-accent"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 811-XXXX-XXXX"
                    className="w-full px-3 py-2 bg-bg-panel border border-border-line rounded-control text-text-fg focus:outline-none focus:border-bg-accent"
                  />
                </div>
              </div>

              {/* SLA Ad Spend Cap Section */}
              <div className="p-3 bg-bg-panel border border-border-line rounded-card space-y-2">
                <div className="flex items-center gap-1.5 text-text-warning font-semibold">
                  <Activity size={13} />
                  <span>SLA Daily Ad-Spend Cap & Tracking (IDR)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">SLA Agreed Daily Budget Cap</label>
                    <input
                      type="number"
                      value={slaDailyBudget}
                      onChange={(e) => setSlaDailyBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-bg-panel border border-border-line rounded-control text-text-fg focus:outline-none focus:border-bg-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">Current Actual Daily Spend</label>
                    <input
                      type="number"
                      value={currentDailySpend}
                      onChange={(e) => setCurrentDailySpend(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-bg-panel border border-border-line rounded-control text-text-fg focus:outline-none focus:border-bg-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">{language === 'id' ? 'Lokasi' : 'Location'}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Jakarta, Indonesia"
                    className="w-full px-3 py-2 bg-bg-panel border border-border-line rounded-control text-text-fg focus:outline-none focus:border-bg-accent"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">Account Status</label>
                  <CustomSelect
                    value={clientStatus}
                    onChange={(val) => setClientStatus(val as any)}
                    options={[
                      { value: 'active', label: 'Active', badge: 'Active', badgeColor: 'bg-text-success/10 text-text-success border border-text-success/20' },
                      { value: 'completed', label: 'Completed', badge: 'Completed', badgeColor: 'bg-text-info/10 text-text-info border border-text-info/20' },
                      { value: 'lead', label: 'Lead', badge: 'Lead', badgeColor: 'bg-text-warning/10 text-text-warning border border-text-warning/20' },
                      { value: 'inactive', label: 'Inactive', badge: 'Inactive', badgeColor: 'bg-bg-panel text-text-muted border border-border-line' }
                    ]}
                    className="w-full"
                    triggerClassName="w-full justify-between"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-muted mb-1 font-semibold">{language === 'id' ? 'Catatan & Preferensi Klien' : 'Client Notes & Requirements'}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special client preferences, NDA details, billing notes..."
                  className="w-full px-3 py-2 bg-bg-panel border border-border-line rounded-control text-text-fg focus:outline-none focus:border-bg-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-line">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="h-10 px-4 rounded-control bg-bg-panel hover:bg-bg-panel text-text-muted hover:text-text-fg border border-border-line font-sans text-xs transition-colors min-h-10"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-control bg-bg-accent hover:bg-accent/90 text-white font-sans font-semibold text-xs -none transition-all min-h-10"
                >
                  {language === 'id' ? 'Simpan Klien' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm" title={language === 'id' ? 'Hapus klien?' : 'Delete client?'} description={language === 'id' ? `Catatan klien ${deleteTarget?.name || ''} akan dihapus.` : `Client record ${deleteTarget?.name || ''} will be removed.`}>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button type="button" onClick={() => setDeleteTarget(null)} className="min-h-10 px-4 rounded-control border border-border-line bg-bg-panel text-xs text-text-muted">Cancel</button>
          <button type="button" onClick={() => deleteTarget && void confirmDeleteClient(deleteTarget.id)} className="min-h-10 px-4 rounded-control bg-text-danger text-white text-xs font-semibold">Delete</button>
        </div>
      </Modal>

    </div>
  );
};
export default AdminClients;
