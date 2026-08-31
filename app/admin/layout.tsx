import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Package, ShoppingCart, LayoutDashboard, ChevronLeft, LifeBuoy, Palette, Shield } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Overview', color: 'text-[#0ea5e9]', activeBg: 'bg-[#0ea5e9]/10 border-[#0ea5e9]/20' },
    { href: '/admin/users', icon: Users, label: 'Manage Users', color: 'text-[#8b5cf6]', activeBg: 'bg-[#8b5cf6]/10 border-[#8b5cf6]/20' },
    { href: '/admin/products', icon: Package, label: 'Products', color: 'text-[#a78bfa]', activeBg: 'bg-[#a78bfa]/10 border-[#a78bfa]/20' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders', color: 'text-[#10b981]', activeBg: 'bg-[#10b981]/10 border-[#10b981]/20' },
    { href: '/admin/support', icon: LifeBuoy, label: 'Support', color: 'text-amber-400', activeBg: 'bg-amber-400/10 border-amber-400/20' },
    { href: '/admin/themes', icon: Palette, label: 'Themes', color: 'text-pink-400', activeBg: 'bg-pink-400/10 border-pink-400/20' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col md:flex-row text-white font-sans selection:bg-[#8b5cf6] selection:text-white">
      
      {/* Ambient background glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-[#8b5cf6]/8 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-[#0ea5e9]/6 blur-[120px]" />
      </div>

      {/* Mobile Top Nav */}
      <div className="md:hidden sticky top-0 z-30 bg-[#0d0d14]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#0ea5e9] flex items-center justify-center shadow-lg">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <Link href="/admin" className="text-sm font-bold tracking-tight text-white">
              Super Admin
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-[#8b5cf6] hover:text-white flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 min-h-[36px] transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Horizontal Navigation Pills */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar text-xs font-semibold">
          {navItems.map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className={`px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.12] shrink-0 min-h-[36px] flex items-center gap-1.5 transition`}
            >
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <span>{label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0d0d14]/80 border-r border-white/[0.06] flex-shrink-0 flex-col backdrop-blur-xl relative z-10">
        <div className="p-6 border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#0ea5e9] flex items-center justify-center shadow-[0_4px_16px_rgba(139,92,246,0.4)] group-hover:shadow-[0_6px_24px_rgba(139,92,246,0.5)] transition-shadow">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">Super Admin</span>
              <span className="text-[10px] text-gray-500 font-mono">{profile?.full_name || 'Administrator'}</span>
            </div>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1 flex-1 text-xs font-semibold">
          {navItems.map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-4 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.06] transition-all group`}
            >
              <Icon className={`w-4 h-4 mr-3 ${color} group-hover:scale-110 transition-transform`} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center px-4 py-3 text-xs font-semibold text-gray-600 hover:text-gray-300 hover:bg-white/[0.04] rounded-2xl transition">
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10 p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
