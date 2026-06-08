#!/bin/bash
# Script para mantener el servidor Next.js activo

while true; do
    # Verificar si el servidor está corriendo
    if ! pgrep -f "next-server" > /dev/null; then
        echo "[$(date)] Servidor no encontrado, iniciando..." >> /home/z/my-project/watchdog.log
        cd /home/z/my-project && bun run dev >> /home/z/my-project/dev.log 2>&1 &
        sleep 15
    fi
    sleep 10
done
