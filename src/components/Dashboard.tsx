import { useState, useMemo } from 'react';
import { Search, TrendingUp, BarChart2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import type { Coin, Currency } from '../types/crypto';
import { formatMarketCap, formatPercent } from '../utils/format';
import CoinCard from './CoinCard';

type SortKey = 'rank' | 'price' | 'change' | 'marketcap' | 'volume';
type SortDir = 'asc' | 'desc';

interface DashboardProps {
  coins: Coin[];
  loading: boolean;
  error: string | null;
  currency: Currency;
  onSelectCoin?: (coin: Coin) => void;
  refetch?: () => void;
}

export default function Dashboard({ coins, loading, error, currency, onSelectCoin, refetch }: DashboardProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = coins.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.symbol.toLowerCase().includes(query.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case 'rank': diff = a.rank - b.rank; break;
        case 'price': diff = a.rate - b.rate; break;
        case 'change': diff = a.delta.day - b.delta.day; break;
        case 'marketcap': diff = a.cap - b.cap; break;
        case 'volume': diff = a.volume - b.volume; break;
      }
      return sortDir === 'asc' ? diff : -diff;
    });
    return list;
  }, [coins, query, sortKey, sortDir]);

  // Global stats
  const totalMcap = useMemo(() => coins.reduce((s, c) => s + c.cap, 0), [coins]);
  const totalVol = useMemo(() => coins.reduce((s, c) => s + c.volume, 0), [coins]);
  const gainers = useMemo(() => coins.filter(c => c.delta.day > 1).length, [coins]);
  const losers = useMemo(() => coins.filter(c => c.delta.day < 1).length, [coins]);
  const btc = useMemo(() => coins.find(c => c.code === 'BTC'), [coins]);
  const btcDom = btc && totalMcap > 0 ? ((btc.cap / totalMcap) * 100).toFixed(1) : '--';

  const SortBtn = ({ label, id }: { label: string; id: SortKey }) => (
    <button
      onClick={() => handleSort(id)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
        ${sortKey === id
          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
          : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/[0.05]'
        }`}
    >
      {label} {sortKey === id ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <AlertCircle className="text-rose-500" size={28} />
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-center max-w-sm">{error}</p>
        {refetch && (
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
          >
            <RefreshCw size={14} /> Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Market Cap',
            value: formatMarketCap(totalMcap, currency),
            icon: <BarChart2 size={16} className="text-emerald-500" />,
          },
          {
            label: '24h Volume',
            value: formatMarketCap(totalVol, currency),
            icon: <BarChart2 size={16} className="text-teal-500" />,
          },
          {
            label: 'Gainers / Losers',
            value: `${gainers} / ${losers}`,
            icon: <TrendingUp size={16} className="text-emerald-400" />,
          },
          {
            label: 'BTC Dominance',
            value: `${btcDom}%`,
            icon: <BarChart2 size={16} className="text-amber-500" />,
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-white/30 dark:border-white/[0.06]"
          >
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{loading ? '—' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search coins…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white/70 dark:bg-white/[0.04] border border-white/30 dark:border-white/[0.07] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/40 backdrop-blur-sm transition-all"
          />
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Sort:</span>
          <SortBtn label="Rank" id="rank" />
          <SortBtn label="Price" id="price" />
          <SortBtn label="24h %" id="change" />
          <SortBtn label="MCap" id="marketcap" />
          <SortBtn label="Volume" id="volume" />
        </div>
      </div>

      {/* Coin grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Loader2 className="text-emerald-500 animate-spin" size={28} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Fetching market data…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(coin => (
            <CoinCard
              key={coin.code}
              coin={coin}
              currency={currency}
              onClick={() => onSelectCoin?.(coin)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 dark:text-slate-500">
                No coins match "{query}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* 24h heatmap summary row */}
      {!loading && coins.length > 0 && (
        <div className="rounded-2xl p-4 backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-white/30 dark:border-white/[0.06]">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">Top 20 — 24h Change Heatmap</p>
          <div className="flex flex-wrap gap-2">
            {coins.slice(0, 20).map(coin => {
              const pct = (coin.delta.day - 1) * 100;
              const intensity = Math.min(Math.abs(pct) / 10, 1);
              const bg = pct >= 0
                ? `rgba(16,185,129,${0.15 + intensity * 0.45})`
                : `rgba(244,63,94,${0.15 + intensity * 0.45})`;
              const text = pct >= 0 ? '#059669' : '#e11d48';
              return (
                <div
                  key={coin.code}
                  title={coin.name}
                  style={{ background: bg, color: text }}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-default select-none transition-transform hover:scale-105"
                >
                  <span className="font-bold uppercase">{coin.symbol}</span>
                  <span className="ml-1 opacity-80">{formatPercent(pct)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
