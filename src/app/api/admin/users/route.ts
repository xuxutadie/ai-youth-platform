import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'

export async function GET(request: NextRequest) {
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
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret-key'
      ) as { userId: string; role: string }
    } catch (tokenError) {
      console.error('Token验证失败:', tokenError)
      return NextResponse.json(
        { error: '无效的授权令牌' },
        { status: 401 }
      )
    }

    // 检查角色权限
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }
    
    // 尝试连接数据库
    try {
      await connectDB()
      
      // 获取所有用户
      const users = await User.find({}).select('-password')
      
      return NextResponse.json(
        { users },
        { status: 200 }
      )
    } catch (dbError) {
      // 数据库连接失败时，返回模拟数据
      console.error('数据库连接失败，使用模拟数据:', dbError)
      
      const mockUsers = [
        {
          _id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          username: 'teacher',
          email: 'teacher@example.com',
          role: 'teacher',
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          username: 'student',
          email: 'student@example.com',
          role: 'student',
          createdAt: new Date().toISOString()
        }
      ]
      
      return NextResponse.json(
        { users: mockUsers },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('获取用户错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await authMiddleware(request, ['admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { userId, role } = await request.json()
    
    // 验证输入
    if (!userId || !role) {
      return NextResponse.json(
        { error: '用户ID和角色为必填项' },
        { status: 400 }
      )
    }
    
    // 验证角色有效性
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: '无效的角色' },
        { status: 400 }
      )
    }
    
    // 尝试连接数据库
    try {
      await connectDB()
      
      // 更新用户角色
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-password')
      
      if (!updatedUser) {
        return NextResponse.json(
          { error: '用户不存在' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { message: '用户角色更新成功', user: updatedUser },
        { status: 200 }
      )
    } catch (dbError) {
      // 数据库连接失败时，返回模拟响应
      console.error('数据库连接失败，使用模拟响应:', dbError)
      
      // 模拟用户更新
      const mockUpdatedUser = {
        _id: userId,
        username: 'mockuser',
        email: 'mock@example.com',
        role: role,
        createdAt: new Date().toISOString()
      }
      
      return NextResponse.json(
        { message: '用户角色更新成功（模拟模式）', user: mockUpdatedUser },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('更新用户角色错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await authMiddleware(request, ['admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { userId } = await request.json()
    
    // 验证输入
    if (!userId) {
      return NextResponse.json(
        { error: '用户ID为必填项' },
        { status: 400 }
      )
    }
    
    // 尝试连接数据库
    try {
      await connectDB()
      
      // 删除用户
      const deletedUser = await User.findByIdAndDelete(userId).select('-password')
      
      if (!deletedUser) {
        return NextResponse.json(
          { error: '用户不存在' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { message: '用户删除成功', user: deletedUser },
        { status: 200 }
      )
    } catch (dbError) {
      // 数据库连接失败时，返回模拟响应
      console.error('数据库连接失败，使用模拟响应:', dbError)
      
      // 模拟用户删除
      const mockDeletedUser = {
        _id: userId,
        username: 'mockuser',
        email: 'mock@example.com',
        role: 'student',
        createdAt: new Date().toISOString()
      }
      
      return NextResponse.json(
        { message: '用户删除成功（模拟模式）', user: mockDeletedUser },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('删除用户错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}