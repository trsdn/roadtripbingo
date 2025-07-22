import React, { useState, useEffect, createContext, useContext } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = { id, ...notification };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);
    
    return id;
  };
  
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const showSuccess = (message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  };
  
  const showError = (message, options = {}) => {
    return addNotification({ type: 'error', message, duration: 8000, ...options });
  };
  
  const showWarning = (message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  };
  
  const showInfo = (message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  };
  
  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function Notification({ notification, onClose }) {
  const { type, message, title } = notification;
  
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  const icons = {
    success: FaCheckCircle,
    error: FaTimesCircle,
    warning: FaExclamationCircle,
    info: FaInfoCircle
  };
  
  const Icon = icons[type];
  
  return (
    <div className={`p-4 rounded-lg border shadow-sm ${typeStyles[type]} animate-slideIn`}>
      <div className="flex">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="ml-3 flex-1">
          {title && (
            <h4 className="text-sm font-medium mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <IoMdClose className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}