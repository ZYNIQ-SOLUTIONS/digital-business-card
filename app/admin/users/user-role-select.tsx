'use client';

import { useState } from 'react';
import { updateUserRole } from './actions';
import { Loader2 } from 'lucide-react';

export function UserRoleSelect({ userId, initialRole }: { userId: string, initialRole: string }) {
  const [role, setRole] = useState(initialRole);
  const [isPending, setIsPending] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    setRole(newRole);
    setIsPending(true);
    
    await updateUserRole(userId, newRole);
    
    setIsPending(false);
  }

  return (
    <div className="flex items-center gap-2">
      <select 
        value={role} 
        onChange={handleChange}
        disabled={isPending}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-black focus:border-black"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
    </div>
  );
}
