import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  Briefcase, 
  Receipt, 
  Layers, 
  Building2,
  FolderGit2, 
  Quote, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  Clock, 
  ChevronRight,
  Globe, 
  Search, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Cpu, 
  Kanban,
  ShieldCheck,
  Activity,
  Sliders
} from 'lucide-react';
import { getAdminSession, logoutAdmin } from '../../lib/adminAuth';
import { subscribeToInbox, ContactSubmission } from '../../lib/submissions';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, setActiveCurrency, CurrencyCode, CURRENCY_EVENT } from '../../lib/currency';
import { CommandPalette } from '../../components/admin/CommandPalette';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number | null;
  badgeColor?: string;
  exact?: boolean;
}

interface NavSection {
  id: string;
  titleKey: string;
  items: NavItem[];
}

export const AdminLayout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const session = getAdminSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currency, setCurrencyState] = useState<CurrencyCode>(getActiveCurrency());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          timeZone: 'Asia/Jakarta' 
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  useEffect(() => {
    const handleCurrencyChange = (e: Event) => {
      const custom = e as CustomEvent<{ currency: CurrencyCode }>;
      if (custom.detail?.currency) {
        setCurrencyState(custom.detail.currency);
      }
    };
    window.addEventListener(CURRENCY_EVENT, handleCurrencyChange);
    return () => window.removeEventListener(CURRENCY_EVENT, handleCurrencyChange);
  }, []);

  useEffect(() => {
    const handleOpenCmd = () => setCommandPaletteOpen(true);
    window.addEventListener('open_command_palette', handleOpenCmd);
    return () => window.removeEventListener('open_command_palette', handleOpenCmd);
  }, []);

  const handleSwitchCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    setActiveCurrency(c);
  };

  useEffect(() => {
    const unsub = subscribeToInbox((items: ContactSubmission[]) => {
      const newItems = items.filter(i => i.status === 'new').length;
      setUnreadCount(newItems);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm(t('admin.nav.logoutConfirm'))) {
      logoutAdmin();
      navigate('/admin/login', { replace: true });
    }
  };

  // 4 Logical Sections
  const navSections: NavSection[] = [
    {
      id: 'core',
      titleKey: 'admin.nav.coreOperations',
      items: [
        {
          to: '/admin/dashboard',
          label: t('admin.nav.dashboard'),
          icon: LayoutDashboard,
          badge: null
        },
        {
          to: '/admin/inbox',
          label: t('admin.nav.inbox'),
          icon: Inbox,
          badge: unreadCount > 0 ? unreadCount : null,
          badgeColor: 'bg-[#E50914] text-white font-bold animate-pulse'
        },
        {
          to: '/admin/crm',
          label: t('admin.nav.crm'),
          icon: Kanban,
          badge: currency,
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold font-mono'
        },
        {
          to: '/admin/projects',
          label: t('admin.nav.projects'),
          icon: Layers,
          badge: null
        }
      ]
    },
    {
      id: 'finance',
      titleKey: 'admin.nav.financeRevenue',
      items: [
        {
          to: '/admin/invoicing',
          label: t('admin.nav.invoicing'),
          icon: Receipt,
          badge: null
        },
        {
          to: '/admin/clients',
          label: t('admin.nav.clients'),
          icon: Building2,
          badge: null
        },
        {
          to: '/admin/vendors',
          label: t('admin.nav.vendors'),
          icon: Briefcase,
          badge: 'Vetted',
          badgeColor: 'bg-zinc-800 text-zinc-300 font-mono text-[9px]'
        }
      ]
    },
    {
      id: 'content',
      titleKey: 'admin.nav.contentPortfolio',
      items: [
        {
          to: '/admin/cms/services',
          label: t('admin.nav.servicesCatalog'),
          icon: Cpu,
          badge: null
        },
        {
          to: '/admin/cms/projects',
          label: t('admin.nav.caseStudies'),
          icon: FolderGit2,
          badge: null
        },
        {
          to: '/admin/cms/testimonials',
          label: t('admin.cms.testiTitle'),
          icon: Quote,
          badge: null
        }
      ]
    },
    {
      id: 'admin',
      titleKey: 'admin.nav.administration',
      items: [
        {
          to: '/admin/settings?tab=team',
          label: language === 'id' ? 'Tim & Hak Akses' : 'Team & Permissions',
          icon: ShieldCheck,
          badge: null
        },
        {
          to: '/admin/settings?tab=audit',
          label: t('admin.nav.auditTrail'),
          icon: Activity,
          badge: null
        },
        {
          to: '/admin/settings?tab=system',
          label: language === 'id' ? 'Preferensi Sistem' : 'System Preferences',
          icon: Sliders,
          badge: null
        }
      ]
    }
  ];

  // Helper to determine if link is active
  const isItemActive = (itemTo: string) => {
    const [path, query] = itemTo.split('?');
    if (query) {
      return location.pathname === path && location.search.includes(query);
    }
    if (location.pathname === path) return true;
    if (path !== '/admin/dashboard' && path !== '/admin/settings' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Find active item label for breadcrumb
  let activeItemLabel = 'Dashboard';
  for (const section of navSections) {
    for (const item of section.items) {
      if (isItemActive(item.to)) {
        activeItemLabel = item.label;
        break;
      }
    }
  }

  return (
    <div className="h-screen w-full bg-[#08090C] text-[#F8FAFC] flex flex-col md:flex-row selection:bg-[#E50914] selection:text-white font-sans antialiased overflow-hidden">
      
      {/* Universal Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR */}
      {/* ------------------------------------------------------------- */}
      <aside 
        className={`hidden md:flex flex-col bg-[#111318] border-r border-[rgba(255,255,255,0.07)] shrink-0 h-full z-30 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64 lg:w-72'
        }`}
      >
        
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between bg-[#111318]">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#FF1E27] flex items-center justify-center text-white font-bold font-sans shadow-[0_0_16px_rgba(229,9,20,0.3)] text-sm shrink-0">
              K
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-sans font-bold text-[#F8FAFC] text-sm tracking-tight flex items-center gap-1.5">
                  <span>KAPITECH</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E50914]/10 text-[#FF1E27] border border-[#E50914]/30 font-semibold">
                    AMS
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[#8A94A6] -mt-0.5 truncate">Agency Management System</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-[#F8FAFC] border border-[rgba(255,255,255,0.07)] transition-colors shrink-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        {/* Navigation List - 4 Structured Sections */}
        <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.id} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="text-[11px] font-mono text-[#64748B] font-bold tracking-wider px-3 pt-2 pb-1 uppercase">
                  {t(section.titleKey)}
                </div>
              )}
              {sidebarCollapsed && (
                <div className="w-6 h-px bg-[rgba(255,255,255,0.07)] mx-auto my-2" />
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans transition-all duration-150 group ${
                      active
                        ? 'bg-[rgba(229,9,20,0.08)] text-white font-medium'
                        : 'text-[#8A94A6] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    {/* Linear-style Left Indicator Strip */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#E50914] rounded-r-full" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={16} className={active ? 'text-[#E50914] shrink-0' : 'text-[#8A94A6] group-hover:text-[#F8FAFC] shrink-0 transition-colors'} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge !== null && item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ml-auto shrink-0 ${
                        item.badgeColor || 'bg-[#181B22] text-[#8A94A6] border border-[rgba(255,255,255,0.07)]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Public Agency Link */}
          {!sidebarCollapsed && (
            <div className="pt-2">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-[#8A94A6] hover:text-white hover:bg-white/[0.04] transition-all border border-[rgba(255,255,255,0.07)]"
              >
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-emerald-400" />
                  <span>{t('admin.nav.viewSite')}</span>
                </div>
                <ExternalLink size={11} className="text-[#64748B]" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer: Admin Profile Card */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.07)] bg-[#111318] space-y-2">
          <div className={`flex items-center justify-between ${sidebarCollapsed ? 'flex-col gap-2' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#FF1E27] border border-white/10 flex items-center justify-center text-xs font-sans text-white font-bold shrink-0 shadow-sm">
                {session?.user.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F8FAFC] truncate">
                    {session?.user.username || 'admin'}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Lead Admin</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              title={t('admin.nav.logout')}
              className="p-2 flex items-center justify-center rounded-lg bg-[#181B22] hover:bg-red-950/40 text-[#8A94A6] hover:text-[#FF1E27] border border-[rgba(255,255,255,0.07)] hover:border-[#E50914]/30 transition-all shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE TOPBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0F1117]/95 backdrop-blur-xl border-b border-[#1F222C] sticky top-0 z-40 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#FF1E27] flex items-center justify-center text-white font-bold text-xs shadow-[0_0_12px_rgba(229,9,20,0.3)]">
            K
          </div>
          <div>
            <span className="font-sans font-bold text-[#F8FAFC] text-sm tracking-tight block">KAPITECH AMS</span>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 -mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online • {currentTime.split(' ')[0] || ''}</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            aria-label="Search command palette"
            className="p-2 rounded-lg bg-[#161922] text-[#94A3B8] border border-[#1F222C]"
          >
            <Search size={15} />
          </button>

          {/* Quick Currency Toggle Mobile */}
          <div className="flex items-center bg-[#08090C] border border-[#1F222C] rounded-lg p-0.5 font-mono text-[10px]">
            <button
              onClick={() => handleSwitchCurrency('IDR')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${currency === 'IDR' ? 'bg-[#161922] text-emerald-400 font-bold shadow-sm' : 'text-[#94A3B8]'}`}
            >
              IDR
            </button>
            <button
              onClick={() => handleSwitchCurrency('USD')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${currency === 'USD' ? 'bg-[#161922] text-emerald-400 font-bold shadow-sm' : 'text-[#94A3B8]'}`}
            >
              USD
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#161922] text-white border border-[#1F222C] hover:bg-[#1B1E2B] transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative ml-auto w-4/5 max-w-xs bg-[#0F1117] border-l border-[#1F222C] h-full flex flex-col justify-between p-4 z-10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200 rounded-l-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1F222C]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E50914] to-[#FF1E27] flex items-center justify-center text-white font-bold text-xs">
                    K
                  </div>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Kapitech AMS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#161922] text-[#94A3B8] hover:text-white border border-[#1F222C]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Drawer Language & Currency Bar */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1F222C]">
                <div className="flex items-center bg-[#08090C] border border-[#1F222C] rounded-lg p-0.5 font-mono text-xs">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      language === 'en' ? 'bg-[#161922] text-white shadow-sm' : 'text-[#94A3B8]'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('id')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      language === 'id' ? 'bg-[#161922] text-white shadow-sm' : 'text-[#94A3B8]'
                    }`}
                  >
                    ID
                  </button>
                </div>

                <div className="flex items-center bg-[#08090C] border border-[#1F222C] rounded-lg p-0.5 font-mono text-xs">
                  <button
                    onClick={() => handleSwitchCurrency('IDR')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      currency === 'IDR' ? 'bg-[#161922] text-emerald-400 shadow-sm' : 'text-[#94A3B8]'
                    }`}
                  >
                    IDR
                  </button>
                  <button
                    onClick={() => handleSwitchCurrency('USD')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      currency === 'USD' ? 'bg-[#161922] text-emerald-400 shadow-sm' : 'text-[#94A3B8]'
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>

              {/* Mobile Navigation List */}
              <div className="space-y-3">
                {navSections.map((section) => (
                  <div key={section.id} className="space-y-1">
                    <div className="text-[10px] font-mono text-[#64748B] font-bold tracking-wider px-2 uppercase">
                      {t(section.titleKey)}
                    </div>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isItemActive(item.to);

                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans transition-colors min-h-[42px] ${
                            active 
                              ? 'bg-[#E50914]/10 text-white font-semibold border-l-2 border-[#E50914]' 
                              : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon size={16} className={active ? 'text-[#FF1E27]' : 'text-[#94A3B8]'} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge !== null && item.badge !== undefined && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-[#161922] text-[#94A3B8]'}`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))}

                <div className="pt-3 border-t border-[#1F222C]">
                  <Link
                    to="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-emerald-400 bg-[#161922] border border-[#1F222C]"
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={14} />
                      <span>{t('admin.nav.viewSite')}</span>
                    </div>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom session details */}
            <div className="pt-3 border-t border-[#1F222C] flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-[#F8FAFC] truncate">{session?.user.username || 'admin'}</div>
                <div className="text-[10px] font-mono text-[#94A3B8] truncate">{session?.user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 min-h-[40px] rounded-lg bg-red-950/50 border border-[#E50914]/30 text-red-300 text-xs font-mono flex items-center gap-1 shrink-0"
              >
                <LogOut size={12} />
                <span>{t('admin.nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA & STICKY TOPBAR */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#08090C] custom-scrollbar">
        
        {/* Sticky Topbar Header */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-[#1F222C] bg-[#08090C]/85 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2.5 text-xs font-sans text-[#94A3B8]">
            <span className="font-semibold text-white">Kapitech AMS</span>
            <ChevronRight size={13} className="text-[#64748B]" />
            <span className="text-[#F8FAFC] font-medium truncate">{activeItemLabel}</span>
          </div>

          {/* Topbar Controls Container */}
          <div className="flex items-center gap-3 text-xs font-sans text-[#94A3B8]">
            
            {/* Quick Command Trigger in Topbar */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#161922] border border-[#1F222C] text-[#94A3B8] hover:text-white hover:border-white/10 text-xs transition-colors"
            >
              <Search size={13} className="text-[#64748B]" />
              <span className="text-[11px] font-mono text-[#64748B]">⌘K Search</span>
            </button>

            {/* Currency Switcher (IDR / USD) */}
            <div className="hidden sm:flex items-center bg-[#0F1117] border border-[#1F222C] rounded-lg p-[3px] font-mono text-xs">
              <button
                onClick={() => handleSwitchCurrency('IDR')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  currency === 'IDR'
                    ? 'bg-[#161922] text-emerald-400 shadow-[0_1px_3px_rgba(0,0,0,0.5)] border border-white/10'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                IDR
              </button>
              <button
                onClick={() => handleSwitchCurrency('USD')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  currency === 'USD'
                    ? 'bg-[#161922] text-emerald-400 shadow-[0_1px_3px_rgba(0,0,0,0.5)] border border-white/10'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                USD
              </button>
            </div>

            {/* Language Switcher (EN / ID) */}
            <div className="hidden sm:flex items-center bg-[#0F1117] border border-[#1F222C] rounded-lg p-[3px] font-mono text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-[#161922] text-white shadow-[0_1px_3px_rgba(0,0,0,0.5)] border border-white/10'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  language === 'id'
                    ? 'bg-[#161922] text-white shadow-[0_1px_3px_rgba(0,0,0,0.5)] border border-white/10'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                ID
              </button>
            </div>

            {/* Live Studio Clock */}
            <div className="flex items-center gap-1.5 bg-[#161922] px-2.5 py-1.5 rounded-lg border border-[#1F222C] text-[11px] font-mono text-[#94A3B8]">
              <Clock size={12} className="text-[#FF1E27]" />
              <span>{currentTime || 'Jakarta WIB'}</span>
            </div>

            {/* Public Domain Switcher */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161922] border border-[#1F222C] hover:border-white/10 text-[11px] font-mono text-[#94A3B8] hover:text-white transition-colors"
            >
              <span>kapitech.id</span>
              <ExternalLink size={10} />
            </Link>
          </div>
        </header>

        {/* View Outlet */}
        <div className="flex-1 p-4 sm:p-6 lg:p-7 w-full max-w-[1700px] mx-auto">
          <Outlet />
        </div>

      </main>

    </div>
  );
};
export default AdminLayout;
