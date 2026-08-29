'use client';

import { useState } from 'react';
import { updateSupportTicketStatus } from './actions';
import { Loader2 } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  opened: {
    label: 'Opened',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

export function SupportStatusSelect({
  ticketId,
  initialStatus,
  onStatusChange,
}: {
  ticketId: string;
  initialStatus: string;
  onStatusChange?: (newStatus: string) => void;
}) {
  const [status, setStatus] = useState(initialStatus || 'opened');
  const [isPending, setIsPending] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsPending(true);

    const res = await updateSupportTicketStatus(ticketId, newStatus);
    setIsPending(false);

    if (res?.success && onStatusChange) {
      onStatusChange(newStatus);
    }
  }

  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG.opened;

  return (
    <div className="inline-flex items-center gap-1.5">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`text-xs font-semibold rounded-lg px-2.5 py-1 border focus:ring-2 focus:ring-black outline-none transition-all cursor-pointer ${currentConfig.className}`}
      >
        <option value="opened">Opened</option>
        <option value="contacted">Contacted</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>
      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
    </div>
  );
}
