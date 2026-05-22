#!/bin/bash
set -e
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$PROJECT_DIR/.env" ]; then export $(grep -v '^#' "$PROJECT_DIR/.env" | grep -v '^$' | xargs); fi
echo "Starting AICircularEconomyUpcyclingMarketplace backend on port ${BACKEND_PORT:-4050}..."
cd "$PROJECT_DIR/backend"
nohup node server.js > /tmp/aice_backend.log 2>&1 &
BACK_PID=$!
echo "Backend PID: $BACK_PID"
cd "$PROJECT_DIR/frontend"
echo "Starting frontend on Vite port 4051..."
nohup npx vite --port 4051 --strictPort > /tmp/aice_frontend.log 2>&1 &
FRONT_PID=$!
echo "Frontend PID: $FRONT_PID"
echo "$BACK_PID" > /tmp/aice_backend.pid
echo "$FRONT_PID" > /tmp/aice_frontend.pid
