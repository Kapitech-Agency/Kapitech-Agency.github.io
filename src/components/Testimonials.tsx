import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { getCmsTestimonials, TestimonialItem } from '../lib/cmsStore';

export const Testimonials = () => {
  const { language } = useLanguage();
  const [cmsTestimonials, setCmsTestimonials] = useState<TestimonialItem[]>(() => getCmsTestimonials());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  useEffect(() => {
    const handleUpdate = () => {
      setCmsTestimonials(getCmsTestimonials());
    };
    window.addEventListener('kapitech_cms_updated', handleUpdate);
    return () => window.removeEventListener('kapitech_cms_updated', handleUpdate);
  }, []);

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

  const testimonials = cmsTestimonials.map(t => ({
    quote: language === 'id' ? (t.quoteId || t.quote) : (t.quote || t.quoteId),
    author: t.author,
    role: t.role,
    company: t.company,
    location: t.location,
    rating: t.rating || 5
  }));
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
