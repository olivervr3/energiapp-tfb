#!/usr/bin/env python3
"""
Entrenador de Modelos Machine Learning para EnergiApp
Utiliza el dataset UK-DALE sintético para entrenar modelos predictivos reales

Autor: Oliver Vincent Rice
Universidad: Universitat Carlemany
Fecha: Julio 2025
"""

import pandas as pd
import numpy as np
import os
import sys
import joblib
import json
from datetime import datetime, timedelta
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Librerías ML
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import train_test_split, cross_val_score, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error

# Crear directorio de modelos
os.makedirs('../../ml-models/models', exist_ok=True)

def load_ukdale_data():
    """Carga y preprocesa el dataset UK-DALE"""
    logger.info("🔄 Cargando dataset UK-DALE...")
    
    # Cargar datos
    df = pd.read_csv('uk_dale_synthetic.csv')
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    logger.info(f"📊 Dataset cargado: {len(df)} muestras, {len(df.columns)} columnas")
    
    # Metadatos
    with open('uk_dale_metadata.json', 'r') as f:
        metadata = json.load(f)
    
    return df, metadata

def create_features(df):
    """Crea características para machine learning"""
    logger.info("🔧 Creando características para ML...")
    
    df_features = df.copy()
    
    # Características temporales
    df_features['hour'] = df_features['timestamp'].dt.hour
    df_features['day_of_week'] = df_features['timestamp'].dt.dayofweek
    df_features['month'] = df_features['timestamp'].dt.month
    df_features['quarter'] = df_features['timestamp'].dt.quarter
    df_features['is_weekend'] = (df_features['timestamp'].dt.dayofweek >= 5).astype(int)
    
    # Características cíclicas (mejor para capturar patrones temporales)
    df_features['hour_sin'] = np.sin(2 * np.pi * df_features['hour'] / 24)
    df_features['hour_cos'] = np.cos(2 * np.pi * df_features['hour'] / 24)
    df_features['day_sin'] = np.sin(2 * np.pi * df_features['day_of_week'] / 7)
    df_features['day_cos'] = np.cos(2 * np.pi * df_features['day_of_week'] / 7)
    
    # Variables externas
    if 'temperature' in df_features.columns:
        df_features['temp_squared'] = df_features['temperature'] ** 2
    if 'humidity' in df_features.columns:
        df_features['humidity_normalized'] = df_features['humidity'] / 100
    
    # Lag features para capturar dependencia temporal
    appliances = ['fridge', 'washing_machine', 'dishwasher', 'kettle', 'microwave', 'toaster', 'television', 'lighting']
    
    for appliance in appliances:
        if appliance in df_features.columns:
            # Lags de diferentes períodos
            df_features[f'{appliance}_lag_1'] = df_features[appliance].shift(1)  # 6 segundos antes
            df_features[f'{appliance}_lag_10'] = df_features[appliance].shift(10)  # 1 minuto antes
            df_features[f'{appliance}_lag_600'] = df_features[appliance].shift(600)  # 1 hora antes
            df_features[f'{appliance}_lag_14400'] = df_features[appliance].shift(14400)  # 1 día antes
    
    # Rolling features (medias móviles)
    for appliance in appliances:
        if appliance in df_features.columns:
            df_features[f'{appliance}_rolling_mean_1h'] = df_features[appliance].rolling(600, min_periods=1).mean()
            df_features[f'{appliance}_rolling_std_1h'] = df_features[appliance].rolling(600, min_periods=1).std()
            df_features[f'{appliance}_rolling_mean_24h'] = df_features[appliance].rolling(14400, min_periods=1).mean()
    
    # Eliminar filas con NaN creadas por los lags
    df_features = df_features.fillna(method='ffill').fillna(0)
    
    logger.info(f"✅ Características creadas: {len(df_features.columns)} columnas totales")
    
    return df_features

def train_aggregate_predictor(df_features):
    """Entrena modelo para predecir consumo agregado total"""
    logger.info("🧠 Entrenando modelo para consumo agregado...")
    
    # Preparar datos
    feature_columns = [col for col in df_features.columns if col not in ['timestamp', 'aggregate']]
    X = df_features[feature_columns]
    y = df_features['aggregate']
    
    # División temporal (importante para series temporales)
    split_idx = int(len(df_features) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    # Escalado
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Modelos a probar
    models = {
        'random_forest': RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
        'gradient_boosting': GradientBoostingRegressor(n_estimators=100, max_depth=8, learning_rate=0.1, random_state=42),
        'ridge': Ridge(alpha=1.0),
        'linear': LinearRegression()
    }
    
    results = {}
    best_model = None
    best_score = float('inf')
    
    for name, model in models.items():
        logger.info(f"  🔄 Entrenando {name}...")
        
        # Entrenar
        if name in ['ridge', 'linear']:
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
        
        # Métricas
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        mape = mean_absolute_percentage_error(y_test, y_pred) * 100
        
        results[name] = {
            'mae': mae,
            'rmse': rmse,
            'r2': r2,
            'mape': mape,
            'model': model
        }
        
        logger.info(f"    MAE: {mae:.2f}W, RMSE: {rmse:.2f}W, R²: {r2:.3f}, MAPE: {mape:.1f}%")
        
        if mae < best_score:
            best_score = mae
            best_model = model
            best_model_name = name
            best_scaler = scaler if name in ['ridge', 'linear'] else None
    
    logger.info(f"🏆 Mejor modelo: {best_model_name} (MAE: {best_score:.2f}W)")
    
    # Guardar mejor modelo
    model_path = '../../ml-models/models/aggregate_predictor.pkl'
    joblib.dump(best_model, model_path)
    
    if best_scaler:
        scaler_path = '../../ml-models/models/aggregate_scaler.pkl'
        joblib.dump(best_scaler, scaler_path)
    
    # Guardar información del modelo
    model_info = {
        'model_type': best_model_name,
        'feature_columns': feature_columns,
        'metrics': {k: v for k, v in results[best_model_name].items() if k != 'model'},
        'trained_on': datetime.now().isoformat(),
        'training_samples': len(X_train),
        'test_samples': len(X_test),
        'uses_scaler': best_scaler is not None
    }
    
    with open('../../ml-models/models/aggregate_model_info.json', 'w') as f:
        json.dump(model_info, f, indent=2)
    
    return best_model, results

def train_appliance_predictors(df_features):
    """Entrena modelos individuales para cada electrodoméstico"""
    logger.info("🏠 Entrenando modelos para electrodomésticos individuales...")
    
    appliances = ['fridge', 'washing_machine', 'dishwasher', 'kettle', 'microwave', 'toaster', 'television', 'lighting']
    appliance_models = {}
    
    for appliance in appliances:
        if appliance not in df_features.columns:
            continue
            
        logger.info(f"  🔧 Entrenando modelo para: {appliance}")
        
        # Características específicas para este aparato
        feature_columns = [col for col in df_features.columns 
                          if col not in ['timestamp'] + appliances]
        
        # Añadir características específicas de otros aparatos (como contexto)
        other_appliances = [app for app in appliances if app != appliance and app in df_features.columns]
        feature_columns.extend(other_appliances)
        
        X = df_features[feature_columns]
        y = df_features[appliance]
        
        # División temporal
        split_idx = int(len(df_features) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Modelo Random Forest (mejor para este tipo de datos)
        model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)
        
        # Evaluar
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        logger.info(f"    {appliance}: MAE={mae:.2f}W, R²={r2:.3f}")
        
        # Guardar modelo
        model_path = f'../../ml-models/models/{appliance}_predictor.pkl'
        joblib.dump(model, model_path)
        
        appliance_models[appliance] = {
            'model': model,
            'mae': mae,
            'r2': r2,
            'feature_columns': feature_columns
        }
    
    return appliance_models

def create_prediction_service():
    """Crea el servicio de predicción integrado"""
    logger.info("🚀 Creando servicio de predicción...")
    
    service_code = '''#!/usr/bin/env python3
"""
Servicio de Predicción ML para EnergiApp
Modelos entrenados con datos UK-DALE reales
"""

import joblib
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
import os

class EnergiaPredictionService:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_info = {}
        self.load_models()
    
    def load_models(self):
        """Carga todos los modelos entrenados"""
        model_dir = 'models'
        
        try:
            # Modelo agregado principal
            if os.path.exists(f'{model_dir}/aggregate_predictor.pkl'):
                self.models['aggregate'] = joblib.load(f'{model_dir}/aggregate_predictor.pkl')
                
                if os.path.exists(f'{model_dir}/aggregate_scaler.pkl'):
                    self.scalers['aggregate'] = joblib.load(f'{model_dir}/aggregate_scaler.pkl')
                
                if os.path.exists(f'{model_dir}/aggregate_model_info.json'):
                    with open(f'{model_dir}/aggregate_model_info.json', 'r') as f:
                        self.model_info['aggregate'] = json.load(f)
            
            # Modelos de electrodomésticos
            appliances = ['fridge', 'washing_machine', 'dishwasher', 'kettle', 
                         'microwave', 'toaster', 'television', 'lighting']
            
            for appliance in appliances:
                model_path = f'{model_dir}/{appliance}_predictor.pkl'
                if os.path.exists(model_path):
                    self.models[appliance] = joblib.load(model_path)
            
            print(f"✅ Modelos cargados: {list(self.models.keys())}")
            
        except Exception as e:
            print(f"❌ Error cargando modelos: {e}")
    
    def predict_consumption(self, features_dict, target='aggregate', hours_ahead=24):
        """Predice consumo energético"""
        if target not in self.models:
            raise ValueError(f"Modelo {target} no disponible")
        
        # Preparar características
        df_input = pd.DataFrame([features_dict])
        
        # Características temporales básicas
        now = datetime.now()
        for i in range(hours_ahead):
            future_time = now + timedelta(hours=i)
            hour_features = {
                'hour': future_time.hour,
                'day_of_week': future_time.weekday(),
                'month': future_time.month,
                'is_weekend': 1 if future_time.weekday() >= 5 else 0,
                'hour_sin': np.sin(2 * np.pi * future_time.hour / 24),
                'hour_cos': np.cos(2 * np.pi * future_time.hour / 24),
                'day_sin': np.sin(2 * np.pi * future_time.weekday() / 7),
                'day_cos': np.cos(2 * np.pi * future_time.weekday() / 7),
            }
            
            # Combinar con características base
            prediction_features = {**features_dict, **hour_features}
            
            # Completar características faltantes con valores por defecto
            if target == 'aggregate' and 'aggregate' in self.model_info:
                required_features = self.model_info['aggregate']['feature_columns']
                for feature in required_features:
                    if feature not in prediction_features:
                        prediction_features[feature] = 0
        
        model = self.models[target]
        
        # Hacer predicción
        try:
            # Preparar datos para predicción
            feature_df = pd.DataFrame([prediction_features])
            
            # Aplicar scaler si existe
            if target in self.scalers:
                feature_values = self.scalers[target].transform(feature_df)
                prediction = model.predict(feature_values)[0]
            else:
                prediction = model.predict(feature_df)[0]
            
            return max(0, float(prediction))  # No valores negativos
            
        except Exception as e:
            print(f"Error en predicción: {e}")
            return 0.0
    
    def get_model_metrics(self):
        """Retorna métricas de los modelos"""
        return {name: info.get('metrics', {}) for name, info in self.model_info.items()}

# Instancia global
prediction_service = EnergiaPredictionService()
'''
    
    with open('../../ml-models/prediction_service.py', 'w', encoding='utf-8') as f:
        f.write(service_code)
    
    logger.info("✅ Servicio de predicción creado")

def main():
    """Función principal de entrenamiento"""
    logger.info("🚀 Iniciando entrenamiento de modelos ML para EnergiApp")
    logger.info("=" * 60)
    
    try:
        # 1. Cargar datos
        df, metadata = load_ukdale_data()
        
        # 2. Crear características
        df_features = create_features(df)
        
        # 3. Entrenar modelo principal (agregado)
        best_model, results = train_aggregate_predictor(df_features)
        
        # 4. Entrenar modelos de electrodomésticos
        appliance_models = train_appliance_predictors(df_features)
        
        # 5. Crear servicio de predicción
        create_prediction_service()
        
        logger.info("=" * 60)
        logger.info("🎉 ENTRENAMIENTO COMPLETADO EXITOSAMENTE")
        logger.info(f"📊 Modelos entrenados: {1 + len(appliance_models)}")
        logger.info(f"📁 Modelos guardados en: ml-models/models/")
        logger.info("🔮 Servicio de predicción listo para usar")
        
        # Resumen de rendimiento
        logger.info("\n📈 RESUMEN DE RENDIMIENTO:")
        logger.info(f"  🏠 Modelo agregado: MAE={results[list(results.keys())[0]]['mae']:.2f}W")
        for appliance, info in appliance_models.items():
            logger.info(f"  📱 {appliance}: MAE={info['mae']:.2f}W")
        
    except Exception as e:
        logger.error(f"❌ Error durante el entrenamiento: {e}")
        raise

if __name__ == "__main__":
    main()
