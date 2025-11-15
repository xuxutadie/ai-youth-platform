'use client'

import { useEffect, useMemo, useState } from 'react'
import VideoPoster from '@/components/VideoPoster'
import { useRouter, useSearchParams } from 'next/navigation'

type Item = {
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
  kind: 'work' | 'competition' | 'honor' | 'course'
}

export default function SearchPage() {
  const params = useSearchParams()
  const router = useRouter()
  const initialQ = params.get('q') || ''
  const [q, setQ] = useState(initialQ)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const currentQ = params.get('q') || ''
    setQ(currentQ)
  }, [params])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const resp = await fetch(`/api/search?q=${encodeURIComponent(q || '')}`)
        const data = await resp.json()
        const list: Item[] = Array.isArray(data?.items) ? data.items : []
        setItems(list)
      } catch (e) {
        console.error('搜索失败', e)
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [q])

  const grouped = useMemo(() => {
    const groups: Record<string, Item[]> = { work: [], competition: [], honor: [], course: [] }
    for (const it of items) {
      groups[it.kind] = groups[it.kind] || []
      groups[it.kind].push(it)
    }
    return groups
  }, [items])

  const total = items.length

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">全站搜索</h1>
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              router.push(`/search?q=${encodeURIComponent(q.trim())}`)
            }
          }}
          placeholder="搜索作品、作者、赛事、荣誉、课程..."
          className="w-full max-w-xl px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-slate-900/60"
        />
        <button
          onClick={() => router.push(`/search?q=${encodeURIComponent(q.trim())}`)}
          className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700"
        >搜索</button>
      </div>

      {loading ? (
        <div>正在搜索…</div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold">全部结果（{total}）</h2>
          </div>

          {(['work','competition','honor','course'] as const).map((k) => (
            <section key={k} className="space-y-3">
              <h3 className="text-lg font-semibold">
                {k === 'work' ? '学生作品' : k === 'competition' ? '白名单赛事' : k === 'honor' ? '学生荣誉' : '公益课程'}（{grouped[k].length}）
              </h3>
              {grouped[k].length === 0 ? (
                <p className="text-gray-500">暂无匹配</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grouped[k].map((it) => (
                    <div key={it._id || it.id} className="ui-card">
                      <div className="ui-card-header">
                        {it.imageUrl ? (
                          <img src={it.imageUrl} alt={it.title || it.name || ''} className="w-full h-40 object-cover" loading="lazy" />
                        ) : it.videoUrl ? (
                          <VideoPoster 
                            src={it.videoUrl}
                            className="w-full h-40 object-cover" 
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-100 dark:bg-gray-800" />
                        )}
                        <div className="ui-shine"><div className="ui-shine-bar group-hover:translate-x-[120%] duration-700" /></div>
                      </div>
                      <div className="p-4">
                        <div className="ui-card-title mb-1 line-clamp-1">{it.title || it.name}</div>
                        {it.description && <p className="ui-card-muted line-clamp-2">{it.description}</p>}
                        <div className="mt-3 flex gap-2">
                          {k === 'work' && (
                            <a href={`/works/${encodeURIComponent(it._id || it.id || '')}`} className="text-blue-600 hover:underline">查看作品</a>
                          )}
                          {k === 'competition' && (
                            <a href={`/competitions/${encodeURIComponent(it._id || it.id || '')}`} className="text-blue-600 hover:underline">查看赛事</a>
                          )}
                          {k === 'honor' && (
                            <a href={`/honors/${encodeURIComponent(it._id || it.id || '')}`} className="text-blue-600 hover:underline">查看荣誉</a>
                          )}
                          {k === 'course' && (
                            <a href={`/courses`} className="text-blue-600 hover:underline">查看课程</a>
                          )}
                        </div>
                      </div>
                      <div className="ui-card-footer-line" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}