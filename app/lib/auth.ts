import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './db';
import User from '../models/User';

/**
 * NextAuth.js 配置
 * 
 * 文件位置说明：
 * - app/lib/auth.ts: 存放认证配置和逻辑
 * - lib目录是Next.js标准的工具函数目录
 * - 认证配置属于核心业务逻辑，应该集中管理
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      },
      httpOptions: {
        timeout: 10000,
      }
    })
  ],
  
  callbacks: {
    /**
     * 登录时的回调函数
     * 用于控制是否允许用户登录
     */
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          // 检查用户是否已存在
          let existingUser = await User.findOne({ 
            $or: [
              { email: user.email },
              { googleId: account.providerAccountId }
            ]
          });
          
          if (!existingUser) {
            // 创建新用户
            existingUser = new User({
              email: user.email,
              name: user.name,
              photo: user.image || '',
              googleId: account.providerAccountId,
              usage: {
                freeTrialsRemaining: 10,
                totalTransformations: 0,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
              lastLoginAt: new Date(),
            });
            
            await existingUser.save();
            console.log('新用户创建成功:', user.email);
          } else {
            // 更新最后登录时间
            existingUser.lastLoginAt = new Date();
            existingUser.updatedAt = new Date();
            await existingUser.save();
            console.log('用户登录更新:', user.email);
          }
          
          return true;
        } catch (error) {
          console.error('登录过程中数据库操作失败:', error);
          return false;
        }
      }
      
      return true;
    },

    /**
     * JWT回调函数
     * 用于在JWT中添加自定义信息
     */
    async jwt({ token, account, user }) {
      if (account && user) {
        try {
          await connectDB();
          
          const dbUser = await User.findOne({ 
            $or: [
              { email: user.email },
              { googleId: account.providerAccountId }
            ]
          });
          
          if (dbUser) {
            token.userId = dbUser._id.toString();
            token.googleId = dbUser.googleId;
            token.usage = dbUser.usage;
          }
        } catch (error) {
          console.error('JWT回调中数据库查询失败:', error);
        }
      }
      
      return token;
    },

    /**
     * Session回调函数
     * 用于在客户端session中添加自定义信息
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.googleId = token.googleId as string;
        session.user.usage = token.usage as {
          freeTrialsRemaining: number;
          totalTransformations: number;
        };
        
        // 从数据库获取最新的用户信息
        try {
          await connectDB();
          const dbUser = await User.findById(token.userId);
          if (dbUser) {
            session.user.usage = dbUser.usage;
          }
        } catch (error) {
          console.error('Session回调中数据库查询失败:', error);
        }
      }
      
      return session;
    },

    /**
     * 重定向回调函数
     * 控制登录后的重定向行为
     */
    async redirect({ url, baseUrl }) {
      // 登录成功后重定向到首页
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },

  pages: {
    signIn: '/login',  // 自定义登录页面路径
    error: '/login',   // 错误页面也重定向到登录页
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30天
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30天
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};
