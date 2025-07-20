#!/bin/bash

# Script de instalación y configuración para EnergiApp v2.0
# Autor: Oliver Vincent Rice
# Fecha: Julio 2025

echo "🚀 ====================================="
echo "⚡ EnergiApp v2.0 - Setup Automático"
echo "🚀 ====================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del proyecto TFB"
    exit 1
fi

print_status "Iniciando configuración de EnergiApp v2.0..."

# 1. Verificar Node.js
print_status "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 16+ desde https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js versión 16+ requerida. Versión actual: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detectado"

# 2. Verificar Python
print_status "Verificando Python..."
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 no está instalado. Por favor instala Python 3.8+ desde https://python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
print_success "Python $PYTHON_VERSION detectado"

# 3. Instalar dependencias del backend
print_status "Instalando dependencias del backend..."
cd backend
if npm install; then
    print_success "Dependencias del backend instaladas"
else
    print_error "Error instalando dependencias del backend"
    exit 1
fi
cd ..

# 4. Instalar dependencias del frontend
print_status "Instalando dependencias del frontend..."
cd frontend
if npm install; then
    print_success "Dependencias del frontend instaladas"
else
    print_error "Error instalando dependencias del frontend"
    exit 1
fi
cd ..

# 5. Configurar entorno Python para ML
print_status "Configurando entorno Python para ML..."
cd ml-models

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    print_status "Creando entorno virtual Python..."
    python3 -m venv venv
fi

# Activar entorno virtual
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Instalar dependencias Python
print_status "Instalando dependencias Python..."
if pip install -r requirements.txt; then
    print_success "Dependencias Python instaladas"
else
    print_error "Error instalando dependencias Python"
    exit 1
fi

cd ..

# 6. Crear archivos de configuración si no existen
print_status "Configurando archivos de entorno..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
NODE_ENV=development
PORT=5000
JWT_SECRET=energiapp_jwt_secret_key_2025
ML_SERVICE_URL=http://localhost:8000
IOT_SIMULATOR_PATH=../ml-models/iot_simulator.py
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
EOF
    print_success "Archivo backend/.env creado"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_VERSION=2.0.1
REACT_APP_ML_ENABLED=true
REACT_APP_IOT_ENABLED=true
EOF
    print_success "Archivo frontend/.env creado"
fi

# 7. Crear script de inicio
print_status "Creando scripts de inicio..."

cat > start_dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando EnergiApp v2.0 en modo desarrollo..."

# Función para matar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID $FRONTEND_PID $ML_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Iniciar servicios
echo "📡 Iniciando Backend..."
cd backend && npm start &
BACKEND_PID=$!

echo "🎨 Iniciando Frontend..."
cd frontend && npm start &
FRONTEND_PID=$!

echo "🤖 Iniciando Servicio ML..."
cd ml-models && source venv/bin/activate && python app.py &
ML_PID=$!

echo "✅ Todos los servicios iniciados!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend: http://localhost:5000"
echo "🤖 ML Service: http://localhost:8000"
echo "🛑 Presiona Ctrl+C para detener todos los servicios"

wait
EOF

chmod +x start_dev.sh
print_success "Script start_dev.sh creado"

# Script para Windows
cat > start_dev.bat << 'EOF'
@echo off
echo 🚀 Iniciando EnergiApp v2.0 en modo desarrollo...

echo 📡 Iniciando Backend...
start "Backend" cmd /k "cd backend && npm start"

echo 🎨 Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo 🤖 Iniciando Servicio ML...
start "ML Service" cmd /k "cd ml-models && venv\Scripts\activate && python app.py"

echo ✅ Todos los servicios iniciados!
echo 🌐 Frontend: http://localhost:3000
echo 📡 Backend: http://localhost:5000
echo 🤖 ML Service: http://localhost:8000

pause
EOF

print_success "Script start_dev.bat creado"

# 8. Verificar configuración
print_status "Verificando configuración..."

# Test compilación frontend
print_status "Probando compilación del frontend..."
cd frontend
if npm run build > /dev/null 2>&1; then
    print_success "Frontend compila correctamente"
    rm -rf build
else
    print_warning "Frontend tiene problemas de compilación (revisar manualmente)"
fi
cd ..

# Test sintaxis Python
print_status "Verificando sintaxis Python..."
cd ml-models
if python3 -m py_compile app.py iot_simulator.py; then
    print_success "Scripts Python válidos"
else
    print_warning "Scripts Python tienen problemas (revisar manualmente)"
fi
cd ..

# 9. Mostrar información final
echo ""
echo "🎉 ====================================="
echo "✅ Configuración completada con éxito!"
echo "🎉 ====================================="
echo ""
echo "📋 INFORMACIÓN DEL PROYECTO:"
echo "   📁 Frontend: React 18 + CSS Profesional"
echo "   📁 Backend: Node.js + Express + JWT"
echo "   📁 ML Service: Python + Flask + Scikit-learn"
echo "   📁 IoT Simulator: Python con dispositivos realistas"
echo ""
echo "🚀 PARA INICIAR EL DESARROLLO:"
echo "   Linux/Mac: ./start_dev.sh"
echo "   Windows: start_dev.bat"
echo ""
echo "🌐 URLs DE ACCESO:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo "   ML Service: http://localhost:8000"
echo ""
echo "👤 USUARIOS DE PRUEBA:"
echo "   Admin: admin / admin123"
echo "   Usuario: usuario1 / user123"
echo ""
echo "📚 DOCUMENTACIÓN:"
echo "   Manual: ./documentacion/"
echo "   README: ./README.md"
echo ""
echo "🎉 ¡Proyecto listo para desarrollo!"
echo "🎉 ====================================="
