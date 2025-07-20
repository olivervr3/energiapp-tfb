# INSTRUCCIONES FINALES DE DESPLIEGUE

## ESTADO ACTUAL
- Repositorio configurado: https://github.com/olivervr3/energiapp-tfb
- Archivos de Render creados
- Todo listo para deploy

## PASOS FINALES

### 1. Hacer repositorio público
En la página de settings de GitHub que se abrió:
- Scroll down hasta "Danger Zone"
- Click "Change repository visibility"
- Seleccionar "Make public"
- Confirmar

### 2. Configurar Render
En la página de Render que se abrió:
- Click "Get Started for Free"
- Login con GitHub
- Autorizar Render
- Click "New Web Service"
- Conectar tu repositorio: olivervr3/energiapp-tfb
- Configuración:
  - Build Command: npm install
  - Start Command: npm start
  - Variables de entorno:
    NODE_ENV=production
    JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion_2024

### 3. Deploy
- Click "Create Web Service"
- Render comenzará el build automáticamente
- En 5-10 minutos tendrás tu URL

## RESULTADO
URL final: https://energiapp-tfb-[random].onrender.com

## CREDENCIALES PARA TUTORA
Usuario: test@test.com / Test123456
Admin: admin@energiapp.com / Admin123456

## DESARROLLO CONTINUO
git add .
git commit -m "cambios"
git push origin main
(Render redespliega automáticamente)

## TIEMPO ESTIMADO: 10 minutos total
