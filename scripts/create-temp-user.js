const mongoose = require('mongoose');

// 简化的用户模型定义
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 避免重复编译模型
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createTempUser() {
  try {
    // 从.env.local文件加载环境变量
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../.env.local');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          process.env[match[1]] = match[2];
        }
      });
    }
    
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('已连接到MongoDB');
    
    // 检查是否已存在临时用户
    const existingUser = await User.findOne({ email: 'temp@example.com' });
    if (existingUser) {
      console.log('临时用户已存在，ID:', existingUser._id.toString());
      process.exit(0);
    }
    
    // 创建临时用户
    const tempUser = new User({
      username: 'temp',
      email: 'temp@example.com',
      password: 'temp123',
      role: 'admin'
    });
    
    await tempUser.save();
    console.log('临时用户创建成功，ID:', tempUser._id.toString());
    
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('创建临时用户失败:', error);
    process.exit(1);
  }
}

createTempUser();