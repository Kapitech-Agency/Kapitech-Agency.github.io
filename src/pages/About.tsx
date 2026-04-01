import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Globe, Cpu, Layout, Code2, Palette, Box, Shield, Zap, Activity } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { cn } from '../lib/utils';

export const About = () => {
  const values = [
    {
      title: "Practical Design",
      icon: <Palette size={24} />,
      desc: "We focus on creating designs that actually work for your business. No unnecessary decorations, just clean and functional interfaces."
    },
    {
      title: "Reliable Tech",
      icon: <Code2 size={24} />,
      desc: "We use modern tools like React and Next.js to build websites that are fast and easy to maintain. We prioritize stability over hype."
    },
    {
      title: "Direct Communication",
      icon: <Box size={24} />,
      desc: "You talk directly to the people building your project. We keep things simple and transparent throughout the entire process."
    }
  ];

  const journey = [
    { year: "2021", event: "Kapitech Founded", desc: "Founded by Fikri Nurlete and Reynaldo Anakotta as a small digital studio." },
    { year: "2022", event: "Service Expansion", desc: "Started offering full-scale IT development and UI/UX design services." },
    { year: "2023", event: "Growing Portfolio", desc: "Successfully delivered projects for various local and international clients." },
    { year: "2024", event: "Legalization", desc: "Officially legalized as PT. Kapitech Digital Indonesia to better serve our partners." }
  ];

  const team = [
    {
      name: "Fikri Nurlete",
      role: "Founder & Lead Developer",
      image: "https://picsum.photos/seed/fikri/400/500",
      bio: "Fikri leads the technical direction at Kapitech. With a background in software engineering, he focuses on building clean and efficient digital solutions."
    },
    {
      name: "Reynaldo Anakotta",
      role: "Co-Founder & Creative Lead",
      image: "https://picsum.photos/seed/reynaldo/400/500",
      bio: "Reynaldo oversees the design and creative aspects. He ensures that every project we deliver is not only functional but also visually professional."
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
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-5" 
             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-brand-red/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[700px] h-[700px] bg-blue-900/10 blur-[180px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05] grayscale"
          alt="Background Texture"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="px-6 md:px-12 py-20 md:py-40 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">About Kapitech Agency</span>
              <h1 className="text-[clamp(2.5rem,8vw,8rem)] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient">
                Digital Solutions.<br />Logical Design.
              </h1>
              <p className="text-[clamp(1rem,2vw,1.5rem)] text-white/40 max-w-3xl font-light leading-tight tracking-tight">
                Kapitech is a small digital agency based in Indonesia. We help businesses build reliable websites and professional designs without the complicated corporate talk.
              </p>
            </motion.div>
          </section>

          {/* Mission Section */}
          <section className="py-20 md:py-40 px-6 md:px-12 bg-zinc-950/30 relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                alt="Kapitech Studio" 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Focus</span>
                <h3 className="text-2xl md:text-4xl font-display font-bold tracking-tighter">Reliable Digital Work.</h3>
              </div>
            </div>
            <div className="space-y-8 md:space-y-12">
              <h2 className="text-[clamp(2rem,5vw,4rem)] font-display font-bold tracking-tighter leading-none">
                We build <span className="text-brand-red">functional products</span> that solve real problems.
              </h2>
              <div className="space-y-6">
                <p className="text-base md:text-lg text-white/40 font-light leading-relaxed">
                  Founded in 2021 by Fikri Nurlete and Reynaldo Anakotta, Kapitech started with a simple goal: to provide quality IT and design services for businesses looking to grow online.
                </p>
                <p className="text-base md:text-lg text-white/40 font-light leading-relaxed">
                  In 2024, we officially became PT. Kapitech Digital Indonesia. We are a small, dedicated team that values clear communication and honest work over marketing buzzwords.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="text-3xl md:text-4xl font-display font-bold block">50+</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">Projects Done</span>
                </div>
                <div>
                  <span className="text-3xl md:text-4xl font-display font-bold block">3+</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">Years Active</span>
                </div>
              </div>
            </div>
          </section>

          {/* Journey Section */}
          <section className="py-20 md:py-40 px-6 md:px-12 relative overflow-hidden">
            <div className="mb-16 md:mb-24">
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Operational Timeline</span>
              <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-display font-bold tracking-tighter">System Evolution.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {journey.map((item, i) => (
                <motion.div 
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-8 border-l border-white/10"
                >
                  <div className="absolute top-0 left-0 w-1 h-8 bg-brand-red -translate-x-1/2" />
                  <span className="text-3xl font-display font-bold text-brand-red mb-2 block font-mono">{item.year}</span>
                  <h3 className="text-xl font-bold mb-4">{item.event}</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-light">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20 md:py-40 px-6 md:px-12 relative overflow-hidden">
            <div className="mb-16 md:mb-24">
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Core Principles</span>
              <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-display font-bold tracking-tighter">Technical Philosophy.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, i) => (
                <div key={value.title} className="h-full">
                  <PerspectiveTilt className="h-full">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-12 h-full rounded-[2.5rem] bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/30 transition-all group"
                    >
                      <div className="text-brand-red mb-8 w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        {value.icon}
                      </div>
                      <h3 className="text-2xl font-display font-bold mb-6">{value.title}</h3>
                      <p className="text-white/40 text-base leading-relaxed font-light">{value.desc}</p>
                    </motion.div>
                  </PerspectiveTilt>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Authority Section (New) */}
          <section className="py-20 md:py-40 px-6 md:px-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1">
                  <div className="relative p-8 md:p-12 rounded-[3rem] bg-zinc-900/40 backdrop-blur-2xl border border-white/5 overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent" />
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/20">Service Standards</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">Online</span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {[
                          { label: "Design Quality", status: "Professional", progress: 95 },
                          { label: "Code Stability", status: "Reliable", progress: 92 },
                          { label: "Load Speed", status: "Fast", progress: 90 },
                          { label: "Security", status: "Standard", progress: 85 }
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
                  <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">Our Standards</span>
                  <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-8 leading-tight">
                    How We<br />Work.
                  </h2>
                  <p className="text-lg text-white/40 font-light leading-relaxed mb-12 max-w-xl">
                    We don't overcomplicate things. Our process is straightforward: we listen to your needs, propose a logical solution, and build it using reliable technology.
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    {[
                      { label: "Founded", value: "2021", icon: <Globe size={20} /> },
                      { label: "Legal Status", value: "PT", icon: <Shield size={20} /> },
                      { label: "Projects", value: "50+", icon: <Activity size={20} /> },
                      { label: "Services", value: "3 Major", icon: <Cpu size={20} /> }
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
              </div>
            </div>
          </section>

          {/* Global Reach Section */}
          <section className="py-20 md:py-40 px-6 md:px-12 rounded-[3rem] bg-zinc-900/30 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 grid-bg" />
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Global Logistics</span>
                <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-8">Distributed Technical Network.</h2>
                <p className="text-lg text-white/60 font-light leading-relaxed mb-8">
                  Our operational framework is distributed globally, utilizing specialized talent across multiple jurisdictions. We employ a follow-the-sun model to maintain continuous system development and deployment cycles.
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
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
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
          <section className="py-20 md:py-40 px-6 md:px-12 relative overflow-hidden">
            <div className="mb-16 md:mb-24">
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">System Architects</span>
              <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-display font-bold tracking-tighter">The Collective.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
                      <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-8 relative">
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                      </div>
                      <h3 className="text-2xl font-display font-bold mb-2">{member.name}</h3>
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
          <span>Kapitech Agency • UI/UX Design • IT Development • Graphic Design • </span>
          <span>Kapitech Agency • UI/UX Design • IT Development • Graphic Design • </span>
        </div>
      </div>
    </motion.div>
  );
};
