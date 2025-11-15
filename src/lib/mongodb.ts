import mongoose from 'mongoose'

// 为全局对象添加mongoose类型定义
declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null
    promise: Promise<mongoose.Mongoose> | null
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-youth-platform'

if (!MONGODB_URI) {
  throw new Error('请在.env.local文件中定义MONGODB_URI环境变量')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5秒超时
      connectTimeoutMS: 5000, // 5秒连接超时
      maxPoolSize: 10, // 连接池最大连接数
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('MongoDB连接失败:', e)
    throw e
  }

  return cached.conn
}

export default connectDB