import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, ArrowUpRight, ArrowUp, CheckCircle2, Globe, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/src/lib/LanguageContext';
import { submitToInbox } from '@/src/lib/submissions';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [localTime, setLocalTime] = useState('');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setLocalTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const emailToSubmit = email.trim();
      setIsSubscribed(true);
      try {
        await submitToInbox({
          fullName: 'Newsletter Subscriber',
          email: emailToSubmit,
          message: `User subscribed to newsletter updates: ${emailToSubmit}`,
          source: 'Footer Newsletter Form',
          type: 'newsletter'
        });
      } catch (err) {
        console.warn('Newsletter submission error:', err);
      }
      setTimeout(() => setIsSubscribed(false), 4000);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const brandingServices = [
    { name: 'Pitch Deck', desc: 'Get visuals that raise capital', href: '/services/pitch-deck' },
    { name: 'Brand Identity', desc: 'Build trust with design', href: '/services/brand-identity' },
    { name: 'Logo Design', desc: 'Become unforgettable', href: '/services/logo-design' },
    { name: 'Graphic Design', desc: 'Illustrations, Icons, Social media', href: '/services/graphic-design' },
    { name: 'Rebranding', desc: 'Rebrand to grow and convert', href: '/services/rebranding' },
  ];

  const designServices = [
    { name: 'UI/UX Design', desc: 'Web & mobile app design', href: '/services/ui-ux-design' },
    { name: 'Website Design', desc: 'Custom websites & landings', href: '/services/website-design' },
    { name: 'Mobile App Design', desc: 'Apps your users love', href: '/services/mobile-app-design' },
    { name: 'Website Redesign', desc: 'Modern look, higher impact', href: '/services/website-redesign' },
    { name: 'Product UX/UI Audit', desc: 'Insights that drive results', href: '/services/product-ux-ui-audit' },
  ];

  const devServices = [
    { name: 'Web Development', desc: 'Front-End & Back-End Development', href: '/services/web-development' },
    { name: 'MVP Development', desc: 'MVPs that attract funding', href: '/services/mvp-development' },
    { name: 'Landing page', desc: 'High-converting website', href: '/services/landing-page' },
    { name: 'Corporate Websites', desc: 'Built for scale and trust', href: '/services/corporate-websites' },
    { name: 'WOW Websites', desc: 'Professional, scalable, fast website', href: '/services/wow-websites' },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/kapitech.agency',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'X (Twitter)',
      href: 'https://x.com/kapitechagency',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'Threads',
      href: 'https://threads.net/@kapitech.agency',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.186 24C5.466 24 0 18.678 0 12.132 0 5.586 5.466.264 12.186.264c6.72 0 12.186 5.322 12.186 11.868 0 1.716-.364 3.372-1.054 4.882-.244.534-.866.772-1.4.526-.534-.244-.772-.866-.526-1.4.59-1.294.9-2.71.9-4.008 0-5.404-4.52-9.8-10.106-9.8-5.586 0-10.106 4.396-10.106 9.8 0 5.404 4.52 9.8 10.106 9.8 2.28 0 4.456-.764 6.238-2.19.466-.374 1.144-.306 1.518.16.374.466.306 1.144-.16 1.518C17.702 23.082 15.028 24 12.186 24zm4.18-8.232c-.144 0-.288-.046-.412-.138-1.074-.796-2.316-1.22-3.684-1.22-2.736 0-4.962 1.838-4.962 4.096 0 2.258 2.226 4.096 4.962 4.096 1.898 0 3.632-.88 4.542-2.314.33-.522.986-.678 1.508-.348.522.33.678.986.348 1.508-1.238 1.95-3.52 3.12-6.398 3.12-3.834 0-6.962-2.678-6.962-5.962s3.128-5.962 6.962-5.962c1.784 0 3.424.582 4.832 1.666.474.364.568 1.036.204 1.51-.238.312-.602.484-.94.484z"/>
        </svg>
      )
    },
    {
      name: 'TikTok',
      href: 'https://tiktok.com/@kapitechagency',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/@kapitechagency',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: 'Behance',
      href: 'https://behance.net/kapitechagency',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.171 3-4.144 0-6.555-2.777-6.555-6.666 0-3.889 2.411-6.667 6.555-6.667 4.095 0 6.27 2.778 6.27 6.667 0 .556-.05 1.056-.115 1.5H16.03c.12 1.833 1.487 2.889 3.07 2.889 1.353 0 2.308-.722 2.626-1.723h2zm-7.971-4.167h4.095c-.12-1.722-1.383-2.611-2.072-2.611-.84 0-1.854.889-2.023 2.611zm-10.755-6.166h-5v14h5.275c3.212 0 5.48-1.579 5.48-4.524 0-1.785-.92-3.155-2.483-3.83 1.218-.625 1.942-1.785 1.942-3.321 0-2.67-1.956-4.325-5.214-4.325zm-2.4 2.333h2.378c1.614 0 2.622.756 2.622 2.111 0 1.333-.984 2.167-2.622 2.167h-2.378v-4.278zm0 6.667h2.72c1.784 0 2.87.889 2.87 2.444 0 1.556-1.086 2.556-2.87 2.556h-2.72v-5z"/>
        </svg>
      )
    },
    {
      name: 'Dribbble',
      href: 'https://dribbble.com/kapitechagency',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm9.849 10.605c-.326-.062-2.584-.474-5.215-.224-.131-.299-.272-.601-.418-.905-.331-.692-.693-1.385-1.077-2.059 3.013-1.378 4.237-2.973 4.316-3.082 1.5 1.706 2.394 3.901 2.394 6.27zm-4.321-7.481c-.131.168-1.341 1.674-4.223 2.981-1.572-2.784-3.27-5.111-3.411-5.303 1.282-.516 2.686-.802 4.156-.802 1.258 0 2.457.214 3.478.624zm-9.351-1.748c.134.182 1.83 2.493 3.407 5.257-2.316.809-4.887 1.249-7.585 1.325.753-2.929 2.502-5.385 4.178-6.582zm-6.177 8.624v-.234c2.898-.078 5.666-.549 8.163-1.42.278.536.541 1.082.786 1.632.123.276.241.551.353.824-3.328 1.053-6.574 3.968-7.906 7.641-1.921-2.128-3.096-4.908-3.396-8.443zm1.699 9.943c1.233-3.425 4.22-6.155 7.378-7.147 1.343 3.551 2.062 7.027 2.215 7.828-2.617 1.229-5.597 1.246-9.593-.681zm11.23 1.134c-.183-.872-.919-4.234-2.227-7.697 2.457-.272 4.606.115 4.906.177-.384 3.197-2.348 5.922-5.079 7.52z"/>
        </svg>
      )
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/kapitechagency',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/kapitech-agency',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="relative bg-[#0B0C0E] pt-20 pb-12 px-4 sm:px-6 md:px-12 overflow-hidden border-t border-[#262930]" id="main-footer">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top CTA Banner */}
        <div className="pb-16 mb-16 border-b border-[#262930]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 block">
                {t('footer.cta.tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4 text-white">
                {t('footer.cta.title')}
              </h2>
              <p className="text-sm md:text-base text-[#8A909D] font-light max-w-2xl leading-relaxed">
                {t('footer.cta.desc')}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-4">
              <Link 
                to="/contact" 
                id="footer-cta-button"
                className="h-12 sm:h-14 min-h-[44px] px-7 sm:px-8 bg-brand-red hover:bg-[#E01414] text-white rounded-full font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-3 shadow-lg shadow-brand-red/20 hover:scale-[1.02]"
              >
                <span>{t('footer.cta.button')}</span>
                <ArrowUpRight size={18} />
              </Link>
              <div className="text-xs font-mono text-[#8A909D] flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#16181D] border border-[#262930]">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse shadow-[0_0_8px_rgba(255,26,26,0.6)]" />
                <span>{language === 'id' ? 'Tangerang Selatan, ID' : 'South Tangerang, ID'} • {localTime || '12:00:00'} WIB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links - 5 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          {/* Col 1: Brand & Newsletter (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3" aria-label="Kapitech Agency Home">
              <img 
                src="/Kapitech Logo 3D Glass.png" 
                alt="Kapitech Agency" 
                className="h-9 w-auto object-contain"
              />
              <span className="font-display font-bold text-lg text-white">Kapitech Agency</span>
            </Link>
            <p className="text-xs text-[#8A909D] font-light leading-relaxed max-w-sm">
              {t('footer.about')}
            </p>
            
            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-[11px] font-mono text-[#8A909D] uppercase tracking-wider block mb-2 font-medium">
                {language === 'id' ? 'Berlangganan Wawasan Proyek' : 'Subscribe for Project Insights'}
              </span>
              <form onSubmit={handleSubscribe} className="relative max-w-sm">
                <input 
                  type="email" 
                  placeholder={language === 'id' ? 'Masukkan email bisnis Anda...' : 'Enter your work email...'} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full min-h-[44px] bg-[#16181D] border border-[#262930] rounded-xl px-4 py-3 text-xs text-white placeholder:text-[#8A909D]/70 focus:outline-none focus:border-brand-red transition-colors"
                />
                <button 
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-brand-red text-white text-xs font-semibold hover:bg-[#E01414] transition-colors min-h-[34px]"
                >
                  {isSubscribed ? (language === 'id' ? 'Terdaftar!' : 'Subscribed!') : (language === 'id' ? 'Langganan' : 'Subscribe')}
                </button>
              </form>
              {isSubscribed && (
                <p className="text-[11px] text-brand-red font-mono mt-2 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> {language === 'id' ? 'Terima kasih telah berlangganan info Kapitech Agency.' : 'Thank you for subscribing to Kapitech Agency updates.'}
                </p>
              )}
            </div>
          </div>

          {/* Col 2: Branding & Design (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-5 font-semibold">
              Branding & Design
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[...brandingServices.slice(0, 3), ...designServices.slice(0, 3)].map((srv) => (
                <li key={srv.name}>
                  <Link 
                    to={srv.href} 
                    className="group block text-[#8A909D] hover:text-white transition-colors"
                  >
                    <span className="font-medium group-hover:text-brand-red transition-colors">{srv.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Development & Solutions (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-5 font-semibold">
              Development & Solutions
            </h4>
            <ul className="space-y-2.5 text-xs">
              {devServices.map((srv) => (
                <li key={srv.name}>
                  <Link 
                    to={srv.href} 
                    className="group block text-[#8A909D] hover:text-white transition-colors"
                  >
                    <span className="font-medium group-hover:text-brand-red transition-colors">{srv.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Col 4: Company & Case Studies (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-5 font-semibold">
              {language === 'id' ? 'Perusahaan & Portofolio' : 'Company & Portfolio'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { name: t('nav.work'), href: '/work' },
                { name: t('nav.services'), href: '/services' },
                { name: t('nav.about'), href: '/about' },
                { name: t('nav.careers'), href: '/careers' },
                { name: t('nav.contact'), href: '/contact' },
                { name: language === 'id' ? 'Inbox Database' : 'Database Inbox', href: '/inbox' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-[#8A909D] hover:text-brand-red transition-colors flex items-center gap-2"
                  >
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mt-6 mb-3 font-semibold">
              {language === 'id' ? 'Kebijakan & Legalitas' : 'Policy & Legal'}
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy', href: '/privacy' },
                { name: language === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service', href: '/terms' },
                { name: language === 'id' ? 'Panduan & Etika AI' : 'AI Instructions', href: '/ai-instructions' },
                { name: language === 'id' ? 'Kebijakan Editorial' : 'Editorial Policy', href: '/editorial-policy' },
                { name: language === 'id' ? 'Kebijakan Cookie' : 'Cookie Policy', href: '/cookie-policy' }
              ].map((policy) => (
                <li key={policy.name}>
                  <Link 
                    to={policy.href} 
                    className="text-[#8A909D]/80 hover:text-white transition-colors block text-[11px]"
                  >
                    {policy.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Direct Office & Contacts (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-5 font-semibold">
              {t('footer.contactsTitle')}
            </h4>
            <div className="space-y-3.5 text-xs text-[#8A909D]">
              <a href="mailto:hello@kapitech.id" className="flex items-center gap-2.5 hover:text-brand-red transition-colors group min-h-[36px]">
                <div className="w-7 h-7 rounded-lg bg-[#16181D] border border-[#262930] flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Mail size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[#8A909D]/70 block leading-tight">{t('footer.clientInquiry')}</span>
                  <span className="font-medium text-white group-hover:text-brand-red text-[11px] truncate block">hello@kapitech.id</span>
                </div>
              </a>

              <a href="mailto:business@kapitech.id" className="flex items-center gap-2.5 hover:text-brand-red transition-colors group min-h-[36px]">
                <div className="w-7 h-7 rounded-lg bg-[#16181D] border border-[#262930] flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Globe size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[#8A909D]/70 block leading-tight">{language === 'id' ? 'Kerja Sama Bisnis' : 'Business Inquiry'}</span>
                  <span className="font-medium text-white group-hover:text-brand-red text-[11px] truncate block">business@kapitech.id</span>
                </div>
              </a>

              <a href="mailto:recruitment@kapitech.id" className="flex items-center gap-2.5 hover:text-brand-red transition-colors group min-h-[36px]">
                <div className="w-7 h-7 rounded-lg bg-[#16181D] border border-[#262930] flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Briefcase size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[#8A909D]/70 block leading-tight">{t('footer.recruitment')}</span>
                  <span className="font-medium text-white group-hover:text-brand-red text-[11px] truncate block">recruitment@kapitech.id</span>
                </div>
              </a>

              <a href="tel:+6287769957062" className="flex items-center gap-2.5 hover:text-brand-red transition-colors group min-h-[36px]">
                <div className="w-7 h-7 rounded-lg bg-[#16181D] border border-[#262930] flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Phone size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[#8A909D]/70 block leading-tight">{t('footer.phone')}</span>
                  <span className="font-medium text-white group-hover:text-brand-red text-[11px] block">+62 877-6995-7062</span>
                </div>
              </a>

              <div className="flex items-start gap-2.5 pt-1">
                <div className="w-7 h-7 rounded-lg bg-[#16181D] border border-[#262930] flex items-center justify-center text-brand-red shrink-0 mt-0.5">
                  <MapPin size={13} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-[#8A909D]/70 block leading-tight">{t('footer.addressTitle')}</span>
                  <p className="leading-tight text-white/90 text-[11px] font-light">
                    {t('footer.address')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links Bar (Crisp Monochrome Logo Icons) */}
        <div className="py-6 border-t border-[#262930] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs font-mono text-[#8A909D] uppercase tracking-widest">
            {language === 'id' ? 'Kanal Resmi & Media Sosial' : 'Official Channels & Social Media'}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#8A909D] hover:text-white bg-[#16181D] hover:bg-[#20232B] hover:border-brand-red/30 border border-[#262930] transition-all duration-200"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-[#262930] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#8A909D]">
          <p>© 2021-2026 Kapitech. {language === 'id' ? 'Beroperasi di bawah naungan PT Kapitech Digital Indonesia.' : 'Operating under PT Kapitech Digital Indonesia.'} {t('footer.rights')}</p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link 
              to="/admin/login" 
              className="text-[#5C626E] hover:text-[#8A909D] transition-colors text-[11px] font-mono"
              title="Kapitech Internal Admin Portal"
            >
              <span>Admin Portal</span>
            </Link>
            <button 
              onClick={scrollToTop} 
              id="footer-back-to-top"
              className="flex items-center gap-1.5 hover:text-white transition-colors py-2 px-3 min-h-[36px] rounded-lg bg-[#16181D] hover:bg-[#20232B] border border-[#262930]"
            >
              <span>{t('footer.backToTop')}</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
