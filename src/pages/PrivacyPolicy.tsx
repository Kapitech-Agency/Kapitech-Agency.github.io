import React from 'react';
import { motion } from 'motion/react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';

export const PrivacyPolicy = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-40 pb-20 px-6 md:px-12 bg-black text-white/80 font-light relative"
    >
      <AtmosphericBackground 
        accentColor="blue"
        statusText="PRIVACY_PROTOCOL_ACTIVE"
        scanMode="DATA_PROTECTION"
        sysRef="KPTCH_SEC_NODE"
        opacity={0.02}
      />
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-12 tracking-tighter">Privacy Policy.</h1>
        <p className="text-sm uppercase tracking-widest text-brand-red font-bold mb-12">Last Updated: March 31, 2026</p>
        
        <div className="space-y-12 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">1. Introduction</h2>
            <p>
              PT Kapitech Digital Indonesia ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including IT Development, UI/UX Design, and Graphic Design.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">2. Information We Collect</h2>
            <p className="mb-4">We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you inquire about our services.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">3. Use of Your Information</h2>
            <p className="mb-4">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and manage your account.</li>
              <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions and the Site to you.</li>
              <li>Email you regarding your account or order.</li>
              <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
              <li>Increase the efficiency and operation of the Site.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">4. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows: By Law or to Protect Rights; Third-Party Service Providers; Marketing Communications; Business Transfers; and other situations described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">5. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">6. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
              <br /><br />
              <strong>PT Kapitech Digital Indonesia</strong><br />
              South Tangerang, Indonesia<br />
              Email: hello@kapitech.co.id
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
