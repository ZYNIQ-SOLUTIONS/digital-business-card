import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/store/product-card';
import { Product } from '@/lib/store/cart-store';
import { DEFAULT_PRODUCTS } from '@/lib/store/default-products';
import { Zap, ShieldCheck, Truck, Sparkles, Building2, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-fade-in">
      
      {/* Store Hero Banner */}
      <div className="relative rounded-[40px] bg-gradient-to-br from-neutral-900 via-black to-[#111116] text-white p-8 sm:p-14 overflow-hidden border border-white/[0.08] shadow-2xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#8b5cf6]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-[#10b981]/15 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#38BDF8]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Precision NFC Hardware Collection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08] text-white">
            Digital Networking, <br/>
            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Elevated to Pure Art.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-xl leading-relaxed pt-1">
            Hand-finished aerospace metals, 24K gold plating, and organic bamboo. Embedded with high-speed dual-frequency NFC chips for seamless tap sharing.
          </p>

          {/* Quick Feature Pills */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#34C759]" />
              <span>No App Required</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>24h UAE Express Delivery</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Lifetime Chip Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition 4-Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center mb-2">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-black">Instant 1-Tap Connect</h3>
          <p className="text-xs text-gray-500">Works seamlessly across all modern Apple &amp; Android devices.</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-black">Laser Customization</h3>
          <p className="text-xs text-gray-500">Every card includes bespoke fiber laser name &amp; logo etching.</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-2">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-black">Next-Day UAE Delivery</h3>
          <p className="text-xs text-gray-500">Free priority shipping to Dubai, Abu Dhabi, and worldwide.</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-black">Lifetime Profile Sync</h3>
          <p className="text-xs text-gray-500">Update your details anytime in the cloud with zero re-printing.</p>
        </div>
      </div>

      {/* Products Showcase Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-black/[0.06] pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
              All Physical Smart Products
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Select your card material, customize your laser engraving, and start networking in seconds.
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400">
            {products.length} Products Available
          </span>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Enterprise Bulk Custom Hardware Callout */}
      <div className="rounded-3xl bg-white border border-black/[0.08] p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#0071E3] tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Corporate &amp; Enterprise Orders</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-black">
            Equip your entire organization with branded smart hardware.
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Volume discounts for 10+ cards, bespoke corporate pantone matching, custom packaging, and automated centralized HR directory management.
          </p>
        </div>

        <Link
          href="/dashboard/enterprise"
          className="px-6 py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0"
        >
          <span>Explore Enterprise Packages</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
