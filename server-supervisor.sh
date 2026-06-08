#!/bin/bash
# Supervisor robusto para mantener Next.js activo permanentemente

LOG="/home/z/my-project/server.log"
DEVLOG="/home/z/my-project/dev.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"
}

log "Iniciando supervisor de servidor..."

while true; do
    # Verificar si next-server está corriendo
    if ! pgrep -f "next-server" > /dev/null 2>&1; then
        log "Servidor no encontrado, reiniciando..."
        
        # Matar cualquier proceso residual
        pkill -f "next dev" 2>/dev/null
        sleep 2
        
        # Iniciar servidor
        cd /home/z/my-project && bun run dev >> "$DEVLOG" 2>&1 &
        SERVER_PID=$!
        log "Servidor iniciado con PID: $SERVER_PID"
        
        # Esperar a que el servidor esté listo
        sleep 15
        
        # Verificar que el servidor está respondiendo
        if curl -s -o /dev/null -w "" http://localhost:3000/ > /dev/null 2>&1; then
            log "Servidor respondiendo correctamente"
        else
            log "ADVERTENCIA: Servidor iniciado pero no responde"
        fi
    fi
    
    sleep 5
done
