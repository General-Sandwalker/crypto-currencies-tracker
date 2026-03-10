import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeftRight, Search, Loader2, AlertCircle, RefreshCw, X } from 'lucide-react';
import type { Coin, Currency } from '../types/crypto';
import { formatPrice, formatPercent } from '../utils/format';
import { useSearchCoins } from '../hooks/useSearchCoins';

interface ConverterProps {
  coins: Coin[];       // featured 4 — available immediately
  loading: boolean;
  currency: Currency;
  error?: string | null;
  refetch?: () => void;
}

// Searchable coin picker — lazy-loads full list on first focus
function CoinSearchSelect({
  allCoins,
  value,
  onChange,
  onFocus,
  searchLoading,
  placeholder = 'Search coin…',
}: {
  allCoins: Coin[];
  value: string;
  onChange: (code: string) => void;
  onFocus: () => void;
  searchLoading: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = allCoins.find(c => c.code === value);

  const results = useMemo(() => {
    if (!query.trim()) return allCoins.slice(0, 20); // show top 20 when no query
    const q = query.toLowerCase();
    return allCoins.filter(c =>
      c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [allCoins, query]);

  // Close on outside click or scroll
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, []);

  const handleOpen = () => {
    onFocus();
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownStyle({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold
          bg-white/70 dark:bg-slate-800 border border-white/30 dark:border-white/[0.08]
          text-slate-900 dark:text-white hover:bg-white/90 dark:hover:bg-slate-700
          focus:outline-none focus:ring-2 focus:ring-emerald-500/40
          backdrop-blur-sm transition-all cursor-pointer"
      >
        {selected?.png64 && (
          <img src={selected.png64} alt={selected.code} className="w-6 h-6 rounded-full flex-shrink-0" />
        )}
        <span className="flex-1 text-left">
          {selected ? `${selected.name} (${selected.code})` : value}
        </span>
        <Search size={14} className="text-slate-400 flex-shrink-0" />
      </button>

      {/* Dropdown — fixed so it escapes any parent overflow/stacking context */}
      {open && (
        <div
          style={{ position: 'fixed', top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width, zIndex: 9999 }}
          className="rounded-2xl shadow-2xl
          bg-white dark:bg-slate-800 border border-white/40 dark:border-white/[0.08]
          overflow-hidden backdrop-blur-xl">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-white/[0.06]">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X size={13} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-56 overflow-y-auto py-1">
            {searchLoading && allCoins.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-slate-400">
                <Loader2 size={13} className="animate-spin text-emerald-500" /> Loading coins…
              </div>
            ) : results.length === 0 ? (
              <p className="px-3 py-3 text-xs text-slate-400">No coins found</p>
            ) : (
              results.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelect(c.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors
                    hover:bg-emerald-50 dark:hover:bg-emerald-500/10
                    ${c.code === value ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-800 dark:text-slate-200'}`}
                >
                  {c.png64 && <img src={c.png64} alt={c.code} className="w-5 h-5 rounded-full flex-shrink-0" />}
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-slate-400 font-mono">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Converter({ coins, loading, currency, error, refetch }: ConverterProps) {
  const [fromId, setFromId] = useState('BTC');
  const [toId, setToId] = useState('ETH');
  const [amount, setAmount] = useState('1');

  const { triggerFetch, allCoins, loading: searchLoading } = useSearchCoins(currency);

  // Merge featured 4 + full list (featured takes priority for up-to-date rates)
  const mergedCoins = useMemo(() => {
    const map = new Map<string, Coin>();
    allCoins.forEach(c => map.set(c.code, c));
    coins.forEach(c => map.set(c.code, c)); // featured overrides with live rates
    return [...map.values()];
  }, [coins, allCoins]);

  const fromCoin = useMemo(() => mergedCoins.find(c => c.code === fromId), [mergedCoins, fromId]);
  const toCoin   = useMemo(() => mergedCoins.find(c => c.code === toId),   [mergedCoins, toId]);

  const convertedAmount = useMemo(() => {
    if (!fromCoin || !toCoin || !amount || isNaN(Number(amount))) return null;
    return (Number(amount) * fromCoin.rate) / toCoin.rate;
  }, [fromCoin, toCoin, amount]);

  const fromValueInBase = useMemo(() => {
    if (!fromCoin || !amount || isNaN(Number(amount))) return null;
    return Number(amount) * fromCoin.rate;
  }, [fromCoin, amount]);

  const handleSwap = () => {
    const tmp = fromId;
    setFromId(toId);
    setToId(tmp);
  };

  // Cross rates: other coins from merged list vs fromCoin
  const crossRates = useMemo(() => {
    if (!fromCoin) return [];
    return mergedCoins
      .filter(c => c.code !== fromId && c.rate > 0)
      .slice(0, 5)
      .map(c => ({ coin: c, rate: fromCoin.rate / c.rate }));
  }, [mergedCoins, fromCoin, fromId]);

  if (error && coins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <AlertCircle className="text-rose-500" size={28} />
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-center max-w-sm">{error}</p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="text-emerald-500 animate-spin" size={32} />
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading market data…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crypto Converter</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live prices via Live Coin Watch</p>
      </div>

      {/* Converter card */}
      <div className="rounded-3xl p-6 backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-white/30 dark:border-white/[0.07] shadow-xl shadow-black/5 space-y-4">
        {/* From */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            From
          </label>
          <CoinSearchSelect
            allCoins={mergedCoins}
            value={fromId}
            onChange={setFromId}
            onFocus={triggerFetch}
            searchLoading={searchLoading}
            placeholder="Search by name or ticker…"
          />
          <input
            type="number"
            value={amount}
            min="0"
            step="any"
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full px-4 py-3 rounded-2xl text-2xl font-bold
              bg-white/70 dark:bg-white/[0.05] border border-white/30 dark:border-white/[0.08]
              text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/40
              placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all"
          />
          {fromCoin && fromValueInBase !== null && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
              <span>1 {fromCoin.code} = {formatPrice(fromCoin.rate, currency)}</span>
              <span className={`font-semibold ${(fromCoin.delta.day - 1) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatPercent((fromCoin.delta.day - 1) * 100)} 24h
              </span>
            </p>
          )}
        </div>

        {/* Swap */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="w-10 h-10 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/20
              flex items-center justify-center text-emerald-600 dark:text-emerald-400
              hover:bg-emerald-500/25 hover:rotate-180 transition-all duration-300"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            To
          </label>
          <CoinSearchSelect
            allCoins={mergedCoins}
            value={toId}
            onChange={setToId}
            onFocus={triggerFetch}
            searchLoading={searchLoading}
            placeholder="Search by name or ticker…"
          />
          <div className="w-full px-4 py-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/[0.05] border border-emerald-500/20">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {convertedAmount !== null
                ? convertedAmount < 0.0001
                  ? convertedAmount.toExponential(6)
                  : convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })
                : '—'}
            </p>
            {toCoin && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {toCoin.code} · {formatPrice(toCoin.rate, currency)} each
              </p>
            )}
          </div>
          {toCoin && (
            <p className={`text-xs px-1 font-semibold ${(toCoin.delta.day - 1) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatPercent((toCoin.delta.day - 1) * 100)} 24h
            </p>
          )}
        </div>
      </div>

      {/* Cross rates */}
      {crossRates.length > 0 && fromCoin && (
        <div className="rounded-3xl p-5 backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-white/30 dark:border-white/[0.07]">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            1 {fromCoin.code} equals
          </p>
          <div className="space-y-3">
            {crossRates.map(({ coin, rate }) => (
              <div key={coin.code} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {coin.png64 && <img src={coin.png64} alt={coin.name} className="w-6 h-6 rounded-full" />}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{coin.name}</span>
                  <span className="text-xs text-slate-400 font-mono">{coin.code}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {rate < 0.0001
                    ? rate.toExponential(4)
                    : rate < 1
                    ? rate.toFixed(6)
                    : rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick amounts */}
      {fromCoin && (
        <div className="rounded-3xl p-5 backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-white/30 dark:border-white/[0.07]">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Quick amounts
          </p>
          <div className="flex flex-wrap gap-2">
            {[0.001, 0.01, 0.1, 0.5, 1, 5, 10, 100].map(v => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                  ${Number(amount) === v
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-black/5 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/[0.08] border border-transparent'
                  }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
