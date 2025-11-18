import { NextRequest } from 'next/server'
import { join } from 'path'
import { existsSync } from 'fs'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { authMiddleware } from '@/lib/auth'
import { ok, badRequest, requireFields } from '@/lib/http'

type SiteConfig = {
  siteTitle: string
  logoUrl: string
  primaryColor: string
  theme: 'light' | 'dark'
  updatedAt: string
}

const dataDir = join(process.cwd(), 'public', 'data')
const configFile = join(dataDir, 'site-config.json')

async function readConfig(): Promise<SiteConfig> {
  if (!existsSync(configFile)) {
    return {
      siteTitle: 'AI Youth Platform',
      logoUrl: '',
      primaryColor: '#1677ff',
      theme: 'light',
      updatedAt: new Date().toISOString(),
    }
  }
  try {
    const content = await readFile(configFile, 'utf-8')
    const cfg = content ? JSON.parse(content) : {}
    return {
      siteTitle: cfg.siteTitle || 'AI Youth Platform',
      logoUrl: cfg.logoUrl || '',
      primaryColor: cfg.primaryColor || '#1677ff',
      theme: (cfg.theme === 'dark' ? 'dark' : 'light'),
      updatedAt: cfg.updatedAt || new Date().toISOString(),
    }
  } catch {
    return {
      siteTitle: 'AI Youth Platform',
      logoUrl: '',
      primaryColor: '#1677ff',
      theme: 'light',
      updatedAt: new Date().toISOString(),
    }
  }
}

async function writeConfig(cfg: Omit<SiteConfig, 'updatedAt'>): Promise<SiteConfig> {
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
  const toSave: SiteConfig = { ...cfg, updatedAt: new Date().toISOString() }
  await writeFile(configFile, JSON.stringify(toSave, null, 2), 'utf-8')
  return toSave
}

export async function GET(request: NextRequest): Promise<Response> {
  const auth = await authMiddleware(request, ['admin'])
  if (!(auth as any).success) return auth as Response
  const cfg = await readConfig()
  return ok({ config: cfg })
}

export async function PUT(request: NextRequest): Promise<Response> {
  const auth = await authMiddleware(request, ['admin'])
  if (!(auth as any).success) return auth as Response
  try {
    const body = await request.json()
    const reqErr = requireFields(body, ['siteTitle', 'primaryColor', 'theme'])
    if (reqErr) return reqErr
    const siteTitle: string = String(body.siteTitle || '').trim()
    const logoUrl: string = String(body.logoUrl || '').trim()
    const primaryColor: string = String(body.primaryColor || '').trim()
    const theme: 'light' | 'dark' = body.theme === 'dark' ? 'dark' : 'light'

    if (siteTitle.length > 100) return badRequest('站点标题过长')
    if (logoUrl && !/^https?:\/\//.test(logoUrl) && !logoUrl.startsWith('/')) {
      return badRequest('Logo地址需为 http(s) 链接或站内路径')
    }
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(primaryColor)) {
      return badRequest('主色必须是十六进制色值，如 #1677ff')
    }

    const saved = await writeConfig({ siteTitle, logoUrl, primaryColor, theme })
    return ok({ message: '保存成功', config: saved })
  } catch {
    return badRequest('请求体格式错误')
  }
}