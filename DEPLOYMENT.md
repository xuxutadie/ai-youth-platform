# 部署指南

本文档提供了AI少儿编程展示平台的详细部署指南，包括不同环境下的部署方法和常见问题的解决方案。

## 部署前准备

### 环境要求

- Node.js 18.0 或更高版本
- MongoDB 4.4 或更高版本
- npm 或 yarn
- Git

### 环境变量配置

在部署前，请确保已正确配置以下环境变量：

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-youth-platform

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary (for file storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 部署方式

### 1. Vercel部署（推荐）

Vercel是Next.js的官方托管平台，提供零配置部署。

#### 步骤

1. **准备代码仓库**
   - 将代码推送到GitHub、GitLab或Bitbucket

2. **导入项目到Vercel**
   - 登录[Vercel控制台](https://vercel.com/dashboard)
   - 点击"New Project"
   - 导入你的代码仓库

3. **配置环境变量**
   - 在项目设置中添加环境变量
   - 确保所有必需的环境变量都已设置

4. **部署项目**
   - Vercel会自动检测Next.js项目并进行部署
   - 部署完成后，你将获得一个公开的URL

#### 优势

- 自动HTTPS
- 全球CDN
- 自动扩展
- 零配置部署
- 与GitHub集成，自动部署

### 2. 自定义服务器部署

如果你需要更多控制权，可以在自己的服务器上部署。

#### 步骤

1. **服务器准备**
   - 安装Node.js和npm
   - 安装MongoDB并启动服务
   - 配置防火墙规则（开放3000端口）

2. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ai-youth-platform
   ```

3. **安装依赖**
   ```bash
   npm install --production
   ```

4. **配置环境变量**
   ```bash
   cp .env.local.example .env.local
   # 编辑.env.local文件，填入实际的环境变量值
   ```

5. **构建项目**
   ```bash
   npm run build
   ```

6. **启动应用**
   ```bash
   npm start
   ```

7. **使用PM2管理进程（推荐）**
   ```bash
   npm install -g pm2
   pm2 start npm --name "ai-youth-platform" -- start
   pm2 save
   pm2 startup
   ```

8. **配置反向代理（可选）**
   
   使用Nginx配置反向代理：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 3. Docker部署

使用Docker可以简化部署过程，确保环境一致性。

#### 创建Dockerfile

在项目根目录创建`Dockerfile`：

```dockerfile
# 使用官方Node.js运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm ci --only=production

# 复制项目文件
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["npm", "start"]
```

#### 创建.dockerignore文件

```
node_modules
.next
.git
.env.local
```

#### 构建和运行Docker容器

1. **构建镜像**
   ```bash
   docker build -t ai-youth-platform .
   ```

2. **运行容器**
   ```bash
   docker run -d -p 3000:3000 --env-file .env.local --name ai-youth-platform ai-youth-platform
   ```

3. **使用Docker Compose（推荐）**
   
   创建`docker-compose.yml`文件：
   ```yaml
   version: '3'
   
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
       env_file:
         - .env.local
       depends_on:
         - db
     
     db:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db
   
   volumes:
     mongo_data:
   ```
   
   启动服务：
   ```bash
   docker-compose up -d
   ```

## 生产环境优化

### 1. 性能优化

- 启用gzip压缩
- 配置CDN
- 优化图片和静态资源
- 使用缓存策略

### 2. 安全加固

- 使用HTTPS
- 设置安全头
- 限制API请求频率
- 定期更新依赖

### 3. 监控和日志

- 设置应用监控
- 配置错误报告
- 实现日志记录
- 设置健康检查

## 故障排除

### 常见问题及解决方案

1. **MongoDB连接失败**
   - 检查MongoDB服务状态
   - 验证连接字符串
   - 确认网络连接

2. **内存不足**
   - 增加服务器内存
   - 优化代码和查询
   - 使用内存分析工具

3. **端口冲突**
   - 更改应用端口
   - 检查端口占用情况

4. **环境变量未生效**
   - 确认环境变量文件位置
   - 重启应用服务
   - 检查变量名称拼写

## 维护和更新

### 定期维护任务

1. **备份**
   - 定期备份数据库
   - 备份应用代码

2. **更新**
   - 定期更新依赖包
   - 应用安全补丁

3. **监控**
   - 监控服务器资源使用情况
   - 检查应用日志

### 部署更新

1. **准备更新**
   - 测试新版本
   - 备份当前版本

2. **部署流程**
   - 停止应用服务
   - 更新代码
   - 安装新依赖
   - 重新构建
   - 启动服务

3. **回滚计划**
   - 准备回滚脚本
   - 监控新版本运行情况

## 总结

本部署指南涵盖了AI少儿编程展示平台在不同环境下的部署方法，包括Vercel、自定义服务器和Docker部署。选择适合你需求的部署方式，并确保遵循最佳实践以保证应用的稳定性和安全性。

如果在部署过程中遇到问题，请参考故障排除部分或查阅相关文档。