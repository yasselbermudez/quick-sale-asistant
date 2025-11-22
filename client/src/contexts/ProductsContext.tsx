import { createContext, useEffect, useReducer, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

export interface ProductProviderProps {
  children: ReactNode;
}

interface Product{
    id:number,
    name:string,
    sku:string,
    price:number,
    stock:number
}

export interface ProductContextType {
  products: Product[],
  isLoading: boolean,
  error:string|number|null;
  fetchProducts:(id:number) => void,
  addProduct:(productData:Product) => Promise<boolean>,
  updateProduct:(id:number,productData:Product) => Promise<boolean>,
  deleteProduct:(id:number) => Promise<boolean>
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string|number|null;
}

// ============ ACTIONS ============
type ProductAction = 
  | { type: 'FETCH_PRODUCTS_START' }
  | { type: 'FETCH_PRODUCTS_SUCCESS'; payload: Product[] }
  | { type: 'FETCH_PRODUCTS_FAILURE'; payload: string }
  | { type: 'ADD_PRODUCT_SUCCESS'; payload: Product }
  | { type: 'UPDATE_PRODUCT_SUCCESS'; payload: Product }
  | { type: 'DELETE_PRODUCT_SUCCESS';payload: number }
  | { type: 'CLEAR_ERROR' };

   const ProductsContext = createContext<ProductContextType | undefined>(undefined);
    
    const initialProductsState:ProductState = {
      products: [],
      isLoading: false,
      error: null
    };
    
    function productsReducer(state:ProductState, action:ProductAction):ProductState {
      switch (action.type) {
        case 'FETCH_PRODUCTS_START':
          return { ...state, isLoading: true, error: null };
        case 'FETCH_PRODUCTS_SUCCESS':
          return { 
            ...state, 
            isLoading: false, 
            products: action.payload 
          };
        case 'FETCH_PRODUCTS_FAILURE':
          return { 
            ...state, 
            isLoading: false, 
            error: action.payload 
          };
        case 'ADD_PRODUCT_SUCCESS':
          return {
            ...state,
            products: [...state.products, action.payload]
          };
        case 'UPDATE_PRODUCT_SUCCESS':
          return {
            ...state,
            products: state.products.map(product => 
              product.id === action.payload.id ? action.payload : product
            )
          };
        case 'DELETE_PRODUCT_SUCCESS':
          return {
            ...state,
            products: state.products.filter(product => product.id !== action.payload)
          };
        case 'CLEAR_ERROR':
          return { ...state, error: null };
        default:
          return state;
      }
    }
    
  export  function ProductsProvider({ children }:ProductProviderProps) {
      const [state, dispatch] = useReducer(productsReducer, initialProductsState);
      const { token } = useAuth();
      
      const fetchProducts = async () => {
        dispatch({ type: 'FETCH_PRODUCTS_START' });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mock data
          const mockProducts = [
            { id: 1, name: 'Sardinas', sku: '', price: 700, stock: 10 },
            { id: 2, name: 'Arina trigo', sku: '', price: 650, stock: 15 },
            { id: 3, name: 'Pasta tomate', sku: '', price: 440, stock: 30 },
            { id: 4, name: 'aderezo', sku: '', price: 1400, stock: 25 },
            { id: 5, name: 'mayoneza m', sku: 'BT-H50', price: 900, stock: 8 },
            { id: 6, name: 'mayoneza g', sku: 'CAM-HD1', price: 2100, stock: 12 },
            { id: 7, name: 'mayoneza p', sku: 'SSD-500', price: 650, stock: 20 },
            { id: 8, name: 'mayoneza ch', sku: 'RAM-8G', price: 2000, stock: 18 },
            { id: 9, name: 'latas de carne', sku: 'RAM-8G', price: 630, stock: 18 },
            { id: 10, name: 'sopas', sku: 'RAM-8G', price: 2000, stock: 18 },
            { id: 11, name: 'mantequilla r', sku: 'RAM-8G', price: 800, stock: 18 },
            { id: 12, name: 'mantequilla a', sku: 'RAM-8G', price: 500, stock: 18 },
            { id: 13, name: 'azucar B paq', sku: 'RAM-8G', price: 650, stock: 18 },
            { id: 14, name: 'aceite', sku: 'RAM-8G', price: 890, stock: 18 },
            { id: 15, name: 'arroz paquete', sku: 'RAM-8G', price: 600, stock: 18 },
            { id: 16, name: 'spaguetti azul', sku: 'RAM-8G', price: 890, stock: 18 },
            { id: 17, name: 'coditos', sku: 'RAM-8G', price: 890, stock: 18 },
          ];
          
          dispatch({ 
            type: 'FETCH_PRODUCTS_SUCCESS', 
            payload: mockProducts 
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
      
      const addProduct = async (productData:Product) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newProduct = {
            ...productData,
            id: Date.now()
          };
          
          dispatch({
            type: 'ADD_PRODUCT_SUCCESS',
            payload: newProduct
          });
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error de autenticación';
          dispatch({ 
            type: 'FETCH_PRODUCTS_FAILURE', 
            payload: errorMessage
          });
          return false;
        }
      };
      
      const updateProduct = async (id:number, productData:Product) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedProduct = {
            ...productData,
            id
          };
          
          dispatch({
            type: 'UPDATE_PRODUCT_SUCCESS',
            payload: updatedProduct
          });
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error de autenticación';
          dispatch({ 
            type: 'FETCH_PRODUCTS_FAILURE', 
            payload: errorMessage
          });
          return false;
        }
      };
      
      const deleteProduct = async (id:number) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          dispatch({
            type: 'DELETE_PRODUCT_SUCCESS',
            payload: id
          });
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error 
          ? error.message 
          : 'Error de autenticación';
          dispatch({ 
            type: 'FETCH_PRODUCTS_FAILURE', 
            payload: errorMessage 
          });
          return false;
        }
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
          deleteProduct
        }}>
          {children}
        </ProductsContext.Provider>
      );
    }
    
export default ProductsContext