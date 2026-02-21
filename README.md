# 🌿 CryptoAero — Crypto Tracker

A modern, aerogel/nature-inspired cryptocurrency dashboard built with React + Vite + TailwindCSS.

**Live data · Dark & Light theme · Real-time prices · Converter · Price history**

---

## Features

- **Dashboard** — Live prices for 50 coins (CoinGecko), sortable grid with 7-day sparklines, 24h heatmap, market stats
- **Converter** — Convert any coin to any other with live rates, quick-amount buttons, cross-rate table
- **History** — Interactive area chart with 1D / 7D / 1M / 3M / 1Y / All time ranges, high/low/open/close stats
- **Multi-currency** — USD, EUR, GBP, JPY, BTC, ETH display modes
- **Themes** — Dark & light mode, persisted in localStorage, no flash on load
- **Auto-refresh** — Prices update every 60 seconds

## Design

Aerogel / nature-inspired glassmorphism:
- Frosted glass cards with `backdrop-blur`
- Organic gradient blobs in the background
- Emerald, teal, and cyan accent palette
- Smooth transitions and micro-animations

## Tech Stack

| Tool | Purpose |
|------|---------|
| [React 19](https://react.dev) | UI framework |
| [Vite 7](https://vite.dev) | Build tool |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [TailwindCSS v4](https://tailwindcss.com) | Styling |
| [Recharts](https://recharts.org) | Charts |
| [Lucide React](https://lucide.dev) | Icons |
| [CoinGecko API](https://coingecko.com/api) | Market data (free, no key required) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploy to GitHub Pages

### Option A — GitHub Actions (recommended)

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. Push to `main` — the workflow at `.github/workflows/deploy.yml` handles the rest automatically

### Option B — Manual deploy with gh-pages

```bash
npm run deploy
```

> This runs `npm run build` then pushes the `dist/` folder to the `gh-pages` branch.
> Set GitHub Pages source to the `gh-pages` branch in repo settings.

## Project Structure

```
src/
├── components/
│   ├── CoinCard.tsx      # Individual coin card with sparkline
│   ├── Converter.tsx     # Currency converter
│   ├── Dashboard.tsx     # Main price grid + stats
│   ├── History.tsx       # Price history chart
│   ├── Navbar.tsx        # Top navigation
│   └── Sparkline.tsx     # Mini 7d sparkline chart
├── contexts/
│   └── ThemeContext.tsx  # Dark/light theme state
├── hooks/
│   ├── useCrypto.ts      # Fetch + auto-refresh market data
│   └── useHistory.ts     # Fetch historical price data
├── types/
│   └── crypto.ts         # TypeScript types & constants
└── utils/
    └── format.ts         # Price/number formatting helpers
```

## Notes

- Data is sourced from CoinGecko's free public API — no API key required
- The free tier is rate-limited (~30 req/min); the app fetches once on load then every 60s
- This is for informational purposes only — **not financial advice**


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## License is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute!