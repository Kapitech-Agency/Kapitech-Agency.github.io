import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { Clock3, Plus, Trash2, RefreshCw, CalendarDays, Timer, ReceiptText } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { getAdminSession, hasAdminPermission } from '../../lib/adminAuth';


type TimeLog = {
  id: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  user?: string;
  userId?: string;
  durationMinutes: number;
  billable?: boolean;
  date: string;
  notes?: string;
  createdAt: string;
};

export const AdminTimeLogs: React.FC = () => {
  const canManage = hasAdminPermission('canManageProjects') || hasAdminPermission('canManageKanbanTasks');
  const canDeleteAll = hasAdminPermission('canManageProjects');
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('General');
  const [taskTitle, setTaskTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [billable, setBillable] = useState(true);
  const [notes, setNotes] = useState('');

  const load = async () => {
    setLoading(true);
    const [logsRes, projectsRes] = await Promise.all([
      api.timeLogs.getAll(),
      api.projects.getAll()
    ]);
    if (logsRes.success && logsRes.data?.timeLogs) setLogs(logsRes.data.timeLogs);
    else setStatus(logsRes.error || 'Unable to load time logs.');
    if (projectsRes?.success && Array.isArray(projectsRes.data?.projects)) setProjects(projectsRes.data.projects);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const totalMinutes = useMemo(() => logs.reduce((sum, log) => sum + Number(log.durationMinutes || 0), 0), [logs]);
  const billableMinutes = useMemo(() => logs.filter(log => log.billable).reduce((sum, log) => sum + Number(log.durationMinutes || 0), 0), [logs]);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const project = projects.find(item => item.id === id);
    setProjectName(project?.name || 'General');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canManage) return;
    setSaving(true);
    setStatus(null);
    const res = await api.timeLogs.create({
      projectId,
      projectName: projectName || 'General',
      taskTitle,
      durationMinutes,
      billable,
      date,
      notes
    });
    if (res.success && res.data?.timeLog) {
      setLogs(current => [res.data!.timeLog, ...current]);
      setTaskTitle('');
      setNotes('');
      setStatus('Time entry saved.');
    } else {
      setStatus(res.error || 'Time entry could not be saved.');
    }
    setSaving(false);
  };

  const remove = async (log: TimeLog) => {
    if (!canManage || (!canDeleteAll && log.userId !== getAdminSession()?.user?.id)) return;
    if (!window.confirm('Delete this time entry?')) return;
    const res = await api.timeLogs.delete(log.id);
    if (res.success) setLogs(current => current.filter(item => item.id !== log.id));
    else setStatus(res.error || 'Time entry could not be deleted.');
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--k-bg)] text-white">
      <div className="max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--k-text-secondary)]">
              <Clock3 size={13} className="text-[var(--k-red)]" /> Delivery Operations
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">Time Tracking</h1>
            <p className="mt-1 text-sm text-[var(--k-text-secondary)] max-w-2xl">Record delivery time against projects and tasks, with billable visibility for operational reporting.</p>
          </div>
          <button onClick={() => void load()} className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[var(--ams-radius-control)] border border-white/[0.08] bg-[var(--k-surface)] text-sm text-white hover:bg-[var(--k-surface-raised)] transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ['Tracked time', formatMinutes(totalMinutes), Timer],
            ['Billable time', formatMinutes(billableMinutes), ReceiptText],
            ['Entries', String(logs.length), CalendarDays]
          ].map(([label, value, Icon]: any) => (
            <div key={label} className="rounded-[var(--ams-radius-card)] border border-white/[0.07] bg-[var(--k-surface)] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--k-text-secondary)]">{label}</span>
                <Icon size={15} className="text-[var(--k-red)]" />
              </div>
              <div className="mt-2 text-xl font-semibold tracking-tight">{value}</div>
            </div>
          ))}
        </section>

        {canManage && (
          <form onSubmit={submit} className="rounded-[var(--ams-radius-card)] border border-white/[0.07] bg-[var(--k-surface)] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">New time entry</h2>
                <p className="text-xs text-[var(--k-text-secondary)] mt-1">Keep project time accurate and traceable.</p>
              </div>
              <Plus size={17} className="text-[var(--k-red)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <label className="space-y-1.5">
                <span className="text-[11px] text-[var(--k-text-secondary)]">Project</span>
                <select value={projectId} onChange={e => handleProjectChange(e.target.value)} className="ams-control w-full">
                  <option value="">General</option>
                  {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-[11px] text-[var(--k-text-secondary)]">Task</span>
                <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task or activity" className="ams-control w-full" />
              </label>
              <label className="space-y-1.5">
                <span className="text-[11px] text-[var(--k-text-secondary)]">Duration (minutes)</span>
                <input type="number" min={1} max={1440} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className="ams-control w-full" />
              </label>
              <label className="space-y-1.5">
                <span className="text-[11px] text-[var(--k-text-secondary)]">Date</span>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="ams-control w-full" />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <label className="space-y-1.5">
                <span className="text-[11px] text-[var(--k-text-secondary)]">Notes</span>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional context" className="ams-control w-full" />
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 h-10 px-3 rounded-[var(--ams-radius-control)] border border-white/[0.08] bg-[var(--k-bg)] text-xs cursor-pointer">
                  <input type="checkbox" checked={billable} onChange={e => setBillable(e.target.checked)} className="accent-[var(--k-red)]" />
                  Billable
                </label>
                <button disabled={saving} className="h-10 px-4 rounded-[var(--ams-radius-control)] bg-[var(--k-red)] hover:bg-[var(--k-red-hover)] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-2">
                  {saving ? 'Saving…' : 'Add entry'}
                </button>
              </div>
            </div>
          </form>
        )}

        {status && <div className="rounded-xl border border-white/[0.07] bg-[var(--k-surface)] px-4 py-3 text-xs text-[#CBD5E1]">{status}</div>}

        <section className="rounded-[var(--ams-radius-card)] border border-white/[0.07] bg-[var(--k-surface)] overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Recent entries</h2>
              <p className="text-xs text-[var(--k-text-secondary)] mt-1">{loading ? 'Loading…' : `${logs.length} entries`}</p>
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-sm text-[var(--k-text-secondary)]">Loading time entries…</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <Clock3 size={22} className="mx-auto text-[var(--k-text-muted)]" />
              <p className="mt-3 text-sm text-white">No time entries yet</p>
              <p className="mt-1 text-xs text-[var(--k-text-secondary)]">Add the first delivery time entry above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[#0D0F14] text-[10px] uppercase tracking-wider text-[var(--k-text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Project / Task</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-xs text-[#CBD5E1] whitespace-nowrap">{log.date}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-white">{log.projectName || 'General'}</div>
                        <div className="text-[11px] text-[var(--k-text-muted)] mt-0.5">{log.taskTitle || 'General activity'}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#CBD5E1]">{log.user || '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-white">{formatMinutes(Number(log.durationMinutes || 0))}</td>
                      <td className="px-4 py-3"><span className="inline-flex px-2 py-1 rounded-full border border-white/[0.07] text-[10px] text-[#CBD5E1]">{log.billable ? 'Billable' : 'Non-billable'}</span></td>
                      <td className="px-4 py-3 text-right">
                        {(canDeleteAll || log.userId === getAdminSession()?.user?.id) && (
                          <button onClick={() => void remove(log)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[var(--k-text-secondary)] hover:text-[var(--k-red-hover)] hover:bg-[var(--k-red)]/10" title="Delete time entry">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
