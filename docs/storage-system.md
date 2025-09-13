# 图片存储和管理系统

## 概述

本文档详细介绍了图片存储和管理系统的设计、实现和使用方法。该系统提供了安全、高效、可扩展的本地图片存储解决方案。

## 系统架构

### 核心组件

1. **FileStorageService** - 核心存储服务
2. **FileMetadata Model** - 文件元数据模型
3. **存储API** - RESTful API接口
4. **管理界面** - Web管理界面

### 技术栈

- **后端**: Next.js API Routes
- **数据库**: MongoDB (Mongoose ODM)
- **存储**: 本地文件系统
- **前端**: React + TypeScript + Tailwind CSS

## 存储结构

### 目录组织

```
public/storage/
├── images/
│   ├── uploads/          # 用户上传的原始图片
│   │   ├── 2025/
│   │   │   ├── 01/      # 按月份组织
│   │   │   ├── 02/
│   │   │   └── ...
│   │   └── 2026/
│   ├── processed/       # AI处理后的图片
│   ├── original/        # 原始文件备份
│   └── temp/           # 临时处理文件
├── thumbnails/         # 缩略图
└── temp/              # 临时文件
```

### 文件命名策略

#### 安全文件名生成

```typescript
// 格式: {timestamp}_{hash}.{extension}
// 示例: 1757399909080_988edc72b79d89e8.png
```

#### 命名规则

1. **时间戳**: 确保文件名唯一性
2. **哈希**: 基于用户ID、时间戳和随机数生成
3. **扩展名**: 保持原始文件扩展名
4. **安全性**: 防止路径遍历和特殊字符

## 文件元数据

### 数据模型

```typescript
interface FileMetadata {
  id: string;                    // 唯一标识符
  originalName: string;          // 原始文件名
  fileName: string;              // 存储文件名
  fileSize: number;              // 文件大小（字节）
  fileType: string;              // MIME类型
  mimeType: string;              // MIME类型
  extension: string;             // 文件扩展名
  hash: string;                  // 文件哈希（SHA-256）
  relativePath: string;          // 相对路径
  absolutePath: string;          // 绝对路径
  publicUrl: string;             // 公共访问URL
  uploadedAt: Date;              // 上传时间
  userId?: string;               // 用户ID
  category: string;              // 分类
  tags: string[];                // 标签
  dimensions?: {                 // 图片尺寸
    width: number;
    height: number;
  };
  status: string;                // 状态
  metadata: {                    // 扩展元数据
    exif?: Record<string, any>;
    colorProfile?: string;
    hasTransparency?: boolean;
  };
  versions: Array<{              // 文件版本
    type: string;
    fileName: string;
    publicUrl: string;
    fileSize: number;
    dimensions?: { width: number; height: number };
    createdAt: Date;
  }>;
  accessCount: number;           // 访问次数
  lastAccessedAt?: Date;         // 最后访问时间
}
```

### 状态管理

- `uploading` - 上传中
- `uploaded` - 已上传
- `processing` - 处理中
- `processed` - 已处理
- `failed` - 失败
- `deleted` - 已删除

## API接口

### 上传接口

#### POST /api/upload

**请求参数:**
- `file` (File) - 图片文件
- `userId` (string, 可选) - 用户ID
- `category` (string, 可选) - 分类
- `tags` (string, 可选) - 标签（逗号分隔）

**响应示例:**
```json
{
  "success": true,
  "message": "文件上传成功",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fileName": "1757399909080_988edc72b79d89e8.png",
    "originalName": "image.png",
    "fileSize": 1938608,
    "fileType": "image/png",
    "fileUrl": "/storage/images/uploads/2025/09/1757399909080_988edc72b79d89e8.png",
    "hash": "40fb6e0d31552b263b77118b4e794cde6b923b0d997d207bffb8dd2d68da8b10",
    "category": "uploads",
    "tags": ["test", "demo"],
    "uploadedAt": "2025-09-09T06:38:29.084Z"
  }
}
```

### 文件管理接口

#### GET /api/files

**查询参数:**
- `page` - 页码
- `limit` - 每页数量
- `userId` - 用户ID筛选
- `category` - 分类筛选
- `tags` - 标签筛选
- `sortBy` - 排序字段
- `sortOrder` - 排序方向

#### DELETE /api/files?id={fileId}

**查询参数:**
- `id` - 文件ID
- `permanent` - 是否永久删除

### 存储统计接口

#### GET /api/storage/stats

**响应包含:**
- 总体统计
- 分类统计
- 文件类型统计
- 月度统计
- 最近文件

### 存储清理接口

#### POST /api/storage/cleanup

**请求体:**
```json
{
  "action": "temp_files|deleted_files|orphaned_files|duplicates|all",
  "olderThanDays": 7,
  "dryRun": true
}
```

## 安全特性

### 文件验证

1. **文件类型验证**
   - 严格的MIME类型检查
   - 支持的格式: JPG, PNG, WebP
   - 文件头验证

2. **文件大小限制**
   - 最大文件大小: 10MB
   - 可配置的大小限制

3. **路径安全**
   - 路径遍历防护
   - 安全的文件名生成
   - 目录权限控制

### 访问控制

1. **用户隔离**
   - 基于用户ID的文件隔离
   - 权限验证

2. **URL安全**
   - 不可预测的文件名
   - 访问令牌（可选）

## 性能优化

### 存储优化

1. **文件去重**
   - 基于SHA-256哈希的重复检测
   - 自动清理重复文件

2. **版本管理**
   - 支持文件多版本
   - 缩略图生成
   - 压缩版本

3. **缓存策略**
   - 元数据缓存
   - CDN支持准备

### 清理机制

1. **自动清理**
   - 临时文件清理
   - 已删除文件清理
   - 孤儿文件检测

2. **存储监控**
   - 存储空间统计
   - 使用量监控
   - 告警机制

## 管理界面

### 存储管理页面 (`/storage-admin`)

**功能包括:**
- 存储统计概览
- 文件分类统计
- 存储清理工具
- 最近文件列表

### 测试页面 (`/storage-test`)

**功能包括:**
- 文件上传测试
- 存储功能验证
- 系统特性展示

## 使用示例

### 基本上传

```typescript
import { fileStorageService } from './lib/storage';

// 存储文件
const metadata = await fileStorageService.storeFile(file, {
  userId: 'user123',
  category: 'uploads',
  tags: ['avatar', 'profile']
});
```

### 文件管理

```typescript
// 获取文件信息
const fileInfo = await fileStorageService.getFileInfo(filePath);

// 删除文件
await fileStorageService.deleteFile(filePath);

// 清理临时文件
const deletedCount = await fileStorageService.cleanupTempFiles(24);
```

### 统计查询

```typescript
// 获取存储统计
const stats = await fileStorageService.getStorageStats();

// 数据库统计
const dbStats = await FileMetadata.getStorageStats();
```

## 配置选项

### 存储配置

```typescript
export const STORAGE_CONFIG = {
  BASE_DIR: join(process.cwd(), 'public', 'storage'),
  IMAGES_DIR: 'images',
  TEMP_DIR: 'temp',
  THUMBNAILS_DIR: 'thumbnails',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  SUPPORTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};
```

## 部署建议

### 生产环境

1. **存储位置**
   - 使用专用存储服务器
   - 配置CDN加速
   - 定期备份

2. **数据库优化**
   - 索引优化
   - 连接池配置
   - 读写分离

3. **监控和日志**
   - 存储使用量监控
   - 错误日志记录
   - 性能监控

### 扩展性

1. **云存储集成**
   - AWS S3支持
   - 阿里云OSS支持
   - 多云存储策略

2. **微服务架构**
   - 存储服务独立部署
   - API网关集成
   - 负载均衡

## 测试验证

### 功能测试

访问测试页面进行功能验证:
- `/storage-test` - 存储功能测试
- `/storage-admin` - 管理界面测试

### API测试

```bash
# 上传测试
curl -X POST http://localhost:3000/api/upload-test \
  -F "file=@test.png" \
  -F "category=uploads" \
  -F "tags=test,demo"

# 统计测试
curl http://localhost:3000/api/storage/stats

# 清理测试
curl -X POST http://localhost:3000/api/storage/cleanup \
  -H "Content-Type: application/json" \
  -d '{"action":"temp_files","dryRun":true}'
```

## 故障排除

### 常见问题

1. **上传失败**
   - 检查目录权限
   - 验证文件类型
   - 检查磁盘空间

2. **文件访问失败**
   - 检查文件路径
   - 验证URL配置
   - 检查权限设置

3. **数据库连接问题**
   - 检查MongoDB连接
   - 验证环境变量
   - 检查网络连接

### 日志分析

系统会记录详细的操作日志，包括:
- 文件上传日志
- 错误信息日志
- 性能监控日志

---

**版本**: v1.0.0  
**更新时间**: 2025-09-09  
**作者**: AI Assistant
