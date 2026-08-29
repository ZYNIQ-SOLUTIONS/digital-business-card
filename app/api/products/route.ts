import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_PRODUCTS } from '@/lib/store/default-products';

export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (error || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ products: DEFAULT_PRODUCTS, source: 'default' });
    }

    const products = dbProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      image_url: p.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      category: p.category || 'Hardware',
      in_stock: p.in_stock ?? true,
    }));

    return NextResponse.json({ products, source: 'database' });
  } catch (error: any) {
    return NextResponse.json({ products: DEFAULT_PRODUCTS, source: 'fallback', error: error.message });
  }
}
