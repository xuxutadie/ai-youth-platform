import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'

// 扩展NextRequest类型以包含用户信息
interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    role: string
  }
}

// 身份验证中间件
export async function authMiddleware(
  request: NextRequest,
  allowedRoles?: string[]
) {
  try {
    // 从请求头获取令牌
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供授权令牌' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // 移除 'Bearer ' 前缀

    // 验证令牌
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-key'
    ) as { userId: string; role: string }

    // 连接数据库
    try {
      await connectDB()
      
      // 获取用户信息
      const user = await User.findById(decoded.userId)
      if (!user) {
        return NextResponse.json(
          { error: '用户不存在' },
          { status: 404 }
        )
      }
      
      // 检查角色权限（如果提供了允许的角色列表）
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: '权限不足' },
          { status: 403 }
        )
      }
      
      // 返回用户信息（不包含密码）
      return {
        success: true,
        userId: user._id.toString(),
        role: user.role
      }
    } catch (dbError) {
      // 数据库连接失败时，使用JWT中的信息
      console.error('数据库连接失败，使用JWT信息:', dbError)
      
      // 检查角色权限（如果提供了允许的角色列表）
      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return NextResponse.json(
          { error: '权限不足' },
          { status: 403 }
        )
      }
      
      // 返回JWT中的信息
      return {
        success: true,
        userId: decoded.userId,
        role: decoded.role
      }
    }
  } catch (error) {
    console.error('身份验证错误:', error)
    return NextResponse.json(
      { error: '无效的授权令牌' },
      { status: 401 }
    )
  }
}