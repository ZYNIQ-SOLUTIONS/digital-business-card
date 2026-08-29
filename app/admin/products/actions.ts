'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addProduct(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const { error } = await supabase.from('products').insert({
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    image_url: data.image_url,
    category: data.category,
    in_stock: data.in_stock === 'true'
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/store');
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/store');
  return { success: true };
}

export async function toggleProductStock(id: string, inStock: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const { error } = await supabase.from('products').update({ in_stock: inStock }).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/store');
  return { success: true };
}

export async function updateProduct(id: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const updateFields: any = {
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    category: data.category,
    in_stock: data.in_stock === 'true' || data.in_stock === true
  };

  if (data.image_url) {
    updateFields.image_url = data.image_url;
  }

  const { error } = await supabase
    .from('products')
    .update(updateFields)
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/store');
  return { success: true };
}
