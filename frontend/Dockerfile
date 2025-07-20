# Dockerfile para el frontend React
# Plataforma de Energía Doméstica - Frontend

# Etapa de construcción
FROM node:18-alpine AS builder

LABEL maintainer="Oliver Vincent Rice <oliver@energia.com>"
LABEL description="Frontend React para plataforma de gestión energética doméstica"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --silent

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S nginx
RUN adduser -S nginx -u 1001

# Exponer puerto
EXPOSE 80

# Comando de salud
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
