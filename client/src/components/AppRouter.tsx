import { useLocation } from 'react-router-dom';
import { LoginForm,RegisterForm } from './auth/AuthForm';
import { Dashboard } from '../pages/Dashboard';
import { Products } from '../pages/Products';
import { Reports } from '../pages/Reports';
import { MainLayout } from '../pages/Layout';
import { ProtectedRoute } from './common/ProtectedRoute';

export function AppRouter() {
  const location = useLocation();
  
  const renderContent = () => {
    switch (location.pathname) {
      case '/':
        return <LoginForm />;
      case '/login':
        return <LoginForm />;
      case '/register':
        return <RegisterForm />;
      case '/dashboard':
        return (
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        );
      case '/products':
        return (
          <ProtectedRoute>
            <MainLayout>
              <Products />
            </MainLayout>
          </ProtectedRoute>
        );
      case '/reports':
        return (
          <ProtectedRoute>
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        );
      default:
        return <div>404 - Página no encontrada</div>;
    }
  };
  
  return renderContent();
}