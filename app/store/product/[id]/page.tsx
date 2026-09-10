import { createClient } from '@/lib/supabase/server';
import { resolveStoreProduct } from '@/lib/store/default-products';
import { ProductDetailView } from '@/components/store/product-detail-view';

interface ProductParamPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function ProductDynamicPage({ params }: ProductParamPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: dbProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  const product = resolveStoreProduct(dbProduct, id);

  return <ProductDetailView product={product} />;
}
