
import { createContext, useEffect, useReducer, type ReactNode } from "react";

const LOCAL_STORAGE_REPORTS_KEY = 'reports_data';

// ============ INTERFACES ============
export interface SummaryItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export type ReportType = "temp" | "daily";

export interface Report {
  reportId: string;
  dailySales: SummaryItem[];
  grandTotal: number;
  type: ReportType;
  date: string;
}

export interface TempReport extends Report {
  tempId: string;
}

interface BackupData {
  exportType?: string;       
  exportedAt?: string;       
  key: string;               
  data: Report;       
}

// ============ CONTEXT TYPE ============
export interface ReportsContextType {
  // State
  reports: Report[];
  tempReports: TempReport[];
  loading: boolean;
  sumFirstReport: { id: string; report: Report } | null;
  
  // Actions
  loadReports: () => Promise<void>;
  saveReport: (report: Report) => void;
  deleteReport: (report: Report | TempReport) => void;
  addTempReport: (report: Report) => void;
  removeTempReport: (tempId: string) => void;
  setSumFirstReport: (value: { id: string; report: Report } | null) => void;
  combineReports: (reportA: Report, reportB: Report) => Report;
  clearAllTempReports: () => void;
  exportAndDownloadReports: (reportToExport: Report) => Promise<boolean>;
  importReportsFromFile: () => Promise<boolean>;
}

// ============ STATE ============
interface ReportsState {
  reports: Report[];
  tempReports: TempReport[];
  loading: boolean;
  sumFirstReport: { id: string; report: Report } | null;
}

// ============ ACTIONS ============
type ReportsAction =
  | { type: 'LOAD_REPORTS_START' }
  | { type: 'LOAD_REPORTS_SUCCESS'; payload: Report[] }
  | { type: 'LOAD_REPORTS_FAILURE' }
  | { type: 'SAVE_REPORT'; payload: Report }
  | { type: 'DELETE_REPORT'; payload: Report | TempReport }
  | { type: 'ADD_TEMP_REPORT'; payload: Report }
  | { type: 'REMOVE_TEMP_REPORT'; payload: string }
  | { type: 'SET_SUM_FIRST_REPORT'; payload: { id: string; report: Report } | null }
  | { type: 'CLEAR_ALL_TEMP_REPORTS' }
  | { type: 'EXPORT_REPORTS' }
  | { type: 'IMPORT_REPORTS'; payload: Report };

// ============ PROPS ============
interface ReportsProviderProps {
  children: ReactNode;
}

// ============ CONTEXT ============
const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// ============ FUNCIONES DE UTILIDAD ============
const loadReportsFromStorage = (): Report[] => {
  try {
    const savedReportsString = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    return savedReportsString ? JSON.parse(savedReportsString) : [];
  } catch (error) {
    console.error('Error loading reports from localStorage:', error);
    return [];
  }
};

const saveReportsToStorage = (reports: Report[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error('Error saving reports to localStorage:', error);
  }
};

const isValidBackup = (data:unknown,expectedKey: string): data is BackupData =>{
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
        
  // Validar que tenga la clave correcta y que contenga data
  if (obj.key !== expectedKey || !obj.data) {
    return false;
  }

  return true;
}

// Función de validación para SummaryItem
const isValidSummaryItem = (item: unknown): item is SummaryItem => {
  if (!item || typeof item !== 'object') return false;
  
  const s = item as Partial<SummaryItem>;
  
  return (
    typeof s.productId === 'number' &&
    typeof s.productName === 'string' &&
    typeof s.quantity === 'number' &&
    typeof s.price === 'number' &&
    typeof s.total === 'number'
  );
};

// Función principal de validación
const isValidReport = (obj: unknown): obj is Report => {
  if (!obj || typeof obj !== 'object') return false;
  
  const p = obj as Partial<Report>;
  console.log("Valid tipo")
  // Validar propiedades principales
  if (
    typeof p.reportId !== 'string' ||
    !Array.isArray(p.dailySales) ||
    typeof p.grandTotal !== 'number' ||
    (p.type !== 'temp' && p.type !== 'daily') ||
    typeof p.date !== 'string'
  ) {
    return false;
  }
  console.log("Valid propiedades principales")
  // Validar cada item en dailySales
  return p.dailySales.every((item: unknown): item is SummaryItem => 
    isValidSummaryItem(item)
  );
};

// ============ INITIAL STATE ============
const initialReportsState: ReportsState = {
  reports: [],
  tempReports: [],
  loading: true,
  sumFirstReport: null
};

// ============ REDUCER ============
function reportsReducer(state: ReportsState, action: ReportsAction): ReportsState {
  switch (action.type) {
    case 'LOAD_REPORTS_START':
      return { ...state, loading: true };

    case 'LOAD_REPORTS_SUCCESS':
      return {
        ...state,
        reports: action.payload,
        loading: false
      };

    case 'LOAD_REPORTS_FAILURE':
      return {
        ...state,
        loading: false
      };

    case 'SAVE_REPORT': {
      // Filtrar reportes existentes con la misma fecha para evitar duplicados
      const reportsWithoutToday = state.reports.filter(r => r.date !== action.payload.date);
      // Agregar el nuevo reporte y ordenar por fecha (más reciente primero)
      const newReports = [...reportsWithoutToday, action.payload].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Guardar en localStorage
      saveReportsToStorage(newReports);
      
      return {
        ...state,
        reports: newReports
      };
    }

    case 'DELETE_REPORT': {
      const reportToDelete = action.payload;
      
      if ('tempId' in reportToDelete) {
        // Eliminar reporte temporal
        return {
          ...state,
          tempReports: state.tempReports.filter(r => r.tempId !== reportToDelete.tempId)
        };
      } else {
        // Eliminar reporte permanente
        const newReports = state.reports.filter(r => r.reportId !== reportToDelete.reportId);
        saveReportsToStorage(newReports);
        return {
          ...state,
          reports: newReports
        };
      }
    }

    case 'ADD_TEMP_REPORT': {
      const tempReport: TempReport = {
        ...action.payload,
        tempId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random(),
      };
      return {
        ...state,
        tempReports: [...state.tempReports, tempReport]
      };
    }

    case 'REMOVE_TEMP_REPORT':
      return {
        ...state,
        tempReports: state.tempReports.filter(r => r.tempId !== action.payload)
      };

    case 'SET_SUM_FIRST_REPORT':
      return {
        ...state,
        sumFirstReport: action.payload
      };

    case 'CLEAR_ALL_TEMP_REPORTS':
      return {
        ...state,
        tempReports: []
      };

    case 'IMPORT_REPORTS': {
      // Combinar reportes importados con los existentes, evitando duplicados por reportId
      const existingIds = new Set(state.reports.map(r => r.reportId));
      const isDuplicated = existingIds.has(action.payload.reportId)

      if(isDuplicated){
        return {
        ...state,
        reports: state.reports
      };
      }

      const newUniqueReport = action.payload
      const mergedReports = [...state.reports, newUniqueReport].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      saveReportsToStorage(mergedReports);

      return {
        ...state,
        reports: mergedReports
      };
    }

    case 'EXPORT_REPORTS':
      return state

    default:
      return state;
  }
}

// ============ PROVIDER ============
export function ReportsProvider({ children }: ReportsProviderProps) {
  const [state, dispatch] = useReducer(reportsReducer, initialReportsState);

  // Cargar reportes al iniciar
  const loadReports = async (): Promise<void> => {
    dispatch({ type: 'LOAD_REPORTS_START' });
    try {
      const savedReports = loadReportsFromStorage();
      dispatch({ type: 'LOAD_REPORTS_SUCCESS', payload: savedReports });
    } catch (error) {
      console.error('Error loading reports:', error);
      dispatch({ type: 'LOAD_REPORTS_FAILURE' });
    }
  };

  // Guardar un reporte permanente
  const saveReport = (report: Report): void => {
    dispatch({ type: 'SAVE_REPORT', payload: report });
  };

  // Eliminar un reporte (permanente o temporal)
  const deleteReport = (report: Report | TempReport): void => {
    if (!('tempId' in report)) {
      if (!window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) return;
    }
    dispatch({ type: 'DELETE_REPORT', payload: report });
  };

  // Agregar un reporte temporal
  const addTempReport = (report: Report): void => {
    dispatch({ type: 'ADD_TEMP_REPORT', payload: report });
  };

  // Eliminar un reporte temporal por su ID
  const removeTempReport = (tempId: string): void => {
    dispatch({ type: 'REMOVE_TEMP_REPORT', payload: tempId });
  };

  // Establecer el primer reporte para suma
  const setSumFirstReport = (value: { id: string; report: Report } | null): void => {
    dispatch({ type: 'SET_SUM_FIRST_REPORT', payload: value });
  };

  // Limpiar todos los reportes temporales
  const clearAllTempReports = (): void => {
    dispatch({ type: 'CLEAR_ALL_TEMP_REPORTS' });
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
      } else {
        productMap.set(item.productId, { ...item });
      }
    };

    reportA.dailySales.forEach(addItem);
    reportB.dailySales.forEach(addItem);

    const combinedSales = Array.from(productMap.values());
    const grandTotal = combinedSales.reduce((sum, item) => sum + item.total, 0);

    return {
      reportId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      dailySales: combinedSales,
      grandTotal,
      type: 'temp',
      date: newDate,
    };
  };

  // ============ NUEVAS FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN ============

  // Exportar y descargar reportes como archivo JSON
  const exportAndDownloadReports = async (reportToExport: Report, filename?: string): Promise<boolean> => {
  try {
    const exportData: BackupData = {
      exportType: 'reports_backup',
      exportedAt: new Date().toISOString(),
      key: 'reports_data',
      data: reportToExport,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `reporte_export_${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    dispatch({ type: 'EXPORT_REPORTS' });
    
    //toast.success('Reporte exportado exitosamente');
    return true;
    
  } catch (error) {
    console.error('Error exporting reports:', error);
    //toast.error(error instanceof Error ? error.message : 'Error al exportar los reportes');
    return false;
  }
};

  // Importar reportes desde un archivo
  const importReportsFromFile = () : Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';

      fileInput.onchange = async (event: Event) => {
        try {
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];
          
          if (!file) {
            //toast.warning('No se seleccionó ningún archivo');
            resolve(false);
            return;
          }

          const reader = new FileReader();
          
          reader.onload = (event: ProgressEvent<FileReader>) => {
            try {
              const jsonString = event.target?.result as string;
              const parsedData: unknown = JSON.parse(jsonString);

              if (!isValidBackup(parsedData, LOCAL_STORAGE_REPORTS_KEY)) {
                throw new Error('Archivo no válido. Debe ser un backup de reports_data.');
              }
              
              const reportData = parsedData as BackupData;
              console.log("ReportData.data: ",reportData.data)
              if (!isValidReport(reportData.data)) {
                throw new Error('El formato del reporte no es válido');
              }

              dispatch({ type: 'IMPORT_REPORTS', payload: reportData.data });
              
              //toast.success('Reporte importado exitosamente');
              resolve(true);
              
            } catch (error) {
              console.error('Error procesando el archivo:', error);
              //toast.error(error instanceof Error ? error.message : 'Error al importar el reporte');
              resolve(false);
            }
          };

          reader.onerror = () => {
            //toast.error('Error al leer el archivo');
            resolve(false);
          };

          reader.readAsText(file);
          
        } catch (error) {
          console.error('Error en importReportsFromFile:', error);
          //toast.error('Error al importar el reporte');
          resolve(false);
        }
      };

      fileInput.oncancel = () => {
        resolve(false);
      };

      fileInput.click();

    } catch (error) {
      console.error('Error creando input file:', error);
      //toast.error('Error al preparar la importación');
      // Si falla la creación del input, resolvemos con false
      resolve(false);
    }
  });
};

  // Cargar reportes al montar el componente
  useEffect(() => {
    loadReports();
  }, []);

  const contextValue: ReportsContextType = {
    // State
    reports: state.reports,
    tempReports: state.tempReports,
    loading: state.loading,
    sumFirstReport: state.sumFirstReport,
    
    // Actions
    loadReports,
    saveReport,
    deleteReport,
    addTempReport,
    removeTempReport,
    setSumFirstReport,
    combineReports,
    clearAllTempReports,
    exportAndDownloadReports,
    importReportsFromFile,
  };

  return (
    <ReportsContext.Provider value={contextValue}>
      {children}
    </ReportsContext.Provider>
  );
}

export default ReportsContext;