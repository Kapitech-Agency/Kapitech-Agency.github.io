import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Kapitech transformed our fragmented real estate portal into a high-conversion engine. Their SOP-driven approach is a game-changer.",
    author: "Marcus Thorne",
    role: "CEO",
    company: "Lumina Real Estate",
    image: "https://i.pravatar.cc/150?u=marcus"
  },
  {
    quote: "The level of technical authority Kapitech brings is unmatched. They architect digital legacies that command market authority.",
    author: "Sarah Chen",
    role: "Creative Director",
    company: "Aura Creative Studio",
    image: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    quote: "Frictionless UI and a robust backend. Our active user base grew by 40% within three months. Their engineering is truly elite.",
    author: "David Miller",
    role: "Product Lead",
    company: "Nexus Fintech",
    image: "https://i.pravatar.cc/150?u=david"
  },
  {
    quote: "Their strategic consultancy optimized our internal workflows by 60%. Kapitech is more than a dev shop; they are architects of efficiency.",
    author: "Elena Rodriguez",
    role: "COO",
    company: "Vanguard Logistics",
    image: "https://i.pravatar.cc/150?u=elena"
  },
  {
    quote: "The 3D immersive tours they built for our luxury listings have redefined how we sell properties globally. Absolute mastery.",
    author: "Julian Vane",
    role: "Founder",
    company: "Vane Estates",
    image: "https://i.pravatar.cc/150?u=julian"
  },
  {
    quote: "Security and speed were our top priorities. Kapitech delivered a cloud-native architecture that handles our scale effortlessly.",
    author: "Michael Kross",
    role: "CTO",
    company: "Kross Security",
    image: "https://i.pravatar.cc/150?u=michael"
  },
  {
    quote: "A masterclass in UI/UX psychology. Every interaction feels intentional and high-fidelity. They truly understand the 1%.",
    author: "Sophia Laurent",
    role: "Brand Manager",
    company: "Laurent Luxury",
    image: "https://i.pravatar.cc/150?u=sophia"
  },
  {
    quote: "We needed a partner who could handle complex API integrations with zero downtime. Kapitech exceeded every expectation.",
    author: "Robert Chen",
    role: "Head of Engineering",
    company: "Sync Systems",
    image: "https://i.pravatar.cc/150?u=robert"
  },
  {
    quote: "The ROI we've seen since the redesign is staggering. Kapitech doesn't just build; they engineer growth.",
    author: "Amanda Grey",
    role: "Marketing VP",
    company: "Growth Labs",
    image: "https://i.pravatar.cc/150?u=amanda"
  },
  {
    quote: "Kapitech's ability to translate complex business requirements into elegant digital solutions is unparalleled. They are true partners.",
    author: "Thomas Wright",
    role: "Director of Innovation",
    company: "Wright Tech",
    image: "https://i.pravatar.cc/150?u=thomas"
  },
  {
    quote: "The speed and efficiency of their deployment pipeline saved us months of development time. Elite engineering at its finest.",
    author: "Lisa Song",
    role: "Lead Developer",
    company: "CloudScale",
    image: "https://i.pravatar.cc/150?u=lisa"
  },
  {
    quote: "Their design system approach allowed us to scale our product across multiple platforms with perfect consistency. Highly recommended.",
    author: "Kevin Park",
    role: "Head of Product",
    company: "OmniChannel",
    image: "https://i.pravatar.cc/150?u=kevin"
  }
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    const timer = setInterval(next, 10000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      filter: "blur(10px)",
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      filter: "blur(10px)",
      scale: 0.95
    })
  };

  const currentItems = testimonials.slice(
    currentIndex * itemsPerSlide,
    (currentIndex + 1) * itemsPerSlide
  );

  return (
    <section className="py-20 md:py-40 px-6 md:px-12 bg-black overflow-hidden border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Client Intelligence</span>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-display font-bold tracking-tighter">The Feedback.</h2>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={prev}
              className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={next}
              className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                filter: { duration: 0.5 }
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {currentItems.map((item, idx) => (
                <div key={idx} className="p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 flex flex-col justify-between h-full group hover:border-brand-red/30 transition-colors duration-500">
                  <div>
                    <div className="w-8 h-8 bg-brand-red/10 rounded-lg flex items-center justify-center mb-6">
                      <Quote size={14} className="text-brand-red fill-current" />
                    </div>
                    <p className="text-[clamp(0.875rem,1vw,1.125rem)] font-light leading-relaxed text-white/80 mb-8 italic">
                      "{item.quote}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 border border-white/10">
                      <img 
                        src={item.image} 
                        alt={item.author}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-white">{item.author}</span>
                      <span className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">{item.role}</span>
                      <span className="text-brand-red text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
                        {item.company}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Indicators */}
        <div className="mt-20 flex gap-3">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`h-1 transition-all duration-500 rounded-full ${
                i === currentIndex ? 'w-12 bg-brand-red' : 'w-4 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
