import { createClient } from '@/lib/supabase/server';
import { StoreClientPage } from '@/components/store/store-client-page';
import { Product } from '@/lib/store/cart-store';
import { DEFAULT_PRODUCTS } from '@/lib/store/default-products';

export const revalidate = 0;

export default async function StorePage() {
  const supabase = await createClient();
  
  const { data: dbProducts } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false });

  // Merge database products with default rich products to ensure store always looks extraordinary
  const products: Product[] = (dbProducts && dbProducts.length > 0)
    ? dbProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        image_url: p.image_url,
        category: p.category || 'Metal Cards',
        in_stock: p.in_stock ?? true,
      }))
    : DEFAULT_PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image_url: p.image_url,
        category: p.category,
        in_stock: p.in_stock,
      }));

  return <StoreClientPage initialProducts={products} />;
}
