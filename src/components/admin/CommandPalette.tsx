import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  Layers, 
  Briefcase, 
  Receipt, 
  Users, 
  Inbox, 
  FolderKanban, 
  Settings, 
  Plus, 
  ExternalLink,
  Command,
  ArrowRight,
  X,
  FileText,
  CheckSquare,
  ShieldCheck,
  FolderOpen,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { api } from '../../lib/apiClient';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search.query(query);
        if (res.success && res.data?.results) {
          setSearchResults(res.data.results);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          const event = new CustomEvent('open_command_palette');
          window.dispatchEvent(event);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'nav_dash',
      title: language === 'id' ? 'Buka Dashboard Overview' : 'Open Dashboard Overview',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: LayoutDashboard,
      shortcut: 'G D',
      action: () => { navigate('/admin/dashboard'); onClose(); }
    },
    {
      id: 'nav_proposals',
      title: language === 'id' ? 'Buka Proposals & Quotations' : 'Open Proposals & Quotations',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: FileText,
      shortcut: 'G Q',
      action: () => { navigate('/admin/proposals'); onClose(); }
    },
    {
      id: 'nav_projects',
      title: language === 'id' ? 'Lihat Client Projects & Task Execution' : 'View Client Projects & Tasks',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: Layers,
      shortcut: 'G P',
      action: () => { navigate('/admin/projects'); onClose(); }
    },
    {
      id: 'nav_crm',
      title: language === 'id' ? 'Buka Agency CRM Pipeline' : 'Open Agency CRM Pipeline',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: Briefcase,
      shortcut: 'G C',
      action: () => { navigate('/admin/crm'); onClose(); }
    },
    {
      id: 'nav_invoicing',
      title: language === 'id' ? 'Buka Invoicing & Financial Records' : 'Open Invoicing & Financials',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: Receipt,
      shortcut: 'G I',
      action: () => { navigate('/admin/invoicing'); onClose(); }
    },
    {
      id: 'nav_clients',
      title: language === 'id' ? 'Buka Direktori Klien' : 'Open Client Directory',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: Users,
      shortcut: 'G U',
      action: () => { navigate('/admin/clients'); onClose(); }
    },
    {
      id: 'nav_approvals',
      title: language === 'id' ? 'Pusat Persetujuan Eksekutif' : 'Executive Approvals Center',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: ShieldCheck,
      shortcut: 'G A',
      action: () => { navigate('/admin/approvals'); onClose(); }
    },
    {
      id: 'nav_documents',
      title: language === 'id' ? 'Brankas Dokumen & Aset' : 'Documents & Asset Vault',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: FolderOpen,
      shortcut: 'G V',
      action: () => { navigate('/admin/documents'); onClose(); }
    },
    {
      id: 'nav_inbox',
      title: language === 'id' ? 'Lihat Inbox Formulir Masuk' : 'View Inbound Inquiries Inbox',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: Inbox,
      shortcut: 'G M',
      action: () => { navigate('/admin/inbox'); onClose(); }
    },
    {
      id: 'nav_settings',
      title: language === 'id' ? 'Pengaturan Sistem & Audit Trail' : 'System Settings & Audit Trail',
      category: language === 'id' ? 'Sistem' : 'System',
      icon: Settings,
      shortcut: 'G S',
      action: () => { navigate('/admin/settings'); onClose(); }
    },
    {
      id: 'act_site',
      title: language === 'id' ? 'Buka Website Publik (kapitech.id)' : 'Open Public Site (kapitech.id)',
      category: language === 'id' ? 'Tautan Eksternal' : 'External Link',
      icon: ExternalLink,
      shortcut: '↗',
      action: () => { window.open('/', '_blank'); onClose(); }
    }
  ];

  const filteredActions = quickActions.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Lead': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Deal': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Client': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Project': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Invoice': return 'bg-[#E50914]/10 text-[#FF1E27] border-[#E50914]/30';
      case 'Proposal': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default: return 'bg-zinc-800 text-zinc-300 border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div 
        className="bg-[#111318] border border-white/[0.07] rounded-2xl w-full max-w-xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="p-4 border-b border-white/[0.07] flex items-center gap-3 bg-[#181B22]">
          {isSearching ? (
            <Loader2 size={18} className="text-[#FF1E27] animate-spin shrink-0" />
          ) : (
            <Search size={18} className="text-[#8A94A6] shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari deal, invoice, proyek, proposal, atau modul (⌘K)...' : 'Search deals, invoices, projects, proposals, or modules (⌘K)...'}
            className="flex-1 bg-transparent text-sm text-[#F8FAFC] placeholder-[#8A94A6] focus:outline-none font-sans"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#21252F] text-[#8A94A6] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto max-h-[440px] space-y-2 custom-scrollbar">
          {/* Live Global Search Results */}
          {searchResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono text-[#8A94A6] uppercase tracking-wider">
                {language === 'id' ? 'Hasil Pencarian Database' : 'Database Records'} ({searchResults.length})
              </div>
              <div className="space-y-1">
                {searchResults.map((res) => (
                  <button
                    key={`${res.type}_${res.id}`}
                    onClick={() => { navigate(res.url); onClose(); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#181B22] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border shrink-0 ${getBadgeColor(res.type)}`}>
                        {res.type}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#F8FAFC] truncate group-hover:text-[#FF1E27] transition-colors">
                          {res.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#8A94A6] flex items-center gap-2">
                          {res.status && <span>Status: {res.status}</span>}
                          {res.owner && <span>• {res.owner}</span>}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={12} className="text-[#8A94A6] group-hover:text-[#FF1E27] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions & Navigation */}
          <div>
            {searchResults.length > 0 && (
              <div className="px-3 py-1.5 text-[10px] font-mono text-[#8A94A6] uppercase tracking-wider border-t border-white/[0.07] mt-2">
                {language === 'id' ? 'Perintah & Modul' : 'Commands & Navigation'}
              </div>
            )}
            {filteredActions.length === 0 && searchResults.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#8A94A6]">
                {language === 'id' ? 'Tidak ada hasil untuk pencarian tersebut.' : 'No commands or records match your search.'}
              </div>
            ) : (
              filteredActions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#181B22] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#181B22] border border-white/[0.07] flex items-center justify-center text-[#8A94A6] group-hover:text-white group-hover:border-[#E50914]/50 transition-colors shrink-0">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#F8FAFC] truncate group-hover:text-[#FF1E27] transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] font-mono text-[#8A94A6]">
                          {item.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.shortcut && (
                        <span className="px-2 py-0.5 rounded bg-[#111318] border border-white/[0.07] text-[10px] font-mono text-[#8A94A6]">
                          {item.shortcut}
                        </span>
                      )}
                      <ArrowRight size={12} className="text-[#8A94A6] group-hover:text-[#FF1E27] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-white/[0.07] bg-[#181B22] flex items-center justify-between text-[11px] font-mono text-[#8A94A6]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center gap-1 text-[#E50914] font-semibold">
            <Command size={11} />
            <span>KAPITECH AMS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
