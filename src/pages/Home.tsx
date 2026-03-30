import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Zap, Shield, Globe, Cpu, Layout, Code2, Palette, Box, Layers, Activity, X } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
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
      title: "Vanguard Logistics",
      category: "Enterprise System / Dashboard",
      image: "https://picsum.photos/seed/vanguard/1200/800",
      description: "Challenge: Data latency in supply chain tracking. Solution: We architected a cloud-native ERP optimizing visibility by 40%."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-20 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-red/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        
        {/* Background Kinetic Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none overflow-hidden">
          <span className="text-[40vw] font-display font-black uppercase tracking-tighter leading-none">KAPITECH</span>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">
                Elite Digital Studio
              </span>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Systems Online
              </div>
            </div>
            
            <h1 className="text-7xl md:text-[10vw] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient">
              Digital<br />
              Powerhouse.
            </h1>
            
            <p className="text-xl md:text-3xl text-white/40 max-w-3xl font-light leading-tight mb-16 tracking-tight">
              We engineer extraordinary digital products through <span className="text-white">IT Development</span>, <span className="text-white">UI/UX Design</span>, and <span className="text-white">SOP Consultancy</span>. Tech meets Artistry.
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
          <div className="kinetic-track text-[15vh] font-display font-black uppercase tracking-tighter">
            <span>Elite Digital Studio • High Fidelity Design • Robust Engineering • Scalable Infrastructure • </span>
            <span>Elite Digital Studio • High Fidelity Design • Robust Engineering • Scalable Infrastructure • </span>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-32 px-6 md:px-12 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "ROI Increase", value: "240%", desc: "Average client growth" },
            { label: "Speed Boost", value: "60%", desc: "Faster load times" },
            { label: "Projects", value: "150+", desc: "Delivered globally" },
            { label: "Uptime", value: "99.9%", desc: "Reliability guaranteed" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <span className="text-5xl md:text-7xl font-display font-bold text-white block mb-2">{stat.value}</span>
              <span className="text-brand-red font-bold uppercase tracking-widest text-[10px] block mb-2">{stat.label}</span>
              <p className="text-white/40 text-xs">{stat.desc}</p>
            </motion.div>
          ))}
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
      <section className="py-40 px-6 md:px-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden order-2 md:order-1">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070" 
              alt="Agency vs Freelance" 
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
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">Beyond the Solo Freelancer.</h2>
            <p className="text-xl text-white/60 font-light leading-relaxed mb-8">
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

      {/* SOP Methodology */}
      <section className="py-40 px-6 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24">
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The Kapitech SOP</span>
            <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter">Our Methodology.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Discovery", desc: "Deep-dive audit of current infrastructure and business objectives." },
              { step: "02", title: "Blueprints", desc: "Architecting high-fidelity UI/UX and technical system maps." },
              { step: "03", title: "Sprint Dev", desc: "Agile engineering with continuous integration and testing." },
              { step: "04", title: "Deployment", desc: "Global edge delivery with 24/7 performance monitoring." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2rem] bg-zinc-900 border border-white/5 hover:border-brand-red transition-all group"
              >
                <span className="text-4xl font-display font-bold text-brand-red block mb-6">{item.step}</span>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built to Scale Manifesto */}
      <section className="py-60 px-6 md:px-12 bg-black text-white overflow-hidden relative border-y border-white/5">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-[0.8] tracking-tighter uppercase text-white"
          >
            Built to Scale.<br />
            Engineered to<br />
            Dominate.
          </motion.h2>
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-20">
            <p className="text-2xl md:text-4xl font-light leading-tight tracking-tight text-white/60">
              We don't build for today. We build for the version of your company that exists five years from now. Performance is not a feature; it's our foundation.
            </p>
            <div className="flex flex-col justify-end items-start">
              <Link to="/services" className="group flex items-center gap-4 text-xl font-bold uppercase tracking-widest hover:text-brand-red transition-colors">
                View Architecture <ArrowUpRight size={32} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/[0.02] -skew-x-12 translate-x-1/4" />
      </section>

      {/* Real Estate Digital Solutions */}
      <section className="py-40 px-6 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Sector Specialization</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">Real Estate<br />Digital Mastery.</h2>
            <p className="text-xl text-white/40 font-light leading-relaxed mb-12">
              We architect high-fidelity property portals, 3D immersive tours, and automated lead-to-close systems for the world's most ambitious developers.
            </p>
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: "3D Tours", desc: "Immersive walkthroughs" },
                { label: "Lead Gen", desc: "Automated pipelines" },
                { label: "CRM Sync", desc: "Legacy integration" },
                { label: "Portals", desc: "High-speed search" }
              ].map((item, i) => (
                <div key={i} className="border-l border-brand-red pl-6">
                  <span className="block font-bold mb-1">{item.label}</span>
                  <span className="text-xs text-white/40 uppercase tracking-widest">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070" 
              alt="Real Estate Solutions" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* IT Infrastructure Audit */}
      <section className="py-40 px-6 md:px-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Corporate Health Check</span>
          <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8">Free Infrastructure Audit.</h2>
          <p className="text-xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-12">
            Is your current tech stack holding you back? We provide a comprehensive 48-hour audit of your digital ecosystem, identifying bottlenecks and security vulnerabilities.
          </p>
          <MagneticButton>
            <button className="px-12 py-5 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs">
              Request Free Audit
            </button>
          </MagneticButton>
        </div>
      </section>

      {/* Industry Expertise Badges */}
      <section className="py-40 px-6 md:px-12 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { sector: "Fintech", desc: "High-frequency trading platforms & secure payment gateways." },
              { sector: "Real Estate", desc: "PropTech solutions, 3D portals, and CRM automation." },
              { sector: "E-commerce", desc: "Headless commerce & high-conversion retail architectures." },
              { sector: "SaaS", desc: "Scalable cloud-native products with robust API ecosystems." }
            ].map((item, i) => (
              <div key={i} className="group">
                <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-brand-red transition-colors">{item.sector}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                <div className="mt-6 h-[1px] w-0 bg-brand-red group-hover:w-full transition-all duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meeting Scheduler */}
      <section className="py-40 px-6 md:px-12 bg-[#111111] border-y border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-white">
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-4 leading-none">Strategic Partnership.</h2>
            <p className="text-xl font-light opacity-80">Inquire about long-term IT & Creative collaboration.</p>
          </div>
          <MagneticButton>
            <Link to="/contact" className="px-12 py-6 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs">
              Begin Consultation
            </Link>
          </MagneticButton>
        </div>
      </section>

      {/* Philosophy Section - Reveal on Scroll */}
      <section className="py-40 px-6 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Philosophy</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">We build for the 1%.</h2>
            <p className="text-xl text-white/60 font-light leading-relaxed mb-12">
              In a world of digital noise, we create silence. Our work is defined by what we leave out as much as what we put in. We don't just build websites; we architect digital legacies.
            </p>
            <div className="flex flex-col gap-6">
              {[
                { title: "Precision Engineering", desc: "Every pixel is calculated. Every line of code is optimized." },
                { title: "Strategic Artistry", desc: "Design that doesn't just look good, but drives conversion." },
                { title: "Future-Proofing", desc: "Built on technologies that will dominate the next decade." }
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

      {/* Featured Work Preview - Horizontal Scroll */}
      <section className="py-40 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-32">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Selected Works</span>
              <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter">The Portfolio.</h2>
            </div>
            <Link to="/work" className="group px-8 py-4 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-500 font-bold tracking-widest uppercase text-xs flex items-center gap-3">
              Explore All <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="flex gap-8 px-6 md:px-12 overflow-x-auto custom-scrollbar pb-20 snap-x">
            {projects.map((project, i) => (
              <motion.div 
                key={project.title}
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className="min-w-[45vw] md:min-w-[420px] snap-center group cursor-pointer"
              >
                <PerspectiveTilt 
                  className="overflow-hidden rounded-[2rem] aspect-video mb-8 relative"
                  onClick={() => setSelectedProject(project)}
                >
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                </PerspectiveTilt>
                <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">{project.title}</h3>
                  <p className="text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{project.category}</p>
                  <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm">{project.description}</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shrink-0">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technical Authority Widget */}
      <section className="py-32 px-6 md:px-12 bg-zinc-950 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-10 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Server Status</span>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                99.9% Uptime
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-grow h-12 flex items-end gap-1">
                {[40, 60, 45, 70, 55, 80, 65, 90, 75, 85].map((h, i) => (
                  <div key={i} className="flex-grow bg-emerald-400/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <span className="text-2xl font-display font-bold">24ms</span>
            </div>
            <p className="text-xs text-white/40">Global edge network latency optimized for sub-second delivery.</p>
          </div>

          <div className="p-10 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Security Protocol</span>
            <div className="flex items-center gap-4">
              <Shield className="text-brand-red" size={40} />
              <div>
                <span className="block text-xl font-bold">AES-256</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">Encryption Standard</span>
              </div>
            </div>
            <p className="text-xs text-white/40">Every digital asset is protected by enterprise-grade security hardening.</p>
          </div>

          <div className="p-10 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Core Methodology</span>
            <div className="flex items-center gap-4">
              <Layers className="text-blue-500" size={40} />
              <div>
                <span className="block text-xl font-bold">Atomic</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">Design System</span>
              </div>
            </div>
            <p className="text-xs text-white/40">We build scalable components that evolve with your business architecture.</p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-40 px-6 md:px-12 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The Kapitech Insight</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">Stay ahead of the curve.</h2>
            <p className="text-xl text-white/40 font-light leading-relaxed">
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
                  className="text-6xl md:text-[10vw] font-display font-bold tracking-tighter leading-none"
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
