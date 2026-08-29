'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) return { error: error.message };

  revalidatePath('/admin/orders');
  return { success: true };
}

export async function updateOrder(orderId: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const { error } = await supabase
    .from('orders')
    .update({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      shipping_city: data.shipping_city,
      shipping_area: data.shipping_area,
      shipping_street: data.shipping_street,
      shipping_building: data.shipping_building,
      total_amount: parseFloat(data.total_amount),
      status: data.status
    })
    .eq('id', orderId);

  if (error) return { error: error.message };

  revalidatePath('/admin/orders');
  return { success: true };
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) return { error: error.message };

  revalidatePath('/admin/orders');
  return { success: true };
}
