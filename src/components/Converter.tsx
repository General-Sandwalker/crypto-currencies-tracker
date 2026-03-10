import { useState, useMemo } from 'react';
import { ArrowLeftRight, ChevronDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { Coin, Currency } from '../types/crypto';
import { formatPrice, formatPercent } from '../utils/format';

interface ConverterProps {
  coins: Coin[];
  loading: boolean;
  currency: Currency;
  error?: string | null;
  refetch?: () => void;
}

function CoinSelect({
  coins,
  value,
  onChange,
}: {
  coins: Coin[];
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = coins.find(c => c.code === value);
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none pl-12 pr-10 py-3 rounded-2xl text-sm font-semibold
          bg-white/70 dark:bg-slate-800 border border-white/30 dark:border-white/[0.08]
          text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/40
          backdrop-blur-sm transition-all cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
      >
        {coins.map(c => (
          <option key={c.code} value={c.code} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
            {c.name} ({c.code})
          </option>
        ))}
      </select>
      {selected && (
        <img
          src={selected.png64}
          alt={selected.name}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full pointer-events-none"
        />
      )}
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  );
}

export default function Converter({ coins, loading, currency, error, refetch }: ConverterProps) {
  const [fromId, setFromId] = useState('BTC');
  const [toId, setToId] = useState('ETH');
  const [amount, setAmount] = useState('1');

  const fromCoin = useMemo(() => coins.find(c => c.code === fromId), [coins, fromId]);
  const toCoin = useMemo(() => coins.find(c => c.code === toId), [coins, toId]);

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

  // Cross rates vs common stable pairs
  const crossRates = useMemo(() => {
    if (!fromCoin) return [];
    return coins
      .filter(c => c.code !== fromId)
      .slice(0, 5)
      .map(c => ({
        coin: c,
        rate: fromCoin.rate / c.rate,
      }));
  }, [coins, fromCoin, fromId]);

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
          <CoinSelect coins={coins} value={fromId} onChange={setFromId} />
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
              <span>
                1 {fromCoin.code} = {formatPrice(fromCoin.rate, currency)}
              </span>
              <span className={`font-semibold ${(fromCoin.delta.day - 1) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatPercent((fromCoin.delta.day - 1) * 100)} 24h
              </span>
            </p>
          )}
        </div>

        {/* Swap button */}
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
          <CoinSelect coins={coins} value={toId} onChange={setToId} />
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
                  <img src={coin.png64} alt={coin.name} className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{coin.name}</span>
                  <span className="text-xs text-slate-400 uppercase">{coin.code}</span>
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

      {/* Quick convert buttons */}
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
