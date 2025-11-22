import { createContext, useReducer } from "react";
import type { ReactNode } from "react"

// ============ TIPOS ============
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// ============ STATE ============
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============ ACTIONS ============
type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS' }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'CLEAR_ERROR' };

// ============ CONTEXT ============
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============ REDUCER ============
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { 
        ...state, 
        isLoading: true, 
        error: null 
      };
    
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        isAuthenticated: true, 
        user: action.payload.user, 
        token: action.payload.token 
      };
    
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        isLoading: false, 
        error: action.payload 
      };
    
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        token: null 
      };
    
    case 'REGISTER_START':
      return { 
        ...state, 
        isLoading: true, 
        error: null 
      };
    
    case 'REGISTER_SUCCESS':
      return { 
        ...state, 
        isLoading: false 
      };
    
    case 'REGISTER_FAILURE':
      return { 
        ...state, 
        isLoading: false, 
        error: action.payload 
      };
    
    case 'CLEAR_ERROR':
      return { 
        ...state, 
        error: null 
      };
    
    default:
      return state;
  }
}

// ============ INITIAL STATE ============
const getStoredUser = (): User | null => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const initialAuthState: AuthState = {
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: Boolean(localStorage.getItem('token')),
  isLoading: false,
  error: null
};

// ============ PROVIDER ============
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    console.log(email,password)
    
    try {
      // Simulate API call - Reemplaza esto con tu API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo - Reemplaza con respuesta real de tu API
      const userData: User = { 
        id: '1', 
        name: 'Usuario Demo', 
        email,
        created_at: new Date().toISOString()
      };
      const token = 'fake-jwt-token';
      
      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: userData, token } 
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error de autenticación';
      
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage 
      });
      return false;
    }
  };
  
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'REGISTER_START' });
    console.log(email,password,name)
    try {
      // Simulate API call - Reemplaza con tu API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aquí iría la lógica real de registro
      // const response = await api.register({ name, email, password });
      
      dispatch({ type: 'REGISTER_SUCCESS' });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al registrarse';
      
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: errorMessage 
      });
      return false;
    }
  };
  
  const logout = (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };
  
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };
  
  // ============ VALUE OBJECT ============
  const contextValue: AuthContextType = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    clearError
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext

/*
export const AuthProvider = ({ children }:AuthProviderProps) => {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);

  // Ensure axios sends cookies (for HttpOnly cookie-based auth)
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // On mount, try to fetch current user; the browser will send the cookie automatically
    fetchUser();
  },[]);

   const fetchUser = async () => {
    try {
      const response = await apiService.getCurrentUser()
      setUser(response);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCurrentUser();
      setUser(response);
    } catch (error) {
      console.error('Error refreshing user:', error);
      // No hacemos logout aquí para no cerrar sesión por errores temporales
    } finally {
      setLoading(false);
    }
  };

  const login = async (email:string, password:string) => {
      try {
        const userData = await apiService.login(email,password)
        // Assume backend sets HttpOnly cookie on successful login when request is sent with credentials.
        // If backend also returns user data, use it; otherwise fetch user separately.
        if (userData) {
          setUser(userData);
        } else {
          await fetchUser();
        }
        return true;
      } catch (error) {
        console.error('Register error in login retornamos false:', error);
        return false;
      }
      
  };

  const register = async (email:string, password:string, name:string, role:string) => {
    try {
     
      const userData = await apiService.register(email, password, name, role)
      // Assume backend sets HttpOnly cookie on successful registration when request is sent with credentials.
      if (userData) {
        setUser(userData);
      } else {
        await fetchUser();
      }
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  };
*/