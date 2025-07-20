#!/bin/bash

# =============================================================================
# SCRIPT DE COMPILACIÓN DE MEMORIA TFB - ENERGIAPP
# =============================================================================
# Este script compila la memoria del TFB en formato PDF usando LaTeX
# 
# Autor: Oliver Vincent Rice
# Universidad: Universitat Carlemany
# Fecha: Julio 2025
# =============================================================================

set -e  # Detener en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Función para imprimir mensajes coloreados
print_message() {
    echo -e "${BLUE}[COMPILACIÓN]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Banner de inicio
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                           📚 ENERGIAPP TFB 📚                               ║
║                    Compilación de Memoria Académica                         ║
║                                                                              ║
║                         🎓 UNIVERSITAT CARLEMANY 🎓                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

print_message "Iniciando compilación de la memoria del TFB..."

# Verificar que estamos en el directorio correcto
if [ ! -f "main.tex" ]; then
    print_error "Error: main.tex no encontrado. Ejecuta este script desde el directorio documentacion/"
fi

# Verificar si LaTeX está instalado
if ! command -v pdflatex &> /dev/null; then
    print_error "pdflatex no encontrado. Instala una distribución de LaTeX (TeX Live, MiKTeX, etc.)"
fi

if ! command -v biber &> /dev/null; then
    print_warning "biber no encontrado. Se usará bibtex como alternativa."
    USE_BIBTEX=true
else
    USE_BIBTEX=false
fi

# Limpiar archivos auxiliares previos
print_message "Limpiando archivos auxiliares previos..."
rm -f *.aux *.log *.bbl *.blg *.toc *.lof *.lot *.out *.fdb_latexmk *.fls *.synctex.gz
rm -f capitulos/*.aux
print_success "Archivos auxiliares eliminados"

# Primera compilación - generar estructura
print_message "Primera compilación: generando estructura del documento..."
if pdflatex -interaction=nonstopmode main.tex > compilation.log 2>&1; then
    print_success "Primera compilación exitosa"
else
    print_error "Error en primera compilación. Ver compilation.log para detalles."
fi

# Procesar bibliografía
if [ -f "bibliografia.bib" ]; then
    print_message "Procesando bibliografía..."
    if [ "$USE_BIBTEX" = true ]; then
        if bibtex main >> compilation.log 2>&1; then
            print_success "Bibliografía procesada con bibtex"
        else
            print_warning "Error procesando bibliografía con bibtex"
        fi
    else
        if biber main >> compilation.log 2>&1; then
            print_success "Bibliografía procesada con biber"
        else
            print_warning "Error procesando bibliografía con biber"
        fi
    fi
else
    print_warning "No se encontró bibliografia.bib"
fi

# Segunda compilación - incorporar bibliografía
print_message "Segunda compilación: incorporando bibliografía..."
if pdflatex -interaction=nonstopmode main.tex >> compilation.log 2>&1; then
    print_success "Segunda compilación exitosa"
else
    print_warning "Warnings en segunda compilación. Ver compilation.log para detalles."
fi

# Tercera compilación - referencias cruzadas finales
print_message "Tercera compilación: resolviendo referencias cruzadas..."
if pdflatex -interaction=nonstopmode main.tex >> compilation.log 2>&1; then
    print_success "Tercera compilación exitosa"
else
    print_warning "Warnings en tercera compilación. Ver compilation.log para detalles."
fi

# Verificar que se generó el PDF
if [ -f "main.pdf" ]; then
    # Obtener información del PDF
    PDF_SIZE=$(du -h main.pdf | cut -f1)
    PDF_PAGES=$(pdfinfo main.pdf 2>/dev/null | grep "Pages:" | awk '{print $2}' || echo "N/A")
    
    print_success "¡PDF generado exitosamente!"
    echo ""
    echo -e "${GREEN}📄 Información del documento:${NC}"
    echo "   📂 Archivo: main.pdf"
    echo "   📊 Tamaño: $PDF_SIZE"
    echo "   📖 Páginas: $PDF_PAGES"
    echo ""
    
    # Renombrar con nombre descriptivo
    FINAL_NAME="TFB_EnergiApp_Oliver_Vincent_Rice_$(date +%Y%m%d).pdf"
    cp main.pdf "$FINAL_NAME"
    print_success "Copia creada: $FINAL_NAME"
    
else
    print_error "No se pudo generar el PDF. Revisa compilation.log para errores."
fi

# Mostrar warnings si los hay
if grep -i "warning\|error" compilation.log > /dev/null 2>&1; then
    print_warning "Se encontraron advertencias durante la compilación:"
    echo ""
    grep -i "warning\|error" compilation.log | head -10
    echo ""
    print_message "Ver compilation.log para detalles completos"
fi

# Limpiar archivos auxiliares (opcional)
read -p "¿Limpiar archivos auxiliares? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_message "Limpiando archivos auxiliares..."
    rm -f *.aux *.log *.bbl *.blg *.toc *.lof *.lot *.out *.fdb_latexmk *.fls *.synctex.gz
    rm -f capitulos/*.aux
    rm -f compilation.log
    print_success "Archivos auxiliares eliminados"
fi

# Abrir PDF si está disponible
if command -v xdg-open &> /dev/null; then
    read -p "¿Abrir el PDF generado? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open main.pdf &
    fi
elif command -v open &> /dev/null; then
    read -p "¿Abrir el PDF generado? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open main.pdf &
    fi
fi

echo ""
echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🎉 COMPILACIÓN COMPLETADA EXITOSAMENTE 🎉                ║
║                                                                              ║
║   La memoria del TFB ha sido generada correctamente en formato PDF          ║
║                                                                              ║
║                  📚 ¡Listo para presentación académica! 📚                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

print_success "Memoria del TFB compilada correctamente"
echo ""
echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo "   1. Revisar el PDF generado para verificar formato"
echo "   2. Comprobar que todas las referencias aparecen correctamente"
echo "   3. Validar numeración de páginas y estructura"
echo "   4. Preparar presentación para defensa del TFB"
echo ""
echo -e "${YELLOW}📞 Soporte:${NC}"
echo "   Si encuentras errores, revisa compilation.log"
echo "   Para problemas de LaTeX, consulta la documentación oficial"
echo ""

exit 0
