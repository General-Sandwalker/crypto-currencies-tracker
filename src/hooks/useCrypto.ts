import { useState, useEffect, useCallback } from 'react';
import type { Coin, Currency } from '../types/crypto';

const LCW_BASE = 'https://api.livecoinwatch.com';
const API_KEY = import.meta.env.VITE_LCW_API_KEY as string;

export const useCrypto = (currency: Currency = 'usd') => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCoins = useCallback(async (silent = false) => {
    if (!API_KEY) {
      setError('No Live Coin Watch API key found. Set VITE_LCW_API_KEY in your .env file.');
      setLoading(false);
      return;
    }
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await fetch(`${LCW_BASE}/coins/list`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          currency: currency.toUpperCase(),
          sort: 'rank',
          order: 'ascending',
          offset: 0,
          limit: 50,
          meta: true,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const desc = body?.error?.description ?? '';
        if (res.status === 429) throw new Error('Rate limited by Live Coin Watch – auto-retrying in 60 seconds.');
        if (res.status === 401) throw new Error('Live Coin Watch API key is invalid. Check VITE_LCW_API_KEY.');
        if (res.status === 403) throw new Error(`Live Coin Watch API access denied. ${desc}`);
        throw new Error(`Live Coin Watch API error (${res.status}). ${desc}`);
      }
      const data: Coin[] = await res.json();
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
    setCoins([]);
    setLoading(true);
    setError(null);
    fetchCoins();
    const interval = setInterval(() => fetchCoins(true), 60_000);
    return () => clearInterval(interval);
  }, [fetchCoins]);

  return { coins, loading, error, lastUpdated, refetch: fetchCoins };
};

