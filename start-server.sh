#!/bin/bash
cd /home/z/my-project
while true; do
    echo "Iniciando servidor..."
    bun run dev 2>&1 | tee dev.log
    echo "Servidor detenido. Reiniciando en 3 segundos..."
    sleep 3
done
