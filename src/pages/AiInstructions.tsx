import React from 'react';
import { motion } from 'motion/react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';
import { Cpu, ShieldCheck, Lock, Eye, Sparkles } from 'lucide-react';

export const AiInstructions = () => {
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12 bg-black text-white/80 font-light relative selection:bg-brand-red selection:text-white"
    >
      <AtmosphericBackground 
        imageUrl="/hero_background_3d.png"
        opacity={0.05}
        disableGrayscale={true}
      />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-red/30 bg-brand-red/10 text-brand-red text-xs font-mono mb-4">
          <Sparkles className="w-3 h-3 text-brand-red" />
          <span>{language === 'id' ? 'Standar & Etika AI' : 'AI Standards & Ethics'}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tighter">
          {language === 'id' ? 'Panduan & Kebijakan AI.' : 'AI Instructions & Ethics.'}
        </h1>
        <p className="text-xs sm:text-sm uppercase tracking-widest text-brand-red font-mono font-semibold mb-12">
          {language === 'id' ? 'Terakhir Diperbarui: Maret 2026' : 'Last Updated: March 2026'}
        </p>
        
        {language === 'id' ? (
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-white/80">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. Filosofi Pemanfaatan AI di Kapitech</h2>
              <p>
                Di PT Kapitech Digital Indonesia ("Kapitech Agency"), kami memandang Artificial Intelligence (AI) sebagai instrumen penguat kemampuan manusia (human-augmentation tool), bukan pengganti pertimbangan kreatif, arsitektur rekayasa, atau akuntabilitas etis. Kami memanfaatkan model pembelajaran mesin canggih untuk mempercepat eksplorasi konsep, audit keamanan kode, dan optimasi alur kerja tanpa pernah mengorbankan integritas, orisinalitas, dan keamanan data klien.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Privasi & Kerahasiaan Data Klien</h2>
              <p className="mb-4">Perlindungan hak kekayaan intelektual (HAKI) dan data rahasia klien adalah prioritas mutlak kami:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Tanpa Pelatihan Model Publik:</strong> Tidak ada aset kepemilikan klien, kode sumber (source code), data keuangan, atau dokumen strategi bisnis yang diunggah atau digunakan untuk melatih (train) model AI publik pihak ketiga.</li>
                <li><strong>Environment Terenkripsi (Zero-Data Retention):</strong> Seluruh integrasi API AI internal kami menggunakan gateway enterprise dengan kebijakan tanpa penyimpanan data (zero data retention) dan enkripsi in-transit AES-256.</li>
                <li><strong>Kepatuhan NDA:</strong> Seluruh ketentuan kerahasiaan Non-Disclosure Agreement (NDA) tetap berlaku penuh dalam setiap proses komputasi yang dibantu AI.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Standar Rekayasa Kode & Validasi Manusia</h2>
              <p className="mb-4">Setiap baris kode atau aset yang dihasilkan atau dioptimalkan dengan bantuan AI wajib melalui kontrol kualitas ketat:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Tinjauan Arsitek Senior (Human-in-the-Loop):</strong> Tidak ada kode yang diintegrasikan ke codebase produksi tanpa review manual dan persetujuan dari Senior Software Engineer atau Tech Lead kami.</li>
                <li><strong>Audit Keamanan & Kerentanan:</strong> Kode yang dihasilkan diuji secara ketat terhadap standar keamanan OWASP Top 10, analisis kerentanan statis (SAST), dan pengujian penetrasi mandiri.</li>
                <li><strong>Bebas Lisensi Konflik:</strong> Kami memverifikasi bahwa kode yang dihasilkan tidak mengandung dependensi lisensi yang bertentangan (seperti GPL copyleft) untuk menjaga kepemilikan komersial klien secara utuh.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. Hak Cipta & Keaslian Desain</h2>
              <p>
                Eksplorasi visual dan konsep desain selalu dipimpin oleh desainer manusia kami. Setiap aset final, identitas merek, tipografi, dan antarmuka UI/UX yang diserahkan kepada klien adalah karya orisinal berhak cipta eksklusif yang siap untuk didaftarkan sebagai merek dagang resmi klien.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">5. Kontak & Transparansi</h2>
              <p>
                Jika Anda memiliki pertanyaan mengenai tata kelola AI, kebijakan privasi model, atau kepatuhan teknis di Kapitech, silakan hubungi tim kepatuhan kami di <a href="mailto:hello@kapitech.id" className="text-brand-red hover:underline">hello@kapitech.id</a>.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-white/80">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. AI Utilization Philosophy</h2>
              <p>
                At PT Kapitech Digital Indonesia ("Kapitech Agency"), we view Artificial Intelligence (AI) as a human-augmentation instrument rather than a replacement for creative vision, engineering judgment, or ethical accountability. We leverage advanced machine learning models to accelerate concept prototyping, codebase security audits, and workflow telemetry without compromising originality, craft, or client data safety.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Client Data Privacy & Confidentiality</h2>
              <p className="mb-4">Safeguarding client intellectual property and confidential records is non-negotiable:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>No Public Model Training:</strong> No proprietary client source code, financial records, strategic blueprints, or user database records are ever used to train third-party public AI models.</li>
                <li><strong>Enterprise Zero-Data Retention:</strong> All internal AI API pipelines operate through enterprise gateways enforcing strict zero-data-retention (ZDR) SLAs and in-transit AES-256 encryption.</li>
                <li><strong>NDA Enforcement:</strong> Non-Disclosure Agreement (NDA) clauses apply unconditionally across all AI-augmented computational and prototyping workflows.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Code Engineering Standards & Human-in-the-Loop</h2>
              <p className="mb-4">All AI-assisted engineering and architectural deliverables must satisfy rigorous human verification checkpoints:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Mandatory Senior Peer Review:</strong> No AI-generated code is deployed into client production environments without manual code review and explicit sign-off from our Tech Leads.</li>
                <li><strong>Security & Vulnerability Auditing:</strong> All deliverables undergo strict OWASP Top 10 compliance audits, static code analysis (SAST), and automated unit test suite verification.</li>
                <li><strong>Clean Licensing Integrity:</strong> We ensure code is free of restrictive copyleft licenses, guaranteeing full unencumbered commercial ownership for our clients.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. Copyright & Visual Authenticity</h2>
              <p>
                Visual design, brand identities, typography hierarchies, and UI/UX systems are authored under the creative direction of our human design team. All final client deliverables represent original, bespoke assets fully transferable to the client for commercial trademarking.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">5. Contact & Governance</h2>
              <p>
                For questions regarding Kapitech’s AI governance policies, security compliance, or model integration protocols, contact our governance squad at <a href="mailto:hello@kapitech.id" className="text-brand-red hover:underline">hello@kapitech.id</a>.
              </p>
            </section>
          </div>
        )}
      </div>
    </motion.div>
  );
};
