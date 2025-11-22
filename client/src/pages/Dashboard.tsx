import { DailySummary } from '../components/sales/DailySummary';
import { QuickSalePanel } from '../components/sales/QuickSalePanel';
import { SalesList } from '../components/sales/SalesList';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <QuickSalePanel />
      {

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesList />
        <DailySummary />
      </div>
        
      }
      
    </div>
  );
}