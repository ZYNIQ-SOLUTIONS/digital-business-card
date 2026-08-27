'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { placeOrder } from './actions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    return null; // Will redirect via useEffect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-semibold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <h2 className="text-xl font-medium mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required name="customer_name" type="text" className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-black focus:border-black transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input required name="customer_phone" type="tel" className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-black focus:border-black transition-colors" placeholder="+971 50 123 4567" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h2 className="text-xl font-medium mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emirate / City</label>
                  <select required name="shipping_city" className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-black focus:border-black transition-colors">
                    <option value="">Select a city</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Delivery is currently restricted to Dubai and Abu Dhabi.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area / Neighborhood</label>
                  <input required name="shipping_area" type="text" className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-black focus:border-black transition-colors" placeholder="e.g. Downtown Dubai" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Name</label>
                    <input required name="shipping_street" type="text" className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-black focus:border-black transition-colors" placeholder="e.g. Sheikh Zayed Rd" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Building / Villa No.</label>
                    <input required name="shipping_building" type="text" className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-black focus:border-black transition-colors" placeholder="e.g. Tower 1, Apt 104" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h2 className="text-xl font-medium mb-4">Payment Method</h2>
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between">
                <span className="font-medium text-gray-900">Cash on Delivery (CoD)</span>
                <span className="text-sm text-gray-500">Pay when you receive it</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white font-medium text-lg py-4 rounded-xl mt-8 hover:bg-gray-900 transition-colors flex justify-center items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Place Order • AED ${cartTotal.toFixed(2)}`
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              By placing your order, you agree to our terms and conditions.
            </p>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm sticky top-24">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</h3>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium mt-1">AED {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>AED {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping (Dubai & Abu Dhabi)</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>AED {cartTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/store" className="text-sm text-gray-500 hover:text-black underline">
                Return to Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
