@echo off
REM Script de instalación y configuración para EnergiApp v2.0
REM Autor: Oliver Vincent Rice
REM Fecha: Julio 2025

echo 🚀 =====================================
echo ⚡ EnergiApp v2.0 - Setup Automático
echo 🚀 =====================================

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo [ERROR] Este script debe ejecutarse desde el directorio raíz del proyecto TFB
    exit /b 1
)

if not exist "frontend" (
    echo [ERROR] Directorio frontend no encontrado
    exit /b 1
)

if not exist "backend" (
    echo [ERROR] Directorio backend no encontrado
    exit /b 1
)

echo [INFO] Iniciando configuración de EnergiApp v2.0...

REM 1. Verificar Node.js
echo [INFO] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no está instalado. Por favor instala Node.js 16+ desde https://nodejs.org/
    exit /b 1
)

echo [SUCCESS] Node.js detectado
node --version

REM 2. Verificar Python
echo [INFO] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no está instalado. Por favor instala Python 3.8+ desde https://python.org/
    exit /b 1
)

echo [SUCCESS] Python detectado
python --version

REM 3. Instalar dependencias del backend
echo [INFO] Instalando dependencias del backend...
cd backend
call npm install
if errorlevel 1 (
    echo [ERROR] Error instalando dependencias del backend
    exit /b 1
)
echo [SUCCESS] Dependencias del backend instaladas
cd ..

REM 4. Instalar dependencias del frontend
echo [INFO] Instalando dependencias del frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Error instalando dependencias del frontend
    exit /b 1
)
echo [SUCCESS] Dependencias del frontend instaladas
cd ..

REM 5. Configurar entorno Python para ML
echo [INFO] Configurando entorno Python para ML...
cd ml-models

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo [INFO] Creando entorno virtual Python...
    python -m venv venv
)

REM Activar entorno virtual e instalar dependencias
echo [INFO] Instalando dependencias Python...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Error instalando dependencias Python
    exit /b 1
)
echo [SUCCESS] Dependencias Python instaladas

cd ..

REM 6. Crear archivos de configuración si no existen
echo [INFO] Configurando archivos de entorno...

REM Backend .env
if not exist "backend\.env" (
    echo NODE_ENV=development > backend\.env
    echo PORT=5000 >> backend\.env
    echo JWT_SECRET=energiapp_jwt_secret_key_2025 >> backend\.env
    echo ML_SERVICE_URL=http://localhost:8000 >> backend\.env
    echo IOT_SIMULATOR_PATH=../ml-models/iot_simulator.py >> backend\.env
    echo CORS_ORIGINS=http://localhost:3000,http://localhost:3001 >> backend\.env
    echo [SUCCESS] Archivo backend\.env creado
)

REM Frontend .env
if not exist "frontend\.env" (
    echo REACT_APP_API_URL=http://localhost:5000/api > frontend\.env
    echo REACT_APP_VERSION=2.0.1 >> frontend\.env
    echo REACT_APP_ML_ENABLED=true >> frontend\.env
    echo REACT_APP_IOT_ENABLED=true >> frontend\.env
    echo [SUCCESS] Archivo frontend\.env creado
)

REM 7. Crear script de inicio para Windows
echo [INFO] Creando scripts de inicio...

echo @echo off > start_dev.bat
echo echo 🚀 Iniciando EnergiApp v2.0 en modo desarrollo... >> start_dev.bat
echo. >> start_dev.bat
echo echo 📡 Iniciando Backend... >> start_dev.bat
echo start "Backend" cmd /k "cd backend && npm start" >> start_dev.bat
echo. >> start_dev.bat
echo timeout /t 3 /nobreak ^>nul >> start_dev.bat
echo. >> start_dev.bat
echo echo 🎨 Iniciando Frontend... >> start_dev.bat
echo start "Frontend" cmd /k "cd frontend && npm start" >> start_dev.bat
echo. >> start_dev.bat
echo timeout /t 3 /nobreak ^>nul >> start_dev.bat
echo. >> start_dev.bat
echo echo 🤖 Iniciando Servicio ML... >> start_dev.bat
echo start "ML Service" cmd /k "cd ml-models && venv\Scripts\activate && python app.py" >> start_dev.bat
echo. >> start_dev.bat
echo echo ✅ Todos los servicios iniciados! >> start_dev.bat
echo echo 🌐 Frontend: http://localhost:3000 >> start_dev.bat
echo echo 📡 Backend: http://localhost:5000 >> start_dev.bat
echo echo 🤖 ML Service: http://localhost:8000 >> start_dev.bat
echo echo 🛑 Cierra las ventanas individuales para detener cada servicio >> start_dev.bat
echo. >> start_dev.bat
echo pause >> start_dev.bat

echo [SUCCESS] Script start_dev.bat creado

REM 8. Verificar configuración
echo [INFO] Verificando configuración...

REM Test compilación frontend
echo [INFO] Probando compilación del frontend...
cd frontend
call npm run build >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Frontend tiene problemas de compilación (revisar manualmente)
) else (
    echo [SUCCESS] Frontend compila correctamente
    if exist "build" rmdir /s /q build
)
cd ..

REM Test sintaxis Python
echo [INFO] Verificando sintaxis Python...
cd ml-models
python -m py_compile app.py >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Scripts Python tienen problemas (revisar manualmente)
) else (
    echo [SUCCESS] Scripts Python válidos
)
cd ..

REM 9. Mostrar información final
echo.
echo 🎉 =====================================
echo ✅ Configuración completada con éxito!
echo 🎉 =====================================
echo.
echo 📋 INFORMACIÓN DEL PROYECTO:
echo    📁 Frontend: React 18 + CSS Profesional
echo    📁 Backend: Node.js + Express + JWT
echo    📁 ML Service: Python + Flask + Scikit-learn
echo    📁 IoT Simulator: Python con dispositivos realistas
echo.
echo 🚀 PARA INICIAR EL DESARROLLO:
echo    Windows: start_dev.bat
echo.
echo 🌐 URLs DE ACCESO:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:5000
echo    ML Service: http://localhost:8000
echo.
echo 👤 USUARIOS DE PRUEBA:
echo    Admin: admin / admin123
echo    Usuario: usuario1 / user123
echo.
echo 📚 DOCUMENTACIÓN:
echo    Manual: .\documentacion\
echo    README: .\README.md
echo.
echo 🎉 ¡Proyecto listo para desarrollo!
echo 🎉 =====================================

pause
