'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const { items, isCartOpen, setCartOpen, removeItem, updateQuantity, cartTotal } = useCartStore();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={() => setCartOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-medium tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Bag
          </h2>
          <button 
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Your bag is empty.</p>
              <button 
                onClick={() => setCartOpen(false)}
                className="text-black font-medium hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.product.image_url ? (
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <button 
                      onClick={() => removeItem(item.product.id)}
                      className="text-gray-400 hover:text-black transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-500 text-sm mt-1">{item.product.category}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 border border-gray-200 rounded-full px-3 py-1">
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) updateQuantity(item.product.id, item.quantity - 1);
                        }}
                        className="text-gray-500 hover:text-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-gray-500 hover:text-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="font-medium">AED {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>AED {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>AED {cartTotal.toFixed(2)}</span>
            </div>
            
            <Link 
              href="/store/checkout"
              onClick={() => setCartOpen(false)}
              className="block w-full bg-black text-white text-center py-4 rounded-full font-medium hover:bg-gray-900 transition-colors mt-6"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
