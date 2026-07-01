/* ============================================
   Toast Notification Component
   Beautiful animated toast system
   ============================================ */
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore, type Toast } from '@/stores/uiStore';
import './Toast.css';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastItem({ toast }: { toast: Toast }) {
  const [isExiting, setIsExiting] = useState(false);
  const { removeToast } = useUIStore();
  const Icon = icons[toast.type];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => removeToast(toast.id), 300);
    }, (toast.duration || 4000) - 300);
    return () => clearTimeout(timer);
  }, [toast, removeToast]);

  return (
    <div className={`toast toast-${toast.type} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-icon">
        <Icon size={18} />
      </div>
      <div className="toast-content">
        <p className="toast-title">{toast.title}</p>
        {toast.message && <p className="toast-message">{toast.message}</p>}
      </div>
      <button className="toast-close" onClick={handleClose}>
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useUIStore();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
