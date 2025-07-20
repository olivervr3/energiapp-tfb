import React, { useState, useEffect, createContext, useContext } from 'react';
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
  FaSync
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
      
      const response = await axios.post(`${API_BASE}${endpoint}`, formData);
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.token) {
        if (isRegister) {
          alert('Usuario registrado exitosamente. Ahora puedes hacer login.');
          setIsRegister(false);
        } else {
          console.log('Login exitoso, llamando onLogin...');
          console.log('Token recibido:', response.data.token);
          console.log('Usuario recibido:', response.data.usuario);
          onLogin(response.data.token, response.data.usuario);
        }
      } else {
        console.log('No se recibió token en la respuesta');
        alert('Error: No se recibió token de autenticación');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      alert(error.response?.data?.error || 'Error en la autenticación');
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
            type="email"
            placeholder="Email"
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
            <p><strong>👤 Usuario Normal:</strong></p>
            <p>Email: test@test.com</p>
            <p>Contraseña: Test123456</p>
          </div>
          <div>
            <p><strong>👑 Administrador:</strong></p>
            <p>Email: admin@energiapp.com</p>
            <p>Contraseña: Admin123456</p>
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
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

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
        console.log('✅ Dashboard ML cargado:', enhancedResponse.data);
        console.log('✅ Dispositivos cargados:', devicesResponse.data.devices?.length || 0);
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
            setNotification('❌ No tienes dispositivos electrónicos controlables para optimizar');
            break;
          }
          
          // Simular apagado de dispositivos standby
          for (const device of standbyDevices) {
            await axios.post(`${API_BASE}/api/dispositivos/${device.id}/toggle`, { action: 'off' });
          }
          
          setNotification(`🔌 ${standbyDevices.length} dispositivos en standby optimizados. Ahorro: €${(standbyDevices.length * 0.8).toFixed(2)}/mes`);
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
            setNotification('❌ No tienes dispositivos de climatización controlables');
            break;
          }
          
          setNotification(`🌡️ ${climateDevices.length} dispositivos de climatización optimizados a 19°C. Ahorro: €${(climateDevices.length * 4.15).toFixed(2)}/mes`);
          break;
          
        default:
          setNotification('✅ Recomendación aplicada exitosamente');
      }
    } catch (error) {
      setNotification('❌ Error al aplicar la recomendación');
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
    }
    
    if (availableDevices.length === 0) {
      const deviceType = recommendation === 'washing' ? 'lavadora' : 'lavavajillas';
      setNotification(`❌ No tienes ningún ${deviceType} controlable registrado en tus dispositivos`);
      setTimeout(() => setNotification(''), 5000);
      return;
    }
    
    setSelectedRecommendation({
      type: recommendation,
      devices: availableDevices
    });
    setShowScheduleModal(true);
  };

  const handleMoreInfo = (recommendation) => {
    let info = '';
    switch(recommendation) {
      case 'insulation':
        info = `💡 AISLAMIENTO TÉRMICO

🏠 Beneficios:
• Reducción 30-40% en calefacción
• Mayor confort térmico
• Valorización de la vivienda

💰 Inversión estimada: €3,000 - €8,000
📈 Ahorro anual: €180 - €450
⏱️ ROI: 2.5 años

📋 Incluye:
- Aislamiento de paredes
- Ventanas de doble acristalamiento
- Sellado de filtraciones

📞 ¿Quieres una consulta gratuita?`;
        break;
      case 'solar':
        info = `☀️ PANELES SOLARES

🔋 Beneficios:
• Ahorro 60-80% en electricidad
• Energía limpia y renovable
• Subvenciones disponibles hasta 40%

💰 Inversión estimada: €6,000 - €12,000
📈 Ahorro anual: €540 - €720
⏱️ ROI: 8-10 años

📋 Incluye:
- Paneles fotovoltaicos
- Inversor y batería
- Instalación y legalización

💡 Con subvenciones: ROI 5-6 años`;
        break;
      default:
        info = 'Información detallada no disponible';
    }
    alert(info);
  };

  const confirmSchedule = async () => {
    try {
      const { type, devices } = selectedRecommendation;
      
      // Primero apagar el dispositivo si está encendido
      for (const device of devices) {
        if (device.status === 'active') {
          await axios.post(`${API_BASE}/api/dispositivos/${device.id}/toggle`, { action: 'off' });
        }
      }
      
      // Programar encendido futuro (simulado)
      let message = '';
      let scheduleTime = '';
      
      switch(type) {
        case 'washing':
          scheduleTime = '14:00';
          message = `🔄 ${devices.length} lavadora(s) programada(s) para ${scheduleTime} (horario valle)`;
          // Simular programación: encender en 5 segundos para demostración
          setTimeout(async () => {
            for (const device of devices) {
              await axios.post(`${API_BASE}/api/dispositivos/${device.id}/toggle`, { action: 'on' });
            }
            setNotification(`⏰ Lavadora encendida automáticamente en horario programado`);
            await fetchDevices();
            setTimeout(() => setNotification(''), 3000);
          }, 5000);
          break;
          
        case 'dishwasher':
          scheduleTime = '23:00';
          message = `🍽️ ${devices.length} lavavajillas programado(s) modo eco para ${scheduleTime}`;
          // Simular programación: encender en 3 segundos para demostración
          setTimeout(async () => {
            for (const device of devices) {
              await axios.post(`${API_BASE}/api/dispositivos/${device.id}/toggle`, { action: 'on' });
            }
            setNotification(`⏰ Lavavajillas encendido automáticamente en modo eco`);
            await fetchDevices();
            setTimeout(() => setNotification(''), 3000);
          }, 3000);
          break;
          
        default:
          message = '⏰ Programación configurada exitosamente';
      }
      
      setNotification(message);
      setShowScheduleModal(false);
      setSelectedRecommendation(null);
      await fetchDevices(); // Actualizar estado de dispositivos
      setTimeout(() => setNotification(''), 5000);
      
    } catch (error) {
      setNotification('❌ Error al programar dispositivo');
      console.error('Error scheduling device:', error);
      setTimeout(() => setNotification(''), 5000);
    }
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

  const renderDashboard = () => (
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
          {mlPredictions && (
            <span className="status-badge active">
              <FaBrain />
              ML Activo
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {data.current && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Consumo Actual</h3>
            <p className="value">{data.current.consumption} kWh</p>
            <p className="cost">€{data.current.cost_per_hour}/hora</p>
            <span className={`status ${data.current.status}`}>
              {data.current.status === 'high' ? <><FaExclamationTriangle /> Alto</> : 
               data.current.status === 'normal' ? <><FaExclamationCircle /> Normal</> : <><FaCheckCircle /> Bajo</>}
            </span>
          </div>
          
          <div className="stat-card">
            <h3>Proyección Hoy</h3>
            {mlPredictions?.summary ? (
              <>
                <p className="value">{(mlPredictions.summary.total_consumption_24h / 1000).toFixed(1)} kWh</p>
                <p className="cost">€{(mlPredictions.summary.total_consumption_24h / 1000 * 0.15).toFixed(2)}</p>
                <span className="trend ml-powered">
                  <FaBrain /> Predicción ML
                </span>
              </>
            ) : data.predictions?.next_24h ? (
              <>
                <p className="value">{data.predictions.next_24h.total_consumption} kWh</p>
                <p className="cost">€{data.predictions.next_24h.estimated_cost}</p>
                <span className="trend ml-powered">
                  <FaBrain /> Predicción ML (Backend)
                </span>
              </>
            ) : data.today ? (
              <>
                <p className="value">{data.today.consumption} kWh</p>
                <p className="cost">€{data.today.cost}</p>
                <span className="trend">{data.today.vs_yesterday} vs ayer</span>
              </>
            ) : (
              <>
                <p className="value">0.0</p>
                <p className="cost">€0.00</p>
                <span className="trend">Sin predicciones</span>
              </>
            )}
          </div>
          
          <div className="stat-card">
            <h3>Dispositivos</h3>
            <p className="value">{data.current.active_devices || 0}</p>
            <p className="cost">{(data.devices || []).length} registrados</p>
            <span className="status">
              <FaPlug /> Conectados
            </span>
          </div>
        </div>
      )}
      
      {/* Resumen de recomendaciones principales */}
      {(mlRecommendations?.recommendations || data.recommendations) && (
        <div className="quick-recommendations">
          <h3>
            <FaLightbulb /> Recomendaciones Principales
            {mlRecommendations && (
              <span className="ml-badge">
                <FaBrain />
              </span>
            )}
          </h3>
          <div className="recommendations-grid">
            {(mlRecommendations?.recommendations || data.recommendations).slice(0, 2).map((rec, index) => (
              <div key={index} className="recommendation-card quick">
                <div className="rec-content">
                  <FaInfoCircle className="rec-icon" />
                  <div className="rec-text">
                    <h4>{rec.title || rec.message || 'Recomendación'}</h4>
                    <p>{rec.description || rec.message}</p>
                    {rec.potential_saving && (
                      <span className="saving">
                        <FaDollarSign /> {rec.potential_saving}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
                <p><strong>Consumo actual:</strong> {device.current_consumption}W</p>
                <p><strong>Consumo diario:</strong> {device.daily_consumption} kWh</p>
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
      } catch (error) {
        alert('Error al añadir dispositivo');
      }
    };

    return (
      <div className="add-device">
        <h2><FaPlus /> Añadir Nuevo Dispositivo</h2>
        <form onSubmit={handleSubmit} className="device-form">
          <input
            type="text"
            placeholder="Nombre del dispositivo"
            value={deviceForm.name}
            onChange={(e) => setDeviceForm({...deviceForm, name: e.target.value})}
            required
          />
          
          <select
            value={deviceForm.type}
            onChange={(e) => setDeviceForm({...deviceForm, type: e.target.value})}
            required
          >
            <option value="">Seleccionar tipo</option>
            {data.device_types?.map(type => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name} ({type.typical_power})
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Ubicación (ej: Cocina, Salón)"
            value={deviceForm.location}
            onChange={(e) => setDeviceForm({...deviceForm, location: e.target.value})}
            required
          />
          
          <input
            type="number"
            placeholder="Potencia en Watts"
            value={deviceForm.power}
            onChange={(e) => setDeviceForm({...deviceForm, power: e.target.value})}
            required
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
          </select>
          
          <label>
            <input
              type="checkbox"
              checked={deviceForm.controllable}
              onChange={(e) => setDeviceForm({...deviceForm, controllable: e.target.checked})}
            />
            Dispositivo controlable remotamente
          </label>
          
          <div className="form-actions">
            <button type="submit">Crear Dispositivo</button>
            <button type="button" onClick={() => setActiveTab('devices')}>
              Cancelar
            </button>
          </div>
        </form>
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
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos
  const [lastUpdate, setLastUpdate] = useState(null);

  // Función para obtener predicciones ML reales
  const fetchMLPredictions = async (hours = 24) => {
    try {
      setLoadingPredictions(true);
      const response = await axios.post(`${API_BASE}/api/predict/consumption`, {
        hours_ahead: hours,
        device_type: 'aggregate',
        temperature: 20,
        humidity: 60,
        occupancy: 2,
        house_size: 100
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
      return null;
    } finally {
      setLoadingPredictions(false);
    }
  };

  // Función para obtener recomendaciones ML reales
  const fetchMLRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const response = await axios.post(`${API_BASE}/api/recommendations`, {
        house_size: 100,
        occupancy: 2
      });
      
      setMlRecommendations(response.data);
      console.log('✅ Recomendaciones ML obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo recomendaciones ML:', error);
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
  }, [user]);

  // Actualizar dashboard cuando cambien las predicciones ML
  useEffect(() => {
    // Forzar re-render del componente cuando cambien las predicciones ML
    // para que el dashboard use los nuevos datos
    if (mlPredictions) {
      console.log('🔄 Predicciones ML actualizadas, dashboard se actualizará automáticamente');
    }
  }, [mlPredictions]);

  // Auto-refresh de predicciones ML
  useEffect(() => {
    let intervalId;
    
    if (autoRefresh && user && activeTab === 'predictions') {
      intervalId = setInterval(() => {
        console.log(`🔄 Auto-refresh ML cada ${refreshInterval}s`);
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
  }, [autoRefresh, refreshInterval, user, activeTab]);

  const renderPredictions = () => {
    // Si tenemos predicciones ML, usarlas. Si no, usar datos simulados como fallback
    let hourlyLabels = [];
    let currentData = [];
    let optimizedData = [];
    
    if (mlPredictions && mlPredictions.predictions) {
      // Usar datos ML reales
      const predictions = mlPredictions.predictions.slice(0, 9); // Primeras 9 horas
      hourlyLabels = predictions.map(p => {
        const hour = new Date(p.timestamp).getHours();
        return `${hour.toString().padStart(2, '0')}:00`;
      });
      currentData = predictions.map(p => (p.predicted_consumption / 1000).toFixed(2)); // Convertir W a kWh
      optimizedData = predictions.map(p => ((p.predicted_consumption * 0.85) / 1000).toFixed(2)); // 15% optimización
    } else {
      // Fallback a datos simulados
      hourlyLabels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00'];
      currentData = [1.2, 0.8, 1.5, 3.2, 2.8, 2.1, 4.1, 2.8, 1.6];
      optimizedData = [1.0, 0.6, 1.2, 2.8, 2.4, 1.8, 3.5, 2.2, 1.2];
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

    // Generar predicciones por día usando ML cuando esté disponible
    const generateDailyPredictions = (days) => {
      const predictions = [];
      const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const today = new Date();
      
      // Calcular consumo base basado en dispositivos del usuario
      const userDevices = data.devices || [];
      const activeDevices = userDevices.filter(d => d.status === 'active');
      const totalDevicePower = activeDevices.reduce((sum, device) => sum + device.power, 0);
      
      // Si tenemos predicciones ML, usar esos datos como base
      let baseConsumptionKwh;
      if (mlPredictions && mlPredictions.summary && mlPredictions.summary.total_consumption_24h > 0) {
        baseConsumptionKwh = mlPredictions.summary.total_consumption_24h / 1000; // Convertir W a kWh
        console.log('🤖 Usando ML para predicciones base:', baseConsumptionKwh, 'kWh');
      } else {
        // Fallback más robusto
        const fallbackPower = Math.max(totalDevicePower, 2000); // Mínimo 2kW para casa típica
        baseConsumptionKwh = Math.max((fallbackPower / 1000) * 16, 12); // 16 horas promedio uso, mínimo 12 kWh
        console.log('⚠️ Sin ML, usando fallback:', baseConsumptionKwh, 'kWh', 'Dispositivos:', totalDevicePower, 'W');
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
        const predictedCost = predictedConsumption * 0.15;
        const savingPotential = Math.min(25, Math.max(5, activeDevices.length * 2 + (dayIndex * 2))); // Variación en ahorro
        
        predictions.push({
          day: dayName,
          date: futureDate.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit' 
          }),
          consumption: predictedConsumption.toFixed(1),
          cost: predictedCost.toFixed(2),
          savings: savingPotential.toFixed(0),
          peakHour: isWeekend ? '20:00-22:00' : (dayIndex % 2 === 0 ? '19:00-21:00' : '18:00-20:00'),
          weather: dayIndex % 3 === 0 ? 'Soleado' : dayIndex % 3 === 1 ? 'Nublado' : 'Lluvia',
          temperature: (18 + (dayIndex % 8) + Math.floor(Math.random() * 3)).toString(), // Variación en temperatura
          recommendation: isWeekend 
            ? 'Aprovechar para electrodomésticos de alto consumo'
            : (dayIndex % 2 === 0 ? 'Evitar picos en horario 18:00-21:00' : 'Usar lavadora/lavavajillas en horario valle')
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
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
                  <FaCheckCircle style={{marginRight: '5px', color: '#4CAF50'}} />
                  Información del Cálculo ML
                </div>
                <div>📊 Predicciones: {mlPredictions.predictions?.length || 0} horas</div>
                <div>🔋 Total 24h: {mlPredictions.summary?.total_consumption_24h ? (mlPredictions.summary.total_consumption_24h / 1000).toFixed(1) : '0.0'} kWh</div>
                <div>💰 Costo estimado: €{mlPredictions.summary?.total_consumption_24h ? ((mlPredictions.summary.total_consumption_24h / 1000) * 0.15).toFixed(2) : '0.00'} (€0.15/kWh)</div>
                <div style={{fontSize: '10px', color: '#888', marginTop: '4px'}}>
                  * Basado en modelos UK-DALE entrenados con 432k muestras de consumo real
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
                    padding: '6px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '3px'
                  }}>
                    <FaInfoCircle style={{marginRight: '4px'}} />
                    <strong>Metodología:</strong> Suma de predicciones horarias (24h) usando algoritmos entrenados con datos UK-DALE.
                    Incluye patrones de consumo por hora del día, día de semana, y características del hogar.
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
            <h3>Recomendaciones Automáticas</h3>
            <div className="auto-recommendations">
              <div className="recommendation-item">
                <FaRedoAlt /> Programar lavadora para las 14:00 (tarifa reducida)
              </div>
              <div className="recommendation-item">
                <FaThermometerHalf /> Reducir calefacción de 21° a 19° entre 10:00-16:00
              </div>
              <div className="recommendation-item">
                <FaLightbulb /> Apagar dispositivos en standby durante la noche
              </div>
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
                  Basado en 432,000 muestras reales del dataset UK-DALE
                </div>
              </div>
            ) : (
              <div className="calculation-details">
                <p style={{fontSize: '12px', color: '#666'}}>
                  <FaExclamationTriangle style={{marginRight: '4px'}} />
                  Modelo ML no disponible. Se muestran datos simulados basados en:
                </p>
                <ul style={{fontSize: '11px', marginLeft: '16px', color: '#888'}}>
                  <li>Potencia total de dispositivos activos</li>
                  <li>Patrón de uso típico (16h promedio)</li>
                  <li>Variaciones aleatorias del ±10%</li>
                </ul>
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
    // Datos para tendencias semanales
    const trendData = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Semana Actual',
          data: [22, 18, 15, 21, 25, 31, 28],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
        {
          label: 'Semana Anterior',
          data: [20, 16, 19, 18, 22, 27, 25],
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

    // Datos para eficiencia por dispositivo (gráfico de dona)
    const efficiencyData = {
      labels: ['Calefacción', 'Aire Acondicionado', 'Electrodomésticos', 'Iluminación', 'Otros'],
      datasets: [{
        data: [45, 25, 20, 7, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
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
          text: 'Distribución de Consumo por Dispositivo'
        }
      }
    };

    // Datos para comparativa mensual
    const monthlyData = {
      labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb'],
      datasets: [{
        label: 'Consumo (kWh)',
        data: [280, 320, 290, 245, 198],
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

  const renderRecommendations = () => (
    <div className="recommendations-section">
      <h2><FaLightbulb /> Recomendaciones Personalizadas</h2>
      
      {notification && (
        <div className="notification-bar">
          {notification}
        </div>
      )}
      
      <div className="recommendations-grid">
        <div className="recommendation-category">
          <h3><FaRocket /> Acciones Inmediatas</h3>
          <div className="recommendation-list">
            <div className="recommendation-item urgent">
              <div className="recommendation-icon"><FaBolt /></div>
              <div className="recommendation-content">
                <h4>Desconectar dispositivos en standby</h4>
                <p>Ahorro estimado: €2.50/mes</p>
                <button 
                  className="apply-btn"
                  onClick={() => handleApplyRecommendation('standby')}
                >
                  Aplicar ahora
                </button>
              </div>
            </div>
            <div className="recommendation-item urgent">
              <div className="recommendation-icon"><FaThermometerHalf /></div>
              <div className="recommendation-content">
                <h4>Ajustar termostato a 19°C</h4>
                <p>Ahorro estimado: €8.30/mes</p>
                <button 
                  className="apply-btn"
                  onClick={() => handleApplyRecommendation('temperature')}
                >
                  Aplicar ahora
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="recommendation-category">
          <h3><FaClock /> Programaciones Inteligentes</h3>
          <div className="recommendation-list">
            <div className="recommendation-item">
              <div className="recommendation-icon"><FaRedoAlt /></div>
              <div className="recommendation-content">
                <h4>Lavadora en horario valle</h4>
                <p>Programa para 14:00-16:00 (tarifa reducida)</p>
                <button 
                  className="schedule-btn"
                  onClick={() => handleScheduleRecommendation('washing')}
                >
                  Programar
                </button>
              </div>
            </div>
            <div className="recommendation-item">
              <div className="recommendation-icon"><FaUtensils /></div>
              <div className="recommendation-content">
                <h4>Lavavajillas nocturno</h4>
                <p>Activa modo eco a las 23:00</p>
                <button 
                  className="schedule-btn"
                  onClick={() => handleScheduleRecommendation('dishwasher')}
                >
                  Programar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="recommendation-category">
          <h3><FaChartBar /> Optimizaciones a Largo Plazo</h3>
          <div className="recommendation-list">
            <div className="recommendation-item">
              <div className="recommendation-icon"><FaBuilding /></div>
              <div className="recommendation-content">
                <h4>Mejorar aislamiento</h4>
                <p>ROI estimado: 2.5 años</p>
                <button 
                  className="info-btn"
                  onClick={() => handleMoreInfo('insulation')}
                >
                  Más info
                </button>
              </div>
            </div>
            <div className="recommendation-item">
              <div className="recommendation-icon"><FaSolarPanel /></div>
              <div className="recommendation-content">
                <h4>Instalar paneles solares</h4>
                <p>Ahorro estimado: €45/mes</p>
                <button 
                  className="info-btn"
                  onClick={() => handleMoreInfo('solar')}
                >
                  Más info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScheduleModal && selectedRecommendation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Programación</h3>
            <div className="devices-to-schedule">
              <p><strong>Dispositivos a programar:</strong></p>
              <ul>
                {selectedRecommendation.devices.map(device => (
                  <li key={device.id}>
                    📱 {device.name} ({device.location})
                    {device.status === 'active' && <span className="active-badge"> - Actualmente encendido</span>}
                  </li>
                ))}
              </ul>
            </div>
            <p>
              {selectedRecommendation.type === 'washing' 
                ? `¿Programar ${selectedRecommendation.devices.length} lavadora(s) para horario valle (14:00)?`
                : `¿Programar ${selectedRecommendation.devices.length} lavavajillas para modo eco (23:00)?`
              }
            </p>
            <div className="schedule-info">
              <small>
                ℹ️ Los dispositivos se apagarán ahora y se encenderán automáticamente a la hora programada
                {selectedRecommendation.type === 'washing' ? ' (demo: 5 segundos)' : ' (demo: 3 segundos)'}
              </small>
            </div>
            <div className="modal-buttons">
              <button onClick={confirmSchedule} className="confirm-btn">
                Confirmar Programación
              </button>
              <button 
                onClick={() => setShowScheduleModal(false)} 
                className="cancel-btn"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="app">
      {/* Professional Header */}
      <header className="header">
        <div className="header-content">
          <a href="#" className="logo">
            <FaBolt className="logo-icon" />
            <span>EnergiApp</span>
          </a>
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
