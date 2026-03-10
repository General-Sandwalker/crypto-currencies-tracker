import { useState, useCallback, useRef } from 'react';
import type { Coin, Currency } from '../types/crypto';

const LCW_BASE = 'https://api.livecoinwatch.com';
const API_KEY = import.meta.env.VITE_LCW_API_KEY as string;

/**
 * Lazy-loads the top 100 coins ONCE per currency change (no auto-refresh).
 * Only call `triggerFetch()` when the user actually needs to search —
 * saves credits by not loading the full list until needed.
 */
export const useSearchCoins = (currency: Currency) => {
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const triggerFetch = useCallback(async () => {
    if (hasFetched.current || loading) return;
    hasFetched.current = true;
    setLoading(true);
    setError(null);
    try {
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
          limit: 100,
          meta: true,
        }),
      });
      if (!res.ok) {
        hasFetched.current = false; // allow retry on error
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.description ?? `API error ${res.status}`);
      }
      const data: Coin[] = await res.json();
      setAllCoins(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currency, loading]);

  const filter = useCallback(
    (query: string): Coin[] => {
      if (!query.trim()) return [];
      const q = query.toLowerCase();
      return allCoins.filter(
        c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );
    },
    [allCoins]
  );

  return { triggerFetch, filter, loading, error, hasFetched: hasFetched.current, allCoins };
};
