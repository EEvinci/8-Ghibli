# OpenAI API 配置和超时处理指南

## 🔧 环境配置

### 1. 创建环境变量文件
在项目根目录创建 `.env.local` 文件：

```env
# OpenAI API 配置
OPENAI_API_KEY=your_openai_api_key_here

# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/ghibli-img

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 2. 获取 OpenAI API Key
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 登录或注册账户
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env.local` 文件

## ⏱️ 超时处理解决方案

### 1. 服务器端超时处理
- **API 超时**: 60秒
- **重试机制**: 3次重试
- **错误处理**: 详细的错误信息

### 2. 客户端超时处理
- **请求超时**: 2分钟
- **AbortController**: 支持请求取消
- **用户提示**: 友好的超时提示

### 3. 常见超时原因和解决方案

#### 网络问题
```javascript
// 解决方案：增加重试机制
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

#### API 限制
```javascript
// 解决方案：实现队列机制
const requestQueue = [];
const processQueue = async () => {
  if (requestQueue.length === 0) return;
  const request = requestQueue.shift();
  try {
    await request();
  } catch (error) {
    console.error('Queue processing error:', error);
  }
  setTimeout(processQueue, 1000); // 1秒间隔
};
```

#### 大文件处理
```javascript
// 解决方案：文件压缩和分块上传
const compressImage = (file, maxSize = 1024 * 1024) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.sqrt(maxSize / (img.width * img.height));
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

## 🚀 测试 API 连接

### 运行测试脚本
```bash
# 设置环境变量
export OPENAI_API_KEY=your_api_key_here

# 运行测试
node scripts/test-openai.js
```

### 测试内容
1. **文本生成测试** - 验证基础 API 连接
2. **图片生成测试** - 验证 DALL-E 3 功能
3. **图片编辑测试** - 验证 DALL-E 2 功能
4. **超时处理测试** - 验证超时机制

## 📊 性能优化建议

### 1. 缓存机制
```javascript
// 实现结果缓存
const cache = new Map();
const getCachedResult = (key) => cache.get(key);
const setCachedResult = (key, value) => cache.set(key, value);
```

### 2. 进度指示
```javascript
// 显示处理进度
const [progress, setProgress] = useState(0);
const updateProgress = (step) => {
  const steps = ['上传中', 'AI处理中', '生成中', '完成'];
  setProgress((step / steps.length) * 100);
};
```

### 3. 错误恢复
```javascript
// 自动重试机制
const autoRetry = async (fn, maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      console.log(`重试第 ${attempt} 次...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

## 🔍 调试技巧

### 1. 启用详细日志
```javascript
// 在 API 路由中添加日志
console.log('OpenAI API 调用开始:', { style, fileSize: imageFile.size });
console.log('OpenAI API 响应:', { success: result.success, hasImage: !!result.imageUrl });
```

### 2. 监控 API 使用
```javascript
// 跟踪 API 调用统计
const apiStats = {
  totalCalls: 0,
  successCalls: 0,
  errorCalls: 0,
  averageResponseTime: 0
};
```

### 3. 用户反馈
```javascript
// 提供详细的用户反馈
const getErrorMessage = (error) => {
  if (error.message.includes('timeout')) return '请求超时，请重试';
  if (error.message.includes('rate limit')) return '请求过于频繁，请稍后重试';
  if (error.message.includes('quota')) return 'API 配额不足，请检查账户';
  return '未知错误，请联系技术支持';
};
```

## 📝 最佳实践

1. **设置合理的超时时间** - 根据操作复杂度调整
2. **实现优雅的错误处理** - 提供用户友好的错误信息
3. **添加重试机制** - 处理临时网络问题
4. **监控 API 使用** - 避免超出配额限制
5. **缓存常用结果** - 减少重复 API 调用
6. **提供进度反馈** - 改善用户体验

## 🆘 故障排除

### 常见错误
- **401 Unauthorized**: API Key 无效或过期
- **429 Too Many Requests**: 请求频率过高
- **500 Internal Server Error**: 服务器内部错误
- **Timeout**: 请求超时

### 解决步骤
1. 检查 API Key 是否正确
2. 验证网络连接
3. 查看服务器日志
4. 检查 API 配额
5. 尝试减少请求频率



