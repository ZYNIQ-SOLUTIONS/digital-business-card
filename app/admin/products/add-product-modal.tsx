'use client';

import { useState } from 'react';
import { Plus, X, Loader2, Upload } from 'lucide-react';
import { addProduct } from './actions';
import { createClient } from '@/lib/supabase/client';

export function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      let imageUrl = '';

      // Upload image if selected
      if (file) {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, file);
          
        if (uploadError) {
          throw new Error('Image upload failed: ' + uploadError.message);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }

      const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        category: formData.get('category'),
        in_stock: formData.get('in_stock'),
        image_url: imageUrl,
      };

      const result = await addProduct(productData);

      if (result.error) {
        throw new Error(result.error);
      }

      setIsOpen(false);
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Product
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={() => !isSubmitting && setIsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl pointer-events-auto max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Add New Product</h2>
            <button
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-400" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  <p>Click to upload a high-quality image.</p>
                  <p>JPEG, PNG, WEBP (Max 2MB)</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required name="name" type="text" className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black" placeholder="e.g. Premium NFC Card" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input required name="category" type="text" className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black" placeholder="e.g. Cards, Accessories" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (AED)</label>
              <input required name="price" type="number" step="0.01" min="0" className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black" placeholder="0.00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required name="description" rows={3} className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black resize-none" placeholder="Product details..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock Status</label>
              <select name="in_stock" className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black">
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-900 transition-colors flex justify-center items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Add Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
