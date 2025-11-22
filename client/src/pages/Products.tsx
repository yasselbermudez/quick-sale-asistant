import { useState } from "react";
import { ProductForm } from "../components/products/ProductForm";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { useProducts } from "../hooks/useProducts";
import { useToast } from "../hooks/useToast";

interface Product{
    id:number,
    name:string,
    sku:string,
    price:number,
    stock:number
}

export function Products() {
      const { products, isLoading, deleteProduct } = useProducts();
      const [searchTerm, setSearchTerm] = useState('');
      const [showConfirm, setShowConfirm] = useState(false);
      const [productToDelete, setProductToDelete] = useState<Product|null>(null);
      const [showModal, setShowModal] = useState<boolean>(false);
      const [currentProduct, setCurrentProduct] = useState<Product|null>(null);
      const { addToast } = useToast();
      
      // Filtered products
      const filteredProducts = searchTerm 
        ? products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : products;
      
      const handleDelete = (product:Product) => {
        setProductToDelete(product);
        setShowConfirm(true);
      };
      
      const confirmDelete = async () => {
        if (!productToDelete) return;
        
        const success = await deleteProduct(productToDelete.id);
        
        if (success) {
          addToast(`Producto "${productToDelete.name}" eliminado`, 'success');
        }
        
        setProductToDelete(null);
        setShowConfirm(false);
      };
      
      const handleEdit = (product:Product) => {
        setCurrentProduct(product);
        setShowModal(true);
      };
      
      const handleCreate = () => {
        setCurrentProduct(null);
        setShowModal(true);
      };
      
      if (isLoading) {
        return (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }
      
      return (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Gestión de Productos
              </h2>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <i className="fas fa-plus mr-1"></i>
                  Nuevo Producto
                </button>
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No se encontraron productos" : "No hay productos disponibles"}
              </div>
            ) : (
              <div className="overflow-hidden overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => handleEdit(product)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 mx-2 px-4 rounded-lg "
                          >
                            <i className="fas fa-edit mr-1"></i>
                            Editar
                          </button>

                          <button
                            onClick={() => handleDelete(product)}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 mx-2 px-4 rounded-lg "
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <ConfirmDialog
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={confirmDelete}
            title="Confirmar Eliminación"
            message={`¿Está seguro que desea eliminar el producto "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
          />
      
          <ProductForm
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            product={currentProduct}
          />
          
          
        </div>
      );
    }
 