import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Converter from './components/Converter';
import History from './components/History';
import { useCrypto } from './hooks/useCrypto';
import type { Currency } from './types/crypto';

type View = 'dashboard' | 'converter' | 'history';

function AppContent() {
  const [view, setView] = useState<View>('dashboard');
  const [currency, setCurrency] = useState<Currency>('usd');
  const [selectedCoinId, setSelectedCoinId] = useState<string>('BTC');
  const { coins, loading, error, lastUpdated, refetch } = useCrypto(currency);

  const handleSelectCoin = (coinId: string) => {
    setSelectedCoinId(coinId);
    setView('history');
  };

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-green-50 via-emerald-50/60 to-sky-100/60 dark:from-[#030d07] dark:via-slate-900 dark:to-[#051a10]">

      {/* Decorative clean-energy blobs */}
      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Forest green — nature/wind */}
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full bg-emerald-400/12 dark:bg-emerald-500/6 blur-[120px]" />
        {/* Solar amber — sunlight */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-amber-300/8 dark:bg-amber-500/4 blur-[100px]" />
        {/* Sky blue — clean air / wind power */}
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-sky-400/10 dark:bg-sky-600/5 blur-[110px]" />
        {/* Lime — solar ground */}
        <div className="absolute -bottom-20 left-1/4 w-[450px] h-[450px] rounded-full bg-lime-400/8 dark:bg-lime-600/4 blur-[100px]" />
      </div>

      <Navbar
        view={view}
        setView={setView}
        currency={currency}
        setCurrency={setCurrency}
        lastUpdated={lastUpdated}
        refetch={refetch}
      />

      <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-7 max-w-7xl">
        {view === 'dashboard' && (
          <Dashboard
            coins={coins}
            loading={loading}
            error={error}
            currency={currency}
            refetch={refetch}
            onSelectCoin={coin => handleSelectCoin(coin.code)}
          />
        )}
        {view === 'converter' && (
          <Converter coins={coins} loading={loading} currency={currency} error={error} refetch={refetch} />
        )}
        {view === 'history' && (
          <History key={selectedCoinId} coins={coins} currency={currency} initialCoinId={selectedCoinId} error={error} refetch={refetch} />
        )}
      </main>

      <footer className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
        Data by <a href="https://www.livecoinwatch.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Live Coin Watch</a> &bull; Refreshes every 60 s &bull; Not financial advice
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
