"use client";
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useUploadState } from '../hooks/useUploadState';
import UploadStatus from './UploadStatus';
import LoadingSpinner from './LoadingSpinner';
import { uploadFile, validateFile as validateFileUtil, UploadResponse } from '../lib/upload';

interface FileSelectorProps {
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (response: UploadResponse) => void;
}

interface FileValidation {
  isValid: boolean;
  error?: string;
}

export default function FileSelector({ 
  onFileSelect, 
  onError, 
  onUploadStart, 
  onUploadComplete 
}: FileSelectorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 上传状态管理
  const uploadState = useUploadState();

  // 验证文件
  const validateFile = (file: File): FileValidation => {
    return validateFileUtil(file);
  };

  // 真实上传功能
  const performUpload = async (file: File) => {
    uploadState.startUpload();
    onUploadStart?.();
    
    try {
      const response = await uploadFile(file, (progress) => {
        uploadState.updateProgress(progress.percentage);
      });
      
      if (response.success && response.data) {
        uploadState.setSuccess(response.data.fileUrl, response.data);
        onUploadComplete?.(response);
      } else {
        throw new Error(response.error || '上传失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败，请重试';
      uploadState.setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      onError(validation.error || '文件验证失败');
      return;
    }

    setSelectedFile(file);
    
    // 创建预览URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // 通知父组件
    onFileSelect(file);
    
    // 自动开始上传
    performUpload(file);
  };

  // 处理文件输入变化
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 处理拖拽事件
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // 只有当拖拽离开整个组件时才设置为false
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      onError('请拖拽图片文件');
      return;
    }
    
    if (imageFiles.length > 1) {
      onError('当前版本只支持单文件上传，请使用增强版上传功能');
      return;
    }
    
    const file = imageFiles[0];
    handleFileSelect(file);
  };

  // 清除选择
  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    uploadState.reset();
  };

  // 重试上传
  const retryUpload = () => {
    uploadState.retry();
    if (selectedFile) {
      performUpload(selectedFile);
    }
  };

  // 打开文件选择器
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* 文件选择区域 */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${uploadState.isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${isDragOver 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${selectedFile && !uploadState.isUploading ? 'border-green-500 bg-green-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={uploadState.isUploading ? undefined : openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {uploadState.isUploading ? (
          <div className="space-y-4">
            <LoadingSpinner size="lg" text="正在上传..." />
            <div>
              <p className="text-lg font-medium text-gray-900">
                正在上传图片...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                请稍候，不要关闭页面
              </p>
            </div>
          </div>
        ) : !selectedFile ? (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                点击选择图片或拖拽到此处
              </p>
              <p className="text-sm text-gray-500 mt-1">
                支持 JPG、PNG、WebP 格式，最大 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 text-green-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-green-700">
                文件已选择
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 上传状态 */}
      <UploadStatus
        isUploading={uploadState.isUploading}
        progress={uploadState.progress}
        error={uploadState.error}
        success={uploadState.success}
        uploadedFileData={uploadState.uploadedFileData}
        onRetry={retryUpload}
        onCancel={clearSelection}
      />

      {/* 图片预览 */}
      {previewUrl && selectedFile && (
        <div className="mt-6">
          <div className="relative">
            <h3 className="text-lg font-medium text-gray-900 mb-3">图片预览</h3>
            <div className="relative inline-block">
              <Image
                src={previewUrl}
                alt="预览图片"
                width={400}
                height={300}
                className="rounded-lg shadow-md object-cover"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <button
                onClick={clearSelection}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                title="移除图片"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文件信息 */}
      {selectedFile && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">文件信息</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">文件名:</span> {selectedFile.name}</p>
            <p><span className="font-medium">文件大小:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><span className="font-medium">文件类型:</span> {selectedFile.type}</p>
            <p><span className="font-medium">最后修改:</span> {new Date(selectedFile.lastModified).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
