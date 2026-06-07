#!/bin/bash
cd /home/z/my-project
while true; do
    bun run dev 2>&1
    echo "Servidor terminado, reiniciando en 3 segundos..."
    sleep 3
done
