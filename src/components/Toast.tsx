import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100/50',
    error: 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100/50',
    info: 'bg-cyan-50 border-cyan-200 text-cyan-800 shadow-cyan-100/50',
  };

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  }[toast.type];

  const iconColor = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    info: 'text-cyan-500',
  }[toast.type];

  return (
    <div className="fixed top-6 right-6 z-50 animate-bounce-short max-w-sm w-full">
      <div className={`glass-card p-4 rounded-2xl border flex items-start gap-3 shadow-xl ${bgStyles[toast.type]}`}>
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
        <div className="flex-1">
          <p className="text-sm font-semibold leading-5">{toast.text}</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100/50 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
