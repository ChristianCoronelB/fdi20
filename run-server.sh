#!/bin/bash
cd /home/z/my-project
echo "Iniciando servidor Next.js..."
exec node node_modules/.bin/next dev -p 3000
