"use client";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import GoogleSignInButton from '../components/GoogleSignInButton';

/**
 * 登录页面组件
 * 
 * 文件位置说明：
 * - app/login/page.tsx
 * - 这是Next.js App Router中的页面组件
 * - page.tsx是页面文件的命名约定
 * - login/目录表示路由路径 /login
 * 
 * 架构说明：
 * - 使用NextAuth.js的useSession hook获取认证状态
 * - 如果已登录，自动重定向到首页
 * - 使用自定义的GoogleSignInButton组件
 */
export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  // 加载状态
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 已登录状态
  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">登录成功</h1>
            <p className="text-gray-600 mb-6">正在跳转到首页...</p>
          </div>
        </div>
      </div>
    );
  }

  // 未登录状态 - 显示登录页面
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* 头部区域 */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Image
                src="/images/icons/use1.png"
                alt="Photo Upload App Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Photo Upload App
          </h1>
          <p className="text-gray-600 mb-2">
            安全上传和管理您的照片
          </p>
          <p className="text-sm text-gray-500">
            请登录您的Google账号开始使用
          </p>
        </div>

        {/* 登录按钮区域 */}
        <div className="space-y-4">
          <GoogleSignInButton 
            className="w-full"
            size="large"
            variant="outline"
          />
        </div>

        {/* 功能介绍 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 mb-3 text-center">
            主要功能
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span>安全的图片上传</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
              <span>云端存储管理</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span>多格式支持</span>
            </div>
          </div>
        </div>

        {/* 服务提示 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm font-medium text-blue-800">安全存储</span>
          </div>
          <p className="text-xs text-blue-700">
            您的图片将安全存储在云端，支持多种格式，随时随地访问。
          </p>
        </div>
      </div>
    </div>
  );
}