#!/bin/bash

# ===========================================
# Fábrica de Ideas - Script de Despliegue
# ===========================================

set -e

echo "🚀 Iniciando despliegue de Fábrica de Ideas..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No se encontró archivo .env${NC}"
    echo "Creando .env desde .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo .env creado. Por favor, configura las variables de entorno.${NC}"
fi

# Generate Prisma Client
echo -e "${YELLOW}📦 Generando Prisma Client...${NC}"
bunx prisma generate

# Run database migrations
echo -e "${YELLOW}🗄️  Ejecutando migraciones de base de datos...${NC}"
bunx prisma migrate deploy

# Build the application
echo -e "${YELLOW}🔨 Compilando aplicación...${NC}"
bun run build

echo -e "${GREEN}✅ ¡Build completado exitosamente!${NC}"

echo ""
echo "=========================================="
echo "📋 OPCIONES DE DESPLIEGUE:"
echo "=========================================="
echo ""
echo "1. DESARROLLO LOCAL:"
echo "   bun run dev"
echo ""
echo "2. PRODUCCIÓN LOCAL:"
echo "   bun run start"
echo ""
echo "3. DOCKER:"
echo "   docker-compose up -d"
echo ""
echo "4. VERCEL (Recomendado):"
echo "   vercel --prod"
echo ""
echo "5. EXPORTAR PARA SERVIDOR:"
echo "   tar -czvf fabrica-de-ideas.tar.gz ."
echo "   # Luego subir al servidor y descomprimir"
echo ""
echo "=========================================="
