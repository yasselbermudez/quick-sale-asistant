import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast";
import { useNavigate,Link } from 'react-router-dom';
import { useAuth } from "../../hooks/useAuth";

 export  function RegisterForm() {
      const [name, setName] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const { register, isLoading, error, clearError } = useAuth();
      const { addToast } = useToast();
      const navigate = useNavigate();
      
      useEffect(() => {
        return () => clearError();
      }, []);
      
      const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!name || !email || !password || !confirmPassword) {
          addToast('Por favor complete todos los campos', 'error');
          return;
        }
        
        if (password !== confirmPassword) {
          addToast('Las contraseñas no coinciden', 'error');
          return;
        }
        
        const success = await register(name, email, password);
        
        if (success) {
          addToast('Registro exitoso. Ahora puede iniciar sesión.');
          navigate('/login');
        }
      };
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Crear Cuenta
              </h2>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle text-red-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="name" className="sr-only">Nombre Completo</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Nombre Completo"
                  />
                </div>
                <div>
                  <label htmlFor="email-address" className="sr-only">Correo electrónico</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Correo electrónico"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Contraseña</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Contraseña"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="sr-only">Confirmar Contraseña</label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirmar Contraseña"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                >
                  {isLoading ? (
                    <div className="spinner mr-2"></div>
                  ) : (
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <i className="fas fa-user-plus"></i>
                    </span>
                  )}
                  {isLoading ? 'Registrando...' : 'Registrarse'}
                </button>
              </div>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
                  ¿Ya tienes una cuenta? Iniciar sesión
                </Link>
              </div>
            </form>
          </div>
        </div>
      );
    }

export  function LoginForm() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const { login, isLoading, error, clearError } = useAuth();
      const { addToast } = useToast();
      const navigate = useNavigate();
      
      useEffect(() => {
        return () => clearError();
      }, []);
      
      const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!email || !password) {
          addToast('Por favor complete todos los campos', 'error');
          return;
        }
        
        const success = await login(email, password);
        
        if (success) {
          addToast('Inicio de sesión exitoso');
          navigate('/dashboard');
        }
      };
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Iniciar Sesión
              </h2>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle text-red-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">Correo electrónico</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Correo electrónico"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Contraseña</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Contraseña"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                >
                  {isLoading ? (
                    <div className="spinner mr-2"></div>
                  ) : (
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <i className="fas fa-sign-in-alt"></i>
                    </span>
                  )}
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </div>
              
              <div className="text-center">
                <Link to="/register" className="text-sm text-blue-600 hover:text-blue-500">
                  ¿No tienes una cuenta? Regístrate
                </Link>
              </div>
            </form>
          </div>
        </div>
      );
    }
    