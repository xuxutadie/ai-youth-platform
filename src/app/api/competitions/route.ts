import { NextRequest, NextResponse } from 'next/server'
import Competition from '@/models/Competition'
import connectDB from '@/lib/mongodb'
import { authMiddleware } from '@/lib/auth'
import { readdir, stat, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// 去除扩展名的小工具，确保回退名称不带后缀
const stripExt = (n: string | undefined) => {
  if (!n) return ''
  return n.replace(/\.[^.]+$/, '')
}

// 从上传目录读取文件的辅助函数
async function getUploadedFiles() {
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'competitions')
  
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
            originalName = `上传赛事 ${new Date(timestamp).toLocaleDateString()}`
          }
          
          fileInfos.push({
            _id: `upload_${timestamp}`,
            name: stripExt(originalName),
    // 默认不设置描述，避免前端出现占位文本
            date: new Date(timestamp).toISOString().split('T')[0], // 格式化为YYYY-MM-DD
            imageUrl: `/uploads/competitions/${file}`,
            createdAt: new Date(timestamp).toISOString(),
            updatedAt: stats.mtime.toISOString()
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
    
    // 获取所有赛事
    const competitions = await Competition.find({}).sort({ date: -1 })
    
    // 获取上传的文件
    const uploadedFiles = await getUploadedFiles()
    
    // 合并数据库赛事和上传文件
    const allCompetitions = [...competitions, ...uploadedFiles]
    
    return NextResponse.json(
      { competitions: allCompetitions },
      { status: 200 }
    )
  } catch (error) {
    console.error('获取赛事错误:', error)
    
    // 如果是数据库连接错误，使用模拟数据
    if (error instanceof Error && (
      error.message.includes('ECONNREFUSED') || 
      error.message.includes('MongoNetworkError') ||
      error.message.includes('connect ECONNREFUSED') ||
      error.message.includes('MongooseServerSelectionError') ||
      error.name === 'MongooseServerSelectionError'
    )) {
      // 获取上传的文件
      const uploadedFiles = await getUploadedFiles()
      
      // 返回模拟数据
      const mockCompetitions = [
        {
          _id: "643d5a1c9d3f2a1b8c9e4f1a",
          name: "全国青少年AI创新大赛",
          date: "2023-08-15",
          imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/ai-competition.jpg",
          createdAt: "2023-04-15T10:30:00.000Z",
          updatedAt: "2023-04-15T10:30:00.000Z"
        },
        {
          _id: "643d5a1c9d3f2a1b8c9e4f1b",
          name: "青少年机器人编程挑战赛",
          date: "2023-07-20",
          imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/robot-competition.jpg",
          createdAt: "2023-04-10T14:20:00.000Z",
          updatedAt: "2023-04-10T14:20:00.000Z"
        },
        {
          _id: "643d5a1c9d3f2a1b8c9e4f1c",
          name: "未来科技创意大赛",
          date: "2023-09-10",
          imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/tech-competition.jpg",
          createdAt: "2023-04-05T09:15:00.000Z",
          updatedAt: "2023-04-05T09:15:00.000Z"
        }
      ];
      
      // 合并模拟数据和上传文件
      const allCompetitions = [...mockCompetitions, ...uploadedFiles]
      
      return NextResponse.json(
        { competitions: allCompetitions },
        { status: 200 }
      )
    }
    
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await authMiddleware(request, ['teacher', 'admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { name, date, imageUrl, description } = await request.json()
    
    // 验证输入
    if (!name || !date || !imageUrl) {
      return NextResponse.json(
        { error: '赛事名称、日期和图片为必填项' },
        { status: 400 }
      )
    }
    
    // 尝试连接数据库
    try {
      await connectDB()
      
      // 创建新赛事
      const newCompetition = await Competition.create({
        name,
        date,
        imageUrl,
        description
      })
      
      return NextResponse.json(
        { message: '赛事上传成功', competition: newCompetition },
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
        // 创建模拟赛事数据
        const mockCompetition = {
          _id: "mock_" + Date.now(),
          name,
          date,
          imageUrl,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        return NextResponse.json(
          { message: '赛事上传成功（演示模式）', competition: mockCompetition },
          { status: 201 }
        )
      }
      
      // 其他数据库错误，重新抛出
      throw dbError
    }
  } catch (error) {
    console.error('上传赛事错误:', error)
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
    
    const { id, name, date, imageUrl, description } = await request.json()
    
    // 验证输入
    if (!id || !name || !date || !imageUrl) {
      return NextResponse.json(
        { error: '赛事ID、名称、日期和图片为必填项' },
        { status: 400 }
      )
    }
    
    // 尝试连接数据库
    try {
      await connectDB()
      
      // 更新赛事
      const updatedCompetition = await Competition.findByIdAndUpdate(
        id,
        { name, date, imageUrl, description },
        { new: true }
      )
      
      if (!updatedCompetition) {
        return NextResponse.json(
          { error: '赛事不存在' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { message: '赛事更新成功', competition: updatedCompetition },
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
        const mockCompetition = {
          _id: id,
          name,
          date,
          imageUrl,
          description,
          updatedAt: new Date().toISOString()
        }
        
        return NextResponse.json(
          { message: '赛事更新成功（演示模式）', competition: mockCompetition },
          { status: 200 }
        )
      }
      
      // 其他数据库错误，重新抛出
      throw dbError
    }
  } catch (error) {
    console.error('更新赛事错误:', error)
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
        { error: '赛事ID为必填项' },
        { status: 400 }
      )
    }
    
    let deleted = false;
    let deletedCompetition = null;

    // 尝试数据库删除
    try {
      await connectDB()
      deletedCompetition = await Competition.findByIdAndDelete(id)
      if (deletedCompetition) {
        deleted = true;
      }
    } catch (dbError) {
      console.error('数据库删除错误:', dbError)
    }

    // 如果ID以'upload_'开头，尝试文件系统删除
    if (id.startsWith('upload_')) {
      const timestamp = id.replace('upload_', '');
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'competitions');
      try {
        if (existsSync(uploadDir)) {
          const files = await readdir(uploadDir);
          const matchingFile = files.find(file => file.startsWith(timestamp + '_'));
          if (matchingFile) {
            const filePath = join(uploadDir, matchingFile);
            await unlink(filePath);
            deleted = true;
            deletedCompetition = { _id: id, deleted: true };
          }
        }
      } catch (fsError) {
        console.error('文件系统删除错误:', fsError)
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { error: '赛事不存在或无法删除' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: '赛事删除成功', competition: deletedCompetition },
      { status: 200 }
    )
  } catch (error) {
    console.error('删除赛事错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}