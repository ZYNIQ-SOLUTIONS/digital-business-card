import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StoreLanguage = 'en' | 'ar';

export interface StoreI18nState {
  lang: StoreLanguage;
  setLang: (lang: StoreLanguage) => void;
  toggleLang: () => void;
  isRTL: boolean;
}

export const useStoreI18n = create<StoreI18nState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      isRTL: false,
      setLang: (lang) => set({ lang, isRTL: lang === 'ar' }),
      toggleLang: () => {
        const nextLang = get().lang === 'en' ? 'ar' : 'en';
        set({ lang: nextLang, isRTL: nextLang === 'ar' });
      },
    }),
    {
      name: 'dbc-store-lang',
    }
  )
);

export const storeTranslations = {
  en: {
    // Navigation
    nav: {
      backHome: "Back to Home",
      store: "Hardware Store",
      allProducts: "All Hardware",
      cart: "Cart",
      currency: "Currency",
      language: "Language",
    },
    // Hero Banner
    hero: {
      collectionBadge: "Precision NFC Hardware Collection",
      titleLine1: "Digital Networking,",
      titleLine2: "Elevated to Pure Art.",
      description: "Hand-finished aerospace metals, 24K gold plating, and organic bamboo. Embedded with high-speed dual-frequency NFC chips for seamless tap sharing.",
      pill1: "No App Required",
      pill2: "24h UAE Express Delivery",
      pill3: "Lifetime Chip Guarantee",
    },
    // Value Props
    valueProps: {
      tapTitle: "Instant 1-Tap Connect",
      tapDesc: "Works seamlessly across all modern Apple & Android devices.",
      laserTitle: "Laser Customization",
      laserDesc: "Every card includes bespoke fiber laser name & logo etching.",
      deliveryTitle: "Next-Day UAE Delivery",
      deliveryDesc: "Free priority shipping to Dubai, Abu Dhabi, and worldwide.",
      syncTitle: "Lifetime Profile Sync",
      syncDesc: "Update your details anytime in the cloud with zero re-printing.",
    },
    // Catalog
    catalog: {
      heading: "All Physical Smart Products",
      subheading: "Select your card material, customize your laser engraving, and start networking in seconds.",
      availableCount: "Products Available",
      filterAll: "All Products",
      filterMetal: "Metal Cards",
      filterWood: "Wood Cards",
      filterPvc: "PVC & Matte",
      filterAccessories: "Accessories",
      priceLabel: "Price",
      freeShipping: "Free UAE Delivery",
      inStock: "In Stock • 24h Dispatch",
      viewSpecs: "View Specs",
      add: "Add",
      added: "Added!",
      verified: "5.0 (Verified)",
    },
    // Enterprise Callout
    enterprise: {
      badge: "Corporate & Enterprise Orders",
      title: "Equip your entire organization with branded smart hardware.",
      desc: "Volume discounts for 10+ cards, bespoke corporate pantone matching, custom packaging, and automated centralized HR directory management.",
      cta: "Explore Enterprise Packages",
    },
    // Product Detail Page
    productDetail: {
      allHardware: "All Hardware",
      inStockReady: "In Stock • Ready to Ship",
      customerReviews: "customer reviews",
      priceIncludes: "Price (Includes Free UAE Delivery)",
      specialLaunch: "Special Launch Price",
      laserSectionTitle: "Complimentary Fiber Laser Customization",
      freeBadge: "FREE",
      nameInputLabel: "Your Full Name for Card",
      nameInputPlaceholder: "e.g. Ibrahim El Khalil",
      titleInputLabel: "Title & Company (Optional)",
      titleInputPlaceholder: "e.g. Founder • ZYNIQ",
      laserPreviewBadge: "Laser Engraved Preview",
      addToBag: "Add to Bag",
      addedToCart: "Added to Cart",
      instantCheckout: "Instant Express Checkout",
      deliveryNotice: "Next-Day UAE Delivery: Dubai, Abu Dhabi, Sharjah & all Emirates.",
      guaranteeNotice: "30-Day Money Back Guarantee + Lifetime Cloud Profile Access.",
      tabFeatures: "Key Features",
      tabSpecs: "Technical Specs",
      tabFaq: "Common Questions",
      relatedTitle: "Explore Other Smart Hardware",
      relatedDesc: "Pair your card with our executive accessories & desk displays.",
      viewAllStore: "View All Store",
      viewDetails: "View Details",
      instantTap: "Instant Tap",
      tapSub: "iOS & Android",
      waterproof: "IP68 Waterproof",
      waterproofSub: "Marine Grade",
      engraved: "Laser Engraved",
      engravedSub: "Custom Included",
    },
    // Cart Drawer
    cart: {
      title: "Shopping Bag",
      empty: "Your bag is empty",
      emptySub: "Explore our smart physical NFC cards & accessories.",
      shopNow: "Shop Hardware",
      subtotal: "Subtotal",
      checkout: "Proceed to Checkout",
      freeShippingNote: "Free Express Shipping in UAE included",
    },
    // Checkout Page
    checkout: {
      title: "Express Checkout",
      orderSummary: "Order Summary",
      shippingInfo: "Shipping Information",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number (for courier delivery)",
      address: "Street Address / Building",
      city: "City / Emirate",
      country: "Country",
      customEngravingNote: "Laser Engraving Details",
      placeOrder: "Place Order & Pay",
      processing: "Processing Order...",
      freeDelivery: "FREE UAE Priority Delivery",
      total: "Total Amount",
    },
    // Success Page
    success: {
      title: "Thank You for Your Order!",
      subtitle: "Your smart hardware order has been received and is being prepared for laser customization & dispatch.",
      trackOrder: "Track Order Status",
      continueShopping: "Continue Shopping",
    },
  },
  ar: {
    // Navigation
    nav: {
      backHome: "العودة للرئيسية",
      store: "متجر البطاقات الذكية",
      allProducts: "جميع المنتجات",
      cart: "السلة",
      currency: "العملة",
      language: "اللغة",
    },
    // Hero Banner
    hero: {
      collectionBadge: "مجموعة البطاقات الذكية بتقنية NFC فائقة الدقة",
      titleLine1: "التواصل الرقمي..",
      titleLine2: "بلمسة من الفخامة والإتقان.",
      description: "بطاقات مصنعة من الستانلس ستيل الفضائي، مطليات الذهب عيار 24، وخشب الخيزران الطبيعي. مدمجة بشريحة NFC فائقة السرعة للمشاركة الفورية بلمسة واحدة.",
      pill1: "بدون أي تطبيق",
      pill2: "توصيل سريع خلال 24 ساعة بالإمارات",
      pill3: "ضمان الشريحة مدى الحياة",
    },
    // Value Props
    valueProps: {
      tapTitle: "اتصال فوري بلمسة واحدة",
      tapDesc: "متوافقة بالكامل مع جميع هواتف آبل وأندرويد الحديثة.",
      laserTitle: "حفر ليزر مخصص مجاناً",
      laserDesc: "تشمل كل بطاقة حفر ليزر فايبر دقيق لاسمك وشعار شركتك.",
      deliveryTitle: "توصيل سريع خلال 24 ساعة",
      deliveryDesc: "شحن مجاني ذو أولوية إلى دبي، أبوظبي، وجميع أنحاء العالم.",
      syncTitle: "تزامن سحابي مدى الحياة",
      syncDesc: "حدّث بياناتك في أي وقت عبر السحابة دون الحاجة لإعادة طباعة.",
    },
    // Catalog
    catalog: {
      heading: "جميع المنتجات والبطاقات الذكية",
      subheading: "اختر خامة بطاقتك، خصص حفر الليزر، وابدأ في توسيع شبكة علاقاتك المهنية خلال ثوانٍ.",
      availableCount: "منتج متاح",
      filterAll: "جميع المنتجات",
      filterMetal: "بطاقات معدنية",
      filterWood: "بطاقات خشبية",
      filterPvc: "بطاقات مطفية",
      filterAccessories: "إكسسوارات",
      priceLabel: "السعر",
      freeShipping: "توصيل مجاني داخل الإمارات",
      inStock: "متوفر • شحن خلال 24 ساعة",
      viewSpecs: "عرض المواصفات",
      add: "إضافة",
      added: "تمت الإضافة!",
      verified: "5.0 (تقييم موثق)",
    },
    // Enterprise Callout
    enterprise: {
      badge: "طلبات الشركات والمؤسسات",
      title: "زوّد فريقك ومؤسستك ببطاقات ذكية مخصصة بهوية علامتك التجارية.",
      desc: "خصومات خاصة للكميات ابتداءً من 10 بطاقات، مطابقة ألوان البانتون الرسمية، وتغليف فاخر مع لوحة تحكم مركزية لإدارة بيانات الموظفين.",
      cta: "استكشف باقات الشركات",
    },
    // Product Detail Page
    productDetail: {
      allHardware: "جميع البطاقات",
      inStockReady: "متوفر • جاهز للشحن الفوري",
      customerReviews: "تقييمات العملاء",
      priceIncludes: "السعر (يشمل التوصيل المجاني داخل الإمارات)",
      specialLaunch: "سعر الإطلاق الخاص",
      laserSectionTitle: "حفر ليزر فايبر مخصص (مجاناً بالكامل)",
      freeBadge: "مجاناً",
      nameInputLabel: "اسمك الكامل للبطاقة",
      nameInputPlaceholder: "مثال: إبراهيم الخليل",
      titleInputLabel: "المنصب والشركة (اختياري)",
      titleInputPlaceholder: "مثال: المؤسس والمدير التنفيذي • ZYNIQ",
      laserPreviewBadge: "معاينة الحفر بالليزر",
      addToBag: "إضافة إلى السلة",
      addedToCart: "تمت الإضافة إلى السلة",
      instantCheckout: "شراء فوري سريع",
      deliveryNotice: "توصيل في اليوم التالي: دبي، أبوظبي، الشارقة وجميع إمارات الدولة.",
      guaranteeNotice: "ضمان استرجاع لمدة 30 يوماً + وصول سحابي لملفك الشخصي مدى الحياة.",
      tabFeatures: "المميزات الأساسية",
      tabSpecs: "المواصفات التقنية",
      tabFaq: "الأسئلة الشائعة",
      relatedTitle: "استكشف ملحقات وإكسسوارات أخرى",
      relatedDesc: "اجمع بطاقتك مع الميدالية الذكية أو منصة المكتب التنفيذية.",
      viewAllStore: "عرض كل المتجر",
      viewDetails: "عرض التفاصيل",
      instantTap: "لمسة فورية",
      tapSub: "لهواتف آبل وأندرويد",
      waterproof: "مقاومة للماء IP68",
      waterproofSub: "معيار بحري فائق",
      engraved: "حفر ليزر",
      engravedSub: "مخصص ومشمول مجاناً",
    },
    // Cart Drawer
    cart: {
      title: "حقيبة التسوق",
      empty: "حقيبة التسوق فارغة",
      emptySub: "استكشف بطاقاتنا الذكية وإكسسوارات NFC المتطورة.",
      shopNow: "تصفح المتجر",
      subtotal: "المجموع الفرعي",
      checkout: "المتابعة لإتمام الطلب",
      freeShippingNote: "الشحن السريع مجاناً داخل دولة الإمارات مشمول",
    },
    // Checkout Page
    checkout: {
      title: "الدفع السريع",
      orderSummary: "ملخص الطلب",
      shippingInfo: "معلومات الشحن والتوصيل",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف (للتواصل مع مندوب التوصيل)",
      address: "العنوان / اسم الشارع أو المبنى",
      city: "المدينة / الإمارة",
      country: "الدولة",
      customEngravingNote: "تفاصيل حفر الليزر",
      placeOrder: "تأكيد الطلب والدفع",
      processing: "جاري معالجة الطلب...",
      freeDelivery: "توصيل مجاني ذو أولوية في الإمارات",
      total: "المبلغ الإجمالي",
    },
    // Success Page
    success: {
      title: "شكراً لطلبك!",
      subtitle: "تم استلام طلبك بنجاح وجاري تجهيز البطاقة للحفر بالليزر وإرسالها مع مندوب التوصيل.",
      trackOrder: "متابعة حالة الشحنة",
      continueShopping: "العودة للمتجر",
    },
  },
};

export const PRODUCT_TRANSLATIONS: Record<string, { name: string; description: string; category: string; badge?: string }> = {
  'prod-obsidian-metal': {
    name: 'بطاقة NFC معدنية أوبسيديان مطفية',
    description: 'ستانلس ستيل فضائي محفور بالليزر بدقة فائقة مع طلاء أوبسيديان مطفي مقاوم للخدش. مصممة للمؤسسين والقادة التنفيذيين.',
    category: 'بطاقات معدنية',
    badge: 'الأكثر مبيعاً',
  },
  'prod-24k-gold': {
    name: 'بطاقة NFC مطلية بالذهب عيار 24',
    description: 'فخامة ملكية مع طبقة ذهب حقيقي عيار 24 بلمعان عاكس مع حفر ليزر بارز مخصص. صُممت لنخبة الشخصيات وكبار التنفيذيين.',
    category: 'بطاقات معدنية',
    badge: 'إصدار VIP محدود',
  },
  'prod-bamboo-wood': {
    name: 'بطاقة ذكية من خشب الخيزران والجوز الطبيعي',
    description: 'بطاقة أعمال ذكية صديقة للبيئة مصنوعة يدوياً من خشب الخيزران المستدام والجوز الداكن. ملمس طبيعي فاخر وخالية تماماً من البلاستيك.',
    category: 'بطاقات خشبية',
    badge: 'صديقة للبيئة',
  },
  'prod-cyber-frost': {
    name: 'بطاقة NFC سايبر فروست شبه شفافة',
    description: 'تصميم مستقبلي من مادة البوليمر المطفية الشفافة مع شريحة وهوائي NFC مرئيين بتصميم سايبربانك أنيق وخفيف الوزن.',
    category: 'بطاقات مطفية',
    badge: 'إصدار مستقبلي',
  },
  'prod-smart-token': {
    name: 'ميدالية المفاتيح الذكية من التيتانيوم IZN',
    description: 'ميدالية مفاتيح مدمجة بشريحة NFC مصنوعة من التيتانيوم ومقاومة للماء بالكامل. شارك بطاقتك الشخصية وحساباتك أينما ذهبت.',
    category: 'إكسسوارات',
    badge: 'إكسسوار يومي',
  },
  'prod-desk-display': {
    name: 'منصة المكتب التنفيذية الذكية IZN',
    description: 'منصة أكريليك وزجاج مصقولة لمكتبك أو مكتب الاستقبال. دع زوارك وعملاءك يلمسون هواتفهم لحفظ جهة اتصالك فوراً.',
    category: 'إكسسوارات',
    badge: 'للمكاتب التنفيذية',
  },
};
