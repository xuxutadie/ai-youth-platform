import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth'
import crypto from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (auth instanceof NextResponse) return auth

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: '缺少文件' }, { status: 400 })
    const allowed = ['image/jpeg','image/png','image/webp','image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '文件过大' }, { status: 413 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.') + 1) : 'png'
    const rand = crypto.randomBytes(8).toString('hex')
    const fileName = `${Date.now()}_${rand}.${ext}`
    const filePath = join(uploadDir, fileName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const url = `/uploads/avatars/${fileName}`
    return NextResponse.json({ url }, { status: 201 })
  } catch (e) {
    console.error('头像上传失败:', e)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}