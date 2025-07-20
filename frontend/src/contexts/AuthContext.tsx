import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Tipos TypeScript
interface User {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo_vivienda?: string;
  metros_cuadrados?: number;
  num_habitantes?: number;
  preferencias?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: any) => Promise<void>;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Configurar axios con el token
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const verificarToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'No hay token' });
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/api/auth/perfil');
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.usuario,
            token,
          },
        });
      } catch (error) {
        console.error('Error verificando token:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        dispatch({ type: 'AUTH_FAILURE', payload: 'Token inválido' });
      }
    };

    verificarToken();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { token, usuario } = response.data;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: usuario,
          token,
        },
      });

      toast.success('¡Bienvenido a EnergiApp!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Registro
  const register = async (userData: any) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await axios.post('/api/auth/registro', userData);

      const { token, usuario } = response.data;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: usuario,
          token,
        },
      });

      toast.success('¡Cuenta creada exitosamente!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al registrarse';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Sesión cerrada');
  };

  // Actualizar perfil
  const updateProfile = async (userData: any) => {
    try {
      const response = await axios.put('/api/auth/perfil', userData);

      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.usuario,
      });

      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al actualizar perfil';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
