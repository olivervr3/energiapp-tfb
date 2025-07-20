# Dockerfile para ML API en Python
# Plataforma de Energía Doméstica - Machine Learning API

# Usar Python 3.11 slim como imagen base
FROM python:3.11-slim

LABEL maintainer="Oliver Vincent Rice <oliver@energia.com>"
LABEL description="API de Machine Learning para predicción de consumo energético"
LABEL version="1.0.0"

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no privilegiado
RUN useradd --create-home --shell /bin/bash app

# Copiar requirements primero para aprovechar cache de Docker
COPY requirements.txt .

# Actualizar pip e instalar dependencias Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY --chown=app:app . .

# Crear directorios necesarios
RUN mkdir -p models data logs && \
    chown -R app:app models data logs

# Cambiar a usuario no privilegiado
USER app

# Exponer puerto
EXPOSE 5000

# Variables de entorno
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Comando de salud
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/api/ml/estado')" || exit 1

# Comando de inicio
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
