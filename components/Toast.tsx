import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'WARNING';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const styles = {
    SUCCESS: "bg-green-50 border-green-200 text-green-800",
    ERROR: "bg-red-50 border-red-200 text-red-800",
    WARNING: "bg-amber-50 border-amber-200 text-amber-800"
  };

  const icons = {
    SUCCESS: <CheckCircle className="h-5 w-5 text-green-500 mr-2" />,
    ERROR: <XCircle className="h-5 w-5 text-red-500 mr-2" />,
    WARNING: <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border animate-in slide-in-from-bottom-5 duration-300 ${styles[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium mr-4">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};