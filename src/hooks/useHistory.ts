import { useState, useEffect } from 'react';
import type { HistoryPoint, Currency } from '../types/crypto';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export const useHistory = (coinId: string, days: number | 'max', currency: Currency = 'usd') => {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coinId) return;
    const controller = new AbortController();
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      // Clear stale history immediately so old chart isn't shown for new selection
      setHistory([]);
      try {
        const res = await fetch(
          `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          if (res.status === 429) throw new Error('Rate limited – please wait a moment and try again.');
          if (res.status === 401 || res.status === 403) throw new Error('CoinGecko API access denied.');
          throw new Error(`CoinGecko API error (${res.status}).`);
        }
        const data = await res.json();
        if (cancelled) return;
        const points: HistoryPoint[] = (data.prices as [number, number][]).map(
          ([timestamp, price]) => ({ timestamp, price })
        );
        setHistory(points);
      } catch (err) {
        if (cancelled) return;
        const e = err as Error;
        if (e.name !== 'AbortError') {
          setError(e.message.includes('fetch') ? 'Network error – check your connection.' : e.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [coinId, days, currency]);

  return { history, loading, error };
};
