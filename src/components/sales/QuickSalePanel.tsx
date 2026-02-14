import { useEffect, useRef, useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useToast } from "../../hooks/useToast";
import { useSales } from "../../hooks/useSales";
import {Minus, Plus, X} from "lucide-react"

interface Product{
    id:number,
    name:string,
    sku:string,
    price:number,
    stock:number
}

  export function QuickSalePanel() {
      const [searchTerm, setSearchTerm] = useState('');
      const [searchResults, setSearchResults] = useState<Product[]>([]);
      const [selectedProduct, setSelectedProduct] = useState<Product|null>(null);
      const [quantity, setQuantity] = useState(1);
      const { products } = useProducts();
      const { 
        pendingSales, 
        addPendingSale,
        increasePendingSales,
        decreasePendingSales, 
        removePendingSale, 
        finalizeSale, 
        clearPendingSales 
      } = useSales();
      const { addToast } = useToast();

      //Propósito Principal: Detectar Clicks Fuera del Componente
      const searchRef = useRef<HTMLDivElement>(null);
    
      // Handle search
      useEffect(() => {
        if (searchTerm.trim().length > 0) {
          const results = products.filter(
              product => product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.sku.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      }, [searchTerm, products]);
      
      // Handle click outside search results
      useEffect(() => {
        function handleClickOutside(event:MouseEvent) {
          if (searchRef.current &&
            event.target instanceof Node &&
            !searchRef.current.contains(event.target)
          ) {
            setSearchResults([]);
          }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);
      
      const selectProduct = (product:Product) => {
        setSelectedProduct(product);
        setSearchTerm('');
        setSearchResults([]);
      };
      
      const handleAddSale = () => {
        if (!selectedProduct) {
          addToast('Seleccione un producto', 'error');
          return;
        }
        
        if (quantity <= 0) {
          addToast('La cantidad debe ser mayor a 0', 'error');
          return;
        }
        
        addPendingSale(selectedProduct, quantity);
        setSelectedProduct(null);
        setQuantity(1);
        addToast(`${quantity} x ${selectedProduct.name} agregado`, 'success');
      };

      const handleFinalizeSale = async () => {
        if (pendingSales.length === 0) {
          addToast('No hay ventas pendientes', 'error');
          return;
        }
        
        const success = await finalizeSale();
        
        if (success) {
          addToast('Venta finalizada con éxito', 'success');
        }
      };
      
      // Calculate total
      const total = pendingSales.reduce((sum, sale) => sum + sale.subtotal, 0);
      
      return (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Panel de Ventas Rápidas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Product search */}
              <div className="relative" ref={searchRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar producto por nombre o SKU"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                </div>
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => selectProduct(product)}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          SKU: {product.sku} | Precio: ${product.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedProduct && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <div className="font-medium">{selectedProduct.name}</div>
                    <div className="text-sm">
                      SKU: {selectedProduct.sku} | Precio: ${selectedProduct.price.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Action buttons */}
              <div className="flex items-end">
                <button
                  onClick={handleAddSale}
                  disabled={!selectedProduct}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Agregar Producto
                </button>
              </div>
            </div>
            
            {/* Pending sales list */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Ventas Pendientes</h3>
              
              {pendingSales.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No hay ventas pendientes
                </div>
              ) : (
                <div className="overflow-hidden overflow-x-auto border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingSales.map((sale, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sale.product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {sale.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${sale.product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            ${sale.subtotal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button
                              onClick={() => increasePendingSales(index)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Plus/>
                            </button>
                            <button
                              onClick={() => decreasePendingSales(index)}
                              className="text-yellow-600 hover:text-yellow-800 mx-4"
                            >
                              <Minus/>
                            </button>
                            <button
                              onClick={() => removePendingSale(index)}
                              className="text-red-600 hover:text-red-800 "
                            >
                              <X/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          Total:
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                          ${total.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              
              <div className="mt-4 flex justify-between">
                <button
                  onClick={clearPendingSales}
                  disabled={pendingSales.length === 0}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
                >
                  <i className="fas fa-times mr-1"></i>
                  Cancelar Todo
                </button>
                
                <button
                  onClick={handleFinalizeSale}
                  disabled={pendingSales.length === 0}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                >
                  <i className="fas fa-check mr-1"></i>
                  Finalizar Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
/*
<label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar producto por nombre o SKU"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => selectProduct(product)}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          SKU: {product.sku} | Precio: ${product.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedProduct && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <div className="font-medium">{selectedProduct.name}</div>
                    <div className="text-sm">
                      SKU: {selectedProduct.sku} | Precio: ${selectedProduct.price.toFixed(2)}
                    </div>
                  </div>
                )}
  */