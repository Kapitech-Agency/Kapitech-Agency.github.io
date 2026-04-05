import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Zap, Globe, Cpu, Code2, Palette, Users, Rocket, Heart, Coffee, Laptop, Upload, FileText, Phone, Mail, User, Link as LinkIcon, X, Shield, MapPin } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { TelemetryOverlay } from '../components/ui/TelemetryOverlay';

const positions = [
  {
    id: 'ui-ux-designer',
    title: 'Interface Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Produce interfaces for systems. Collaborate with engineering. Implement specifications.',
    requirements: [
      '2+ years experience in interface production',
      'Proficiency in Figma and design logic',
      'Understanding of technical design principles',
      'Portfolio of verified digital deployments'
    ],
    salary: 'Standardized',
    experience: 'Mid-Level'
  },
  {
    id: 'frontend-dev',
    title: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Engineer interfaces using React. Focus on stability. Optimize performance.',
    requirements: [
      'Proficiency in React and TypeScript',
      'Expertise in CSS and Tailwind architecture',
      'Focus on technical performance metrics',
      'Experience in collaborative engineering environments'
    ],
    salary: 'Standardized',
    experience: 'Mid-Level'
  },
  {
    id: 'graphic-designer',
    title: 'Visual Production',
    department: 'Creative',
    location: 'Remote',
    type: 'Full-time',
    description: 'Produce visual assets. Execute content for requirements.',
    requirements: [
      'Experience in visual system production',
      'Proficiency in Adobe Creative Suite',
      'Logical approach to visual problem solving',
      'Standardized communication protocols'
    ],
    salary: 'Standardized',
    experience: 'Junior to Mid'
  }
];

const hiringProcess = [
  {
    step: "01",
    title: "Technical Audit",
    desc: "Review portfolio. Align technical experience.",
    icon: <FileText size={24} />
  },
  {
    step: "02",
    title: "Skill Verification",
    desc: "Assess tools. Verify methodologies. Test logic.",
    icon: <Cpu size={24} />
  },
  {
    step: "03",
    title: "Protocol Alignment",
    desc: "Verify styles. Integrate operational values.",
    icon: <Users size={24} />
  },
  {
    step: "04",
    title: "System Integration",
    desc: "Onboard personnel. Integrate into collective.",
    icon: <Rocket size={24} />
  }
];

const benefits = [
  {
    icon: <Globe size={24} />,
    title: 'Remote Protocol',
    desc: 'Remote work options. Flexible hours.',
  },
  {
    icon: <Cpu size={24} />,
    title: 'Technical Stack',
    desc: 'Access infrastructure. Use production tools.',
  },
  {
    icon: <Heart size={24} />,
    title: 'Health Coverage',
    desc: 'Standardized health insurance and well-being support protocols.'
  },
  {
    icon: <Rocket size={24} />,
    title: 'Skill Development',
    desc: 'Resources for technical growth and professional certification.'
  },
  {
    icon: <Coffee size={24} />,
    title: 'Direct Culture',
    desc: 'Focus on transparent communication and technical collaboration.'
  },
  {
    icon: <Laptop size={24} />,
    title: 'Hardware Provision',
    desc: 'Provision of necessary technical hardware for operational efficiency.'
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
      className="film-grain overflow-x-hidden"
      role="main"
      aria-label="Careers at Kapitech"
    >
      {/* Enhanced Atmospheric Background */}
      <AtmosphericBackground 
        imageUrl="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2070"
        accentColor="purple"
        statusText="RECRUITMENT_ACTIVE"
        scanMode="TALENT_ACQUISITION"
        sysRef="KPTCH_HR_NODE"
        opacity={0.05}
      />

      {/* Telemetry Overlay */}
      <TelemetryOverlay label="KPTCH_CAREERS_TELEMETRY" accentColor="purple" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 py-24 md:py-48 overflow-hidden bg-black">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-brand-red mb-8 inline-block">
              Talent Acquisition
            </span>
            <h1 className="text-[clamp(2.25rem,8vw,5.5rem)] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient uppercase">
              Operational<br />
              Integration.
            </h1>
            <p className="text-sm md:text-base text-white/40 max-w-3xl font-light leading-relaxed mb-16 tracking-tight">
              Kapitech is integrating technical talent for agency operations. We require specialists in interface production and system engineering for global deployment cycles.
            </p>
          </motion.div>
        </div>

        {/* Talent Acquisition Visual */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-80 h-80 hidden lg:block pointer-events-none opacity-20">
          <div className="relative w-full h-full">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20 + i * 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute inset-0 border border-brand-red/30 rounded-full"
                style={{ margin: `${i * 20}px` }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-brand-red rounded-full animate-ping" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Kapitech? Section */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-black relative overflow-hidden border-y border-white/5" id="why-kapitech">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full grid-bg" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 md:mb-32">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-px bg-brand-red/40" />
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px]">Operational Environment</span>
              </div>
              <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-display font-bold tracking-tighter leading-none uppercase">
                System<br />
                <span className="text-brand-red">Advantages.</span>
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Culture_Protocol</span>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest">Active_Recruitment</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
            {[
              { 
                icon: <Zap size={32} />, 
                title: "Rapid Execution", 
                desc: "Standardized workflows for high-speed technical deployment and production.",
                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
                id: "ADV_01"
              },
              { 
                icon: <Shield size={32} />, 
                title: "Technical Integrity", 
                desc: "Strict adherence to engineering standards and interface fidelity protocols.",
                image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
                id: "ADV_02"
              },
              { 
                icon: <Globe size={32} />, 
                title: "Global Reach", 
                desc: "Operational involvement in technical systems for international client networks.",
                image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
                id: "ADV_03"
              },
              { 
                icon: <Cpu size={32} />, 
                title: "Verified Stack", 
                desc: "Utilization of industry-standard technologies for robust system performance.",
                image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
                id: "ADV_04"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative p-10 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-all duration-500 group overflow-hidden"
              >
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10 rounded-tl-[2.5rem] group-hover:border-brand-red/40 transition-colors" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10 rounded-br-[2.5rem] group-hover:border-brand-red/40 transition-colors" />

                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 grayscale"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <motion.div 
                      animate={{ 
                        y: [0, -8, 0],
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: i * 0.5
                      }}
                      className="text-brand-red group-hover:scale-110 transition-all duration-500"
                    >
                      {item.icon}
                    </motion.div>
                    <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest group-hover:text-brand-red/40 transition-colors">{item.id}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-bold mb-4 group-hover:text-brand-red transition-colors duration-500 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-white/40 text-sm font-light leading-relaxed group-hover:text-white/70 transition-colors duration-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-zinc-950 relative overflow-hidden border-b border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Operational Culture</span>
            <h2 className="text-[clamp(1.5rem,5vw,3.5rem)] font-display font-bold tracking-tighter mb-8 leading-[0.9]">Execution <span className="text-brand-red">Logic.</span></h2>
            <p className="text-sm md:text-base text-white/60 font-light leading-relaxed mb-8">
              Kapitech maintains a balance between technical execution and creative logic. Our collective values direct communication, continuous system optimization, and high-fidelity results for client networks.
            </p>
            <div className="space-y-6">
              {[
                { title: "Direct Communication", desc: "Standardized protocols for transparent information exchange across all operational levels." },
                { title: "Continuous Optimization", desc: "Systematic integration of new technical methodologies and production standards." },
                { title: "Technical Ownership", desc: "Individual responsibility for system integrity and execution excellence in every deployment." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <div>
                    <h4 className="font-mono font-bold mb-1 uppercase tracking-tighter text-sm">{item.title}</h4>
                    <p className="text-xs text-white/40 font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="relative aspect-square rounded-3xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2070" 
              alt="Operational Environment" 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-brand-red/10 mix-blend-multiply" />
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:mb-24 text-center">
            <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Operational Benefits</span>
            <h2 className="text-[clamp(2rem,6vw,4rem)] font-display font-bold tracking-tighter">System Perks.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-3xl bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-brand-red/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red mb-6 group-hover:scale-110 transition-transform duration-500">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-mono font-bold mb-4 uppercase tracking-tighter">{benefit.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Process Section */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:mb-24">
            <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Operational Process</span>
            <h2 className="text-[clamp(2rem,6vw,4rem)] font-display font-bold tracking-tighter">Integration <span className="text-brand-red">Protocol.</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {hiringProcess.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-10 rounded-3xl bg-zinc-900/20 border border-white/5 group hover:border-brand-red/30 transition-all duration-500"
              >
                <div className="absolute top-8 right-8 text-4xl font-display font-black text-white/5 group-hover:text-brand-red/10 transition-colors duration-500 font-mono">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red mb-8 group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <h3 className="text-lg font-mono font-bold mb-4 group-hover:text-white transition-colors uppercase tracking-tighter">{item.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed font-light">{item.desc}</p>
                
                {i < hiringProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-white/10 to-transparent z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-zinc-950 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20 md:mb-32">
            <div>
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Active Openings</span>
              <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-display font-bold tracking-tighter uppercase leading-none">Join<br />Collective.</h2>
            </div>
            <p className="text-white/60 max-w-sm text-sm md:text-base font-light leading-relaxed">
              For unspecified roles, submit technical portfolios for archival review and future operational requirements.
            </p>
          </div>

          <div className="space-y-6" role="list" aria-label="Open job positions">
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
                className="group p-8 md:p-12 rounded-3xl bg-black border border-white/5 hover:border-brand-red/50 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 w-full">
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-brand-red font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-xl bg-brand-red/10">
                        {job.department}
                      </span>
                      <span className="text-white/40 font-mono text-[10px] font-bold uppercase tracking-widest">
                        {job.location} • {job.type}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-3xl font-mono font-bold group-hover:text-brand-red transition-colors mb-4 uppercase tracking-tighter">
                      {job.title}
                    </h3>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                        <Zap size={12} className="text-brand-red" />
                        {job.experience}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                        <Heart size={12} className="text-brand-red" />
                        {job.salary}
                      </div>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shrink-0">
                    <ArrowUpRight size={32} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agency Stats Widget */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-zinc-950 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red blur-[150px] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <div className="p-10 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-6 group hover:border-emerald-400/30 transition-all duration-500">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">Deployment Success</span>
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-grow h-12 flex items-end gap-1">
                {[40, 50, 45, 60, 70, 65, 75, 80, 85, 90].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="flex-grow bg-emerald-400/20 rounded-t-sm group-hover:bg-emerald-400/40 transition-colors"
                  />
                ))}
              </div>
              <span className="text-2xl font-display font-bold font-mono">50+</span>
            </div>
            <p className="text-[10px] text-white/40 font-light font-mono uppercase tracking-widest">Verified technical deployments since 2021 initiation.</p>
          </div>

          <div className="p-10 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-6 group hover:border-brand-red/30 transition-all duration-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">Collective Growth</span>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Users className="text-brand-red" size={24} />
              </div>
              <div>
                <span className="block text-xl font-bold font-mono">15+ Units</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Specialized Personnel</span>
              </div>
            </div>
            <p className="text-[10px] text-white/40 font-light font-mono uppercase tracking-widest">Technical architects and interface production specialists.</p>
          </div>

          <div className="p-10 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-6 group hover:border-blue-500/30 transition-all duration-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">Operational Base</span>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <MapPin className="text-blue-500" size={24} />
              </div>
              <div>
                <span className="block text-xl font-bold font-mono">Tangerang</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Central Node</span>
              </div>
            </div>
            <p className="text-[10px] text-white/40 font-light font-mono uppercase tracking-widest">Regional headquarters for global system management.</p>
          </div>
        </div>
      </section>

      {/* General Inquiry */}
      <section className="py-20 md:py-40 px-6 md:px-12 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">General Inquiry</span>
          <h2 className="text-[clamp(1.5rem,5vw,3.5rem)] font-display font-bold tracking-tighter mb-8">Unspecified Roles.</h2>
          <p className="text-sm md:text-base text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-12">
            Submit technical portfolios for archival review if current openings do not align with specialized skill sets. We maintain a database of talent for future operational requirements.
          </p>
          <MagneticButton>
            <Link to="/contact" className="px-12 py-5 bg-white text-black rounded-2xl font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs inline-block font-mono">
              Submit Portfolio
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
              className="fixed top-12 right-12 z-[110] p-4 rounded-2xl bg-white text-black hover:bg-brand-red hover:text-white transition-all"
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
                  <span className="text-brand-red text-[10px] font-mono font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-brand-red/10">
                    {selectedPosition.department}
                  </span>
                  <span className="text-white/40 text-[10px] font-mono font-bold uppercase tracking-widest">
                    {selectedPosition.location} • {selectedPosition.type}
                  </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-12 uppercase">
                  {selectedPosition.title}
                </h2>
                
                <div className="space-y-16">
                  <div>
                    <h3 className="font-mono font-bold mb-6 text-brand-red uppercase tracking-widest text-[10px]">Operational Role</h3>
                    <p className="text-sm md:text-base text-white/60 font-light leading-relaxed">
                      {selectedPosition.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-mono font-bold mb-6 text-brand-red uppercase tracking-widest text-[10px]">Technical Requirements</h3>
                    <ul className="space-y-4">
                      {selectedPosition.requirements.map((req, i) => (
                        <li key={i} className="flex gap-4 items-start text-sm text-white/60 font-light">
                          <CheckCircle2 className="text-brand-red shrink-0 mt-1" size={16} />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-12 border-t border-white/10">
                    <h3 className="text-xl font-display font-bold mb-8 uppercase tracking-tighter">Initiate Integration.</h3>
                    <div className="flex flex-wrap gap-6">
                      <MagneticButton>
                        <button 
                          onClick={() => setIsApplying(true)}
                          className="px-12 py-5 bg-white text-black rounded-2xl font-bold hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs inline-block font-mono"
                          aria-label="Apply for this position"
                        >
                          Submit Application
                        </button>
                      </MagneticButton>
                      <button 
                        onClick={() => setSelectedPosition(null)}
                        className="px-12 py-5 rounded-2xl border border-white/10 hover:bg-white/5 transition-all font-bold tracking-widest uppercase text-xs font-mono"
                        aria-label="Back to Openings"
                      >
                        Return to Index
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
            {/* Modal Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 grid-bg opacity-5" />
              <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-brand-red/5 blur-[180px] rounded-full" />
              <div className="absolute -bottom-20 -left-20 w-[700px] h-[700px] bg-blue-900/5 blur-[180px] rounded-full" />
            </div>

            <div className="max-w-3xl mx-auto px-6 md:px-12 py-24 w-full relative z-10">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">Application Protocol</span>
                  <h2 id="application-title" className="text-3xl md:text-5xl font-display font-bold tracking-tighter uppercase">
                    {selectedPosition.title}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsApplying(false)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-brand-red transition-all"
                  aria-label="Close application form"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        required
                        type="text" 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-brand-red transition-all font-mono text-sm"
                        placeholder="IDENTIFIER"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        required
                        type="email" 
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-brand-red transition-all font-mono text-sm"
                        placeholder="NETWORK_ADDRESS"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        required
                        type="tel" 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-brand-red transition-all font-mono text-sm"
                        placeholder="CONTACT_LINE"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="portfolio" className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block">Portfolio Link</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="url" 
                        id="portfolio"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-brand-red transition-all font-mono text-sm"
                        placeholder="TECHNICAL_REPOSITORY"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="coverLetter" className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block">Cover Letter</label>
                  <textarea 
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-brand-red transition-all resize-none font-mono text-sm"
                    placeholder="Operational intent and technical background..."
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block">Resume / CV</span>
                  <label 
                    htmlFor="resume" 
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-brand-red/50 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-white/20 group-hover:text-brand-red mb-4 transition-colors" />
                      <p className="mb-2 text-sm text-white/60 font-mono">
                        <span className="font-bold">UPLOAD_FILE</span> or drag and drop
                      </p>
                      <p className="text-[10px] text-white/40 font-mono">PDF, DOCX (MAX. 5MB)</p>
                      {fileError && (
                        <p className="mt-2 text-[10px] text-brand-red font-bold uppercase tracking-widest animate-pulse font-mono">
                          {fileError}
                        </p>
                      )}
                      {formData.resume && !fileError && (
                        <div className="mt-4 flex items-center gap-2 text-brand-red font-bold text-[10px] uppercase tracking-widest font-mono">
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
