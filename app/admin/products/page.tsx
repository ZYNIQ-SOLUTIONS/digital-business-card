import { createClient } from '@/lib/supabase/server';
import { ProductTable } from './product-table';
import { AddProductModal } from './add-product-modal';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = await createClient();
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Products</h1>
        <AddProductModal />
      </div>
      
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <ProductTable products={products || []} />
      </div>
    </div>
  );
}
