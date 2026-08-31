'use client';

import React, { useState } from 'react';
import { ProductCard } from '@/components/store/product-card';
import { Product } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency';
import { useStoreI18n, storeTranslations } from '@/lib/store/i18n';
import { Zap, ShieldCheck, Truck, Sparkles, Building2, ChevronRight, ChevronLeft, Check, Search } from 'lucide-react';
import Link from 'next/link';

interface StoreClientPageProps {
  initialProducts: Product[];
}

export function StoreClientPage({ initialProducts }: StoreClientPageProps) {
  const { lang, isRTL } = useStoreI18n();
  const { currency, setCurrency } = useCurrencyStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const t = storeTranslations[lang];

  // Category filtering
  const filteredProducts = initialProducts.filter((product) => {
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'metal') matchesCategory = product.category?.toLowerCase().includes('metal') ?? false;
      else if (selectedCategory === 'wood') matchesCategory = (product.category?.toLowerCase().includes('wood') || product.category?.toLowerCase().includes('bamboo')) ?? false;
      else if (selectedCategory === 'pvc') matchesCategory = (product.category?.toLowerCase().includes('pvc') || product.category?.toLowerCase().includes('matte') || product.category?.toLowerCase().includes('frost')) ?? false;
      else if (selectedCategory === 'accessories') matchesCategory = (product.category?.toLowerCase().includes('accessories') || product.category?.toLowerCase().includes('token') || product.category?.toLowerCase().includes('display')) ?? false;
      else matchesCategory = false;
    }
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (product.name?.toLowerCase().includes(searchLower) || product.description?.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-fade-in text-left">
      
      {/* Store Hero Banner */}
      <div className="relative rounded-[40px] bg-gradient-to-br from-neutral-900 via-black to-[#111116] text-white p-8 sm:p-14 overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#8b5cf6]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-[#10b981]/15 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">


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

          <div className="flex flex-col sm:items-end gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-neutral-100/80 hover:bg-neutral-200/80 focus:bg-white border border-transparent focus:border-black/[0.12] rounded-full text-sm outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-full">
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
                className={`px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 min-h-[40px] transition active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:text-black hover:bg-neutral-100 border border-black/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            ))}
            </div>
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
