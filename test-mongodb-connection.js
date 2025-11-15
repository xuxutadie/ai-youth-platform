const mongoose = require('mongoose');

// 从环境变量获取MongoDB连接字符串
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-youth-platform';

console.log('尝试连接到MongoDB:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // 5秒超时
  connectTimeoutMS: 5000, // 5秒连接超时
})
.then(() => {
  console.log('✅ 成功连接到MongoDB');
  mongoose.connection.close();
  process.exit(0);
})
.catch((error) => {
  console.error('❌ 连接MongoDB失败:', error.message);
  process.exit(1);
});