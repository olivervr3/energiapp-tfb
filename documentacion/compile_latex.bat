@echo off
echo Compilando documento LaTeX...
cd /d "%~dp0"

echo Primera pasada...
pdflatex entrega_parcial_1.tex

echo Segunda pasada (para indices)...
pdflatex entrega_parcial_1.tex

echo Limpiando archivos temporales...
del *.aux *.log *.out *.toc 2>nul

echo Compilacion completada. PDF generado: entrega_parcial_1.pdf
pause
