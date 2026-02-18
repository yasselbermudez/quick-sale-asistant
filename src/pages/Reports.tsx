import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, X } from "lucide-react";
import { useReports } from "../hooks/useReports";
import { useToast } from "../hooks/useToast";
import type { Report,TempReport}  from "../contexts/ReportsContext";

export function Reports() {
  const {
    reports,
    tempReports,
    loading,
    sumFirstReport,
    deleteReport,
    addTempReport,
    setSumFirstReport,
    combineReports,
    exportAndDownloadReports,
    importReportsFromFile,
  } = useReports();

  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const { addToast } = useToast();

  const toggleReportExpansion = (reportId: string) => {
    setExpandedReportId(prev => prev === reportId ? null : reportId);
  };

  const handleSearchChange = (reportId: string, value: string) => {
    setSearchTerms(prev => ({ ...prev, [reportId]: value }));
  };

  // Manejar clic en "Sumar" desde el menú
  const handleSumClick = (reportId: string, report: Report) => {
    if (sumFirstReport) {
      // Ya hay un primer reporte seleccionado
      if (sumFirstReport.id === reportId) {
        addToast('Selecciona un reporte diferente para sumar.', 'error');
        return;
      }
      // Realizar la suma
      const combined = combineReports(sumFirstReport.report, report);
      // Crear reporte temporal
      addTempReport(combined);
      setSumFirstReport(null); // Salir del modo suma
    } else {
      // Primer reporte seleccionado
      setSumFirstReport({ id: reportId, report });
    }
  };

  const handleImport = async () => {
    const result = await importReportsFromFile()
    if(result) addToast("Reporte importado")
    else addToast("Error importando reporte",'error')
  }

  const handleExport = async (report:Report) => {
    const result = await exportAndDownloadReports(report)
    if(result) addToast("Reporte exportado")
    else addToast("Error exportando reporte",'error')
  }

  // Cancelar modo suma
  const cancelSum = () => setSumFirstReport(null);

  // Generar un ID único para cada reporte en la UI
  const getReportId = (report: Report | TempReport, index: number): string => {
    if ('tempId' in report) return `temp-${report.tempId}`;
    return `persisted-${index}-${report.date}`;
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

  if (reports.length === 0 && tempReports.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Reportes</h2>
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-chart-bar text-6xl mb-4"></i>
          <p className="text-xl">No hay reportes disponibles</p>
          <p className="my-2">Los reportes se generarán automáticamente después de realizar ventas.</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleImport} 
            className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Importar Reporte
          </Button>
        </div>
      </div>
    );
  }

  // Combinamos todos los reportes para mostrarlos (primero permanentes, luego temporales)
  const allReports = [...reports, ...tempReports];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Reportes de Ventas</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleImport} 
          className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Importar Reporte
        </Button>
      </div>

      {/* Indicador de modo suma */}
      {sumFirstReport && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
          <span className="text-blue-700">
            Modo suma: selecciona el segundo reporte (primer reporte: {sumFirstReport.report.date})
          </span>
          <Button variant="ghost" size="sm" onClick={cancelSum} className="text-blue-700">
            <X className="h-4 w-4 mr-1" /> Cancelar
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {allReports.map((report, idx) => {
          const reportId = getReportId(report, idx);
          const isExpanded = expandedReportId === reportId;
          const searchTerm = searchTerms[reportId] || '';

          // Ordenar productos alfabéticamente
          const sortedSales = [...report.dailySales].sort((a, b) =>
            a.productName.localeCompare(b.productName)
          );

          // Filtrar por término de búsqueda
          const filteredSales = searchTerm.trim()
            ? sortedSales.filter(item =>
                item.productName.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : sortedSales;

          // Estadísticas del reporte
          const totalProducts = report.dailySales.length;
          const totalUnits = report.dailySales.reduce((sum, item) => sum + item.quantity, 0);

          return (
            <div 
              key={reportId}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Encabezado del reporte */}
              <div 
                className={`bg-gray-50 px-4 py-3 flex justify-between items-center ${
                  !sumFirstReport ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => {
                  if (sumFirstReport) {
                    handleSumClick(reportId, report);
                  } else {
                    toggleReportExpansion(reportId);
                  }
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`transform transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    }`}>
                      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {report.date}
                        {'tempId' in report && <span className="ml-2 text-xs text-blue-600">(temporal)</span>}
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

                  {/* Menú de acciones */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReport(report);
                        }}
                      >
                        Eliminar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSumClick(reportId, report);
                        }}
                      >
                        Sumar reportes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(report)
                        }}
                      >
                        Exportar reporte
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <svg 
                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
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
              {isExpanded && (
                <div className="px-4 py-4 border-t animate-fadeIn">
                  {/* Campo de búsqueda */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(reportId, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
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
                        {filteredSales.length > 0 ? (
                          filteredSales.map((item, itemIndex) => (
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                              No se encontraron productos que coincidan con la búsqueda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={4} className="px-4 py-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700">
                                Productos: {totalProducts} | Unidades: {totalUnits}
                              </span>
                              <span className="font-medium text-gray-700">
                                Subtotal del día: <span className="font-bold text-green-600 text-lg">${report.grandTotal.toFixed(2)}</span>
                              </span>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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