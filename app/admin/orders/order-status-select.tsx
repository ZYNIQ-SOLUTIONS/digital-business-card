'use client';

import { useState } from 'react';
import { updateOrderStatus } from './actions';
import { Loader2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export function OrderStatusSelect({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, setIsPending] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsPending(true);
    
    await updateOrderStatus(orderId, newStatus);
    
    setIsPending(false);
  }

  return (
    <div className="flex items-center gap-2">
      <select 
        value={status} 
        onChange={handleChange}
        disabled={isPending}
        className={`text-sm font-medium rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-black outline-none ${STATUS_COLORS[status] || 'bg-gray-100'}`}
      >
        <option value="pending">Pending</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
    </div>
  );
}
