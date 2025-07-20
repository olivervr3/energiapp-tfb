# Dockerfile para el backend Node.js
# Plataforma de Energía Doméstica - Backend API

# Usar Node.js 18 LTS como imagen base
FROM node:18-alpine

# Información del mantenedor
LABEL maintainer="Oliver Vincent Rice <oliver@energia.com>"
LABEL description="Backend API para plataforma de gestión energética doméstica"
LABEL version="1.0.0"

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Crear directorio de logs
RUN mkdir -p logs && chown nodejs:nodejs logs

# Cambiar a usuario no privilegiado
USER nodejs

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando de salud
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Comando de inicio
CMD ["npm", "start"]
