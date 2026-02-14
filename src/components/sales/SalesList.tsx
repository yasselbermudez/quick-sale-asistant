import { useSales } from "../../hooks/useSales";

 export function SalesList() {
      const { dailySales, isLoading } = useSales();
      
      // Format date
      const formatDate = (dateStr:string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };
      
      if (isLoading) {
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Ventas del Día</h2>
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        );
      }
      
      return (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Ventas del Día</h2>
            
            {dailySales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se han registrado ventas hoy
              </div>
            ) : (
              <div className="overflow-hidden overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hora
                      </th>
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailySales.map((sale) => (
                      <tr key={sale.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(sale.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }