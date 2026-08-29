import { Product } from './cart-store';

export interface ProductDetail extends Product {
  rating: number;
  reviewsCount: number;
  badge?: string;
  material: string;
  weight: string;
  dimensions: string;
  chipType: string;
  compatibility: string;
  features: string[];
  images: string[];
  specs: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
}

export const DEFAULT_PRODUCTS: ProductDetail[] = [
  {
    id: 'prod-obsidian-metal',
    name: 'Matte Obsidian Metal NFC Card',
    description: 'Precision laser-engraved aerospace stainless steel with deep matte obsidian finish. Engineered for founders, executives, and leaders.',
    price: 249.00,
    category: 'Metal Cards',
    in_stock: true,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'Best Seller',
    material: 'Aerospace Grade Stainless Steel',
    weight: '24 grams (Heavy luxury feel)',
    dimensions: '85.60 × 53.98 mm (Standard Credit Card format)',
    chipType: 'NXP NTAG216 (High-Speed Dual Coil)',
    compatibility: 'Compatible with all iPhone & Android NFC devices (No App Needed)',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    ],
    features: [
      'Instant 1-Tap sharing to Apple Wallet, Contacts & Socials',
      'Matte scratch-resistant PVD coating',
      'Precision fiber-laser custom engraving included',
      'IP68 100% Waterproof & Weatherproof',
      'Lifetime hardware replacement guarantee',
    ],
    specs: [
      { label: 'Core Material', value: '316L Marine Grade Stainless Steel' },
      { label: 'Chipset', value: 'NXP NTAG216 (888 Bytes EEPROM Memory)' },
      { label: 'Read Range', value: 'Up to 3.5 cm instant contactless response' },
      { label: 'Operating Temp', value: '-25°C to 70°C' },
      { label: 'Security', value: 'Password-write protection & tamper resistant' },
    ],
    faqs: [
      { question: 'Does the other person need an app to scan my card?', answer: 'No! When you tap your IZN card on any modern iPhone or Android device, your digital card profile opens immediately in their default browser or native wallet without downloading anything.' },
      { question: 'Can I change my card details after purchasing?', answer: 'Yes! Your physical card points to your dynamic cloud URL. You can update your phone, email, theme, social links, and bio anytime from your dashboard with zero re-printing.' },
      { question: 'How fast is shipping to UAE / Dubai?', answer: 'Orders placed in UAE are delivered within 24–48 hours with VIP courier tracking. Worldwide express delivery takes 3–5 business days.' },
    ],
  },
  {
    id: 'prod-24k-gold',
    name: '24K Mirror Gold Plated NFC Card',
    description: 'Ultra-luxurious 24K real gold plated finish with mirror reflection and custom deep relief engraving. Designed for elite networking and VIP access.',
    price: 399.00,
    category: 'Metal Cards',
    in_stock: true,
    rating: 5.0,
    reviewsCount: 89,
    badge: 'VIP Limited Edition',
    material: '24K Gold Electroplated Steel',
    weight: '26 grams',
    dimensions: '85.60 × 53.98 mm',
    chipType: 'NXP NTAG216 Premium',
    compatibility: '100% Universal NFC Tap Compatibility',
    image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    ],
    features: [
      'Genuine 24-Karat gold electroplated surface',
      'Dual-side bespoke laser engraving with logo',
      'Includes luxury velvet presentation case and NFC authentication card',
      'Instant Apple Wallet pass integration',
    ],
    specs: [
      { label: 'Plating', value: '24K Gold Electroplated (0.5 Micron Mirror Layer)' },
      { label: 'Substrate', value: 'Cold-Rolled Solid Brass & Stainless Core' },
      { label: 'Chipset', value: 'NXP High-Flux Security NFC' },
      { label: 'Warranty', value: 'Lifetime Replacement Warranty' },
    ],
    faqs: [
      { question: 'Will the gold finish fade over time?', answer: 'Our 24K gold series is coated with a micro-ceramic protective sealant that shields the gold layer from scratches, fingerprints, and oxidation.' },
      { question: 'Can I engrave my company logo?', answer: 'Yes! During checkout or after ordering, you can provide your high-res vector logo for custom laser engraving.' },
    ],
  },
  {
    id: 'prod-bamboo-wood',
    name: 'Organic Bamboo & Walnut Smart Card',
    description: 'Eco-conscious smart business card hand-crafted from sustainably harvested bamboo and dark walnut. Organic tactile feel with zero plastic.',
    price: 189.00,
    category: 'Wood Cards',
    in_stock: true,
    rating: 4.8,
    reviewsCount: 116,
    badge: 'Eco Friendly',
    material: 'Natural Sustainable Walnut & Bamboo',
    weight: '10 grams',
    dimensions: '85.60 × 53.98 mm',
    chipType: 'NXP NTAG213 High Efficiency',
    compatibility: 'Universal Tap on all modern iOS & Android phones',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    ],
    features: [
      '100% Plastic-free sustainable organic wood',
      'Distinct natural grain pattern on every single card',
      'Laser-etched typography with tactile wood depth',
      '1 Tree planted for every card purchased',
    ],
    specs: [
      { label: 'Wood Spec', value: 'Certified FSC Sustainable Bamboo / Dark Walnut' },
      { label: 'Finish', value: 'Natural Beeswax & Organic Linseed Oil' },
      { label: 'Chipset', value: 'High Performance Ultra-Thin Embedded NFC' },
    ],
    faqs: [
      { question: 'Is the wood card durable in a wallet?', answer: 'Yes, the wood is multi-layered cross-laminated for maximum flexibility and resistance to bending.' },
    ],
  },
  {
    id: 'prod-cyber-frost',
    name: 'Cyber Frost Semi-Translucent NFC Card',
    description: 'Futuristic frosted matte polymer with iridescent holographic edge glowing effect. Ultra-light, modern, and eye-catching.',
    price: 149.00,
    category: 'PVC & Matte',
    in_stock: true,
    rating: 4.9,
    reviewsCount: 94,
    badge: 'Futuristic',
    material: 'Frosted Polymer with Holographic Core',
    weight: '6 grams',
    dimensions: '85.60 × 53.98 mm',
    chipType: 'NXP NTAG216',
    compatibility: 'Universal iOS & Android Contactless Tap',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    ],
    features: [
      'Frosted translucent body showing subtle internal antenna silhouette',
      'Edge glow in dynamic cyber hues',
      'High durability waterproof matte polymer',
      'Custom color print & QR code pass integration',
    ],
    specs: [
      { label: 'Material', value: 'Semi-Translucent Matte Composite' },
      { label: 'Water Resistance', value: '100% Waterproof' },
      { label: 'Chipset', value: 'NXP NTAG216' },
    ],
    faqs: [
      { question: 'Can I put my QR code on the back?', answer: 'Yes! Every card comes with dynamic QR code sync fallback on the reverse side.' },
    ],
  },
  {
    id: 'prod-smart-token',
    name: 'IZN Titanium Smart Key Ring Token',
    description: 'Compact 32mm titanium tap token with embedded NFC chip for keys, bags, and instant networking without taking out your wallet.',
    price: 99.00,
    category: 'Accessories',
    in_stock: true,
    rating: 4.8,
    reviewsCount: 67,
    material: 'Matte Black Anodized Titanium Ring',
    weight: '14 grams',
    dimensions: '32mm Diameter × 3mm Thickness',
    chipType: 'High-Flux Mini NFC',
    compatibility: 'Universal Contactless Tap',
    image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    ],
    features: [
      'Always with you on your keychain',
      'Instant tap on any phone',
      'Heavy-duty titanium withstands keys & coins without wear',
    ],
    specs: [
      { label: 'Diameter', value: '32 mm' },
      { label: 'Metal', value: 'Grade 5 Titanium' },
    ],
    faqs: [
      { question: 'How do I tap with the key token?', answer: 'Simply hold the token against the top of an iPhone or middle of an Android device to transmit your contact pass.' },
    ],
  },
  {
    id: 'prod-desk-display',
    name: 'IZN Executive Smart Desk Display',
    description: 'Solid aluminum and crystal acrylic NFC tap stand for reception desks, conference rooms, executive suites, and store counters.',
    price: 449.00,
    category: 'Accessories',
    in_stock: true,
    rating: 5.0,
    reviewsCount: 42,
    badge: 'Enterprise Choice',
    material: 'Brushed Space Gray Aluminum & Crystal Acrylic',
    weight: '320 grams (Weighted solid desk anchor)',
    dimensions: '120 × 80 × 50 mm',
    chipType: 'Dual High-Gain Long-Range NFC Antennas',
    compatibility: 'Dual NFC + Dynamic Acrylic QR Matrix',
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    ],
    features: [
      'Dual active NFC tap points (Left & Right)',
      'Ultra-clear acrylic prism with laser engraved logo & QR code',
      'Non-slip silicone weighted base',
      'Great for booking meetings, sharing enterprise contact passes, or collecting client reviews',
    ],
    specs: [
      { label: 'Base Material', value: 'Solid CNC Billet Space Gray Aluminum' },
      { label: 'Display Panel', value: 'Optical Grade Acrylic with Anti-Glare Coating' },
      { label: 'Range', value: 'Expanded 5 cm contact radius' },
    ],
    faqs: [
      { question: 'Can multiple people tap the desk stand?', answer: 'Yes! Unlimited clients, visitors, and partners can tap simultaneously or scan the QR code to load your organization credentials.' },
    ],
  },
];

export function getProductById(id: string): ProductDetail | undefined {
  return DEFAULT_PRODUCTS.find((p) => p.id === id || p.name.toLowerCase().replace(/\s+/g, '-').includes(id.toLowerCase()));
}
