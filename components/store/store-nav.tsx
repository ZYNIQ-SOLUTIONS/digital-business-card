'use client';

import Link from 'next/link';
import { ShoppingBag, ChevronLeft } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';

export function StoreNav() {
  const { itemCount, setCartOpen } = useCartStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        <Link href="/store" className="text-xl font-semibold tracking-tight text-black">
          Store
        </Link>

        <button 
          onClick={() => setCartOpen(true)}
          className="relative p-2 text-gray-700 hover:text-black transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] font-medium flex items-center justify-center rounded-full">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
