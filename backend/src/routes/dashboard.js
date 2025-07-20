const express = require('express');
const { ConsumoEnergetico, Dispositivo, Prediccion } = require('../config/database');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Obtener datos del dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, async (req, res) => {
  try {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    // Obtener consumo del mes actual
    const consumoMes = await ConsumoEnergetico.findAll({
      where: {
        usuario_id: req.userId,
        timestamp: { [Op.gte]: inicioMes }
      },
      include: [{
        model: Dispositivo,
        as: 'dispositivo',
        attributes: ['nombre', 'tipo']
      }]
    });

    // Obtener consumo de la última semana
    const consumoSemana = await ConsumoEnergetico.findAll({
      where: {
        usuario_id: req.userId,
        timestamp: { [Op.gte]: inicioSemana }
      }
    });

    // Obtener consumo de hoy
    const consumoHoy = await ConsumoEnergetico.findAll({
      where: {
        usuario_id: req.userId,
        timestamp: { [Op.gte]: inicioHoy }
      }
    });

    // Obtener dispositivos del usuario
    const dispositivos = await Dispositivo.findAll({
      where: {
        usuario_id: req.userId,
        activo: true
      }
    });

    // Obtener predicciones futuras
    const predicciones = await Prediccion.findAll({
      where: {
        usuario_id: req.userId,
        fecha_prediccion: { [Op.gte]: ahora }
      },
      order: [['fecha_prediccion', 'ASC']],
      limit: 24 // Próximas 24 horas
    });

    // Calcular estadísticas
    const totalConsumoMes = consumoMes.reduce((sum, c) => sum + parseFloat(c.consumo_kwh), 0);
    const totalConsumoSemana = consumoSemana.reduce((sum, c) => sum + parseFloat(c.consumo_kwh), 0);
    const totalConsumoHoy = consumoHoy.reduce((sum, c) => sum + parseFloat(c.consumo_kwh), 0);
    const costoMes = consumoMes.reduce((sum, c) => sum + parseFloat(c.costo_estimado || 0), 0);

    // Consumo por tipo de dispositivo
    const consumoPorTipo = {};
    consumoMes.forEach(c => {
      const tipo = c.dispositivo?.tipo || 'otros';
      if (!consumoPorTipo[tipo]) {
        consumoPorTipo[tipo] = 0;
      }
      consumoPorTipo[tipo] += parseFloat(c.consumo_kwh);
    });

    // Datos para gráfico semanal
    const consumoDiario = {};
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(ahora.getTime() - i * 24 * 60 * 60 * 1000);
      const fechaStr = fecha.toISOString().split('T')[0];
      consumoDiario[fechaStr] = 0;
    }

    consumoSemana.forEach(c => {
      const fechaStr = c.timestamp.toISOString().split('T')[0];
      if (consumoDiario.hasOwnProperty(fechaStr)) {
        consumoDiario[fechaStr] += parseFloat(c.consumo_kwh);
      }
    });

    // Predicción para mañana
    const mañana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    const prediccionMañana = predicciones
      .filter(p => p.fecha_prediccion.toDateString() === mañana.toDateString())
      .reduce((sum, p) => sum + parseFloat(p.consumo_predicho), 0);

    res.json({
      resumen: {
        consumo_hoy_kwh: totalConsumoHoy.toFixed(4),
        consumo_semana_kwh: totalConsumoSemana.toFixed(4),
        consumo_mes_kwh: totalConsumoMes.toFixed(4),
        costo_mes: costoMes.toFixed(2),
        num_dispositivos: dispositivos.length,
        prediccion_mañana_kwh: prediccionMañana.toFixed(4)
      },
      graficos: {
        consumo_diario: Object.entries(consumoDiario).map(([fecha, consumo]) => ({
          fecha,
          consumo: consumo.toFixed(4)
        })),
        consumo_por_tipo: Object.entries(consumoPorTipo).map(([tipo, consumo]) => ({
          tipo,
          consumo: consumo.toFixed(4)
        }))
      },
      dispositivos_activos: dispositivos.length,
      alertas: [
        ...(totalConsumoHoy > 10 ? [{
          tipo: 'warning',
          mensaje: `Consumo alto hoy: ${totalConsumoHoy.toFixed(2)} kWh`
        }] : []),
        ...(costoMes > 100 ? [{
          tipo: 'info',
          mensaje: `Costo del mes: €${costoMes.toFixed(2)}`
        }] : [])
      ],
      ultima_actualizacion: ahora.toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo datos del dashboard:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/dashboard/comparacion:
 *   get:
 *     summary: Obtener comparación de consumo
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/comparacion', auth, async (req, res) => {
  try {
    const ahora = new Date();
    const mesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);

    // Consumo mes actual
    const consumoMesActual = await ConsumoEnergetico.findAll({
      where: {
        usuario_id: req.userId,
        timestamp: { [Op.gte]: mesActual }
      }
    });

    // Consumo mes anterior
    const consumoMesAnterior = await ConsumoEnergetico.findAll({
      where: {
        usuario_id: req.userId,
        timestamp: {
          [Op.gte]: mesAnterior,
          [Op.lte]: finMesAnterior
        }
      }
    });

    const totalActual = consumoMesActual.reduce((sum, c) => sum + parseFloat(c.consumo_kwh), 0);
    const totalAnterior = consumoMesAnterior.reduce((sum, c) => sum + parseFloat(c.consumo_kwh), 0);
    
    const diferencia = totalActual - totalAnterior;
    const porcentajeCambio = totalAnterior > 0 ? ((diferencia / totalAnterior) * 100) : 0;

    res.json({
      mes_actual: {
        consumo: totalActual.toFixed(4),
        periodo: mesActual.toISOString().split('T')[0]
      },
      mes_anterior: {
        consumo: totalAnterior.toFixed(4),
        periodo: mesAnterior.toISOString().split('T')[0]
      },
      comparacion: {
        diferencia: diferencia.toFixed(4),
        porcentaje_cambio: porcentajeCambio.toFixed(2),
        tendencia: diferencia > 0 ? 'aumento' : diferencia < 0 ? 'reduccion' : 'igual'
      }
    });
  } catch (error) {
    console.error('Error en comparación:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
