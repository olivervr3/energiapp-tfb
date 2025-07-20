# 🚀 PASOS PARA HOSTEAR TU TFB EN LA NUBE

## ⚡ OPCIÓN 1: Railway (RECOMENDADO - MÁS RÁPIDO)

### Paso 1: Crear repositorio en GitHub
```bash
# Ve a github.com y crea un nuevo repositorio llamado "energiapp-tfb"
# Luego ejecuta:

git remote add origin https://github.com/[TU-USUARIO]/energiapp-tfb.git
git branch -M main
git push -u origin main
```

### Paso 2: Desplegar en Railway
1. **Ve a [railway.app](https://railway.app)**
2. **Regístrate/Login** con tu cuenta de GitHub
3. **Click en "New Project"**
4. **Selecciona "Deploy from GitHub repo"**
5. **Conecta tu repositorio** `energiapp-tfb`
6. **Railway detectará automáticamente** que es una app Node.js
7. **Configura variables de entorno:**
   ```
   NODE_ENV=production
   JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion_2024
   PORT=3001
   ```
8. **Deploy automático** - ¡Estará listo en 3-5 minutos!

### Tu URL será algo como:
**https://energiapp-tfb-production.up.railway.app**

---

## 🌐 OPCIÓN 2: Heroku (Alternativa)

### Paso 1: Crear cuenta y CLI
```bash
# Instalar Heroku CLI desde: https://devcenter.heroku.com/articles/heroku-cli
heroku login
```

### Paso 2: Crear app y deploy
```bash
heroku create energiapp-tfb-[tu-nombre]
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion_2024

git push heroku main
```

### Tu URL será:
**https://energiapp-tfb-[tu-nombre].herokuapp.com**

---

## ✅ RESULTADO FINAL

### Para tu tutora:
- **URL Demo**: https://tu-app-hosteada.com
- **Usuario**: test@test.com / Test123456
- **Admin**: admin@energiapp.com / Admin123456

### Workflow de desarrollo:
```bash
# Hacer cambios en local
git add .
git commit -m "Nueva feature agregada"
git push origin main

# Railway redesplegará automáticamente en 2-3 minutos
```

---

## 🎯 RAILWAY ES LA MEJOR OPCIÓN PORQUE:
- ✅ **Despliegue automático** desde GitHub
- ✅ **Más recursos gratuitos** (500h/mes vs 550h/mes de Heroku)
- ✅ **Mejor rendimiento**
- ✅ **SSL automático**
- ✅ **Domain personalizado gratuito**
- ✅ **CI/CD integrado**

**Tiempo total de setup: 5-10 minutos** ⚡
