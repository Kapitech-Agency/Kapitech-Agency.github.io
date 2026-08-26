import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, ArrowUpRight, ArrowUp, Send, CheckCircle2, Clock, Globe, Briefcase } from 'lucide-react';
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

  const servicesListEn = [
    { name: 'Web & Software Development', desc: 'Custom web apps, platforms & landing sites', href: '/services' },
    { name: 'UI/UX & Product Design', desc: 'Figma design systems, wireframing & prototypes', href: '/services' },
    { name: 'Mobile App Engineering', desc: 'Cross-platform iOS & Android mobile solutions', href: '/services' },
    { name: 'Branding & Visual Identity', desc: 'Brandbook, typography & digital design guidelines', href: '/services' },
    { name: 'API & Cloud Architecture', desc: 'REST/GraphQL, database modeling & cloud scaling', href: '/services' },
    { name: 'Technical Support & SLA', desc: 'Code audits, security patches & 24/7 maintenance', href: '/services' },
  ];

  const servicesListId = [
    { name: 'Pengembangan Web & Software', desc: 'Aplikasi web kustom, platform SaaS & landing page', href: '/services' },
    { name: 'Desain UI/UX & Produk', desc: 'Sistem desain Figma, wireframing & prototipe interaktif', href: '/services' },
    { name: 'Rekayasa Aplikasi Mobile', desc: 'Solusi mobile lintas platform iOS & Android', href: '/services' },
    { name: 'Identitas Brand & Visual', desc: 'Brandbook, tipografi & pedoman desain digital', href: '/services' },
    { name: 'Arsitektur Cloud & API', desc: 'REST/GraphQL, pemodelan database & skalabilitas cloud', href: '/services' },
    { name: 'Dukungan Teknis & SLA', desc: 'Audit kode, patch keamanan & pemeliharaan 24/7', href: '/services' },
  ];

  const servicesList = language === 'id' ? servicesListId : servicesListEn;

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

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          {/* Col 1: Brand & Newsletter */}
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

          {/* Col 2: Complete List of Services */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-6 font-semibold">
              {t('footer.servicesTitle')}
            </h4>
            <ul className="space-y-3.5 text-xs">
              {servicesList.map((srv) => (
                <li key={srv.name}>
                  <Link 
                    to={srv.href} 
                    className="group block text-white/80 hover:text-white transition-colors"
                  >
                    <span className="font-medium group-hover:text-brand-red transition-colors block">{srv.name}</span>
                    <span className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors block">{srv.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Col 3: Navigation & Company Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-6 font-semibold">
              {t('footer.navTitle')}
            </h4>
            <ul className="space-y-3 text-xs">
              {[
                { name: t('nav.work'), href: '/work' },
                { name: t('nav.services'), href: '/services' },
                { name: t('nav.about'), href: '/about' },
                { name: t('nav.careers'), href: '/careers' },
                { name: t('nav.contact'), href: '/contact' },
                { name: language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy', href: '/privacy' },
                { name: language === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service', href: '/terms' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-white/70 hover:text-brand-red transition-colors flex items-center gap-2"
                  >
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Direct Office & Contacts */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-6 font-semibold">
              {t('footer.contactsTitle')}
            </h4>
            <div className="space-y-3.5 text-xs text-white/80">
              <a href="mailto:hello@kapitech.id" className="flex items-center gap-3 hover:text-brand-red transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Mail size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/50 block">{t('footer.clientInquiry')}</span>
                  <span className="font-medium text-white group-hover:text-brand-red">hello@kapitech.id</span>
                </div>
              </a>

              <a href="mailto:recruitment@kapitech.id" className="flex items-center gap-3 hover:text-brand-red transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Briefcase size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/50 block">{t('footer.recruitment')}</span>
                  <span className="font-medium text-white group-hover:text-brand-red">recruitment@kapitech.id</span>
                </div>
              </a>

              <a href="mailto:business@kapitech.id" className="flex items-center gap-3 hover:text-brand-red transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Globe size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/50 block">{t('footer.partnerships')}</span>
                  <span className="font-medium text-white group-hover:text-brand-red">business@kapitech.id</span>
                </div>
              </a>

              <a href="tel:+6287769957062" className="flex items-center gap-3 hover:text-brand-red transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-brand-red group-hover:border-brand-red/40 shrink-0">
                  <Phone size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/50 block">{t('footer.phone')}</span>
                  <span className="font-medium text-white group-hover:text-brand-red">+62 877-6995-7062</span>
                </div>
              </a>

              <div className="flex items-start gap-3 pt-1">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-brand-red shrink-0 mt-0.5">
                  <MapPin size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-white/50 block">{t('footer.addressTitle')}</span>
                  <p className="leading-relaxed text-white/80 text-[11px] font-light">
                    {t('footer.address')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
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
