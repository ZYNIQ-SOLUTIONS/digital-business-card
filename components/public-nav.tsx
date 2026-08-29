'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';

export function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-gray-100 py-3.5 shadow-sm'
          : 'bg-white/70 backdrop-blur-sm border-b border-gray-50 py-4 md:py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
            <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
            <circle cx="100" cy="100" r="12" fill="#0f172a" />
          </svg>
          <span className="font-bold text-xl tracking-tight text-gray-900">IZN</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/#features" className="hover:text-gray-900 transition-colors">
            Features
          </Link>
          <Link href="/store" className="hover:text-gray-900 transition-colors">
            Store
          </Link>
          <Link href="/support" className="hover:text-gray-900 transition-colors">
            Support
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/auth"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth"
            className="px-4 py-2 rounded-full bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5"
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/auth"
            className="px-3 py-1.5 rounded-full bg-gray-900 text-white font-medium text-xs hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/#features"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Features
          </Link>
          <Link
            href="/store"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Store
          </Link>
          <Link
            href="/support"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Support & Help
          </Link>
          <Link
            href="/privacy"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Terms of Service
          </Link>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-gray-900 text-white font-medium text-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
