import NextAuth from 'next-auth';
import { authOptions } from '../../../lib/auth';

/**
 * NextAuth.js API路由处理器
 * 
 * 文件位置说明：
 * - app/api/auth/[...nextauth]/route.ts
 * - 这是Next.js App Router中API路由的标准位置
 * - [...nextauth]是动态路由，捕获所有/api/auth/*的请求
 * - route.ts是App Router中API路由的文件名约定
 * 
 * 架构说明：
 * - app/api/ 目录专门用于API端点
 * - 动态路由[...nextauth]会处理以下路径：
 *   - /api/auth/signin (登录页面)
 *   - /api/auth/signout (登出)
 *   - /api/auth/callback/google (Google OAuth回调)
 *   - /api/auth/session (获取会话信息)
 *   - 等等...
 */

// NextAuth处理器，同时处理GET和POST请求
const handler = NextAuth(authOptions);

// 在App Router中，需要明确导出HTTP方法
export { handler as GET, handler as POST };
