# 数据库配置说明

## 问题描述

当前系统出现MongoDB连接认证失败的问题，错误信息如下：
```
MongoServerError: bad auth : authentication failed
```

## 解决方案

### 方案1: 配置MongoDB连接（推荐）

1. **检查环境变量**
   ```bash
   # 检查 .env.local 文件
   cat .env.local | grep MONGODB_URI
   ```

2. **配置正确的MongoDB URI**
   在 `.env.local` 文件中添加或更新：
   ```env
   MONGODB_URI=mongodb://username:password@host:port/database
   # 或者使用MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

3. **验证数据库连接**
   ```bash
   curl http://localhost:3000/api/health/database
   ```

### 方案2: 使用本地存储模式（当前实现）

系统已经实现了降级机制，在数据库不可用时自动使用本地文件系统：

- ✅ 文件存储功能正常
- ✅ 本地统计API可用
- ✅ 基础清理功能可用
- ⚠️ 高级功能受限（元数据管理、重复检测等）

## 功能对比

| 功能 | 数据库模式 | 本地模式 |
|------|------------|----------|
| 文件上传 | ✅ 完整功能 | ✅ 基础功能 |
| 文件存储 | ✅ 完整功能 | ✅ 完整功能 |
| 元数据记录 | ✅ 完整功能 | ❌ 不可用 |
| 文件搜索 | ✅ 完整功能 | ❌ 不可用 |
| 重复检测 | ✅ 完整功能 | ❌ 不可用 |
| 统计报告 | ✅ 详细统计 | ✅ 基础统计 |
| 清理功能 | ✅ 完整功能 | ✅ 基础功能 |
| 用户管理 | ✅ 完整功能 | ❌ 不可用 |

## API端点说明

### 完整功能API（需要数据库）
- `POST /api/upload` - 完整上传功能
- `GET /api/files` - 文件管理
- `GET /api/storage/stats` - 完整统计
- `POST /api/storage/cleanup` - 完整清理

### 降级功能API（无需数据库）
- `POST /api/upload-test` - 基础上传测试
- `GET /api/storage/stats-local` - 本地统计
- `POST /api/storage/cleanup-local` - 基础清理

## 数据库配置步骤

### 本地MongoDB

1. **安装MongoDB**
   ```bash
   # macOS
   brew install mongodb-community
   
   # Ubuntu
   sudo apt-get install mongodb
   ```

2. **启动MongoDB服务**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Ubuntu
   sudo systemctl start mongodb
   ```

3. **配置连接字符串**
   ```env
   MONGODB_URI=mongodb://localhost:27017/ghibli-img
   ```

### MongoDB Atlas（云数据库）

1. **创建Atlas账号**
   - 访问 https://cloud.mongodb.com
   - 注册并创建免费集群

2. **获取连接字符串**
   - 在Atlas控制台点击 "Connect"
   - 选择 "Connect your application"
   - 复制连接字符串

3. **配置环境变量**
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### Docker MongoDB

1. **运行MongoDB容器**
   ```bash
   docker run -d \
     --name mongodb \
     -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password \
     mongo:latest
   ```

2. **配置连接字符串**
   ```env
   MONGODB_URI=mongodb://admin:password@localhost:27017/ghibli-img?authSource=admin
   ```

## 测试验证

### 数据库连接测试
```bash
# 检查数据库健康状态
curl http://localhost:3000/api/health/database

# 测试完整上传功能
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.png"

# 测试统计功能
curl http://localhost:3000/api/storage/stats
```

### 降级模式测试
```bash
# 测试本地上传功能
curl -X POST http://localhost:3000/api/upload-test \
  -F "file=@test.png"

# 测试本地统计功能
curl http://localhost:3000/api/storage/stats-local
```

## 故障排除

### 常见错误

1. **认证失败**
   - 检查用户名密码是否正确
   - 确认数据库用户有相应权限
   - 检查网络连接

2. **连接超时**
   - 检查网络连接
   - 确认MongoDB服务是否运行
   - 检查防火墙设置

3. **SSL/TLS错误**
   - 对于Atlas，确保使用正确的连接字符串
   - 检查SSL证书配置

### 调试步骤

1. **查看详细错误日志**
   ```bash
   # 检查服务器日志
   tail -f /path/to/your/app/logs
   ```

2. **测试数据库连接**
   ```bash
   # 使用mongo shell测试
   mongo "mongodb+srv://cluster.mongodb.net/test" --username <username>
   ```

3. **检查环境变量**
   ```bash
   # 确认环境变量已加载
   node -e "console.log(process.env.MONGODB_URI)"
   ```

## 当前状态

- ✅ 文件存储系统正常工作
- ✅ 本地模式API已实现
- ✅ 降级机制已激活
- ⚠️ 数据库连接需要配置
- ℹ️ 系统可以在无数据库模式下正常使用基础功能

## 建议

1. **开发环境**: 使用本地MongoDB或Docker
2. **测试环境**: 使用MongoDB Atlas免费层
3. **生产环境**: 使用MongoDB Atlas专业版或自建集群
4. **临时方案**: 继续使用当前的本地模式

---

**更新时间**: 2025-09-09  
**版本**: v1.1.0
