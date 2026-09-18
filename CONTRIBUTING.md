# 贡献指南 / Contributing

欢迎贡献教学案例、文档、缺陷修复和测试。重大功能、依赖变动、数据模型和权限调整请先开 Issue 说明使用场景、方案与兼容性影响。

## 开发步骤

1. Fork 或创建独立分支，按 README 配置隔离数据库。
2. 使用 `npm ci` 安装锁定依赖；不随意删除锁文件。
3. 保持现有 Next.js / TypeScript 风格，关键逻辑使用清晰注释；避免无关重构。
4. 运行 `npm run type-check`、`npm run lint`、`node --test tests/security/auth.test.cjs`、`npm run build`。
5. PR 说明问题、修改效果、验证结果与未完成项；界面变化附脱敏截图。

认证和权限修改应有拒绝访问用例。不要把历史脚本的日志当成当前通过证据；不要对生产库运行 `tests/manual/` 中的删除、造数或密码脚本。

不提交真实 Token、.env、数据库备份、学生姓名与联系方式、未经授权的照片或课程资源。安全问题请先读 [SECURITY.md](SECURITY.md)。

## English

Discuss substantial features, dependencies, schema changes, and authorization changes in an issue before implementing them. Use an isolated database and `npm ci`, keep changes focused, and run the checks above. Include expected behavior, verification, and limitations in your PR. Add denial-path tests for security changes. Never run archived destructive scripts against production or submit credentials or identifiable student data.

Contributions are offered under the repository's MIT license; only submit content you have the right to contribute. Community conduct follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
