@echo off
REM compile_memoria.bat - Script para compilar la memoria LaTeX

echo 📚 COMPILANDO MEMORIA TÉCNICA - EnergiApp v2.0
echo ===============================================
echo.

echo 🔧 Cambiando al directorio de documentación...
cd /d "c:\Users\G513\Desktop\TFB\documentacion"

echo.
echo ⚙️  Primera compilación (generando referencias)...
pdflatex -interaction=nonstopmode main.tex > compile_log1.txt 2>&1

echo.
echo ⚙️  Segunda compilación (resolviendo referencias cruzadas)...
pdflatex -interaction=nonstopmode main.tex > compile_log2.txt 2>&1

echo.
echo 🔍 Verificando resultado...
if exist main.pdf (
    echo ✅ PDF generado exitosamente: main.pdf
    for %%I in (main.pdf) do echo 📊 Tamaño: %%~zI bytes
    echo.
    echo 📖 Abriendo PDF...
    start main.pdf
) else (
    echo ❌ Error: No se pudo generar el PDF
    echo 📝 Revisa los logs: compile_log1.txt y compile_log2.txt
)

echo.
echo 🎓 COMPILACIÓN COMPLETADA
echo ========================
echo.
echo 📋 Archivos generados:
echo - main.pdf (Memoria técnica completa)
echo - main.aux (Archivo auxiliar)
echo - main.toc (Tabla de contenidos)
echo - main.lof (Lista de figuras)
echo - main.lot (Lista de tablas)
echo.
echo ✅ EnergiApp v2.0 - Documentación lista para entrega
echo 🎓 Oliver Vincent Rice - Universitat Carlemany

pause
