#!/bin/bash
while true; do
    HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null)
    if [ "$HTTP" != "200" ]; then
        echo "[$(date)] Reiniciando servidor..." >> /home/z/my-project/keep-alive.log
        pkill -f "next dev" 2>/dev/null
        sleep 2
        cd /home/z/my-project && bun run dev > /home/z/my-project/dev.log 2>&1 &
        sleep 10
    fi
    sleep 10
done
