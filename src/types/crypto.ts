export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: { price: number[] };
  high_24h: number;
  low_24h: number;
  market_cap_rank: number;
  circulating_supply: number;
  total_supply: number | null;
  ath: number;
  atl: number;
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
