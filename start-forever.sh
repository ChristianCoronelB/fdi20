#!/bin/bash
cd /home/z/my-project
while true; do
    echo "$(date): Iniciando servidor..." 
    node node_modules/.bin/next dev -p 3000
    EXIT_CODE=$?
    echo "$(date): Servidor terminó con código $EXIT_CODE"
    if [ $EXIT_CODE -eq 0 ]; then
        echo "Servidor terminó normalmente, reiniciando..."
    else
        echo "Servidor terminó con error, reiniciando en 3 segundos..."
        sleep 3
    fi
done
