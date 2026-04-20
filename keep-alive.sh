#!/bin/bash
cd /home/z/my-project
while true; do
    echo "$(date): Iniciando servidor..." >> server-log.txt
    node node_modules/.bin/next dev -p 3000 >> server-log.txt 2>&1
    echo "$(date): Servidor detenido, reiniciando en 2 segundos..." >> server-log.txt
    sleep 2
done
