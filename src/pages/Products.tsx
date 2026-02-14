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

interface BackupData {
  exportType?: string;       
  exportedAt?: string;       
  key: string;               
  data: Product[];       
}

const LOCAL_STORAGE_KEY = 'products_data';

export function Products() {
      const { products, isLoading, deleteProduct,fetchProducts} = useProducts();
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

      const handleExportBackup = () => {
        try {
          // 1. Leer solo los datos de 'products_data'
          const productsData = localStorage.getItem(LOCAL_STORAGE_KEY);
          
          if (!productsData) {
            addToast('No hay datos de productos para exportar.');
            return;
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
          
          addToast(`Copia de seguridad exportada. ${exportData.data.length || 0} productos guardados.`);
        } catch (error) {
          console.error('Error al exportar backup:', error);
          addToast('Error al generar la copia de seguridad. Verifica la consola para más detalles.');
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
        
        // Validar que al menos el primer elemento tenga la estructura correcta (opcional)
        // Esto evita tener que recorrer todo el array aquí, se hará después con filter
        return true;
      }

      const handleImportBackup = () => {
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

                // Validar estructura del archivo usando el type guard
                if (!isValidBackup(parsedData, LOCAL_STORAGE_KEY)) {
                  throw new Error('Archivo no válido. Debe ser un backup de products_data.');
                }

                // A partir de aquí parsedData es tratado como BackupData
                const importData = parsedData as BackupData;

                // Validar cada producto y filtrar inválidos
                const invalidProducts = importData.data.filter(p => !isValidProduct(p));

                if (invalidProducts.length > 0) {
                  const confirmImport = window.confirm(
                    `Se encontraron ${invalidProducts.length} producto(s) con estructura inválida. ¿Deseas importar solo los productos válidos?`
                  );

                  if (!confirmImport) return;

                  // Filtrar solo productos válidos
                  importData.data = importData.data.filter(isValidProduct);
                }

                // Confirmar sobreescritura de datos existentes
                const currentData = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (currentData) {
                  try {
                    const currentProducts: unknown = JSON.parse(currentData);
                    const currentCount = Array.isArray(currentProducts) ? currentProducts.length : 0;
                    const confirmOverwrite = window.confirm(
                      `¿Deseas reemplazar los ${currentCount} productos actuales con ${importData.data.length} productos del archivo?`
                    );
                    if (!confirmOverwrite) return;
                  } catch {
                    // Si el JSON actual es inválido, se sobreescribe sin preguntar (o podrías preguntar igual)
                    const confirmOverwrite = window.confirm(
                      `Los datos actuales parecen corruptos. ¿Deseas reemplazarlos con ${importData.data.length} productos del archivo?`
                    );
                    if (!confirmOverwrite) return;
                  }
                }

                // Guardar en localStorage
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(importData.data));

                // Actualizar estado de la aplicación (asumiendo que fetchProducts y addToast existen)
                fetchProducts(); // recarga la lista de productos
                addToast(`✅ Importación exitosa! Se importaron ${importData.data.length} productos.`);

              } catch (error) {
                console.error('Error al procesar archivo:', error);
                const message = error instanceof Error ? error.message : 'Error desconocido';
                addToast(`❌ Error al importar: ${message}`);
              }
            };

            reader.readAsText(file);
          };

          fileInput.click();
        } catch (error) {
          console.error('Error en importación:', error);
          addToast('❌ Error al iniciar la importación.');
        }
      };
      
      if (isLoading) {
        return (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }
      
      return (
      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 flex justify-between">
            <h2 className="text-lg font-medium text-gray-900">
                Backup de Productos
            </h2>
            <div className="flex flex-wrap gap-4 mb-6">
              
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar Productos
              </button>
              
              <button
                onClick={handleImportBackup}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Importar Productos
              </button>
            </div>
          </div>
        </div>

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
        
      </div>);
    }
 