'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronLeft, ChevronRight, Globe, DollarSign } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency';
import { useStoreI18n, storeTranslations } from '@/lib/store/i18n';

export function StoreNav() {
  const { itemCount, setCartOpen } = useCartStore();
  const { currency, setCurrency } = useCurrencyStore();
  const { lang, setLang, isRTL } = useStoreI18n();

  const t = storeTranslations[lang].nav;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl z-40 border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Back to Home */}
        <Link 
          href="/" 
          className="flex items-center text-xs font-semibold text-gray-500 hover:text-black transition-colors group"
        >
          {isRTL ? (
            <>
              <span>{t.backHome}</span>
              <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-0.5 transition-transform" />
            </>
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
              <span>{t.backHome}</span>
            </>
          )}
        </Link>

        {/* Center: Store Brand Link */}
        <Link href="/store" className="flex items-center gap-2">
          <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#0071E3" strokeWidth="16" strokeLinecap="round" />
            <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#34C759" strokeWidth="16" strokeLinecap="round" />
            <circle cx="100" cy="100" r="14" fill="#1D1D1F" />
          </svg>
          <span className="text-base font-bold tracking-tight text-[#1D1D1F]">
            {t.store}
          </span>
        </Link>

        {/* Right: Controls (Currency + Language + Cart Bag) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Currency Switcher Toggle [ AED | USD ] */}
          <div className="flex items-center bg-[#F5F5F7] p-1 rounded-xl border border-black/[0.04] text-[11px] font-bold">
            <button
              onClick={() => setCurrency('AED')}
              className={`px-2 py-0.5 rounded-lg transition ${
                currency === 'AED'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
              title="United Arab Emirates Dirham"
            >
              AED
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-0.5 rounded-lg transition ${
                currency === 'USD'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
              title="US Dollar"
            >
              USD
            </button>
          </div>

          {/* Language Switcher Toggle [ EN | العربية ] */}
          <div className="flex items-center bg-[#F5F5F7] p-1 rounded-xl border border-black/[0.04] text-[11px] font-bold">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-lg transition ${
                lang === 'en'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`px-2 py-0.5 rounded-lg transition ${
                lang === 'ar'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              العربية
            </button>
          </div>

          {/* Shopping Bag Button */}
          <button 
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 rounded-2xl bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs active:scale-95 flex items-center justify-center"
            aria-label={t.cart}
          >
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#0071E3] text-white text-[10px] font-bold px-1 flex items-center justify-center rounded-full border-2 border-white shadow-xs animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
