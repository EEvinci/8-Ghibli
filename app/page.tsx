"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MultiFileUpload from "./components/MultiFileUpload";
import ErrorAlert from "./components/ErrorAlert";
import StyleConverter from "./components/StyleConverter";
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

  // 处理风格转换
  const handleStyleConvert = (originalImage: string, style: string) => {
    console.log('风格转换完成:', { originalImage, style });
    // 这里可以添加风格转换完成后的处理逻辑
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className="glass-header relative z-10">
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
              <h1 className="text-xl font-bold text-white">智能图片处理平台</h1>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={avatarRef}>
                  <button
                    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                    className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
                  >
                    <Image
                      src={user.photo || '/images/icons/use1.png'}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-white/30"
                    />
                    <span className="text-white font-medium">{user.name}</span>
                  </button>

                  {avatarMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass rounded-md py-1 z-10">
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 text-sm text-white hover:bg-white/10 w-full text-left rounded-md mx-1"
                      >
                        登出
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="gradient-btn px-6 py-2 rounded-full text-sm font-medium shadow-lg"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 animate-fadeInUp">
          <h2 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            智能图片处理平台
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            上传您的图片，体验智能风格转换与云端存储的完美结合
          </p>
        </div>

        {/* 功能卡片区域 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 上传功能卡片 */}
          <div className="glass-card p-8 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">智能上传</h3>
              <p className="text-white/80">
                支持批量上传，智能压缩优化，安全云端存储
              </p>
            </div>
          </div>

          {/* 风格转换功能卡片 */}
          <div className="glass-card p-8 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">风格转换</h3>
              <p className="text-white/80">
                AI驱动的图片风格转换，让您的照片更具艺术感
              </p>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        <div className="animate-fadeInUp" style={{animationDelay: '0.6s'}}>
          <ErrorAlert 
            error={error} 
            onDismiss={() => setError(null)}
            autoDismiss={true}
            autoDismissDelay={5000}
          />
        </div>

        {/* 主要功能区域 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 文件上传功能 */}
          <div className="animate-fadeInUp" style={{animationDelay: '0.8s'}}>
            <div className="glass-card p-8 h-full">
              <MultiFileUpload 
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
                maxFiles={10}
                allowMultiple={true}
              />
            </div>
          </div>

          {/* 风格转换功能 */}
          <div className="animate-fadeInUp" style={{animationDelay: '1.0s'}}>
            <StyleConverter onStyleConvert={handleStyleConvert} />
          </div>
        </div>

        {/* 批量上传成功提示 */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8 glass-card p-6 animate-fadeInUp">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-white">
                  成功上传 {uploadedFiles.length} 个文件！
                </h3>
                <p className="text-white/80 text-sm">您的文件已安全保存到云端</p>
              </div>
            </div>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile, index) => (
                <div key={index} className="glass p-4 rounded-lg border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {uploadedFile.data?.originalName}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-white/70">
                          大小: {uploadedFile.data?.fileSize ? (uploadedFile.data.fileSize / 1024 / 1024).toFixed(2) : '0'}MB
                        </span>
                        {uploadedFile.data?.mode === 'local' && (
                          <span className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-1 rounded-full border border-yellow-400/30">
                            本地模式
                          </span>
                        )}
                        {uploadedFile.data?.databaseSaved === false && uploadedFile.data?.mode !== 'local' && (
                          <span className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-1 rounded-full border border-yellow-400/30">
                            数据库未保存
                          </span>
                        )}
                        {uploadedFile.data?.databaseSaved === true && (
                          <span className="text-xs bg-green-400/20 text-green-200 px-2 py-1 rounded-full border border-green-400/30">
                            已保存到MongoDB
                          </span>
                        )}
                      </div>
                    </div>
                    {uploadedFile.data?.fileUrl && (
                      <a 
                        href={uploadedFile.data.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="gradient-btn px-4 py-2 rounded-full text-xs font-medium ml-4"
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

      </main>
    </div>
  );
}