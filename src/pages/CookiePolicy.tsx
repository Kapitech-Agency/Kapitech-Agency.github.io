import React from 'react';
import { motion } from 'motion/react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';
import { Shield, Cookie, ToggleLeft } from 'lucide-react';

export const CookiePolicy = () => {
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12 bg-[#0A0A0A] text-[#8E8E93] font-light relative selection:bg-brand-red selection:text-white"
    >
      <AtmosphericBackground 
        imageUrl="/hero_background_3d.png"
        opacity={0.05}
        disableGrayscale={true}
      />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2A2A2A] bg-[#161616] text-white text-xs font-mono mb-4">
          <Cookie className="w-3 h-3 text-brand-red" />
          <span>{language === 'id' ? 'Preferensi Cookie & Privasi' : 'Cookie Preferences & Privacy'}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tighter">
          {language === 'id' ? 'Kebijakan Cookie.' : 'Cookie Policy.'}
        </h1>
        <p className="text-xs sm:text-sm uppercase tracking-widest text-brand-red font-mono font-semibold mb-12">
          {language === 'id' ? 'Terakhir Diperbarui: Maret 2026' : 'Last Updated: March 2026'}
        </p>
        
        {language === 'id' ? (
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-[#8E8E93]">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. Apa Itu Cookie?</h2>
              <p>
                Cookie adalah file teks kecil yang ditempatkan di perangkat Anda saat Anda mengunjungi situs web kami. Cookie membantu kami mengenali preferensi Anda (seperti pilihan bahasa EN/ID), menjaga stabilitas sesi penjelajahan, dan memahami bagaimana pengunjung berinteraksi dengan halaman kami untuk meningkatkan kecepatan dan pengalaman pengguna.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Kategori Cookie yang Kami Gunakan</h2>
              <p className="mb-4">Kami menggunakan jenis cookie berikut:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Cookie Esensial & Fungsional (Wajib):</strong> Cookie ini penting agar situs web berfungsi dengan semestinya, seperti menyimpan preferensi bahasa pilihan Anda dan memastikan keamanan formulir kontak.</li>
                <li><strong className="text-white">Cookie Performa & Analitik (Opsional):</strong> Membantu kami mengukur metrik anonim seperti waktu muat halaman, halaman yang paling sering dilihat, dan rasio interaksi guna meningkatkan kinerja teknis website. Kami tidak melacak informasi identitas pribadi (PII) melalui cookie analitik.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Pengendalian & Penolakan Cookie</h2>
              <p>
                Anda memiliki kendali penuh untuk menerima atau menolak cookie melalui pengaturan peramban (browser) Anda. Sebagian besar browser web secara otomatis menerima cookie, namun Anda dapat memodifikasi pengaturan browser Anda untuk menolak cookie jika Anda menginginkannya. Harap diperhatikan bahwa menonaktifkan cookie fungsional tertentu dapat memengaruhi penyimpanan preferensi bahasa Anda.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. Hubungi Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan mengenai penggunaan cookie atau perlindungan data privasi di Kapitech Agency, silakan hubungi tim kami di <a href="mailto:privacy@kapitech.id" className="text-brand-red hover:underline">privacy@kapitech.id</a>.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-[#8E8E93]">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. What Are Cookies?</h2>
              <p>
                Cookies are compact data files placed on your browser or device when visiting our website. Cookies enable our application to remember your preferences (such as EN/ID language selection), maintain secure session states, and understand aggregate traffic patterns to optimize performance and responsiveness.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Categories of Cookies We Use</h2>
              <p className="mb-4">We classify cookies into the following operational groups:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Essential & Functional Cookies (Required):</strong> Essential for core website operations, such as storing your active language toggle preference and securing contact form submissions against spam.</li>
                <li><strong className="text-white">Performance & Telemetry Cookies (Optional):</strong> Allow us to measure aggregate anonymous performance indicators, including page render latency and user navigation flows. We do not store Personally Identifiable Information (PII) in telemetry cookies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Managing & Disabling Cookies</h2>
              <p>
                You retain full control over cookie permissions through your web browser preferences. Most modern browsers allow you to inspect, block, or delete stored cookies at any time. Please note that disabling essential storage cookies may reset your UI language choices upon page refresh.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. Inquiries</h2>
              <p>
                For questions regarding cookie management or digital privacy compliance at Kapitech Agency, reach out to our privacy office at <a href="mailto:privacy@kapitech.id" className="text-brand-red hover:underline">privacy@kapitech.id</a>.
              </p>
            </section>
          </div>
        )}
      </div>
    </motion.div>
  );
};
