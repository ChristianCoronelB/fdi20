#!/bin/bash
# Servidor persistente con reinicio automático
# Este script mantiene el servidor Next.js siempre activo

cd /home/z/my-project

echo "Iniciando servidor persistente..." > /home/z/my-project/server-status.log

while true; do
    # Iniciar servidor
    echo "[$(date)] Iniciando servidor..." >> /home/z/my-project/server-status.log
    bun run dev >> /home/z/my-project/dev.log 2>&1 &
    SERVER_PID=$!
    
    # Esperar a que compile
    sleep 10
    
    # Verificar que está respondiendo
    for i in {1..5}; do
        HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null)
        if [ "$HTTP" = "200" ]; then
            echo "[$(date)] ✅ Servidor funcionando (HTTP 200)" >> /home/z/my-project/server-status.log
            break
        fi
        sleep 2
    done
    
    # Esperar a que el proceso termine (si termina)
    wait $SERVER_PID 2>/dev/null
    
    echo "[$(date)] ⚠️ Servidor terminado, reiniciando..." >> /home/z/my-project/server-status.log
    sleep 2
done
