import React from 'react';
import Link from 'next/link';
import { PublicNav } from '@/components/public-nav';
import { PublicFooter } from '@/components/public-footer';
import { SupportForm } from './support-form';
import { 
  LifeBuoy, 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  Smartphone, 
  CreditCard, 
  Building2, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const metadata = {
  title: 'Support & Help Center | IZN - Digital Business Card',
  description: 'Need help with your IZN digital business card, NFC card order, Apple Wallet pass, or enterprise team? Contact our customer support engineering team.',
};

const FAQS = [
  {
    question: 'How do I add my IZN digital card to Apple Wallet?',
    answer: 'Once you create your profile and preview your card, click the "Add to Apple Wallet" button. Your personalized .pkpass file will download and open directly inside your native Apple Wallet app. Double-click your iPhone power button at any time to present your pass.'
  },
  {
    question: 'How long does shipping take for NFC cards in the UAE & globally?',
    answer: 'For Dubai, Abu Dhabi, and other Emirates, orders are dispatched via local express courier within 1-2 business days. International deliveries to the GCC, Europe, and Americas typically arrive within 4-7 business days with end-to-end tracking.'
  },
  {
    question: 'Do recipients need an app to scan my card or NFC badge?',
    answer: 'No app is needed! When you tap your NFC card or someone scans your QR code, your interactive digital profile opens immediately in their default mobile browser (Safari, Chrome, etc.) with a 1-tap "Save Contact" vCard button.'
  },
  {
    question: 'How does the IZN AI Business Card Scanner work?',
    answer: 'Simply upload or snap a photo of any physical paper business card within your dashboard. Our AI vision model extracts names, job titles, companies, emails, phone numbers, and social links instantly, storing them directly into your digital Rolodex.'
  },
  {
    question: 'Can I manage digital passes for my entire company or team?',
    answer: 'Yes! The IZN Enterprise Dashboard allows company administrators to bulk-provision branded digital cards, manage employee directory access, update company logos globally, and track team networking analytics.'
  },
  {
    question: 'What if my NFC card stops working or gets damaged?',
    answer: 'All IZN physical NFC smart cards come with an unconditional 1-Year Chip Guarantee. If your card ever fails to scan, submit a ticket with your order number and we will send a free replacement immediately.'
  }
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <PublicNav />

      {/* Hero Header */}
      <div className="pt-32 pb-16 bg-gradient-to-b from-gray-50 via-white to-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-5">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>24/7 Dedicated Support</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            How can we help you today?
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Have a question about your digital pass, NFC hardware order, or enterprise setup? Our dedicated support engineers are here to help.
          </p>
        </div>
      </div>

      {/* Main Grid: Support Channels & Ticket Form */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Support Channels Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all flex flex-col">
            <div className="p-3 bg-blue-600 text-white rounded-2xl w-fit mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Email Support</h3>
            <p className="text-xs text-gray-500 mb-4">For general inquiries, partnership, or account requests.</p>
            <div className="mt-auto">
              <a 
                href="mailto:support@izncard.com" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
              >
                support@izncard.com
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all flex flex-col">
            <div className="p-3 bg-green-600 text-white rounded-2xl w-fit mb-4">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Direct UAE Desk</h3>
            <p className="text-xs text-gray-500 mb-4">Sunday to Thursday: 9:00 AM – 6:00 PM GST.</p>
            <div className="mt-auto">
              <a 
                href="tel:+97140000000" 
                className="text-sm font-medium text-green-700 hover:text-green-800 font-mono"
              >
                +971 (04) 800-IZN
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all flex flex-col">
            <div className="p-3 bg-purple-600 text-white rounded-2xl w-fit mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Fast Response Time</h3>
            <p className="text-xs text-gray-500 mb-4">Average response within 2–4 hours during business days.</p>
            <div className="mt-auto">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                Specialists Online
              </span>
            </div>
          </div>
        </div>

        {/* Support Ticket Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          
          {/* Left Side: Context & Guidelines */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                Submit an inquiry or report an issue.
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Whether you need assistance activating your NFC card, setting up custom domains, or managing team licenses, fill out the form and our admin team will respond promptly.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-4 text-xs text-gray-600">
              <h4 className="font-semibold text-gray-900 text-sm">Helpful Tips for Faster Resolution:</h4>
              <div className="space-y-2">
                <p>• Include your <strong>Order ID</strong> (if asking about physical NFC card shipping).</p>
                <p>• Mention your device model and iOS/Android version if reporting a wallet pass issue.</p>
                <p>• For Enterprise teams, provide your registered company name.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100/80 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-900 block mb-0.5">Secure Tracking</strong>
                Every submitted ticket generates a unique reference code tracked in our internal admin console until fully resolved.
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-7">
            <SupportForm />
          </div>
        </div>

        {/* FAQ Section */}
        <section id="faq" className="max-w-4xl mx-auto pt-12 border-t border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Instant Answers</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Find quick answers to the most common questions regarding IZN.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <details
                key={index}
                className="group bg-gray-50/80 rounded-2xl border border-gray-100 p-5 transition-all open:bg-white open:shadow-sm open:border-gray-200"
              >
                <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between text-sm sm:text-base list-none select-none">
                  <span>{faq.question}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-3" />
                </summary>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-100/70">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
