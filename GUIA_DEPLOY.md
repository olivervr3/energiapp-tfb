# 🚀 Guía de Despliegue en la Nube - EnergiApp TFB

## 🌟 Opciones de Hosting Recomendadas

### 1. 🟦 **Heroku** (Recomendado para demo académico)

#### Ventajas
- ✅ Despliegue gratuito disponible
- ✅ Fácil configuración
- ✅ Ideal para demostraciones académicas
- ✅ Soporte nativo para Node.js

#### Pasos de Despliegue
```bash
# 1. Instalar Heroku CLI
# Descargar de: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login en Heroku
heroku login

# 3. Crear aplicación
heroku create energiapp-tfb-demo

# 4. Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion_2024
heroku config:set PORT=3001

# 5. Deploy
git add .
git commit -m "Deploy v2.0 - Production ready"
git push heroku main
```

#### Configuración Heroku
```json
// Procfile (crear en raíz)
web: npm start
```

### 2. 🟢 **Railway** (Alternativa moderna)

#### Ventajas
- ✅ Más generoso con recursos gratuitos
- ✅ Despliegue automático desde GitHub
- ✅ Base de datos PostgreSQL incluida

#### Pasos
1. Conectar con GitHub en railway.app
2. Seleccionar repositorio
3. Configurar variables de entorno
4. Deploy automático

### 3. 🔵 **Vercel** (Solo Frontend) + **Railway** (Backend)

#### Para Frontend
```bash
# En carpeta frontend/
npx vercel --prod
```

#### Para Backend
- Usar Railway o Heroku para la API

### 4. ☁️ **Amazon AWS EC2** (Producción real)

#### Configuración básica
```bash
# 1. Crear instancia EC2 Ubuntu
# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clonar proyecto
git clone tu-repositorio.git
cd energiapp-tfb

# 4. Instalar dependencias
npm run setup

# 5. Configurar PM2 para producción
npm install -g pm2
pm2 start server.js --name "energiapp"
pm2 startup
pm2 save
```

## 🔧 Configuración de Variables de Entorno para Producción

### Archivo .env.production (ya creado)
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion_2024
JWT_EXPIRES_IN=7d
DB_PATH=./database.sqlite
CORS_ORIGIN=https://tu-dominio.com,https://tu-app.herokuapp.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Variables Adicionales para la Nube
```env
# Para base de datos en la nube (opcional)
DATABASE_URL=postgres://usuario:password@host:port/database

# Para storage de archivos
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_S3_BUCKET=energiapp-storage

# Para emails (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-app
```

## 📱 Configuración de Dominio Personalizado

### Con Heroku
```bash
# Añadir dominio personalizado
heroku domains:add tu-dominio.com
heroku domains:add www.tu-dominio.com

# Configurar SSL automático
heroku certs:auto:enable
```

### Configuración DNS
```
Tipo: CNAME
Nombre: www
Valor: tu-app.herokuapp.com

Tipo: ALIAS/ANAME
Nombre: @
Valor: tu-app.herokuapp.com
```

## 🗄️ Base de Datos en Producción

### Opción 1: SQLite (actual)
- ✅ Funciona bien para demos
- ⚠️ Limitaciones en la nube (Heroku reinicia)

### Opción 2: PostgreSQL
```bash
# Heroku Postgres (gratuito)
heroku addons:create heroku-postgresql:hobby-dev

# Migrar de SQLite a PostgreSQL
npm install pg pg-hstore
# Actualizar config/database.js
```

### Opción 3: MongoDB Atlas
```bash
npm install mongoose
# Conectar a cluster gratuito de MongoDB
```

## 🔒 Configuración de Seguridad Avanzada

### Headers de Seguridad
```javascript
// Ya implementado en server.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));
```

### HTTPS Forzado
```javascript
// Middleware para forzar HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

## 📊 Monitoreo en Producción

### Logs con Winston (opcional)
```bash
npm install winston
```

### Health Checks
```javascript
// Ya implementado en /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime()
  });
});
```

### Métricas básicas
- Tiempo de respuesta
- Uso de memoria
- Requests por minuto
- Errores 4xx/5xx

## 🚀 Deploy Rápido para Demo Académico

### ⚡ OPCIÓN RECOMENDADA: Railway
```bash
# 1. ✅ CÓDIGO YA SUBIDO A GITHUB
# Repositorio: https://github.com/olivervr3/energiapp-tfb

# 2. Ir a railway.app
# → Login con GitHub
# → New Project → Deploy from GitHub repo
# → Seleccionar "olivervr3/energiapp-tfb"
# → Variables de entorno:
#   NODE_ENV=production
#   JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion_2024

# ¡Listo! Tu app estará en:
# https://energiapp-tfb-production.up.railway.app
```

### Tiempo estimado: 5-10 minutos

### 🟦 Alternativa: Heroku
```bash
# 1. Crear cuenta en heroku.com
# 2. Instalar Heroku CLI
# 3. Clonar tu repo y configurar Heroku:

git clone https://github.com/olivervr3/energiapp-tfb.git
cd energiapp-tfb

heroku create energiapp-tfb-[tu-nombre]
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=super_secret_key_2024

git push heroku main

# ¡Listo! Tu app estará en:
# https://energiapp-tfb-[tu-nombre].herokuapp.com
```

## 🌐 URLs de Ejemplo

Después del deploy, tendrás:
- **App Principal**: https://energiapp-tfb-production.up.railway.app
- **API Health**: https://energiapp-tfb-production.up.railway.app/api/health
- **Login**: https://energiapp-tfb-production.up.railway.app (credenciales normales)
- **Admin**: Mismo login con admin@energiapp.com

### Con Heroku:
- **App Principal**: https://energiapp-tfb-[tu-nombre].herokuapp.com
- **API Health**: https://energiapp-tfb-[tu-nombre].herokuapp.com/api/health

## ✅ Checklist Pre-Deploy

- [ ] Build de frontend creado (`npm run build`)
- [ ] Variables de entorno configuradas
- [ ] Base de datos con datos de prueba
- [ ] Credenciales de admin y usuario funcionando
- [ ] CORS configurado para dominio de producción
- [ ] HTTPS configurado
- [ ] Health check funcionando

## 🆘 Troubleshooting

### Error: "App crashed"
```bash
heroku logs --tail
# Revisar los logs para identificar el error
```

### Error: Base de datos
```bash
# Verificar que SQLite esté incluido
npm install sqlite3 --save
```

### Error: Puerto
```javascript
// Asegurar que use PORT dinámico
const PORT = process.env.PORT || 3001;
```

## 📞 Soporte para la Tutora

### URLs de Prueba (tras deploy)
1. **Demo Live**: https://energiapp-tfb-production.up.railway.app
2. **API Status**: https://energiapp-tfb-production.up.railway.app/api/health
3. **Documentación**: https://energiapp-tfb-production.up.railway.app/api/docs

### Credenciales de Acceso
```
Usuario Demo:
📧 test@test.com
🔑 Test123456

Administrador:
📧 admin@energiapp.com  
🔑 Admin123456
```

### Funcionalidades a Probar
1. ✅ Login con ambos tipos de usuario
2. ✅ Dashboard diferenciado por rol
3. ✅ Visualización de datos
4. ✅ API endpoints funcionando
5. ✅ Responsive design en móvil

---

**¡Tu TFB estará online y listo para evaluación en menos de 30 minutos!** 🎓
