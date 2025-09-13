import { NextRequest, NextResponse } from 'next/server';
import { FileMetadata } from '../../models/FileMetadata';
import { fileStorageService } from '../../lib/storage';
import connectDB from '../../lib/db';

// GET - 获取文件列表
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const tags = searchParams.get('tags');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 构建查询条件
    const query: any = { status: { $ne: 'deleted' } };
    
    if (userId) {
      query.userId = userId;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // 执行查询
    const skip = (page - 1) * limit;
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [files, total] = await Promise.all([
      FileMetadata.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('-absolutePath -__v'),
      FileMetadata.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        files,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('获取文件列表失败:', error);
    return NextResponse.json(
      { 
        error: '获取文件列表失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除文件
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!fileId) {
      return NextResponse.json(
        { error: '缺少文件ID' },
        { status: 400 }
      );
    }

    const file = await FileMetadata.findById(fileId);
    if (!file) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    if (permanent) {
      // 永久删除 - 删除物理文件和数据库记录
      try {
        await fileStorageService.deleteFile(file.absolutePath);
      } catch (error) {
        console.error('删除物理文件失败:', error);
      }

      // 删除所有版本文件
      for (const version of file.versions) {
        try {
          const versionPath = file.absolutePath.replace(file.fileName, version.fileName);
          await fileStorageService.deleteFile(versionPath);
        } catch (error) {
          console.error('删除版本文件失败:', error);
        }
      }

      await FileMetadata.findByIdAndDelete(fileId);
    } else {
      // 软删除 - 只标记为已删除
      file.status = 'deleted';
      await file.save();
    }

    return NextResponse.json({
      success: true,
      message: permanent ? '文件已永久删除' : '文件已删除'
    });

  } catch (error) {
    console.error('删除文件失败:', error);
    return NextResponse.json(
      { 
        error: '删除文件失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
