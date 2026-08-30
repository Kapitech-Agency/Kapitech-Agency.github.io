import React, { useState } from 'react';
import { X, Mail, Check, Copy, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface EmailForwardingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailForwardingGuideModal: React.FC<EmailForwardingGuideModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#16181D] border border-[#262930] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262930] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">
                {language === 'id' ? 'Panduan Notifikasi Email Otomatis' : 'Automated Email Alert Integration'}
              </h2>
              <p className="text-xs text-[#8A909D]">
                {language === 'id' 
                  ? 'Cara konfigurasi agar pesan klien langsung diteruskan ke inbox email Anda' 
                  : 'How to route client contact leads instantly into your primary executive mailbox'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#0B0C0E] hover:bg-[#20232B] text-[#8A909D] hover:text-white border border-[#262930] flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs">
          
          <div className="p-4 rounded-xl bg-[#0B0C0E] border border-[#262930]">
            <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>1. Alamat Email Tujuan Default</span>
            </h3>
            <p className="text-[#8A909D] leading-relaxed mb-3">
              Semua formulir publik (/contact, /careers, dan footer newsletter) sudah terhubung ke sistem penyimpanan database dan disiapkan untuk meneruskan ke email resmi:
            </p>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#16181D] border border-[#262930] font-mono text-white">
              <span>business@kapitech.id / kapitechagency@gmail.com</span>
              <button
                onClick={() => copyToClipboard('business@kapitech.id', 'email')}
                className="text-brand-red hover:underline text-[11px] flex items-center gap-1"
              >
                {copiedKey === 'email' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedKey === 'email' ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0C0E] border border-[#262930]">
            <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <Sparkles size={15} className="text-brand-red" />
              <span>2. Opsi Penyedia Email Relay (EmailJS / Resend API)</span>
            </h3>
            <p className="text-[#8A909D] leading-relaxed mb-2">
              Untuk mengaktifkan pengiriman email SMTP/API otomatis secara live tanpa server perantara:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[#8A909D] pl-1 font-sans">
              <li>Daftar gratis di <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="text-brand-red hover:underline inline-flex items-center gap-0.5">EmailJS.com <ExternalLink size={10} /></a> atau <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-brand-red hover:underline inline-flex items-center gap-0.5">Resend.com <ExternalLink size={10} /></a>.</li>
              <li>Buat Email Service yang terhubung ke akun Gmail atau domain <code className="text-white">@kapitech.id</code>.</li>
              <li>Salin <code className="text-white">SERVICE_ID</code>, <code className="text-white">TEMPLATE_ID</code>, dan <code className="text-white">PUBLIC_KEY</code> ke file konfigurasi <code className="text-white">src/lib/emailService.ts</code>.</li>
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0C0E] border border-[#262930]">
            <h3 className="font-bold text-white mb-1.5">
              3. Status Sistem Saat Ini
            </h3>
            <p className="text-[#8A909D] leading-relaxed">
              ✅ <strong>Real-time Inbox:</strong> Setiap kali ada user submit formulir di web, data langsung muncul di panel Inbox Admin secara instan dengan notifikasi suara audio chime dan badge unread counter.
            </p>
          </div>

        </div>

        {/* Footer actions */}
        <div className="pt-5 mt-5 border-t border-[#262930] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-red text-white text-xs font-mono font-bold hover:bg-brand-red/90 transition-all shadow-md shadow-brand-red/20"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
