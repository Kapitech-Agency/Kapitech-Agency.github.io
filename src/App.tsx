/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { LanguageProvider } from './lib/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingContact } from './components/FloatingContact';

// Public Pages
import { Home } from './pages/Home';
import { Work } from './pages/Work';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Careers } from './pages/Careers';
import { ServiceDetail } from './pages/ServiceDetail';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { AiInstructions } from './pages/AiInstructions';
import { EditorialPolicy } from './pages/EditorialPolicy';
import { CookiePolicy } from './pages/CookiePolicy';
import NotFound from './pages/NotFound';

// Protected Admin Suite
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminInbox } from './pages/admin/AdminInbox';
import { AdminCrm } from './pages/admin/AdminCrm';
import { AdminInvoicing } from './pages/admin/AdminInvoicing';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminClients } from './pages/admin/AdminClients';
import { AdminCmsProjects } from './pages/admin/AdminCmsProjects';
import { AdminCmsServices } from './pages/admin/AdminCmsServices';
import { AdminCmsTestimonials } from './pages/admin/AdminCmsTestimonials';
import { AdminSettings } from './pages/admin/AdminSettings';
import { RequireAdminAuth } from './components/admin/RequireAdminAuth';
import { isAmsSubdomain, DOMAIN_CONFIG } from './lib/domainConfig';

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

          {/* Admin Authentication Gateways */}
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
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
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="inbox" element={<AdminInbox />} />
            <Route path="crm" element={<AdminCrm />} />
            <Route path="invoicing" element={<AdminInvoicing />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="cms/projects" element={<AdminCmsProjects />} />
            <Route path="cms/services" element={<AdminCmsServices />} />
            <Route path="cms/testimonials" element={<AdminCmsTestimonials />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

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
