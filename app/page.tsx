"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import GhibliTransform from "./components/GhibliTransform";

interface LoggedInUser {
  id: string;
  email: string;
  name: string;
  photo: string;
}

export default function Home() {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // 检查用户登录状态
  useEffect(() => {
    // 确保在客户端运行
    if (typeof window !== 'undefined') {
      // 检查NextAuth session
      const token = localStorage.getItem('jwt');
      const userData = localStorage.getItem('user');
      
      // 检查模拟登录状态
      const mockUser = localStorage.getItem('mock_user');
      const mockToken = localStorage.getItem('mock_token');
      
      if (mockUser && mockToken) {
        // 使用模拟用户数据
        try {
          setUser(JSON.parse(mockUser));
          console.log('使用开发模式登录');
        } catch (error) {
          console.error('Error parsing mock user data:', error);
          localStorage.removeItem('mock_user');
          localStorage.removeItem('mock_token');
        }
      } else if (token && userData) {
        // 使用真实用户数据
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
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
      // 清除NextAuth数据
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      localStorage.removeItem('userState');
      
      // 清除模拟登录数据
      localStorage.removeItem('mock_user');
      localStorage.removeItem('mock_token');
      localStorage.removeItem('mock_login_time');
    }
    setUser(null);
    setAvatarMenuOpen(false);
  }


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
              <h1 className="text-xl font-bold text-white">Ghibli图像风格生成</h1>
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
            Ghibli图像风格生成
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            上传您的图片，体验AI驱动的吉卜力风格转换
          </p>
        </div>



        {/* 主要功能区域 - Ghibli风格转换 */}
        <div className="animate-fadeInUp" style={{animationDelay: '0.8s'}}>
          <GhibliTransform />
        </div>


      </main>
    </div>
  );
}