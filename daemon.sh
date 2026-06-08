#!/bin/bash
# Daemon que mantiene el servidor activo
LOG="/home/z/my-project/daemon.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"
}

log "Daemon iniciado"

while true; do
    # Verificar si el servidor está corriendo
    if ! pgrep -f "next-server" > /dev/null 2>&1; then
        log "Servidor no encontrado, iniciando..."
        
        # Matar procesos residuales
        pkill -f "bun run dev" 2>/dev/null
        pkill -f "next dev" 2>/dev/null
        sleep 2
        
        # Iniciar servidor
        cd /home/z/my-project && bun run dev >> /home/z/my-project/dev.log 2>&1 &
        log "Servidor iniciado"
        
        # Esperar a que compile
        sleep 20
        
        # Verificar
        if curl -s -o /dev/null http://localhost:3000/ 2>/dev/null; then
            log "Servidor respondiendo OK"
        else
            log "ERROR: Servidor no responde"
        fi
    fi
    
    sleep 5
done
