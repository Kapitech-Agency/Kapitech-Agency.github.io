import React from 'react';
import { motion } from 'motion/react';

export const TermsOfService = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-40 pb-20 px-6 md:px-12 bg-black text-white/80 font-light"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-12 tracking-tighter">Terms of Service.</h1>
        <p className="text-sm uppercase tracking-widest text-brand-red font-bold mb-12">Last Updated: March 31, 2026</p>
        
        <div className="space-y-12 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the website and services provided by PT Kapitech Digital Indonesia ("we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">2. Description of Services</h2>
            <p>
              We provide a range of digital services, including but not limited to IT Development, UI/UX Design, and Graphic Design. The specific terms of each service will be outlined in a separate agreement or proposal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">3. Use of Services</h2>
            <p className="mb-4">You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensuring that all information you provide to us is accurate and complete.</li>
              <li>Maintaining the confidentiality of any account information or passwords.</li>
              <li>Not using our services to transmit any harmful or illegal content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">4. Intellectual Property</h2>
            <p>
              All content and materials provided as part of our services, including designs, code, and graphics, are the property of PT Kapitech Digital Indonesia or its licensors and are protected by intellectual property laws. You are granted a limited, non-exclusive license to use these materials for your internal business purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">5. Limitation of Liability</h2>
            <p>
              In no event shall PT Kapitech Digital Indonesia be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with our services. Our total liability to you for any claim shall not exceed the amount paid by you for the specific service in question.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">6. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes arising out of these terms shall be resolved in the courts of Indonesia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Any changes will be effective immediately upon posting on our website. Your continued use of our services after any changes indicates your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
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
