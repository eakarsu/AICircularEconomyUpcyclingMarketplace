#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$ROOT/.env" ] || { echo 'Missing .env; copy .env.example and configure it.' >&2; exit 1; }
[ -d "$ROOT/backend/node_modules" ] && [ -d "$ROOT/frontend/node_modules" ] || { echo 'Dependencies absent; run scripts/bootstrap.sh.' >&2; exit 1; }
set -a; . "$ROOT/.env"; set +a
: "${BACKEND_PORT:?BACKEND_PORT is required}" "${FRONTEND_PORT:?FRONTEND_PORT is required}"
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do if command -v lsof >/dev/null && lsof -ti ":$port" >/dev/null 2>&1; then echo "Port $port is already in use; refusing to stop another process." >&2; exit 1; fi; done
(cd "$ROOT/backend" && npm start) & BACKEND_PID=$!
(cd "$ROOT/frontend" && npm run dev -- --port "$FRONTEND_PORT" --strictPort) & FRONTEND_PID=$!
cleanup(){ kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
wait "$BACKEND_PID" "$FRONTEND_PID"
