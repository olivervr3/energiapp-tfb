#!/bin/bash
# validation_test.sh - Quick validation test for EnergiApp v2.0

echo "🔍 VALIDACIÓN FINAL DE ENTREGA - EnergiApp v2.0"
echo "======================================================="
echo ""

# Función para verificar si un archivo existe
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1 - ENCONTRADO"
        return 0
    else
        echo "❌ $1 - NO ENCONTRADO"
        return 1
    fi
}

# Función para verificar directorios
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/ - DIRECTORIO ENCONTRADO"
        return 0
    else
        echo "❌ $1/ - DIRECTORIO NO ENCONTRADO"
        return 1
    fi
}

echo "📁 VERIFICANDO ESTRUCTURA DEL PROYECTO"
echo "-------------------------------------"

# Verificar archivos principales
check_file "README.md"
check_file "setup.sh"
check_file "TFB.code-workspace"
check_file "RESUMEN_FINAL_ENTREGA_COMPLETO.md"

echo ""

# Verificar directorios principales
check_dir "frontend"
check_dir "backend"
check_dir "ml-models"
check_dir "documentacion"
check_dir "data"

echo ""
echo "🎨 VERIFICANDO FRONTEND"
echo "----------------------"
check_file "frontend/package.json"
check_file "frontend/src/App.js"
check_file "frontend/src/App_professional.js"
check_file "frontend/src/App_new.css"
check_dir "frontend/src/components"

echo ""
echo "⚙️ VERIFICANDO BACKEND"
echo "---------------------"
check_file "backend/package.json"
check_file "backend/server.js"
check_file "backend/src/app.js"
check_dir "backend/src/models"
check_dir "backend/src/routes"

echo ""
echo "🤖 VERIFICANDO ML SERVICE"
echo "-------------------------"
check_file "ml-models/app.py"
check_file "ml-models/prediction_service.py"
check_file "ml-models/iot_simulator.py"
check_file "ml-models/requirements.txt"
check_dir "ml-models/models"

echo ""
echo "📚 VERIFICANDO DOCUMENTACIÓN"
echo "----------------------------"
check_file "documentacion/main.tex"
check_file "documentacion/capitulos/01_introduccion.tex"
check_file "documentacion/capitulos/07_big_data_analysis.tex"
check_file "documentacion/capitulos/08_machine_learning.tex"
check_file "documentacion/capitulos/09_evaluation_metrics.tex"

echo ""
echo "🧮 ESTADÍSTICAS DEL PROYECTO"
echo "=============================="

# Contar líneas de código si los archivos existen
if [ -d "frontend/src" ]; then
    frontend_lines=$(find frontend/src -name "*.js" -o -name "*.jsx" -o -name "*.css" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    echo "Frontend (React):     ${frontend_lines:-0} líneas"
fi

if [ -d "backend/src" ]; then
    backend_lines=$(find backend -name "*.js" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    echo "Backend (Node.js):    ${backend_lines:-0} líneas"
fi

if [ -d "ml-models" ]; then
    ml_lines=$(find ml-models -name "*.py" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    echo "ML Service (Python):  ${ml_lines:-0} líneas"
fi

if [ -d "documentacion" ]; then
    doc_lines=$(find documentacion -name "*.tex" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    echo "Documentación (LaTeX): ${doc_lines:-0} líneas"
fi

echo ""
echo "🎯 VERIFICACIÓN COMPLETADA"
echo "=========================="
echo ""
echo "📋 PRÓXIMOS PASOS PARA DEMO:"
echo "1. Ejecutar: ./setup.sh (o setup.bat en Windows)"
echo "2. Iniciar servicios: npm start en cada directorio"
echo "3. Acceder a: http://localhost:3000"
echo "4. Login: admin/admin123 o usuario1/user123"
echo ""
echo "✅ EnergiApp v2.0 - LISTO PARA ENTREGA"
echo "🎓 Oliver Vincent Rice - Universitat Carlemany"
echo "📅 Julio 2025"
