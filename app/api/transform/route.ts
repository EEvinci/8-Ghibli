import { NextRequest, NextResponse } from 'next/server';
import { transformToGhibliStyle, isValidStyle, GhibliStyle } from '@/app/lib/openai';
import { FileMetadata } from '@/app/models/FileMetadata';
import connectDB from '@/app/lib/db';
import crypto from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

/**
 * POST /api/transform
 * 接收图片文件和风格选择，调用 OpenAI 生成新图片并保存
 */
export async function POST(request: NextRequest) {
  try {
    // 连接数据库
    await connectDB();

    // 解析表单数据
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const style = formData.get('style') as string;

    // 验证必需参数
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { error: '请上传图片文件' },
        { status: 400 }
      );
    }

    if (!style || !isValidStyle(style)) {
      return NextResponse.json(
        { error: '无效的风格参数' },
        { status: 400 }
      );
    }

    // 调用 OpenAI 进行图片转换（带超时处理）
    const transformResult = await Promise.race([
      transformToGhibliStyle(imageFile, style as GhibliStyle),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI API 请求超时')), 60000) // 60秒超时
      )
    ]) as { success: boolean; imageUrl?: string; error?: string };
    
    if (!transformResult.success || !transformResult.imageUrl) {
      return NextResponse.json(
        { error: transformResult.error || '图片转换失败' },
        { status: 500 }
      );
    }

    // 下载生成的图片
    const imageResponse = await fetch(transformResult.imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: '下载生成的图片失败' },
        { status: 500 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageData = Buffer.from(imageBuffer);

    // 生成文件名和路径
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const fileName = `ghibli_${style}_${timestamp}_${randomBytes}.png`;
    
    // 按年月组织文件结构
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const relativePath = `images/processed/${year}/${month}/${fileName}`;
    const absolutePath = `${process.cwd()}/public/storage/${relativePath}`;
    const publicUrl = `/storage/${relativePath}`;

    // 确保目录存在
    await mkdir(dirname(absolutePath), { recursive: true });

    // 保存图片文件
    await writeFile(absolutePath, imageData);

    // 计算文件哈希
    const fileHash = crypto.createHash('sha256').update(imageData).digest('hex');

    // 创建文件元数据记录
    const fileMetadata = new FileMetadata({
      originalName: `ghibli_${style}_${imageFile.name}`,
      fileName: fileName,
      fileSize: imageData.length,
      fileType: 'image/png',
      mimeType: 'image/png',
      extension: '.png',
      hash: fileHash,
      relativePath: relativePath,
      absolutePath: absolutePath,
      publicUrl: publicUrl,
      uploadedAt: new Date(),
      category: 'processed',
      tags: ['ghibli', 'ai-generated', style],
      status: 'processed',
      metadata: {
        exif: {
          originalStyle: style,
          transformSource: 'openai-dalle',
          generatedAt: new Date().toISOString(),
        }
      },
      versions: [{
        type: 'styled',
        fileName: fileName,
        publicUrl: publicUrl,
        fileSize: imageData.length,
        createdAt: new Date(),
      }],
      accessCount: 0,
    });

    // 保存到数据库
    await fileMetadata.save();

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        id: fileMetadata._id,
        fileName: fileMetadata.fileName,
        publicUrl: fileMetadata.publicUrl,
        style: style,
        fileSize: fileMetadata.fileSize,
        uploadedAt: fileMetadata.uploadedAt,
        tags: fileMetadata.tags,
      }
    });

  } catch (error) {
    console.error('Transform API 错误:', error);
    
    let errorMessage = '服务器内部错误';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
