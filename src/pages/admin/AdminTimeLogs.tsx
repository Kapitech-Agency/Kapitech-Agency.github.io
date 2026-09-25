import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, RefreshCw, CalendarDays, Timer, ReceiptText } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Modal } from '../../components/ui/Modal';
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
  const [deleteTarget, setDeleteTarget] = useState<TimeLog | null>(null);

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
    setDeleteTarget(log);
  };

  const confirmRemove = async (log: TimeLog) => {
    const res = await api.timeLogs.delete(log.id);
    if (res.success) setLogs(current => current.filter(item => item.id !== log.id));
    else setStatus(res.error || 'Time entry could not be deleted.');
    setDeleteTarget(null);
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-[1500px] mx-auto p-4 sm:p-5 lg:p-6 space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 pb-5 border-b border-[var(--line)]">
          <div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Time Tracking</h1>
              <p className="mt-1 text-[13px] leading-[18px] text-[var(--muted)]">Track project time and billable work.</p>
            </div>
          </div>
          <button onClick={() => void load()} className="inline-flex items-center justify-center gap-2 h-10 min-h-10 px-4 rounded-control border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--text)] hover:bg-[var(--panel)] transition-colors self-stretch sm:self-auto">
            <RefreshCw size={14} /> Refresh
          </button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ['Tracked time', formatMinutes(totalMinutes), Timer],
            ['Billable time', formatMinutes(billableMinutes), ReceiptText],
            ['Entries', String(logs.length), CalendarDays]
          ].map(([label, value, Icon]: any) => (
            <div key={label} className="rounded-card border border-[var(--line)] bg-[var(--panel)] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">{label}</span>
                <Icon size={15} className="text-[var(--accent)]" />
              </div>
              <div className="mt-2 text-xl font-semibold tracking-tight">{value}</div>
            </div>
          ))}
        </section>

        {canManage && (
          <form onSubmit={submit} className="rounded-card border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">New time entry</h2>
                <p className="text-xs text-[var(--muted)] mt-1">Keep project time accurate and traceable.</p>
              </div>
              <Plus size={17} className="text-[var(--accent)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <label className="space-y-1.5">
                <span className="text-[11px] text-[var(--muted)]">Project</span>
                <CustomSelect
                  value={projectId}
                  onChange={handleProjectChange}
                  options={[{ value: "", label: "General" }, ...projects.map(project => ({ value: project.id, label: project.name }))]}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[11px] text-[var(--muted)]">Task</span>
                <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task or activity" className="ams-control w-full" />
              </label>
              <label className="space-y-1.5">
                <span className="text-[11px] text-[var(--muted)]">Duration (minutes)</span>
                <input type="number" min={1} max={1440} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className="ams-control w-full" />
              </label>
              <label className="space-y-1.5">
                <span className="text-[11px] text-[var(--muted)]">Date</span>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="ams-control w-full" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
              <label className="space-y-1.5">
                <span className="text-[11px] text-[var(--muted)]">Notes</span>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional context" className="ams-control w-full" />
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="flex items-center gap-2 h-10 px-3 rounded-control border border-[var(--line)] bg-[var(--bg)] text-xs cursor-pointer">
                  <input type="checkbox" checked={billable} onChange={e => setBillable(e.target.checked)} className="accent-[var(--accent)]" />
                  Billable
                </label>
                <button disabled={saving} className="min-h-10 px-4 rounded-control bg-[var(--accent)] hover:brightness-110 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-2">
                  {saving ? 'Saving…' : 'Add entry'}
                </button>
              </div>
            </div>
          </form>
        )}

        {status && <div className="rounded-card border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-xs text-[var(--text)]">{status}</div>}

        <section className="rounded-card border border-[var(--line)] bg-[var(--panel)] overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-[var(--line)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div>
              <h2 className="text-sm font-semibold">Recent entries</h2>
              <p className="text-xs text-[var(--muted)] mt-1">{loading ? 'Loading…' : `${logs.length} entries`}</p>
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-sm text-[var(--muted)]">Loading time entries…</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <Timer size={22} className="mx-auto text-[var(--muted)]" />
              <p className="mt-3 text-sm text-[var(--text)]">No time entries yet</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Add the first delivery time entry above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[var(--bg)] text-xs normal-case tracking-normal text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Project / Task</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-[var(--panel-hover)]">
                      <td className="px-4 py-3 text-xs text-[var(--text)] whitespace-nowrap">{log.date}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-[var(--text)]">{log.projectName || 'General'}</div>
                        <div className="text-[11px] text-[var(--muted)] mt-0.5">{log.taskTitle || 'General activity'}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text)]">{log.user || '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[var(--text)]">{formatMinutes(Number(log.durationMinutes || 0))}</td>
                      <td className="px-4 py-3"><span className="inline-flex px-2 py-1 rounded-badge border border-[var(--line)] text-[10px] text-[var(--text)]">{log.billable ? 'Billable' : 'Non-billable'}</span></td>
                      <td className="px-4 py-3 text-right">
                        {(canDeleteAll || log.userId === getAdminSession()?.user?.id) && (
                          <button onClick={() => void remove(log)} className="min-h-10 min-w-10 inline-flex items-center justify-center rounded-control text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--accent)]/10" title="Delete time entry">
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
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm" title="Delete time entry" description="This removes the selected time entry from the time log.">
        <div className="space-y-4">
          <div className="rounded-control border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--muted)]">
            <div className="font-semibold text-[var(--text)]">{deleteTarget?.projectName || 'General'}</div>
            <div className="mt-1">{deleteTarget?.taskTitle || 'General activity'} · {deleteTarget ? formatMinutes(Number(deleteTarget.durationMinutes || 0)) : ''}</div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="min-h-10 px-4 rounded-control border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--muted)]">Cancel</button>
            <button type="button" onClick={() => deleteTarget && void confirmRemove(deleteTarget)} className="min-h-10 px-4 rounded-control bg-[var(--danger)] text-white text-xs font-semibold">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
