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
  Sliders,
  Users
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

  // Lock background scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    if (window.confirm(t('admin.nav.logoutConfirm'))) {
      logoutAdmin();
      navigate('/admin/login', { replace: true });
    }
  };

  // 4 Logical Sections (with Consolidated Single Settings Menu)
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
          to: '/admin/settings',
          label: t('admin.nav.settings'),
          icon: Settings,
          badge: null
        },
        {
          to: '/admin/settings?tab=rbac',
          label: language === 'id' ? 'Akun & Hak Akses' : 'Accounts & RBAC',
          icon: Users,
          badge: 'RBAC',
          badgeColor: 'bg-[#E50914]/10 text-[#FF1E27] border border-[#E50914]/30 font-mono text-[9px] font-bold'
        }
      ]
    }
  ];

  // Helper to determine if link is active
  const isItemActive = (itemTo: string) => {
    if (itemTo.includes('tab=')) {
      const [path, query] = itemTo.split('?');
      return location.pathname === path && location.search.includes(query);
    }
    if (itemTo === '/admin/settings') {
      return location.pathname === '/admin/settings' && !location.search.includes('tab=rbac');
    }
    if (location.pathname === itemTo) return true;
    if (itemTo !== '/admin/dashboard' && itemTo !== '/admin/settings' && location.pathname.startsWith(itemTo)) {
      return true;
    }
    return false;
  };

  // Find active item label for breadcrumb
  let activeItemLabel = 'Dashboard';
  if (location.pathname === '/admin/settings') {
    activeItemLabel = t('admin.nav.settings');
  } else {
    for (const section of navSections) {
      for (const item of section.items) {
        if (isItemActive(item.to)) {
          activeItemLabel = item.label;
          break;
        }
      }
    }
  }

  return (
    <div className="h-screen w-full bg-[#090A0F] text-[#F8FAFC] flex flex-col md:flex-row selection:bg-[#E50914] selection:text-white font-sans antialiased overflow-hidden">
      
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
        <div className={`h-16 border-b border-[rgba(255,255,255,0.07)] flex items-center bg-[#111318] transition-all ${
          sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          {!sidebarCollapsed ? (
            <>
              <Link to="/admin/dashboard" className="flex items-center gap-3 group overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#FF1E27] flex items-center justify-center text-white font-bold font-sans shadow-[0_0_16px_rgba(229,9,20,0.3)] text-sm shrink-0">
                  K
                </div>
                <div className="min-w-0">
                  <div className="font-sans font-bold text-[#F8FAFC] text-sm tracking-tight flex items-center gap-1.5">
                    <span>KAPITECH</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E50914]/10 text-[#FF1E27] border border-[#E50914]/30 font-semibold">
                      AMS
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#8A94A6] -mt-0.5 truncate">Agency Management System</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="w-8 h-8 rounded-lg bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-[#F8FAFC] border border-[rgba(255,255,255,0.07)] transition-colors flex items-center justify-center shrink-0"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </>
          ) : (
            <Link 
              to="/admin/dashboard" 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E50914] to-[#FF1E27] flex items-center justify-center text-white font-bold font-sans shadow-[0_0_16px_rgba(229,9,20,0.3)] text-sm hover:scale-105 transition-transform shrink-0"
              title="Kapitech AMS Dashboard"
            >
              K
            </Link>
          )}
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
                {(session?.user?.name || session?.user?.username || 'A').charAt(0).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F8FAFC] truncate">
                    {session?.user?.name || session?.user?.username || 'Admin'}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{session?.user?.role || 'Lead Admin'}</span>
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
      {/* MOBILE TOPBAR - Single, sleek, non-cluttered header */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-[#111318] border-b border-[rgba(255,255,255,0.07)] sticky top-0 z-40 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] h-14">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#181B22] text-white border border-[rgba(255,255,255,0.08)] hover:bg-[#21252F] active:scale-95 transition-all shadow-sm"
          >
            <Menu size={20} />
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E50914] to-[#FF1E27] flex items-center justify-center text-white font-bold text-xs shadow-[0_0_12px_rgba(229,9,20,0.35)] shrink-0">
              K
            </div>
            <div className="min-w-0">
              <span className="font-sans font-bold text-[#F8FAFC] text-xs tracking-tight block truncate">KAPITECH AMS</span>
              <span className="text-[9px] font-mono text-[#8A94A6] block truncate -mt-0.5">{activeItemLabel}</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Language Switcher */}
          <div className="flex items-center bg-[#181B22] border border-[rgba(255,255,255,0.08)] rounded-lg p-0.5 font-mono text-[10px]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                language === 'en'
                  ? 'bg-[#111318] text-white shadow-sm border border-white/10 font-bold'
                  : 'text-[#8A94A6]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('id')}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                language === 'id'
                  ? 'bg-[#111318] text-white shadow-sm border border-white/10 font-bold'
                  : 'text-[#8A94A6]'
              }`}
            >
              ID
            </button>
          </div>

          {/* Quick Currency Pill */}
          <button
            onClick={() => handleSwitchCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
            className="px-2 py-1.5 rounded-lg bg-[#181B22] border border-[rgba(255,255,255,0.08)] text-[10px] font-mono font-bold text-emerald-400 hover:bg-[#21252F] transition-all min-h-[36px]"
            title="Toggle Currency"
          >
            {currency}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Menu (Global standard sliding drawer from left) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-[300px] max-w-[85vw] bg-[#111318] border-r border-[rgba(255,255,255,0.08)] h-[100dvh] flex flex-col justify-between z-50 shadow-[4px_0_30px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-left duration-200">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between bg-[#111318] shrink-0">
              <Link 
                to="/admin/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#FF1E27] flex items-center justify-center text-white font-bold text-xs shadow-[0_0_12px_rgba(229,9,20,0.35)] shrink-0">
                  K
                </div>
                <div>
                  <div className="font-sans font-bold text-[#F8FAFC] text-sm tracking-tight flex items-center gap-1.5">
                    <span>KAPITECH</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E50914]/10 text-[#FF1E27] border border-[#E50914]/30 font-semibold">
                      AMS
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#8A94A6] -mt-0.5">Agency Management System</p>
                </div>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#181B22] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.08)] active:scale-95 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Preferences Bar inside Drawer */}
            <div className="px-4 py-2.5 bg-[#14171E] border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#8A94A6]">
                <span>{language === 'id' ? 'Bahasa:' : 'Lang:'}</span>
                <div className="flex items-center bg-[#181B22] border border-[rgba(255,255,255,0.08)] rounded-md p-0.5">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      language === 'en' ? 'bg-[#111318] text-white shadow-sm' : 'text-[#8A94A6]'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('id')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      language === 'id' ? 'bg-[#111318] text-white shadow-sm' : 'text-[#8A94A6]'
                    }`}
                  >
                    ID
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono text-[#8A94A6]">
                <span>{language === 'id' ? 'Valuta:' : 'Curr:'}</span>
                <div className="flex items-center bg-[#181B22] border border-[rgba(255,255,255,0.08)] rounded-md p-0.5">
                  <button
                    onClick={() => handleSwitchCurrency('IDR')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      currency === 'IDR' ? 'bg-[#111318] text-emerald-400 shadow-sm' : 'text-[#8A94A6]'
                    }`}
                  >
                    IDR
                  </button>
                  <button
                    onClick={() => handleSwitchCurrency('USD')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      currency === 'USD' ? 'bg-[#111318] text-emerald-400 shadow-sm' : 'text-[#8A94A6]'
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {navSections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <div className="text-[10px] font-mono text-[#64748B] font-bold tracking-wider px-3 pt-1 uppercase">
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
                        className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-sans transition-all min-h-[44px] group ${
                          active 
                            ? 'bg-[rgba(229,9,20,0.1)] text-white font-semibold' 
                            : 'text-[#8A94A6] hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#E50914] rounded-r-full" />
                        )}
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon size={17} className={active ? 'text-[#E50914] shrink-0' : 'text-[#8A94A6] shrink-0'} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor || 'bg-[#181B22] text-[#8A94A6] border border-[rgba(255,255,255,0.07)]'}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}

              {/* Public Agency Site Link */}
              <div className="pt-2">
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono text-emerald-400 bg-[#181B22] hover:bg-[#21252F] border border-[rgba(255,255,255,0.07)] min-h-[44px] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe size={15} />
                    <span>{t('admin.nav.viewSite')}</span>
                  </div>
                  <ExternalLink size={12} className="text-[#64748B]" />
                </Link>
              </div>
            </div>

            {/* Bottom session details */}
            <div className="p-3.5 border-t border-[rgba(255,255,255,0.07)] bg-[#14171E] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#FF1E27] border border-white/10 flex items-center justify-center text-xs font-sans text-white font-bold shrink-0 shadow-sm">
                  {(session?.user?.name || session?.user?.username || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F8FAFC] truncate">{session?.user?.name || session?.user?.username || 'Admin'}</div>
                  <div className="text-[10px] font-mono text-emerald-400 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{session?.user?.role || 'Lead Admin'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="px-3 py-2 min-h-[44px] rounded-xl bg-[#181B22] hover:bg-red-950/50 border border-[rgba(255,255,255,0.08)] hover:border-[#E50914]/30 text-[#8A94A6] hover:text-[#FF1E27] text-xs font-mono flex items-center gap-1.5 shrink-0 transition-all"
              >
                <LogOut size={14} />
                <span>{t('admin.nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA & DESKTOP STICKY TOPBAR */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#090A0F] custom-scrollbar">
        
        {/* Sticky Desktop Topbar Header (hidden on mobile to prevent double headers) */}
        <header className="hidden md:flex h-16 px-4 sm:px-6 lg:px-8 border-b border-[rgba(255,255,255,0.07)] bg-[#090A0F]/95 backdrop-blur-md sticky top-0 z-30 items-center justify-between shrink-0 shadow-[0_1px_0_rgba(255,255,255,0.07),0_4px_24px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2.5 text-xs font-sans text-[#8A94A6]">
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-8 h-8 rounded-lg bg-[#111318] hover:bg-[#181B22] text-[#8A94A6] hover:text-[#F8FAFC] border border-[rgba(255,255,255,0.07)] hover:border-[#E50914]/30 transition-all mr-1.5 flex items-center justify-center shrink-0 shadow-sm"
                title="Expand sidebar"
              >
                <PanelLeftOpen size={15} />
              </button>
            )}
            <span className="font-semibold text-white">Kapitech AMS</span>
            <ChevronRight size={13} className="text-[#64748B]" />
            <span className="text-[#F8FAFC] font-medium truncate">{activeItemLabel}</span>
          </div>

          {/* Topbar Controls Container */}
          <div className="flex items-center gap-3 text-xs font-sans text-[#8A94A6]">
            {/* Currency Switcher (IDR / USD) */}
            <div className="flex items-center bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-lg p-[3px] font-mono text-xs">
              <button
                onClick={() => handleSwitchCurrency('IDR')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  currency === 'IDR'
                    ? 'bg-[#181B22] text-emerald-400 shadow-[0_1px_3px_rgba(0,0,0,0.5)] border border-white/10'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                IDR
              </button>
              <button
                onClick={() => handleSwitchCurrency('USD')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  currency === 'USD'
                    ? 'bg-[#181B22] text-emerald-400 shadow-[0_1px_3px_rgba(0,0,0,0.5)] border border-white/10'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                USD
              </button>
            </div>

            {/* Language Switcher (EN / ID) */}
            <div className="flex items-center bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-lg p-[3px] font-mono text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-[#181B22] text-white shadow-[0_1px_3px_rgba(0,0,0,0.5)] border border-white/10'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  language === 'id'
                    ? 'bg-[#181B22] text-white shadow-[0_1px_3px_rgba(0,0,0,0.5)] border border-white/10'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                ID
              </button>
            </div>

            {/* Live Studio Clock */}
            <div className="flex items-center gap-1.5 bg-[#181B22] px-2.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.07)] text-[11px] font-mono text-[#8A94A6]">
              <Clock size={12} className="text-[#FF1E27]" />
              <span>{currentTime || 'Jakarta WIB'}</span>
            </div>

            {/* Public Domain Switcher */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181B22] border border-[rgba(255,255,255,0.07)] hover:border-white/10 text-[11px] font-mono text-[#8A94A6] hover:text-white transition-colors"
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
