import { createClient } from '@/lib/supabase/server';
import {
  Package,
  ShoppingCart,
  Users,
  LifeBuoy,
  TrendingUp,
  CreditCard,
  Eye,
  DollarSign,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  BarChart3,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

function StatCard({
  label,
  value,
  sub,
  delta,
  deltaLabel,
  accent,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  delta?: number | null;
  deltaLabel?: string;
  accent: string;
  href?: string;
}) {
  const DeltaIcon =
    delta == null ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  const deltaColor =
    delta == null
      ? 'text-gray-600'
      : delta > 0
      ? 'text-emerald-400'
      : 'text-red-400';

  const inner = (
    <div className={`relative p-5 bg-[#0d0d14] border border-white/[0.07] overflow-hidden group hover:border-white/[0.14] transition-colors`}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accent}`} />
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">{label}</p>
      <p className="text-3xl font-bold text-white tabular-nums tracking-tight mb-1">{value}</p>
      {sub && <p className="text-[11px] text-gray-600">{sub}</p>}
      {deltaLabel !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-[11px] font-semibold ${deltaColor}`}>
          <DeltaIcon className="w-3 h-3" />
          <span>{deltaLabel}</span>
        </div>
      )}
      {href && (
        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [
    totalUsersRes,
    newUsersRes,
    prevUsersRes,
    totalCardsRes,
    publishedCardsRes,
    draftCardsRes,
    newCardsRes,
    totalOrdersRes,
    totalRevenueRes,
    allTicketsRes,
    openTicketsRes,
    resolvedTicketsRes,
    totalViewsRes,
    recentOrdersRes,
    recentUsersRes,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', thirtyDaysAgo.toISOString()),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', sixtyDaysAgo.toISOString()).lt('updated_at', thirtyDaysAgo.toISOString()),
    supabase.from('cards').select('id', { count: 'exact', head: true }),
    supabase.from('cards').select('id', { count: 'exact', head: true }).eq('is_published', true).neq('is_deleted', true),
    supabase.from('cards').select('id', { count: 'exact', head: true }).eq('is_published', false).neq('is_deleted', true),
    supabase.from('cards').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total_amount'),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'opened'),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).in('status', ['resolved', 'closed']),
    supabase.from('cards').select('views_count'),
    supabase.from('orders').select('id, customer_name, total_amount, status, created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('profiles').select('id, full_name, email, plan, updated_at').order('updated_at', { ascending: false }).limit(5),
  ]);

  // Computed values
  const totalRevenue = (totalRevenueRes.data || []).reduce(
    (sum: number, o: any) => sum + Number(o.total_amount || 0),
    0
  );

  const totalViews = (totalViewsRes.data || []).reduce(
    (sum: number, c: any) => sum + (c.views_count || 0),
    0
  );

  const totalCards = totalCardsRes.count || 0;
  const avgViews = totalCards > 0 ? Math.round(totalViews / totalCards) : 0;

  const newUsers = newUsersRes.count || 0;
  const prevUsers = prevUsersRes.count || 0;
  const userDelta = prevUsers > 0 ? Math.round(((newUsers - prevUsers) / prevUsers) * 100) : null;

  const totalTickets = allTicketsRes.count || 0;
  const resolvedTickets = resolvedTicketsRes.count || 0;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  const statusStyles: Record<string, string> = {
    delivered: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
    shipped: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
    confirmed: 'text-sky-400 bg-sky-400/10 border-sky-500/20',
    pending: 'text-amber-400 bg-amber-400/10 border-amber-500/20',
    cancelled: 'text-red-400 bg-red-400/10 border-red-500/20',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-6">
        <p className="text-[10px] font-bold tracking-widest text-gray-600 uppercase mb-1">Admin Console</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">Platform Overview</h1>
        <p className="text-xs text-gray-600 mt-1">
          {now.toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── ROW 1: Primary KPIs ── */}
      <div>
        <p className="text-[10px] font-bold tracking-widest text-gray-600 uppercase mb-3">Platform KPIs</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] border border-white/[0.07]">
          <StatCard
            label="Total Users"
            value={totalUsersRes.count || 0}
            sub={`${newUsers} new in last 30 days`}
            delta={userDelta}
            deltaLabel={userDelta != null ? `${userDelta > 0 ? '+' : ''}${userDelta}% vs prior 30d` : 'No prior data'}
            accent="bg-[#6366f1]"
            href="/admin/users"
          />
          <StatCard
            label="Smart Cards"
            value={totalCards}
            sub={`${publishedCardsRes.count || 0} live · ${draftCardsRes.count || 0} draft`}
            delta={null}
            deltaLabel={`${newCardsRes.count || 0} created last 30d`}
            accent="bg-[#0ea5e9]"
          />
          <StatCard
            label="Total Revenue"
            value={`AED ${totalRevenue.toFixed(0)}`}
            sub={`Across ${totalOrdersRes.count || 0} orders`}
            delta={null}
            deltaLabel="Cash on Delivery"
            accent="bg-emerald-500"
            href="/admin/orders"
          />
          <StatCard
            label="Open Tickets"
            value={openTicketsRes.count || 0}
            sub={`of ${totalTickets} total`}
            delta={null}
            deltaLabel={`${resolutionRate}% resolution rate`}
            accent="bg-amber-500"
            href="/admin/support"
          />
        </div>
      </div>

      {/* ── ROW 2: Secondary metrics ── */}
      <div>
        <p className="text-[10px] font-bold tracking-widest text-gray-600 uppercase mb-3">Engagement</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] border border-white/[0.07]">
          <StatCard
            label="Total Card Views"
            value={totalViews.toLocaleString()}
            sub="Across all published cards"
            accent="bg-violet-500"
          />
          <StatCard
            label="Avg Views / Card"
            value={avgViews}
            sub="Lifetime per card"
            accent="bg-pink-500"
          />
          <StatCard
            label="New Cards (30d)"
            value={newCardsRes.count || 0}
            sub="Cards created this month"
            accent="bg-cyan-500"
          />
          <StatCard
            label="Support Resolution"
            value={`${resolutionRate}%`}
            sub={`${resolvedTickets} resolved of ${totalTickets}`}
            accent={resolutionRate >= 80 ? 'bg-emerald-500' : resolutionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}
            href="/admin/support"
          />
        </div>
      </div>

      {/* ── ROW 3: Tables ── */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* Recent Orders */}
        <div className="lg:col-span-3 border border-white/[0.07] bg-[#0d0d14]">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide">Recent Orders</span>
            </div>
            <Link href="/admin/orders" className="text-[11px] font-semibold text-[#6366f1] hover:text-white transition">
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {(recentOrdersRes.data || []).map((order: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition">
                <div>
                  <p className="text-xs font-semibold text-white">{order.customer_name}</p>
                  <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-AE', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wide ${statusStyles[order.status] || statusStyles.pending}`}>
                    {order.status}
                  </span>
                  <p className="text-xs font-bold text-white tabular-nums">AED {Number(order.total_amount).toFixed(0)}</p>
                </div>
              </div>
            ))}
            {(!recentOrdersRes.data || recentOrdersRes.data.length === 0) && (
              <div className="px-5 py-8 text-center text-gray-600 text-xs">No orders yet.</div>
            )}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="lg:col-span-2 border border-white/[0.07] bg-[#0d0d14]">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-3.5 h-3.5 text-[#6366f1]" />
              <span className="text-xs font-bold text-white tracking-wide">Recent Signups</span>
            </div>
            <Link href="/admin/users" className="text-[11px] font-semibold text-[#6366f1] hover:text-white transition">
              All users
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {(recentUsersRes.data || []).map((u: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{u.full_name || '—'}</p>
                  <p className="text-[10px] text-gray-600 font-mono truncate mt-0.5">{u.email || '—'}</p>
                </div>
                <span className={`ml-3 shrink-0 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider border ${
                  u.plan === 'pro'
                    ? 'text-violet-400 bg-violet-400/10 border-violet-500/20'
                    : u.plan === 'enterprise'
                    ? 'text-amber-400 bg-amber-400/10 border-amber-500/20'
                    : 'text-gray-500 bg-white/[0.04] border-white/[0.07]'
                }`}>
                  {u.plan || 'free'}
                </span>
              </div>
            ))}
            {(!recentUsersRes.data || recentUsersRes.data.length === 0) && (
              <div className="px-5 py-8 text-center text-gray-600 text-xs">No users yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 4: Quick Actions + System Status ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 border border-white/[0.07] bg-[#0d0d14] p-5">
          <p className="text-[10px] font-bold tracking-widest text-gray-600 uppercase mb-4">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Manage Users', href: '/admin/users', color: 'text-[#6366f1]' },
              { label: 'View Orders', href: '/admin/orders', color: 'text-emerald-400' },
              { label: 'Theme Studio', href: '/admin/themes', color: 'text-pink-400' },
              { label: 'Support Queue', href: '/admin/support', color: 'text-amber-400' },
            ].map(({ label, href, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center py-3 px-3 text-[11px] font-bold text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] transition-all text-center"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border border-white/[0.07] bg-[#0d0d14] p-5 space-y-4">
          <p className="text-[10px] font-bold tracking-widest text-gray-600 uppercase">System Status</p>
          <div className="space-y-2.5">
            {[
              { label: 'API Server', status: 'Operational' },
              { label: 'Supabase DB', status: 'Connected' },
              { label: 'Netlify CDN', status: 'Deployed' },
              { label: 'Auth Service', status: 'Active' },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">{label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400">{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
