import { useState } from 'react';
import { Search, BarChart2, TrendingUp, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import type { Coin, Currency } from '../types/crypto';
import { formatMarketCap, formatPercent } from '../utils/format';
import { useSearchCoins } from '../hooks/useSearchCoins';
import CoinCard from './CoinCard';

interface DashboardProps {
  coins: Coin[];        // featured 4
  loading: boolean;
  error: string | null;
  currency: Currency;
  onSelectCoin?: (coin: Coin) => void;
  refetch?: () => void;
}

export default function Dashboard({ coins, loading, error, currency, onSelectCoin, refetch }: DashboardProps) {
  const [query, setQuery] = useState('');
  const { triggerFetch, filter, loading: searchLoading } = useSearchCoins(currency);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) triggerFetch(); // lazy-load top 100 once on first keystroke
  };

  const searchResults = query.trim() ? filter(query) : [];
  const isSearching = query.trim().length > 0;

  // Stats from the 4 featured coins
  const totalMcap = coins.reduce((s, c) => s + (c.cap ?? 0), 0);
  const totalVol  = coins.reduce((s, c) => s + (c.volume ?? 0), 0);
  const gainers   = coins.filter(c => c.delta.day > 1).length;
  const losers    = coins.filter(c => c.delta.day < 1).length;
  const btc       = coins.find(c => c.code === 'BTC');
  const btcDom    = btc && totalMcap > 0 ? ((btc.cap / totalMcap) * 100).toFixed(1) : '--';

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
      {/* Market stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Featured MCap',    value: formatMarketCap(totalMcap, currency), icon: <BarChart2 size={16} className="text-emerald-500" /> },
          { label: '24h Volume',       value: formatMarketCap(totalVol, currency),  icon: <BarChart2 size={16} className="text-sky-500" /> },
          { label: 'Gainers / Losers', value: `${gainers} / ${losers}`,             icon: <TrendingUp size={16} className="text-lime-500" /> },
          { label: 'BTC Dominance',    value: `${btcDom}%`,                         icon: <BarChart2 size={16} className="text-amber-500" /> },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-3 sm:p-4 backdrop-blur-xl bg-white/65 dark:bg-white/[0.03] border border-white/40 dark:border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{stat.label}</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">{loading ? '—' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Featured coins */}
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Featured
        </p>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Loader2 className="text-emerald-500 animate-spin" size={28} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Fetching market data…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {coins.map(coin => (
              <CoinCard
                key={coin.code}
                coin={coin}
                currency={currency}
                onClick={() => onSelectCoin?.(coin)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Search all coins
        </p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Bitcoin, ETH, SOL…"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white/70 dark:bg-white/[0.04] border border-white/30 dark:border-white/[0.07] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/40 backdrop-blur-sm transition-all"
          />
        </div>

        {isSearching && (
          <div className="mt-3">
            {searchLoading ? (
              <div className="flex items-center gap-3 py-8 justify-center text-slate-400 dark:text-slate-500 text-sm">
                <Loader2 size={16} className="animate-spin text-emerald-500" /> Loading coin list…
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-2">
                  {searchResults.slice(0, 20).map(coin => (
                    <CoinCard
                      key={coin.code}
                      coin={coin}
                      currency={currency}
                      onClick={() => onSelectCoin?.(coin)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                No coins match "{query}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* 24h change bar — featured coins only */}
      {!loading && coins.length > 0 && !isSearching && (
        <div className="rounded-2xl p-4 backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-white/30 dark:border-white/[0.06]">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">Featured — 24h Change</p>
          <div className="flex flex-wrap gap-2">
            {coins.map(coin => {
              const pct = (coin.delta.day - 1) * 100;
              const intensity = Math.min(Math.abs(pct) / 10, 1);
              const bg   = pct >= 0 ? `rgba(16,185,129,${0.15 + intensity * 0.45})` : `rgba(244,63,94,${0.15 + intensity * 0.45})`;
              const text = pct >= 0 ? '#059669' : '#e11d48';
              return (
                <div
                  key={coin.code}
                  title={coin.name}
                  style={{ background: bg, color: text }}
                  className="rounded-lg px-3 py-2 text-sm font-semibold cursor-default select-none transition-transform hover:scale-105"
                >
                  <span className="font-bold">{coin.code}</span>
                  <span className="ml-2 opacity-80">{formatPercent(pct)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
