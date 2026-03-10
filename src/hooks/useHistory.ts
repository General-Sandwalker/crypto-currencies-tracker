import { useState, useEffect } from 'react';
import type { HistoryPoint, Currency } from '../types/crypto';

const LCW_BASE = 'https://api.livecoinwatch.com';
const API_KEY = import.meta.env.VITE_LCW_API_KEY as string;

function daysToRange(days: number | 'max'): { start: number; end: number } {
  const end = Date.now();
  if (days === 'max') {
    return { start: new Date('2010-01-01').getTime(), end };
  }
  return { start: end - days * 24 * 60 * 60 * 1000, end };
}

export const useHistory = (coinCode: string, days: number | 'max', currency: Currency = 'usd') => {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coinCode) return;
    const controller = new AbortController();
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      setHistory([]);
      try {
        const { start, end } = daysToRange(days);
        const res = await fetch(`${LCW_BASE}/coins/single/history`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': API_KEY,
          },
          body: JSON.stringify({
            currency: currency.toUpperCase(),
            code: coinCode,
            start,
            end,
            meta: false,
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const desc = body?.error?.description ?? '';
          if (res.status === 429) throw new Error('Rate limited – please wait a moment and try again.');
          if (res.status === 401) throw new Error('Live Coin Watch API key is invalid.');
          throw new Error(`Live Coin Watch API error (${res.status}). ${desc}`);
        }
        const data = await res.json();
        if (cancelled) return;
        const points: HistoryPoint[] = (data.history as { date: number; rate: number }[]).map(
          ({ date, rate }) => ({ timestamp: date, price: rate })
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
  }, [coinCode, days, currency]);

  return { history, loading, error };
};

