import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="py-20 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-10 group">
              <img 
                src="Kapitech Logo White.png" 
                alt="KAPITECH" 
                className="h-12 md:h-16 w-auto object-contain group-hover:rotate-12 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold tracking-tighter mb-8">
              Let's build something <br />
              <span className="text-brand-red">extraordinary</span> together.
            </h2>
            <button className="text-lg md:text-xl font-display font-bold flex items-center gap-2 hover:text-brand-red transition-colors group">
              hello@kapitech.co.id
              <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
          
          <div>
            <h4 className="text-white/30 uppercase tracking-widest text-[10px] font-bold mb-6">Navigation</h4>
            <ul className="space-y-4">
              <li><Link to="/work" className="hover:text-brand-red transition-colors">Work</Link></li>
              <li><Link to="/services" className="hover:text-brand-red transition-colors">Services</Link></li>
              <li><Link to="/about" className="hover:text-brand-red transition-colors">About</Link></li>
              <li><Link to="/careers" className="hover:text-brand-red transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-brand-red transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white/30 uppercase tracking-widest text-[10px] font-bold mb-6">Social</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-brand-red transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Behance</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/30 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2026 PT KAPITECH DIGITAL INDONESIA. ALL RIGHTS RESERVED. HEADQUARTERED IN SOUTH TANGERANG, ID & BEYOND.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
