/**
 * CMS Data Store & Content Management Engine for Kapitech Agency
 * Manages Portfolio / Case Studies, Services, Client Testimonials, and Site Meta.
 */

import { allProjects, ProjectItem } from '../data/projectsData';

export interface TestimonialItem {
  id: string;
  quote: string;
  quoteId: string;
  author: string;
  role: string;
  company: string;
  location: string;
  rating?: number;
  avatar?: string;
}

export interface SiteMetaSettings {
  siteTitle: string;
  siteDescription: string;
  contactReceiverEmail: string;
  defaultLanguage: 'en' | 'id';
  enableLiveChat: boolean;
  enableSoundAlerts: boolean;
  maintenanceMode: boolean;
}

const CMS_PROJECTS_KEY = 'kapitech_cms_projects_v1';
const CMS_TESTIMONIALS_KEY = 'kapitech_cms_testimonials_v1';
const CMS_SETTINGS_KEY = 'kapitech_cms_settings_v1';
const CMS_EVENT_KEY = 'kapitech_cms_updated';

export const defaultTestimonials: TestimonialItem[] = [
  {
    id: 't_01',
    quote: "Kapitech built our real estate portal from scratch using Next.js. The page load speed is blazing fast and our inbound lead conversions increased by 45% within the first month.",
    quoteId: "Kapitech membangun portal real estate kami dari nol menggunakan Next.js. Kecepatan loading halamannya luar biasa cepat dan konversi prospek kami meningkat 45% dalam bulan pertama.",
    author: "Marcus Thorne",
    role: "Managing Director",
    company: "Lumina Real Estate",
    location: "Jakarta, Indonesia",
    rating: 5
  },
  {
    id: 't_02',
    quote: "Their design team has an exceptional eye for modern typography and layout. They delivered a cohesive brand identity and a stunning web experience that elevated our firm completely.",
    quoteId: "Tim desain mereka memiliki keahlian luar biasa dalam tipografi dan tata letak modern. Mereka menghadirkan identitas brand yang sangat kohesif dan pengalaman web yang memukau.",
    author: "Sarah Chen",
    role: "Creative Director",
    company: "Aura Creative Studio",
    location: "Singapore",
    rating: 5
  },
  {
    id: 't_03',
    quote: "Working with Kapitech on our mobile banking interface was seamless. They simplified complex account journeys and delivered pixel-perfect Figma specs ready for our dev squad.",
    quoteId: "Bekerja dengan Kapitech untuk antarmuka mobile banking sangat lancar. Mereka menyederhanakan alur pengguna yang kompleks dan menyerahkan spesifikasi Figma yang presisi untuk tim developer kami.",
    author: "David Miller",
    role: "Head of Product",
    company: "Nexus Fintech",
    location: "Hong Kong",
    rating: 5
  },
  {
    id: 't_04',
    quote: "The solar energy monitoring dashboard Kapitech engineered gave our operations team instant visibility across 40+ solar farms with zero lag. Highly dependable engineering.",
    quoteId: "Dashboard monitoring energi surya yang dikembangkan Kapitech memberi tim operasi kami visibilitas langsung di lebih dari 40 ladang surya tanpa lag. Rekayasa yang sangat andal.",
    author: "Elena Rodriguez",
    role: "Operations VP",
    company: "Solaris CleanTech",
    location: "Melbourne, Australia",
    rating: 5
  },
  {
    id: 't_05',
    quote: "Our headless Shopify migration handled our flash sale traffic peaks without a hitch. Checkout conversion increased by 38%. Kapitech delivers genuine business results.",
    quoteId: "Migrasi Shopify headless kami menangani lonjakan traffic flash sale tanpa hambatan. Konversi checkout meningkat sebesar 38%. Kapitech memberikan hasil bisnis nyata.",
    author: "Julian Vane",
    role: "Founder & CEO",
    company: "Vivid Commerce",
    location: "Jakarta, Indonesia",
    rating: 5
  },
  {
    id: 't_06',
    quote: "Clear milestones, proactive communication, and zero technical fluff. Kapitech is our go-to partner whenever we need to launch a new digital product on a tight timeline.",
    quoteId: "Milestone yang jelas, komunikasi proaktif, dan tanpa basa-basi teknis. Kapitech adalah mitra andalan kami setiap kali kami perlu meluncurkan produk digital baru dalam jadwal ketat.",
    author: "Michael Kross",
    role: "Chief Technology Officer",
    company: "Kross Cloud Systems",
    location: "Kuala Lumpur, Malaysia",
    rating: 5
  }
];

export const defaultSiteMeta: SiteMetaSettings = {
  siteTitle: 'Kapitech — High-End Digital Experience & Engineering Studio',
  siteDescription: 'Leading design & engineering studio crafting bespoke digital products, brand identities, and high-performance web systems.',
  contactReceiverEmail: 'kapitechagency@gmail.com',
  defaultLanguage: 'id',
  enableLiveChat: true,
  enableSoundAlerts: true,
  maintenanceMode: false
};

// Dispatch change event
function notifyCmsUpdate(type: 'projects' | 'testimonials' | 'settings') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CMS_EVENT_KEY, { detail: { type } }));
  }
}

// -------------------------------------------------------------
// 1. Projects CMS Manager
// -------------------------------------------------------------
export function getCmsProjects(): ProjectItem[] {
  try {
    const raw = localStorage.getItem(CMS_PROJECTS_KEY);
    if (!raw) return allProjects;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : allProjects;
  } catch {
    return allProjects;
  }
}

export function saveCmsProject(project: ProjectItem): { success: boolean; project: ProjectItem } {
  const current = getCmsProjects();
  const exists = current.some(p => p.id === project.id);
  let updated: ProjectItem[];

  if (exists) {
    updated = current.map(p => p.id === project.id ? project : p);
  } else {
    updated = [project, ...current];
  }

  localStorage.setItem(CMS_PROJECTS_KEY, JSON.stringify(updated));
  notifyCmsUpdate('projects');
  return { success: true, project };
}

export function deleteCmsProject(id: string): boolean {
  const current = getCmsProjects();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(CMS_PROJECTS_KEY, JSON.stringify(updated));
  notifyCmsUpdate('projects');
  return true;
}

export function resetCmsProjectsToDefault() {
  localStorage.removeItem(CMS_PROJECTS_KEY);
  notifyCmsUpdate('projects');
}

// -------------------------------------------------------------
// 2. Testimonials CMS Manager
// -------------------------------------------------------------
export function getCmsTestimonials(): TestimonialItem[] {
  try {
    const raw = localStorage.getItem(CMS_TESTIMONIALS_KEY);
    if (!raw) return defaultTestimonials;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultTestimonials;
  } catch {
    return defaultTestimonials;
  }
}

export function saveCmsTestimonial(testimonial: TestimonialItem): { success: boolean; testimonial: TestimonialItem } {
  const current = getCmsTestimonials();
  const exists = current.some(t => t.id === testimonial.id);
  let updated: TestimonialItem[];

  if (exists) {
    updated = current.map(t => t.id === testimonial.id ? testimonial : t);
  } else {
    updated = [testimonial, ...current];
  }

  localStorage.setItem(CMS_TESTIMONIALS_KEY, JSON.stringify(updated));
  notifyCmsUpdate('testimonials');
  return { success: true, testimonial };
}

export function deleteCmsTestimonial(id: string): boolean {
  const current = getCmsTestimonials();
  const updated = current.filter(t => t.id !== id);
  localStorage.setItem(CMS_TESTIMONIALS_KEY, JSON.stringify(updated));
  notifyCmsUpdate('testimonials');
  return true;
}

// -------------------------------------------------------------
// 3. Site Meta & Configuration Manager
// -------------------------------------------------------------
export function getCmsSiteMeta(): SiteMetaSettings {
  try {
    const raw = localStorage.getItem(CMS_SETTINGS_KEY);
    if (!raw) return defaultSiteMeta;
    return { ...defaultSiteMeta, ...JSON.parse(raw) };
  } catch {
    return defaultSiteMeta;
  }
}

export function saveCmsSiteMeta(settings: Partial<SiteMetaSettings>): SiteMetaSettings {
  const current = getCmsSiteMeta();
  const updated = { ...current, ...settings };
  localStorage.setItem(CMS_SETTINGS_KEY, JSON.stringify(updated));
  notifyCmsUpdate('settings');
  return updated;
}
