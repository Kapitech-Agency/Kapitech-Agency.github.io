import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { useLanguage } from '../../lib/LanguageContext';

type ServerNotification = {
  id: string;
  title?: string;
  message?: string;
  type?: string;
  createdAt?: string;
  isRead?: boolean;
  readAt?: string | null;
};

export const AdminNotificationCenter: React.FC = () => {
  const { language } = useLanguage();
  const [items, setItems] = useState<ServerNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const res = await api.notifications.getAll();
    if (res.success && Array.isArray(res.data?.notifications)) {
      setItems(res.data.notifications as ServerNotification[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const unread = useMemo(() => items.filter(item => !item.isRead && !item.readAt).length, [items]);

  const markRead = async (id: string) => {
    const res = await api.notifications.markRead(id);
    if (res.success) setItems(prev => prev.map(item => item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item));
  };

  const markAllRead = async () => {
    const res = await api.notifications.markAllRead();
    if (res.success) setItems(prev => prev.map(item => ({ ...item, isRead: true, readAt: new Date().toISOString() })));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative h-9 w-9 rounded-[10px] border border-white/[0.07] bg-[#111318] text-[#8A94A6] hover:text-white hover:border-white/[0.14] transition-all flex items-center justify-center"
        aria-label={language === 'id' ? 'Notifikasi' : 'Notifications'}
        aria-expanded={open}
      >
        <Bell size={16} />
        {unread > 0 && <span className="absolute -right-1 -top-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E50914] text-white text-[9px] font-bold flex items-center justify-center">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <>
          <button aria-label="Close notifications" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111318]/98 shadow-[0_24px_70px_rgba(0,0,0,.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold text-white">{language === 'id' ? 'Notifikasi' : 'Notifications'}</p>
                <p className="mt-0.5 text-[11px] text-[#64748B]">{unread} {language === 'id' ? 'belum dibaca' : 'unread'}</p>
              </div>
              {unread > 0 && <button type="button" onClick={() => void markAllRead()} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#FF1E27] hover:text-white"><CheckCheck size={14}/>{language === 'id' ? 'Tandai semua' : 'Mark all read'}</button>}
            </div>
            <div className="max-h-[min(60vh,460px)] overflow-y-auto">
              {loading && items.length === 0 ? (
                <div className="px-4 py-10 text-center text-[12px] text-[#64748B]">{language === 'id' ? 'Memuat notifikasi...' : 'Loading notifications...'}</div>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center text-[12px] text-[#64748B]">{language === 'id' ? 'Tidak ada notifikasi.' : 'No notifications.'}</div>
              ) : items.slice(0, 30).map(item => (
                <button key={item.id} type="button" onClick={() => void markRead(item.id)} className={`w-full border-b border-white/[0.05] px-4 py-3 text-left transition-colors hover:bg-white/[0.025] ${(!item.isRead && !item.readAt) ? 'bg-[#E50914]/[0.035]' : ''}`}>
                  <div className="flex gap-3">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${(!item.isRead && !item.readAt) ? 'bg-[#E50914]' : 'bg-[#334155]'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold text-white">{item.title || item.type || (language === 'id' ? 'Notifikasi sistem' : 'System notification')}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#8A94A6]">{item.message || ''}</p>
                      {item.createdAt && <p className="mt-1.5 text-[10px] text-[#64748B]">{new Date(item.createdAt).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
