import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full bg-white p-10 rounded-3xl shadow-sm">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-black" />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Order Placed</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Thank you for your order! We'll contact you shortly to confirm your delivery via Cash on Delivery.
        </p>
        <Link 
          href="/store"
          className="inline-block w-full bg-black text-white font-medium py-4 rounded-xl hover:bg-gray-900 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
