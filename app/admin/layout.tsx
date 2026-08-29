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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-semibold tracking-tight">Super Admin</Link>
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          <Link href="/admin" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-black">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Overview
          </Link>
          <Link href="/admin/users" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-black">
            <Users className="w-5 h-5 mr-3" />
            Manage Users
          </Link>
          <Link href="/admin/products" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-black">
            <Package className="w-5 h-5 mr-3" />
            Products
          </Link>
          <Link href="/admin/orders" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-black">
            <ShoppingCart className="w-5 h-5 mr-3" />
            Orders
          </Link>
          <Link href="/admin/support" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-black">
            <LifeBuoy className="w-5 h-5 mr-3" />
            Support Tickets
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
