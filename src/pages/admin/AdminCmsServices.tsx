import React, { useState } from 'react';
import { Layers, Plus, Search, Edit3, Trash2, Check, ExternalLink, Sparkles, LayoutGrid, Code, Palette, Cpu } from 'lucide-react';
import { allSolutionsAndServices } from '../../data/servicesData';
import { useLanguage } from '../../lib/LanguageContext';

export const AdminCmsServices: React.FC = () => {
  const { language } = useLanguage();
  const [servicesList, setServicesList] = useState(allSolutionsAndServices);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const categories = ['All', 'Solutions', 'Branding', 'Design', 'Development'];

  const filtered = servicesList.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      s.title.toLowerCase().includes(q) ||
      s.heroHeadlineId.toLowerCase().includes(q) ||
      s.navSubtitleId.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Design':
        return <Palette size={14} className="text-purple-400" />;
      case 'Development':
        return <Code size={14} className="text-blue-400" />;
      case 'Branding':
        return <Sparkles size={14} className="text-amber-400" />;
      case 'Solutions':
      default:
        return <Cpu size={14} className="text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262930]">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Layers className="text-brand-red" size={24} />
            <span>CMS: Studio Service Offerings</span>
          </h1>
          <p className="text-xs text-[#8A909D] mt-1">
            Daftar penawaran spesialisasi kapabilitas agency yang tampil di halaman <code className="text-white bg-[#16181D] px-1.5 py-0.5 rounded">/services</code>.
          </p>
        </div>

        <div className="text-xs font-mono text-[#8A909D] bg-[#16181D] px-3.5 py-2 rounded-xl border border-[#262930]">
          Total Layanan: <strong className="text-white">{servicesList.length} Spesialisasi</strong>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check size={14} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                selectedCategory === cat
                  ? 'bg-brand-red text-white border-brand-red font-bold'
                  : 'bg-[#16181D] text-[#8A909D] border-[#262930] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A909D]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari layanan..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#16181D] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
          />
        </div>
      </div>

      {/* Services List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.slug}
            className="bg-[#16181D] border border-[#262930] rounded-2xl p-5 flex flex-col justify-between hover:border-[#383C46] transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(item.category)}
                  <span className="text-[10px] font-mono text-[#8A909D] uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B0C0E] border border-[#262930] text-emerald-400">
                  {item.badgeId || item.badge}
                </span>
              </div>

              <h3 className="text-base font-bold font-display text-white mb-1.5">
                {item.title}
              </h3>
              
              <p className="text-xs text-[#8A909D] leading-relaxed mb-4 line-clamp-2">
                {item.heroSubtitleId || item.heroSubtitle}
              </p>

              {/* Deliverables / Capabilities preview */}
              <div className="space-y-1.5 mb-4">
                <div className="text-[10px] font-mono text-[#5C626E] uppercase tracking-wider">
                  Core Capabilities:
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.capabilities.slice(0, 3).map((c, idx) => (
                    <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#0B0C0E] text-[#D0D4DC] border border-[#262930]">
                      {c.titleId || c.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#262930] flex items-center justify-between text-xs font-mono text-[#8A909D]">
              <span>Slug: /{item.slug}</span>
              <a
                href={`/services/${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-red hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Live View</span>
                <ExternalLink size={11} />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
export default AdminCmsServices;
