import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  // 真实姓名（可与用户名不同）
  fullName: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
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
  // 新起点班级（班级名称或编号）
  className: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  // 头像链接（URL）
  avatarUrl: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  // 教师管理的年级与班级（教师可在个人资料中设置）
  manageGrade: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
  },
  manageClassName: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
  ,
  // 密码重置支持字段（可选）
  resetPasswordToken: {
    type: String,
    required: false
  },
  resetPasswordExpires: {
    type: Date,
    required: false
  }
})

// 更新时间中间件
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// 只在服务器端创建模型
let User: any

if (typeof window === 'undefined') {
  // 避免重复编译模型
  User = mongoose.models.User || mongoose.model('User', UserSchema)
}

export default User