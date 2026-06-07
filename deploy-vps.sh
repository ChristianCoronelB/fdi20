#!/bin/bash
# ============================================
# Script de despliegue - Fábrica de Ideas
# Para servidor VPS con Ubuntu/Debian
# ============================================

set -e

echo "=== Desplegando Fábrica de Ideas en VPS ==="

# 1. Actualizar sistema
echo "[1/7] Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias
echo "[2/7] Instalando dependencias..."
sudo apt install -y curl git build-essential

# 3. Instalar Bun si no está instalado
if ! command -v bun &> /dev/null; then
    echo "[3/7] Instalando Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
else
    echo "[3/7] Bun ya está instalado"
fi

# 4. Clonar repositorio
echo "[4/7] Clonando repositorio..."
if [ -d "fdi20" ]; then
    cd fdi20
    git pull origin main
else
    git clone https://github.com/ChristianCoronelB/fdi20.git
    cd fdi20
fi

# 5. Instalar dependencias del proyecto
echo "[5/7] Instalando dependencias del proyecto..."
bun install

# 6. Configurar base de datos
echo "[6/7] Configurando base de datos..."
bun run db:push

# 7. Compilar para producción
echo "[7/7] Compilando para producción..."
bun run build

echo ""
echo "=== Compilación completada ==="
echo ""
echo "Para ejecutar en producción:"
echo "  cd fdi20 && bun run start"
echo ""
echo "Para usar PM2 (recomendado):"
echo "  sudo npm install -g pm2"
echo "  pm2 start 'bun run start' --name fabrica-ideas"
echo "  pm2 save"
echo "  pm2 startup"
