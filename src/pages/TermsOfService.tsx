import React from 'react';
import { motion } from 'motion/react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';

export const TermsOfService = () => {
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
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tighter">
          {language === 'id' ? 'Syarat & Ketentuan Layanan.' : 'Terms of Service.'}
        </h1>
        <p className="text-xs sm:text-sm uppercase tracking-widest text-brand-red font-mono font-semibold mb-12">
          {language === 'id' ? 'Terakhir Diperbarui: 31 Maret 2026' : 'Last Updated: March 31, 2026'}
        </p>
        
        {language === 'id' ? (
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-white/80">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. Penerimaan Ketentuan</h2>
              <p>
                Dengan mengakses website ini atau menggunakan layanan yang disediakan oleh PT Kapitech Digital Indonesia ("Kapitech Agency", "kami", atau "kita"), Anda menyatakan setuju untuk terikat dengan Syarat dan Ketentuan Layanan ini. Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda disarankan untuk tidak melanjutkan penggunaan situs web dan layanan kami.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Deskripsi Layanan & Lingkup Kerja</h2>
              <p>
                Kapitech Agency menyediakan berbagai layanan produk digital profesional, termasuk Rekayasa Perangkat Lunak & Web (Next.js, React, Node.js), Desain UI/UX & Prototipe Interaktif, Pengembangan Aplikasi Mobile (iOS & Android), Sistem Identitas Visual Brand, dan Arsitektur Cloud. Setiap proyek terikat pada Pernyataan Kerja (Statement of Work / SOW) atau Perjanjian Kontrak tersendiri yang merinci deliverables, milestone, dan biaya resmi.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Hak Kekayaan Intelektual (IP Rights)</h2>
              <p>
                Setelah seluruh kewajiban pembayaran proyek diselesaikan secara penuh sesuai kontrak, seluruh kode sumber kustom, aset desain, dan dokumentasi yang dibuat khusus untuk klien akan sepenuhnya dialihkan kepemilikannya kepada klien, kecuali komponen pustaka sumber terbuka (open-source libraries) atau alat pihak ketiga yang tunduk pada lisensi masing-masing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. Perjanjian Kerahasiaan (NDA) & Keamanan</h2>
              <p>
                Kami menjunjung tinggi kerahasiaan ide bisnis, data pengguna, kode pemrograman, dan strategi internal klien. Kami siap menandatangani Perjanjian Kerahasiaan (Non-Disclosure Agreement / NDA) sebelum fase penemuan (discovery) dimulai guna melindungi hak eksklusif Anda.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">5. Garansi & Pemeliharaan Pasca-Peluncuran</h2>
              <p>
                Setiap proyek yang dideploy secara resmi mencakup garansi perbaikan bug dan penyesuaian teknis selama 30 hari kalender tanpa biaya tambahan. Dukungan berkelanjutan di luar masa garansi dapat diperpanjang melalui paket SLA (Service Level Agreement) pemeliharaan bulanan kami.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">6. Batasan Tanggung Jawab</h2>
              <p>
                PT Kapitech Digital Indonesia tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari gangguan server pihak ketiga (seperti pemadaman cloud AWS/GCP, API eksternal pihak ketiga, atau force majeure). Total liabilitas kami dibatasi sebesar nilai pembayaran yang diterima atas layanan spesifik terkait.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">7. Hukum yang Mengatur</h2>
              <p>
                Syarat dan Ketentuan Layanan ini diatur dan ditafsirkan berdasarkan hukum Republik Indonesia. Segala perselisihan yang timbul dari pelaksanaan kontrak akan diselesaikan melalui musyawarah mufakat atau yurisdiksi pengadilan di Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">8. Kontak Resmi</h2>
              <p>
                Untuk konsultasi hukum, penandatanganan NDA, atau pertanyaan seputar ketentuan layanan ini, silakan hubungi:
                <br /><br />
                <strong className="text-white">PT Kapitech Digital Indonesia</strong><br />
                Linea Residence, Blok G No. 5, Jl. Melati Loka, Paku Jaya, Serpong Utara, Kota Tangerang Selatan, Banten 15220, Indonesia<br />
                Email: <a href="mailto:hello@kapitech.id" className="text-brand-red hover:underline">hello@kapitech.id</a><br />
                Telepon: <a href="tel:+6287769957062" className="text-brand-red hover:underline">+62 877-6995-7062</a>
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-white/80">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the website and digital services provided by PT Kapitech Digital Indonesia ("Kapitech Agency," "we," "our," or "us"), you agree to be legally bound by these Terms of Service. If you do not agree to these terms, please do not use our website or commission our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Description of Services & Scope</h2>
              <p>
                Kapitech Agency delivers enterprise-grade digital services including Software & Web Development (Next.js, React, Node.js), UI/UX Design Systems, Mobile Application Development, and Brand Architecture. Specific engagements are formalized under a distinct Statement of Work (SOW) or Master Services Agreement outlining deliverables, sprint milestones, and pricing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Intellectual Property Ownership</h2>
              <p>
                Upon final invoice settlement in full, all custom source code, bespoke design artifacts, and deliverables produced specifically for the client transfer entirely to the client's ownership, excluding pre-existing frameworks and standard open-source dependencies subject to their respective licenses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. Confidentiality & Non-Disclosure</h2>
              <p>
                We hold all client business ideas, roadmaps, technical architecture, and proprietary information in strict confidence. We routinely execute bilateral Non-Disclosure Agreements (NDAs) before initiating architectural discovery sessions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">5. Post-Launch Warranty & SLAs</h2>
              <p>
                All launched products include an initial 30-day warranty covering bug fixes and code optimizations. Continuous infrastructure monitoring, security updates, and iterative features are supported through our dedicated monthly SLA maintenance packages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">6. Limitation of Liability</h2>
              <p>
                In no event shall PT Kapitech Digital Indonesia be liable for indirect, incidental, or consequential damages resulting from third-party hosting outages or external API failures. Our aggregate liability is strictly capped at the total fees paid by the client for the specific service milestone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">7. Governing Law</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes arising shall be subject to the exclusive jurisdiction of the courts of Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">8. Contact Us</h2>
              <p>
                If you have questions regarding these Terms of Service or contract inquiries, please reach out to:
                <br /><br />
                <strong className="text-white">PT Kapitech Digital Indonesia</strong><br />
                Linea Residence, Block G No. 5, Melati Loka Street, Paku Jaya, North Serpong, South Tangerang City, Banten 15220, Indonesia<br />
                Email: <a href="mailto:hello@kapitech.id" className="text-brand-red hover:underline">hello@kapitech.id</a><br />
                Phone: <a href="tel:+6287769957062" className="text-brand-red hover:underline">+62 877-6995-7062</a>
              </p>
            </section>
          </div>
        )}
      </div>
    </motion.div>
  );
};
