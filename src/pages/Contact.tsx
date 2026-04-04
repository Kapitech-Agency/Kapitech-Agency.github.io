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
    { id: 'it', label: 'IT Development', icon: <Code2 size={16} /> },
    { id: 'uiux', label: 'UI/UX Design', icon: <Layout size={16} /> },
    { id: 'graphic', label: 'Graphic Design', icon: <Palette size={16} /> }
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
    { q: "How long does a project take?", a: "Most projects take between 4 to 12 weeks, depending on the scope and complexity." },
    { q: "Do you provide maintenance?", a: "Yes, we offer ongoing support and maintenance to ensure your website or app continues to run smoothly." },
    { q: "What is your design process?", a: "We start with research and wireframing, followed by UI design and prototyping, ensuring your feedback is incorporated at every stage." },
    { q: "Can you work with our existing team?", a: "Yes, we can collaborate with your internal team to help deliver specific parts of a project or provide technical expertise." }
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
        accentColor="red"
        statusText="COMM_LINK_ESTABLISHED"
        scanMode="SIGNAL_RECEPTION"
        sysRef="KPTCH_CONTACT_NODE"
        opacity={0.05}
      />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="px-6 md:px-12 py-20 md:py-40 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Get in Touch</span>
              <h1 className="text-[clamp(2.5rem,8vw,8rem)] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient">
                Contact Us.
              </h1>
              <p className="text-[clamp(1rem,2vw,1.5rem)] text-white/40 max-w-3xl font-light leading-tight tracking-tight">
                Have a project in mind? We're here to help you build your digital presence. Send us a message and we'll get back to you as soon as possible.
              </p>
            </motion.div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 px-6 md:px-12 py-20 md:py-40 overflow-hidden">
            <div className="lg:col-span-7">
              <div className="mb-12 flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-zinc-800">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Team Member" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Our team is online.</p>
                  <p className="text-white/40 text-xs font-mono uppercase tracking-widest">Typical response: <span className="text-brand-red">Under 2 hours</span></p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12 rounded-[3rem] bg-zinc-900/30 border border-brand-red/20 backdrop-blur-xl"
                  >
                    <div className="w-20 h-20 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red mb-8">
                      <ArrowUpRight size={40} className="rotate-45" />
                    </div>
                    <h2 className="text-4xl font-display font-bold mb-4">Message Sent.</h2>
                    <p className="text-white/40 max-w-md mb-8">
                      Thank you for reaching out. Our team will review your inquiry and get back to you within 24-48 hours.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all text-[10px] font-mono font-bold uppercase tracking-widest"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-12 md:space-y-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4 group">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 group-focus-within:text-brand-red transition-colors block">Your Name</label>
                        <input 
                          required
                          type="text" 
                          value={formState.name}
                          onChange={(e) => setFormState({...formState, name: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-2xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5" 
                          placeholder="Name or Company" 
                        />
                      </div>
                      <div className="space-y-4 group">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 group-focus-within:text-brand-red transition-colors block">Email Address</label>
                        <input 
                          required
                          type="email" 
                          value={formState.email}
                          onChange={(e) => setFormState({...formState, email: e.target.value})}
                          className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-2xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5" 
                          placeholder="email@example.com" 
                        />
                      </div>
                    </div>
  
                    <div className="space-y-8">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 block">Select Services</label>
                      <div className="flex flex-wrap gap-3">
                        {services.map((service) => (
                          <button
                            type="button"
                            key={service.id}
                            onClick={() => toggleService(service.id)}
                            className={`px-6 py-3 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${ 
                              selectedServices.includes(service.id)
                                ? 'bg-brand-red border-brand-red text-white'
                                : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                            }`}
                          >
                            {service.icon}
                            {service.label}
                          </button>
                        ))}
                      </div>
                    </div>
  
                    <div className="space-y-4 group">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20 group-focus-within:text-brand-red transition-colors block">Project Details</label>
                      <textarea 
                        required
                        value={formState.message}
                        onChange={(e) => setFormState({...formState, message: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-2xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5 min-h-[150px] md:min-h-[200px] resize-none" 
                        placeholder="Tell us about your project..." 
                      />
                    </div>
  
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-8">
                      <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest max-w-[200px] leading-relaxed">
                        Submission constitutes agreement to data processing protocols and privacy standards.
                      </p>
                      <MagneticButton>
                        <button 
                          disabled={isSubmitting}
                          type="submit"
                          className="px-12 py-6 bg-white text-black rounded-full font-bold flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs group font-mono disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,59,59,0.3)]"
                        >
                          {isSubmitting ? 'Sending...' : 'Send Message'} 
                          {!isSubmitting && <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform" />}
                        </button>
                      </MagneticButton>
                    </div>
                  </form>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-5 space-y-16 md:space-y-24">
              <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 blur-[100px] -mr-32 -mt-32" />
                <span className="text-brand-red font-mono font-bold tracking-[0.4em] uppercase text-[10px] mb-8 block">Our Process</span>
                <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light mb-12">
                  We start every project with a discussion to understand your goals. We analyze your needs and provide a clear plan for development and design.
                </p>
                <div className="flex items-center gap-4 text-white/20">
                  <div className="w-12 h-px bg-white/10" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Initial Consultation</span>
                </div>
              </div>

              <div className="space-y-12">
                {offices.map((office) => (
                  <div key={office.city} className="p-8 md:p-12 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Globe className="text-brand-red/20" size={120} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-12">
                        <div>
                          <span className="text-brand-red font-mono font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">Our Office</span>
                          <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-2">{office.city}</h3>
                          <p className="text-white/40 text-sm font-light leading-relaxed max-w-[200px]">{office.address}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-white/20 font-mono font-bold tracking-[0.4em] uppercase text-[10px] mb-2 block">Local Time</span>
                          <span className="text-2xl font-display font-bold text-brand-red font-mono">{localTime}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <a 
                          href={`mailto:${office.email}`} 
                          className="group/link flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-red/30 transition-all duration-500"
                        >
                          <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover/link:bg-brand-red group-hover/link:text-white transition-all duration-500">
                            <Mail size={20} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/20 block mb-1">Email Address</span>
                            <span className="text-lg font-display font-bold group-hover/link:text-brand-red transition-colors block">{office.email}</span>
                          </div>
                          <ArrowUpRight size={16} className="ml-auto text-white/20 group-hover/link:text-brand-red group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-all" />
                        </a>

                        <a 
                          href={`tel:${office.phone.replace(/\s/g, '')}`} 
                          className="group/link flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-red/30 transition-all duration-500"
                        >
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover/link:bg-blue-500 group-hover/link:text-white transition-all duration-500">
                            <Phone size={20} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/20 block mb-1">Phone Number</span>
                            <span className="text-lg font-display font-bold group-hover/link:text-brand-red transition-colors block">{office.phone}</span>
                          </div>
                          <ArrowUpRight size={16} className="ml-auto text-white/20 group-hover/link:text-brand-red group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-all" />
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
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Questions</span>
              <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-display font-bold tracking-tighter">Common Questions.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 rounded-[2.5rem] bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/30 transition-all group"
                >
                  <h3 className="text-2xl font-display font-bold mb-6 group-hover:text-brand-red transition-colors">{item.q}</h3>
                  <p className="text-white/40 text-base leading-relaxed font-light">{item.a}</p>
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
