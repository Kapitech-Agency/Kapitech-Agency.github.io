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
} from '../../lib/projectStore';
import { formatAmount, getActiveCurrency, CURRENCY_EVENT, CurrencyCode } from '../../lib/currency';
import { useLanguage } from '../../lib/LanguageContext';
import { useDragToScroll } from '../../lib/useDragToScroll';
import { ScrollShadowContainer } from '../../components/ui/ScrollShadowContainer';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Modal } from '../../components/ui/Modal';
import { getAdminSession, hasAdminPermission } from '../../lib/adminAuth';
import { api } from '../../lib/apiClient';

const TASK_COLUMNS: { id: TaskStatus; label: string; dotColor: string; bgAccent: string }[] = [
  { id: 'todo', label: 'To Do', dotColor: 'bg-zinc-400', bgAccent: 'group-hover:border-[var(--line)]' },
  { id: 'in_progress', label: 'In Progress', dotColor: 'bg-[var(--danger)]', bgAccent: 'group-hover:border-[var(--danger)]/30' },
  { id: 'review', label: 'Review & QA', dotColor: 'bg-[var(--warning)]', bgAccent: 'group-hover:border-[var(--warning)]/30' },
  { id: 'done', label: 'Done', dotColor: 'bg-[var(--success)]', bgAccent: 'group-hover:border-[var(--success)]/30' }
];

export const AdminProjects: React.FC = () => {
  const { t, language } = useLanguage();
  const session = getAdminSession();
  const userRole = session?.user?.role || 'Tier 1: Top Management / Sponsor';
  const canManageProjects = hasAdminPermission('canManageProjects');
  const canManageKanbanTasks = hasAdminPermission('canManageKanbanTasks');
  const canDeleteProjects = userRole.startsWith('Tier 1') || session?.user?.stakeholderType === 'Master';


  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());
  const [projects, setProjects] = useState<AgencyProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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
  const [serviceCategory, setServiceCategory] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [techStackInput, setTechStackInput] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [stagingUrl, setStagingUrl] = useState('');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('planning');

  // Task Creation Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskAssignees, setTaskAssignees] = useState<Array<{ id: string; name: string; username: string; role: string; division: string }>>([]);
  const [taskDueDate, setTaskDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo');
  const [initialSubtasksInput, setInitialSubtasksInput] = useState('');

  const loadData = async () => {
    const res = await api.projects.getAll();
    if (!res.success || !Array.isArray(res.data?.projects)) { showToast(res.error || 'Unable to load projects.'); return; }
    const list = res.data.projects as AgencyProject[];
    setProjects(list);
    if (list.length > 0 && (!selectedProjectId || !list.some(p => p.id === selectedProjectId))) setSelectedProjectId(list[0].id);
  };

  const persistProject = (project: AgencyProject) => {
    const exists = projects.some(item => item.id === project.id);
    void (exists ? api.projects.update(project.id, project) : api.projects.create(project)).then((res) => {
      if (!res.success) { showToast(res.error || 'Project update failed.'); return; }
      void loadData();
    });
  };

  useEffect(() => {
    void loadData();
    if (canManageKanbanTasks) {
      void api.auth.getTaskAssignees().then((res) => {
        if (!res.success || !res.data?.assignees) return;
        const next = res.data.assignees;
        setTaskAssignees(next);
        if (!next.some((item) => item.username === taskAssignee)) {
          const currentUsername = getAdminSession()?.user?.username || '';
          const fallback = next.find((item) => item.username === currentUsername) || next[0];
          if (fallback) setTaskAssignee(fallback.username);
        }
      });
    } else {
      setTaskAssignees([]);
      setTaskAssignee('');
    }

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail?.currency || getActiveCurrency());
    };
    window.addEventListener(CURRENCY_EVENT, handleCurrencyChange);

    return () => {
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
    setProjStatus('planning');
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

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !clientCompany.trim()) {
      showToast('Project Title and Client Company are required.');
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

    persistProject(projectData);
    setSelectedProjectId(projectData.id);
    setIsProjectModalOpen(false);
    showToast(language === 'id' ? 'Proyek berhasil disimpan.' : 'Project successfully saved.');
  };

  const handleDeleteProject = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDeleteProject = async (id: string) => {
    const res = await api.projects.delete(id);
    if (res.success) {
      await loadData();
      showToast(language === 'id' ? 'Proyek dihapus.' : 'Project deleted.');
    } else {
      showToast(res.error || 'Project delete failed.');
    }
    setDeleteTarget(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageKanbanTasks) return;
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
    persistProject({
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
    persistProject({
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

    persistProject({
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

    persistProject({
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

    persistProject({
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

    persistProject({
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
      void api.tasks.update(taskId, { status: columnId }).then((res) => { if (res.success) void loadData(); else showToast(res.error || 'Task status update failed.'); });
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
          <span className="px-2 py-0.5 rounded bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 text-[10px] font-sans font-semibold normal-case flex items-center gap-1 shadow-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse" />
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30 text-[10px] font-sans font-semibold normal-case">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 text-[10px] font-sans font-semibold normal-case">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-[var(--panel-hover)] text-[var(--muted)] border border-[var(--line)] text-[10px] font-sans font-semibold normal-case">
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
      return <span className="text-[var(--muted)]">{dueDateStr}</span>;
    }

    if (diffDays < 0) {
      return (
        <span className="text-[var(--danger)] font-medium flex items-center gap-1">
          <AlertCircle size={10} />
          <span>{Math.abs(diffDays)}d overdue</span>
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="text-[var(--warning)] font-medium flex items-center gap-1">
          <Clock size={10} />
          <span>Due today</span>
        </span>
      );
    } else {
      return (
        <span className="text-[var(--muted)] flex items-center gap-1">
          <Calendar size={10} />
          <span>In {diffDays}d</span>
        </span>
      );
    }
  };

  return (
    <>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm" title={language === "id" ? "Hapus proyek?" : "Delete project?"} description={language === "id" ? `Proyek ${deleteTarget?.name || ""} beserta task board akan dihapus.` : `Project ${deleteTarget?.name || ""} and its task board will be removed.`}>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button type="button" onClick={() => setDeleteTarget(null)} className="min-h-10 px-4 rounded-control border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--muted)]">Cancel</button>
          <button type="button" onClick={() => deleteTarget && void confirmDeleteProject(deleteTarget.id)} className="min-h-10 px-4 rounded-control bg-[var(--danger)] text-white text-xs font-semibold">Delete</button>
        </div>
      </Modal>
      <div className="space-y-6">
      
      {/* 1. Header & Project Actions */}
      <div className="ams-dashboard-header">
        <div>
          <h1 className="ams-page-title">
            <Layers className="text-[var(--danger)]" size={24} />
            <span>{t('admin.nav.projects')}</span>
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 font-sans">
            {language === 'id'
              ? 'Manajemen sprint teknis, task execution board, dan delivery milestone klien.'
              : 'Client delivery sprint workspace, draggable task Kanban, and milestone execution.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canManageProjects && (
            <button
              onClick={handleOpenCreateProject}
              className="min-h-10 px-4 rounded-control bg-[var(--accent)] hover:brightness-110 text-white text-xs font-sans font-medium transition-colors flex items-center gap-2 min-h-10"
            >
              <Plus size={15} />
              <span>{language === 'id' ? 'Buat Proyek Baru' : 'New Project'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      {statusMessage && (
        <div className="p-3.5 rounded-card bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-xs font-sans flex items-center gap-2 animate-in fade-in duration-300">
          <Check size={15} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Project Selector Bar */}
      <div className="w-full">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
          {projects.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            return (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`px-4 py-3 rounded-card border font-sans text-left transition-all shrink-0 min-w-[220px] max-w-[280px] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[var(--panel)] border-[var(--accent)] ring-1 ring-[var(--accent)]/30'
                    : 'bg-[var(--panel)] border-[var(--line)] hover:border-[var(--line)] hover:bg-[var(--panel)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 w-full">
                  <span className={`text-[9px] normal-case px-1.5 py-0.5 rounded font-semibold ${
                    proj.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    proj.status === 'in_progress' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {proj.status}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] font-semibold">
                    {proj.progressPercent}%
                  </span>
                </div>
                <div className="font-semibold text-xs text-[var(--text)] truncate w-full mb-0.5">
                  {proj.name}
                </div>
                <div className="text-[10px] text-[var(--muted)] truncate w-full">
                  {proj.clientCompany}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Project Overview Hero Card */}
      {selectedProject && (
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--danger)] border border-[var(--accent)]/30 text-[10px] font-sans font-semibold normal-case tracking-normal">
                  {selectedProject.serviceCategory}
                </span>
                <span className="text-xs font-sans text-[var(--muted)]">
                  PIC: <strong className="text-[var(--text)]">{selectedProject.clientName}</strong> ({selectedProject.clientCompany})
                </span>
              </div>
              <h2 className="text-xl font-sans font-semibold text-[var(--text)] tracking-tight">
                {selectedProject.name}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              {selectedProject.repositoryUrl && (
                <a
                  href={selectedProject.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-10 px-3 py-1.5 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] border border-[var(--line)] text-xs font-sans text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5"
                >
                  <GitBranch size={13} className="text-[var(--danger)]" />
                  <span>Repo</span>
                </a>
              )}

              {selectedProject.liveStagingUrl && (
                <a
                  href={selectedProject.liveStagingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-card bg-[var(--panel)] hover:bg-[var(--panel)] border border-[var(--line)] text-xs font-sans text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Staging</span>
                </a>
              )}

              {canManageProjects && (
                <button
                  onClick={() => handleOpenEditProject(selectedProject)}
                  className="p-2.5 min-h-10 min-w-10 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] transition-colors"
                  title="Edit Project Details"
                >
                  <Edit3 size={14} />
                </button>
              )}

              {canDeleteProjects && (
                <button
                  onClick={() => handleDeleteProject(selectedProject.id, selectedProject.name)}
                  className="p-2.5 min-h-10 min-w-10 rounded-control bg-[var(--panel)] hover:bg-red-950/40 text-[var(--muted)] hover:text-[var(--danger)] border border-[var(--line)] hover:border-[var(--danger)]/30 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Progress & Milestone Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-[var(--line)] text-xs font-sans">
            <div>
              <div className="text-[var(--muted)] mb-1 text-[11px]">Sprint Progress</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[var(--panel)] h-2 rounded-full overflow-hidden border border-[var(--line)]">
                  <div
                    className="bg-[var(--accent)] h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedProject.progressPercent}%` }}
                  />
                </div>
                <span className="font-semibold text-[var(--text)] text-xs">{selectedProject.progressPercent}%</span>
              </div>
            </div>

            <div>
              <div className="text-[var(--muted)] mb-1 text-[11px]">{language === 'id' ? 'Total Nilai Kontrak' : 'Total Contract Budget'}</div>
              <div className="font-semibold text-emerald-400 text-sm">
                {formatAmount(selectedProject.budget, currency)}
              </div>
            </div>

            <div>
              <div className="text-[var(--muted)] mb-1 text-[11px]">Timeline Target</div>
              <div className="text-[var(--text)] font-semibold">
                {selectedProject.startDate} → {selectedProject.targetEndDate}
              </div>
            </div>

            <div>
              <div className="text-[var(--muted)] mb-1 text-[11px]">Tech Stack</div>
              <div className="flex flex-wrap gap-1">
                {selectedProject.techStack.slice(0, 3).map((tech, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)] text-[var(--text)]">
                    {tech}
                  </span>
                ))}
                {selectedProject.techStack.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)]">
                    +{selectedProject.techStack.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Collapsible Milestones list */}
          {selectedProject.milestones && selectedProject.milestones.length > 0 && (
            <div className="pt-3 border-t border-[var(--line)]">
              <div className="text-[11px] font-sans text-[var(--muted)] normal-case tracking-normal mb-2 font-semibold flex items-center justify-between">
                <span>Milestones & Deliverables ({selectedProject.milestones.filter(m => m.completed).length}/{selectedProject.milestones.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {selectedProject.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    onClick={() => handleToggleMilestone(ms.id)}
                    className={`p-2.5 rounded-card border text-xs font-sans flex items-start gap-2 cursor-pointer transition-all ${
                      ms.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-[var(--panel)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {ms.completed ? (
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square size={15} className="text-[var(--muted)] shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className={`truncate font-semibold ${ms.completed ? 'line-through text-emerald-400/70' : 'text-[var(--text)]'}`}>
                        {ms.title}
                      </div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">Due {ms.dueDate}</div>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
            <div>
              <h3 className="text-base font-sans font-semibold text-[var(--text)] flex items-center gap-2">
                <ListTodo className="text-[var(--danger)]" size={18} />
                <span>Task Execution Board</span>
              </h3>
              <p className="text-xs text-[var(--muted)] font-sans mt-0.5">
                {language === 'id' 
                  ? 'Drag kartu sprint antar kolom untuk update status. Klik kartu untuk melihat detail & checklist.'
                  : 'Drag cards smoothly between columns to update sprint status. Click any task to inspect details & subtasks.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Contextual Card Search */}
              <div className="relative min-w-[200px] sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari tugas sprint...' : 'Filter sprint tasks...'}
                  className="w-full pl-8 pr-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted)] font-sans h-10 min-h-10"
                />
              </div>

              {canManageKanbanTasks && (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="min-h-10 px-4 rounded-control bg-[var(--accent)] hover:brightness-110 text-white text-xs font-sans font-medium transition-colors flex items-center justify-center gap-2 shrink-0 min-h-10"
                >
                  <Plus size={14} />
                  <span>{t('admin.proj.addTask')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Kanban Columns Container with Independent Mouse-Drag-Scroll & Dynamic Fade Shadows */}
          <ScrollShadowContainer
            externalRef={kanbanScrollRef}
            shadowBg="app"
            shadowSize="lg"
            showNavButtons={true}
            scrollStep={340}
            bottomOffset="bottom-4"
            scrollClassName="flex gap-3 overflow-x-auto pb-4 pt-1 cursor-grab active:cursor-grabbing scrollbar-thin"
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
                  className={`w-[290px] sm:w-[320px] shrink-0 bg-[var(--panel)] border rounded-card p-3.5 flex flex-col min-h-[440px] transition-all ${
                    isOver
                      ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 bg-[var(--accent)]/5'
                      : 'border-[var(--line)]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--line)] select-none">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                      <span className="text-xs font-sans font-semibold text-[var(--text)] normal-case">{col.label}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--panel)] text-[var(--muted)] text-[10px] font-sans font-semibold border border-[var(--line)]">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task Cards List */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[560px] pr-1 scrollbar-thin">
                    {colTasks.length === 0 ? (
                      <div className="h-36 flex flex-col items-center justify-center text-center text-[11px] font-sans text-[var(--muted)] border border-dashed border-[var(--line)] rounded-card p-4 select-none">
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
                            draggable={canManageKanbanTasks}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => setActiveTaskDrawer(task)}
                            className={`draggable-card task-card bg-[var(--panel)] border hover:border-[var(--accent)]/60 p-3.5 rounded-card space-y-2.5 transition-all cursor-pointer group relative select-none ${
                              isDragging ? 'opacity-40 scale-95 border-[var(--accent)] border-dashed' : 'border-[var(--line)]'
                            }`}
                          >
                            {/* Drag Handle & Priority */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[var(--muted)] group-hover:text-[var(--muted)] transition-colors cursor-grab" data-drag-handle>
                                <GripVertical size={14} />
                                {getPriorityBadge(task.priority)}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                                className="text-[var(--muted)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--danger)]/10"
                                title="Delete task"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {/* Task Title */}
                            <h4 className="font-semibold text-xs text-[var(--text)] leading-snug group-hover:text-[var(--danger)] transition-colors">
                              {task.title}
                            </h4>

                            {/* Description Preview */}
                            {task.description && (
                              <p className="text-[11px] text-[var(--muted)] leading-relaxed line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {/* Subtasks Progress Bar & Checklist */}
                            {totalSubs > 0 && (
                              <div className="space-y-1.5 pt-1.5 border-t border-[var(--line)]/80">
                                <div className="flex items-center justify-between text-[10px] font-sans text-[var(--muted)]">
                                  <span className="flex items-center gap-1">
                                    <CheckSquare size={11} className="text-[var(--danger)]" />
                                    <span>Subtasks</span>
                                  </span>
                                  <span className="font-semibold text-[var(--text)]">{completedSubs}/{totalSubs}</span>
                                </div>
                                <div className="w-full bg-[var(--bg)] h-1.5 rounded-full overflow-hidden border border-[var(--line)]">
                                  <div
                                    className="bg-[var(--success)] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Footer: Assignee & Due Date Notice */}
                            <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] text-[10px] font-sans">
                              <span className="text-[var(--muted)] flex items-center gap-1.5 truncate max-w-[140px]">
                                <div className="w-4 h-4 rounded-full bg-[var(--panel)] border border-white/10 flex items-center justify-center text-[9px] text-[var(--text)] font-semibold">
                                  {task.assignedTo.charAt(0)}
                                </div>
                                <span className="truncate">{task.assignedTo}</span>
                              </span>

                              <div className="text-[10px] font-sans">
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
          </ScrollShadowContainer>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONTEXTUAL TASK DETAIL DRAWER */}
      {/* ------------------------------------------------------------- */}
      {activeTaskDrawer && selectedProject && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80  transition-opacity"
            onClick={() => setActiveTaskDrawer(null)}
          />

          <div className="relative ml-auto w-full sm:max-w-lg bg-[var(--panel)] border-l-0 sm:border-l border-[var(--line)] h-full flex flex-col justify-between z-10 shadow-none overflow-hidden animate-in slide-in-from-right duration-200 font-sans text-xs">
            {/* Sticky Drawer Header */}
            <div className="sticky top-0 z-20 bg-[var(--panel)]/95  px-5 sm:px-6 py-4 border-b border-[var(--line)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ListTodo className="text-[var(--danger)]" size={18} />
                <span className="font-sans font-semibold text-[var(--text)] text-base">Task Details</span>
              </div>
              <button
                onClick={() => setActiveTaskDrawer(null)}
                className="w-8 h-8 rounded-control bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] flex items-center justify-center transition-colors shrink-0 ml-3"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">

              {/* Title & Priority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {getPriorityBadge(activeTaskDrawer.priority)}
                  <span className="text-[11px] text-[var(--muted)]">
                    Created {new Date(activeTaskDrawer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold font-sans text-[var(--text)]">
                  {activeTaskDrawer.title}
                </h3>
              </div>

              {/* Status Stage Switcher */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-[var(--muted)] normal-case tracking-normal font-semibold">Sprint Stage</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {TASK_COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        void api.tasks.update(activeTaskDrawer.id, { status: col.id }).then((res) => { if (res.success) void loadData(); else showToast(res.error || 'Task status update failed.'); });
                        showToast(`Moved to ${col.label}`);
                      }}
                      className={`px-2.5 py-1.5 rounded-card border text-[11px] transition-all font-semibold ${
                        activeTaskDrawer.status === col.id
                          ? 'bg-[var(--accent)] text-[var(--text)] border-[var(--accent)] shadow-none'
                          : 'bg-[var(--panel)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--text)]'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee & Due Date Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-card bg-[var(--panel)] border border-[var(--line)]">
                <div>
                  <div className="text-[10px] text-[var(--muted)] normal-case font-semibold mb-1">Assignee</div>
                  <div className="text-[var(--text)] font-semibold flex items-center gap-1.5">
                    <User size={13} className="text-[var(--danger)]" />
                    <span>{activeTaskDrawer.assignedTo}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted)] normal-case font-semibold mb-1">Due Date</div>
                  <div className="text-[var(--text)] font-semibold flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-400" />
                    <span>{activeTaskDrawer.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-[var(--muted)] normal-case tracking-normal font-semibold">Description & Acceptance Criteria</label>
                <div className="p-3.5 rounded-card bg-[var(--panel)] border border-[var(--line)] text-zinc-300 text-xs leading-relaxed">
                  {activeTaskDrawer.description || 'No detailed description provided.'}
                </div>
              </div>

              {/* Subtasks Checklist Manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-[var(--muted)] normal-case tracking-normal font-semibold flex items-center gap-1.5">
                    <CheckSquare size={13} className="text-[var(--danger)]" />
                    <span>Checklist ({activeTaskDrawer.subtasks?.filter(s => s.completed).length || 0}/{activeTaskDrawer.subtasks?.length || 0})</span>
                  </label>
                </div>

                {/* Subtasks List */}
                <div className="space-y-1.5">
                  {activeTaskDrawer.subtasks?.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2.5 rounded-card bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--line)] transition-colors"
                    >
                      <button
                        onClick={() => handleToggleSubtask(activeTaskDrawer.id, st.id)}
                        className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer"
                      >
                        {st.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Square size={16} className="text-[var(--muted)] shrink-0" />
                        )}
                        <span className={`text-xs ${st.completed ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'}`}>
                          {st.title}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteSubtaskInDrawer(st.id)}
                        className="text-[var(--muted)] hover:text-rose-400 p-1"
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
                      className="flex-1 px-3 py-2 bg-[var(--bg)] border border-[var(--line)] rounded-card text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskTitle.trim()}
                      className="px-3 py-2 rounded-control bg-[var(--accent)] text-[var(--text)] text-xs font-semibold disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="sticky bottom-0 z-20 bg-[var(--panel)]/95  px-5 sm:px-6 py-3.5 border-t border-[var(--line)] flex items-center justify-between shrink-0">
              <button
                onClick={() => handleDeleteTask(activeTaskDrawer.id)}
                className="h-10 px-3 min-h-10 rounded-control bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 hover:bg-[var(--panel-hover)]/15 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Delete Task</span>
              </button>

              <button
                onClick={() => setActiveTaskDrawer(null)}
                className="min-h-10 px-4 min-h-10 rounded-card bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] hover:bg-[var(--panel)] transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/80  flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[var(--panel)] border-0 sm:border sm:border-[var(--line)] rounded-none sm:rounded-card w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl shadow-none flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-[var(--panel)]/95  px-5 sm:px-6 py-4 border-b border-[var(--line)] flex items-center justify-between shrink-0">
              <h3 className="font-sans font-semibold text-[var(--text)] text-base sm:text-lg flex items-center gap-2">
                <Layers className="text-[var(--danger)]" size={20} />
                <span>{editingProject ? 'Edit Project' : 'Create New Agency Project'}</span>
              </h3>
              <button 
                onClick={() => setIsProjectModalOpen(false)} 
                className="w-8 h-8 rounded-control bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] flex items-center justify-center transition-colors shrink-0 ml-3"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs font-sans custom-scrollbar">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Project Name *</label>
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    required
                    placeholder="e.g. Lumina Luxury Real Estate Headless Web Platform"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Client PIC Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Marcus Thorne"
                      className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Client Company *</label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      required
                      placeholder="e.g. Lumina Real Estate Global"
                      className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Service Category</label>
                    <CustomSelect value={serviceCategory} onChange={setServiceCategory} className="w-full" size="sm" options={[
                      { value: 'Web Development', label: 'Web Development' },
                                            { value: 'UI/UX Design System', label: 'UI/UX Design System' },
                      { value: 'Cloud Architecture', label: 'Cloud Architecture' },
                      { value: 'AI / LLM Integration', label: 'AI / LLM Integration' }
                    ]} />
                  </div>

                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Budget (IDR)</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Status</label>
                    <CustomSelect value={projStatus} onChange={(value) => setProjStatus(value as ProjectStatus)} className="w-full" size="sm" options={[
                      { value: 'planning', label: 'Planning' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'review', label: 'Review & QA' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'on_hold', label: 'On Hold' }
                    ]} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Target End Date</label>
                    <input
                      type="date"
                      value={targetEndDate}
                      onChange={(e) => setTargetEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    placeholder="e.g. Next.js 14, TypeScript, Tailwind CSS, PostgreSQL"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Repository URL</label>
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/kapitech-agency/..."
                      className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Live Staging URL</label>
                    <input
                      type="url"
                      value={stagingUrl}
                      onChange={(e) => setStagingUrl(e.target.value)}
                      placeholder="https://staging.app.kapitech.id"
                      className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-20 bg-[var(--panel)]/95  px-5 sm:px-6 py-3.5 border-t border-[var(--line)] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="min-h-10 px-4 min-h-10 rounded-card bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] text-xs font-sans font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-10 px-6 min-h-10 rounded-control bg-[var(--accent)] text-[var(--text)] font-sans font-semibold hover:bg-[var(--panel-hover)] transition-all shadow-none"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CREATE NEW TASK MODAL (Mobile Fullscreen + Sticky) */}
      {/* ------------------------------------------------------------- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80  flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[var(--panel)] border-0 sm:border sm:border-[var(--line)] rounded-none sm:rounded-card w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg shadow-none flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-[var(--panel)]/95  px-5 sm:px-6 py-4 border-b border-[var(--line)] flex items-center justify-between shrink-0">
              <h3 className="font-sans font-semibold text-[var(--text)] text-base flex items-center gap-2">
                <ListTodo className="text-[var(--danger)]" size={18} />
                <span>Add Task to Sprint</span>
              </h3>
              <button 
                onClick={() => setIsTaskModalOpen(false)} 
                className="w-8 h-8 rounded-control bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] flex items-center justify-center transition-colors shrink-0 ml-3"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs font-sans custom-scrollbar">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Implement Mapbox Vector Tile Cluster Loader"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Description / Scope</label>
                  <textarea
                    rows={3}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Acceptance criteria and technical notes..."
                    className="w-full px-3.5 py-2 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Priority</label>
                    <CustomSelect value={taskPriority} onChange={(value) => setTaskPriority(value as TaskPriority)} className="w-full" size="sm" options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'urgent', label: 'Urgent' }
                    ]} />
                  </div>

                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Assignee</label>
                    <CustomSelect
                      value={taskAssignee}
                      onChange={setTaskAssignee}
                      disabled={taskAssignees.length === 0}
                      className="w-full"
                      size="sm"
                      placeholder="No active assignees available"
                      options={taskAssignees.map((assignee) => ({
                        value: assignee.username,
                        label: `${assignee.name} · @${assignee.username}`
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Initial Stage</label>
                    <CustomSelect value={taskStatus} onChange={(value) => setTaskStatus(value as TaskStatus)} className="w-full" size="sm" options={[
                      { value: 'todo', label: 'To Do' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'review', label: 'Review & QA' },
                      { value: 'done', label: 'Done' }
                    ]} />
                  </div>

                  <div>
                    <label className="block text-[var(--muted)] mb-1 font-semibold">Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--muted)] mb-1 font-semibold">Subtask Checklist (1 item per line)</label>
                  <textarea
                    rows={2}
                    value={initialSubtasksInput}
                    onChange={(e) => setInitialSubtasksInput(e.target.value)}
                    placeholder="Setup API endpoints&#10;Add unit tests"
                    className="w-full px-3.5 py-2 bg-[var(--bg)] border border-[var(--line)] rounded-card text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-20 bg-[var(--panel)]/95  px-5 sm:px-6 py-3.5 border-t border-[var(--line)] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="min-h-10 px-4 min-h-10 rounded-card bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)] text-xs font-sans font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-10 px-6 min-h-10 rounded-control bg-[var(--accent)] text-[var(--text)] font-sans font-semibold hover:bg-[var(--panel-hover)] transition-all shadow-none"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </>
  );
};
export default AdminProjects;
