#!/bin/bash

# Script para reparar errores de Prisma
# Fábrica de Ideas - Sistema de Gestión de Eventos

echo "🔧 Reparando errores de Prisma..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detectar gestor de paquetes
if command -v bun &> /dev/null; then
    PKG_MANAGER="bun"
    PKG_RUN="bun"
    PRISMA_CMD="bunx prisma"
else
    PKG_MANAGER="npm"
    PKG_RUN="npm"
    PRISMA_CMD="npx prisma"
fi

echo "📦 Gestor de paquetes detectado: $PKG_MANAGER"

# Paso 1: Limpiar caches
echo -e "${YELLOW}🧹 Limpiando caches...${NC}"
rm -rf node_modules/.prisma 2>/dev/null
rm -rf node_modules/@prisma/client 2>/dev/null
rm -rf .next 2>/dev/null

# Paso 2: Regenerar cliente Prisma
echo -e "${YELLOW}⚙️  Generando cliente Prisma...${NC}"
$PRISMA_CMD generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Cliente Prisma generado correctamente${NC}"
else
    echo -e "${RED}❌ Error al generar cliente Prisma${NC}"
    echo "Intentando reinstalar dependencias..."
    
    rm -rf node_modules
    $PKG_RUN install
    $PRISMA_CMD generate
fi

# Paso 3: Sincronizar base de datos
echo -e "${YELLOW}🗄️  Sincronizando base de datos...${NC}"
$PRISMA_CMD db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos sincronizada${NC}"
else
    echo -e "${RED}⚠️  Advertencia: Problema al sincronizar base de datos${NC}"
fi

# Paso 4: Verificar
echo -e "${YELLOW}🔍 Verificando instalación...${NC}"
if [ -d "node_modules/.prisma/client" ]; then
    echo -e "${GREEN}✅ Prisma instalado correctamente${NC}"
    echo ""
    echo -e "${GREEN}🚀 ¡Listo! Ahora puedes ejecutar: $PKG_RUN run dev${NC}"
else
    echo -e "${RED}❌ Prisma aún no está instalado correctamente${NC}"
    echo "Intenta ejecutar manualmente: $PRISMA_CMD generate"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "   Fábrica de Ideas - Sistema de Eventos   "
echo "═══════════════════════════════════════════"
