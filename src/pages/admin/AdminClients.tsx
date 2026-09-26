import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  DollarSign,
  Trash2,
  Edit3,
  Check,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
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
import { Button } from '../../components/ui/Button';
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
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [clientStatus, setClientStatus] = useState<AgencyClient['status']>('active');
  const [totalSpend, setTotalSpend] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');
  const [slaDailyBudget, setSlaDailyBudget] = useState<number>(0);
  const [currentDailySpend, setCurrentDailySpend] = useState<number>(0);

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
      const matchSearch = !query || [c.name, c.company, c.email, c.contactPersonRole, c.industry, c.location, c.id].some(value => String(value || '').toLowerCase().includes(query));
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
      setStatusMessage(language === 'id' ? 'Nama kontak dan perusahaan wajib diisi.' : 'Client name and company are required.');
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
      projectsCount: Math.max(0, Number(projectsCount) || 0),
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
          <p className="text-xs font-sans text-muted mt-1">
            {t('admin.client.subtitle')}
          </p>
        </div>

        {canManageClients && (
          <Button type="button" variant="primary" icon={<Plus size={14} />} onClick={handleOpenCreateClient} className="w-full sm:w-auto">
            {t('admin.client.addClient')}
          </Button>
        )}
      </div>

      {/* Critical SLA Ad-Spend Alert Banner */}
      {clientsExceedingSla.length > 0 && (
        <div className="p-4 rounded-card bg-danger/10 border border-danger/30 text-fg space-y-2">
          <div className="flex items-center gap-2.5 text-danger font-medium font-sans text-xs normal-case tracking-normal">
            <ShieldAlert size={16} />
            <span>Critical SLA warning: daily ad spend exceeded the cap</span>
          </div>
          <div className="text-xs font-sans text-danger">
            {clientsExceedingSla.map(c => (
              <div key={c.id} className="flex items-center justify-between py-1 border-t border-danger/20 mt-1">
                <span>{c.company} ({c.name})</span>
                <span className="font-semibold text-danger">
                  Actual: {formatAmount(c.currentDailyAdSpend || 0, currency)} / SLA Cap: {formatAmount(c.slaDailyAdSpendBudget || 0, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-3 rounded-card bg-success/10 border border-success/30 text-success text-xs font-sans flex items-center gap-2">
          <Check size={14} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Key Metrics Summary (3 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        <div className="ams-kpi">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-sans normal-case font-semibold">{t('admin.client.totalClients')}</span>

          </div>
          <div className="ams-kpi-value">
            {clients.length}
          </div>
          <div className="mt-2 text-xs text-muted">
            {language === 'id' ? 'Klien Enterprise & SME' : 'Across Enterprise & SME tiers'}
          </div>
        </div>

        <div className="ams-kpi">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-sans normal-case font-semibold">{t('admin.client.activeAccounts')}</span>

          </div>
          <div className="ams-kpi-value text-success">
            {activeAccountsCount}
          </div>
          <div className="mt-2 text-xs text-muted">
            {language === 'id' ? 'Retainer & Sprint Aktif' : 'Active Retainers & Sprints'}
          </div>
        </div>

        <div className="ams-kpi">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-sans normal-case font-semibold">{t('admin.client.lifetimeSpend')}</span>

          </div>
          <div className="ams-kpi-value">
            {formatAmount(totalLifetimeSpend, currency)}
          </div>
          <div className="mt-2 text-xs text-muted">
            {language === 'id' ? 'Total Nilai Kontrak Billed' : 'Cumulative Billed Value'}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="relative flex-1 min-w-0 sm:max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.client.searchPlaceholder')}
            className="w-full h-9 pl-9 pr-3 bg-panel border border-line rounded-control text-[13px] text-fg placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>

        <div className="w-full sm:w-48">
          <label className="mb-1.5 block text-xs font-medium text-muted">Status</label>
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
          <table className="ams-table w-full min-w-[980px] border-collapse text-left text-xs">
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
                  <td className="px-4 py-3 text-right align-top"><div className="flex justify-end gap-1.5">{client.phone && <a href={'https://wa.me/' + client.phone.replace(/\D/g, '')} target="_blank" rel="noreferrer" aria-label={'WhatsApp ' + client.name} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-line text-muted hover:bg-bg hover:text-success focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Phone size={14} /></a>}<button type="button" onClick={() => handleOpenEditClient(client)} aria-label={'Edit ' + client.name} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-line text-muted hover:bg-bg hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Edit3 size={14} /></button><button type="button" onClick={() => handleDeleteClient(client.id, client.name)} aria-label={'Delete ' + client.name} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-line text-muted hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><Trash2 size={14} /></button></div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        {filteredClients.length > 0 && <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredClients.length)} of {filteredClients.length}</p><div className="flex items-center gap-1.5"><button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-line text-muted hover:bg-bg hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><ChevronLeft size={15} /></button><span className="min-w-16 text-center text-xs tabular-nums text-fg">{page} / {pageCount}</span><button type="button" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount} aria-label="Next page" className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-line text-muted hover:bg-bg hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><ChevronRight size={15} /></button></div></div>}
      </section>

      <Modal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        size="lg"
        title={editingClient ? (language === 'id' ? 'Edit klien' : 'Edit client') : (language === 'id' ? 'Tambah klien' : 'Add client')}
        description={editingClient ? 'Update the existing client record.' : 'Create a client record using information available to your team.'}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setIsClientModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="client-form" variant="primary">Save client</Button>
          </>
        }
      >
        <form id="client-form" onSubmit={handleSaveClient} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label htmlFor="client-name" className="mb-1.5 block text-xs font-medium text-muted">Contact person *</label><input id="client-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contact person" /></div>
            <div><label htmlFor="client-company" className="mb-1.5 block text-xs font-medium text-muted">Company *</label><input id="client-company" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" /></div>
            <div><label htmlFor="client-role" className="mb-1.5 block text-xs font-medium text-muted">Contact role</label><input id="client-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role or title" /></div>
            <div><label htmlFor="client-industry" className="mb-1.5 block text-xs font-medium text-muted">Industry</label><input id="client-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" /></div>
            <div><label htmlFor="client-email" className="mb-1.5 block text-xs font-medium text-muted">Email</label><input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@company.com" /></div>
            <div><label htmlFor="client-phone" className="mb-1.5 block text-xs font-medium text-muted">Phone / WhatsApp</label><input id="client-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 ..." /></div>
            <div><label htmlFor="client-website" className="mb-1.5 block text-xs font-medium text-muted">Website</label><input id="client-website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://company.com" /></div>
            <div><label htmlFor="client-location" className="mb-1.5 block text-xs font-medium text-muted">Location</label><input id="client-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, country" /></div>
          </div>
          <div className="rounded-card border border-line bg-bg p-4">
            <div className="flex items-center gap-2"><Activity size={15} className="text-warning" aria-hidden="true" /><h3 className="text-sm font-semibold text-fg">Daily ad-spend SLA</h3></div>
            <p className="mt-1 text-xs text-muted">Optional operational tracking for the agreed daily cap.</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label htmlFor="client-sla" className="mb-1.5 block text-xs font-medium text-muted">Agreed daily cap</label><input id="client-sla" type="number" min="0" value={slaDailyBudget} onChange={(e) => setSlaDailyBudget(Number(e.target.value))} /></div>
              <div><label htmlFor="client-daily-spend" className="mb-1.5 block text-xs font-medium text-muted">Current daily spend</label><input id="client-daily-spend" type="number" min="0" value={currentDailySpend} onChange={(e) => setCurrentDailySpend(Number(e.target.value))} /></div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-1.5 block text-xs font-medium text-muted">Account status</label><CustomSelect value={clientStatus} onChange={(v) => setClientStatus(v as AgencyClient['status'])} options={STATUS_OPTIONS.filter((o) => o.value !== 'all')} className="w-full" triggerClassName="w-full" /></div>
            <div><label htmlFor="client-projects" className="mb-1.5 block text-xs font-medium text-muted">Projects count</label><input id="client-projects" type="number" min="0" value={projectsCount} onChange={(e) => setProjectsCount(Number(e.target.value))} /></div>
            <div><label htmlFor="client-spend" className="mb-1.5 block text-xs font-medium text-muted">Cumulative billed value</label><input id="client-spend" type="number" min="0" value={totalSpend} onChange={(e) => setTotalSpend(Number(e.target.value))} /></div>
          </div>
          <div><label htmlFor="client-notes" className="mb-1.5 block text-xs font-medium text-muted">Notes & requirements</label><textarea id="client-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Client preferences, requirements, billing notes..." /></div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size="sm"
        title={language === 'id' ? 'Hapus klien?' : 'Delete client?'}
        description={language === 'id' ? 'Catatan klien akan dihapus.' : 'This client record will be removed.'}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={() => deleteTarget && void confirmDeleteClient(deleteTarget.id)}>Delete client</Button>
          </>
        }
      >
        <p className="text-sm text-muted">This action removes the client record through the existing client API.</p>
      </Modal>

    </div>
  );
};
export default AdminClients;
