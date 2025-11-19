import { NextRequest, NextResponse } from 'next/server'
import Work from '@/models/Work'
import connectDB from '@/lib/mongodb'
import { authMiddleware } from '@/lib/auth'
import crypto from 'crypto'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { rateLimit } from '@/lib/http'
import { pickUploadTarget, loadUploadLimits } from '@/lib/storage'

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'works_upload', 10, 60_000)
  if (limited) return limited
  try {
    // 验证用户身份
    const authResult = await authMiddleware(request, ['student', 'teacher', 'admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const formData = await request.formData()
    const workId = (formData.get('workId') as string) || ''
    const title = (formData.get('title') as string) || ''
    const type = (formData.get('type') as string) || ''
    const authorName = (formData.get('authorName') as string) || ''
    const grade = (formData.get('grade') as string) || ''
    const classNameFromForm = ((formData.get('className') as string) || '')
    const file = formData.get('file') as File
    // 验证输入
    if (!file) {
      return NextResponse.json({ error: '文件为必填项' }, { status: 400 })
    }
    if (!workId && (!title || !type || !authorName || !grade)) {
      return NextResponse.json({ error: '新增作品需提供标题、类型、作者名字与年级' }, { status: 400 })
    }
    // 类型、MIME 与大小校验
    const typeAllowed = ['image','video','html']
    const effectiveType = type || (workId ? 'image' : '')
    if (!workId && !typeAllowed.includes(effectiveType)) {
      return NextResponse.json({ error: '类型不合法' }, { status: 400 })
    }
    const mime = file.type
    const allowedMimes = {
      image: ['image/jpeg','image/png','image/webp','image/gif'],
      video: ['video/mp4','video/webm','video/ogg'],
      html: ['text/html','application/xhtml+xml']
    } as Record<string, string[]>
    const checkType = workId ? (typeAllowed.find(t => (allowedMimes as any)[t].includes(mime)) || effectiveType) : effectiveType
    if (!(allowedMimes[checkType] || []).includes(mime)) {
      return NextResponse.json({ error: '文件类型不支持' }, { status: 400 })
    }
    const limits = await loadUploadLimits()
    const maxSize = checkType === 'video' ? limits.videoMB * 1024 * 1024 : (checkType === 'html' ? limits.htmlMB * 1024 * 1024 : limits.imageMB * 1024 * 1024)
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件过大' }, { status: 413 })
    }
    
    // 创建上传目录（如果不存在）
    const target = await pickUploadTarget('works')
    const uploadDir = target.dir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    // 生成唯一文件名
    const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.') + 1) : (checkType === 'html' ? 'html' : 'bin')
    const rand = crypto.randomBytes(8).toString('hex')
    const safeUserId = String((authResult as any).userId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_')
    const fileName = `${Date.now()}_${safeUserId}_${rand}.${ext}`
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
    
    // HTML依赖重写
    if (checkType === 'html') {
      try {
        const content = await readFile(filePath, 'utf-8')
        const rewritten = content
          .replace(/src=["']jquery\.min\.js["']/g, 'src="/vendor/jquery.min.js"')
          .replace(/src=["']echarts\.min\.js["']/g, 'src="/vendor/echarts.min.js"')
          .replace(/href=["']style\.css["']/g, 'href="/assets/default/style.css"')
          .replace(/href=["']style1\.css["']/g, 'href="/assets/default/style1.css"')
          .replace(/src=["']my\.js["']/g, 'src="/assets/default/my.js"')
        await writeFile(filePath, rewritten, 'utf-8')
      } catch {}
    }

    const fileUrl = `/api/uploads/file?type=works&name=${encodeURIComponent(fileName)}`

    if (workId) {
      try {
        await connectDB()
        const { userId, role } = authResult as any
        const work = await Work.findById(workId)
        if (!work) return NextResponse.json({ error: '作品不存在' }, { status: 404 })
        if (role === 'student' && String(work.uploaderId) !== String(userId)) {
          return NextResponse.json({ error: '无权限编辑该作品' }, { status: 403 })
        }
        if (role === 'teacher') {
          const { default: User } = await import('@/models/User')
          const teacher = await (User as any).findById(userId).select('manageGrade manageClassName')
          const mg = teacher?.manageGrade || ''
          const mc = teacher?.manageClassName || ''
          if ((mg && work.grade && mg !== work.grade) || (mc && work.className && mc !== work.className)) {
            return NextResponse.json({ error: '该作品不在您的管理年级/班级范围内' }, { status: 403 })
          }
        }
        const patch: any = { url: fileUrl, updatedAt: new Date() }
        if (title) patch.title = title
        const finalType = effectiveType || work.type
        if (finalType) patch.type = finalType
        if (authorName) patch.authorName = authorName
        if (grade) patch.grade = grade
        if (classNameFromForm) patch.className = classNameFromForm
        const updated = await Work.findByIdAndUpdate(workId, patch, { new: true })
        return NextResponse.json({ message: '作品更新成功', work: updated }, { status: 200 })
      } catch (e) {
        return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
      }
    }

    // 写入作品元数据，便于在无数据库时也能展示作者与班级
    try {
      const dataDir = join(process.cwd(), 'public', 'data')
      const metaFile = join(dataDir, 'works-meta.json')
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
        type,
        authorName,
        className: classNameFromForm, // 实际存储将在数据库处从用户信息补全
        grade,
        url: fileUrl,
        uploaderId: (authResult as any).userId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      await writeFile(metaFile, JSON.stringify(currentMeta, null, 2), 'utf-8')
    } catch (metaError) {
      console.error('写入作品元数据错误:', metaError)
    }
    
    // 当认证用户ID不是合法的ObjectId时，直接返回演示模式成功，避免数据库校验错误
    const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(String((authResult as any).userId || ''))
    if (!isValidObjectId) {
      const mockWork = {
        _id: "mock_" + Date.now(),
        title,
        type,
        authorName,
        className: classNameFromForm,
        grade,
        url: fileUrl,
        uploaderId: (authResult as any).userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return NextResponse.json(
        { message: '作品上传成功（演示模式）', work: mockWork },
        { status: 201 }
      )
    }

    // 尝试连接数据库并保存作品信息
    try {
      await connectDB()
      
      // 读取用户资料以自动填充班级
      let autoClassName = ''
      try {
        const { default: User } = await import('@/models/User')
        const userDoc: any = await (User as any).findById((authResult as any).userId).select('className')
        autoClassName = userDoc?.className || ''
      } catch (e) {
        autoClassName = classNameFromForm || ''
      }

      const newWork = await Work.create({
        title,
        type,
        authorName,
        className: autoClassName,
        grade,
        url: fileUrl,
        uploaderId: (authResult as any).userId
      })
      
      return NextResponse.json(
        { message: '作品上传成功', work: newWork },
        { status: 201 }
      )
    } catch (dbError) {
      if (dbError instanceof Error && (
        dbError.message.includes('ECONNREFUSED') || 
        dbError.message.includes('MongoNetworkError') ||
        dbError.message.includes('connect ECONNREFUSED')
      )) {
        const mockWork = {
          _id: "mock_" + Date.now(),
          title,
          type,
          authorName,
          className: classNameFromForm,
          grade,
          url: fileUrl,
          uploaderId: (authResult as any).userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        return NextResponse.json(
          { message: '作品上传成功（演示模式）', work: mockWork },
          { status: 201 }
        )
      }
      throw dbError
    }
  } catch (error) {
    console.error('上传作品错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
