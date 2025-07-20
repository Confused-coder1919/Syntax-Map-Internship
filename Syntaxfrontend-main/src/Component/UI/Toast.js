import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * ToastProvider component for app-wide toast notifications
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - App content
 * @param {string} props.position - Toast position (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right)
 */
export const ToastProvider = ({ 
  children, 
  position = "top-right" 
}) => {
  return (
    <>
      {children}
      <Toaster
        position={position}
        toastOptions={{
          duration: 5000,
          style: {
            borderRadius: '0.5rem',
            padding: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
    </>
  );
};

// Toast types with icons
const TOAST_TYPES = {
  success: {
    icon: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />,
    style: { backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981' },
  },
  error: {
    icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
    style: { backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444' },
  },
  warning: {
    icon: <ExclamationCircleIcon className="w-5 h-5 text-amber-500" />,
    style: { backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b' },
  },
  info: {
    icon: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
    style: { backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6' },
  },
};

/**
 * Toast notification utility functions
 */
export const Toast = {
  /**
   * Show a success toast notification
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   */
  success: (message, options = {}) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } flex items-center p-4 min-w-[300px] max-w-md bg-white rounded-lg shadow-lg`}
          style={TOAST_TYPES.success.style}
        >
          <div className="mr-3">
            {TOAST_TYPES.success.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ),
      options
    );
  },

  /**
   * Show an error toast notification
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   */
  error: (message, options = {}) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } flex items-center p-4 min-w-[300px] max-w-md bg-white rounded-lg shadow-lg`}
          style={TOAST_TYPES.error.style}
        >
          <div className="mr-3">
            {TOAST_TYPES.error.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ),
      options
    );
  },

  /**
   * Show a warning toast notification
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   */
  warning: (message, options = {}) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } flex items-center p-4 min-w-[300px] max-w-md bg-white rounded-lg shadow-lg`}
          style={TOAST_TYPES.warning.style}
        >
          <div className="mr-3">
            {TOAST_TYPES.warning.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ),
      options
    );
  },

  /**
   * Show an info toast notification
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   */
  info: (message, options = {}) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } flex items-center p-4 min-w-[300px] max-w-md bg-white rounded-lg shadow-lg`}
          style={TOAST_TYPES.info.style}
        >
          <div className="mr-3">
            {TOAST_TYPES.info.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ),
      options
    );
  },

  /**
   * Show a custom toast notification
   * @param {React.ReactNode} content - Custom toast content
   * @param {Object} options - Toast options
   */
  custom: (content, options = {}) => {
    toast.custom(content, options);
  },

  /**
   * Dismiss all toast notifications
   */
  dismiss: () => {
    toast.dismiss();
  },
};

export default Toast;