"use client";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text, 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <div className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full`}></div>
          <div className={`${sizeClasses[size]} border-2 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
        </div>
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
}

// 内联加载指示器（用于按钮内部）
export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
  );
}

// 全屏加载遮罩
export function FullScreenLoader({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}
