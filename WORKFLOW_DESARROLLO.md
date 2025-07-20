# WORKFLOW DE DESARROLLO - EnergiApp TFB

## ESTRUCTURA DE RAMAS

### main (PRODUCCIÓN)
- **Propósito**: Código estable en producción
- **Deploy**: Automático en Render
- **URL**: https://energiapp-tfb-production.onrender.com
- **Protección**: Solo merge desde develop via Pull Request

### develop (DESARROLLO)
- **Propósito**: Integración de nuevas funcionalidades
- **Testing**: Ambiente de desarrollo local
- **Merge**: Features completadas y probadas

## FLUJO DE TRABAJO

### 1. Para nuevas funcionalidades:
```bash
# Crear feature branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad

# Desarrollar...
git add .
git commit -m "feat: descripción de la funcionalidad"

# Merge a develop
git checkout develop
git merge feature/nombre-funcionalidad
git push origin develop
```

### 2. Para bugs:
```bash
# Crear hotfix branch desde develop
git checkout develop
git checkout -b fix/descripción-bug

# Arreglar bug...
git add .
git commit -m "fix: descripción del arreglo"

# Merge a develop
git checkout develop
git merge fix/descripción-bug
git push origin develop
```

### 3. Para release a producción:
```bash
# Desde develop cuando esté listo
git checkout main
git merge develop
git push origin main

# Render redesplegarĂ automáticamente
```

## ESTADO ACTUAL

### Rama main:
- ✅ Servidor de producción funcional
- ✅ Base de datos inicializada automáticamente
- ✅ Login con usuarios por defecto
- ✅ Frontend React integrado
- ✅ API backend completa

### Rama develop (actual):
- 🔄 Preparada para nuevas mejoras
- 🔄 Testing de funcionalidades
- 🔄 Integración continua

## PRÓXIMAS MEJORAS EN DEVELOP

### Funcionalidades pendientes:
- [ ] Mejorar dashboard con más gráficos
- [ ] Implementar sistema de notificaciones
- [ ] Añadir más tipos de dispositivos IoT
- [ ] Optimizar rendimiento de consultas
- [ ] Añadir tests unitarios
- [ ] Mejorar documentación API

### Bugs conocidos:
- [ ] Verificar funcionamiento completo del login en producción
- [ ] Optimizar tiempo de carga inicial
- [ ] Revisar responsive design en móviles

## COMANDOS ÚTILES

```bash
# Ver rama actual
git branch

# Cambiar a develop
git checkout develop

# Cambiar a main
git checkout main

# Ver estado del repositorio
git status

# Ver commits recientes
git log --oneline -10

# Ver diferencias entre ramas
git diff main..develop
```

## REGLAS DE DESARROLLO

1. **NUNCA** hacer push directo a main
2. **SIEMPRE** desarrollar en develop o feature branches
3. **PROBAR** localmente antes de hacer merge
4. **COMMITEAR** frecuentemente con mensajes descriptivos
5. **SINCRONIZAR** develop regularmente

---

**ESTADO**: Rama develop creada y configurada
**PRÓXIMO PASO**: Implementar mejoras en develop, luego merge a main cuando esté listo
