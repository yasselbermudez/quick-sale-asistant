import { createContext, useEffect, useReducer, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

const LOCAL_STORAGE_KEY = 'reports_data';
//const BACKUP_LOCAL_STORAGE_KEY = 'sales_backup';

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

interface SummaryItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Report {
  dailySales: SummaryItem[];
  grandTotal:number
  date:string
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
  saveReport: (report:Report)=> void;
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
  | { type: 'SAVE_REPORT'; payload: Report };

// ============ PROPS ============
interface SalesProviderProps {
  children: ReactNode;
}

// ============ CONTEXT ============
const SalesContext = createContext<SalesContextType | undefined>(undefined);

// ============ INITIAL STATE ============
const initialSalesState: SalesState = {
  pendingSales: [],
  dailySales: [],
  isLoading: false,
  error: null
};

const saveReportToLocalStorage = (report: Report): void => {
  try {
    const savedReportsString = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedReports: Report[] = savedReportsString ? JSON.parse(savedReportsString) : [];
    
    // Filtrar reportes existentes con la misma fecha para evitar duplicados
    const reportsWithoutToday = savedReports.filter(r => r.date !== report.date);
    
    // Agregar el nuevo reporte
    const newReports = [...reportsWithoutToday, report];
    
    // Ordenar por fecha (más reciente primero)
    newReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newReports, null, 2));
  } catch (error) {
    console.error('Error saving reports to localStorage:', error);
  }
};

// ============ REDUCER ============
function salesReducer(state: SalesState, action: SalesAction): SalesState {
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
        
        return { ...state, pendingSales: updatedPendingSales };
      } else {
        // Add new item
        const newSale: Sale = {
          id: Date.now(), // Temporary ID
          product: action.payload.product,
          quantity: action.payload.quantity,
          subtotal: action.payload.subtotal,
          timestamp: new Date().toISOString()
        };
        
        return { 
          ...state, 
          pendingSales: [...state.pendingSales, newSale] 
        };
      }
    }
    
    case 'REMOVE_PENDING_SALE':
      return {
        ...state,
        pendingSales: state.pendingSales.filter((_, index) => index !== action.payload)
      };

    case 'INCREASE_PENDING_SALES':
      return {
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
      }

    case 'DECREASE_PENDING_SALES':
      return {
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
      }
      
    case 'CLEAR_PENDING_SALES':
      return { ...state, pendingSales: [] };
      
    case 'FETCH_DAILY_SALES_START':
      return { ...state, isLoading: true, error: null };
      
    case 'FETCH_DAILY_SALES_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        dailySales: action.payload 
      };
      
    case 'FETCH_DAILY_SALES_FAILURE':
      return { 
        ...state, 
        isLoading: false, 
        error: action.payload 
      };
      
    case 'FINALIZE_SALE_SUCCESS':
      return {
        ...state,
        pendingSales: [],
        dailySales: [...state.dailySales, ...action.payload]
      };

    case 'SAVE_REPORT':
      console.log("pal local storage",action.payload)
      saveReportToLocalStorage(action.payload)
      return { ...state, dailySales: [] };
      
    case 'CLEAR_DAILY_SALES':
      return { ...state, dailySales: [] };
      
    default:
      return state;
  }
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
      dispatch({ 
        type: 'FETCH_DAILY_SALES_SUCCESS', 
        payload: []
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

  const saveReport = (report:Report): void => {
    dispatch({ type: 'SAVE_REPORT' , payload:report});
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
    saveReport,
  };
  
  return (
    <SalesContext.Provider value={contextValue}>
      {children}
    </SalesContext.Provider>
  );
}

export default SalesContext;