'use client';

import { Product, useCartStore } from '@/lib/store/cart-store';
import { Plus, Check, Star, ArrowRight, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const productUrl = `/store/product?id=${product.id}`;

  return (
    <div className="bg-white rounded-[28px] p-5 flex flex-col group border border-black/[0.06] hover:border-black/[0.18] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* Product Image & Link */}
      <Link href={productUrl} className="block relative aspect-square w-full mb-5 bg-[#F5F5F7] rounded-2xl overflow-hidden cursor-pointer">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            IZN Hardware
          </div>
        )}
        
        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-black uppercase shadow-xs">
          {product.category || "Hardware"}
        </div>

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            <span>View Specs</span>
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
          <span className="text-[10px] text-gray-500 font-medium ml-1">5.0 (Verified)</span>
        </div>

        <Link href={productUrl}>
          <h3 className="text-base font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>
        
        {/* Footer with Price & Add Button */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.05] mt-auto">
          <div>
            <span className="block text-[9px] text-gray-400 uppercase font-semibold">Price</span>
            <span className="text-base font-bold text-[#1D1D1F]">
              AED {Number(product.price).toFixed(2)}
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
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
