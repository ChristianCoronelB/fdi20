#!/bin/bash

# ===========================================
# 🚀 Fábrica de Ideas - Despliegue Fácil
# ===========================================
# Este script te guía paso a paso para desplegar

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║      🚀 FÁBRICA DE IDEAS - GUÍA DE DESPLIEGUE 🚀             ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Esta guía te ayudará a poner tu aplicación en internet."
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 PASOS A SEGUIR:"
echo ""
echo "   1️⃣  Crear cuenta en GitHub (si no tienes)"
echo "   2️⃣  Crear un nuevo repositorio"
echo "   3️⃣  Subir el código"
echo "   4️⃣  Conectar con Vercel"
echo "   5️⃣  ¡Listo!"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

# Paso 1: Verificar Git
echo "🔍 Verificando Git..."
if command -v git &> /dev/null; then
    echo "   ✅ Git está instalado"
else
    echo "   ❌ Git no está instalado. Instálalo primero:"
    echo "      Ubuntu/Debian: sudo apt install git"
    echo "      macOS: brew install git"
    echo "      Windows: Descarga de git-scm.com"
    exit 1
fi

# Paso 2: Verificar que existe el repositorio
echo ""
echo "🔍 Verificando repositorio..."
if [ -d .git ]; then
    echo "   ✅ Repositorio Git inicializado"
else
    echo "   📝 Inicializando repositorio..."
    git init
    echo "   ✅ Repositorio creado"
fi

# Paso 3: Mostrar archivos a subir
echo ""
echo "📁 Archivos listos para subir:"
echo ""
git status -s | head -20
echo ""

# Paso 4: Instrucciones
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🎯 SIGUIENTES PASOS:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  VE A GITHUB:"
echo "    👉 https://github.com/new"
echo ""
echo "    - Repository name: fabrica-de-ideas"
echo "    - Selecciona: Public"
echo "    - Haz clic en: Create repository"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "2️⃣  EJECUTA ESTOS COMANDOS (reemplaza TU-USUARIO):"
echo ""
echo "    git add ."
echo "    git commit -m \"Primera versión de Fábrica de Ideas\""
echo "    git remote add origin https://github.com/TU-USUARIO/fabrica-de-ideas.git"
echo "    git push -u origin master"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "3️⃣  VE A VERCEL:"
echo "    👉 https://vercel.com"
echo ""
echo "    - Clic en: Sign Up"
echo "    - Selecciona: Continue with GitHub"
echo "    - Autoriza a Vercel"
echo "    - Importa tu repositorio"
echo "    - Agrega las variables de entorno:"
echo ""
echo "      DATABASE_URL=file:./db/prod.db"
echo "      JWT_SECRET=tu-clave-secreta-super-larga-minimo-32-caracteres"
echo ""
echo "    - Clic en: Deploy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "4️⃣  ¡ESPERA 2-3 MINUTOS Y LISTO! 🎉"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📖 Para más detalles, consulta: GUIA_PRINCIPIANTES.md"
echo ""
