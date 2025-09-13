import { writeFile, mkdir, access, stat, readdir, unlink } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

// 存储配置
export const STORAGE_CONFIG = {
  BASE_DIR: join(process.cwd(), 'public', 'storage'),
  IMAGES_DIR: 'images',
  TEMP_DIR: 'temp',
  THUMBNAILS_DIR: 'thumbnails',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  SUPPORTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};

// 文件元数据接口
export interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  extension: string;
  hash: string;
  relativePath: string;
  absolutePath: string;
  publicUrl: string;
  uploadedAt: Date;
  userId?: string;
  category?: string;
  tags?: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

// 存储统计信息
export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
  byCategory: Record<string, { count: number; size: number }>;
}

export class FileStorageService {
  private baseDir: string;
  private imagesDir: string;
  private tempDir: string;
  private thumbnailsDir: string;

  constructor() {
    this.baseDir = STORAGE_CONFIG.BASE_DIR;
    this.imagesDir = join(this.baseDir, STORAGE_CONFIG.IMAGES_DIR);
    this.tempDir = join(this.baseDir, STORAGE_CONFIG.TEMP_DIR);
    this.thumbnailsDir = join(this.baseDir, STORAGE_CONFIG.THUMBNAILS_DIR);
  }

  /**
   * 初始化存储目录
   */
  async initializeStorage(): Promise<void> {
    const directories = [
      this.baseDir,
      this.imagesDir,
      this.tempDir,
      this.thumbnailsDir,
      join(this.imagesDir, 'original'),
      join(this.imagesDir, 'processed'),
      join(this.imagesDir, 'uploads'),
    ];

    for (const dir of directories) {
      await this.ensureDirectoryExists(dir);
    }
  }

  /**
   * 确保目录存在
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await access(dirPath);
    } catch {
      await mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 生成安全的文件名
   */
  generateSecureFileName(originalName: string, userId?: string): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const extension = extname(originalName).toLowerCase();
    
    // 基于用户ID和时间戳生成哈希
    const hashInput = `${userId || 'anonymous'}_${timestamp}_${randomBytes}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 16);
    
    return `${timestamp}_${hash}${extension}`;
  }

  /**
   * 生成文件路径结构
   */
  generateFilePath(fileName: string, category: string = 'uploads'): {
    relativePath: string;
    absolutePath: string;
    publicUrl: string;
  } {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // 按年月组织文件结构
    const relativePath = join(STORAGE_CONFIG.IMAGES_DIR, category, String(year), month, fileName);
    const absolutePath = join(this.baseDir, relativePath);
    const publicUrl = `/storage/${relativePath.replace(/\\/g, '/')}`;

    return {
      relativePath,
      absolutePath,
      publicUrl
    };
  }

  /**
   * 计算文件哈希
   */
  calculateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * 验证文件类型
   */
  validateFile(file: File | { type: string; size: number }): { isValid: boolean; error?: string } {
    // 检查文件类型
    if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `不支持的文件类型。支持的类型: ${STORAGE_CONFIG.ALLOWED_TYPES.join(', ')}`
      };
    }

    // 检查文件大小
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `文件过大。最大允许大小: ${STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    return { isValid: true };
  }

  /**
   * 存储文件
   */
  async storeFile(
    file: File,
    options: {
      userId?: string;
      category?: string;
      tags?: string[];
    } = {}
  ): Promise<FileMetadata> {
    // 验证文件
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 初始化存储目录
    await this.initializeStorage();

    // 生成文件名和路径
    const fileName = this.generateSecureFileName(file.name, options.userId);
    const paths = this.generateFilePath(fileName, options.category);

    // 确保目标目录存在
    await this.ensureDirectoryExists(dirname(paths.absolutePath));

    // 读取文件内容
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = this.calculateFileHash(buffer);

    // 写入文件
    await writeFile(paths.absolutePath, buffer);

    // 创建元数据
    const metadata: FileMetadata = {
      id: crypto.randomUUID(),
      originalName: file.name,
      fileName,
      fileSize: file.size,
      fileType: file.type,
      mimeType: file.type,
      extension: extname(file.name).toLowerCase(),
      hash: fileHash,
      relativePath: paths.relativePath,
      absolutePath: paths.absolutePath,
      publicUrl: paths.publicUrl,
      uploadedAt: new Date(),
      userId: options.userId,
      category: options.category || 'uploads',
      tags: options.tags || [],
    };

    return metadata;
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('删除文件失败:', error);
      throw new Error('删除文件失败');
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    mtime?: Date;
  }> {
    try {
      const stats = await stat(filePath);
      return {
        exists: true,
        size: stats.size,
        mtime: stats.mtime,
      };
    } catch {
      return { exists: false };
    }
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFiles(olderThanHours: number = 24): Promise<number> {
    try {
      const tempFiles = await readdir(this.tempDir);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of tempFiles) {
        const filePath = join(this.tempDir, file);
        const stats = await stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await unlink(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('清理临时文件失败:', error);
      return 0;
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(): Promise<StorageStats> {
    const stats: StorageStats = {
      totalFiles: 0,
      totalSize: 0,
      byType: {},
      byCategory: {},
    };

    try {
      await this.collectStats(this.imagesDir, stats);
    } catch (error) {
      console.error('获取存储统计失败:', error);
    }

    return stats;
  }

  /**
   * 递归收集统计信息
   */
  private async collectStats(dirPath: string, stats: StorageStats): Promise<void> {
    try {
      const items = await readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = join(dirPath, item.name);

        if (item.isDirectory()) {
          await this.collectStats(itemPath, stats);
        } else if (item.isFile()) {
          const fileStats = await stat(itemPath);
          const extension = extname(item.name).toLowerCase();

          stats.totalFiles++;
          stats.totalSize += fileStats.size;

          // 按类型统计
          if (!stats.byType[extension]) {
            stats.byType[extension] = { count: 0, size: 0 };
          }
          stats.byType[extension].count++;
          stats.byType[extension].size += fileStats.size;

          // 按分类统计（从路径推断）
          const category = this.getCategoryFromPath(itemPath);
          if (!stats.byCategory[category]) {
            stats.byCategory[category] = { count: 0, size: 0 };
          }
          stats.byCategory[category].count++;
          stats.byCategory[category].size += fileStats.size;
        }
      }
    } catch (error) {
      console.error(`收集统计信息失败 ${dirPath}:`, error);
    }
  }

  /**
   * 从路径推断分类
   */
  private getCategoryFromPath(filePath: string): string {
    const relativePath = filePath.replace(this.baseDir, '');
    const parts = relativePath.split(/[/\\]/);
    
    if (parts.includes('uploads')) return 'uploads';
    if (parts.includes('processed')) return 'processed';
    if (parts.includes('original')) return 'original';
    if (parts.includes('thumbnails')) return 'thumbnails';
    
    return 'unknown';
  }

  /**
   * 验证路径安全性
   */
  validatePath(filePath: string): boolean {
    const resolvedPath = join(this.baseDir, filePath);
    return resolvedPath.startsWith(this.baseDir);
  }
}

// 创建单例实例
export const fileStorageService = new FileStorageService();
