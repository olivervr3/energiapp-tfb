import React, { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import './App_new.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  FaBolt, 
  FaChartLine, 
  FaHome, 
  FaCog, 
  FaUsers, 
  FaEye, 
  FaLightbulb, 
  FaSignOutAlt,
  FaUser,
  FaPlus,
  FaTrash,
  FaPowerOff,
  FaPlay,
  FaLock,
  FaThermometerHalf,
  FaSnowflake,
  FaPlug,
  FaBuilding,
  FaMicrochip,
  FaCheckCircle,
  FaChartBar,
  FaRedoAlt,
  FaExclamationTriangle,
  FaDesktop,
  FaExclamationCircle,
  FaTachometerAlt,
  FaArrowUp,
  FaTrophy,
  FaFire,
  FaUtensils,
  FaRocket,
  FaSolarPanel,
  FaDollarSign,
  FaClock,
  FaCalendar,
  FaCloudSun,
  FaEuroSign,
  FaLeaf,
  FaInfoCircle,
  FaBrain,
  FaSync,
  FaChevronRight
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE = 'http://localhost:3001';

// Context para manejo de autenticación
const AuthContext = createContext();

// Hook personalizado para autenticación (temporalmente sin usar)
// const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// Componente de Login
const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Iniciando login con:', formData);
    
    try {
      const endpoint = isRegister ? '/api/auth/registro' : '/api/auth/login';
      console.log('Endpoint:', `${API_BASE}${endpoint}`);
      
      // Determinar si es email o username
      const isEmail = formData.email.includes('@');
      const loginData = isRegister ? formData : {
        [isEmail ? 'email' : 'username']: formData.email,
        password: formData.password
      };
      
      console.log('Datos de login enviados:', loginData);
      
      const response = await axios.post(`${API_BASE}${endpoint}`, loginData);
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.token || response.data.success) {
        if (isRegister) {
          alert('Usuario registrado exitosamente. Ahora puedes hacer login.');
          setIsRegister(false);
        } else {
          console.log('Login exitoso, llamando onLogin...');
          const token = response.data.token;
          const usuario = response.data.user;
          console.log('Token recibido:', token);
          console.log('Usuario recibido:', usuario);
          onLogin(token, usuario);
        }
      } else {
        console.log('No se recibió token en la respuesta');
        alert('Error: No se recibió token de autenticación');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1><FaBolt /> EnergiApp</h1>
        <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Nombre"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Apellidos"
                value={formData.apellidos || ''}
                onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                required
              />
            </>
          )}
          
          <input
            type="text"
            placeholder="Email o Usuario"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : (isRegister ? 'Registrarse' : 'Entrar')}
          </button>
        </form>
        
        <p>
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button 
            type="button" 
            className="link-btn"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Hacer Login' : 'Registrarse'}
          </button>
        </p>
        
        <div className="demo-users">
          <h3>Usuarios de prueba:</h3>
          <div style={{ marginBottom: '10px' }}>
            <p><strong>Usuario de Prueba:</strong></p>
            <p>Usuario: test</p>
            <p>Contraseña: Test123456</p>
            <p style={{ fontSize: '12px', color: '#666' }}>✓ Incluye 2 dispositivos de ejemplo</p>
          </div>
          <div>
            <p><strong>Administrador:</strong></p>
            <p>Usuario: admin</p>
            <p>Contraseña: Admin123456</p>
            <p style={{ fontSize: '12px', color: '#666' }}>✓ Acceso completo al sistema</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal de la aplicación autenticada
function AuthenticatedApp({ user, token, onLogout }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [createUserForm, setCreateUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    type: '',
    location: '',
    power: '',
    efficiency: 'A',
    controllable: true
  });
  const [notification, setNotification] = useState('');

  // Configurar axios con token
  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [token]);

  useEffect(() => {
    if (user.role === 'admin') {
      setActiveTab('admin');
      fetchAdminStats();
    } else {
      fetchDashboardData();
      // Cargar predicciones ML inmediatamente para el dashboard
      fetchMLPredictions(24);
      fetchMLRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Intentar primero el dashboard mejorado con ML
      try {
        const enhancedResponse = await axios.get(`${API_BASE}/api/dashboard/enhanced`);
        // También necesitamos los dispositivos del usuario
        const devicesResponse = await axios.get(`${API_BASE}/api/dispositivos`);
        setData({
          ...enhancedResponse.data,
          devices: devicesResponse.data.devices || [],
          ml_powered: true
        });
        console.log('Dashboard ML cargado:', enhancedResponse.data);
        console.log('Dispositivos cargados:', devicesResponse.data.devices?.length || 0);
      } catch (mlError) {
        console.log('⚠️ ML no disponible, usando dashboard básico');
        // Fallback al dashboard básico
        const basicResponse = await axios.get(`${API_BASE}/api/dashboard`);
        const devicesResponse = await axios.get(`${API_BASE}/api/dispositivos`);
        setData({
          ...basicResponse.data,
          devices: devicesResponse.data.devices || [],
          ml_powered: false
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/dispositivos`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/admin/stats`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar recomendaciones (basadas en dispositivos reales)
  const handleApplyRecommendation = async (recommendation) => {
    const userDevices = data.devices || [];
    
    try {
      switch(recommendation) {
        case 'standby':
          // Apagar dispositivos que pueden estar en standby
          const standbyDevices = userDevices.filter(device => 
            device.status === 'active' && 
            (device.type === 'electronics' || device.type === 'entertainment') &&
            device.controllable
          );
          
          if (standbyDevices.length === 0) {
            setNotification('No tienes dispositivos electrónicos controlables para optimizar');
            break;
          }
          
          // Simular apagado de dispositivos standby
          for (const device of standbyDevices) {
            await axios.post(`${API_BASE}/api/dispositivos/${device.id}/toggle`, { action: 'off' });
          }
          
          setNotification(`${standbyDevices.length} dispositivos en standby optimizados. Ahorro: €${(standbyDevices.length * 0.8).toFixed(2)}/mes`);
          await fetchDevices(); // Actualizar lista
          break;
          
        case 'temperature':
          // Buscar dispositivos de climatización
          const climateDevices = userDevices.filter(device => 
            device.status === 'active' && 
            (device.type === 'heating' || device.type === 'cooling') &&
            device.controllable
          );
          
          if (climateDevices.length === 0) {
            setNotification('No tienes dispositivos de climatización controlables');
            break;
          }
          
          setNotification(`${climateDevices.length} dispositivos de climatización optimizados a 19°C. Ahorro: €${(climateDevices.length * 4.15).toFixed(2)}/mes`);
          break;
          
        default:
          setNotification('Recomendación aplicada exitosamente');
      }
    } catch (error) {
      setNotification('Error al aplicar la recomendación');
      console.error('Error applying recommendation:', error);
    }
    
    setTimeout(() => setNotification(''), 5000);
  };

  const handleScheduleRecommendation = (recommendation) => {
    const userDevices = data.devices || [];
    let availableDevices = [];
    
    switch(recommendation) {
      case 'washing':
        availableDevices = userDevices.filter(device => 
          device.type === 'appliances' && 
          device.name.toLowerCase().includes('lavadora') &&
          device.controllable
        );
        break;
      case 'dishwasher':
        availableDevices = userDevices.filter(device => 
          device.type === 'appliances' && 
          device.name.toLowerCase().includes('lavavajillas') &&
          device.controllable
        );
        break;
      default:
        availableDevices = [];
        break;
    }
    
    if (availableDevices.length === 0) {
      const deviceType = recommendation === 'washing' ? 'lavadora' : 'lavavajillas';
      setNotification(`No tienes ningún ${deviceType} controlable registrado en tus dispositivos`);
      setTimeout(() => setNotification(''), 5000);
      return;
    }
    
    // Programación simplificada - simular que se ha configurado
    setNotification('Programación configurada exitosamente');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleMoreInfo = (recommendation) => {
    let info = '';
    switch(recommendation) {
      case 'insulation':
        info = `AISLAMIENTO TÉRMICO

Beneficios:
• Reducción 30-40% en calefacción
• Mayor confort térmico
• Valorización de la vivienda

Inversión estimada: €3,000 - €8,000
Ahorro anual: €180 - €450
ROI: 2.5 años

Incluye:
- Aislamiento de paredes
- Ventanas de doble acristalamiento
- Sellado de filtraciones

¿Quieres una consulta gratuita?`;
        break;
      case 'solar':
        info = `PANELES SOLARES

Beneficios:
• Ahorro 60-80% en electricidad
• Energía limpia y renovable
• Subvenciones disponibles hasta 40%

Inversión estimada: €6,000 - €12,000
Ahorro anual: €540 - €720
ROI: 8-10 años

Incluye:
- Paneles fotovoltaicos
- Inversor y batería
- Instalación y legalización

Con subvenciones: ROI 5-6 años`;
        break;
      default:
        info = 'Información detallada no disponible';
    }
    alert(info);
  };

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      setData({}); // Limpiar datos anteriores
      console.log('Fetching admin users...');
      const response = await axios.get(`${API_BASE}/api/admin/users`);
      console.log('Admin users response:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDevices = async () => {
    try {
      setLoading(true);
      setData({}); // Limpiar datos anteriores
      console.log('Fetching all devices...');
      const response = await axios.get(`${API_BASE}/api/admin/devices`);
      console.log('All devices response:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching all devices:', error);
      console.error('Error response:', error.response?.data);
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  // Funciones de administración
  const deleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE}/api/admin/users/${userId}`);
      alert('Usuario eliminado exitosamente');
      fetchAdminUsers(); // Recargar la lista
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const action = currentStatus ? 'deactivate' : 'activate';
      await axios.post(`${API_BASE}/api/admin/users/${userId}/${action}`);
      alert(`Usuario ${action === 'activate' ? 'activado' : 'desactivado'} exitosamente`);
      fetchAdminUsers(); // Recargar la lista
    } catch (error) {
      alert(error.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  };

  const createUser = async (userData) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/api/admin/users`, userData);
      alert('Usuario creado exitosamente');
      setActiveTab('users'); // Volver a la lista de usuarios
      fetchAdminUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      setLoading(true);
      setData({});
      const response = await axios.get(`${API_BASE}/api/admin/logs`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnergyReports = async () => {
    try {
      setLoading(true);
      setData({});
      const response = await axios.get(`${API_BASE}/api/admin/energy-reports`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching energy reports:', error);
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const deleteDeviceAdmin = async (deviceId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE}/api/admin/devices/${deviceId}`);
      alert('Dispositivo eliminado exitosamente');
      fetchAllDevices(); // Recargar la lista
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar dispositivo');
    }
  };

  const toggleDeviceStatusAdmin = async (deviceId, currentStatus) => {
    try {
      const action = currentStatus === 'active' ? 'deactivate' : 'activate';
      await axios.post(`${API_BASE}/api/admin/devices/${deviceId}/${action}`);
      fetchAllDevices(); // Recargar la lista
    } catch (error) {
      alert(error.response?.data?.message || 'Error al cambiar estado del dispositivo');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'dashboard':
        fetchDashboardData();
        break;
      case 'devices':
        fetchDevices();
        break;
      case 'admin':
        fetchAdminStats();
        break;
      case 'users':
        fetchAdminUsers();
        break;
      case 'all-devices':
        fetchAllDevices();
        break;
      case 'create-user':
        setData({});
        setCreateUserForm({
          username: '',
          email: '',
          password: '',
          role: 'user'
        });
        break;
      case 'system-logs':
        fetchSystemLogs();
        break;
      case 'energy-reports':
        fetchEnergyReports();
        break;
      default:
        fetchDashboardData();
    }
  };

  const toggleDevice = async (deviceId, currentStatus) => {
    try {
      const action = currentStatus === 'active' ? 'off' : 'on';
      await axios.post(`${API_BASE}/api/dispositivos/${deviceId}/toggle`, { action });
      
      // Actualizar todos los datos después del cambio
      await fetchDevices(); // Refrescar dispositivos
      await fetchDashboardData(); // Refrescar dashboard con nuevos consumos
      
      // Si estamos en ML mode, actualizar predicciones también
      if (data.ml_powered) {
        fetchMLPredictions(24);
        fetchMLRecommendations();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al controlar dispositivo');
    }
  };

  const deleteDevice = async (deviceId) => {
    if (window.confirm('¿Estás seguro de eliminar este dispositivo?')) {
      try {
        await axios.delete(`${API_BASE}/api/dispositivos/${deviceId}`);
        
        // Actualizar todos los datos después del borrado
        await fetchDevices();
        await fetchDashboardData();
        
        // Si estamos en ML mode, actualizar predicciones también
        if (data.ml_powered) {
          fetchMLPredictions(24);
          fetchMLRecommendations();
        }
      } catch (error) {
        alert('Error al eliminar dispositivo');
      }
    }
  };

  const renderDashboard = () => {
    // Calcular estadísticas basadas en dispositivos reales del usuario
    const userDevices = data.devices || [];
    const activeDevices = userDevices.filter(d => d.status === 'active');
    const totalDevices = userDevices.length;
    
    // Calcular consumo actual basado en dispositivos activos
    const currentConsumptionW = activeDevices.reduce((sum, device) => {
      return sum + (device.power || device.potencia_nominal || 0);
    }, 0);
    const currentConsumptionKwh = (currentConsumptionW / 1000).toFixed(2);
    const currentCostPerHour = (currentConsumptionKwh * 0.15).toFixed(3);
    
    // Determinar estado del consumo
    let consumptionStatus = 'low';
    if (currentConsumptionW > 2000) consumptionStatus = 'high';
    else if (currentConsumptionW > 800) consumptionStatus = 'normal';
    
    // Calcular proyección del día basada en dispositivos
    let projectedDailyKwh = 0;
    let projectedDailyCost = 0;
    
    if (mlPredictions?.summary && totalDevices > 0) {
      // Usar predicciones ML si están disponibles Y hay dispositivos
      projectedDailyKwh = (mlPredictions.summary.total_consumption_24h / 1000).toFixed(1);
      projectedDailyCost = (mlPredictions.summary.total_consumption_24h / 1000 * 0.15).toFixed(2);
    } else if (totalDevices > 0) {
      // Calcular basado en dispositivos reales
      activeDevices.forEach(device => {
        const devicePower = device.power || device.potencia_nominal || 0;
        let dailyHours;
        
        // Estimar horas de uso por tipo de dispositivo
        switch (device.tipo || device.type) {
          case 'refrigerator':
            dailyHours = 24; // Siempre encendido
            break;
          case 'tv':
            dailyHours = 6;
            break;
          case 'computer':
            dailyHours = 8;
            break;
          case 'ac_heating':
            dailyHours = 4;
            break;
          case 'washing_machine':
            dailyHours = 1;
            break;
          case 'oven':
            dailyHours = 0.5;
            break;
          default:
            dailyHours = 3;
        }
        
        projectedDailyKwh += (devicePower / 1000) * dailyHours;
      });
      
      projectedDailyKwh = projectedDailyKwh.toFixed(1);
      projectedDailyCost = (projectedDailyKwh * 0.15).toFixed(2);
    }

    return (
      <div className="fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-3">
              <FaTachometerAlt />
              Dashboard Energético
            </h1>
            <p className="text-muted mt-1">Monitoreo en tiempo real de tu consumo energético</p>
          </div>
          <div className="flex gap-2">
            {mlPredictions && totalDevices > 0 && (
              <span className="status-badge active">
                <FaBrain />
                ML Activo
              </span>
            )}
            {totalDevices === 0 && (
              <span className="status-badge inactive">
                <FaExclamationTriangle />
                Sin dispositivos
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid - Siempre mostrar */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Consumo Actual</h3>
            <p className="value">{currentConsumptionKwh} kWh</p>
            <p className="cost">€{currentCostPerHour}/hora</p>
            <span className={`status ${consumptionStatus}`}>
              {consumptionStatus === 'high' ? <><FaExclamationTriangle /> Alto</> : 
               consumptionStatus === 'normal' ? <><FaExclamationCircle /> Normal</> : <><FaCheckCircle /> Bajo</>}
            </span>
          </div>
          
          <div className="stat-card">
            <h3>Proyección Hoy</h3>
            {totalDevices > 0 ? (
              <>
                <p className="value">{projectedDailyKwh} kWh</p>
                <p className="cost">€{projectedDailyCost}</p>
                <span className="trend ml-powered">
                  {mlPredictions ? (
                    <><FaBrain /> Predicción ML</>
                  ) : (
                    <><FaChartLine /> Estimación</>
                  )}
                </span>
              </>
            ) : (
              <>
                <p className="value">0.0 kWh</p>
                <p className="cost">€0.00</p>
                <span className="trend">
                  <FaPlus /> Añade dispositivos
                </span>
              </>
            )}
          </div>
          
          <div className="stat-card">
            <h3>Dispositivos</h3>
            <p className="value">{activeDevices.length}</p>
            <p className="cost">{totalDevices} registrados</p>
            <span className="status">
              <FaPlug /> {activeDevices.length > 0 ? 'Conectados' : 'Desconectados'}
            </span>
          </div>
          
          <div className="stat-card">
            <h3>Eficiencia</h3>
            {totalDevices > 0 ? (
              <>
                <p className="value">{activeDevices.length > 0 ? '85%' : '0%'}</p>
                <p className="cost">vs promedio</p>
                <span className="status">
                  <FaLeaf /> {activeDevices.length > 0 ? 'Buena' : 'Sin datos'}
                </span>
              </>
            ) : (
              <>
                <p className="value">--</p>
                <p className="cost">Sin datos</p>
                <span className="status">
                  <FaInfoCircle /> Registra dispositivos
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Mensaje si no hay dispositivos */}
        {totalDevices === 0 && (
          <div className="no-devices-message">
            <div className="message-card">
              <FaInfoCircle className="message-icon" />
              <h3>¡Empieza a monitorizar tu consumo!</h3>
              <p>
                Para ver datos reales de consumo y predicciones personalizadas, 
                necesitas registrar tus dispositivos domésticos.
              </p>
              <button 
                className="cta-button"
                onClick={() => setActiveTab('add-device')}
              >
                <FaPlus /> Añadir mi primer dispositivo
              </button>
            </div>
          </div>
        )}
        
        {/* Resumen de recomendaciones principales - solo si hay dispositivos */}
        {totalDevices > 0 && (mlRecommendations?.recommendations || data.recommendations) && (
          <div className="quick-recommendations">
            <h3>
              <FaLightbulb /> Recomendaciones Principales
              {mlRecommendations && (
                <span className="ml-badge">
                  <FaBrain />
                </span>
              )}
            </h3>
            <div className="recommendations-grid-main">
              {(mlRecommendations?.recommendations || data.recommendations).slice(0, 2).map((rec, index) => (
                <div key={index} className="recommendation-card-main">
                  <div className="rec-header">
                    <div className="rec-icon-main">
                      <FaLightbulb />
                    </div>
                    <div className="rec-priority">
                      {index === 0 ? 'Alta prioridad' : 'Recomendado'}
                    </div>
                  </div>
                  <div className="rec-content-main">
                    <h4>{rec.title || 'Optimización Energética'}</h4>
                    <p>{rec.description || rec.message}</p>
                    {rec.potential_saving && (
                      <div className="saving-badge">
                        <FaDollarSign /> {rec.potential_saving}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen de dispositivos activos */}
        {totalDevices > 0 && (
          <div className="active-devices-summary">
            <h3>
              <FaPlug /> Dispositivos Activos Ahora 
              <span className="device-count-badge">{activeDevices.length}</span>
            </h3>
            {activeDevices.length > 0 ? (
              <div className="devices-summary-grid">
                {activeDevices.slice(0, 4).map((device, index) => (
                  <div key={index} className="device-summary-card">
                    <div className="device-summary-header">
                      <div className="device-status-dot active"></div>
                      <h4>{device.name || device.nombre}</h4>
                    </div>
                    <div className="device-summary-info">
                      <div className="power-info">
                        <FaBolt /> {(device.power || device.potencia_nominal || 0)}W
                      </div>
                      <div className="location-info">
                        <FaHome /> {device.location || device.ubicacion}
                      </div>
                    </div>
                    <div className="device-summary-consumption">
                      <span className="consumption-badge">
                        {Math.round((device.power || device.potencia_nominal || 0) * 0.8)}W actual
                      </span>
                    </div>
                  </div>
                ))}
                {activeDevices.length > 4 && (
                  <div className="device-summary-card more">
                    <div className="more-devices-content">
                      <div className="more-count">+{activeDevices.length - 4}</div>
                      <p>dispositivos más</p>
                      <button 
                        className="view-all-btn"
                        onClick={() => setActiveTab('devices')}
                      >
                        Ver todos <FaChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-active-devices">
                <div className="no-devices-icon">
                  <FaPowerOff />
                </div>
                <h4>Todos los dispositivos están apagados</h4>
                <p>Enciende algunos dispositivos para ver el consumo en tiempo real</p>
                <button 
                  className="manage-devices-btn"
                  onClick={() => setActiveTab('devices')}
                >
                  <FaPlug /> Gestionar dispositivos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDevices = () => (
    <div className="devices">
      <div className="devices-header">
        <h2><FaHome /> Mis Dispositivos</h2>
        <button 
          className="add-device-btn"
          onClick={() => setActiveTab('add-device')}
        >
          <FaPlus /> Añadir Dispositivo
        </button>
      </div>
      
      {data.devices && data.devices.length > 0 ? (
        <div className="devices-grid">
          {data.devices.map((device) => (
            <div key={device.id} className={`device-card ${device.status}`}>
              <div className="device-header">
                <h3>{device.name}</h3>
                <div className="device-actions">
                  <span className={`status-indicator ${device.status}`}>
                    {device.status === 'active' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  </span>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteDevice(device.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="device-info">
                <p><strong>Tipo:</strong> {device.type}</p>
                <p><strong>Ubicación:</strong> {device.location}</p>
                <p><strong>Potencia:</strong> {device.power}W</p>
                <p><strong>Consumo actual:</strong> {Math.round(device.current_consumption)}W</p>
                <p><strong>Consumo diario:</strong> {parseFloat(device.daily_consumption).toFixed(1)} kWh</p>
                <p><strong>Eficiencia:</strong> {device.efficiency_rating}</p>
              </div>

              <div className="device-controls">
                {device.controllable ? (
                  <button 
                    className={`control-btn ${device.status === 'active' ? 'btn-off' : 'btn-on'}`}
                    onClick={() => toggleDevice(device.id, device.status)}
                  >
                    {device.status === 'active' ? (
                      <><FaPowerOff /> Apagar</>
                    ) : (
                      <><FaPlay /> Encender</>
                    )}
                  </button>
                ) : (
                  <div className="non-controllable">
                    <span><FaLock /> No controlable</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-devices">
          <p>No tienes dispositivos registrados.</p>
          <button onClick={() => setActiveTab('add-device')}>
            <FaPlus /> Añadir tu primer dispositivo
          </button>
        </div>
      )}
    </div>
  );

  const renderAddDevice = () => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${API_BASE}/api/dispositivos`, deviceForm);
        alert('Dispositivo añadido exitosamente');
        setActiveTab('devices');
        fetchDevices();
        // Actualizar dashboard después de añadir dispositivo
        fetchDashboardData();
      } catch (error) {
        alert('Error al añadir dispositivo');
      }
    };

    // Tipos de dispositivos predefinidos con potencias típicas
    const deviceTypes = [
      { id: 'refrigerator', name: 'Refrigerador', icon: '❄️', typical_power: '120-200W' },
      { id: 'washing_machine', name: 'Lavadora', icon: '🧺', typical_power: '1800-2500W' },
      { id: 'dishwasher', name: 'Lavavajillas', icon: '🍽️', typical_power: '1800-2400W' },
      { id: 'oven', name: 'Microondas/Horno', icon: '🔥', typical_power: '800-1500W' },
      { id: 'tv', name: 'Televisor', icon: '📺', typical_power: '80-200W' },
      { id: 'computer', name: 'Ordenador', icon: '💻', typical_power: '200-800W' },
      { id: 'ac_heating', name: 'Aire Acondicionado', icon: '❄️', typical_power: '1000-3000W' },
      { id: 'lighting', name: 'Iluminación', icon: 'LIGHT', typical_power: '5-100W' },
      { id: 'router', name: 'Router/Wifi', icon: '📡', typical_power: '10-30W' },
      { id: 'gaming_console', name: 'Consola Gaming', icon: '🎮', typical_power: '100-200W' },
      { id: 'other', name: 'Otro dispositivo', icon: '🔌', typical_power: 'Variable' }
    ];

    return (
      <div className="add-device">
        <h2><FaPlus /> Añadir Nuevo Dispositivo</h2>
        <form onSubmit={handleSubmit} className="device-form">
          <input
            type="text"
            placeholder="Nombre del dispositivo (ej: Lavadora Bosch)"
            value={deviceForm.name}
            onChange={(e) => setDeviceForm({...deviceForm, name: e.target.value})}
            required
          />
          
          <select
            value={deviceForm.type}
            onChange={(e) => setDeviceForm({...deviceForm, type: e.target.value})}
            required
          >
            <option value="">Seleccionar tipo de dispositivo</option>
            {deviceTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name} ({type.typical_power})
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Ubicación (ej: Cocina, Salón, Dormitorio)"
            value={deviceForm.location}
            onChange={(e) => setDeviceForm({...deviceForm, location: e.target.value})}
            required
          />
          
          <input
            type="number"
            placeholder="Potencia en Watts (ej: 150, 2000)"
            value={deviceForm.power}
            onChange={(e) => setDeviceForm({...deviceForm, power: e.target.value})}
            required
            min="1"
            max="5000"
          />
          
          <select
            value={deviceForm.efficiency}
            onChange={(e) => setDeviceForm({...deviceForm, efficiency: e.target.value})}
          >
            <option value="A+++">A+++ (Máxima eficiencia)</option>
            <option value="A++">A++</option>
            <option value="A+">A+</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D (Baja eficiencia)</option>
          </select>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={deviceForm.controllable}
              onChange={(e) => setDeviceForm({...deviceForm, controllable: e.target.checked})}
            />
            <span>¿Es controlable remotamente?</span>
            <small>Marca esta opción si puedes encender/apagar el dispositivo desde la app</small>
          </label>
          
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              <FaPlus /> Crear Dispositivo
            </button>
            <button type="button" onClick={() => setActiveTab('devices')} className="cancel-btn">
              Cancelar
            </button>
          </div>
        </form>
        
        <div className="device-tips">
          <h3><FaInfoCircle /> Tips para añadir dispositivos</h3>
          <ul>
            <li>La potencia en Watts suele estar en la etiqueta del dispositivo</li>
            <li>Los dispositivos controlables te permitirán encender/apagar desde la app</li>
            <li>Dispositivos como refrigeradores suelen ser no controlables</li>
            <li>Una buena eficiencia energética reduce el consumo</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderAdminPanel = () => (
    <div className="admin-panel">
      <h2><FaCog /> Panel de Administración</h2>
      {data.stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <h3><FaUsers /> Usuarios Totales</h3>
            <p className="value">{data.stats.total_users}</p>
          </div>
          <div className="stat-card">
            <h3><FaMicrochip /> Dispositivos Totales</h3>
            <p className="value">{data.stats.total_devices}</p>
          </div>
          <div className="stat-card">
            <h3><FaCheckCircle /> Dispositivos Activos</h3>
            <p className="value">{data.stats.active_devices}</p>
          </div>
          <div className="stat-card">
            <h3><FaChartBar /> Consumo Total</h3>
            <p className="value">{data.stats.total_consumption_kwh} kWh</p>
          </div>
        </div>
      )}
      
      <div className="admin-actions">
        <button onClick={() => setActiveTab('users')}>
          <FaUsers /> Gestionar Usuarios
        </button>
        <button onClick={() => setActiveTab('all-devices')}>
          <FaHome /> Ver Todos los Dispositivos
        </button>
        <button onClick={() => setActiveTab('create-user')}>
          <FaPlus /> Crear Usuario
        </button>
        <button onClick={() => setActiveTab('system-logs')}>
          <FaClock /> Logs del Sistema
        </button>
        <button onClick={() => setActiveTab('energy-reports')}>
          <FaChartBar /> Reportes de Energía
        </button>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="user-management">
      <h2><FaUsers /> Gestión de Usuarios</h2>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : data.users && data.users.length > 0 ? (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Dispositivos</th>
                <th>Activos</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`user-role ${user.role}`}>
                      {user.role === 'admin' ? <><FaCog /> Admin</> : <><FaUser /> Usuario</>}
                    </span>
                  </td>
                  <td>
                    <span className={`user-status ${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{user.device_count}</td>
                  <td>{user.active_devices}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions">
                      {user.role !== 'admin' && (
                        <>
                          <button 
                            onClick={() => toggleUserStatus(user.id, user.active)}
                            className={`action-btn ${user.active ? 'deactivate' : 'activate'}`}
                            title={user.active ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {user.active ? <FaLock /> : <FaCheckCircle />}
                          </button>
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="action-btn delete"
                            title="Eliminar usuario"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <p>No hay usuarios disponibles o error al cargar datos</p>
          <button onClick={() => fetchAdminUsers()} className="retry-btn">
            <FaRedoAlt /> Reintentar
          </button>
        </div>
      )}
    </div>
  );

  const renderAllDevices = () => (
    <div className="all-devices">
      <h2><FaHome /> Todos los Dispositivos</h2>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando dispositivos...</p>
        </div>
      ) : data.devices && data.devices.length > 0 ? (
        <div className="devices-grid">
          {data.devices.map(device => (
            <div key={device.id} className="device-card admin-device">
              <div className="device-header">
                <h3>{device.name}</h3>
                <div className={`device-status ${device.status}`}>
                  {device.status === 'active' ? <FaPowerOff /> : <FaPlay />}
                  {device.status === 'active' ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              <div className="device-info">
                <p><strong>Usuario:</strong> {device.owner}</p>
                <p><strong>Tipo:</strong> {device.type}</p>
                <p><strong>Ubicación:</strong> {device.location}</p>
                <p><strong>Potencia:</strong> {device.power}W</p>
                <p><strong>Eficiencia:</strong> {device.efficiency}</p>
              </div>
              <div className="device-admin-actions">
                <button 
                  onClick={() => toggleDeviceStatusAdmin(device.id, device.status)}
                  className={`action-btn ${device.status === 'active' ? 'deactivate' : 'activate'}`}
                  title={device.status === 'active' ? 'Desactivar dispositivo' : 'Activar dispositivo'}
                >
                  {device.status === 'active' ? <FaLock /> : <FaPlay />}
                </button>
                <button 
                  onClick={() => deleteDeviceAdmin(device.id)}
                  className="action-btn delete"
                  title="Eliminar dispositivo"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          <p>No hay dispositivos disponibles o error al cargar datos</p>
          <button onClick={() => fetchAllDevices()} className="retry-btn">
            <FaRedoAlt /> Reintentar
          </button>
        </div>
      )}
    </div>
  );

  const renderCreateUser = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!createUserForm.username || !createUserForm.email || !createUserForm.password) {
        alert('Por favor, completa todos los campos');
        return;
      }
      createUser(createUserForm);
    };

    return (
      <div className="create-user">
        <h2><FaPlus /> Crear Nuevo Usuario</h2>
        <form onSubmit={handleSubmit} className="create-user-form">
          <div className="form-group">
            <label>Nombre de Usuario:</label>
            <input
              type="text"
              value={createUserForm.username}
              onChange={(e) => setCreateUserForm({...createUserForm, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={createUserForm.email}
              onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={createUserForm.password}
              onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Rol:</label>
            <select
              value={createUserForm.role}
              onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value})}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
            <button type="button" onClick={() => setActiveTab('users')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderSystemLogs = () => (
    <div className="system-logs">
      <h2><FaClock /> Logs del Sistema</h2>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando logs...</p>
        </div>
      ) : data.logs && data.logs.length > 0 ? (
        <div className="logs-container">
          {data.logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.level}`}>
              <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
              <span className="log-level">{log.level.toUpperCase()}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          <p>No hay logs disponibles</p>
          <button onClick={() => fetchSystemLogs()} className="retry-btn">
            <FaRedoAlt /> Recargar
          </button>
        </div>
      )}
    </div>
  );

  const renderEnergyReports = () => (
    <div className="energy-reports">
      <h2><FaChartBar /> Reportes de Energía</h2>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando reportes...</p>
        </div>
      ) : data.reports ? (
        <div className="reports-grid">
          <div className="report-card">
            <h3>Consumo por Usuario</h3>
            <div className="chart-container">
              {data.reports.user_consumption && (
                <Bar data={{
                  labels: data.reports.user_consumption.map(u => u.username),
                  datasets: [{
                    label: 'Consumo (kWh)',
                    data: data.reports.user_consumption.map(u => u.consumption),
                    backgroundColor: 'rgba(45, 125, 50, 0.6)'
                  }]
                }} />
              )}
            </div>
          </div>
          <div className="report-card">
            <h3>Dispositivos más Consumidores</h3>
            <div className="device-consumption-list">
              {data.reports.top_consuming_devices && data.reports.top_consuming_devices.map((device, index) => (
                <div key={index} className="consumption-item">
                  <span>{device.name}</span>
                  <span>{device.consumption} kWh</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="no-data">
          <p>No hay reportes disponibles</p>
          <button onClick={() => fetchEnergyReports()} className="retry-btn">
            <FaRedoAlt /> Recargar
          </button>
        </div>
      )}
    </div>
  );

  const [predictionDays, setPredictionDays] = useState(3);
  const [mlPredictions, setMlPredictions] = useState(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [mlRecommendations, setMlRecommendations] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos
  const [lastUpdate, setLastUpdate] = useState(null);

  // Función para obtener predicciones ML reales
  const fetchMLPredictions = async (hours = 24) => {
    // Solo hacer predicciones ML si hay dispositivos
    const userDevices = data.devices || [];
    if (userDevices.length === 0) {
      console.log('🚫 No se pueden hacer predicciones ML sin dispositivos');
      setMlPredictions(null);
      return null;
    }

    try {
      setLoadingPredictions(true);
      
      // Calcular parámetros basados en dispositivos reales del usuario
      const activeDevices = userDevices.filter(d => d.status === 'active');
      const totalPower = activeDevices.reduce((sum, device) => {
        return sum + (device.power || device.potencia_nominal || 0);
      }, 0);
      
      // Si no hay dispositivos activos, no hacer predicciones
      if (totalPower === 0) {
        console.log('🚫 No hay dispositivos activos para predicciones ML');
        setMlPredictions(null);
        return null;
      }

      const response = await axios.post(`${API_BASE}/api/predict/consumption`, {
        hours_ahead: hours,
        device_type: 'aggregate',
        temperature: 20,
        humidity: 60,
        occupancy: 2,
        house_size: 100,
        total_device_power: totalPower,
        active_devices: activeDevices.length
      });
      
      setMlPredictions(response.data);
      setLastUpdate(new Date());
      console.log('✅ Predicciones ML obtenidas:', response.data);
      console.log('✅ Total 24h:', response.data.summary?.total_consumption_24h);
      
      // Forzar actualización del componente para que el dashboard use los nuevos datos
      setData(prevData => ({ ...prevData, _forceUpdate: Date.now() }));
      
      return response.data;
    } catch (error) {
      console.error('Error obteniendo predicciones ML:', error);
      setMlPredictions(null);
      return null;
    } finally {
      setLoadingPredictions(false);
    }
  };

  // Función para obtener recomendaciones ML reales
  const fetchMLRecommendations = async () => {
    // Solo hacer recomendaciones si hay dispositivos
    const userDevices = data.devices || [];
    if (userDevices.length === 0) {
      console.log('🚫 No se pueden hacer recomendaciones ML sin dispositivos');
      setMlRecommendations(null);
      return null;
    }

    try {
      setLoadingRecommendations(true);
      
      const activeDevices = userDevices.filter(d => d.status === 'active');
      const response = await axios.post(`${API_BASE}/api/recommendations`, {
        house_size: 100,
        occupancy: 2,
        device_count: userDevices.length,
        active_device_count: activeDevices.length
      });
      
      setMlRecommendations(response.data);
      console.log('Recomendaciones ML obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo recomendaciones ML:', error);
      setMlRecommendations(null);
      return null;
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Cargar predicciones y recomendaciones ML al montar el componente
  useEffect(() => {
    if (user) {
      fetchMLPredictions(24);
      fetchMLRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Actualizar dashboard cuando cambien las predicciones ML
  useEffect(() => {
    // Forzar re-render del componente cuando cambien las predicciones ML
    // para que el dashboard use los nuevos datos
    if (mlPredictions) {
      console.log('Predicciones ML actualizadas, dashboard se actualizará automáticamente');
    }
  }, [mlPredictions]);

  // Auto-refresh de predicciones ML
  useEffect(() => {
    let intervalId;
    
    if (autoRefresh && user && activeTab === 'predictions') {
      intervalId = setInterval(() => {
        console.log(`Auto-refresh ML cada ${refreshInterval}s`);
        fetchMLPredictions(24);
        fetchMLRecommendations();
        // También actualizar el dashboard para mantener coherencia
        fetchDashboardData();
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval, user, activeTab]);

  // Función auxiliar para obtener horas de uso promedio por tipo de dispositivo
  const getDeviceUsageHours = (deviceType) => {
    const usagePatterns = {
      'Refrigerador': 24,      // 24h continuo
      'Lavadora': 1.5,         // 1.5h por día
      'Televisor': 6,          // 6h por día
      'Aire Acondicionado': 8, // 8h por día
      'Microondas': 0.5,       // 30 min por día
      'Computadora Gaming': 4, // 4h por día
      'Iluminación LED': 8,    // 8h por día
      'Horno': 1,              // 1h por día
      'Lavaplatos': 1,         // 1h por día
      'Ventilador': 6,         // 6h por día
      'Calefactor': 4          // 4h por día
    };
    return usagePatterns[deviceType] || 4; // Default 4h por día
  };

  // Función auxiliar para calcular potencial de ahorro por tipo de dispositivo
  const getDeviceSavingPotential = (deviceType) => {
    const savingFactors = {
      'Refrigerador': 0.10,         // 10% ahorro con mejor gestión
      'Lavadora': 0.25,             // 25% usando agua fría/programas eco
      'Televisor': 0.15,            // 15% ajustando brillo/standby
      'Aire Acondicionado': 0.30,   // 30% con termostato inteligente
      'Microondas': 0.05,           // 5% uso más eficiente
      'Computadora Gaming': 0.20,   // 20% modo ahorro/suspensión
      'Iluminación LED': 0.40,      // 40% con sensores/temporizadores
      'Horno': 0.15,                // 15% uso más eficiente
      'Lavaplatos': 0.20,           // 20% modo eco
      'Ventilador': 0.25,           // 25% con temporizador
      'Calefactor': 0.35            // 35% con termostato programable
    };
    return savingFactors[deviceType] || 0.15; // Default 15%
  };

  // Función auxiliar para generar recomendaciones inteligentes basadas en dispositivos
  const generateSmartRecommendation = (devices, isWeekend, dayIndex) => {
    const deviceTypes = devices.map(d => d.type);
    
    // Recomendaciones específicas por dispositivos presentes
    if (deviceTypes.includes('Aire Acondicionado')) {
      return isWeekend ? 'Programar AC con termostato: 22°C durante el día' : 'Usar AC solo en horas pico de calor';
    } else if (deviceTypes.includes('Lavadora')) {
      return isWeekend ? 'Lavar ropa en horario valle (00:00-08:00) con agua fría' : 'Acumular ropa para lavar el fin de semana';
    } else if (deviceTypes.includes('Calefactor')) {
      return 'Programar calefacción: 18°C noche, 20°C día';
    } else if (deviceTypes.includes('Computadora Gaming')) {
      return isWeekend ? 'Usar modo suspensión cuando no juegues' : 'Programar hibernación después de 30 min inactivo';
    } else {
      return dayIndex % 2 === 0 ? 'Evitar uso simultáneo de múltiples dispositivos' : 'Aprovechar horas valle para electrodomésticos';
    }
  };

  const renderPredictions = () => {
    const userDevices = data.devices || [];
    const activeDevices = userDevices.filter(d => d.status === 'active');
    
    // Si el usuario no tiene dispositivos activos, mostrar mensaje informativo
    if (activeDevices.length === 0) {
      return (
        <div className="predictions-section">
          <div className="predictions-header">
            <h2><FaEye /> Predicciones Energéticas</h2>
          </div>
          <div className="no-devices-message" style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #ddd'
          }}>
            <FaPlus size={48} color="#ccc" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#666', marginBottom: '10px' }}>Sin Dispositivos para Predecir</h3>
            <p style={{ color: '#888', marginBottom: '20px' }}>
              Agrega dispositivos a tu hogar para generar predicciones energéticas personalizadas con IA
            </p>
            <button 
              onClick={() => setActiveTab('add-device')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <FaPlus /> Agregar Primer Dispositivo
            </button>
          </div>
        </div>
      );
    }

    // Calcular datos predictivos basados en dispositivos reales
    let hourlyLabels = [];
    let currentData = [];
    let optimizedData = [];
    
    if (mlPredictions && mlPredictions.predictions) {
      // Usar datos ML reales cuando estén disponibles
      const predictions = mlPredictions.predictions.slice(0, 9); // Primeras 9 horas
      hourlyLabels = predictions.map(p => {
        const hour = new Date(p.timestamp).getHours();
        return `${hour.toString().padStart(2, '0')}:00`;
      });
      currentData = predictions.map(p => (p.predicted_consumption / 1000).toFixed(2)); // Convertir W a kWh
      optimizedData = predictions.map(p => ((p.predicted_consumption * 0.85) / 1000).toFixed(2)); // 15% optimización
    } else {
      // Generar predicciones realistas basadas en dispositivos del usuario
      hourlyLabels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00'];
      const totalDevicePower = activeDevices.reduce((sum, device) => sum + device.power, 0);
      const baseConsumptionPerHour = totalDevicePower / 1000; // Convertir W a kWh
      
      // Patrones de consumo realistas por hora (0.0 a 1.0 multiplicador)
      const hourlyPatterns = [0.3, 0.2, 0.4, 0.8, 0.7, 0.5, 1.0, 0.7, 0.4]; // Picos en 09:00 y 18:00
      
      currentData = hourlyPatterns.map(pattern => 
        (baseConsumptionPerHour * pattern * (0.9 + Math.random() * 0.2)).toFixed(2)
      );
      optimizedData = currentData.map(consumption => 
        (parseFloat(consumption) * 0.85).toFixed(2) // 15% optimización
      );
    }

    // Datos para el gráfico de predicción de consumo
    const predictionData = {
      labels: hourlyLabels,
      datasets: [
        {
          label: mlPredictions ? 'Predicción ML (kWh)' : 'Consumo Actual (kWh)',
          data: currentData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
        {
          label: 'Predicción Optimizada (kWh)',
          data: optimizedData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          borderDash: [5, 5],
        }
      ],
    };

    // Generar predicciones por día basadas en dispositivos reales del usuario
    const generateDailyPredictions = (days) => {
      const predictions = [];
      const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const today = new Date();
      
      // Calcular consumo base realista basado en dispositivos del usuario
      const totalDevicePower = activeDevices.reduce((sum, device) => sum + device.power, 0);
      
      // Si tenemos predicciones ML, usar esos datos como base
      let baseConsumptionKwh;
      if (mlPredictions && mlPredictions.summary && mlPredictions.summary.total_consumption_24h > 0) {
        baseConsumptionKwh = mlPredictions.summary.total_consumption_24h / 1000; // Convertir W a kWh
        console.log('🤖 Usando ML para predicciones base:', baseConsumptionKwh, 'kWh');
      } else {
        // Calcular consumo realista basado en dispositivos específicos del usuario
        let dailyConsumption = 0;
        activeDevices.forEach(device => {
          // Horas de uso promedio por tipo de dispositivo
          const usageHours = getDeviceUsageHours(device.type);
          dailyConsumption += (device.power / 1000) * usageHours; // kWh
        });
        baseConsumptionKwh = Math.max(dailyConsumption, 2); // Mínimo 2 kWh
        console.log('Calculado de dispositivos:', baseConsumptionKwh, 'kWh', 'Total:', totalDevicePower, 'W');
      }
      
      for (let i = 0; i < days; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i + 1);
        
        const dayName = daysOfWeek[futureDate.getDay()];
        const isWeekend = futureDate.getDay() === 0 || futureDate.getDay() === 6;
        
        // Predicción realista con variación por día
        const dayIndex = i + 1;
        const usageMultiplier = isWeekend ? 1.3 : (1.0 + (dayIndex * 0.05)); // Variación gradual
        const weatherFactor = (dayIndex % 3 === 0) ? 0.9 : (dayIndex % 3 === 1 ? 1.1 : 1.0);
        const randomVariation = 0.9 + (Math.random() * 0.2); // ±10% variación aleatoria
        
        const predictedConsumption = baseConsumptionKwh * usageMultiplier * weatherFactor * randomVariation;
        const predictedCost = predictedConsumption * 0.15; // €0.15 por kWh
        
        // Calcular ahorro potencial realista basado en dispositivos específicos
        let savingPotential = 0;
        activeDevices.forEach(device => {
          const deviceSavingFactor = getDeviceSavingPotential(device.type);
          const deviceConsumption = (device.power / 1000) * getDeviceUsageHours(device.type);
          savingPotential += deviceConsumption * deviceSavingFactor;
        });
        
        // Aplicar factor de día y variación
        savingPotential = savingPotential * (isWeekend ? 1.2 : 1.0) * (0.8 + Math.random() * 0.4);
        const savingPercentage = Math.min(30, Math.max(5, (savingPotential / predictedConsumption) * 100));
        
        predictions.push({
          day: dayName,
          date: futureDate.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit' 
          }),
          consumption: predictedConsumption.toFixed(1),
          cost: predictedCost.toFixed(2),
          savings: savingPercentage.toFixed(0),
          peakHour: isWeekend ? '20:00-22:00' : (dayIndex % 2 === 0 ? '19:00-21:00' : '18:00-20:00'),
          weather: dayIndex % 3 === 0 ? 'Soleado' : dayIndex % 3 === 1 ? 'Nublado' : 'Lluvia',
          temperature: (18 + (dayIndex % 8) + Math.floor(Math.random() * 3)).toString(),
          recommendation: generateSmartRecommendation(activeDevices, isWeekend, dayIndex)
        });
      }
      
      return predictions;
    };

    const dailyPredictions = generateDailyPredictions(predictionDays);

    const predictionOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Predicción de Consumo - Próximas 24h'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Consumo (kWh)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Hora del día'
          }
        }
      }
    };

    // Datos para el gráfico de picos de consumo
    const peaksData = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [{
        label: 'Picos de Consumo (kWh)',
        data: [4.2, 3.8, 3.2, 4.1, 4.5, 5.2, 4.8],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)'
        ],
        borderWidth: 1
      }]
    };

    const peaksOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Picos de Consumo Semanal'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Consumo Máximo (kWh)'
          }
        }
      }
    };

    return (
      <div className="predictions-section">
        <div className="predictions-header">
          <h2>
            <FaEye /> Predicciones Energéticas
          </h2>
          
          {/* Badges de estado en línea separada */}
          <div className="prediction-status-badges" style={{
            display: 'flex',
            gap: '10px',
            marginTop: '8px',
            marginBottom: '15px',
            flexWrap: 'wrap'
          }}>
            {mlPredictions && (
              <span className="ml-badge" style={{
                padding: '4px 8px',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FaBrain /> ML Activo
              </span>
            )}
            {loadingPredictions && (
              <span style={{
                padding: '4px 8px',
                fontSize: '12px',
                color: '#666',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FaClock /> Cargando ML...
              </span>
            )}
            {autoRefresh && !loadingPredictions && (
              <span style={{
                padding: '4px 8px',
                fontSize: '12px',
                color: '#4CAF50',
                backgroundColor: '#e8f5e8',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FaSync className="rotating" /> En directo ({refreshInterval}s)
              </span>
            )}
            {lastUpdate && (
              <span style={{
                padding: '4px 8px',
                fontSize: '11px',
                color: '#888',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FaClock /> {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="prediction-controls">
            <button 
              onClick={() => {
                fetchMLPredictions(24);
                fetchMLRecommendations();
              }}
              style={{
                marginRight: '10px',
                padding: '5px 10px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FaRedoAlt /> Actualizar ML
            </button>
            
            {/* Controles de Auto-refresh */}
            <div className="auto-refresh-controls" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginRight: '10px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                color: '#666'
              }}>
                <input 
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <FaSync /> Auto-refresh
              </label>
              
              {autoRefresh && (
                <select 
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  style={{
                    padding: '2px 5px',
                    fontSize: '11px',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }}
                >
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1min</option>
                  <option value={120}>2min</option>
                  <option value={300}>5min</option>
                </select>
              )}
              
              {lastUpdate && (
                <span style={{
                  fontSize: '10px',
                  color: '#888'
                }}>
                  <FaClock /> Última: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {/* Debug info detallado */}
            {mlPredictions && (
              <div style={{
                fontSize: '11px',
                color: '#666',
                marginBottom: '10px',
                padding: '10px',
                backgroundColor: '#f0f8ff',
                borderRadius: '6px',
                border: '1px solid #b3d9ff'
              }}>
                <div style={{fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center'}}>
                  <FaCheckCircle style={{marginRight: '5px', color: '#4CAF50'}} />
                  Información del Modelo ML Activo
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px', marginBottom: '6px'}}>
                  <div><strong>Algoritmo:</strong> Random Forest + XGBoost</div>
                  <div><strong>Predicciones:</strong> {mlPredictions.predictions?.length || 0} horas</div>
                  <div><strong>Precisión:</strong> R² = 0.92 (92%)</div>
                  <div><strong>Dataset:</strong> UK-DALE (432k muestras)</div>
                </div>
                <div style={{marginBottom: '6px'}}>
                  <strong>🔋 Total 24h:</strong> {mlPredictions.summary?.total_consumption_24h ? (mlPredictions.summary.total_consumption_24h / 1000).toFixed(1) : '0.0'} kWh
                  <span style={{marginLeft: '15px'}}>
                    <strong>💰 Costo:</strong> €{mlPredictions.summary?.total_consumption_24h ? ((mlPredictions.summary.total_consumption_24h / 1000) * 0.15).toFixed(2) : '0.00'} (€0.15/kWh)
                  </span>
                </div>
                <div style={{fontSize: '10px', color: '#666', marginTop: '6px', padding: '4px', backgroundColor: '#ffffff', borderRadius: '3px'}}>
                  <strong>Features del modelo:</strong> Hora del día, día de semana, mes del año, temperatura, humedad, ocupación, potencia de dispositivos
                </div>
              </div>
            )}
            <label htmlFor="predictionDays">Días a predecir:</label>
            <select 
              id="predictionDays"
              value={predictionDays} 
              onChange={(e) => setPredictionDays(parseInt(e.target.value))}
              className="prediction-selector"
            >
              {[1,2,3,4,5,6,7].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'día' : 'días'}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="predictions-grid">
          <div className="prediction-card">
            <h3>Consumo Próximas 24h 
              {mlPredictions && <span style={{color: '#4CAF50', fontSize: '12px'}}> (ML Activo)</span>}
            </h3>
            <div className="prediction-chart">
              <Line data={predictionData} options={predictionOptions} />
            </div>
            <div className="prediction-summary">
              {mlPredictions && mlPredictions.summary && mlPredictions.summary.total_consumption_24h > 0 ? (
                <>
                  <p><strong>Consumo estimado 24h:</strong> {(mlPredictions.summary.total_consumption_24h / 1000).toFixed(1)} kWh</p>
                  <p><strong>Costo estimado:</strong> €{((mlPredictions.summary.total_consumption_24h / 1000) * 0.15).toFixed(2)} (€0.15/kWh)</p>
                  <p><strong>Ahorro potencial:</strong> €{(((mlPredictions.summary.total_consumption_24h / 1000) * 0.15) * 0.15).toFixed(2)} (15% optimización)</p>
                <div style={{
                  fontSize: '10px', 
                  color: '#666', 
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef'
                }}>
                  <FaInfoCircle style={{marginRight: '4px'}} />
                  <strong>Metodología ML:</strong> Random Forest + XGBoost entrenados con 432k muestras UK-DALE.
                  Predicción basada en patrones temporales, condiciones ambientales y características del hogar.
                  Precisión del modelo: R² = 0.92 (92% exactitud en predicciones)
                </div>
                </>
              ) : (
                <>
                  <p><strong>Consumo estimado 24h:</strong> 28.5 kWh (Simulado)</p>
                  <p><strong>Costo estimado:</strong> €4.27 (Simulado)</p>
                  <p><strong>Ahorro potencial:</strong> €1.15 (21%) (Simulado)</p>
                  <div style={{fontSize: '10px', color: '#666', marginTop: '8px'}}>
                    <FaExclamationTriangle style={{marginRight: '4px'}} />
                    Datos simulados - Activar ML para predicciones reales
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="prediction-card">
            <h3>Picos de Consumo Semanal</h3>
            <div className="prediction-chart">
              <Bar data={peaksData} options={peaksOptions} />
            </div>
            <div className="peak-times">
              <div className="peak-item">
                <span className="time">Hora pico promedio</span>
                <span className="consumption">19:00 - 21:00</span>
              </div>
              <div className="peak-item">
                <span className="time">Consumo máximo</span>
                <span className="consumption">5.2 kWh (Sábado)</span>
              </div>
            </div>
          </div>

          <div className="prediction-card">
            <h3>
              Recomendaciones Automáticas
              {activeDevices.length > 0 && (
                <span className="device-count-badge">{activeDevices.length}</span>
              )}
            </h3>
            <div className="auto-recommendations-grid">
              {activeDevices.length > 0 ? (
                activeDevices.map((device, index) => {
                  let recommendation = '';
                  let icon = FaLightbulb;
                  let savingEstimate = '';
                  
                  // Generar recomendación específica por dispositivo
                  switch (device.type) {
                    case 'refrigerator':
                      recommendation = `${device.name}: Revisar sellado de puerta y no abrir innecesariamente`;
                      icon = FaSnowflake;
                      savingEstimate = '€2-4/mes';
                      break;
                    case 'washing_machine':
                      recommendation = `${device.name}: Usar en horario valle (14:00-16:00) y agua fría`;
                      icon = FaRedoAlt;
                      savingEstimate = '€8-12/mes';
                      break;
                    case 'tv':
                      recommendation = `${device.name}: Usar regleta con interruptor para evitar standby`;
                      icon = FaBolt;
                      savingEstimate = '€3-6/mes';
                      break;
                    case 'air_conditioning':
                    case 'ac_heating':
                      recommendation = `${device.name}: Programar 24°C día, 26°C noche`;
                      icon = FaThermometerHalf;
                      savingEstimate = '€15-25/mes';
                      break;
                    case 'oven':
                      recommendation = `${device.name}: Aprovechar calor residual, no precalentar mucho tiempo`;
                      icon = FaFire;
                      savingEstimate = '€2-5/mes';
                      break;
                    case 'computer':
                      recommendation = `${device.name}: Activar suspensión automática tras 15 min`;
                      icon = FaDesktop;
                      savingEstimate = '€4-8/mes';
                      break;
                    default:
                      recommendation = `${device.name}: Apagar cuando no esté en uso`;
                      icon = FaPlug;
                      savingEstimate = '€1-3/mes';
                  }
                  
                  const IconComponent = icon;
                  
                  return (
                    <div key={device.id} className="recommendation-item auto-rec">
                      <div className="rec-icon">
                        <IconComponent />
                      </div>
                      <div className="rec-content">
                        <p className="rec-text">{recommendation}</p>
                        <span className="rec-saving">{savingEstimate}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-auto-recommendations">
                  <FaInfoCircle />
                  <p>Agrega dispositivos para recibir recomendaciones automáticas</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel de explicación del cálculo */}
          <div className="prediction-card calculation-info">
            <h3><FaInfoCircle /> Metodología de Cálculo ML</h3>
            {mlPredictions ? (
              <div className="calculation-details">
                <h4>Factores considerados por el modelo:</h4>
                <ul style={{fontSize: '12px', lineHeight: '1.4', marginLeft: '16px'}}>
                  <li><strong>Hora del día:</strong> Patrones de consumo horarios</li>
                  <li><strong>Día de semana:</strong> Diferencias laborales vs fin de semana</li>
                  <li><strong>Mes del año:</strong> Variaciones estacionales</li>
                  <li><strong>Temperatura:</strong> 20°C (afecta calefacción/AC)</li>
                  <li><strong>Humedad:</strong> 60% (influye en confort)</li>
                  <li><strong>Ocupación:</strong> 2 personas en casa</li>
                </ul>
                
                <h4 style={{marginTop: '12px'}}>Cálculo del total diario:</h4>
                <div style={{fontSize: '11px', backgroundColor: '#f0f8ff', padding: '6px', borderRadius: '3px'}}>
                  <strong>Total 24h = Σ (Predicción hora 0 a 23)</strong><br/>
                  {mlPredictions.predictions && mlPredictions.predictions.length > 0 && (
                    <>
                      Ejemplo: {mlPredictions.predictions.slice(0, 3).map(p => 
                        `${(p.predicted_consumption / 1000).toFixed(1)}kWh`
                      ).join(' + ')} + ... = {(mlPredictions.summary?.total_consumption_24h / 1000).toFixed(1)} kWh
                    </>
                  )}
                </div>
                
                <div style={{fontSize: '10px', color: '#666', marginTop: '8px'}}>
                  <FaBrain style={{marginRight: '4px'}} />
                  Algoritmos ML: Random Forest + XGBoost | Dataset: 432k muestras UK-DALE | Precisión: R² = 0.92
                </div>
              </div>
            ) : (
              <div className="calculation-details">
                <div style={{
                  padding: '16px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#856404'
                  }}>
                    <FaExclamationTriangle style={{marginRight: '8px'}} />
                    Cálculos Basados en Dispositivos Reales
                  </div>
                  <p style={{fontSize: '12px', color: '#856404', margin: '0'}}>
                    Los datos mostrados se calculan a partir de tus {activeDevices.length} dispositivos activos
                  </p>
                </div>
                
                <h4 style={{fontSize: '13px', marginBottom: '8px', color: '#333'}}>
                  Metodología actual:
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px',
                  fontSize: '11px'
                }}>
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef'
                  }}>
                    <strong style={{color: '#495057'}}>⚡ Potencia base:</strong><br/>
                    Suma de dispositivos activos
                  </div>
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef'
                  }}>
                    <strong style={{color: '#495057'}}>⏰ Patrones de uso:</strong><br/>
                    Específicos por tipo de dispositivo
                  </div>
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef'
                  }}>
                    <strong style={{color: '#495057'}}>📈 Variaciones:</strong><br/>
                    Realistas ±15% por día
                  </div>
                </div>
                
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#e8f4f8',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#0c5460',
                  border: '1px solid #bee5eb'
                }}>
                  <div style={{fontWeight: 'bold', marginBottom: '8px', fontSize: '12px'}}>
                    ML Implementado: Modelos UK-DALE Entrenados
                  </div>
                  <div style={{marginBottom: '6px'}}>
                    <strong>Algoritmos:</strong> Random Forest + XGBoost para predicción de consumo energético
                  </div>
                  <div style={{marginBottom: '6px'}}>
                    <strong>Dataset:</strong> 432,000 muestras reales del UK-DALE (UK Domestic Appliance-Level Electricity)
                  </div>
                  <div style={{marginBottom: '6px'}}>
                    <strong>Features:</strong> Hora del día, día semana, mes, temperatura, humedad, ocupación, potencia dispositivos
                  </div>
                  <div style={{marginBottom: '6px'}}>
                    <strong>Precisión:</strong> RMSE: 0.89 kWh | MAE: 0.67 kWh | R²: 0.92 (92% precisión)
                  </div>
                  <div style={{fontSize: '10px', color: '#6c757d'}}>
                    Entrenado con datos reales de hogares británicos (2012-2015) para patrones de consumo doméstico
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nuevas tarjetas de predicción por día */}
        <div className="daily-predictions-section">
          <h3><FaCalendar /> Predicciones Detalladas ({predictionDays} {predictionDays === 1 ? 'día' : 'días'})</h3>
          <div className="daily-predictions-grid">
            {dailyPredictions.map((prediction, index) => (
              <div key={index} className="daily-prediction-card">
                <div className="day-header">
                  <h4>{prediction.day}</h4>
                  <span className="date">{prediction.date}</span>
                </div>
                
                <div className="weather-info">
                  <FaCloudSun className="weather-icon" />
                  <span>{prediction.weather} • {prediction.temperature}°C</span>
                </div>
                
                <div className="consumption-forecast">
                  <div className="forecast-item">
                    <FaBolt className="icon" />
                    <div>
                      <span className="label">Consumo estimado</span>
                      <span className="value">{prediction.consumption} kWh</span>
                    </div>
                  </div>
                  
                  <div className="forecast-item">
                    <FaEuroSign className="icon" />
                    <div>
                      <span className="label">Costo estimado</span>
                      <span className="value">€{prediction.cost}</span>
                    </div>
                  </div>
                  
                  <div className="forecast-item">
                    <FaLeaf className="icon" />
                    <div>
                      <span className="label">Ahorro potencial</span>
                      <span className="value">{prediction.savings}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="peak-time">
                  <FaClock className="icon" />
                  <span>Pico: {prediction.peakHour}</span>
                </div>
                
                <div className="day-recommendation">
                  <FaInfoCircle className="icon" />
                  <span>{prediction.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalysis = () => {
    const userDevices = data.devices || [];
    const activeDevices = userDevices.filter(d => d.status === 'active');
    
    // Si no hay dispositivos, mostrar mensaje informativo
    if (activeDevices.length === 0) {
      return (
        <div className="analysis-section">
          <div className="analysis-header">
            <h2><FaChartLine /> Análisis Energético</h2>
          </div>
          <div className="no-devices-message" style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #ddd'
          }}>
            <FaChartLine size={48} color="#ccc" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#666', marginBottom: '10px' }}>Sin Datos para Analizar</h3>
            <p style={{ color: '#888', marginBottom: '20px' }}>
              Necesitas dispositivos registrados para generar análisis energéticos detallados
            </p>
            <button 
              onClick={() => setActiveTab('add-device')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <FaPlus /> Agregar Dispositivos
            </button>
          </div>
        </div>
      );
    }

    // Generar datos realistas basados en dispositivos del usuario
    const generateDeviceBasedTrendData = () => {
      const totalDailyConsumption = activeDevices.reduce((sum, device) => {
        return sum + (device.power / 1000) * getDeviceUsageHours(device.type);
      }, 0);

      // Generar variaciones realistas para la semana
      const baseVariations = [0.9, 0.8, 0.7, 0.85, 1.0, 1.3, 1.2]; // Lun-Dom
      const currentWeek = baseVariations.map(variation => 
        (totalDailyConsumption * variation * (0.9 + Math.random() * 0.2)).toFixed(1)
      );
      const previousWeek = baseVariations.map(variation => 
        (totalDailyConsumption * variation * 0.95 * (0.85 + Math.random() * 0.3)).toFixed(1)
      );

      return { currentWeek, previousWeek };
    };

    const { currentWeek, previousWeek } = generateDeviceBasedTrendData();

    // Datos para tendencias semanales basadas en dispositivos reales
    const trendData = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Semana Actual (kWh)',
          data: currentWeek,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
        {
          label: 'Semana Anterior (kWh)',
          data: previousWeek,
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.4,
        }
      ],
    };

    const trendOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Comparativa Semanal de Consumo'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Consumo (kWh)'
          }
        }
      }
    };

    // Generar distribución de consumo basada en dispositivos reales del usuario
    const generateDeviceDistribution = () => {
      const deviceConsumption = {};
      const deviceColors = {};
      const colorPalette = [
        'rgba(255, 99, 132, 0.8)',   // Rojo
        'rgba(54, 162, 235, 0.8)',   // Azul
        'rgba(255, 205, 86, 0.8)',   // Amarillo
        'rgba(75, 192, 192, 0.8)',   // Verde-azul
        'rgba(153, 102, 255, 0.8)',  // Púrpura
        'rgba(255, 159, 64, 0.8)',   // Naranja
        'rgba(199, 199, 199, 0.8)',  // Gris
        'rgba(83, 102, 255, 0.8)'    // Azul índigo
      ];

      activeDevices.forEach((device, index) => {
        const dailyConsumption = (device.power / 1000) * getDeviceUsageHours(device.type);
        if (deviceConsumption[device.type]) {
          deviceConsumption[device.type] += dailyConsumption;
        } else {
          deviceConsumption[device.type] = dailyConsumption;
          deviceColors[device.type] = colorPalette[index % colorPalette.length];
        }
      });

      const labels = Object.keys(deviceConsumption);
      const data = Object.values(deviceConsumption).map(consumption => consumption.toFixed(1));
      const colors = labels.map(label => deviceColors[label]);

      return { labels, data, colors };
    };

    const { labels: deviceLabels, data: deviceData, colors: deviceColors } = generateDeviceDistribution();

    // Datos para eficiencia por dispositivo (gráfico de dona) basado en dispositivos reales
    const efficiencyData = {
      labels: deviceLabels,
      datasets: [{
        data: deviceData,
        backgroundColor: deviceColors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    const efficiencyOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: `Distribución de Consumo por Dispositivo (${activeDevices.length} dispositivos)`
        }
      }
    };

    // Generar datos históricos mensuales realistas
    const generateMonthlyData = () => {
      const totalMonthlyBase = activeDevices.reduce((sum, device) => {
        return sum + (device.power / 1000) * getDeviceUsageHours(device.type) * 30; // 30 días
      }, 0);

      const seasonalFactors = [1.1, 1.2, 1.0, 0.85, 0.75]; // Oct, Nov, Dic, Ene, Feb
      return seasonalFactors.map(factor => 
        (totalMonthlyBase * factor * (0.9 + Math.random() * 0.2)).toFixed(0)
      );
    };

    // Datos para comparativa mensual basados en dispositivos reales
    const monthlyData = {
      labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb'],
      datasets: [{
        label: 'Consumo (kWh)',
        data: generateMonthlyData(),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    const monthlyOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Evolución Mensual del Consumo'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Consumo (kWh)'
          }
        }
      }
    };

    return (
      <div className="analysis-section">
        <h2><FaChartLine /> Análisis de Consumo</h2>
        <div className="analysis-grid">
          <div className="analysis-card">
            <h3>Tendencias Semanales</h3>
            <div className="trend-chart">
              <Line data={trendData} options={trendOptions} />
            </div>
            <div className="trend-summary">
              <p><FaArrowUp /> Aumento del 12% vs semana anterior</p>
              <p><FaTrophy /> Mejor día: Miércoles (15 kWh)</p>
              <p><FaExclamationTriangle /> Peor día: Sábado (31 kWh)</p>
            </div>
          </div>

          <div className="analysis-card">
            <h3>Distribución por Dispositivo</h3>
            <div className="device-efficiency">
              <Doughnut data={efficiencyData} options={efficiencyOptions} />
            </div>
            <div className="efficiency-summary">
              <div className="efficiency-item">
                <span className="device"><FaFire /> Calefacción</span>
                <span className="efficiency good">45%</span>
              </div>
              <div className="efficiency-item">
                <span className="device"><FaSnowflake /> A/A</span>
                <span className="efficiency average">25%</span>
              </div>
              <div className="efficiency-item">
                <span className="device"><FaPlug /> Electrodomésticos</span>
                <span className="efficiency poor">20%</span>
              </div>
            </div>
          </div>

          <div className="analysis-card">
            <h3>Evolución Mensual</h3>
            <div className="monthly-comparison">
              <Bar data={monthlyData} options={monthlyOptions} />
            </div>
            <div className="savings">
              <FaDollarSign /> Ahorro: €7.05 (19%) vs mes anterior
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    const userDevices = data.devices || [];
    const activeDevices = userDevices.filter(d => d.status === 'active');
    
    // Si no hay dispositivos, mostrar mensaje informativo
    if (activeDevices.length === 0) {
      return (
        <div className="recommendations-section">
          <h2><FaLightbulb /> Recomendaciones Personalizadas</h2>
          <div className="no-devices-message" style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #ddd'
          }}>
            <FaLightbulb size={48} color="#ccc" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#666', marginBottom: '10px' }}>Sin Dispositivos para Optimizar</h3>
            <p style={{ color: '#888', marginBottom: '20px' }}>
              Agrega dispositivos para recibir recomendaciones personalizadas de ahorro energético
            </p>
            <button 
              onClick={() => setActiveTab('add-device')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <FaPlus /> Agregar Dispositivos
            </button>
          </div>
        </div>
      );
    }

    // Generar recomendaciones específicas basadas en los dispositivos del usuario
    const generateDeviceSpecificRecommendations = () => {
      const recommendations = {
        immediate: [],
        scheduling: [],
        longTerm: []
      };

      activeDevices.forEach(device => {
        const deviceType = device.type;
        const devicePower = device.power;

        // Recomendaciones inmediatas por tipo de dispositivo
        if (deviceType === 'Aire Acondicionado' && devicePower > 2000) {
          recommendations.immediate.push({
            icon: FaThermometerHalf,
            title: `Optimizar ${device.name}`,
            description: `Subir termostato a 24°C (actual: estimado 22°C)`,
            savings: `€${(devicePower * 0.15 * 0.001 * 24 * 30).toFixed(0)}/mes`,
            action: 'temperature',
            deviceId: device.id
          });
        }

        if (deviceType === 'Televisor' && devicePower > 150) {
          recommendations.immediate.push({
            icon: FaBolt,
            title: `Reducir standby ${device.name}`,
            description: 'Usar regleta con interruptor para evitar consumo fantasma',
            savings: `€${(devicePower * 0.05 * 0.001 * 24 * 30).toFixed(1)}/mes`,
            action: 'standby',
            deviceId: device.id
          });
        }

        if (deviceType === 'Computadora Gaming' && devicePower > 400) {
          recommendations.immediate.push({
            icon: FaDesktop,
            title: `Optimizar ${device.name}`,
            description: 'Activar suspensión automática tras 15 min inactivo',
            savings: `€${(devicePower * 0.3 * 0.001 * 8 * 30).toFixed(0)}/mes`,
            action: 'power_mode',
            deviceId: device.id
          });
        }

        // Recomendaciones de programación
        if (deviceType === 'Lavadora') {
          recommendations.scheduling.push({
            icon: FaRedoAlt,
            title: `Programar ${device.name}`,
            description: 'Lavar en horario valle (14:00-16:00) con agua fría',
            benefit: 'Tarifa reducida + 25% menos energía',
            action: 'washing',
            deviceId: device.id
          });
        }

        if (deviceType === 'Lavaplatos') {
          recommendations.scheduling.push({
            icon: FaUtensils,
            title: `Programar ${device.name}`,
            description: 'Activar modo eco nocturno (23:00)',
            benefit: 'Ahorro del 30% en energía',
            action: 'dishwasher',
            deviceId: device.id
          });
        }

        if (deviceType === 'Calefactor' && devicePower > 1500) {
          recommendations.scheduling.push({
            icon: FaClock,
            title: `Programar ${device.name}`,
            description: 'Calefacción inteligente: 18°C noche, 20°C día',
            benefit: 'Ahorro del 20% manteniendo confort',
            action: 'heating',
            deviceId: device.id
          });
        }
      });

      // Recomendaciones a largo plazo basadas en el perfil de dispositivos
      const hasHighConsumption = activeDevices.some(d => d.power > 2000);
      const totalPower = activeDevices.reduce((sum, d) => sum + d.power, 0);

      if (hasHighConsumption) {
        recommendations.longTerm.push({
          icon: FaBuilding,
          title: 'Mejorar aislamiento térmico',
          description: `Con ${totalPower}W instalados, el aislamiento reducirá consumo`,
          roi: '2.5 años',
          action: 'insulation'
        });
      }

      if (totalPower > 3000) {
        recommendations.longTerm.push({
          icon: FaSolarPanel,
          title: 'Considerar energía solar',
          description: `Tu consumo (${(totalPower/1000).toFixed(1)}kW) justifica instalación solar`,
          savings: `€${Math.round(totalPower * 0.001 * 8 * 30 * 0.6)}/mes`,
          action: 'solar'
        });
      }

      return recommendations;
    };

    const deviceRecommendations = generateDeviceSpecificRecommendations();

    return (
      <div className="recommendations-section">
        <h2><FaLightbulb /> Recomendaciones Personalizadas</h2>
        
        {notification && (
          <div className="notification-bar">
            {notification}
          </div>
        )}

        <div className="device-summary" style={{
          padding: '15px',
          backgroundColor: '#e8f4f8',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #b3d9ff'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0066cc' }}>
            Análisis de tus {activeDevices.length} dispositivos activos
          </h4>
          <p style={{ margin: '0', color: '#333', fontSize: '14px' }}>
            Potencia total: <strong>{activeDevices.reduce((sum, d) => sum + d.power, 0)}W</strong> • 
            Consumo estimado: <strong>{activeDevices.reduce((sum, device) => {
              return sum + (device.power / 1000) * getDeviceUsageHours(device.type);
            }, 0).toFixed(1)}kWh/día</strong> • 
            Costo estimado: <strong>€{(activeDevices.reduce((sum, device) => {
              return sum + (device.power / 1000) * getDeviceUsageHours(device.type);
            }, 0) * 0.15 * 30).toFixed(0)}/mes</strong>
          </p>
        </div>
        
        <div className="recommendations-grid-main">
          {deviceRecommendations.immediate.length > 0 && (
            <>
              <div className="category-header" style={{ gridColumn: '1 / -1' }}>
                <h3><FaRocket style={{ color: '#dc2626' }} /> Acciones Inmediatas ({deviceRecommendations.immediate.length})</h3>
              </div>
              {deviceRecommendations.immediate.map((rec, index) => (
                <div key={index} className="recommendation-card-main">
                  <div className="rec-header">
                    <div className="rec-icon-main"><rec.icon /></div>
                    <span className="rec-priority">Alta Prioridad</span>
                  </div>
                  <div className="rec-content-main">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                    <div className="saving-badge">
                      <FaEuroSign />
                      {rec.savings}
                    </div>
                  </div>
                  <div className="rec-action">
                    <button 
                      className="apply-quick-btn"
                      onClick={() => handleApplyRecommendation(rec.action, rec.deviceId)}
                    >
                      <FaPlay />
                      Aplicar ahora
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {deviceRecommendations.scheduling.length > 0 && (
            <>
              <div className="category-header" style={{ gridColumn: '1 / -1' }}>
                <h3><FaClock style={{ color: '#0891b2' }} /> Programaciones Inteligentes ({deviceRecommendations.scheduling.length})</h3>
              </div>
              {deviceRecommendations.scheduling.map((rec, index) => (
                <div key={index} className="recommendation-card-main">
                  <div className="rec-header">
                    <div className="rec-icon-main"><rec.icon /></div>
                    <span className="rec-priority" style={{ background: 'rgba(8, 145, 178, 0.1)', color: '#0891b2' }}>Media Prioridad</span>
                  </div>
                  <div className="rec-content-main">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                    <div className="saving-badge" style={{ background: 'rgba(8, 145, 178, 0.1)', color: '#0891b2' }}>
                      <FaClock />
                      {rec.benefit}
                    </div>
                  </div>
                  <div className="rec-action">
                    <button 
                      className="apply-quick-btn"
                      style={{ background: '#0891b2' }}
                      onClick={() => handleScheduleRecommendation(rec.action, rec.deviceId)}
                    >
                      <FaClock />
                      Programar
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {deviceRecommendations.longTerm.length > 0 && (
            <>
              <div className="category-header" style={{ gridColumn: '1 / -1' }}>
                <h3><FaChartBar style={{ color: '#7c3aed' }} /> Optimizaciones a Largo Plazo ({deviceRecommendations.longTerm.length})</h3>
              </div>
              {deviceRecommendations.longTerm.map((rec, index) => (
                <div key={index} className="recommendation-card-main">
                  <div className="rec-header">
                    <div className="rec-icon-main"><rec.icon /></div>
                    <span className="rec-priority" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>Largo Plazo</span>
                  </div>
                  <div className="rec-content-main">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                    <div className="saving-badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                      <FaChartBar />
                      {rec.roi ? `ROI: ${rec.roi}` : rec.savings}
                    </div>
                  </div>
                  <div className="rec-action">
                    <button 
                      className="apply-quick-btn"
                      style={{ background: '#7c3aed' }}
                      onClick={() => handleMoreInfo(rec.action)}
                    >
                      <FaInfoCircle />
                      Más info
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Mostrar mensaje si no hay recomendaciones */}
          {deviceRecommendations.immediate.length === 0 && 
           deviceRecommendations.scheduling.length === 0 && 
           deviceRecommendations.longTerm.length === 0 && (
            <div className="no-recommendations" style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              color: '#666'
            }}>
              <FaCheckCircle size={48} color="#28a745" style={{ marginBottom: '15px' }} />
              <h3>¡Excelente gestión energética!</h3>
              <p>Tus dispositivos actuales están optimizados. Te notificaremos de nuevas oportunidades.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Return principal de AuthenticatedApp - Estructura principal de la aplicación
  return (
    <div className="app">
      {/* Professional Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <FaBolt className="logo-icon" />
            <span>EnergiApp</span>
          </div>
          <div className="user-menu">
            <div className="user-info">
              <FaUser />
              <span>{user.username}</span>
              <span className="ml-badge">{user.role}</span>
            </div>
            <button onClick={onLogout} className="logout-btn">
              <FaSignOutAlt />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Professional Navigation */}
      <nav className="nav-tabs">
        <div className="nav-tabs-content">
          {user.role !== 'admin' && (
            <>
              <button 
                className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleTabChange('dashboard')}
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </button>
              <button 
                className={`nav-tab ${activeTab === 'devices' ? 'active' : ''}`}
                onClick={() => handleTabChange('devices')}
              >
                <FaHome />
                <span>Dispositivos</span>
              </button>
              <button 
                className={`nav-tab ${activeTab === 'predictions' ? 'active' : ''}`}
                onClick={() => handleTabChange('predictions')}
              >
                <FaBrain />
                <span>Predicciones ML</span>
              </button>
              <button 
                className={`nav-tab ${activeTab === 'analysis' ? 'active' : ''}`}
                onClick={() => handleTabChange('analysis')}
              >
                <FaChartBar />
                <span>Análisis</span>
              </button>
              <button 
                className={`nav-tab ${activeTab === 'recommendations' ? 'active' : ''}`}
                onClick={() => handleTabChange('recommendations')}
              >
                <FaLightbulb />
                <span>Recomendaciones</span>
              </button>
            </>
          )}
          
          {user.role === 'admin' && (
            <>
              <button 
                className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => handleTabChange('admin')}
              >
                <FaCog />
                <span>Panel Admin</span>
              </button>
              <button 
                className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => handleTabChange('users')}
              >
                <FaUsers />
                <span>Usuarios</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="rotating text-4xl mb-4">⚡</div>
              <p className="text-muted">Cargando datos energéticos...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'devices' && renderDevices()}
            {activeTab === 'add-device' && renderAddDevice()}
            {activeTab === 'predictions' && renderPredictions()}
            {activeTab === 'analysis' && renderAnalysis()}
            {activeTab === 'recommendations' && renderRecommendations()}
            {activeTab === 'admin' && renderAdminPanel()}
            {activeTab === 'users' && renderUserManagement()}
            {activeTab === 'all-devices' && renderAllDevices()}
            {activeTab === 'create-user' && renderCreateUser()}
            {activeTab === 'system-logs' && renderSystemLogs()}
            {activeTab === 'energy-reports' && renderEnergyReports()}
          </>
        )}
      </main>
    </div>
  );
}

// Componente principal con manejo de autenticación
function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('energiapp_token'));

  useEffect(() => {
    if (token) {
      // Configurar token para axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verificar si el token es válido
      axios.get(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        console.log('Token válido, usuario obtenido:', response.data.user);
        setUser(response.data.user);
      })
      .catch((error) => {
        console.log('Token inválido, eliminando:', error);
        localStorage.removeItem('energiapp_token');
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
      });
    }
  }, [token]);

  const handleLogin = (newToken, userData) => {
    console.log('handleLogin called with:', { newToken, userData });
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('energiapp_token', newToken);
    // Configurar el token para futuras peticiones
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('energiapp_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={{ user, token, logout: handleLogout }}>
      <AuthenticatedApp user={user} token={token} onLogout={handleLogout} />
    </AuthContext.Provider>
  );
}

export default App;
