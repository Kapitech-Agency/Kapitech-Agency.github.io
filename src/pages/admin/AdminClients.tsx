import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  ExternalLink,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import {
  AgencyClient,
  getAgencyClients,
  saveAgencyClient,
  deleteAgencyClient,
  CLIENT_EVENT_NAME
} from '../../lib/clientStore';
import { formatIDR } from '../../lib/crmStore';
import { useLanguage } from '../../lib/LanguageContext';
import { useDragToScroll } from '../../lib/useDragToScroll';

export const AdminClients: React.FC = () => {
  const { t, language } = useLanguage();
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

  const loadData = () => {
    setClients(getAgencyClients());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener(CLIENT_EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(CLIENT_EVENT_NAME, handleUpdate);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262930]">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Users className="text-brand-red" size={26} />
            <span>{t('admin.client.title')}</span>
          </h1>
          <p className="text-xs text-[#8A909D] mt-1">
            {t('admin.client.subtitle')}
          </p>
        </div>

        <button
          onClick={handleOpenCreateClient}
          className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-brand-red/20 self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>{t('admin.client.addClient')}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check size={14} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Key Metrics Summary (3 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-[#16181D] border border-[#262930] p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A909D] mb-2">
            <span className="text-xs font-mono uppercase font-semibold">{t('admin.client.totalClients')}</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-white tracking-tight">
            {clients.length}
          </div>
          <div className="mt-3 pt-2 border-t border-[#262930] text-[11px] font-mono text-[#8A909D]">
            Across Enterprise & SME tiers
          </div>
        </div>

        <div className="bg-[#16181D] border border-[#262930] p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A909D] mb-2">
            <span className="text-xs font-mono uppercase font-semibold">{t('admin.client.activeAccounts')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-emerald-400 tracking-tight">
            {activeAccountsCount}
          </div>
          <div className="mt-3 pt-2 border-t border-[#262930] text-[11px] font-mono text-emerald-400">
            Active Retainers & Sprints
          </div>
        </div>

        <div className="bg-[#16181D] border border-[#262930] p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A909D] mb-2">
            <span className="text-xs font-mono uppercase font-semibold">{t('admin.client.lifetimeSpend')}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            {formatIDR(totalLifetimeSpend)}
          </div>
          <div className="mt-3 pt-2 border-t border-[#262930] text-[11px] font-mono text-purple-400">
            Cumulative Billed Value
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#16181D] border border-[#262930] p-4 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A909D]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client name, company, email..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white placeholder-[#5C626E] focus:outline-none focus:border-brand-red font-mono"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono self-start sm:self-auto"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="lead">Lead</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* 4. Drag-to-Scroll Clients Table */}
      <div
        ref={tableScrollRef}
        className="bg-[#16181D] border border-[#262930] rounded-2xl overflow-x-auto shadow-xl select-none"
      >
        <table className="w-full text-left text-xs font-mono min-w-[800px]">
          <thead>
            <tr className="border-b border-[#262930] bg-[#111317] text-[#8A909D]">
              <th className="py-3 px-4 font-semibold uppercase text-[10px]">Client / PIC</th>
              <th className="py-3 px-4 font-semibold uppercase text-[10px]">Company & Industry</th>
              <th className="py-3 px-4 font-semibold uppercase text-[10px]">Contact Info</th>
              <th className="py-3 px-4 font-semibold uppercase text-[10px]">Location</th>
              <th className="py-3 px-4 font-semibold uppercase text-[10px]">Total Billed</th>
              <th className="py-3 px-4 font-semibold uppercase text-[10px]">Status</th>
              <th className="py-3 px-4 font-semibold uppercase text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262930]">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#8A909D]">
                  No clients found.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#1C2027] transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white font-display text-sm">{client.name}</div>
                    <div className="text-[10px] text-brand-red font-semibold">{client.contactPersonRole}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Building2 size={12} className="text-[#8A909D]" />
                      <span>{client.company}</span>
                    </div>
                    <div className="text-[10px] text-[#8A909D]">{client.industry}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#8A909D] space-y-0.5 text-[11px]">
                    <div className="flex items-center gap-1 text-white">
                      <Mail size={11} className="text-[#8A909D]" />
                      <span>{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-1">
                        <Phone size={11} className="text-[#8A909D]" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#8A909D]">
                    <div className="flex items-center gap-1">
                      <MapPin size={11} className="text-[#8A909D]" />
                      <span>{client.location}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400 font-display">
                    {formatIDR(client.totalSpend)}
                    <div className="text-[10px] font-mono text-[#5C626E] font-normal">
                      {client.projectsCount} Project(s)
                    </div>
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
                        className="p-1.5 rounded-lg bg-[#0B0C0E] hover:bg-[#262930] text-[#8A909D] hover:text-white border border-[#262930] transition-colors"
                        title="Edit Client"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="p-1.5 rounded-lg bg-[#0B0C0E] hover:bg-red-950/40 text-[#8A909D] hover:text-red-400 border border-[#262930] transition-colors"
                        title="Delete Client"
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

      {/* 5. Create / Edit Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#16181D] border border-[#262930] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#262930]">
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <Users className="text-brand-red" size={20} />
                <span>{editingClient ? 'Edit Client Record' : 'Add New Agency Client'}</span>
              </h3>
              <button onClick={() => setIsClientModalOpen(false)} className="p-1.5 text-[#8A909D] hover:text-white rounded-lg bg-[#0B0C0E] border border-[#262930]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Client / PIC Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Marcus Thorne"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Company / Brand *</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    placeholder="e.g. Lumina Real Estate Global"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Contact Person Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Managing Director / CTO"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Industry Sector</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Real Estate & PropTech"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 811-XXXX-XXXX"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Jakarta, Indonesia"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Lifetime Spend (IDR)</label>
                  <input
                    type="number"
                    value={totalSpend}
                    onChange={(e) => setTotalSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Account Status</label>
                  <select
                    value={clientStatus}
                    onChange={(e) => setClientStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="lead">Lead</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">Client Notes & Requirements</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special client preferences, NDA details, billing notes..."
                  className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#262930]">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0B0C0E] text-[#8A909D] hover:text-white border border-[#262930]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white font-bold shadow-lg shadow-brand-red/20"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
