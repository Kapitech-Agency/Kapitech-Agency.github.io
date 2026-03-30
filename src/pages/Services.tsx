import React from 'react';
import { motion } from 'motion/react';
import { Layout, Code2, Palette, Box, CheckCircle2, Cloud, Cpu, ShieldCheck, ShoppingBag, FileText, TrendingUp, Search, Globe } from 'lucide-react';

export const Services = () => {
  const services = [
    {
      icon: <Cpu size={32} />,
      title: "IT Architecture",
      desc: "We engineer robust, cloud-native infrastructures that prioritize clean code and global scalability. Our systems are built to handle enterprise-level traffic with sub-second latency, ensuring your digital foundation is future-proof and resilient."
    },
    {
      icon: <Box size={32} />,
      title: "High-Fidelity 3D Design",
      desc: "We bring brands to life through sophisticated 3D renders and motion graphics. By applying UI/UX psychology to immersive environments, we create frictionless user journeys that capture attention and drive deep engagement."
    },
    {
      icon: <Globe size={32} />,
      title: "Real Estate Digital Ecosystems",
      desc: "Specialized digital solutions for the property sector. From high-conversion housing landing pages to immersive virtual tours, we architect ecosystems that streamline the lead-to-close journey for ambitious developers."
    },
    {
      icon: <FileText size={32} />,
      title: "Strategic SOP Consultancy",
      desc: "We optimize your business operations through digital SOPs. By documenting and automating your internal workflows, we ensure your team operates with the same precision and efficiency as our code."
    },
    {
      icon: <Layout size={32} />,
      title: "Web Development",
      desc: "We engineer high-performance, full-stack applications tailored for enterprise scalability. By utilizing modern frameworks, we ensure your digital infrastructure is secure, fast, and future-proof."
    },
    {
      icon: <Code2 size={32} />,
      title: "UI/UX Design",
      desc: "Our design process is rooted in user psychology and high-fidelity aesthetic standards. We create frictionless interfaces that guide users through complex tasks with intuitive ease."
    }
  ];

  const process = [
    {
      title: "Discovery",
      desc: "We audit your existing ecosystem and business logic to architect a roadmap for success."
    },
    {
      title: "Design",
      desc: "We craft high-fidelity visual narratives and frictionless user journeys that command attention."
    },
    {
      title: "Development",
      desc: "We engineer robust, scalable codebases using elite tech stacks for peak performance."
    },
    {
      title: "Deployment",
      desc: "We orchestrate a seamless launch followed by continuous optimization to ensure sustained growth."
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
        <header className="mb-24">
          <span className="text-brand-red font-bold tracking-widest uppercase text-sm mb-4 block">Elite Digital Solutions</span>
          <h1 className="text-6xl md:text-[8vw] font-display font-bold leading-[0.9] tracking-tighter mb-8">
            Engineering the Extraordinary.
          </h1>
          <p className="text-white/50 text-xl md:text-2xl max-w-3xl font-light leading-relaxed">
            Our development ecosystem is built on the pillars of speed, security, and scalability. We utilize Next.js, Three.js, and AWS to deliver sub-second load times globally.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-40">
          {services.map((service, i) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-12 rounded-3xl bg-white/5 border border-white/5 hover:border-brand-red/30 transition-all group"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="text-brand-red mb-8 w-fit group-hover:scale-110 transition-transform"
              >
                {service.icon}
              </motion.div>
              <h3 className="text-3xl font-display font-bold mb-6">{service.title}</h3>
              <p className="text-white/40 text-lg leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>

        <section className="mb-40">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-16 text-center">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {process.map((step, i) => (
              <div key={step.title} className="relative">
                <span className="text-brand-red font-display font-bold text-6xl opacity-20 absolute -top-10 -left-4">0{i+1}</span>
                <h3 className="text-2xl font-bold mb-4 relative z-10">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center py-24 border-t border-white/5">
          <div>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Methodology</h2>
            <p className="text-white/60 text-xl leading-relaxed mb-12">
              Our development ecosystem is built on the pillars of speed, security, and scalability. We orchestrate headless CMS architectures and edge computing to deliver sub-second load times globally. Our methodology is strictly Agile, ensuring rapid deployment without compromising on the high-fidelity standards that define our work.
            </p>
            <div className="space-y-6">
              {[
                "Strategic Approach to Digital Transformation",
                "High-Fidelity Design & Development",
                "Scalable & Secure Infrastructure",
                "Dedicated Support & Maintenance"
              ].map((item) => (
                <div key={item} className="flex items-center gap-4 text-xl text-white/70">
                  <CheckCircle2 className="text-brand-red" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="aspect-square rounded-3xl overflow-hidden grayscale opacity-50">
            <img src="https://picsum.photos/seed/tech/800/800" alt="Tech" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
