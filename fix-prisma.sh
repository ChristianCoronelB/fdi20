#!/bin/bash

# Script para reparar errores de Prisma
# Fábrica de Ideas - Sistema de Gestión de Eventos
# Optimizado para Bun

echo "═══════════════════════════════════════════"
echo "   🔧 Reparador de Prisma - Fábrica de Ideas  "
echo "═══════════════════════════════════════════"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detectar gestor de paquetes (preferir Bun)
if command -v bun &> /dev/null; then
    PKG_MANAGER="bun"
    PKG_INSTALL="bun install"
    PKG_RUN="bun"
    PRISMA_CMD="bunx prisma"
    echo -e "${GREEN}⚡ Bun detectado - Usando Bun para mejor rendimiento${NC}"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    PKG_INSTALL="npm install"
    PKG_RUN="npm"
    PRISMA_CMD="npx prisma"
    echo -e "${YELLOW}📦 Usando npm (Bun no está instalado)${NC}"
    echo -e "${BLUE}💡 Recomendación: Instala Bun para mejor rendimiento${NC}"
    echo "   Mac/Linux: curl -fsSL https://bun.sh/install | bash"
    echo "   Windows:   powershell -c \"irm bun.sh/install.ps1 | iex\""
else
    echo -e "${RED}❌ Error: No se encontró Bun ni npm instalado${NC}"
    exit 1
fi

echo ""

# Paso 1: Limpiar caches
echo -e "${YELLOW}🧹 Paso 1/4: Limpiando caches...${NC}"
rm -rf node_modules/.prisma 2>/dev/null
rm -rf node_modules/@prisma/client 2>/dev/null
rm -rf .next 2>/dev/null
echo -e "${GREEN}   ✓ Caches limpiados${NC}"
echo ""

# Paso 2: Regenerar cliente Prisma
echo -e "${YELLOW}⚙️  Paso 2/4: Generando cliente Prisma...${NC}"
$PRISMA_CMD generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✓ Cliente Prisma generado correctamente${NC}"
else
    echo -e "${RED}   ⚠ Error al generar cliente Prisma${NC}"
    echo -e "${YELLOW}   Reinstalando dependencias...${NC}"
    
    rm -rf node_modules
    $PKG_INSTALL
    $PRISMA_CMD generate
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error crítico: No se pudo generar el cliente Prisma${NC}"
        exit 1
    fi
fi
echo ""

# Paso 3: Sincronizar base de datos
echo -e "${YELLOW}🗄️  Paso 3/4: Sincronizando base de datos...${NC}"
$PRISMA_CMD db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✓ Base de datos sincronizada${NC}"
else
    echo -e "${RED}   ⚠ Advertencia: Problema al sincronizar base de datos${NC}"
    echo "   Si la base de datos está corrupta, intenta: rm dev.db && $PRISMA_CMD db push"
fi
echo ""

# Paso 4: Verificar instalación
echo -e "${YELLOW}🔍 Paso 4/4: Verificando instalación...${NC}"
if [ -d "node_modules/.prisma/client" ]; then
    echo -e "${GREEN}   ✓ Prisma instalado correctamente${NC}"
else
    echo -e "${RED}   ⚠ Prisma podría no estar configurado correctamente${NC}"
fi
echo ""

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    echo "   Creando archivo .env con configuración por defecto..."
    cat > .env << 'ENVEOF'
DATABASE_URL="file:./dev.db"
JWT_SECRET="mi-secreto-jwt-super-seguro-2024"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENVEOF
    echo -e "${GREEN}   ✓ Archivo .env creado${NC}"
fi
echo ""

# Resumen final
echo "═══════════════════════════════════════════"
echo -e "${GREEN}✅ Reparación completada${NC}"
echo ""
echo "🚀 Para iniciar el servidor, ejecuta:"
echo -e "   ${BLUE}$PKG_RUN run dev${NC}"
echo ""
echo "📊 Comandos útiles:"
echo "   $PRISMA_CMD studio   - Ver base de datos"
echo "   $PRISMA_CMD generate - Regenerar cliente"
echo "   $PRISMA_CMD db push  - Sincronizar DB"
echo "═══════════════════════════════════════════"
