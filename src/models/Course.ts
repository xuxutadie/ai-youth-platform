import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    required: true
  },
  videoUrl: {
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
CourseSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// 只在服务器端创建模型
let Course: any

if (typeof window === 'undefined') {
  // 避免重复编译模型
  Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
}

export default Course