import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { UntitledIcon, UntitledIconName } from '../../components/ui/UntitledIcon';import { getAdminSession, logoutAdmin } from '../../lib/adminAuth';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, setActiveCurrency, CurrencyCode, CURRENCY_EVENT } from '../../lib/currency';
import { CommandPalette } from '../../components/admin/CommandPalette';
import { AdminNotificationCenter } from '../../components/admin/AdminNotificationCenter';
import { useRbacRole, StakeholderRole, ROLE_DEFINITIONS } from '../../lib/rbacEngine';



const U = (name: UntitledIconName) => (props: { size?: number; className?: string }) => (
  <UntitledIcon name={name} size={props.size ?? 18} className={props.className} />
);
const AmsChevron = U('chevron');
const AmsHome = U('home');
const AmsSettings = U('settings');
const AmsCheck = U('check');
const AmsMenu = U('menu');
const AmsClose = U('close');
const AmsSearch = U('search');
const AmsCalendar = U('file');

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currency, setCurrencyState] = useState<CurrencyCode>(getActiveCurrency());

  // Dynamic RBAC Permission Engine
  const { role: rbacRole, setRole: setRbacRole, roleMeta, isAllowed } = useRbacRole(
    session?.user?.stakeholderType,
    session?.user?.division,
    session?.user?.role,
    session?.user?.permissions
  );

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

  // 4 Logical Sections (with Consolidated Single U('settings') U('menu'))
  const navSections: NavSection[] = [
    {
      id: 'core',
      titleKey: 'admin.nav.coreOperations',
      items: [
        {
          key: 'dashboard',
          to: '/admin/dashboard',
          label: t('admin.nav.dashboard'),
          icon: U('home'),
          badge: null
        },
        {
          key: 'inbox',
          to: '/admin/inbox',
          label: t('admin.nav.inbox'),
          icon: U('inbox'),
          badge: null
        },
        {
          key: 'crm',
          to: '/admin/crm',
          label: t('admin.nav.crm'),
          icon: U('briefcase'),
          badge: null
        },
        {
          key: 'proposals',
          to: '/admin/proposals',
          label: language === 'id' ? 'Proposal & Quotation' : 'Proposals & Quotes',
          icon: U('file'),
          badge: null
        },
        {
          key: 'projects',
          to: '/admin/projects',
          label: t('admin.nav.projects'),
          icon: U('briefcase'),
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
          icon: U('file'),
          badge: null
        },
        {
          key: 'clients',
          to: '/admin/clients',
          label: t('admin.nav.clients'),
          icon: U('briefcase'),
          badge: null
        },
        {
          key: 'vendors',
          to: '/admin/vendors',
          label: t('admin.nav.vendors'),
          icon: U('briefcase'),
          badge: null
        },
        {
          key: 'approvals',
          to: '/admin/approvals',
          label: language === 'id' ? 'Approval Center' : 'Approval Center',
          icon: U('check'),
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
          icon: U('file'),
          badge: null
        },
        {
          key: 'cms_projects',
          to: '/admin/cms/projects',
          label: t('admin.nav.caseStudies'),
          icon: U('file'),
          badge: null
        },
        {
          key: 'testimonials',
          to: '/admin/cms/testimonials',
          label: t('admin.cms.testiTitle'),
          icon: U('file'),
          badge: null
        },
        {
          key: 'documents',
          to: '/admin/documents',
          label: language === 'id' ? 'Documents' : 'Documents',
          icon: U('file'),
          badge: null
        },
        {
          key: 'timelogs',
          to: '/admin/time-logs',
          label: language === 'id' ? 'Time Tracking' : 'Time Tracking',
          icon: U('file'),
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
          icon: U('settings'),
          badge: null
        },
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
    <div className="h-screen w-full bg-[#090A0F] text-[#F8FAFC] flex flex-col md:flex-row selection:bg-[#E50914] selection:text-white font-sans antialiased overflow-hidden ams-shell">
      
      {/* Universal Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR */}
      {/* ------------------------------------------------------------- */}
      <aside 
        className={`hidden md:flex flex-col bg-[#111318] border-r border-white/[0.07] shrink-0 h-full z-30 transition-colors duration-150 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[236px]'
        }`}
      >
        
        {/* Brand Header */}
        <div className={`h-[60px] border-b border-white/[0.07] flex items-center bg-[#111318] transition-all ${
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
                <AmsChevron size={15} />
              </button>
            </>
          ) : (
            <Link 
              to="/admin/dashboard" 
              className="w-9 h-9 rounded-xl bg-[#181B22] border border-white/10 flex items-center justify-center shrink-0 shadow-sm hover:border-[#E50914]/40 transition-all p-1.5"
              title="Kapitech AMS Dashboard"
            >
              <img src="/favicon.png" alt="Kapitech" className="w-full h-full object-contain" />
            </Link>
          )}
        </div>

        {/* Navigation List - 4 Structured Sections Filtered by Dynamic RBAC */}
        <div className="flex-1 px-2.5 py-3 space-y-3 overflow-y-auto custom-scrollbar">
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
                  <AmsHome size={14} className="text-emerald-400" />
                  <span>{t('admin.nav.viewSite')}</span>
                </div>
                <AmsChevron size={11} className="text-[#8A94A6]" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer: Admin Profile & Discrete Role Simulator Dropdown */}
        <div className="p-3 border-t border-white/[0.07] bg-[#111318] space-y-2.5">
          <div className={`flex items-center justify-between ${sidebarCollapsed ? 'flex-col gap-2' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#E50914] border border-white/10 flex items-center justify-center text-xs font-sans text-white font-bold shrink-0 shadow-sm">
                {roleMeta.accountProfile.avatarLabel}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {roleMeta.accountProfile.displayName}
                  </div>
                  <div className="text-[10px] font-mono text-[#8A94A6] truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{roleMeta.accountProfile.accountId}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              title={t('admin.nav.logout')}
              className="p-2 flex items-center justify-center rounded-lg bg-[#181B22] hover:bg-red-950/40 text-[#8A94A6] hover:text-[#FF1E27] border border-white/[0.07] hover:border-[#E50914]/30 transition-all shrink-0"
            >
              <AmsSettings size={14} />
            </button>
          </div>

          {/* Active Stakeholder Role Selector (Dynamic RBAC Engine) */}
          {!sidebarCollapsed && (
            <div className="pt-2 border-t border-white/[0.07]">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94A6] mb-1 px-0.5">
                <span className="flex items-center gap-1">
                  <AmsCheck size={11} className="text-[#E50914]" />
                  <span>{language === 'id' ? 'Hak Akses Peran' : 'Active Role'}</span>
                </span>
                <span className="text-[8px] px-1 py-0.5 rounded bg-[#181B22] border border-white/[0.07] text-[#E50914] font-bold">LOCKED</span>
              </div>
              <select
                value={rbacRole}
                onChange={(e) => setRbacRole(e.target.value as StakeholderRole)}
                disabled={Boolean(session?.user?.stakeholderType)}
                aria-disabled={Boolean(session?.user?.stakeholderType)}
                className="w-full h-8 px-2 rounded-lg bg-[#181B22] text-white border border-white/[0.07] text-[11px] font-mono focus:outline-none focus:border-[#E50914] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                title={session?.user?.stakeholderType ? "Role is locked by the authenticated RBAC policy" : "Development-only role simulator"}
              >
                <option value="executive">1. Stakeholder Executive (Full Access)</option>
                <option value="pm">2. Project Manager</option>
                <option value="finance">3. Financial Officer</option>
                <option value="account_manager">4. Account Manager</option>
                <option value="client_viewer">5. Client / Viewer</option>
              </select>
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
            <AmsMenu size={20} />
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E50914] flex items-center justify-center text-white font-bold text-xs shadow-none shrink-0">
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

      {/* Mobile Drawer Overlay & U('menu') (Global standard sliding drawer from left) */}
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
                <AmsClose size={18} />
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
                    <AmsHome size={15} />
                    <span>{t('admin.nav.viewSite')}</span>
                  </div>
                  <AmsChevron size={12} className="text-[#8A94A6]" />
                </Link>
              </div>

              {/* Mobile Role Selector Dropdown */}
              <div className="pt-2">
                <div className="p-3 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94A6]">
                    <span className="flex items-center gap-1">
                      <AmsCheck size={11} className="text-[#E50914]" />
                      <span>{language === 'id' ? 'Peran Aktif' : 'Active Role'}</span>
                    </span>
                    <span className="text-[8px] px-1 py-0.5 rounded bg-[#111318] border border-white/[0.07] text-[#E50914] font-bold">LOCKED</span>
                  </div>
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
                </div>
              </div>
            </div>

            {/* Bottom session details */}
            <div className="p-3.5 border-t border-white/[0.07] bg-[#181B22] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#E50914] border border-white/10 flex items-center justify-center text-xs font-sans text-white font-bold shrink-0 shadow-sm">
                  {roleMeta.accountProfile.avatarLabel}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F8FAFC] truncate">{roleMeta.accountProfile.displayName}</div>
                  <div className="text-[10px] font-mono text-[#8A94A6] truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{roleMeta.accountProfile.accountId}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="px-3 py-2 min-h-[44px] rounded-xl bg-[#111318] hover:bg-red-950/50 border border-white/[0.07] hover:border-[#E50914]/30 text-[#8A94A6] hover:text-[#FF1E27] text-xs font-mono flex items-center gap-1.5 shrink-0 transition-all"
              >
                <AmsSettings size={14} />
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
        
        {/* Sticky Desktop Topbar Header: Clean & Minimal */}
        <header className="hidden md:flex h-[60px] px-4 sm:px-5 lg:px-6 border-b border-white/[0.07] bg-[#090A0F]/95 backdrop-blur-md sticky top-0 z-30 items-center justify-between shrink-0 shadow-[0_1px_0_rgba(255,255,255,0.02),0_4px_24px_rgba(0,0,0,0.6)]">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-sans text-[#8A94A6]">
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-8 h-8 rounded-lg bg-[#111318] hover:bg-[#181B22] text-[#8A94A6] hover:text-white border border-white/[0.07] hover:border-[#E50914]/30 transition-all mr-1.5 flex items-center justify-center shrink-0 shadow-sm"
                title="Expand sidebar"
              >
                <AmsChevron size={15} />
              </button>
            )}
            <span className="font-semibold text-white">Kapitech AMS</span>
            <AmsChevron size={13} className="text-[#8A94A6]" />
            <span className="text-[#A1A1AA] font-medium truncate">{activeItemLabel}</span>
          </div>

          {/* Minimalist Global U('search') Bar */}
          <div className="relative w-64 lg:w-80">
            <AmsSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6]" />
            <input
              type="text"
              onClick={() => setCommandPaletteOpen(true)}
              readOnly
              placeholder={t('admin.dash.searchPlaceholder') || "U('search') projects, clients, tasks (⌘K)..."}
              className="w-full h-8 pl-8 pr-12 text-xs bg-[#111318] text-white placeholder-[#8A94A6] rounded-lg border border-white/[0.07] hover:border-white/20 focus:outline-none focus:border-[#E50914] transition-colors cursor-pointer"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#8A94A6] bg-[#181B22] border border-white/[0.07] px-1.5 py-0.5 rounded pointer-events-none">
              ⌘K
            </kbd>
          </div>

          {/* Topbar Controls Container */}
          <div className="flex items-center gap-2 text-xs font-sans text-[#8A94A6]">
            {/* Notifications */}\n            <AdminNotificationCenter />\n\n            {/* Currency Switcher (IDR / USD) */}
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

            {/* Live Studio U('calendar') */}
            <div className="flex items-center gap-1.5 bg-[#111318] px-2.5 py-1.5 rounded-lg border border-white/[0.07] text-[11px] font-mono text-[#8A94A6]">
              <AmsCalendar size={12} className="text-[#FF1E27]" />
              <span className="text-white font-medium">{currentTime || 'Jakarta WIB'}</span>
            </div>

            {/* Public Domain Switcher */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111318] border border-white/[0.07] hover:border-white/20 text-[11px] font-mono text-[#8A94A6] hover:text-white transition-colors"
            >
              <span>kapitech.id</span>
              <AmsChevron size={10} />
            </Link>
          </div>
        </header>

        {/* View Outlet */}
        <div className="flex-1 p-4 sm:p-5 lg:p-6 w-full max-w-[1560px] mx-auto">
          <Outlet />
        </div>

      </main>

    </div>
  );
};
export default AdminLayout;
