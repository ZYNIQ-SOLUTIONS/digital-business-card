import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurrencyCode = 'AED' | 'USD';

export const USD_TO_AED_RATE = 3.6725;

export interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  toggleCurrency: () => void;
  formatPrice: (amountInAED: number) => string;
  convertAEDToUSD: (amountInAED: number) => number;
  convertUSDToAED: (amountInUSD: number) => number;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'AED',
      setCurrency: (currency) => set({ currency }),
      toggleCurrency: () => set((state) => ({ currency: state.currency === 'AED' ? 'USD' : 'AED' })),
      convertAEDToUSD: (amountInAED) => {
        return Number((amountInAED / USD_TO_AED_RATE).toFixed(2));
      },
      convertUSDToAED: (amountInUSD) => {
        return Number((amountInUSD * USD_TO_AED_RATE).toFixed(2));
      },
      formatPrice: (amountInAED) => {
        const { currency } = get();
        if (currency === 'USD') {
          const usd = amountInAED / USD_TO_AED_RATE;
          return `$${usd.toFixed(2)}`;
        }
        return `AED ${amountInAED.toFixed(2)}`;
      },
    }),
    {
      name: 'dbc-store-currency',
    }
  )
);

export function formatCurrency(amountInAED: number, currency: CurrencyCode): string {
  if (currency === 'USD') {
    const usd = amountInAED / USD_TO_AED_RATE;
    return `$${usd.toFixed(2)}`;
  }
  return `AED ${amountInAED.toFixed(2)}`;
}
