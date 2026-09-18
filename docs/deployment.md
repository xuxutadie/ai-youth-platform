# 部署与本地验证 / Deployment

当前版本仍存在发布阻断项。以下说明解释实际代码的运行要求，不代表已完成生产验收。

## 1. 运行条件

- Node.js 与 npm；版本要求和本轮验证环境见 README。
- 可访问的 MongoDB。不得对示例数据库使用生产凭据。
- 有持久化磁盘的 Node.js 服务：上传文件和部分元数据写入本地文件系统。
- SMTP 服务用于真实密码找回；邮件配置缺失或发送失败时返回失败，不返回重置链接。

## 2. 环境变量

保持个人 `.env.local` 不进入 Git。历史 `.env.example` / `.env.local.example` 本轮未修改，其中的示例值与 Cloudinary 项仅作历史参考；按下表配置实际使用的键。

| 键 | 用途 / 要求 |
| --- | --- |
| MONGODB_URI | 真实数据库连接；开发推荐独立 ai-youth-platform-dev 数据库 |
| JWT_SECRET | 必需，至少 32 字符独立随机值，不使用示例值 |
| JWT_RESET_SECRET | 仅本地模拟重置流程使用，也须独立随机值 |
| USE_MOCK_DB | 默认关闭；只有 development 且显式 true 才启用模拟认证 |
| NEXT_PUBLIC_APP_URL | 网站实际地址，本地 http://localhost:3000；生产使用自己的 HTTPS 域名 |
| SMTP_HOST / SMTP_PORT | 邮件服务器与端口；465 使用 TLS，其他端口由 Nodemailer 协商 |
| SMTP_USER / SMTP_PASS | 发信认证，仅服务端保存 |
| SMTP_FROM | 发件人，未配置时使用 SMTP_USER |
| ADMIN_EMAIL | 本地模拟管理员邮箱，不能替代数据库里的 admin 角色 |
| NEXT_PUBLIC_LOGO_URL | 可选的公开 Logo 地址 |
| UPLOAD_PRIMARY_ROOT | 主上传目录，默认 public/uploads；外部目录需要验证资源访问映射 |

代码还声明了 UPLOAD_SECONDARY_ROOT、UPLOAD_CAP_PRIMARY_MB、UPLOAD_CAP_SECONDARY_MB，但上传选择主要依据本地存储配置文件，不能仅设置这些变量就假定容量上限和备用存储已生效。

只有 NEXT_PUBLIC_ 前缀变量允许包含公开信息，绝不能把密码放入其中。

## 3. 验证与构建

```bash
npm ci
npm run type-check
npm run lint
node --test tests/security/auth.test.cjs
npm run build
npm start
```

构建阶段需要 TypeScript、Tailwind、PostCSS 等开发依赖，不要在构建前使用只安装生产依赖的命令。服务器环境变量必须在启动前配置；不要提交真实 .env 或把它烘焙进镜像。

生产前依次检查：新用户注册为 student；教师/管理员权限在数据库确认；错误密码被拒绝；数据库不可用时受保护接口返回失败；上传与重启后文件持久化；邮件重置链接只到达账户邮箱；备份可恢复。没有独立 MongoDB/SMTP 凭据时不能宣称已通过完整集成测试。

## 4. 部署方式限制

### 自托管 Node.js

当前持久化设计更适合具有受控磁盘的服务。应配置 HTTPS、进程管理、数据库访问限制和备份，并确保应用运行账户只有必要目录权限。仍需先修复已知安全与构建阻断项。

### Vercel / 无持久化文件系统平台

当前代码写入 public/uploads 和 public/data，不可直接视作适合无状态函数运行。需要先把文件改为持久对象存储、将非公开元数据移出静态目录，并验证所有写入路径。本仓库没有经过验证的 Cloudinary 上传后端，不能靠填写 Cloudinary 变量完成迁移。

### Docker

仓库未提供验收通过的 Dockerfile / Compose 配置。本轮不提供未经构建验证的“一键部署”命令。容器化前须明确构建依赖、运行时密钥注入、上传与元数据卷、备份与恢复流程。

## 5. 常见问题

- 认证失败：检查密钥是否达到要求，是否仍在用旧令牌；修改密钥会使旧令牌失效。
- 503：检查 MongoDB 或邮件配置；不要通过开启模拟认证绕过生产错误。
- 注册后不是管理员：这是预期行为，不能提交 role 字段自助提权。
- 文件重启后丢失：检查磁盘是否持久化、目录是否被重新部署覆盖。
- Windows 大小写或路径问题：按仓库相对路径运行命令，不执行历史脚本中的个人机器路径。

## English deployment summary

Use an isolated MongoDB and a Node.js host with persistent disk. Set JWT_SECRET to a random value of at least 32 characters, USE_MOCK_DB=false, and NEXT_PUBLIC_APP_URL to the real application URL. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and optionally SMTP_FROM for password reset. Build with development dependencies installed via npm ci. Run the verification commands above before npm start. Mock authentication is only available when explicitly enabled in development. Administrator bootstrap requires a verified database role assignment. Current local uploads and JSON persistence prevent claiming a ready-to-use serverless/Vercel deployment. No verified Docker setup is provided. Full database, mail, backup, and persistence integration tests remain required before production use.
