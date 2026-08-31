import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  Briefcase, 
  Receipt, 
  Layers, 
  Users, 
  FolderKanban, 
  Quote, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  Clock, 
  ChevronRight,
  ChevronDown,
  Globe,
  Search,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  SearchCode,
  FileCode2,
  PenTool,
  Cpu,
  BarChart3
} from 'lucide-react';
import { getAdminSession, logoutAdmin } from '../../lib/adminAuth';
import { subscribeToInbox, ContactSubmission } from '../../lib/submissions';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, setActiveCurrency, CurrencyCode, CURRENCY_EVENT } from '../../lib/currency';
import { CommandPalette } from '../../components/admin/CommandPalette';

export const AdminLayout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const session = getAdminSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currency, setCurrencyState] = useState<CurrencyCode>(getActiveCurrency());

  useEffect(() => {
    // Clock in Asia/Jakarta timezone
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

  // Listen to currency changes
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

  // Listen to command palette open event
  useEffect(() => {
    const handleOpenCmd = () => setCommandPaletteOpen(true);
    window.addEventListener('open_command_palette', handleOpenCmd);
    return () => window.removeEventListener('open_command_palette', handleOpenCmd);
  }, []);

  const handleSwitchCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    setActiveCurrency(c);
  };

  // Listen to unread submissions count in real time
  useEffect(() => {
    const unsub = subscribeToInbox((items: ContactSubmission[]) => {
      const newItems = items.filter(i => i.status === 'new').length;
      setUnreadCount(newItems);
    });
    return () => unsub();
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm(t('admin.nav.logoutConfirm'))) {
      logoutAdmin();
      navigate('/admin/login', { replace: true });
    }
  };

  const navLinks = [
    {
      to: '/admin/dashboard',
      label: t('admin.nav.dashboard'),
      icon: LayoutDashboard,
      badge: null,
      section: 'main'
    },
    {
      to: '/admin/projects',
      label: t('admin.nav.projects'),
      icon: Layers,
      badge: null,
      section: 'main'
    },
    {
      to: '/admin/invoicing',
      label: t('admin.nav.invoicing'),
      icon: Receipt,
      badge: null,
      section: 'main'
    },
    {
      to: '/admin/crm',
      label: t('admin.nav.crm'),
      icon: BarChart3,
      badge: currency,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold font-mono',
      section: 'main'
    },
    {
      to: '/admin/clients',
      label: t('admin.nav.clients'),
      icon: Users,
      badge: null,
      section: 'main'
    },
    {
      to: '/admin/inbox',
      label: t('admin.nav.inbox'),
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'bg-[#E60023] text-white font-bold animate-pulse',
      section: 'main'
    },
    {
      to: '/admin/cms/projects',
      label: t('admin.nav.cmsProjects'),
      icon: FolderKanban,
      badge: null,
      section: 'cms'
    },
    {
      to: '/admin/settings',
      label: t('admin.nav.settings'),
      icon: Settings,
      badge: null,
      section: 'system'
    }
  ];

  const serviceSubLinks = [
    {
      to: '/admin/cms/services',
      label: language === 'id' ? 'Optimasi SEO' : 'SEO Optimization',
      icon: SearchCode,
      tag: 'Rank & CWV'
    },
    {
      to: '/admin/cms/services',
      label: language === 'id' ? 'Strategi Konten' : 'Content Strategy',
      icon: PenTool,
      tag: 'Copy & AI'
    },
    {
      to: '/admin/cms/services',
      label: language === 'id' ? 'Rekayasa Web' : 'Web Development',
      icon: FileCode2,
      tag: 'Next.js & API'
    },
    {
      to: '/admin/cms/services',
      label: language === 'id' ? 'Desain UI/UX' : 'UI/UX Design',
      icon: Sparkles,
      tag: 'Figma System'
    }
  ];

  const currentNav = navLinks.find(link => location.pathname === link.to || (link.to !== '/admin/dashboard' && location.pathname.startsWith(link.to)));

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F8FAFC] flex flex-col md:flex-row selection:bg-[#E60023] selection:text-white font-sans antialiased">
      
      {/* Universal Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR (COLUMN A) */}
      {/* ------------------------------------------------------------- */}
      <aside 
        className={`hidden md:flex flex-col bg-[#08090A] border-r border-[#262930] shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64 lg:w-72'
        }`}
      >
        
        {/* Brand Header: Exactly h-16 aligned with main header */}
        <div className="h-16 px-5 border-b border-[#262930] flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E60023] to-[#FF1F3D] flex items-center justify-center text-white font-bold font-sans shadow-lg shadow-[#E60023]/25 text-sm shrink-0">
              K
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-sans font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                  <span>KAPITECH</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#E60023]/15 text-[#FF1F3D] border border-[#E60023]/30 font-semibold">
                    AMS
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[#8A909D] -mt-0.5 truncate">Agency Management System</p>
              </div>
            )}
          </Link>
        </div>

        {/* Universal Command Search Input */}
        <div className="px-3.5 pt-4 pb-2">
          {sidebarCollapsed ? (
            <button
              onClick={() => setCommandPaletteOpen(true)}
              title={language === 'id' ? 'Cari (Cmd + K)' : 'Search (Cmd + K)'}
              className="w-full h-10 rounded-xl bg-[#121418] hover:bg-[#16181D] border border-[#262930] flex items-center justify-center text-[#8A909D] hover:text-white transition-colors"
            >
              <Search size={16} />
            </button>
          ) : (
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full px-3 py-2 rounded-xl bg-[#121418] hover:bg-[#16181D] border border-[#262930] text-xs font-sans text-[#8A909D] hover:text-white flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-[#5C626E] group-hover:text-[#FF1F3D] transition-colors" />
                <span>{language === 'id' ? 'Cari cepat...' : 'Quick search...'}</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1E2128] text-[10px] font-mono text-[#8A909D]">
                <Command size={10} />
                <span>K</span>
              </div>
            </button>
          )}
        </div>

        {/* Navigation List with Strict Grouping */}
        <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* Main Navigation */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <div className="text-[10px] font-mono text-[#5C626E] uppercase tracking-wider px-3 mb-1.5 font-semibold">
                {t('admin.nav.mainMenu')}
              </div>
            )}
            
            {/* Overview */}
            {navLinks.filter(i => i.section === 'main').map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-sans transition-all duration-150 ${
                    isActive
                      ? 'bg-[#E60023] text-white font-semibold shadow-lg shadow-[#E60023]/25'
                      : 'text-[#8A909D] hover:text-white hover:bg-[#121418]'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-[#8A909D]'} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-[#1E2128] text-[#8A909D]'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Services Dropdown Accordion */}
            <div className="pt-1">
              {!sidebarCollapsed ? (
                <div className="space-y-1">
                  <button
                    onClick={() => setServicesExpanded(!servicesExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans text-[#8A909D] hover:text-white hover:bg-[#121418] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Cpu size={16} className="text-[#8A909D]" />
                      <span>{language === 'id' ? 'Layanan Agensi' : 'Services (SEO/Dev)'}</span>
                    </div>
                    <ChevronDown size={14} className={`text-[#5C626E] transition-transform duration-200 ${servicesExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {servicesExpanded && (
                    <div className="pl-4 pr-1 space-y-1 pt-1 border-l border-[#262930] ml-4">
                      {serviceSubLinks.map((sub, idx) => {
                        const SubIcon = sub.icon;
                        return (
                          <Link
                            key={idx}
                            to={sub.to}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#8A909D] hover:text-white hover:bg-[#121418] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <SubIcon size={13} className="text-[#FF1F3D]" />
                              <span className="text-[11px]">{sub.label}</span>
                            </div>
                            <span className="text-[9px] font-mono text-[#5C626E]">{sub.tag}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* CMS & System Links */}
            <div className="pt-2">
              {!sidebarCollapsed && (
                <div className="text-[10px] font-mono text-[#5C626E] uppercase tracking-wider px-3 mb-1.5 font-semibold">
                  {language === 'id' ? 'CMS & Pengaturan' : 'CMS & System'}
                </div>
              )}
              {navLinks.filter(i => i.section === 'cms' || i.section === 'system').map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-sans transition-all duration-150 ${
                      isActive
                        ? 'bg-[#E60023] text-white font-semibold shadow-lg shadow-[#E60023]/25'
                        : 'text-[#8A909D] hover:text-white hover:bg-[#121418]'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-white' : 'text-[#8A909D]'} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                  </Link>
                );
              })}

              {!sidebarCollapsed && (
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-[#8A909D] hover:text-white hover:bg-[#121418] transition-all border border-[#262930] mt-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe size={14} className="text-emerald-400" />
                    <span>{t('admin.nav.viewSite')}</span>
                  </div>
                  <ExternalLink size={11} className="text-[#5C626E]" />
                </Link>
              )}
            </div>

          </div>

        </div>

        {/* Footer: Collapse button + Admin Profile Card */}
        <div className="p-3.5 border-t border-[#262930] bg-[#08090A] space-y-2">
          
          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-mono text-[#8A909D] hover:text-white hover:bg-[#121418] transition-colors"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <>
                <PanelLeftClose size={14} />
                <span className="text-[11px]">{language === 'id' ? 'Kecilkan Menu' : 'Collapse Menu'}</span>
              </>
            )}
          </button>

          {/* Admin Profile Card */}
          <div className={`flex items-center justify-between ${sidebarCollapsed ? 'flex-col gap-2' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E60023] to-[#FF1F3D] border border-[#262930] flex items-center justify-center text-xs font-sans text-white font-bold shrink-0 shadow-md">
                {session?.user.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
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
              className="p-2 flex items-center justify-center rounded-lg bg-[#121418] hover:bg-red-950/40 text-[#8A909D] hover:text-[#FF1F3D] border border-[#262930] hover:border-[#E60023]/30 transition-all"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE TOPBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#08090A] border-b border-[#262930] sticky top-0 z-40">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E60023] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#E60023]/20">
            K
          </div>
          <div>
            <span className="font-sans font-bold text-white text-sm tracking-tight block">KAPITECH AMS</span>
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
            className="p-2 rounded-xl bg-[#121418] text-[#8A909D] border border-[#262930]"
          >
            <Search size={16} />
          </button>

          {/* Quick Currency Toggle Mobile */}
          <div className="flex items-center bg-[#121418] border border-[#262930] rounded-lg p-0.5 font-mono text-[10px]">
            <button
              onClick={() => handleSwitchCurrency('IDR')}
              className={`px-1.5 py-0.5 rounded ${currency === 'IDR' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' : 'text-[#8A909D]'}`}
            >
              IDR
            </button>
            <button
              onClick={() => handleSwitchCurrency('USD')}
              className={`px-1.5 py-0.5 rounded ${currency === 'USD' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' : 'text-[#8A909D]'}`}
            >
              USD
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-[#121418] text-white border border-[#262930] hover:bg-[#16181D] transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-over Drawer */}
          <div className="relative ml-auto w-4/5 max-w-xs bg-[#08090A] border-l border-[#262930] h-full flex flex-col justify-between p-4 z-10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#262930]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#E60023] flex items-center justify-center text-white font-bold text-xs">
                    K
                  </div>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Kapitech AMS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#121418] text-[#8A909D] hover:text-white border border-[#262930]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-sans transition-colors min-h-[44px] ${
                        isActive 
                          ? 'bg-[#E60023] text-white font-semibold shadow-md shadow-[#E60023]/20' 
                          : 'text-[#8A909D] hover:text-white hover:bg-[#121418]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isActive ? 'text-white' : 'text-[#8A909D]'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-[#1E2128] text-[#8A909D]'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <div className="pt-3 border-t border-[#262930]">
                  <Link
                    to="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-emerald-400 bg-[#121418] border border-[#262930]"
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
            <div className="pt-3 border-t border-[#262930] flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-white truncate">{session?.user.username || 'admin'}</div>
                <div className="text-[10px] font-mono text-[#8A909D] truncate">{session?.user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 min-h-[40px] rounded-lg bg-red-950/50 border border-[#E60023]/40 text-red-300 text-xs font-mono flex items-center gap-1 shrink-0"
              >
                <LogOut size={12} />
                <span>{t('admin.nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#08090A]">
        
        {/* Top Header Breadcrumbs & Controls: Exactly h-16 matching sidebar header */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-[#262930] bg-[#08090A]/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-sans text-[#8A909D]">
            <span className="font-semibold text-white">Kapitech AMS</span>
            <ChevronRight size={12} className="text-[#5C626E]" />
            <span className="text-[#8A909D] truncate">{currentNav?.label || 'Overview'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-sans text-[#8A909D]">
            
            {/* Currency Switcher (IDR / USD) */}
            <div className="hidden sm:flex items-center bg-[#121418] border border-[#262930] rounded-xl p-1 font-mono text-xs shadow-inner">
              <button
                onClick={() => handleSwitchCurrency('IDR')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  currency === 'IDR'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-[#8A909D] hover:text-white'
                }`}
              >
                IDR
              </button>
              <button
                onClick={() => handleSwitchCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-[#8A909D] hover:text-white'
                }`}
              >
                USD
              </button>
            </div>

            {/* Desktop Language Switcher (EN / ID) */}
            <div className="hidden sm:flex items-center bg-[#121418] border border-[#262930] rounded-xl p-1 font-mono text-xs shadow-inner">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  language === 'en'
                    ? 'bg-[#E60023] text-white shadow-sm shadow-[#E60023]/25'
                    : 'text-[#8A909D] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  language === 'id'
                    ? 'bg-[#E60023] text-white shadow-sm shadow-[#E60023]/25'
                    : 'text-[#8A909D] hover:text-white'
                }`}
              >
                ID
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-[#121418] px-2.5 py-1.5 rounded-xl border border-[#262930] text-[11px] font-mono">
              <Clock size={12} className="text-[#FF1F3D]" />
              <span>{currentTime || 'Jakarta WIB'}</span>
            </div>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-mono text-[#8A909D] hover:text-white transition-colors"
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
