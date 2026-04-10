# aron.net — PWA

Lightweight progressive web app version. Runs entirely in the browser with no backend — type calculations run locally and Pokémon data comes from PokeAPI.

## Running

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Building

```bash
npm run build
```

Output is in `dist/`. Can be served by any static file server or deployed to GitHub Pages.

## How It Works

- **Type calculations** (weaknesses, team analysis, suggestions) run in the browser via `src/lib/typeEngine.ts` — a TypeScript port of the Go type chart
- **Pokémon data** (list, detail, evolutions) is fetched from [PokeAPI](https://pokeapi.co) via `src/lib/pokeapiClient.ts`
- The full Pokémon list is built by fetching all 18 type endpoints in parallel and cached in localStorage for 24 hours
- Individual Pokémon detail is cached in memory for the session
- A **service worker** (`public/sw.js`) caches sprites, app shell, and PokeAPI responses for offline use

## Installing on Mobile

Visit the deployed URL in Chrome (Android) or Safari (iOS):
- **Android**: tap the "Add to Home screen" banner or Menu → "Install app"
- **iOS**: tap Share → "Add to Home Screen"

## Deployment

The `deploy-pwa.yml` GitHub Action automatically builds and deploys to GitHub Pages on push to `main`.
