'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency';
import { useStoreI18n, storeTranslations, PRODUCT_TRANSLATIONS } from '@/lib/store/i18n';
import { placeOrder } from './actions';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Truck, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCartStore();
  const { formatPrice, currency } = useCurrencyStore();
  const { lang, isRTL } = useStoreI18n();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = storeTranslations[lang].checkout;

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      router.replace('/store');
    }
  }, [items, router, isSubmitting]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      customer_name: formData.get('customer_name') as string,
      customer_phone: formData.get('customer_phone') as string,
      shipping_city: formData.get('shipping_city') as string,
      shipping_area: formData.get('shipping_area') as string,
      shipping_street: formData.get('shipping_street') as string,
      shipping_building: formData.get('shipping_building') as string,
      total_amount: cartTotal,
      items: items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_time: item.product.price,
      }))
    };

    const result = await placeOrder(payload);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      clearCart();
      router.push('/store/success');
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#0071E3] font-bold mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black">{t.title}</h1>
        </div>

        <Link href="/store" className="text-xs font-semibold text-gray-500 hover:text-black transition flex items-center gap-1">
          {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{lang === 'ar' ? 'العودة للمتجر' : 'Return to Store'}</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-[32px] border border-black/[0.06] shadow-sm space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium border border-red-200">
                {error}
              </div>
            )}

            {/* Contact Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <span>{lang === 'ar' ? 'معلومات العميل للتوصيل' : 'Contact Information'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.fullName}</label>
                  <input required name="customer_name" type="text" className="w-full border border-black/[0.08] rounded-xl px-3.5 py-2.5 bg-[#F5F5F7] focus:bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-black transition" placeholder={lang === 'ar' ? 'إبراهيم الخليل' : 'John Doe'} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.phone}</label>
                  <input required name="customer_phone" type="tel" className="w-full border border-black/[0.08] rounded-xl px-3.5 py-2.5 bg-[#F5F5F7] focus:bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-black transition" placeholder="+971 50 123 4567" />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="pt-5 border-t border-black/[0.06] space-y-4">
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0071E3]" />
                <span>{t.shippingInfo}</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.city}</label>
                  <select required name="shipping_city" className="w-full border border-black/[0.08] rounded-xl px-3.5 py-2.5 bg-[#F5F5F7] focus:bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-black transition">
                    <option value="">{lang === 'ar' ? 'اختر الإمارة / المدينة' : 'Select Emirate / City'}</option>
                    <option value="Dubai">Dubai / دبي</option>
                    <option value="Abu Dhabi">Abu Dhabi / أبوظبي</option>
                    <option value="Sharjah">Sharjah / الشارقة</option>
                    <option value="Ajman">Ajman / عجمان</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah / رأس الخيمة</option>
                    <option value="Fujairah">Fujairah / الفجيرة</option>
                    <option value="Umm Al Quwain">Umm Al Quwain / أم القيوين</option>
                    <option value="Worldwide">International Worldwide Express</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{lang === 'ar' ? 'المنطقة / الحي' : 'Area / Neighborhood'}</label>
                  <input required name="shipping_area" type="text" className="w-full border border-black/[0.08] rounded-xl px-3.5 py-2.5 bg-[#F5F5F7] focus:bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-black transition" placeholder={lang === 'ar' ? 'مثال: وسط مدينة دبي (Downtown)' : 'e.g. Downtown Dubai, Marina'} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{t.address}</label>
                    <input required name="shipping_street" type="text" className="w-full border border-black/[0.08] rounded-xl px-3.5 py-2.5 bg-[#F5F5F7] focus:bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-black transition" placeholder={lang === 'ar' ? 'شارع الشيخ زايد' : 'e.g. Sheikh Zayed Rd'} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{lang === 'ar' ? 'المبنى / رقم الفيلا' : 'Building / Villa No.'}</label>
                    <input required name="shipping_building" type="text" className="w-full border border-black/[0.08] rounded-xl px-3.5 py-2.5 bg-[#F5F5F7] focus:bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-black transition" placeholder={lang === 'ar' ? 'برج 1، شقة 104' : 'e.g. Tower 1, Apt 104'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="pt-5 border-t border-black/[0.06] space-y-3">
              <h2 className="text-lg font-bold text-black">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</h2>
              <div className="p-4 border border-black/[0.08] rounded-2xl bg-[#F5F5F7] flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-black block">{lang === 'ar' ? 'الدفع عند الاستلام (CoD) / البطاقة عند التسليم' : 'Cash on Delivery (CoD) / Card on Delivery'}</span>
                  <span className="text-[11px] text-gray-500">{lang === 'ar' ? 'ادفع نقداً أو بالبطاقة عند استلام بطاقتك الذكية' : 'Pay when your laser custom card arrives'}</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{lang === 'ar' ? 'متاح فوري' : 'Active'}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-sm py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.processing}</span>
                </>
              ) : (
                <span>{t.placeOrder} • {formatPrice(cartTotal)}</span>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-400">
              {lang === 'ar' ? 'بإتمام الطلب، أنت توافق على شروط الخدمة وسياسة الاسترجاع.' : 'By placing your order, you agree to our terms and conditions.'}
            </p>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-[32px] border border-black/[0.06] shadow-sm sticky top-24 space-y-4">
            <h2 className="text-base font-bold text-black">{t.orderSummary}</h2>
            
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => {
                const trans = PRODUCT_TRANSLATIONS[item.product.id];
                const itemName = (lang === 'ar' && trans) ? (item.product.name.includes('(Custom:') ? `${trans.name} (${item.product.name.split('(')[1]}` : trans.name) : item.product.name;

                return (
                  <div key={item.product.id} className="flex gap-3 p-2.5 rounded-2xl bg-[#F5F5F7]">
                    <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-black/[0.04]">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={itemName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center text-left">
                      <h3 className="text-xs font-bold text-black line-clamp-1">{itemName}</h3>
                      <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-xs font-bold text-black mt-0.5">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-black/[0.06] pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-bold text-black">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{lang === 'ar' ? 'الشحن والتوصيل' : 'Shipping (UAE)'}</span>
                <span className="text-green-600 font-bold">{lang === 'ar' ? 'مجاناً' : 'FREE'}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-black/[0.06]">
                <span>{t.total}</span>
                <span className="text-base text-[#0071E3]">{formatPrice(cartTotal)}</span>
              </div>
            </div>
            
            <div className="pt-2 text-center">
              <Link href="/store" className="text-xs font-semibold text-gray-500 hover:text-black underline">
                {lang === 'ar' ? 'تعديل السلة وإضافة منتجات أخرى' : 'Modify items or add accessories'}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
