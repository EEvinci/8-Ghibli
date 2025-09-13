import { useState, useCallback } from 'react';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  uploadedFileUrl?: string;
  uploadedFileData?: {
    fileName: string;
    originalName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    uploadedAt: string;
  };
}

export interface UploadActions {
  startUpload: () => void;
  updateProgress: (progress: number) => void;
  setError: (error: string) => void;
  setSuccess: (fileUrl?: string, fileData?: UploadState['uploadedFileData']) => void;
  reset: () => void;
  retry: () => void;
}

export function useUploadState(): UploadState & UploadActions {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
    uploadedFileUrl: undefined,
    uploadedFileData: undefined,
  });

  const startUpload = useCallback(() => {
    setState({
      isUploading: true,
      progress: 0,
      error: null,
      success: false,
      uploadedFileUrl: undefined,
      uploadedFileData: undefined,
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isUploading: false,
      error,
      success: false,
    }));
  }, []);

  const setSuccess = useCallback((fileUrl?: string, fileData?: UploadState['uploadedFileData']) => {
    setState(prev => ({
      ...prev,
      isUploading: false,
      progress: 100,
      success: true,
      error: null,
      uploadedFileUrl: fileUrl,
      uploadedFileData: fileData,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      success: false,
      uploadedFileUrl: undefined,
      uploadedFileData: undefined,
    });
  }, []);

  const retry = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      isUploading: false,
      progress: 0,
    }));
  }, []);

  return {
    ...state,
    startUpload,
    updateProgress,
    setError,
    setSuccess,
    reset,
    retry,
  };
}
