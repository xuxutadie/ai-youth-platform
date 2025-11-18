import { NextRequest, NextResponse } from 'next/server'
import Course from '@/models/Course'
import connectDB from '@/lib/mongodb'
import { authMiddleware } from '@/lib/auth'
import { readdir, stat, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// 去除扩展名的小工具，确保回退标题不带后缀
const stripExt = (n: string | undefined) => {
  if (!n) return ''
  return n.replace(/\.[^.]+$/, '')
}

// 从上传目录读取文件的辅助函数
async function getUploadedFiles() {
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'courses')
  
  if (!existsSync(uploadDir)) {
    return []
  }
  
  try {
    const files = await Promise.race([
      readdir(uploadDir),
      new Promise((_, reject) => setTimeout(() => reject(new Error('读取文件超时')), 3000))
    ]) as string[]
    
    const fileInfos: any[] = []
    const maxFiles = Math.min(files.length, 20)
    
    for (let i = 0; i < maxFiles; i++) {
      const file = files[i]
      try {
        const filePath = join(uploadDir, file)
        const stats = await stat(filePath)
        const match = file.match(/^(\d+)_+(.+)$/)
        if (match) {
          const timestamp = parseInt(match[1])
          let originalName = match[2].replace(/_/g, ' ')
          if (originalName.match(/^_\d+\./)) {
            originalName = `上传课程 ${new Date(timestamp).toLocaleDateString()}`
          }
          const ext = file.split('.').pop()?.toLowerCase() || ''
          let type: 'image' | 'video' | 'other' = 'other'
          if (['jpg','jpeg','png','gif','webp'].includes(ext)) type = 'image'
          else if (['mp4','avi','mov','wmv','flv','webm'].includes(ext)) type = 'video'
          
          fileInfos.push({
            _id: `upload_${timestamp}`,
            title: stripExt(originalName),
    // 默认不设置描述，避免出现“上传的课程内容”等占位文字
            imageUrl: type === 'image' ? `/uploads/courses/${file}` : '',
            videoUrl: type === 'video' ? `/uploads/courses/${file}` : '',
            createdAt: new Date(timestamp).toISOString(),
            updatedAt: stats.mtime.toISOString()
          })
        }
      } catch (fileError) {
        console.error(`处理文件 ${file} 时出错:`, fileError)
      }
    }
    
    return fileInfos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error('读取上传目录错误:', error)
    return []
  }
}

export async function GET() {
  try {
    await connectDB()
    const courses = await Course.find({}).sort({ createdAt: -1 })
    const uploadedFiles = await getUploadedFiles()
    const allCourses = [...courses, ...uploadedFiles]
    return NextResponse.json({ courses: allCourses }, { status: 200 })
  } catch (error) {
    console.error('获取课程错误:', error)
    try {
      const uploadedFiles = await getUploadedFiles()
      const mockCourses = [
        { _id: '643d5a1c9d3f2a1b8c9e4f4a', title: 'Python编程入门', type: 'video', imageUrl: '', videoUrl: '', htmlUrl: '', createdAt: '2023-04-15T10:30:00.000Z', updatedAt: '2023-04-15T10:30:00.000Z' },
        { _id: '643d5a1c9d3f2a1b8c9e4f4b', title: '人工智能基础', type: 'video', imageUrl: '', videoUrl: '', htmlUrl: '', createdAt: '2023-04-10T14:20:00.000Z', updatedAt: '2023-04-10T14:20:00.000Z' },
        { _id: '643d5a1c9d3f2a1b8c9e4f4c', title: 'Web开发实战', type: 'html', imageUrl: '/logo.png', videoUrl: '', htmlUrl: '/examples/example.html', createdAt: '2023-04-05T09:15:00.000Z', updatedAt: '2023-04-05T09:15:00.000Z' }
      ]
      const allCourses = [...mockCourses, ...uploadedFiles]
      return NextResponse.json({ courses: allCourses }, { status: 200 })
    } catch (fallbackError) {
      return NextResponse.json({ courses: [] }, { status: 200 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['teacher', 'admin'])
    if (authResult instanceof NextResponse) return authResult
    const { title, description, imageUrl, instructor, duration, level } = await request.json()
    if (!title || !description || !imageUrl || !instructor || !duration || !level) {
      return NextResponse.json({ error: '课程标题、描述、图片、讲师、时长和级别为必填项' }, { status: 400 })
    }
    try {
      await connectDB()
      const newCourse = await Course.create({ title, description, imageUrl, instructor, duration, level })
      return NextResponse.json({ message: '课程创建成功', course: newCourse }, { status: 201 })
    } catch (dbError) {
      if (dbError instanceof Error && (dbError.message.includes('ECONNREFUSED') || dbError.message.includes('MongoNetworkError') || dbError.message.includes('connect ECONNREFUSED') || dbError.message.includes('MongooseServerSelectionError') || dbError.name === 'MongooseServerSelectionError')) {
        const mockCourse = { _id: 'mock_' + Date.now(), title, description, imageUrl, instructor, duration, level, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        return NextResponse.json({ message: '课程创建成功（演示模式）', course: mockCourse }, { status: 201 })
      }
      throw dbError
    }
  } catch (error) {
    console.error('创建课程错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['admin'])
    if (authResult instanceof NextResponse) return authResult
    const { id, title, description, imageUrl, instructor, duration, level } = await request.json()
    if (!id || !title || !description || !imageUrl || !instructor || !duration || !level) {
      return NextResponse.json({ error: '课程ID、标题、描述、图片、讲师、时长和级别为必填项' }, { status: 400 })
    }
    try {
      await connectDB()
      const updatedCourse = await Course.findByIdAndUpdate(id, { title, description, imageUrl, instructor, duration, level }, { new: true })
      if (!updatedCourse) return NextResponse.json({ error: '课程不存在' }, { status: 404 })
      return NextResponse.json({ message: '课程更新成功', course: updatedCourse }, { status: 200 })
    } catch (dbError) {
      if (dbError instanceof Error && (dbError.message.includes('ECONNREFUSED') || dbError.message.includes('MongoNetworkError') || dbError.message.includes('connect ECONNREFUSED') || dbError.message.includes('MongooseServerSelectionError') || dbError.name === 'MongooseServerSelectionError')) {
        const mockCourse = { _id: id, title, description, imageUrl, instructor, duration, level, updatedAt: new Date().toISOString() }
        return NextResponse.json({ message: '课程更新成功（演示模式）', course: mockCourse }, { status: 200 })
      }
      throw dbError
    }
  } catch (error) {
    console.error('更新课程错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['admin'])
    if (authResult instanceof NextResponse) return authResult
    const { searchParams } = new URL(request.url)
    const queryId = searchParams.get('id')
    const id = queryId
    if (!id) return NextResponse.json({ error: '课程ID为必填项' }, { status: 400 })
    let deleted = false; let deletedCourse: any = null
    try {
      await connectDB()
      deletedCourse = await Course.findByIdAndDelete(id)
      if (deletedCourse) deleted = true
    } catch (dbError) { console.error('数据库删除错误:', dbError) }
    if (id.startsWith('upload_')) {
      const timestamp = id.replace('upload_', '')
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'courses')
      try {
        if (existsSync(uploadDir)) {
          const files = await readdir(uploadDir)
          const matchingFile = files.find(file => file.startsWith(timestamp + '_'))
          if (matchingFile) {
            const filePath = join(uploadDir, matchingFile)
            await unlink(filePath)
            deleted = true
            deletedCourse = { _id: id, deleted: true }
          }
        }
      } catch (fsError) { console.error('文件系统删除错误:', fsError) }
    }
    if (!deleted) return NextResponse.json({ error: '课程不存在或无法删除' }, { status: 404 })
    return NextResponse.json({ message: '课程删除成功', course: deletedCourse }, { status: 200 })
  } catch (error) {
    console.error('删除课程错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}