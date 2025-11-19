import { NextRequest, NextResponse } from 'next/server'
import { join, dirname } from 'path'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { authMiddleware } from '@/lib/auth'

const dataFile = join(process.cwd(), 'public', 'data', 'website-config.json')

async function readConfig() {
  try {
    if (!existsSync(dataFile)) {
      const dir = dirname(dataFile)
      if (!existsSync(dir)) await mkdir(dir, { recursive: true })
      await writeFile(dataFile, JSON.stringify({ uploadLimits: { imageMB: 10, videoMB: 50, htmlMB: 10 } }, null, 2), 'utf-8')
    }
    const t = await readFile(dataFile, 'utf-8')
    return JSON.parse(t || '{}')
  } catch {
    return { uploadLimits: { imageMB: 10, videoMB: 50, htmlMB: 10 } }
  }
}

async function writeConfig(cfg: any) {
  await writeFile(dataFile, JSON.stringify(cfg, null, 2), 'utf-8')
}

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  const cfg = await readConfig()
  return NextResponse.json({ config: cfg }, { status: 200 })
}

export async function PUT(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  const body = await request.json()
  const prev = await readConfig()
  const next = { ...prev, ...body }
  const ul = next.uploadLimits || {}
  const toNum = (v: any, d: number) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : d }
  next.uploadLimits = {
    imageMB: toNum(ul.imageMB, 10),
    videoMB: toNum(ul.videoMB, 50),
    htmlMB: toNum(ul.htmlMB, 10)
  }
  await writeConfig(next)
  return NextResponse.json({ message: '保存成功' }, { status: 200 })
}