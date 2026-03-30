# Pokémon Type Weakness Calculator

A Pokémon type matchup tool with a built-in Pokédex browser and team builder. Select 1–2 types to see combined weaknesses, resistances, and immunities (Gen VI+ type chart), browse every Pokémon, and build a team with defensive coverage analysis.

## Features

- **Type Calculator** — select up to 2 types, see 4×/2× weaknesses, resistances, and immunities
- **Pokémon Browser** — browse all Pokémon with search, sort, generation filter, and pagination
- **Detail Panel** — click any Pokémon for stats, abilities, evolution chains, and type pills
- **Team Builder** — build a 6-slot team, view defensive coverage overlay, get type suggestions
- **Offline Data** — all Pokémon data embedded from PokeAPI CSVs, no external API calls at runtime

## Tech Stack

- **Backend**: Go (stdlib + embedded CSV data)
- **Frontend**: React + TypeScript (Vite)
- **Desktop**: Wails v2
- **Web**: Docker

## Running

### Desktop (Wails)

Requires [Wails v2](https://wails.io/docs/gettingstarted/installation) and its system dependencies.

```bash
# Dev mode (hot reload)
wails dev -tags webkit2_41

# Build standalone binary
wails build -tags webkit2_41
./build/bin/weakness-calculator
```

### Web (Docker)

```bash
docker compose up --build
# Open http://localhost:8080
```

### Web (Manual)

```bash
# Terminal 1: Go API server
go run . --web

# Terminal 2: Vite dev server (proxies API to :8080)
cd frontend && npm run dev
# Open http://localhost:5173
```

## Testing

```bash
go test ./backend/...
```
