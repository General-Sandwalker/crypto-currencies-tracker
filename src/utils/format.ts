import type { Currency } from '../types/crypto';
import { CURRENCY_SYMBOLS } from '../types/crypto';

export const formatPrice = (price: number, currency: Currency): string => {
  const sym = CURRENCY_SYMBOLS[currency];
  if (currency === 'btc' || currency === 'eth') {
    return `${sym}${price.toFixed(price < 0.001 ? 8 : price < 1 ? 6 : price < 10 ? 4 : 4)}`;
  }
  if (price >= 1000) {
    return `${sym}${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 1) return `${sym}${price.toFixed(2)}`;
  if (price >= 0.01) return `${sym}${price.toFixed(4)}`;
  return `${sym}${price.toFixed(8)}`;
};

export const formatMarketCap = (val: number, currency: Currency): string => {
  const sym = CURRENCY_SYMBOLS[currency];
  if (val >= 1e12) return `${sym}${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `${sym}${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${sym}${(val / 1e6).toFixed(2)}M`;
  return `${sym}${val.toLocaleString()}`;
};

export const formatPercent = (val: number | null | undefined): string => {
  if (val == null) return 'N/A';
  return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
};

export const formatDate = (ts: number, days: number | 'max'): string => {
  const d = new Date(ts);
  if (days === 1) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  if (typeof days === 'number' && days <= 7) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
};
