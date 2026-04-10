# aron.net — Desktop App

Wails v2 desktop application. Uses PokeAPI for up-to-date Pokémon data with embedded CSV files as an offline fallback.

## Prerequisites

- [Go 1.25+](https://go.dev/dl/)
- [Node.js 22+](https://nodejs.org/)
- [Wails v2](https://wails.io/docs/gettingstarted/installation) and its system dependencies

### Linux

```bash
sudo apt-get install libgtk-3-dev libwebkit2gtk-4.1-dev
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### macOS / Windows

See [Wails installation docs](https://wails.io/docs/gettingstarted/installation).

## Running

```bash
# Dev mode (hot reload)
wails dev -tags webkit2_41

# Build standalone binary
wails build -tags webkit2_41
./build/bin/aron.net
```

## How It Works

- **Type calculations** run locally in the browser (same `typeEngine.ts` as the PWA)
- **Pokémon data** tries PokeAPI first for up-to-date data
- If offline, falls back to the Go backend which serves data from embedded CSV files (`backend/data/csv/`)
- The fallback is automatic — no user action needed

## Releases

The `release.yml` GitHub Action builds for Linux, Windows, and macOS when a version tag is pushed:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Binaries are published as GitHub Releases.
