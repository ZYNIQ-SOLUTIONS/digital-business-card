import React from 'react';
import Link from 'next/link';
import { PublicNav } from '@/components/public-nav';
import { PublicFooter } from '@/components/public-footer';
import { Shield, Lock, Eye, FileText, Database, Globe, HelpCircle, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | IZN - Digital Business Card',
  description: 'Learn how IZN protects your privacy, secures your digital business card data, and handles personal information in compliance with international privacy laws.',
};

export default function PrivacyPage() {
  const lastUpdated = 'August 29, 2026';

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <PublicNav />

      {/* Header Banner */}
      <div className="pt-32 pb-16 bg-gradient-to-b from-gray-50 via-white to-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-5">
            <Shield className="w-3.5 h-3.5" />
            <span>Trust & Transparency</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            At IZN, your privacy is our top priority. We believe in minimal data collection, zero data selling, and uncompromising cryptographic security.
          </p>
          <div className="mt-6 text-xs text-gray-400 font-mono">
            Last Updated: {lastUpdated} • Effective Date: January 1, 2026
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Quick Highlights Box */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-blue-50/60 border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Zero Data Selling</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                We never sell, rent, or monetize your contact connections or card views to third parties.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Full Granular Control</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Choose exactly which links, social handles, and contact details appear in Work or Social modes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">GDPR & UAE Compliance</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Built to strictly adhere to GDPR, CCPA, and UAE Federal Decree-Law on Personal Data Protection.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Text Sections */}
        <div className="space-y-12 text-gray-700 leading-relaxed text-[15px]">
          
          {/* Section 1 */}
          <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">1</span>
              Introduction & Scope
            </h2>
            <p>
              Welcome to <strong>IZN Technologies LLC</strong> (&quot;IZN&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). This Privacy Policy governs your use of our digital business card platform, including our website at <Link href="/" className="text-blue-600 underline">izncard.com</Link>, our Apple Wallet PassKit generation services, Samsung/Google Wallet integration, NFC smart card hardware, and AI-powered business card scanning tools (collectively, the &quot;Services&quot;).
            </p>
            <p>
              By accessing or using our Services, you acknowledge that you have read and understood how we collect, store, process, and safeguard your personal information. If you do not agree with our policies and practices, please discontinue use of our Services immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section id="information-collected" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">2</span>
              Information We Collect
            </h2>
            <p>
              We collect information in three ways: directly from you, automatically through your use of our Services, and through authorized third-party integrations.
            </p>

            <div className="space-y-3 pl-2">
              <h3 className="font-semibold text-gray-900 text-base">A. Information You Provide Directly:</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                <li><strong>Account Details:</strong> Email address, name, password hash, profile avatar, and enterprise organization association.</li>
                <li><strong>Digital Business Card Content:</strong> Full name, job title, company name, bio, phone numbers, email addresses, website links, social media profile URLs (LinkedIn, Instagram, X/Twitter, WhatsApp, etc.), and custom files (e.g. PDF brochures or pitch decks).</li>
                <li><strong>E-Commerce & Shipping Details:</strong> When ordering physical NFC cards or smart badges from our store, we collect delivery address (city, area, street, building), recipient phone number, and transaction receipt data.</li>
                <li><strong>Customer Support Inquiries:</strong> Messages, ticket logs, phone numbers, and correspondence when contacting our support desk.</li>
              </ul>

              <h3 className="font-semibold text-gray-900 text-base pt-2">B. Information Processed via AI Features:</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                <li><strong>Paper Card OCR Extraction:</strong> When you upload a photo of a physical business card, the image is parsed ephemerally by our AI model to extract contact fields. We do not retain the raw image longer than necessary to complete extraction.</li>
                <li><strong>AI Bio Generation:</strong> Prompts and job titles provided to enhance your professional bio are processed strictly to return generated copy.</li>
              </ul>

              <h3 className="font-semibold text-gray-900 text-base pt-2">C. Automatically Collected Telemetry:</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                <li><strong>Card Interaction Metrics:</strong> Aggregate view counts, tap counts, and vCard download events to provide analytics in your user dashboard.</li>
                <li><strong>Technical Data:</strong> IP address, device type, browser user agent, operating system, and wallet pass installation tokens.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section id="how-we-use-info" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">3</span>
              How We Use Your Information
            </h2>
            <p>We use your information exclusively for legitimate business purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">Service Delivery</span>
                Generating digital cards, compiling cryptographic Apple Wallet `.pkpass` files, and programming NFC links.
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">Hardware Fulfillment</span>
                Printing, encoding, and shipping custom physical NFC business cards across UAE and internationally.
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">Enterprise Management</span>
                Enabling company admins to provision, update, and manage team member passes at scale.
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="font-semibold text-gray-900 block mb-1">Customer Support</span>
                Responding to help tickets, troubleshooting NFC connectivity, and resolving order inquiries.
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="data-sharing" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">4</span>
              Data Sharing & Third-Party Disclosure
            </h2>
            <p>
              We do <strong>NOT</strong> sell, trade, or rent your personal data to advertising networks or data brokers. Data is disclosed only to the following necessary service providers under strict data processing agreements:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              <li><strong>Cloud & Database Infrastructure:</strong> Supabase (PostgreSQL), cloud servers hosted in secure data centers with encrypted storage.</li>
              <li><strong>Mobile Wallet Providers:</strong> Apple Inc. (PassKit Web Services) to deliver and push real-time updates to passes saved on iOS devices.</li>
              <li><strong>Delivery & Logistics Partners:</strong> Local and international couriers (e.g. in Dubai/Abu Dhabi) solely for delivering physical NFC card merchandise.</li>
              <li><strong>Legal Compliance:</strong> If required by valid court order, government subpoena, or applicable UAE / international law.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="gdpr" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">5</span>
              Your Rights (GDPR, CCPA & UAE Law)
            </h2>
            <p>Regardless of your geographic location, IZN grants you full control over your personal data:</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Right to Access & Portability:</strong> You may download or export all contact data and card assets from your account at any time.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Right to Rectification:</strong> You can edit or modify your public card details in real time via your dashboard.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You may request complete deletion of your account, digital cards, and wallet passes by contacting our support team.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Right to Restrict or Object to Processing:</strong> You can toggle card visibility to private or disable NFC routing instantly.
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="security" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">6</span>
              Security & Cryptography
            </h2>
            <p>
              We implement industry-standard security measures including TLS 1.3 encryption in transit, AES-256 encryption at rest, strict Row-Level Security (RLS) on all database tables, and Apple-certified cryptographic signing for digital passes. While no digital platform can guarantee 100% invulnerability, we continuously test and audit our defenses.
            </p>
          </section>

          {/* Section 7 */}
          <section id="contact" className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-800 text-sm font-mono">7</span>
              Contact Our Privacy Team
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please submit a ticket via our <Link href="/support" className="text-blue-600 underline font-medium">Support Center</Link> or contact us directly:
            </p>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5 text-sm">
              <p><strong>IZN Technologies LLC</strong></p>
              <p>Attn: Data Protection Officer</p>
              <p>Email: <a href="mailto:privacy@izncard.com" className="text-blue-600 hover:underline">privacy@izncard.com</a> / <a href="mailto:support@izncard.com" className="text-blue-600 hover:underline">support@izncard.com</a></p>
              <p>Location: Dubai, United Arab Emirates</p>
            </div>
          </section>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
