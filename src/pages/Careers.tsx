import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Zap, Globe, Cpu, Code2, Palette, Users, Rocket, Heart, Coffee, Laptop, Upload, FileText, Phone, Mail, User, Link as LinkIcon, X, Shield } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const positions = [
  {
    id: 'sr-ux-designer',
    title: 'Senior UX Designer',
    department: 'Design',
    location: 'Remote / Hybrid',
    type: 'Full-time',
    description: 'We are looking for a visionary designer to lead our high-fidelity product experiences. You will be responsible for architecting complex user journeys and setting the visual standard for our enterprise clients.',
    requirements: [
      '5+ years of experience in product design',
      'Expertise in Figma and motion design',
      'Strong portfolio of shipped digital products',
      'Ability to translate complex data into intuitive interfaces'
    ]
  },
  {
    id: 'fullstack-eng',
    title: 'Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Join our engineering elite to build scalable, performance-first applications. You will work with Next.js, TypeScript, and AWS to deliver sub-second digital experiences.',
    requirements: [
      'Proficiency in React, Node.js, and TypeScript',
      'Experience with cloud infrastructure (AWS/GCP)',
      'Passion for performance optimization and clean code',
      'Understanding of modern CI/CD pipelines'
    ]
  },
  {
    id: 'creative-director',
    title: 'Creative Director',
    department: 'Creative',
    location: 'Hybrid',
    type: 'Full-time',
    description: 'Lead our creative vision and mentor a team of multidisciplinary designers. You will be the bridge between strategic objectives and artistic execution.',
    requirements: [
      '8+ years in a creative leadership role',
      'Strong background in branding and digital storytelling',
      'Experience managing and scaling creative teams',
      'Exceptional communication and presentation skills'
    ]
  }
];

const benefits = [
  {
    icon: <Globe size={24} />,
    title: 'Work from Anywhere',
    desc: 'Our team is distributed globally. We prioritize output over hours spent in an office.'
  },
  {
    icon: <Cpu size={24} />,
    title: 'Elite Tech Stack',
    desc: 'Work with the latest tools and technologies. We never settle for legacy systems.'
  },
  {
    icon: <Heart size={24} />,
    title: 'Health & Wellness',
    desc: 'Comprehensive health insurance and wellness stipends to keep you at your best.'
  },
  {
    icon: <Rocket size={24} />,
    title: 'Growth Budget',
    desc: 'Annual budget for courses, conferences, and books to fuel your professional evolution.'
  },
  {
    icon: <Coffee size={24} />,
    title: 'Culture of Autonomy',
    desc: 'We hire experts and trust them to lead. No micromanagement, just high-performance.'
  },
  {
    icon: <Laptop size={24} />,
    title: 'Home Office Setup',
    desc: 'We provide a generous stipend to ensure your workspace is as high-fidelity as your work.'
  }
];

export const Careers = () => {
  const [selectedPosition, setSelectedPosition] = useState<typeof positions[0] | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    portfolio: '',
    coverLetter: '',
    resume: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setFileError('Invalid file type. Please upload a PDF or DOCX.');
        return;
      }

      if (file.size > maxSize) {
        setFileError('File size exceeds 5MB. Please upload a smaller file.');
        return;
      }

      setFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (fileError) {
      alert('Please fix the file upload errors before submitting.');
      return;
    }

    if (!formData.resume) {
      alert('Please upload your resume.');
      return;
    }

    // Simulate submission
    console.log('Application submitted:', formData);
    alert('Application submitted successfully!');
    setIsApplying(false);
    setSelectedPosition(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      portfolio: '',
      coverLetter: '',
      resume: null as File | null
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="film-grain"
      role="main"
      aria-label="Careers at Kapitech"
    >
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col justify-center px-6 md:px-12 pt-32 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-[0.15]" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', 
                 backgroundSize: '32px 32px' 
               }} 
          />
          <div className="absolute inset-0 grid-bg opacity-10" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-brand-red/10 blur-[180px] rounded-full" 
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-[0.2em] uppercase text-brand-red mb-8 inline-block">
              Careers at Kapitech
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-[8vw] lg:text-[10vw] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient">
              Join the<br />
              Powerhouse.
            </h1>
            <p className="text-xl md:text-3xl text-white/40 max-w-3xl font-light leading-tight mb-16 tracking-tight">
              We are looking for the <span className="text-white">top 1%</span> of designers, engineers, and strategists to architect the digital legacies of tomorrow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Kapitech? Section */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-black relative overflow-hidden" id="why-kapitech">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full grid-bg" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-brand-red font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block"
            >
              The Advantage
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-display font-bold tracking-tighter"
            >
              Why Kapitech?
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
            {[
              { 
                icon: <Zap size={32} />, 
                title: "High Velocity", 
                desc: "We ship at a speed that leaves competitors in the dust. No bureaucracy, just execution.",
                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
              },
              { 
                icon: <Shield size={32} />, 
                title: "Elite Standards", 
                desc: "We only hire the top 1%. You'll be surrounded by masters of their craft.",
                image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
              },
              { 
                icon: <Globe size={32} />, 
                title: "Global Impact", 
                desc: "Build products used by millions across the globe for world-class enterprise clients.",
                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
              },
              { 
                icon: <Cpu size={32} />, 
                title: "Future Tech", 
                desc: "Work with the most advanced stacks. We don't just follow trends, we set them.",
                image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative p-10 bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-all duration-500 group overflow-hidden"
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60" />
                </div>

                <div className="relative z-10">
                  <div className="text-brand-red mb-8 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-brand-red transition-colors duration-500">{item.title}</h3>
                  <p className="text-white/60 font-light leading-relaxed group-hover:text-white/90 transition-colors duration-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Culture</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">Built on Excellence.</h2>
            <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed mb-8">
              At Kapitech, we don't just "do work." We orchestrate digital symphonies. We value autonomy, technical mastery, and the relentless pursuit of perfection.
            </p>
            <div className="space-y-6">
              {[
                { title: "Radical Transparency", desc: "We share everything—from strategy to financials. Everyone is an owner." },
                { title: "Craft Over Speed", desc: "We move fast, but we never sacrifice the integrity of the craft." },
                { title: "Continuous Evolution", desc: "If you're not learning, you're standing still. We push each other to grow." }
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
          <div className="relative aspect-square rounded-[3rem] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2070" 
              alt="Team Culture" 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-brand-red/10 mix-blend-multiply" />
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:mb-24 text-center">
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Perks & Benefits</span>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">The Ecosystem.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2rem] bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red mb-6 group-hover:scale-110 transition-transform duration-500">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-zinc-950 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 md:mb-24">
            <div>
              <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Current Openings</span>
              <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter">Open Roles.</h2>
            </div>
            <p className="text-white/60 max-w-sm text-sm">
              Don't see a role that fits? We're always looking for exceptional talent. Send us a strategic inquiry.
            </p>
          </div>

          <div className="space-y-4" role="list" aria-label="Open job positions">
            {positions.map((job, i) => (
              <motion.div
                key={job.id}
                role="listitem"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedPosition(job)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedPosition(job)}
                tabIndex={0}
                aria-label={`View details for ${job.title}`}
                className="group p-8 md:p-12 rounded-[2rem] bg-black border border-white/5 hover:border-brand-red/50 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-brand-red text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-brand-red/10">
                      {job.department}
                    </span>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      {job.location} • {job.type}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-display font-bold group-hover:text-brand-red transition-colors">
                    {job.title}
                  </h3>
                </div>
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shrink-0">
                  <ArrowUpRight size={32} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Authority Widget */}
      <section className="py-32 px-6 md:px-12 bg-zinc-950 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red blur-[150px] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <div className="p-10 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-6 group hover:border-emerald-400/30 transition-all duration-500">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Growth Velocity</span>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Scaling Fast
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-grow h-12 flex items-end gap-1">
                {[70, 80, 75, 85, 90, 80, 85, 90, 85, 100].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="flex-grow bg-emerald-400/20 rounded-t-sm group-hover:bg-emerald-400/40 transition-colors"
                  />
                ))}
              </div>
              <span className="text-2xl font-display font-bold">120%</span>
            </div>
            <p className="text-xs text-white/40">Our team has expanded by 120% in the last 12 months, focusing on elite talent.</p>
          </div>

          <div className="p-10 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-6 group hover:border-brand-red/30 transition-all duration-500">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Learning Hours</span>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Cpu className="text-brand-red" size={24} />
              </div>
              <div>
                <span className="block text-xl font-bold">400+ hrs</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">Monthly R&D</span>
              </div>
            </div>
            <p className="text-xs text-white/40">We dedicate over 400 hours monthly to internal R&D and skill evolution.</p>
          </div>

          <div className="p-10 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-6 group hover:border-blue-500/30 transition-all duration-500">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Team Diversity</span>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Globe className="text-blue-500" size={24} />
              </div>
              <div>
                <span className="block text-xl font-bold">12+ Nations</span>
                <span className="text-xs text-white/40 uppercase tracking-widest">Global Perspective</span>
              </div>
            </div>
            <p className="text-xs text-white/40">Our powerhouse is built from experts across 12+ different countries.</p>
          </div>
        </div>
      </section>

      {/* Strategic Inquiry */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Strategic Inquiry</span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-8">Not a standard fit?</h2>
          <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-12">
            If you believe you belong in the top 1% but don't see a role that matches your expertise, we want to hear from you.
          </p>
          <MagneticButton>
            <Link to="/contact" className="px-12 py-5 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs inline-block">
              Send Strategic Inquiry
            </Link>
          </MagneticButton>
        </div>
      </section>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col overflow-y-auto"
          >
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedPosition(null)}
              className="fixed top-12 right-12 z-[110] p-4 rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all"
            >
              <ArrowUpRight size={32} className="rotate-180" />
            </motion.button>

            <div className="max-w-4xl mx-auto px-6 md:px-12 py-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-brand-red text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-brand-red/10">
                    {selectedPosition.department}
                  </span>
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {selectedPosition.location} • {selectedPosition.type}
                  </span>
                </div>
                <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-12">
                  {selectedPosition.title}
                </h2>
                
                <div className="space-y-16">
                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-brand-red uppercase tracking-widest text-sm">The Mission</h3>
                    <p className="text-xl text-white/60 font-light leading-relaxed">
                      {selectedPosition.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-brand-red uppercase tracking-widest text-sm">Requirements</h3>
                    <ul className="space-y-4">
                      {selectedPosition.requirements.map((req, i) => (
                        <li key={i} className="flex gap-4 items-start text-lg text-white/60 font-light">
                          <CheckCircle2 className="text-brand-red shrink-0 mt-1" size={20} />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-12 border-t border-white/10">
                    <h3 className="text-2xl font-bold mb-8">Ready to architect the future?</h3>
                    <div className="flex flex-wrap gap-6">
                      <MagneticButton>
                        <button 
                          onClick={() => setIsApplying(true)}
                          className="px-12 py-5 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs inline-block"
                          aria-label="Apply for this position"
                        >
                          Apply for this position
                        </button>
                      </MagneticButton>
                      <button 
                        onClick={() => setSelectedPosition(null)}
                        className="px-12 py-5 rounded-full border border-white/10 hover:bg-white/5 transition-all font-bold tracking-widest uppercase text-xs"
                        aria-label="Back to Openings"
                      >
                        Back to Openings
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Modal */}
      <AnimatePresence>
        {isApplying && selectedPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-title"
          >
            <div className="max-w-3xl mx-auto px-6 md:px-12 py-24 w-full">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">Application Form</span>
                  <h2 id="application-title" className="text-4xl md:text-6xl font-display font-bold tracking-tighter">
                    {selectedPosition.title}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsApplying(false)}
                  className="p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-brand-red transition-all"
                  aria-label="Close application form"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        required
                        type="text" 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-brand-red transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        required
                        type="email" 
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-brand-red transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        required
                        type="tel" 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-brand-red transition-all"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="portfolio" className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Portfolio Link</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="url" 
                        id="portfolio"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-brand-red transition-all"
                        placeholder="https://portfolio.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="coverLetter" className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Cover Letter</label>
                  <textarea 
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-brand-red transition-all resize-none"
                    placeholder="Tell us why you're the perfect fit for Kapitech..."
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Resume / CV</span>
                  <label 
                    htmlFor="resume" 
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-brand-red/50 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-white/20 group-hover:text-brand-red mb-4 transition-colors" />
                      <p className="mb-2 text-sm text-white/60">
                        <span className="font-bold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-white/40">PDF, DOCX (MAX. 5MB)</p>
                      {fileError && (
                        <p className="mt-2 text-xs text-brand-red font-bold uppercase tracking-widest animate-pulse">
                          {fileError}
                        </p>
                      )}
                      {formData.resume && !fileError && (
                        <div className="mt-4 flex items-center gap-2 text-brand-red font-bold text-xs uppercase tracking-widest">
                          <FileText size={14} />
                          {formData.resume.name}
                        </div>
                      )}
                    </div>
                    <input 
                      id="resume" 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <div className="pt-8">
                  <MagneticButton>
                    <button 
                      type="submit"
                      className="w-full py-6 bg-white text-black rounded-full font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-sm"
                    >
                      Submit Application
                    </button>
                  </MagneticButton>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
