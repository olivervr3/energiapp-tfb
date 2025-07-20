# EnergiApp - Plataforma Inteligente de Gestión Energética

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://python.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Trabajo Final de Grado - Ingeniería Informática

**Universidad:** Universitat Carlemany  
**Fecha de Entrega:** Julio 2025  
**Área:** Inteligencia Artificial Aplicada + Sistemas Web Avanzados

---

## Descripción del Proyecto

EnergiApp es una plataforma web inteligente para la visualización, predicción y optimización automática del consumo energético doméstico. Integra inteligencia artificial aplicada, simulación IoT realista y algoritmos de machine learning para proporcionar una experiencia completa de gestión energética.

### Características Principales

- **Predicciones ML Avanzadas:** Algoritmos Random Forest + XGBoost basados en dataset UK-DALE (432,000 muestras)
- **Simulación IoT Realista:** Más de 15 tipos de dispositivos con patrones de consumo auténticos
- **Recomendaciones Inteligentes:** Sistema de IA que genera optimizaciones personalizadas
- **Dashboard Profesional:** Interfaz moderna con métricas en tiempo real
- **Automatización Completa:** Optimización energética automática

---

## Inicio Rápido

### Configuración Automática

```bash
# Opción 1: Script automatizado (Recomendado)
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh

# Opción 2: Instalación manual
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../ml-models && pip install -r requirements.txt
```

### URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interfaz de usuario principal |
| **Backend API** | http://localhost:3001 | API REST del servidor |
| **ML Service** | http://localhost:8000 | Servicio de Machine Learning |

### Usuarios de Prueba

| Rol | Usuario | Contraseña | Funcionalidades |
|-----|---------|------------|-----------------|
| **Administrador** | `admin` | `Admin123456` | Panel administrativo completo, gestión de usuarios, estadísticas del sistema |
| **Usuario de Prueba** | `test` | `Test123456` | Predicciones ML, recomendaciones IA, control de dispositivos |

---

## Funcionalidades Principales

### Machine Learning Avanzado

#### Predicciones Inteligentes
- **Algoritmos:** Random Forest + XGBoost con precisión R² = 0.92 (92%)
- **Dataset:** UK-DALE con 432,000 muestras reales de consumo doméstico
- **Predicciones:** 1-7 días con información completa (clima, consumo, costos, picos)
- **Tiempo Real:** Actualización automática cada 30 segundos

#### Métricas de Precisión
```python
# Resultados del modelo ML
{
  "algorithm": "Random Forest + XGBoost",
  "dataset": "UK-DALE (432k samples)",
  "accuracy_metrics": {
    "rmse": "0.89 kWh",
    "mae": "0.67 kWh",
    "r_squared": "0.92"
  },
  "features": [
    "hour_of_day", "day_of_week", "month", 
    "temperature", "humidity", "occupancy", "device_power"
  ]
}
```

### Recomendaciones Inteligentes

#### Optimización Automatizada
- **Detección Automática:** Escanea dispositivos disponibles del usuario
- **Acciones Directas:** Control de standby, climatización, programación de electrodomésticos
- **Validación Previa:** Solo muestra opciones para dispositivos controlables
- **Cálculo de Ahorros:** Métricas económicas reales post-optimización

### Simulación IoT Realista

#### Dispositivos Soportados
| Dispositivo | Consumo Típico | Patrones de Uso | Control Disponible |
|-------------|----------------|-----------------|-------------------|
| **Termostato** | 150-2000W | Ciclos térmicos estacionales | Temperatura, horarios programables |
| **Lavadora** | 500-2200W | Ciclos de lavado familiares | Programación eco-mode |
| **Lavavajillas** | 1200-1800W | Uso post-comidas | Inicio diferido, modo eco |
| **Iluminación LED** | 8-75W por zona | Ocupación inteligente | Dimming, sensores de movimiento |
| **Frigorífico** | 120-180W | Ciclos de compresor | Modo eco, gestión de temperatura |
| **TV/Entretenimiento** | 85-220W | Horarios familiares | Standby automático, temporizadores |

### Dashboard Profesional

#### Métricas en Tiempo Real
```javascript
// Datos del dashboard
{
  "current_consumption": "1.85 kW",
  "daily_projection": "28.5 kWh",
  "estimated_cost": "€4.23",
  "efficiency_score": 87,
  "active_devices": 12,
  "ml_predictions": {
    "next_hour": "2.1 kW",
    "peak_time": "19:45",
    "optimization_potential": "15%"
  }
}
```

#### Características de la Interfaz
- **Diseño Responsive:** Optimizado para móvil, tablet y desktop
- **Actualización en Tiempo Real:** WebSocket para datos instantáneos
- **Gráficos Interactivos:** Chart.js para visualizaciones avanzadas
- **Tema Profesional:** Paleta de colores corporativa y tipografía moderna

---

## Arquitectura Técnica

### Stack Tecnológico

#### Frontend (React 18)
```javascript
{
  "framework": "React 18.2.0",
  "styling": "CSS Modules + Sistema de Diseño Profesional",
  "charts": "Chart.js + React-Chartjs-2",
  "routing": "React Router v6",
  "state": "React Context + Hooks",
  "build": "Create React App optimizado"
}
```

#### Backend (Node.js)
```javascript
{
  "runtime": "Node.js 18+",
  "framework": "Express.js",
  "database": "SQLite con esquemas optimizados",
  "auth": "JWT + bcrypt",
  "cors": "Configurado para desarrollo y producción",
  "logging": "Winston para auditoría completa"
}
```

#### Machine Learning (Python)
```python
{
  "runtime": "Python 3.8+",
  "framework": "Flask + scikit-learn",
  "algorithms": ["RandomForestRegressor", "XGBoostRegressor"],
  "dataset": "UK-DALE processed (432k samples)",
  "features_engineering": "Temporal + Environmental + Behavioral",
  "model_persistence": "joblib serialization"
}
```

### Estructura del Proyecto

```
energiapp-tfb/
├── frontend/                 # React 18 aplicación
│   ├── src/
│   │   ├── App.js           # Componente principal
│   │   ├── App_new.css      # Estilos profesionales
│   │   └── components/      # Componentes reutilizables
│   └── build/               # Build de producción
├── backend/                 # Node.js API server
│   ├── server.js           # Servidor principal
│   ├── database.js         # Configuración SQLite
│   ├── database.sqlite     # Base de datos
│   └── src/
│       ├── routes/         # Endpoints API
│       ├── models/         # Modelos de datos
│       └── middleware/     # Middleware personalizado
├── ml-models/              # Servicio Python ML
│   ├── app.py             # Flask server
│   ├── prediction_service.py  # Algoritmos ML
│   ├── models/            # Modelos entrenados
│   └── requirements.txt   # Dependencias Python
└── documentacion/         # Documentación académica
    ├── main.tex          # Documento principal LaTeX
    ├── capitulos/        # Capítulos del TFG
    └── figuras/          # Gráficos y diagramas
```

---

## Instalación Detallada

### Prerrequisitos
- Node.js 18+ y npm
- Python 3.8+ y pip
- Git para clonar repositorio

### Paso a Paso

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd energiapp-tfb
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontend
npm install
```

4. **Instalar dependencias de ML**
```bash
cd ../ml-models
pip install -r requirements.txt
```

5. **Inicializar base de datos**
```bash
cd ../backend
node database.js
```

### Configuración de Entorno

Crear archivo `.env` en la raíz del proyecto:
```bash
# Configuración de desarrollo
NODE_ENV=development
PORT=3001
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Base de datos
DATABASE_PATH=./backend/database.sqlite

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

---

## Uso de la Aplicación

### 1. Iniciar los Servicios

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm start

# Terminal 3: ML Service
cd ml-models
python app.py
```

### 2. Acceder a la Aplicación

Abrir navegador en `http://localhost:3000`

### 3. Login de Prueba

| Credenciales | Descripción |
|--------------|-------------|
| `admin` / `Admin123456` | Cuenta administrativa completa |
| `test` / `Test123456` | Usuario con dispositivos de ejemplo |

### 4. Funcionalidades Disponibles

- **Dashboard:** Métricas en tiempo real y predicciones ML
- **Dispositivos:** Gestión y control de dispositivos IoT
- **Predicciones:** Análisis energético con IA para 1-7 días
- **Análisis:** Gráficos de tendencias y consumo histórico
- **Recomendaciones:** Optimizaciones automáticas personalizadas
- **Admin (solo admin):** Gestión de usuarios y sistema

---

## Desarrollo y Contribución

### Scripts Disponibles

```bash
# Frontend
npm start          # Desarrollo con hot reload
npm run build      # Build de producción
npm test           # Tests unitarios

# Backend
npm start          # Servidor con nodemon
npm run prod       # Modo producción
npm run test       # Tests de API

# ML Service
python app.py      # Servidor Flask desarrollo
python -m pytest  # Tests de modelos ML
```

### Testing

```bash
# Ejecutar tests completos
npm run test:all

# Tests por módulo
npm run test:frontend
npm run test:backend
npm run test:ml
```

### Build de Producción

```bash
# Build completo
npm run build:all

# Deploy-ready
npm run deploy:prep
```

---

## Documentación Académica

La documentación completa del Trabajo Final de Grado está disponible en el directorio `/documentacion/`:

- **main.pdf:** Documento completo del TFG
- **main.tex:** Código fuente LaTeX
- **capitulos/:** Capítulos individuales
- **figuras/:** Diagramas y gráficos técnicos

### Compilar Documentación

```bash
cd documentacion
pdflatex main.tex
biber main
pdflatex main.tex
pdflatex main.tex
```

---

## Tecnologías y Algoritmos

### Machine Learning

- **Random Forest Regressor:** Predicción base con robustez
- **XGBoost:** Optimización de gradiente para precisión
- **Feature Engineering:** Variables temporales, ambientales y comportamentales
- **Dataset UK-DALE:** Datos reales de consumo doméstico británico

### Base de Datos

- **SQLite:** Base de datos embebida para desarrollo
- **Esquemas Optimizados:** Índices y relaciones eficientes
- **Migraciones:** Versionado de esquema automático

### Seguridad

- **JWT Authentication:** Tokens seguros con expiración
- **bcrypt:** Hash de contraseñas con salt
- **CORS:** Configuración específica por entorno
- **Validación:** Sanitización de inputs en frontend y backend

---

## Deployment

### Desarrollo Local
```bash
npm run dev:all
```

### Producción
```bash
npm run build:all
npm run start:prod
```

### Docker (Opcional)
```bash
docker-compose up --build
```

---

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## Contacto

Este proyecto es parte de un Trabajo Final de Grado en Ingeniería Informática.

**Universidad:** Universitat Carlemany  
**Fecha:** Julio 2025  
**Repositorio:** Proyecto académico

