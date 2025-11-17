import { stat, readdir, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { storageConfig, uploadSubdirs, UploadType } from '@/config/storage'

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