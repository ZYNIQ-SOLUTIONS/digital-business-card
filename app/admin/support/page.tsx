import { createClient } from '@/lib/supabase/server';
import { SupportTicketsTable } from './support-tickets-table';
import { LifeBuoy, AlertCircle } from 'lucide-react';

export const revalidate = 0;

export default async function AdminSupportPage() {
  const supabase = await createClient();

  // Fetch support tickets
  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching support tickets:', error);
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-100">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support Operations</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Support Tickets & Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage, respond to, and track customer support requests across all status lifecycles.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Note: If the <code>support_tickets</code> table is not yet created in your Supabase project, run the SQL script in <code>supabase/support_schema.sql</code>.
          </span>
        </div>
      )}

      {/* Tickets Table & Filter Tabs */}
      <SupportTicketsTable initialTickets={tickets || []} />
    </div>
  );
}
