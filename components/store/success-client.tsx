'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, PackageCheck, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useStoreI18n, storeTranslations } from '@/lib/store/i18n';

export function SuccessClient() {
  const { lang, isRTL } = useStoreI18n();
  const t = storeTranslations[lang].success;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="text-center max-w-lg w-full bg-white p-8 sm:p-12 rounded-[36px] border border-black/[0.06] shadow-xl space-y-6">
        
        <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0071E3] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIP Courier Dispatch Confirmed</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-black">
            {t.title}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] text-xs text-left space-y-1.5">
          <div className="flex items-center justify-between font-bold text-black">
            <span>{lang === 'ar' ? 'حالة التوصيل' : 'Fulfillment Status'}</span>
            <span className="text-green-600 font-mono">● {lang === 'ar' ? 'تجهيز حفر الليزر' : 'Engraving & Packing'}</span>
          </div>
          <p className="text-[11px] text-gray-500">
            {lang === 'ar' ? 'مندوب التوصيل سيتواصل معك عبر الواتساب ورقم الهاتف لتأكيد موعد الاستلام.' : 'Our courier team will WhatsApp and call you before delivery.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link 
            href="/store"
            className="flex-1 bg-black text-white font-bold text-xs py-4 rounded-2xl hover:bg-neutral-800 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <span>{t.continueShopping}</span>
            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>

      </div>
    </div>
  );
}
