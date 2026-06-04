import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Mail, Phone, MapPin, Globe, Cpu, Layout, Code2, Palette, Box } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';

import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';

export const Contact = () => {
  const offices = [
    {
      city: "Tangerang",
      country: "Indonesia",
      address: "Gading Serpong, Tangerang, Banten",
      email: "hello@kapitech.id",
      phone: "+62 21 555 0192",
      timezone: "Asia/Jakarta"
    }
  ];

  const services = [
    { id: 'branding', label: 'Branding', icon: <Palette size={16} /> },
    { id: 'design', label: 'Design', icon: <Layout size={16} /> },
    { id: 'development', label: 'Development', icon: <Code2 size={16} /> }
  ];

  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [formState, setFormState] = React.useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormState({ name: '', email: '', message: '' });
    setSelectedServices([]);
  };

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const [localTime, setLocalTime] = React.useState("");

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Jakarta',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const faqs = [
    { q: "Project Timeline.", a: "Typical projects range from 4 to 12 weeks depending on the scope and complexity of the work." },
    { q: "Ongoing Maintenance.", a: "We offer continuous support and maintenance packages to ensure your digital product remains secure and up-to-date." },
    { q: "Our Approach.", a: "First, we discover your goals. Then, we craft a strategy, design the experience, and develop a reliable solution." },
    { q: "Team Collaboration.", a: "We work closely with your internal teams to ensure a seamless integration of our services into your business." }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-black overflow-hidden"
    >
      {/* Atmospheric Background */}
      <AtmosphericBackground 
        imageUrl="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2074"
        opacity={0.05}
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
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Contact Us</span>
              <h1 className="text-[clamp(2.25rem,8vw,6.5rem)] font-display font-bold leading-[0.85] tracking-tighter mb-12 uppercase">
                Let's build something<br />great together.
              </h1>
              <p className="text-sm md:text-base text-white/40 max-w-2xl font-light leading-relaxed tracking-tight">
                We help companies to build and scale digital products. Our team of experts provides strategic design and development services to drive business results.
              </p>
            </motion.div>

            {/* Connection Node Visual */}
            <div className="absolute top-0 right-12 w-64 h-64 hidden lg:block pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-brand-red/20">
                <motion.circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                {[...Array(6)].map((_, i) => (
                  <motion.circle
                    key={i}
                    cx={100 + 60 * Math.cos((i * 60 * Math.PI) / 180)}
                    cy={100 + 60 * Math.sin((i * 60 * Math.PI) / 180)}
                    r="3"
                    className="fill-brand-red/40"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  />
                ))}
              </svg>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 px-6 md:px-12 py-24 md:py-32 border-t border-white/5">
            <div className="lg:col-span-7">
              <div className="mb-16 flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-14 h-14 rounded-full border-2 border-black overflow-hidden bg-zinc-800 shadow-xl">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Team Member" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-white font-bold text-sm uppercase tracking-tight">Available for new projects</p>
                  </div>
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest leading-relaxed">Response Time: <span className="text-brand-red font-bold">&lt; 24 Hours</span></p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12 md:p-24 rounded-[2.5rem] bg-zinc-900/30 border border-brand-red/20 backdrop-blur-xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 grid-bg opacity-[0.03]" />
                    <div className="w-24 h-24 rounded-3xl bg-brand-red/10 flex items-center justify-center text-brand-red mb-10 relative z-10">
                      <ArrowUpRight size={48} className="rotate-45" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 uppercase tracking-tighter relative z-10">Message Sent.</h2>
                    <p className="text-sm md:text-base text-white/40 max-w-md mb-12 leading-relaxed relative z-10 font-light">
                      Thank you for reaching out. We will review your inquiry and get back to you within 24 hours.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="px-10 py-5 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-[10px] font-mono font-bold uppercase tracking-widest relative z-10"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-16 md:space-y-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-6 group">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 group-focus-within:text-brand-red transition-colors block">Full Name</label>
                        </div>
                        <input 
                          required
                          type="text" 
                          value={formState.name}
                          onChange={(e) => setFormState({...formState, name: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-3xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5 uppercase tracking-tighter" 
                          placeholder="YOUR NAME" 
                        />
                      </div>
                      <div className="space-y-6 group">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 group-focus-within:text-brand-red transition-colors block">Email Address</label>
                        </div>
                        <input 
                          required
                          type="email" 
                          value={formState.email}
                          onChange={(e) => setFormState({...formState, email: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-3xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5 uppercase tracking-tighter" 
                          placeholder="EMAIL@DOMAIN.COM" 
                        />
                      </div>
                    </div>
  
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 block">What are you looking for?</label>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {services.map((service) => (
                          <button
                            type="button"
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className={`px-8 py-4 rounded-2xl border text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-500 flex items-center gap-4 ${ 
                              selectedServices.includes(service.id)
                                ? 'bg-brand-red border-brand-red text-white shadow-xl shadow-brand-red/20'
                                : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white bg-white/5'
                            }`}
                          >
                            <span className="opacity-60">{service.icon}</span>
                            {service.label}
                          </button>
                        ))}
                      </div>
                    </div>
  
                    <div className="space-y-6 group">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 group-focus-within:text-brand-red transition-colors block">Project Details</label>
                      </div>
                      <textarea 
                        required
                        value={formState.message}
                        onChange={(e) => setFormState({...formState, message: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-3xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5 min-h-[150px] md:min-h-[250px] resize-none uppercase tracking-tighter" 
                        placeholder="TELL US ABOUT YOUR PROJECT..." 
                      />
                    </div>
  
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 pt-12">
                      <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest max-w-[300px] leading-relaxed">
                        By submitting this form, you agree to our privacy policy and terms of service.
                      </p>
                      <MagneticButton>
                        <button 
                          disabled={isSubmitting}
                          type="submit"
                          className="px-8 md:px-12 py-5 md:py-6 w-full md:w-auto bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs group font-mono disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-brand-red/20"
                        >
                          {isSubmitting ? 'Sending...' : 'Send Message'} 
                          {!isSubmitting && <ArrowUpRight size={24} className="group-hover:rotate-45 transition-transform" />}
                        </button>
                      </MagneticButton>
                    </div>
                  </form>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-5 space-y-12">
              <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 grid-bg opacity-[0.02]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 blur-[100px] -mr-32 -mt-32" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-px bg-brand-red/40" />
                  <span className="text-brand-red font-mono font-bold tracking-[0.4em] uppercase text-[10px]">How we work</span>
                </div>
                <p className="text-sm md:text-base text-white/60 leading-relaxed font-light mb-12">
                  We start by understanding your goals. Then, we craft a strategy, design the experience, and develop the solution tailored to your needs.
                </p>
                <div className="flex items-center gap-4 text-white/40">
                  <div className="w-8 h-px bg-white/20" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Discovery Phase</span>
                </div>
              </div>

              <div className="space-y-8">
                {offices.map((office) => (
                  <div key={office.city} className="p-8 md:p-12 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden bg-zinc-900/20 backdrop-blur-sm">
                    <div className="absolute inset-0 grid-bg opacity-[0.01]" />
                    <div className="absolute bottom-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Globe className="text-brand-red/20" size={100} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex flex-col gap-6 items-start mb-12">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-4 h-px bg-brand-red/40" />
                            <span className="text-brand-red font-mono font-bold tracking-[0.4em] uppercase text-[10px]">Headquarters</span>
                          </div>
                          <h3 className="text-3xl md:text-4xl font-display font-bold tracking-tighter mb-2 uppercase">{office.city}</h3>
                          <p className="text-white/60 text-[10px] font-mono uppercase tracking-widest leading-relaxed max-w-[200px]">{office.address}</p>
                        </div>
                        <div className="text-left w-full border-t border-white/10 pt-6 mt-2">
                          <span className="text-white/40 font-mono font-bold tracking-[0.4em] uppercase text-[10px] mb-2 block">Local Time</span>
                          <span className="text-xl font-display font-bold text-brand-red font-mono">{localTime}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <a 
                          href={`mailto:${office.email}`} 
                          className="group/link flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-red/30 transition-all duration-500"
                        >
                          <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover/link:bg-brand-red group-hover/link:text-white transition-all duration-500">
                            <Mail size={16} />
                          </div>
                          <div className="overflow-hidden break-words">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-1">Email Us</span>
                            <span className="text-sm font-display font-bold group-hover/link:text-brand-red transition-colors block uppercase tracking-tighter">{office.email}</span>
                          </div>
                          <ArrowUpRight size={14} className="ml-auto text-white/40 group-hover/link:text-brand-red group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-all flex-shrink-0" />
                        </a>

                        <a 
                          href={`tel:${office.phone.replace(/\s/g, '')}`} 
                          className="group/link flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-red/30 transition-all duration-500"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover/link:bg-blue-500 group-hover/link:text-white transition-all duration-500">
                            <Phone size={16} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-1">Call Us</span>
                            <span className="text-sm font-display font-bold group-hover/link:text-brand-red transition-colors block uppercase tracking-tighter">{office.phone}</span>
                          </div>
                          <ArrowUpRight size={14} className="ml-auto text-white/40 group-hover/link:text-brand-red group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-all flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="px-6 md:px-12 py-20 md:py-40 overflow-hidden">
            <div className="mb-16 md:mb-24">
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">FAQ</span>
              <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-display font-bold tracking-tighter uppercase">Questions.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 rounded-3xl bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/30 transition-all group"
                >
                  <h3 className="text-xl font-display font-bold mb-6 group-hover:text-brand-red transition-colors uppercase tracking-tighter">{item.q}</h3>
                  <p className="text-sm text-white/40 leading-relaxed font-light">{item.a}</p>
                </motion.div>
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
