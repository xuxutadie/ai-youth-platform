# 架构与数据来源

页面和 API 位于 src/app；可复用界面在 src/components；用户、作品、赛事、荣誉和课程模型位于 src/models。src/lib/mongodb.ts 管理 Mongoose 连接，src/lib/auth.ts 负责受保护接口的身份与角色校验。

账户角色为 student、teacher、admin。注册只创建 student；受保护操作应以数据库当前角色为准。模拟模式必须显式开启，仅供本地演示。

上传流程仍混用 MongoDB 与 public/data 内的 JSON 元数据；src/lib/storage.ts 与 src/config/storage.ts 提供本地存储目录选择，文件读取接口为 /api/uploads/file。该设计需要后续统一持久化并区分公开内容和私密信息。

数据模型包括 User、Work、Competition、Honor、Course；字段以对应源码为准，本文不宣称它们已经构成完备的学习档案或教学分析系统。
