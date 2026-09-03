import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Lock, 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Clock, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { authenticateAdmin, isUserAuthenticated, getLockoutState } from '../../lib/adminAuth';
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
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Check query params for redirect
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';

  // Check if already authenticated
  useEffect(() => {
    if (isUserAuthenticated()) {
      navigate(redirectUrl, { replace: true });
    }
  }, [navigate, redirectUrl]);

  // Handle lockout countdown timer
  useEffect(() => {
    const checkLock = () => {
      const lockState = getLockoutState();
      if (lockState.isLocked) {
        setLockoutTimer(lockState.remainingSeconds);
      } else {
        setLockoutTimer(0);
      }
    };

    checkLock();
    const interval = setInterval(() => {
      setLockoutTimer(prev => {
        if (prev <= 1) {
          checkLock();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (lockoutTimer > 0) {
      setErrorMessage(`Akun sementara terkunci demi keamanan. Silakan coba lagi dalam ${lockoutTimer} detik.`);
      return;
    }

    if (!identifier.trim() || !password) {
      setErrorMessage('Mohon lengkapi Username/Email dan Password.');
      return;
    }

    setLoading(true);

    try {
      const result = await authenticateAdmin(identifier, password, rememberMe);
      if (result.success) {
        navigate(redirectUrl, { replace: true });
      } else {
        setErrorMessage(result.error || 'Autentikasi gagal.');
        const lockState = getLockoutState();
        if (lockState.isLocked) {
          setLockoutTimer(lockState.remainingSeconds);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kendala saat memproses login.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex flex-col justify-between pt-20 pb-12 px-4 sm:px-6 relative overflow-hidden selection:bg-[#E50914] selection:text-white">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E50914]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#E50914]/[0.03] rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8A94A6] hover:text-white transition-colors group px-3 py-1.5 rounded-full bg-[#181B22] border border-[rgba(255,255,255,0.07)]"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>{language === 'id' ? 'Kembali ke Website Utama' : 'Back to Public Website'}</span>
        </Link>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#8A94A6]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Security Engine: ACTIVE</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10">
        <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-7 sm:p-9 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {/* Subtle Top Red Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E50914] to-transparent opacity-80" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-13 h-13 rounded-2xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#FF1E27] mx-auto mb-4 shadow-lg shadow-[#E50914]/10">
              <Lock size={26} />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#090A0F] border border-[rgba(255,255,255,0.07)] text-[10px] font-mono text-[#8A94A6] uppercase tracking-wider mb-2">
              <ShieldCheck size={12} className="text-[#FF1E27]" />
              <span>Kapitech Studio Infrastructure</span>
            </div>

            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              {language === 'id' ? 'Portal Admin Internal' : 'Admin Portal Login'}
            </h1>
            
            <p className="text-xs text-[#8A94A6] mt-1.5 leading-relaxed">
              {language === 'id' 
                ? 'Autentikasi terenkripsi untuk mengelola leads, pesan formulir, dan konten studio.' 
                : 'Encrypted management gateway for client leads, CMS content, and agency infrastructure.'}
            </p>
          </div>

          {/* Lockout Warning Banner */}
          {lockoutTimer > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-3 animate-pulse">
              <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-200 mb-1">Brute-Force Rate Limit Active</strong>
                <p>Terlalu banyak percobaan gagal. Akses ditangguhkan selama <span className="font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">{lockoutTimer}s</span>.</p>
              </div>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && lockoutTimer === 0 && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs font-mono flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier Field */}
            <div>
              <label className="block text-xs font-mono text-[#8A94A6] uppercase tracking-wider mb-1.5 font-semibold">
                Username / Email Admin
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF1E27]" size={16} />
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={loading || lockoutTimer > 0}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin atau email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914] transition-all font-mono placeholder:text-[#64748B] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono text-[#8A94A6] uppercase tracking-wider font-semibold">
                  Password
                </label>
                <span className="text-[10px] font-mono text-[#64748B]">SHA-256 Protected</span>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF1E27]" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading || lockoutTimer > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914] transition-all font-mono placeholder:text-[#64748B] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#090A0F] border-[rgba(255,255,255,0.07)] text-[#FF1E27] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#E50914]"
                />
                <span className="text-xs text-[#8A94A6]">
                  {language === 'id' ? 'Ingat sesi selama 30 hari' : 'Remember session (30 days)'}
                </span>
              </label>

              <span className="text-[11px] font-mono text-[#64748B]">v2.4.0</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutTimer > 0}
              className="w-full mt-2 h-10 min-h-[40px] rounded-xl bg-[#E50914] hover:bg-[#FF1E27] disabled:bg-[#262930] disabled:text-[#64748B] text-white text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-lg shadow-[#E50914]/20 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span>Memverifikasi Kredensial...</span>
              ) : (
                <>
                  <span>{language === 'id' ? 'Masuk ke Dashboard Admin' : 'Sign In to Admin Portal'}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Enterprise Security Assurance Footer */}
          <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-between text-[11px] font-mono text-[#8A94A6]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Zero-Trust Architecture</span>
            </div>
            <span className="text-[#64748B]">TLS 1.3 • AES-256</span>
          </div>

        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-md w-full mx-auto text-center z-10">
        <p className="text-[11px] font-mono text-[#64748B]">
          © {new Date().getFullYear()} PT Kapitech Global Digital • Secure Administrative Subsystem
        </p>
      </div>

    </div>
  );
};
export default AdminLogin;
