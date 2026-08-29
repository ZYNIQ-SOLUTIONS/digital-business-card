'use client';

import React, { useState, useTransition } from 'react';
import { updateSupportTicketNotes, deleteSupportTicket } from './actions';
import { SupportStatusSelect } from './support-status-select';
import { 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  Tag, 
  AlertCircle, 
  FileText, 
  Save, 
  Trash2, 
  Loader2, 
  Check,
  User
} from 'lucide-react';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export function TicketDetailModal({
  ticket,
  onClose,
  onTicketUpdated,
  onTicketDeleted,
}: {
  ticket: SupportTicket;
  onClose: () => void;
  onTicketUpdated?: (updated: Partial<SupportTicket>) => void;
  onTicketDeleted?: (id: string) => void;
}) {
  const [adminNotes, setAdminNotes] = useState(ticket.admin_notes || '');
  const [currentStatus, setCurrentStatus] = useState(ticket.status || 'opened');
  const [isSavingNotes, startSaveNotes] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [noteSaved, setNoteSaved] = useState(false);

  function handleSaveNotes() {
    startSaveNotes(async () => {
      const res = await updateSupportTicketNotes(ticket.id, adminNotes);
      if (res?.success) {
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 3000);
        if (onTicketUpdated) onTicketUpdated({ admin_notes: adminNotes });
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Are you sure you want to permanently delete ticket ${ticket.ticket_number}?`)) {
      return;
    }
    startDelete(async () => {
      const res = await deleteSupportTicket(ticket.id);
      if (res?.success) {
        if (onTicketDeleted) onTicketDeleted(ticket.id);
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-900 text-white">
              {ticket.ticket_number}
            </span>
            <SupportStatusSelect
              ticketId={ticket.id}
              initialStatus={currentStatus}
              onStatusChange={(s) => {
                setCurrentStatus(s);
                if (onTicketUpdated) onTicketUpdated({ status: s });
              }}
            />
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* Subject */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {ticket.subject}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(ticket.created_at).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5 capitalize">
                <Tag className="w-3.5 h-3.5" />
                Category: <strong className="text-gray-700">{ticket.category.replace('_', ' ')}</strong>
              </span>
              <span className="flex items-center gap-1.5 capitalize">
                <AlertCircle className="w-3.5 h-3.5" />
                Priority: <strong className="text-gray-700">{ticket.priority}</strong>
              </span>
            </div>
          </div>

          {/* Customer Profile Box */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white rounded-xl text-gray-700 border border-gray-100 shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-[11px] text-gray-400 font-medium">Customer</p>
                <p className="font-semibold text-gray-900 truncate">{ticket.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white rounded-xl text-blue-600 border border-gray-100 shadow-sm">
                <Mail className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-[11px] text-gray-400 font-medium">Email</p>
                <a
                  href={`mailto:${ticket.email}?subject=Re: [${ticket.ticket_number}] ${ticket.subject}`}
                  className="font-medium text-blue-600 hover:underline truncate block"
                >
                  {ticket.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white rounded-xl text-green-600 border border-gray-100 shadow-sm">
                <Phone className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-[11px] text-gray-400 font-medium">Phone</p>
                {ticket.phone ? (
                  <a href={`tel:${ticket.phone}`} className="font-medium text-green-700 hover:underline truncate block font-mono text-xs">
                    {ticket.phone}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">Not provided</span>
                )}
              </div>
            </div>
          </div>

          {/* User Message Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Inquiry Message
            </label>
            <div className="p-5 rounded-2xl bg-white border border-gray-200 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap shadow-xs">
              {ticket.message}
            </div>
          </div>

          {/* Internal Admin Resolution Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Internal Admin Notes & Follow-up History
              </label>
              {noteSaved && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Notes saved
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes on resolution, customer calls, or ticket handoffs..."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            ></textarea>
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isSavingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Admin Notes
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-medium transition-colors"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete Ticket
          </button>

          <div className="flex items-center gap-3">
            <a
              href={`mailto:${ticket.email}?subject=Re: [${ticket.ticket_number}] ${ticket.subject}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              Reply via Email
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
