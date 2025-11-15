import mongoose from 'mongoose'

const HonorSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  imageUrl: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
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
HonorSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// 只在服务器端创建模型
let Honor: any

if (typeof window === 'undefined') {
  // 避免重复编译模型
  Honor = mongoose.models.Honor || mongoose.model('Honor', HonorSchema)
}

export default Honor