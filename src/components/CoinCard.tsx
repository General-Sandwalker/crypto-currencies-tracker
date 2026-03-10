import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Coin, Currency } from '../types/crypto';
import { formatPrice, formatMarketCap, formatPercent } from '../utils/format';
import Sparkline from './Sparkline';

interface CoinCardProps {
  coin: Coin;
  currency: Currency;
  onClick?: () => void;
  selected?: boolean;
}

export default function CoinCard({ coin, currency, onClick, selected }: CoinCardProps) {
  const change24h = (coin.delta.day - 1) * 100;
  const isUp = change24h >= 0;

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-2xl p-4 transition-all duration-300 cursor-pointer
        border backdrop-blur-xl
        ${selected
          ? 'border-emerald-400/50 dark:border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/[0.07] shadow-lg shadow-emerald-500/10'
          : 'border-white/20 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.06] hover:border-white/40 dark:hover:border-white/10 hover:shadow-lg hover:shadow-black/5'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <img
            src={coin.png64}
            alt={coin.name}
            className="w-9 h-9 rounded-full"
            loading="lazy"
          />
          <span className="absolute -bottom-1 -right-1 text-[9px] font-bold bg-slate-800 dark:bg-slate-700 text-slate-300 rounded-full px-1 leading-4 border border-white/10">
            #{coin.rank}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate leading-tight">
            {coin.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {coin.symbol}
          </p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          isUp
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
        }`}>
          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {formatPercent(change24h)}
        </div>
      </div>

      {/* Sparkline */}
      <div className="my-2 -mx-1">
        <Sparkline data={[]} positive={isUp} height={44} />
      </div>

      {/* Price & stats */}
      <div className="mt-2">
        <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {formatPrice(coin.rate, currency)}
        </p>
        <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span>MCap {formatMarketCap(coin.cap, currency)}</span>
          <span>Vol {formatMarketCap(coin.volume, currency)}</span>
        </div>
      </div>
    </button>
  );
}
