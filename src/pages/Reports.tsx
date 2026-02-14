import { useEffect, useState } from "react";

interface SummaryItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Report {
  dailySales: SummaryItem[];
  grandTotal: number;
  date: string;
}

const LOCAL_STORAGE_KEY = 'reports_data';

// ReportsPage Component
export function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedReportsString = localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedReports:Report[] = savedReportsString ? JSON.parse(savedReportsString) : [];
      console.log(savedReports)
      setReports(savedReports);
    } catch (error) {
      console.error('Error loading reports from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleReportExpansion = (index: number) => {
    if (expandedReportId === index) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(index);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Reportes</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Reportes</h2>
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-chart-bar text-6xl mb-4"></i>
          <p className="text-xl">No hay reportes disponibles</p>
          <p className="mt-2">Los reportes se generarán automáticamente después de realizar ventas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Reportes de Ventas</h2>
      
      <div className="space-y-4">
        {reports.map((report, index) => (
          <div 
            key={index} 
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            {/* Encabezado del reporte - Clickable */}
            <div 
              className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
              onClick={() => toggleReportExpansion(index)}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <span className={`transform transition-transform duration-200 ${
                    expandedReportId === index ? 'rotate-90' : ''
                  }`}>
                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Reporte del {report.date}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {report.dailySales.length} producto{report.dailySales.length !== 1 ? 's' : ''} vendido{report.dailySales.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total del día</p>
                  <p className="font-bold text-lg text-green-600">
                    ${report.grandTotal.toFixed(2)}
                  </p>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                    expandedReportId === index ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Contenido expandible */}
            {expandedReportId === index && (
              <div className="px-4 py-4 border-t animate-fadeIn">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Resumen del día:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-blue-600">Productos vendidos</p>
                      <p className="text-xl font-bold">{report.dailySales.length}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-green-600">Total ventas</p>
                      <p className="text-xl font-bold">${report.grandTotal.toFixed(2)}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-sm text-purple-600">Unidades totales</p>
                      <p className="text-xl font-bold">
                        {report.dailySales.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <h4 className="font-medium text-gray-700 mb-3">Detalle de productos vendidos:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio Unitario
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.dailySales.map((item, itemIndex) => (
                        <tr key={itemIndex} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <p className="font-medium text-gray-900">{item.productName}</p>
                                <p className="text-sm text-gray-500">ID: {item.productId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-green-600">
                              ${item.total.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-700">
                          Subtotal del día:
                        </td>
                        <td className="px-4 py-3 font-bold text-lg text-green-600">
                          ${report.grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumen general */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-900">Resumen general</h3>
            <p className="text-sm text-gray-500">
              {reports.length} día{reports.length !== 1 ? 's' : ''} reportado{reports.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total general</p>
            <p className="text-2xl font-bold text-green-600">
              ${reports.reduce((sum, report) => sum + report.grandTotal, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Agrega estos estilos en tu archivo CSS global o usa Tailwind JIT
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(-10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fadeIn {
//   animation: fadeIn 0.2s ease-out;
// }