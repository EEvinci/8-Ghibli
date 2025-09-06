"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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

  return (
    <div className="min-h-screen bg-[#FFFFE5]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/images/icons/use1.png"
                alt="Ghibli Dreamer"
                width={32}
                height={32}
                className="mr-3"
              />
              <h1 className="text-xl font-bold text-gray-900">Ghibli Dreamer</h1>
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
            将您的照片转换为吉卜力风格
          </h2>
          <p className="text-lg text-gray-600">
            上传您的图片，选择风格，让AI为您创造神奇的艺术作品
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">上传图片功能即将推出</h3>
          <p className="text-gray-600">我们正在开发中，敬请期待！</p>
        </div>
      </main>
    </div>
  );
}