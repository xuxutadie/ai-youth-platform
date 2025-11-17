import { join } from 'path'

const toInt = (v: string | undefined, d: number) => {
  const n = v ? parseInt(v, 10) : d
  return Number.isFinite(n) ? n : d
}

export const storageConfig = {
  primaryRoot: process.env.UPLOAD_PRIMARY_ROOT || join(process.cwd(), 'public', 'uploads'),
  secondaryRoot: process.env.UPLOAD_SECONDARY_ROOT || '',
  capPrimaryMB: toInt(process.env.UPLOAD_CAP_PRIMARY_MB, 0),
  capSecondaryMB: toInt(process.env.UPLOAD_CAP_SECONDARY_MB, 0)
}

export const uploadSubdirs = {
  works: 'works',
  courses: 'courses',
  honors: 'honors',
  competitions: 'competitions',
  avatars: 'avatars'
} as const

export type UploadType = keyof typeof uploadSubdirs