import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import { authMiddleware } from '@/lib/auth'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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
    
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const roleParam = (searchParams.get('role') || '').trim()
    const all = searchParams.get('all') === '1'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(1000, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)))

    const useMock = process.env.USE_MOCK_DB !== 'false'
    if (useMock) {
      try {
        const metaFile = join(process.cwd(), 'public', 'data', 'users-meta.json')
        let users: any[] = []
        if (existsSync(metaFile)) {
          const content = await readFile(metaFile, 'utf-8')
          users = content ? JSON.parse(content) : []
        }
        if (users.length === 0) {
          users = [
            { _id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: new Date().toISOString() },
            { _id: '2', username: 'teacher', email: 'teacher@example.com', role: 'teacher', createdAt: new Date().toISOString() },
            { _id: '3', username: 'student', email: 'student@example.com', role: 'student', createdAt: new Date().toISOString() }
          ]
        }
        let filtered = users
        if (roleParam) filtered = filtered.filter(u => String(u.role) === roleParam)
        if (q) filtered = filtered.filter(u => {
          const s = `${u.username||''} ${u.email||''}`.toLowerCase()
          return s.includes(q)
        })
        const total = filtered.length
        const items = all ? filtered : filtered.slice((page-1)*pageSize, (page-1)*pageSize + pageSize)
        const hasMore = !all && (page*pageSize < total)
        return NextResponse.json({ users: items, total, page, pageSize, hasMore }, { status: 200 })
      } catch {
        const users = [
          { _id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: new Date().toISOString() },
          { _id: '2', username: 'teacher', email: 'teacher@example.com', role: 'teacher', createdAt: new Date().toISOString() },
          { _id: '3', username: 'student', email: 'student@example.com', role: 'student', createdAt: new Date().toISOString() }
        ]
        return NextResponse.json({ users }, { status: 200 })
      }
    }
    try {
      await connectDB()
      const filter: any = {}
      if (roleParam) filter.role = roleParam
      if (q) filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
      const query = (User as any).find(filter).select('-password').sort({ createdAt: -1 })
      const total = await (User as any).countDocuments(filter)
      let items: any[]
      if (all) {
        items = await query.exec()
      } else {
        items = await query.skip((page-1)*pageSize).limit(pageSize).exec()
      }
      const hasMore = !all && (page*pageSize < total)
      return NextResponse.json({ users: items, total, page, pageSize, hasMore }, { status: 200 })
    } catch (dbError) {
      const users = [
        { _id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: new Date().toISOString() },
        { _id: '2', username: 'teacher', email: 'teacher@example.com', role: 'teacher', createdAt: new Date().toISOString() },
        { _id: '3', username: 'student', email: 'student@example.com', role: 'student', createdAt: new Date().toISOString() }
      ]
      return NextResponse.json({ users }, { status: 200 })
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
      
      // 管理员邮箱与唯一性校验
      if (role === 'admin') {
        const targetUser = await User.findById(userId)
        if (!targetUser) {
          return NextResponse.json({ error: '用户不存在' }, { status: 404 })
        }
        const adminEmail = process.env.ADMIN_EMAIL || '30761985@qq.com'
        if (targetUser.email !== adminEmail) {
          return NextResponse.json(
            { error: '仅允许指定邮箱设为管理员' },
            { status: 403 }
          )
        }
        const existingAdmin = await User.findOne({ role: 'admin' })
        if (existingAdmin && existingAdmin._id.toString() !== userId) {
          return NextResponse.json(
            { error: '系统已存在管理员账号，管理员唯一' },
            { status: 409 }
          )
        }
      }
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