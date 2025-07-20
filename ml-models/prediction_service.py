#!/usr/bin/env python3
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
        # Determinar la ruta base del directorio de modelos
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.join(script_dir, 'models')
        
        try:
            # Modelo agregado principal
            aggregate_model_path = os.path.join(model_dir, 'aggregate_predictor.pkl')
            if os.path.exists(aggregate_model_path):
                self.models['aggregate'] = joblib.load(aggregate_model_path)
                
                aggregate_scaler_path = os.path.join(model_dir, 'aggregate_scaler.pkl')
                if os.path.exists(aggregate_scaler_path):
                    self.scalers['aggregate'] = joblib.load(aggregate_scaler_path)
                
                aggregate_info_path = os.path.join(model_dir, 'aggregate_model_info.json')
                if os.path.exists(aggregate_info_path):
                    with open(aggregate_info_path, 'r') as f:
                        self.model_info['aggregate'] = json.load(f)
            
            # Modelos de electrodomésticos
            appliances = ['fridge', 'washing_machine', 'dishwasher', 'kettle', 
                         'microwave', 'toaster', 'television', 'lighting']
            
            for appliance in appliances:
                model_path = os.path.join(model_dir, f'{appliance}_predictor.pkl')
                if os.path.exists(model_path):
                    self.models[appliance] = joblib.load(model_path)
            
            print(f"✅ Modelos cargados: {list(self.models.keys())}")
            
        except Exception as e:
            print(f"❌ Error cargando modelos: {e}")
            print(f"📁 Directorio de modelos: {model_dir}")
            print(f"📂 Archivos en directorio: {os.listdir(model_dir) if os.path.exists(model_dir) else 'No existe'}")
    
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
