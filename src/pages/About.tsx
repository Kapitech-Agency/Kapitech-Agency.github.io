import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Globe, Cpu, Layout, Code2, Palette, Box } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';

export const About = () => {
  const values = [
    {
      title: "Design Precision",
      icon: <Palette size={24} />,
      desc: "We believe that every pixel should serve a purpose. Our design philosophy is rooted in high-fidelity aesthetic standards and user psychology."
    },
    {
      title: "Technical Excellence",
      icon: <Code2 size={24} />,
      desc: "Our engineering team utilizes elite tech stacks to build robust, scalable codebases that prioritize sub-second performance and security."
    },
    {
      title: "Creative Strategy",
      icon: <Box size={24} />,
      desc: "We don't just build; we orchestrate. Every project begins with a deep strategic audit to ensure your digital presence aligns with long-term growth."
    }
  ];

  const journey = [
    { year: "2018", event: "Studio Founded", desc: "Started as a boutique design collective in Jakarta with 3 people." },
    { year: "2020", event: "Engineering Expansion", desc: "Integrated enterprise-level IT development into our core capabilities." },
    { year: "2022", event: "Global Scale", desc: "Expanded operations to serve clients across 15+ countries." },
    { year: "2024", event: "AI Integration", desc: "Pioneering AI-driven design and predictive engineering workflows." }
  ];

  const team = [
    {
      name: "Alex Rivera",
      role: "Founder & Creative Director",
      image: "https://picsum.photos/seed/alex/400/500",
      bio: "15+ years of experience in high-fidelity design and digital strategy. Alex founded Kapitech with a vision to bridge the gap between art and technology."
    },
    {
      name: "Sarah Chen",
      role: "Lead Engineer",
      image: "https://picsum.photos/seed/sarah/400/500",
      bio: "Specialist in cloud-native architectures and sub-second performance optimization. Sarah leads our technical team in building future-proof systems."
    },
    {
      name: "Marcus Thorne",
      role: "UI/UX Strategist",
      image: "https://picsum.photos/seed/marcus/400/500",
      bio: "Expert in user psychology and frictionless interface design. Marcus ensures every digital touchpoint is intuitive and meaningful."
    },
    {
      name: "Elena Vance",
      role: "Head of Operations",
      image: "https://picsum.photos/seed/elena/400/500",
      bio: "Elena orchestrates our complex project workflows, ensuring precision and excellence from initial ideation to final global deployment."
    },
    {
      name: "David Kim",
      role: "Senior Backend Architect",
      image: "https://picsum.photos/seed/david/400/500",
      bio: "A veteran in distributed systems and database optimization. David ensures our infrastructures are robust and capable of handling enterprise traffic."
    },
    {
      name: "Sofia Rossi",
      role: "Brand Strategist",
      image: "https://picsum.photos/seed/sofia/400/500",
      bio: "Sofia translates business objectives into bold visual narratives. She ensures every brand we touch commands authority in its sector."
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
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Elite Digital Studio</span>
              <h1 className="text-5xl sm:text-7xl md:text-[10vw] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient">
                Design First.<br />Built to Scale.
              </h1>
              <p className="text-xl md:text-3xl text-white/40 max-w-3xl font-light leading-tight tracking-tight">
                We are Kapitech Agency, a creative tech powerhouse specializing in high-fidelity digital experiences. We bridge the gap between avant-garde design and elite engineering.
              </p>
            </motion.div>
          </header>

          {/* Mission Section */}
          <section className="mb-32 md:mb-48 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
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
                <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Vision</span>
                <h3 className="text-3xl md:text-4xl font-display font-bold tracking-tighter">Orchestrating the Digital Future.</h3>
              </div>
            </div>
            <div className="space-y-8 md:space-y-12">
              <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter leading-none">
                We don't just build websites. We engineer <span className="text-brand-red">digital authority.</span>
              </h2>
              <div className="space-y-6">
                <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed">
                  Founded in 2018, Kapitech Agency began as a boutique design collective, driven by a singular mission: to elevate the digital standard. What started as a small team has evolved into a global powerhouse of designers, engineers, and strategists.
                </p>
                <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed">
                  We serve visionary brands across 15+ countries, delivering high-fidelity products that command authority and drive measurable growth. Our philosophy is simple: we don't just build products; we build legacies.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="text-3xl md:text-4xl font-display font-bold block">150+</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red">Projects Completed</span>
                </div>
                <div>
                  <span className="text-3xl md:text-4xl font-display font-bold block">99.9%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red">System Uptime</span>
                </div>
              </div>
            </div>
          </section>

          {/* Journey Section */}
          <section className="mb-32 md:mb-48">
            <div className="mb-16 md:mb-24">
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Journey</span>
              <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter">The Evolution.</h2>
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
                  <span className="text-3xl font-display font-bold text-brand-red mb-2 block">{item.year}</span>
                  <h3 className="text-xl font-bold mb-4">{item.event}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-32 md:mb-48">
            <div className="mb-16 md:mb-24">
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Core Values</span>
              <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter">Our Philosophy.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, i) => (
                <motion.div 
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 rounded-[2.5rem] bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/30 transition-all group"
                >
                  <div className="text-brand-red mb-8 w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-6">{value.title}</h3>
                  <p className="text-white/40 text-lg leading-relaxed">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Global Reach Section */}
          <section className="mb-32 md:mb-48 py-24 px-12 rounded-[3rem] bg-zinc-900/30 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 grid-bg" />
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Global Reach</span>
                <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-8">A Powerhouse Without Borders.</h2>
                <p className="text-lg text-white/60 font-light leading-relaxed mb-8">
                  Our team is distributed across the globe, bringing diverse perspectives and elite talent to every project. We operate in a follow-the-sun model to ensure continuous delivery for our international clients.
                </p>
                <div className="flex flex-wrap gap-8">
                  <div>
                    <span className="text-2xl font-display font-bold block">15+</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Countries Served</span>
                  </div>
                  <div>
                    <span className="text-2xl font-display font-bold block">4</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Timezones Covered</span>
                  </div>
                  <div>
                    <span className="text-2xl font-display font-bold block">100%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Remote First</span>
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
          <section className="mb-32 md:mb-40">
            <div className="mb-16 md:mb-24">
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The Architects</span>
              <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter">Our Team.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {team.map((member, i) => (
                <motion.div 
                  key={member.name}
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
                  <p className="text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{member.role}</p>
                  <p className="text-white/40 text-sm font-light leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Kinetic Typography */}
      <div className="absolute bottom-10 left-0 w-full kinetic-text opacity-5 select-none pointer-events-none">
        <div className="kinetic-track text-[8vh] md:text-[15vh] font-display font-black uppercase tracking-tighter">
          <span>Kapitech Agency • UI/UX Design • IT Development • Strategic Consulting • </span>
          <span>Kapitech Agency • UI/UX Design • IT Development • Strategic Consulting • </span>
        </div>
      </div>
    </motion.div>
  );
};
