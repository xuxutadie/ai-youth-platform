import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

type SearchItem = {
  _id?: string
  id?: string
  title?: string
  name?: string
  description?: string
  authorName?: string
  studentName?: string
  className?: string
  grade?: string
  url?: string
  imageUrl?: string
  videoUrl?: string
  htmlUrl?: string
  createdAt?: string
  kind: 'work' | 'competition' | 'honor' | 'course'
}

function normalizeText(v: any): string {
  return (v || '').toString().trim().toLowerCase()
}

function matchesTerm(item: any, term: string): boolean {
  const t = normalizeText(term)
  if (!t) return true
  const fields = [
    item.title,
    item.name,
    item.description,
    item.authorName,
    item.studentName,
    item.className,
    item.grade,
    item.url,
    item.imageUrl,
    item.videoUrl,
  ]
  const fileName = typeof item.url === 'string' ? item.url.split('/').pop() : ''
  return fields.some((f) => normalizeText(f).includes(t)) || normalizeText(fileName).includes(t)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const origin = (req as any)?.nextUrl?.origin || new URL(req.url).origin

    // Fetch in parallel from existing endpoints
    const [worksRes, compsRes, honorsRes, coursesRes] = await Promise.all([
      fetch(`${origin}/api/works`),
      fetch(`${origin}/api/competitions`),
      fetch(`${origin}/api/honors`),
      fetch(`${origin}/api/courses`),
    ])

    const [worksJson, compsJson, honorsJson, coursesJson] = await Promise.all([
      worksRes?.json().catch(() => ({})),
      compsRes?.json().catch(() => ({})),
      honorsRes?.json().catch(() => ({})),
      coursesRes?.json().catch(() => ({})),
    ])

    const works: any[] = Array.isArray(worksJson?.works) ? worksJson.works : Array.isArray(worksJson) ? worksJson : []
    const competitions: any[] = Array.isArray(compsJson?.competitions) ? compsJson.competitions : Array.isArray(compsJson) ? compsJson : []
    const honors: any[] = Array.isArray(honorsJson?.honors) ? honorsJson.honors : Array.isArray(honorsJson) ? honorsJson : []
    const courses: any[] = Array.isArray(coursesJson?.courses) ? coursesJson.courses : Array.isArray(coursesJson) ? coursesJson : []

    const workItems: SearchItem[] = works.map((w) => {
      const url = w.url || w.imageUrl || w.videoUrl || w.htmlUrl || ''
      const ext = typeof url === 'string' ? url.split('.').pop()?.toLowerCase() : ''
      const inferredType = w.type || (
        ['mp4','webm','ogg'].includes(ext || '') ? 'video' :
        ['html','htm'].includes(ext || '') ? 'html' : 'image'
      )
      const imageUrl = w.imageUrl || (inferredType === 'image' ? url : undefined)
      const videoUrl = w.videoUrl || (inferredType === 'video' ? url : undefined)
      const htmlUrl = w.htmlUrl || (inferredType === 'html' ? url : undefined)
      return {
        ...w,
        kind: 'work',
        title: w.title || w.name,
        url,
        imageUrl,
        videoUrl,
        htmlUrl,
      }
    })
    const compItems: SearchItem[] = competitions.map((c) => ({
      ...c,
      kind: 'competition',
      title: c.title || c.name,
    }))
    const honorItems: SearchItem[] = honors.map((h) => ({
      ...h,
      kind: 'honor',
      title: h.title || h.name,
    }))
    const courseItems: SearchItem[] = courses.map((c) => ({
      ...c,
      kind: 'course',
      title: c.title || c.name,
    }))

    const all: SearchItem[] = [...workItems, ...compItems, ...honorItems, ...courseItems]
    const filtered = q ? all.filter((it) => matchesTerm(it, q)) : all

    // Basic scoring: prioritize title match, then description/author/student
    const termLower = q.toLowerCase()
    const score = (it: SearchItem) => {
      const titleHit = normalizeText(it.title).includes(termLower) ? 3 : 0
      const nameHit = normalizeText(it.name).includes(termLower) ? 2 : 0
      const descHit = normalizeText(it.description).includes(termLower) ? 2 : 0
      const peopleHit = normalizeText(it.authorName).includes(termLower) || normalizeText(it.studentName).includes(termLower) ? 2 : 0
      const metaHit = (normalizeText(it.className).includes(termLower) || normalizeText(it.grade).includes(termLower)) ? 1 : 0
      const urlHit = normalizeText(it.url).includes(termLower) ? 1 : 0
      return titleHit + nameHit + descHit + peopleHit + metaHit + urlHit
    }
    const ranked = filtered.sort((a, b) => score(b) - score(a))

    return NextResponse.json({ items: ranked, total: ranked.length, q }, { status: 200 })
  } catch (e) {
    console.error('全站搜索错误:', e)
    return NextResponse.json({ items: [], total: 0 }, { status: 200 })
  }
}