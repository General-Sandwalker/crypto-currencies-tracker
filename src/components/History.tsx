import { useState, useMemo, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { ChevronDown, TrendingUp, TrendingDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { Coin, Currency } from '../types/crypto';
import { useHistory } from '../hooks/useHistory';
import { formatPrice, formatDate, formatPercent } from '../utils/format';

const RANGES: { label: string; days: number | 'max' }[] = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'All', days: 'max' },
];

interface HistoryProps {
  coins: Coin[];
  currency: Currency;
  initialCoinId?: string;
  error?: string | null;
  refetch?: () => void;
}

// Custom tooltip
const CustomTooltip = ({
  active, payload, label, currency, days,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: number;
  currency: Currency;
  days: number | 'max';
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/40 dark:border-white/10 shadow-xl text-xs">
      <p className="text-slate-500 dark:text-slate-400 mb-1">{label !== undefined ? formatDate(label, days) : ''}</p>
      <p className="font-bold text-slate-900 dark:text-white">{formatPrice(payload[0].value, currency)}</p>
    </div>
  );
};

export default function History({ coins, currency, initialCoinId = 'BTC', error: globalError, refetch }: HistoryProps) {
  const [coinId, setCoinId] = useState(initialCoinId);
  const [days, setDays] = useState<number | 'max'>(7);

  // Sync when navigated via onSelectCoin from Dashboard
  useEffect(() => {
    setCoinId(initialCoinId);
  }, [initialCoinId]);

  const { history, loading, error } = useHistory(coinId, days, currency);

  const selectedCoin = useMemo(() => coins.find(c => c.code === coinId), [coins, coinId]);

  const chartData = useMemo(
    () => history.map(p => ({ timestamp: p.timestamp, price: p.price })),
    [history]
  );

  const stats = useMemo(() => {
    if (!history.length) return null;
    const prices = history.map(p => p.price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const open = prices[0];
    const close = prices[prices.length - 1];
    const change = ((close - open) / open) * 100;
    return { high, low, open, close, change };
  }, [history]);

  const isUp = stats ? stats.change >= 0 : true;
  const strokeColor = isUp ? '#10b981' : '#f43f5e';

  return (
    <div className="space-y-5">
      {/* Global API error banner */}
      {globalError && coins.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="text-sm flex-1">{globalError}</span>
          {refetch && (
            <button onClick={refetch} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 transition-colors">
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Coin selector */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <select
            value={coinId}
            onChange={e => setCoinId(e.target.value)}
            className="w-full appearance-none pl-10 pr-8 py-2.5 rounded-xl text-sm font-semibold
              bg-white/70 dark:bg-slate-800 border border-white/30 dark:border-white/[0.08]
              text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/40
              backdrop-blur-sm transition-all cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
          >
            {coins.map(c => (
              <option key={c.code} value={c.code} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
                {c.name} ({c.symbol.toUpperCase()})
              </option>
            ))}
          </select>
          {selectedCoin && (
            <img
              src={selectedCoin.png64}
              alt={selectedCoin.name}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full pointer-events-none"
            />
          )}
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Range tabs */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/[0.04] rounded-xl p-1">
          {RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${days === r.days
                  ? 'bg-white dark:bg-white/[0.08] text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coin header */}
      {selectedCoin && (
        <div className="flex items-center gap-4">
          <img src={selectedCoin.png64} alt={selectedCoin.name} className="w-12 h-12 rounded-full" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedCoin.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-slate-500 dark:text-slate-400 uppercase">{selectedCoin.symbol}</span>
              {stats && (
                <span className={`flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {formatPercent(stats.change)}
                </span>
              )}
            </div>
          </div>
          {stats && (
            <p className="ml-auto text-3xl font-bold text-slate-900 dark:text-white">
              {formatPrice(stats.close, currency)}
            </p>
          )}
        </div>
      )}

      {/* Stats row */}
      {stats && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open', value: formatPrice(stats.open, currency) },
            { label: 'Close', value: formatPrice(stats.close, currency) },
            { label: `High (${typeof days === 'number' ? days + 'd' : 'All'})`, value: formatPrice(stats.high, currency), highlight: 'emerald' },
            { label: `Low (${typeof days === 'number' ? days + 'd' : 'All'})`, value: formatPrice(stats.low, currency), highlight: 'rose' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl p-4 backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-white/30 dark:border-white/[0.06]"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
              <p className={`text-base font-bold ${
                s.highlight === 'emerald'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : s.highlight === 'rose'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-white'
              }`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-3xl p-5 pt-6 backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-white/30 dark:border-white/[0.07] shadow-xl shadow-black/5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-72 gap-4">
            <Loader2 className="text-emerald-500 animate-spin" size={32} />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading history…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-72 gap-4">
            <AlertCircle className="text-rose-500" size={32} />
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center max-w-xs">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.12)"
                horizontal vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={ts => formatDate(ts, days)}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis
                tickFormatter={v => formatPrice(v, currency)}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                width={80}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={props => (
                  <CustomTooltip
                    active={props.active}
                    payload={props.payload as { value: number }[]}
                    label={props.label as number}
                    currency={currency}
                    days={days}
                  />
                )}
              />
              {stats && (
                <ReferenceLine
                  y={stats.open}
                  stroke="rgba(148,163,184,0.3)"
                  strokeDasharray="4 4"
                />
              )}
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill="url(#histGrad)"
                dot={false}
                activeDot={{ r: 4, fill: strokeColor, stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Additional info */}
      {selectedCoin && !loading && (
        <div className="rounded-3xl p-5 backdrop-blur-xl bg-white/60 dark:bg-white/[0.03] border border-white/30 dark:border-white/[0.07]">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            {selectedCoin.name} — Market Details
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
            {[
              { label: 'Market Cap Rank', value: `#${selectedCoin.rank}` },
              { label: 'All-Time High (USD)', value: formatPrice(selectedCoin.allTimeHighUSD, 'usd') },
              { label: 'Circulating Supply', value: selectedCoin.circulatingSupply?.toLocaleString() ?? '—' },
              { label: 'Total Supply', value: selectedCoin.totalSupply?.toLocaleString() ?? '∞' },
              { label: '24h Change', value: formatPercent((selectedCoin.delta.day - 1) * 100) },
              { label: '7d Change', value: formatPercent((selectedCoin.delta.week - 1) * 100) },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
