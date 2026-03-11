import type { ReactNode } from 'react';
import { Sun, Moon, RefreshCw, Zap, LayoutDashboard, ArrowLeftRight, LineChart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { Currency } from '../types/crypto';
import { CURRENCY_LABELS } from '../types/crypto';

type View = 'dashboard' | 'converter' | 'history';

interface NavbarProps {
  view: View;
  setView: (v: View) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  lastUpdated: Date | null;
  refetch: () => void;
}

const NAV_ITEMS: { id: View; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
  { id: 'converter', label: 'Converter', icon: <ArrowLeftRight size={15} /> },
  { id: 'history', label: 'History', icon: <LineChart size={15} /> },
];

const CURRENCIES: Currency[] = ['usd', 'eur', 'gbp', 'jpy', 'btc', 'eth'];

export default function Navbar({ view, setView, currency, setCurrency, lastUpdated, refetch }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-emerald-900/30 backdrop-blur-2xl bg-white/75 dark:bg-[#030d07]/80 shadow-sm shadow-black/5">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 mr-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Zap size={15} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm hidden sm:block tracking-tight">
              CryptoAero
            </span>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-0.5 bg-black/5 dark:bg-white/[0.04] rounded-xl p-1 flex-shrink-0">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${view === item.id
                    ? 'bg-white dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-emerald-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Currency selector */}
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value as Currency)}
            className="text-xs font-semibold bg-black/5 dark:bg-emerald-950/50 border border-black/10 dark:border-emerald-800/40 rounded-lg px-2 py-1.5 text-slate-700 dark:text-emerald-300 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all [color-scheme:light] dark:[color-scheme:dark]"
          >
            {CURRENCIES.map(c => (
              <option key={c} value={c} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">{CURRENCY_LABELS[c]}</option>
            ))}
          </select>

          {/* Last updated + refresh */}
          {lastUpdated && (
            <button
              onClick={refetch}
              title="Refresh"
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
            >
              <RefreshCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden md:inline">
                {lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/[0.09] text-slate-700 dark:text-slate-300 transition-all duration-200"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
