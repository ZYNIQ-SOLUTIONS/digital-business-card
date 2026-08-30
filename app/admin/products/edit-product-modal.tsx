'use client';

import { useState } from 'react';
import { Edit3, X, Loader2, Upload, DollarSign } from 'lucide-react';
import { updateProduct } from './actions';
import { createClient } from '@/lib/supabase/client';
import { USD_TO_AED_RATE } from '@/lib/store/currency';

interface EditProductModalProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    in_stock: boolean;
  };
}

export function EditProductModal({ product }: EditProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dual currency inputs
  const initialPriceAed = product.price ? String(product.price) : '';
  const initialPriceUsd = product.price ? (Number(product.price) / USD_TO_AED_RATE).toFixed(2) : '';
  
  const [priceAed, setPriceAed] = useState<string>(initialPriceAed);
  const [priceUsd, setPriceUsd] = useState<string>(initialPriceUsd);

  // Image state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product.image_url || null);

  function handlePriceAedChange(val: string) {
    setPriceAed(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setPriceUsd((num / USD_TO_AED_RATE).toFixed(2));
    } else {
      setPriceUsd('');
    }
  }

  function handlePriceUsdChange(val: string) {
    setPriceUsd(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setPriceAed((num * USD_TO_AED_RATE).toFixed(2));
    } else {
      setPriceAed('');
    }
  }

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
      let imageUrl = product.image_url;

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
        price: priceAed || formData.get('price'),
        category: formData.get('category'),
        in_stock: formData.get('in_stock'),
        image_url: imageUrl,
      };

      const result = await updateProduct(product.id, productData);

      if (result.error) {
        throw new Error(result.error);
      }

      setIsOpen(false);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center justify-center"
        title="Edit Product"
      >
        <Edit3 className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40" onClick={() => !isSubmitting && setIsOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto text-left">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
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
                      <p>Click to change product image.</p>
                      <p>JPEG, PNG, WEBP (Max 2MB)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    required 
                    name="name" 
                    type="text" 
                    defaultValue={product.name}
                    className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input 
                    required 
                    name="category" 
                    type="text" 
                    defaultValue={product.category}
                    className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black" 
                  />
                </div>

                {/* Dual Currency Price Section */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Product Pricing (Dual Currency)
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-xs font-medium text-gray-600 mb-1">Price (AED)</span>
                      <div className="relative">
                        <input 
                          required 
                          name="price" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          value={priceAed}
                          onChange={(e) => handlePriceAedChange(e.target.value)}
                          className="w-full border-gray-300 rounded-xl px-3 py-2 bg-white text-sm focus:ring-black focus:border-black" 
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">AED</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-medium text-gray-600 mb-1">Price (USD)</span>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          value={priceUsd}
                          onChange={(e) => handlePriceUsdChange(e.target.value)}
                          className="w-full border-gray-300 rounded-xl px-3 py-2 bg-white text-sm focus:ring-black focus:border-black" 
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">USD</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Automatic live conversion: 1 USD ≈ {USD_TO_AED_RATE} AED.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description" 
                    rows={3} 
                    defaultValue={product.description}
                    className="w-full border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-black focus:border-black" 
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id={`in_stock_${product.id}`} 
                    name="in_stock" 
                    defaultChecked={product.in_stock} 
                    className="rounded border-gray-300 text-black focus:ring-black h-4 w-4" 
                  />
                  <label htmlFor={`in_stock_${product.id}`} className="text-sm font-medium text-gray-700">In Stock (Available in Store)</label>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
