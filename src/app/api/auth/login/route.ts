import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { rateLimit } from '@/lib/http'

// 为开发环境添加模拟数据库功能
const useMockDatabase = process.env.USE_MOCK_DB !== 'false'

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'auth_login', 20, 60_000)
  if (limited) return limited
  try {
    const { email, password } = await request.json()
    
    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码为必填项' },
        { status: 400 }
      )
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }
    
    if (useMockDatabase) {
      console.log('使用模拟数据库模式登录')
      
      // 模拟用户验证（开发模式下，任何非空密码都视为正确）
      // 模拟用户对象
      let role = 'student' // 默认角色
      
      // 特殊管理员账号
      if (email === 'admin@example.com') {
        role = 'admin'
      } else if (email === 'teacher@example.com') {
        role = 'teacher'
      }
      
      const mockUser = {
        _id: 'mock-user-123',
        username: email.split('@')[0], // 使用邮箱前缀作为用户名
        email,
        role, // 根据邮箱设置角色
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // 生成JWT令牌
      const token = jwt.sign(
        { userId: mockUser._id, role: mockUser.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '7d' }
      )
      
      return NextResponse.json(
        { 
          message: '登录成功（模拟模式）', 
          user: mockUser,
          token,
          notice: '当前为开发模式，使用模拟用户数据'
        },
        { status: 200 }
      )
    } else {
      // 尝试真实数据库连接（保留原有代码作为备用）
      try {
        const User = (await import('@/models/User')).default
        const connectDB = (await import('@/lib/mongodb')).default
        
        // 连接数据库
        await connectDB()
        
        // 查找用户
        const user = await User.findOne({ email })
        if (!user) {
          return NextResponse.json(
            { error: '用户不存在' },
            { status: 404 }
          )
        }
        
        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: '密码错误' },
            { status: 401 }
          )
        }
        
        // 生成JWT令牌
        const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET || 'fallback-secret-key',
          { expiresIn: '7d' }
        )
        
        // 返回用户信息和令牌（不包含密码）
        const { password: _, ...userWithoutPassword } = user.toObject()
        
        return NextResponse.json(
          { message: '登录成功', user: userWithoutPassword, token },
          { status: 200 }
        )
      } catch (dbError) {
        console.error('数据库操作错误:', dbError)
        return NextResponse.json(
          { 
            error: '数据库连接失败，请稍后再试',
            notice: '在实际部署环境中需要确保MongoDB服务正常运行'
          },
          { status: 503 }
        )
      }
    }
  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { error: '请求处理过程中发生错误' },
      { status: 500 }
    )
  }
}
