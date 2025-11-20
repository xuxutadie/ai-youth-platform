import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { existsSync } from 'fs'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { listUploadRoots, pickUploadTarget, loadUploadLimits } from '@/lib/storage'
import { uploadSubdirs } from '@/config/storage'
import { authMiddleware } from '@/lib/auth'

function contentType(name: string) {
  const ext = name.toLowerCase().split('.').pop() || ''
  if (['jpg','jpeg'].includes(ext)) return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'mp4') return 'video/mp4'
  if (ext === 'webm') return 'video/webm'
  if (ext === 'ogg') return 'video/ogg'
  if (ext === 'html' || ext === 'htm') return 'text/html; charset=utf-8'
  return 'application/octet-stream'
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type') as keyof typeof uploadSubdirs | null
  const name = url.searchParams.get('name') || ''
  if (!type || !uploadSubdirs[type] || !name) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }
  if (name.includes('..') || /[\\/]/.test(name)) {
    return NextResponse.json({ error: '非法文件名' }, { status: 400 })
  }
  const safe = name
  const roots = await listUploadRoots()
  for (const r of roots) {
    const p = join(r, uploadSubdirs[type], safe)
    if (existsSync(p)) {
      const buf = await readFile(p)
      return new NextResponse(buf, { status: 200, headers: { 'Content-Type': contentType(safe) } })
    }
  }
  return NextResponse.json({ error: '未找到文件' }, { status: 404 })
}

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request, ['teacher','admin'])
  if ('json' in auth) return auth
  try {
    const formData = await request.formData()
    const type = formData.get('type') as keyof typeof uploadSubdirs | null
    const file = formData.get('file') as File | null
    if (!type || !uploadSubdirs[type] || !file) {
      return NextResponse.json({ error: '缺少类型或文件' }, { status: 400 })
    }
    const allowed = ['image/jpeg','image/png','image/webp','image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: '文件类型不支持' }, { status: 400 })
    }
    const limits = await loadUploadLimits()
    const maxSize = limits.imageMB * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件过大' }, { status: 413 })
    }
    const target = await pickUploadTarget(type)
    if (!existsSync(target.dir)) await mkdir(target.dir, { recursive: true })
    const ts = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]/g, '_')
    const safeName = `${ts}_${originalName}`
    const p = join(target.dir, safeName)
    const buf = Buffer.from(await file.arrayBuffer())
    await writeFile(p, buf)
    const url = `/api/uploads/file?type=${encodeURIComponent(type)}&name=${encodeURIComponent(safeName)}`
    return NextResponse.json({ ok: true, name: safeName, url })
  } catch (e) {
    console.error('上传图片失败', e)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}