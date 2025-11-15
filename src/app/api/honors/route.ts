import { NextRequest, NextResponse } from 'next/server'
import Honor from '@/models/Honor'
import connectDB from '@/lib/mongodb'
import { authMiddleware } from '@/lib/auth'
import { readdir, stat, unlink, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// 去除扩展名的小工具，确保回退标题不带后缀
const stripExt = (n: string | undefined) => {
  if (!n) return ''
  return n.replace(/\.[^.]+$/, '')
}

// 从上传目录读取文件的辅助函数
async function getUploadedFiles() {
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'honors')
  const dataDir = join(process.cwd(), 'public', 'data')
  const metaFile = join(dataDir, 'honors-meta.json')
  let meta: Record<string, any> = {}
  try {
    if (existsSync(metaFile)) {
      const content = await readFile(metaFile, 'utf-8')
      meta = content ? JSON.parse(content) : {}
    }
  } catch (metaErr) {
    console.warn('读取荣誉元数据失败:', metaErr)
    meta = {}
  }
  
  if (!existsSync(uploadDir)) {
    return []
  }
  
  try {
    // 添加超时控制
    const files = await Promise.race([
      readdir(uploadDir),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('读取文件超时')), 3000)
      )
    ]) as string[]
    
    const fileInfos = []
    
    // 限制处理的文件数量，避免处理过多文件导致超时
    const maxFiles = Math.min(files.length, 20)
    
    for (let i = 0; i < maxFiles; i++) {
      const file = files[i]
      try {
        const filePath = join(uploadDir, file)
        const stats = await stat(filePath)
        
        // 从文件名中提取时间戳和原始名称
        const match = file.match(/^(\d+)_+(.+)$/)
        if (match) {
          const timestamp = parseInt(match[1])
          let originalName = match[2].replace(/_/g, ' ')
          
          // 如果文件名看起来像随机生成的，则使用时间戳作为标题
          if (originalName.match(/^_\d+\./)) {
            originalName = `上传荣誉 ${new Date(timestamp).toLocaleDateString()}`
          }
          
          const m = meta[file]
          fileInfos.push({
            _id: `upload_${timestamp}`,
            title: (m && m.title) || stripExt(originalName),
            studentName: (m && m.studentName) || "上传者",
            date: (m && m.date) || new Date(timestamp).toISOString().split('T')[0], // 格式化为YYYY-MM-DD
            imageUrl: `/uploads/honors/${file}`,
            createdAt: (m && m.createdAt) || new Date(timestamp).toISOString(),
            updatedAt: (m && m.updatedAt) || stats.mtime.toISOString()
          })
        }
      } catch (fileError) {
        console.error(`处理文件 ${file} 时出错:`, fileError)
        // 继续处理下一个文件，不中断整个流程
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
    const honors = await Honor.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ honors }, { status: 200 })
  } catch (error) {
    console.error('获取荣誉错误:', error)
    // 数据库连接失败时，尝试从上传目录读取文件作为备用
    try {
      const uploadedFiles = await getUploadedFiles()
      if (uploadedFiles.length > 0) {
        return NextResponse.json({ honors: uploadedFiles }, { status: 200 })
      }
      // 如果备用方案也失败，则返回错误
      return NextResponse.json(
        { error: '获取荣誉列表失败，请稍后重试' },
        { status: 500 }
      )
    } catch (fallbackError) {
      console.error('获取荣誉备用方案错误:', fallbackError)
      return NextResponse.json(
        { error: '获取荣誉列表失败，请稍后重试' },
        { status: 500 }
      )
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await authMiddleware(request, ['teacher', 'admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { title, studentName, imageUrl, date, description } = await request.json()
    
    // 验证输入
    if (!title || !studentName || !imageUrl || !date) {
      return NextResponse.json(
        { error: '荣誉标题、学生姓名、图片和获奖时间为必填项' },
        { status: 400 }
      )
    }
    
    // 尝试连接数据库
    try {
      await connectDB()
      
      // 创建新荣誉
      const newHonor = await Honor.create({
        title,
        studentName,
        imageUrl,
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
        dbError.message.includes('connect ECONNREFUSED') ||
        dbError.message.includes('MongooseServerSelectionError') ||
        dbError.name === 'MongooseServerSelectionError'
      )) {
        // 创建模拟荣誉数据
        const mockHonor = {
          _id: "mock_" + Date.now(),
          title,
          studentName,
          imageUrl,
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

export async function PUT(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await authMiddleware(request, ['admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { id, title, studentName, imageUrl, date, description } = await request.json()
    
    // 验证输入
    if (!id || !title || !studentName || !imageUrl || !date) {
      return NextResponse.json(
        { error: '荣誉ID、标题、学生姓名、图片和获奖时间为必填项' },
        { status: 400 }
      )
    }
    
    // 尝试连接数据库
    try {
      await connectDB()
      
      // 更新荣誉
      const updatedHonor = await Honor.findByIdAndUpdate(
        id,
        { title, studentName, imageUrl, date, description },
        { new: true }
      )
      
      if (!updatedHonor) {
        return NextResponse.json(
          { error: '荣誉不存在' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { message: '荣誉更新成功', honor: updatedHonor },
        { status: 200 }
      )
    } catch (dbError) {
      // 如果是数据库连接错误，返回模拟成功响应
      if (dbError instanceof Error && (
        dbError.message.includes('ECONNREFUSED') || 
        dbError.message.includes('MongoNetworkError') ||
        dbError.message.includes('connect ECONNREFUSED') ||
        dbError.message.includes('MongooseServerSelectionError') ||
        dbError.name === 'MongooseServerSelectionError'
      )) {
        // 创建模拟更新响应
        const mockHonor = {
          _id: id,
          title,
          studentName,
          imageUrl,
          date,
          description,
          updatedAt: new Date().toISOString()
        }
        
        return NextResponse.json(
          { message: '荣誉更新成功（演示模式）', honor: mockHonor },
          { status: 200 }
        )
      }
      
      // 其他数据库错误，重新抛出
      throw dbError
    }
  } catch (error) {
    console.error('更新荣誉错误:', error)
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
    
    // 从URL路径参数或查询参数获取ID
    const { searchParams } = new URL(request.url)
    const queryId = searchParams.get('id')
    const id = queryId
    
    // 验证输入
    if (!id) {
      return NextResponse.json(
        { error: '荣誉ID为必填项' },
        { status: 400 }
      )
    }
    
    let deleted = false;
    let deletedHonor = null;

    // 尝试数据库删除
    try {
      await connectDB()
      deletedHonor = await Honor.findByIdAndDelete(id)
      if (deletedHonor) {
        deleted = true;
      }
    } catch (dbError) {
      console.error('数据库删除错误:', dbError)
    }

    // 如果ID以'upload_'开头，尝试文件系统删除
    if (id.startsWith('upload_')) {
      const timestamp = id.replace('upload_', '');
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'honors');
      try {
        if (existsSync(uploadDir)) {
          const files = await readdir(uploadDir);
          const matchingFile = files.find(file => file.startsWith(timestamp + '_'));
          if (matchingFile) {
            const filePath = join(uploadDir, matchingFile);
            await unlink(filePath);
            deleted = true;
            deletedHonor = { _id: id, deleted: true };
          }
        }
      } catch (fsError) {
        console.error('文件系统删除错误:', fsError)
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { error: '荣誉不存在或无法删除' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: '荣誉删除成功', honor: deletedHonor },
      { status: 200 }
    )
  } catch (error) {
    console.error('删除荣誉错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}