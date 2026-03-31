import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X, Layout, Code2, Palette, Box } from 'lucide-react';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { MagneticButton } from '../components/ui/MagneticButton';

export const Work = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const projects = [
    {
      title: "Lumina Real Estate",
      category: "IT Development / UI/UX Design",
      image: "https://picsum.photos/seed/lumina/1200/800",
      desc: "Fragmented property search engineered into a high-fidelity portal, delivering a sub-second search experience for high-ticket listings.",
      challenge: "The existing platform suffered from high bounce rates due to a fragmented search experience and slow loading times for high-resolution property images. Users found it difficult to filter through thousands of listings efficiently.",
      solution: "We engineered a custom Next.js portal with optimized image delivery and integrated 3D walkthroughs. A real-time lead management system was built into the backend, allowing agents to respond to inquiries in seconds. We implemented a robust search engine with sub-second filtering capabilities.",
      results: "45% increase in user retention and a 30% boost in lead generation within the first quarter of launch. The platform now handles over 500k monthly visitors with peak performance.",
      roi: { conversion: "+30%", uptime: "99.9%", engagement: "+45%" },
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "AWS", "PostgreSQL"]
    },
    {
      title: "Aura Creative Studio",
      category: "Graphic Design / UI/UX Design",
      image: "https://picsum.photos/seed/aura/1200/800",
      desc: "Cluttered visual presence orchestrated into a sharp, charcoal-themed identity system that commands authority in the creative sector.",
      challenge: "Aura had a world-class portfolio but a digital presence that felt dated and cluttered, failing to attract high-ticket enterprise clients. Their brand message was lost in a sea of inconsistent visuals.",
      solution: "We orchestrated a minimalist, charcoal-themed identity system. We utilized Three.js for interactive 3D elements that showcase their avant-garde approach. The new design system was applied across all digital and physical touchpoints, ensuring absolute brand consistency.",
      results: "Secured 3 major enterprise contracts within months of the rebrand. Brand perception shifted towards 'premium' and 'innovative', leading to a 200% increase in high-ticket inquiries.",
      roi: { conversion: "+150%", uptime: "99.9%", engagement: "+80%" },
      technologies: ["Three.js", "Framer Motion", "Figma", "Adobe Illustrator"]
    },
    {
      title: "Nexus Fintech App",
      category: "IT Development / UI/UX Design",
      image: "https://picsum.photos/seed/nexus/1200/800",
      desc: "Complex financial data simplified into a frictionless UI/UX strategy, reducing onboarding drop-off by 85% through progressive disclosure.",
      challenge: "Users were overwhelmed by complex financial data, leading to a 60% drop-off rate during the onboarding process. The security protocols were also perceived as cumbersome by the user base.",
      solution: "We redesigned the entire user journey, implementing a 'progressive disclosure' strategy that simplifies complex data into digestible insights. We integrated biometric authentication to streamline security without compromising safety.",
      results: "Onboarding completion rate increased by 85%. The app now successfully manages transactions for over 100k active users with a 4.9-star rating on major app stores.",
      roi: { conversion: "+85%", uptime: "99.99%", engagement: "+60%" },
      technologies: ["React Native", "Node.js", "Biometric Auth", "MongoDB"]
    },
    {
      title: "Vanguard Logistics",
      category: "IT Development / UI/UX Design",
      image: "https://picsum.photos/seed/vanguard/1200/800",
      desc: "Data latency in supply chain tracking optimized by 40% using cloud-native ERP and edge computing for real-time global synchronization.",
      challenge: "Legacy systems caused significant data latency, making real-time supply chain tracking impossible for global operations. This led to inefficiencies and lost revenue in the millions.",
      solution: "We architected a cloud-native ERP using edge computing to ensure real-time data synchronization across global nodes. We built a custom dashboard for fleet managers to monitor assets in real-time with predictive maintenance alerts.",
      results: "Operational visibility improved by 40%, leading to a 15% reduction in logistics overhead costs. The system has successfully scaled to handle 10x the previous data volume.",
      roi: { conversion: "N/A", uptime: "99.99%", engagement: "+40%" },
      technologies: ["Go", "Edge Computing", "Docker", "Kubernetes", "React"]
    },
    {
      title: "Zenith Marketplace",
      category: "IT Development / Graphic Design",
      image: "https://picsum.photos/seed/zenith/1200/800",
      desc: "Luxury brand digital prestige engineered with headless CMS, ensuring sub-second load times and complete creative freedom for marketing teams.",
      challenge: "A luxury brand needed a digital storefront that matched their physical prestige while maintaining sub-second load times globally. Their previous platform was slow and difficult to update.",
      solution: "We implemented a headless CMS architecture with a React-based frontend, ensuring complete creative freedom and peak performance. We developed a custom visual editor for their marketing team to launch new collections in minutes.",
      results: "Page load times dropped to under 0.8s globally. Conversion rates for high-value items increased by 22%, and the brand saw a 50% increase in mobile-driven sales.",
      roi: { conversion: "+22%", uptime: "99.9%", engagement: "+35%" },
      technologies: ["Headless CMS", "React", "Shopify API", "Vercel"]
    },
    {
      title: "Titan Health",
      category: "IT Development / UI/UX Design",
      image: "https://picsum.photos/seed/titan/1200/800",
      desc: "Long wait times in healthcare apps solved with a high-performance, HIPAA-compliant interface and an optimized doctor-patient matching algorithm.",
      challenge: "Patients were frustrated by long wait times and a confusing interface that made scheduling urgent consultations difficult. Data privacy was also a major concern for the client.",
      solution: "We developed a secure, HIPAA-compliant interface with an optimized matching algorithm to connect users in under 60 seconds. We implemented end-to-end encryption for all patient-doctor communications.",
      results: "Patient satisfaction scores rose by 50%. The platform now handles 5,000+ consultations daily with zero downtime and zero security breaches.",
      roi: { conversion: "+50%", uptime: "100%", engagement: "+70%" },
      technologies: ["HIPAA-compliant API", "React", "Node.js", "AES-256 Encryption"]
    },
    {
      title: "Nova Gaming",
      category: "Graphic Design / UI/UX Design",
      image: "https://picsum.photos/seed/nova/1200/800",
      desc: "Low engagement in e-sports landing pages boosted with a dynamic interface featuring Framer Motion animations and real-time tournament integration.",
      challenge: "E-sports landing pages were static and failed to capture the high-energy nature of competitive gaming, resulting in low sign-up rates and poor community retention.",
      solution: "We developed a dynamic interface with Framer Motion animations and real-time tournament data integration. We built a custom community hub where players can track their stats and compete in mini-leagues.",
      results: "User engagement time increased by 120%. Tournament registrations saw a 40% year-over-year increase, and the community hub now has over 50k active members.",
      roi: { conversion: "+40%", uptime: "99.9%", engagement: "+120%" },
      technologies: ["Framer Motion", "WebSockets", "Figma", "After Effects"]
    },
    {
      title: "Pulse Analytics",
      category: "IT Development / UI/UX Design",
      image: "https://picsum.photos/seed/pulse/1200/800",
      desc: "Complex data silos for corporate decision-makers solved with a real-time visualization dashboard and an AI-driven insights engine.",
      challenge: "Corporate decision-makers were struggling with fragmented data silos that delayed critical business responses. The data was often outdated by the time it reached the executive board.",
      solution: "We engineered a real-time visualization dashboard that aggregates data from 20+ sources into a single, high-fidelity interface. We implemented an AI-driven insights engine that highlights anomalies and trends automatically.",
      results: "Decision-making speed improved by 60%. The dashboard is now the primary strategic tool for the executive board, leading to a 10% increase in overall operational efficiency.",
      roi: { conversion: "N/A", uptime: "99.99%", engagement: "+60%" },
      technologies: ["D3.js", "Python", "Node.js", "React", "BigQuery"]
    }
  ];

  const categories = ['All', 'IT Development', 'UI/UX Design', 'Graphic Design'];

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category.includes(activeFilter));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-black overflow-hidden"
    >
      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-5" 
             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-brand-red/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[700px] h-[700px] bg-blue-900/10 blur-[180px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 grid-bg opacity-10" />
      </div>

      <div className="relative z-10 pt-24 md:pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Creative Tech Studio</span>
              <h1 className="text-5xl sm:text-7xl md:text-[10vw] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient">
                Our Work.
              </h1>
              <p className="text-xl md:text-3xl text-white/40 max-w-3xl font-light leading-tight tracking-tight">
                A collection of high-impact digital solutions engineered for growth and designed to inspire.
              </p>
            </motion.div>
          </header>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-16 md:mb-24">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-8 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                  activeFilter === cat
                    ? 'bg-white border-white text-black'
                    : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, i) => (
                <motion.div 
                  key={project.title}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                  className="group relative cursor-pointer"
                >
                  <PerspectiveTilt 
                    className="overflow-hidden rounded-[2rem] aspect-[16/10] mb-8 relative"
                    onClick={() => setSelectedProject(project)}
                  >
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </PerspectiveTilt>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-display font-bold mb-3 group-hover:text-brand-red transition-colors">{project.title}</h3>
                      <p className="text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{project.category}</p>
                      <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm">{project.desc}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shrink-0">
                      <ArrowUpRight size={24} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Kinetic Typography */}
      <div className="absolute bottom-10 left-0 w-full kinetic-text opacity-5 select-none pointer-events-none">
        <div className="kinetic-track text-[8vh] md:text-[15vh] font-display font-black uppercase tracking-tighter">
          <span>Creative Tech Studio • UI/UX Design • IT Development • Graphic Design • </span>
          <span>Creative Tech Studio • UI/UX Design • IT Development • Graphic Design • </span>
        </div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col overflow-y-auto"
          >
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed top-6 right-6 md:top-12 md:right-12 z-[110] p-3 md:p-4 rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all"
            >
              <X size={24} className="md:w-8 md:h-8" />
            </motion.button>

            <div className="w-full h-[50vh] md:h-[70vh] relative">
              <motion.img 
                layoutId={`img-${selectedProject.title}`}
                src={selectedProject.image} 
                alt={selectedProject.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-12 left-6 md:bottom-20 md:left-12">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-brand-red font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block"
                >
                  {selectedProject.category}
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl sm:text-6xl md:text-[10vw] font-display font-bold tracking-tighter leading-none"
                >
                  {selectedProject.title}
                </motion.h2>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-32 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
              <div className="md:col-span-2">
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 text-brand-red">The Challenge.</h3>
                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed mb-12 md:mb-16">
                  {selectedProject.challenge}
                </p>
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 text-brand-red">The Solution.</h3>
                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed mb-12 md:mb-16">
                  {selectedProject.solution}
                </p>
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 text-brand-red">The Results.</h3>
                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed italic border-l-2 border-brand-red pl-6">
                  {selectedProject.results}
                </p>
              </div>
              <div className="space-y-12">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-4">Technologies</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech: string) => (
                      <span key={tech} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-4">Key Metrics</span>
                  <div className="space-y-6">
                    <div>
                      <span className="text-3xl md:text-4xl font-display font-bold block">{selectedProject.roi.conversion}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red">Conversion Rate</span>
                    </div>
                    <div>
                      <span className="text-3xl md:text-4xl font-display font-bold block">{selectedProject.roi.engagement}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red">User Engagement</span>
                    </div>
                  </div>
                </div>
                <MagneticButton>
                  <button className="px-10 py-5 bg-white text-black rounded-full font-bold flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs">
                    View Project <ArrowUpRight size={20} />
                  </button>
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
