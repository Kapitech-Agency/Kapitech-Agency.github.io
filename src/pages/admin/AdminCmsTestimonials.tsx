import React, { useState, useEffect } from 'react';
import { Quote, Plus, Star, Edit3, Trash2, Check, UserCheck, MessageSquare, Building2, MapPin } from 'lucide-react';
import { getCmsTestimonials, fetchServerCmsTestimonials, saveCmsTestimonial, deleteCmsTestimonial, TestimonialItem } from '../../lib/cmsStore';
import { useLanguage } from '../../lib/LanguageContext';

export const AdminCmsTestimonials: React.FC = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = () => {
    setTestimonials(getCmsTestimonials());
  };

  useEffect(() => {
    loadData();
    void fetchServerCmsTestimonials();
    const handleUpdate = () => loadData();
    window.addEventListener('kapitech_cms_updated', handleUpdate);
    return () => window.removeEventListener('kapitech_cms_updated', handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    const template: TestimonialItem = {
      id: 'testi_' + Date.now().toString(36),
      quote: '',
      quoteId: '',
      author: '',
      role: 'Head of Product / CEO',
      company: '',
      location: 'Jakarta, Indonesia',
      rating: 5
    };
    setEditingItem(template);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, author: string) => {
    if (window.confirm(`Hapus testimoni dari "${author}"?`)) {
      try {
        await deleteCmsTestimonial(id);
        loadData();
        setStatusMessage('Testimoni berhasil dihapus.');
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (error: any) {
        setStatusMessage(error?.message || 'Gagal menghapus testimoni.');
      }
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.author.trim() || (!editingItem.quoteId && !editingItem.quote)) {
      alert('Nama author dan isi kutipan testimoni wajib diisi.');
      return;
    }

    try {
      await saveCmsTestimonial(editingItem);
      setIsModalOpen(false);
      setEditingItem(null);
      loadData();
      setStatusMessage('Testimoni berhasil disimpan ke database CMS!');
    } catch (error: any) {
      setStatusMessage(error?.message || 'Gagal menyimpan testimoni.');
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <h1 className="text-2xl font-sans font-bold text-white flex items-center gap-3">
            <Quote className="text-[var(--k-red)]" size={24} />
            <span>CMS: Client Testimonials & Social Proof</span>
          </h1>
          <p className="text-xs text-[var(--k-text-secondary)] mt-1 font-sans">
            {language === 'id' 
              ? 'Kelola ulasan klien, feedback kepuasan, dan rekomendasi eksekutif yang tampil di homepage.'
              : 'Manage client reviews, enterprise feedback, and executive recommendations on the homepage.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[var(--k-red)] hover:bg-[var(--k-red)] text-white text-xs font-sans font-bold transition-all flex items-center gap-2 shadow-lg shadow-[var(--k-red)]/20 min-h-[44px]"
        >
          <Plus size={14} />
          <span>{language === 'id' ? 'Tambah Testimoni' : 'Add Testimonial'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-sans flex items-center gap-2">
          <Check size={14} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="bg-[var(--k-bg)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6 flex flex-col justify-between hover:border-[rgba(255,255,255,0.15)] transition-all"
          >
            <div>
              {/* Rating stars */}
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-xs text-gray-200 leading-relaxed italic mb-6">
                "{item.quoteId || item.quote}"
              </p>
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{item.author}</div>
                <div className="text-[11px] font-sans text-[var(--k-text-secondary)]">
                  {item.role}, <span className="text-white">{item.company}</span>
                </div>
                <div className="text-[10px] font-sans text-[var(--k-text-tertiary)] mt-0.5 flex items-center gap-1">
                  <MapPin size={10} />
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-lg bg-[var(--k-surface)] hover:bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] hover:text-white border border-[rgba(255,255,255,0.07)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.author)}
                  className="p-2 rounded-lg bg-[var(--k-surface)] hover:bg-red-950/40 text-[var(--k-text-secondary)] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/30 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal: Add / Edit Testimonial */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--k-bg)] border border-[rgba(255,255,255,0.07)] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.07)] mb-5">
              <h2 className="text-base font-bold font-sans text-white">
                {editingItem.author ? `Edit: ${editingItem.author}` : (language === 'id' ? 'Tambah Testimoni Klien' : 'Add Client Testimonial')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--k-text-secondary)] hover:text-white text-xs font-sans">
                ✕ {language === 'id' ? 'Tutup' : 'Close'}
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-sans text-[var(--k-text-secondary)] mb-1 font-semibold">
                  {language === 'id' ? 'Nama Klien / Eksekutif *' : 'Client / Executive Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.author}
                  onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                  placeholder="e.g., Marcus Thorne"
                  className="w-full px-3 py-2.5 bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-red)]/40 focus:border-[var(--k-red)] font-sans min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans text-[var(--k-text-secondary)] mb-1 font-semibold">
                    {language === 'id' ? 'Jabatan' : 'Role / Position'}
                  </label>
                  <input
                    type="text"
                    value={editingItem.role}
                    onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                    placeholder="e.g., VP of Product"
                    className="w-full px-3 py-2 bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-red)]/40 focus:border-[var(--k-red)] font-sans min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans text-[var(--k-text-secondary)] mb-1 font-semibold">
                    {language === 'id' ? 'Perusahaan' : 'Company'}
                  </label>
                  <input
                    type="text"
                    value={editingItem.company}
                    onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                    placeholder="e.g., Finova Global"
                    className="w-full px-3 py-2 bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-red)]/40 focus:border-[var(--k-red)] font-sans min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans text-[var(--k-text-secondary)] mb-1 font-semibold">
                  {language === 'id' ? 'Lokasi Klien' : 'Client Location'}
                </label>
                <input
                  type="text"
                  value={editingItem.location}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                  placeholder="e.g., Jakarta, Indonesia"
                  className="w-full px-3 py-2 bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-red)]/40 focus:border-[var(--k-red)] font-sans min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-[var(--k-text-secondary)] mb-1 font-semibold">
                  {language === 'id' ? 'Isi Kutipan Testimoni *' : 'Testimonial Quote *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.quoteId || editingItem.quote}
                  onChange={(e) => setEditingItem({ ...editingItem, quoteId: e.target.value, quote: e.target.value })}
                  placeholder={language === 'id' ? 'Ceritakan dampak positif atau kecepatan kerja sama dengan Kapitech...' : 'Share client feedback, impact, and delivery speed...'}
                  className="w-full px-3 py-2 bg-[var(--k-surface)] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-red)]/40 focus:border-[var(--k-red)] font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--k-surface)] text-[var(--k-text-secondary)] hover:text-white border border-[rgba(255,255,255,0.07)] text-xs font-sans min-h-[44px]"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--k-red)] text-white text-xs font-sans font-bold hover:bg-[var(--k-red)] transition-all shadow-md shadow-[var(--k-red)]/20 min-h-[44px]"
                >
                  {language === 'id' ? 'Simpan Testimoni' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminCmsTestimonials;
