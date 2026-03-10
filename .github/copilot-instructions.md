# CryptoAero — Copilot Instructions

## Project Overview
A React + Vite + TailwindCSS cryptocurrency tracker dashboard hosted on GitHub Pages.

## Tech Stack
- **React 19** with TypeScript (strict, verbatimModuleSyntax enabled)
- **Vite 7** with `@tailwindcss/vite` plugin
- **TailwindCSS v4** — CSS-first config via `src/index.css`, dark mode via `@custom-variant dark (&:is(.dark *))`
- **Recharts** for price charts and sparklines
- **Lucide React** for icons
- **Live Coin Watch API** — requires `VITE_LCW_API_KEY` env var (free key at livecoinwatch.com/tools/api)

## Key Conventions
- Always use `import type` for TypeScript types (verbatimModuleSyntax)
- Dark mode toggled via `.dark` class on `<html>` element
- Design: glassmorphism + aerogel/nature theme — frosted glass cards, emerald/teal/cyan palette
- All price/number formatting goes through `src/utils/format.ts`
- API hooks in `src/hooks/` handle fetch, loading, and error state
- `base: './'` in `vite.config.ts` ensures GitHub Pages compatibility

## Deployment
- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Manual: `npm run deploy` (uses gh-pages to push dist/ to gh-pages branch)
