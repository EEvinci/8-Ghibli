"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * 模拟登录按钮组件
 * 用于开发环境下跳过Google OAuth，直接模拟登录成功
 */
interface MockLoginButtonProps {
  className?: string;
}

export default function MockLoginButton({ className = '' }: MockLoginButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const mockLogin = async () => {
    setIsLoading(true);
    
    try {
      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建模拟用户数据
      const mockUser = {
        id: 'mock_user_' + Date.now(),
        email: 'developer@example.com',
        name: '开发者用户',
        image: '/images/icons/use1.png',
        googleId: 'mock_google_id_' + Date.now(),
        usage: {
          freeTrialsRemaining: 10,
          totalTransformations: 0
        }
      };

      // 模拟JWT token
      const mockToken = 'mock_jwt_token_' + Date.now();

      // 保存到localStorage（模拟session）
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_token', mockToken);
      localStorage.setItem('mock_login_time', new Date().toISOString());

      // 跳转到首页
      router.push('/');
      
    } catch (error) {
      console.error('模拟登录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={mockLogin}
      disabled={isLoading}
      className={`
        flex items-center justify-center space-x-3 rounded-lg border transition-all duration-200
        px-4 py-3 text-base
        border-green-600 bg-green-600 text-white hover:bg-green-700 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {/* 开发图标 */}
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>

      {/* 按钮文本 */}
      <span className="font-medium">
        {isLoading ? '登录中...' : '开发模式登录'}
      </span>
    </button>
  );
}



