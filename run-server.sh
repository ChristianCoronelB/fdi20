#!/bin/bash
cd /home/z/my-project
while true; do
    echo "[$(date)] Starting Next.js server..."
    bun run dev
    EXIT_CODE=$?
    echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 3 seconds..."
    sleep 3
done
