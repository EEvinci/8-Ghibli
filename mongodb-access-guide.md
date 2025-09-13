# MongoDB数据查看指南

## 🌐 MongoDB Atlas网页端查看

### 1. 登录MongoDB Atlas
- 访问：https://cloud.mongodb.com
- 使用您的MongoDB账号登录

### 2. 进入集群
- 选择您的集群：`ClusterGhibli`
- 点击 "Browse Collections" 按钮

### 3. 查看数据集合

#### 📁 用户数据集合 (`users`)
- 集合名：`users`
- 包含字段：
  - `email`: 用户邮箱
  - `name`: 用户姓名
  - `photo`: 用户头像URL
  - `googleId`: Google账号ID
  - `usage`: 使用统计信息
  - `createdAt`, `updatedAt`, `lastLoginAt`: 时间戳

#### 📁 文件元数据集合 (`filemetadatas`)
- 集合名：`filemetadatas`
- 包含字段：
  - `originalName`: 原始文件名
  - `fileName`: 存储文件名
  - `fileSize`: 文件大小
  - `fileType`: 文件类型
  - `hash`: 文件哈希值
  - `publicUrl`: 公开访问URL
  - `userId`: 关联用户ID
  - `category`: 文件分类
  - `status`: 文件状态
  - `createdAt`, `updatedAt`: 时间戳

### 4. 查看具体数据
- 点击集合名称查看所有文档
- 可以使用过滤器搜索特定数据
- 例如：`{ "status": "uploaded" }` 查看已上传的文件

## 🔍 当前存储的数据

根据日志显示，已成功存储的文件：
- **文件名**: `1757696213482_512b3751f23e96a7.png`
- **原始名**: `浅灰色大理石质感背景，展开的羊皮卷轴居中 悬浮。卷轴左侧雕刻_三个方法、四个模版、一个框架_立体鎏金文字，右侧叠加半透明信息蓝图图表，底部排列四个发光水晶方块，背景.png`
- **文件大小**: 5,878,482 bytes (约5.6MB)
- **存储状态**: `uploaded`
- **MongoDB ID**: `68c450d5b0b578a3a1753099`

## 📊 验证数据完整性

在MongoDB Atlas中，您可以：
1. 查看文档总数
2. 检查数据字段完整性
3. 验证索引创建状态
4. 查看存储使用情况

## 🛠️ 使用MongoDB Compass（可选）

如果您安装了MongoDB Compass：
1. 使用连接字符串连接到数据库
2. 浏览集合和文档
3. 执行查询和聚合操作
