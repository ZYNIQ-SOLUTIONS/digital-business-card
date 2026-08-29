import { CartDrawer } from '@/components/store/cart-drawer';
import { StoreNav } from '@/components/store/store-nav';
import { PublicFooter } from '@/components/public-footer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-between">
      <StoreNav />
      <main className="pt-20 pb-16 flex-1">
        {children}
      </main>
      <PublicFooter />
      <CartDrawer />
    </div>
  );
}
