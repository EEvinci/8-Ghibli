"use client";
import { useState, useEffect } from 'react';

export interface ErrorInfo {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  code?: string;
  details?: string;
  timestamp?: Date;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface EnhancedErrorAlertProps {
  errors: ErrorInfo[];
  onDismiss?: (index: number) => void;
  onDismissAll?: () => void;
  maxErrors?: number;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  className?: string;
}

export default function EnhancedErrorAlert({
  errors,
  onDismiss,
  onDismissAll,
  maxErrors = 5,
  autoDismiss = false,
  autoDismissDelay = 5000,
  position = 'top-right',
  className = ''
}: EnhancedErrorAlertProps) {
  const [visibleErrors, setVisibleErrors] = useState<(ErrorInfo & { id: string; isVisible: boolean })[]>([]);

  // 处理错误变化
  useEffect(() => {
    const newErrors = errors.slice(0, maxErrors).map((error, index) => ({
      ...error,
      id: `${Date.now()}_${index}`,
      isVisible: true,
      timestamp: error.timestamp || new Date()
    }));

    setVisibleErrors(newErrors);

    // 自动消失
    if (autoDismiss && newErrors.length > 0) {
      const timers = newErrors.map((error, index) => 
        setTimeout(() => {
          handleDismiss(index);
        }, autoDismissDelay)
      );

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [errors, maxErrors, autoDismiss, autoDismissDelay]);

  const handleDismiss = (index: number) => {
    setVisibleErrors(prev => 
      prev.map((error, i) => 
        i === index ? { ...error, isVisible: false } : error
      )
    );

    // 延迟移除，等待动画完成
    setTimeout(() => {
      onDismiss?.(index);
    }, 300);
  };

  const handleDismissAll = () => {
    setVisibleErrors(prev => 
      prev.map(error => ({ ...error, isVisible: false }))
    );

    setTimeout(() => {
      onDismissAll?.();
    }, 300);
  };

  const getTypeStyles = (type: ErrorInfo['type'] = 'error') => {
    const styles = {
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-400',
        iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: 'text-yellow-400',
        iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-400',
        iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-400',
        iconPath: 'M5 13l4 4L19 7'
      }
    };
    return styles[type];
  };

  const getPositionStyles = () => {
    const positions = {
      'top-right': 'fixed top-4 right-4 z-50',
      'top-left': 'fixed top-4 left-4 z-50',
      'bottom-right': 'fixed bottom-4 right-4 z-50',
      'bottom-left': 'fixed bottom-4 left-4 z-50',
      'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50'
    };
    return positions[position];
  };

  if (visibleErrors.length === 0) return null;

  return (
    <div className={`${getPositionStyles()} ${className}`}>
      <div className="w-full max-w-sm space-y-2">
        {/* 批量操作 */}
        {visibleErrors.length > 1 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={handleDismissAll}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              全部关闭
            </button>
          </div>
        )}

        {/* 错误列表 */}
        {visibleErrors.map((error, index) => {
          const styles = getTypeStyles(error.type);
          
          return (
            <div
              key={error.id}
              className={`
                border rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out
                ${styles.bg} ${styles.border}
                ${error.isVisible 
                  ? 'opacity-100 translate-x-0 scale-100' 
                  : 'opacity-0 translate-x-full scale-95'
                }
              `}
            >
              <div className="flex items-start">
                {/* 图标 */}
                <div className="flex-shrink-0">
                  <svg 
                    className={`h-5 w-5 ${styles.icon}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d={styles.iconPath}
                    />
                  </svg>
                </div>

                {/* 内容 */}
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-medium ${styles.text}`}>
                      {error.message}
                    </h3>
                    <button
                      onClick={() => handleDismiss(index)}
                      className={`ml-2 flex-shrink-0 ${styles.text} hover:opacity-75`}
                    >
                      <span className="sr-only">关闭</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* 详细信息 */}
                  {error.details && (
                    <p className={`mt-1 text-xs ${styles.text} opacity-75`}>
                      {error.details}
                    </p>
                  )}

                  {/* 错误代码 */}
                  {error.code && (
                    <p className={`mt-1 text-xs ${styles.text} opacity-50 font-mono`}>
                      错误代码: {error.code}
                    </p>
                  )}

                  {/* 时间戳 */}
                  {error.timestamp && (
                    <p className={`mt-1 text-xs ${styles.text} opacity-50`}>
                      {error.timestamp.toLocaleTimeString()}
                    </p>
                  )}

                  {/* 操作按钮 */}
                  {error.action && (
                    <div className="mt-3">
                      <button
                        onClick={error.action.handler}
                        className={`
                          text-xs px-3 py-1 rounded-md font-medium
                          ${error.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                          ${error.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}
                          ${error.type === 'info' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                          ${error.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                        `}
                      >
                        {error.action.label}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* 更多错误提示 */}
        {errors.length > maxErrors && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              还有 {errors.length - maxErrors} 个错误未显示
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 错误管理Hook
export function useErrorManager() {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const addError = (error: ErrorInfo) => {
    setErrors(prev => [...prev, { ...error, timestamp: new Date() }]);
  };

  const addErrors = (newErrors: ErrorInfo[]) => {
    const timestampedErrors = newErrors.map(error => ({
      ...error,
      timestamp: new Date()
    }));
    setErrors(prev => [...prev, ...timestampedErrors]);
  };

  const removeError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const hasErrors = errors.length > 0;
  const errorCount = errors.length;

  return {
    errors,
    addError,
    addErrors,
    removeError,
    clearErrors,
    hasErrors,
    errorCount
  };
}


