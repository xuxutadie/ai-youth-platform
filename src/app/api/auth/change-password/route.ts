import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { authMiddleware } from '@/lib/auth'

// 与登录/注册保持一致的开发模式开关
const useMockDatabase = true

export async function POST(request: NextRequest) {
  try {
    // 需要登录后才能修改密码
    const auth = await authMiddleware(request)
    if (auth instanceof NextResponse) return auth

    const { oldPassword, newPassword } = await request.json().catch(() => ({ }))

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: '旧密码与新密码为必填项' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码长度至少为6个字符' },
        { status: 400 }
      )
    }

    if (useMockDatabase) {
      // 演示/开发模式：不校验旧密码，直接返回成功
      // 实际部署时请将 useMockDatabase 设为 false
      return NextResponse.json({ message: '密码修改成功（模拟模式）' }, { status: 200 })
    }

    try {
      const User = (await import('@/models/User')).default
      const connectDB = (await import('@/lib/mongodb')).default

      await connectDB()

      const userId = (auth as any).userId
      const user = await User.findById(userId)
      if (!user) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 })
      }

      const ok = await bcrypt.compare(oldPassword, user.password)
      if (!ok) {
        return NextResponse.json({ error: '旧密码不正确' }, { status: 401 })
      }

      const hashed = await bcrypt.hash(newPassword, 12)
      user.password = hashed
      user.updatedAt = new Date()
      await user.save()

      return NextResponse.json({ message: '密码修改成功' }, { status: 200 })
    } catch (dbError) {
      console.error('数据库操作错误:', dbError)
      return NextResponse.json(
        { error: '数据库连接失败，已切换到模拟模式' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('修改密码错误:', error)
    return NextResponse.json(
      { error: '请求处理过程中发生错误' },
      { status: 500 }
    )
  }
}