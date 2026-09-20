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
    if (!/^\\d{6}$/.test(mfaCode.trim())) {
      setErrorMessage(language === 'id' ? 'Masukkan kode MFA 6 digit.' : 'Enter the 6-digit MFA code.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.mfaVerify(mfaCode.trim());
      if (result.success && result.data?.success && result.data.user) {
        cacheAdminSession(result.data.user, rememberMe);
        window.dispatchEvent(new Event('kapitech_auth_state_changed'));
        navigate(redirectUrl, { replace: true });
      } else {
        setErrorMessage(result.error || result.data?.error || (language === 'id' ? 'Kode MFA tidak valid.' : 'Invalid MFA code.'));
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : (language === 'id' ? 'Verifikasi MFA gagal.' : 'MFA verification failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPassword = () => {
    setMfaRequired(false);
    setMfaCode('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8A94A6] hover:text-white mb-6"
        >
          <ArrowLeft size={14} />
          {language === 'id' ? 'Kembali ke Website' : 'Back to Website'}
        </Link>

        <div className="bg-[#111318] border border-white/[0.08] rounded-2xl p-7 shadow-2xl">
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#FF1E27] mx-auto mb-4">
              <Lock size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {language === 'id' ? 'Portal Admin Internal' : 'Internal Admin Portal'}
            </h1>
            <p className="text-xs text-[#8A94A6] mt-2 leading-relaxed">
              {language === 'id'
                ? 'Masuk untuk mengelola operasi, CRM, proyek, keuangan, dan konten Kapitech.'
                : 'Sign in to manage Kapitech operations, CRM, projects, finance, and content.'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!mfaRequired ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#8A94A6] mb-1.5">
                {language === 'id' ? 'Username / Email' : 'Username / Email'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF1E27]" />
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={loading}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#181B22] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914] font-mono"
                  placeholder="admin atau email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8A94A6] mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF1E27]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#181B22] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914] font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#8A94A6] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#E50914]"
              />
              {language === 'id' ? 'Pertahankan sesi di perangkat ini' : 'Keep this session on this device'}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] disabled:bg-[#262930] text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              {loading
                ? (language === 'id' ? 'Memverifikasi…' : 'Verifying…')
                : (language === 'id' ? 'Masuk' : 'Sign In')}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
          ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-5">
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck size={18} className="text-amber-400" />
                {language === 'id' ? 'Verifikasi MFA diperlukan' : 'MFA verification required'}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#8A94A6]">
                {language === 'id'
                  ? 'Buka aplikasi authenticator Anda dan masukkan kode TOTP 6 digit untuk menyelesaikan login.'
                  : 'Open your authenticator app and enter the 6-digit TOTP code to complete sign-in.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8A94A6] mb-1.5">
                {language === 'id' ? 'Kode TOTP' : 'TOTP code'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\\d{6}"
                maxLength={6}
                required
                autoFocus
                disabled={loading}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-[#181B22] border border-white/[0.08] rounded-xl text-center text-xl tracking-[0.4em] text-white focus:outline-none focus:border-[#E50914] font-mono"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className="w-full h-11 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] disabled:bg-[#262930] text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              {loading
                ? (language === 'id' ? 'Memverifikasi…' : 'Verifying…')
                : (language === 'id' ? 'Verifikasi & Masuk' : 'Verify & Sign In')}
              {!loading && <ArrowRight size={14} />}
            </button>

            <button
              type="button"
              onClick={handleBackToPassword}
              disabled={loading}
              className="w-full h-10 rounded-xl bg-[#181B22] text-[#8A94A6] hover:text-white text-xs font-mono font-bold transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              {language === 'id' ? 'Kembali ke login password' : 'Back to password sign-in'}
            </button>
          </form>
          )}

          <p className="mt-5 pt-4 border-t border-white/[0.07] text-[11px] text-[#64748B] font-mono text-center">
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
