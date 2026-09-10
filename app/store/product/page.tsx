import { createClient } from '@/lib/supabase/server';
import { resolveStoreProduct } from '@/lib/store/default-products';
import { ProductDetailView } from '@/components/store/product-detail-view';

interface ProductPageProps {
  searchParams: Promise<{ id?: string }>;
}

export const revalidate = 0;

export default async function ProductPage({ searchParams }: ProductPageProps) {
  const { id } = await searchParams;
  const productId = id || 'prod-obsidian-metal';

  const supabase = await createClient();
  const { data: dbProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  const product = resolveStoreProduct(dbProduct, productId);

  return <ProductDetailView product={product} />;
}
