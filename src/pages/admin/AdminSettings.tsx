import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  KeyRound, 
  ShieldCheck, 
  Mail, 
  Globe, 
  Volume2, 
  Activity, 
  Check, 
  AlertCircle, 
  Save, 
  Trash2, 
  Download, 
  Lock, 
  RefreshCw,
  Cpu,
  Server
} from 'lucide-react';
import { 
  getAdminSession, 
  updateAdminCredentials, 
  getAuditLogs, 
  clearAuditLogs, 
  SecurityAuditLog,
  getStoredAdminCredentials
} from '../../lib/adminAuth';
import { getCmsSiteMeta, saveCmsSiteMeta, SiteMetaSettings } from '../../lib/cmsStore';
import { useLanguage } from '../../lib/LanguageContext';

export const AdminSettings: React.FC = () => {
  const { language } = useLanguage();
  const session = getAdminSession();
  const storedCreds = getStoredAdminCredentials();

  // Tab
  const [activeTab, setActiveTab] = useState<'security' | 'meta' | 'audit'>('security');

  // Security Credentials state
  const [username, setUsername] = useState(storedCreds.username);
  const [email, setEmail] = useState(storedCreds.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityStatus, setSecurityStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Meta Settings state
  const [metaSettings, setMetaSettings] = useState<SiteMetaSettings>(getCmsSiteMeta());
  const [metaStatus, setMetaStatus] = useState<string | null>(null);

  // Audit Logs state
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);

  useEffect(() => {
    setLogs(getAuditLogs());
  }, [activeTab]);

  // Handle credentials update
  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityStatus(null);

    if (!currentPassword) {
      setSecurityStatus({ success: false, message: 'Password saat ini wajib diisi untuk verifikasi keamanan.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSecurityStatus({ success: false, message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setSecurityStatus({ success: false, message: 'Password baru minimal 8 karakter.' });
      return;
    }

    setSecurityLoading(true);

    try {
      const res = await updateAdminCredentials(currentPassword, {
        username,
        email,
        newPassword: newPassword || undefined
      });

      if (res.success) {
        setSecurityStatus({ 
          success: true, 
          message: 'Kredensial dan password admin berhasil diperbarui dengan enkripsi aman!' 
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSecurityStatus({ success: false, message: res.error || 'Gagal memperbarui kredensial.' });
      }
    } catch (err: any) {
      setSecurityStatus({ success: false, message: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setSecurityLoading(false);
    }
  };

  // Handle Meta Settings save
  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    saveCmsSiteMeta(metaSettings);
    setMetaStatus('Pengaturan sistem dan metadata website berhasil disimpan!');
    setTimeout(() => setMetaStatus(null), 3000);
  };

  const handleClearLogs = () => {
    if (window.confirm('Hapus seluruh riwayat audit log keamanan?')) {
      clearAuditLogs();
      setLogs([]);
    }
  };

  const handleExportLogs = () => {
    if (logs.length === 0) return;
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kapitech_security_audit_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262930]">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Settings className="text-brand-red" size={24} />
            <span>System Settings & Security</span>
          </h1>
          <p className="text-xs text-[#8A909D] mt-1">
            Konfigurasi akun master admin, endpoint notifikasi, SEO metadata, dan log audit keamanan.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262930] pb-2">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-brand-red text-white font-bold'
              : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
          }`}
        >
          <Lock size={14} />
          <span>Admin Credentials & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('meta')}
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
            activeTab === 'meta'
              ? 'bg-brand-red text-white font-bold'
              : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
          }`}
        >
          <Globe size={14} />
          <span>Site Meta & Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-brand-red text-white font-bold'
              : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
          }`}
        >
          <Activity size={14} />
          <span>Security Audit Trail ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: SECURITY & CREDENTIALS */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-[#16181D] border border-[#262930] rounded-2xl p-6 sm:p-8">
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#262930]">
            <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">Update Admin Master Account</h2>
              <p className="text-xs text-[#8A909D]">Perbarui username, email penerima notifikasi, dan kata sandi master.</p>
            </div>
          </div>

          {securityStatus && (
            <div className={`mb-6 p-4 rounded-xl text-xs font-mono flex items-start gap-2.5 ${
              securityStatus.success 
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' 
                : 'bg-red-950/40 border border-red-500/40 text-red-300'
            }`}>
              {securityStatus.success ? <Check size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
              <span>{securityStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdateSecurity} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">Username Admin</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">Email Admin (Master)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#262930]">
              <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">
                Password Saat Ini (Wajib untuk Verifikasi) *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password admin saat ini..."
                className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">
                  Password Baru (Opsional)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter..."
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru..."
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#5C626E]">
                Password di-hash menggunakan SHA-256 + cryptographic salt.
              </span>

              <button
                type="submit"
                disabled={securityLoading}
                className="px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-mono font-bold hover:bg-brand-red/90 transition-all shadow-md shadow-brand-red/20 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                <span>{securityLoading ? 'Menyimpan...' : 'Simpan Kredensial'}</span>
              </button>
            </div>

          </form>

        </div>
      )}

      {/* TAB 2: SITE META & NOTIFICATIONS */}
      {activeTab === 'meta' && (
        <div className="max-w-2xl bg-[#16181D] border border-[#262930] rounded-2xl p-6 sm:p-8">
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#262930]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">Metadata & Live Configurations</h2>
              <p className="text-xs text-[#8A909D]">Pengaturan SEO, email penerima formulir klien, dan preferensi studio.</p>
            </div>
          </div>

          {metaStatus && (
            <div className="mb-6 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <Check size={14} />
              <span>{metaStatus}</span>
            </div>
          )}

          <form onSubmit={handleSaveMeta} className="space-y-4">
            
            <div>
              <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">SEO Site Title</label>
              <input
                type="text"
                value={metaSettings.siteTitle}
                onChange={(e) => setMetaSettings({ ...metaSettings, siteTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">SEO Meta Description</label>
              <textarea
                rows={3}
                value={metaSettings.siteDescription}
                onChange={(e) => setMetaSettings({ ...metaSettings, siteDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">
                Email Penerima Notifikasi Lead (/contact)
              </label>
              <input
                type="email"
                value={metaSettings.contactReceiverEmail}
                onChange={(e) => setMetaSettings({ ...metaSettings, contactReceiverEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
              />
            </div>

            <div className="pt-3 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={metaSettings.enableSoundAlerts}
                  onChange={(e) => setMetaSettings({ ...metaSettings, enableSoundAlerts: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#0B0C0E] border-[#262930] text-brand-red accent-brand-red"
                />
                <span className="text-xs text-white font-mono">
                  Aktifkan Notifikasi Suara (Chime) saat ada lead baru masuk
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={metaSettings.enableLiveChat}
                  onChange={(e) => setMetaSettings({ ...metaSettings, enableLiveChat: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#0B0C0E] border-[#262930] text-brand-red accent-brand-red"
                />
                <span className="text-xs text-white font-mono">
                  Tampilkan Floating Contact & WhatsApp Widget di pojok kanan bawah
                </span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-mono font-bold hover:bg-brand-red/90 transition-all shadow-md shadow-brand-red/20 flex items-center gap-2"
              >
                <Save size={14} />
                <span>Simpan Pengaturan</span>
              </button>
            </div>

          </form>

        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-[#16181D] border border-[#262930] rounded-2xl p-6 sm:p-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#262930]">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand-red" />
                <span>Security & Activity Audit Trail</span>
              </h2>
              <p className="text-xs text-[#8A909D]">
                Catatan terenkripsi dari aktivitas autentikasi, percobaan brute force, dan perubahan sistem.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportLogs}
                disabled={logs.length === 0}
                className="px-3 py-1.5 rounded-xl bg-[#0B0C0E] hover:bg-[#20232B] text-white border border-[#262930] text-xs font-mono transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Download size={13} />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleClearLogs}
                disabled={logs.length === 0}
                className="px-3 py-1.5 rounded-xl bg-[#0B0C0E] hover:bg-red-950/40 text-[#8A909D] hover:text-red-400 border border-[#262930] hover:border-red-500/40 text-xs font-mono transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>Hapus Log</span>
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center text-[#8A909D] text-xs font-mono">
              Belum ada log aktivitas keamanan yang tercatat.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#0B0C0E] border border-[#262930] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        log.severity === 'critical' 
                          ? 'bg-red-950 text-red-400 border border-red-500/40' 
                          : log.severity === 'warning' 
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/40' 
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-[#8A909D] text-[11px] font-semibold">{log.actor}</span>
                    </div>
                    <p className="text-gray-300 text-xs">{log.details}</p>
                  </div>

                  <div className="text-[10px] text-[#5C626E] shrink-0 sm:text-right">
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
export default AdminSettings;
