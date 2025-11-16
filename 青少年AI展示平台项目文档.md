# 青少年AIGC成果展示平台 — 项目文档

## 概述
- 针对青少年AIGC成果展示的平台，支持角色权限、内容上传与管理。
- 主要角色：游客、学员（student）、教师（teacher）、管理员（admin）。
- 技术栈：`Next.js (App Router) + React + Tailwind CSS`；鉴权使用 `JWT`；后端路由位于 `src/app/api`。

## 快速开始
- 位置：`全栈开发/ai-youth-platform`
- 环境：`Node.js 18+`、`npm`（建议使用 LTS）
- 安装依赖：`npm install`
- 启动开发：
  - 默认：`npm run dev`（端口 `3000`，如占用会自动切换为 `3001`）
  - 指定端口：`npm run dev -- -p 3000`
- 访问示例：`http://localhost:3000/`、`/login`、`/works`、`/profile`

## 环境变量
- 示例文件：`ai-youth-platform/.env.local.example`
- 关键变量：
  - `MONGODB_URI`：MongoDB 连接字符串（本地或云端）
  - `JWT_SECRET`：JWT 密钥（生产环境必须更换）
  - `NEXT_PUBLIC_LOGO_URL`：前端 Logo 地址（支持远程 URL 或 `public/` 内资源）

## 前端页面路由
- 核心布局：`src/app/layout.tsx`，全局使用 `ResizableLayout` + `Sidebar`。
- 主要页面：
  - `/` 首页
  - `/competitions` 赛事列表；`/competitions/[id]` 详情
  - `/works` 作品列表；`/works/[id]` 详情；`/my-works` 我的作品
  - `/honors` 荣誉列表；`/honors/[id]` 详情
  - `/courses` 课程列表；`/courses/[id]` 详情
  - `/search` 全站搜索
  - `/admin` 后台管理
  - 账号相关：`/login`、`/register`、`/forgot-password`、`/reset-password`、`/profile`、`/profile/change-password`

## 后端接口速览（`src/app/api`）
- 认证与账号：
  - `POST /api/auth/login` 登录
  - `POST /api/auth/register` 注册
  - `POST /api/auth/reset-password` 重置密码（邮箱流程）
  - `POST /api/auth/change-password` 修改密码（已实现，需登录）
- 用户资料：
  - `GET /api/profile` 获取当前用户资料（需登录）
  - `PUT /api/profile` 更新资料（需登录）
  - `POST /api/upload/avatar` 上传头像（需登录）
- 内容管理（示例）：
  - `GET /api/works`、`GET /api/works/[id]` 获取作品；`POST /api/works/upload` 上传作品
  - `GET /api/honors`、`POST /api/honors`（可能附带上传）
  - `GET /api/courses`、`POST /api/courses/upload`
  - `GET /api/competitions`、`GET /api/competitions/[id]`
  - `GET /api/search` 站内检索；`/api/pinned` 置顶内容

## 认证与权限
- 客户端状态：`src/hooks/useAuth.ts` 管理用户与 token；`src/lib/api.ts` 自动从 `localStorage` 附带 `Authorization: Bearer <token>`。
- 服务端鉴权：`src/lib/auth.ts` 提供 `authMiddleware`；验证 `JWT`，尝试连接数据库获取用户并校验角色；若数据库不可用，回退为使用 `JWT` 中的角色信息。
- 角色策略：
  - 游客：可浏览公开内容
  - 学员：可上传作品
  - 教师：可上传赛事、荣誉、课程
  - 管理员：可管理用户与所有内容

## 文件上传
- 头像上传：`POST /api/upload/avatar`（表单数据 `file`）
- 作品上传：`POST /api/works/upload`（视实现类型为图片/视频/网页）
- 前端示例组件：`src/components/FileUploadButton.tsx`、`UploadButton.tsx`

## 项目结构概览
- `src/app`：页面与 API 路由（App Router）
- `src/components`：通用组件（`Sidebar`、`ResizableLayout`、`HeroSection`、`AvatarCropper` 等）
- `src/lib`：工具与中间件（`api.ts`、`auth.ts`、`mongodb.ts`）
- `src/models`：Mongoose 模型（如 `User`）
- `public`：静态资源（Logo 等）
- `tailwind.config.js`、`globals.css`：样式配置与全局样式

## 最近更新
- 修改密码页视觉优化：背景改为浅色卡片、输入与按钮可读性提升（`/profile/change-password`）。
- 侧栏展开按钮与收起按钮样式统一：位置固定、75% 垂直、同一色系与边框（`ResizableLayout.tsx` 与 `Sidebar.tsx`）。
- 新增后端路由：`POST /api/auth/change-password`，使用 `authMiddleware` 鉴权；数据库模式下校验旧密码、加盐更新新密码；数据库不可用时进行合理回退。

## 部署与数据库切换
- 生产环境务必设置：`MONGODB_URI`、`JWT_SECRET`。
- 若数据库暂不可用，后端会回退为基于 `JWT` 的鉴权信息（仍可正常访问需要登录的接口，但涉及数据写入的功能需连接数据库）。
- 详细部署说明参见：`DEPLOYMENT.md`。

## 测试与验证
- 提供多个脚本与用例：`test-api*.js`、`test-upload*.js`、`test-admin*.js`、`test-delete*.js` 等。
- 开发自检建议：
  - 登录：访问 `/login` 并确认管理员与普通用户跳转逻辑
  - 资料页：`/profile` 加载与保存信息、头像上传与裁剪
  - 修改密码：`/profile/change-password` 成功与错误提示
  - 作品页：`/works` 列表展示与上传入口可见性（按角色）
  - 后台页：`/admin` 仅管理员可访问

## 风格与体验
- 主色系为青色系，浅色/深色模式兼容。
- 全局布局采用固定侧栏（桌面端）与顶部栏（移动端），支持主题切换与搜索。

—— 以上为当前实现状态的权威说明。如需我按页面逐项做视觉/交互巡检与优化清单，请告知我目标优先级（性能/可用性/一致性）。
