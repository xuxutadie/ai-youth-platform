# 路线图 / Roadmap

以下是计划，不是已实现功能或交付时间承诺。

## 发布前

- [ ] 修复依赖审计中的严重与高危问题，并验证框架升级兼容性。
- [ ] 隔离不可信 HTML 作品与应用账户信息，评估迁移 HttpOnly 会话。
- [ ] 将非公开元数据移出 public，并定义访问权限与迁移步骤。
- [ ] 真实 MongoDB 与 SMTP 集成测试；验证角色变更、重置密码和上传流程。
- [ ] 移除或隔离 src 中剩余调试路由，确认生产路由清单。
- [ ] 核验图片和第三方素材授权，补充来源说明。
- [ ] 通过构建及部署验收后，再更新版本、合并并创建 v1.0.0。

## 后续方向

- [ ] 可重复的管理员初始化与数据库维护工具。
- [ ] 统一存储模型，减少 MongoDB 与本地 JSON 双重来源。
- [ ] 经验证的持久化部署示例、备份与恢复演练。
- [ ] 经授权的教学截图、教学案例和教师使用指南。
- [ ] 扩展角色权限和内容管理自动化测试。

## English

Before release: remediate dependencies, isolate untrusted HTML, protect private metadata, verify real MongoDB/SMTP flows, remove development-only routes, confirm asset rights, and pass build/deployment acceptance. Future work includes repeatable administrator bootstrap, unified persistence, backup/restore validation, authorized teaching examples, and broader permission tests. These are proposals, not completed features or dated commitments.
