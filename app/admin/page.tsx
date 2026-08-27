import { createClient } from '@/lib/supabase/server';
import { Package, ShoppingCart, Users } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  const [usersRes, productsRes, ordersRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('orders').select('id', { count: 'exact' })
  ]);

  const stats = [
    { label: 'Total Users', value: usersRes.count || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Products', value: productsRes.count || 0, icon: Package, color: 'text-purple-500' },
    { label: 'Total Orders', value: ordersRes.count || 0, icon: ShoppingCart, color: 'text-green-500' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div className={`p-4 bg-gray-50 rounded-2xl ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-semibold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
