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

interface BackupData {
  exportType?: string;       
  exportedAt?: string;       
  key: string;               
  data: Product[];       
}

export interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: string | number | null;
  fetchProducts: () => void;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: number, productData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  exportProducts: () => Promise<boolean>;
  importProducts: () => Promise<boolean>;
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
  | { type: 'EXPORT_PRODUCTS' }
  | { type: 'IMPORT_PRODUCTS'; payload: Product[] }
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

    case 'IMPORT_PRODUCTS': {
      return {
        ...state,
        products: action.payload
      };
    }

    case 'EXPORT_PRODUCTS':
      return state
    
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

  const exportProducts = async () : Promise<boolean> => {
    try {
      // 1. Leer solo los datos de 'products_data'
      const productsData = localStorage.getItem(LOCAL_STORAGE_KEY);
          
      if (!productsData) {
        console.log('No hay datos de productos para exportar.');
        return false;
      }
          
      // 2. Crear objeto estructurado con metadatos
      const exportData = {
        exportType: 'products_backup',
        exportedAt: new Date().toISOString(),
        key: 'products_data',
        data: JSON.parse(productsData) // Parseamos para validar estructura
      };
          
      // 3. Convertir a JSON y crear archivo descargable
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
          
      // 4. Crear y disparar descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_products_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
          
      // 5. Limpieza
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      dispatch({ type: 'EXPORT_PRODUCTS' });
      return true
      } catch (error) {
        console.error('Error al exportar backup:', error);
        return false
      }
    };

    function isValidProduct(obj: unknown): obj is Product {
      if (!obj || typeof obj !== 'object') return false;
      const p = obj as Partial<Product>;
      return (
        typeof p.id === 'number' &&
        typeof p.name === 'string' &&
        typeof p.sku === 'string' &&
        typeof p.price === 'number' &&
        typeof p.stock === 'number'
      );
    }

    function isValidBackup(data: unknown, expectedKey: string): data is BackupData {
      if (!data || typeof data !== 'object') return false;
      const obj = data as Record<string, unknown>;
        
      // Validar que tenga la clave correcta y que data sea un array
      if (obj.key !== expectedKey || !Array.isArray(obj.data)) {
        return false;
      }
        
      return true;
    }

    const importProducts = (): Promise<boolean> => {
      return new Promise((resolve) => {
        try {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = '.json';

          fileInput.onchange = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = (e: ProgressEvent<FileReader>) => {
              try {
                const fileContent = e.target?.result as string;
                const parsedData: unknown = JSON.parse(fileContent);

                if (!isValidBackup(parsedData, LOCAL_STORAGE_KEY)) {
                  throw new Error('Archivo no válido. Debe ser un backup de products_data.');
                }

                const importData = parsedData as BackupData;
                importData.data = importData.data.filter(isValidProduct);
                
                // ✅ Mover el confirm AQUÍ, antes del dispatch
                const confirmOverwrite = window.confirm(
                  `¿Deseas reemplazar los productos actuales con ${importData.data.length} productos del archivo?`
                );
                
                if (confirmOverwrite) {
                  dispatch({ type: 'IMPORT_PRODUCTS', payload: importData.data });
                  resolve(true);
                } else {
                  resolve(false);
                }

              } catch (error) {
                console.error('Error al procesar archivo:', error);
                resolve(false);
              }
            };

            reader.readAsText(file);
          };

          fileInput.click();
        } catch (error) {
          console.error('Error en importación:', error);
          resolve(false);
        }
      });
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
      clearProducts,
      getNextProductId,
      exportProducts,
      importProducts,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export default ProductsContext;