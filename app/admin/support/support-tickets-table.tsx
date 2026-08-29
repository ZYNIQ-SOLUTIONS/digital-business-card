'use client';

import React, { useState, useMemo } from 'react';
import { SupportStatusSelect } from './support-status-select';
import { TicketDetailModal, SupportTicket } from './ticket-detail-modal';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Calendar 
} from 'lucide-react';

const PRIORITY_BADGES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-50 text-blue-700 border border-blue-100',
  high: 'bg-orange-50 text-orange-700 border border-orange-200',
  urgent: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
};

export function SupportTicketsTable({
  initialTickets,
}: {
  initialTickets: SupportTicket[];
}) {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets || []);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Status counts
  const counts = useMemo(() => {
    const total = tickets.length;
    const opened = tickets.filter((t) => t.status === 'opened').length;
    const contacted = tickets.filter((t) => t.status === 'contacted').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;
    const closed = tickets.filter((t) => t.status === 'closed').length;
    return { total, opened, contacted, resolved, closed };
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Status filter
      if (selectedStatus !== 'all' && t.status !== selectedStatus) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = t.ticket_number?.toLowerCase().includes(q);
        const matchesName = t.name?.toLowerCase().includes(q);
        const matchesEmail = t.email?.toLowerCase().includes(q);
        const matchesSubject = t.subject?.toLowerCase().includes(q);
        const matchesMessage = t.message?.toLowerCase().includes(q);
        return matchesNumber || matchesName || matchesEmail || matchesSubject || matchesMessage;
      }
      return true;
    });
  }, [tickets, selectedStatus, searchQuery]);

  function handleStatusChange(ticketId: string, newStatus: string) {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  }

  function handleTicketUpdated(updatedFields: Partial<SupportTicket>) {
    if (!selectedTicket) return;
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? { ...t, ...updatedFields } : t))
    );
    setSelectedTicket((prev) => (prev ? { ...prev, ...updatedFields } : null));
  }

  function handleTicketDeleted(ticketId: string) {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    setSelectedTicket(null);
  }

  const TABS = [
    { id: 'all', label: 'All Tickets', count: counts.total },
    { id: 'opened', label: 'Opened', count: counts.opened, color: 'text-amber-600' },
    { id: 'contacted', label: 'Contacted', count: counts.contacted, color: 'text-blue-600' },
    { id: 'resolved', label: 'Resolved', count: counts.resolved, color: 'text-green-600' },
    { id: 'closed', label: 'Closed', count: counts.closed, color: 'text-gray-500' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl overflow-x-auto">
          {TABS.map((tab) => {
            const active = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    active ? 'bg-gray-100 text-gray-800' : 'bg-gray-200/70 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, names, emails..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket Ref</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject & Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  {/* Ticket Number */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                      {ticket.ticket_number}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 text-sm">{ticket.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {ticket.email}
                    </div>
                  </td>

                  {/* Subject & Category */}
                  <td className="px-6 py-4 max-w-xs">
                    <div className="font-medium text-gray-900 text-sm truncate">{ticket.subject}</div>
                    <div className="text-xs text-gray-500 capitalize flex items-center gap-1.5 mt-0.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      {ticket.category.replace('_', ' ')}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs capitalize ${PRIORITY_BADGES[ticket.priority] || 'bg-gray-100'}`}>
                      {ticket.priority}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(ticket.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>

                  {/* Status Select */}
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <SupportStatusSelect
                      ticketId={ticket.id}
                      initialStatus={ticket.status}
                      onStatusChange={(s) => handleStatusChange(ticket.id, s)}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-900 hover:text-white text-xs font-medium transition-all inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No support tickets found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={handleTicketUpdated}
          onTicketDeleted={handleTicketDeleted}
        />
      )}
    </div>
  );
}
