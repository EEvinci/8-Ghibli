"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MultiFileUpload from "./components/MultiFileUpload";
import ErrorAlert from "./components/ErrorAlert";
import { UploadResponse } from "./lib/upload";

interface LoggedInUser {
  id: string;
  email: string;
  name: string;
  photo: string;
}

export default function Home() {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // 检查用户登录状态
  useEffect(() => {
    // 确保在客户端运行
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          // 清除无效数据
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  // 处理点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [avatarMenuOpen]);

  // 处理登出
  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
    }
    setUser(null);
    setAvatarMenuOpen(false);
  }

  // 处理批量上传完成
  const handleUploadComplete = (responses: UploadResponse[]) => {
    console.log('批量上传完成:', responses);
    setUploadedFiles(responses);
    setError(null);
  };

  // 处理上传错误
  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="min-h-screen bg-[#FFFFE5]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/images/icons/use1.png"
                alt="Photo Upload App"
                width={32}
                height={32}
                className="mr-3"
              />
              <h1 className="text-xl font-bold text-gray-900">Photo Upload App</h1>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={avatarRef}>
                  <button
                    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                    className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Image
                      src={user.photo || '/images/icons/use1.png'}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="text-gray-700">{user.name}</span>
                  </button>

                  {avatarMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        登出
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            安全上传和管理您的照片
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            上传您的图片到安全的云端存储，随时随地访问和管理
          </p>
          
          {/* 功能导航 */}
          <div className="flex justify-center space-x-4">
            <span className="px-4 py-2 text-indigo-600 border-b-2 border-indigo-600 font-medium">
              基础上传
            </span>
            <Link
              href="/enhanced-upload"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300"
            >
              增强上传
            </Link>
            <Link
              href="/storage-test"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300"
            >
              功能测试
            </Link>
          </div>
        </div>

        {/* 错误提示 */}
        <ErrorAlert 
          error={error} 
          onDismiss={() => setError(null)}
          autoDismiss={true}
          autoDismissDelay={5000}
        />

        {/* 批量文件上传组件 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <MultiFileUpload 
            onUploadComplete={handleUploadComplete}
            onError={handleUploadError}
            maxFiles={10}
            allowMultiple={true}
          />
        </div>

        {/* 批量上传成功提示 */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-green-800">
                  成功上传 {uploadedFiles.length} 个文件！
                </p>
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <div key={index} className="bg-white rounded p-3 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-800">
                            {uploadedFile.data?.originalName}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            大小: {uploadedFile.data?.fileSize ? (uploadedFile.data.fileSize / 1024 / 1024).toFixed(2) : '0'}MB
                            {uploadedFile.data?.mode === 'local' && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                本地模式
                              </span>
                            )}
                            {uploadedFile.data?.databaseSaved === false && uploadedFile.data?.mode !== 'local' && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                数据库未保存
                              </span>
                            )}
                            {uploadedFile.data?.databaseSaved === true && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                已保存到MongoDB
                              </span>
                            )}
                          </p>
                        </div>
                        {uploadedFile.data?.fileUrl && (
                          <a 
                            href={uploadedFile.data.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline ml-3"
                          >
                            查看文件
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}