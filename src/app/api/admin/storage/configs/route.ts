import { NextRequest, NextResponse } from 'next/server'
import { join, dirname } from 'path'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { ok, badRequest, error } from '@/lib/http'
import { authMiddleware } from '@/lib/auth'
import { getDirSize, getDiskUsageForPath } from '@/lib/storage'
import { storageConfig } from '@/config/storage'

type StorageConfig = {
  id: string
  path: string
  maxGB: number
  priority: number
  enabled: boolean
}

const dataFile = join(process.cwd(), 'public', 'data', 'storage-configs.json')

async function readConfigs(): Promise<StorageConfig[]> {
  try {
    if (!existsSync(dataFile)) {
      const dir = dirname(dataFile)
      if (!existsSync(dir)) await mkdir(dir, { recursive: true })
      await writeFile(dataFile, '[]', 'utf-8')
      return []
    }
    const t = await readFile(dataFile, 'utf-8')
    return JSON.parse(t || '[]')
  } catch {
    return []
  }
}

async function writeConfigs(cfgs: StorageConfig[]) {
  await writeFile(dataFile, JSON.stringify(cfgs, null, 2), 'utf-8')
}

function toGB(n: number) { return Math.round(n / 1024 / 1024 / 1024 * 100) / 100 }

function isAbsolutePath(p: string) {
  return p.startsWith('/') || /^[a-zA-Z]:[\\\/]/.test(p)
}

function resolvePath(p: string) {
  if (p === './upload') return storageConfig.primaryRoot
  return isAbsolutePath(p) ? p : join(process.cwd(), p)
}

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  let cfgs = await readConfigs()
  if (!cfgs.find(c => c.id === 'default')) {
    cfgs.push({ id: 'default', path: './upload', maxGB: 10, priority: 1, enabled: true })
    await writeConfigs(cfgs)
  }
  const enriched = await Promise.all(cfgs.map(async (c) => {
    const abs = resolvePath(c.path)
    const usedBytes = await getDirSize(abs).catch(() => 0)
    const du = await getDiskUsageForPath(abs)
    const diskAvail = du ? du.avail : 0
    const maxBytes = c.maxGB > 0 ? c.maxGB * 1024 * 1024 * 1024 : (du ? du.total : 0)
    const available = Math.min(diskAvail, Math.max(0, maxBytes - usedBytes))
    const usagePercent = maxBytes > 0 ? Math.round((usedBytes / maxBytes) * 1000) / 10 : 0
    return {
      ...c,
      absPath: abs,
      stats: {
        maxGB: toGB(maxBytes),
        usedGB: toGB(usedBytes),
        availGB: toGB(available),
        usagePercent
      }
    }
  }))
  return ok({ configs: enriched })
}

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  const body = await request.json()
  const { id, path, maxGB = 10, priority = 1, enabled = true } = body || {}
  if (!id || !path) return badRequest('缺少必填项', { missing: ['id','path'] })
  const cfgs = await readConfigs()
  if (cfgs.find(x => x.id === id)) return badRequest('ID已存在')
  cfgs.push({ id, path, maxGB: Number(maxGB) || 0, priority: Number(priority) || 1, enabled: !!enabled })
  await writeConfigs(cfgs)
  return ok({ message: '添加成功' })
}

export async function PUT(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  const body = await request.json()
  const { id } = body || {}
  if (!id) return badRequest('缺少ID')
  const cfgs = await readConfigs()
  const idx = cfgs.findIndex(x => x.id === id)
  if (idx < 0) return badRequest('未找到配置')
  const next = { ...cfgs[idx], ...body }
  if (typeof next.maxGB === 'string') next.maxGB = Number(next.maxGB) || 0
  if (typeof next.priority === 'string') next.priority = Number(next.priority) || 1
  cfgs[idx] = next
  await writeConfigs(cfgs)
  return ok({ message: '更新成功' })
}

export async function DELETE(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return badRequest('缺少ID')
    const cfgs = await readConfigs()
    const next = cfgs.filter(x => x.id !== id)
    await writeConfigs(next)
    return ok({ message: '删除成功' })
  } catch (e: any) {
    return error('删除失败', 500, { detail: String(e?.message || e) })
  }
}