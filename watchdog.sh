#!/bin/bash
while true; do
    if ! pgrep -f "next-server" > /dev/null; then
        echo "[$(date)] Reiniciando servidor..." >> /home/z/my-project/watchdog.log
        cd /home/z/my-project && nohup bun run dev > /home/z/my-project/dev.log 2>&1 &
        sleep 15
    fi
    sleep 10
done
