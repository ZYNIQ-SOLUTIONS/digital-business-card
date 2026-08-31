import { createClient } from '@/lib/supabase/server';
import { Package, ShoppingCart, Users, LifeBuoy, Palette, TrendingUp, Activity, CreditCard } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  const [usersRes, productsRes, ordersRes, ticketsRes, openTicketsRes, cardsRes, recentOrdersRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('orders').select('id', { count: 'exact' }),
    supabase.from('support_tickets').select('id', { count: 'exact' }),
    supabase.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'opened'),
    supabase.from('cards').select('id', { count: 'exact' }),
    supabase.from('orders').select('id, customer_name, total_amount, status, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  const stats = [
    { 
      label: 'Total Users', 
      value: usersRes.count || 0, 
      icon: Users, 
      gradient: 'from-[#8b5cf6] to-[#6d28d9]',
      glow: 'shadow-[0_8px_32px_rgba(139,92,246,0.3)]',
      href: '/admin/users',
      change: '+12% this month'
    },
    { 
      label: 'Smart Cards', 
      value: cardsRes.count || 0, 
      icon: CreditCard, 
      gradient: 'from-[#0ea5e9] to-[#0284c7]',
      glow: 'shadow-[0_8px_32px_rgba(14,165,233,0.3)]',
      href: '/admin/users',
      change: 'Total created'
    },
    { 
      label: 'Total Orders', 
      value: ordersRes.count || 0, 
      icon: ShoppingCart, 
      gradient: 'from-[#10b981] to-[#047857]',
      glow: 'shadow-[0_8px_32px_rgba(16,185,129,0.3)]',
      href: '/admin/orders',
      change: 'UAE CoD orders'
    },
    { 
      label: 'Open Tickets', 
      value: openTicketsRes.count || 0,
      sublabel: `of ${ticketsRes.count || 0} total`,
      icon: LifeBuoy, 
      gradient: 'from-amber-500 to-orange-600',
      glow: 'shadow-[0_8px_32px_rgba(245,158,11,0.3)]',
      href: '/admin/support',
      change: 'Needs attention'
    },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/admin/products', icon: Package, color: 'text-[#a78bfa]' },
    { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart, color: 'text-[#10b981]' },
    { label: 'Manage Themes', href: '/admin/themes', icon: Palette, color: 'text-pink-400' },
    { label: 'Support Queue', href: '/admin/support', icon: LifeBuoy, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Super Admin. Here's what's happening on the platform.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <Link 
            key={i} 
            href={stat.href}
            className="group relative p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.07] transition-all overflow-hidden"
          >
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-20 blur-xl group-hover:opacity-30 transition-opacity`} />
            <div className="relative">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.gradient} ${stat.glow} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              {stat.sublabel && <p className="text-xs text-gray-600 mt-0.5">{stat.sublabel}</p>}
              <p className="text-[11px] text-gray-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#10b981]" />
              <h2 className="text-sm font-bold text-white">Recent Orders</h2>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-[#0ea5e9] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {(recentOrdersRes.data || []).map((order: any, i: number) => (
              <div key={i} className="px-6 py-3.5 flex items-center justify-between hover:bg-white/[0.03] transition">
                <div>
                  <p className="text-sm font-semibold text-white">{order.customer_name}</p>
                  <p className="text-[11px] text-gray-500">{new Date(order.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">AED {Number(order.total_amount).toFixed(0)}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {(!recentOrdersRes.data || recentOrdersRes.data.length === 0) && (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No orders yet.</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map(({ label, href, icon: Icon, color }, i) => (
              <Link
                key={i}
                href={href}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition">{label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/10 to-[#0ea5e9]/10 border border-[#8b5cf6]/20">
              <p className="text-xs font-bold text-white mb-1">Platform Status</p>
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                All systems operational
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                Supabase connected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
