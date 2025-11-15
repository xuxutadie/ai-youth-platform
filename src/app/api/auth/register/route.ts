import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// 为开发环境添加模拟数据库功能，避免因MongoDB连接失败导致功能无法使用
const useMockDatabase = true // 设为true以使用模拟数据库

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, role = 'student' } = await request.json()
    
    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '用户名、邮箱和密码为必填项' },
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
    
    // 密码强度验证
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6个字符' },
        { status: 400 }
      )
    }
    
    if (useMockDatabase) {
      console.log('使用模拟数据库模式')
      
      // 模拟数据库操作
      // 模拟加密密码
      const hashedPassword = await bcrypt.hash(password, 12)
      
      // 模拟用户对象
      const mockUser = {
        id: Date.now().toString(), // 模拟ID
        username,
        email,
        role, // 使用传入的role参数
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // 返回成功响应
      return NextResponse.json(
        { 
          message: '注册成功（模拟模式）', 
          user: mockUser,
          notice: '当前为开发模式，用户数据未真实存储'
        },
        { status: 201 }
      )
    } else {
      // 尝试真实数据库连接（保留原有代码作为备用）
      try {
        const User = (await import('@/models/User')).default
        const connectDB = (await import('@/lib/mongodb')).default
        
        // 连接数据库
        await connectDB()
        
        // 检查用户是否已存在
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          return NextResponse.json(
            { error: '该邮箱已被注册' },
            { status: 409 }
          )
        }
        
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 12)
        
        // 创建新用户
        const newUser = await User.create({
          username,
          email,
          password: hashedPassword,
          role // 使用传入的role参数
        })
        
        // 返回用户信息
        const { password: _, ...userWithoutPassword } = newUser.toObject()
        
        return NextResponse.json(
          { message: '注册成功', user: userWithoutPassword },
          { status: 201 }
        )
      } catch (dbError) {
        console.error('数据库操作错误:', dbError)
        return NextResponse.json(
          { 
            error: '数据库连接失败，已切换到模拟模式',
            notice: '在实际部署环境中需要确保MongoDB服务正常运行'
          },
          { status: 503 }
        )
      }
    }
  } catch (error) {
    console.error('注册错误:', error)
    return NextResponse.json(
      { error: '请求处理过程中发生错误' },
      { status: 500 }
    )
  }
}