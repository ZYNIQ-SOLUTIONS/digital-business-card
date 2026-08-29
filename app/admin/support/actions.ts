'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSupportTicketStatus(ticketId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const { error } = await supabase
    .from('support_tickets')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId);

  if (error) {
    console.error('Error updating ticket status:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/support');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateSupportTicketNotes(ticketId: string, adminNotes: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const { error } = await supabase
    .from('support_tickets')
    .update({ 
      admin_notes: adminNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId);

  if (error) {
    console.error('Error updating ticket notes:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/support');
  return { success: true };
}

export async function deleteSupportTicket(ticketId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const { error } = await supabase
    .from('support_tickets')
    .delete()
    .eq('id', ticketId);

  if (error) {
    console.error('Error deleting ticket:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/support');
  revalidatePath('/admin');
  return { success: true };
}
