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
  Globe
} from 'lucide-react';
import { getAdminSession, logoutAdmin } from '../../lib/adminAuth';
import { subscribeToInbox, ContactSubmission } from '../../lib/submissions';
import { useLanguage } from '../../lib/LanguageContext';

export const AdminLayout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const session = getAdminSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Clock in Asia/Jakarta timezone
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { 
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
  }, []);

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
      to: '/admin/inbox',
      label: t('admin.nav.inbox'),
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'bg-brand-red text-white font-bold animate-pulse',
      section: 'main'
    },
    {
      to: '/admin/crm',
      label: t('admin.nav.crm'),
      icon: Briefcase,
      badge: 'IDR',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold font-mono',
      section: 'operations'
    },
    {
      to: '/admin/invoicing',
      label: t('admin.nav.invoicing'),
      icon: Receipt,
      badge: null,
      section: 'operations'
    },
    {
      to: '/admin/projects',
      label: t('admin.nav.projects'),
      icon: Layers,
      badge: null,
      section: 'operations'
    },
    {
      to: '/admin/clients',
      label: t('admin.nav.clients'),
      icon: Users,
      badge: null,
      section: 'operations'
    },
    {
      to: '/admin/cms/projects',
      label: t('admin.nav.cmsProjects'),
      icon: FolderKanban,
      badge: null,
      section: 'cms'
    },
    {
      to: '/admin/cms/services',
      label: t('admin.nav.cmsServices'),
      icon: Layers,
      badge: null,
      section: 'cms'
    },
    {
      to: '/admin/cms/testimonials',
      label: t('admin.nav.cmsTestimonials'),
      icon: Quote,
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

  const currentNav = navLinks.find(link => location.pathname === link.to || (link.to !== '/admin/dashboard' && location.pathname.startsWith(link.to)));

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-white flex flex-col md:flex-row selection:bg-brand-red selection:text-white font-sans antialiased">
      
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#111317] border-r border-[#262930] shrink-0 h-screen sticky top-0 z-30">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-[#262930] flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-brand-red flex items-center justify-center text-white font-bold font-display shadow-md shadow-brand-red/20 text-sm">
              K
            </div>
            <div>
              <div className="font-display font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                <span>KAPITECH</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-red/15 text-brand-red border border-brand-red/30 font-semibold">
                  AMS
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#8A909D] -mt-0.5">Enterprise Operations</p>
            </div>
          </Link>
        </div>

        {/* Navigation List with Strict Grouping */}
        <div className="flex-1 px-3.5 py-4 space-y-4 overflow-y-auto">
          
          {/* Group 1: Core Command */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-[#5C626E] uppercase tracking-wider px-3 mb-1.5 font-semibold">
              {t('admin.nav.mainMenu')}
            </div>
            {navLinks.filter(i => i.section === 'main').map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20'
                      : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={isActive ? 'text-white' : 'text-[#8A909D]'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-[#262930] text-[#8A909D]'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Group 2: Operations & Client Delivery */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-[#5C626E] uppercase tracking-wider px-3 mb-1.5 font-semibold">
              {t('admin.nav.operations')}
            </div>
            {navLinks.filter(i => i.section === 'operations').map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20'
                      : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={isActive ? 'text-white' : 'text-[#8A909D]'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-[#262930] text-[#8A909D]'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Group 3: CMS & Brand */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-[#5C626E] uppercase tracking-wider px-3 mb-1.5 font-semibold">
              {t('admin.nav.cms')}
            </div>
            {navLinks.filter(i => i.section === 'cms').map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20'
                      : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={isActive ? 'text-white' : 'text-[#8A909D]'} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Group 4: System & Meta */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-[#5C626E] uppercase tracking-wider px-3 mb-1.5 font-semibold">
              {t('admin.nav.system')}
            </div>
            {navLinks.filter(i => i.section === 'system').map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20'
                      : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={isActive ? 'text-white' : 'text-[#8A909D]'} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-[#8A909D] hover:text-white hover:bg-[#16181D] transition-all border border-[#262930] mt-2"
            >
              <div className="flex items-center gap-2.5">
                <Globe size={14} className="text-emerald-400" />
                <span>{t('admin.nav.viewSite')}</span>
              </div>
              <ExternalLink size={11} className="text-[#5C626E]" />
            </Link>
          </div>

        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div className="p-3.5 border-t border-[#262930] bg-[#0E1013]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#1F232B] border border-[#2F3440] flex items-center justify-center text-xs font-mono text-emerald-400 font-bold shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {session?.user.username || 'admin'}
                </div>
                <div className="text-[9px] font-mono text-emerald-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t('admin.badge.principal')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title={t('admin.nav.logout')}
              className="p-1.5 rounded-lg bg-[#16181D] hover:bg-red-950/40 text-[#8A909D] hover:text-red-400 border border-[#262930] hover:border-red-500/30 transition-all"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE TOPBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111317] border-b border-[#262930] sticky top-0 z-40">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-red flex items-center justify-center text-white font-bold text-xs shadow-md shadow-brand-red/20">
            K
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm tracking-tight block">KAPITECH AMS</span>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 -mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online • {currentTime.split(' ')[0] || ''}</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick Language Switcher Mobile */}
          <div className="flex items-center bg-[#16181D] border border-[#262930] rounded-lg p-0.5 font-mono text-[10px]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-brand-red text-white font-bold' : 'text-[#8A909D]'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('id')}
              className={`px-1.5 py-0.5 rounded ${language === 'id' ? 'bg-brand-red text-white font-bold' : 'text-[#8A909D]'}`}
            >
              ID
            </button>
          </div>

          {unreadCount > 0 && (
            <Link
              to="/admin/inbox"
              className="px-2 py-1 rounded-lg bg-brand-red text-white text-[11px] font-mono font-bold flex items-center gap-1 shadow-md shadow-brand-red/20 animate-pulse"
            >
              <Inbox size={12} />
              <span>{unreadCount}</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-1.5 rounded-xl bg-[#16181D] text-white border border-[#262930] hover:bg-[#20232B] transition-colors"
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
          <div className="relative ml-auto w-4/5 max-w-xs bg-[#111317] border-l border-[#262930] h-full flex flex-col justify-between p-4 z-10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#262930]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-red flex items-center justify-center text-white font-bold text-xs">
                    K
                  </div>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Kapitech AMS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-[#16181D] text-[#8A909D] hover:text-white border border-[#262930]"
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
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
                        isActive 
                          ? 'bg-brand-red text-white font-bold shadow-md shadow-brand-red/20' 
                          : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isActive ? 'text-white' : 'text-[#8A909D]'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-[#262930] text-[#8A909D]'}`}>
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
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-emerald-400 bg-[#16181D] border border-[#262930]"
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
                className="px-2.5 py-1 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-1 shrink-0"
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
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Breadcrumbs & Language Switcher Bar */}
        <header className="px-4 sm:px-6 lg:px-8 py-3 border-b border-[#262930] bg-[#111317]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A909D]">
            <span>AMS</span>
            <ChevronRight size={12} className="text-[#5C626E]" />
            <span className="text-white font-semibold truncate">{currentNav?.label || 'Overview'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#8A909D]">
            
            {/* Desktop Language Switcher (EN / ID) */}
            <div className="hidden sm:flex items-center bg-[#16181D] border border-[#262930] rounded-xl p-1 font-mono text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  language === 'en'
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'text-[#8A909D] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  language === 'id'
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'text-[#8A909D] hover:text-white'
                }`}
              >
                ID
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-[#16181D] px-2.5 py-1.5 rounded-xl border border-[#262930] text-[11px]">
              <Clock size={12} className="text-brand-red" />
              <span>{currentTime || 'Jakarta WIB'}</span>
            </div>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-[11px] text-[#8A909D] hover:text-white transition-colors"
            >
              <span>kapitech.id</span>
              <ExternalLink size={10} />
            </Link>
          </div>
        </header>

        {/* View Outlet */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>

      </main>

    </div>
  );
};
export default AdminLayout;
