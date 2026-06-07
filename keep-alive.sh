#!/bin/bash
# Keep-alive script for Next.js dev server
# This script checks if the server is running and restarts it if needed

PROJECT_DIR="/home/z/my-project"
LOG_FILE="$PROJECT_DIR/dev.log"
PID_FILE="$PROJECT_DIR/server.pid"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

is_server_running() {
    # Check if port 3000 is listening
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --connect-timeout 5 | grep -q "200\|304\|302\|401\|404"; then
        return 0
    fi
    return 1
}

start_server() {
    log "Starting Next.js dev server..."
    cd "$PROJECT_DIR"
    nohup bun run dev >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    sleep 5
}

stop_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            log "Stopping server (PID: $PID)..."
            kill "$PID" 2>/dev/null
            sleep 2
        fi
        rm -f "$PID_FILE"
    fi
    # Also kill any existing next-server processes
    pkill -f "next dev -p 3000" 2>/dev/null
    pkill -f "next-server" 2>/dev/null
    sleep 2
}

# Main loop
log "Keep-alive script started"

while true; do
    if ! is_server_running; then
        log "Server is not responding, restarting..."
        stop_server
        start_server
        log "Server restarted"
    fi
    sleep 30
done
