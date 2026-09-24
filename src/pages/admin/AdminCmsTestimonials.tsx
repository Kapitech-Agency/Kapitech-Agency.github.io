import React, { useState, useEffect } from 'react';
import { Quote, Plus, Star, Edit3, Trash2, Check, UserCheck, MessageSquare, Building2, MapPin } from 'lucide-react';
import { TestimonialItem } from '../../lib/cmsStore';
import { api } from '../../lib/apiClient';
import { useLanguage } from '../../lib/LanguageContext';

export const AdminCmsTestimonials: React.FC = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    const res = await api.cms.getTestimonials();
    if (res.success && Array.isArray(res.data?.testimonials)) setTestimonials(res.data.testimonials as TestimonialItem[]);
  };

  useEffect(() => {
    void loadData();
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
      const res = await api.cms.deleteTestimonial(id);
      if (!res.success) { setStatusMessage(res.error || 'Delete failed.'); return; }
      await loadData();
      setStatusMessage('Testimoni berhasil dihapus.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.author.trim() || (!editingItem.quoteId && !editingItem.quote)) {
      alert('Nama author dan isi kutipan testimoni wajib diisi.');
      return;
    }

    const exists = testimonials.some(item => item.id === editingItem.id);
    const res = exists ? await api.cms.updateTestimonial(editingItem.id, editingItem) : await api.cms.createTestimonial(editingItem);
    if (!res.success) { setStatusMessage(res.error || 'Failed to save testimonial.'); return; }
    setIsModalOpen(false);
    setEditingItem(null);
    await loadData();
    setStatusMessage('Testimoni berhasil disimpan ke database CMS!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <h1 className="ams-page-title">
            <Quote className="text-[var(--danger)]" size={24} />
            <span>CMS: Client Testimonials & Social Proof</span>
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 font-sans">
            {language === 'id' 
              ? 'Kelola ulasan klien, feedback kepuasan, dan rekomendasi eksekutif yang tampil di homepage.'
              : 'Manage client reviews, enterprise feedback, and executive recommendations on the homepage.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="min-h-10 px-3 rounded-control bg-[var(--accent)] hover:bg-[var(--accent-text)] text-white text-xs font-sans font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={14} />
          <span>{language === 'id' ? 'Tambah Testimoni' : 'Add Testimonial'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-control bg-[var(--success)]/10 border border-[var(--success)]/25 text-[var(--success)] text-xs font-sans flex items-center gap-2">
          <Check size={14} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="bg-[var(--panel)] border border-[var(--line)] rounded-card p-4 flex flex-col justify-between hover:border-[var(--line)] transition-all"
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

            <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-[var(--text)]">{item.author}</div>
                <div className="text-xs font-sans text-[var(--muted)]">
                  {item.role}, <span className="text-white">{item.company}</span>
                </div>
                <div className="text-[11px] font-sans text-[var(--muted)] mt-0.5 flex items-center gap-1">
                  <MapPin size={10} />
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="min-h-10 min-w-10 rounded-control bg-[var(--panel)] hover:bg-[var(--panel-hover)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] transition-colors flex items-center justify-center"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.author)}
                  className="min-h-10 min-w-10 rounded-control bg-[var(--panel)] hover:bg-[var(--danger)]/10 text-[var(--muted)] hover:text-[var(--danger)] border border-[var(--line)] hover:border-[var(--danger)]/30 transition-colors flex items-center justify-center"
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
        <div className="fixed inset-0 bg-black/80  z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card max-w-lg w-full p-4 sm:p-5 shadow-none">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-5">
              <h2 className="text-base font-semibold font-sans text-[var(--text)]">
                {editingItem.author ? `Edit: ${editingItem.author}` : (language === 'id' ? 'Tambah Testimoni Klien' : 'Add Client Testimonial')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--muted)] hover:text-white text-xs font-sans">
                ✕ {language === 'id' ? 'Tutup' : 'Close'}
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-sans text-[var(--muted)] mb-1 font-semibold">
                  {language === 'id' ? 'Nama Klien / Eksekutif *' : 'Client / Executive Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.author}
                  onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                  placeholder="e.g., Marcus Thorne"
                  className="w-full ams-control w-full text-xs text-[var(--text)] font-sans min-h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans text-[var(--muted)] mb-1 font-semibold">
                    {language === 'id' ? 'Jabatan' : 'Role / Position'}
                  </label>
                  <input
                    type="text"
                    value={editingItem.role}
                    onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                    placeholder="e.g., VP of Product"
                    className="w-full ams-control w-full text-xs text-[var(--text)] font-sans min-h-10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans text-[var(--muted)] mb-1 font-semibold">
                    {language === 'id' ? 'Perusahaan' : 'Company'}
                  </label>
                  <input
                    type="text"
                    value={editingItem.company}
                    onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                    placeholder="e.g., Finova Global"
                    className="w-full ams-control w-full text-xs text-[var(--text)] font-sans min-h-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans text-[var(--muted)] mb-1 font-semibold">
                  {language === 'id' ? 'Lokasi Klien' : 'Client Location'}
                </label>
                <input
                  type="text"
                  value={editingItem.location}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                  placeholder="e.g., Jakarta, Indonesia"
                  className="w-full ams-control w-full text-xs text-[var(--text)] font-sans min-h-10"
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-[var(--muted)] mb-1 font-semibold">
                  {language === 'id' ? 'Isi Kutipan Testimoni *' : 'Testimonial Quote *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.quoteId || editingItem.quote}
                  onChange={(e) => setEditingItem({ ...editingItem, quoteId: e.target.value, quote: e.target.value })}
                  placeholder={language === 'id' ? 'Ceritakan dampak positif atau kecepatan kerja sama dengan Kapitech...' : 'Share client feedback, impact, and delivery speed...'}
                  className="w-full ams-control w-full text-xs text-[var(--text)] font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-10 px-3 rounded-control bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] text-xs font-sans"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="min-h-10 px-3 rounded-control bg-[var(--accent)] text-white text-xs font-sans font-medium hover:bg-[var(--accent-text)] transition-colors"
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
