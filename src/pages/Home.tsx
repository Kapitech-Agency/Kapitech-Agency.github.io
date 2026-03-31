import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Zap, Shield, Globe, Cpu, Layout, Code2, Palette, Box, Layers, Activity, X } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { Testimonials } from '../components/Testimonials';
import { cn } from '../lib/utils';

export const Home = () => {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], [0, -1000]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      category: "Web Development / UI Design",
      image: "https://picsum.photos/seed/lumina/1200/800",
      description: "Challenge: A fragmented property search experience. Solution: We engineered a high-fidelity portal featuring 3D walkthroughs and real-time lead management."
    },
    {
      title: "Aura Creative Studio",
      category: "Branding / 3D Visuals",
      image: "https://picsum.photos/seed/aura/1200/800",
      description: "Challenge: A cluttered visual presence. Solution: We orchestrated a sharp, charcoal-themed identity system reflecting their avant-garde approach."
    },
    {
      title: "Nexus Fintech App",
      category: "Mobile App / Product Strategy",
      image: "https://picsum.photos/seed/nexus/1200/800",
      description: "Challenge: Complex financial data causing user drop-off. Solution: We designed a frictionless UI/UX strategy for 100k+ active users."
    },
    {
      title: "Quantum AI",
      category: "AI Platform / IT Development",
      image: "https://picsum.photos/seed/quantum/1200/800",
      description: "Challenge: Infrastructure complexity for AI researchers. Solution: We engineered a streamlined development environment with high-fidelity visualization."
    },
    {
      title: "Solaris Energy",
      category: "Clean Tech / Dashboard",
      image: "https://picsum.photos/seed/solaris/1200/800",
      description: "Challenge: Complex energy data visualization. Solution: We designed a multi-layered monitoring platform for real-time production analytics."
    },
    {
      title: "Vivid Fashion",
      category: "E-commerce / Branding",
      image: "https://picsum.photos/seed/vivid/1200/800",
      description: "Challenge: Poor mobile performance and storytelling. Solution: We migrated to a headless stack with immersive visual storytelling features."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="film-grain"
      role="main"
      aria-label="Kapitech Home"
    >
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-20 overflow-hidden bg-black">
        {/* Enhanced Atmospheric Background */}
        <div className="absolute inset-0 z-0">
          {/* Technical Dot Matrix */}
          <div className="absolute inset-0 opacity-[0.15]" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', 
                 backgroundSize: '32px 32px' 
               }} 
          />
          
          {/* Subtle Grid */}
          <div className="absolute inset-0 grid-bg opacity-10" />
          
          {/* Deep Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
          
          {/* Muted Layered Gradients */}
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-brand-red/10 blur-[180px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              scale: [1.1, 1, 1.1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-[700px] h-[700px] bg-blue-900/10 blur-[180px] rounded-full" 
          />
          
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">
                Creative Tech Studio
              </span>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Systems Online
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-[8vw] lg:text-[10vw] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient">
              Digital<br />
              Powerhouse.
            </h1>
            
            <p className="text-xl md:text-3xl text-white/60 max-w-3xl font-light leading-tight mb-16 tracking-tight">
              We engineer extraordinary digital products through <span className="text-white">IT Development</span>, <span className="text-white">UI/UX Design</span>, and <span className="text-white">Graphic Design</span>. Tech meets Artistry.
            </p>
            
            <div className="flex flex-wrap gap-6 items-center">
              <MagneticButton>
                <Link to="/contact" className="group px-10 py-5 bg-white text-black rounded-full font-bold flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500">
                  Start Your Breakthrough
                  <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link to="/contact" className="px-10 py-5 rounded-full border border-white/10 hover:bg-white/5 transition-all font-bold tracking-widest uppercase text-xs">
                  Strategic Inquiry
                </Link>
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Kinetic Typography */}
        <div className="absolute bottom-10 left-0 w-full kinetic-text opacity-5 select-none pointer-events-none">
          <div className="kinetic-track text-[8vh] md:text-[15vh] font-display font-black uppercase tracking-tighter">
            <span>Creative Tech Studio • UI/UX Design • IT Development • Graphic Design • </span>
            <span>Creative Tech Studio • UI/UX Design • IT Development • Graphic Design • </span>
          </div>
        </div>
      </section>

      {/* Performance Matrix */}
      <section className="py-24 md:py-40 px-6 md:px-12 bg-black border-y border-white/5 relative overflow-hidden" aria-label="Performance Statistics">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-brand-red/50 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-16" role="list">
            {[
              { 
                label: "Sub-second Latency", 
                value: "0.8s", 
                desc: "Average global load time for our high-fidelity deployments.",
                icon: <Cpu size={16} />
              },
              { 
                label: "Conversion Growth", 
                value: "+45%", 
                desc: "Average increase in user engagement post-orchestration.",
                icon: <ArrowUpRight size={16} />
              },
              { 
                label: "Global Scalability", 
                value: "15+", 
                desc: "Countries served with enterprise-level cloud infrastructure.",
                icon: <Globe size={16} />
              },
              { 
                label: "System Reliability", 
                value: "99.9%", 
                desc: "Guaranteed uptime for mission-critical digital ecosystems.",
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
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 group-hover:text-brand-red transition-colors">{stat.label}</span>
                </div>
                <div className="space-y-4">
                  <span className="text-5xl md:text-7xl font-display font-bold block text-white tracking-tighter">{stat.value}</span>
                  <p className="text-sm text-white/60 font-light leading-relaxed max-w-[200px]">
                    {stat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <section className="py-20 bg-black overflow-hidden border-b border-white/5">
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

      {/* Anti-Freelance Statement */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden order-2 md:order-1">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070" 
              alt="Agency vs Freelance" 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale"
            />
            <div className="absolute inset-0 bg-brand-red/20 mix-blend-multiply" />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The Kapitech Advantage</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">Beyond the Solo Freelancer.</h2>
            <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed mb-8">
              Freelancers offer tasks. We offer systems. Kapitech provides a full-stack ecosystem of designers, architects, and consultants working in orchestration. 
            </p>
            <div className="space-y-6">
              {[
                { title: "Redundancy & Reliability", desc: "Your project never stops. Our team-based approach ensures zero downtime." },
                { title: "Enterprise Scalability", desc: "We build for where you're going, not just where you are today." },
                { title: "SOP-Driven Execution", desc: "Every sprint is documented, audited, and optimized for performance." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Kapitech Ecosystem Section */}
      <section className="py-32 md:py-48 px-6 md:px-12 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/5 blur-[150px] rounded-full" />
          <div className="absolute inset-0 grid-bg opacity-5" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 md:mb-32">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-brand-red font-bold tracking-[0.4em] uppercase text-[10px] mb-6 block"
            >
              The Orchestration of Excellence
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-8"
            >
              The Kapitech Ecosystem.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/40 font-light max-w-3xl mx-auto leading-relaxed"
            >
              A unified framework where design intelligence, engineering power, and strategic advisory converge to build digital legacies.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                title: "Design Intelligence",
                icon: <Palette size={32} />,
                color: "from-brand-red/20 to-transparent",
                borderColor: "border-brand-red/20",
                desc: "We don't just design; we architect visual languages. From high-fidelity UI/UX to avant-garde branding, our design intelligence ensures your product commands attention and delivers frictionless experiences.",
                features: ["Immersive UI/UX", "Brand Identity", "3D Visualization", "Motion Design"]
              },
              {
                title: "Engineering Power",
                icon: <Code2 size={32} />,
                color: "from-blue-600/20 to-transparent",
                borderColor: "border-blue-600/20",
                desc: "Robust, scalable, and sub-second. Our engineering pillar leverages modern tech stacks to build high-performance IT solutions that are engineered for growth and technical excellence.",
                features: ["Full-Stack Dev", "Cloud Architecture", "Mobile Engineering", "API Integration"]
              },
              {
                title: "Strategic Advisory",
                icon: <Activity size={32} />,
                color: "from-emerald-500/20 to-transparent",
                borderColor: "border-emerald-500/20",
                desc: "Data-driven insights meet market intuition. We provide strategic advisory to align your digital products with core business objectives, ensuring every pixel serves a purpose in your market dominance.",
                features: ["Product Strategy", "Market Analysis", "Scaling Roadmap", "Performance Audit"]
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
                  "p-10 rounded-[3rem] bg-zinc-900/40 border backdrop-blur-xl transition-all duration-500 group relative overflow-hidden",
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
                  
                  <h3 className="text-3xl font-display font-bold mb-6 group-hover:tracking-tight transition-all">{pillar.title}</h3>
                  <p className="text-white/50 font-light leading-relaxed mb-10 text-sm md:text-base">
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
            className="mt-20 md:mt-32 p-12 md:p-20 rounded-[4rem] bg-zinc-950 border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,59,59,0.05)_0%,transparent_70%)]" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-8">The Synergy Hub.</h3>
                <p className="text-lg text-white/40 font-light leading-relaxed mb-12">
                  Our ecosystem isn't just a collection of services; it's a living synergy. Each pillar informs the other, creating a feedback loop of innovation that ensures your project is visually stunning, technically robust, and strategically sound.
                </p>
                <div className="flex flex-col gap-6">
                  {[
                    { label: "Cross-Pillar Collaboration", value: "Real-time sync between design and dev teams." },
                    { label: "Unified Vision", desc: "One point of contact, one cohesive strategy." },
                    { label: "Agile Orchestration", desc: "Rapid iterations powered by integrated workflows." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-brand-red/30 transition-colors">
                        <Zap size={18} className="text-brand-red" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{item.label}</h4>
                        <p className="text-sm text-white/30">{item.desc || item.value}</p>
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
      <section className="py-32 px-6 md:px-12 bg-charcoal">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-3xl md:text-5xl font-display font-bold leading-tight"
          >
            "Kapitech spearheads the intersection of elite design and robust engineering to architect the digital legacies of tomorrow's market leaders."
          </motion.h2>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-red/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 grid-bg opacity-5" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 md:mb-24">
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The Creative Blueprint</span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter">Our Process.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8" role="list" aria-label="Our methodology">
            {[
              { step: "01", title: "Ideation", desc: "Conceptualizing unique digital experiences tailored to your brand." },
              { step: "02", title: "Design", desc: "Crafting high-fidelity UI/UX and stunning graphic identities." },
              { step: "03", title: "Development", desc: "Building robust, scalable IT solutions with modern tech stacks." },
              { step: "04", title: "Launch", desc: "Seamless deployment and continuous creative optimization." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                role="listitem"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2rem] bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="text-4xl font-display font-bold text-brand-red block mb-6 group-hover:scale-110 transition-transform duration-500">{item.step}</span>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built to Scale Manifesto */}
      <section className="py-32 md:py-60 px-6 md:px-12 bg-black text-white overflow-hidden relative border-y border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,99,33,0.08)_0%,transparent_70%)]" />
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
            className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-[0.8] tracking-tighter uppercase text-white"
          >
            Design First.<br />
            Built to Scale.<br />
            Engineered for<br />
            Excellence.
          </motion.h2>
          <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            <p className="text-xl md:text-3xl lg:text-4xl font-light leading-tight tracking-tight text-white/60">
              We don't just build for today. We architect digital legacies that evolve with your vision. Creativity is our engine; technology is our foundation.
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
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Core Expertise</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">Digital Craftsmanship.</h2>
            <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed mb-12">
              We specialize in the intersection of high-end design and robust development, delivering pixel-perfect products that command attention.
            </p>
            <div className="grid grid-cols-1 gap-8">
              {[
                { label: "IT Development", desc: "Scalable web & mobile applications", icon: <Code2 size={24} /> },
                { label: "UI/UX Design", desc: "Intuitive & immersive user experiences", icon: <Layout size={24} /> },
                { label: "Graphic Design", desc: "Bold visual identities & branding", icon: <Palette size={24} /> }
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
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden">
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
      <section className="py-20 md:py-40 px-6 md:px-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Strategic Advisory</span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-8">Free Design & Tech Consultation.</h2>
          <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-12">
            Ready to elevate your digital presence? We offer a complimentary 30-minute session to discuss your UI/UX, IT development, or graphic design needs.
          </p>
          <MagneticButton>
            <Link to="/contact" className="px-12 py-5 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs inline-block">
              Book Free Consultation
            </Link>
          </MagneticButton>
        </div>
      </section>

      {/* Meeting Scheduler */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-[#111111] border-y border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-white text-center md:text-left">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-4 leading-none">Strategic Partnership.</h2>
            <p className="text-lg md:text-xl font-light opacity-80">Inquire about long-term IT & Creative collaboration.</p>
          </div>
          <MagneticButton>
            <Link to="/contact" className="px-12 py-6 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs">
              Begin Consultation
            </Link>
          </MagneticButton>
        </div>
      </section>

      {/* Philosophy Section - Reveal on Scroll */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Philosophy</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">Artistry in Every Pixel.</h2>
            <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed mb-12">
              We believe that technology should be as beautiful as it is functional. Our philosophy is rooted in the pursuit of digital perfection, where every line of code and every design choice serves a purpose.
            </p>
            <div className="flex flex-col gap-6">
              {[
                { title: "Creative Logic", desc: "We blend artistic vision with technical precision to solve complex problems." },
                { title: "Human-Centric Design", desc: "Every product we build is designed with the end-user's journey in mind." },
                { title: "Technical Excellence", desc: "We leverage the latest technologies to ensure performance and scalability." }
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
          
          <div className="relative aspect-square rounded-[3rem] overflow-hidden">
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
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Selected Works</span>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter">The Portfolio.</h2>
            </div>
            <Link to="/work" className="group px-8 py-4 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-500 font-bold tracking-widest uppercase text-xs flex items-center gap-3">
              Explore All <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
                  className="overflow-hidden rounded-[2rem] aspect-[16/10] mb-8 relative"
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
                  <div>
                    <h3 className="text-2xl md:text-3xl font-display font-bold mb-3 group-hover:text-brand-red transition-colors">{project.title}</h3>
                    <p className="text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{project.category}</p>
                    <p className="text-white/60 text-sm font-light leading-relaxed max-w-sm">{project.description}</p>
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
      {/* Studio Diagnostics */}
      <section className="py-32 px-6 md:px-12 bg-black border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 grid-bg" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div>
              <span className="text-brand-red font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">System Monitoring</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter">Studio Diagnostics.</h2>
            </div>
            <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Nominal
              </div>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-[10px] font-mono text-white/40">v2.4.0-build.88</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Visual Fidelity Node */}
            <div className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 flex flex-col gap-8 group hover:border-brand-red/30 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Palette size={80} />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Node 01 // Visual Fidelity</span>
                <h3 className="text-2xl font-display font-bold">Design Accuracy</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-mono font-bold text-white">100%</span>
                  <span className="text-[10px] font-mono text-emerald-400">PIXEL_PERFECT</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-brand-red"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <span className="text-[9px] font-mono text-white/30 block uppercase">Asset Opt.</span>
                    <span className="text-xs font-mono text-white">98.4%</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-white/30 block uppercase">Color Depth</span>
                    <span className="text-xs font-mono text-white">32-BIT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Engineering Core */}
            <div className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 flex flex-col gap-8 group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Code2 size={80} />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Node 02 // Engineering Core</span>
                <h3 className="text-2xl font-display font-bold">System Uptime</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-mono font-bold text-white">99.99%</span>
                  <span className="text-[10px] font-mono text-blue-400">STABLE_BUILD</span>
                </div>
                <div className="flex gap-1 h-8 items-end">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: "20%" }}
                      animate={{ height: ["20%", "100%", "60%", "90%", "20%"] }}
                      transition={{ 
                        duration: 2 + Math.random() * 2, 
                        repeat: Infinity, 
                        delay: i * 0.1 
                      }}
                      className="flex-grow bg-blue-500/20 rounded-sm"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <span className="text-[9px] font-mono text-white/30 block uppercase">Deploy Speed</span>
                    <span className="text-xs font-mono text-white">124ms</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-white/30 block uppercase">Security</span>
                    <span className="text-xs font-mono text-white">AES-256</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Engine */}
            <div className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 flex flex-col gap-8 group hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={80} />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Node 03 // Strategic Engine</span>
                <h3 className="text-2xl font-display font-bold">Market Impact</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-mono font-bold text-white">12.5x</span>
                  <span className="text-[10px] font-mono text-emerald-400">ROI_MULTIPLIER</span>
                </div>
                <div className="relative h-12 flex items-center">
                  <svg className="w-full h-full text-emerald-500/20" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <motion.path
                      d="M0 20 L10 15 L20 18 L30 10 L40 12 L50 5 L60 8 L70 2 L80 4 L90 1 L100 3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 2 }}
                    />
                  </svg>
                  <motion.div 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute right-0 top-0 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <span className="text-[9px] font-mono text-white/30 block uppercase">Growth Lift</span>
                    <span className="text-xs font-mono text-white">+85%</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-white/30 block uppercase">Retention</span>
                    <span className="text-xs font-mono text-white">94.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The Kapitech Insight</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">Stay ahead of the curve.</h2>
            <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed">
              Bi-weekly intelligence on digital architecture, UI/UX psychology, and the future of IT infrastructure. No fluff. Just power.
            </p>
          </div>
          <div className="bg-zinc-900 p-12 rounded-[3rem] border border-white/5">
            <form className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-2">Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="bg-black border border-white/10 rounded-full px-8 py-5 text-white focus:outline-none focus:border-brand-red transition-all"
                />
              </div>
              <MagneticButton>
                <button className="w-full py-5 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs">
                  Subscribe to Insight
                </button>
              </MagneticButton>
              <p className="text-[10px] text-white/20 text-center uppercase tracking-widest">Join 5,000+ industry leaders.</p>
            </form>
          </div>
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
                <h3 className="text-4xl font-display font-bold mb-8 text-brand-red">The Challenge.</h3>
                <p className="text-2xl text-white/60 font-light leading-relaxed mb-16">
                  {selectedProject.description}
                </p>
                <h3 className="text-4xl font-display font-bold mb-8 text-brand-red">The Solution.</h3>
                <p className="text-2xl text-white/60 font-light leading-relaxed">
                  We architected a bespoke digital ecosystem that prioritized high-fidelity visual storytelling and sub-second performance. By integrating custom 3D assets and a headless CMS, we empowered the brand to command authority in their sector.
                </p>
              </div>
              <div className="space-y-12">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-4">Services Provided</span>
                  <div className="flex flex-wrap gap-2">
                    {["UI/UX Design", "IT Architecture", "3D Renders", "Performance Optimization"].map(s => (
                      <span key={s} className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-4">Key Metrics</span>
                  <div className="space-y-6">
                    <div>
                      <span className="text-4xl font-display font-bold block">+120%</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red">Conversion Rate</span>
                    </div>
                    <div>
                      <span className="text-4xl font-display font-bold block">-40%</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red">Load Time</span>
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
