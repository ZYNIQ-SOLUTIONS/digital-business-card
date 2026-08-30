'use client';

import React, { useState } from 'react';
import { ProductCard } from '@/components/store/product-card';
import { Product } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency';
import { useStoreI18n, storeTranslations } from '@/lib/store/i18n';
import { Zap, ShieldCheck, Truck, Sparkles, Building2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import Link from 'next/link';

interface StoreClientPageProps {
  initialProducts: Product[];
}

export function StoreClientPage({ initialProducts }: StoreClientPageProps) {
  const { lang, isRTL } = useStoreI18n();
  const { currency, setCurrency } = useCurrencyStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const t = storeTranslations[lang];

  // Category filtering
  const filteredProducts = initialProducts.filter((product) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'metal') return product.category?.toLowerCase().includes('metal');
    if (selectedCategory === 'wood') return product.category?.toLowerCase().includes('wood') || product.category?.toLowerCase().includes('bamboo');
    if (selectedCategory === 'pvc') return product.category?.toLowerCase().includes('pvc') || product.category?.toLowerCase().includes('matte') || product.category?.toLowerCase().includes('frost');
    if (selectedCategory === 'accessories') return product.category?.toLowerCase().includes('accessories') || product.category?.toLowerCase().includes('token') || product.category?.toLowerCase().includes('display');
    return true;
  });

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-fade-in text-left">
      
      {/* Store Hero Banner */}
      <div className="relative rounded-[40px] bg-gradient-to-br from-neutral-900 via-black to-[#111116] text-white p-8 sm:p-14 overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#8b5cf6]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-[#10b981]/15 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#38BDF8]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.hero.collectionBadge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08] text-white">
            {t.hero.titleLine1} <br/>
            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              {t.hero.titleLine2}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-xl leading-relaxed pt-1">
            {t.hero.description}
          </p>

          {/* Quick Feature Pills */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#34C759]" />
              <span>{t.hero.pill1}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{t.hero.pill2}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.hero.pill3}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition 4-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center mb-2">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-black">{t.valueProps.tapTitle}</h3>
          <p className="text-xs text-gray-500">{t.valueProps.tapDesc}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-black">{t.valueProps.laserTitle}</h3>
          <p className="text-xs text-gray-500">{t.valueProps.laserDesc}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-2">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-black">{t.valueProps.deliveryTitle}</h3>
          <p className="text-xs text-gray-500">{t.valueProps.deliveryDesc}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-black">{t.valueProps.syncTitle}</h3>
          <p className="text-xs text-gray-500">{t.valueProps.syncDesc}</p>
        </div>
      </div>

      {/* Products Showcase Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
              {t.catalog.heading}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {t.catalog.subheading}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: t.catalog.filterAll },
              { id: 'metal', label: t.catalog.filterMetal },
              { id: 'wood', label: t.catalog.filterWood },
              { id: 'pvc', label: t.catalog.filterPvc },
              { id: 'accessories', label: t.catalog.filterAccessories },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:text-black hover:bg-neutral-100 border border-black/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Enterprise Bulk Custom Hardware Callout */}
      <div className="rounded-3xl bg-white border border-black/[0.08] p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#0071E3] tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>{t.enterprise.badge}</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-black">
            {t.enterprise.title}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t.enterprise.desc}
          </p>
        </div>

        <Link
          href="/dashboard/enterprise"
          className="px-6 py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0"
        >
          <span>{t.enterprise.cta}</span>
          {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Link>
      </div>

    </div>
  );
}
