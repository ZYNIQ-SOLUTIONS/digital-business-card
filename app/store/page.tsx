import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/store/product-card';
import { Product } from '@/lib/store/cart-store';

export const revalidate = 0; // Disable caching for the store page to always show fresh stock/prices

export default async function StorePage() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-black">
          Digital Networking, <br/> Elevated.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Shop premium NFC cards and accessories designed for the modern professional.
        </p>
      </div>

      {error ? (
        <div className="text-center text-red-500 py-10">
          Failed to load products. Please try again later.
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product as Product} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-20 bg-white rounded-3xl">
          <p className="text-xl font-medium text-gray-900 mb-2">No products available yet.</p>
          <p>Check back later for our exclusive networking accessories.</p>
        </div>
      )}
    </div>
  );
}
