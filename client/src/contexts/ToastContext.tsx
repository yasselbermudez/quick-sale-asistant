import { createContext, useState, type ReactNode } from "react";

export interface ToastProviderProps {
  children: ReactNode;
}

export interface ToastContextType {
  addToast: (message: string, type?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface Toast{
  id:number,
  message:string,
  type:string,
}

export  function ToastProvider({ children }:ToastProviderProps) {
      const [toasts, setToasts] = useState<Toast[]>([]);
      
      const addToast = (message:string, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        
        setTimeout(() => {
          setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, duration);
      };
      
      return (
        <ToastContext.Provider value={{ addToast }}>
          {children}
          <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
            {toasts.map(toast => (
              <div 
                key={toast.id} 
                className={`p-3 rounded-md shadow-lg text-white fade-in ${
                  toast.type === 'success' ? 'bg-green-500' : 
                  toast.type === 'error' ? 'bg-red-500' : 
                  'bg-blue-500'
                }`}
              >
                {toast.message}
              </div>
            ))}
          </div>
        </ToastContext.Provider>
      );
}

export default ToastContext