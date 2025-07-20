"""
Plataforma de Machine Learning para Predicción de Consumo Energético Doméstico
API Flask integrada con modelos UK-DALE entrenados

Autor: Oliver Vincent Rice
Universidad: Universitat Carlemany
Fecha: Julio 2025
"""

import os
import sys
from datetime import datetime, timedelta
import logging
import json

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ml_api.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Librerías para API
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

# Importar el servicio de predicción
try:
    from prediction_service import prediction_service
    logger.info("✅ Servicio de predicción cargado exitosamente")
except ImportError as e:
    logger.error(f"❌ Error cargando servicio de predicción: {e}")
    prediction_service = None

# Configuración de la aplicación Flask
app = Flask(__name__)
CORS(app)  # Habilitar CORS para requests desde el frontend

# Configuración
CONFIG = {
    'PORT': int(os.getenv('PORT', 5001)),
    'DEBUG': os.getenv('DEBUG', 'True').lower() == 'true',
    'HOST': os.getenv('HOST', '0.0.0.0')
}
MODEL_PATH = 'models/'
DATA_PATH = 'data/'

# Crear directorios si no existen
os.makedirs(MODEL_PATH, exist_ok=True)
os.makedirs(DATA_PATH, exist_ok=True)

# Variables globales para modelos
modelos_entrenados = {}
scalers = {}
encoders = {}

class EnergyPredictor:
    """
    Clase principal para predicción de consumo energético
    """
    
    def __init__(self):
        self.modelos = {
            'random_forest': RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            ),
            'linear_regression': LinearRegression(),
            'ridge': Ridge(alpha=1.0)
        }
        self.mejor_modelo = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
        
    def preparar_caracteristicas(self, df):
        """
        Prepara las características para el modelo de ML
        """
        try:
            # Crear copia del DataFrame
            df_features = df.copy()
            
            # Convertir timestamp a datetime si es necesario
            if 'timestamp' in df_features.columns:
                df_features['timestamp'] = pd.to_datetime(df_features['timestamp'])
                
                # Extraer características temporales
                df_features['hora'] = df_features['timestamp'].dt.hour
                df_features['dia_semana'] = df_features['timestamp'].dt.dayofweek
                df_features['mes'] = df_features['timestamp'].dt.month
                df_features['trimestre'] = df_features['timestamp'].dt.quarter
                df_features['es_fin_semana'] = (df_features['timestamp'].dt.dayofweek >= 5).astype(int)
                
                # Verificar si es día festivo (España)
                es_holidays = holidays.Spain()
                df_features['es_festivo'] = df_features['timestamp'].dt.date.apply(
                    lambda x: 1 if x in es_holidays else 0
                )
                
                # Características cíclicas para hora y día
                df_features['hora_sin'] = np.sin(2 * np.pi * df_features['hora'] / 24)
                df_features['hora_cos'] = np.cos(2 * np.pi * df_features['hora'] / 24)
                df_features['dia_sin'] = np.sin(2 * np.pi * df_features['dia_semana'] / 7)
                df_features['dia_cos'] = np.cos(2 * np.pi * df_features['dia_semana'] / 7)
                
            # Características del dispositivo
            if 'potencia_nominal' in df_features.columns:
                # Normalizar potencia nominal
                df_features['potencia_normalizada'] = df_features['potencia_nominal'] / 1000  # kW
                
            # Variables categóricas
            categorical_columns = ['tipo_dispositivo', 'ubicacion', 'eficiencia_energetica']
            for col in categorical_columns:
                if col in df_features.columns:
                    if col not in self.label_encoders:
                        self.label_encoders[col] = LabelEncoder()
                        df_features[f'{col}_encoded'] = self.label_encoders[col].fit_transform(
                            df_features[col].astype(str)
                        )
                    else:
                        try:
                            df_features[f'{col}_encoded'] = self.label_encoders[col].transform(
                                df_features[col].astype(str)
                            )
                        except ValueError:
                            # Manejar categorías no vistas
                            df_features[f'{col}_encoded'] = 0
            
            # Estadísticas móviles (si hay suficientes datos)
            if 'consumo_kwh' in df_features.columns and len(df_features) > 24:
                df_features['consumo_media_24h'] = df_features['consumo_kwh'].rolling(
                    window=24, min_periods=1
                ).mean()
                df_features['consumo_std_24h'] = df_features['consumo_kwh'].rolling(
                    window=24, min_periods=1
                ).std().fillna(0)
                df_features['consumo_media_7d'] = df_features['consumo_kwh'].rolling(
                    window=168, min_periods=1
                ).mean()
            
            # Lag features (valores anteriores)
            if 'consumo_kwh' in df_features.columns:
                for lag in [1, 24, 168]:  # 1h, 24h, 7 días
                    if len(df_features) > lag:
                        df_features[f'consumo_lag_{lag}'] = df_features['consumo_kwh'].shift(lag)
            
            # Rellenar valores NaN
            df_features = df_features.fillna(method='forward').fillna(0)
            
            # Seleccionar características numéricas para el modelo
            feature_columns = [
                'hora', 'dia_semana', 'mes', 'trimestre', 'es_fin_semana', 'es_festivo',
                'hora_sin', 'hora_cos', 'dia_sin', 'dia_cos'
            ]
            
            # Añadir características adicionales si existen
            optional_features = [
                'potencia_normalizada', 'temperatura_ambiente', 'humedad',
                'consumo_media_24h', 'consumo_std_24h', 'consumo_media_7d'
            ]
            
            for feature in optional_features:
                if feature in df_features.columns:
                    feature_columns.append(feature)
            
            # Añadir lag features
            lag_features = [col for col in df_features.columns if 'consumo_lag_' in col]
            feature_columns.extend(lag_features)
            
            # Añadir features categóricas codificadas
            encoded_features = [col for col in df_features.columns if '_encoded' in col]
            feature_columns.extend(encoded_features)
            
            # Filtrar columnas que realmente existen
            feature_columns = [col for col in feature_columns if col in df_features.columns]
            
            self.feature_names = feature_columns
            
            return df_features[feature_columns]
            
        except Exception as e:
            logger.error(f"Error preparando características: {str(e)}")
            raise
    
    def entrenar_modelos(self, df, target_column='consumo_kwh'):
        """
        Entrena múltiples modelos y selecciona el mejor
        """
        try:
            logger.info("Iniciando entrenamiento de modelos...")
            
            # Preparar características
            X = self.preparar_caracteristicas(df)
            y = df[target_column]
            
            # Verificar que tenemos suficientes datos
            if len(X) < 100:
                raise ValueError("Se necesitan al menos 100 registros para entrenar el modelo")
            
            # Dividir datos
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, shuffle=False
            )
            
            # Escalar características
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Entrenar y evaluar modelos
            resultados = {}
            
            for nombre, modelo in self.modelos.items():
                logger.info(f"Entrenando modelo: {nombre}")
                
                # Entrenar modelo
                modelo.fit(X_train_scaled, y_train)
                
                # Predicciones
                y_pred_train = modelo.predict(X_train_scaled)
                y_pred_test = modelo.predict(X_test_scaled)
                
                # Métricas
                train_mae = mean_absolute_error(y_train, y_pred_train)
                test_mae = mean_absolute_error(y_test, y_pred_test)
                train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
                test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
                train_r2 = r2_score(y_train, y_pred_train)
                test_r2 = r2_score(y_test, y_pred_test)
                
                # Validación cruzada
                cv_scores = cross_val_score(
                    modelo, X_train_scaled, y_train, 
                    cv=5, scoring='neg_mean_absolute_error'
                )
                cv_mae = -cv_scores.mean()
                
                resultados[nombre] = {
                    'train_mae': train_mae,
                    'test_mae': test_mae,
                    'train_rmse': train_rmse,
                    'test_rmse': test_rmse,
                    'train_r2': train_r2,
                    'test_r2': test_r2,
                    'cv_mae': cv_mae,
                    'modelo': modelo
                }
                
                logger.info(f"{nombre} - Test MAE: {test_mae:.4f}, Test R²: {test_r2:.4f}")
            
            # Seleccionar mejor modelo (menor MAE en test)
            mejor_nombre = min(resultados.keys(), key=lambda k: resultados[k]['test_mae'])
            self.mejor_modelo = resultados[mejor_nombre]['modelo']
            
            logger.info(f"Mejor modelo seleccionado: {mejor_nombre}")
            
            # Guardar modelos
            self.guardar_modelos()
            
            return {
                'mejor_modelo': mejor_nombre,
                'resultados': {k: {metric: v for metric, v in v.items() if metric != 'modelo'} 
                             for k, v in resultados.items()}
            }
            
        except Exception as e:
            logger.error(f"Error entrenando modelos: {str(e)}")
            raise
    
    def predecir(self, df_input, periodos_futuros=24):
        """
        Realiza predicciones de consumo energético
        """
        try:
            if self.mejor_modelo is None:
                raise ValueError("No hay modelo entrenado disponible")
            
            # Preparar características
            X = self.preparar_caracteristicas(df_input)
            
            # Escalar características
            X_scaled = self.scaler.transform(X)
            
            # Realizar predicción
            predicciones = self.mejor_modelo.predict(X_scaled)
            
            # Calcular intervalos de confianza (aproximación)
            if hasattr(self.mejor_modelo, 'predict'):
                # Para modelos de ensemble, usar desviación estándar de los árboles
                if hasattr(self.mejor_modelo, 'estimators_'):
                    pred_trees = np.array([tree.predict(X_scaled) for tree in self.mejor_modelo.estimators_])
                    std_pred = np.std(pred_trees, axis=0)
                    intervalo_inferior = predicciones - 1.96 * std_pred
                    intervalo_superior = predicciones + 1.96 * std_pred
                else:
                    # Para otros modelos, usar un porcentaje fijo
                    margen = predicciones * 0.15  # ±15%
                    intervalo_inferior = predicciones - margen
                    intervalo_superior = predicciones + margen
            
            return {
                'predicciones': predicciones.tolist(),
                'intervalo_inferior': intervalo_inferior.tolist(),
                'intervalo_superior': intervalo_superior.tolist(),
                'confianza': 95  # 95% de confianza
            }
            
        except Exception as e:
            logger.error(f"Error realizando predicción: {str(e)}")
            raise
    
    def detectar_anomalias(self, df, threshold=2.0):
        """
        Detecta anomalías en el consumo energético
        """
        try:
            consumo = df['consumo_kwh'].values
            
            # Método 1: Z-score
            z_scores = np.abs(stats.zscore(consumo))
            anomalias_zscore = z_scores > threshold
            
            # Método 2: IQR
            Q1 = np.percentile(consumo, 25)
            Q3 = np.percentile(consumo, 75)
            IQR = Q3 - Q1
            limite_inferior = Q1 - 1.5 * IQR
            limite_superior = Q3 + 1.5 * IQR
            anomalias_iqr = (consumo < limite_inferior) | (consumo > limite_superior)
            
            # Combinar métodos
            anomalias = anomalias_zscore | anomalias_iqr
            
            return {
                'indices_anomalias': np.where(anomalias)[0].tolist(),
                'valores_anomalos': consumo[anomalias].tolist(),
                'total_anomalias': int(np.sum(anomalias)),
                'porcentaje_anomalias': float(np.sum(anomalias) / len(consumo) * 100)
            }
            
        except Exception as e:
            logger.error(f"Error detectando anomalías: {str(e)}")
            raise
    
    def guardar_modelos(self):
        """
        Guarda los modelos entrenados
        """
        try:
            if self.mejor_modelo is not None:
                joblib.dump(self.mejor_modelo, os.path.join(MODEL_PATH, 'mejor_modelo.pkl'))
                joblib.dump(self.scaler, os.path.join(MODEL_PATH, 'scaler.pkl'))
                joblib.dump(self.label_encoders, os.path.join(MODEL_PATH, 'encoders.pkl'))
                
                # Guardar metadatos
                metadata = {
                    'feature_names': self.feature_names,
                    'timestamp': datetime.now().isoformat()
                }
                with open(os.path.join(MODEL_PATH, 'metadata.json'), 'w') as f:
                    json.dump(metadata, f)
                
                logger.info("Modelos guardados exitosamente")
        except Exception as e:
            logger.error(f"Error guardando modelos: {str(e)}")
    
    def cargar_modelos(self):
        """
        Carga los modelos previamente entrenados
        """
        try:
            modelo_path = os.path.join(MODEL_PATH, 'mejor_modelo.pkl')
            scaler_path = os.path.join(MODEL_PATH, 'scaler.pkl')
            encoders_path = os.path.join(MODEL_PATH, 'encoders.pkl')
            metadata_path = os.path.join(MODEL_PATH, 'metadata.json')
            
            if all(os.path.exists(path) for path in [modelo_path, scaler_path, encoders_path]):
                self.mejor_modelo = joblib.load(modelo_path)
                self.scaler = joblib.load(scaler_path)
                self.label_encoders = joblib.load(encoders_path)
                
                if os.path.exists(metadata_path):
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
                        self.feature_names = metadata.get('feature_names', [])
                
                logger.info("Modelos cargados exitosamente")
                return True
            else:
                logger.warning("No se encontraron modelos guardados")
                return False
        except Exception as e:
            logger.error(f"Error cargando modelos: {str(e)}")
            return False

# Instancia global del predictor
predictor = EnergyPredictor()

# Intentar cargar modelos al iniciar
predictor.cargar_modelos()

# === RUTAS DE LA API ===

@app.route('/', methods=['GET'])
def home():
    """Ruta de inicio de la API"""
    return jsonify({
        'mensaje': 'API de Machine Learning para Predicción Energética',
        'version': '1.0.0',
        'endpoints': {
            'entrenar': '/api/ml/entrenar',
            'predecir': '/api/ml/predecir',
            'anomalias': '/api/ml/anomalias',
            'estado': '/api/ml/estado'
        }
    })

@app.route('/api/ml/estado', methods=['GET'])
def estado_modelo():
    """Devuelve el estado actual del modelo"""
    return jsonify({
        'modelo_entrenado': predictor.mejor_modelo is not None,
        'caracteristicas_disponibles': len(predictor.feature_names),
        'nombres_caracteristicas': predictor.feature_names
    })

@app.route('/api/ml/entrenar', methods=['POST'])
def entrenar():
    """Entrena los modelos con nuevos datos"""
    try:
        datos = request.get_json()
        
        if not datos or 'data' not in datos:
            return jsonify({'error': 'Se requieren datos para entrenar'}), 400
        
        # Convertir a DataFrame
        df = pd.DataFrame(datos['data'])
        
        # Verificar columnas requeridas
        columnas_requeridas = ['timestamp', 'consumo_kwh']
        if not all(col in df.columns for col in columnas_requeridas):
            return jsonify({
                'error': f'Se requieren las columnas: {columnas_requeridas}'
            }), 400
        
        # Entrenar modelos
        resultados = predictor.entrenar_modelos(df)
        
        return jsonify({
            'mensaje': 'Modelos entrenados exitosamente',
            'resultados': resultados
        })
        
    except Exception as e:
        logger.error(f"Error en entrenamiento: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/predecir', methods=['POST'])
def predecir():
    """Realiza predicciones de consumo"""
    try:
        datos = request.get_json()
        
        if not datos or 'data' not in datos:
            return jsonify({'error': 'Se requieren datos para predecir'}), 400
        
        # Convertir a DataFrame
        df = pd.DataFrame(datos['data'])
        
        # Parámetros opcionales
        periodos = datos.get('periodos', 24)
        
        # Realizar predicción
        resultados = predictor.predecir(df, periodos)
        
        return jsonify({
            'mensaje': 'Predicciones generadas exitosamente',
            'predicciones': resultados
        })
        
    except Exception as e:
        logger.error(f"Error en predicción: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ml/anomalias', methods=['POST'])
def detectar_anomalias():
    """Detecta anomalías en los datos de consumo"""
    try:
        datos = request.get_json()
        
        if not datos or 'data' not in datos:
            return jsonify({'error': 'Se requieren datos para detectar anomalías'}), 400
        
        # Convertir a DataFrame
        df = pd.DataFrame(datos['data'])
        
        # Verificar columna requerida
        if 'consumo_kwh' not in df.columns:
            return jsonify({'error': 'Se requiere la columna consumo_kwh'}), 400
        
        # Parámetros opcionales
        threshold = datos.get('threshold', 2.0)
        
        # Detectar anomalías
        resultados = predictor.detectar_anomalias(df, threshold)
        
        return jsonify({
            'mensaje': 'Análisis de anomalías completado',
            'anomalias': resultados
        })
        
    except Exception as e:
        logger.error(f"Error detectando anomalías: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint no encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Error interno del servidor'}), 500

if __name__ == '__main__':
    logger.info("Iniciando API de Machine Learning...")
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=os.environ.get('FLASK_ENV') == 'development'
    )
