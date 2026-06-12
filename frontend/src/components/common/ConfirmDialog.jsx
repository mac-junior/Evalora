import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Delete', 
  type = 'danger' 
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      buttonBg: 'bg-rose-600 hover:bg-rose-700',
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
    },
  };

  const styles = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
            <AlertTriangle className={`w-5 h-5 ${styles.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors ${styles.buttonBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;