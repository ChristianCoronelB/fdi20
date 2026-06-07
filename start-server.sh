#!/bin/bash
# Script de inicio del servidor Fábrica de Ideas
# Mata procesos antiguos y reinicia el servidor

echo "=== Iniciando servidor Fábrica de Ideas ==="
echo "Fecha: $(date)"

# Matar procesos antiguos
pkill -9 -f "next" 2>/dev/null
pkill -9 -f "bun run dev" 2>/dev/null
sleep 2

# Ir al directorio del proyecto
cd /home/z/my-project

# Limpiar cache
rm -rf .next 2>/dev/null

# Iniciar servidor
echo "Iniciando Next.js en puerto 3000..."
nohup bun run dev > /home/z/my-project/dev.log 2>&1 &
SERVER_PID=$!
echo "PID del servidor: $SERVER_PID"

# Esperar a que inicie
sleep 5

# Verificar que está corriendo
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ Servidor iniciado correctamente"
    echo "Log disponible en: /home/z/my-project/dev.log"
else
    echo "❌ Error al iniciar el servidor"
    echo "Últimas líneas del log:"
    tail -20 /home/z/my-project/dev.log
    exit 1
fi
