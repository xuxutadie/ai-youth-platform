import { isMockAuthEnabled, requireAuthSecret } from '@/lib/auth-config'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const useMockDatabase = isMockAuthEnabled()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: '邮箱为必填项' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '请输入有效的邮箱地址' }, { status: 400 })
    }

    if (useMockDatabase) {
      // 生成短期有效的重置令牌（模拟模式）
      const token = jwt.sign(
        { email },
        requireAuthSecret('JWT_RESET_SECRET'),
        { expiresIn: '15m' }
      )
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
      return NextResponse.json(
        {
          message: '重置链接已生成（模拟模式）',
          resetToken: token,
          resetUrl,
          notice: '当前为开发模式，不发送邮件。请使用上述链接完成重置。'
        },
        { status: 200 }
      )
    } else {
      try {
        const User = (await import('@/models/User')).default
        const connectDB = (await import('@/lib/mongodb')).default

        await connectDB()
        const user = await User.findOne({ email })
        if (!user) {
          return NextResponse.json({ error: '用户不存在' }, { status: 404 })
        }

        // 邮件配置缺失时拒绝生成重置链接，避免通过响应泄露凭据。
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
          return NextResponse.json({ error: '密码重置邮件服务未配置' }, { status: 503 })
        }

        const rawToken = crypto.randomBytes(32).toString('hex')
        const tokenHash = await bcrypt.hash(rawToken, 12)

        user.resetPasswordToken = tokenHash
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000)
        await user.save()

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
        const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`

        // 重置链接只能发往账户邮箱，不能返回给未登录的调用者。
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          try {
            const nodemailer = await import('nodemailer')
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT || 587),
              secure: Number(process.env.SMTP_PORT || 587) === 465,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
              }
            })

            await transporter.sendMail({
              from: process.env.SMTP_FROM || process.env.SMTP_USER,
              to: email,
              subject: '密码重置',
              text: `请点击以下链接重置密码（15分钟内有效）：\n${resetUrl}`
            })

            return NextResponse.json({ message: '重置邮件已发送' }, { status: 200 })
          } catch (mailErr) {
            console.error('邮件发送失败:', mailErr)
            // 邮件失败时拒绝请求，不暴露重置链接。
            return NextResponse.json({ error: '重置邮件发送失败，请稍后再试' }, { status: 503 })
          }
        }

        return NextResponse.json({ error: '重置邮件发送失败，请稍后再试' }, { status: 503 })
      } catch (dbError) {
        console.error('数据库操作错误:', dbError)
        return NextResponse.json(
          { error: '数据库连接失败，请稍后再试' },
          { status: 503 }
        )
      }
    }
  } catch (error) {
    console.error('忘记密码错误:', error)
    return NextResponse.json({ error: '请求处理过程中发生错误' }, { status: 500 })
  }
}