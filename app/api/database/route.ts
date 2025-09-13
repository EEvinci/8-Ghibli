import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import { FileMetadata } from '../../models/FileMetadata';
import User from '../../models/User';

/**
 * 数据库状态检查API
 * GET /api/database - 获取数据库连接状态和统计信息
 */
export async function GET(request: NextRequest) {
  try {
    // 尝试连接数据库
    await connectDB();
    
    // 获取文件统计信息
    const fileCount = await FileMetadata.countDocuments();
    const userCount = await User.countDocuments();
    
    // 获取最近上传的文件
    const recentFiles = await FileMetadata.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('originalName fileName fileSize status createdAt userId')
      .lean();
    
    // 获取文件状态统计
    const statusStats = await FileMetadata.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);
    
    // 获取存储统计
    const storageStats = await FileMetadata.aggregate([
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          avgSize: { $avg: '$fileSize' },
          maxSize: { $max: '$fileSize' },
          minSize: { $min: '$fileSize' }
        }
      }
    ]);
    
    const stats = storageStats[0] || {
      totalFiles: 0,
      totalSize: 0,
      avgSize: 0,
      maxSize: 0,
      minSize: 0
    };
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        collections: {
          users: userCount,
          files: fileCount
        }
      },
      storage: {
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
        avgSizeMB: (stats.avgSize / 1024 / 1024).toFixed(2),
        maxSizeMB: (stats.maxSize / 1024 / 1024).toFixed(2),
        minSizeMB: (stats.minSize / 1024 / 1024).toFixed(2)
      },
      statusBreakdown: statusStats.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          totalSize: item.totalSize,
          totalSizeMB: (item.totalSize / 1024 / 1024).toFixed(2)
        };
        return acc;
      }, {} as Record<string, any>), // eslint-disable-line @typescript-eslint/no-explicit-any
      recentFiles: recentFiles.map(file => ({
        id: file._id,
        originalName: file.originalName,
        fileName: file.fileName,
        fileSizeMB: (file.fileSize / 1024 / 1024).toFixed(2),
        status: file.status,
        uploadedAt: file.createdAt,
        userId: file.userId
      }))
    });
    
  } catch (error) {
    console.error('数据库状态检查失败:', error);
    
    return NextResponse.json({
      success: false,
      database: {
        connected: false,
        error: error instanceof Error ? error.message : '数据库连接失败'
      }
    }, { status: 500 });
  }
}

/**
 * 处理CORS预检请求
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
