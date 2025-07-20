@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

title TFB EnergiApp - Compilador de Memoria

echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                           📚 ENERGIAPP TFB 📚                               ║
echo ║                         Compilador de Memoria                               ║
echo ║                                                                              ║
echo ║                         🎓 UNIVERSITAT CARLEMANY 🎓                         ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

REM Verificar directorio correcto
if not exist "main.tex" (
    echo ❌ main.tex no encontrado. Ejecuta desde el directorio documentacion/
    pause
    exit /b 1
)

REM Limpiar archivos anteriores
echo [2/3] Limpiando archivos temporales...
for %%f in (*.aux *.log *.bbl *.blg *.toc *.lof *.lot *.out *.fdb_latexmk *.fls *.synctex.gz) do (
    if exist "%%f" del /q "%%f" 2>nul
)

REM Compilar
echo [3/3] Compilando memoria...
echo.
echo 📄 Compilación 1/3: Estructura...
pdflatex -interaction=nonstopmode main.tex >compilacion.log 2>&1

echo 📄 Compilación 2/3: Referencias...
pdflatex -interaction=nonstopmode main.tex >>compilacion.log 2>&1

echo 📄 Compilación 3/3: Final...
pdflatex -interaction=nonstopmode main.tex >>compilacion.log 2>&1

REM Verificar resultado
if exist "main.pdf" (
    for %%A in (main.pdf) do set PDF_SIZE=%%~zA
    set /a PDF_SIZE_MB=!PDF_SIZE!/1024/1024
    
    echo.
    echo ✅ ¡MEMORIA TFB GENERADA EXITOSAMENTE!
    echo.
    echo 📊 Archivo: main.pdf (!PDF_SIZE_MB! MB)
    echo 📍 Ubicación: %CD%\main.pdf
    echo.
    
    REM Crear copia con fecha
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set FECHA=%%c%%b%%a
    set FECHA=!FECHA:/=-!
    copy main.pdf "TFB_EnergiApp_!FECHA!.pdf" >nul
    echo ✅ Copia: TFB_EnergiApp_!FECHA!.pdf
    
    echo.
    echo 🎉 ¡LISTO PARA PRESENTACIÓN ACADÉMICA!
    echo.
    
    set /p ABRIR="¿Abrir PDF? (s/N): "
    if /i "!ABRIR!"=="s" start main.pdf
    
) else (
    echo ❌ Error generando PDF
    echo Ver compilacion.log para detalles
)

echo.
pause
