import React from 'react';
import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-100">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
                <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                <circle cx="100" cy="100" r="12" fill="#0f172a" />
              </svg>
              <span className="font-bold text-lg text-gray-900 tracking-tight">IZN</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              The next-generation digital business card & smart networking platform. Integrated directly into Apple & Samsung Wallets.
            </p>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/#features" className="hover:text-gray-900 transition-colors">
                  Digital Wallet Passes
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-gray-900 transition-colors">
                  NFC Smart Cards & Badges
                </Link>
              </li>
              <li>
                <Link href="/#enterprise" className="hover:text-gray-900 transition-colors">
                  Enterprise Solutions
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-gray-900 transition-colors">
                  AI Contact Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Support & Help</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/support" className="hover:text-gray-900 transition-colors">
                  Help Center & Ticket Submission
                </Link>
              </li>
              <li>
                <Link href="/support#faq" className="hover:text-gray-900 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-gray-900 transition-colors">
                  Track NFC Order
                </Link>
              </li>
              <li>
                <a href="mailto:support@izncard.com" className="hover:text-gray-900 transition-colors">
                  support@izncard.com
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Legal & Compliance</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy#gdpr" className="hover:text-gray-900 transition-colors">
                  GDPR / Data Protection
                </Link>
              </li>
              <li>
                <Link href="/terms#refunds" className="hover:text-gray-900 transition-colors">
                  Refund & Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} IZN Created by <a href="https://zyniq.studio" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline font-semibold transition-colors">ZYNIQ Studio</a>. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">
              Terms
            </Link>
            <Link href="/support" className="hover:text-gray-600 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
