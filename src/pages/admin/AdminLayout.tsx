import React, { useState, useEffect, useMemo } from 'react';
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
  Users,
  FileText,
  FolderOpen,
  Bell,
  Sparkles,
  CheckCheck
} from 'lucide-react';
import { getAdminSession, logoutAdmin } from '../../lib/adminAuth';
import { api } from '../../lib/apiClient';
import { subscribeToInbox, ContactSubmission } from '../../lib/submissions';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, setActiveCurrency, CurrencyCode, CURRENCY_EVENT } from '../../lib/currency';
import { CommandPalette } from '../../components/admin/CommandPalette';
import { useRbacRole, StakeholderRole, ROLE_DEFINITIONS } from '../../lib/rbacEngine';

interface NavItem {
  key: string;
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
  const adminDisplayName = session?.user?.name || session?.user?.username || 'Admin';
  const adminUsername = session?.user?.username || '';
  const adminInitials = adminDisplayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AD';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currency, setCurrencyState] = useState<CurrencyCode>(getActiveCurrency());

  // Dynamic RBAC Permission Engine
  const { role: rbacRole, setRole: setRbacRole, roleMeta, isAllowed } = useRbacRole(
    session?.user?.stakeholderType,
    session?.user?.division,
    session?.user?.role,
    session?.user?.permissions
  );

  const loadNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      if (res.success && res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch {
      // benign
    }
  };

  useEffect(() => {
    let interval: number | undefined;

    const startPolling = () => {
      if (document.visibilityState !== 'visible') return;
      void loadNotifications();
      window.clearInterval(interval);
      interval = window.setInterval(() => {
        if (document.visibilityState === 'visible') void loadNotifications();
      }, 45000);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') startPolling();
      else window.clearInterval(interval);
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // benign
    }
  };

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

  // Logical Sections matching Kapitech AMS Architecture
  const navSections: NavSection[] = [
    {
      id: 'core',
      titleKey: 'admin.nav.coreOperations',
      items: [
        {
          key: 'dashboard',
          to: '/admin/dashboard',
          label: t('admin.nav.dashboard'),
          icon: LayoutDashboard,
          badge: null
        },
        {
          key: 'inbox',
          to: '/admin/inbox',
          label: t('admin.nav.inbox'),
          icon: Inbox,
          badge: unreadCount > 0 ? unreadCount : null,
          badgeColor: 'bg-[#E50914] text-white font-bold animate-pulse'
        },
        {
          key: 'crm',
          to: '/admin/crm',
          label: t('admin.nav.crm'),
          icon: Kanban,
          badge: currency,
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold font-mono'
        },
        {
          key: 'proposals',
          to: '/admin/proposals',
          label: language === 'id' ? 'Proposals & Quotations' : 'Proposals & Quotes',
          icon: FileText,
          badge: null
        },
        {
          key: 'projects',
          to: '/admin/projects',
          label: t('admin.nav.projects'),
          icon: Layers,
          badge: null
        },
        {
          key: 'approvals',
          to: '/admin/approvals',
          label: language === 'id' ? 'Pusat Otorisasi' : 'Approvals Center',
          icon: ShieldCheck,
          badge: null
        }
      ]
    },
    {
      id: 'finance',
      titleKey: 'admin.nav.financeRevenue',
      items: [
        {
          key: 'invoicing',
          to: '/admin/invoicing',
          label: t('admin.nav.invoicing'),
          icon: Receipt,
          badge: null
        },
        {
          key: 'clients',
          to: '/admin/clients',
          label: t('admin.nav.clients'),
          icon: Building2,
          badge: null
        },
        {
          key: 'vendors',
          to: '/admin/vendors',
          label: t('admin.nav.vendors'),
          icon: Briefcase,
          badge: null,
          badgeColor: undefined
        },
        {
          key: 'documents',
          to: '/admin/documents',
          label: language === 'id' ? 'Brankas Dokumen' : 'Documents Vault',
          icon: FolderOpen,
          badge: null
        }
      ]
    },
    {
      id: 'content',
      titleKey: 'admin.nav.contentPortfolio',
      items: [
        {
          key: 'services',
          to: '/admin/cms/services',
          label: t('admin.nav.servicesCatalog'),
          icon: Cpu,
          badge: null
        },
        {
          key: 'cms_projects',
          to: '/admin/cms/projects',
          label: t('admin.nav.caseStudies'),
          icon: FolderGit2,
          badge: null
        },
        {
          key: 'testimonials',
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
          key: 'settings',
          to: '/admin/settings',
          label: t('admin.nav.settings'),
          icon: Settings,
          badge: null
        },
        {
          key: 'rbac',
          to: '/admin/settings?tab=rbac',
          label: language === 'id' ? 'Akun & Hak Akses' : 'Accounts & RBAC',
          icon: Users,
          badge: 'RBAC',
          badgeColor: 'bg-[#E50914]/10 text-[#FF1E27] border border-[#E50914]/30 font-mono text-[9px] font-bold'
        }
      ]
    }
  ];

  // RBAC Filtered Sections: dynamically show only modules permitted for the current stakeholder role
  const filteredNavSections = useMemo(() => {
    return navSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => isAllowed(item.key))
      }))
      .filter(section => section.items.length > 0);
  }, [navSections, isAllowed]);

  const mobileNavItems = useMemo(() => {
    const preferredKeys = ['dashboard', 'inbox', 'crm', 'projects', 'invoicing'];
    const flat = filteredNavSections.flatMap(section => section.items);
    return preferredKeys
      .map(key => flat.find(item => item.key === key))
      .filter((item): item is NavItem => Boolean(item))
      .slice(0, 5);
  }, [filteredNavSections]);

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
    <div
      data-kapi-admin="true"
      className="h-screen w-full bg-[#090A0F] text-[#F8FAFC] flex flex-col md:flex-row selection:bg-[#E50914] selection:text-white font-sans antialiased overflow-hidden"
    >
      
      {/* Universal Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR */}
      {/* ------------------------------------------------------------- */}
      <aside 
        className={`hidden md:flex flex-col bg-[#111318] border-r border-white/[0.07] shrink-0 h-full z-30 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64 lg:w-72'
        }`}
      >
        
        {/* Brand Header */}
        <div className={`h-16 border-b border-white/[0.07] flex items-center bg-[#111318] transition-all ${
          sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          {!sidebarCollapsed ? (
            <>
              <Link to="/admin/dashboard" className="flex items-center gap-3 group overflow-hidden">
                <div className="h-8 px-2.5 rounded-lg bg-[#181B22] border border-white/10 flex items-center justify-center shrink-0 shadow-sm group-hover:border-[#E50914]/40 transition-colors">
                  <img src="/white.png" alt="Kapitech" className="h-3.5 w-auto object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="font-sans font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
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
                className="w-8 h-8 rounded-lg bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white border border-white/[0.07] transition-colors flex items-center justify-center shrink-0"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </>
          ) : (
            <Link 
              to="/admin/dashboard" 
              className="w-9 h-9 rounded-xl bg-[#181B22] border border-white/10 flex items-center justify-center shrink-0 shadow-sm hover:border-[#E50914]/40 hover:scale-105 transition-all p-1.5"
              title="Kapitech AMS Dashboard"
            >
              <img src="/favicon.png" alt="Kapitech" className="w-full h-full object-contain" />
            </Link>
          )}
        </div>

        {/* Navigation List - 4 Structured Sections Filtered by Dynamic RBAC */}
        <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar">
          {filteredNavSections.map((section) => (
            <div key={section.id} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="text-[11px] font-mono text-[#8A94A6] font-bold tracking-wider px-3 pt-2 pb-1 uppercase">
                  {t(section.titleKey)}
                </div>
              )}
              {sidebarCollapsed && (
                <div className="w-6 h-px bg-white/[0.07] mx-auto my-2" />
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
                        ? 'bg-[rgba(229,9,20,0.1)] text-white font-medium shadow-sm'
                        : 'text-[#8A94A6] hover:text-white hover:bg-white/[0.04]'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    {/* Linear-style Left Indicator Strip */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#E50914] rounded-r-full" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={16} className={active ? 'text-[#E50914] shrink-0' : 'text-[#8A94A6] group-hover:text-white shrink-0 transition-colors'} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge !== null && item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ml-auto shrink-0 ${
                        item.badgeColor || 'bg-[#181B22] text-[#8A94A6] border border-white/[0.07]'
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
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-[#8A94A6] hover:text-white hover:bg-white/[0.04] transition-all border border-white/[0.07]"
              >
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-emerald-400" />
                  <span>{t('admin.nav.viewSite')}</span>
                </div>
                <ExternalLink size={11} className="text-[#8A94A6]" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer: Admin Profile & Discrete Role Simulator Dropdown */}
        <div className="p-3 border-t border-white/[0.07] bg-[#111318] space-y-2.5">
          <div className={`flex items-center justify-between ${sidebarCollapsed ? 'flex-col gap-2' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#B80710] border border-white/10 flex items-center justify-center text-xs font-sans text-white font-bold shrink-0 shadow-sm">
                {adminInitials}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {adminDisplayName}
                  </div>
                  <div className="text-[10px] font-mono text-[#8A94A6] truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{adminUsername}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              title={t('admin.nav.logout')}
              className="p-2 flex items-center justify-center rounded-lg bg-[#181B22] hover:bg-red-950/40 text-[#8A94A6] hover:text-[#FF1E27] border border-white/[0.07] hover:border-[#E50914]/30 transition-all shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>

          {/* Active Stakeholder Role (Production Readonly / Dev Simulator) */}
          {!sidebarCollapsed && (
            <div className="pt-2 border-t border-white/[0.07]">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94A6] mb-1 px-0.5">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} className="text-[#E50914]" />
                  <span>{language === 'id' ? 'Hak Akses Peran' : 'Active Role'}</span>
                </span>
                <span className="text-[8px] px-1 py-0.2 rounded bg-[#181B22] border border-white/[0.07] text-[#E50914] font-bold">
                  {import.meta.env.DEV ? 'DEV SIM' : 'AUTH'}
                </span>
              </div>
              {import.meta.env.DEV ? (
                <select
                  value={rbacRole}
                  onChange={(e) => setRbacRole(e.target.value as StakeholderRole)}
                  className="w-full h-7 px-2 rounded-lg bg-[#181B22] text-white border border-white/[0.07] hover:border-[#8A94A6]/60 text-[11px] font-mono focus:outline-none focus:border-[#E50914] transition-colors cursor-pointer"
                  title="Select Stakeholder Role to switch RBAC permissions (DEV only)"
                >
                  <option value="executive">1. Stakeholder Executive (Full Access)</option>
                  <option value="pm">2. Project Manager</option>
                  <option value="finance">3. Financial Officer</option>
                  <option value="account_manager">4. Account Manager</option>
                  <option value="client_viewer">5. Client / Viewer</option>
                </select>
              ) : (
                <div className="w-full px-2 py-1 rounded-lg bg-[#181B22] text-zinc-200 border border-white/[0.07] text-[11px] font-mono truncate">
                  {roleMeta.title}
                </div>
              )}
            </div>
          )}
        </div>

      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE TOPBAR - Single, sleek, non-cluttered header */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-[#111318] border-b border-white/[0.07] sticky top-0 z-40 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] h-14">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#181B22] text-white border border-white/[0.07] hover:bg-[#21252F] active:scale-95 transition-all shadow-sm"
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
          <div className="flex items-center bg-[#181B22] border border-white/[0.07] rounded-lg p-0.5 font-mono text-[10px]">
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
            className="px-2.5 py-1.5 rounded-lg bg-[#181B22] border border-white/[0.07] text-[10px] font-mono font-bold text-emerald-400 hover:bg-[#21252F] transition-all min-h-[36px]"
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

          <div className="relative w-[300px] max-w-[85vw] bg-[#111318] border-r border-white/[0.07] h-[100dvh] flex flex-col justify-between z-50 shadow-[4px_0_30px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-left duration-200">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/[0.07] flex items-center justify-between bg-[#111318] shrink-0">
              <Link 
                to="/admin/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="h-8 px-2.5 rounded-lg bg-[#181B22] border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                  <img src="/white.png" alt="Kapitech" className="h-3.5 w-auto object-contain" />
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
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#181B22] text-[#8A94A6] hover:text-white border border-white/[0.07] active:scale-95 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Preferences Bar inside Drawer */}
            <div className="px-4 py-2.5 bg-[#181B22] border-b border-white/[0.07] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#8A94A6]">
                <span>{language === 'id' ? 'Bahasa:' : 'Lang:'}</span>
                <div className="flex items-center bg-[#111318] border border-white/[0.07] rounded-md p-0.5">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      language === 'en' ? 'bg-[#181B22] text-white shadow-sm border border-white/10' : 'text-[#8A94A6]'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('id')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      language === 'id' ? 'bg-[#181B22] text-white shadow-sm border border-white/10' : 'text-[#8A94A6]'
                    }`}
                  >
                    ID
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono text-[#8A94A6]">
                <span>{language === 'id' ? 'Valuta:' : 'Curr:'}</span>
                <div className="flex items-center bg-[#111318] border border-white/[0.07] rounded-md p-0.5">
                  <button
                    onClick={() => handleSwitchCurrency('IDR')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      currency === 'IDR' ? 'bg-[#181B22] text-emerald-400 shadow-sm border border-white/10' : 'text-[#8A94A6]'
                    }`}
                  >
                    IDR
                  </button>
                  <button
                    onClick={() => handleSwitchCurrency('USD')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      currency === 'USD' ? 'bg-[#181B22] text-emerald-400 shadow-sm border border-white/10' : 'text-[#8A94A6]'
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation List Filtered by Dynamic RBAC */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {filteredNavSections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <div className="text-[10px] font-mono text-[#8A94A6] font-bold tracking-wider px-3 pt-1 uppercase">
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
                            ? 'bg-[rgba(229,9,20,0.1)] text-white font-semibold shadow-sm' 
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
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor || 'bg-[#181B22] text-[#8A94A6] border border-white/[0.07]'}`}>
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
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono text-emerald-400 bg-[#181B22] hover:bg-[#21252F] border border-white/[0.07] min-h-[44px] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe size={15} />
                    <span>{t('admin.nav.viewSite')}</span>
                  </div>
                  <ExternalLink size={12} className="text-[#8A94A6]" />
                </Link>
              </div>

              {/* Mobile Role Selector (Production Readonly / Dev Simulator) */}
              <div className="pt-2">
                <div className="p-3 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94A6]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={11} className="text-[#E50914]" />
                      <span>{language === 'id' ? 'Hak Akses Peran' : 'Active Role'}</span>
                    </span>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-[#111318] border border-white/[0.07] text-[#E50914] font-bold">
                      {import.meta.env.DEV ? 'DEV SIM' : 'AUTH'}
                    </span>
                  </div>
                  {import.meta.env.DEV ? (
                    <select
                      value={rbacRole}
                      onChange={(e) => setRbacRole(e.target.value as StakeholderRole)}
                      className="w-full h-8 px-2 rounded-lg bg-[#111318] text-white border border-white/[0.07] text-xs font-mono focus:outline-none focus:border-[#E50914] cursor-pointer"
                    >
                      <option value="executive">1. Stakeholder Executive (Full Access)</option>
                      <option value="pm">2. Project Manager</option>
                      <option value="finance">3. Financial Officer</option>
                      <option value="account_manager">4. Account Manager</option>
                      <option value="client_viewer">5. Client / Viewer</option>
                    </select>
                  ) : (
                    <div className="w-full px-2.5 py-1.5 rounded-lg bg-[#111318] text-white border border-white/[0.07] text-xs font-mono truncate">
                      {roleMeta.title}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom session details */}
            <div className="p-3.5 border-t border-white/[0.07] bg-[#181B22] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#B80710] border border-white/10 flex items-center justify-center text-xs font-sans text-white font-bold shrink-0 shadow-sm">
                  {roleMeta.accountProfile.avatarLabel}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F8FAFC] truncate">{adminDisplayName}</div>
                  <div className="text-[10px] font-mono text-[#8A94A6] truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{adminUsername}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="px-3 py-2 min-h-[44px] rounded-xl bg-[#111318] hover:bg-red-950/50 border border-white/[0.07] hover:border-[#E50914]/30 text-[#8A94A6] hover:text-[#FF1E27] text-xs font-mono flex items-center gap-1.5 shrink-0 transition-all"
              >
                <LogOut size={14} />
                <span>{t('admin.nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#090A0F] custom-scrollbar pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0">

        {/* Mobile-first top bar */}
        <header className="md:hidden sticky top-0 z-40 h-14 px-3 border-b border-white/[0.07] bg-[#090A0F]/95 backdrop-blur-xl flex items-center justify-between shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation"
            className="w-10 h-10 rounded-xl bg-[#111318] border border-white/[0.07] text-[#8A94A6] flex items-center justify-center active:scale-95"
          >
            <Menu size={18} />
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="h-8 px-2 rounded-lg bg-[#181B22] border border-white/10 flex items-center justify-center">
              <img src="/white.png" alt="Kapitech" className="h-3.5 w-auto object-contain" />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-[11px] font-bold text-white tracking-tight flex items-center gap-1">
                <span>KAPITECH</span>
                <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-[#E50914]/10 text-[#FF1E27] border border-[#E50914]/30">AMS</span>
              </div>
              <div className="text-[8px] font-mono text-[#64748B] truncate max-w-[9rem]">
                {activeItemLabel}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Search AMS"
              className="w-10 h-10 rounded-xl bg-[#111318] border border-white/[0.07] text-[#8A94A6] flex items-center justify-center active:scale-95"
            >
              <Search size={17} />
            </button>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Notifications"
              className="relative w-10 h-10 rounded-xl bg-[#111318] border border-white/[0.07] text-[#8A94A6] flex items-center justify-center active:scale-95"
            >
              <Bell size={17} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#E50914] text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </header>
        
        {/* Sticky Desktop Topbar Header: Clean & Minimal */}
        <header className="hidden md:flex h-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.07] bg-[#090A0F]/95 backdrop-blur-md sticky top-0 z-30 items-center justify-between shrink-0 shadow-[0_1px_0_rgba(255,255,255,0.02),0_4px_24px_rgba(0,0,0,0.6)]">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-sans text-[#8A94A6]">
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-8 h-8 rounded-lg bg-[#111318] hover:bg-[#181B22] text-[#8A94A6] hover:text-white border border-white/[0.07] hover:border-[#E50914]/30 transition-all mr-1.5 flex items-center justify-center shrink-0 shadow-sm"
                title="Expand sidebar"
              >
                <PanelLeftOpen size={15} />
              </button>
            )}
            <span className="font-semibold text-white">Kapitech AMS</span>
            <ChevronRight size={13} className="text-[#8A94A6]" />
            <span className="text-[#A1A1AA] font-medium truncate">{activeItemLabel}</span>
          </div>

          {/* Minimalist Global Search Bar */}
          <div className="relative w-64 lg:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6]" />
            <input
              type="text"
              onClick={() => setCommandPaletteOpen(true)}
              readOnly
              placeholder={t('admin.dash.searchPlaceholder') || "Search projects, clients, tasks (⌘K)..."}
              className="w-full h-8 pl-8 pr-12 text-xs bg-[#111318] text-white placeholder-[#8A94A6] rounded-lg border border-white/[0.07] hover:border-white/20 focus:outline-none focus:border-[#E50914] transition-colors cursor-pointer"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#8A94A6] bg-[#181B22] border border-white/[0.07] px-1.5 py-0.5 rounded pointer-events-none">
              ⌘K
            </kbd>
          </div>

          {/* Topbar Controls Container */}
          <div className="flex items-center gap-3 text-xs font-sans text-[#8A94A6]">
            {/* Currency Switcher (IDR / USD) */}
            <div className="flex items-center bg-[#111318] border border-white/[0.07] rounded-lg p-[3px] font-mono text-xs">
              <button
                onClick={() => handleSwitchCurrency('IDR')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  currency === 'IDR'
                    ? 'bg-[#181B22] text-emerald-400 shadow-sm border border-white/10'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                IDR
              </button>
              <button
                onClick={() => handleSwitchCurrency('USD')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  currency === 'USD'
                    ? 'bg-[#181B22] text-emerald-400 shadow-sm border border-white/10'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                USD
              </button>
            </div>

            {/* Language Switcher (EN / ID) */}
            <div className="flex items-center bg-[#111318] border border-white/[0.07] rounded-lg p-[3px] font-mono text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-[#181B22] text-white shadow-sm border border-white/10'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  language === 'id'
                    ? 'bg-[#181B22] text-white shadow-sm border border-white/10'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                ID
              </button>
            </div>

            {/* Live Studio Clock */}
            <div className="flex items-center gap-1.5 bg-[#111318] px-2.5 py-1.5 rounded-lg border border-white/[0.07] text-[11px] font-mono text-[#8A94A6]">
              <Clock size={12} className="text-[#FF1E27]" />
              <span className="text-white font-medium">{currentTime || 'Jakarta WIB'}</span>
            </div>

            {/* Live Notification Center */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-lg bg-[#111318] border border-white/[0.07] hover:border-white/20 transition-colors ${
                  unreadNotificationsCount > 0 ? 'text-white' : 'text-[#8A94A6]'
                }`}
                title="Notifications"
              >
                <Bell size={14} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E50914] text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#111318]/95 backdrop-blur-xl border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3.5 border-b border-white/[0.07] flex items-center justify-between bg-[#181B22]/60">
                    <div className="flex items-center gap-2">
                      <Bell size={14} className="text-[#FF1E27]" />
                      <span className="text-xs font-bold text-white">Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#E50914]/20 text-[#FF1E27] font-bold">
                          {unreadNotificationsCount} unread
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-mono text-[#8A94A6] hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck size={12} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs font-mono text-[#8A94A6]">
                        No notifications.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors hover:bg-white/[0.02] ${
                            !n.read ? 'bg-[#181B22]/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-white">{n.title}</span>
                            <span className="text-[9px] font-mono text-[#8A94A6] shrink-0">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[#8A94A6] text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                          {n.link && (
                            <Link
                              to={n.link}
                              onClick={() => setNotificationsOpen(false)}
                              className="text-[10px] font-mono text-[#FF1E27] hover:underline mt-1.5 inline-block"
                            >
                              View details →
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Public Domain Switcher */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111318] border border-white/[0.07] hover:border-white/20 text-[11px] font-mono text-[#8A94A6] hover:text-white transition-colors"
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

        {/* Mobile-first bottom navigation */}
        <nav className="md:hidden fixed left-0 right-0 bottom-0 z-40 border-t border-white/[0.07] bg-[#090A0F]/95 backdrop-blur-xl px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-5 gap-1 max-w-xl mx-auto">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.to);
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`relative min-h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[9px] font-mono ${active ? 'bg-[#E50914]/10 text-white' : 'text-[#8A94A6]'}`}
                >
                  <Icon size={17} className={active ? 'text-[#E50914]' : ''} />
                  <span className="truncate max-w-full px-1">{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && item.key === 'inbox' && (
                    <span className="absolute top-1 right-1/4 min-w-3.5 h-3.5 rounded-full bg-[#E50914] text-white text-[8px] font-bold flex items-center justify-center px-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

      </main>

    </div>
  );
};
export default AdminLayout;
