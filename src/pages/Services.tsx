import React from 'react';
import { motion } from 'motion/react';
import { Layout, Code2, Palette, Box, CheckCircle2, Cpu, Globe, ArrowUpRight } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';

export const Services = () => {
  const services = [
    {
      icon: <Code2 size={32} />,
      title: "IT Development",
      desc: "We engineer robust, cloud-native infrastructures using modern stacks like React, Next.js, and Node.js. Our systems are built to handle enterprise-level traffic with sub-second latency, ensuring your digital foundation is future-proof. From complex Fintech dashboards to high-scale E-commerce platforms, we prioritize clean code and global scalability.",
      features: [
        "Custom Web Applications (React, Next.js, TypeScript)",
        "Backend Engineering (Node.js, Go, PostgreSQL)",
        "Mobile App Development (iOS, Android, React Native)",
        "Cloud Infrastructure (AWS, Docker, Kubernetes)",
        "Secure API Integration & Microservices",
        "Performance Auditing & Optimization",
        "DevOps & CI/CD Pipeline Automation",
        "Headless CMS & Serverless Functions"
      ]
    },
    {
      icon: <Palette size={32} />,
      title: "UI/UX Design",
      desc: "Our design process is rooted in user psychology and high-fidelity aesthetic standards using tools like Figma and Framer. We create frictionless interfaces for complex web dashboards and mobile applications, ensuring every interaction is meaningful. We focus on 'progressive disclosure' to ensure your product remains intuitive as it scales.",
      features: [
        "User Journey Mapping & Persona Research",
        "High-Fidelity Prototyping (Figma, Protopie)",
        "Design Systems & Component Libraries",
        "Usability Testing & Conversion Optimization",
        "Accessibility (WCAG) Compliance Audits",
        "Interactive Web & Mobile Interface Design",
        "Design-to-Code Handoff Optimization",
        "Micro-interaction & Motion Design Strategy"
      ]
    },
    {
      icon: <Box size={32} />,
      title: "Graphic Design",
      desc: "We bring brands to life through sophisticated visual identities and motion graphics using the Adobe Creative Suite and Cinema 4D. By applying strategic design principles, we create bold visual narratives—from 3D product visualizations to comprehensive brand identity systems—that capture attention and command authority.",
      features: [
        "Brand Identity & Visual Strategy",
        "Motion Graphics & Dynamic Video (After Effects)",
        "3D Visualization & Product Renders (Cinema 4D)",
        "Marketing Collateral & Digital Assets",
        "Typography Design & Custom Iconography",
        "Print & Environmental Design",
        "Social Media Visual Ecosystems",
        "Packaging & Physical Product Design"
      ]
    }
  ];

  const process = [
    {
      step: "01",
      title: "Ideation",
      desc: "Conceptualizing unique digital experiences tailored to your brand's core vision."
    },
    {
      step: "02",
      title: "Design",
      desc: "Crafting high-fidelity visual narratives and frictionless user journeys."
    },
    {
      step: "03",
      title: "Development",
      desc: "Engineering robust, scalable codebases using elite tech stacks for peak performance."
    },
    {
      step: "04",
      title: "Launch",
      desc: "Orchestrating a seamless launch followed by continuous creative optimization."
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
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Creative Tech Studio</span>
              <h1 className="text-5xl sm:text-7xl md:text-[10vw] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient">
                Engineering the<br />Extraordinary.
              </h1>
              <p className="text-xl md:text-3xl text-white/40 max-w-3xl font-light leading-tight tracking-tight">
                Our development ecosystem is built on the pillars of speed, security, and scalability. We utilize modern tech stacks to deliver sub-second digital experiences.
              </p>
            </motion.div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 md:mb-40">
            {services.map((service, i) => (
              <motion.div 
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/30 transition-all group flex flex-col h-full"
              >
                <div className="text-brand-red mb-8 w-16 h-16 rounded-2xl bg-brand-red/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {service.icon}
                </div>
                <h3 className="text-3xl font-display font-bold mb-6">{service.title}</h3>
                <p className="text-white/40 text-lg leading-relaxed mb-8 flex-grow">{service.desc}</p>
                <div className="space-y-4">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-white/60">
                      <CheckCircle2 size={16} className="text-brand-red" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Process Section */}
          <section className="mb-32 md:mb-40">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 md:mb-24">
              <div>
                <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">The Creative Blueprint</span>
                <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter">Our Process.</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {process.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-[2rem] bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-4xl font-display font-bold text-brand-red block mb-6 group-hover:scale-110 transition-transform duration-500">{item.step}</span>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 md:py-40 px-6 md:px-12 bg-zinc-950 rounded-[2rem] md:rounded-[3rem] border border-white/5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,99,33,0.05)_0%,transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tighter mb-8">Ready to Build Your Legacy?</h2>
              <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-12">
                We are currently accepting new projects for 2026. Let's orchestrate your digital breakthrough together.
              </p>
              <MagneticButton>
                <button className="px-12 py-6 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs">
                  Start Your Project
                </button>
              </MagneticButton>
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
