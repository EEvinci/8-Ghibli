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
    error: 'bg-red-500/20 border-red-400/30 text-red-100',
    warning: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-100',
    info: 'bg-blue-500/20 border-blue-400/30 text-blue-100'
  };

  const iconStyles = {
    error: 'text-red-300',
    warning: 'text-yellow-300',
    info: 'text-blue-300'
  };

  const iconPaths = {
    error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  return (
    <div className={`
      glass border rounded-2xl p-6 mb-6 transition-all duration-300 ease-in-out backdrop-blur-md
      ${typeStyles[type]}
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            type === 'error' ? 'bg-red-500/20' : 
            type === 'warning' ? 'bg-yellow-500/20' : 
            'bg-blue-500/20'
          }`}>
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
        </div>
        <div className="ml-4 flex-1">
          <p className="text-base font-medium">{error}</p>
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
                  inline-flex rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm
                  ${type === 'error' ? 'text-red-300 hover:bg-red-500/20 focus:ring-red-400' : ''}
                  ${type === 'warning' ? 'text-yellow-300 hover:bg-yellow-500/20 focus:ring-yellow-400' : ''}
                  ${type === 'info' ? 'text-blue-300 hover:bg-blue-500/20 focus:ring-blue-400' : ''}
                `}
              >
                <span className="sr-only">关闭</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
