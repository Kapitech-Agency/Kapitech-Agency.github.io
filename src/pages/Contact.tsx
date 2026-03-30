import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Mail, Phone, MapPin } from 'lucide-react';

export const Contact = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-20 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-24">
          <span className="text-brand-red font-bold tracking-widest uppercase text-sm mb-4 block">Let's Talk</span>
          <h1 className="text-6xl md:text-[8vw] font-display font-bold leading-[0.9] tracking-tighter mb-8">
            Orchestrate Your Next Breakthrough.
          </h1>
          <p className="text-white/50 text-xl md:text-2xl max-w-3xl font-light leading-relaxed">
            We collaborate with visionary brands ready to transcend the ordinary. If you are seeking to engineer a high-performance digital presence that commands authority, let’s talk.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div>
            <form className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Full Name</label>
                <input type="text" className="w-full bg-transparent border-b border-white/20 py-4 focus:border-brand-red outline-none transition-colors" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Email Address</label>
                <input type="email" className="w-full bg-transparent border-b border-white/20 py-4 focus:border-brand-red outline-none transition-colors" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Message</label>
                <textarea className="w-full bg-transparent border-b border-white/20 py-4 focus:border-brand-red outline-none transition-colors min-h-[150px]" placeholder="Tell us about your project..." />
              </div>
              <button className="group px-12 py-5 bg-brand-red text-white rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all duration-300">
                Send Message
                <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>

          <div className="space-y-16">
            <div>
              <h3 className="text-brand-red uppercase tracking-widest text-xs font-bold mb-8">Consultation Briefing</h3>
              <p className="text-xl text-white/60 leading-relaxed font-light">
                Every partnership begins with a high-level strategic briefing. We don't just take orders; we audit your business logic to identify opportunities for structural innovation. This 45-minute session is designed to align our technical capabilities with your long-term growth objectives.
              </p>
            </div>

            <div>
              <h3 className="text-brand-red uppercase tracking-widest text-xs font-bold mb-8">HQ & Global Service</h3>
              <p className="text-xl text-white/60 leading-relaxed font-light">
                While our operational HQ is rooted in Tangerang, Indonesia, our digital infrastructure is global. We provide high-fidelity services to clients across Europe, North America, and Southeast Asia, operating with a 'follow-the-sun' model to ensure continuous deployment and support.
              </p>
            </div>

            <div>
              <h3 className="text-white/30 uppercase tracking-widest text-xs font-bold mb-8">Contact Details</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-2xl font-display font-bold">
                  <Mail className="text-brand-red" />
                  <span>hello@kapitech.co.id</span>
                </div>
                <div className="flex items-center gap-4 text-2xl font-display font-bold">
                  <Phone className="text-brand-red" />
                  <span>+62 21 555 0192</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white/30 uppercase tracking-widest text-xs font-bold mb-8">Office</h3>
              <div className="flex items-start gap-4 text-2xl font-display font-bold">
                <MapPin className="text-brand-red shrink-0 mt-1" />
                <span>Jakarta, Indonesia <br /> <span className="text-white/40 text-lg font-light">Level 24, Treasury Tower, District 8, SCBD</span></span>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <section className="mt-40 mb-20">
          <h2 className="text-white/30 uppercase tracking-widest text-[10px] font-bold mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { q: "What is your typical project timeline?", a: "Most enterprise projects range from 8-16 weeks, depending on complexity and integration requirements." },
              { q: "Do you offer post-launch support?", a: "Yes, we provide 24/7 technical support and ongoing optimization packages to ensure your digital assets evolve." },
              { q: "How do you handle data security?", a: "We implement AES-256 encryption, regular penetration testing, and follow ISO 27001 standards for all IT infrastructure." },
              { q: "Can you integrate with existing legacy systems?", a: "Absolutely. Our engineering team specializes in building robust middleware to bridge legacy data with modern UI." }
            ].map((item, i) => (
              <div key={i} className="p-10 rounded-[2rem] bg-zinc-900 border border-white/5 hover:border-brand-red transition-all group">
                <h3 className="text-xl font-bold mb-4 group-hover:text-brand-red transition-colors">{item.q}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};
