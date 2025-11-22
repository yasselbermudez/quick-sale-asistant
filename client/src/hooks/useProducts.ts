import { useContext } from "react";
import ProductsContext, { type ProductContextType } from "../contexts/ProductsContext";

export function useProducts():ProductContextType {
      const context = useContext(ProductsContext);
      if (!context) {
        throw new Error('useProducts must be used within a ProductsProvider');
      }
      return context;
    }