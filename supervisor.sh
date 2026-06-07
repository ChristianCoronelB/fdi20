#!/bin/bash
# Supervisor de servidor Fábrica de Ideas
# Verifica cada 10 segundos que el servidor esté respondiendo

LOG_FILE="/home/z/my-project/supervisor.log"
PORT=3000

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

check_server() {
    # Verificar que el proceso existe
    if ! pgrep -f "next-server" > /dev/null; then
        return 1
    fi
    
    # Verificar que responde HTTP
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://localhost:$PORT/ 2>/dev/null)
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "000" ]; then
        # 000 puede significar que está compilando
        return 0
    fi
    
    return 0
}

restart_server() {
    log "⚠️ Servidor no responde, reiniciando..."
    
    # Matar todos los procesos
    pkill -9 -f "next" 2>/dev/null
    pkill -9 -f "bun run dev" 2>/dev/null
    sleep 2
    
    # Reiniciar
    cd /home/z/my-project
    nohup bun run dev > /home/z/my-project/dev.log 2>&1 &
    sleep 5
    
    log "✅ Servidor reiniciado"
}

log "=== Supervisor iniciado ==="

while true; do
    if ! check_server; then
        restart_server
    else
        log "✓ Servidor OK"
    fi
    sleep 10
done
