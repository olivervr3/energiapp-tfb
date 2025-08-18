import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FaBolt, 
  FaSnowflake, 
  FaTv, 
  FaDesktop, 
  FaFire, 
  FaWifi,
  FaGamepad,
  FaLightbulb,
  FaWind
} from 'react-icons/fa';
import '../styles/housePlan.css';

const HousePlan = ({ devices = [] }) => {
  const { isDarkMode } = useTheme();
  const [animatedDevices, setAnimatedDevices] = useState([]);

  // Mapeo de tipos de dispositivos a iconos
  const deviceIcons = {
    'refrigerator': FaSnowflake,
    'washing_machine': FaBolt,
    'dishwasher': FaBolt,
    'oven': FaFire,
    'tv': FaTv,
    'computer': FaDesktop,
    'ac_heating': FaWind,
    'lighting': FaLightbulb,
    'router': FaWifi,
    'gaming_console': FaGamepad,
    'other': FaBolt
  };

  // Definir las salas y sus coordenadas
  const rooms = {
    'cocina': { x: 15, y: 15, width: 25, height: 20, name: 'Cocina' },
    'salon': { x: 45, y: 15, width: 30, height: 25, name: 'Salón' },
    'dormitorio': { x: 80, y: 15, width: 15, height: 20, name: 'Dormitorio' },
    'baño': { x: 80, y: 40, width: 15, height: 15, name: 'Baño' },
    'pasillo': { x: 40, y: 40, width: 35, height: 8, name: 'Pasillo' },
    'entrada': { x: 45, y: 50, width: 15, height: 10, name: 'Entrada' }
  };

  // Posiciones específicas para dispositivos dentro de cada sala
  const devicePositions = {
    'cocina': [
      { x: 20, y: 20 }, { x: 30, y: 25 }, { x: 25, y: 30 }
    ],
    'salon': [
      { x: 55, y: 25 }, { x: 65, y: 30 }, { x: 50, y: 35 }
    ],
    'dormitorio': [
      { x: 85, y: 25 }, { x: 90, y: 30 }
    ],
    'baño': [
      { x: 85, y: 45 }
    ],
    'pasillo': [
      { x: 55, y: 44 }
    ],
    'entrada': [
      { x: 52, y: 55 }
    ]
  };

  // Agrupar dispositivos por ubicación
  const groupDevicesByLocation = () => {
    const grouped = {};
    devices.forEach(device => {
      const location = device.location ? device.location.toLowerCase() : 'salon';
      const mappedLocation = mapLocationToRoom(location);
      
      if (!grouped[mappedLocation]) {
        grouped[mappedLocation] = [];
      }
      grouped[mappedLocation].push(device);
    });
    return grouped;
  };

  // Mapear ubicaciones del usuario a salas del plano
  const mapLocationToRoom = (location) => {
    const locationMap = {
      'cocina': 'cocina',
      'kitchen': 'cocina',
      'salon': 'salon',
      'salón': 'salon',
      'living': 'salon',
      'dormitorio': 'dormitorio',
      'bedroom': 'dormitorio',
      'habitacion': 'dormitorio',
      'baño': 'baño',
      'bathroom': 'baño',
      'pasillo': 'pasillo',
      'hall': 'pasillo',
      'entrada': 'entrada',
      'entry': 'entrada'
    };
    
    return locationMap[location] || 'salon';
  };

  // Calcular color según consumo
  const getConsumptionColor = (power, status) => {
    if (status !== 'active') return '#6b7280'; // Gris si está apagado
    
    if (power < 100) return '#10b981'; // Verde - bajo consumo
    if (power < 500) return '#f59e0b'; // Amarillo - medio consumo
    if (power < 1500) return '#ef4444'; // Rojo - alto consumo
    return '#dc2626'; // Rojo intenso - muy alto consumo
  };

  useEffect(() => {
    // Animar dispositivos activos
    const activeDevices = devices.filter(d => d.status === 'active');
    setAnimatedDevices(activeDevices.map(d => d.id));
  }, [devices]);

  const groupedDevices = groupDevicesByLocation();

  return (
    <div className={`house-plan-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="house-plan-header">
        <h2>
          <FaBolt className="header-icon" />
          Plano Energético de la Casa
        </h2>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color low"></div>
            <span>&lt;100W</span>
          </div>
          <div className="legend-item">
            <div className="legend-color medium"></div>
            <span>100-500W</span>
          </div>
          <div className="legend-item">
            <div className="legend-color high"></div>
            <span>500-1500W</span>
          </div>
          <div className="legend-item">
            <div className="legend-color very-high"></div>
            <span>&gt;1500W</span>
          </div>
        </div>
      </div>

      <div className="house-plan-wrapper">
        <svg viewBox="0 0 100 70" className="house-plan-svg">
          {/* Definir gradientes y patrones */}
          <defs>
            <linearGradient id="electricFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="-100 0;100 0;-100 0"
                dur="2s"
                repeatCount="indefinite"
              />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Contorno exterior de la casa */}
          <rect 
            x="10" y="10" width="85" height="55" 
            fill="none" 
            stroke={isDarkMode ? '#475569' : '#374151'} 
            strokeWidth="2"
          />

          {/* Dibujar salas */}
          {Object.entries(rooms).map(([roomKey, room]) => (
            <g key={roomKey}>
              {/* Fondo de la sala */}
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={isDarkMode ? 'rgba(30, 41, 59, 0.3)' : 'rgba(248, 250, 252, 0.5)'}
                stroke={isDarkMode ? '#475569' : '#d1d5db'}
                strokeWidth="1"
                className="room-area"
              />
              
              {/* Etiqueta de la sala */}
              <text
                x={room.x + room.width/2}
                y={room.y + room.height - 2}
                textAnchor="middle"
                fontSize="3"
                fill={isDarkMode ? '#cbd5e1' : '#6b7280'}
                className="room-label"
              >
                {room.name}
              </text>
            </g>
          ))}

          {/* Cuadro eléctrico principal */}
          <g className="electrical-panel">
            <rect 
              x="2" y="30" width="6" height="8" 
              fill={isDarkMode ? '#374151' : '#e5e7eb'}
              stroke="#ef4444" 
              strokeWidth="0.5"
            />
            <text x="5" y="36" textAnchor="middle" fontSize="2" fill="#ef4444">⚡</text>
            <text x="5" y="41" textAnchor="middle" fontSize="2" fill={isDarkMode ? '#cbd5e1' : '#6b7280'}>Panel</text>
          </g>

          {/* Cables principales desde el cuadro eléctrico */}
          <line 
            x1="8" y1="34" x2="15" y2="34" 
            stroke="url(#electricFlow)" 
            strokeWidth="2"
            className="main-cable"
          />
          <line 
            x1="15" y1="34" x2="15" y2="25" 
            stroke="url(#electricFlow)" 
            strokeWidth="2"
            className="main-cable"
          />
          <line 
            x1="15" y1="25" x2="95" y2="25" 
            stroke="url(#electricFlow)" 
            strokeWidth="2"
            className="main-cable"
          />

          {/* Dispositivos por sala */}
          {Object.entries(groupedDevices).map(([roomKey, roomDevices]) => {
            const room = rooms[roomKey];
            if (!room || !devicePositions[roomKey]) return null;

            return roomDevices.map((device, index) => {
              const positions = devicePositions[roomKey];
              const position = positions[index % positions.length];
              const IconComponent = deviceIcons[device.type] || FaBolt;
              const isActive = device.status === 'active';
              const color = getConsumptionColor(device.power, device.status);

              return (
                <g key={device.id} className="device-group">
                  {/* Cable hacia el dispositivo si está activo */}
                  {isActive && (
                    <line
                      x1="15"
                      y1="25"
                      x2={position.x}
                      y2={position.y}
                      stroke="url(#electricFlow)"
                      strokeWidth="1"
                      opacity="0.6"
                      className="device-cable"
                    />
                  )}

                  {/* Círculo del dispositivo */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="3"
                    fill={color}
                    stroke={isActive ? color : '#6b7280'}
                    strokeWidth="0.5"
                    className={`device-circle ${isActive ? 'active' : 'inactive'}`}
                    filter={isActive ? 'url(#glow)' : 'none'}
                  >
                    {isActive && (
                      <animate
                        attributeName="r"
                        values="3;3.5;3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>

                  {/* Icono del dispositivo */}
                  <text
                    x={position.x}
                    y={position.y + 1}
                    textAnchor="middle"
                    fontSize="2"
                    fill="white"
                    className="device-icon"
                  >
                    {device.type === 'refrigerator' ? '❄️' : 
                     device.type === 'tv' ? '📺' : 
                     device.type === 'washing_machine' ? '🧺' :
                     device.type === 'oven' ? '🔥' :
                     device.type === 'computer' ? '💻' :
                     device.type === 'ac_heating' ? '🌡️' :
                     device.type === 'lighting' ? '💡' :
                     device.type === 'router' ? '📡' :
                     device.type === 'gaming_console' ? '🎮' : '⚡'}
                  </text>

                  {/* Información del dispositivo */}
                  <g className="device-info">
                    <text
                      x={position.x}
                      y={position.y - 4}
                      textAnchor="middle"
                      fontSize="1.5"
                      fill={isDarkMode ? '#cbd5e1' : '#374151'}
                      fontWeight="bold"
                    >
                      {device.name.length > 8 ? device.name.substring(0, 8) + '...' : device.name}
                    </text>
                    
                    {isActive && (
                      <text
                        x={position.x}
                        y={position.y + 6}
                        textAnchor="middle"
                        fontSize="1.2"
                        fill={color}
                        fontWeight="bold"
                      >
                        {device.power}W
                      </text>
                    )}
                  </g>
                </g>
              );
            });
          })}

          {/* Estadísticas por sala */}
          {Object.entries(groupedDevices).map(([roomKey, roomDevices]) => {
            const room = rooms[roomKey];
            if (!room || roomDevices.length === 0) return null;

            const activeDevices = roomDevices.filter(d => d.status === 'active');
            const totalPower = activeDevices.reduce((sum, d) => sum + d.power, 0);

            if (totalPower === 0) return null;

            return (
              <g key={`${roomKey}-stats`} className="room-stats">
                <rect
                  x={room.x + room.width - 12}
                  y={room.y + 1}
                  width="11"
                  height="6"
                  fill={isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'}
                  stroke={isDarkMode ? '#475569' : '#d1d5db'}
                  strokeWidth="0.3"
                  rx="1"
                />
                <text
                  x={room.x + room.width - 6.5}
                  y={room.y + 3.5}
                  textAnchor="middle"
                  fontSize="1.2"
                  fill={getConsumptionColor(totalPower, 'active')}
                  fontWeight="bold"
                >
                  {totalPower}W
                </text>
                <text
                  x={room.x + room.width - 6.5}
                  y={room.y + 5.5}
                  textAnchor="middle"
                  fontSize="1"
                  fill={isDarkMode ? '#94a3b8' : '#6b7280'}
                >
                  {activeDevices.length} activos
                </text>
              </g>
            );
          })}
        </svg>

        {/* Panel de información general */}
        <div className="house-stats">
          <div className="stat-item">
            <FaBolt className="stat-icon" />
            <div>
              <span className="stat-label">Potencia Total</span>
              <span className="stat-value">
                {devices.filter(d => d.status === 'active').reduce((sum, d) => sum + d.power, 0)}W
              </span>
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">🏠</span>
            <div>
              <span className="stat-label">Dispositivos Activos</span>
              <span className="stat-value">
                {devices.filter(d => d.status === 'active').length} / {devices.length}
              </span>
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">⚡</span>
            <div>
              <span className="stat-label">Costo/Hora</span>
              <span className="stat-value">
                €{(devices.filter(d => d.status === 'active').reduce((sum, d) => sum + d.power, 0) * 0.00015).toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje si no hay dispositivos */}
      {devices.length === 0 && (
        <div className="no-devices-message">
          <FaBolt size={48} />
          <h3>¡Añade dispositivos para ver tu plano energético!</h3>
          <p>Registra tus electrodomésticos y verás cómo se distribuye el consumo por tu casa</p>
        </div>
      )}
    </div>
  );
};

export default HousePlan;
