import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export const Testimonials = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerSlide(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerSlide(2);
      } else {
        setItemsPerSlide(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const testimonialsEn = [
    {
      quote: "Kapitech built our real estate portal from scratch using Next.js. The page load speed is blazing fast and our inbound lead conversions increased by 45% within the first month.",
      author: "Marcus Thorne",
      role: "Managing Director",
      company: "Lumina Real Estate",
      location: "Jakarta, Indonesia"
    },
    {
      quote: "Their design team has an exceptional eye for modern typography and layout. They delivered a cohesive brand identity and a stunning web experience that elevated our firm completely.",
      author: "Sarah Chen",
      role: "Creative Director",
      company: "Aura Creative Studio",
      location: "Singapore"
    },
    {
      quote: "Working with Kapitech on our mobile banking interface was seamless. They simplified complex account journeys and delivered pixel-perfect Figma specs ready for our dev squad.",
      author: "David Miller",
      role: "Head of Product",
      company: "Nexus Fintech",
      location: "Hong Kong"
    },
    {
      quote: "The solar energy monitoring dashboard Kapitech engineered gave our operations team instant visibility across 40+ solar farms with zero lag. Highly dependable engineering.",
      author: "Elena Rodriguez",
      role: "Operations VP",
      company: "Solaris CleanTech",
      location: "Melbourne, Australia"
    },
    {
      quote: "Our headless Shopify migration handled our flash sale traffic peaks without a hitch. Checkout conversion increased by 38%. Kapitech delivers genuine business results.",
      author: "Julian Vane",
      role: "Founder & CEO",
      company: "Vivid Commerce",
      location: "Jakarta, Indonesia"
    },
    {
      quote: "Clear milestones, proactive communication, and zero technical fluff. Kapitech is our go-to partner whenever we need to launch a new digital product on a tight timeline.",
      author: "Michael Kross",
      role: "Chief Technology Officer",
      company: "Kross Cloud Systems",
      location: "Kuala Lumpur, Malaysia"
    }
  ];

  const testimonialsId = [
    {
      quote: "Kapitech membangun portal real estate kami dari nol menggunakan Next.js. Kecepatan loading halamannya luar biasa cepat dan konversi prospek kami meningkat 45% dalam bulan pertama.",
      author: "Marcus Thorne",
      role: "Managing Director",
      company: "Lumina Real Estate",
      location: "Jakarta, Indonesia"
    },
    {
      quote: "Tim desain mereka memiliki keahlian luar biasa dalam tipografi dan tata letak modern. Mereka menghadirkan identitas brand yang sangat kohesif dan pengalaman web yang memukau.",
      author: "Sarah Chen",
      role: "Creative Director",
      company: "Aura Creative Studio",
      location: "Singapura"
    },
    {
      quote: "Bekerja dengan Kapitech untuk antarmuka mobile banking sangat lancar. Mereka menyederhanakan alur pengguna yang kompleks dan menyerahkan spesifikasi Figma yang presisi untuk tim developer kami.",
      author: "David Miller",
      role: "Head of Product",
      company: "Nexus Fintech",
      location: "Hong Kong"
    },
    {
      quote: "Dashboard monitoring energi surya yang dikembangkan Kapitech memberi tim operasi kami visibilitas langsung di lebih dari 40 ladang surya tanpa lag. Rekayasa yang sangat andal.",
      author: "Elena Rodriguez",
      role: "Operations VP",
      company: "Solaris CleanTech",
      location: "Melbourne, Australia"
    },
    {
      quote: "Migrasi headless Shopify kami mampu menangani lonjakan traffic flash sale tanpa hambatan sama sekali. Konversi checkout meningkat 38%. Kapitech memberikan hasil nyata untuk bisnis.",
      author: "Julian Vane",
      role: "Founder & CEO",
      company: "Vivid Commerce",
      location: "Jakarta, Indonesia"
    },
    {
      quote: "Milestone yang jelas, komunikasi proaktif, dan tanpa basa-basi teknis. Kapitech adalah mitra andalan kami setiap kali butuh meluncurkan produk digital dengan tenggat waktu ketat.",
      author: "Michael Kross",
      role: "Chief Technology Officer",
      company: "Kross Cloud Systems",
      location: "Kuala Lumpur, Malaysia"
    }
  ];

  const testimonials = language === 'id' ? testimonialsId : testimonialsEn;
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Reset index if out of bounds on resize
  useEffect(() => {
    if (currentIndex >= totalSlides) {
      setCurrentIndex(0);
    }
  }, [itemsPerSlide, totalSlides]);

  useEffect(() => {
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const currentItems = testimonials.slice(
    currentIndex * itemsPerSlide,
    (currentIndex + 1) * itemsPerSlide
  );

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#0A0A0A] border-b border-[#2A2A2A]" id="testimonials">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2.5 block">
              {language === 'id' ? 'Testimoni Klien' : 'Client Testimonials'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
              {language === 'id' ? 'Dipercaya oleh para pendiri dan pemimpin produk.' : 'Trusted by founders and product leaders.'}
            </h2>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button 
              onClick={prev}
              className="w-11 h-11 rounded-full border border-[#2A2A2A] bg-[#161616] flex items-center justify-center text-[#8E8E93] hover:text-white hover:border-brand-red/50 active:scale-95 transition-all"
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={next}
              className="w-11 h-11 rounded-full border border-[#2A2A2A] bg-[#161616] flex items-center justify-center text-[#8E8E93] hover:text-white hover:border-brand-red/50 active:scale-95 transition-all"
              aria-label="Next testimonials"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className={`grid gap-4 sm:gap-6 md:gap-8 ${
          itemsPerSlide === 1 ? 'grid-cols-1' : itemsPerSlide === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          <AnimatePresence mode="wait">
            {currentItems.map((item, index) => (
              <motion.div
                key={item.author + currentIndex + language}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                className="p-6 sm:p-8 rounded-2xl bg-[#161616] border border-[#2A2A2A] flex flex-col justify-between min-h-[260px] sm:min-h-[300px] transition-colors hover:border-brand-red/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <Quote size={22} className="text-brand-red opacity-80" />
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className="fill-brand-red text-brand-red" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#8E8E93] font-light leading-relaxed">
                    "{item.quote}"
                  </p>
                </div>

                <div className="pt-4 sm:pt-5 mt-4 border-t border-[#2A2A2A]">
                  <h4 className="text-sm font-semibold text-white">{item.author}</h4>
                  <p className="text-xs text-brand-red font-medium mt-0.5">{item.role}, {item.company}</p>
                  <p className="text-[11px] text-[#8E8E93]/70 font-mono mt-0.5">{item.location}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-2 mt-8 sm:mt-10">
          {[...Array(totalSlides)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === i ? 'w-8 bg-brand-red' : 'w-2 bg-[#2A2A2A]'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
