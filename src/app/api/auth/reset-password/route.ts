import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// 与登录/注册保持一致的开发模式开关
const useMockDatabase = true

export async function POST(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: '重置令牌与新密码为必填项' },
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
      try {
        jwt.verify(token, process.env.JWT_RESET_SECRET || 'fallback-reset-secret')
        return NextResponse.json({ message: '密码已重置（模拟模式）' }, { status: 200 })
      } catch (e) {
        return NextResponse.json({ error: '重置令牌无效或已过期' }, { status: 400 })
      }
    } else {
      try {
        const User = (await import('@/models/User')).default
        const connectDB = (await import('@/lib/mongodb')).default

        await connectDB()

        if (!email) {
          return NextResponse.json({ error: '邮箱为必填项' }, { status: 400 })
        }

        const user = await User.findOne({ email })
        if (!user) {
          return NextResponse.json({ error: '用户不存在' }, { status: 404 })
        }

        if (!user.resetPasswordToken || !user.resetPasswordExpires) {
          return NextResponse.json({ error: '未申请重置或信息缺失' }, { status: 400 })
        }

        if (new Date(user.resetPasswordExpires).getTime() < Date.now()) {
          return NextResponse.json({ error: '重置令牌已过期' }, { status: 400 })
        }

        const match = await bcrypt.compare(token, user.resetPasswordToken)
        if (!match) {
          return NextResponse.json({ error: '重置令牌不正确' }, { status: 400 })
        }

        const hashed = await bcrypt.hash(newPassword, 12)
        user.password = hashed
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        return NextResponse.json({ message: '密码重置成功' }, { status: 200 })
      } catch (dbError) {
        console.error('数据库操作错误:', dbError)
        return NextResponse.json(
          { error: '数据库连接失败，已切换到模拟模式' },
          { status: 503 }
        )
      }
    }
  } catch (error) {
    console.error('重置密码错误:', error)
    return NextResponse.json(
      { error: '请求处理过程中发生错误' },
      { status: 500 }
    )
  }
}