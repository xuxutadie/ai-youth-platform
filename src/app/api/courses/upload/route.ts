import { NextRequest, NextResponse } from 'next/server'
import Course from '@/models/Course'
import connectDB from '@/lib/mongodb'
import { authMiddleware } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await authMiddleware(request, ['teacher', 'admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const instructor = formData.get('instructor') as string
    const duration = formData.get('duration') as string
    const level = formData.get('level') as string
    const file = formData.get('file') as File
    
    // 验证输入
    if (!title || !description || !instructor || !duration || !level || !file) {
      return NextResponse.json(
        { error: '课程标题、描述、讲师、时长、级别和文件为必填项' },
        { status: 400 }
      )
    }
    
    // 创建上传目录（如果不存在）
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'courses')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    // 生成唯一文件名
    const timestamp = Date.now()
    // 更安全的文件名处理，保留原始名称但替换特殊字符
    const originalName = file.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]/g, '_')
    const fileName = `${timestamp}_${originalName}`
    const filePath = join(uploadDir, fileName)
    
    // 保存文件
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
    } catch (fileError) {
      console.error('保存文件错误:', fileError)
      return NextResponse.json(
        { error: '文件保存失败' },
        { status: 500 }
      )
    }
    
    // 创建文件URL
    const fileUrl = `/uploads/courses/${fileName}`
    
    // 尝试连接数据库并保存课程信息
    try {
      await connectDB()
      
      // 创建新课程，使用文件URL作为imageUrl和videoUrl
      const newCourse = await Course.create({
        title,
        description,
        imageUrl: fileUrl,
        videoUrl: fileUrl, // 对于简化上传，我们使用相同的URL
        instructor,
        duration,
        level
      })
      
      return NextResponse.json(
        { message: '课程创建成功', course: newCourse },
        { status: 201 }
      )
    } catch (dbError) {
      // 如果是数据库连接错误，返回模拟成功响应
      if (dbError instanceof Error && (
        dbError.message.includes('ECONNREFUSED') || 
        dbError.message.includes('MongoNetworkError') ||
        dbError.message.includes('connect ECONNREFUSED')
      )) {
        // 创建模拟课程数据
        const mockCourse = {
          _id: "mock_" + Date.now(),
          title,
          description,
          imageUrl: fileUrl,
          videoUrl: fileUrl, // 对于简化上传，我们使用相同的URL
          instructor,
          duration,
          level,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        return NextResponse.json(
          { message: '课程创建成功（演示模式）', course: mockCourse },
          { status: 201 }
        )
      }
      
      // 其他数据库错误，重新抛出
      throw dbError
    }
  } catch (error) {
    console.error('创建课程错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}