const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EnergiApp API',
      version: '2.0.0',
      description: 'API para gestión inteligente del consumo energético doméstico',
      contact: {
        name: 'EnergiApp Team',
        email: 'info@energiapp.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            detalles: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Detalles adicionales del error'
            }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            nombre: {
              type: 'string'
            },
            apellidos: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            telefono: {
              type: 'string'
            },
            tipo_vivienda: {
              type: 'string',
              enum: ['piso', 'casa', 'apartamento', 'duplex', 'otro']
            },
            metros_cuadrados: {
              type: 'integer'
            },
            num_habitantes: {
              type: 'integer'
            }
          }
        },
        Dispositivo: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            nombre: {
              type: 'string'
            },
            tipo: {
              type: 'string',
              enum: ['aire_acondicionado', 'calefaccion', 'refrigerador', 'lavadora', 'televisor', 'iluminacion', 'otros']
            },
            potencia_nominal: {
              type: 'number'
            },
            estado: {
              type: 'string',
              enum: ['activo', 'inactivo', 'mantenimiento']
            }
          }
        },
        ConsumoEnergetico: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            dispositivo_id: {
              type: 'string',
              format: 'uuid'
            },
            consumo_kwh: {
              type: 'number'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            costo_estimado: {
              type: 'number'
            }
          }
        },
        Prediccion: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            fecha_prediccion: {
              type: 'string',
              format: 'date-time'
            },
            consumo_predicho: {
              type: 'number'
            },
            confianza: {
              type: 'number'
            },
            modelo_utilizado: {
              type: 'string'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Autenticación',
        description: 'Operaciones de autenticación y gestión de usuarios'
      },
      {
        name: 'Dispositivos',
        description: 'Gestión de dispositivos domésticos'
      },
      {
        name: 'Consumo',
        description: 'Registro y consulta de consumo energético'
      },
      {
        name: 'Predicciones',
        description: 'Predicciones de consumo energético'
      },
      {
        name: 'Dashboard',
        description: 'Datos del panel principal'
      },
      {
        name: 'Recomendaciones',
        description: 'Recomendaciones de ahorro energético'
      }
    ]
  },
  apis: [
    './src/routes/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
