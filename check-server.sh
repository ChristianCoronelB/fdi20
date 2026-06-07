#!/bin/bash
# Quick server check and restart script
PROJECT_DIR="/home/z/my-project"
LOG_FILE="$PROJECT_DIR/dev.log"

# Check if server responds
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --connect-timeout 3 | grep -q "200\|304\|302\|401\|404\|000"; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server not responding, restarting..." >> "$LOG_FILE"
    cd "$PROJECT_DIR"
    pkill -f "next dev" 2>/dev/null
    sleep 2
    nohup bun run dev >> "$LOG_FILE" 2>&1 &
fi
