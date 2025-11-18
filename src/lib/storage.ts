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
  const primaryRoot = storageConfig.primaryRoot
  const secondaryRoot = storageConfig.secondaryRoot
  const primaryCap = bytesFromMB(storageConfig.capPrimaryMB)
  const secondaryCap = bytesFromMB(storageConfig.capSecondaryMB)

  let useSecondary = false
  if (primaryCap > 0) {
    const used = await getDirSize(primaryRoot)
    if (used >= primaryCap && secondaryRoot) useSecondary = true
  }
  if (useSecondary && secondaryCap > 0) {
    const used2 = await getDirSize(secondaryRoot)
    if (used2 >= secondaryCap) useSecondary = false
  }

  const base = useSecondary && secondaryRoot ? secondaryRoot : primaryRoot
  const dir = join(base, uploadSubdirs[type])
  await ensureDir(dir)
  const urlPrefix = `/uploads/${uploadSubdirs[type]}`
  const location = useSecondary && secondaryRoot ? 'secondary' : 'primary'
  return { dir, urlPrefix, location }
}