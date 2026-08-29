import { createClient } from '@/lib/supabase/server';
import { Package, ShoppingCart, Users, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  const [usersRes, productsRes, ordersRes, ticketsRes, openTicketsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('orders').select('id', { count: 'exact' }),
    supabase.from('support_tickets').select('id', { count: 'exact' }),
    supabase.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'opened')
  ]);

  const stats = [
    { label: 'Total Users', value: usersRes.count || 0, icon: Users, color: 'text-blue-500', href: '/admin/users' },
    { label: 'Products', value: productsRes.count || 0, icon: Package, color: 'text-purple-500', href: '/admin/products' },
    { label: 'Total Orders', value: ordersRes.count || 0, icon: ShoppingCart, color: 'text-green-500', href: '/admin/orders' },
    { 
      label: 'Support Tickets', 
      value: `${ticketsRes.count || 0} (${openTicketsRes.count || 0} Open)`, 
      icon: LifeBuoy, 
      color: 'text-amber-500', 
      href: '/admin/support' 
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <Link 
            key={i} 
            href={stat.href}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-md hover:border-gray-200 transition-all"
          >
            <div className={`p-4 bg-gray-50 rounded-2xl ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-semibold text-gray-900">{stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
