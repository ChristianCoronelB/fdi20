#!/bin/bash
# Persistent Watcher - Runs forever and ensures server is always up

LOG_FILE="/home/z/my-project/dev.log"

echo "[$(date)] Persistent Watcher started" >> "$LOG_FILE"

while true; do
    # Run the watchdog
    /home/z/my-project/watchdog.sh
    
    # Wait 30 seconds before next check
    sleep 30
done
