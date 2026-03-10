export interface Coin {
  code: string;
  symbol?: string;
  name: string;
  png64: string;
  rate: number;
  cap: number;
  volume: number;
  rank: number;
  delta: {
    hour: number;
    day: number;
    week: number;
    month: number;
    quarter: number;
    year: number;
  };
  circulatingSupply: number;
  totalSupply: number | null;
  allTimeHighUSD: number;
}

export interface HistoryPoint {
  timestamp: number;
  price: number;
}

export type Currency = 'usd' | 'eur' | 'gbp' | 'jpy' | 'btc' | 'eth';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  usd: '$',
  eur: '€',
  gbp: '£',
  jpy: '¥',
  btc: '₿',
  eth: 'Ξ',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  usd: 'USD',
  eur: 'EUR',
  gbp: 'GBP',
  jpy: 'JPY',
  btc: 'BTC',
  eth: 'ETH',
};
