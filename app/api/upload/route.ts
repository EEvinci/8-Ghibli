import { NextRequest, NextResponse } from 'next/server';
import { fileStorageService } from '../../lib/storage';
import { FileMetadata } from '../../models/FileMetadata';
import connectDB from '../../lib/db';

export async function POST(request: NextRequest) {
  let useDatabase = true;
  
  try {
    // 尝试连接数据库
    await connectDB();
  } catch (dbError) {
    console.warn('数据库连接失败，使用本地模式:', dbError instanceof Error ? dbError.message : '未知错误');
    useDatabase = false;
  }

  try {
    // 解析multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // 获取可选参数
    const userId = formData.get('userId') as string | null;
    const category = formData.get('category') as string | null;
    const tags = formData.get('tags') as string | null;

    // 验证文件是否存在
    if (!file) {
      return NextResponse.json(
        { error: '未找到上传文件' },
        { status: 400 }
      );
    }

    // 使用存储服务验证文件
    const validation = fileStorageService.validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: validation.error,
          details: '请检查文件类型和大小'
        },
        { status: 400 }
      );
    }

    // 存储文件
    const fileMetadata = await fileStorageService.storeFile(file, {
      userId: userId || undefined,
      category: category || 'uploads',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    });

    const responseData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
      fileName: fileMetadata.fileName,
      originalName: fileMetadata.originalName,
      fileSize: fileMetadata.fileSize,
      fileType: fileMetadata.fileType,
      fileUrl: fileMetadata.publicUrl,
      hash: fileMetadata.hash,
      category: fileMetadata.category,
      tags: fileMetadata.tags,
      uploadedAt: fileMetadata.uploadedAt.toISOString()
    };

    // 如果数据库可用，保存元数据
    if (useDatabase) {
      try {
        const dbRecord = new FileMetadata({
          originalName: fileMetadata.originalName,
          fileName: fileMetadata.fileName,
          fileSize: fileMetadata.fileSize,
          fileType: fileMetadata.fileType,
          mimeType: fileMetadata.mimeType,
          extension: fileMetadata.extension,
          hash: fileMetadata.hash,
          relativePath: fileMetadata.relativePath,
          absolutePath: fileMetadata.absolutePath,
          publicUrl: fileMetadata.publicUrl,
          uploadedAt: fileMetadata.uploadedAt,
          userId: fileMetadata.userId,
          category: fileMetadata.category,
          tags: fileMetadata.tags || [],
          status: 'uploaded',
        });

        await dbRecord.save();
        responseData.id = dbRecord._id;
        responseData.databaseSaved = true;
      } catch (dbSaveError) {
        console.warn('数据库保存失败，但文件已成功存储:', dbSaveError);
        responseData.databaseSaved = false;
        responseData.databaseError = dbSaveError instanceof Error ? dbSaveError.message : '数据库保存失败';
      }
    } else {
      responseData.databaseSaved = false;
      responseData.mode = 'local';
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: useDatabase ? '文件上传成功' : '文件上传成功（本地模式）',
      data: responseData
    });

  } catch (error) {
    console.error('上传错误:', error);
    
    return NextResponse.json(
      { 
        error: '文件上传失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
