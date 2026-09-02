import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Package,
  ShoppingCart,
  LayoutDashboard,
  ChevronLeft,
  LifeBuoy,
  Palette,
  Shield,
} from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/support', label: 'Support', icon: LifeBuoy },
    { href: '/admin/themes', label: 'Themes', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-[#08080f] flex flex-col md:flex-row text-white font-sans">

      {/* ── Mobile top bar ── */}
      <div className="md:hidden sticky top-0 z-30 bg-[#08080f] border-b border-white/[0.07]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#6366f1] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-white">Admin</span>
          </div>
          <Link
            href="/dashboard"
            className="text-[10px] font-bold text-gray-500 hover:text-white flex items-center gap-1 px-2.5 py-1.5 border border-white/[0.07] hover:border-white/[0.15] transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-0 border-t border-white/[0.05] overflow-x-auto no-scrollbar">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold text-gray-500 hover:text-white hover:bg-white/[0.04] transition border-r border-white/[0.04]"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-56 bg-[#0a0a12] border-r border-white/[0.06] flex-shrink-0 flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-[#6366f1] flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold tracking-wider uppercase text-white block">Super Admin</span>
              <span className="text-[10px] text-gray-600 font-mono truncate block">
                {profile?.full_name || profile?.email || 'Administrator'}
              </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-5 py-2.5 text-xs font-semibold text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors group border-l-2 border-transparent hover:border-[#6366f1]"
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.06] p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-300 hover:bg-white/[0.04] transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto p-5 sm:p-8">
        {children}
      </main>
    </div>
  );
}
