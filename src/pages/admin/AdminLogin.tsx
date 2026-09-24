import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, KeyRound, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { authenticateAdmin, cacheAdminSession } from '../../lib/adminAuth';
import { useLanguage } from '../../lib/LanguageContext';

export const AdminLogin: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaRecoveryMode, setMfaRecoveryMode] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';

  useEffect(() => {
    let mounted = true;
    api.auth.me().then((res) => {
      if (mounted && res.success && res.data?.success) {
        navigate(redirectUrl, { replace: true });
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, [navigate, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage(language === 'id'
        ? 'Username/email dan password wajib diisi.'
        : 'Username/email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const result = await authenticateAdmin(identifier, password, rememberMe);
      if (result.success && result.requiresMfa) {
        setMfaRequired(true);
        setMfaCode('');
        return;
      }
      if (result.success) {
        navigate(redirectUrl, { replace: true });
      } else {
        setErrorMessage(result.error || (language === 'id' ? 'Autentikasi gagal.' : 'Authentication failed.'));
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error
        ? err.message
        : (language === 'id' ? 'Terjadi kendala saat login.' : 'Unable to sign in.'));
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const normalizedCode = mfaCode.trim().toUpperCase();
    if (mfaRecoveryMode ? normalizedCode.length < 12 : !/^\d{6}$/.test(normalizedCode)) {
      setErrorMessage(mfaRecoveryMode
        ? (language === 'id' ? 'Masukkan recovery code yang valid.' : 'Enter a valid recovery code.')
        : (language === 'id' ? 'Masukkan kode MFA 6 digit.' : 'Enter the 6-digit MFA code.'));
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.mfaVerify(normalizedCode);
      if (result.success && result.data?.success && result.data.user) {
        cacheAdminSession(result.data.user, rememberMe);
        window.dispatchEvent(new Event('kapitech_auth_state_changed'));
        navigate(redirectUrl, { replace: true });
      } else {
        setErrorMessage(result.error || (language === 'id' ? 'Kode MFA tidak valid.' : 'Invalid MFA code.'));
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : (language === 'id' ? 'Verifikasi MFA gagal.' : 'MFA verification failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPassword = () => {
    setMfaRequired(false);
    setMfaRecoveryMode(false);
    setMfaCode('');
    setErrorMessage(null);
  };

  const mfaEnabledNotice = searchParams.get('mfaEnabled') === '1';

  return (
    <div data-kapi-admin="true" className="ams-shell min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center px-4 py-8 sm:py-10 font-sans">
      <div className="w-full max-w-[420px]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-sans text-[var(--muted)] hover:text-[var(--text)] mb-6"
        >
          <ArrowLeft size={14} />
          {language === 'id' ? 'Kembali ke Website' : 'Back to Website'}
        </Link>

        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card p-5 sm:p-6 shadow-none">
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-[var(--ams-radius-card)] bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] mx-auto mb-4">
              <Lock size={24} />
            </div>
            <h1 className="text-xl sm:text-[22px] leading-7 font-semibold tracking-tight">
              {language === 'id' ? 'Portal Admin Internal' : 'Internal Admin Portal'}
            </h1>
            <p className="text-[13px] leading-[18px] text-[var(--muted)] mt-2">
              {language === 'id'
                ? 'Masuk untuk mengelola operasi, CRM, proyek, keuangan, dan konten Kapitech.'
                : 'Sign in to manage Kapitech operations, CRM, projects, finance, and content.'}
            </p>
          </div>

          {mfaEnabledNotice && (
            <div className="mb-5 p-3.5 rounded-[var(--ams-radius-control)] bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <span>{language === 'id' ? 'MFA berhasil diaktifkan. Silakan login ulang untuk melanjutkan.' : 'MFA is enabled. Sign in again to continue.'}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-[var(--ams-radius-control)] bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!mfaRequired ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-sans text-[var(--muted)] mb-1.5">
                {language === 'id' ? 'Username / Email' : 'Username / Email'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={loading}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--panel-hover)] border border-[var(--line)] rounded-[var(--ams-radius-control)] text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus:border-[var(--accent)] font-sans"
                  placeholder="admin atau email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans text-[var(--muted)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[var(--panel-hover)] border border-[var(--line)] rounded-[var(--ams-radius-control)] text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus:border-[var(--accent)] font-sans"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-[var(--muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              {language === 'id' ? 'Pertahankan sesi di perangkat ini' : 'Keep this session on this device'}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-10 h-10 rounded-control bg-[var(--accent)] hover:bg-[var(--accent)] disabled:bg-[var(--panel-hover)] text-[var(--text)] text-xs font-medium font-sans normal-case tracking-normal flex items-center justify-center gap-2 transition-colors"
            >
              {loading
                ? (language === 'id' ? 'Memverifikasi…' : 'Verifying…')
                : (language === 'id' ? 'Masuk' : 'Sign In')}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
          ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-5">
            <div className="rounded-[var(--ams-radius-control)] border border-amber-500/25 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <ShieldCheck size={18} className="text-amber-400" />
                {language === 'id' ? 'Verifikasi MFA diperlukan' : 'MFA verification required'}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                {mfaRecoveryMode
                  ? (language === 'id' ? 'Masukkan salah satu recovery code yang Anda simpan saat MFA diaktifkan. Kode yang berhasil digunakan akan langsung tidak dapat digunakan lagi.' : 'Enter one of the recovery codes saved when MFA was enabled. A successfully used code is immediately invalidated.')
                  : (language === 'id' ? 'Buka aplikasi authenticator Anda dan masukkan kode TOTP 6 digit untuk menyelesaikan login.' : 'Open your authenticator app and enter the 6-digit TOTP code to complete sign-in.')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-sans text-[var(--muted)] mb-1.5">
                {mfaRecoveryMode ? 'Recovery code' : (language === 'id' ? 'Kode TOTP' : 'TOTP code')}
              </label>
              <input
                type="text"
                inputMode={mfaRecoveryMode ? "text" : "numeric"}
                autoComplete={mfaRecoveryMode ? "off" : "one-time-code"}
                pattern={mfaRecoveryMode ? undefined : "\\d{6}"}
                maxLength={mfaRecoveryMode ? 128 : 6}
                required
                autoFocus
                disabled={loading}
                value={mfaCode}
                onChange={(e) => setMfaCode(mfaRecoveryMode ? e.target.value.toUpperCase().slice(0, 128) : e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={`w-full px-4 py-3 bg-[var(--panel-hover)] border border-[var(--line)] rounded-[var(--ams-radius-control)] text-center text-xl text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus:border-[var(--accent)] font-sans ${mfaRecoveryMode ? "tracking-[0.12em]" : "tracking-[0.4em]"}`}
                placeholder={mfaRecoveryMode ? "XXXX-XXXX-XXXX" : "000000"}
              />
            </div>

            <button
              type="submit"
              disabled={loading || (mfaRecoveryMode ? mfaCode.trim().length < 12 : mfaCode.length !== 6)}
              className="w-full h-11 rounded-[var(--ams-radius-control)] bg-[var(--accent)] hover:bg-[var(--accent)] disabled:bg-[var(--panel-hover)] text-[var(--text)] text-xs font-medium font-sans normal-case tracking-normal flex items-center justify-center gap-2 transition-colors"
            >
              {loading
                ? (language === 'id' ? 'Memverifikasi…' : 'Verifying…')
                : (language === 'id' ? 'Verifikasi & Masuk' : 'Verify & Sign In')}
              {!loading && <ArrowRight size={14} />}
            </button>

            <button
              type="button"
              onClick={() => {
                setMfaRecoveryMode((current) => !current);
                setMfaCode('');
                setErrorMessage(null);
              }}
              disabled={loading}
              className="w-full h-10 rounded-[var(--ams-radius-control)] bg-transparent border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] text-xs font-sans font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {mfaRecoveryMode ? (language === 'id' ? 'Gunakan kode authenticator' : 'Use authenticator code') : (language === 'id' ? 'Gunakan recovery code' : 'Use recovery code')}
            </button>

            <button
              type="button"
              onClick={handleBackToPassword}
              disabled={loading}
              className="w-full h-10 rounded-[var(--ams-radius-control)] bg-[var(--panel-hover)] text-[var(--muted)] hover:text-[var(--text)] text-xs font-sans font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              {language === 'id' ? 'Kembali ke login password' : 'Back to password sign-in'}
            </button>
          </form>
          )}

          <p className="mt-5 pt-4 border-t border-[var(--line)] text-xs text-[var(--muted)] font-sans text-center">
            {language === 'id'
              ? 'Sesi diverifikasi oleh server.'
              : 'Session is verified by the server.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
