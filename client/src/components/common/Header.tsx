import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function Header() {
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      
      const handleLogout = () => {
        logout();
        navigate('/login');
      };
      
      return (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Sistema de Ventas Rápidas
            </h1>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                <i className="fas fa-user-circle mr-2"></i>
                {user?.name || 'Usuario'}
              </span>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <i className="fas fa-sign-out-alt mr-1"></i>
                Salir
              </button>
            </div>
          </div>
        </header>
      );
    }