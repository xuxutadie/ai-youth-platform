'use client'

import { useEffect, useMemo, useState } from 'react'
import useAuth from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiDelete } from '@/lib/api'

type WorkItem = {
  _id?: string
  id?: string
  title?: string
  type?: 'image' | 'video' | 'html'
  description?: string
  studentName?: string
  uploaderId?: string
  imageUrl?: string
  videoUrl?: string
  htmlUrl?: string
  url?: string
}

export default function MyWorksPage() {
  const { isAuthenticated, user } = useAuth()
  const [allWorks, setAllWorks] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'html'>('all')

  const fetchWorks = async () => {
    if (!user?._id) return
    setLoading(true)
    setError('')
    try {
      const resp = await fetch(`/api/works?uploaderId=${encodeURIComponent(user._id)}`)
      const data = await resp.json()
      const list: WorkItem[] = Array.isArray(data?.works) ? data.works : Array.isArray(data) ? data : []
      setAllWorks(list)
    } catch (e) {
      console.error('获取作品失败', e)
      setError('获取作品失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorks()
  }, [user?._id])

  const handleDelete = async (e: React.MouseEvent, workId: string) => {
    e.preventDefault() // 阻止Link的默认跳转行为
    e.stopPropagation() // 阻止事件冒泡

    if (!confirm('确定要删除这个作品吗？')) {
      return
    }

    try {
      const resp = await apiDelete(`/api/works/${workId}`)
      const data = await resp.json()
      if (resp.ok) {
        alert('作品删除成功！')
        fetchWorks() // 重新加载作品列表
      } else {
        alert('删除失败，请稍后再试。')
      }
    } catch (e) {
      console.error('删除作品失败', e)
      alert('删除作品失败，请稍后再试。')
    }
  }

  const myWorks = useMemo(() => {
    // 当使用查询参数过滤时，allWorks已经是当前用户作品
    if (user?._id) return allWorks
    // 未登录或无用户ID时，返回空
    return []
  }, [allWorks, user])

  const filteredWorks = useMemo(() => {
    return selectedType === 'all' ? myWorks : myWorks.filter(w => w.type === selectedType)
  }, [myWorks, selectedType])

  const renderThumb = (work: WorkItem) => {
    const workUrl = work.imageUrl || work.videoUrl || work.htmlUrl || work.url || ''
    if (work.type === 'image') {
      return (
        <img src={workUrl} alt={work.title || ''} className="w-full h-40 object-contain bg-white rounded" />
      )
    }
    if (work.type === 'video') {
      return (
        <video src={workUrl} className="w-full h-40 object-contain bg-black rounded" muted />
      )
    }
    if (work.type === 'html') {
      return (
        <div className="w-full h-40 grid place-items-center bg-gray-100 rounded text-gray-600">HTML 作品</div>
      )
    }
    return <div className="w-full h-40 grid place-items-center bg-gray-100 rounded text-gray-600">未知类型</div>
  }

  if (!isAuthenticated) {
    return (
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700">请先登录后再查看我的作品。</p>
            <a href="/login" className="mt-3 inline-block px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700">去登录</a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-cyan-700">我的作品</h1>
          <a href="/works" className="text-cyan-700 hover:underline">查看全部作品</a>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[
            { key: 'all', label: '全部' },
            { key: 'image', label: '图片' },
            { key: 'video', label: '视频' },
            { key: 'html', label: '网页' }
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedType(opt.key as any)}
              className={
                'px-3 py-1 rounded-full border transition-colors ' +
                (selectedType === opt.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50')
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading && <div className="text-gray-600">加载中…</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && myWorks.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-gray-700">
            暂无属于你的作品。你可以前往首页或作品页进行上传。
          </div>
        )}

        {!loading && !error && myWorks.length > 0 && filteredWorks.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-gray-700">
            暂无{selectedType === 'image' ? '图片' : selectedType === 'video' ? '视频' : selectedType === 'html' ? '网页' : ''}作品
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map(work => (
            <div key={work._id || work.id} className="bg-white rounded-xl shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <Link href={`/works/${work._id || work.id}`}>
                {renderThumb(work)}
              </Link>
              <div className="p-4">
                <Link href={`/works/${work._id || work.id}`}>
            <h3 className="text-lg font-semibold">
              <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">{work.title || '未命名作品'}</span>
            </h3>
                </Link>
                {work.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{work.description}</p>}
                <div className="flex justify-between items-center mt-3">
                  {work.url && (
                    <a href={work.url} target="_blank" rel="noreferrer" className="inline-block text-cyan-700 hover:underline" onClick={(e) => e.stopPropagation()}>打开原始链接</a>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, work._id || work.id || '')}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}