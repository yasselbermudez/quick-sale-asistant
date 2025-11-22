import { useState, type ReactNode } from "react";
import { useLocation,Link } from 'react-router-dom';
import { Header } from "../components/common/Header";

interface MainLayoutProps{
  children:ReactNode
}

export function MainLayout({ children }:MainLayoutProps) {
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const location = useLocation();
      
      // Navigation links
      const navigation = [
        { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' },
        { name: 'Productos', path: '/products', icon: 'fas fa-box' },
        { name: 'Reportes', path: '/reports', icon: 'fas fa-chart-bar' }
      ];
      
      return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
          {/* Mobile Sidebar */}
          <div
            className={`${
              mobileMenuOpen ? 'block' : 'hidden'
            } fixed inset-0 flex z-40 md:hidden`}
            role="dialog"
            aria-modal="true"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setMobileMenuOpen(false)}></div>
            
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <i className="fas fa-times text-white"></i>
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-xl font-bold text-gray-900">Sistema de Ventas</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`${
                        location.pathname === item.path
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <i className={`${item.icon} mr-4 text-gray-500`}></i>
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </div>
          
          {/* Desktop Sidebar */}
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
              <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                  <div className="flex items-center flex-shrink-0 px-4">
                    <h1 className="text-lg font-bold text-gray-900">Sistema de Ventas</h1>
                  </div>
                  <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`${
                          location.pathname === item.path
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        <i className={`${item.icon} mr-3 text-gray-500`}></i>
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col w-0 flex-1 overflow-hidden">
            {/* Top header */}
            <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
              <button
                type="button"
                className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
            
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              <Header />
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      );
    }