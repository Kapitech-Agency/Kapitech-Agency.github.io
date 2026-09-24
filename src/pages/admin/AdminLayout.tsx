import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { UntitledIcon, UntitledIconName } from '../../components/ui/UntitledIcon';import { getAdminSession, logoutAdmin } from '../../lib/adminAuth';
import { useLanguage } from '../../lib/LanguageContext';
import { CommandPalette } from '../../components/admin/CommandPalette';
import { AdminNotificationCenter } from '../../components/admin/AdminNotificationCenter';
import { useRbacRole } from '../../lib/rbacEngine';



const U = (name: UntitledIconName) => (props: { size?: number; className?: string }) => (
  <UntitledIcon name={name} size={props.size ?? 18} className={props.className} />
);
const AmsChevron = U('chevron');
const AmsMenu = U('menu');
const AmsClose = U('close');

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
          icon: U('users'),
          badge: null
        },
        {
          key: 'proposals',
          to: '/admin/proposals',
          label: language === 'id' ? 'Proposal & Penawaran' : 'Proposals & Quotes',
          icon: U('receipt'),
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
          icon: U('bank'),
          badge: null
        },
        {
          key: 'clients',
          to: '/admin/clients',
          label: t('admin.nav.clients'),
          icon: U('users'),
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
          label: language === 'id' ? 'Pusat Persetujuan' : 'Approval Center',
          icon: U('shield'),
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
          icon: U('layers'),
          badge: null
        },
        {
          key: 'cms_projects',
          to: '/admin/cms/projects',
          label: t('admin.nav.caseStudies'),
          icon: U('layers'),
          badge: null
        },
        {
          key: 'testimonials',
          to: '/admin/cms/testimonials',
          label: t('admin.cms.testiTitle'),
          icon: U('users'),
          badge: null
        },
        {
          key: 'documents',
          to: '/admin/documents',
          label: language === 'id' ? 'Dokumen' : 'Documents',
          icon: U('file'),
          badge: null
        },
        {
          key: 'timelogs',
          to: '/admin/time-logs',
          label: language === 'id' ? 'Pelacakan Waktu' : 'Time Tracking',
          icon: U('clock'),
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
    <div className="h-screen w-full bg-bg text-fg flex flex-col md:flex-row selection:bg-accent selection:text-fg font-sans antialiased overflow-hidden ams-shell">
      
      {/* Universal Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR */}
      {/* ------------------------------------------------------------- */}
      <aside 
        className={`hidden md:flex flex-col bg-panel border-r border-line shrink-0 h-full z-30 transition-colors duration-150 ${
          sidebarCollapsed ? 'w-[64px]' : 'w-[220px]'
        }`}
      >
        
        {/* Brand Header */}
        <div className={`h-[52px] border-b border-line flex items-center bg-panel transition-all ${
          sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          {!sidebarCollapsed ? (
            <>
              <Link to="/admin/dashboard" className="flex items-center gap-3 group overflow-hidden">
                <div className="h-8 px-2.5 rounded-lg bg-bg border border-line flex items-center justify-center shrink-0  group-hover:border-accent/40 transition-colors">
                  <img src="/white.png" alt="Kapitech" className="h-3.5 w-auto object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="font-sans font-bold text-fg text-sm tracking-tight flex items-center gap-1.5">
                    <span>KAPITECH</span>
                    <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-accent/10 text-accent-text border border-accent/30 font-semibold">
                      AMS
                    </span>
                  </div>
                  <p className="text-[10px] font-sans text-muted -mt-0.5 truncate">Agency Management System</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="w-8 h-8 rounded-lg bg-bg hover:bg-panel text-muted hover:text-fg border border-line transition-colors flex items-center justify-center shrink-0"
                title="Collapse sidebar"
              >
                <AmsChevron size={15} />
              </button>
            </>
          ) : (
            <Link 
              to="/admin/dashboard" 
              className="w-9 h-9 rounded-xl bg-bg border border-line flex items-center justify-center shrink-0 shadow-sm hover:border-accent/40 transition-all p-1.5"
              title="Kapitech AMS Dashboard"
            >
              <img src="/favicon.png" alt="Kapitech" className="w-full h-full object-contain" />
            </Link>
          )}
        </div>

        {/* Navigation List - 4 Structured Sections Filtered by Dynamic RBAC */}
        <div className="flex-1 px-2 py-3 space-y-3 overflow-y-auto custom-scrollbar">
          {filteredNavSections.map((section) => (
            <div key={section.id} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="text-[11px] font-sans text-muted font-bold tracking-wider px-3 pt-2 pb-1 uppercase">
                  {t(section.titleKey)}
                </div>
              )}
              {sidebarCollapsed && (
                <div className="w-5 h-px bg-white/[0.07] mx-auto my-3" />
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`relative flex items-center justify-between px-2.5 py-2 rounded-control text-[13px] font-sans transition-colors duration-150 group ${
                      active
                        ? 'bg-accent/15 text-fg font-medium shadow-sm'
                        : 'text-muted hover:text-fg hover:bg-white/[0.04]'
                    } ${sidebarCollapsed ? 'w-10 h-10 mx-auto justify-center px-0 py-0' : ''}`}
                  >
                    {/* Linear-style Left Indicator Strip */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-accent rounded-r-full" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={16} className={active ? 'text-accent-text shrink-0' : 'text-muted group-hover:text-fg shrink-0 transition-colors'} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge !== null && item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-badge text-xs font-semibold ml-auto shrink-0 ${
                        item.badgeColor || 'bg-bg text-muted border border-line'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

        </div>

        {/* Footer: Admin Profile & Discrete Role Simulator Dropdown */}
        <div className="p-2.5 border-t border-line bg-panel space-y-2.5">
          <div className={`flex items-center justify-between ${sidebarCollapsed ? 'flex-col gap-2.5' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-accent border border-line flex items-center justify-center text-xs font-sans text-fg font-bold shrink-0 shadow-sm">
                {roleMeta.accountProfile.avatarLabel}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-fg truncate">
                    {roleMeta.accountProfile.displayName}
                  </div>
                  <div className="text-[10px] font-sans text-muted truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{roleMeta.accountProfile.accountId}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              title={t('admin.nav.logout')}
              className="p-2 flex items-center justify-center rounded-lg bg-bg hover:bg-danger/10 text-muted hover:text-accent-text border border-line hover:border-accent/30 transition-all shrink-0"
            >
              <UntitledIcon name="logout" size={15} />
            </button>
          </div>

        </div>

      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE TOPBAR - Single, sleek, non-cluttered header */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-panel border-b border-line sticky top-0 z-40 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] h-14">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-bg text-fg border border-line hover:bg-panel active:scale-95 transition-all shadow-sm"
          >
            <AmsMenu size={20} />
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-fg font-bold text-xs shadow-none shrink-0">
              K
            </div>
            <div className="min-w-0">
              <span className="font-sans font-bold text-fg text-xs tracking-tight block truncate">KAPITECH AMS</span>
              <span className="text-[9px] font-sans text-muted block truncate -mt-0.5">{activeItemLabel}</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center">
          <AdminNotificationCenter />
        </div>
      </div>

      {/* Mobile Drawer Overlay & U('menu') (Global standard sliding drawer from left) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-[300px] max-w-[85vw] bg-panel border-r border-line h-[100dvh] flex flex-col justify-between z-50 shadow-[4px_0_30px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-left duration-200">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-line flex items-center justify-between bg-panel shrink-0">
              <Link 
                to="/admin/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="h-8 px-2.5 rounded-lg bg-bg border border-line flex items-center justify-center shrink-0 shadow-sm">
                  <img src="/white.png" alt="Kapitech" className="h-3.5 w-auto object-contain" />
                </div>
                <div>
                  <div className="font-sans font-bold text-fg text-sm tracking-tight flex items-center gap-1.5">
                    <span>KAPITECH</span>
                    <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-accent/10 text-accent-text border border-accent/30 font-semibold">
                      AMS
                    </span>
                  </div>
                  <p className="text-[10px] font-sans text-muted -mt-0.5">Agency Management System</p>
                </div>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-bg text-muted hover:text-fg border border-line active:scale-95 transition-all"
              >
                <AmsClose size={18} />
              </button>
            </div>


            {/* Scrollable Navigation List Filtered by Dynamic RBAC */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {filteredNavSections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <div className="text-[10px] font-sans text-muted font-bold tracking-wider px-3 pt-1 uppercase">
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
                            ? 'bg-accent/15 text-fg font-semibold shadow-sm' 
                            : 'text-muted hover:text-fg hover:bg-white/[0.04]'
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-accent rounded-r-full" />
                        )}
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon size={17} className={active ? 'text-accent-text shrink-0' : 'text-muted shrink-0'} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor || 'bg-bg text-muted border border-line'}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}

            </div>

            {/* Bottom session details */}
            <div className="p-3.5 border-t border-line bg-bg flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-accent border border-line flex items-center justify-center text-xs font-sans text-fg font-bold shrink-0 shadow-sm">
                  {roleMeta.accountProfile.avatarLabel}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-fg truncate">{roleMeta.accountProfile.displayName}</div>
                  <div className="text-[10px] font-sans text-muted truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{roleMeta.accountProfile.accountId}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="px-3 py-2 min-h-[44px] rounded-xl bg-panel hover:bg-red-950/50 border border-line hover:border-accent/30 text-muted hover:text-accent-text text-xs font-sans flex items-center gap-1.5 shrink-0 transition-all"
              >
                <UntitledIcon name="logout" size={14} />
                <span>{t('admin.nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA & DESKTOP STICKY TOPBAR */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-bg custom-scrollbar">
        
        {/* Sticky desktop top bar */}
        <header className="hidden md:flex h-[52px] px-6 border-b border-line bg-bg sticky top-0 z-30 items-center justify-end shrink-0">
          <AdminNotificationCenter />
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
