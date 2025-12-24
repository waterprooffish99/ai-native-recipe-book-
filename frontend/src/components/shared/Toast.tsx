import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
  visible?: boolean;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  visible = true
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(visible);
  const [isExiting, setIsExiting] = useState(false);

  // Determine toast styling based on type
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-gray-800'
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Match CSS transition duration
  };

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`max-w-md p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      } ${typeStyles[type]}`}
    >
      <div className="flex items-start">
        <span className="mr-2 font-bold text-lg" aria-hidden="true">
          {typeIcons[type]}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white focus:rounded"
          aria-label={t('common.aria.closeToast', 'Close notification')}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;