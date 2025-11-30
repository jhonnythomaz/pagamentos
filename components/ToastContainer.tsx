import React from 'react';
// fix: Correct import path for ToastMessage type
import { ToastMessage } from '../types';
import Toast from './Toast';

interface ToastContainerProps {
  messages: ToastMessage[];
  onDismiss: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onDismiss }) => {
  return (
    <div className="fixed top-0 right-0 p-4 z-[100] space-y-3 flex flex-col items-end">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;
