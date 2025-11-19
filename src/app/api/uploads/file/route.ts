import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { listUploadRoots } from '@/lib/storage'
import { uploadSubdirs } from '@/config/storage'

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