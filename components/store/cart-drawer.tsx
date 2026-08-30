'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency';
import { useStoreI18n, storeTranslations, PRODUCT_TRANSLATIONS } from '@/lib/store/i18n';
import { X, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const { items, isCartOpen, setCartOpen, removeItem, updateQuantity, cartTotal } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const { lang, isRTL } = useStoreI18n();

  const t = storeTranslations[lang].cart;

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={() => setCartOpen(false)}
      />
      <div 
        dir={isRTL ? "rtl" : "ltr"}
        className={`fixed ${isRTL ? 'left-0' : 'right-0'} top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-in ${isRTL ? 'slide-in-from-left' : 'slide-in-from-right'} duration-300`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0071E3]" />
            <span>{t.title}</span>
          </h2>
          <button 
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p className="text-base font-bold text-gray-700">{t.empty}</p>
              <p className="text-xs text-gray-400 text-center max-w-xs">{t.emptySub}</p>
              <button 
                onClick={() => setCartOpen(false)}
                className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-neutral-800 transition"
              >
                {t.shopNow}
              </button>
            </div>
          ) : (
            items.map((item) => {
              const trans = PRODUCT_TRANSLATIONS[item.product.id];
              const itemName = (lang === 'ar' && trans) ? (item.product.name.includes('(Custom:') ? `${trans.name} (${item.product.name.split('(')[1]}` : trans.name) : item.product.name;

              return (
                <div key={item.product.id} className="flex gap-4 p-3.5 rounded-2xl bg-[#F5F5F7]/70 border border-black/[0.04]">
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-black/[0.04]">
                    {item.product.image_url ? (
                      <img 
                        src={item.product.image_url} 
                        alt={itemName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between text-left">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug">{itemName}</h3>
                      <button 
                        onClick={() => removeItem(item.product.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 mt-auto">
                      <div className="flex items-center gap-2.5 bg-white border border-black/[0.08] rounded-xl px-2.5 py-1 shadow-2xs">
                        <button 
                          onClick={() => {
                            if (item.quantity > 1) updateQuantity(item.product.id, item.quantity - 1);
                          }}
                          className="text-gray-500 hover:text-black transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-black">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-black transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <p className="font-bold text-xs text-black">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {items.length > 0 && (
          <div className="p-6 border-t border-black/[0.06] bg-white space-y-4 shadow-lg">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{t.subtotal}</span>
              <span className="font-bold text-black text-sm">{formatPrice(cartTotal)}</span>
            </div>
            
            <p className="text-[11px] text-green-600 font-medium text-center">
              ✓ {t.freeShippingNote}
            </p>
            
            <Link 
              href="/store/checkout"
              onClick={() => setCartOpen(false)}
              className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-center py-4 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{t.checkout}</span>
              {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
