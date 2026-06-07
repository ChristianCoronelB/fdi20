#!/bin/bash
# Script para verificar e iniciar el servidor cuando sea necesario

cd /home/z/my-project

# Verificar si el servidor está activo
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null)

if [ "$HTTP" != "200" ]; then
    echo "[$(date)] Servidor no activo, iniciando..." >> /home/z/my-project/server-check.log
    
    # Matar procesos antiguos
    pkill -f "next dev" 2>/dev/null
    pkill -f "bun run dev" 2>/dev/null
    sleep 2
    
    # Iniciar servidor
    bun run dev > /home/z/my-project/dev.log 2>&1 &
    
    # Esperar compilación
    sleep 15
    
    # Verificar que inició
    HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null)
    if [ "$HTTP" = "200" ]; then
        echo "[$(date)] ✅ Servidor iniciado" >> /home/z/my-project/server-check.log
        exit 0
    else
        echo "[$(date)] ❌ Error al iniciar" >> /home/z/my-project/server-check.log
        exit 1
    fi
fi

exit 0
