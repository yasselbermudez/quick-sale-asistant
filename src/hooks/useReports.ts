import { useContext } from "react";
import ReportsContext, { type ReportsContextType } from "../contexts/ReportsContext";

export function useReports(): ReportsContextType {
  const context = useContext(ReportsContext);
  
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  
  return context;
}