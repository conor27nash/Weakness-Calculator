# aron.net — Pokémon Type Calculator

A Pokémon type matchup tool with a built-in Pokédex browser and team builder. Select 1–2 types to see combined weaknesses, resistances, and immunities (Gen VI+ type chart), browse every Pokémon, and build a team with defensive coverage analysis.

## Features

- **Type Calculator** — select up to 2 types, see 4×/2× weaknesses, resistances, and immunities
- **Pokémon Browser** — browse all Pokémon with search, sort, generation filter, and pagination
- **Detail Panel** — click any Pokémon for stats, abilities, evolution chains, and type badges
- **Team Builder** — build a 6-slot team, view defensive coverage overlay, get type suggestions
- **Mobile Friendly** — responsive layout with touch-friendly controls, installable as a PWA

## Project Structure

This is a monorepo with three versions of the app:

| Directory | Description | Status |
|-----------|-------------|--------|
| [`pwa/`](pwa/) | Lightweight PWA — frontend only, calls PokeAPI directly. Deployable on GitHub Pages. | Active |
| [`desktop/`](desktop/) | Wails v2 desktop app — PokeAPI with offline CSV fallback. | Active |
| [`fullstack/`](fullstack/) | Go HTTP server + Docker — for future self-hosted deployment. | Planned |

## Tech Stack

- **Frontend**: React + TypeScript (Vite)
- **Type Engine**: TypeScript port of the Gen VI+ type chart (runs in-browser, no API needed)
- **Pokémon Data**: PokeAPI (live), with embedded CSV fallback for desktop offline use
- **Desktop**: Wails v2 (Go)
- **PWA**: Service worker + web manifest, installable on Android/iOS

## Quick Start

### PWA (no backend needed)

```bash
cd pwa
npm install
npm run dev
# Open http://localhost:5173
```

### Desktop

See [desktop/README.md](desktop/README.md) for setup instructions.

### Full-Stack (future)

See [fullstack/README.md](fullstack/README.md).
