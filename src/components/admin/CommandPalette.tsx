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
  Settings,
  ExternalLink,
  Command,
  ArrowRight,
  X,
  FileText,
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

interface SearchResult {
  id: string | number;
  type: string;
  name: string;
  url: string;
  status?: string;
  owner?: string;
}

interface QuickAction {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  shortcut: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }

    setQuery('');
    setSearchResults([]);
    setActiveIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search.query(query);
        if (res.success && res.data?.results) {
          setSearchResults(res.data.results as SearchResult[]);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, searchResults.length]);

  const quickActions: QuickAction[] = [
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
      category: language === 'id' ? 'Navigasi' : 'System',
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
      action: () => { window.open('/', '_blank', 'noopener,noreferrer'); onClose(); }
    }
  ];

  const filteredActions = quickActions.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const selectableItems = [
    ...searchResults.map((result) => ({ kind: 'result' as const, result })),
    ...filteredActions.map((action) => ({ kind: 'action' as const, action }))
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new CustomEvent('open_command_palette'));
        }
        return;
      }

      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) =>
          selectableItems.length ? (index + 1) % selectableItems.length : 0
        );
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) =>
          selectableItems.length
            ? (index - 1 + selectableItems.length) % selectableItems.length
            : 0
        );
        return;
      }

      if (event.key === 'Enter' && selectableItems.length > 0) {
        event.preventDefault();
        const selected = selectableItems[activeIndex];
        if (selected?.kind === 'result') {
          navigate(selected.result.url);
          onClose();
        } else if (selected?.kind === 'action') {
          selected.action.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isOpen, navigate, onClose, selectableItems.length]);

  if (!isOpen) return null;

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Lead': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Deal': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Client': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Project': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Invoice': return 'bg-[#B00020]/10 text-[#B00020] border-[#B00020]/30';
      case 'Proposal': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default: return 'bg-zinc-800 text-zinc-300 border-white/10';
    }
  };

  const runSelected = (index: number) => {
    const selected = selectableItems[index];
    if (!selected) return;
    if (selected.kind === 'result') {
      navigate(selected.result.url);
      onClose();
    } else {
      selected.action.action();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-16 backdrop-blur-md sm:pt-24 animate-in fade-in duration-150"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-[24px] border border-white/[.10] bg-[#151619] shadow-[0_24px_64px_rgba(0,0,0,.55)] animate-in zoom-in-95 duration-150 flex max-h-[80vh] flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={language === 'id' ? 'Command Palette' : 'Command Palette'}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/[.08] bg-white/[.025] p-4">
          {isSearching ? (
            <Loader2 size={18} className="shrink-0 animate-spin text-[#B00020]" />
          ) : (
            <Search size={18} className="shrink-0 text-[#A1A1A6]" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              language === 'id'
                ? 'Cari deal, invoice, proyek, proposal, atau modul (⌘K)...'
                : 'Search deals, invoices, projects, proposals, or modules (⌘K)...'
            }
            className="flex-1 bg-transparent text-sm text-[#F5F5F7] placeholder-[#A1A1A6] font-sans outline-none"
            aria-label={language === 'id' ? 'Pencarian AMS' : 'AMS search'}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--k-control-radius)] p-2 text-[#A1A1A6] transition-colors hover:bg-white/[.06] hover:text-[var(--k-text)]"
            aria-label={language === 'id' ? 'Tutup pencarian' : 'Close search'}
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[440px] space-y-2 overflow-y-auto p-2 custom-scrollbar" role="listbox" aria-label="Command results">
          {searchResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-sans uppercase tracking-wider text-[#A1A1A6]">
                {language === 'id' ? 'Hasil Pencarian Database' : 'Database Records'} ({searchResults.length})
              </div>
              <div className="space-y-1">
                {searchResults.map((result, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={`${result.type}_${result.id}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runSelected(index)}
                      className={`group flex w-full items-center justify-between rounded-[var(--k-control-radius)] p-2.5 text-left transition-colors ${isActive ? 'bg-white/[.07]' : 'hover:bg-white/[.045]'}`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className={`shrink-0 rounded border px-2 py-0.5 text-[9px] font-sans font-bold uppercase ${getBadgeColor(result.type)}`}>
                          {result.type}
                        </span>
                        <div className="min-w-0">
                          <div className={`truncate text-xs font-semibold transition-colors ${isActive ? 'text-[var(--k-text)]' : 'text-[#F5F5F7]'}`}>
                            {result.name}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-sans text-[#A1A1A6]">
                            {result.status && <span>Status: {result.status}</span>}
                            {result.owner && <span>• {result.owner}</span>}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={12} className={`shrink-0 transition-all ${isActive ? 'translate-x-0.5 text-[#B00020]' : 'text-[#6E6E73]'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            {searchResults.length > 0 && (
              <div className="mt-2 border-t border-white/[.07] px-3 py-1.5 text-[10px] font-sans uppercase tracking-wider text-[#A1A1A6]">
                {language === 'id' ? 'Perintah & Modul' : 'Commands & Navigation'}
              </div>
            )}

            {filteredActions.length === 0 && searchResults.length === 0 ? (
              <div className="p-8 text-center text-xs font-sans text-[#A1A1A6]">
                {language === 'id' ? 'Tidak ada hasil untuk pencarian tersebut.' : 'No commands or records match your search.'}
              </div>
            ) : (
              filteredActions.map((item, index) => {
                const selectableIndex = searchResults.length + index;
                const isActive = selectableIndex === activeIndex;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(selectableIndex)}
                    onClick={() => runSelected(selectableIndex)}
                    className={`group flex w-full items-center justify-between rounded-[var(--k-control-radius)] p-2.5 text-left transition-colors ${isActive ? 'bg-white/[.07]' : 'hover:bg-white/[.045]'}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--k-control-radius)] border transition-colors ${isActive ? 'border-white/[.14] bg-white/[.07] text-[var(--k-text)]' : 'border-white/[.07] bg-white/[.025] text-[#A1A1A6]'}`}>
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-[#F5F5F7]">
                          {item.title}
                        </div>
                        <div className="text-[10px] font-sans text-[#A1A1A6]">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded bg-white/[.025] px-2 py-0.5 text-[10px] font-sans text-[#A1A1A6] border border-white/[.07]">
                        {item.shortcut}
                      </span>
                      <ArrowRight size={12} className={`transition-all ${isActive ? 'translate-x-0.5 text-[#B00020]' : 'text-[#6E6E73]'}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/[.08] bg-white/[.025] p-3 text-[11px] font-sans text-[#A1A1A6]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-[#B00020]">
            <Command size={11} />
            <span>KAPITECH AMS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
