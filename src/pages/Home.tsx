import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Zap, Shield, Globe, Cpu, Layout, Code2, Palette, Box, Layers, Activity, X, Rocket } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { Testimonials } from '../components/Testimonials';
import { cn } from '../lib/utils';

import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';

export const Home = () => {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isBooted, setIsBooted] = useState(false);
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], [0, -1000]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    
    // System boot simulation
    const timer = setTimeout(() => setIsBooted(true), 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const techStack = [
    { name: "Next.js", icon: <Layout size={20} /> },
    { name: "AWS", icon: <Globe size={20} /> },
    { name: "Three.js", icon: <Box size={20} /> },
    { name: "Tailwind", icon: <Palette size={20} /> },
    { name: "Framer", icon: <Zap size={20} /> },
    { name: "TypeScript", icon: <Code2 size={20} /> },
  ];
  const projects = [
    {
      title: "Lumina Real Estate",
      category: "IT Development / UI Design",
      image: "https://picsum.photos/seed/lumina/1200/800",
      description: "Search experience optimization. 3D walkthrough integration. Real-time lead management system.",
      stack: ["Next.js", "Three.js", "PostgreSQL"],
      status: "Operational",
      region: "North America"
    },
    {
      title: "Aura Creative Studio",
      category: "Identity / 3D Systems",
      image: "https://picsum.photos/seed/aura/1200/800",
      description: "Visual identity system. Charcoal-themed interface. Technical brand architecture.",
      stack: ["Figma", "Blender", "React"],
      status: "Completed",
      region: "Europe"
    },
    {
      title: "Nexus Fintech App",
      category: "Mobile / Product Strategy",
      image: "https://picsum.photos/seed/nexus/1200/800",
      description: "Financial data visualization. UI/UX strategy. 100k+ active user support.",
      stack: ["React Native", "Node.js", "Redis"],
      status: "Scaling",
      region: "Global"
    },
    {
      title: "Quantum AI",
      category: "AI Platform / Development",
      image: "https://picsum.photos/seed/quantum/1200/800",
      description: "Infrastructure optimization. AI research environment. High-fidelity data visualization.",
      stack: ["Python", "TensorFlow", "Next.js"],
      status: "Operational",
      region: "North America"
    },
    {
      title: "Solaris Energy",
      category: "Clean Tech / Monitoring",
      image: "https://picsum.photos/seed/solaris/1200/800",
      description: "Energy data visualization. Multi-layered monitoring. Real-time production analytics.",
      stack: ["D3.js", "AWS IoT", "Go"],
      status: "Operational",
      region: "Australia"
    },
    {
      title: "Vivid Fashion",
      category: "E-commerce / Architecture",
      image: "https://picsum.photos/seed/vivid/1200/800",
      description: "Headless commerce migration. Mobile performance optimization. Visual storytelling systems.",
      stack: ["Shopify Plus", "Hydrogen", "Sanity"],
      status: "Completed",
      region: "Europe"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="film-grain overflow-x-hidden"
      role="main"
      aria-label="Kapitech Home"
    >
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 py-24 md:py-48 overflow-hidden bg-black">
        {/* Enhanced Atmospheric Background */}
        <AtmosphericBackground 
          imageUrl="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072"
          opacity={0.08}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isBooted ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-8">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={isBooted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.2 }}
                className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono tracking-[0.2em] uppercase text-white/60"
              >
                Digital Studio
              </motion.span>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={isBooted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-emerald-400"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Available for new projects
              </motion.div>
            </div>
            
            <h1 className="text-[clamp(2.25rem,8vw,4.5rem)] font-display font-bold leading-[0.9] tracking-tighter mb-10 uppercase">
              <motion.span
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={isBooted ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 1, delay: 0.4 }}
                className="block"
              >
                Digital Product Agency.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={isBooted ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 1, delay: 0.6 }}
                className="block text-white/40"
              >
                We help companies to build and scale.
              </motion.span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={isBooted ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-sm text-white/60 max-w-3xl font-light leading-relaxed mb-16 tracking-tight"
            >
              We bridge the gap between complex technology and human experience. Our team architects digital success for enterprise, SMEs, and startups.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isBooted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-wrap gap-6 items-center"
            >
              <MagneticButton>
                <Link to="/contact" className="group h-11 px-8 bg-white text-black rounded-2xl font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500">
                  Start a Project
                  <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/work" className="h-11 px-8 rounded-2xl border border-white/10 hover:bg-white/5 transition-all font-mono font-bold tracking-widest uppercase text-[10px] flex items-center">
                  View Projects
                </Link>
              </MagneticButton>
            </motion.div>
          </motion.div>
        </div>

        {/* System Load Progress */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-20">
          <motion.div
            initial={{ width: "0%" }}
            animate={isBooted ? { width: "100%" } : { width: "0%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-full bg-brand-red shadow-[0_0_10px_rgba(255,59,59,0.5)]"
          />
        </div>

        {/* Kinetic Typography */}
        <div className="absolute bottom-10 left-0 w-full kinetic-text opacity-5 select-none pointer-events-none">
          <div className="kinetic-track text-[8vh] md:text-[15vh] font-display font-black uppercase tracking-tighter">
            <span>Product Strategy • UI/UX Design • Web Development • Branding • </span>
            <span>Product Strategy • UI/UX Design • Web Development • Branding • </span>
          </div>
        </div>
      </section>

      {/* Performance Matrix */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-black border-y border-white/5 relative overflow-hidden" aria-label="Performance Statistics">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-brand-red/50 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-20 md:gap-32" role="list">
            {[
              { 
                label: "Experience", 
                value: "3+ YRS", 
                desc: "Established studio.",
                icon: <Cpu size={16} />
              },
              { 
                label: "Projects", 
                value: "50+", 
                desc: "Successful deliveries.",
                icon: <ArrowUpRight size={16} />
              },
              { 
                label: "Clients", 
                value: "Global", 
                desc: "Worldwide partnerships.",
                icon: <Globe size={16} />
              },
              { 
                label: "Quality", 
                value: "100%", 
                desc: "Client satisfaction.",
                icon: <CheckCircle2 size={16} />
              }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                role="listitem"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform duration-500">
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/60 group-hover:text-brand-red transition-colors">{stat.label}</span>
                </div>
                <div className="space-y-4">
                  <span className="text-[clamp(2rem,4vw,3.5rem)] font-display font-bold block text-white tracking-tighter leading-none">{stat.value}</span>
                  <p className="text-[clamp(0.875rem,1vw,1rem)] text-white/60 font-light leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <section className="py-16 md:py-32 bg-black overflow-hidden border-b border-white/5">
        <div className="kinetic-text opacity-40 hover:opacity-100 transition-opacity duration-700">
          <div className="kinetic-track flex gap-20 items-center">
            {[...techStack, ...techStack, ...techStack].map((tech, i) => (
              <div key={i} className="flex items-center gap-4 shrink-0">
                <div className="p-3 rounded-xl bg-white/5 text-brand-red">
                  {tech.icon}
                </div>
                <span className="text-2xl font-display font-bold uppercase tracking-tighter">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise & Markets Section */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-black relative overflow-hidden border-b border-white/5">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 md:mb-32">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-px bg-brand-red/40" />
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px]">Market Focus</span>
              </div>
              <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-display font-bold tracking-tighter leading-[0.9] uppercase">
                Expertise tailored<br />
                <span className="text-white/20">to your industry.</span>
              </h2>
            </div>
            <p className="text-lg text-white/40 font-light max-w-sm leading-relaxed">
              We build scalable digital products for high-growth startups and visionary enterprises. Our teams are optimized to deliver reliable results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: "Web3 & Blockchain", 
                desc: "Smart contract audits. Decentralized infrastructure. Tokenized systems.",
                icon: <Globe size={24} />,
                accent: "group-hover:text-blue-500"
              },
              { 
                title: "AI & Machine Learning", 
                desc: "Neural network deployment. Data pipeline optimization. AI research environments.",
                icon: <Cpu size={24} />,
                accent: "group-hover:text-emerald-500"
              },
              { 
                title: "Fintech & Banking", 
                desc: "Secure payment gateways. Real-time transaction systems. Compliance architecture.",
                icon: <Shield size={24} />,
                accent: "group-hover:text-brand-red"
              },
              { 
                title: "SaaS & Enterprise", 
                desc: "Scalable cloud platforms. Multi-tenant architecture. Operational dashboards.",
                icon: <Layers size={24} />,
                accent: "group-hover:text-purple-500"
              }
            ].map((market, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all duration-500 cursor-default"
              >
                <div className={cn("mb-6 transition-colors duration-500", market.accent)}>
                  {market.icon}
                </div>
                <h3 className="text-xl font-display font-bold mb-4 uppercase tracking-tight">{market.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed group-hover:text-white/60 transition-colors">
                  {market.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Model Section */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-zinc-950 relative overflow-hidden border-y border-white/5">
        {/* Technical Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />
          <div className="absolute inset-0 grid-bg opacity-[0.03]" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-center relative z-10">
          {/* Visual Side */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative group">
              {/* Technical Frame */}
              <div className="absolute -inset-4 border border-white/5 rounded-[2.5rem] pointer-events-none transition-colors group-hover:border-brand-red/20" />
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-brand-red/40 rounded-tl-2xl" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-brand-red/40 rounded-br-2xl" />
              
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                <motion.img 
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070" 
                  alt="Agency vs Freelance" 
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-red/10 mix-blend-multiply transition-opacity group-hover:opacity-0" />
                
                {/* Image Overlay */}
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-white font-bold tracking-widest break-words">TEAM_OPERATIONS</span>
                  </div>
                </div>
              </div>

              {/* Floating Tag */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -left-8 top-1/4 p-4 rounded-xl bg-black/80 border border-white/10 backdrop-blur-xl hidden xl:block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest">Global Operations</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 order-1 lg:order-2"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-brand-red/40" />
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px]">Our Expertise</span>
            </div>
            
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-display font-bold tracking-tighter mb-8 leading-[0.9] uppercase">
              Fueling<br />
              <span className="text-white/20">Growth.</span>
            </h2>
            
            <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed mb-12 max-w-xl">
              We help companies to build and scale digital products. Our team of experts provides strategic design and development services to drive business results.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
              {[
                { 
                  title: "System Redundancy", 
                  desc: "Continuous operations through team-based redundancy. Zero single-point-of-failure architecture.",
                  icon: <Shield size={20} className="text-brand-red" />
                },
                { 
                  title: "Scalability", 
                  desc: "Architecture engineered for growth. Future-proof systems designed for global deployment.",
                  icon: <Rocket size={20} className="text-brand-red" />
                },
                { 
                  title: "SOP Execution", 
                  desc: "Documented sprints and audited performance metrics. Optimized execution protocols.",
                  icon: <Activity size={20} className="text-brand-red" />
                },
                { 
                  title: "Global Sync", 
                  desc: "Worldwide coordination maintained across all time zones. Real-time project telemetry.",
                  icon: <Globe size={20} className="text-brand-red" />
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-brand-red/5 border border-brand-red/10 group-hover:bg-brand-red/10 transition-colors">
                      {item.icon}
                    </div>
                    <h4 className="font-display font-bold text-sm uppercase tracking-wider">{item.title}</h4>
                  </div>
                  <p className="text-sm text-white/40 font-light leading-relaxed group-hover:text-white/60 transition-colors">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-8 items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Project Success</span>
                <span className="text-xl font-display font-bold text-white">100%</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Uptime</span>
                <span className="text-xl font-display font-bold text-white">99.99%</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Response Time</span>
                <span className="text-xl font-display font-bold text-white">&lt; 24H</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Kapitech Ecosystem Section */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/5 blur-[150px] rounded-full" />
          <div className="absolute inset-0 grid-bg opacity-5" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24 md:mb-40">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-brand-red font-mono font-bold tracking-[0.4em] uppercase text-[10px] mb-6 block"
            >
              Core Services
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tighter mb-10 leading-tight uppercase">What we do.</h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-white/40 font-light max-w-3xl mx-auto leading-relaxed"
            >
              End-to-end digital product creation. From brand identity to scalable tech infrastructure.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                title: "Branding",
                icon: <Palette size={32} />,
                color: "from-brand-red/20 to-transparent",
                borderColor: "border-brand-red/20",
                desc: "We build brands that define markets. Visual identity systems, strategic positioning, and immersive storytelling.",
                features: ["Visual Identity", "Brand Strategy", "Logo Design", "Brand Guidelines"]
              },
              {
                title: "Design",
                icon: <Layout size={32} />,
                color: "from-blue-600/20 to-transparent",
                borderColor: "border-blue-600/20",
                desc: "High-fidelity digital products. UI/UX design, mobile experiences, and complex interface systems.",
                features: ["Product Design", "UI/UX Design", "Mobile Apps", "Web Design"]
              },
              {
                title: "Development",
                icon: <Code2 size={32} />,
                color: "from-emerald-500/20 to-transparent",
                borderColor: "border-emerald-500/20",
                desc: "Scalable technical infrastructure. Full-stack engineering, cloud architecture, and performance-first codebases.",
                features: ["Web Development", "Mobile Dev", "Cloud Solutions", "API Integration"]
              }
            ].map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className={cn(
                  "p-10 rounded-3xl bg-zinc-900/40 border backdrop-blur-xl transition-all duration-500 group relative overflow-hidden",
                  pillar.borderColor
                )}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", pillar.color)} />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <div className="text-white group-hover:text-brand-red transition-colors">
                      {pillar.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-display font-bold mb-6 group-hover:tracking-tight transition-all">{pillar.title}</h3>
                  <p className="text-white/50 font-light leading-relaxed mb-10 text-[clamp(0.875rem,1vw,1.125rem)]">
                    {pillar.desc}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {pillar.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-brand-red" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive Synergy Hub */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 md:mt-32 p-12 md:p-20 rounded-3xl bg-zinc-950 border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,59,59,0.05)_0%,transparent_70%)]" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <h3 className="text-[clamp(2rem,4vw,3.5rem)] font-display font-bold tracking-tighter mb-8 uppercase">Seamless Integration.</h3>
                <p className="text-[clamp(1rem,1.5vw,1.25rem)] text-white/40 font-light leading-relaxed mb-12">
                  Unified services. Agile processes. Technical robustness. Strategic alignment.
                </p>
                <div className="flex flex-col gap-6">
                  {[
                    { label: "Cross-Functional Teams", desc: "Real-time coordination between design and engineering." },
                    { label: "Unified Strategy", desc: "Single point of contact. Cohesive project strategy." },
                    { label: "Agile Operations", desc: "Rapid iterations. Integrated technical workflows." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-brand-red/30 transition-colors">
                        <Zap size={18} className="text-brand-red" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{item.label}</h4>
                        <p className="text-sm text-white/30">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative aspect-square flex items-center justify-center">
                {/* Visual Representation of the Ecosystem Hub */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-white/5 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-12 border border-white/5 rounded-full border-dashed"
                  />
                  
                  {/* Central Node */}
                  <div className="relative z-20 w-32 h-32 md:w-48 md:h-48 rounded-full bg-black border border-brand-red/30 flex items-center justify-center shadow-[0_0_50px_rgba(255,59,59,0.15)] group-hover:scale-110 transition-transform duration-700">
                    <div className="text-center">
                      <span className="block text-brand-red font-bold text-xs tracking-widest uppercase mb-1">Kapitech</span>
                      <span className="block text-white font-display font-bold text-2xl md:text-3xl">CORE</span>
                    </div>
                  </div>
                  
                  {/* Orbiting Nodes */}
                  {[
                    { label: "Design", icon: <Palette size={16} />, pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" },
                    { label: "Tech", icon: <Code2 size={16} />, pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" },
                    { label: "Strategy", icon: <Activity size={16} />, pos: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2" },
                    { label: "Growth", icon: <Zap size={16} />, pos: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2" }
                  ].map((node, i) => (
                    <motion.div
                      key={node.label}
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 4, delay: i * 1, repeat: Infinity, ease: "easeInOut" }}
                      className={cn("absolute z-30 p-4 md:p-6 rounded-2xl bg-zinc-900 border border-white/10 flex flex-col items-center gap-2 shadow-2xl", node.pos)}
                    >
                      <div className="text-brand-red">{node.icon}</div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{node.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Quote */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-charcoal relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-[clamp(1.5rem,3vw,2.75rem)] font-display font-bold leading-tight"
          >
            "Kapitech integrates high-fidelity design with reliable engineering. We build products for market-leading performance."
          </motion.h2>
        </div>
      </section>

      {/* Service Preview */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-red/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 grid-bg opacity-5" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Service Preview</span>
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tighter leading-tight uppercase">Core Capabilities.</h2>
            </div>
            <Link to="/services" className="group flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 hover:text-brand-red transition-colors">
              View All Services <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { 
                title: "Website Development", 
                desc: "High-performance websites and web applications built for speed and security. Focus on user experience and clean code.", 
                tags: ["React", "Next.js", "Node.js", "TypeScript"],
                isTop: true,
                icon: <Code2 size={24} />
              },
              { 
                title: "UI/UX Design", 
                desc: "Beautiful and functional interfaces. User-centric design for better engagement and experience.", 
                tags: ["Figma", "Prototyping", "Design Systems", "Usability"],
                isTop: true,
                icon: <Palette size={24} />
              },
              { 
                title: "Technical Architecture", 
                desc: "Planning and structuring your digital presence for long-term growth.", 
                tags: ["Cloud", "Database", "API", "Security"],
                isTop: false,
                icon: <Cpu size={24} />
              },
              { 
                title: "System Engineering", 
                desc: "Expert development solutions for complex business needs. Integration of reliable tools to help your business run smoothly.", 
                tags: ["DevOps", "Backend", "Integration", "Scaling"],
                isTop: false,
                icon: <Layers size={24} />
              }
            ].map((service, i) => (
              <motion.div 
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-10 rounded-3xl bg-zinc-900/50 backdrop-blur-sm border transition-all group relative overflow-hidden h-full flex flex-col",
                  service.isTop ? "border-brand-red/30 shadow-[0_0_30px_rgba(255,59,59,0.05)]" : "border-white/5"
                )}
              >
                {service.isTop && (
                  <div className="absolute top-0 right-0 px-4 py-2 bg-brand-red text-white text-[8px] font-mono font-bold uppercase tracking-widest rounded-bl-2xl">
                    Top Service
                  </div>
                )}
                
                <div className="mb-8 p-4 w-fit rounded-2xl bg-white/5 border border-white/10 text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all duration-500">
                  {service.icon}
                </div>

                <div className="flex flex-col flex-grow">
                  <h3 className="text-xl font-display font-bold mb-4 group-hover:text-brand-red transition-colors uppercase tracking-tighter">{service.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-8 font-light">{service.desc}</p>
                  
                  <div className="mt-auto pt-8 border-t border-white/5 flex flex-wrap gap-2">
                    {service.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[8px] font-mono font-bold uppercase tracking-widest text-white/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
        {/* Built to Scale Manifesto */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black text-white overflow-hidden relative border-y border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,59,59,0.08)_0%,transparent_70%)]" />
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] bg-brand-red/5 blur-[120px] rounded-full" 
          />
          <div className="absolute inset-0 grid-bg opacity-5" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2.5rem,8vw,7rem)] font-display font-black leading-[0.8] tracking-tighter uppercase text-white"
          >
            Digital Solutions.<br />
            Logical Design.<br />
            Reliable<br />
            Engineering.
          </motion.h2>
          <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            <p className="text-[clamp(1.25rem,2.5vw,2.5rem)] font-light leading-tight tracking-tight text-white/60">
              Architecture for long-term growth. Systems evolve with client vision. Technical foundation.
            </p>
            <div className="flex flex-col justify-end items-start">
              <Link to="/services" className="group flex items-center gap-4 text-xl font-bold uppercase tracking-widest hover:text-brand-red transition-colors">
                Explore Services <ArrowUpRight size={32} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Specialization */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Services</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tighter mb-8 leading-tight uppercase">Specialized Expertise.</h2>
            <p className="text-sm text-white/40 font-light leading-relaxed mb-12">
              We provide holistic digital services to accelerate your business. From robust engineering to intuitive visual design.
            </p>
            <div className="grid grid-cols-1 gap-8">
              {[
                { label: "IT Development", desc: "Reliable web & mobile apps", icon: <Code2 size={24} /> },
                { label: "UI/UX Design", desc: "User-friendly interfaces", icon: <Layout size={24} /> },
                { label: "Graphic Design", desc: "Professional visual assets", icon: <Palette size={24} /> }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex items-center gap-6 p-6 rounded-2xl border border-white/5 hover:border-brand-red/30 hover:bg-white/5 transition-all duration-500 cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all duration-500">
                    {item.icon}
                  </div>
                  <div>
                    <span className="block font-bold text-2xl mb-1 group-hover:text-brand-red transition-colors">{item.label}</span>
                    <span className="text-xs text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">{item.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=2070" 
              alt="Digital Craftsmanship" 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Free Consultation */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Work With Us</span>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tighter mb-8 uppercase">Start Your Project.</h2>
          <p className="text-sm text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-12">
            Ready to take the next step? Let's discuss how we can transform your vision into reality.
          </p>
          <MagneticButton>
            <Link to="/contact" className="px-8 py-4 bg-white text-black rounded-2xl font-mono font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-[10px] inline-block">
              Get in Touch
            </Link>
          </MagneticButton>
        </div>
      </section>

      {/* Meeting Scheduler */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-[#111111] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-white text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tighter mb-4 leading-tight uppercase">Let's Collaborate.</h2>
            <p className="text-sm font-light opacity-80">Book a discovery call to explore technical and creative synergies.</p>
          </div>
          <MagneticButton>
            <Link to="/contact" className="px-8 py-4 bg-white text-black rounded-2xl font-mono font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-[10px]">
              Book a Call
            </Link>
          </MagneticButton>
        </div>
      </section>

      {/* Philosophy Section - Reveal on Scroll */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Operational Principles</span>
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tighter mb-8 leading-tight uppercase">System Integrity.</h2>
            <p className="text-sm text-white/60 font-light leading-relaxed mb-12">
              Creativity meets execution. Clear design. Smart development. Outstanding digital products.
            </p>
            <div className="flex flex-col gap-6">
              {[
                { title: "Smart Design", desc: "Artistic vision integrated with clean design principles." },
                { title: "User-Focused", desc: "Products designed for intuitive user journeys." },
                { title: "Modern Stacks", desc: "Latest technologies for performance and scale." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-brand-red" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <div className="relative aspect-square rounded-3xl overflow-hidden">
            <motion.div 
              initial={{ scale: 1.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              <img 
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072" 
                alt="Philosophy" 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div 
              initial={{ x: "0%" }}
              whileInView={{ x: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-brand-red z-10"
            />
          </div>
        </div>
      </section>

      {/* Featured Work Preview - Vertical Grid */}
      <section className="py-20 md:py-40 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 md:mb-32">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Project Portfolio</span>
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tighter uppercase">Case Studies.</h2>
            </div>
            <Link to="/work" className="group px-6 py-3 rounded-2xl border border-white/10 hover:bg-white hover:text-black transition-all duration-500 font-mono font-bold tracking-widest uppercase text-[10px] flex items-center gap-3">
              View All <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24" role="list" aria-label="Featured projects">
            {projects.map((project, i) => (
              <motion.div 
                key={project.title}
                role="listitem"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className="group cursor-pointer focus:outline-none"
                onClick={() => setSelectedProject(project)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(project)}
                tabIndex={0}
                aria-label={`View project: ${project.title}`}
              >
                <PerspectiveTilt 
                  className="overflow-hidden rounded-3xl aspect-[16/10] mb-8 relative"
                >
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </PerspectiveTilt>
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl md:text-3xl font-display font-bold group-hover:text-brand-red transition-colors">{project.title}</h3>
                      <span className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/5 text-[8px] font-mono text-emerald-400 uppercase tracking-widest">
                        {project.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                      <span className="text-brand-red text-[10px] font-mono font-bold uppercase tracking-[0.2em]">{project.category}</span>
                      <span className="text-white/30 text-[10px] font-mono uppercase tracking-[0.2em]">{project.region}</span>
                    </div>
                    <p className="text-white/60 text-sm font-light leading-relaxed max-w-sm mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.stack?.map(tech => (
                        <span key={tech} className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shrink-0">
                    <ArrowUpRight size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <Testimonials />

      {/* Technical Authority Widget */}
      {/* Workflow Architecture */}
      <section className="py-32 px-6 md:px-12 bg-black border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 grid-bg" />
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-brand-red/20 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-20">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-8 h-px bg-brand-red" />
                <span className="text-brand-red font-mono font-bold tracking-[0.4em] uppercase text-[10px]">
                  Workflow Architecture
                </span>
              </motion.div>
              <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-display font-bold tracking-tighter leading-[0.9] uppercase">
                Operational <span className="text-brand-red">Lifecycle.</span>
              </h2>
              <p className="mt-6 text-white/40 text-lg font-light max-w-xl leading-relaxed">
                Clear and proven process. From initial idea to final launch. We make sure every step is done right.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">Process: Active</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/10" />
              <div className="flex items-center gap-3 px-4 py-2">
                <Layers size={14} className="text-white/40" />
                <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Protocol: v4.0</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Discovery & Audit",
                desc: "Understanding your current needs and challenges. We collaborate closely to define project goals and requirements.",
                metrics: { label: "AUDIT_STATUS", value: "VERIFIED" },
                nodes: ["Requirement Mapping", "Technical Feasibility"],
                icon: <Activity size={20} />,
                color: "group-hover:border-brand-red/30"
              },
              {
                step: "02",
                title: "Architecture & UI",
                desc: "Creating wireframes and high-fidelity designs. Building user flows that make sense for your audience.",
                metrics: { label: "SYSTEM_TYPE", value: "MODULAR" },
                nodes: ["System Mapping", "Interface Systems"],
                icon: <Palette size={20} />,
                color: "group-hover:border-blue-500/30"
              },
              {
                step: "03",
                title: "Engineering",
                desc: "Full-stack development using enterprise frameworks. Implementation of scalable backend logic and high-performance frontend components.",
                metrics: { label: "LOGIC_CORE", value: "ROBUST" },
                nodes: ["API Orchestration", "Security Hardening"],
                icon: <Code2 size={20} />,
                color: "group-hover:border-emerald-500/30"
              },
              {
                step: "04",
                title: "Deployment",
                desc: "System integration and CI/CD pipeline execution. Performance monitoring and operational scaling for long-term growth.",
                metrics: { label: "INFRASTRUCTURE", value: "ELASTIC" },
                nodes: ["Cloud Scaling", "Optimization"],
                icon: <Rocket size={20} />,
                color: "group-hover:border-white/30"
              }
            ].map((phase, i) => (
              <motion.div 
                key={phase.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 flex flex-col gap-8 group transition-all duration-700 relative overflow-hidden",
                  phase.color
                )}
              >
                <div className="space-y-2 relative z-10">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/30">Phase {phase.step} // {phase.title.split(' ')[0]}</span>
                  <h3 className="text-2xl font-display font-bold">{phase.title}</h3>
                </div>
                
                <p className="text-white/40 text-xs font-light leading-relaxed relative z-10">
                  {phase.desc}
                </p>

                <div className="space-y-6 relative z-10 mt-auto">
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-mono font-bold text-white tracking-tighter">{phase.metrics.value}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest">{phase.metrics.label}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 pt-6 border-t border-white/5">
                    {phase.nodes.map(node => (
                      <div key={node} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-brand-red" />
                        <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest">{node}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Achievements Section */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-black relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 md:mb-32">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-px bg-brand-red/40" />
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px]">Recognition</span>
              </div>
              <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-display font-bold tracking-tighter leading-none uppercase">
                Awards &<br />
                <span className="text-white/20">Achievements.</span>
              </h2>
            </div>
            <p className="text-lg text-white/40 font-light max-w-sm leading-relaxed">
              While client growth is our primary metric, technical recognition validates our operational standards.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { year: "2023", award: "Awwwards", category: "Site of the Day", icon: <Globe size={24} /> },
              { year: "2023", award: "CSS Design", category: "Special Kudos", icon: <Layout size={24} /> },
              { year: "2022", award: "FWA", category: "Mobile Excellence", icon: <Zap size={24} /> },
              { year: "2022", award: "Behance", category: "Interaction Design", icon: <Palette size={24} /> }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 hover:border-brand-red/30 transition-all duration-500 group"
              >
                <div className="text-brand-red/40 group-hover:text-brand-red transition-colors mb-6">
                  {item.icon}
                </div>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest block mb-2">{item.year}</span>
                <h3 className="text-xl font-display font-bold mb-1 uppercase tracking-tight">{item.award}</h3>
                <p className="text-xs text-white/40 font-light uppercase tracking-widest">{item.category}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section (Replaces Newsletter) */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-zinc-950 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 grid-bg" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-8 block">Project Initiation</span>
            <h2 className="text-[clamp(2.5rem,8vw,6.5rem)] font-display font-bold tracking-tighter leading-[0.85] mb-12 uppercase">
              Ready to scale<br />
              <span className="text-white/20">your business?</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/40 font-light leading-relaxed mb-16 max-w-2xl mx-auto">
              Join 250+ companies who have built and scaled with our Kapitech team. We architect digital success.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <MagneticButton>
                <Link to="/contact" className="group h-14 px-12 bg-white text-black rounded-2xl font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500">
                  Start a Project
                  <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/work" className="h-14 px-12 rounded-2xl border border-white/10 hover:bg-white/5 transition-all font-mono font-bold tracking-widest uppercase text-xs flex items-center">
                  View Projects
                </Link>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project Detail Modal */}
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
              className="fixed top-12 right-12 z-[110] p-4 rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all"
            >
              <X size={32} />
            </motion.button>

            <div className="w-full h-[70vh] relative">
              <motion.img 
                layoutId={`img-${selectedProject.title}`}
                src={selectedProject.image} 
                alt={selectedProject.title} 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-20 left-6 md:left-12">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-brand-red font-bold tracking-[0.3em] uppercase text-sm mb-4 block"
                >
                  {selectedProject.category}
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl sm:text-6xl md:text-[8vw] lg:text-[10vw] font-display font-bold tracking-tighter leading-none"
                >
                  {selectedProject.title}
                </motion.h2>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 grid grid-cols-1 md:grid-cols-3 gap-20">
              <div className="md:col-span-2">
                <h3 className="text-4xl font-display font-bold mb-8 text-brand-red uppercase">Technical Requirement.</h3>
                <p className="text-2xl text-white/60 font-light leading-relaxed mb-16">
                  {selectedProject.description}
                </p>
                <h3 className="text-4xl font-display font-bold mb-8 text-brand-red uppercase">System Implementation.</h3>
                <p className="text-2xl text-white/60 font-light leading-relaxed">
                  Architecture of digital ecosystem. High-fidelity visual systems. Sub-second performance. 3D asset integration. Headless CMS implementation.
                </p>
              </div>
              <div className="space-y-12">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-4">Technical Stack</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.stack?.map(s => (
                      <span key={s} className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-4">Operational Metrics</span>
                  <div className="space-y-6">
                    <div>
                      <span className="text-4xl font-display font-bold block">SCALED</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">Conversion Delta</span>
                    </div>
                    <div>
                      <span className="text-4xl font-display font-bold block">REDUCED</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">Latency Reduction</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
