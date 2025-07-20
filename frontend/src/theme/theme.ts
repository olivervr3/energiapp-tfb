import { createTheme } from '@mui/material/styles';
import { esES } from '@mui/material/locale';

// Paleta de colores personalizada enfocada en energía y sostenibilidad
const palette = {
  primary: {
    main: '#2E7D32', // Verde energía
    light: '#60AD5E',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#1976D2', // Azul tecnología
    light: '#42A5F5',
    dark: '#1565C0',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  error: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#D32F2F',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
  },
  // Colores personalizados para energía
  energy: {
    low: '#4CAF50',      // Verde - consumo bajo
    medium: '#FF9800',   // Naranja - consumo medio
    high: '#F44336',     // Rojo - consumo alto
    prediction: '#9C27B0', // Morado - predicciones
    solar: '#FFC107',    // Amarillo - energía solar
    wind: '#00BCD4',     // Cyan - energía eólica
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #1976D2 100%)',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Tipografía personalizada
const typography = {
  fontFamily: '"Roboto", "Inter", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.0075em',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.75,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },
};

// Componentes personalizados
const components = {
  // Botones
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none' as const,
        fontWeight: 500,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
      contained: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
      },
    },
  },
  
  // Cards
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        },
        transition: 'box-shadow 0.3s ease-in-out',
      },
    },
  },
  
  // Paper
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
      elevation1: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      },
      elevation2: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.10)',
      },
      elevation3: {
        boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
      },
    },
  },
  
  // Inputs
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  
  // Tabs
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        fontSize: '0.875rem',
      },
    },
  },
  
  // Drawer
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
        boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
      },
    },
  },
  
  // AppBar
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      },
    },
  },
  
  // Chip
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        fontWeight: 500,
      },
    },
  },
};

// Configuración de breakpoints
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

// Espaciado personalizado
const spacing = 8;

// Crear tema
const theme = createTheme(
  {
    palette,
    typography,
    components,
    breakpoints,
    spacing,
    shape: {
      borderRadius: 8,
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    shadows: [
      'none',
      '0 2px 4px rgba(0,0,0,0.08)',
      '0 4px 8px rgba(0,0,0,0.10)',
      '0 6px 12px rgba(0,0,0,0.12)',
      '0 8px 16px rgba(0,0,0,0.14)',
      '0 10px 20px rgba(0,0,0,0.16)',
      '0 12px 24px rgba(0,0,0,0.18)',
      '0 14px 28px rgba(0,0,0,0.20)',
      '0 16px 32px rgba(0,0,0,0.22)',
      '0 18px 36px rgba(0,0,0,0.24)',
      '0 20px 40px rgba(0,0,0,0.26)',
      '0 22px 44px rgba(0,0,0,0.28)',
      '0 24px 48px rgba(0,0,0,0.30)',
      '0 26px 52px rgba(0,0,0,0.32)',
      '0 28px 56px rgba(0,0,0,0.34)',
      '0 30px 60px rgba(0,0,0,0.36)',
      '0 32px 64px rgba(0,0,0,0.38)',
      '0 34px 68px rgba(0,0,0,0.40)',
      '0 36px 72px rgba(0,0,0,0.42)',
      '0 38px 76px rgba(0,0,0,0.44)',
      '0 40px 80px rgba(0,0,0,0.46)',
      '0 42px 84px rgba(0,0,0,0.48)',
      '0 44px 88px rgba(0,0,0,0.50)',
      '0 46px 92px rgba(0,0,0,0.52)',
      '0 48px 96px rgba(0,0,0,0.54)',
    ],
  },
  esES // Localización en español
);

// Extender el tema con colores personalizados
declare module '@mui/material/styles' {
  interface Palette {
    energy: {
      low: string;
      medium: string;
      high: string;
      prediction: string;
      solar: string;
      wind: string;
    };
  }

  interface PaletteOptions {
    energy?: {
      low?: string;
      medium?: string;
      high?: string;
      prediction?: string;
      solar?: string;
      wind?: string;
    };
  }

  interface TypeBackground {
    gradient: string;
  }
}

export default theme;
