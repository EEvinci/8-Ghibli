"use client";
import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { uploadFile, validateFile as validateFileUtil, UploadResponse } from '../lib/upload';

interface FileUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  response?: UploadResponse;
  error?: string;
}

interface MultiFileUploadProps {
  onUploadComplete?: (responses: UploadResponse[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  allowMultiple?: boolean;
}

export default function MultiFileUpload({
  onUploadComplete,
  onError,
  maxFiles = 5,
  allowMultiple = true
}: MultiFileUploadProps) {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // 创建预览URL
  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // 验证文件
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    return validateFileUtil(file);
  };

  // 添加文件到列表
  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: FileUploadItem[] = [];
    
    for (const file of newFiles) {
      // 检查文件数量限制
      if (files.length + validFiles.length >= maxFiles) {
        onError?.(`最多只能上传 ${maxFiles} 个文件`);
        break;
      }

      // 验证文件
      const validation = validateFile(file);
      if (!validation.isValid) {
        onError?.(validation.error || '文件验证失败');
        continue;
      }

      // 检查是否已存在
      const exists = files.some(f => f.file.name === file.name && f.file.size === file.size);
      if (exists) {
        onError?.(`文件 "${file.name}" 已存在`);
        continue;
      }

      validFiles.push({
        id: generateId(),
        file,
        previewUrl: createPreviewUrl(file),
        status: 'pending',
        progress: 0
      });
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files, maxFiles, onError]);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // 清空input值，允许重复选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理拖拽事件
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  // 移除文件
  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // 上传单个文件
  const uploadSingleFile = async (fileItem: FileUploadItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      uploadFile(fileItem.file, (progress) => {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, progress: progress.percentage }
            : f
        ));
      }).then(response => {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'completed', progress: 100, response }
            : f
        ));
        resolve();
      }).catch(error => {
        const errorMessage = error instanceof Error ? error.message : '上传失败';
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error', error: errorMessage }
            : f
        ));
        reject(error);
      });
    });
  };

  // 上传所有文件
  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    const results: UploadResponse[] = [];

    try {
      // 并发上传（限制并发数）
      const concurrencyLimit = 3;
      for (let i = 0; i < pendingFiles.length; i += concurrencyLimit) {
        const batch = pendingFiles.slice(i, i + concurrencyLimit);
        const promises = batch.map(uploadSingleFile);
        
        try {
          await Promise.allSettled(promises);
        } catch (error) {
          console.error('批量上传错误:', error);
        }
      }

      // 收集成功的响应
      files.forEach(f => {
        if (f.status === 'completed' && f.response) {
          results.push(f.response);
        }
      });

      if (results.length > 0) {
        onUploadComplete?.(results);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '批量上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  // 重试失败的文件
  const retryFailedFiles = async () => {
    const failedFiles = files.filter(f => f.status === 'error');
    if (failedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const promises = failedFiles.map(uploadSingleFile);
      await Promise.allSettled(promises);
    } finally {
      setIsUploading(false);
    }
  };

  // 清空所有文件
  const clearAllFiles = () => {
    files.forEach(f => {
      if (f.previewUrl) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
    setFiles([]);
  };

  // 打开文件选择器
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 文件拖拽区域 */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${files.length > 0 ? 'border-green-500 bg-green-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={allowMultiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {files.length === 0 
                ? `点击选择图片或拖拽到此处${allowMultiple ? '（支持多选）' : ''}`
                : `已选择 ${files.length} 个文件`
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              支持 JPG、PNG、WebP 格式，单个文件最大 10MB，最多 {maxFiles} 个文件
            </p>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">文件列表 ({files.length})</h3>
            <div className="flex space-x-2">
              {pendingCount > 0 && (
                <button
                  onClick={uploadAllFiles}
                  disabled={isUploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {isUploading ? '上传中...' : `上传全部 (${pendingCount})`}
                </button>
              )}
              {errorCount > 0 && (
                <button
                  onClick={retryFailedFiles}
                  disabled={isUploading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  重试失败 ({errorCount})
                </button>
              )}
              <button
                onClick={clearAllFiles}
                disabled={isUploading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              >
                清空全部
              </button>
            </div>
          </div>

          {/* 统计信息 */}
          {(completedCount > 0 || errorCount > 0) && (
            <div className="mb-4 flex space-x-4 text-sm">
              {completedCount > 0 && (
                <span className="text-green-600">✅ 成功: {completedCount}</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600">❌ 失败: {errorCount}</span>
              )}
              {pendingCount > 0 && (
                <span className="text-gray-600">⏳ 待上传: {pendingCount}</span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((fileItem) => (
              <div key={fileItem.id} className="border rounded-lg p-4 space-y-3">
                {/* 预览图片 */}
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={fileItem.previewUrl}
                    alt={fileItem.file.name}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    disabled={fileItem.status === 'uploading'}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </div>

                {/* 文件信息 */}
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate" title={fileItem.file.name}>
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {/* 状态和进度 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      fileItem.status === 'pending' ? 'bg-gray-100 text-gray-600' :
                      fileItem.status === 'uploading' ? 'bg-blue-100 text-blue-600' :
                      fileItem.status === 'completed' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {fileItem.status === 'pending' ? '待上传' :
                       fileItem.status === 'uploading' ? '上传中' :
                       fileItem.status === 'completed' ? '已完成' :
                       '上传失败'}
                    </span>
                    {fileItem.status === 'uploading' && (
                      <span className="text-xs text-gray-500">
                        {Math.round(fileItem.progress)}%
                      </span>
                    )}
                  </div>

                  {fileItem.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${fileItem.progress}%` }}
                      />
                    </div>
                  )}

                  {fileItem.status === 'error' && fileItem.error && (
                    <p className="text-xs text-red-600">{fileItem.error}</p>
                  )}

                  {fileItem.status === 'completed' && fileItem.response?.data?.fileUrl && (
                    <a
                      href={fileItem.response.data.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      查看文件
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


