'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Check, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { Product, useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore, USD_TO_AED_RATE } from '@/lib/store/currency';
import { useStoreI18n, storeTranslations, PRODUCT_TRANSLATIONS } from '@/lib/store/i18n';
import { ProductDetail, DEFAULT_PRODUCTS } from '@/lib/store/default-products';

interface ProductDetailViewProps {
  product: ProductDetail;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, setCartOpen } = useCartStore();
  const { currency, setCurrency, formatPrice } = useCurrencyStore();
  const { lang, isRTL } = useStoreI18n();
  
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || product.image_url);
  const [quantity, setQuantity] = useState(1);
  const [customEngravingName, setCustomEngravingName] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'faq'>('features');
  const [liveRelatedProducts, setLiveRelatedProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

  React.useEffect(() => {
    async function loadRelated() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            setLiveRelatedProducts(data.products);
          }
        }
      } catch (e) {
        // Fallback to defaults
      }
    }
    loadRelated();
  }, []);

  const t = storeTranslations[lang].productDetail;
  const productTrans = PRODUCT_TRANSLATIONS[product.id];

  const displayName = (lang === 'ar' && productTrans) ? productTrans.name : product.name;
  const displayDescription = (lang === 'ar' && productTrans) ? productTrans.description : product.description;
  const displayCategory = (lang === 'ar' && productTrans) ? productTrans.category : (product.category || "Hardware");

  // Dual Currency pricing
  const priceInAED = Number(product.price);
  const priceInUSD = priceInAED / USD_TO_AED_RATE;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        ...product,
        name: customEngravingName ? `${displayName} (Custom: ${customEngravingName})` : displayName,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setCartOpen(false);
    router.push('/store/checkout');
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in text-left">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link href="/store" className="hover:text-black transition flex items-center gap-1">
          {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{t.allHardware}</span>
        </Link>
        <span>/</span>
        <span className="text-gray-400">{displayCategory}</span>
        <span>/</span>
        <span className="text-black font-semibold truncate max-w-xs">{displayName}</span>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT 6 COLS: INTERACTIVE PRODUCT GALLERY & 3D MOCKUP */}
        <div className="lg:col-span-6 space-y-4 sticky top-24">
          {/* Main Visual Frame */}
          <div className="relative aspect-square rounded-[36px] bg-gradient-to-b from-white to-[#EAEAEA] border border-black/[0.08] shadow-lg overflow-hidden flex items-center justify-center p-8 group">
            <img
              src={selectedImage}
              alt={displayName}
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out shadow-md"
            />

            {/* Custom Laser Engraving Overlay Badge */}
            {customEngravingName && (
              <div className="absolute bottom-12 inset-x-12 p-3 rounded-xl bg-black/70 backdrop-blur-md text-white text-center border border-white/20 shadow-2xl animate-in fade-in-50">
                <span className="text-[10px] uppercase font-mono text-amber-300 block tracking-widest">{t.laserPreviewBadge}</span>
                <span className="text-sm font-bold tracking-tight block">{customEngravingName}</span>
                {customTitle && <span className="text-[11px] text-gray-300 font-medium block">{customTitle}</span>}
              </div>
            )}

            {/* In Stock Badge */}
            <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-xs border border-green-200 flex items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{t.inStockReady}</span>
            </div>

            {product.badge && (
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} bg-black text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs`}>
                {(lang === 'ar' && productTrans?.badge) ? productTrans.badge : product.badge}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImage === img
                      ? 'border-[#0071E3] shadow-md ring-2 ring-[#0071E3]/20'
                      : 'border-transparent hover:border-black/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Hardware Highlights Bar */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] text-center shadow-2xs">
              <Zap className="w-4 h-4 text-[#0071E3] mx-auto mb-1" />
              <span className="block text-[11px] font-bold text-black">{t.instantTap}</span>
              <span className="block text-[9px] text-gray-500">{t.tapSub}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] text-center shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <span className="block text-[11px] font-bold text-black">{t.waterproof}</span>
              <span className="block text-[9px] text-gray-500">{t.waterproofSub}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] text-center shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span className="block text-[11px] font-bold text-black">{t.engraved}</span>
              <span className="block text-[9px] text-gray-500">{t.engravedSub}</span>
            </div>
          </div>
        </div>

        {/* RIGHT 6 COLS: PRODUCT DETAILS & BUYING CONTROLS */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Title & Rating */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-black">{product.rating}</span>
              <span className="text-xs text-gray-400 font-medium">({product.reviewsCount} {t.customerReviews})</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]">
              {displayName}
            </h1>

            <p className="text-sm text-gray-600 leading-relaxed pt-1">
              {displayDescription}
            </p>
          </div>

          {/* Pricing Box (AED & USD Dual Currency Support) */}
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-400 font-medium block mb-1">{t.priceIncludes}</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-black">
                  {currency === 'USD' ? `$${priceInUSD.toFixed(2)}` : `AED ${priceInAED.toFixed(2)}`}
                </span>
                <span className="text-sm font-semibold text-gray-400">
                  {currency === 'USD' ? `(AED ${priceInAED.toFixed(2)})` : `($${priceInUSD.toFixed(2)} USD)`}
                </span>
              </div>
            </div>

            {/* Currency Switcher in Product Page */}
            <div className="flex items-center gap-1.5 self-start sm:self-center bg-[#F5F5F7] p-1.5 rounded-2xl border border-black/[0.04]">
              <button
                onClick={() => setCurrency('AED')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  currency === 'AED' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                AED (د.إ)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  currency === 'USD' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>

          {/* Laser Personalization Customizer */}
          <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>{t.laserSectionTitle}</span>
              </label>
              <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">{t.freeBadge}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-gray-500 font-medium block mb-1">{t.nameInputLabel}</span>
                <input
                  type="text"
                  placeholder={t.nameInputPlaceholder}
                  value={customEngravingName}
                  onChange={(e) => setCustomEngravingName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <span className="text-[11px] text-gray-500 font-medium block mb-1">{t.titleInputLabel}</span>
                <input
                  type="text"
                  placeholder={t.titleInputPlaceholder}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] text-xs focus:outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center rounded-2xl bg-white border border-black/[0.08] p-1 shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl hover:bg-neutral-100 flex items-center justify-center transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-black">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl hover:bg-neutral-100 flex items-center justify-center transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                  added
                    ? 'bg-[#34C759] text-white'
                    : 'bg-[#1D1D1F] hover:bg-black text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t.addedToCart} ({quantity})</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.addToBag} • {formatPrice(priceInAED * quantity)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Instant Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="w-full py-4 px-6 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-bold text-sm shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <span>{t.instantCheckout}</span>
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Delivery & Assurance Strip */}
          <div className="p-4 rounded-2xl bg-white border border-black/[0.06] space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-gray-700">
              <Truck className="w-4 h-4 text-[#0071E3] shrink-0" />
              <span>{t.deliveryNotice}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-700">
              <RotateCcw className="w-4 h-4 text-green-600 shrink-0" />
              <span>{t.guaranteeNotice}</span>
            </div>
          </div>

          {/* Specs & Features Accordion Tabs */}
          <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs space-y-4">
            <div className="flex gap-2 border-b border-black/[0.06] pb-3">
              {[
                { id: 'features', label: t.tabFeatures },
                { id: 'specs', label: t.tabSpecs },
                { id: 'faq', label: t.tabFaq },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-black text-white'
                      : 'text-gray-500 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'features' && (
              <ul className="space-y-2.5 text-xs text-gray-700">
                {product.features?.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-2 text-xs">
                {product.specs?.map((spec, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-black/[0.03]">
                    <span className="text-gray-500">{spec.label}</span>
                    <span className="font-semibold text-black">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-3 text-xs">
                {product.faqs?.map((faq, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="font-bold text-black block">{faq.question}</span>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Related Hardware Section */}
      <div className="pt-12 border-t border-black/[0.08] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black">{t.relatedTitle}</h2>
            <p className="text-xs text-gray-500">{t.relatedDesc}</p>
          </div>
          <Link href="/store" className="text-xs font-bold text-[#0071E3] hover:underline flex items-center gap-1">
            <span>{t.viewAllStore}</span>
            {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {liveRelatedProducts.filter((p) => p.id !== product.id).slice(0, 3).map((rel) => {
            const relTrans = PRODUCT_TRANSLATIONS[rel.id];
            const relName = (lang === 'ar' && relTrans) ? relTrans.name : rel.name;
            const relDesc = (lang === 'ar' && relTrans) ? relTrans.description : rel.description;

            return (
              <Link
                key={rel.id}
                href={`/store/product?id=${rel.id}`}
                className="bg-white rounded-3xl p-5 border border-black/[0.06] hover:border-black/[0.18] shadow-xs hover:shadow-lg transition group flex flex-col"
              >
                <div className="aspect-square rounded-2xl bg-[#F5F5F7] overflow-hidden mb-4">
                  <img src={rel.image_url} alt={relName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <h3 className="text-sm font-bold text-black group-hover:text-[#0071E3] transition line-clamp-1 mb-1">{relName}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{relDesc}</p>
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-black/[0.04]">
                  <span className="text-sm font-bold text-black">{formatPrice(rel.price)}</span>
                  <span className="text-xs font-semibold text-[#0071E3] flex items-center gap-1">
                    <span>{t.viewDetails}</span>
                    {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Sticky Bottom Floating Purchase Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-black/[0.08] p-3 px-4 flex items-center justify-between gap-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] pb-safe">
        <div className="truncate">
          <span className="block text-[11px] text-gray-500 truncate">{displayName}</span>
          <span className="block text-base font-bold text-black">{formatPrice(priceInAED * quantity)}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
              added ? 'bg-[#34C759] text-white' : 'bg-black text-white'
            }`}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            <span>{added ? 'Added' : t.addToBag}</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="py-2.5 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1"
          >
            <span>{t.instantCheckout}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
