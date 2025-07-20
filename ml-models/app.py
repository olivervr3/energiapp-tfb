"""
API Flask para EnergiApp - Integrada con Modelos UK-DALE Entrenados
Servicio de predicción de consumo energético utilizando ML real

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
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Librerías para API
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

# Importar el servicio de predicción entrenado
try:
    from prediction_service import prediction_service
    logger.info("✅ Servicio de predicción cargado exitosamente")
    MODELS_AVAILABLE = True
except ImportError as e:
    logger.error(f"❌ Error cargando servicio de predicción: {e}")
    prediction_service = None
    MODELS_AVAILABLE = False

# Configuración de la aplicación Flask
app = Flask(__name__)
CORS(app)

# Configuración
CONFIG = {
    'PORT': int(os.getenv('PORT', 5001)),
    'DEBUG': os.getenv('DEBUG', 'True').lower() == 'true',
    'HOST': os.getenv('HOST', '0.0.0.0')
}

# ==================== RUTAS DE LA API ====================

@app.route('/', methods=['GET'])
def health_check():
    """Endpoint de salud del servicio"""
    return jsonify({
        'status': 'online',
        'service': 'EnergiApp ML API',
        'version': '2.0',
        'models_available': MODELS_AVAILABLE,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict/consumption', methods=['POST'])
def predict_consumption():
    """Predice consumo energético usando modelos entrenados"""
    try:
        if not MODELS_AVAILABLE:
            return jsonify({
                'error': 'Modelos ML no disponibles',
                'status': 'error'
            }), 503
        
        data = request.get_json()
        
        # Validar entrada
        if not data:
            return jsonify({'error': 'No se recibieron datos'}), 400
        
        # Parámetros de entrada
        user_id = data.get('user_id', 1)
        hours_ahead = data.get('hours_ahead', 24)
        device_type = data.get('device_type', 'aggregate')
        
        # Características base del usuario/hogar
        base_features = {
            'temperature': data.get('temperature', 20.0),
            'humidity': data.get('humidity', 60.0),
            'occupancy': data.get('occupancy', 2),
            'house_size': data.get('house_size', 100),
        }
        
        # Generar predicciones para las próximas horas
        predictions = []
        now = datetime.now()
        
        for i in range(hours_ahead):
            future_time = now + timedelta(hours=i)
            
            # Características temporales
            features = {
                **base_features,
                'hour': future_time.hour,
                'day_of_week': future_time.weekday(),
                'month': future_time.month,
                'is_weekend': 1 if future_time.weekday() >= 5 else 0,
                # Características cíclicas
                'hour_sin': np.sin(2 * np.pi * future_time.hour / 24),
                'hour_cos': np.cos(2 * np.pi * future_time.hour / 24),
                'day_sin': np.sin(2 * np.pi * future_time.weekday() / 7),
                'day_cos': np.cos(2 * np.pi * future_time.weekday() / 7),
            }
            
            # Realizar predicción
            consumption = prediction_service.predict_consumption(
                features, 
                target=device_type
            )
            
            predictions.append({
                'timestamp': future_time.isoformat(),
                'hour': future_time.hour,
                'predicted_consumption': float(consumption),
                'device_type': device_type
            })
        
        return jsonify({
            'status': 'success',
            'predictions': predictions,
            'user_id': user_id,
            'model_type': 'uk_dale_trained',
            'total_predicted_24h': sum(p['predicted_consumption'] for p in predictions[:24])
        })
        
    except Exception as e:
        logger.error(f"Error en predicción: {e}")
        return jsonify({
            'error': f'Error interno: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/predict/appliance/<appliance_name>', methods=['POST'])
def predict_appliance(appliance_name):
    """Predice consumo de un electrodoméstico específico"""
    try:
        if not MODELS_AVAILABLE:
            return jsonify({
                'error': 'Modelos ML no disponibles',
                'status': 'error'
            }), 503
        
        # Verificar que el electrodoméstico tiene modelo
        available_appliances = ['fridge', 'washing_machine', 'dishwasher', 
                              'kettle', 'microwave', 'toaster', 'television', 'lighting']
        
        if appliance_name not in available_appliances:
            return jsonify({
                'error': f'Electrodoméstico {appliance_name} no disponible',
                'available_appliances': available_appliances
            }), 400
        
        data = request.get_json() or {}
        
        # Características base
        base_features = {
            'temperature': data.get('temperature', 20.0),
            'humidity': data.get('humidity', 60.0),
            'occupancy': data.get('occupancy', 2),
        }
        
        # Predecir para la próxima hora
        now = datetime.now()
        features = {
            **base_features,
            'hour': now.hour,
            'day_of_week': now.weekday(),
            'month': now.month,
            'is_weekend': 1 if now.weekday() >= 5 else 0,
            'hour_sin': np.sin(2 * np.pi * now.hour / 24),
            'hour_cos': np.cos(2 * np.pi * now.hour / 24),
            'day_sin': np.sin(2 * np.pi * now.weekday() / 7),
            'day_cos': np.cos(2 * np.pi * now.weekday() / 7),
        }
        
        consumption = prediction_service.predict_consumption(features, target=appliance_name)
        
        return jsonify({
            'status': 'success',
            'appliance': appliance_name,
            'predicted_consumption': float(consumption),
            'unit': 'watts',
            'timestamp': now.isoformat(),
            'model_type': 'uk_dale_trained'
        })
        
    except Exception as e:
        logger.error(f"Error en predicción de electrodoméstico: {e}")
        return jsonify({
            'error': f'Error interno: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/models/status', methods=['GET'])
def models_status():
    """Información sobre el estado de los modelos"""
    try:
        if not MODELS_AVAILABLE:
            return jsonify({
                'status': 'unavailable',
                'message': 'Modelos ML no cargados'
            })
        
        # Obtener métricas de los modelos
        metrics = prediction_service.get_model_metrics()
        
        # Información de modelos disponibles
        available_models = list(prediction_service.models.keys())
        
        return jsonify({
            'status': 'available',
            'models_loaded': len(available_models),
            'available_models': available_models,
            'model_metrics': metrics,
            'data_source': 'UK-DALE synthetic dataset',
            'training_samples': '432,000 samples',
            'training_period': '30 days',
            'sampling_rate': '6 seconds'
        })
        
    except Exception as e:
        logger.error(f"Error obteniendo estado de modelos: {e}")
        return jsonify({
            'error': f'Error: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/analyze/consumption', methods=['POST'])
def analyze_consumption():
    """Análisis avanzado de patrones de consumo"""
    try:
        data = request.get_json()
        
        if not data or 'consumption_data' not in data:
            return jsonify({'error': 'Datos de consumo requeridos'}), 400
        
        consumption_data = data['consumption_data']
        df = pd.DataFrame(consumption_data)
        
        # Análisis básico
        analysis = {
            'total_consumption': float(df['consumption'].sum()),
            'average_consumption': float(df['consumption'].mean()),
            'max_consumption': float(df['consumption'].max()),
            'min_consumption': float(df['consumption'].min()),
            'std_consumption': float(df['consumption'].std()),
        }
        
        # Análisis por hora si hay timestamps
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['hour'] = df['timestamp'].dt.hour
            
            hourly_avg = df.groupby('hour')['consumption'].mean().to_dict()
            analysis['hourly_patterns'] = {str(k): float(v) for k, v in hourly_avg.items()}
            
            # Detectar picos de consumo
            threshold = analysis['average_consumption'] + 2 * analysis['std_consumption']
            peaks = df[df['consumption'] > threshold]
            
            analysis['peak_hours'] = peaks['hour'].tolist() if len(peaks) > 0 else []
            analysis['num_peaks'] = len(peaks)
        
        return jsonify({
            'status': 'success',
            'analysis': analysis,
            'analyzed_samples': len(df)
        })
        
    except Exception as e:
        logger.error(f"Error en análisis: {e}")
        return jsonify({
            'error': f'Error en análisis: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    """Genera recomendaciones de eficiencia energética"""
    try:
        data = request.get_json() or {}
        
        current_consumption = data.get('current_consumption', 1000)  # watts
        user_type = data.get('user_type', 'residential')
        house_size = data.get('house_size', 100)  # m²
        occupancy = data.get('occupancy', 2)
        
        # Benchmarks por m² y persona
        consumption_per_m2 = current_consumption / house_size
        consumption_per_person = current_consumption / occupancy
        
        recommendations = []
        
        # Recomendaciones basadas en benchmarks
        if consumption_per_m2 > 15:  # W/m²
            recommendations.append({
                'type': 'efficiency',
                'priority': 'high',
                'title': 'Consumo elevado por m²',
                'description': f'Tu consumo de {consumption_per_m2:.1f} W/m² está por encima del promedio (10-12 W/m²)',
                'action': 'Considera revisar el aislamiento térmico y electrodomésticos antiguos'
            })
        
        if consumption_per_person > 600:  # W/persona
            recommendations.append({
                'type': 'behavioral',
                'priority': 'medium',
                'title': 'Optimización por ocupante',
                'description': f'Consumo de {consumption_per_person:.1f} W por persona es optimizable',
                'action': 'Revisa hábitos de uso de electrodomésticos y iluminación'
            })
        
        # Recomendaciones específicas usando predicciones ML
        if MODELS_AVAILABLE:
            # Simular diferentes escenarios
            base_features = {
                'temperature': 20.0,
                'humidity': 60.0,
                'occupancy': occupancy,
                'house_size': house_size,
                'hour': datetime.now().hour,
                'day_of_week': datetime.now().weekday(),
                'month': datetime.now().month,
                'is_weekend': 1 if datetime.now().weekday() >= 5 else 0,
            }
            
            predicted_current = prediction_service.predict_consumption(base_features, 'aggregate')
            
            # Scenario con temperatura optimizada
            optimized_features = base_features.copy()
            optimized_features['temperature'] = 18.0  # Temperatura más eficiente
            predicted_optimized = prediction_service.predict_consumption(optimized_features, 'aggregate')
            
            if predicted_current > predicted_optimized:
                savings = predicted_current - predicted_optimized
                recommendations.append({
                    'type': 'temperature',
                    'priority': 'medium',
                    'title': 'Optimización de temperatura',
                    'description': f'Reducir 2°C puede ahorrar {savings:.1f}W',
                    'action': 'Ajusta termostato a 18°C en invierno'
                })
        
        # Recomendaciones generales
        if len(recommendations) == 0:
            recommendations.append({
                'type': 'general',
                'priority': 'low',
                'title': 'Consumo dentro del rango normal',
                'description': 'Tu consumo está en niveles eficientes',
                'action': 'Mantén estos buenos hábitos energéticos'
            })
        
        return jsonify({
            'status': 'success',
            'recommendations': recommendations,
            'current_metrics': {
                'consumption_per_m2': consumption_per_m2,
                'consumption_per_person': consumption_per_person,
                'efficiency_rating': 'A' if consumption_per_m2 < 10 else 'B' if consumption_per_m2 < 15 else 'C'
            }
        })
        
    except Exception as e:
        logger.error(f"Error generando recomendaciones: {e}")
        return jsonify({
            'error': f'Error: {str(e)}',
            'status': 'error'
        }), 500

# ==================== MANEJO DE ERRORES ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint no encontrado',
        'status': 'error',
        'available_endpoints': [
            '/',
            '/predict/consumption',
            '/predict/appliance/<name>',
            '/models/status',
            '/analyze/consumption',
            '/recommendations'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Error interno del servidor',
        'status': 'error'
    }), 500

# ==================== EJECUCIÓN ====================

if __name__ == '__main__':
    logger.info("🚀 Iniciando EnergiApp ML API")
    logger.info(f"📊 Modelos disponibles: {MODELS_AVAILABLE}")
    
    if MODELS_AVAILABLE:
        logger.info("✅ API lista con modelos UK-DALE entrenados")
    else:
        logger.warning("⚠️ API funcionando sin modelos ML")
    
    app.run(
        host=CONFIG['HOST'],
        port=CONFIG['PORT'],
        debug=CONFIG['DEBUG']
    )
