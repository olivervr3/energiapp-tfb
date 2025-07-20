# EnergiApp - Guía de Deployment en Render

## 🚀 Configuración Completada

Los siguientes archivos han sido corregidos para el deployment en Render:

### ✅ Archivos de Configuración Actualizados:

1. **`package.json`** (raíz)
   - `"main": "backend/server.js"`
   - `"start": "node backend/server.js"`
   - `"dev": "nodemon backend/server.js"`

2. **`render.yaml`**
   ```yaml
   version: "2"
   build:
     commands:
       - npm install
       - cd backend && npm install && cd ..
       - cd frontend && npm install && npm run build && cd ..
   start:
     command: NODE_ENV=production node backend/server.js
   ```

3. **`Procfile`**
   ```
   web: node backend/server.js
   ```

4. **`backend/server.js`**
   - ✅ Servir archivos estáticos del frontend en producción
   - ✅ Ruta catch-all para SPA routing
   - ✅ CORS configurado para producción
   - ✅ Configuración NODE_ENV=production

## 🔧 Pasos para Deployment en Render

### 1. Crear Nuevo Web Service
- Conectar repositorio GitHub
- Seleccionar rama: `main`
- Build Command: Se ejecutará automáticamente desde `render.yaml`
- Start Command: Se ejecutará automáticamente desde `render.yaml`

### 2. Variables de Entorno
Configurar en Render Dashboard:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://tu-app.onrender.com
```

### 3. Configuración de Red
- **Región:** Frankfurt (para mejor latencia europea)
- **Plan:** Free o Starter (según necesidades)
- **Auto-Deploy:** Habilitado desde rama main

## 🎯 Verificación del Deployment

### ✅ Checklist Post-Deployment:

1. **Backend API**
   - [ ] `https://tu-app.onrender.com/api/health` → Status 200
   - [ ] `https://tu-app.onrender.com/api/dashboard` → JSON response

2. **Frontend**
   - [ ] `https://tu-app.onrender.com/` → Aplicación React carga
   - [ ] Login funciona correctamente
   - [ ] Navegación entre secciones

3. **Funcionalidades**
   - [ ] Autenticación (admin/Admin123456, test/Test123456)
   - [ ] Dashboard muestra datos
   - [ ] Gestión de dispositivos
   - [ ] Panel de administración

## 🔍 Troubleshooting

### Error Común Resuelto:
```
Error: Cannot find module '/opt/render/project/src/server.js'
```
**Solución:** ✅ Corregido - Ahora apunta a `backend/server.js`

### Otros Posibles Errores:

1. **Build Timeout**
   - Causa: Frontend build toma mucho tiempo
   - Solución: Optimizar dependencias o usar plan pagado

2. **Missing Dependencies**
   - Causa: Dependencias no instaladas correctamente
   - Solución: Verificar que `npm install` se ejecute en todas las carpetas

3. **CORS Errors**
   - Causa: Frontend no puede conectar al backend
   - Solución: ✅ Ya configurado para dominios de producción

## 📊 Estructura de Deployment

```
energiapp-tfb/
├── backend/
│   ├── server.js          # ← Punto de entrada principal
│   ├── package.json       # Dependencias del backend
│   └── database.js        # Base de datos SQLite
├── frontend/
│   ├── src/               # Código fuente React
│   ├── build/             # ← Generado por npm run build
│   └── package.json       # Dependencias del frontend
├── package.json           # ← Configuración principal
├── render.yaml            # ← Configuración Render
└── Procfile              # ← Configuración alternativa
```

## 🌐 URLs Esperadas

Una vez deployado en Render:

- **Frontend:** `https://energiapp-tfb.onrender.com/`
- **API Health:** `https://energiapp-tfb.onrender.com/api/health`
- **Login API:** `https://energiapp-tfb.onrender.com/api/auth/login`
- **Dashboard API:** `https://energiapp-tfb.onrender.com/api/dashboard`

## 💡 Notas Importantes

1. **Primera carga:** El servicio free de Render se "duerme" después de 15 min de inactividad
2. **Cold start:** Primera petición después del sueño puede tardar 30-60 segundos
3. **SSL:** Render proporciona HTTPS automáticamente
4. **Logs:** Disponibles en el dashboard de Render para debugging

## 🚀 Estado Actual

✅ **LISTO PARA DEPLOYMENT**
- Todas las configuraciones han sido corregidas
- Código pusheado a la rama main
- Archivos de configuración actualizados
- Backend configurado para servir frontend
- CORS configurado para producción

### Próximo Paso:
Crear el Web Service en Render y conectar el repositorio GitHub.
