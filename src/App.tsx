/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { LanguageProvider, useLanguage } from './lib/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingContact } from './components/FloatingContact';
import { api } from './lib/apiClient';

// Route-level code splitting keeps rarely visited pages out of the initial JavaScript bundle.
// Named exports are adapted to React.lazy's default-export contract.
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Work = lazy(() => import('./pages/Work').then((m) => ({ default: m.Work })));
const Services = lazy(() => import('./pages/Services').then((m) => ({ default: m.Services })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
const Careers = lazy(() => import('./pages/Careers').then((m) => ({ default: m.Careers })));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail').then((m) => ({ default: m.ServiceDetail })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then((m) => ({ default: m.TermsOfService })));
const AiInstructions = lazy(() => import('./pages/AiInstructions').then((m) => ({ default: m.AiInstructions })));
const EditorialPolicy = lazy(() => import('./pages/EditorialPolicy').then((m) => ({ default: m.EditorialPolicy })));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy').then((m) => ({ default: m.CookiePolicy })));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminInbox = lazy(() => import('./pages/admin/AdminInbox').then((m) => ({ default: m.AdminInbox })));
const AdminCrm = lazy(() => import('./pages/admin/AdminCrm').then((m) => ({ default: m.AdminCrm })));
const AdminInvoicing = lazy(() => import('./pages/admin/AdminInvoicing').then((m) => ({ default: m.AdminInvoicing })));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects').then((m) => ({ default: m.AdminProjects })));
const AdminClients = lazy(() => import('./pages/admin/AdminClients').then((m) => ({ default: m.AdminClients })));
const AdminProposals = lazy(() => import('./pages/admin/AdminProposals').then((m) => ({ default: m.AdminProposals })));
const AdminApprovals = lazy(() => import('./pages/admin/AdminApprovals').then((m) => ({ default: m.AdminApprovals })));
const AdminDocuments = lazy(() => import('./pages/admin/AdminDocuments').then((m) => ({ default: m.AdminDocuments })));
const AdminCmsProjects = lazy(() => import('./pages/admin/AdminCmsProjects').then((m) => ({ default: m.AdminCmsProjects })));
const AdminCmsServices = lazy(() => import('./pages/admin/AdminCmsServices').then((m) => ({ default: m.AdminCmsServices })));
const AdminCmsTestimonials = lazy(() => import('./pages/admin/AdminCmsTestimonials').then((m) => ({ default: m.AdminCmsTestimonials })));
const AdminVendors = lazy(() => import('./pages/admin/AdminVendors').then((m) => ({ default: m.AdminVendors })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })));
const GlobalExecutiveDashboard = lazy(() => import('./components/admin/GlobalExecutiveDashboard').then((m) => ({ default: m.GlobalExecutiveDashboard })));

import { RequireAdminAuth } from './components/admin/RequireAdminAuth';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={isAdminRoute ? 'admin-root' : location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex-1 flex flex-col"
      >
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center px-6 text-sm text-white/60" role="status">
              Loading…
            </div>
          }
        >
          <Routes location={location}>
            {/* Public Agency Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/solutions/:slug" element={<ServiceDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/ai-instructions" element={<AiInstructions />} />
          <Route path="/editorial-policy" element={<EditorialPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          
          {/* Public access points relocated: redirect /inbox directly to protected admin inbox */}
          <Route path="/inbox" element={<Navigate to="/admin/inbox" replace />} />

          {/* Direct AMS Executive Gateway -> Cleanly protected under AdminLayout */}
          <Route path="/ams" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Admin Authentication Gateway */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Subsystem */}
          <Route
            path="/admin"
            element={
              <RequireAdminAuth>
                <AdminLayout />
              </RequireAdminAuth>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<GlobalExecutiveDashboard />} />
            <Route path="executive" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="inbox" element={<AdminInbox />} />
            <Route path="crm" element={<AdminCrm />} />
            <Route path="proposals" element={<AdminProposals />} />
            <Route path="invoicing" element={<AdminInvoicing />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="approvals" element={<AdminApprovals />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="cms/projects" element={<AdminCmsProjects />} />
            <Route path="cms/services" element={<AdminCmsServices />} />
            <Route path="cms/testimonials" element={<AdminCmsTestimonials />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

function AppShell() {
  const location = useLocation();
  const { language } = useLanguage();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/ams');
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);

  useEffect(() => {
    if (isAdminRoute) return;

    let cancelled = false;
    void api.cms.getPublicSettings().then((res) => {
      if (cancelled || !res.success || !res.data?.settings) return;

      const { siteTitle, siteDescription, maintenanceMode: serverMaintenanceMode } = res.data.settings;
      setMaintenanceMode(Boolean(serverMaintenanceMode));

      if (siteTitle) {
        document.title = siteTitle;
      }

      if (siteDescription) {
        let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (!description) {
          description = document.createElement('meta');
          description.name = 'description';
          document.head.appendChild(description);
        }
        description.content = siteDescription;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAdminRoute]);

  if (!isAdminRoute && maintenanceMode) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-red/30 bg-brand-red/10 text-brand-red text-[11px] font-mono uppercase tracking-[0.16em] mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
            <span>Maintenance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight mb-4">
            We’re working on the site.
          </h1>
          <p className="text-sm sm:text-base text-[#8A909D] leading-relaxed max-w-lg mx-auto">
            {language === 'id'
              ? 'Website Kapitech sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi.'
              : 'Kapitech is currently performing maintenance. Please check back shortly.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 text-white selection:bg-brand-red selection:text-white min-h-screen flex flex-col">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow flex flex-col">
        <AnimatedRoutes />
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingContact />}
    </div>
  );
}

export default function App() {
  // Remove legacy browser-persisted AMS data from older builds.
  // Sensitive CRM, finance, project, vendor, client and inbox data is now server-authoritative.
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    const legacyKeys = [
      'kapitech_agency_crm_leads',
      'kapitech_agency_crm_leads_v2',
      'kapitech_agency_invoices_v1',
      'kapitech_agency_invoices_v2',
      'kapitech_agency_expenses_v1',
      'kapitech_agency_expenses_v2',
      'kapitech_agency_active_projects_v1',
      'kapitech_agency_active_projects_v2',
      'kapitech_agency_clients_v1',
      'kapitech_agency_clients_v2',
      'kapitech_agency_vendors_v1',
      'kapitech_contact_submissions',
      'kapitech_cms_services_v1',
      'kapitech_cms_projects_v1',
      'kapitech_cms_testimonials_v1',
      'kapitech_cms_settings_v1',
      'kapitech_session_token',
      'kapitech_admin_session_v1'
    ];

    for (const key of legacyKeys) {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch {
        // Storage may be disabled by privacy settings.
      }
    }
  }, []);

  // Global handler for interactive .kapi-card dynamic mouse glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('.kapi-card') as HTMLElement | null;
      if (target) {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <ScrollToTop />
        {/* Ambient Fluid Mesh Background Layers */}
        <div className="kapi-fluid-background" aria-hidden="true" />
        <div className="kapi-noise-overlay" aria-hidden="true" />

        <AppShell />
      </Router>
    </LanguageProvider>
  );
}
