import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Globe, Cpu, Layout, Code2, Palette, Box, Shield, Zap, Activity, Rocket } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { cn } from '../lib/utils';

import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { TelemetryOverlay } from '../components/ui/TelemetryOverlay';

export const About = () => {
  const values = [
    {
      title: "Functional Architecture",
      icon: <Palette size={24} />,
      desc: "Interface production prioritized for operational utility. Systematic removal of non-functional decorative elements to ensure interface clarity."
    },
    {
      title: "Technical Reliability",
      icon: <Code2 size={24} />,
      desc: "Utilization of React and Next.js frameworks for high-performance execution. System stability prioritized over experimental methodologies."
    },
    {
      title: "Direct Protocol",
      icon: <Box size={24} />,
      desc: "Direct communication channels between clients and technical architects. Elimination of intermediary management layers for project transparency."
    }
  ];

  const journey = [
    { year: "2021", event: "Studio Initiation", desc: "Operational start by Fikri Nurlete and Reynaldo Anakotta as a digital production unit.", icon: <Rocket size={20} /> },
    { year: "2022", event: "Capability Expansion", desc: "Integration of full-scale IT engineering and interface production services.", icon: <Zap size={20} /> },
    { year: "2023", event: "Global Operations", desc: "Execution of technical deployments for regional and international client networks.", icon: <Globe size={20} /> },
    { year: "2024", event: "Corporate Integration", desc: "Official registration as PT. Kapitech Digital Indonesia for standardized service delivery.", icon: <Shield size={20} /> }
  ];

  const techStack = [
    { category: "Frontend", tools: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"] },
    { category: "Backend", tools: ["Node.js", "Express", "PostgreSQL", "Firebase", "Redis"] },
    { category: "Design", tools: ["Figma", "Adobe Creative Suite", "Blender", "Spline"] },
    { category: "Infrastructure", tools: ["AWS", "Google Cloud", "Docker", "Vercel"] }
  ];

  const team = [
    {
      name: "Fikri Nurlete",
      role: "Founder & Technical Lead",
      image: "https://picsum.photos/seed/fikri/400/500",
      bio: "Fikri manages technical architecture at Kapitech. Specialized in software engineering and systematic digital solution deployment."
    },
    {
      name: "Reynaldo Anakotta",
      role: "Co-Founder & Interface Lead",
      image: "https://picsum.photos/seed/reynaldo/400/500",
      bio: "Reynaldo directs interface production and creative logic. Ensures all deliverables meet functional and visual operational standards."
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
        imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
        accentColor="purple"
        statusText="HISTORY_SYNC_COMPLETE"
        scanMode="ARCHIVE_RETRIEVAL"
        sysRef="KPTCH_ABOUT_CORE"
        opacity={0.05}
      />

      {/* Telemetry Overlay */}
      <TelemetryOverlay label="KPTCH_ABOUT_TELEMETRY" accentColor="purple" />

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
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Operational Overview</span>
              <h1 className="text-[clamp(2.25rem,8vw,5.5rem)] font-display font-bold leading-[0.85] tracking-tighter mb-12 uppercase">
                Technical Solutions.<br />Systematic Design.
              </h1>
              <p className="text-sm md:text-base text-white/40 max-w-3xl font-light leading-relaxed tracking-tight">
                Kapitech is a digital production unit based in Indonesia. We architect reliable technical infrastructure and professional interfaces for global client operations.
              </p>
            </motion.div>

            {/* Company DNA Visual */}
            <div className="absolute top-0 right-12 w-px h-full bg-gradient-to-b from-brand-red/50 via-brand-red/10 to-transparent hidden lg:block">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="absolute left-0 w-8 h-px bg-brand-red/30"
                  style={{ top: `${20 + i * 15}%` }}
                >
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-[6px] font-mono text-brand-red/40 whitespace-nowrap">
                    DNA_SEQ_{i}: {Math.random().toString(16).substring(2, 8).toUpperCase()}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-24 md:py-48 px-6 md:px-12 bg-zinc-950/30 relative overflow-hidden border-y border-white/5">
            {/* Technical Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />
              <div className="absolute inset-0 grid-bg opacity-[0.03]" />
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-center relative z-10">
              {/* Visual Side */}
              <div className="lg:col-span-5 relative group">
                {/* Technical Frame */}
                <div className="absolute -inset-4 border border-white/5 rounded-[2.5rem] pointer-events-none transition-colors group-hover:border-brand-red/20" />
                <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-brand-red/40 rounded-tl-2xl" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-brand-red/40 rounded-br-2xl" />
                
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                  <motion.img 
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                    alt="Kapitech Operations" 
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  
                  {/* Image Overlay Telemetry */}
                  <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
                    <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Core Objective</span>
                    <h3 className="text-2xl md:text-4xl font-display font-bold tracking-tighter uppercase">Reliable System Deployment.</h3>
                  </div>
                </div>

                {/* Floating Data Tag */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -right-8 top-1/4 p-4 rounded-xl bg-black/80 border border-white/10 backdrop-blur-xl hidden xl:block"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest">Operational Status</span>
                  </div>
                  <div className="text-xs font-mono text-white">ACTIVE_DEPLOYMENT</div>
                </motion.div>
              </div>

              {/* Content Side */}
              <div className="lg:col-span-7 space-y-8 md:space-y-12">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-px bg-brand-red/40" />
                  <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px]">Agency DNA</span>
                </div>
                
                <h2 className="text-[clamp(1.75rem,5vw,3.5rem)] font-display font-bold tracking-tighter leading-[0.9] uppercase">
                  We engineer <span className="text-brand-red">functional systems</span> for operational performance.
                </h2>
                
                <div className="space-y-6">
                  <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed max-w-2xl">
                    Established in 2021, Kapitech maintains a focus on <span className="text-white">high-fidelity technical engineering</span> and interface production for scaling client networks.
                  </p>
                  <p className="text-sm md:text-base text-white/40 font-light leading-relaxed max-w-2xl">
                    In 2024, the unit integrated as PT. Kapitech Digital Indonesia. We operate with technical precision, prioritizing system integrity over marketing narratives.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 pt-8 border-t border-white/5">
                  <div>
                    <span className="text-3xl md:text-5xl font-display font-bold block font-mono mb-2 tracking-tighter">50+</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">Deployments</span>
                  </div>
                  <div>
                    <span className="text-3xl md:text-5xl font-display font-bold block font-mono mb-2 tracking-tighter">03+</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">Operational Years</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-3xl md:text-5xl font-display font-bold block font-mono mb-2 tracking-tighter">99%</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">Stability Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Journey Section */}
          <section className="py-24 md:py-48 px-6 md:px-12 relative overflow-hidden">
            <div className="mb-20 md:mb-32">
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Operational Timeline</span>
              <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-display font-bold tracking-tighter uppercase leading-none">System Evolution.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
              {journey.map((item, i) => (
                <motion.div 
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative p-10 rounded-3xl bg-zinc-900/20 border border-white/5 group hover:border-brand-red/30 transition-all duration-500"
                >
                  <div className="absolute top-8 right-8 text-4xl font-display font-black text-white/5 group-hover:text-brand-red/10 transition-colors duration-500 font-mono">
                    {item.year}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red mb-8 group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors font-mono uppercase tracking-tighter">{item.event}</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-light">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tech Stack Section */}
          <section className="py-24 md:py-48 px-6 md:px-12 bg-zinc-950/30 relative overflow-hidden border-y border-white/5">
            <div className="mb-20 md:mb-32">
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Technical Infrastructure</span>
              <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-display font-bold tracking-tighter uppercase leading-none">System Stack.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {techStack.map((stack, i) => (
                <motion.div
                  key={stack.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-all duration-500 group"
                >
                  <h3 className="text-brand-red font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-8">{stack.category}</h3>
                  <div className="space-y-4">
                    {stack.tools.map((tool, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-brand-red transition-colors" />
                        <span className="text-sm font-mono font-light text-white/60 group-hover:text-white transition-colors">{tool}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Values Section */}
          <section className="py-24 md:py-48 px-6 md:px-12 relative overflow-hidden">
            <div className="mb-20 md:mb-32">
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Core Principles</span>
              <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-display font-bold tracking-tighter uppercase leading-none">Operational Logic.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
              {values.map((value, i) => (
                <div key={value.title} className="h-full">
                  <PerspectiveTilt className="h-full">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-12 h-full rounded-3xl bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/30 transition-all group"
                    >
                      <div className="text-brand-red mb-8 w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-mono font-bold mb-6 uppercase tracking-tighter">{value.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed font-light">{value.desc}</p>
                    </motion.div>
                  </PerspectiveTilt>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Authority Section (New) */}
          <section className="py-24 md:py-48 px-6 md:px-12 relative overflow-hidden border-y border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                <div className="order-2 lg:order-1">
                  <div className="relative p-8 md:p-12 rounded-3xl bg-zinc-900/40 backdrop-blur-2xl border border-white/5 overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent" />
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/20">Operational Standards</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">Active</span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {[
                          { label: "Interface Fidelity", status: "High", progress: 95 },
                          { label: "System Stability", status: "Stable", progress: 92 },
                          { label: "Execution Speed", status: "Optimal", progress: 90 },
                          { label: "Security Protocol", status: "Standard", progress: 85 }
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
                
                <div className="order-1 lg:order-2">
                  <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">Operational Protocol</span>
                  <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tighter mb-8 leading-tight uppercase">
                    Execution<br />Methodology.
                  </h2>
                  <p className="text-sm md:text-base text-white/40 font-light leading-relaxed mb-12 max-w-xl">
                    Operational processes are standardized for efficiency. We analyze client requirements, architect logical solutions, and deploy using verified technical stacks.
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    {[
                      { label: "Initiation", value: "2021", icon: <Globe size={20} /> },
                      { label: "Legal Status", value: "PT", icon: <Shield size={20} /> },
                      { label: "Deployments", value: "50+", icon: <Activity size={20} /> },
                      { label: "Core Services", value: "03", icon: <Cpu size={20} /> }
                    ].map((stat) => (
                      <div key={stat.label} className="space-y-2">
                        <div className="flex items-center gap-2 text-brand-red">
                          {stat.icon}
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-display font-bold text-white font-mono">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Global Reach Section */}
          <section className="py-20 md:py-40 px-6 md:px-12 rounded-3xl bg-zinc-900/30 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 grid-bg" />
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Global Logistics</span>
                <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tighter mb-8 uppercase">Distributed Technical Network.</h2>
                <p className="text-sm md:text-base text-white/60 font-light leading-relaxed mb-8">
                  Operational frameworks are distributed globally. We utilize specialized talent across multiple jurisdictions. A follow-the-sun model maintains continuous system development and deployment cycles.
                </p>
                <div className="flex flex-wrap gap-8">
                  <div>
                    <span className="text-2xl font-display font-bold block font-mono">15+</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">Jurisdictions</span>
                  </div>
                  <div>
                    <span className="text-2xl font-display font-bold block font-mono">04</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">Active Timezones</span>
                  </div>
                  <div>
                    <span className="text-2xl font-display font-bold block font-mono">100%</span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">Remote Protocol</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1200" 
                  alt="Global Map" 
                  className="w-full h-full object-cover opacity-50 grayscale"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-brand-red/20 animate-ping absolute" />
                  <div className="w-16 h-16 rounded-full border border-brand-red/40 animate-ping absolute" style={{ animationDelay: '1s' }} />
                  <Globe className="text-brand-red" size={48} />
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-24 md:py-48 px-6 md:px-12 relative overflow-hidden">
            <div className="mb-20 md:mb-32">
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">System Architects</span>
              <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-display font-bold tracking-tighter uppercase leading-none">The Collective.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
              {team.map((member, i) => (
                <div key={member.name}>
                  <PerspectiveTilt>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group"
                    >
                      <div className="aspect-[4/5] rounded-3xl overflow-hidden mb-8 relative border border-white/5">
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                      </div>
                      <h3 className="text-xl font-mono font-bold mb-2 uppercase tracking-tighter">{member.name}</h3>
                      <p className="text-brand-red font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{member.role}</p>
                      <p className="text-white/40 text-sm font-light leading-relaxed">{member.bio}</p>
                    </motion.div>
                  </PerspectiveTilt>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Kinetic Typography */}
      <div className="absolute bottom-10 left-0 w-full kinetic-text opacity-5 select-none pointer-events-none">
        <div className="kinetic-track text-[8vh] md:text-[15vh] font-display font-black uppercase tracking-tighter">
          <span>Kapitech Operations • System Engineering • Interface Production • Visual Architecture • </span>
          <span>Kapitech Operations • System Engineering • Interface Production • Visual Architecture • </span>
        </div>
      </div>
    </motion.div>
  );
};
