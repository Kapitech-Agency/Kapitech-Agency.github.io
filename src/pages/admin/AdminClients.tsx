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
import {
  AgencyClient,
  getAgencyClients,
  saveAgencyClient,
  deleteAgencyClient,
  CLIENT_EVENT_NAME
} from '../../lib/clientStore';
import { formatAmount, getActiveCurrency, CURRENCY_EVENT, CurrencyCode } from '../../lib/currency';
import { useLanguage } from '../../lib/LanguageContext';
import { useDragToScroll } from '../../lib/useDragToScroll';
import { CustomSelect } from '../../components/ui/CustomSelect';

export const AdminClients: React.FC = () => {
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

  const loadData = () => {
    setClients(getAgencyClients());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener(CLIENT_EVENT_NAME, handleUpdate);

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail?.currency || getActiveCurrency());
    };
    window.addEventListener(CURRENCY_EVENT, handleCurrencyChange);

    return () => {
      window.removeEventListener(CLIENT_EVENT_NAME, handleUpdate);
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

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
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

    saveAgencyClient(clientData);
    setIsClientModalOpen(false);
    showToast(language === 'id' ? 'Klien berhasil disimpan.' : 'Client record saved.');
  };

  const handleDeleteClient = (id: string, clientName: string) => {
    if (window.confirm(`Hapus catatan klien "${clientName}"?`)) {
      deleteAgencyClient(id);
      showToast(language === 'id' ? 'Klien dihapus.' : 'Client deleted.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <h1 className="text-2xl font-sans font-bold text-white flex items-center gap-3 tracking-tight">
            <Users className="text-[#E50914]" size={26} />
            <span>{t('admin.client.title')}</span>
          </h1>
          <p className="text-xs font-sans text-[#8A94A6] mt-1">
            {t('admin.client.subtitle')}
          </p>
        </div>

        <button
          onClick={handleOpenCreateClient}
          className="h-10 px-4 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#E50914]/25 self-start sm:self-auto min-h-[40px]"
        >
          <Plus size={14} />
          <span>{t('admin.client.addClient')}</span>
        </button>
      </div>

      {/* Critical SLA Ad-Spend Alert Banner */}
      {clientsExceedingSla.length > 0 && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-white space-y-2 animate-pulse">
          <div className="flex items-center gap-2.5 text-red-400 font-bold font-mono text-xs uppercase tracking-wider">
            <ShieldAlert size={16} />
            <span>CRITICAL SLA VIOLATION WARNING: Daily Ad-Spend Exceeded Cap</span>
          </div>
          <div className="text-xs font-mono text-red-200">
            {clientsExceedingSla.map(c => (
              <div key={c.id} className="flex items-center justify-between py-1 border-t border-red-500/20 mt-1">
                <span>{c.company} ({c.name})</span>
                <span className="font-bold text-red-300">
                  Actual: {formatAmount(c.currentDailyAdSpend || 0, currency)} / SLA Cap: {formatAmount(c.slaDailyAdSpendBudget || 0, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-sans flex items-center gap-2">
          <Check size={14} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Key Metrics Summary (3 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
        <div className="w-full h-full bg-[#111318] border border-[rgba(255,255,255,0.07)] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A94A6] mb-2">
            <span className="text-xs font-mono uppercase font-semibold">{t('admin.client.totalClients')}</span>
            <div className="w-8 h-8 rounded-lg bg-[#181B22] border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-white">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-sans font-bold text-white tracking-tight">
            {clients.length}
          </div>
          <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.07)] text-[11px] font-mono text-[#8A94A6]">
            {language === 'id' ? 'Klien Enterprise & SME' : 'Across Enterprise & SME tiers'}
          </div>
        </div>

        <div className="w-full h-full bg-[#111318] border border-[rgba(255,255,255,0.07)] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A94A6] mb-2">
            <span className="text-xs font-mono uppercase font-semibold">{t('admin.client.activeAccounts')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="text-3xl font-sans font-bold text-emerald-400 tracking-tight">
            {activeAccountsCount}
          </div>
          <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.07)] text-[11px] font-mono text-emerald-400">
            {language === 'id' ? 'Retainer & Sprint Aktif' : 'Active Retainers & Sprints'}
          </div>
        </div>

        <div className="w-full h-full bg-[#111318] border border-[rgba(255,255,255,0.07)] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A94A6] mb-2">
            <span className="text-xs font-mono uppercase font-semibold">{t('admin.client.lifetimeSpend')}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
            {formatAmount(totalLifetimeSpend, currency)}
          </div>
          <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.07)] text-[11px] font-mono text-purple-400">
            {language === 'id' ? 'Total Nilai Kontrak Billed' : 'Cumulative Billed Value'}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111318] border border-[rgba(255,255,255,0.07)] p-4 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C626E]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.client.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white placeholder:text-[#5C626E] focus:outline-none focus:border-[#E50914] font-sans"
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
          <div className="py-12 text-center text-[#8A94A6] bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs font-mono">
            {language === 'id' ? 'Tidak ada data klien yang sesuai.' : 'No clients found.'}
          </div>
        ) : (
          filteredClients.map((client) => {
            const isOverBudget = client.slaDailyAdSpendBudget && client.currentDailyAdSpend && client.currentDailyAdSpend > client.slaDailyAdSpendBudget;
            return (
              <div 
                key={client.id}
                className={`bg-[#111318] border rounded-xl p-4 space-y-3 transition-all shadow-lg ${
                  isOverBudget ? 'border-red-500/50 bg-red-950/10' : 'border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                {/* Header: Name, Role & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-base">{client.name}</div>
                    <div className="text-[11px] text-[#FF1E27] font-semibold">{client.contactPersonRole}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase shrink-0 ${
                    client.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : client.status === 'completed'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30'
                  }`}>
                    {client.status}
                  </span>
                </div>

                {/* Company & Industry */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#C5CEE0] bg-[#181B22]/60 p-2.5 rounded-lg border border-[rgba(255,255,255,0.04)]">
                  <Building2 size={13} className="text-[#8A94A6] shrink-0" />
                  <span className="font-semibold text-white">{client.company}</span>
                  <span className="text-[#64748B]">•</span>
                  <span className="text-[11px] text-[#8A94A6] truncate">{client.industry}</span>
                </div>

                {/* Contact: Email & Phone */}
                <div className="grid grid-cols-1 gap-1.5 text-xs font-mono text-[#8A94A6]">
                  <a 
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-1.5 text-[#C5CEE0] hover:text-white transition-colors truncate"
                  >
                    <Mail size={12} className="text-[#8A94A6] shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </a>
                  {client.phone && (
                    <a 
                      href={`tel:${client.phone}`}
                      className="flex items-center gap-1.5 text-[#C5CEE0] hover:text-white transition-colors"
                    >
                      <Phone size={12} className="text-[#8A94A6] shrink-0" />
                      <span>{client.phone}</span>
                    </a>
                  )}
                  {client.location && (
                    <div className="flex items-center gap-1.5 text-[#64748B] text-[11px]">
                      <MapPin size={12} className="shrink-0" />
                      <span>{client.location}</span>
                    </div>
                  )}
                </div>

                {/* SLA Ad-Spend Status & Actions */}
                <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-2">
                  <div>
                    {client.slaDailyAdSpendBudget ? (
                      <div>
                        <div className="text-[10px] uppercase font-mono text-[#8A94A6]">Daily SLA Ad-Spend</div>
                        <div className={`font-bold font-mono text-sm flex items-center gap-1 ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                          {isOverBudget && <AlertTriangle size={12} className="text-red-400 shrink-0" />}
                          <span>{formatAmount(client.currentDailyAdSpend || 0, currency)}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#5C626E]">
                          Cap: {formatAmount(client.slaDailyAdSpendBudget, currency)}/day
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[10px] uppercase font-mono text-[#8A94A6]">Lifetime Spend</div>
                        <div className="font-bold font-mono text-white text-sm">
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
                        className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-emerald-950/40 text-emerald-400 border border-[rgba(255,255,255,0.07)] hover:border-emerald-500/30 flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                        title="Chat WhatsApp"
                      >
                        <Phone size={13} />
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenEditClient(client)}
                      className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                      title="Edit Client"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-red-950/40 text-[#8A94A6] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/30 flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
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

      {/* Desktop View: Full Data Table */}
      <div
        ref={tableScrollRef}
        className="hidden md:block w-full bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-x-auto select-none cursor-grab active:cursor-grabbing custom-scrollbar max-h-[750px] overflow-y-auto"
      >
        <table className="w-full text-left text-xs font-sans min-w-[760px]">
          <thead className="sticky top-0 z-10 bg-[#111318]">
            <tr className="border-b border-[rgba(255,255,255,0.07)] text-[#8A94A6] bg-[#181B22] font-mono text-[11px]">
              <th className="py-3 px-4 font-semibold">{t('admin.client.colName')}</th>
              <th className="py-3 px-4 font-semibold">{t('admin.client.colCompany')}</th>
              <th className="py-3 px-4 font-semibold">{t('admin.client.colContact')}</th>
              <th className="py-3 px-4 font-semibold">{t('admin.client.colLocation')}</th>
              <th className="py-3 px-4 font-semibold">SLA Ad-Spend / Cap</th>
              <th className="py-3 px-4 font-semibold">{t('admin.client.colStatus')}</th>
              <th className="py-3 px-4 font-semibold text-right">{t('admin.client.colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#8A94A6]">
                  {language === 'id' ? 'Tidak ada data klien yang sesuai.' : 'No clients found.'}
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const isOverBudget = client.slaDailyAdSpendBudget && client.currentDailyAdSpend && client.currentDailyAdSpend > client.slaDailyAdSpendBudget;
                return (
                  <tr key={client.id} className={`hover:bg-[#181B22] transition-colors group ${isOverBudget ? 'bg-red-950/20' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{client.name}</div>
                      <div className="text-[10px] text-[#E50914] font-semibold">{client.contactPersonRole}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Building2 size={12} className="text-[#8A94A6]" />
                        <span>{client.company}</span>
                      </div>
                      <div className="text-[10px] text-[#8A94A6]">{client.industry}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#8A94A6] space-y-0.5 text-[11px]">
                      <div className="flex items-center gap-1 text-white">
                        <Mail size={11} className="text-[#8A94A6]" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={11} className="text-[#8A94A6]" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#8A94A6]">
                      <div className="flex items-center gap-1">
                        <MapPin size={11} className="text-[#8A94A6]" />
                        <span>{client.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {client.slaDailyAdSpendBudget ? (
                        <div>
                          <div className={`font-bold flex items-center gap-1 ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isOverBudget && <AlertTriangle size={12} className="text-red-400 shrink-0" />}
                            <span>{formatAmount(client.currentDailyAdSpend || 0, currency)}</span>
                          </div>
                          <div className="text-[10px] text-[#5C626E]">
                            Cap: {formatAmount(client.slaDailyAdSpendBudget, currency)}/day
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#5C626E] text-[11px]">No SLA Cap</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        client.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : client.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditClient(client)}
                          className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                          title="Edit Client"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-red-950/40 text-[#8A94A6] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/30 flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
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
      </div>

      {/* 5. Create / Edit Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl my-8 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.07)]">
              <h2 className="text-base font-bold font-sans text-white flex items-center gap-2">
                <Users className="text-[#E50914]" size={18} />
                <span>{editingClient ? (language === 'id' ? 'Edit Profil Klien' : 'Edit Client Profile') : (language === 'id' ? 'Tambah Klien Baru' : 'Add New Client')}</span>
              </h2>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8A94A6] hover:text-white bg-[#181B22] border border-[rgba(255,255,255,0.07)]"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">{language === 'id' ? 'Nama Kontak (PIC) *' : 'Contact Person (PIC) *'}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">{language === 'id' ? 'Perusahaan Klien *' : 'Company Name *'}</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Global Tech"
                    className="w-full px-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">PIC Role / Title</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Managing Director, VP Engineering..."
                    className="w-full px-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Fintech, Real Estate, E-Commerce..."
                    className="w-full px-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">Email Klien</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 811-XXXX-XXXX"
                    className="w-full px-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              {/* SLA Ad Spend Cap Section */}
              <div className="p-3 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Activity size={13} />
                  <span>SLA Daily Ad-Spend Cap & Tracking (IDR)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">SLA Agreed Daily Budget Cap</label>
                    <input
                      type="number"
                      value={slaDailyBudget}
                      onChange={(e) => setSlaDailyBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">Current Actual Daily Spend</label>
                    <input
                      type="number"
                      value={currentDailySpend}
                      onChange={(e) => setCurrentDailySpend(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">{language === 'id' ? 'Lokasi' : 'Location'}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Jakarta, Indonesia"
                    className="w-full px-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">Account Status</label>
                  <CustomSelect
                    value={clientStatus}
                    onChange={(val) => setClientStatus(val as any)}
                    options={[
                      { value: 'active', label: 'Active', badge: 'Active', badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
                      { value: 'completed', label: 'Completed', badge: 'Completed', badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
                      { value: 'lead', label: 'Lead', badge: 'Lead', badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
                      { value: 'inactive', label: 'Inactive', badge: 'Inactive', badgeColor: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' }
                    ]}
                    className="w-full"
                    triggerClassName="w-full justify-between"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8A94A6] mb-1 font-semibold">{language === 'id' ? 'Catatan & Preferensi Klien' : 'Client Notes & Requirements'}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special client preferences, NDA details, billing notes..."
                  className="w-full px-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[rgba(255,255,255,0.07)]">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="h-10 px-4 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] font-mono text-xs transition-colors min-h-[40px]"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white font-mono font-bold text-xs shadow-lg shadow-[#E50914]/25 transition-all min-h-[40px]"
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
