"use client";
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

/**
 * Google登录按钮组件
 * 
 * 文件位置说明：
 * - app/components/GoogleSignInButton.tsx
 * - components目录存放可复用的React组件
 * - 这是React/Next.js项目的标准组件组织方式
 * 
 * 组件架构说明：
 * - 使用"use client"指令，表示这是客户端组件
 * - 客户端组件可以使用React hooks和浏览器API
 * - 服务端组件无法使用useState、useEffect等hooks
 */

interface GoogleSignInButtonProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline';
  showText?: boolean;
}

export default function GoogleSignInButton({
  className = '',
  size = 'medium',
  variant = 'default',
  showText = true
}: GoogleSignInButtonProps) {
  const { data: session, status } = useSession();

  // 加载状态
  if (status === 'loading') {
    return (
      <div className={`flex items-center justify-center ${getSizeClasses(size)} ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        {showText && <span className="ml-2">加载中...</span>}
      </div>
    );
  }

  // 已登录状态
  if (session) {
    return (
      <div className="flex items-center space-x-4">
        {/* 用户信息 */}
        <div className="flex items-center space-x-3">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt="用户头像"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {session.user?.name}
            </span>
            <span className="text-xs text-gray-500">
              {session.user?.email}
            </span>
          </div>
        </div>

        {/* 登出按钮 */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={`
            flex items-center justify-center space-x-2 rounded-lg border transition-colors
            ${getSizeClasses(size)}
            ${variant === 'outline' 
              ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
              : 'border-red-600 bg-red-600 text-white hover:bg-red-700'
            }
            ${className}
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {showText && <span>退出登录</span>}
        </button>
      </div>
    );
  }

  // 未登录状态 - 显示Google登录按钮
  return (
    <button
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className={`
        flex items-center justify-center space-x-3 rounded-lg border transition-all duration-200
        ${getSizeClasses(size)}
        ${variant === 'outline' 
          ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400' 
          : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={status === 'loading'}
    >
      {/* Google图标 */}
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill={variant === 'outline' ? '#4285F4' : 'currentColor'}
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill={variant === 'outline' ? '#34A853' : 'currentColor'}
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill={variant === 'outline' ? '#FBBC05' : 'currentColor'}
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill={variant === 'outline' ? '#EA4335' : 'currentColor'}
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>

      {/* 按钮文本 */}
      {showText && (
        <span className="font-medium">
          使用 Google 登录
        </span>
      )}
    </button>
  );
}

/**
 * 根据尺寸获取CSS类名
 */
function getSizeClasses(size: 'small' | 'medium' | 'large'): string {
  switch (size) {
    case 'small':
      return 'px-3 py-2 text-sm';
    case 'large':
      return 'px-6 py-4 text-lg';
    case 'medium':
    default:
      return 'px-4 py-3 text-base';
  }
}
