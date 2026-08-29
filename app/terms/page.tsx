import React from 'react';
import Link from 'next/link';
import { PublicNav } from '@/components/public-nav';
import { PublicFooter } from '@/components/public-footer';
import { Scale, FileCheck, AlertTriangle, Truck, CreditCard, ShieldCheck, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | IZN - Digital Business Card',
  description: 'Review the Terms of Service governing your use of IZN digital business cards, NFC smart products, Apple/Samsung wallet passes, and enterprise services.',
};

export default function TermsPage() {
  const lastUpdated = 'August 29, 2026';

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <PublicNav />

      {/* Header Banner */}
      <div className="pt-32 pb-16 bg-gradient-to-b from-gray-50 via-white to-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-5">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Please read these Terms of Service carefully before creating an account, ordering NFC products, or using the IZN platform.
          </p>
          <div className="mt-6 text-xs text-gray-400 font-mono">
            Last Updated: {lastUpdated} • Effective Date: January 1, 2026
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Key Points Overview */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gray-50 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gray-900 text-white rounded-2xl shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Transparent Terms</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Clear rules covering digital cards, wallet passes, hardware orders, and enterprise licenses.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gray-900 text-white rounded-2xl shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Physical NFC Shipping</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Fast courier fulfillment across Dubai, Abu Dhabi, UAE, and international destinations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gray-900 text-white rounded-2xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">UAE & Global Law</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Governed under the laws of the United Arab Emirates and recognized electronic commerce principles.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Text Sections */}
        <div className="space-y-12 text-gray-700 leading-relaxed text-[15px]">
          
          {/* Section 1 */}
          <section id="agreement" className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">1</span>
              Agreement to Terms
            </h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) and <strong>IZN Technologies LLC</strong> (&quot;IZN&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), regarding your access to and use of our digital business card web applications, mobile wallet integrations (Apple Wallet, Google Wallet, Samsung Wallet), AI card processing tools, NFC card hardware, and enterprise management software.
            </p>
            <p>
              By signing up for an account, purchasing items in the IZN Store, or sharing your digital business card, you explicitly agree to be bound by these Terms. If you do not agree, you must not access or use our Services.
            </p>
          </section>

          {/* Section 2 */}
          <section id="accounts" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">2</span>
              User Accounts & Security
            </h2>
            <p>
              To access core platform features, you must register for an account. You agree to provide accurate, current, and complete information during registration and keep your profile updated.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li>You are responsible for maintaining the confidentiality of your authentication credentials.</li>
              <li>You must immediately notify us at <a href="mailto:support@izncard.com" className="text-blue-600 underline">support@izncard.com</a> of any unauthorized use or security breach.</li>
              <li>Accounts may not be transferred, leased, or sold to third parties without prior written consent from IZN.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="digital-cards" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">3</span>
              Digital Cards & Wallet Pass Licenses
            </h2>
            <p>
              IZN grants you a non-exclusive, non-transferable, revocable license to generate and display digital business cards, install cryptographic Apple Wallet passes, and share your personal or professional contact information.
            </p>
            <p>
              You retain all ownership rights to the personal content, logos, and links you upload. However, you grant IZN the right to host, render, format, and transmit this content to provide your public card and wallet passes to recipients.
            </p>
          </section>

          {/* Section 4 */}
          <section id="refunds" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">4</span>
              Store Orders, NFC Hardware & Shipping Policy
            </h2>
            <p>
              When purchasing custom physical NFC cards, metal smart cards, or RFID accessories from the IZN Store:
            </p>
            <div className="space-y-3 text-sm text-gray-600 pl-2">
              <div>
                <strong className="text-gray-900">Pricing & Payment:</strong> All prices are displayed in UAE Dirhams (AED) or specified local currency. Payment must be completed prior to order fulfillment.
              </div>
              <div>
                <strong className="text-gray-900">Shipping & Delivery:</strong> We ship throughout the UAE (Dubai, Abu Dhabi, Sharjah, Ajman, RAK, Fujairah, UAQ) and internationally. Estimated delivery times are provided at checkout.
              </div>
              <div>
                <strong className="text-gray-900">Hardware Warranty:</strong> All physical NFC smart cards come with a <strong>1-Year NFC Chip Replacement Guarantee</strong> against chip defect or hardware failure under normal use.
              </div>
              <div>
                <strong className="text-gray-900">Returns & Refunds:</strong> Custom-printed or laser-engraved NFC cards are personalized items and cannot be returned once production has commenced, unless defective upon delivery. Defective goods will be replaced free of charge.
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="acceptable-use" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">5</span>
              Acceptable Use & User Conduct
            </h2>
            <p>You agree not to use the IZN Services to:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li>Impersonate any person, business, or entity, or falsely claim affiliation with an enterprise.</li>
              <li>Upload malicious code, phishing links, malware, deceptive QR targets, or fraudulent URLs.</li>
              <li>Transmit unsolicited commercial spam, pyramid schemes, or illegal promotional material.</li>
              <li>Interfere with, disrupt, or reverse-engineer the platform, server infrastructure, or pass generation engines.</li>
              <li>Violate the intellectual property, privacy, or publicity rights of any third party.</li>
            </ul>
            <p className="text-sm text-red-600 font-medium">
              Violation of this policy will result in immediate termination of your card, revocation of wallet passes, and possible legal referral.
            </p>
          </section>

          {/* Section 6 */}
          <section id="enterprise" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">6</span>
              Enterprise & Team Accounts
            </h2>
            <p>
              Organizations subscribing to the IZN Enterprise Dashboard are responsible for managing member seats, ensuring accurate corporate branding, and adhering to organizational seat limits. Company admins have the authority to reassign, edit, or revoke member cards at any time.
            </p>
          </section>

          {/* Section 7 */}
          <section id="liability" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">7</span>
              Disclaimer & Limitation of Liability
            </h2>
            <p>
              The Services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. To the maximum extent permitted by applicable law, IZN shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform, physical NFC cards, or wallet services.
            </p>
          </section>

          {/* Section 8 */}
          <section id="governing-law" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">8</span>
              Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the <strong>Emirate of Dubai and the Federal Laws of the United Arab Emirates</strong>. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Dubai, UAE.
            </p>
          </section>

          {/* Section 9 */}
          <section id="contact-terms" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">9</span>
              Contact & Inquiries
            </h2>
            <p>
              For legal inquiries, terms clarification, or formal notifications, please reach out through our <Link href="/support" className="text-blue-600 underline font-medium">Support Portal</Link> or email:
            </p>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5 text-sm">
              <p><strong>IZN Technologies LLC - Legal Department</strong></p>
              <p>Email: <a href="mailto:legal@izncard.com" className="text-blue-600 hover:underline">legal@izncard.com</a> / <a href="mailto:support@izncard.com" className="text-blue-600 hover:underline">support@izncard.com</a></p>
              <p>Location: Dubai, United Arab Emirates</p>
            </div>
          </section>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
