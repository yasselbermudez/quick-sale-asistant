import { createContext, useEffect, useReducer, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

const LOCAL_STORAGE_SALES_KEY = 'sales_data';

// ============ INTERFACES PRINCIPALES ============
interface Product { 
  id: number; 
  name: string; 
  price: number;
  sku?: string;
  stock?: number;
}

interface Sale {
  id: number; 
  product: Product;
  quantity: number; 
  subtotal: number;
  timestamp: string;
}

// ============ CONTEXT TYPE ============
export interface SalesContextType {
  // State
  pendingSales: Sale[];
  dailySales: Sale[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addPendingSale: (product: Product, quantity: number) => void;
  removePendingSale: (index: number) => void;
  increasePendingSales:(index:number) => void;
  decreasePendingSales:(index:number) => void;
  clearPendingSales: () => void;
  fetchDailySales: () => Promise<void>;
  finalizeSale: () => Promise<boolean>;
  clearDailySales: () => void;
}

// ============ STATE ============
interface SalesState {
  pendingSales: Sale[];
  dailySales: Sale[];
  isLoading: boolean;
  error: string | null;
}

// ============ ACTIONS ============
type SalesAction = 
  | { 
      type: 'ADD_PENDING_SALE'; 
      payload: { 
        product: Product; 
        quantity: number; 
        subtotal: number;
      } 
    }
  | { type: 'REMOVE_PENDING_SALE'; payload: number }
  | { type: 'CLEAR_PENDING_SALES' }
  | { type: 'INCREASE_PENDING_SALES'; payload: number }
  | { type: 'DECREASE_PENDING_SALES'; payload: number }
  | { type: 'FETCH_DAILY_SALES_START' }
  | { type: 'FETCH_DAILY_SALES_SUCCESS'; payload: Sale[] }
  | { type: 'FETCH_DAILY_SALES_FAILURE'; payload: string }
  | { type: 'FINALIZE_SALE_SUCCESS'; payload: Sale[] }
  | { type: 'CLEAR_DAILY_SALES' }
  | { type: 'LOAD_DAILY_SALES_FROM_STORAGE'; payload: Sale[] };

// ============ PROPS ============
interface SalesProviderProps {
  children: ReactNode;
}

// ============ CONTEXT ============
const SalesContext = createContext<SalesContextType | undefined>(undefined);

// ============ FUNCIONES DE LOCALSTORAGE ============
const loadDailySalesFromStorage = (): Sale[] => {
  try {
    const savedSales = localStorage.getItem(LOCAL_STORAGE_SALES_KEY);
    return savedSales ? JSON.parse(savedSales) : [];
  } catch (error) {
    console.error('Error loading daily sales from localStorage:', error);
    return [];
  }
};

const saveDailySalesToStorage = (dailySales: Sale[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_SALES_KEY, JSON.stringify(dailySales));
  } catch (error) {
    console.error('Error saving daily sales to localStorage:', error);
  }
};

const clearDailySalesFromStorage = (): void => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_SALES_KEY);
  } catch (error) {
    console.error('Error clearing daily sales from localStorage:', error);
  }
};

// ============ INITIAL STATE ============
const initialSalesState: SalesState = {
  pendingSales: [],
  dailySales: loadDailySalesFromStorage(), // Cargar ventas guardadas al inicializar
  isLoading: false,
  error: null
};

// ============ REDUCER ============
function salesReducer(state: SalesState, action: SalesAction): SalesState {
  let newState: SalesState;
  
  switch (action.type) {
    case 'ADD_PENDING_SALE': {
      // Check if product already exists in pending sales
      const existingIndex = state.pendingSales.findIndex(
        sale => sale.product.id === action.payload.product.id
      );
      
      if (existingIndex >= 0) {
        // Update existing item
        const updatedPendingSales = [...state.pendingSales];
        const existingSale = updatedPendingSales[existingIndex];
        
        updatedPendingSales[existingIndex] = {
          ...existingSale,
          quantity: existingSale.quantity + action.payload.quantity,
          subtotal: existingSale.subtotal + action.payload.subtotal
        };
        
        newState = { ...state, pendingSales: updatedPendingSales };
      } else {
        // Add new item
        const newSale: Sale = {
          id: Date.now(), // Temporary ID
          product: action.payload.product,
          quantity: action.payload.quantity,
          subtotal: action.payload.subtotal,
          timestamp: new Date().toISOString()
        };
        
        newState = { 
          ...state, 
          pendingSales: [...state.pendingSales, newSale] 
        };
      }
      break;
    }
    
    case 'REMOVE_PENDING_SALE':
      newState = {
        ...state,
        pendingSales: state.pendingSales.filter((_, index) => index !== action.payload)
      };
      break;

    case 'INCREASE_PENDING_SALES':
      newState = {
        ...state,
        pendingSales: state.pendingSales.map((sale, index) => {
          if (index === action.payload) {
            const newQuantity = sale.quantity + 1;
            const newSubtotal = sale.product.price * newQuantity;
            return {
              ...sale,
              quantity: newQuantity,
              subtotal: newSubtotal
            };
          }
          return sale;
        })
      };
      break;

    case 'DECREASE_PENDING_SALES':
      newState = {
        ...state,
        pendingSales: state.pendingSales.map((sale, index) => {
          if (index === action.payload && sale.quantity>1) {
            const newQuantity = sale.quantity - 1;
            const newSubtotal = sale.product.price * newQuantity;
            return {
              ...sale,
              quantity: newQuantity,
              subtotal: newSubtotal
            };
          }
          return sale;
        })
      };
      break;
      
    case 'CLEAR_PENDING_SALES':
      newState = { ...state, pendingSales: [] };
      break;
      
    case 'FETCH_DAILY_SALES_START':
      newState = { ...state, isLoading: true, error: null };
      break;
      
    case 'FETCH_DAILY_SALES_SUCCESS':
      newState = { 
        ...state, 
        isLoading: false, 
        dailySales: action.payload 
      };
      // Guardar en localStorage cuando se actualizan las ventas
      saveDailySalesToStorage(action.payload);
      break;
      
    case 'FETCH_DAILY_SALES_FAILURE':
      newState = { 
        ...state, 
        isLoading: false, 
        error: action.payload 
      };
      break;
      
    case 'FINALIZE_SALE_SUCCESS': {
      const updatedDailySales = [...state.dailySales, ...action.payload];
      newState = {
        ...state,
        pendingSales: [],
        dailySales: updatedDailySales
      };
      // Guardar en localStorage cuando se finaliza una venta
      saveDailySalesToStorage(updatedDailySales);
      break;
    }

    case 'CLEAR_DAILY_SALES':
      newState = { ...state, dailySales: [] };
      // Limpiar localStorage
      clearDailySalesFromStorage();
      break;
      
    case 'LOAD_DAILY_SALES_FROM_STORAGE':
      newState = { ...state, dailySales: action.payload };
      break;
      
    default:
      return state;
  }
  
  // Si no es una acción de carga desde storage, guardar en localStorage
  if (action.type !== 'LOAD_DAILY_SALES_FROM_STORAGE') {
    // Guardar dailySales en localStorage después de cualquier modificación
    saveDailySalesToStorage(newState.dailySales);
  }
  
  return newState;
}

// ============ PROVIDER ============
export function SalesProvider({ children }: SalesProviderProps) {
  const [state, dispatch] = useReducer(salesReducer, initialSalesState);
  const { token } = useAuth();
  
  const addPendingSale = (product: Product, quantity: number): void => {
    const subtotal = product.price * quantity;
    
    dispatch({
      type: 'ADD_PENDING_SALE',
      payload: { 
        product, 
        quantity, 
        subtotal
      }
    });
  };
  
  const removePendingSale = (index: number): void => {
    dispatch({
      type: 'REMOVE_PENDING_SALE',
      payload: index
    });
  };
  
  const clearPendingSales = (): void => {
    dispatch({ type: 'CLEAR_PENDING_SALES' });
  };

  const increasePendingSales = (index: number): void => {
    dispatch({ 
      type: 'INCREASE_PENDING_SALES',
      payload: index
    });
  };

  const decreasePendingSales = (index: number): void => {
    dispatch({ 
      type: 'DECREASE_PENDING_SALES',
      payload: index
    });
  };
  
  const fetchDailySales = async (): Promise<void> => {
    dispatch({ type: 'FETCH_DAILY_SALES_START' });
    
    try {
      // Aquí puedes cargar las ventas desde tu API si es necesario
      // Por ahora mantenemos las ventas que ya están en localStorage
      const savedSales = loadDailySalesFromStorage();
      
      dispatch({ 
        type: 'FETCH_DAILY_SALES_SUCCESS', 
        payload: savedSales
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al cargar ventas diarias';
      
      dispatch({ 
        type: 'FETCH_DAILY_SALES_FAILURE', 
        payload: errorMessage 
      });
    }
  };
  
  const finalizeSale = async (): Promise<boolean> => {
    if (state.pendingSales.length === 0) return false;
    
    try {
      
      const salesWithIds: Sale[] = state.pendingSales.map((sale, index) => ({
        ...sale,
        id: Date.now() + index, // Generate unique IDs
        timestamp: new Date().toISOString()
      }));
      
      dispatch({
        type: 'FINALIZE_SALE_SUCCESS',
        payload: salesWithIds
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al finalizar venta';
      
      dispatch({ 
        type: 'FETCH_DAILY_SALES_FAILURE', 
        payload: errorMessage 
      });
      return false;
    }
  };
  
  const clearDailySales = (): void => {
    dispatch({ type: 'CLEAR_DAILY_SALES' });
  };

  useEffect(() => {
    if (token) {
      fetchDailySales();
    }
  }, [token]);
  
  // ============ CONTEXT VALUE ============
  const contextValue: SalesContextType = {
    // State
    pendingSales: state.pendingSales,
    dailySales: state.dailySales,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    addPendingSale,
    removePendingSale,
    increasePendingSales,
    decreasePendingSales,
    clearPendingSales,
    fetchDailySales,
    finalizeSale,
    clearDailySales,
  };
  
  return (
    <SalesContext.Provider value={contextValue}>
      {children}
    </SalesContext.Provider>
  );
}

export default SalesContext;