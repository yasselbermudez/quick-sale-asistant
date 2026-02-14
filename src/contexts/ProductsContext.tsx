import { createContext, useEffect, useReducer, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

export interface ProductProviderProps {
  children: ReactNode;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: string | number | null;
  fetchProducts: () => void;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: number, productData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  exportProducts: () => string;
  importProducts: (jsonData: string) => boolean;
  clearProducts: () => void;
  getNextProductId: () => number;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | number | null;
}

// Clave para localStorage
const LOCAL_STORAGE_KEY = 'products_data';
const BACKUP_LOCAL_STORAGE_KEY = 'products_backup';

// ============ ACTIONS ============
type ProductAction = 
  | { type: 'FETCH_PRODUCTS_START' }
  | { type: 'FETCH_PRODUCTS_SUCCESS'; payload: Product[] }
  | { type: 'FETCH_PRODUCTS_FAILURE'; payload: string }
  | { type: 'ADD_PRODUCT_SUCCESS'; payload: Product }
  | { type: 'UPDATE_PRODUCT_SUCCESS'; payload: Product }
  | { type: 'DELETE_PRODUCT_SUCCESS'; payload: number }
  | { type: 'CLEAR_PRODUCTS_SUCCESS' }
  | { type: 'CLEAR_ERROR' };

const ProductsContext = createContext<ProductContextType | undefined>(undefined);

// Cargar productos iniciales desde localStorage o datos mock
const loadInitialProducts = (): Product[] => {
  try {
    const savedProducts = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedProducts) {
      return JSON.parse(savedProducts);
    }
    
    // Si no hay datos guardados, devolver datos mock iniciales
    return [
      { id: 1, name: 'Sardinas', sku: 'sar', price: 700, stock: 10 },
      { id: 2, name: 'Arina trigo', sku: 'atri', price: 650, stock: 15 },
      { id: 3, name: 'Pasta tomate', sku: 'patt', price: 440, stock: 30 },
      { id: 4, name: 'aderezo', sku: 'adzo', price: 1400, stock: 25 },
      { id: 5, name: 'mayoneza m', sku: 'maym', price: 900, stock: 8 },
      { id: 6, name: 'mayoneza g', sku: 'mayg', price: 2100, stock: 12 },
      { id: 7, name: 'mayoneza p', sku: 'mayp', price: 650, stock: 20 },
      { id: 8, name: 'mayoneza ch', sku: 'maych', price: 2000, stock: 18 },
      { id: 9, name: 'latas de carne', sku: 'lcar', price: 630, stock: 18 }
    ];
  } catch (error) {
    console.error('Error loading products from localStorage:', error);
    return [];
  }
};

const initialProductsState: ProductState = {
  products: loadInitialProducts(),
  isLoading: false,
  error: null
};

// Guardar productos en localStorage
const saveProductsToLocalStorage = (products: Product[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
  }
};

// Crear backup de productos
const createBackup = (products: Product[]): void => {
  try {
    const backupData = {
      products,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(BACKUP_LOCAL_STORAGE_KEY, JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error('Error creating backup:', error);
  }
};

function productsReducer(state: ProductState, action: ProductAction): ProductState {
  let newState: ProductState;
  
  switch (action.type) {
    case 'FETCH_PRODUCTS_START':
      newState = { ...state, isLoading: true, error: null };
      break;
    case 'FETCH_PRODUCTS_SUCCESS':
      newState = { 
        ...state, 
        isLoading: false, 
        products: action.payload 
      };
      saveProductsToLocalStorage(action.payload);
      break;
    case 'FETCH_PRODUCTS_FAILURE':
      newState = { 
        ...state, 
        isLoading: false, 
        error: action.payload 
      };
      break;
    case 'ADD_PRODUCT_SUCCESS':
      newState = {
        ...state,
        products: [...state.products, action.payload]
      };
      saveProductsToLocalStorage(newState.products);
      break;
    case 'UPDATE_PRODUCT_SUCCESS':
      newState = {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        )
      };
      saveProductsToLocalStorage(newState.products);
      break;
    case 'DELETE_PRODUCT_SUCCESS':
      newState = {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
      saveProductsToLocalStorage(newState.products);
      break;
    case 'CLEAR_PRODUCTS_SUCCESS':
      newState = {
        ...state,
        products: []
      };
      saveProductsToLocalStorage([]);
      break;
    case 'CLEAR_ERROR':
      newState = { ...state, error: null };
      break;
    default:
      return state;
  }
  
  // Crear backup automático después de cada cambio
  createBackup(newState.products);
  
  return newState;
}

export function ProductsProvider({ children }: ProductProviderProps) {
  const [state, dispatch] = useReducer(productsReducer, initialProductsState);
  const { token } = useAuth();
  
  const getNextProductId = (): number => {
    if (state.products.length === 0) return 1;
    const maxId = Math.max(...state.products.map(p => p.id));
    return maxId + 1;
  };

  const fetchProducts = async () => {
    dispatch({ type: 'FETCH_PRODUCTS_START' });
    
    try {
      
      // Cargar desde localStorage o usar datos mock
      const savedProducts = localStorage.getItem(LOCAL_STORAGE_KEY);
      let productsToLoad: Product[];
      
      if (savedProducts) {
        productsToLoad = JSON.parse(savedProducts);
      } else {
        // Usar datos mock iniciales si no hay nada en localStorage
        productsToLoad = initialProductsState.products;
      }
      
      dispatch({ 
        type: 'FETCH_PRODUCTS_SUCCESS', 
        payload: productsToLoad 
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error de autenticación';
      dispatch({ 
        type: 'FETCH_PRODUCTS_FAILURE', 
        payload: errorMessage 
      });
    }
  };
  
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      
      const newProduct = {
        ...productData,
        id: getNextProductId()
      };
      
      dispatch({
        type: 'ADD_PRODUCT_SUCCESS',
        payload: newProduct
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al agregar producto';
      dispatch({ 
        type: 'FETCH_PRODUCTS_FAILURE', 
        payload: errorMessage
      });
      return false;
    }
  };
  
  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      
      const existingProduct = state.products.find(p => p.id === id);
      if (!existingProduct) {
        throw new Error('Producto no encontrado');
      }
      
      const updatedProduct = {
        ...existingProduct,
        ...productData,
        id // Asegurar que el ID no cambie
      };
      
      dispatch({
        type: 'UPDATE_PRODUCT_SUCCESS',
        payload: updatedProduct
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al actualizar producto';
      dispatch({ 
        type: 'FETCH_PRODUCTS_FAILURE', 
        payload: errorMessage
      });
      return false;
    }
  };
  
  const deleteProduct = async (id: number) => {
    try {
      
      dispatch({
        type: 'DELETE_PRODUCT_SUCCESS',
        payload: id
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al eliminar producto';
      dispatch({ 
        type: 'FETCH_PRODUCTS_FAILURE', 
        payload: errorMessage 
      });
      return false;
    }
  };

  const exportProducts = (): string => {
    const exportData = {
      products: state.products,
      exportDate: new Date().toISOString(),
      totalProducts: state.products.length,
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  const importProducts = (jsonData: string): boolean => {
    try {
      const parsedData = JSON.parse(jsonData);
      let productsToImport: Product[];
      
      // Verificar diferentes formatos de importación
      if (Array.isArray(parsedData)) {
        // Si es un array directo de productos
        productsToImport = parsedData;
      } else if (parsedData.products && Array.isArray(parsedData.products)) {
        // Si es un objeto con propiedad products
        productsToImport = parsedData.products;
      } else {
        throw new Error('Formato de datos inválido');
      }
      
      // Validar estructura de cada producto
      const isValid = productsToImport.every(product => 
        product.id && 
        product.name && 
        typeof product.price === 'number' && 
        typeof product.stock === 'number'
      );
      
      if (!isValid) {
        throw new Error('Estructura de datos inválida');
      }
      
      // Reasignar IDs si es necesario para evitar conflictos
      const maxExistingId = state.products.length > 0 
        ? Math.max(...state.products.map(p => p.id)) 
        : 0;
      
      const importedWithAdjustedIds = productsToImport.map((product, index) => ({
        ...product,
        id: maxExistingId + index + 1
      }));
      
      // Combinar productos existentes con importados
      const combinedProducts = [...state.products, ...importedWithAdjustedIds];
      
      dispatch({
        type: 'FETCH_PRODUCTS_SUCCESS',
        payload: combinedProducts
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al importar productos';
      dispatch({ 
        type: 'FETCH_PRODUCTS_FAILURE', 
        payload: errorMessage 
      });
      return false;
    }
  };

  const clearProducts = () => {
    dispatch({ type: 'CLEAR_PRODUCTS_SUCCESS' });
  };
  
  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  return (
    <ProductsContext.Provider value={{
      ...state,
      fetchProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      exportProducts,
      importProducts,
      clearProducts,
      getNextProductId
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export default ProductsContext;