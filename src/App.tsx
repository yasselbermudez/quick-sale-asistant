import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { SalesProvider } from './contexts/SalesContext';
import { AppRouter } from './components/AppRouter';
import { ReportsProvider } from './contexts/ReportsContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ProductsProvider>
          <ReportsProvider>
            <SalesProvider>
              <AppRouter />
            </SalesProvider>
          </ReportsProvider>
        </ProductsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;