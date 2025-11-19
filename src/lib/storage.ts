import { stat, readdir, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { storageConfig, uploadSubdirs, UploadType } from '@/config/storage'
import { exec } from 'child_process'

function execCmd(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout || '')
    })
  })
}

export async function ensureDir(dir: string) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
}

export async function getDirSize(dir: string): Promise<number> {
  let total = 0
  if (!existsSync(dir)) return 0
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) total += await getDirSize(p)
    else {
      try {
        const s = await stat(p)
        total += s.size
      } catch {}
    }
  }
  return total
}

function bytesFromMB(mb: number) {
  return mb > 0 ? mb * 1024 * 1024 : 0
}

export type DiskUsage = {
  total: number
  used: number
  avail: number
  mount: string
}

export async function getDiskUsageForPath(path: string): Promise<DiskUsage | null> {
  try {
    if (process.platform === 'win32') {
      const drive = path.match(/^([a-zA-Z]:)/)?.[1] || 'C:'
      const out = await execCmd(`wmic logicaldisk where name='${drive}' get Size,FreeSpace /value`)
      const sizeMatch = out.match(/Size=(\d+)/)
      const freeMatch = out.match(/FreeSpace=(\d+)/)
      if (sizeMatch && freeMatch) {
        const total = parseInt(sizeMatch[1], 10)
        const avail = parseInt(freeMatch[1], 10)
        const used = total - avail
        return { total, used, avail, mount: drive }
      }
      return null
    }
    const out = await execCmd(`df -P '${path.replace(/'/g, "'\\''")}'`)
    const lines = out.trim().split(/\r?\n/)
    if (lines.length >= 2) {
      const cols = lines[1].split(/\s+/)
      const total = parseInt(cols[1], 10) * 1024
      const used = parseInt(cols[2], 10) * 1024
      const avail = parseInt(cols[3], 10) * 1024
      const mount = cols[5]
      return { total, used, avail, mount }
    }
    return null
  } catch {
    return null
  }
}

export async function pickUploadTarget(type: UploadType) {
  const cfgs = await loadStorageConfigs()
  for (const c of cfgs) {
    const capBytes = c.maxGB > 0 ? c.maxGB * 1024 * 1024 * 1024 : 0
    if (capBytes > 0) {
      const used = await getDirSize(c.absPath).catch(() => 0)
      if (used >= capBytes) continue
    }
    const dir = join(c.absPath, uploadSubdirs[type])
    await ensureDir(dir)
    return { dir, urlPrefix: `/uploads/${uploadSubdirs[type]}`, location: c.id }
  }
  const base = storageConfig.primaryRoot
  const dir = join(base, uploadSubdirs[type])
  await ensureDir(dir)
  return { dir, urlPrefix: `/uploads/${uploadSubdirs[type]}`, location: 'primary' }
}

export type StorageConfigEntry = { id: string; absPath: string; maxGB: number; priority: number; enabled: boolean }

export async function loadStorageConfigs(): Promise<StorageConfigEntry[]> {
  try {
    const p = join(process.cwd(), 'public', 'data', 'storage-configs.json')
    const t = await (await import('fs/promises')).readFile(p, 'utf-8').catch(() => '[]')
    const raw = JSON.parse(t || '[]') as any[]
    const list = raw
      .filter(x => x && x.enabled !== false)
      .map(x => ({
        id: String(x.id || 'default'),
        absPath: String(x.path || './upload').startsWith('./upload') ? storageConfig.primaryRoot : (String(x.path).startsWith('/') || /^[a-zA-Z]:[\\\/]/.test(String(x.path)) ? String(x.path) : join(process.cwd(), String(x.path))),
        maxGB: Number(x.maxGB || 0),
        priority: Number(x.priority || 1),
        enabled: x.enabled !== false
      }))
      .sort((a, b) => a.priority - b.priority)
    if (!list.find(c => c.absPath === storageConfig.primaryRoot)) {
      list.unshift({ id: 'default', absPath: storageConfig.primaryRoot, maxGB: 0, priority: 1, enabled: true })
    }
    return list
  } catch {
    return [{ id: 'default', absPath: storageConfig.primaryRoot, maxGB: 0, priority: 1, enabled: true }]
  }
}

export async function listUploadRoots(): Promise<string[]> {
  const cfgs = await loadStorageConfigs()
  const roots = cfgs.map(c => c.absPath)
  const unique = Array.from(new Set(roots))
  return unique
}

export type UploadLimits = { imageMB: number; videoMB: number; htmlMB: number }

export async function loadUploadLimits(): Promise<UploadLimits> {
  try {
    const p = join(process.cwd(), 'public', 'data', 'website-config.json')
    const t = await (await import('fs/promises')).readFile(p, 'utf-8').catch(() => '')
    const raw = t ? JSON.parse(t) : {}
    const ul = raw.uploadLimits || {}
    const toNum = (v: any, d: number) => {
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : d
    }
    return {
      imageMB: toNum(ul.imageMB, 10),
      videoMB: toNum(ul.videoMB, 50),
      htmlMB: toNum(ul.htmlMB, 10)
    }
  } catch {
    return { imageMB: 10, videoMB: 50, htmlMB: 10 }
  }
}