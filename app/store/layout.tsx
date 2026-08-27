import { CartDrawer } from '@/components/store/cart-drawer';
import { StoreNav } from '@/components/store/store-nav';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <StoreNav />
      <main className="pt-20">
        {children}
      </main>
      <CartDrawer />
    </div>
  );
}
