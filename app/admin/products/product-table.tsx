'use client';

import { useState } from 'react';
import { deleteProduct, toggleProductStock } from './actions';
import { Loader2, Trash2 } from 'lucide-react';

export function ProductTable({ products }: { products: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setLoadingId(id);
    await deleteProduct(id);
    setLoadingId(null);
  }

  async function handleToggleStock(id: string, inStock: boolean) {
    setLoadingId(id);
    await toggleProductStock(id, inStock);
    setLoadingId(null);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-6 py-4 text-sm font-medium text-gray-500">Product</th>
            <th className="px-6 py-4 text-sm font-medium text-gray-500">Category</th>
            <th className="px-6 py-4 text-sm font-medium text-gray-500">Price</th>
            <th className="px-6 py-4 text-sm font-medium text-gray-500">Stock Status</th>
            <th className="px-6 py-4 text-sm font-medium text-gray-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">{product.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 uppercase tracking-wider">{product.category}</td>
              <td className="px-6 py-4 font-medium">AED {Number(product.price).toFixed(2)}</td>
              <td className="px-6 py-4">
                <select
                  value={product.in_stock ? 'true' : 'false'}
                  onChange={(e) => handleToggleStock(product.id, e.target.value === 'true')}
                  disabled={loadingId === product.id}
                  className={`text-sm font-medium rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-black outline-none ${
                    product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={loadingId === product.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {loadingId === product.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No products found. Add your first product.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
