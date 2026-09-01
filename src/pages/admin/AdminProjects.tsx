import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Users,
  Code,
  ExternalLink,
  ChevronRight,
  Sparkles,
  GitBranch,
  Check,
  X,
  Trash2,
  Edit3,
  ListTodo,
  TrendingUp,
  GripVertical,
  CheckSquare,
  Square,
  Tag,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Folder
} from 'lucide-react';
import {
  AgencyProject,
  ProjectTask,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  TaskSubtask,
  getAgencyProjects,
  saveAgencyProject,
  deleteAgencyProject,
  updateTaskStatus,
  PROJECT_EVENT_NAME
} from '../../lib/projectStore';
import { formatAmount, getActiveCurrency, CURRENCY_EVENT, CurrencyCode } from '../../lib/currency';
import { useLanguage } from '../../lib/LanguageContext';
import { useDragToScroll } from '../../lib/useDragToScroll';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { getAdminSession } from '../../lib/adminAuth';

const TASK_COLUMNS: { id: TaskStatus; label: string; dotColor: string; bgAccent: string }[] = [
  { id: 'todo', label: 'To Do', dotColor: 'bg-zinc-400', bgAccent: 'group-hover:border-zinc-500/30' },
  { id: 'in_progress', label: 'In Progress', dotColor: 'bg-red-400', bgAccent: 'group-hover:border-red-500/30' },
  { id: 'review', label: 'Review & QA', dotColor: 'bg-amber-400', bgAccent: 'group-hover:border-amber-500/30' },
  { id: 'done', label: 'Done', dotColor: 'bg-emerald-400', bgAccent: 'group-hover:border-emerald-500/30' }
];

export const AdminProjects: React.FC = () => {
  const { t, language } = useLanguage();
  const session = getAdminSession();
  const userRole = session?.user?.role || 'Tier 1: Top Management / Sponsor';
  const canManageProjects = userRole.startsWith('Tier 1') || userRole.startsWith('Tier 2');
  const canDeleteProjects = userRole.startsWith('Tier 1');

  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());
  const [projects, setProjects] = useState<AgencyProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Drag-to-scroll hook for horizontal container
  const kanbanScrollRef = useDragToScroll<HTMLDivElement>();

  // Drag and Drop State for Tasks
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<TaskStatus | null>(null);

  // Contextual Task Drawer
  const [activeTaskDrawer, setActiveTaskDrawer] = useState<ProjectTask | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Project Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AgencyProject | null>(null);

  // Project Form State
  const [projName, setProjName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Web Development');
  const [budget, setBudget] = useState<number>(65000000);
  const [progressPercent, setProgressPercent] = useState<number>(30);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [techStackInput, setTechStackInput] = useState('Next.js, TypeScript, Tailwind CSS, Node.js');
  const [repoUrl, setRepoUrl] = useState('');
  const [stagingUrl, setStagingUrl] = useState('');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('in_progress');

  // Task Creation Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskAssignee, setTaskAssignee] = useState('Senior Frontend Dev');
  const [taskDueDate, setTaskDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo');
  const [initialSubtasksInput, setInitialSubtasksInput] = useState('');

  const loadData = () => {
    const list = getAgencyProjects();
    setProjects(list);
    if (list.length > 0 && (!selectedProjectId || !list.some(p => p.id === selectedProjectId))) {
      setSelectedProjectId(list[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener(PROJECT_EVENT_NAME, handleUpdate);

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail?.currency || getActiveCurrency());
    };
    window.addEventListener(CURRENCY_EVENT, handleCurrencyChange);

    return () => {
      window.removeEventListener(PROJECT_EVENT_NAME, handleUpdate);
      window.removeEventListener(CURRENCY_EVENT, handleCurrencyChange);
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Keep active drawer in sync with updated project state
  useEffect(() => {
    if (activeTaskDrawer && selectedProject) {
      const updated = selectedProject.tasks.find(t => t.id === activeTaskDrawer.id);
      if (updated) {
        setActiveTaskDrawer(updated);
      }
    }
  }, [selectedProject]);

  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjName('');
    setClientName('');
    setClientCompany('');
    setClientEmail('');
    setServiceCategory('Web Development');
    setBudget(50000000);
    setProgressPercent(10);
    setStartDate(new Date().toISOString().split('T')[0]);
    setTargetEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setTechStackInput('React, TypeScript, Tailwind CSS');
    setRepoUrl('');
    setStagingUrl('https://staging.app.kapitech.id');
    setProjStatus('in_progress');
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj: AgencyProject) => {
    setEditingProject(proj);
    setProjName(proj.name);
    setClientName(proj.clientName);
    setClientCompany(proj.clientCompany);
    setClientEmail(proj.clientEmail);
    setServiceCategory(proj.serviceCategory);
    setBudget(proj.budget);
    setProgressPercent(proj.progressPercent);
    setStartDate(proj.startDate);
    setTargetEndDate(proj.targetEndDate);
    setTechStackInput(proj.techStack.join(', '));
    setRepoUrl(proj.repositoryUrl || '');
    setStagingUrl(proj.liveStagingUrl || '');
    setProjStatus(proj.status);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !clientCompany.trim()) {
      alert('Project Title and Client Company are required.');
      return;
    }

    const techArr = techStackInput.split(',').map(s => s.trim()).filter(Boolean);

    const projectData: AgencyProject = {
      id: editingProject?.id || 'proj_' + Date.now().toString(36),
      name: projName,
      clientName: clientName || 'Client PIC',
      clientCompany,
      clientEmail,
      serviceCategory,
      status: projStatus,
      budget: Number(budget) || 0,
      progressPercent: Number(progressPercent) || 0,
      startDate,
      targetEndDate,
      teamLead: editingProject?.teamLead || 'Principal Tech Lead',
      teamMembers: editingProject?.teamMembers || ['Lead Frontend', 'UI Designer', 'QA Specialist'],
      techStack: techArr,
      repositoryUrl: repoUrl,
      liveStagingUrl: stagingUrl || 'https://staging.app.kapitech.id',
      milestones: editingProject?.milestones || [
        { id: 'm_' + Date.now(), title: 'Sprint 1: Architecture & UI Spec', dueDate: startDate, completed: true },
        { id: 'm_' + (Date.now() + 1), title: 'Sprint 2: Core Engineering', dueDate: targetEndDate, completed: false }
      ],
      tasks: editingProject?.tasks || [],
      createdAt: editingProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveAgencyProject(projectData);
    setSelectedProjectId(projectData.id);
    setIsProjectModalOpen(false);
    showToast(language === 'id' ? 'Proyek berhasil disimpan.' : 'Project successfully saved.');
  };

  const handleDeleteProject = (id: string, name: string) => {
    if (window.confirm(`Hapus proyek "${name}" beserta seluruh task board?`)) {
      deleteAgencyProject(id);
      showToast(language === 'id' ? 'Proyek dihapus.' : 'Project deleted.');
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !taskTitle.trim()) return;

    const subtasksList: TaskSubtask[] = initialSubtasksInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map((title, i) => ({
        id: 'st_' + Date.now() + '_' + i,
        title,
        completed: false
      }));

    const newTask: ProjectTask = {
      id: 't_' + Date.now().toString(36),
      title: taskTitle,
      description: taskDesc,
      status: taskStatus,
      priority: taskPriority,
      assignedTo: taskAssignee,
      dueDate: taskDueDate,
      createdAt: new Date().toISOString(),
      subtasks: subtasksList.length > 0 ? subtasksList : undefined
    };

    const updatedTasks = [...selectedProject.tasks, newTask];
    saveAgencyProject({
      ...selectedProject,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString()
    });

    setIsTaskModalOpen(false);
    setTaskTitle('');
    setTaskDesc('');
    setInitialSubtasksInput('');
    showToast(language === 'id' ? 'Tugas tim berhasil ditambahkan.' : 'Task successfully created.');
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedProject) return;
    const updatedTasks = selectedProject.tasks.filter(t => t.id !== taskId);
    saveAgencyProject({
      ...selectedProject,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString()
    });
    if (activeTaskDrawer?.id === taskId) {
      setActiveTaskDrawer(null);
    }
    showToast('Task removed.');
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedProject) return;

    const updatedTasks = selectedProject.tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        const updatedSubs = t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        return { ...t, subtasks: updatedSubs };
      }
      return t;
    });

    saveAgencyProject({
      ...selectedProject,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddSubtaskInDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !activeTaskDrawer || !newSubtaskTitle.trim()) return;

    const newSub: TaskSubtask = {
      id: 'st_' + Date.now().toString(36),
      title: newSubtaskTitle.trim(),
      completed: false
    };

    const currentSubs = activeTaskDrawer.subtasks || [];
    const updatedTasks = selectedProject.tasks.map(t => {
      if (t.id === activeTaskDrawer.id) {
        return { ...t, subtasks: [...currentSubs, newSub] };
      }
      return t;
    });

    saveAgencyProject({
      ...selectedProject,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString()
    });

    setNewSubtaskTitle('');
  };

  const handleDeleteSubtaskInDrawer = (subtaskId: string) => {
    if (!selectedProject || !activeTaskDrawer) return;
    const updatedTasks = selectedProject.tasks.map(t => {
      if (t.id === activeTaskDrawer.id && t.subtasks) {
        return { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) };
      }
      return t;
    });

    saveAgencyProject({
      ...selectedProject,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString()
    });
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (!selectedProject) return;
    const updatedMilestones = selectedProject.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const calcProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    saveAgencyProject({
      ...selectedProject,
      milestones: updatedMilestones,
      progressPercent: calcProgress,
      updatedAt: new Date().toISOString()
    });
    showToast('Milestone status updated.');
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOverColumn = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeaveColumn = () => {
    setDragOverColumnId(null);
  };

  const handleDropOnColumn = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId && selectedProject) {
      updateTaskStatus(selectedProject.id, taskId, columnId);
      const colLabel = TASK_COLUMNS.find(c => c.id === columnId)?.label || columnId;
      showToast(`Task moved to ${colLabel}`);
    }
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold uppercase flex items-center gap-1 shadow-sm shadow-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold uppercase">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 text-[10px] font-mono font-bold uppercase">
            Low
          </span>
        );
    }
  };

  const formatDueNotice = (dueDateStr: string, isDone: boolean) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (isDone) {
      return <span className="text-[#8A909D]">{dueDateStr}</span>;
    }

    if (diffDays < 0) {
      return (
        <span className="text-rose-400 font-bold flex items-center gap-1">
          <AlertCircle size={10} />
          <span>{Math.abs(diffDays)}d overdue</span>
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="text-amber-400 font-bold flex items-center gap-1">
          <Clock size={10} />
          <span>Due today</span>
        </span>
      );
    } else {
      return (
        <span className="text-[#8A909D] flex items-center gap-1">
          <Calendar size={10} />
          <span>In {diffDays}d</span>
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Project Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262930]">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Layers className="text-brand-red" size={24} />
            <span>{t('admin.nav.projects')}</span>
          </h1>
          <p className="text-xs text-[#8A909D] mt-1 font-mono">
            {language === 'id'
              ? 'Manajemen sprint teknis, task execution board, dan delivery milestone klien.'
              : 'Client delivery sprint workspace, draggable task Kanban, and milestone execution.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateProject}
            className="px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-red/20"
          >
            <Plus size={15} />
            <span>{language === 'id' ? 'Buat Proyek Baru' : 'New Project'}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-300">
          <Check size={15} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Project Selector Bar & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Project Selector Rail */}
        <div className="lg:col-span-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {projects.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            return (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`px-4 py-3 rounded-xl border font-mono text-left transition-all shrink-0 min-w-[220px] max-w-[280px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#16181D] border-brand-red ring-1 ring-brand-red/30 shadow-lg shadow-brand-red/10'
                    : 'bg-[#111317] border-[#262930] hover:border-[#383C46] hover:bg-[#16181D]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 w-full">
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                    proj.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    proj.status === 'in_progress' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {proj.status}
                  </span>
                  <span className="text-[10px] text-[#5C626E] font-bold">
                    {proj.progressPercent}%
                  </span>
                </div>
                <div className="font-bold text-xs text-white truncate w-full mb-0.5">
                  {proj.name}
                </div>
                <div className="text-[10px] text-[#8A909D] truncate w-full">
                  {proj.clientCompany}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Project Filter / Search */}
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A909D]" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2.5 bg-[#16181D] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red placeholder:text-[#5C626E] font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Selected Project Overview Hero Card */}
      {selectedProject && (
        <div className="bg-[#111317] border border-[#262930] rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-red/15 text-brand-red border border-brand-red/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {selectedProject.serviceCategory}
                </span>
                <span className="text-xs font-mono text-[#8A909D]">
                  PIC: <strong className="text-white">{selectedProject.clientName}</strong> ({selectedProject.clientCompany})
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-white tracking-tight">
                {selectedProject.name}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              {selectedProject.repositoryUrl && (
                <a
                  href={selectedProject.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#16181D] hover:bg-[#222630] border border-[#262930] text-xs font-mono text-[#8A909D] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <GitBranch size={13} className="text-brand-red" />
                  <span>Repo</span>
                </a>
              )}

              {selectedProject.liveStagingUrl && (
                <a
                  href={selectedProject.liveStagingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#16181D] hover:bg-[#222630] border border-[#262930] text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Staging</span>
                </a>
              )}

              {canManageProjects && (
                <button
                  onClick={() => handleOpenEditProject(selectedProject)}
                  className="p-2 rounded-xl bg-[#16181D] hover:bg-[#222630] text-[#8A909D] hover:text-white border border-[#262930] transition-colors"
                  title="Edit Project Details"
                >
                  <Edit3 size={14} />
                </button>
              )}

              {canDeleteProjects && (
                <button
                  onClick={() => handleDeleteProject(selectedProject.id, selectedProject.name)}
                  className="p-2 rounded-xl bg-[#16181D] hover:bg-red-950/40 text-[#8A909D] hover:text-red-400 border border-[#262930] hover:border-red-500/30 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Progress & Milestone Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-[#262930] text-xs font-mono">
            <div>
              <div className="text-[#8A909D] mb-1 text-[11px]">Sprint Progress</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#16181D] h-2 rounded-full overflow-hidden border border-[#262930]">
                  <div
                    className="bg-brand-red h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedProject.progressPercent}%` }}
                  />
                </div>
                <span className="font-bold text-white text-xs">{selectedProject.progressPercent}%</span>
              </div>
            </div>

            <div>
              <div className="text-[#8A909D] mb-1 text-[11px]">{language === 'id' ? 'Total Nilai Kontrak' : 'Total Contract Budget'}</div>
              <div className="font-bold text-emerald-400 text-sm">
                {formatAmount(selectedProject.budget, currency)}
              </div>
            </div>

            <div>
              <div className="text-[#8A909D] mb-1 text-[11px]">Timeline Target</div>
              <div className="text-white font-bold">
                {selectedProject.startDate} → {selectedProject.targetEndDate}
              </div>
            </div>

            <div>
              <div className="text-[#8A909D] mb-1 text-[11px]">Tech Stack</div>
              <div className="flex flex-wrap gap-1">
                {selectedProject.techStack.slice(0, 3).map((tech, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#16181D] border border-[#262930] text-[#D0D4DC]">
                    {tech}
                  </span>
                ))}
                {selectedProject.techStack.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16181D] border border-[#262930] text-[#5C626E]">
                    +{selectedProject.techStack.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Collapsible Milestones list */}
          {selectedProject.milestones && selectedProject.milestones.length > 0 && (
            <div className="pt-3 border-t border-[#262930]">
              <div className="text-[11px] font-mono text-[#8A909D] uppercase tracking-wider mb-2 font-semibold flex items-center justify-between">
                <span>Milestones & Deliverables ({selectedProject.milestones.filter(m => m.completed).length}/{selectedProject.milestones.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {selectedProject.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    onClick={() => handleToggleMilestone(ms.id)}
                    className={`p-2.5 rounded-xl border text-xs font-mono flex items-start gap-2 cursor-pointer transition-all ${
                      ms.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#16181D] border-[#262930] text-[#8A909D] hover:text-white'
                    }`}
                  >
                    {ms.completed ? (
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square size={15} className="text-[#5C626E] shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className={`truncate font-semibold ${ms.completed ? 'line-through text-emerald-400/70' : 'text-white'}`}>
                        {ms.title}
                      </div>
                      <div className="text-[10px] text-[#5C626E] mt-0.5">Due {ms.dueDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Interactive Task Execution Kanban Board */}
      {selectedProject && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262930]">
            <div>
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <ListTodo className="text-brand-red" size={18} />
                <span>Task Execution Board</span>
              </h3>
              <p className="text-xs text-[#8A909D] font-mono mt-0.5">
                Drag cards smoothly between columns to update sprint status. Click any task to inspect details & subtasks.
              </p>
            </div>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-md self-start sm:self-auto"
            >
              <Plus size={14} />
              <span>{t('admin.proj.addTask')}</span>
            </button>
          </div>

          {/* Kanban Columns Container with Independent Mouse-Drag-Scroll */}
          <div
            ref={kanbanScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 cursor-grab active:cursor-grabbing"
          >
            {TASK_COLUMNS.map((col) => {
              const colTasks = selectedProject.tasks
                .filter(t => t.status === col.id)
                .filter(t => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q) || t.assignedTo.toLowerCase().includes(q);
                });

              const isOver = dragOverColumnId === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOverColumn(e, col.id)}
                  onDragLeave={handleDragLeaveColumn}
                  onDrop={(e) => handleDropOnColumn(e, col.id)}
                  className={`w-[290px] sm:w-[320px] shrink-0 bg-[#0E1013] border rounded-2xl p-3.5 flex flex-col min-h-[440px] transition-all ${
                    isOver
                      ? 'border-brand-red ring-2 ring-brand-red/30 bg-brand-red/5'
                      : 'border-[#262930]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#262930] select-none">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                      <span className="text-xs font-mono font-bold text-white uppercase">{col.label}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#16181D] text-[#8A909D] text-[10px] font-mono font-bold border border-[#262930]">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task Cards List */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[560px] pr-1 scrollbar-thin">
                    {colTasks.length === 0 ? (
                      <div className="h-36 flex flex-col items-center justify-center text-center text-[11px] font-mono text-[#5C626E] border border-dashed border-[#262930] rounded-xl p-4 select-none">
                        <span>Drop tasks here</span>
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const totalSubs = task.subtasks?.length || 0;
                        const completedSubs = task.subtasks?.filter(s => s.completed).length || 0;
                        const isDragging = draggedTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => setActiveTaskDrawer(task)}
                            className={`draggable-card task-card bg-[#16181D] border hover:border-brand-red/60 p-3.5 rounded-xl space-y-2.5 shadow-md transition-all cursor-pointer group relative select-none ${
                              isDragging ? 'opacity-40 scale-95 border-brand-red border-dashed' : 'border-[#262930]'
                            }`}
                          >
                            {/* Drag Handle & Priority */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[#5C626E] group-hover:text-[#8A909D] transition-colors cursor-grab" data-drag-handle>
                                <GripVertical size={14} />
                                {getPriorityBadge(task.priority)}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                                className="text-[#5C626E] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-rose-950/30"
                                title="Delete task"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {/* Task Title */}
                            <h4 className="font-bold text-xs text-white leading-snug group-hover:text-brand-red transition-colors">
                              {task.title}
                            </h4>

                            {/* Description Preview */}
                            {task.description && (
                              <p className="text-[11px] text-[#8A909D] leading-relaxed line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {/* Subtasks Progress Bar & Checklist */}
                            {totalSubs > 0 && (
                              <div className="space-y-1.5 pt-1.5 border-t border-[#262930]/80">
                                <div className="flex items-center justify-between text-[10px] font-mono text-[#8A909D]">
                                  <span className="flex items-center gap-1">
                                    <CheckSquare size={11} className="text-brand-red" />
                                    <span>Subtasks</span>
                                  </span>
                                  <span className="font-bold text-white">{completedSubs}/{totalSubs}</span>
                                </div>
                                <div className="w-full bg-[#0B0C0E] h-1.5 rounded-full overflow-hidden border border-[#262930]">
                                  <div
                                    className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Footer: Assignee & Due Date Notice */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#262930] text-[10px] font-mono">
                              <span className="text-[#8A909D] flex items-center gap-1.5 truncate max-w-[140px]">
                                <div className="w-4 h-4 rounded-full bg-[#20242D] border border-white/10 flex items-center justify-center text-[9px] text-white font-bold">
                                  {task.assignedTo.charAt(0)}
                                </div>
                                <span className="truncate">{task.assignedTo}</span>
                              </span>

                              <div className="text-[10px] font-mono">
                                {formatDueNotice(task.dueDate, task.status === 'done')}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONTEXTUAL TASK DETAIL DRAWER */}
      {/* ------------------------------------------------------------- */}
      {activeTaskDrawer && selectedProject && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveTaskDrawer(null)}
          />

          <div className="relative ml-auto w-full max-w-lg bg-[#111317] border-l border-[#262930] h-full flex flex-col justify-between p-6 z-10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200 font-mono text-xs">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#262930]">
                <div className="flex items-center gap-2">
                  <ListTodo className="text-brand-red" size={18} />
                  <span className="font-display font-bold text-white text-base">Task Details</span>
                </div>
                <button
                  onClick={() => setActiveTaskDrawer(null)}
                  className="p-1.5 rounded-lg bg-[#16181D] text-[#8A909D] hover:text-white border border-[#262930]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Title & Priority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {getPriorityBadge(activeTaskDrawer.priority)}
                  <span className="text-[11px] text-[#5C626E]">
                    Created {new Date(activeTaskDrawer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-display text-white">
                  {activeTaskDrawer.title}
                </h3>
              </div>

              {/* Status Stage Switcher */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#8A909D] uppercase tracking-wider font-semibold">Sprint Stage</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {TASK_COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        updateTaskStatus(selectedProject.id, activeTaskDrawer.id, col.id);
                        showToast(`Moved to ${col.label}`);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] transition-all font-bold ${
                        activeTaskDrawer.status === col.id
                          ? 'bg-brand-red text-white border-brand-red shadow-sm'
                          : 'bg-[#16181D] text-[#8A909D] border-[#262930] hover:text-white'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee & Due Date Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#16181D] border border-[#262930]">
                <div>
                  <div className="text-[10px] text-[#5C626E] uppercase font-bold mb-1">Assignee</div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <User size={13} className="text-brand-red" />
                    <span>{activeTaskDrawer.assignedTo}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#5C626E] uppercase font-bold mb-1">Due Date</div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-400" />
                    <span>{activeTaskDrawer.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#8A909D] uppercase tracking-wider font-semibold">Description & Acceptance Criteria</label>
                <div className="p-3.5 rounded-xl bg-[#16181D] border border-[#262930] text-zinc-300 text-xs leading-relaxed">
                  {activeTaskDrawer.description || 'No detailed description provided.'}
                </div>
              </div>

              {/* Subtasks Checklist Manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-[#8A909D] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <CheckSquare size={13} className="text-brand-red" />
                    <span>Checklist ({activeTaskDrawer.subtasks?.filter(s => s.completed).length || 0}/{activeTaskDrawer.subtasks?.length || 0})</span>
                  </label>
                </div>

                {/* Subtasks List */}
                <div className="space-y-1.5">
                  {activeTaskDrawer.subtasks?.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#16181D] border border-[#262930] hover:border-[#383C46] transition-colors"
                    >
                      <button
                        onClick={() => handleToggleSubtask(activeTaskDrawer.id, st.id)}
                        className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer"
                      >
                        {st.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Square size={16} className="text-[#5C626E] shrink-0" />
                        )}
                        <span className={`text-xs ${st.completed ? 'line-through text-[#5C626E]' : 'text-white'}`}>
                          {st.title}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteSubtaskInDrawer(st.id)}
                        className="text-[#5C626E] hover:text-rose-400 p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Add Subtask input */}
                  <form onSubmit={handleAddSubtaskInDrawer} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add subtask item and press enter..."
                      className="flex-1 px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskTitle.trim()}
                      className="px-3 py-2 rounded-xl bg-brand-red text-white text-xs font-bold disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#262930] flex items-center justify-between">
              <button
                onClick={() => handleDeleteTask(activeTaskDrawer.id)}
                className="px-3 py-2 rounded-xl bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-950/60 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Delete Task</span>
              </button>

              <button
                onClick={() => setActiveTaskDrawer(null)}
                className="px-4 py-2 rounded-xl bg-[#16181D] text-white border border-[#262930] hover:bg-[#20242D] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CREATE / EDIT PROJECT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#16181D] border border-[#262930] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#262930]">
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <Layers className="text-brand-red" size={20} />
                <span>{editingProject ? 'Edit Project' : 'Create New Agency Project'}</span>
              </h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="p-1.5 text-[#8A909D] hover:text-white rounded-lg bg-[#0B0C0E] border border-[#262930]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">Project Name *</label>
                <input
                  type="text"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  required
                  placeholder="e.g. Lumina Luxury Real Estate Headless Web Platform"
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Client PIC Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Marcus Thorne"
                    className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Client Company *</label>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    required
                    placeholder="e.g. Lumina Real Estate Global"
                    className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Service Category</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="UI/UX Design System">UI/UX Design System</option>
                    <option value="Cloud Architecture">Cloud Architecture</option>
                    <option value="AI / LLM Integration">AI / LLM Integration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Budget (IDR)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Status</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review & QA</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Target End Date</label>
                  <input
                    type="date"
                    value={targetEndDate}
                    onChange={(e) => setTargetEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. Next.js 14, TypeScript, Tailwind CSS, PostgreSQL"
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Repository URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/kapitech-agency/..."
                    className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Live Staging URL</label>
                  <input
                    type="url"
                    value={stagingUrl}
                    onChange={(e) => setStagingUrl(e.target.value)}
                    placeholder="https://staging.app.kapitech.id"
                    className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#262930] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0B0C0E] text-[#8A909D] hover:text-white border border-[#262930]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-red text-white font-bold hover:bg-brand-red/90 transition-all shadow-md shadow-brand-red/20"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CREATE NEW TASK MODAL */}
      {/* ------------------------------------------------------------- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#16181D] border border-[#262930] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#262930]">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <ListTodo className="text-brand-red" size={18} />
                <span>Add Task to Sprint</span>
              </h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="p-1.5 text-[#8A909D] hover:text-white rounded-lg bg-[#0B0C0E] border border-[#262930]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Mapbox Vector Tile Cluster Loader"
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">Description / Scope</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Acceptance criteria and technical notes..."
                  className="w-full px-3.5 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Assignee</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="Lead Full-Stack Tech">Lead Full-Stack Tech</option>
                    <option value="Senior Frontend Dev">Senior Frontend Dev</option>
                    <option value="UI/UX Specialist">UI/UX Specialist</option>
                    <option value="Cloud & AI Engineer">Cloud & AI Engineer</option>
                    <option value="QA Specialist">QA Specialist</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Initial Stage</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review & QA</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">Subtask Checklist (1 item per line)</label>
                <textarea
                  rows={2}
                  value={initialSubtasksInput}
                  onChange={(e) => setInitialSubtasksInput(e.target.value)}
                  placeholder="Setup API endpoints&#10;Add unit tests"
                  className="w-full px-3.5 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="pt-4 border-t border-[#262930] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0B0C0E] text-[#8A909D] hover:text-white border border-[#262930]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-red text-white font-bold hover:bg-brand-red/90 transition-all shadow-md shadow-brand-red/20"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminProjects;
