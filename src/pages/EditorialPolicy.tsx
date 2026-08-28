import React from 'react';
import { motion } from 'motion/react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';
import { BookOpen, CheckCircle2, Feather, FileText } from 'lucide-react';

export const EditorialPolicy = () => {
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
          <BookOpen className="w-3 h-3 text-brand-red" />
          <span>{language === 'id' ? 'Standar Konten & Publikasi' : 'Content & Publication Standards'}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tighter">
          {language === 'id' ? 'Kebijakan Editorial.' : 'Editorial Policy.'}
        </h1>
        <p className="text-xs sm:text-sm uppercase tracking-widest text-brand-red font-mono font-semibold mb-12">
          {language === 'id' ? 'Terakhir Diperbarui: Maret 2026' : 'Last Updated: March 2026'}
        </p>
        
        {language === 'id' ? (
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-[#8E8E93]">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. Komitmen Integritas Konten</h2>
              <p>
                Kebijakan Editorial Kapitech Agency menetapkan standar kualitas, akurasi faktual, dan transparansi untuk semua publikasi artikel teknis, laporan riset desain, studi kasus klien, dan wawasan industri yang diterbitkan di seluruh kanal resmi Kapitech. Kami berpegang teguh pada prinsip kejelasan, nilai praktis, dan ketelitian rekayasa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Verifikasi Faktual & Ketelitian Teknis</h2>
              <p className="mb-4">Seluruh konten teknis yang kami publikasikan harus memenuhi kriteria berikut:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Diuji di Lingkungan Nyata:</strong> Rekomendasi arsitektur perangkat lunak, benchmark performa, dan studi kasus desain didasarkan pada implementasi nyata dan data teruji di lingkungan produksi.</li>
                <li><strong className="text-white">Penelaahan Ahli Internal:</strong> Setiap artikel teknis melewati peer review oleh Senior Engineer atau Design Lead sebelum diterbitkan.</li>
                <li><strong className="text-white">Transparansi Sumber:</strong> Kami mencantumkan referensi pustaka resmi, dokumentasi open-source, dan pengakuan karya pihak ketiga dengan tautan langsung.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Transparansi Studi Kasus & Hak Klien</h2>
              <p>
                Semua studi kasus dan metrik kinerja yang ditampilkan pada portofolio kami telah disetujui bersama mitra klien dengan mematuhi ketentuan kerahasiaan NDA. Data yang bersifat rahasia secara finansial atau proprietary disajikan dalam bentuk agregat persentase atau indeks terstandardisasi demi menjaga privasi bisnis klien.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. Kebijakan Koreksi & Pembaruan</h2>
              <p>
                Dunia teknologi berkembang pesat. Kami secara berkala meninjau artikel lama untuk memperbarui dependensi pustaka yang usang atau menambahkan catatan versi baru. Apabila ditemukan kekeliruan faktual, tim editorial kami akan melakukan ralat secara transparan pada bagian catatan pembaruan artikel.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">5. Pengajuan Umpan Balik</h2>
              <p>
                Jika Anda memiliki masukan editorial atau permohonan klarifikasi teknis mengenai publikasi kami, silakan hubungi tim editorial di <a href="mailto:editorial@kapitech.id" className="text-brand-red hover:underline">editorial@kapitech.id</a>.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-[#8E8E93]">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. Content Integrity Commitment</h2>
              <p>
                The Kapitech Agency Editorial Policy governs the standards of quality, factual accuracy, and technical transparency for all published engineering essays, design research briefs, client case studies, and industry perspectives across our media channels. We operate with strict adherence to clarity, pragmatic utility, and craftsmanship.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Factual Verification & Technical Rigor</h2>
              <p className="mb-4">All technical materials published by Kapitech must satisfy strict internal benchmarks:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Production-Tested Insights:</strong> Architectural guides, speed benchmarks, and UI/UX design patterns are grounded in real-world production testing and validated datasets.</li>
                <li><strong className="text-white">Expert Peer Review:</strong> Every publication undergoes technical review by a Senior Engineer or Creative Director prior to release.</li>
                <li><strong className="text-white">Attribution Integrity:</strong> We provide full attribution and direct citations for open-source frameworks, benchmark methodologies, and third-party research papers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Case Study Transparency & Client Protection</h2>
              <p>
                All featured case studies and performance telemetry are published with explicit client consent adhering to confidentiality agreements (NDAs). Highly sensitive proprietary records or raw figures are anonymized into standardized percentage metrics to safeguard our clients' strategic advantages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. Corrections & Versioning Policy</h2>
              <p>
                Software ecosystems evolve rapidly. We continuously audit published articles to refresh outdated API references or add deprecation notes. When factual errors are identified, our editorial squad issues transparent errata notes directly within the article changelog.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">5. Feedback & Inquiries</h2>
              <p>
                For editorial inquiries, technical corrections, or publishing partnerships, contact our editorial team at <a href="mailto:editorial@kapitech.id" className="text-brand-red hover:underline">editorial@kapitech.id</a>.
              </p>
            </section>
          </div>
        )}
      </div>
    </motion.div>
  );
};
