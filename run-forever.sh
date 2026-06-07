#!/bin/bash
# Script que mantiene el servidor Next.js SIEMPRE activo
# Se ejecuta en un bucle infinito

cd /home/z/my-project

echo "Iniciando servidor permanente..."

while true; do
    # Verificar si el servidor está respondiendo
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 http://localhost:3000/ 2>/dev/null)
    
    if [ "$HTTP_CODE" != "200" ]; then
        echo "[$(date)] Servidor no responde (HTTP: $HTTP_CODE), reiniciando..."
        
        # Matar procesos antiguos
        pkill -f "next dev" 2>/dev/null
        pkill -f "next-server" 2>/dev/null
        sleep 2
        
        # Iniciar servidor
        bun run dev > /home/z/my-project/dev.log 2>&1 &
        SERVER_PID=$!
        echo "[$(date)] Servidor iniciado con PID: $SERVER_PID"
        
        # Esperar a que compile
        sleep 10
        
        # Verificar que inició correctamente
        if curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:3000/ 2>/dev/null | grep -q "200"; then
            echo "[$(date)] ✅ Servidor funcionando correctamente"
        fi
    fi
    
    sleep 15
done
