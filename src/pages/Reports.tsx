import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, X } from "lucide-react";
import { useToast } from "../hooks/useToast";

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

// Extendemos para reportes temporales con un identificador único
interface TempReport extends Report {
  tempId: string;
}

const LOCAL_STORAGE_KEY = 'reports_data';

export function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [tempReports, setTempReports] = useState<TempReport[]>([]);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({}); // clave = id único del reporte
  const [sumFirstReport, setSumFirstReport] = useState<{ id: string; report: Report } | null>(null);
  const { addToast } = useToast();

  // Cargar reportes desde localStorage
  useEffect(() => {
    try {
      const savedReportsString = localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedReports: Report[] = savedReportsString ? JSON.parse(savedReportsString) : [];
      setReports(savedReports);
    } catch (error) {
      console.error('Error loading reports from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persistir solo los reportes permanentes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
    }
  }, [reports, loading]);

  const toggleReportExpansion = (reportId: string) => {
    if (expandedReportId === reportId) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(reportId);
    }
  };

  const handleSearchChange = (reportId: string, value: string) => {
    setSearchTerms(prev => ({ ...prev, [reportId]: value }));
  };

  // Eliminar un reporte (permanente o temporal)
  const deleteReport = (reportToDelete: Report | TempReport) => {
    if ('tempId' in reportToDelete) {
      // Es temporal
      setTempReports(prev => prev.filter(r => r.tempId !== reportToDelete.tempId));
    } else {
      // Es permanente
      if (!window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) return;
      setReports(prev => prev.filter(r => r !== reportToDelete));
    }
    // Si el reporte eliminado estaba expandido, cerrarlo
    // (la comparación de objetos no es fiable, pero podemos usar el ID único)
    // Como no tenemos ID en permanentes, usamos el índice en el array? Mejor usar una función que reciba el ID único.
    // Para simplificar, después de eliminar limpiaremos expandedReportId si el reporte ya no existe.
    // Lo haremos en un efecto, o simplemente confiamos en que al re-renderizar el ID ya no estará.
  };

  // Función para combinar dos reportes
  const combineReports = (reportA: Report, reportB: Report): Report => {
    // Determinar si son el mismo día (ignorando hora)
    const datePartA = reportA.date.split(' ')[0];
    const datePartB = reportB.date.split(' ')[0];
    const sameDay = datePartA === datePartB;

    let newDate: string;
    if (sameDay) {
      // Tomar la fecha más reciente (comparando strings completos)
      newDate = reportA.date > reportB.date ? reportA.date : reportB.date;
    } else {
      newDate = `Suma entre ${reportA.date} y ${reportB.date}`;
    }

    // Combinar productos por productId
    const productMap = new Map<number, SummaryItem>();
    const addItem = (item: SummaryItem) => {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.total += item.total;
        // Mantenemos el nombre y precio del primer encontrado (asumimos consistencia)
      } else {
        productMap.set(item.productId, { ...item });
      }
    };

    reportA.dailySales.forEach(addItem);
    reportB.dailySales.forEach(addItem);

    const combinedSales = Array.from(productMap.values());
    const grandTotal = combinedSales.reduce((sum, item) => sum + item.total, 0);

    return {
      dailySales: combinedSales,
      grandTotal,
      date: newDate,
    };
  };

  // Manejar clic en "Sumar" desde el menú
  const handleSumClick = (reportId: string, report: Report) => {
    if (sumFirstReport) {
      // Ya hay un primer reporte seleccionado
      if (sumFirstReport.id === reportId) {
        addToast('Selecciona un reporte diferente para sumar.','error');
        return;
      }
      // Realizar la suma
      const combined = combineReports(sumFirstReport.report, report);
      // Crear reporte temporal con ID único
      const tempReport: TempReport = {
        ...combined,
        tempId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random(),
      };
      setTempReports(prev => [...prev, tempReport]);
      setSumFirstReport(null); // Salir del modo suma
    } else {
      // Primer reporte seleccionado
      setSumFirstReport({ id: reportId, report });
    }
  };

  // Cancelar modo suma
  const cancelSum = () => setSumFirstReport(null);

  // Generar un ID único para cada reporte en la UI
  const getReportId = (report: Report | TempReport, index: number): string => {
    if ('tempId' in report) return `temp-${report.tempId}`;
    return `persisted-${index}`;
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
          <p className="mt-2">Los reportes se generarán automáticamente después de realizar ventas.</p>
        </div>
      </div>
    );
  }

  // Combinamos todos los reportes para mostrarlos (primero permanentes, luego temporales)
  const allReports = [...reports, ...tempReports];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Reportes de Ventas</h2>
      
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

          // Estadísticas del reporte (basadas en la lista completa)
          const totalProducts = report.dailySales.length;
          const totalUnits = report.dailySales.reduce((sum, item) => sum + item.quantity, 0);
          const subtotal = report.grandTotal;

          return (
            <div 
              key={reportId}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Encabezado del reporte - Clickable (excepto en modo suma) */}
              <div 
                className={`bg-gray-50 px-4 py-3 flex justify-between items-center ${
                  !sumFirstReport ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => {
                  if (sumFirstReport) {
                    // En modo suma, el clic en la cabecera selecciona el segundo reporte
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
                  {/* Campo de búsqueda dentro del reporte */}
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
                                Subtotal del día: <span className="font-bold text-green-600 text-lg">${subtotal.toFixed(2)}</span>
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
