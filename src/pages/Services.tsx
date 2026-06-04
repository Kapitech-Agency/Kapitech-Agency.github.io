import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Code2, Palette, Box, CheckCircle2, Cpu, Globe, ArrowUpRight, X, Zap, Shield, Rocket, Activity, FileText, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { MagneticButton } from '../components/ui/MagneticButton';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { cn } from '../lib/utils';

import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';

export const Services = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-modal-open', 'true');
    } else {
      document.body.style.overflow = 'unset';
      document.body.removeAttribute('data-modal-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.removeAttribute('data-modal-open');
    };
  }, [selectedService]);

  const services = [
      {
        icon: <Palette size={32} />,
        title: "Branding",
        desc: "We build brands that define markets. Visual identity systems, strategic positioning, and immersive storytelling.",
        detailedDesc: "We create comprehensive branding solutions that define your market presence. From logo design to complete brand identity systems.",
        approach: "Strategic analysis. Visual exploration. Identity documentation. Asset production.",
        outcomes: [
          "Brand Authority",
          "Visual Consistency",
          "Market Recognition",
          "Asset Scalability"
        ],
        features: [
          "Brand Identity",
          "Logo Design",
          "Graphic Design",
          "Pitch Deck Design",
          "Brand Guidelines",
          "Visual Strategy"
        ],
        subServices: [
          { title: "Identity", desc: "Core brand systems.", icon: <Zap size={20} /> },
          { title: "Graphics", desc: "Technical visual assets.", icon: <Shield size={20} /> },
          { title: "Strategy", desc: "Market positioning.", icon: <Rocket size={20} /> }
        ],
        tech: ["Figma", "Illustrator", "Photoshop", "InDesign"],
        industries: ["Startups", "Enterprise", "Fintech", "Web3"],
        accent: "from-brand-red/20 to-orange-500/20",
        image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=2071"
      },
      {
        icon: <Layout size={32} />,
        title: "Design",
        desc: "High-fidelity digital products. UI/UX design, mobile experiences, and complex interface systems.",
        detailedDesc: "User-centric design process for web and mobile platforms. We bridge the gap between complex technology and human experience.",
        approach: "User research. Wireframing. UI/UX design. Prototyping and validation.",
        outcomes: [
          "User Engagement",
          "Interface Clarity",
          "Conversion Optimization",
          "Mobile Excellence"
        ],
        features: [
          "UI/UX Design",
          "Web Design",
          "Mobile App Design",
          "Website Redesign",
          "Design Systems",
          "User Research"
        ],
        subServices: [
          { title: "UI Design", desc: "High-fidelity interfaces.", icon: <Zap size={20} /> },
          { title: "UX Design", desc: "User journey mapping.", icon: <Shield size={20} /> },
          { title: "Web Design", desc: "Responsive architectures.", icon: <Rocket size={20} /> }
        ],
        tech: ["Figma", "Adobe XD", "Sketch", "Miro"],
        industries: ["SaaS", "Fintech", "E-commerce", "AI"],
        accent: "from-blue-500/20 to-brand-red/20",
        image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=2070"
      },
      {
        icon: <Code2 size={32} />,
        title: "Development",
        desc: "Scalable technical infrastructure. Full-stack engineering, cloud architecture, and performance-first codebases.",
        detailedDesc: "We deploy high-performance codebases for enterprise and startups. Custom software solutions engineered for growth.",
        approach: "Technical audit. Architecture design. Agile engineering. Deployment and scaling.",
        outcomes: [
          "System Stability",
          "High Performance",
          "Security Hardening",
          "Technical Scalability"
        ],
        features: [
          "Web Development",
          "MVP Development",
          "WebFlow Development",
          "Landing Pages",
          "Mobile Development",
          "Backend Systems"
        ],
        subServices: [
          { title: "Web Dev", desc: "Next.js & React systems.", icon: <Zap size={20} /> },
          { title: "Mobile Dev", desc: "Native & Hybrid apps.", icon: <Shield size={20} /> },
          { title: "MVP Dev", desc: "Rapid market entry.", icon: <Rocket size={20} /> }
        ],
        tech: ["Next.js", "React", "Node.js", "TypeScript", "Tailwind", "AWS"],
        industries: ["Enterprise", "SaaS", "Blockchain", "Fintech"],
        accent: "from-purple-500/20 to-brand-red/20",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070"
      }
  ];

  const process = [
    {
      step: "01",
      title: "Discovery",
      desc: "Deep-dive analysis of market positioning and technical requirements. Foundation building.",
      icon: <Activity size={24} />,
      details: ["Market Research", "Technical Audit", "Business Goals", "Strategic Roadmap"]
    },
    {
      step: "02",
      title: "Strategy",
      desc: "Architecting the digital foundation. User journey mapping and technical blueprints.",
      icon: <Layout size={24} />,
      details: ["UX Strategy", "System Mapping", "IA Design", "Technical Specs"]
    },
    {
      step: "03",
      title: "Design",
      desc: "Developing high-fidelity interface systems and immersive visual narratives.",
      icon: <Palette size={24} />,
      details: ["UI Design", "Design Systems", "Prototyping", "Visual ID"]
    },
    {
      step: "04",
      title: "Development",
      desc: "Deployment of scalable, performance-first codebases. Enterprise-grade security.",
      icon: <Code2 size={24} />,
      details: ["Frontend Dev", "Backend Systems", "API Integration", "Cloud Setup"]
    },
    {
      step: "05",
      title: "Launch",
      desc: "Rigorous performance auditing and cross-platform validation. Ensuring integrity.",
      icon: <Shield size={24} />,
      details: ["QA Testing", "Performance Audit", "Security Check", "Deployment"]
    },
    {
      step: "06",
      title: "Support",
      desc: "Data-driven optimization and long-term maintenance. Scaling systems.",
      icon: <Rocket size={24} />,
      details: ["Monitoring", "Optimization", "Maintenance", "Scaling"]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-black"
    >
      {/* Atmospheric Background */}
      <AtmosphericBackground 
        imageUrl="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
        opacity={0.15}
      />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="px-6 md:px-12 py-24 md:py-48 overflow-hidden relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-brand-red/30" />
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px]">Services</span>
              </div>
              <h1 className="text-[clamp(2.25rem,8vw,5.5rem)] font-display font-bold leading-[0.85] tracking-tighter mb-12 uppercase">
                Digital design experts<br />who fuel growth.
              </h1>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
                <div className="lg:col-span-7">
                  <p className="text-xl md:text-3xl text-white/40 font-light leading-tight tracking-tight max-w-2xl">
                    We help companies to build and scale digital products. Our team of experts provides strategic <span className="text-white">Branding</span>, <span className="text-white">Design</span>, and <span className="text-white">Development</span> services to drive business results.
                  </p>
                </div>
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 blur-3xl -mr-16 -mt-16" />
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">Status</span>
                    </div>
                    <div className="text-2xl font-display font-bold text-white uppercase">Available for work</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Service Matrix Visual */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 hidden lg:block pointer-events-none">
              <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.1, 0.5, 0.1] }}
                    transition={{ duration: 3, delay: i * 0.1, repeat: Infinity }}
                    className="border border-white/20 rounded-sm"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Service Grid Section */}
          <section className="py-24 md:py-48 px-6 md:px-12 bg-zinc-950/30 relative overflow-hidden border-y border-white/5">
            {/* Technical Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />
              <div className="absolute inset-0 grid-bg opacity-[0.03]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 md:mb-32">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-px bg-brand-red/40" />
                    <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px]">What We Do</span>
                  </div>
                  <h2 className="text-[clamp(1.75rem,5vw,3.5rem)] font-display font-bold tracking-tighter leading-none uppercase">
                    Core<br />
                    <span className="text-brand-red">Services.</span>
                  </h2>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Availability</span>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest">Ready to Start</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
                {services.map((service, i) => (
                  <div key={service.title} className="h-full">
                    <PerspectiveTilt 
                      className="h-full"
                      onClick={() => setSelectedService(service)}
                    >
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        onMouseEnter={() => setHoveredService(service.title)}
                        onMouseLeave={() => setHoveredService(null)}
                        className="group relative h-full cursor-pointer"
                      >
                        {/* Technical Border Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem] blur-2xl -z-10" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                        
                        <div className={cn(
                          "p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-zinc-900/50 backdrop-blur-sm border border-white/5 transition-all duration-500 flex flex-col h-full overflow-hidden relative",
                          hoveredService === service.title ? "border-brand-red/30" : ""
                        )}>
                          {/* Corner Accents */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10 rounded-tl-[2rem] group-hover:border-brand-red/40 transition-colors" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10 rounded-br-[2rem] group-hover:border-brand-red/40 transition-colors" />

                          <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                            service.accent
                          )} />
                          
                          <motion.div 
                            layoutId={`icon-${service.title}`}
                            className="text-brand-red mb-8 w-14 h-14 rounded-2xl bg-brand-red/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-red group-hover:text-white transition-all duration-500"
                          >
                            {service.icon}
                          </motion.div>
                          
                          <motion.h3 
                            layoutId={`title-${service.title}`}
                            className="text-xl md:text-2xl font-display font-bold mb-4 group-hover:text-brand-red transition-colors uppercase tracking-tight"
                          >
                            {service.title}
                          </motion.h3>
                          <p className="text-white/40 text-sm md:text-base leading-relaxed mb-8 flex-grow group-hover:text-white/60 transition-colors font-light">{service.desc}</p>
                          
                          <div className="space-y-3 mb-8">
                            {service.features.slice(0, 3).map((feature: string) => (
                              <div key={feature} className="flex items-center gap-3 text-[12px] text-white/50">
                                <CheckCircle2 size={12} className="text-brand-red shrink-0" />
                                <span className="group-hover:text-white/80 transition-colors font-light">{feature}</span>
                              </div>
                            ))}
                          </div>
      
                          <div className="pt-6 border-t border-white/5">
                            <div className="flex flex-wrap gap-2">
                              {service.tech.slice(0, 3).map((t: string) => (
                                <span key={t} className="px-2 py-1 rounded-md bg-white/5 text-[8px] font-mono font-bold uppercase tracking-widest text-white/30 group-hover:text-white/60 group-hover:bg-white/10 transition-all">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
      
                          <div className="mt-6 flex items-center gap-2 text-brand-red font-mono font-bold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                            View Specs <ArrowUpRight size={12} />
                          </div>
                        </div>
                      </motion.div>
                    </PerspectiveTilt>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Service Detail Modal - Full Screen Immersive */}
          <AnimatePresence>
            {selectedService && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col overflow-y-auto"
              >
                <motion.button 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedService(null)}
                  className="fixed top-6 right-6 md:top-12 md:right-12 z-[10000] p-3 md:p-4 rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all"
                >
                  <X size={24} className="md:w-8 md:h-8" />
                </motion.button>

                {/* Hero Section */}
                <div className="w-full h-[80vh] md:h-[95vh] relative shrink-0 overflow-hidden">
                  <motion.div 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={selectedService.image} 
                      alt={selectedService.title} 
                      className="w-full h-full object-cover opacity-40"
                    />
                  </motion.div>
                  
                  {/* Dynamic Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,99,33,0.1)_0%,transparent_50%)]" />
                  
                  <div className="absolute bottom-12 left-6 md:bottom-24 md:left-12 max-w-7xl w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-8"
                    >
                      <div className="flex items-center gap-6">
                        <motion.div 
                          layoutId={`icon-${selectedService.title}`}
                          className="text-brand-red w-20 h-20 md:w-28 md:h-28 rounded-[2rem] bg-brand-red/10 flex items-center justify-center backdrop-blur-2xl border border-brand-red/20 shadow-[0_0_50px_-12px_rgba(255,99,33,0.3)]"
                        >
                          {React.cloneElement(selectedService.icon as React.ReactElement, { size: 48 })}
                        </motion.div>
                        <div className="h-px w-24 bg-brand-red/30 hidden md:block" />
                        <span className="text-brand-red font-mono font-bold tracking-[0.5em] uppercase text-[10px] md:text-xs">Selected Category</span>
                      </div>

                      <motion.h2 
                        layoutId={`title-${selectedService.title}`}
                        className="text-[clamp(2.5rem,8vw,6rem)] font-display font-bold tracking-tighter leading-[0.85] text-white relative uppercase"
                      >
                        <span className="absolute -top-1/4 left-0 text-[clamp(4rem,12vw,10rem)] opacity-5 select-none pointer-events-none font-black text-brand-red">
                          {selectedService.title.split(' ')[0]}
                        </span>
                        {selectedService.title.split(' ').map((word: string, i: number) => (
                          <span key={i} className="block relative z-10">{word}</span>
                        ))}
                      </motion.h2>

                      <div className="flex flex-wrap gap-2 md:gap-3 pt-8">
                        {selectedService.tech.map((t: string, i: number) => (
                          <motion.span 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + (i * 0.05) }}
                            key={t} 
                            className="px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/60 backdrop-blur-xl hover:bg-brand-red hover:text-white hover:border-brand-red transition-all cursor-default"
                          >
                            {t}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Scroll Indicator */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 right-12 hidden md:flex flex-col items-center gap-4"
                  >
                    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 vertical-text">Scroll to Explore</span>
                    <div className="w-px h-12 bg-gradient-to-b from-brand-red to-transparent" />
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="relative z-10 bg-black">
                  <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                      <div className="lg:col-span-8 space-y-16 md:space-y-20">
                        {/* Overview & Approach Integrated */}
                        <div className="space-y-24 md:space-y-32">
                          <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                          >
                            <div className="absolute -left-12 top-0 w-px h-full bg-brand-red/20 hidden xl:block" />
                            <span className="text-brand-red font-mono font-bold tracking-[0.5em] uppercase text-[10px] mb-8 block">Overview</span>
                            <p className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-[0.95] tracking-tighter max-w-4xl uppercase">
                              {selectedService.detailedDesc}
                            </p>
                          </motion.section>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <motion.section
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              className="space-y-6"
                            >
                              <span className="text-brand-red font-mono font-bold tracking-[0.5em] uppercase text-[10px] block">Implementation Strategy</span>
                              <h3 className="text-2xl md:text-3xl font-display font-bold tracking-tight uppercase">Strategic execution.</h3>
                              <p className="text-base md:text-lg text-white/50 font-light leading-relaxed">
                                {selectedService.approach}
                              </p>
                            </motion.section>

                            <motion.section
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.1 }}
                              className="p-8 md:p-10 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 relative overflow-hidden group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                              <div className="relative z-10">
                                <h4 className="text-brand-red font-mono font-bold text-xs uppercase tracking-widest mb-4">Key Objective</h4>
                                <p className="text-xl text-white font-medium leading-snug">
                                  Delivery of digital ecosystems. Industry authority. Technical precision.
                                </p>
                              </div>
                            </motion.section>
                          </div>
                        </div>

                        {/* Sub-services Bento Grid */}
                        <motion.section 
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="space-y-12"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div>
                              <span className="text-brand-red font-mono font-bold tracking-[0.5em] uppercase text-[10px] mb-4 block">Core Modules</span>
                              <h3 className="text-4xl font-display font-bold tracking-tight uppercase">What's Included.</h3>
                            </div>
                            <p className="text-white/40 max-w-xs text-sm font-light leading-relaxed">
                              Bespoke solutions engineered for demanding digital environments.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {selectedService.subServices.map((sub: any, i: number) => (
                              <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 hover:border-brand-red/30 transition-all duration-500 group relative overflow-hidden flex flex-col h-full"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <div className="relative z-10">
                                  <div className="text-brand-red mb-8 w-14 h-14 rounded-2xl bg-brand-red/5 flex items-center justify-center border border-brand-red/10 group-hover:bg-brand-red group-hover:text-white transition-all duration-500">
                                    {sub.icon}
                                  </div>
                                  <h4 className="text-xl font-display font-bold mb-4 group-hover:text-brand-red transition-colors uppercase">{sub.title}</h4>
                                  <p className="text-sm text-white/40 leading-relaxed font-light group-hover:text-white/60 transition-colors">{sub.desc}</p>
                                </div>

                                <div className="mt-auto pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                  <div className="w-8 h-px bg-brand-red/50" />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.section>

                        {/* Technical Deep Dive / Metrics */}
                        <motion.section
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="space-y-12"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-brand-red font-mono font-bold tracking-[0.5em] uppercase text-[10px] block">Key Benefits</span>
                            <div className="h-px flex-grow mx-8 bg-white/5 hidden md:block" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {selectedService.outcomes.map((outcome: string, i: number) => (
                              <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-zinc-900/10 border border-white/5 flex flex-col items-start gap-6 md:gap-8 group hover:bg-zinc-900/30 hover:border-brand-red/30 transition-all duration-700 relative overflow-hidden"
                              >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center group-hover:bg-brand-red transition-all duration-500 relative z-10">
                                  <CheckCircle2 size={18} className="text-brand-red group-hover:text-white transition-colors" />
                                </div>
                                <div className="space-y-2 relative z-10">
                                  <span className="text-[9px] md:text-[10px] font-mono font-bold text-brand-red uppercase tracking-[0.2em]">Outcome 0{i + 1}</span>
                                  <h4 className="text-base md:text-lg font-bold text-white/60 group-hover:text-white transition-colors leading-tight uppercase tracking-tight">{outcome}</h4>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.section>

                        {/* Methodology Section */}
                        <motion.section
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="p-12 md:p-16 rounded-[3rem] bg-zinc-900/20 border border-white/5 relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 blur-[100px] -mr-32 -mt-32" />
                          <div className="relative z-10">
                            <span className="text-brand-red font-mono font-bold tracking-[0.5em] uppercase text-[10px] block mb-12">Our Methodology</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div className="space-y-8">
                                <h3 className="text-2xl font-display font-bold uppercase">Core Approach</h3>
                                <div className="space-y-4">
                                  {[
                                    { label: "Deployment Protocol", value: "CI/CD Automated" },
                                    { label: "Security Layer", value: "Enterprise Grade" },
                                    { label: "Architecture", value: "Scalable Systems" },
                                    { label: "Performance", value: "Optimized" }
                                  ].map((spec) => (
                                    <div key={spec.label} className="flex justify-between items-center py-4 border-b border-white/5">
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/20">{spec.label}</span>
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">{spec.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-8">
                                <h4 className="text-2xl font-display font-bold uppercase">Delivery Standards</h4>
                                <div className="space-y-4">
                                  {[
                                    { label: "Uptime Guarantee", value: "99.99% SLA" },
                                    { label: "Support Protocol", value: "L3 Technical" },
                                    { label: "Documentation", value: "Full SOP Library" },
                                    { label: "Scaling Model", value: "Horizontal / Auto" }
                                  ].map((spec) => (
                                    <div key={spec.label} className="flex justify-between items-center py-4 border-b border-white/5">
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/20">{spec.label}</span>
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">{spec.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.section>
                      </div>

                      <div className="lg:col-span-4 space-y-8 md:space-y-12">
                        {/* Compact Sidebar */}
                        <div className="sticky top-24 space-y-4 md:space-y-6">
                          {/* Deliverables List */}
                          <motion.section 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 backdrop-blur-xl relative overflow-hidden group"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 blur-3xl -mr-16 -mt-16" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-brand-red block mb-8">Deliverables</span>
                            <div className="space-y-3">
                              {selectedService.features.map((feature: string) => (
                                <motion.div 
                                  key={feature} 
                                  whileHover={{ x: 5 }}
                                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-red/30 hover:bg-white/[0.05] transition-all group/item"
                                >
                                  <div className="w-6 h-6 rounded-lg bg-brand-red/10 flex items-center justify-center group-hover/item:bg-brand-red transition-colors">
                                    <CheckCircle2 size={12} className="text-brand-red group-hover/item:text-white transition-colors" />
                                  </div>
                                  <span className="text-xs font-mono font-medium text-white/50 group-hover/item:text-white transition-colors">{feature}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.section>

                          {/* Industry & Tech Mix */}
                          <motion.section 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="p-8 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 backdrop-blur-xl"
                          >
                            <div className="mb-10">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 block mb-6">Target Industries</span>
                              <div className="flex flex-wrap gap-2">
                                {selectedService.industries.map((industry: string) => (
                                  <span key={industry} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 hover:text-white hover:border-white/20 transition-all cursor-default">
                                    {industry}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 block mb-6">Tech Ecosystem</span>
                              <div className="flex flex-wrap gap-2">
                                {selectedService.tech.slice(0, 8).map((t: string) => (
                                  <span key={t} className="px-4 py-2 rounded-xl bg-brand-red/5 border border-brand-red/10 text-[10px] font-mono text-brand-red/60 font-bold uppercase tracking-widest">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.section>

                          {/* High-Impact CTA */}
                          <motion.section 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-[3rem] bg-brand-red border border-brand-red shadow-[0_20px_50px_-12px_rgba(255,59,59,0.3)] relative overflow-hidden group cursor-pointer"
                            onClick={() => {
                              setSelectedService(null);
                              navigate('/contact');
                            }}
                          >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
                            <div className="relative z-10 space-y-6">
                              <h4 className="text-3xl font-display font-bold text-white leading-tight tracking-tighter uppercase">Start Your Project.</h4>
                              <p className="text-white/80 text-sm font-light leading-relaxed">
                                Ready to elevate your business? Contact us to discuss your project requirements and goals.
                              </p>
                              <div className="pt-4">
                                <div className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-[10px] group-hover:bg-black group-hover:text-white transition-all duration-500">
                                  Start Now <ArrowUpRight size={16} />
                                </div>
                              </div>
                            </div>
                          </motion.section>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Space */}
                <div className="h-40 shrink-0 bg-black" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Technical Authority Section */}
          <section className="py-20 md:py-40 px-6 md:px-12 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20">
              <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-brand-red/50 via-transparent to-transparent" />
            </div>
            
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                  <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">Our Standards</span>
                  <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-8 leading-tight uppercase">
                    Built for<br />Reliability.
                  </h2>
                  <p className="text-lg text-white/40 font-light leading-relaxed mb-12 max-w-xl">
                    We focus on delivering digital products with operational stability. Our team integrates technical design with reliable engineering for client success.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-8">
                    {[
                      { label: "Reliability", value: "99.9%", icon: <Activity size={20} /> },
                      { label: "Security", value: "Standard", icon: <Shield size={20} /> },
                      { label: "Performance", value: "Fast", icon: <Zap size={20} /> },
                      { label: "Support", value: "Direct", icon: <Globe size={20} /> }
                    ].map((stat) => (
                      <div key={stat.label} className="space-y-2">
                        <div className="flex items-center gap-2 text-brand-red">
                          {stat.icon}
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-display font-bold text-white">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-red/10 blur-[120px] rounded-full" />
                  <div className="relative p-8 md:p-12 rounded-[3rem] bg-zinc-900/40 backdrop-blur-2xl border border-white/5 overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent" />
                    
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/20">Agency Status</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500">Online</span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {[
                          { label: "IT Development", status: "Available", progress: 100 },
                          { label: "UI/UX Design", status: "Available", progress: 100 },
                          { label: "Graphic Design", status: "Available", progress: 100 },
                          { label: "Client Support", status: "Active", progress: 100 }
                        ].map((item) => (
                          <div key={item.label} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest">
                              <span className="text-white/40">{item.label}</span>
                              <span className="text-brand-red">{item.status}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-brand-red"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Service Comparison Section */}
          <section className="py-20 md:py-40 px-6 md:px-12 bg-black border-y border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Market Comparison</span>
                <h2 className="text-4xl md:text-7xl font-display font-bold tracking-tighter uppercase">Competitive Analysis.</h2>
              </div>
              
              <div className="overflow-x-auto pb-8">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-10 px-8 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/20">Service Feature</th>
                      <th className="py-10 px-8 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-brand-red bg-brand-red/5 rounded-t-3xl">Kapitech Agency</th>
                      <th className="py-10 px-8 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/20">Standard Agency</th>
                      <th className="py-10 px-8 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/20">Freelancers</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { feature: "Technical Architecture", kapitech: "Custom & Scalable", standard: "Standard", freelance: "Basic" },
                      { feature: "Design Quality", kapitech: "User-Centric Design", standard: "Standard UI", freelance: "Template-Based" },
                      { feature: "Performance", kapitech: "Optimized for Speed", standard: "Standard", freelance: "Variable" },
                      { feature: "Strategic Planning", kapitech: "Included", standard: "Optional", freelance: "None" },
                      { feature: "Future-Proofing", kapitech: "Built-in", standard: "Limited", freelance: "None" },
                      { feature: "Security Standards", kapitech: "Best Practices", standard: "Basic", freelance: "None" },
                      { feature: "Documentation", kapitech: "Comprehensive", standard: "Basic", freelance: "Minimal" }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-8 px-8 font-bold text-white/40 group-hover:text-white transition-colors">{row.feature}</td>
                        <td className="py-8 px-8 text-brand-red font-mono font-bold bg-brand-red/[0.02] border-x border-brand-red/10">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 size={14} />
                            {row.kapitech}
                          </div>
                        </td>
                        <td className="py-8 px-8 text-white/30 font-mono">{row.standard}</td>
                        <td className="py-8 px-8 text-white/20 font-mono">{row.freelance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Process Section */}
          <section className="py-24 md:py-48 px-6 md:px-12 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20 md:mb-32">
              <div>
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Process</span>
                <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-display font-bold tracking-tighter uppercase leading-none">How We<br />Work.</h2>
              </div>
              <p className="text-white/40 max-w-md text-sm md:text-lg font-light leading-relaxed">
                A simple and effective approach to deliver the best results for your brand and product.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 relative">
              {/* Connecting Lines (Desktop) */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 hidden lg:block -translate-y-1/2 pointer-events-none" />
              
              {process.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ 
                    duration: 0.8, 
                    delay: i * 0.1,
                    ease: [0.215, 0.61, 0.355, 1]
                  }}
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  className="p-10 rounded-[3rem] bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-brand-red/30 transition-all duration-500 group relative overflow-hidden flex flex-col h-full"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Top Accent Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex justify-between items-start mb-10 relative z-10">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-brand-red/20 group-hover:bg-brand-red/5 transition-all duration-500"
                    >
                      <div className="text-white/40 group-hover:text-brand-red transition-colors duration-500">
                        {item.icon}
                      </div>
                    </motion.div>
                    <span className="text-6xl font-display font-bold text-white/5 group-hover:text-brand-red/10 transition-colors duration-500 select-none">
                      {item.step}
                    </span>
                  </div>

                  <div className="relative z-10 flex-grow">
                    <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-brand-red transition-colors duration-500">
                      {item.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed mb-8 font-light group-hover:text-white/60 transition-colors duration-500">
                      {item.desc}
                    </p>
                  </div>
                  
                  <div className="space-y-3 pt-6 border-t border-white/5 relative z-10">
                    {item.details.map((detail, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: (i * 0.1) + (idx * 0.05) }}
                        className="flex items-center gap-3 group/item"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-red/20 group-hover:bg-brand-red group-hover/item:scale-150 transition-all" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 group-hover/item:text-white transition-colors">
                          {detail}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Subtle Background Pattern */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-red/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 md:py-48 px-6 md:px-12 relative overflow-hidden">
            <div className="max-w-5xl mx-auto p-16 md:p-32 rounded-[3rem] md:rounded-[4rem] bg-zinc-950 border border-white/5 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,99,33,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent" />
              
              <div className="relative z-10">
                <span className="text-brand-red font-mono font-bold tracking-[0.4em] uppercase text-[10px] mb-8 block">Ready to Start?</span>
                <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-display font-bold tracking-tighter mb-8 uppercase">Start a Project.</h2>
                <p className="text-lg md:text-2xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-12">
                  We are accepting new projects. Let's create something great together.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <MagneticButton>
                    <Link to="/contact">
                      <button className="px-12 py-6 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs">
                        Contact Us
                      </button>
                    </Link>
                  </MagneticButton>
                  <button className="px-12 py-6 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs">
                    View Documentation
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Kinetic Typography */}
      <div className="absolute bottom-10 left-0 w-full kinetic-text opacity-5 select-none pointer-events-none">
        <div className="kinetic-track text-[8vh] md:text-[15vh] font-display font-black uppercase tracking-tighter">
          <span>Creative Tech Studio • UI/UX Design • IT Development • Graphic Design • </span>
          <span>Creative Tech Studio • UI/UX Design • IT Development • Graphic Design • </span>
        </div>
      </div>
    </motion.div>
  );
};
