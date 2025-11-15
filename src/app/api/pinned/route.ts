import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { existsSync } from 'fs'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { authMiddleware } from '@/lib/auth'

const dataDir = join(process.cwd(), 'public', 'data')
const pinnedFile = join(dataDir, 'pinned.json')

async function readPinned() {
  if (!existsSync(pinnedFile)) {
    return { competitions: [], works: [], honors: [], courses: [] }
  }
  try {
    const buf = await readFile(pinnedFile, 'utf-8')
    const json = JSON.parse(buf)
    return {
      competitions: Array.isArray(json.competitions) ? json.competitions : [],
      works: Array.isArray(json.works) ? json.works : [],
      honors: Array.isArray(json.honors) ? json.honors : [],
      courses: Array.isArray(json.courses) ? json.courses : []
    }
  } catch (e) {
    console.error('读取置顶数据失败:', e)
    return { competitions: [], works: [], honors: [], courses: [] }
  }
}

export async function GET() {
  const data = await readPinned()
  return NextResponse.json(data, { status: 200 })
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { type, id, pinned } = await request.json()
    if (!['competitions','works','honors','courses'].includes(type) || !id) {
      return NextResponse.json({ error: '参数不合法' }, { status: 400 })
    }

    const data = await readPinned()
    const current = new Set<string>((data as any)[type] || [])
    if (pinned) { current.add(id) } else { current.delete(id) }
    const nextData = { ...data, [type]: Array.from(current) }

    if (!existsSync(dataDir)) { await mkdir(dataDir, { recursive: true }) }
    await writeFile(pinnedFile, JSON.stringify(nextData, null, 2), 'utf-8')

    return NextResponse.json({ message: '置顶状态已更新', pinned: nextData }, { status: 200 })
  } catch (e) {
    console.error('更新置顶数据失败:', e)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
