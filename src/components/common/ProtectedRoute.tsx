import { useEffect, type ReactNode } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps{
  children:ReactNode
}

export  function ProtectedRoute({ children }:ProtectedRouteProps) {
      const { isAuthenticated, isLoading } = useAuth();
      const navigate = useNavigate();
    
      useEffect(() => {
        if (!isLoading && !isAuthenticated) {
          
          navigate('/login');
        }
      }, [isAuthenticated, isLoading,navigate]);
      
      if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }
      
      return isAuthenticated ? children : null;
    }