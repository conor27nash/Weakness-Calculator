# aron.net — Full-Stack Server

Go HTTP server serving both the API and frontend. For future self-hosted deployment.

## Status

This version is planned for future use. It uses the same Go backend as the desktop app but runs as a standalone HTTP server, suitable for hosting on Render, Fly.io, or any Docker-compatible platform.

## Running

```bash
# Build the frontend first
cd ../pwa && npm install && npm run build
cp -r dist ../fullstack/frontend/dist

# Run the server
cd ../fullstack
go run .
# Open http://localhost:8080
```

## Docker

```bash
# Note: Dockerfile references ../pwa for the frontend build
# Build from the repo root:
docker build -f fullstack/Dockerfile -t aron-net .
docker run -p 8080:8080 aron-net
```

## How It Works

- The Go server embeds the built frontend (`frontend/dist/`) and serves it at `/`
- API endpoints (`/defend`, `/pokemon`, `/pokemon-detail`, `/team/analyze`, `/team/suggest`) serve data from embedded CSV files
- Single binary deployment — no external dependencies at runtime
