import { useState, useEffect, useCallback } from 'react';
import { UploadResponse } from '../lib/upload';

interface UploadHistoryItem {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'success' | 'error';
  error?: string;
  tags?: string[];
  category?: string;
  hash?: string;
}

const STORAGE_KEY = 'photo_upload_history';
const MAX_HISTORY_ITEMS = 100;

export function useUploadHistory() {
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 从localStorage加载历史记录
  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('加载上传历史失败:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存历史记录到localStorage
  const saveHistory = useCallback((newHistory: UploadHistoryItem[]) => {
    try {
      // 限制历史记录数量
      const trimmedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
      setHistory(trimmedHistory);
    } catch (error) {
      console.error('保存上传历史失败:', error);
    }
  }, []);

  // 添加上传记录
  const addUploadRecord = useCallback((response: UploadResponse) => {
    if (!response.success || !response.data) return;

    const newItem: UploadHistoryItem = {
      id: response.data.id || `${Date.now()}_${Math.random().toString(36).substring(2)}`,
      fileName: response.data.fileName,
      originalName: response.data.originalName,
      fileSize: response.data.fileSize,
      fileType: response.data.fileType,
      fileUrl: response.data.fileUrl,
      uploadedAt: response.data.uploadedAt,
      status: 'success',
      tags: response.data.tags,
      category: response.data.category,
      hash: response.data.hash,
    };

    setHistory(prev => {
      const updated = [newItem, ...prev];
      saveHistory(updated);
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });
  }, [saveHistory]);

  // 批量添加上传记录
  const addUploadRecords = useCallback((responses: UploadResponse[]) => {
    const newItems: UploadHistoryItem[] = responses
      .filter(response => response.success && response.data)
      .map(response => ({
        id: response.data!.id || `${Date.now()}_${Math.random().toString(36).substring(2)}`,
        fileName: response.data!.fileName,
        originalName: response.data!.originalName,
        fileSize: response.data!.fileSize,
        fileType: response.data!.fileType,
        fileUrl: response.data!.fileUrl,
        uploadedAt: response.data!.uploadedAt,
        status: 'success' as const,
        tags: response.data!.tags,
        category: response.data!.category,
        hash: response.data!.hash,
      }));

    if (newItems.length > 0) {
      setHistory(prev => {
        const updated = [...newItems, ...prev];
        saveHistory(updated);
        return updated.slice(0, MAX_HISTORY_ITEMS);
      });
    }
  }, [saveHistory]);

  // 添加错误记录
  const addErrorRecord = useCallback((fileName: string, error: string) => {
    const newItem: UploadHistoryItem = {
      id: `error_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      fileName: fileName,
      originalName: fileName,
      fileSize: 0,
      fileType: 'unknown',
      fileUrl: '',
      uploadedAt: new Date().toISOString(),
      status: 'error',
      error,
    };

    setHistory(prev => {
      const updated = [newItem, ...prev];
      saveHistory(updated);
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });
  }, [saveHistory]);

  // 删除记录
  const removeRecord = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, [saveHistory]);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (error) {
      console.error('清空历史记录失败:', error);
    }
  }, []);

  // 搜索历史记录
  const searchHistory = useCallback((query: string) => {
    if (!query.trim()) return history;
    
    const lowercaseQuery = query.toLowerCase();
    return history.filter(item => 
      item.originalName.toLowerCase().includes(lowercaseQuery) ||
      item.fileName.toLowerCase().includes(lowercaseQuery) ||
      item.fileType.toLowerCase().includes(lowercaseQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      item.category?.toLowerCase().includes(lowercaseQuery)
    );
  }, [history]);

  // 按日期分组
  const getGroupedHistory = useCallback(() => {
    const groups: Record<string, UploadHistoryItem[]> = {};
    
    history.forEach(item => {
      const date = new Date(item.uploadedAt).toLocaleDateString('zh-CN');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [history]);

  // 获取统计信息
  const getStats = useCallback(() => {
    const total = history.length;
    const successful = history.filter(item => item.status === 'success').length;
    const failed = history.filter(item => item.status === 'error').length;
    const totalSize = history
      .filter(item => item.status === 'success')
      .reduce((sum, item) => sum + item.fileSize, 0);

    const typeStats = history.reduce((acc, item) => {
      if (item.status === 'success') {
        acc[item.fileType] = (acc[item.fileType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      successful,
      failed,
      totalSize,
      typeStats,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0
    };
  }, [history]);

  // 初始化加载
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    addUploadRecord,
    addUploadRecords,
    addErrorRecord,
    removeRecord,
    clearHistory,
    searchHistory,
    getGroupedHistory,
    getStats,
    refresh: loadHistory
  };
}


