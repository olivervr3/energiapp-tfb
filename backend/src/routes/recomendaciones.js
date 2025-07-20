const express = require('express');
const { auth } = require('../middleware/auth');
const { ConsumoEnergetico, Dispositivo } = require('../config/database');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /api/recomendaciones:
 *   get:
 *     summary: Obtener recomendaciones de ahorro energético
 *     tags: [Recomendaciones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, async (req, res) => {
  try {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    // Obtener consumo del mes actual
    const consumoMes = await ConsumoEnergetico.findAll({
      where: {
        usuario_id: req.userId,
        timestamp: { [Op.gte]: inicioMes }
      },
      include: [{
        model: Dispositivo,
        as: 'dispositivo',
        attributes: ['id', 'nombre', 'tipo', 'potencia_nominal']
      }]
    });

    // Analizar patrones de consumo
    const consumoPorDispositivo = {};
    const consumoPorHora = {};

    consumoMes.forEach(c => {
      // Por dispositivo
      const dispositivoId = c.dispositivo?.id || 'desconocido';
      if (!consumoPorDispositivo[dispositivoId]) {
        consumoPorDispositivo[dispositivoId] = {
          nombre: c.dispositivo?.nombre || 'Dispositivo desconocido',
          tipo: c.dispositivo?.tipo || 'otros',
          consumo_total: 0,
          registros: 0
        };
      }
      consumoPorDispositivo[dispositivoId].consumo_total += parseFloat(c.consumo_kwh);
      consumoPorDispositivo[dispositivoId].registros += 1;

      // Por hora
      const hora = c.timestamp.getHours();
      if (!consumoPorHora[hora]) {
        consumoPorHora[hora] = 0;
      }
      consumoPorHora[hora] += parseFloat(c.consumo_kwh);
    });

    // Generar recomendaciones basadas en análisis
    const recomendaciones = [];

    // Recomendaciones por dispositivo con mayor consumo
    const dispositivosOrdenados = Object.values(consumoPorDispositivo)
      .sort((a, b) => b.consumo_total - a.consumo_total);

    if (dispositivosOrdenados.length > 0) {
      const mayorConsumidor = dispositivosOrdenados[0];
      recomendaciones.push({
        tipo: 'dispositivo',
        prioridad: 'alta',
        titulo: `Optimiza tu ${mayorConsumidor.nombre}`,
        descripcion: `Este dispositivo representa el mayor consumo con ${mayorConsumidor.consumo_total.toFixed(2)} kWh este mes.`,
        ahorro_estimado: (mayorConsumidor.consumo_total * 0.15).toFixed(2),
        acciones: [
          'Revisa la configuración de eficiencia energética',
          'Considera actualizarlo por un modelo más eficiente',
          'Programa su uso en horarios de tarifa reducida'
        ]
      });
    }

    // Recomendaciones por patrones horarios
    const horasMayorConsumo = Object.entries(consumoPorHora)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hora]) => parseInt(hora));

    if (horasMayorConsumo.some(h => h >= 18 && h <= 22)) {
      recomendaciones.push({
        tipo: 'horario',
        prioridad: 'media',
        titulo: 'Optimiza el consumo en horas pico',
        descripcion: 'Se detecta alto consumo en horas de tarifa cara (18:00-22:00).',
        ahorro_estimado: '25.00',
        acciones: [
          'Usa electrodomésticos de alto consumo en horarios valle',
          'Programa la lavadora y lavavajillas para la madrugada',
          'Considera cambiar a una tarifa con discriminación horaria'
        ]
      });
    }

    // Recomendaciones generales
    const consumoTotal = Object.values(consumoPorDispositivo)
      .reduce((sum, d) => sum + d.consumo_total, 0);

    if (consumoTotal > 300) { // Consumo alto mensual
      recomendaciones.push({
        tipo: 'general',
        prioridad: 'alta',
        titulo: 'Consumo elevado detectado',
        descripcion: `Tu consumo mensual de ${consumoTotal.toFixed(2)} kWh está por encima del promedio.`,
        ahorro_estimado: (consumoTotal * 0.2).toFixed(2),
        acciones: [
          'Realiza una auditoría energética completa',
          'Revisa el aislamiento de tu vivienda',
          'Considera instalar sistemas de automatización'
        ]
      });
    }

    // Recomendaciones estacionales
    const mes = ahora.getMonth();
    if (mes >= 5 && mes <= 8) { // Verano
      recomendaciones.push({
        tipo: 'estacional',
        prioridad: 'media',
        titulo: 'Consejos para el verano',
        descripcion: 'Optimiza el uso del aire acondicionado y sistemas de refrigeración.',
        ahorro_estimado: '45.00',
        acciones: [
          'Ajusta el termostato a 25-26°C',
          'Usa ventiladores de techo para complementar',
          'Cierra persianas durante las horas de más calor'
        ]
      });
    } else if (mes >= 11 || mes <= 2) { // Invierno
      recomendaciones.push({
        tipo: 'estacional',
        prioridad: 'media',
        titulo: 'Consejos para el invierno',
        descripcion: 'Optimiza la calefacción y reduce pérdidas de calor.',
        ahorro_estimado: '60.00',
        acciones: [
          'Ajusta la calefacción a 19-21°C',
          'Revisa el sellado de ventanas y puertas',
          'Usa ropa de abrigo en casa para reducir calefacción'
        ]
      });
    }

    res.json({
      recomendaciones,
      resumen_analisis: {
        consumo_total_mes: consumoTotal.toFixed(2),
        dispositivos_analizados: Object.keys(consumoPorDispositivo).length,
        horas_mayor_consumo: horasMayorConsumo,
        fecha_analisis: ahora.toISOString()
      },
      estadisticas: {
        ahorro_potencial_total: recomendaciones
          .reduce((sum, r) => sum + parseFloat(r.ahorro_estimado), 0)
          .toFixed(2),
        recomendaciones_alta_prioridad: recomendaciones
          .filter(r => r.prioridad === 'alta').length
      }
    });
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/recomendaciones/personalizadas:
 *   get:
 *     summary: Obtener recomendaciones personalizadas
 *     tags: [Recomendaciones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/personalizadas', auth, async (req, res) => {
  try {
    const { tipo_vivienda, num_habitantes, objetivo_ahorro } = req.query;

    const recomendacionesPersonalizadas = [];

    // Recomendaciones según tipo de vivienda
    if (tipo_vivienda === 'piso') {
      recomendacionesPersonalizadas.push({
        categoria: 'vivienda',
        titulo: 'Optimización para apartamento',
        consejos: [
          'Instala LED en todas las habitaciones',
          'Usa electrodomésticos de clase A+++',
          'Considera un termostato inteligente'
        ]
      });
    } else if (tipo_vivienda === 'casa') {
      recomendacionesPersonalizadas.push({
        categoria: 'vivienda',
        titulo: 'Optimización para casa unifamiliar',
        consejos: [
          'Instala paneles solares si es posible',
          'Mejora el aislamiento del tejado',
          'Considera una bomba de calor aerotérmica'
        ]
      });
    }

    // Recomendaciones según número de habitantes
    if (parseInt(num_habitantes) > 4) {
      recomendacionesPersonalizadas.push({
        categoria: 'familia',
        titulo: 'Hogar con muchos habitantes',
        consejos: [
          'Programa electrodomésticos en horarios escalonados',
          'Instala sensores de movimiento en zonas comunes',
          'Educa a toda la familia sobre eficiencia energética'
        ]
      });
    }

    res.json({
      recomendaciones_personalizadas: recomendacionesPersonalizadas,
      fecha_generacion: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo recomendaciones personalizadas:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
