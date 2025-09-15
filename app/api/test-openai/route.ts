import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * GET /api/test-openai
 * 测试 OpenAI API 连接
 */
export async function GET(request: NextRequest) {
  try {
    // 检查 API Key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY 环境变量未设置',
        details: '请在 .env.local 文件中添加 OPENAI_API_KEY=your_api_key_here'
      }, { status: 500 });
    }

    // 初始化 OpenAI 客户端
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30秒超时
    });

    // 测试文本生成
    const textResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Hello, please respond with "API connection successful"' }
      ],
      max_tokens: 10,
    });

    // 测试图片生成
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: 'A simple test image of a red circle',
      n: 1,
      size: '256x256',
      quality: 'standard',
    });

    return NextResponse.json({
      success: true,
      message: 'OpenAI API 连接正常',
      tests: {
        textGeneration: {
          success: true,
          response: textResponse.choices[0].message.content
        },
        imageGeneration: {
          success: true,
          imageUrl: imageResponse.data[0].url
        }
      },
      apiKey: {
        prefix: process.env.OPENAI_API_KEY.substring(0, 8) + '...',
        length: process.env.OPENAI_API_KEY.length
      }
    });

  } catch (error) {
    console.error('OpenAI API 测试失败:', error);
    
    let errorMessage = 'OpenAI API 连接失败';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('timeout')) {
        errorDetails = '请求超时，请检查网络连接';
      } else if (error.message.includes('rate limit')) {
        errorDetails = '请求频率过高，请稍后重试';
      } else if (error.message.includes('quota')) {
        errorDetails = 'API 配额不足，请检查账户余额';
      } else if (error.message.includes('authentication')) {
        errorDetails = 'API Key 无效或过期';
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      troubleshooting: {
        checkApiKey: '确认 OPENAI_API_KEY 环境变量是否正确设置',
        checkNetwork: '检查网络连接是否正常',
        checkQuota: '检查 OpenAI 账户是否有足够的配额',
        checkPermissions: '确认 API Key 有正确的权限'
      }
    }, { status: 500 });
  }
}



