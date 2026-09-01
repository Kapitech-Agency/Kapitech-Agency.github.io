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
  X
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
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
      id: 'nav_inbox',
      title: language === 'id' ? 'Lihat Inbox Formulir Masuk' : 'View Inbound Inquiries Inbox',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: Inbox,
      shortcut: 'G M',
      action: () => { navigate('/admin/inbox'); onClose(); }
    },
    {
      id: 'nav_cms',
      title: language === 'id' ? 'Kelola CMS Portofolio & Studi Kasus' : 'Manage CMS Portfolio & Case Studies',
      category: language === 'id' ? 'Navigasi' : 'Navigation',
      icon: FolderKanban,
      shortcut: 'G K',
      action: () => { navigate('/admin/cms/projects'); onClose(); }
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

  const filtered = quickActions.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div 
        className="bg-[#0F1117] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3 bg-[#161922]">
          <Search size={18} className="text-[#94A3B8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'id' ? 'Ketik perintah atau cari modul (tekan ESC untuk keluar)...' : 'Type a command or search modules (press ESC to exit)...'}
            className="flex-1 bg-transparent text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none font-sans"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#1B1E2B] text-[#94A3B8] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto max-h-[400px] space-y-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#94A3B8]">
              {language === 'id' ? 'Tidak ada hasil untuk pencarian tersebut.' : 'No commands or modules match your search.'}
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#1B1E2B] text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#161922] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#94A3B8] group-hover:text-white group-hover:border-[#E50914]/50 transition-colors">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#F8FAFC] truncate group-hover:text-[#FF1E27] transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748B]">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="px-2 py-0.5 rounded bg-[#161922] border border-[rgba(255,255,255,0.06)] text-[10px] font-mono text-[#94A3B8]">
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight size={12} className="text-[#64748B] group-hover:text-[#FF1E27] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[#161922] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
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
