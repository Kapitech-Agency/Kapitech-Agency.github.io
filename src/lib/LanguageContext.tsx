import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.work': 'Work',
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.careers': 'Careers',
    'nav.contact': 'Contact',
    'nav.startProject': 'Start a Project',

    // Hero
    'hero.badge': 'Digital Product & Engineering Agency',
    'hero.title': 'Digital product studio crafted to build & scale your business.',
    'hero.subtitle': 'Kapitech Agency designs and engineers high-performance web applications, intuitive mobile interfaces, and scalable brand identities for growing enterprises.',
    'hero.viewWork': 'Explore Portfolio',
    'hero.discuss': 'Schedule Consultation',

    // Clients
    'clients.tag': 'Selected Clients & Partners',
    'clients.title': 'Trusted by 50+ innovative companies and growing brands worldwide.',
    'clients.desc': 'We collaborate with ambitious startups, established enterprises, and global founders to deliver measurable digital impact.',

    // Services section
    'services.tag': 'What We Do',
    'services.title': 'Our core service capabilities.',
    'services.viewAll': 'Explore All Services',

    // Work section
    'work.tag': 'Selected Work',
    'work.title': 'Case studies and delivered projects.',
    'work.viewAll': 'View Full Portfolio',
    'work.details': 'Details',
    'work.caseStudy': 'View Case Study',

    // Process
    'process.tag': 'How We Work',
    'process.title': 'A structured and transparent project lifecycle.',
    'process.desc': 'Every engagement follows our clear 4-step workflow to ensure predictable timelines, clear communication, and high-quality deliverables.',

    // CTA
    'cta.tag': "Let's Collaborate",
    'cta.title': "Have a project in mind? Let's build something exceptional.",
    'cta.desc': 'Reach out to our team at Kapitech Agency to discuss your requirements, get a quote, or schedule an initial consultation.',
    'cta.button': 'Contact Kapitech',

    // Footer
    'footer.cta.tag': 'Start a New Project with Kapitech Agency',
    'footer.cta.title': 'Ready to elevate your digital presence?',
    'footer.cta.desc': 'We help ambitious brands and growing companies design, engineer, and deploy high-performing websites, mobile applications, and visual identity systems.',
    'footer.cta.button': 'Schedule a Consultation',
    'footer.about': 'Kapitech Agency (PT Kapitech Digital Indonesia) is an independent digital product agency specializing in strategic UI/UX design, modern full-stack web engineering, and scalable brand systems.',
    'footer.servicesTitle': 'Services & Capabilities',
    'footer.navTitle': 'Company & Case Studies',
    'footer.contactsTitle': 'Headquarters & Inquiries',
    'footer.clientInquiry': 'Client Inquiries',
    'footer.recruitment': 'Careers & Recruitment',
    'footer.partnerships': 'Partnerships & Press',
    'footer.phone': 'Direct Phone & WhatsApp',
    'footer.addressTitle': 'Headquarters Address',
    'footer.address': 'Linea Residence, Block G No. 5, Melati Loka Street, Paku Jaya, North Serpong, South Tangerang City, Banten 15220, Indonesia',
    'footer.rights': 'All rights reserved.',
    'footer.backToTop': 'Back to Top',

    // About
    'about.tag': 'About Kapitech Agency',
    'about.title': 'A digital agency engineered for clarity and growth.',
    'about.subtitle': 'We design and build high-performance web applications, intuitive mobile interfaces, and authentic brand systems for businesses ready to scale.',
    'about.leadership.tag': 'Executive Leadership',
    'about.leadership.title': 'The Leadership Driving Digital Innovation',
    'about.leadership.subtitle': 'Our executive team combines deep expertise across technology architecture, creative direction, agile delivery, and business growth.',
    'about.tools.tag': 'Tools & Frameworks',
    'about.tools.title': 'The modern tech stack we rely on.',
    'about.tools.subtitle': 'We leverage production-tested, industry-leading technologies to guarantee blistering speed, seamless scalability, and rock-solid stability.',
    'about.stats.projects': 'Delivered Projects',
    'about.stats.experience': 'Years Experience',
    'about.stats.craft': 'Bespoke System Architecture',

    // FAQ
    'faq.tag': 'Clear Answers',
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Common questions about working with Kapitech Agency.',
    'faq.viewMore': 'View More Questions (4 more)',
    'faq.showLess': 'Show Less Questions',

    // Careers
    'careers.tag': 'Join Our Team',
    'careers.title': 'Build the future of digital products with Kapitech.',
    'careers.subtitle': 'We are looking for passionate designers, engineers, and problem solvers who value craft, speed, and genuine client impact.',
    'careers.openRoles': 'Open Roles',
    'careers.directEmail': 'Direct recruiting inquiries:',
  },
  id: {
    // Nav
    'nav.work': 'Portofolio',
    'nav.services': 'Layanan',
    'nav.about': 'Tentang Kami',
    'nav.careers': 'Karir',
    'nav.contact': 'Kontak',
    'nav.startProject': 'Mulai Proyek',

    // Hero
    'hero.badge': 'Agensi Produk Digital & Rekayasa Perangkat Lunak',
    'hero.title': 'Studio produk digital yang dirancang untuk membangun & mengembangkan bisnis Anda.',
    'hero.subtitle': 'Kapitech Agency merancang dan membangun aplikasi web berkinerja tinggi, antarmuka mobile intuitif, dan identitas brand terukur untuk perusahaan yang sedang berkembang.',
    'hero.viewWork': 'Lihat Portofolio',
    'hero.discuss': 'Jadwalkan Konsultasi',

    // Clients
    'clients.tag': 'Klien & Mitra Pilihan',
    'clients.title': 'Dipercaya oleh 50+ perusahaan inovatif dan brand terkemuka di seluruh dunia.',
    'clients.desc': 'Kami berkolaborasi dengan startup ambisius, perusahaan mapan, dan pendiri global untuk menghadirkan dampak digital yang terukur.',

    // Services section
    'services.tag': 'Layanan Kami',
    'services.title': 'Kemampuan & spesialisasi layanan kami.',
    'services.viewAll': 'Lihat Semua Layanan',

    // Work section
    'work.tag': 'Karya Pilihan',
    'work.title': 'Studi kasus dan proyek yang telah kami selesaikan.',
    'work.viewAll': 'Lihat Seluruh Portofolio',
    'work.details': 'Detail',
    'work.caseStudy': 'Lihat Studi Kasus',

    // Process
    'process.tag': 'Metodologi Kerja',
    'process.title': 'Siklus proyek yang terstruktur dan transparan.',
    'process.desc': 'Setiap kerja sama mengikuti alur kerja 4 tahap yang jelas untuk memastikan ketepatan waktu, komunikasi terbuka, dan hasil berkualitas tinggi.',

    // CTA
    'cta.tag': 'Mari Berkolaborasi',
    'cta.title': 'Punya rencana proyek? Mari wujudkan sesuatu yang luar biasa bersama.',
    'cta.desc': 'Hubungi tim Kapitech Agency untuk mendiskusikan kebutuhan, estimasi biaya, atau menjadwalkan konsultasi awal.',
    'cta.button': 'Hubungi Kapitech',

    // Footer
    'footer.cta.tag': 'Mulai Proyek Baru Bersama Kapitech Agency',
    'footer.cta.title': 'Siap meningkatkan kehadiran digital bisnis Anda?',
    'footer.cta.desc': 'Kami membantu brand dan bisnis merancang, membangun, dan meluncurkan website berkecepatan tinggi, aplikasi mobile, dan sistem identitas visual.',
    'footer.cta.button': 'Jadwalkan Konsultasi',
    'footer.about': 'Kapitech Agency (PT Kapitech Digital Indonesia) adalah agensi produk digital independen yang berfokus pada desain UI/UX strategis, rekayasa web modern, dan sistem brand yang terukur.',
    'footer.servicesTitle': 'Layanan & Kemampuan',
    'footer.navTitle': 'Perusahaan & Studi Kasus',
    'footer.contactsTitle': 'Kantor Pusat & Kontak',
    'footer.clientInquiry': 'Pertanyaan Klien',
    'footer.recruitment': 'Karir & Rekrutmen',
    'footer.partnerships': 'Kemitraan & Media',
    'footer.phone': 'Telepon & WhatsApp',
    'footer.addressTitle': 'Alamat Kantor Pusat',
    'footer.address': 'Linea Residence, Block G No. 5, Melati Loka Street, Paku Jaya, North Serpong, South Tangerang City, Banten 15220, Indonesia',
    'footer.rights': 'Hak cipta dilindungi undang-undang.',
    'footer.backToTop': 'Kembali ke Atas',

    // About
    'about.tag': 'Tentang Kapitech Agency',
    'about.title': 'Agensi digital yang dirancang untuk kejelasan dan pertumbuhan.',
    'about.subtitle': 'Kami merancang dan membangun aplikasi web berkinerja tinggi, antarmuka mobile intuitif, dan sistem identitas brand untuk bisnis yang siap bertumbuh.',
    'about.leadership.tag': 'Kepemimpinan Eksekutif',
    'about.leadership.title': 'Kepemimpinan yang Mendorong Inovasi Digital',
    'about.leadership.subtitle': 'Tim kepemimpinan kami memadukan keahlian mendalam di bidang arsitektur teknologi, arahan kreatif, manajemen agile, dan pertumbuhan bisnis.',
    'about.tools.tag': 'Alat & Kerangka Kerja',
    'about.tools.title': 'Teknologi modern yang kami andalkan.',
    'about.tools.subtitle': 'Kami memanfaatkan teknologi teruji industri untuk menjamin kecepatan maksimal, skalabilitas mulus, dan stabilitas jangka panjang.',
    'about.stats.projects': 'Proyek Selesai',
    'about.stats.experience': 'Tahun Pengalaman',
    'about.stats.craft': 'Arsitektur Sistem Khusus',

    // FAQ
    'faq.tag': 'Jawaban Jelas',
    'faq.title': 'Pertanyaan yang Sering Diajukan',
    'faq.subtitle': 'Pertanyaan umum seputar berkolaborasi dengan Kapitech Agency.',
    'faq.viewMore': 'Lihat Pertanyaan Lainnya (4 lagi)',
    'faq.showLess': 'Tampilkan Lebih Sedikit',

    // Careers
    'careers.tag': 'Bergabung Bersama Kami',
    'careers.title': 'Bangun masa depan produk digital bersama Kapitech.',
    'careers.subtitle': 'Kami mencari desainer, engineer, dan problem solver berdedikasi yang mengutamakan kualitas, kecepatan, dan dampak nyata bagi klien.',
    'careers.openRoles': 'Posisi Tersedia',
    'careers.directEmail': 'Kontak rekrutmen langsung:',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kapitech_lang') as Language;
    return saved === 'id' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kapitech_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
