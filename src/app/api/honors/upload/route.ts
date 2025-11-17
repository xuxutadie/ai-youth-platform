import { NextRequest, NextResponse } from 'next/server'
import Honor from '@/models/Honor'
import connectDB from '@/lib/mongodb'
import { authMiddleware } from '@/lib/auth'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { pickUploadTarget } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await authMiddleware(request, ['teacher', 'admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const formData = await request.formData()
    const title = formData.get('title') as string
    const studentName = formData.get('studentName') as string
    const date = formData.get('date') as string
    const description = formData.get('description') as string
    const file = formData.get('file') as File
    
    // 验证输入
    if (!title || !studentName || !date || !file) {
      return NextResponse.json(
        { error: '荣誉标题、学生姓名、获奖时间和图片为必填项' },
        { status: 400 }
      )
    }
    
    const target = await pickUploadTarget('honors')
    const uploadDir = target.dir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    // 生成唯一文件名
    const timestamp = Date.now()
    // 更安全的文件名处理，保留原始名称但替换特殊字符
    const originalName = file.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]/g, '_')
    const fileName = `${timestamp}_${originalName}`
    const filePath = join(uploadDir, fileName)
    
    const allowed = ['image/jpeg','image/png','image/webp','image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: '文件类型不支持' }, { status: 400 })
    }
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件过大' }, { status: 413 })
    }
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
    const fileUrl = `/uploads/honors/${fileName}`

    // 写入本地荣誉元数据，确保无数据库时也能展示上传标题
    try {
      const dataDir = join(process.cwd(), 'public', 'data')
      const metaFile = join(dataDir, 'honors-meta.json')
      if (!existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true })
      }
      let currentMeta: Record<string, any> = {}
      try {
        const content = await readFile(metaFile, 'utf-8')
        currentMeta = content ? JSON.parse(content) : {}
      } catch {
        currentMeta = {}
      }
      currentMeta[fileName] = {
        title,
        studentName,
        date,
        description,
        imageUrl: fileUrl,
        uploaderId: (authResult as any)?.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      await writeFile(metaFile, JSON.stringify(currentMeta, null, 2), 'utf-8')
    } catch (metaError) {
      console.warn('写入honors-meta失败（继续流程）:', metaError)
    }
    
    // 尝试连接数据库并保存荣誉信息
    try {
      await connectDB()
      
      // 创建新荣誉
      const newHonor = await Honor.create({
        title,
        studentName,
        imageUrl: fileUrl,
        date,
        description
      })
      
      return NextResponse.json(
        { message: '荣誉上传成功', honor: newHonor },
        { status: 201 }
      )
    } catch (dbError) {
      // 如果是数据库连接错误，返回模拟成功响应
      if (dbError instanceof Error && (
        dbError.message.includes('ECONNREFUSED') || 
        dbError.message.includes('MongoNetworkError') ||
        dbError.message.includes('connect ECONNREFUSED')
      )) {
        // 创建模拟荣誉数据
        const mockHonor = {
          _id: "mock_" + Date.now(),
          title,
          studentName,
          imageUrl: fileUrl,
          date,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        return NextResponse.json(
          { message: '荣誉上传成功（演示模式）', honor: mockHonor },
          { status: 201 }
        )
      }
      
      // 其他数据库错误，重新抛出
      throw dbError
    }
  } catch (error) {
    console.error('上传荣誉错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}