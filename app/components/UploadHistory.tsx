"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useUploadHistory } from '../hooks/useUploadHistory';

interface UploadHistoryProps {
  className?: string;
  showSearch?: boolean;
  showStats?: boolean;
  maxItems?: number;
}

export default function UploadHistory({ 
  className = '',
  showSearch = true,
  showStats = true,
  maxItems 
}: UploadHistoryProps) {
  const { 
    history, 
    loading, 
    removeRecord, 
    clearHistory, 
    searchHistory, 
    getGroupedHistory, 
    getStats 
  } = useUploadHistory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredHistory = searchQuery ? searchHistory(searchQuery) : history;
  const displayHistory = maxItems ? filteredHistory.slice(0, maxItems) : filteredHistory;
  const groupedHistory = getGroupedHistory();
  const stats = getStats();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowConfirmClear(false);
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">加载历史记录...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 标题和操作 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">上传历史</h3>
        {history.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowConfirmClear(true)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              清空历史
            </button>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      {showStats && stats.total > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">总文件数</p>
              <p className="font-semibold">{stats.total}</p>
            </div>
            <div>
              <p className="text-gray-600">成功上传</p>
              <p className="font-semibold text-green-600">{stats.successful}</p>
            </div>
            <div>
              <p className="text-gray-600">上传失败</p>
              <p className="font-semibold text-red-600">{stats.failed}</p>
            </div>
            <div>
              <p className="text-gray-600">总大小</p>
              <p className="font-semibold">{formatFileSize(stats.totalSize)}</p>
            </div>
          </div>
        </div>
      )}

      {/* 搜索框 */}
      {showSearch && history.length > 0 && (
        <div className="relative">
          <input
            type="text"
            placeholder="搜索文件名、类型或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* 历史记录列表 */}
      {displayHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? '未找到匹配的记录' : '暂无上传历史'}
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {displayHistory.map((item) => (
            <div
              key={item.id}
              className={`flex items-center space-x-4 p-4 rounded-lg border ${
                item.status === 'success' 
                  ? 'bg-white border-gray-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              {/* 文件预览 */}
              {item.status === 'success' && item.fileUrl && item.fileType.startsWith('image/') ? (
                <div className="flex-shrink-0 w-12 h-12 relative rounded-lg overflow-hidden">
                  <Image
                    src={item.fileUrl}
                    alt={item.originalName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.status === 'success' ? (
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
              )}

              {/* 文件信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.originalName}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status === 'success' ? '成功' : '失败'}
                  </span>
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{formatFileSize(item.fileSize)}</span>
                  <span>{item.fileType}</span>
                  <span>{formatDate(item.uploadedAt)}</span>
                </div>

                {item.error && (
                  <p className="mt-1 text-xs text-red-600">{item.error}</p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex-shrink-0 flex items-center space-x-2">
                {item.status === 'success' && item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                    title="查看文件"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                <button
                  onClick={() => removeRecord(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  title="删除记录"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {maxItems && filteredHistory.length > maxItems && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            显示前 {maxItems} 条记录，共 {filteredHistory.length} 条
          </p>
        </div>
      )}

      {/* 确认清空对话框 */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">确认清空历史记录</h3>
            <p className="text-sm text-gray-600 mb-6">
              此操作将删除所有上传历史记录，且无法恢复。确定要继续吗？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleClearHistory}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                确定清空
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


