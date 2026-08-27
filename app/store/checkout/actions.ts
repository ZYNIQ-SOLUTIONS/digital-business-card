'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface OrderPayload {
  customer_name: string;
  customer_phone: string;
  shipping_city: string;
  shipping_area: string;
  shipping_street: string;
  shipping_building: string;
  total_amount: number;
  items: {
    product_id: string;
    quantity: number;
    price_at_time: number;
  }[];
}

export async function placeOrder(payload: OrderPayload) {
  const supabase = await createClient();
  
  // Try to get user if logged in
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Insert Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id || null,
      status: 'pending',
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      shipping_city: payload.shipping_city,
      shipping_area: payload.shipping_area,
      shipping_street: payload.shipping_street,
      shipping_building: payload.shipping_building,
      total_amount: payload.total_amount,
    })
    .select('id')
    .single();

  if (orderError) {
    console.error('Failed to create order:', orderError);
    return { error: 'Failed to create order. Please try again.' };
  }

  // 2. Insert Order Items
  const orderItemsData = payload.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_time: item.price_at_time,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    console.error('Failed to create order items:', itemsError);
    // Ideally we would rollback the order here in a real transaction
    return { error: 'Failed to process order items.' };
  }

  revalidatePath('/admin/orders');
  return { success: true, orderId: order.id };
}
