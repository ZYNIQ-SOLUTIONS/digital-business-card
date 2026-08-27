'use client';

import { Product, useCartStore } from '@/lib/store/cart-store';
import { Plus } from 'lucide-react';
import Image from 'next/image';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();

  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col group shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square relative w-full mb-6 bg-gray-50 rounded-2xl overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
          {product.category}
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-semibold">AED {Number(product.price).toFixed(2)}</span>
          <button
            onClick={() => addItem(product)}
            disabled={!product.in_stock}
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
