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
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-cyan-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30">

      {/* Decorative blobs */}
      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-400/10 dark:bg-emerald-600/5 blur-3xl" />
        <div className="absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full bg-teal-400/10 dark:bg-teal-600/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-400/10 dark:bg-cyan-600/5 blur-3xl" />
      </div>

      <Navbar
        view={view}
        setView={setView}
        currency={currency}
        setCurrency={setCurrency}
        lastUpdated={lastUpdated}
        refetch={refetch}
      />

      <main className="container mx-auto px-4 py-7 max-w-7xl">
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
          <History coins={coins} currency={currency} initialCoinId={selectedCoinId} error={error} refetch={refetch} />
        )}
      </main>

      <footer className="text-center py-8 text-xs text-slate-400 dark:text-slate-600">
        Data powered by <a href="https://www.livecoinwatch.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300 transition-colors">Live Coin Watch</a> &bull; Prices update every 60s &bull; Not financial advice
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
