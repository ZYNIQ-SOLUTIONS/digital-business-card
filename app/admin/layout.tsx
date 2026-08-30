import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Package, ShoppingCart, LayoutDashboard, ChevronLeft, LifeBuoy } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col md:flex-row text-[#1D1D1F] font-sans selection:bg-[#0071E3] selection:text-white">
      {/* Mobile Cupertino Top Nav */}
      <div className="md:hidden sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3] animate-pulse" />
            <Link href="/admin" className="text-base font-bold tracking-tight text-[#1D1D1F]">
              Admin Console
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-blue-50/80 min-h-[36px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Horizontal Navigation Pills */}
        <div className="flex items-center gap-2 px-4 pb-2.5 overflow-x-auto no-scrollbar text-xs font-semibold">
          <Link href="/admin" className="px-3.5 py-1.5 rounded-full bg-black text-white shrink-0 min-h-[36px] flex items-center gap-1.5 shadow-xs">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
          <Link href="/admin/users" className="px-3.5 py-1.5 rounded-full bg-[#E5E5EA] text-[#1D1D1F] hover:bg-[#D1D1D6] shrink-0 min-h-[36px] flex items-center gap-1.5 transition">
            <Users className="w-3.5 h-3.5" />
            <span>Users</span>
          </Link>
          <Link href="/admin/products" className="px-3.5 py-1.5 rounded-full bg-[#E5E5EA] text-[#1D1D1F] hover:bg-[#D1D1D6] shrink-0 min-h-[36px] flex items-center gap-1.5 transition">
            <Package className="w-3.5 h-3.5" />
            <span>Products</span>
          </Link>
          <Link href="/admin/orders" className="px-3.5 py-1.5 rounded-full bg-[#E5E5EA] text-[#1D1D1F] hover:bg-[#D1D1D6] shrink-0 min-h-[36px] flex items-center gap-1.5 transition">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Orders</span>
          </Link>
          <Link href="/admin/support" className="px-3.5 py-1.5 rounded-full bg-[#E5E5EA] text-[#1D1D1F] hover:bg-[#D1D1D6] shrink-0 min-h-[36px] flex items-center gap-1.5 transition">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support</span>
          </Link>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-black/[0.06] flex-shrink-0 flex-col shadow-xs">
        <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
          <Link href="/admin" className="text-lg font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3]" />
            <span>Admin Console</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1.5 flex-1 text-xs font-semibold">
          <Link href="/admin" className="flex items-center px-4 py-3 rounded-2xl text-[#1D1D1F] hover:bg-[#F5F5F7] transition">
            <LayoutDashboard className="w-4 h-4 mr-3 text-[#0071E3]" />
            <span>Overview</span>
          </Link>
          <Link href="/admin/users" className="flex items-center px-4 py-3 rounded-2xl text-[#1D1D1F] hover:bg-[#F5F5F7] transition">
            <Users className="w-4 h-4 mr-3 text-[#5856D6]" />
            <span>Manage Users</span>
          </Link>
          <Link href="/admin/products" className="flex items-center px-4 py-3 rounded-2xl text-[#1D1D1F] hover:bg-[#F5F5F7] transition">
            <Package className="w-4 h-4 mr-3 text-[#AF52DE]" />
            <span>Hardware Products</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center px-4 py-3 rounded-2xl text-[#1D1D1F] hover:bg-[#F5F5F7] transition">
            <ShoppingCart className="w-4 h-4 mr-3 text-[#34C759]" />
            <span>Customer Orders</span>
          </Link>
          <Link href="/admin/support" className="flex items-center px-4 py-3 rounded-2xl text-[#1D1D1F] hover:bg-[#F5F5F7] transition">
            <LifeBuoy className="w-4 h-4 mr-3 text-[#FF9500]" />
            <span>Support Inquiries</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-black/[0.06]">
          <Link href="/dashboard" className="flex items-center px-4 py-3 text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-2xl transition">
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
