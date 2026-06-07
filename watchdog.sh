#!/bin/bash
# Watchdog script - checks if supervisor is running and restarts if needed

SUPERVISOR_PID_FILE="/home/z/my-project/supervisor.pid"
SUPERVISOR_SCRIPT="/home/z/my-project/supervisor/supervisor.js"
LOG_FILE="/home/z/my-project/dev.log"

# Check if supervisor is running
if [ -f "$SUPERVISOR_PID_FILE" ]; then
    SUPERVISOR_PID=$(cat "$SUPERVISOR_PID_FILE")
    if kill -0 "$SUPERVISOR_PID" 2>/dev/null; then
        # Supervisor is running, check if server is responding
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --connect-timeout 3 | grep -q "200\|401\|404"; then
            # Everything is fine
            exit 0
        fi
    fi
fi

# Supervisor not running or server not responding, restart everything
echo "[$(date)] Watchdog: Restarting supervisor..." >> "$LOG_FILE"
cd /home/z/my-project
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
pkill -f "supervisor" 2>/dev/null
sleep 2

nohup node supervisor/supervisor.js >> "$LOG_FILE" 2>&1 &
echo $! > "$SUPERVISOR_PID_FILE"
disown

echo "[$(date)] Watchdog: Supervisor restarted with PID $(cat $SUPERVISOR_PID_FILE)" >> "$LOG_FILE"
