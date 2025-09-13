"use client";
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface UploadStatusProps {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  uploadedFileData?: {
    fileName: string;
    originalName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    uploadedAt: string;
  };
  onRetry?: () => void;
  onCancel?: () => void;
}

export default function UploadStatus({
  isUploading,
  progress,
  error,
  success,
  uploadedFileData,
  onRetry,
  onCancel
}: UploadStatusProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // 平滑的进度条动画
  useEffect(() => {
    if (isUploading) {
      const timer = setInterval(() => {
        setDisplayProgress(prev => {
          const diff = progress - prev;
          if (Math.abs(diff) < 0.5) return progress;
          return prev + diff * 0.1;
        });
      }, 16); // 60fps

      return () => clearInterval(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, isUploading]);

  if (!isUploading && !error && !success) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* 上传状态标题 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isUploading && '正在上传...'}
            {error && '上传失败'}
            {success && '上传成功'}
          </h3>
          
          {isUploading && onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              取消上传
            </button>
          )}
        </div>

        {/* 进度条 */}
        {isUploading && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>上传进度</span>
              <span>{Math.round(displayProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 成功状态 */}
        {success && uploadedFileData && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-green-600">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">文件上传成功！</p>
                <p className="text-xs text-gray-500">您的图片已准备就绪，可以进行风格转换。</p>
              </div>
            </div>

            {/* 文件详情 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">文件信息</h4>
              <div className="text-xs text-green-700 space-y-1">
                <p><span className="font-medium">原始文件名:</span> {uploadedFileData.originalName}</p>
                <p><span className="font-medium">文件大小:</span> {(uploadedFileData.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                <p><span className="font-medium">文件类型:</span> {uploadedFileData.fileType}</p>
                <p><span className="font-medium">上传时间:</span> {new Date(uploadedFileData.uploadedAt).toLocaleString()}</p>
                <p><span className="font-medium">文件URL:</span> 
                  <a 
                    href={uploadedFileData.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline ml-1"
                  >
                    查看文件
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">上传失败</p>
                <p className="text-xs text-gray-500">{error}</p>
              </div>
            </div>
            
            {onRetry && (
              <div className="flex space-x-3">
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  重试上传
                </button>
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    取消
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 上传详情 */}
        {isUploading && (
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>正在处理您的图片...</span>
              <span>{Math.round(displayProgress)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

