import { useState } from "react";
import { useSales } from "../../hooks/useSales";
import { useToast } from "../../hooks/useToast";
import { ConfirmDialog } from "../common/ConfirmDialog";

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

  export  function DailySummary() {
      const { dailySales, clearDailySales,saveReport} = useSales();
      const [showConfirm, setShowConfirm] = useState(false);
      const { addToast } = useToast();
      
      const formatDate = () => {
        const date = new Date();
        return date.toLocaleString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      };

      // Calculate summary data
      const summaryData = dailySales.reduce((acc:SummaryItem[], sale:Sale) => {
        const existingItem = acc.find(item => item.productId === sale.product.id);
        
        if (existingItem) {
          existingItem.quantity += sale.quantity;
          existingItem.total += sale.subtotal;
        } else {
          acc.push({
            productId: sale.product.id,
            productName: sale.product.name,
            quantity: sale.quantity,
            price: sale.product.price,
            total: sale.subtotal
          });
        }
        
        return acc;
      }, []);
      
      // Calculate grand total
      const grandTotal = summaryData.reduce((sum, item) => sum + item.total, 0);
      
      const handleExport = () => {
        saveReport({dailySales:summaryData,date:formatDate(),grandTotal:grandTotal})
        addToast('Reporte guardado', 'success');
      };
      
      const handleClear = () => {
        clearDailySales();
        setShowConfirm(false);
        addToast('Resumen diario limpiado', 'success');
      };
      
      return (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen del Día</h2>
            
            {summaryData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay datos para mostrar
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
                        Precio Unit.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summaryData.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        Total General:
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                        ${grandTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleExport}
                disabled={summaryData.length === 0}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                <i className="fas fa-file-export mr-1"></i>
                Guardar
              </button>
              
              <button
                onClick={() => setShowConfirm(true)}
                disabled={summaryData.length === 0}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
              >
                <i className="fas fa-trash mr-1"></i>
                Limpiar
              </button>
            </div>
            
            <ConfirmDialog
              isOpen={showConfirm}
              onClose={() => setShowConfirm(false)}
              onConfirm={handleClear}
              title="Confirmar Acción"
              message="¿Está seguro que desea limpiar el resumen diario? Esta acción no se puede deshacer."
            />
          </div>
        </div>
      );
    }
    