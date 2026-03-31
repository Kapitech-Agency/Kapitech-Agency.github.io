import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Code2, Palette, Box, CheckCircle2, Cpu, Globe, ArrowUpRight, X, Zap, Shield, Rocket } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';

export const Services = () => {
  const [selectedService, setSelectedService] = useState<any>(null);

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
      icon: <Code2 size={32} />,
      title: "IT Development",
      desc: "We engineer robust, cloud-native infrastructures using modern stacks like React, Next.js, and Node.js. Our systems are built to handle enterprise-level traffic with sub-second latency, ensuring your digital foundation is future-proof.",
      detailedDesc: "Our IT development philosophy centers on architectural integrity and performance. We don't just write code; we build systems that scale. By leveraging cloud-native technologies and microservices, we ensure your application can grow from a thousand to a million users without missing a beat.",
      approach: "We follow a test-driven development (TDD) approach combined with agile methodologies. Our process begins with a deep dive into your technical requirements, followed by architectural mapping and iterative development cycles. We prioritize security at every stage, implementing end-to-end encryption and robust authentication protocols.",
      outcomes: [
        "99.99% Uptime Guarantee",
        "Sub-800ms Global Load Times",
        "Enterprise-Grade Security Compliance",
        "Seamless Third-Party Integrations"
      ],
      features: [
        "Custom Web Applications (React, Next.js, TypeScript)",
        "Backend Engineering (Node.js, Go, PostgreSQL)",
        "Mobile App Development (iOS, Android, React Native)",
        "Cloud Infrastructure (AWS, Docker, Kubernetes)",
        "Secure API Integration & Microservices",
        "Performance Auditing & Optimization"
      ],
      subServices: [
        { title: "Scalability", desc: "Auto-scaling infrastructures that adapt to traffic spikes.", icon: <Zap size={20} /> },
        { title: "Security", desc: "Enterprise-grade protection and data encryption.", icon: <Shield size={20} /> },
        { title: "Performance", desc: "Sub-second load times and optimized core web vitals.", icon: <Rocket size={20} /> }
      ],
      tech: ["React", "Next.js", "Node.js", "AWS", "Go", "Docker", "Kubernetes", "PostgreSQL", "Redis", "GraphQL"],
      industries: ["FinTech", "HealthTech", "E-commerce", "Enterprise SaaS"],
      accent: "from-blue-500/20 to-brand-red/20",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070"
    },
    {
      icon: <Palette size={32} />,
      title: "UI/UX Design",
      desc: "Our design process is rooted in user psychology and high-fidelity aesthetic standards. We create frictionless interfaces for complex web dashboards and mobile applications, ensuring every interaction is meaningful.",
      detailedDesc: "Design at our studio is a blend of data-driven insights and creative intuition. We map out every user touchpoint to eliminate friction and maximize engagement. Our high-fidelity prototypes allow you to feel the product before a single line of code is written.",
      approach: "We start with comprehensive user research and persona development. This informs our wireframing and low-fidelity prototyping phase. We then transition into high-fidelity UI design, focusing on accessibility, motion design, and consistent design systems that can be easily handed off to development teams.",
      outcomes: [
        "85% Increase in User Retention",
        "Frictionless User Journeys",
        "WCAG 2.1 Accessibility Compliance",
        "Unified Multi-Platform Design Systems"
      ],
      features: [
        "User Journey Mapping & Persona Research",
        "High-Fidelity Prototyping (Figma, Protopie)",
        "Design Systems & Component Libraries",
        "Usability Testing & Conversion Optimization",
        "Interactive Web & Mobile Interface Design",
        "Micro-interaction & Motion Design Strategy"
      ],
      subServices: [
        { title: "Psychology", desc: "Interfaces designed around human behavior patterns.", icon: <Zap size={20} /> },
        { title: "Consistency", desc: "Robust design systems for cross-platform harmony.", icon: <Shield size={20} /> },
        { title: "Emotion", desc: "Visual storytelling that builds brand loyalty.", icon: <Rocket size={20} /> }
      ],
      tech: ["Figma", "Framer", "Adobe XD", "Protopie", "Sketch", "Miro", "After Effects", "Lottie"],
      industries: ["Consumer Apps", "B2B Dashboards", "EdTech", "Luxury Brands"],
      accent: "from-brand-red/20 to-orange-500/20",
      image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=2070"
    },
    {
      icon: <Box size={32} />,
      title: "Graphic Design",
      desc: "We bring brands to life through sophisticated visual identities and motion graphics. By applying strategic design principles, we create bold visual narratives that capture attention and command authority.",
      detailedDesc: "Graphic design is the visual voice of your brand. We craft identities that are not just beautiful, but strategic. From 3D product renders that jump off the screen to motion graphics that explain complex concepts in seconds.",
      approach: "Our branding process begins with a deep dive into your brand's values and market positioning. We explore multiple creative directions, refining the chosen path into a comprehensive visual identity. We then extend this identity across all digital and physical touchpoints, ensuring a cohesive brand presence.",
      outcomes: [
        "Instant Brand Recognition",
        "High-Impact Marketing Assets",
        "Photorealistic 3D Visualizations",
        "Engaging Motion Graphics Content"
      ],
      features: [
        "Brand Identity & Visual Strategy",
        "Motion Graphics & Dynamic Video (After Effects)",
        "3D Visualization & Product Renders (Cinema 4D)",
        "Marketing Collateral & Digital Assets",
        "Typography Design & Custom Iconography",
        "Packaging & Physical Product Design"
      ],
      subServices: [
        { title: "Identity", desc: "Memorable branding that defines your market position.", icon: <Zap size={20} /> },
        { title: "Motion", desc: "Dynamic visuals that capture and hold attention.", icon: <Shield size={20} /> },
        { title: "3D Art", desc: "Immersive product visualizations and environments.", icon: <Rocket size={20} /> }
      ],
      tech: ["Photoshop", "Illustrator", "After Effects", "Cinema 4D", "InDesign", "Blender", "Octane Render", "ZBrush"],
      industries: ["Entertainment", "Real Estate", "Automotive", "Fashion"],
      accent: "from-purple-500/20 to-brand-red/20",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=2071"
    }
  ];

  const process = [
    {
      step: "01",
      title: "Ideation",
      desc: "Conceptualizing unique digital experiences tailored to your brand's core vision."
    },
    {
      step: "02",
      title: "Design",
      desc: "Crafting high-fidelity visual narratives and frictionless user journeys."
    },
    {
      step: "03",
      title: "Development",
      desc: "Engineering robust, scalable codebases using elite tech stacks for peak performance."
    },
    {
      step: "04",
      title: "Launch",
      desc: "Orchestrating a seamless launch followed by continuous creative optimization."
    }
  ];

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
          <header className="mb-24 md:mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Creative Tech Studio</span>
              <h1 className="text-5xl sm:text-7xl md:text-[10vw] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient">
                Engineering the<br />Extraordinary.
              </h1>
              <p className="text-xl md:text-3xl text-white/40 max-w-3xl font-light leading-tight tracking-tight">
                Our development ecosystem is built on the pillars of speed, security, and scalability. We utilize modern tech stacks to deliver sub-second digital experiences.
              </p>
            </motion.div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 md:mb-40">
            {services.map((service, i) => (
              <motion.div 
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-full cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem] blur-2xl -z-10" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                <div className={`p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-zinc-900/50 backdrop-blur-sm border border-white/5 group-hover:border-brand-red/30 transition-all duration-500 flex flex-col h-full overflow-hidden relative`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.accent} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  
                  <motion.div 
                    layoutId={`icon-${service.title}`}
                    className="text-brand-red mb-8 w-16 h-16 rounded-2xl bg-brand-red/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-red group-hover:text-white transition-all duration-500"
                  >
                    {service.icon}
                  </motion.div>
                  
                  <motion.h3 
                    layoutId={`title-${service.title}`}
                    className="text-3xl font-display font-bold mb-6 group-hover:text-brand-red transition-colors"
                  >
                    {service.title}
                  </motion.h3>
                  <p className="text-white/40 text-lg leading-relaxed mb-8 flex-grow group-hover:text-white/60 transition-colors">{service.desc}</p>
                  
                  <div className="space-y-4 mb-8">
                    {service.features.slice(0, 4).map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm text-white/60">
                        <CheckCircle2 size={16} className="text-brand-red shrink-0" />
                        <span className="group-hover:text-white/80 transition-colors">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 block mb-4">Core Technologies</span>
                    <div className="flex flex-wrap gap-2">
                      {service.tech.slice(0, 4).map((t) => (
                        <span key={t} className="px-2 py-1 rounded-md bg-white/5 text-[9px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/80 group-hover:bg-white/10 transition-all">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-brand-red font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    Learn More <ArrowUpRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Service Detail Modal - Full Screen Immersive */}
          <AnimatePresence>
            {selectedService && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black flex flex-col overflow-y-auto"
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
                <div className="w-full h-[70vh] md:h-[90vh] relative shrink-0 overflow-hidden">
                  <motion.img 
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    src={selectedService.image} 
                    alt={selectedService.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-12 left-6 md:bottom-24 md:left-12 max-w-6xl">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                    >
                      <motion.div 
                        layoutId={`icon-${selectedService.title}`}
                        className="text-brand-red mb-8 w-24 h-24 rounded-3xl bg-brand-red/10 flex items-center justify-center backdrop-blur-xl border border-brand-red/20 shadow-2xl shadow-brand-red/20"
                      >
                        {React.cloneElement(selectedService.icon as React.ReactElement, { size: 48 })}
                      </motion.div>
                      <motion.h2 
                        layoutId={`title-${selectedService.title}`}
                        className="text-6xl sm:text-8xl md:text-[10vw] font-display font-bold tracking-tighter leading-[0.8] mb-12 text-white"
                      >
                        {selectedService.title}
                      </motion.h2>
                      <div className="flex flex-wrap gap-3">
                        {selectedService.tech.map((t: string, i: number) => (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + (i * 0.05) }}
                            key={t} 
                            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl hover:bg-brand-red hover:text-white hover:border-brand-red transition-all cursor-default"
                          >
                            {t}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="relative z-10 bg-black">
                  <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                      <div className="lg:col-span-8 space-y-16 md:space-y-20">
                        {/* Overview & Approach Integrated */}
                        <div className="space-y-12">
                          <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                          >
                            <span className="text-brand-red font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">Service Overview</span>
                            <p className="text-3xl md:text-5xl font-light text-white leading-[1.1] tracking-tight text-balance">
                              {selectedService.detailedDesc}
                            </p>
                          </motion.section>

                          <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-zinc-900/40 to-zinc-900/10 border border-white/5 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 blur-[100px] -mr-32 -mt-32" />
                            <h3 className="text-2xl md:text-3xl font-display font-bold mb-6 text-brand-red tracking-tighter">Our Strategic Approach.</h3>
                            <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed">
                              {selectedService.approach}
                            </p>
                          </motion.section>
                        </div>

                        {/* Sub-services Bento Grid */}
                        <motion.section 
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                        >
                          <div className="md:col-span-2 lg:col-span-3 mb-2">
                            <span className="text-brand-red font-bold tracking-[0.4em] uppercase text-[10px] mb-2 block">Specializations</span>
                            <h3 className="text-2xl md:text-3xl font-display font-bold">Core Capabilities.</h3>
                          </div>
                          {selectedService.subServices.map((sub: any, i: number) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                              className="p-6 md:p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 hover:border-brand-red/20 transition-all group backdrop-blur-sm relative overflow-hidden"
                            >
                              <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-red/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="text-brand-red mb-6 w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-all duration-500">
                                {sub.icon}
                              </div>
                              <h4 className="text-lg font-bold mb-2 group-hover:text-brand-red transition-colors">{sub.title}</h4>
                              <p className="text-xs md:text-sm text-white/40 leading-relaxed">{sub.desc}</p>
                            </motion.div>
                          ))}
                        </motion.section>

                        {/* Technical Deep Dive / Metrics */}
                        <motion.section
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                        >
                          {selectedService.outcomes.map((outcome: string, i: number) => (
                            <div key={i} className="p-5 md:p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-center items-center text-center group hover:bg-white/[0.03] transition-all">
                              <div className="w-1 h-1 rounded-full bg-brand-red mb-3 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(255,59,59,0.5)]" />
                              <span className="text-[11px] md:text-xs font-medium text-white/60 group-hover:text-white/90 transition-colors leading-tight uppercase tracking-wider">{outcome}</span>
                            </div>
                          ))}
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
                            className="p-6 md:p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 backdrop-blur-md"
                          >
                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 block mb-6">Deliverables</span>
                            <div className="grid grid-cols-1 gap-2">
                              {selectedService.features.map((feature: string) => (
                                <div key={feature} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-brand-red/20 transition-all group">
                                  <CheckCircle2 size={14} className="text-brand-red/60 shrink-0 group-hover:text-brand-red group-hover:scale-110 transition-all" />
                                  <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </motion.section>

                          {/* Industry & Tech Mix */}
                          <motion.section 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="p-6 md:p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 backdrop-blur-md"
                          >
                            <div className="mb-6">
                              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 block mb-3">Industries</span>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedService.industries.map((industry: string) => (
                                  <span key={industry} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/40">
                                    {industry}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 block mb-3">Ecosystem</span>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedService.tech.slice(0, 8).map((t: string) => (
                                  <span key={t} className="px-2.5 py-1 rounded-md bg-brand-red/5 border border-brand-red/10 text-[10px] text-brand-red/60 font-bold">
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
                            className="p-6 md:p-8 rounded-[2rem] bg-brand-red border border-brand-red shadow-2xl shadow-brand-red/10 relative overflow-hidden group"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                            <h4 className="text-xl font-display font-bold mb-1 text-white">Start Project.</h4>
                            <p className="text-white/70 mb-6 text-xs font-light leading-snug">Let's orchestrate your digital breakthrough together.</p>
                            <MagneticButton>
                              <button className="w-full px-6 py-3.5 bg-white text-black rounded-full font-bold hover:bg-black hover:text-white transition-all duration-500 uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2">
                                Get in Touch <ArrowUpRight size={14} />
                              </button>
                            </MagneticButton>
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

          {/* Process Section */}
          <section className="mb-32 md:mb-40">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 md:mb-24">
              <div>
                <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The Creative Blueprint</span>
                <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter">Our Process.</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {process.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-[2rem] bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-4xl font-display font-bold text-brand-red block mb-6 group-hover:scale-110 transition-transform duration-500">{item.step}</span>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 md:py-40 px-6 md:px-12 bg-zinc-950 rounded-[2rem] md:rounded-[3rem] border border-white/5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,99,33,0.05)_0%,transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tighter mb-8">Ready to Build Your Legacy?</h2>
              <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-12">
                We are currently accepting new projects for 2026. Let's orchestrate your digital breakthrough together.
              </p>
              <MagneticButton>
                <button className="px-12 py-6 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs">
                  Start Your Project
                </button>
              </MagneticButton>
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
