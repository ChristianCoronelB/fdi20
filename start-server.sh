#!/bin/bash
cd /home/z/my-project
while true; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Next.js server..." >> /home/z/my-project/dev.log
    bun run dev >> /home/z/my-project/dev.log 2>&1
    EXIT_CODE=$?
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server exited with code $EXIT_CODE, restarting in 5 seconds..." >> /home/z/my-project/dev.log
    sleep 5
done
