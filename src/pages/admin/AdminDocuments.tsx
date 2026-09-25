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
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Modal } from '../../components/ui/Modal';

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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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
    setDeleteTarget(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      const res = await api.documents.delete(id);
      if (res.success) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        showToast('Document deleted.');
      }
    } catch {
      showToast('Failed to delete.');
    } finally {
      setDeleteTarget(null);
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
        <div className="fixed top-16 left-3 right-3 sm:left-auto sm:top-20 sm:right-6 z-50 px-4 py-2.5 rounded-card bg-[var(--panel)] border border-[var(--line)] text-[var(--text)] text-xs font-sans shadow-none flex items-center gap-2">
          <span className="w-2 h-2 rounded-badge bg-[var(--accent)]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="ams-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
        <div>
          <h1 className="ams-page-title flex items-center gap-2.5">
            <FolderOpen className="text-[var(--accent)]" size={24} />
            <span>{language === 'id' ? 'Brankas Dokumen & Aset Agency' : 'Documents & Asset Vault'}</span>
          </h1>
          <p className="text-xs font-sans text-[var(--muted)] mt-1">
            {language === 'id' 
              ? 'Arsip kontrak digital, NDA, proposal komersial, berkas kepatuhan pajak, dan deliverable proyek.' 
              : 'Digital contract repository, NDAs, commercial proposals, tax compliance, and project assets.'}
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="min-h-10 px-3 rounded-control bg-[var(--accent)] hover:brightness-110 text-white text-xs font-sans font-medium flex items-center justify-center gap-2 transition-colors shrink-0"
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
              className={`min-h-10 p-3 rounded-card border text-left transition-colors ${
                categoryFilter === cat
                  ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--text)]'
                  : 'bg-[var(--panel)] border-[var(--line)] text-[var(--muted)] hover:text-white hover:border-[var(--line)]'
              }`}
            >
              <div className="text-xs font-sans normal-case tracking-normal capitalize">{cat}</div>
              <div className="text-lg font-semibold font-sans text-[var(--text)] mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-card bg-[var(--panel)] border border-[var(--line)]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari judul file, tag, atau nomor kontrak...' : 'Search document title or references...'}
            className="w-full min-h-10 sm:h-9 pl-8 pr-3 text-xs bg-[var(--panel)] text-[var(--text)] placeholder-[var(--muted)] rounded-control border border-[var(--line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 focus:border-[var(--accent)] font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="px-2.5 py-1 min-h-10 px-3 rounded-control text-xs font-sans bg-[var(--panel)] border border-[var(--line)] text-[var(--text)] flex items-center gap-1 hover:text-[var(--text)]"
            >
              <span>Reset filter ({categoryFilter})</span>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="rounded-card bg-[var(--panel)] border border-[var(--line)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-sans text-[var(--muted)] flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-[var(--accent)]" size={20} />
            <span>Loading document vault...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-xs font-sans text-[var(--muted)]">
            {language === 'id' ? 'Belum ada dokumen di registri.' : 'No documents found in the registry.'}
          </div>
        ) : (
          <div className="ams-table-scroll overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--panel)]/50 text-xs font-sans text-[var(--muted)] normal-case">
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-xs font-sans text-[var(--text)]">
                {filteredDocs.map((doc) => {
                  const docTitle = doc.name || doc.title || 'Untitled Document';
                  const docDate = doc.uploadedDate || (doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent');
                  const docOwner = doc.owner || doc.uploadedBy || 'Kapitech System';
                  const docType = doc.type || doc.fileType || 'PDF';
                  const docSize = doc.size ? String(doc.size) : '1.5 MB';

                  return (
                    <tr key={doc.id} className="hover:bg-[var(--panel-hover)] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-control bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)] shrink-0">
                            <FileText size={14} />
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text)]">{docTitle}</div>
                            <div className="text-xs font-sans text-[var(--muted)]">{docType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-badge text-xs font-sans normal-case bg-[var(--panel)] text-[var(--muted)] border border-[var(--line)]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-xs text-[var(--muted)]">
                        {docSize}
                      </td>
                      <td className="py-3 px-4 font-sans text-xs text-[var(--text)]">
                        {doc.relatedEntity || 'General'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={'px-2 py-0.5 rounded text-xs font-sans normal-case border ' + (
                          doc.status === 'ready' || doc.sourceType === 'external_link'
                            ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20'
                            : 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20'
                        )}>
                          {doc.status === 'ready' || doc.sourceType === 'external_link' ? 'ready' : 'pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-xs text-[var(--muted)]">
                        <div>{docDate}</div>
                        <div className="text-xs text-[var(--muted)]/70">by {docOwner}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(doc.downloadUrl || doc.url) ? (
                            <a
                              href={doc.downloadUrl || doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={language === 'id' ? 'Buka dokumen' : 'Open document'}
                              className="min-h-10 min-w-10 p-2 rounded-control hover:bg-[var(--panel-hover)] text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center justify-center"
                            >
                              <Download size={14} />
                            </a>
                          ) : (
                            <span title={language === 'id' ? 'Tidak ada URL dokumen' : 'No document URL'} className="p-1.5 text-[var(--muted)]">
                              <Download size={14} />
                            </span>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            title="Delete"
                            className="min-h-10 min-w-10 rounded-control hover:bg-[var(--danger)]/10 text-[var(--muted)] hover:text-[var(--danger)] transition-colors flex items-center justify-center"
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

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm" title={language === 'id' ? 'Hapus dokumen?' : 'Delete document?'} description={language === 'id' ? 'Dokumen akan dihapus dari private vault dan tindakan ini tidak dapat dibatalkan.' : 'The document will be removed from the private vault and this action cannot be undone.'}>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button type="button" onClick={() => setDeleteTarget(null)} className="min-h-10 px-4 rounded-control border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--muted)]">Cancel</button>
          <button type="button" onClick={() => deleteTarget && void confirmDelete(deleteTarget)} className="min-h-10 px-4 rounded-control bg-[var(--danger)] text-white text-xs font-semibold">Delete permanently</button>
        </div>
      </Modal>

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85  flex items-center justify-center p-4">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card w-full max-w-md max-h-[calc(100dvh-24px)] overflow-y-auto shadow-none">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--panel)]">
              <h3 className="text-sm font-semibold font-sans text-[var(--text)] flex items-center gap-2">
                <UploadCloud size={16} className="text-[var(--accent)]" />
                <span>Add Document to Registry</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="min-h-10 min-w-10 p-2 text-[var(--muted)] hover:text-[var(--text)] rounded-control hover:bg-[var(--panel-hover)] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-4 space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-xs font-sans text-[var(--muted)]">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Master Services Agreement 2026"
                  className="w-full min-h-10 sm:h-9 px-3 rounded-control bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-sans text-[var(--muted)]">Category</label>
                  <CustomSelect value={uploadCategory} onChange={setUploadCategory} options={['Contract','Proposal','Invoice','Deliverable','Compliance'].map(value => ({value,label:value}))} className="w-full" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-sans text-[var(--muted)]">Related Entity</label>
                  <CustomSelect value={uploadRelatedType} onChange={setUploadRelatedType} options={['General','Client','Deal','Project'].map(value => ({value,label:value}))} className="w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-[var(--muted)]">{language === 'id' ? 'File Dokumen *' : 'Document File *'}</label>
                <input
                  type="file"
                  required
                  accept={allowedDocumentTypes}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full h-10 px-2 py-2 rounded-control bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 focus:border-[var(--accent)] text-xs"
                />
                <p className="text-xs text-[var(--muted)] font-sans">
                  {language === 'id'
                    ? 'File disimpan di server-side private vault, di luar static web root. Maksimal 25 MB. Akses selalu melalui session + RBAC.'
                    : 'Files are stored in a server-side private vault outside the static web root. Max 25 MB. Access requires session + RBAC.'}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="min-h-10 px-4 py-2 rounded-control bg-[var(--panel)] hover:bg-[var(--panel-hover)] border border-[var(--line)] text-[var(--muted)] text-xs font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-10 px-4 py-2 rounded-control bg-[var(--accent)] hover:brightness-110 text-white text-xs font-sans font-medium disabled:opacity-50 flex items-center gap-1.5"
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
