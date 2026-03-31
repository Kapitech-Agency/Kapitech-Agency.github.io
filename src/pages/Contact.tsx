import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Mail, Phone, MapPin, Globe, Cpu, Layout, Code2, Palette, Box } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';

export const Contact = () => {
  const offices = [
    {
      city: "Tangerang",
      country: "Indonesia",
      address: "Level 24, Treasury Tower, District 8, SCBD",
      email: "hello@kapitech.co.id",
      phone: "+62 21 555 0192",
      timezone: "Asia/Jakarta"
    }
  ];

  const services = [
    { id: 'it', label: 'IT Development', icon: <Code2 size={16} /> },
    { id: 'uiux', label: 'UI/UX Design', icon: <Layout size={16} /> },
    { id: 'graphic', label: 'Graphic Design', icon: <Palette size={16} /> },
    { id: 'branding', label: 'Branding', icon: <Box size={16} /> },
    { id: 'consulting', label: 'Tech Consulting', icon: <Cpu size={16} /> }
  ];

  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [formState, setFormState] = React.useState({ name: '', email: '', message: '' });

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
    { q: "What is your typical project timeline?", a: "Most enterprise projects range from 8-16 weeks, depending on complexity and integration requirements." },
    { q: "Do you offer post-launch support?", a: "Yes, we provide 24/7 technical support and ongoing optimization packages to ensure your digital assets evolve." },
    { q: "How do you handle data security?", a: "We implement AES-256 encryption, regular penetration testing, and follow ISO 27001 standards for all IT infrastructure." },
    { q: "Can you integrate with existing legacy systems?", a: "Absolutely. Our engineering team specializes in building robust middleware to bridge legacy data with modern UI." }
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
                Orchestrate Your<br />Next Breakthrough.
              </h1>
              <p className="text-xl md:text-3xl text-white/40 max-w-3xl font-light leading-tight tracking-tight">
                We collaborate with visionary brands ready to transcend the ordinary. If you are seeking to engineer a high-performance digital presence that commands authority, let’s talk.
              </p>
            </motion.div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 mb-32 md:mb-40">
            <div className="lg:col-span-7">
              <form className="space-y-12 md:space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 group-focus-within:text-brand-red transition-colors block">Full Name</label>
                    <input 
                      type="text" 
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                      className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-2xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 group-focus-within:text-brand-red transition-colors block">Email Address</label>
                    <input 
                      type="email" 
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                      className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-2xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5" 
                      placeholder="john@example.com" 
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 block">What can we help you with?</label>
                  <div className="flex flex-wrap gap-3">
                    {services.map((service) => (
                      <button
                        type="button"
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`px-6 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${ 
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
                  <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 group-focus-within:text-brand-red transition-colors block">Project Brief</label>
                  <textarea 
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                    className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-2xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5 min-h-[150px] md:min-h-[200px] resize-none" 
                    placeholder="Tell us about your vision..." 
                  />
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-8">
                  <p className="text-white/20 text-[10px] uppercase tracking-widest max-w-[200px] leading-relaxed">
                    By submitting this form, you agree to our privacy policy and data processing terms.
                  </p>
                  <MagneticButton>
                    <button className="px-12 py-6 bg-white text-black rounded-full font-bold flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs group">
                      Send Inquiry <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform" />
                    </button>
                  </MagneticButton>
                </div>
              </form>
            </div>

            <div className="lg:col-span-5 space-y-16 md:space-y-24">
              <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 blur-[100px] -mr-32 -mt-32" />
                <span className="text-brand-red font-bold tracking-[0.4em] uppercase text-[10px] mb-8 block">Strategic Partnership</span>
                <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light mb-12">
                  Every collaboration begins with a deep-dive strategy session. We audit your current digital footprint to identify structural opportunities for growth and innovation.
                </p>
                <div className="flex items-center gap-4 text-white/20">
                  <div className="w-12 h-px bg-white/10" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">45-Min Discovery Call</span>
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
                          <span className="text-brand-red font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">Headquarters</span>
                          <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-2">{office.city}</h3>
                          <p className="text-white/40 text-sm font-light leading-relaxed max-w-[200px]">{office.address}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-white/20 font-bold tracking-[0.4em] uppercase text-[10px] mb-2 block">Local Time</span>
                          <span className="text-2xl font-display font-bold text-brand-red">{localTime}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 block">Email</span>
                          <a href={`mailto:${office.email}`} className="text-lg font-display font-bold hover:text-brand-red transition-colors block">{office.email}</a>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 block">Phone</span>
                          <a href={`tel:${office.phone}`} className="text-lg font-display font-bold hover:text-brand-red transition-colors block">{office.phone}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mb-32 md:mb-40">
            <div className="mb-16 md:mb-24">
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Frequently Asked Questions</span>
              <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter">Common Queries.</h2>
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
                  <p className="text-white/40 text-lg leading-relaxed font-light">{item.a}</p>
                </motion.div>
              ))}
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
