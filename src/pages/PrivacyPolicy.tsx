import React from 'react';
import { motion } from 'motion/react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';

export const PrivacyPolicy = () => {
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
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tighter">
          {language === 'id' ? 'Kebijakan Privasi.' : 'Privacy Policy.'}
        </h1>
        <p className="text-xs sm:text-sm uppercase tracking-widest text-brand-red font-mono font-semibold mb-12">
          {language === 'id' ? 'Terakhir Diperbarui: 31 Maret 2026' : 'Last Updated: March 31, 2026'}
        </p>
        
        {language === 'id' ? (
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-[#8E8E93]">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. Pendahuluan</h2>
              <p>
                PT Kapitech Digital Indonesia ("Kapitech Agency", "kami", atau "kita") berkomitmen penuh untuk melindungi privasi dan keamanan data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, memproses, dan melindungi informasi Anda saat Anda mengunjungi situs web kami, berinteraksi dengan tim kami, atau menggunakan layanan kami, termasuk Pengembangan Perangkat Lunak & Web, Desain UI/UX, Aplikasi Mobile, dan Sistem Identitas Brand.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Informasi yang Kami Kumpulkan</h2>
              <p className="mb-4">Kami dapat mengumpulkan informasi mengenai Anda melalui berbagai cara sebagai berikut:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Data Pribadi & Kontak:</strong> Informasi yang dapat diidentifikasi secara pribadi seperti nama lengkap, alamat email bisnis, nomor telepon/WhatsApp, nama perusahaan, jabatan, dan detail spesifikasi proyek yang Anda kirimkan secara sukarela melalui formulir konsultasi kami.</li>
                <li><strong className="text-white">Data Teknis & Derivatif:</strong> Informasi yang otomatis dikumpulkan server kami saat Anda mengakses situs, seperti alamat IP, tipe peramban (browser), sistem operasi, waktu akses, serta riwayat halaman yang Anda jelajahi untuk tujuan analitik performa.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Penggunaan Informasi Anda</h2>
              <p className="mb-4">Memiliki informasi yang akurat memungkinkan kami memberikan pengalaman layanan yang terarah, cepat, dan profesional. Secara spesifik, kami menggunakan informasi Anda untuk:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mempersiapkan penawaran proyek, estimasi ruang lingkup kerja (SOW), dan jadwal pengerjaan.</li>
                <li>Menghubungi Anda terkait konsultasi teknis, pembaruan proyek, dan koordinasi sprint.</li>
                <li>Mengelola faktur, perjanjian kerahasiaan (NDA), dan transaksi bisnis resmi.</li>
                <li>Meningkatkan kinerja, keamanan sistem, dan stabilitas infrastruktur website kami.</li>
                <li>Mengirimkan wawasan industri, studi kasus teknologi terbaru, atau buletin jika Anda memilih untuk berlangganan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. Pengungkapan & Perlindungan Data</h2>
              <p>
                Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga mana pun. Data Anda hanya dapat diakses oleh tim internal dan penyedia infrastruktur cloud berlisensi tinggi (seperti Google Cloud, AWS, atau penyedia email terenkripsi) semata-mata untuk kelancaran operasional layanan. Kami juga terikat dengan Perjanjian Kerahasiaan (Non-Disclosure Agreement / NDA) yang ketat untuk setiap proyek klien.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">5. Keamanan Informasi</h2>
              <p>
                Kami menerapkan standar pengamanan administratif, teknis, dan fisik terbaik, termasuk enkripsi SSL/TLS 256-bit, autentikasi multi-faktor, dan protokol firewall modern untuk melindungi data sensitif Anda dari akses yang tidak sah.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">6. Hubungi Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan, klarifikasi, atau permintaan penghapusan data seputar Kebijakan Privasi ini, silakan hubungi tim legal kami di:
                <br /><br />
                <strong className="text-white">PT Kapitech Digital Indonesia</strong><br />
                Linea Residence, Blok G No. 5, Jl. Melati Loka, Paku Jaya, Serpong Utara, Kota Tangerang Selatan, Banten 15220, Indonesia<br />
                Email Bisnis: <a href="mailto:business@kapitech.id" className="text-brand-red hover:underline">business@kapitech.id</a><br />
                Email Resmi: <a href="mailto:hello@kapitech.id" className="text-white/90 hover:underline">hello@kapitech.id</a><br />
                Telepon / WhatsApp: <a href="tel:+6287769957062" className="text-brand-red hover:underline">+62 877-6995-7062</a>
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-12 text-base md:text-lg leading-relaxed text-[#8E8E93]">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. Introduction</h2>
              <p>
                PT Kapitech Digital Indonesia ("Kapitech Agency," "we," "our," or "us") is deeply committed to protecting your privacy and confidential data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our digital services, including IT Development, UI/UX Design, Mobile Engineering, and Brand Identity Systems.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Information We Collect</h2>
              <p className="mb-4">We may collect information about you in a variety of transparent ways. The information we collect on our Site includes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Personal & Contact Data:</strong> Personally identifiable information, such as your full name, work email address, phone/WhatsApp number, company name, and project scope details that you voluntarily submit when inquiring about our engineering and design capabilities.</li>
                <li><strong className="text-white">Technical & Derivative Data:</strong> Information our servers automatically log when you access the Site, such as your IP address, browser type, operating system, access timestamps, and the pages visited to optimize website performance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Use of Your Information</h2>
              <p className="mb-4">Having accurate project and contact information allows us to provide you with a seamless, responsive, and customized collaboration experience. Specifically, we use collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prepare accurate project estimates, scope proposals, and delivery roadmaps.</li>
                <li>Communicate directly regarding sprint milestones, design reviews, and technical queries.</li>
                <li>Process non-disclosure agreements (NDAs), contracts, and billing transactions.</li>
                <li>Enhance site security, detect anomalies, and optimize server infrastructure.</li>
                <li>Share relevant technology insights, engineering articles, and studio updates when subscribed.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. Disclosure & Data Protection</h2>
              <p>
                We never sell, rent, or trade your personal data or intellectual property. Information is strictly shared with vetted enterprise infrastructure providers (such as Google Cloud, AWS, or secure communication channels) exclusively to fulfill your digital projects under robust Non-Disclosure Agreements (NDAs).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">5. Security of Your Information</h2>
              <p>
                We employ comprehensive physical, electronic, and procedural safeguards, including 256-bit SSL/TLS encryption, zero-trust cloud policies, and strict access controls to maintain the integrity and confidentiality of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">6. Contact Us</h2>
              <p>
                If you have questions, feedback, or requests regarding this Privacy Policy, please contact our legal and privacy team at:
                <br /><br />
                <strong className="text-white">PT Kapitech Digital Indonesia</strong><br />
                Linea Residence, Block G No. 5, Melati Loka Street, Paku Jaya, North Serpong, South Tangerang City, Banten 15220, Indonesia<br />
                Business Email: <a href="mailto:business@kapitech.id" className="text-brand-red hover:underline">business@kapitech.id</a><br />
                Official Email: <a href="mailto:hello@kapitech.id" className="text-white/90 hover:underline">hello@kapitech.id</a><br />
                Phone / WhatsApp: <a href="tel:+6287769957062" className="text-brand-red hover:underline">+62 877-6995-7062</a>
              </p>
            </section>
          </div>
        )}
      </div>
    </motion.div>
  );
};
