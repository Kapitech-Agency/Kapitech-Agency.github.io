import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  ExternalLink, 
  Sparkles, 
  Image as ImageIcon, 
  Check, 
  X, 
  Layers, 
  TrendingUp, 
  Globe,
  UploadCloud,
  FileText,
  Eye,
  Sliders,
  Tag
} from 'lucide-react';
import { getCmsProjects, saveCmsProject, deleteCmsProject, resetCmsProjectsToDefault } from '../../lib/cmsStore';
import { ProjectItem } from '../../data/projectsData';
import { useLanguage } from '../../lib/LanguageContext';
import { useDragToScroll } from '../../lib/useDragToScroll';
import { CustomSelect } from '../../components/ui/CustomSelect';

export const AdminCmsProjects: React.FC = () => {
  const { language, t } = useLanguage();
  const galleryScrollRef = useDragToScroll<HTMLDivElement>();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPillar, setFilterPillar] = useState<'All' | 'Visual Experience' | 'Innovation Development'>('All');
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'details' | 'preview'>('details');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Tag inputs state
  const [techInput, setTechInput] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');
  const [metricLabel, setMetricLabel] = useState('');
  const [metricValue, setMetricValue] = useState('');

  const loadProjects = () => {
    setProjects(getCmsProjects());
  };

  useEffect(() => {
    loadProjects();
    const handleUpdate = () => loadProjects();
    window.addEventListener('kapitech_cms_updated', handleUpdate);
    return () => window.removeEventListener('kapitech_cms_updated', handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    const newTemplate: ProjectItem = {
      id: 'project-' + Date.now().toString(36),
      title: '',
      client: '',
      industry: 'FinTech / SaaS Enterprise',
      pillar: 'Innovation Development',
      service: 'Web Application',
      featured: false,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
      desc: '',
      descId: '',
      challenge: '',
      challengeId: '',
      solution: '',
      solutionId: '',
      deliverables: ['Full-Stack Architecture', 'Responsive UI/UX', 'Cloud Deployment'],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
      impact: [
        { label: 'Conversion Lift', value: '+40%' },
        { label: 'Latency', value: '< 200ms' }
      ],
      year: new Date().getFullYear().toString()
    };
    setEditingProject(newTemplate);
    setModalTab('details');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingProject({ ...project });
    setModalTab('details');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete case study "${title}" from CMS?`)) {
      deleteCmsProject(id);
      loadProjects();
      setStatusMessage('Case study deleted successfully.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleToggleFeatured = (project: ProjectItem) => {
    const updated = { ...project, featured: !project.featured };
    saveCmsProject(updated);
    loadProjects();
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported (PNG, JPG, WebP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && editingProject) {
        setEditingProject({
          ...editingProject,
          image: e.target.result as string
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAddTech = () => {
    if (!techInput.trim() || !editingProject) return;
    if (!editingProject.technologies.includes(techInput.trim())) {
      setEditingProject({
        ...editingProject,
        technologies: [...editingProject.technologies, techInput.trim()]
      });
    }
    setTechInput('');
  };

  const handleRemoveTech = (techToRemove: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      technologies: editingProject.technologies.filter(t => t !== techToRemove)
    });
  };

  const handleAddDeliverable = () => {
    if (!deliverableInput.trim() || !editingProject) return;
    if (!editingProject.deliverables.includes(deliverableInput.trim())) {
      setEditingProject({
        ...editingProject,
        deliverables: [...editingProject.deliverables, deliverableInput.trim()]
      });
    }
    setDeliverableInput('');
  };

  const handleRemoveDeliverable = (itemToRemove: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      deliverables: editingProject.deliverables.filter(d => d !== itemToRemove)
    });
  };

  const handleAddImpactMetric = () => {
    if (!metricLabel.trim() || !metricValue.trim() || !editingProject) return;
    const newImpact = [...(editingProject.impact || []), { label: metricLabel.trim(), value: metricValue.trim() }];
    setEditingProject({
      ...editingProject,
      impact: newImpact
    });
    setMetricLabel('');
    setMetricValue('');
  };

  const handleRemoveImpactMetric = (idx: number) => {
    if (!editingProject || !editingProject.impact) return;
    setEditingProject({
      ...editingProject,
      impact: editingProject.impact.filter((_, i) => i !== idx)
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title.trim()) {
      alert('Project title is required.');
      return;
    }

    saveCmsProject(editingProject);
    setIsModalOpen(false);
    setEditingProject(null);
    loadProjects();
    setStatusMessage('Case study published successfully to live site!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesPillar = filterPillar === 'All' || p.pillar === filterPillar;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.title.toLowerCase().includes(query) ||
      p.client.toLowerCase().includes(query) ||
      p.industry.toLowerCase().includes(query) ||
      p.service.toLowerCase().includes(query);
    return matchesPillar && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262930]">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <FolderKanban className="text-brand-red" size={24} />
            <span>{t('admin.nav.cmsProjects')}</span>
          </h1>
          <p className="text-xs text-[#8A909D] mt-1 font-mono">
            {language === 'id'
              ? 'Kelola showcase studi kasus dan portofolio agency untuk kapitech.id/work.'
              : 'Manage case studies, portfolio showcases, and technical deliverables at kapitech.id/work.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-red/20"
          >
            <Plus size={15} />
            <span>{language === 'id' ? 'Tambah Case Study' : 'Add Case Study'}</span>
          </button>
        </div>
      </div>

      {/* Success alert */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-300">
          <Check size={15} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A909D]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, client names, industries, tech stack..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#16181D] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red placeholder:text-[#5C626E] font-mono"
          />
        </div>

        <div>
          <CustomSelect
            value={filterPillar}
            onChange={(val) => setFilterPillar(val as any)}
            options={[
              { value: 'All', label: 'All Studio Pillars' },
              { value: 'Visual Experience', label: 'Visual Experience' },
              { value: 'Innovation Development', label: 'Innovation Development' }
            ]}
          />
        </div>
      </div>

      {/* Projects Grid with Drag-to-scroll support */}
      <div 
        ref={galleryScrollRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-[#16181D] border border-[#262930] hover:border-[#383C46] rounded-2xl overflow-hidden flex flex-col group transition-all"
          >
            {/* Image Thumbnail */}
            <div className="relative h-48 w-full bg-[#0E1013] overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16181D] via-transparent to-black/40" />

              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                  project.pillar === 'Visual Experience'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  {project.pillar}
                </span>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1">
                <button
                  onClick={() => handleToggleFeatured(project)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors backdrop-blur-sm ${
                    project.featured
                      ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                      : 'bg-black/50 text-[#8A909D] border-white/10 hover:text-white'
                  }`}
                  title={project.featured ? 'Status: Featured (Click to toggle)' : 'Click to feature'}
                >
                  <Star size={13} fill={project.featured ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-[11px] font-mono text-white/80">{project.client}</div>
                <div className="text-base font-bold font-display text-white truncate drop-shadow-md">
                  {project.title}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4 font-mono text-xs">
              <p className="text-[#8A909D] line-clamp-2 font-sans text-xs">
                {project.descId || project.desc || 'No case study summary entered.'}
              </p>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 4).map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B0C0E] border border-[#262930] text-[#8A909D]"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 4 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0B0C0E] border border-[#262930] text-[#5C626E]">
                    +{project.technologies.length - 4}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#262930] flex items-center justify-between">
                <div className="text-[10px] text-[#5C626E]">
                  Release {project.year || '2025'}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(project)}
                    className="p-1.5 rounded-lg bg-[#0B0C0E] hover:bg-[#222630] text-[#8A909D] hover:text-white border border-[#262930] transition-colors"
                    title="Edit Case Study"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    onClick={() => handleDelete(project.id, project.title)}
                    className="p-1.5 rounded-lg bg-[#0B0C0E] hover:bg-red-950/40 text-[#8A909D] hover:text-red-400 border border-[#262930] hover:border-red-500/30 transition-colors"
                    title="Delete Case Study"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT PROJECT WITH LIVE PREVIEW & DRAG & DROP */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#16181D] border border-[#262930] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl font-mono text-xs">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#262930] mb-6">
              <div className="flex items-center gap-3">
                <FolderKanban className="text-brand-red" size={20} />
                <h2 className="text-lg font-bold font-display text-white">
                  {editingProject.title ? `Edit: ${editingProject.title}` : 'Add New Case Study'}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Modal Tab Switcher */}
                <div className="flex items-center rounded-lg bg-[#0B0C0E] border border-[#262930] p-0.5">
                  <button
                    type="button"
                    onClick={() => setModalTab('details')}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      modalTab === 'details' ? 'bg-[#1E222A] text-white' : 'text-[#8A909D] hover:text-white'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      modalTab === 'preview' ? 'bg-[#1E222A] text-white' : 'text-[#8A909D] hover:text-white'
                    }`}
                  >
                    <Eye size={12} />
                    <span>Card Preview</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg bg-[#0B0C0E] hover:bg-[#20232B] text-[#8A909D] hover:text-white border border-[#262930]"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {modalTab === 'preview' ? (
              <div className="py-6 flex flex-col items-center">
                <div className="text-[11px] text-[#8A909D] mb-4">
                  Live Showcase Preview (as rendered on <code className="text-white">kapitech.id/work</code>):
                </div>
                <div className="w-full max-w-sm bg-[#111317] border border-[#262930] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative h-48 w-full bg-[#0E1013]">
                    <img src={editingProject.image} alt={editingProject.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111317] via-transparent to-black/40" />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {editingProject.pillar}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-[10px] text-white/80">{editingProject.client || 'Client Name'}</div>
                      <div className="text-base font-bold font-display text-white truncate">
                        {editingProject.title || 'Untitled Case Study'}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 font-mono text-xs">
                    <p className="text-[#8A909D] text-xs font-sans">
                      {editingProject.descId || editingProject.desc || 'No description entered.'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {editingProject.technologies.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#0B0C0E] border border-[#262930] text-[#8A909D]">
                          {t}
                        </span>
                      ))}
                    </div>
                    {editingProject.impact && editingProject.impact.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262930]">
                        {editingProject.impact.map((imp, idx) => (
                          <div key={idx} className="bg-[#0B0C0E] p-2 rounded-lg border border-[#262930]">
                            <div className="text-[9px] text-[#8A909D] uppercase">{imp.label}</div>
                            <div className="text-xs font-bold text-emerald-400">{imp.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveModal} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A909D] mb-1 font-semibold">Project Title *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      placeholder="e.g. Bank Digital Nusantara Mobile"
                      className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A909D] mb-1 font-semibold">Client Name / Company</label>
                    <input
                      type="text"
                      value={editingProject.client}
                      onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                      placeholder="PT Bank Digital Nusantara"
                      className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#8A909D] mb-1 font-semibold">Studio Pillar</label>
                    <select
                      value={editingProject.pillar}
                      onChange={(e) => setEditingProject({ ...editingProject, pillar: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-mono"
                    >
                      <option value="Visual Experience">Visual Experience</option>
                      <option value="Innovation Development">Innovation Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8A909D] mb-1 font-semibold">Service Category</label>
                    <input
                      type="text"
                      value={editingProject.service}
                      onChange={(e) => setEditingProject({ ...editingProject, service: e.target.value as any })}
                      placeholder="UI/UX Design, Web Application..."
                      className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A909D] mb-1 font-semibold">Release Year</label>
                    <input
                      type="text"
                      value={editingProject.year}
                      onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                      placeholder="2025"
                      className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-mono"
                    />
                  </div>
                </div>

                {/* Drag & Drop File Upload or URL */}
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">
                    Cover Image (Drag & Drop File or URL)
                  </label>
                  
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                      isDraggingFile 
                        ? 'border-brand-red bg-brand-red/10' 
                        : 'border-[#262930] bg-[#0B0C0E] hover:border-[#383C46]'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      {editingProject.image ? (
                        <div className="relative w-36 h-20 rounded-lg overflow-hidden border border-[#262930] mb-1">
                          <img src={editingProject.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <UploadCloud className="text-[#8A909D]" size={28} />
                      )}
                      
                      <div className="text-white">
                        <span>Drag & drop image here, or </span>
                        <label className="text-brand-red cursor-pointer hover:underline font-bold">
                          browse file
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-[#5C626E]">PNG, JPG, WebP up to 10MB</p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <input
                      type="url"
                      value={editingProject.image}
                      onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full px-3.5 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Short Executive Summary</label>
                  <textarea
                    rows={2}
                    value={editingProject.descId || editingProject.desc}
                    onChange={(e) => setEditingProject({ ...editingProject, descId: e.target.value, desc: e.target.value })}
                    placeholder="Brief description of the solution delivered for client..."
                    className="w-full px-3.5 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-sans text-xs"
                  />
                </div>

                {/* Tech Stack Chip Manager */}
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Tech Stack & Frameworks</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
                      placeholder="Type tech name and press Enter (e.g. Next.js 14, Tailwind, Go)..."
                      className="flex-1 px-3.5 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                    />
                    <button
                      type="button"
                      onClick={handleAddTech}
                      className="px-3.5 py-2 rounded-xl bg-[#0B0C0E] hover:bg-[#20232B] text-white border border-[#262930]"
                    >
                      Add Tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {editingProject.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B0C0E] border border-[#262930] text-[#D0D4DC] text-[11px]"
                      >
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="text-[#8A909D] hover:text-red-400"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Impact Metrics Editor */}
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Impact Metrics & Key Results</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={metricLabel}
                      onChange={(e) => setMetricLabel(e.target.value)}
                      placeholder="Metric label (e.g. Conversion Lift)"
                      className="flex-1 px-3.5 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                    />
                    <input
                      type="text"
                      value={metricValue}
                      onChange={(e) => setMetricValue(e.target.value)}
                      placeholder="Value (e.g. +40%)"
                      className="w-32 px-3.5 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                    />
                    <button
                      type="button"
                      onClick={handleAddImpactMetric}
                      className="px-3.5 py-2 rounded-xl bg-[#0B0C0E] hover:bg-[#20232B] text-white border border-[#262930]"
                    >
                      Add Metric
                    </button>
                  </div>
                  {editingProject.impact && editingProject.impact.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editingProject.impact.map((imp, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0C0E] border border-[#262930]">
                          <span className="text-[#8A909D]">{imp.label}:</span>
                          <span className="text-emerald-400 font-bold">{imp.value}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveImpactMetric(idx)}
                            className="text-[#8A909D] hover:text-red-400 ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#262930] flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProject.featured}
                      onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                      className="w-4 h-4 rounded bg-[#0B0C0E] border-[#262930] text-brand-red accent-brand-red"
                    />
                    <span className="text-white">Feature in Homepage Highlights</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-[#0B0C0E] text-[#8A909D] hover:text-white border border-[#262930]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-brand-red text-white font-bold hover:bg-brand-red/90 transition-all shadow-md shadow-brand-red/20"
                    >
                      Save Case Study
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
export default AdminCmsProjects;
