import { DailySummary } from '../components/sales/DailySummary';
import { QuickSalePanel } from '../components/sales/QuickSalePanel';
import { SalesList } from '../components/sales/SalesList';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <QuickSalePanel />
      <SalesList />
      <DailySummary />
    </div>
  );
}