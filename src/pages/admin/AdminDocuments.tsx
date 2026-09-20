import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderOpen, 
  FileText, 
  UploadCloud, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  X,
  Loader2
} from 'lucide-react';
import { api } from '../../lib/apiClient';
import { useLanguage } from '../../lib/LanguageContext';

interface DocumentItem {
  id: string;
  name?: string;
  title?: string;
  category: string;
  type?: string;
  fileType?: string;
  size?: string | number;
  fileSize?: number;
  url?: string;
  owner?: string;
  uploadedBy?: string;
  uploadedDate?: string;
  uploadedAt?: string;
  relatedEntity?: string;
  relatedId?: string;
  tags?: string[];
}

export const AdminDocuments: React.FC = () => {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Contract');
  const [uploadFileType, setUploadFileType] = useState('PDF');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadRelatedType, setUploadRelatedType] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.documents.getAll();
      if (res.success && res.data?.documents) {
        setDocuments(res.data.documents);
      }
    } catch {
      showToast('Failed to load documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      showToast('Please specify a title.');
      return;
    }
    if (!/^https:\/\//i.test(uploadUrl.trim())) {
      showToast(language === 'id' ? 'Masukkan URL HTTPS dokumen yang valid.' : 'Enter a valid HTTPS document URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: uploadTitle,
        title: uploadTitle,
        category: uploadCategory,
        type: uploadFileType,
        size: '',
        relatedEntity: uploadRelatedType,
        url: uploadUrl.trim()
      };

      const res = await api.documents.create(payload);
      if (res.success && res.data?.document) {
        setDocuments(prev => [res.data.document, ...prev]);
        setIsUploadModalOpen(false);
        setUploadTitle('');
        setUploadUrl('');
        showToast(language === 'id' ? 'Dokumen berhasil diunggah ke brankas.' : 'Document added to the registry.');
      } else {
        showToast(res.error || 'Upload failed.');
      }
    } catch {
      showToast('Error uploading document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete document from vault?')) return;
    try {
      const res = await api.documents.delete(id);
      if (res.success) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        showToast('Document deleted.');
      }
    } catch {
      showToast('Failed to delete.');
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const cat = (d.category || '').toLowerCase();
      const matchesCategory = categoryFilter === 'all' || cat.includes(categoryFilter.toLowerCase());
      const title = (d.name || d.title || '').toLowerCase();
      const matchesSearch = title.includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [documents, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#181B22] border border-[#E50914]/40 text-white text-xs font-mono shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2.5">
            <FolderOpen className="text-[#FF1E27]" size={24} />
            <span>{language === 'id' ? 'Brankas Dokumen & Aset Agency' : 'Documents & Asset Vault'}</span>
          </h1>
          <p className="text-xs font-mono text-[#8A94A6] mt-1">
            {language === 'id' 
              ? 'Arsip kontrak digital, NDA, proposal komersial, berkas kepatuhan pajak, dan deliverable proyek.' 
              : 'Digital contract repository, NDAs, commercial proposals, tax compliance, and project assets.'}
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-sans font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.3)] transition-all shrink-0"
        >
          <Plus size={15} />
          <span>{language === 'id' ? 'Unggah Dokumen' : 'Upload Document'}</span>
        </button>
      </div>

      {/* Category Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['contract', 'proposal', 'invoice', 'deliverable', 'compliance'] as const).map((cat) => {
          const count = documents.filter(d => (d.category || '').toLowerCase().includes(cat)).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
              className={`p-3 rounded-xl border text-left transition-all ${
                categoryFilter === cat
                  ? 'bg-[#E50914]/10 border-[#E50914]/40 text-white'
                  : 'bg-[#111318] border-white/[0.07] text-[#8A94A6] hover:text-white hover:border-white/20'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider capitalize">{cat}</div>
              <div className="text-lg font-bold font-mono text-white mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#111318] border border-white/[0.07]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari judul file, tag, atau nomor kontrak...' : 'Search document title or references...'}
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#181B22] text-white placeholder-[#8A94A6] rounded-lg border border-white/[0.07] focus:outline-none focus:border-[#E50914] font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-800 text-zinc-300 flex items-center gap-1 hover:text-white"
            >
              <span>Reset filter ({categoryFilter})</span>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="rounded-xl bg-[#111318] border border-white/[0.07] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-[#8A94A6] flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-[#FF1E27]" size={20} />
            <span>Loading document vault...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#8A94A6]">
            {language === 'id' ? 'Belum ada dokumen di registri.' : 'No documents found in the registry.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[#181B22]/50 text-[10px] font-mono text-[#8A94A6] uppercase">
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs font-sans text-[#F8FAFC]">
                {filteredDocs.map((doc) => {
                  const docTitle = doc.name || doc.title || 'Untitled Document';
                  const docDate = doc.uploadedDate || (doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent');
                  const docOwner = doc.owner || doc.uploadedBy || 'Kapitech System';
                  const docType = doc.type || doc.fileType || 'PDF';
                  const docSize = doc.size ? String(doc.size) : '1.5 MB';

                  return (
                    <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#181B22] border border-white/[0.07] flex items-center justify-center text-[#FF1E27] shrink-0">
                            <FileText size={14} />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{docTitle}</div>
                            <div className="text-[10px] font-mono text-[#8A94A6]">{docType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#181B22] text-[#8A94A6] border border-white/[0.07]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#8A94A6]">
                        {docSize}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-300">
                        {doc.relatedEntity || 'General'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#8A94A6]">
                        <div>{docDate}</div>
                        <div className="text-[9px] text-[#8A94A6]/70">by {docOwner}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {doc.url ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={language === 'id' ? 'Buka dokumen' : 'Open document'}
                              className="p-1.5 rounded hover:bg-white/[0.06] text-[#8A94A6] hover:text-white transition-colors"
                            >
                              <Download size={14} />
                            </a>
                          ) : (
                            <span title={language === 'id' ? 'Tidak ada URL dokumen' : 'No document URL'} className="p-1.5 text-[#475569]">
                              <Download size={14} />
                            </span>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            title="Delete"
                            className="p-1.5 rounded hover:bg-red-500/10 text-[#8A94A6] hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-white/[0.07] rounded-2xl w-full max-w-md shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="p-4 border-b border-white/[0.07] flex items-center justify-between bg-[#181B22]">
              <h3 className="text-sm font-bold font-sans text-white flex items-center gap-2">
                <UploadCloud size={16} className="text-[#FF1E27]" />
                <span>Add Document to Registry</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-[#8A94A6] hover:text-white rounded-lg hover:bg-white/[0.06]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#8A94A6]">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Master Services Agreement 2026"
                  className="w-full h-8 px-3 rounded-lg bg-[#181B22] text-white border border-white/[0.07] focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#8A94A6]">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-[#181B22] text-white border border-white/[0.07] focus:outline-none text-xs font-mono"
                  >
                    <option value="Contract">Contract</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Deliverable">Deliverable</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#8A94A6]">Related Entity</label>
                  <select
                    value={uploadRelatedType}
                    onChange={(e) => setUploadRelatedType(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-[#181B22] text-white border border-white/[0.07] focus:outline-none text-xs font-mono"
                  >
                    <option value="General">General</option>
                    <option value="Client">Client</option>
                    <option value="Deal">Deal</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#8A94A6]">{language === 'id' ? 'URL Dokumen (HTTPS) *' : 'Document URL (HTTPS) *'}</label>
                <input
                  type="url"
                  required
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-9 px-3 rounded-lg bg-[#181B22] text-white border border-white/[0.07] focus:outline-none focus:border-[#E50914]"
                />
                <p className="text-[10px] text-[#64748B] font-mono">
                  {language === 'id' ? 'AMS saat ini menyimpan metadata dan tautan HTTPS terkontrol. File privat belum diunggah ke object storage internal.' : 'AMS currently stores metadata and controlled HTTPS links. Private files are not uploaded to internal object storage yet.'}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.07] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-sans font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />}
                  <span>{language === 'id' ? 'Simpan ke Registri' : 'Save to Registry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
