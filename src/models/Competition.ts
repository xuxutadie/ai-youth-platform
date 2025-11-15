import mongoose from 'mongoose'

const CompetitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  date: {
    type: String,
    required: true
  },
  imageUrl: {
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
CompetitionSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// 只在服务器端创建模型
let Competition: any

if (typeof window === 'undefined') {
  // 避免重复编译模型
  Competition = mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema)
}

export default Competition