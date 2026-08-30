'use client';

import { Product, useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency';
import { useStoreI18n, storeTranslations, PRODUCT_TRANSLATIONS } from '@/lib/store/i18n';
import { Plus, Check, Star, Eye } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const { lang, isRTL } = useStoreI18n();
  const [added, setAdded] = useState(false);

  const t = storeTranslations[lang].catalog;
  const productTrans = PRODUCT_TRANSLATIONS[product.id];

  const displayName = (lang === 'ar' && productTrans) ? productTrans.name : product.name;
  const displayDescription = (lang === 'ar' && productTrans) ? productTrans.description : product.description;
  const displayCategory = (lang === 'ar' && productTrans) ? productTrans.category : (product.category || "Hardware");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const productUrl = `/store/product?id=${product.id}`;

  return (
    <div 
      dir={isRTL ? "rtl" : "ltr"}
      className="bg-white rounded-[28px] p-5 flex flex-col group border border-black/[0.06] hover:border-black/[0.18] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden text-left"
    >
      {/* Product Image & Link */}
      <Link href={productUrl} className="block relative aspect-square w-full mb-5 bg-[#F5F5F7] rounded-2xl overflow-hidden cursor-pointer">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={displayName}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            IZN Hardware
          </div>
        )}
        
        {/* Category Pill Tag */}
        <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-black uppercase shadow-xs`}>
          {displayCategory}
        </div>

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            <span>{t.viewSpecs}</span>
          </span>
        </div>
      </Link>
      
      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 font-medium ml-1">{t.verified}</span>
        </div>

        <Link href={productUrl}>
          <h3 className="text-base font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-1 mb-1">
            {displayName}
          </h3>
        </Link>

        <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
          {displayDescription}
        </p>
        
        {/* Footer with Price & Add Button */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.05] mt-auto">
          <div>
            <span className="block text-[9px] text-gray-400 uppercase font-semibold">{t.priceLabel}</span>
            <span className="text-base font-bold text-[#1D1D1F]">
              {formatPrice(Number(product.price))}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={`px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-1.5 transition-all duration-300 active:scale-95 shadow-xs ${
              added
                ? "bg-[#34C759] text-white"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
            aria-label="Add to cart"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t.added}</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t.add}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
