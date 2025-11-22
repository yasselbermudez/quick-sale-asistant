import type { ReactNode } from "react";

interface Props{
    isOpen:boolean,
    onClose: ()=>void,
    title:string,
    children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }:Props) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center modal-overlay">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 modal-content">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}