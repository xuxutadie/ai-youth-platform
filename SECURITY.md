# 安全政策 / Security Policy

## 当前支持状态

当前处于首次开源发布准备阶段；未承诺长期支持版本、修复时限或生产安全认证。正式 v1.0.0 需先满足[发布检查清单](docs/releases/v1.0.0-checklist.md)。

## 报告漏洞

优先查看仓库 [Security 页面](https://github.com/xuxutadie/ai-youth-platform/security)。如果存在 “Report a vulnerability” 按钮，请通过 GitHub 私密漏洞报告提交影响、复现环境和最小复现步骤。该功能是否启用需要以页面实际状态为准。

若没有私密报告入口，请发一个不含漏洞细节的普通 Issue，请求维护者提供私密联系渠道。不要公开贴出有效 Token、密码、数据库连接串、攻击载荷或学生信息。仓库尚未公布独立安全邮箱，本文不虚构联系地址。

## 部署者责任

- 真实环境禁用模拟账户；认证密钥使用独立随机值，不采用示例值。
- 若密钥或令牌曾进入公开仓库，先在所属服务轮换或吊销，再考虑历史清理。仅删除文件不能撤销外部副本。
- 保护数据库、上传目录、JSON 元数据与备份；HTML 作品须实施隔离，不能信任上传内容。
- 正式发布前重新运行依赖审计并处理运行时可达漏洞。
- 测试和演示使用合成数据，不使用真实学生敏感资料。

## English

This project is preparing its first open-source release; no supported release line or security response SLA is promised. Use GitHub private vulnerability reporting if enabled on the Security page. Otherwise request a private contact route without publishing exploit details or personal information. Never post secrets in issues. Rotate exposed credentials before considering history cleanup; deleting a file does not invalidate copies. Production readiness requires dependency remediation, upload isolation, private data handling, and the release checklist.
