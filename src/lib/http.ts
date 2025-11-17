import { NextResponse, NextRequest } from 'next/server'

export function ok(data: any = {}, status = 200) {
  return NextResponse.json(data, { status })
}

export function error(message = '服务器内部错误', status = 500, extra: any = {}) {
  return NextResponse.json({ error: message, ...extra }, { status })
}

export function badRequest(message = '参数不合法', extra: any = {}) {
  return error(message, 400, extra)
}

export function unauthorized(message = '未授权') {
  return error(message, 401)
}

export function forbidden(message = '权限不足') {
  return error(message, 403)
}

export function notFound(message = '未找到') {
  return error(message, 404)
}

const buckets: Map<string, {ts: number; count: number}> = new Map()

export function rateLimit(req: NextRequest, key: string, limit = 30, windowMs = 60_000) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  const k = `${key}:${ip}`
  const now = Date.now()
  const cur = buckets.get(k)
  if (!cur || now - cur.ts > windowMs) {
    buckets.set(k, { ts: now, count: 1 })
    return null
  }
  if (cur.count >= limit) {
    return error('请求过于频繁', 429)
  }
  cur.count += 1
  return null
}

export function requireFields(obj: Record<string, any>, fields: string[]) {
  const missing = fields.filter(f => !obj[f])
  if (missing.length) return badRequest('缺少必填项', { missing })
  return null
}