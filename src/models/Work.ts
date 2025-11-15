import mongoose from 'mongoose'

const WorkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['image', 'video', 'html']
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  className: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50,
    default: ''
  },
  // 新增年级字段，用于与班级区分显示
  grade: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50,
    default: ''
  },
  url: {
    type: String,
    required: true
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// 更新时间中间件
WorkSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// 只在服务器端创建模型
let Work: any

if (typeof window === 'undefined') {
  // 避免重复编译模型
  Work = mongoose.models.Work || mongoose.model('Work', WorkSchema)
}

export default Work