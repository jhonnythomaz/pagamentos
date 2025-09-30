import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, CloseIcon } from './Icons';

interface ToastProps {
  message: ToastMessage;
  onDismiss: (id: number) => void;
}

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-success" />,
  error: <ExclamationCircleIcon className="w-6 h-6 text-danger" />,
  info: <InformationCircleIcon className="w-6 h-6 text-primary" />,
};

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(message.id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [message.id, onDismiss]);

  return (
    <div className="bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-fade-in-right w-full max-w-sm">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[message.type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-slate-900">{message.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onDismiss(message.id)}
              className="bg-white rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="sr-only">Close</span>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
