'use client';

import { useState } from 'react';
import { Edit3, X, Loader2, Trash2 } from 'lucide-react';
import { updateOrder, deleteOrder } from './actions';

interface EditOrderModalProps {
  order: {
    id: string;
    customer_name: string;
    customer_phone: string;
    shipping_city: string;
    shipping_area: string;
    shipping_street: string;
    shipping_building: string;
    total_amount: number;
    status: string;
  };
}

export function EditOrderModal({ order }: EditOrderModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const orderData = {
        customer_name: formData.get('customer_name'),
        customer_phone: formData.get('customer_phone'),
        shipping_city: formData.get('shipping_city'),
        shipping_area: formData.get('shipping_area'),
        shipping_street: formData.get('shipping_street'),
        shipping_building: formData.get('shipping_building'),
        total_amount: formData.get('total_amount'),
        status: formData.get('status'),
      };

      const result = await updateOrder(order.id, orderData);

      if (result.error) {
        throw new Error(result.error);
      }

      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this order?')) return;
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteOrder(order.id);
      if (result.error) {
        throw new Error(result.error);
      }
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete order');
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center justify-center"
        title="Edit Order"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => !isSubmitting && setIsOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl pointer-events-auto max-h-[90vh] overflow-y-auto text-left">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Edit Order</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {order.id}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input 
                      required 
                      name="customer_name" 
                      type="text" 
                      defaultValue={order.customer_name}
                      className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black text-gray-900 text-sm" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                    <input 
                      required 
                      name="customer_phone" 
                      type="text" 
                      defaultValue={order.customer_phone}
                      className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black text-gray-900 text-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping City</label>
                    <select 
                      name="shipping_city" 
                      defaultValue={order.shipping_city}
                      className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black text-gray-900 text-sm"
                    >
                      <option value="Dubai">Dubai</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Area</label>
                    <input 
                      required 
                      name="shipping_area" 
                      type="text" 
                      defaultValue={order.shipping_area}
                      className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black text-gray-900 text-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                    <input 
                      required 
                      name="shipping_street" 
                      type="text" 
                      defaultValue={order.shipping_street}
                      className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black text-gray-900 text-sm" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Building / Villa</label>
                    <input 
                      required 
                      name="shipping_building" 
                      type="text" 
                      defaultValue={order.shipping_building}
                      className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black text-gray-900 text-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (AED)</label>
                    <input 
                      required 
                      name="total_amount" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      defaultValue={order.total_amount}
                      className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black text-gray-900 text-sm" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      name="status" 
                      defaultValue={order.status}
                      className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black text-gray-900 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || isSubmitting}
                    className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-200"
                  >
                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    <span className="text-sm font-semibold">Delete Order</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || isDeleting}
                    className="flex-1 bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-900 transition-colors flex justify-center items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Saving changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
