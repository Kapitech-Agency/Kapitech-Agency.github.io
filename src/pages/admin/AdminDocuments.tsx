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
import { hasAdminPermission } from '../../lib/adminAuth';

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
  downloadUrl?: string;
  mimeType?: string;
  status?: 'pending_upload' | 'ready' | 'external_link';
  sourceType?: 'private_file' | 'external_link';
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
  const canManageDocuments =
    hasAdminPermission('canManageProjects') ||
    hasAdminPermission('canManageCrm') ||
    hasAdminPermission('canAccessServerAndApi');
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
  const [uploadFile, setUploadFile] = useState<File | null>(null);
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

  const allowedDocumentTypes = '.pdf,.png,.jpg,.jpeg,.webp,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip';

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageDocuments) return;
    if (!uploadTitle.trim()) {
      showToast('Please specify a title.');
      return;
    }
    if (!uploadFile) {
      showToast(language === 'id' ? 'Pilih file dokumen terlebih dahulu.' : 'Select a document file first.');
      return;
    }
    if (uploadFile.size <= 0 || uploadFile.size > 25 * 1024 * 1024) {
      showToast(language === 'id' ? 'Ukuran file harus antara 1 byte dan 25 MB.' : 'File size must be between 1 byte and 25 MB.');
      return;
    }

    setIsSubmitting(true);
    let documentId = '';
    try {
      const payload = {
        name: uploadTitle,
        title: uploadTitle,
        category: uploadCategory,
        type: (uploadFile.name.split('.').pop() || uploadFileType).toUpperCase().slice(0, 40),
        mimeType: uploadFile.type || 'application/octet-stream',
        size: (uploadFile.size / (1024 * 1024)).toFixed(1) + ' MB',
        sizeBytes: uploadFile.size,
        relatedEntity: uploadRelatedType
      };

      const created = await api.documents.create(payload);
      if (!created.success || !created.data?.document) {
        showToast(created.error || 'Upload failed.');
        return;
      }

      documentId = created.data.document.id;
      const uploaded = await api.documents.uploadContent(documentId, uploadFile);
      if (!uploaded.success || !uploaded.data?.document) {
        await api.documents.delete(documentId);
        showToast(uploaded.error || (language === 'id' ? 'File gagal disimpan ke vault.' : 'File could not be stored in the vault.'));
        return;
      }

      setDocuments(prev => [uploaded.data.document, ...prev]);
      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadFile(null);
      showToast(language === 'id' ? 'Dokumen tersimpan di private vault.' : 'Document securely stored in the private vault.');
    } catch {
      if (documentId) await api.documents.delete(documentId).catch(() => {});
      showToast(language === 'id' ? 'Terjadi kesalahan saat mengunggah dokumen.' : 'Error uploading document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManageDocuments) return;
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
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[var(--k-surface)] border border-[var(--k-red)]/40 text-white text-xs font-sans shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--k-red)] animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2.5">
            <FolderOpen className="text-[var(--k-red)]" size={24} />
            <span>{language === 'id' ? 'Brankas Dokumen & Aset Agency' : 'Documents & Asset Vault'}</span>
          </h1>
          <p className="text-xs font-sans text-[var(--k-text-secondary)] mt-1">
            {language === 'id' 
              ? 'Arsip kontrak digital, NDA, proposal komersial, berkas kepatuhan pajak, dan deliverable proyek.' 
              : 'Digital contract repository, NDAs, commercial proposals, tax compliance, and project assets.'}
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[var(--k-red)] hover:bg-[var(--k-red)] text-white text-xs font-sans font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.3)] transition-all shrink-0"
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
                  ? 'bg-[var(--k-red)]/10 border-[var(--k-red)]/40 text-white'
                  : 'bg-[var(--k-bg)] border-white/[0.07] text-[var(--k-text-secondary)] hover:text-white hover:border-white/20'
              }`}
            >
              <div className="text-[10px] font-sans uppercase tracking-wider capitalize">{cat}</div>
              <div className="text-lg font-bold font-sans text-white mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--k-bg)] border border-white/[0.07]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--k-text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari judul file, tag, atau nomor kontrak...' : 'Search document title or references...'}
            className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--k-surface)] text-white placeholder-[var(--k-text-secondary)] rounded-lg border border-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-red)]/40 focus:border-[var(--k-red)] font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="px-2.5 py-1 rounded-lg text-xs font-sans bg-zinc-800 text-zinc-300 flex items-center gap-1 hover:text-white"
            >
              <span>Reset filter ({categoryFilter})</span>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="rounded-xl bg-[var(--k-bg)] border border-white/[0.07] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-sans text-[var(--k-text-secondary)] flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-[var(--k-red)]" size={20} />
            <span>Loading document vault...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-xs font-sans text-[var(--k-text-secondary)]">
            {language === 'id' ? 'Belum ada dokumen di registri.' : 'No documents found in the registry.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[var(--k-surface)]/50 text-[10px] font-sans text-[var(--k-text-secondary)] uppercase">
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
                          <div className="w-7 h-7 rounded-lg bg-[var(--k-surface)] border border-white/[0.07] flex items-center justify-center text-[var(--k-red)] shrink-0">
                            <FileText size={14} />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{docTitle}</div>
                            <div className="text-[10px] font-sans text-[var(--k-text-secondary)]">{docType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-sans uppercase bg-[var(--k-surface)] text-[var(--k-text-secondary)] border border-white/[0.07]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-[11px] text-[var(--k-text-secondary)]">
                        {docSize}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-[11px] text-zinc-300">
                        {doc.relatedEntity || 'General'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={'px-2 py-0.5 rounded text-[10px] font-sans uppercase border ' + (
                          doc.status === 'ready' || doc.sourceType === 'external_link'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        )}>
                          {doc.status === 'ready' || doc.sourceType === 'external_link' ? 'ready' : 'pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-[11px] text-[var(--k-text-secondary)]">
                        <div>{docDate}</div>
                        <div className="text-[9px] text-[var(--k-text-secondary)]/70">by {docOwner}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(doc.downloadUrl || doc.url) ? (
                            <a
                              href={doc.downloadUrl || doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={language === 'id' ? 'Buka dokumen' : 'Open document'}
                              className="p-1.5 rounded hover:bg-white/[0.06] text-[var(--k-text-secondary)] hover:text-white transition-colors"
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
                            className="p-1.5 rounded hover:bg-red-500/10 text-[var(--k-text-secondary)] hover:text-red-400 transition-colors"
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
          <div className="bg-[var(--k-bg)] border border-white/[0.07] rounded-2xl w-full max-w-md shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="p-4 border-b border-white/[0.07] flex items-center justify-between bg-[var(--k-surface)]">
              <h3 className="text-sm font-bold font-sans text-white flex items-center gap-2">
                <UploadCloud size={16} className="text-[var(--k-red)]" />
                <span>Add Document to Registry</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-[var(--k-text-secondary)] hover:text-white rounded-lg hover:bg-white/[0.06]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[11px] font-sans text-[var(--k-text-secondary)]">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Master Services Agreement 2026"
                  className="w-full h-8 px-3 rounded-lg bg-[var(--k-surface)] text-white border border-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-red)]/40 focus:border-[var(--k-red)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-sans text-[var(--k-text-secondary)]">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-[var(--k-surface)] text-white border border-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-red)]/40 text-xs font-sans"
                  >
                    <option value="Contract">Contract</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Deliverable">Deliverable</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-sans text-[var(--k-text-secondary)]">Related Entity</label>
                  <select
                    value={uploadRelatedType}
                    onChange={(e) => setUploadRelatedType(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-[var(--k-surface)] text-white border border-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-red)]/40 text-xs font-sans"
                  >
                    <option value="General">General</option>
                    <option value="Client">Client</option>
                    <option value="Deal">Deal</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-sans text-[var(--k-text-secondary)]">{language === 'id' ? 'File Dokumen *' : 'Document File *'}</label>
                <input
                  type="file"
                  required
                  accept={allowedDocumentTypes}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full h-10 px-2 py-2 rounded-lg bg-[var(--k-surface)] text-white border border-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-red)]/40 focus:border-[var(--k-red)] text-[11px]"
                />
                <p className="text-[10px] text-[var(--k-text-tertiary)] font-sans">
                  {language === 'id'
                    ? 'File disimpan di server-side private vault, di luar static web root. Maksimal 25 MB. Akses selalu melalui session + RBAC.'
                    : 'Files are stored in a server-side private vault outside the static web root. Max 25 MB. Access requires session + RBAC.'}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.07] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--k-surface)] hover:bg-[var(--k-surface-raised)] text-[var(--k-text-secondary)] text-xs font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[var(--k-red)] hover:bg-[var(--k-red)] text-white text-xs font-sans font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />}
                  <span>{language === 'id' ? 'Simpan ke Private Vault' : 'Store in Private Vault'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
