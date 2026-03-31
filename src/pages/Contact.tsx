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
      phone: "+62 21 555 0192"
    }
  ];

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 mb-32 md:mb-40">
            <div>
              <form className="space-y-8 md:space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 block">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-2xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 block">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-2xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5" 
                    placeholder="john@example.com" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 block">Message</label>
                  <textarea 
                    className="w-full bg-transparent border-b border-white/10 py-4 md:py-6 text-xl md:text-2xl font-display font-bold focus:border-brand-red outline-none transition-all duration-500 placeholder:text-white/5 min-h-[150px] md:min-h-[200px] resize-none" 
                    placeholder="Tell us about your project..." 
                  />
                </div>
                <MagneticButton>
                  <button className="px-12 py-6 bg-white text-black rounded-full font-bold flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs">
                    Send Message <ArrowUpRight size={20} />
                  </button>
                </MagneticButton>
              </form>
            </div>

            <div className="space-y-16 md:space-y-24">
              <div>
                <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-6 md:mb-8 block">Consultation Briefing</span>
                <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light">
                  Every partnership begins with a high-level strategic briefing. We don't just take orders; we audit your business logic to identify opportunities for structural innovation. This 45-minute session is designed to align our technical capabilities with your long-term growth objectives.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {offices.map((office) => (
                  <div key={office.city} className="space-y-6 md:space-y-8">
                    <div>
                      <span className="text-white/20 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Office</span>
                      <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">{office.city}</h3>
                      <p className="text-white/40 text-sm font-light leading-relaxed">{office.address}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-lg md:text-xl font-display font-bold hover:text-brand-red transition-colors cursor-pointer">
                        <Mail className="text-brand-red" size={18} />
                        <span>{office.email}</span>
                      </div>
                      <div className="flex items-center gap-4 text-lg md:text-xl font-display font-bold hover:text-brand-red transition-colors cursor-pointer">
                        <Phone className="text-brand-red" size={18} />
                        <span>{office.phone}</span>
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
