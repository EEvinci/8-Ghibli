# 上传API文档

## 概述

本文档描述了图片上传API的使用方法和功能特性。

## API端点

### POST /api/upload

上传图片文件到服务器。

#### 请求格式

- **Content-Type**: `multipart/form-data`
- **方法**: POST

#### 请求参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| file | File | 是 | 要上传的图片文件 |

#### 文件限制

- **支持格式**: JPG, JPEG, PNG, WebP
- **最大大小**: 10MB
- **MIME类型**: 
  - `image/jpeg`
  - `image/jpg` 
  - `image/png`
  - `image/webp`

#### 成功响应 (200)

```json
{
  "success": true,
  "message": "文件上传成功",
  "data": {
    "fileName": "1757336223904_iaod0n9x1sp.png",
    "originalName": "image.png",
    "fileSize": 1938608,
    "fileType": "image/png",
    "fileUrl": "/uploads/1757336223904_iaod0n9x1sp.png",
    "uploadedAt": "2025-09-08T12:57:03.952Z"
  }
}
```

#### 错误响应

##### 400 Bad Request - 文件验证失败

```json
{
  "error": "不支持的文件类型",
  "details": "支持的类型: image/jpeg, image/jpg, image/png, image/webp"
}
```

```json
{
  "error": "文件过大",
  "details": "最大允许大小: 10MB"
}
```

##### 400 Bad Request - 缺少文件

```json
{
  "error": "未找到上传文件"
}
```

##### 500 Internal Server Error - 服务器错误

```json
{
  "error": "文件上传失败",
  "details": "具体错误信息"
}
```

## 前端使用示例

### 使用XMLHttpRequest (支持进度监控)

```typescript
import { uploadFile } from '../lib/upload';

const file = document.getElementById('fileInput').files[0];

uploadFile(file, (progress) => {
  console.log(`上传进度: ${progress.percentage}%`);
}).then(response => {
  console.log('上传成功:', response);
}).catch(error => {
  console.error('上传失败:', error);
});
```

### 使用fetch API

```typescript
const formData = new FormData();
formData.append('file', file);

fetch('/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('上传成功:', data.data);
  } else {
    console.error('上传失败:', data.error);
  }
})
.catch(error => {
  console.error('网络错误:', error);
});
```

## 文件存储

- 上传的文件存储在 `public/uploads/` 目录
- 文件名格式: `{timestamp}_{randomString}.{extension}`
- 文件可通过 `{baseUrl}/uploads/{fileName}` 访问

## 安全考虑

1. **文件类型验证**: 严格验证文件MIME类型
2. **文件大小限制**: 防止大文件攻击
3. **唯一文件名**: 防止文件名冲突和路径遍历攻击
4. **错误处理**: 不暴露敏感的系统信息

## 测试

访问 `/test-upload` 页面可以测试上传功能。

## 注意事项

1. 确保 `public/uploads/` 目录存在且有写权限
2. 生产环境建议使用云存储服务 (如AWS S3, 阿里云OSS等)
3. 考虑添加文件内容验证 (如检查文件头)
4. 建议添加用户认证和权限控制
