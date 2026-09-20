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
  Smartphone,
  UserPlus,
  X,
  Key,
  Edit3,
  Shield,
  Briefcase,
  Terminal,
  Users
} from 'lucide-react';
import { 
  getAdminSession, 
  updateAdminCredentials, 
  fetchServerAuditLogs,
  SecurityAuditLog,
  getStoredAdminCredentials,
  AdminAccount,
  AdminTier,
  fetchAdminAccounts,
  createAdminAccount,
  deleteAdminAccount
} from '../../lib/adminAuth';
import { getCmsSiteMeta, saveCmsSiteMeta, SiteMetaSettings } from '../../lib/cmsStore';
import { useLanguage } from '../../lib/LanguageContext';
import { api } from '../../lib/apiClient';

export const AdminSettings: React.FC = () => {
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getAdminSession();
  const storedCreds = getStoredAdminCredentials();

  // Tab: profile, branding, rbac, security, api, audit
  const paramTab = searchParams.get('tab');

  const canManageAccounts = session?.user?.stakeholderType === 'Master' || Boolean(session?.user?.permissions?.canManageAdminAccounts);
  const canManageCms = session?.user?.stakeholderType === 'Master' || Boolean(session?.user?.permissions?.canManageCmsContent);
  const canAccessServer = session?.user?.stakeholderType === 'Master' || Boolean(session?.user?.permissions?.canAccessServerAndApi);
  const canViewAudit = session?.user?.stakeholderType === 'Master' || Boolean(session?.user?.permissions?.canViewSecurityAuditLogs);

  const initialTab = (
    (paramTab === 'team' || paramTab === 'rbac') && canManageAccounts ? 'rbac' :
    paramTab === 'audit' && canViewAudit ? 'audit' :
    (paramTab === 'system' || paramTab === 'branding') && canManageCms ? 'branding' :
    paramTab === 'security' ? 'security' :
    paramTab === 'api' && canAccessServer ? 'api' : 'profile'
  ) as 'profile' | 'branding' | 'rbac' | 'security' | 'api' | 'audit';

  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'rbac' | 'security' | 'api' | 'audit'>(initialTab);

  const handleTabChange = (tab: 'profile' | 'branding' | 'rbac' | 'security' | 'api' | 'audit') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (!paramTab) return;
    if ((paramTab === 'team' || paramTab === 'rbac') && canManageAccounts) setActiveTab('rbac');
    else if (paramTab === 'audit' && canViewAudit) setActiveTab('audit');
    else if ((paramTab === 'system' || paramTab === 'branding') && canManageCms) setActiveTab('branding');
    else if (paramTab === 'security') setActiveTab('security');
    else if (paramTab === 'api' && canAccessServer) setActiveTab('api');
    else if (paramTab === 'profile') setActiveTab('profile');
    else setActiveTab('profile');
  }, [paramTab, canManageAccounts, canManageCms, canAccessServer, canViewAudit]);

  // Security Credentials state
  const [username, setUsername] = useState(storedCreds.username);
  const [email, setEmail] = useState(storedCreds.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityStatus, setSecurityStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Meta & Branding Settings state
  const [metaSettings, setMetaSettings] = useState<SiteMetaSettings>(getCmsSiteMeta());
  const [metaStatus, setMetaStatus] = useState<string | null>(null);

  // Audit Logs state
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [auditIntegrity, setAuditIntegrity] = useState<{ valid: boolean; checked: number; brokenAt?: string } | null>(null);

  const [mfaSetup, setMfaSetup] = useState<{ secret: string; otpAuthUri: string } | null>(null);
  const [mfaRecoveryCodes, setMfaRecoveryCodes] = useState<string[]>([]);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaDisableCode, setMfaDisableCode] = useState('');
  const [mfaDisablePassword, setMfaDisablePassword] = useState('');
  const [mfaStatus, setMfaStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [mfaLoading, setMfaLoading] = useState(false);
  const mfaRequired = searchParams.get('mfaRequired') === '1' || !Boolean(session?.user?.mfaEnabled);

  const [backupStatus, setBackupStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupSummary, setBackupSummary] = useState<{
    count: number;
    latestAt?: string;
    latestSizeBytes?: number;
    retention: number;
    encryptedAtRest: boolean;
    privateDocumentEncryption: boolean;
  } | null>(null);
  const [backupIntegrity, setBackupIntegrity] = useState<{ valid: boolean; checkedAt: string; reason?: string } | null>(null);
  const [securityPosture, setSecurityPosture] = useState<{
    encryptionAtRest: boolean;
    privateDocumentEncryption: boolean;
    mfaRequired: boolean;
    activeUserCount: number;
    mfaEnabledCount: number;
    mfaCoveragePercent: number;
    backupCount: number;
    latestBackupAt: string | null;
    backupIntegrity: { valid: boolean; checkedAt: string; latestName?: string; reason?: string };
  } | null>(null);

  // Accounts Management state (Stakeholder Executive & Teknisi IT)
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [accountActionMessage, setAccountActionMessage] = useState<{ success: boolean; message: string } | null>(null);

  // New Account Form State
  const [newAccName, setNewAccName] = useState('');
  const [newAccUsername, setNewAccUsername] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [newAccRole, setNewAccRole] = useState<AdminTier>('Stakeholder Executive');
  const [newAccDivision, setNewAccDivision] = useState<'Management' | 'Engineering' | 'Design' | 'Finance' | 'Operations'>('Management');
   useEffect(() => {
    let mounted = true;
    if (activeTab === 'audit') {
      fetchServerAuditLogs().then((nextLogs) => {
        if (mounted) setLogs(nextLogs);
      });
      api.auditLogs.integrity().then((res) => {
        if (!mounted) return;
        setAuditIntegrity(res.success && res.data?.integrity ? res.data.integrity : null);
      });
    }
    if (activeTab === 'rbac') {
      fetchAdminAccounts().then((nextAccounts) => {
        if (mounted) setAccounts(nextAccounts);
      });
    }
    if (activeTab === 'api' && canAccessServer) {
      refreshBackups();
    }
    if (activeTab === 'security') {
      api.system.securityStatus().then((res) => {
        if (!mounted) return;
        if (res.success && res.data?.status) setSecurityPosture(res.data.status);
      });
    }
    return () => { mounted = false; };
  }, [activeTab, canAccessServer]);

  const refreshMfaProfile = () => getAdminSession()?.user?.mfaEnabled === true;

  const refreshBackups = async () => {
    try {
      const res = await api.system.getBackups();
      if (res.success && res.data?.success) {
        const list = res.data.backups || [];
        const latest = list[0];
        setBackupSummary({
          count: list.length,
          latestAt: latest?.createdAt,
          latestSizeBytes: latest?.sizeBytes,
          retention: res.data.retention,
          encryptedAtRest: Boolean(res.data.encryptedAtRest),
          privateDocumentEncryption: Boolean(res.data.privateDocumentEncryption)
        });
        const integrityRes = await api.system.backupIntegrity();
        if (integrityRes.data?.integrity) setBackupIntegrity(integrityRes.data.integrity);
      }
    } catch {
      setBackupSummary(null);
    }
  };

  const handleCreateBackup = async () => {
    setBackupStatus(null);
    setBackupLoading(true);
    try {
      const res = await api.system.createBackup();
      if (res.success && res.data?.success) {
        setBackupStatus({
          success: true,
          message: language === 'id' ? 'Snapshot database terenkripsi berhasil dibuat.' : 'Encrypted database snapshot created successfully.'
        });
        await refreshBackups();
      } else {
        setBackupStatus({ success: false, message: res.error || (language === 'id' ? 'Gagal membuat backup.' : 'Failed to create backup.') });
      }
    } finally {
      setBackupLoading(false);
    }
  };

  const handleStartMfaSetup = async () => {
    setMfaStatus(null);
    setMfaLoading(true);
    try {
      const res = await api.auth.mfaSetupStart();
      if (res.success && res.data?.success) {
        setMfaSetup({ secret: res.data.secret, otpAuthUri: res.data.otpAuthUri });
        setMfaCode('');
      } else {
        setMfaStatus({ success: false, message: res.error || 'Gagal memulai setup MFA.' });
      }
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfaSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(mfaCode)) return;
    setMfaStatus(null);
    setMfaLoading(true);
    try {
      const res = await api.auth.mfaSetupVerify(mfaCode);
      if (res.success && res.data?.success) {
        const current = getAdminSession();
        if (current) {
          current.user.mfaEnabled = true;
          sessionStorage.setItem('kapitech_admin_profile_v2', JSON.stringify(current));
        }
        setMfaSetup(null);
        setMfaCode('');
        setMfaRecoveryCodes(res.data.mfaRecoveryCodes || []);
        setMfaStatus({ success: true, message: language === 'id' ? 'MFA TOTP berhasil diaktifkan untuk akun ini.' : 'TOTP MFA is now enabled for this account.' });
        window.dispatchEvent(new Event('kapitech_auth_state_changed'));
      } else {
        setMfaStatus({ success: false, message: res.error || 'Kode MFA tidak valid.' });
      }
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaStatus(null);
    setMfaLoading(true);
    try {
      const res = await api.auth.mfaDisable(mfaDisablePassword, mfaDisableCode);
      if (res.success && res.data?.success) {
        sessionStorage.removeItem('kapitech_admin_profile_v2');
        setMfaDisableCode('');
        setMfaDisablePassword('');
        setMfaStatus({ success: true, message: language === 'id' ? 'MFA dinonaktifkan. Login berikutnya akan mengarahkan Anda kembali ke penyiapan MFA sebelum fungsi AMS terlindungi dapat digunakan.' : 'MFA disabled. The next sign-in will route you back to MFA setup before protected AMS functions can be used.' });
        await api.auth.me();
        window.dispatchEvent(new Event('kapitech_auth_state_changed'));
      } else {
        setMfaStatus({ success: false, message: res.error || 'Gagal menonaktifkan MFA.' });
      }
    } finally {
      setMfaLoading(false);
    }
  };

  const refreshAccounts = async () => {
    const nextAccounts = await fetchAdminAccounts();
    setAccounts(nextAccounts);
  };

  const handleOpenAddAccount = () => {
    setNewAccName('');
    setNewAccUsername('');
    setNewAccEmail('');
    setNewAccPassword('');
    setNewAccRole('Stakeholder Executive');
    setNewAccDivision('Management');
     setAccountActionMessage(null);
    setIsAddAccountModalOpen(true);
  };

  const handleRoleChangeForNewAccount = (role: AdminTier) => {
    setNewAccRole(role);
    if (role === 'Teknisi IT / Systems Engineer' || role.includes('Internal IT')) {
      setNewAccDivision('Engineering');
    } else if (role === 'Stakeholder Executive' || role.includes('Top Management')) {
      setNewAccDivision('Management');
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountActionMessage(null);

    const res = await createAdminAccount({
      name: newAccName,
      username: newAccUsername,
      email: newAccEmail,
      passwordPlain: newAccPassword,
      role: newAccRole,
      division: newAccDivision
    });

    if (res.success) {
      refreshAccounts();
      setAccountActionMessage({
        success: true,
        message: language === 'id' 
          ? `Akun baru "${newAccName}" (${newAccRole}) berhasil dibuat dan disimpan di server.` 
          : `New account "${newAccName}" (${newAccRole}) created and stored server-side.`
      });
      setIsAddAccountModalOpen(false);
      setTimeout(() => setAccountActionMessage(null), 5000);
    } else {
      setAccountActionMessage({
        success: false,
        message: res.error || 'Gagal membuat akun.'
      });
    }
  };

  const handleDeleteAccountClick = async (id: string, name: string) => {
    const confirmMsg = language === 'id'
      ? `Hapus akun stakeholder "${name}" dari sistem Kapitech? Tindakan ini tidak dapat dibatalkan.`
      : `Delete stakeholder account "${name}" permanently? This action cannot be undone.`;
    
    if (window.confirm(confirmMsg)) {
      const res = await deleteAdminAccount(id);
      if (res.success) {
        refreshAccounts();
        setAccountActionMessage({
          success: true,
          message: language === 'id' ? `Akun "${name}" berhasil dihapus.` : `Account "${name}" deleted.`
        });
        setTimeout(() => setAccountActionMessage(null), 4000);
      } else {
        alert(res.error);
      }
    }
  };

  const handlePolicyInfo = () => {
    setAccountActionMessage({
      success: true,
      message: language === 'id'
        ? 'Hak akses diturunkan dari role server-side. Perubahan checkbox individual tidak diizinkan dari browser.'
        : 'Permissions are derived from the server-side role policy. Individual checkbox overrides are not allowed.'
    });
    setTimeout(() => setAccountActionMessage(null), 4500);
  };

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

    if (newPassword && newPassword.length < 12) {
      setSecurityStatus({ 
        success: false, 
        message: language === 'id' 
          ? 'Password baru minimal 12 karakter.' 
          : 'New password must be at least 12 characters long.' 
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
            ? 'Kredensial admin berhasil diperbarui di server.'
            : 'Admin credentials updated successfully on the server.' 
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
              ? 'Konfigurasi identitas admin, policy RBAC server-side, integrasi API, dan audit trail hash-chained.'
              : 'Configure administrator identity, server-enforced RBAC policy, API integrations, and a hash-chained audit trail.'}
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

        {canManageCms && (
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
        )}

        {canManageAccounts && (
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
        )}

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

        {canAccessServer && (
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
        )}

        {canViewAudit && (
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
        )}
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
                  value={username}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                  {language === 'id' ? 'Email Notifikasi' : 'Notification Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
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
                <span className="text-[#64748B]">
                  {session?.user.lastLogin
                    ? new Date(session.user.lastLogin).toLocaleString()
                    : (language === 'id' ? 'Belum tercatat' : 'Not recorded')}
                </span>
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

      {/* TAB 3: ROLE MATRIX & ACCOUNTS MANAGEMENT (STAKEHOLDER EXECUTIVE & TEKNISI IT) */}
      {activeTab === 'rbac' && (
        <div className="w-full space-y-6">
          {/* Notification banner */}
          {accountActionMessage && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-mono animate-fadeIn ${
              accountActionMessage.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}>
              {accountActionMessage.success ? <Check size={16} className="shrink-0 text-emerald-400" /> : <AlertCircle size={16} className="shrink-0 text-red-400" />}
              <span>{accountActionMessage.message}</span>
            </div>
          )}

          {/* Accounts Management Section */}
          <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[rgba(255,255,255,0.07)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#FF1E27] shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold font-display text-white">
                    {language === 'id' ? 'Manajemen Akun Stakeholder & Teknisi' : 'Stakeholder & Technical Accounts'}
                  </h2>
                  <p className="text-xs text-[#8A94A6] font-mono">
                    {language === 'id'
                      ? 'Kelola akun khusus Stakeholder Executive, Teknisi IT, dan staf dengan hak akses granular.'
                      : 'Manage dedicated accounts for Executive Stakeholders, IT Engineers, and operations.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAccount}
                className="h-10 px-4 min-h-[40px] rounded-xl bg-[#E50914] text-white text-xs font-mono font-bold hover:bg-[#FF1E27] transition-all shadow-md shadow-[#E50914]/20 flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
              >
                <UserPlus size={15} />
                <span>{language === 'id' ? 'Tambah Akun Baru' : 'Add New Account'}</span>
              </button>
            </div>

            {/* Accounts Grid / List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => {
                const isExecutive = acc.role === 'Stakeholder Executive' || acc.stakeholderType === 'Executive';
                const isIT = acc.role === 'Teknisi IT / Systems Engineer' || acc.stakeholderType === 'IT_Technical';
                const isMaster = acc.username === 'admin' || acc.stakeholderType === 'Master';

                return (
                  <div 
                    key={acc.id}
                    className="p-4 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] flex flex-col justify-between hover:border-[rgba(255,255,255,0.15)] transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                            isMaster ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            isExecutive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            isIT ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {acc.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white leading-snug">{acc.name}</h3>
                            <p className="text-[11px] font-mono text-[#8A94A6]">@{acc.username}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                          isMaster ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          isExecutive ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                          isIT ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                          'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        }`}>
                          {acc.division || 'Operations'}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1 text-[11px] font-mono">
                        <div className="text-[#8A94A6] flex items-center justify-between">
                          <span>Role:</span>
                          <span className="font-semibold text-white truncate max-w-[170px]">{acc.role}</span>
                        </div>
                        <div className="text-[#8A94A6] flex items-center justify-between">
                          <span>Email:</span>
                          <span className="text-gray-300 truncate max-w-[170px]">{acc.email}</span>
                        </div>
                        <div className="text-[#8A94A6] flex items-center justify-between">
                          <span>Status:</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Aktif
                          </span>
                        </div>
                      </div>

                      {/* Permissions Summary Badges */}
                      <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] flex flex-wrap gap-1">
                        {acc.permissions?.canManageInvoices && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 rounded">
                            Invoice
                          </span>
                        )}
                        {acc.permissions?.canApproveBudgets && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-950/40 text-amber-300 border border-amber-800/40 rounded">
                            Budget Approval
                          </span>
                        )}
                        {acc.permissions?.canAccessServerAndApi && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 rounded">
                            DevOps / Cloud
                          </span>
                        )}
                        {acc.permissions?.canViewSecurityAuditLogs && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded">
                            Audit Logs
                          </span>
                        )}
                        {acc.permissions?.canManageCrm && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-blue-950/40 text-blue-300 border border-blue-800/40 rounded">
                            CRM
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handlePolicyInfo}
                        className="h-8 px-2.5 rounded-lg bg-[#262930] hover:bg-[#323640] text-gray-200 text-[11px] font-mono font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <ShieldCheck size={13} className="text-[#FF1E27]" />
                        <span>{language === 'id' ? 'Policy Server' : 'Server Policy'}</span>
                      </button>

                      {!isMaster ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteAccountClick(acc.id, acc.name)}
                          className="h-8 px-2 rounded-lg hover:bg-red-500/10 text-[#8A94A6] hover:text-red-400 text-[11px] font-mono transition-colors flex items-center gap-1"
                          title="Hapus Akun"
                        >
                          <Trash2 size={13} />
                          <span className="hidden sm:inline">{language === 'id' ? 'Hapus' : 'Delete'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-[#64748B] italic">Root Master</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference RBAC Matrix */}
          <div className="w-full bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[rgba(255,255,255,0.07)]">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-white">
                  {language === 'id' ? 'Standar Hirarki Hak Akses Stakeholder Kapitech' : 'Kapitech Stakeholder Access Standards'}
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
                    <th className="py-3 px-4 font-semibold">{language === 'id' ? 'Sistem & Cloud API' : 'System & Cloud API'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
                  <tr className="hover:bg-[#181B22]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                      <span>Stakeholder Executive (Managing Partner)</span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Approval & Audit Finansial Penuh' : 'Financial Approval & Audit'}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Akses Penuh Pipeline' : 'Full Pipeline View'}</td>
                    <td className="py-3.5 px-4 text-amber-300">{language === 'id' ? 'Review Milestone & Delivery' : 'Milestone & Delivery Review'}</td>
                    <td className="py-3.5 px-4 text-[#8A94A6]">{language === 'id' ? 'Audit Log & Governance' : 'Audit Logs & Governance'}</td>
                  </tr>
                  <tr className="hover:bg-[#181B22]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                      <span>Teknisi IT / Systems Engineer</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#8A94A6]">{language === 'id' ? 'Tanpa Akses Finansial' : 'No Financial Access'}</td>
                    <td className="py-3.5 px-4 text-[#8A94A6]">{language === 'id' ? 'Tanpa Akses' : 'No Access'}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Teknis Penuh & Sprint Tasks' : 'Technical & Sprint Tasks'}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">{language === 'id' ? 'Server, Cloud Run, API & Diagnostics' : 'Full Server, Cloud & Diagnostics'}</td>
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH AKUN BARU (MOBILE FULLSCREEN + STICKY HEADER & FOOTER) */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-[#111318] border-0 sm:border sm:border-[rgba(255,255,255,0.07)] rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-[#111318]/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#FF1E27] shrink-0">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    {language === 'id' ? 'Tambah Akun Stakeholder / Teknisi' : 'Add Stakeholder / Technical Account'}
                  </h3>
                  <p className="text-[11px] font-mono text-[#8A94A6]">
                    {language === 'id' ? 'Pilih peran; hak akses ditetapkan oleh policy server.' : 'Select a role; permissions are enforced by the server policy.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#181B22] hover:bg-[#262930] text-[#8A94A6] hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleCreateAccountSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
              
              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-mono text-[#8A94A6] uppercase tracking-wider mb-2 font-semibold">
                  {language === 'id' ? 'Pilih Tipe Peran Stakeholder' : 'Select Stakeholder Role'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChangeForNewAccount('Stakeholder Executive')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      newAccRole === 'Stakeholder Executive'
                        ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                        : 'bg-[#181B22] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase size={16} className="text-amber-400" />
                      <span className="font-bold text-xs text-white">Stakeholder Executive</span>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] leading-relaxed font-mono">
                      C-Level, Managing Partner, Sponsor. Akses approval finansial & review strategis.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeForNewAccount('Teknisi IT / Systems Engineer')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      newAccRole === 'Teknisi IT / Systems Engineer'
                        ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30'
                        : 'bg-[#181B22] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Terminal size={16} className="text-emerald-400" />
                      <span className="font-bold text-xs text-white">Teknisi IT / Engineer</span>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] leading-relaxed font-mono">
                      Lead DevOps, Infrastructure, Cloud Run & API. Akses teknis penuh tanpa finansial.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeForNewAccount('Tier 2: Project Manager (PM)')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      newAccRole === 'Tier 2: Project Manager (PM)'
                        ? 'bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/30'
                        : 'bg-[#181B22] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layers size={16} className="text-purple-400" />
                      <span className="font-bold text-xs text-white">Project Manager (PM)</span>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] leading-relaxed font-mono">
                      Sprint planning, delivery klien, task delegation & draf faktur invoice.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeForNewAccount('Tier 3: Operational Staff')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      newAccRole === 'Tier 3: Operational Staff'
                        ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/30'
                        : 'bg-[#181B22] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck size={16} className="text-cyan-400" />
                      <span className="font-bold text-xs text-white">Operational Staff</span>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] leading-relaxed font-mono">
                      Staf teknis / desainer operasional untuk update tugas harian.
                    </p>
                  </button>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#8A94A6] uppercase tracking-wider mb-1.5 font-semibold">
                    {language === 'id' ? 'Nama Lengkap' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="Contoh: Alexander Hartanto"
                    className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-[#E50914] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8A94A6] uppercase tracking-wider mb-1.5 font-semibold">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAccUsername}
                    onChange={(e) => setNewAccUsername(e.target.value)}
                    placeholder="Contoh: exec.alex"
                    className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-[#E50914] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8A94A6] uppercase tracking-wider mb-1.5 font-semibold">
                    Email Resmi *
                  </label>
                  <input
                    type="email"
                    required
                    value={newAccEmail}
                    onChange={(e) => setNewAccEmail(e.target.value)}
                    placeholder="alex@kapitech.id"
                    className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-[#E50914] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8A94A6] uppercase tracking-wider mb-1.5 font-semibold">
                    {language === 'id' ? 'Password Sementara' : 'Temporary Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    value={newAccPassword}
                    onChange={(e) => setNewAccPassword(e.target.value)}
                    placeholder="12–128 karakter"
                    className="w-full px-3.5 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-[#E50914] transition-all"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-4 bg-[#111318]/95 backdrop-blur-md px-5 sm:px-6 py-3.5 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="h-10 px-4 min-h-[40px] rounded-xl bg-[#181B22] text-[#8A94A6] hover:text-white text-xs font-mono font-bold transition-colors"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 min-h-[40px] rounded-xl bg-[#E50914] text-white text-xs font-mono font-bold hover:bg-[#FF1E27] transition-all shadow-md shadow-[#E50914]/20 flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>{language === 'id' ? 'Simpan Akun Baru' : 'Save Account'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & MFA POLICY */}
      {activeTab === 'security' && (
        <div className="w-full max-w-4xl space-y-4">
          {mfaRequired && !refreshMfaProfile() && (
            <div
              role="alert"
              className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-amber-300" />
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-white">
                    {language === 'id' ? 'Penyiapan keamanan diperlukan' : 'Security setup required'}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#A7B0BF]">
                    {language === 'id'
                      ? 'Akun ini belum memiliki MFA TOTP. Sistem mengarahkan Anda ke halaman ini dan menahan akses ke fungsi AMS terlindungi sampai MFA selesai diaktifkan.'
                      : 'This account does not have TOTP MFA enabled. The system has routed you here and will keep protected AMS functions unavailable until MFA is enabled.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {securityPosture && (
            <div className="rounded-2xl border border-white/[0.07] bg-[#111318] p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">{language === 'id' ? 'Security Posture' : 'Security Posture'}</h2>
                  <p className="mt-1 text-[11px] text-[#8A94A6] font-mono">
                    {language === 'id' ? 'Status kontrol inti AMS pada saat halaman ini dibuka.' : 'Current state of the AMS core security controls.'}
                  </p>
                </div>
                <span className={`inline-flex items-center min-h-[28px] px-2.5 rounded-lg border text-[10px] font-mono font-bold ${securityPosture.mfaCoveragePercent === 100 && securityPosture.encryptionAtRest && securityPosture.backupIntegrity.valid ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-300' : 'border-amber-500/25 bg-amber-500/5 text-amber-300'}`}>
                  {securityPosture.mfaCoveragePercent === 100 && securityPosture.encryptionAtRest && securityPosture.backupIntegrity.valid
                    ? (language === 'id' ? 'Posture siap' : 'Posture ready')
                    : (language === 'id' ? 'Perlu tindakan' : 'Action required')}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/[0.07] bg-[#181B22] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-[#8A94A6] font-mono">MFA</div>
                  <div className="mt-1 text-sm font-bold text-white font-mono">{securityPosture.mfaEnabledCount}/{securityPosture.activeUserCount}</div>
                  <div className="mt-0.5 text-[10px] text-[#8A94A6] font-mono">{securityPosture.mfaCoveragePercent}% {language === 'id' ? 'cakupan' : 'coverage'}</div>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-[#181B22] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-[#8A94A6] font-mono">{language === 'id' ? 'Enkripsi Data' : 'Data Encryption'}</div>
                  <div className={`mt-1 text-sm font-bold font-mono ${securityPosture.encryptionAtRest ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {securityPosture.encryptionAtRest ? (language === 'id' ? 'Aktif' : 'Enabled') : (language === 'id' ? 'Belum aktif' : 'Not configured')}
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-[#181B22] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-[#8A94A6] font-mono">Backup</div>
                  <div className="mt-1 text-sm font-bold font-mono text-white">{securityPosture.backupCount}</div>
                  <div className={`mt-0.5 text-[10px] font-mono ${securityPosture.backupIntegrity.valid ? 'text-emerald-300' : 'text-red-300'}`}>
                    {securityPosture.backupIntegrity.valid ? 'Integrity valid' : 'Integrity check failed'}
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-[#181B22] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-[#8A94A6] font-mono">{language === 'id' ? 'MFA Policy' : 'MFA Policy'}</div>
                  <div className="mt-1 text-sm font-bold font-mono text-emerald-300">{securityPosture.mfaRequired ? (language === 'id' ? 'Wajib' : 'Required') : '—'}</div>
                  <div className="mt-0.5 text-[10px] text-[#8A94A6] font-mono">
                    {securityPosture.latestBackupAt ? new Date(securityPosture.latestBackupAt).toLocaleString() : (language === 'id' ? 'Belum ada snapshot' : 'No snapshot yet')}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full max-w-4xl bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[rgba(255,255,255,0.07)]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                {language === 'id' ? 'Kebijakan Keamanan & Password' : 'Security & Password Policy'}
              </h2>
              <p className="text-xs text-[#8A94A6] font-mono">
                {language === 'id'
                  ? 'Password diverifikasi di server dengan scrypt. Sesi menggunakan cookie HttpOnly + CSRF protection.'
                  : 'Passwords are verified server-side with scrypt. Sessions use an HttpOnly cookie plus CSRF protection.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#181B22] border border-amber-500/20 text-amber-200 text-xs font-mono leading-relaxed">
              {language === 'id'
                ? 'Keamanan sesi aktif: idle timeout 60 menit, batas sesi 12 jam (24 jam untuk Remember Me), cookie HttpOnly + SameSite=Strict, CSRF protection, rate limiting, dan MFA TOTP wajib sebelum fungsi AMS terlindungi dapat digunakan.'
                : 'Active session controls: 60-minute idle timeout, 12-hour absolute lifetime (24 hours with Remember Me), HttpOnly + SameSite=Strict cookies, CSRF protection, rate limiting, and mandatory TOTP MFA before protected AMS functions can be used.'}
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.07)] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-white font-mono">{language === 'id' ? 'Multi-Factor Authentication (TOTP)' : 'Multi-Factor Authentication (TOTP)'}</h3>
                  <p className="mt-1 text-[11px] text-[#8A94A6] leading-relaxed">
                    {refreshMfaProfile()
                      ? (language === 'id' ? 'Aktif. Kode dari aplikasi authenticator diperlukan setelah password.' : 'Enabled. An authenticator code is required after the password.')
                      : (language === 'id' ? 'Belum aktif. Hubungkan aplikasi authenticator lalu verifikasi kode 6 digit.' : 'Not enabled. Connect an authenticator app and verify a 6-digit code.')}
                  </p>
                </div>
                <ShieldCheck size={18} className={refreshMfaProfile() ? 'text-emerald-400 shrink-0' : 'text-[#64748B] shrink-0'} />
              </div>

              {mfaStatus && <div className={`p-3 rounded-xl text-xs font-mono ${mfaStatus.success ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' : 'bg-red-950/40 border border-red-500/30 text-red-300'}`}>{mfaStatus.message}</div>}

              {!refreshMfaProfile() && !mfaSetup && (
                <button type="button" onClick={handleStartMfaSetup} disabled={mfaLoading} className="min-h-[44px] px-4 rounded-xl bg-[#181B22] border border-white/[0.08] text-white text-xs font-mono font-bold hover:border-[#E50914]/50 disabled:opacity-50">
                  {language === 'id' ? 'Mulai Setup MFA' : 'Start MFA Setup'}
                </button>
              )}

              {mfaRecoveryCodes.length > 0 && refreshMfaProfile() && (
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/25 p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-amber-200 font-mono">{language === 'id' ? 'Recovery codes' : 'Recovery codes'}</h4>
                    <p className="mt-1 text-[11px] text-amber-100/70 leading-relaxed">
                      {language === 'id'
                        ? 'Simpan sekarang di password manager atau tempat offline yang aman. Setiap kode hanya dapat digunakan sekali. Kode ini tidak akan ditampilkan lagi setelah halaman ini ditutup.'
                        : 'Store these in a password manager or another secure offline location. Each code works only once and will not be shown again after this page is closed.'}
                    </p>
                  </div>
                  <code className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-white">
                    {mfaRecoveryCodes.map(code => <span key={code} className="rounded-lg bg-[#111318] border border-white/[0.07] px-2 py-2 text-center">{code}</span>)}
                  </code>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => navigator.clipboard?.writeText(mfaRecoveryCodes.join('\n'))} className="min-h-[40px] px-3 rounded-lg bg-[#262930] text-xs font-mono text-white">{language === 'id' ? 'Salin semua kode' : 'Copy all codes'}</button>
                    <button type="button" onClick={() => setMfaRecoveryCodes([])} className="min-h-[40px] px-3 rounded-lg bg-transparent border border-white/[0.08] text-xs font-mono text-[#8A94A6] hover:text-white">{language === 'id' ? 'Sudah saya simpan' : 'I stored them'}</button>
                    <button
                      type="button"
                      onClick={() => window.location.replace('/admin/login?mfaEnabled=1')}
                      className="min-h-[40px] px-3 rounded-lg bg-[#E50914] text-white text-xs font-mono font-bold hover:bg-[#FF1E27]"
                    >
                      {language === 'id' ? 'Login ulang' : 'Sign in again'}
                    </button>
                  </div>
                </div>
              )}

              {mfaSetup && !refreshMfaProfile() && (
                <div className="space-y-3 rounded-xl bg-[#181B22] border border-white/[0.07] p-4">
                  <div className="text-[11px] text-[#8A94A6] font-mono">{language === 'id' ? 'Tambahkan entry ini ke authenticator Anda. QR code bisa dibuat dari URI otpauth di bawah.' : 'Add this entry to your authenticator. A QR code can be generated from the otpauth URI below.'}</div>
                  <code className="block break-all text-[10px] text-white/80 font-mono">{mfaSetup.otpAuthUri}</code>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => navigator.clipboard?.writeText(mfaSetup.otpAuthUri)} className="min-h-[40px] px-3 rounded-lg bg-[#262930] text-xs font-mono text-white">Copy setup URI</button>
                    <button type="button" onClick={() => navigator.clipboard?.writeText(mfaSetup.secret)} className="min-h-[40px] px-3 rounded-lg bg-[#262930] text-xs font-mono text-white">Copy secret</button>
                  </div>
                  <form onSubmit={handleVerifyMfaSetup} className="flex flex-col sm:flex-row gap-2">
                    <input value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" className="min-h-[44px] flex-1 px-3 rounded-xl bg-[#111318] border border-white/[0.08] text-white font-mono text-sm tracking-[0.3em]" />
                    <button type="submit" disabled={mfaLoading || mfaCode.length !== 6} className="min-h-[44px] px-4 rounded-xl bg-[#E50914] text-white text-xs font-mono font-bold disabled:opacity-50">{language === 'id' ? 'Aktifkan MFA' : 'Enable MFA'}</button>
                  </form>
                </div>
              )}

              {refreshMfaProfile() && (
                <form onSubmit={handleDisableMfa} className="space-y-3 rounded-xl bg-[#181B22] border border-amber-500/20 p-4">
                  <div className="text-[11px] text-amber-200 font-mono">{language === 'id' ? 'Menonaktifkan MFA memutus semua sesi akun. Konfirmasi dengan password saat ini dan kode TOTP.' : 'Disabling MFA revokes all sessions. Confirm with the current password and TOTP code.'}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="password" value={mfaDisablePassword} onChange={e => setMfaDisablePassword(e.target.value)} required placeholder={language === 'id' ? 'Password saat ini' : 'Current password'} className="min-h-[44px] px-3 rounded-xl bg-[#111318] border border-white/[0.08] text-white font-mono text-xs" />
                    <input value={mfaDisableCode} onChange={e => setMfaDisableCode(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required placeholder="MFA 000000" className="min-h-[44px] px-3 rounded-xl bg-[#111318] border border-white/[0.08] text-white font-mono text-xs tracking-[0.2em]" />
                  </div>
                  <button type="submit" disabled={mfaLoading} className="min-h-[44px] px-4 rounded-xl bg-[#262930] border border-amber-500/30 text-amber-200 text-xs font-mono font-bold disabled:opacity-50">{language === 'id' ? 'Nonaktifkan MFA' : 'Disable MFA'}</button>
                </form>
              )}
            </div>

            <form onSubmit={handleUpdateSecurity} className="space-y-3 pt-3 border-t border-[rgba(255,255,255,0.07)]">
              <h3 className="text-xs font-bold text-white font-mono">
                {language === 'id' ? 'Ganti Password Master' : 'Change Master Password'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#8A94A6] mb-1 font-semibold">
                    {language === 'id' ? 'Password Baru (12–128 karakter)' : 'New Password (12–128 characters)'}
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
                {language === 'id' ? 'Integrasi Server & API' : 'Server & API Integrations'}
              </h2>
              <p className="text-xs text-[#8A94A6] font-mono mt-1">
                {language === 'id'
                  ? 'Rahasia server tidak disimpan atau diedit dari browser.'
                  : 'Server secrets are not stored or edited from the browser.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Session', language === 'id' ? 'HttpOnly cookie, server-validated' : 'HttpOnly cookie, server-validated'],
              ['AI API Key', language === 'id' ? 'Hostinger environment variable' : 'Hostinger environment variable'],
              ['Notification secrets', language === 'id' ? 'Server-side only' : 'Server-side only'],
              ['Deployment', 'Node.js 22 / Express']
            ].map(([label, value]) => (
              <div key={label} className="p-4 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)]">
                <div className="text-[10px] uppercase tracking-wider text-[#8A94A6] font-mono mb-1">{label}</div>
                <div className="text-sm text-white font-mono">{value}</div>
              </div>
            ))}
          </div>

          {canAccessServer && (
            <div className="p-5 rounded-2xl bg-[#181B22] border border-cyan-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database size={15} className="text-cyan-400" />
                    <span>{language === 'id' ? 'Backup & Disaster Recovery' : 'Backup & Disaster Recovery'}</span>
                  </h3>
                  <p className="text-[11px] text-[#8A94A6] font-mono mt-1">
                    {language === 'id'
                      ? 'Snapshot terenkripsi otomatis, retention terbatas, dan manual snapshot untuk off-site backup.'
                      : 'Encrypted rolling snapshots with bounded retention and manual snapshots for off-site backup.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateBackup}
                  disabled={backupLoading}
                  className="min-h-[40px] px-3.5 rounded-xl bg-[#262930] hover:bg-[#323640] border border-cyan-500/20 text-cyan-200 text-xs font-mono font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw size={13} className={backupLoading ? 'animate-spin' : ''} />
                  <span>{language === 'id' ? 'Buat Snapshot Sekarang' : 'Create Snapshot Now'}</span>
                </button>
              </div>

              {backupStatus && (
                <div className={'p-3 rounded-xl border text-xs font-mono ' + (
                  backupStatus.success
                    ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                    : 'bg-red-950/30 border-red-500/20 text-red-300'
                )}>
                  {backupStatus.message}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-[#111318] border border-white/[0.07]">
                  <div className="text-[10px] uppercase tracking-wider text-[#8A94A6] font-mono">Snapshots</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">{backupSummary?.count ?? '—'}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#111318] border border-white/[0.07]">
                  <div className="text-[10px] uppercase tracking-wider text-[#8A94A6] font-mono">Retention</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">{backupSummary?.retention ?? 14}d</div>
                </div>
                <div className="p-3 rounded-xl bg-[#111318] border border-white/[0.07]">
                  <div className="text-[10px] uppercase tracking-wider text-[#8A94A6] font-mono">Latest</div>
                  <div className="text-xs font-semibold text-white font-mono mt-1">
                    {backupSummary?.latestAt ? new Date(backupSummary.latestAt).toLocaleString() : '—'}
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-[#111318] border ${backupSummary?.encryptedAtRest ? 'border-emerald-500/20' : 'border-amber-500/25'}`}>
                  <div className="text-[10px] uppercase tracking-wider text-[#8A94A6] font-mono">{language === 'id' ? 'Enkripsi' : 'Encryption'}</div>
                  <div className={`text-xs font-semibold font-mono mt-1 ${backupSummary?.encryptedAtRest ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {backupSummary?.encryptedAtRest ? (language === 'id' ? 'Aktif' : 'Enabled') : (language === 'id' ? 'Belum aktif' : 'Not configured')}
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-[#111318] border ${backupIntegrity?.valid === false ? 'border-red-500/25' : 'border-white/[0.07]'}`}>
                  <div className="text-[10px] uppercase tracking-wider text-[#8A94A6] font-mono">Integrity</div>
                  <div className={`text-xs font-semibold font-mono mt-1 ${backupIntegrity?.valid ? 'text-emerald-300' : backupIntegrity?.valid === false ? 'text-red-300' : 'text-[#8A94A6]'}`}>
                    {backupIntegrity?.valid ? (language === 'id' ? 'Valid' : 'Valid') : backupIntegrity?.valid === false ? (language === 'id' ? 'Perlu perhatian' : 'Needs attention') : '—'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.07]">
                <div className="text-[10px] text-[#64748B] font-mono">
                  {language === 'id'
                    ? `Untuk DR penuh, download encrypted backup lalu simpan di lokasi off-site yang terpisah dari Hostinger.${backupIntegrity?.valid === false && backupIntegrity.reason ? ' Integrity: ' + backupIntegrity.reason : ''}`
                    : `For full DR, download an encrypted backup and retain it off-site separately from Hostinger.${backupIntegrity?.valid === false && backupIntegrity.reason ? ' Integrity: ' + backupIntegrity.reason : ''}`}
                </div>
                <a
                  href="/api/system/backups/download"
                  className="min-h-[40px] px-3.5 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-mono font-bold flex items-center justify-center gap-2"
                >
                  <Download size={13} />
                  <span>{language === 'id' ? 'Download Encrypted Backup' : 'Download Encrypted Backup'}</span>
                </a>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#181B22] border border-amber-500/20 text-amber-200 text-xs font-mono leading-relaxed">
            {language === 'id'
              ? 'Konfigurasi GEMINI_API_KEY, password admin awal, dan secret notifikasi harus dilakukan melalui Environment Variables di Hostinger. Nilai secret tidak ditampilkan kembali di UI.'
              : 'Configure GEMINI_API_KEY, initial admin password, and notification secrets through Hostinger Environment Variables. Secret values are never shown back in the UI.'}
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
                  ? 'Catatan hash-chained dari autentikasi, akses RBAC, dan perubahan data sistem.'
                  : 'Tamper-evident hash chain for user authentication, RBAC transitions, and security operations.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`min-h-[40px] px-3.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${auditIntegrity?.valid === false
                  ? 'bg-red-950/30 border-red-500/30 text-red-300'
                  : auditIntegrity?.valid
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#181B22] border-white/[0.07] text-[#8A94A6]'}`}
                title={auditIntegrity ? `Checked ${auditIntegrity.checked} audit entries` : 'Audit integrity status'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {auditIntegrity?.valid === false
                  ? (language === 'id' ? 'Chain rusak' : 'Chain broken')
                  : auditIntegrity?.valid
                    ? (language === 'id' ? `Chain valid · ${auditIntegrity.checked}` : `Chain valid · ${auditIntegrity.checked}`)
                    : (language === 'id' ? 'Memeriksa chain…' : 'Checking chain…')}
              </div>
              <button
                onClick={handleExportLogs}
                disabled={logs.length === 0}
                className="px-3.5 py-2 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono transition-colors flex items-center gap-1.5 disabled:opacity-50 min-h-[40px]"
              >
                <Download size={13} />
                <span>Export JSON</span>
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
