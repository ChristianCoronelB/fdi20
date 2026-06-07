#!/bin/bash
# Daemon de supervisión - mantiene el servidor activo permanentemente
# Se ejecuta en background verificando cada 15 segundos

LOG="/home/z/my-project/supervisor.log"
PIDFILE="/home/z/my-project/server.pid"

# Función para escribir log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"
}

# Función para verificar si el servidor responde
check_http() {
    curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 http://localhost:3000/ 2>/dev/null
}

# Función para iniciar el servidor
start_server() {
    log "🚀 Iniciando servidor..."
    cd /home/z/my-project
    
    # Limpiar procesos antiguos
    pkill -f "next dev" 2>/dev/null
    sleep 2
    
    # Iniciar nuevo
    nohup bun run dev > /home/z/my-project/dev.log 2>&1 &
    echo $! > "$PIDFILE"
    
    sleep 5
    log "✅ Servidor iniciado con PID $(cat $PIDFILE 2>/dev/null)"
}

# Función para verificar y reiniciar si es necesario
check_and_restart() {
    # Verificar proceso
    if ! pgrep -f "next-server" > /dev/null; then
        log "⚠️ Proceso no encontrado, reiniciando..."
        start_server
        return
    fi
    
    # Verificar HTTP
    HTTP_CODE=$(check_http)
    if [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
        log "⚠️ Sin respuesta HTTP, verificando proceso..."
        sleep 5
        HTTP_CODE=$(check_http)
        if [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
            log "❌ Servidor no responde, reiniciando..."
            start_server
        fi
    else
        log "✓ Servidor OK (HTTP $HTTP_CODE)"
    fi
}

# Inicio
log "========== SUPERVISOR INICIADO =========="

# Bucle principal
while true; do
    check_and_restart
    sleep 15
done
