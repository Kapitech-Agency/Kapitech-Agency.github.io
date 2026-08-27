import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, ArrowUpRight, ArrowUp, CheckCircle2, Globe, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/src/lib/LanguageContext';

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 4000);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visualServicesEn = [
    { name: 'UI/UX Design', desc: 'Figma design systems & mobile apps', href: '/services' },
    { name: 'Video Production', desc: 'Commercials, events & weddings', href: '/services' },
    { name: '2D Animation', desc: 'Motion explainer & Lottie assets', href: '/services' },
    { name: 'Branding & Identity', desc: 'Brandbook & visual guidelines', href: '/services' },
    { name: 'Motion & Graphic Design', desc: 'Dynamic social & OOH motion', href: '/services' },
    { name: 'Creative Design', desc: 'Editorial reports & pitch decks', href: '/services' },
    { name: '3D Visualization', desc: 'Architectural & product renders', href: '/services' },
  ];

  const visualServicesId = [
    { name: 'Desain UI/UX', desc: 'Sistem desain Figma & UI mobile', href: '/services' },
    { name: 'Produksi Video', desc: 'Komersial, event & film pernikahan', href: '/services' },
    { name: 'Animasi 2D', desc: 'Video explainer & aset Lottie', href: '/services' },
    { name: 'Branding & Identitas', desc: 'Brandbook & pedoman visual', href: '/services' },
    { name: 'Motion & Desain Grafis', desc: 'Motion iklan sosial & billboard', href: '/services' },
    { name: 'Desain Kreatif', desc: 'Laporan editorial & investor deck', href: '/services' },
    { name: 'Visualisasi 3D', desc: 'Render arsitektur & produk 3D', href: '/services' },
  ];

  const devServicesEn = [
    { name: 'Company Profile Website', desc: 'Brochure site & corporate portals', href: '/services' },
    { name: 'E-Commerce Website', desc: 'Headless storefronts & Shopify Plus', href: '/services' },
    { name: 'Web Application', desc: 'Custom SaaS & real-time platforms', href: '/services' },
    { name: 'ERP / CRM System', desc: 'Enterprise inventory & sales software', href: '/services' },
    { name: 'IT Support & Infrastructure', desc: 'Cloud migration, DevOps & SLA', href: '/services' },
  ];

  const devServicesId = [
    { name: 'Website Profil Perusahaan', desc: 'Website brochure & portal korporat', href: '/services' },
    { name: 'Website E-Commerce', desc: 'Toko online headless & kustom', href: '/services' },
    { name: 'Aplikasi Web', desc: 'SaaS kustom & platform real-time', href: '/services' },
    { name: 'Sistem ERP / CRM', desc: 'Software inventaris & sales pipa B2B', href: '/services' },
    { name: 'Dukungan IT & Infrastruktur', desc: 'Migrasi cloud, DevOps & SLA 24/7', href: '/services' },
  ];

  const visualServices = language === 'id' ? visualServicesId : visualServicesEn;
  const devServices = language === 'id' ? devServicesId : devServicesEn;

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
    <footer className="relative bg-black pt-20 pb-12 px-4 sm:px-6 md:px-12 overflow-hidden border-t border-white/10" id="main-footer">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top CTA Banner */}
        <div className="pb-16 mb-16 border-b border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 block">
                {t('footer.cta.tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4 text-white">
                {t('footer.cta.title')}
              </h2>
              <p className="text-sm md:text-base text-white/70 font-light max-w-2xl leading-relaxed">
                {t('footer.cta.desc')}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-4">
              <Link 
                to="/contact" 
                id="footer-cta-button"
                className="h-12 sm:h-14 px-7 sm:px-8 bg-brand-red hover:bg-white text-white hover:text-black rounded-full font-semibold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-3 shadow-lg shadow-brand-red/20 hover:scale-[1.02]"
              >
                <span>{t('footer.cta.button')}</span>
                <ArrowUpRight size={18} />
              </Link>
              <div className="text-xs font-mono text-white/50 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
            <p className="text-xs text-white/70 font-light leading-relaxed max-w-sm">
              {t('footer.about')}
            </p>
            
            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider block mb-2 font-medium">
                {language === 'id' ? 'Berlangganan Wawasan Proyek' : 'Subscribe for Project Insights'}
              </span>
              <form onSubmit={handleSubscribe} className="relative max-w-sm">
                <input 
                  type="email" 
                  placeholder={language === 'id' ? 'Masukkan email bisnis Anda...' : 'Enter your work email...'} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-900/90 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-brand-red transition-colors"
                />
                <button 
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-brand-red text-white text-xs font-semibold hover:bg-white hover:text-black transition-colors"
                >
                  {isSubscribed ? (language === 'id' ? 'Terdaftar!' : 'Subscribed!') : (language === 'id' ? 'Langganan' : 'Subscribe')}
                </button>
              </form>
              {isSubscribed && (
                <p className="text-[11px] text-emerald-400 font-mono mt-2 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> {language === 'id' ? 'Terima kasih telah berlangganan info Kapitech Agency.' : 'Thank you for subscribing to Kapitech Agency updates.'}
                </p>
              )}
            </div>
          </div>

          {/* Col 2: Visual Experience (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-5 font-semibold">
              Visual Experience
            </h4>
            <ul className="space-y-2.5 text-xs">
              {visualServices.map((srv) => (
                <li key={srv.name}>
                  <Link 
                    to={srv.href} 
                    className="group block text-white/75 hover:text-white transition-colors"
                  >
                    <span className="font-medium group-hover:text-brand-red transition-colors">{srv.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Innovation Development (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-5 font-semibold">
              Innovation Development
            </h4>
            <ul className="space-y-2.5 text-xs">
              {devServices.map((srv) => (
                <li key={srv.name}>
                  <Link 
                    to={srv.href} 
                    className="group block text-white/75 hover:text-white transition-colors"
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
                { name: t('nav.contact'), href: '/contact' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-white/75 hover:text-brand-red transition-colors flex items-center gap-2"
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
                    className="text-white/60 hover:text-white transition-colors block text-[11px]"
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
            <div className="space-y-3.5 text-xs text-white/80">
              <a href="mailto:hello@kapitech.id" className="flex items-center gap-2.5 hover:text-brand-red transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Mail size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-white/50 block leading-tight">{t('footer.clientInquiry')}</span>
                  <span className="font-medium text-white group-hover:text-brand-red text-[11px] truncate block">hello@kapitech.id</span>
                </div>
              </a>

              <a href="mailto:recruitment@kapitech.id" className="flex items-center gap-2.5 hover:text-brand-red transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Briefcase size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-white/50 block leading-tight">{t('footer.recruitment')}</span>
                  <span className="font-medium text-white group-hover:text-brand-red text-[11px] truncate block">recruitment@kapitech.id</span>
                </div>
              </a>

              <a href="tel:+6287769957062" className="flex items-center gap-2.5 hover:text-brand-red transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Phone size={13} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-white/50 block leading-tight">{t('footer.phone')}</span>
                  <span className="font-medium text-white group-hover:text-brand-red text-[11px] block">+62 877-6995-7062</span>
                </div>
              </a>

              <div className="flex items-start gap-2.5 pt-1">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-brand-red shrink-0 mt-0.5">
                  <MapPin size={13} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-white/50 block leading-tight">{t('footer.addressTitle')}</span>
                  <p className="leading-tight text-white/80 text-[11px] font-light">
                    {t('footer.address')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links Bar (Crisp Monochrome Logo Icons) */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs font-mono text-white/50 uppercase tracking-widest">
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
                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 border border-transparent transition-all duration-200"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <p>© {currentYear} Kapitech Agency. {language === 'id' ? 'Beroperasi di bawah naungan PT Kapitech Digital Indonesia.' : 'Operating under PT Kapitech Digital Indonesia.'} {t('footer.rights')}</p>
          <div className="flex items-center gap-6">
            <button 
              onClick={scrollToTop} 
              id="footer-back-to-top"
              className="flex items-center gap-1.5 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
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
