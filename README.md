# Pokémon Type Weakness Calculator

Select 1–2 Pokémon types and see combined weaknesses, resistances, and immunities using the Gen VI+ type chart. Supports both **defending** (what hits you hard) and **attacking** (what you're strong/weak against) modes.

## Tech Stack

- **Backend**: Go (stdlib)
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
# Backend
go test ./backend/...

# Frontend (not yet implemented)
cd frontend && npm test
```
