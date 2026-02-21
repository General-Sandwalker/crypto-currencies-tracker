import { useState, useEffect, useCallback } from 'react';
import type { Coin, Currency } from '../types/crypto';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export const useCrypto = (currency: Currency = 'usd') => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCoins = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await fetch(
        `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h%2C7d`
      );
      if (!res.ok) {
        if (res.status === 429) throw new Error('Rate limited by CoinGecko – auto-retrying in 60 seconds.');
        if (res.status === 401 || res.status === 403) throw new Error('CoinGecko API access denied. Try adding a free API key at coingecko.com/api.');
        throw new Error(`CoinGecko API error (${res.status}). Please try again.`);
      }
      const data = await res.json();
      setCoins(data);
      setLastUpdated(new Date());
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg.includes('fetch') ? 'Network error – check your connection and try again.' : msg);
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    // Clear stale data from previous currency immediately
    setCoins([]);
    setLoading(true);
    setError(null);
    fetchCoins();
    const interval = setInterval(() => fetchCoins(true), 60_000);
    return () => clearInterval(interval);
  }, [fetchCoins]);

  return { coins, loading, error, lastUpdated, refetch: fetchCoins };
};
