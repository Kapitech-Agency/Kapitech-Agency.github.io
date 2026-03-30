import React from 'react';
import { motion } from 'motion/react';

export const About = () => {
  const values = [
    {
      title: "Precision",
      desc: "Absolute accuracy in every deployment. We treat every line of code as a structural blueprint."
    },
    {
      title: "Scalability",
      desc: "Built to grow with your ambitions. We architect for the version of your company that exists five years from now."
    },
    {
      title: "Aesthetics",
      desc: "High-fidelity design that commands authority. Brilliant design is hollow without technical integrity."
    },
    {
      title: "Efficiency",
      desc: "Streamlined SOPs for rapid, reliable delivery. We operate as an orchestrated collective of experts."
    }
  ];

  const team = [
    {
      name: "Aditya K.",
      role: "Founder & Tech Lead",
      bio: "A visionary strategist with a decade of experience in digital transformation and enterprise architecture, spearheading high-performance solutions for global market leaders.",
      image: "https://picsum.photos/seed/aditya/400/500"
    },
    {
      name: "Siti R.",
      role: "Creative Director",
      bio: "Award-winning designer dedicated to crafting visual narratives that resonate on a global scale, ensuring brand identity is consistent across every digital touchpoint.",
      image: "https://picsum.photos/seed/siti/400/500"
    },
    {
      name: "Budi H.",
      role: "Lead Developer",
      bio: "Pioneer in clean code and high-performance architecture, ensuring robust and scalable digital solutions that transcend standard technical expectations.",
      image: "https://picsum.photos/seed/budi/400/500"
    },
    {
      name: "Maya L.",
      role: "UI/UX Specialist",
      bio: "Focused on the intersection of psychology and design to create frictionless user journeys that guide users through complex tasks with intuitive ease.",
      image: "https://picsum.photos/seed/maya/400/500"
    },
    {
      name: "Reza W.",
      role: "3D & Motion Designer",
      bio: "Specializes in high-fidelity assets that bring brands to life with dynamic visual storytelling and sophisticated motion graphics that capture immediate attention.",
      image: "https://picsum.photos/seed/reza/400/500"
    },
    {
      name: "Dina S.",
      role: "Project Manager",
      bio: "Expert in SOPs and agile methodologies, ensuring seamless project delivery and absolute client satisfaction through radical transparency and precision.",
      image: "https://picsum.photos/seed/dina/400/500"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-20 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-32">
          <span className="text-brand-red font-bold tracking-widest uppercase text-sm mb-4 block">Elite Identity</span>
          <h1 className="text-6xl md:text-[8vw] font-display font-bold leading-[0.9] tracking-tighter mb-12">
            The Intersection of Art & Logic.
          </h1>
          <p className="text-xl md:text-3xl text-white/40 max-w-5xl font-light leading-relaxed">
            At Kapitech, we believe that aesthetic brilliance is hollow without technical integrity. We orchestrate digital ecosystems where immersive design and high-performance engineering converge.
          </p>
        </header>

        {/* Philosophy */}
        <section className="mb-40">
          <h2 className="text-white/30 uppercase tracking-widest text-xs font-bold mb-12">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div 
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/5"
              >
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SOP Progress Bar */}
        <section className="mb-40">
          <h2 className="text-white/30 uppercase tracking-widest text-xs font-bold mb-12">Our Methodology (SOP)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 hidden md:block -translate-y-1/2" />
            {[
              { step: "01", title: "Discovery", desc: "Audit & Roadmap" },
              { step: "02", title: "Design", desc: "High-Fidelity UI/UX" },
              { step: "03", title: "Dev", desc: "Robust Engineering" },
              { step: "04", title: "Scale", desc: "Growth & Optimization" }
            ].map((item, i) => (
              <motion.div 
                key={item.step}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 p-8 rounded-2xl bg-zinc-900 border border-white/5 group hover:border-brand-red transition-all"
              >
                <span className="text-brand-red font-display font-bold text-4xl mb-4 block">{item.step}</span>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                <div className="mt-6 h-1 w-0 bg-brand-red group-hover:w-full transition-all duration-700" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-40">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">The Human Element</h2>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Role-Based Expertise</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div 
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 mb-6">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                <p className="text-brand-red text-xs font-bold uppercase tracking-widest mb-4">{member.role}</p>
                <p className="text-white/40 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Vision & Manifesto */}
        <section className="mb-40 grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h2 className="text-brand-red font-bold tracking-widest uppercase text-xs mb-8">Founder's Vision</h2>
            <p className="text-2xl font-light leading-relaxed text-white/80">
              Kapitech was born from a singular obsession: to bridge the gap between raw technical power and elite aesthetic design. Starting in Tangerang in 2021, we set out to build something different—a multi-sector agency that treats every line of code as a structural blueprint and every pixel as a brand legacy. Our journey from a local hub to a global service provider is fueled by a commitment to precision, scalability, and the belief that digital products should not just function, but dominate their respective markets.
            </p>
          </div>
          <div className="flex flex-col gap-12">
            <div>
              <h2 className="text-brand-red font-bold tracking-widest uppercase text-xs mb-8">Anti-Freelance Manifesto</h2>
              <p className="text-lg text-white/40 leading-relaxed">
                While freelancers offer tasks, Kapitech offers systems. We are an orchestrated collective of architects, designers, and consultants. Our agency-level infrastructure provides the security, redundancy, and strategic depth that solo operators simply cannot match. When you partner with us, you aren't just hiring a developer; you are integrating a high-performance digital department into your business.
              </p>
            </div>
            <div>
              <h2 className="text-brand-red font-bold tracking-widest uppercase text-xs mb-8">Tech-Stack Transparency</h2>
              <p className="text-lg text-white/40 leading-relaxed">
                We don't just use tools; we master them. Our core stack—Next.js for performance, AWS for global scalability, and Three.js for immersive 3D experiences—is selected for its ability to deliver sub-second load times and enterprise-grade reliability. We architect for the version of your company that exists five years from now.
              </p>
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="mb-40 py-20 border-y border-white/5">
          <h2 className="text-center text-white/30 uppercase tracking-widest text-xs font-bold mb-16">Trusted By Leading Brands</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
            {[1, 2, 3, 4, 5].map((i) => (
              <img 
                key={i}
                src={`https://picsum.photos/seed/logo${i}/200/80`} 
                alt={`Client ${i}`} 
                className="h-8 md:h-12 object-contain"
              />
            ))}
          </div>
        </section>

        <section className="py-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Projects Completed", value: "50+" },
              { label: "Worldwide Clients", value: "10+" },
              { label: "Years Experience", value: "05+" },
              { label: "Team Members", value: "15+" }
            ].map((stat) => (
              <div key={stat.label}>
                <span className="block text-5xl md:text-7xl font-display font-bold mb-2">{stat.value}</span>
                <span className="text-white/30 uppercase tracking-widest text-xs font-bold">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};
