import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';

export const Work = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const projects = [
    {
      title: "Lumina Real Estate",
      category: "Web Development / UI Design",
      image: "https://picsum.photos/seed/lumina/1200/800",
      desc: "Fragmented property search engineered into a high-fidelity portal.",
      challenge: "The existing platform suffered from high bounce rates due to a fragmented search experience and slow loading times for high-resolution property images.",
      solution: "We engineered a custom Next.js portal with optimized image delivery and integrated 3D walkthroughs. A real-time lead management system was built into the backend.",
      results: "45% increase in user retention and a 30% boost in lead generation within the first quarter of launch.",
      roi: { conversion: "+30%", uptime: "99.9%", engagement: "+45%" }
    },
    {
      title: "Aura Creative Studio",
      category: "Branding / 3D Visuals",
      image: "https://picsum.photos/seed/aura/1200/800",
      desc: "Cluttered visual presence orchestrated into a sharp identity system.",
      challenge: "Aura had a world-class portfolio but a digital presence that felt dated and cluttered, failing to attract high-ticket enterprise clients.",
      solution: "We orchestrated a minimalist, charcoal-themed identity system. We utilized Three.js for interactive 3D elements that showcase their avant-garde approach.",
      results: "Secured 3 major enterprise contracts within months of the rebrand. Brand perception shifted towards 'premium' and 'innovative'.",
      roi: { conversion: "+150%", uptime: "99.9%", engagement: "+80%" }
    },
    {
      title: "Nexus Fintech App",
      category: "Mobile App / Product Strategy",
      image: "https://picsum.photos/seed/nexus/1200/800",
      desc: "Complex financial data simplified into a frictionless UI/UX strategy.",
      challenge: "Users were overwhelmed by complex financial data, leading to a 60% drop-off rate during the onboarding process.",
      solution: "We redesigned the entire user journey, implementing a 'progressive disclosure' strategy that simplifies complex data into digestible insights.",
      results: "Onboarding completion rate increased by 85%. The app now successfully manages transactions for over 100k active users.",
      roi: { conversion: "+85%", uptime: "99.99%", engagement: "+60%" }
    },
    {
      title: "Vanguard Logistics",
      category: "Enterprise System / Dashboard",
      image: "https://picsum.photos/seed/vanguard/1200/800",
      desc: "Data latency in supply chain tracking optimized by 40%.",
      challenge: "Legacy systems caused significant data latency, making real-time supply chain tracking impossible for global operations.",
      solution: "We architected a cloud-native ERP using edge computing to ensure real-time data synchronization across global nodes.",
      results: "Operational visibility improved by 40%, leading to a 15% reduction in logistics overhead costs.",
      roi: { conversion: "N/A", uptime: "99.99%", engagement: "+40%" }
    },
    {
      title: "Zenith Marketplace",
      category: "E-commerce / UX Design",
      image: "https://picsum.photos/seed/zenith/1200/800",
      desc: "Luxury brand digital prestige engineered with headless CMS.",
      challenge: "A luxury brand needed a digital storefront that matched their physical prestige while maintaining sub-second load times globally.",
      solution: "We implemented a headless CMS architecture with a React-based frontend, ensuring complete creative freedom and peak performance.",
      results: "Page load times dropped to under 0.8s globally. Conversion rates for high-value items increased by 22%.",
      roi: { conversion: "+22%", uptime: "99.9%", engagement: "+35%" }
    },
    {
      title: "Titan Health",
      category: "Telemedicine / UI Design",
      image: "https://picsum.photos/seed/titan/1200/800",
      desc: "Long wait times in healthcare apps solved with high-performance interface.",
      challenge: "Patients were frustrated by long wait times and a confusing interface that made scheduling urgent consultations difficult.",
      solution: "We developed a secure, high-performance interface with an optimized matching algorithm to connect users in under 60 seconds.",
      results: "Patient satisfaction scores rose by 50%. The platform now handles 5,000+ consultations daily with zero downtime.",
      roi: { conversion: "+50%", uptime: "100%", engagement: "+70%" }
    },
    {
      title: "Nova Gaming",
      category: "Web Design / Animation",
      image: "https://picsum.photos/seed/nova/1200/800",
      desc: "Low engagement in e-sports landing pages boosted with dynamic interface.",
      challenge: "E-sports landing pages were static and failed to capture the high-energy nature of competitive gaming, resulting in low sign-up rates.",
      solution: "We developed a dynamic interface with Framer Motion animations and real-time tournament data integration.",
      results: "User engagement time increased by 120%. Tournament registrations saw a 40% year-over-year increase.",
      roi: { conversion: "+40%", uptime: "99.9%", engagement: "+120%" }
    },
    {
      title: "Pulse Analytics",
      category: "Data Visualization / Dashboard",
      image: "https://picsum.photos/seed/pulse/1200/800",
      desc: "Complex data silos for corporate decision-makers solved with real-time dashboard.",
      challenge: "Corporate decision-makers were struggling with fragmented data silos that delayed critical business responses.",
      solution: "We engineered a real-time visualization dashboard that aggregates data from 20+ sources into a single, high-fidelity interface.",
      results: "Decision-making speed improved by 60%. The dashboard is now the primary strategic tool for the executive board.",
      roi: { conversion: "N/A", uptime: "99.99%", engagement: "+60%" }
    }
  ];

  const categories = ['All', ...new Set(projects.map(p => p.category.split(' / ')[0]))];

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category.startsWith(activeFilter));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-20 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <span className="text-brand-red font-bold tracking-widest uppercase text-sm mb-4 block">Our Portfolio</span>
          <h1 className="text-6xl md:text-[8vw] font-display font-bold leading-[0.9] tracking-tighter mb-8">
            Our Work.
          </h1>
          <p className="text-white/50 text-xl md:text-2xl max-w-3xl font-light leading-relaxed">
            A collection of high-impact digital solutions engineered for growth and designed to inspire.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-24">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                activeFilter === cat
                  ? 'bg-brand-red border-brand-red text-white'
                  : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <motion.div 
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="overflow-hidden rounded-3xl aspect-[16/9] mb-10">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-display font-bold mb-4">{project.title}</h3>
                    <p className="text-white/40 uppercase tracking-widest font-bold text-xs mb-4">{project.category}</p>
                    <p className="text-white/60 text-sm leading-relaxed max-w-md">{project.desc}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shrink-0">
                    <ArrowUpRight size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 w-full max-w-6xl max-h-[90vh] rounded-[2rem] overflow-hidden relative border border-white/10 flex flex-col lg:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
              >
                <X size={24} />
              </button>

              <div className="lg:w-1/2 h-64 lg:h-auto overflow-hidden">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:w-1/2 p-8 md:p-16 overflow-y-auto custom-scrollbar">
                <span className="text-brand-red font-bold tracking-widest uppercase text-xs mb-4 block">Case Study</span>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">{selectedProject.title}</h2>
                <p className="text-white/40 uppercase tracking-widest font-bold text-xs mb-12">{selectedProject.category}</p>
                
                <div className="space-y-12">
                  <div>
                    <h4 className="text-brand-red font-bold uppercase tracking-widest text-xs mb-4">The Challenge</h4>
                    <p className="text-white/70 text-lg leading-relaxed">{selectedProject.challenge}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-brand-red font-bold uppercase tracking-widest text-xs mb-4">The Solution</h4>
                    <p className="text-white/70 text-lg leading-relaxed">{selectedProject.solution}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-brand-red font-bold uppercase tracking-widest text-xs mb-4">The Results</h4>
                    <p className="text-white/70 text-lg leading-relaxed italic border-l-2 border-brand-red pl-6 mb-8">{selectedProject.results}</p>
                    
                    <div className="grid grid-cols-3 gap-4 py-8 border-y border-white/5">
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Conversion</p>
                        <p className="text-2xl font-display font-bold text-white">{selectedProject.roi.conversion}</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Uptime</p>
                        <p className="text-2xl font-display font-bold text-white">{selectedProject.roi.uptime}</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-1">Engagement</p>
                        <p className="text-2xl font-display font-bold text-white">{selectedProject.roi.engagement}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-16 pt-12 border-t border-white/10">
                  <button className="flex items-center gap-4 text-white font-bold uppercase tracking-widest text-sm group">
                    View Live Project
                    <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
