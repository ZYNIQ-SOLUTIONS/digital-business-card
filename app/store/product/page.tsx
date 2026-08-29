import { createClient } from '@/lib/supabase/server';
import { DEFAULT_PRODUCTS, getProductById, ProductDetail } from '@/lib/store/default-products';
import { ProductDetailView } from '@/components/store/product-detail-view';
import { notFound } from 'next/navigation';

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

  const fallback = getProductById(productId) || DEFAULT_PRODUCTS[0];

  const product: ProductDetail = dbProduct ? {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: Number(dbProduct.price),
    image_url: dbProduct.image_url || fallback.image_url,
    category: dbProduct.category || fallback.category,
    in_stock: dbProduct.in_stock ?? true,
    rating: fallback.rating,
    reviewsCount: fallback.reviewsCount,
    badge: fallback.badge,
    material: fallback.material,
    weight: fallback.weight,
    dimensions: fallback.dimensions,
    chipType: fallback.chipType,
    compatibility: fallback.compatibility,
    features: fallback.features,
    images: dbProduct.image_url ? [dbProduct.image_url, ...fallback.images.slice(1)] : fallback.images,
    specs: fallback.specs,
    faqs: fallback.faqs,
  } : fallback;

  return <ProductDetailView product={product} />;
}
