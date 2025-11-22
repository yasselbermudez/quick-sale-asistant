import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { SalesProvider } from './contexts/SalesContext';
import { AppRouter } from './components/AppRouter';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ProductsProvider>
          <SalesProvider>
            <AppRouter />
          </SalesProvider>
        </ProductsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;