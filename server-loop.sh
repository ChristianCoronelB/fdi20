#!/bin/bash
cd /home/z/my-project
while true; do
    echo "$(date): Iniciando servidor..." >> server-loop.log
    node node_modules/.bin/next dev -p 3000 2>&1 | tee -a server-loop.log
    EXIT_CODE=$?
    echo "$(date): Servidor terminó con código $EXIT_CODE" >> server-loop.log
    sleep 2
done
