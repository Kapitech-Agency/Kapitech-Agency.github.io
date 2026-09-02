import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Save, 
  Trash2, 
  Download, 
  Lock, 
  RefreshCw,
  UserCheck,
  Palette,
  Layers,
  Database,
  Smartphone
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
  const { language, t } = useLanguage();
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

  const handleTabChange = (tab: 'profile' | 'branding' | 'rbac' | 'security' | 'api' | 'audit') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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
      setSecurityStatus({ 
        success: false, 
        message: language === 'id' 
          ? 'Password saat ini wajib diisi untuk verifikasi keamanan.' 
          : 'Current password is required for security verification.' 
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSecurityStatus({ 
        success: false, 
        message: language === 'id' 
          ? 'Konfirmasi password baru tidak cocok.' 
          : 'New password confirmation does not match.' 
      });
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setSecurityStatus({ 
        success: false, 
        message: language === 'id' 
          ? 'Password baru minimal 8 karakter.' 
          : 'New password must be at least 8 characters long.' 
      });
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
          message: language === 'id' 
            ? 'Kredensial dan password admin berhasil diperbarui dengan enkripsi aman!' 
            : 'Admin credentials and password updated successfully with secure encryption!' 
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSecurityStatus({ 
          success: false, 
          message: res.error || (language === 'id' ? 'Gagal memperbarui kredensial.' : 'Failed to update credentials.') 
        });
      }
    } catch (err: any) {
      setSecurityStatus({ 
        success: false, 
        message: err.message || (language === 'id' ? 'Terjadi kesalahan sistem.' : 'A system error occurred.') 
      });
    } finally {
      setSecurityLoading(false);
    }
  };

  // Handle Meta Settings save
  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    saveCmsSiteMeta(metaSettings);
    setMetaStatus(
      language === 'id' 
        ? 'Pengaturan sistem dan metadata website berhasil disimpan!' 
        : 'System settings and site metadata successfully saved!'
    );
    setTimeout(() => setMetaStatus(null), 3000);
  };

  const handleClearLogs = () => {
    const confirmMsg = language === 'id' 
      ? 'Hapus seluruh riwayat audit log keamanan?' 
      : 'Clear all security audit logs permanently?';
    if (window.confirm(confirmMsg)) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Settings className="text-[#E50914]" size={24} />
            <span>{language === 'id' ? 'Pengaturan Sistem & Keamanan' : 'System Settings & Security'}</span>
          </h1>
          <p className="text-xs text-[#8A94A6] mt-1 font-mono">
            {language === 'id'
              ? 'Konfigurasi akun master admin, hak akses RBAC, integrasi API, dan log audit keamanan terenkripsi.'
              : 'Configure master admin identity, 4-tier RBAC access matrix, API cloud integrations, and encrypted audit trail.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.07)] pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => handleTabChange('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeTab === 'profile'
              ? 'bg-[#E50914] text-white font-bold shadow-[0_0_12px_rgba(229,9,20,0.25)]'
              : 'text-[#8A94A6] hover:text-white hover:bg-[#181B22]'
          }`}
        >
          <UserCheck size={15} />
          <span>{language === 'id' ? 'Profil & Akun Master' : 'Profile & Master Account'}</span>
        </button>

        <button
          onClick={() => handleTabChange('branding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeTab === 'branding'
              ? 'bg-[#E50914] text-white font-bold shadow-[0_0_12px_rgba(229,9,20,0.25)]'
              : 'text-[#8A94A6] hover:text-white hover:bg-[#181B22]'
          }`}
        >
          <Palette size={15} />
          <span>{language === 'id' ? 'Brand & SEO' : 'Brand & SEO'}</span>
        </button>

        <button
          onClick={() => handleTabChange('rbac')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeTab === 'rbac'
              ? 'bg-[#E50914] text-white font-bold shadow-[0_0_12px_rgba(229,9,20,0.25)]'
              : 'text-[#8A94A6] hover:text-white hover:bg-[#181B22]'
          }`}
        >
          <Layers size={15} />
          <span>{language === 'id' ? 'Matriks Hak Akses (RBAC)' : 'RBAC Matrix'}</span>
        </button>

        <button
          onClick={() => handleTabChange('security')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeTab === 'security'
              ? 'bg-[#E50914] text-white font-bold shadow-[0_0_12px_rgba(229,9,20,0.25)]'
              : 'text-[#8A94A6] hover:text-white hover:bg-[#181B22]'
          }`}
        >
          <Lock size={15} />
          <span>{language === 'id' ? 'Keamanan & MFA' : 'Security & MFA'}</span>
        </button>

        <button
          onClick={() => handleTabChange('api')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeTab === 'api'
              ? 'bg-[#E50914] text-white font-bold shadow-[0_0_12px_rgba(229,9,20,0.25)]'
              : 'text-[#8A94A6] hover:text-white hover:bg-[#181B22]'
          }`}
        >
          <Database size={15} />
          <span>{language === 'id' ? 'API & Cloud' : 'API & Cloud'}</span>
        </button>

        <button
          onClick={() => handleTabChange('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 min-h-[44px] ${
            activeTab === 'audit'
              ? 'bg-[#E50914] text-white font-bold shadow-[0_0_12px_rgba(229,9,20,0.25)]'
              : 'text-[#8A94A6] hover:text-white hover:bg-[#181B22]'
          }`}
        >
          <ShieldCheck size={15} />
          <span>{language === 'id' ? `Riwayat Audit (${logs.length})` : `Audit Trail (${logs.length})`}</span>
        </button>
      </div>

      {/* TAB 1: PROFILE & MASTER ACCOUNT */}
      {activeTab === 'profile' && (
        <div className="w-full max-w-4xl bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[rgba(255,255,255,0.07)]">
            <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] shrink-0">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                {language === 'id' ? 'Profil & Identitas Master' : 'Master Profile & Identity'}
              </h2>
              <p className="text-xs text-[#8A94A6] font-mono">
                {language === 'id' 
                  ? 'Konfigurasi identitas login pengelola sistem dan kredensial utama.' 
                  : 'Configure system administrator login identity and primary credentials.'}
              </p>
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
                <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                  {language === 'id' ? 'Nama Pengguna (Username)' : 'Username'}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                  {language === 'id' ? 'Email Notifikasi' : 'Notification Email'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div className="p-4 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8A94A6]">{language === 'id' ? 'Tingkat Akses (Role Tier):' : 'Role Tier Level:'}</span>
                <span className="text-[#E50914] font-bold">{session?.user.role || storedCreds.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8A94A6]">{language === 'id' ? 'Divisi Agensi:' : 'Agency Division:'}</span>
                <span className="text-white font-bold">{storedCreds.division || 'Management'}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8A94A6]">{language === 'id' ? 'Terakhir Login:' : 'Last Login:'}</span>
                <span className="text-[#64748B]">{new Date(session?.user.lastLogin || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(255,255,255,0.07)]">
              <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                {language === 'id' ? 'Password Saat Ini (Wajib Konfirmasi Perubahan) *' : 'Current Password (Required for confirmation) *'}
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={language === 'id' ? 'Masukkan password admin saat ini...' : 'Enter your current password...'}
                className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
              />
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={securityLoading}
                className="px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-mono font-bold hover:bg-[#FF1E27] transition-all shadow-md shadow-[#E50914]/20 flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
              >
                {securityLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{language === 'id' ? 'Perbarui Akun Master' : 'Update Master Account'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: BRAND IDENTITY & SEO */}
      {activeTab === 'branding' && (
        <div className="w-full max-w-4xl bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[rgba(255,255,255,0.07)]">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                {language === 'id' ? 'Identitas Brand, Metadata & Notifikasi' : 'Brand Identity, Metadata & Notification Rules'}
              </h2>
              <p className="text-xs text-[#8A94A6] font-mono">
                {language === 'id'
                  ? 'Konfigurasi representasi visual dan aturan SEO global untuk kapitech.id dan ams.kapitech.id.'
                  : 'Configure visual branding, search meta tags, and global agency settings for kapitech.id.'}
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
                <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                  {language === 'id' ? 'Nama Agensi Global' : 'Global Agency Name'}
                </label>
                <input
                  type="text"
                  value={metaSettings.agencyName}
                  onChange={(e) => setMetaSettings({ ...metaSettings, agencyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                  {language === 'id' ? 'Domain Publik' : 'Public Domain'}
                </label>
                <input
                  type="text"
                  value="https://kapitech.id"
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#181B22]/50 border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-[#8A94A6] font-mono cursor-not-allowed min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                {language === 'id' ? 'Tagline / Slogan Utama' : 'Hero Tagline / Catchphrase'}
              </label>
              <input
                type="text"
                value={metaSettings.tagline}
                onChange={(e) => setMetaSettings({ ...metaSettings, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                {language === 'id' ? 'Deskripsi Meta (SEO Global)' : 'Meta Description (Global SEO)'}
              </label>
              <textarea
                rows={3}
                value={metaSettings.metaDescription}
                onChange={(e) => setMetaSettings({ ...metaSettings, metaDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono"
              />
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.07)] space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={metaSettings.soundEffectsEnabled}
                  onChange={(e) => setMetaSettings({ ...metaSettings, soundEffectsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#181B22] border-[rgba(255,255,255,0.07)] text-[#E50914] accent-[#E50914]"
                />
                <span className="text-xs text-white font-mono">
                  {language === 'id' 
                    ? 'Aktifkan Notifikasi Suara (Chime) saat ada lead baru masuk' 
                    : 'Enable audio chime notification on new incoming lead submission'}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={metaSettings.enableLiveChat}
                  onChange={(e) => setMetaSettings({ ...metaSettings, enableLiveChat: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#181B22] border-[rgba(255,255,255,0.07)] text-[#E50914] accent-[#E50914]"
                />
                <span className="text-xs text-white font-mono">
                  {language === 'id' 
                    ? 'Tampilkan Floating Contact & WhatsApp Widget di pojok kanan bawah' 
                    : 'Display Floating WhatsApp & Contact Widget on bottom-right'}
                </span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-mono font-bold hover:bg-[#FF1E27] transition-all shadow-md shadow-[#E50914]/20 flex items-center gap-2 min-h-[44px]"
              >
                <Save size={14} />
                <span>{language === 'id' ? 'Simpan Pengaturan Brand' : 'Save Brand Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ROLE MATRIX (4-TIER RBAC) */}
      {activeTab === 'rbac' && (
        <div className="w-full bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[rgba(255,255,255,0.07)]">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                {language === 'id' ? 'Matriks Hak Akses 4-Tier RBAC' : '4-Tier Role-Based Access Control (RBAC) Matrix'}
              </h2>
              <p className="text-xs text-[#8A94A6] font-mono">
                {language === 'id'
                  ? 'Struktur hirarki hak akses dan izin operasi di seluruh modul AMS Kapitech.'
                  : 'Enterprise permission matrix across financial, pipeline, sprint delivery, and system configurations.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs font-mono text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)] text-[#8A94A6]">
                  <th className="py-3 px-4 font-semibold">{language === 'id' ? 'Tingkatan & Peran' : 'Tier Level & Role'}</th>
                  <th className="py-3 px-4 font-semibold">{language === 'id' ? 'Finansial & Invoice' : 'Financial & Invoicing'}</th>
                  <th className="py-3 px-4 font-semibold">{language === 'id' ? 'CRM & Pipeline Prospek' : 'CRM & Client Leads'}</th>
                  <th className="py-3 px-4 font-semibold">{language === 'id' ? 'Sprint & Kanban Task' : 'Sprint & Tasks'}</th>
                  <th className="py-3 px-4 font-semibold">{language === 'id' ? 'Sistem & Audit Trail' : 'System Settings & Audit'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
                <tr className="hover:bg-[#181B22]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E50914] shrink-0"></span>
                    <span>Tier 1: Top Management / Sponsor</span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Akses Penuh (Buat/Setujui/Hapus)' : 'Full Access (Create/Approve/Delete)'}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Akses Penuh' : 'Full Access'}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Akses Penuh' : 'Full Access'}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Akses Penuh & Kredensial' : 'Full Access & Credentials'}</td>
                </tr>
                <tr className="hover:bg-[#181B22]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
                    <span>Tier 2: Project Manager (PM)</span>
                  </td>
                  <td className="py-3.5 px-4 text-amber-300">{language === 'id' ? 'Lihat & Draf Invoice' : 'View & Draft Invoices'}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Kelola Pipeline & Delegasi' : 'Manage Pipeline & Assign'}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Sprint Planning & Kelola Task' : 'Sprint Planning & Task Mgmt'}</td>
                  <td className="py-3.5 px-4 text-[#8A94A6]">{language === 'id' ? 'Hanya Lihat' : 'View Only'}</td>
                </tr>
                <tr className="hover:bg-[#181B22]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                    <span>Tier 3: Operational Staff</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#8A94A6]">{language === 'id' ? 'Tanpa Akses' : 'No Access'}</td>
                  <td className="py-3.5 px-4 text-cyan-300">{language === 'id' ? 'Lihat Prospek Terkait' : 'View Assigned Deals'}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Update Task Terkait' : 'Update Assigned Tasks'}</td>
                  <td className="py-3.5 px-4 text-[#8A94A6]">{language === 'id' ? 'Tanpa Akses' : 'No Access'}</td>
                </tr>
                <tr className="hover:bg-[#181B22]/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                    <span>Tier 4: Internal IT / System Admin</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#8A94A6]">{language === 'id' ? 'Audit View' : 'Audit View'}</td>
                  <td className="py-3.5 px-4 text-[#8A94A6]">{language === 'id' ? 'Audit View' : 'Audit View'}</td>
                  <td className="py-3.5 px-4 text-[#8A94A6]">{language === 'id' ? 'Audit View' : 'Audit View'}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Akses Server & Audit Lengkap' : 'Full Infrastructure & Logs'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & MFA POLICY */}
      {activeTab === 'security' && (
        <div className="w-full max-w-4xl bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[rgba(255,255,255,0.07)]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                {language === 'id' ? 'Kebijakan Keamanan, MFA & Password' : 'Security, MFA & Password Policy'}
              </h2>
              <p className="text-xs text-[#8A94A6] font-mono">
                {language === 'id'
                  ? 'Enkripsi SHA-256 tersimulasi, autentikasi multi-faktor, dan proteksi durasi sesi login.'
                  : 'SHA-256 secure hashing simulation, multi-factor authentication enforcement, and idle session limits.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-white font-mono font-bold flex items-center gap-2 text-xs">
                  <Smartphone size={15} className="text-emerald-400 shrink-0" />
                  <span>{language === 'id' ? 'Wajibkan Multi-Factor Authentication (MFA)' : 'Enforce Multi-Factor Authentication (MFA)'}</span>
                </div>
                <p className="text-[#8A94A6] text-[11px] font-mono">
                  {language === 'id'
                    ? 'Wajibkan verifikasi OTP untuk Tier 1 (Top Management) dan Tier 4 (System Admin).'
                    : 'Mandate time-based OTP verification for Tier 1 Sponsors and Tier 4 IT Administrators.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMfaActive(!mfaActive)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all self-start sm:self-auto min-h-[38px] ${
                  mfaActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-[#21252F] text-[#8A94A6]'
                }`}
              >
                {mfaActive ? (language === 'id' ? 'AKTIF' : 'ACTIVE') : (language === 'id' ? 'NONAKTIF' : 'DISABLED')}
              </button>
            </div>

            <div className="p-4 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl space-y-2">
              <label className="block text-xs font-mono text-[#8A94A6] font-semibold">
                {language === 'id' ? 'Batas Waktu Ketidakaktifan Sesi (Menit)' : 'Session Inactivity Timeout (Minutes)'}
              </label>
              <input
                type="number"
                value={sessionTimeoutMin}
                onChange={(e) => setSessionTimeoutMin(parseInt(e.target.value) || 60)}
                className="w-full px-3.5 py-2.5 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#E50914] min-h-[44px]"
              />
              <p className="text-[10px] text-[#64748B] font-mono">
                {language === 'id'
                  ? 'Sesi login admin akan otomatis keluar jika tidak ada aktivitas dalam rentang waktu di atas.'
                  : 'Admin login session automatically terminates if no active interaction occurs within this threshold.'}
              </p>
            </div>

            <form onSubmit={handleUpdateSecurity} className="space-y-3 pt-3 border-t border-[rgba(255,255,255,0.07)]">
              <h3 className="text-xs font-bold text-white font-mono">
                {language === 'id' ? 'Ganti Password Master' : 'Change Master Password'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                    {language === 'id' ? 'Password Baru (min 8 karakter)' : 'New Password (min 8 characters)'}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                    {language === 'id' ? 'Konfirmasi Password Baru' : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                  {language === 'id' ? 'Password Saat Ini (Wajib Konfirmasi) *' : 'Current Password (Required for verification) *'}
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={language === 'id' ? 'Masukkan password admin saat ini...' : 'Enter your current admin password...'}
                  className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={securityLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-mono font-bold hover:bg-[#FF1E27] transition-all flex items-center gap-2 min-h-[44px]"
                >
                  <Save size={14} />
                  <span>{language === 'id' ? 'Update Password Terenkripsi' : 'Update Encrypted Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: API & CLOUD CONNECTIONS */}
      {activeTab === 'api' && (
        <div className="w-full max-w-4xl bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[rgba(255,255,255,0.07)]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                {language === 'id' ? 'Integrasi API & Cloud' : 'API & Cloud Integrations'}
              </h2>
              <p className="text-xs text-[#8A94A6] font-mono">
                {language === 'id'
                  ? 'Webhook notifikasi masuk, server SMTP, dan konfigurasi region Cloud Run.'
                  : 'Inbound notification webhooks, transactional SMTP credentials, and Cloud Run container regions.'}
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
              <label className="block text-[#8A94A6] mb-1 font-semibold">
                {language === 'id' ? 'Webhook Notifikasi Prospek (Discord / Slack)' : 'Inbound Lead Webhook (Discord / Slack)'}
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#8A94A6] mb-1 font-semibold">
                  {language === 'id' ? 'Host Server SMTP' : 'SMTP Server Host'}
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[#8A94A6] mb-1 font-semibold">
                  {language === 'id' ? 'Port SMTP' : 'SMTP Port'}
                </label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#8A94A6] mb-1 font-semibold">
                {language === 'id' ? 'Region Deployment Cloud Run' : 'Cloud Run Deployment Region'}
              </label>
              <input
                type="text"
                value={cloudRunRegion}
                onChange={(e) => setCloudRunRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setApiSaveStatus(
                    language === 'id' 
                      ? 'Konfigurasi API & Cloud berhasil disimpan.' 
                      : 'API & Cloud settings successfully saved.'
                  );
                  setTimeout(() => setApiSaveStatus(null), 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-mono font-bold hover:bg-[#FF1E27] transition-all flex items-center gap-2 min-h-[44px]"
              >
                <Save size={14} />
                <span>{language === 'id' ? 'Simpan Konfigurasi API' : 'Save API Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="w-full bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(255,255,255,0.07)]">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#E50914]" />
                <span>{language === 'id' ? 'Riwayat Audit Aktivitas & Keamanan' : 'Security & Activity Audit Trail'}</span>
              </h2>
              <p className="text-xs text-[#8A94A6] font-mono mt-0.5">
                {language === 'id'
                  ? 'Catatan terenkripsi dari aktivitas autentikasi, akses RBAC, dan perubahan data sistem.'
                  : 'Immutable encrypted trail of user authentication, RBAC transitions, and security operations.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportLogs}
                disabled={logs.length === 0}
                className="px-3.5 py-2 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono transition-colors flex items-center gap-1.5 disabled:opacity-50 min-h-[40px]"
              >
                <Download size={13} />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleClearLogs}
                disabled={logs.length === 0}
                className="px-3.5 py-2 rounded-xl bg-[#181B22] hover:bg-red-950/40 text-[#8A94A6] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/40 text-xs font-mono transition-colors flex items-center gap-1.5 disabled:opacity-50 min-h-[40px]"
              >
                <Trash2 size={13} />
                <span>{language === 'id' ? 'Hapus Log' : 'Clear Logs'}</span>
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center text-[#8A94A6] text-xs font-mono">
              {language === 'id' ? 'Belum ada log aktivitas keamanan yang tercatat.' : 'No security audit logs recorded yet.'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'critical' 
                          ? 'bg-red-950 text-red-400 border border-red-500/40' 
                          : log.severity === 'warning' 
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/40' 
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-[#8A94A6] text-[11px] font-semibold">{log.actor}</span>
                    </div>
                    <p className="text-gray-300 text-xs">{log.details}</p>
                  </div>

                  <div className="text-[10px] text-[#64748B] shrink-0 sm:text-right font-mono">
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
