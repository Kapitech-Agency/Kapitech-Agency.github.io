import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Server,
  UserCheck,
  Palette,
  Layers,
  Key,
  Database,
  Smartphone
} from 'lucide-react';
import { 
  getAdminSession, 
  updateAdminCredentials, 
  getAuditLogs, 
  clearAuditLogs, 
  SecurityAuditLog,
  getStoredAdminCredentials,
  AdminTier
} from '../../lib/adminAuth';
import { getCmsSiteMeta, saveCmsSiteMeta, SiteMetaSettings } from '../../lib/cmsStore';
import { useLanguage } from '../../lib/LanguageContext';

export const AdminSettings: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getAdminSession();
  const storedCreds = getStoredAdminCredentials();

  // Tab: profile, branding, rbac, security, api, audit
  const paramTab = searchParams.get('tab');
  const initialTab = (
    paramTab === 'team' || paramTab === 'rbac' ? 'rbac' :
    paramTab === 'audit' ? 'audit' :
    paramTab === 'system' || paramTab === 'branding' ? 'branding' :
    paramTab === 'security' ? 'security' :
    paramTab === 'api' ? 'api' : 'profile'
  ) as 'profile' | 'branding' | 'rbac' | 'security' | 'api' | 'audit';

  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'rbac' | 'security' | 'api' | 'audit'>(initialTab);

  useEffect(() => {
    if (paramTab) {
      if (paramTab === 'team' || paramTab === 'rbac') setActiveTab('rbac');
      else if (paramTab === 'audit') setActiveTab('audit');
      else if (paramTab === 'system' || paramTab === 'branding') setActiveTab('branding');
      else if (paramTab === 'security') setActiveTab('security');
      else if (paramTab === 'api') setActiveTab('api');
      else if (paramTab === 'profile') setActiveTab('profile');
    }
  }, [paramTab]);

  // Security Credentials state
  const [username, setUsername] = useState(storedCreds.username);
  const [email, setEmail] = useState(storedCreds.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityStatus, setSecurityStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Security / MFA state
  const [mfaActive, setMfaActive] = useState(storedCreds.mfaEnabled ?? true);
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState(120);

  // Meta & Branding Settings state
  const [metaSettings, setMetaSettings] = useState<SiteMetaSettings>(getCmsSiteMeta());
  const [metaStatus, setMetaStatus] = useState<string | null>(null);

  // API Connections state
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [webhookUrl, setWebhookUrl] = useState('https://discord.com/api/webhooks/kapitech-agency-leads');
  const [cloudRunRegion, setCloudRunRegion] = useState('asia-southeast2 (Jakarta)');
  const [apiSaveStatus, setApiSaveStatus] = useState<string | null>(null);

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
            Konfigurasi akun master admin, hak akses RBAC, integrasi API, dan log audit keamanan terenkripsi.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262930] pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'profile'
              ? 'bg-brand-red text-white font-bold'
              : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
          }`}
        >
          <UserCheck size={14} />
          <span>Profile & Master</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'branding'
              ? 'bg-brand-red text-white font-bold'
              : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
          }`}
        >
          <Palette size={14} />
          <span>Brand & SEO</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'rbac'
              ? 'bg-brand-red text-white font-bold'
              : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
          }`}
        >
          <Layers size={14} />
          <span>RBAC Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'security'
              ? 'bg-brand-red text-white font-bold'
              : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
          }`}
        >
          <Lock size={14} />
          <span>Security & MFA</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'api'
              ? 'bg-brand-red text-white font-bold'
              : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
          }`}
        >
          <Database size={14} />
          <span>API & Cloud</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'audit'
              ? 'bg-brand-red text-white font-bold'
              : 'text-[#8A909D] hover:text-white hover:bg-[#16181D]'
          }`}
        >
          <Activity size={14} />
          <span>Audit Trail ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: PROFILE & MASTER ACCOUNT */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-[#16181D] border border-[#262930] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#262930]">
            <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">Master Profile & Identity</h2>
              <p className="text-xs text-[#8A909D]">Konfigurasi identitas login pengelola sistem dan kredensial utama.</p>
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
                <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">Email Notifikasi</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-[#0B0C0E] border border-[#262930] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A909D] font-mono">Tingkat Akses (Role Tier):</span>
                <span className="text-xs text-brand-red font-mono font-bold">{session?.user.role || storedCreds.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A909D] font-mono">Divisi Agensi:</span>
                <span className="text-xs text-white font-mono font-bold">{storedCreds.division || 'Management'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A909D] font-mono">Terakhir Login:</span>
                <span className="text-xs text-[#5C626E] font-mono">{new Date(session?.user.lastLogin || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#262930]">
              <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">
                Password Saat Ini (Wajib untuk Verifikasi Perubahan) *
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

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={securityLoading}
                className="px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-mono font-bold hover:bg-brand-red/90 transition-all shadow-md shadow-brand-red/20 flex items-center gap-2 disabled:opacity-50"
              >
                {securityLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Perbarui Akun Master</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: BRAND IDENTITY & SEO */}
      {activeTab === 'branding' && (
        <div className="max-w-3xl bg-[#16181D] border border-[#262930] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#262930]">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">Brand Identity, Metadata & Notification Rules</h2>
              <p className="text-xs text-[#8A909D]">
                Konfigurasi representasi visual dan aturan SEO global untuk kapitech.id dan ams.kapitech.id.
              </p>
            </div>
          </div>

          {metaStatus && (
            <div className="mb-6 p-4 rounded-xl text-xs font-mono flex items-start gap-2.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
              <Check size={16} className="shrink-0 mt-0.5" />
              <span>{metaStatus}</span>
            </div>
          )}

          <form onSubmit={handleSaveMeta} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">Nama Agensi Global</label>
                <input
                  type="text"
                  value={metaSettings.agencyName}
                  onChange={(e) => setMetaSettings({ ...metaSettings, agencyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">Public Domain</label>
                <input
                  type="text"
                  value="https://kapitech.id"
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E]/50 border border-[#262930] rounded-xl text-xs text-[#8A909D] font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">Hero Tagline / Catchphrase</label>
              <input
                type="text"
                value={metaSettings.tagline}
                onChange={(e) => setMetaSettings({ ...metaSettings, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">Meta Description (SEO)</label>
              <textarea
                rows={3}
                value={metaSettings.metaDescription}
                onChange={(e) => setMetaSettings({ ...metaSettings, metaDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
              />
            </div>

            <div className="pt-4 border-t border-[#262930] space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={metaSettings.soundEffectsEnabled}
                  onChange={(e) => setMetaSettings({ ...metaSettings, soundEffectsEnabled: e.target.checked })}
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
                <span>Simpan Pengaturan Brand</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ROLE MATRIX (4-TIER RBAC) */}
      {activeTab === 'rbac' && (
        <div className="bg-[#16181D] border border-[#262930] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#262930]">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">4-Tier Role-Based Access Control (RBAC) Matrix</h2>
              <p className="text-xs text-[#8A909D]">
                Struktur hirarki hak akses dan izin operasi di seluruh modul AMS Kapitech.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262930] text-[#8A909D]">
                  <th className="py-3 px-4 font-semibold">Tier Level & Role</th>
                  <th className="py-3 px-4 font-semibold">Financial & Invoicing</th>
                  <th className="py-3 px-4 font-semibold">CRM & Client Leads</th>
                  <th className="py-3 px-4 font-semibold">Sprint & Tasks</th>
                  <th className="py-3 px-4 font-semibold">System Settings & Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262930]">
                <tr className="hover:bg-[#121418]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-red"></span>
                    <span>Tier 1: Top Management / Sponsor</span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">Full Access (Create/Approve/Delete)</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">Full Access</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">Full Access</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">Full Access & Credentials</td>
                </tr>
                <tr className="hover:bg-[#121418]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span>Tier 2: Project Manager (PM)</span>
                  </td>
                  <td className="py-3.5 px-4 text-amber-300">View & Draft Invoices</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">Manage Pipeline & Assign</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">Sprint Planning & Task Mgmt</td>
                  <td className="py-3.5 px-4 text-[#8A909D]">View Only</td>
                </tr>
                <tr className="hover:bg-[#121418]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>Tier 3: Operational Staff</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#8A909D]">No Access</td>
                  <td className="py-3.5 px-4 text-cyan-300">View Assigned Deals</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">Update Assigned Tasks</td>
                  <td className="py-3.5 px-4 text-[#8A909D]">No Access</td>
                </tr>
                <tr className="hover:bg-[#121418]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Tier 4: Internal IT / System Admin</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#8A909D]">Audit View</td>
                  <td className="py-3.5 px-4 text-[#8A909D]">Audit View</td>
                  <td className="py-3.5 px-4 text-[#8A909D]">Audit View</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">Full Infrastructure & Logs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & MFA POLICY */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-[#16181D] border border-[#262930] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#262930]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">Security, MFA & Password Policy</h2>
              <p className="text-xs text-[#8A909D]">
                Enkripsi SHA-256 tersimulasi, autentikasi multi-faktor, dan proteksi sesi.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#0B0C0E] border border-[#262930] rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-white font-mono font-bold flex items-center gap-2">
                  <Smartphone size={14} className="text-emerald-400" />
                  <span>Enforce Multi-Factor Authentication (MFA)</span>
                </div>
                <p className="text-[#8A909D] text-[11px] font-mono">
                  Wajibkan verifikasi OTP untuk Tier 1 (Top Management) dan Tier 4 (System Admin).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMfaActive(!mfaActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  mfaActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-[#1E2128] text-[#8A909D]'
                }`}
              >
                {mfaActive ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>

            <div className="p-4 bg-[#0B0C0E] border border-[#262930] rounded-xl space-y-2">
              <label className="block text-xs font-mono text-[#8A909D] font-semibold">
                Session Inactivity Timeout (Menit)
              </label>
              <input
                type="number"
                value={sessionTimeoutMin}
                onChange={(e) => setSessionTimeoutMin(parseInt(e.target.value) || 60)}
                className="w-full px-3.5 py-2.5 bg-[#121418] border border-[#262930] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-red"
              />
              <p className="text-[10px] text-[#5C626E] font-mono">
                Sesi login admin akan otomatis keluar jika tidak ada aktivitas dalam rentang waktu di atas.
              </p>
            </div>

            <form onSubmit={handleUpdateSecurity} className="space-y-3 pt-3 border-t border-[#262930]">
              <h3 className="text-xs font-bold text-white font-mono">Ganti Password Master</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">Password Baru (min 8 char)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8A909D] mb-1 font-semibold">
                  Password Saat Ini (Wajib Konfirmasi) *
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

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-mono font-bold hover:bg-brand-red/90 transition-all flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>Update Password Terenkripsi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: API & CLOUD CONNECTIONS */}
      {activeTab === 'api' && (
        <div className="max-w-2xl bg-[#16181D] border border-[#262930] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#262930]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">API & Cloud Integrations</h2>
              <p className="text-xs text-[#8A909D]">
                Webhook notifikasi masuk, server SMTP, dan konfigurasi Cloud Run container.
              </p>
            </div>
          </div>

          {apiSaveStatus && (
            <div className="p-4 rounded-xl text-xs font-mono flex items-start gap-2.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
              <Check size={16} className="shrink-0 mt-0.5" />
              <span>{apiSaveStatus}</span>
            </div>
          )}

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[#8A909D] mb-1 font-semibold">Inbound Lead Webhook (Discord / Slack)</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-mono"
                />
              </div>

              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">SMTP Port</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#8A909D] mb-1 font-semibold">Cloud Run Deployment Region</label>
              <input
                type="text"
                value={cloudRunRegion}
                onChange={(e) => setCloudRunRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red font-mono"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setApiSaveStatus('Konfigurasi API & Cloud berhasil disimpan.');
                  setTimeout(() => setApiSaveStatus(null), 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-mono font-bold hover:bg-brand-red/90 transition-all flex items-center gap-2"
              >
                <Save size={14} />
                <span>Simpan Konfigurasi API</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
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
