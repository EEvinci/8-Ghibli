"use client";
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

/**
 * Session Provider组件
 * 
 * 文件位置说明：
 * - app/providers/SessionProvider.tsx
 * - providers目录存放React Context Providers
 * - 这是React应用中管理全局状态的标准模式
 * 
 * 架构说明：
 * - Provider组件包装整个应用，提供全局的认证状态
 * - 使用React Context API，让所有子组件都能访问session
 * - 这是Next.js + NextAuth.js的标准配置模式
 * 
 * 为什么需要这个文件？
 * - NextAuth的SessionProvider需要在客户端组件中使用
 * - layout.tsx是服务端组件，不能直接使用客户端Provider
 * - 通过这个包装组件，在layout中使用Provider
 */

interface SessionProviderProps {
  children: ReactNode;
  session?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function SessionProvider({ 
  children, 
  session 
}: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
