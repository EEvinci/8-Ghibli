"use client";
import { useState, useEffect } from 'react';

interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export default function ErrorAlert({ 
  error, 
  onDismiss, 
  type = 'error',
  autoDismiss = false,
  autoDismissDelay = 5000
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoDismiss) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onDismiss?.(), 300); // 等待动画完成
        }, autoDismissDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoDismiss, autoDismissDelay, onDismiss]);

  if (!error || !isVisible) {
    return null;
  }

  const typeStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconStyles = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  };

  const iconPaths = {
    error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  return (
    <div className={`
      border rounded-lg p-4 mb-4 transition-all duration-300 ease-in-out
      ${typeStyles[type]}
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className={`h-5 w-5 ${iconStyles[type]}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d={iconPaths[type]}
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{error}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onDismiss?.(), 300);
                }}
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${type === 'error' ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' : ''}
                  ${type === 'warning' ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600' : ''}
                  ${type === 'info' ? 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600' : ''}
                `}
              >
                <span className="sr-only">关闭</span>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
