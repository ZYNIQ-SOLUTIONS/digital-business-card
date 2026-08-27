import { createClient } from '@/lib/supabase/server';
import { OrderStatusSelect } from './order-status-select';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  
  // Fetch orders with item count
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(id)')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Manage Orders</h1>
      
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Order ID</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Address</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Amount / Items</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">
                    {order.id.split('-')[0]}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{order.shipping_city}</div>
                    <div className="text-xs text-gray-500">{order.shipping_area}, {order.shipping_building}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">AED {order.total_amount}</div>
                    <div className="text-xs text-gray-500">{order.order_items?.length || 0} items</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
