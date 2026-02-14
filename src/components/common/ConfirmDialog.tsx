interface ConfirmDialoProps{
  isOpen:boolean,
  onClose:()=>void, 
  onConfirm:()=>void, 
  title:string, 
  message:string
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }:ConfirmDialoProps) {
      if (!isOpen) return null;
      
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 modal-content">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-2">{title}</h3>
              <p className="text-gray-600">{message}</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      );
    }