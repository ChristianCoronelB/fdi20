#!/bin/bash
# Script que mantiene el servidor activo permanentemente

cd /home/z/my-project

echo "[$(date)] Iniciando servidor permanente..." >> /home/z/my-project/server.log

while true; do
    # Verificar si ya hay un servidor corriendo
    HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null)
    
    if [ "$HTTP" != "200" ]; then
        echo "[$(date)] Iniciando servidor..." >> /home/z/my-project/server.log
        
        # Matar procesos antiguos
        pkill -f "next dev" 2>/dev/null
        sleep 2
        
        # Iniciar servidor
        bun run dev >> /home/z/my-project/dev.log 2>&1 &
        
        # Esperar a que compile
        sleep 15
        
        # Verificar
        HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/ 2>/dev/null)
        if [ "$HTTP" = "200" ]; then
            echo "[$(date)] Servidor iniciado correctamente" >> /home/z/my-project/server.log
        fi
    fi
    
    sleep 20
done
