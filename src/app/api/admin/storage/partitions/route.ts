import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { ok, error } from '@/lib/http'
import { authMiddleware } from '@/lib/auth'

const execp = promisify(exec)

type PartInfo = {
  device: string
  mountpoint: string
  fstype: string
  sizeGB: number
  usedGB: number
  availGB: number
}

function gb(n: number) { return Math.round(n / 1024 / 1024 / 1024 * 100) / 100 }

async function linuxList(): Promise<PartInfo[]> {
  const res = await execp(`lsblk -J -o NAME,MOUNTPOINT,FSTYPE,SIZE`)
  const data = JSON.parse(res.stdout)
  const items: PartInfo[] = []
  const nodes: any[] = data.blockdevices || []
  const flat: any[] = []
  const walk = (n: any, parentName?: string) => {
    const name = parentName ? `${parentName}` : n.name
    if (n.mountpoint) flat.push({ name: n.name, mountpoint: n.mountpoint, fstype: n.fstype })
    ;(n.children || []).forEach((c: any) => walk(c, c.name))
  }
  nodes.forEach((n: any) => walk(n))
  const excludeMounts = ['/boot/efi', '/proc', '/sys', '/run', '/dev', '/snap', '/var/tmp', '/tmp']
  for (const it of flat) {
    const m = it.mountpoint
    if (!m || excludeMounts.some(x => m.startsWith(x))) continue
    const df = await execp(`df -P '${m.replace(/'/g, "'\\''")}'`)
    const lines = df.stdout.trim().split(/\r?\n/)
    if (lines.length >= 2) {
      const cols = lines[1].split(/\s+/)
      const total = parseInt(cols[1], 10) * 1024
      const used = parseInt(cols[2], 10) * 1024
      const avail = parseInt(cols[3], 10) * 1024
      items.push({
        device: `/dev/${it.name}`,
        mountpoint: m,
        fstype: it.fstype || '',
        sizeGB: gb(total),
        usedGB: gb(used),
        availGB: gb(avail)
      })
    }
  }
  return items
}

async function windowsList(): Promise<PartInfo[]> {
  const res = await execp(`wmic logicaldisk get name,size,freespace,filesystem`) 
  const lines = res.stdout.trim().split(/\r?\n/).slice(1)
  const items: PartInfo[] = []
  for (const ln of lines) {
    const cols = ln.trim().split(/\s+/)
    if (cols.length < 4) continue
    const name = cols[0]
    const free = parseInt(cols[1] || '0', 10)
    const size = parseInt(cols[2] || '0', 10)
    const fs = cols[3] || ''
    const used = size - free
    items.push({ device: name, mountpoint: name, fstype: fs, sizeGB: gb(size), usedGB: gb(used), availGB: gb(free) })
  }
  return items
}

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const list = process.platform === 'win32' ? await windowsList() : await linuxList()
    return ok({ partitions: list })
  } catch (e: any) {
    return error('分区探测失败', 500, { detail: String(e?.message || e) })
  }
}