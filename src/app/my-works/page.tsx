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
  className?: string
  grade?: string
}

export default function MyWorksPage() {
  const { isAuthenticated, user } = useAuth()
  const [allWorks, setAllWorks] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'html'>('all')
  const [term, setTerm] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [editWork, setEditWork] = useState<WorkItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)

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
    const base = selectedType === 'all' ? myWorks : myWorks.filter(w => w.type === selectedType)
    const t = term.trim().toLowerCase()
    if (!t) return base
    return base.filter(w => {
      const title = (w.title || '').toLowerCase()
      const desc = (w.description || '').toLowerCase()
      const cls = (w.className || '').toLowerCase()
      const grade = (w.grade || '').toLowerCase()
      const fileName = (w.url || '').split('/').pop()?.toLowerCase() || ''
      return title.includes(t) || desc.includes(t) || cls.includes(t) || grade.includes(t) || fileName.includes(t)
    })
  }, [myWorks, selectedType, term])

  const openEdit = (w: WorkItem) => {
    setEditWork(w)
    setEditTitle(w.title || '')
    setEditDesc(w.description || '')
    setEditFile(null)
    setShowEdit(true)
  }

  const onEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setEditFile(f)
  }

  const submitEdit = async () => {
    if (!editWork) return
    try {
      const id = editWork._id || editWork.id || ''
      if (!id) return
      if (editFile) {
        const fd = new FormData()
        fd.append('file', editFile)
        fd.append('workId', id)
        if (editTitle) fd.append('title', editTitle)
        const t = editWork.type || 'image'
        fd.append('type', t)
        if (editWork.grade) fd.append('grade', editWork.grade)
        if (editWork.className) fd.append('className', editWork.className)
        await fetch('/api/works/upload', { method: 'POST', body: fd })
      } else {
        const body: any = { title: editTitle }
        if (editDesc) body.description = editDesc
        await fetch(`/api/works/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
      setShowEdit(false)
      setEditWork(null)
      setEditFile(null)
      await fetchWorks()
      alert('更新成功')
    } catch (e) {
      alert('更新失败')
    }
  }

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
          <div className="flex items-center gap-3">
            <a href="/works" className="text-cyan-700 hover:underline">查看全部作品</a>
            <input
              type="text"
              placeholder="搜索作品、文件名、班级、年级..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="px-2 py-1 text-sm rounded-md border border-gray-300"
            />
            {term && <span className="text-sm text-gray-600">结果：{filteredWorks.length}</span>}
          </div>
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
                <div className="mt-2 flex gap-2 justify-end">
                  <button
                    onClick={() => openEdit(work)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    编辑
                  </button>
                </div>
                
        </div>
            </div>
          ))}
        </div>
        {showEdit && editWork && (
          <div className="fixed inset-0 bg-black/40 grid place-items-center">
            <div className="bg-white rounded-xl shadow p-6 w-[90%] max-w-md">
              <h2 className="text-lg font-semibold text-cyan-700">编辑作品</h2>
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="作品标题"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="作品描述（可选）"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  rows={3}
                />
                <div>
                  <span className="text-sm text-gray-700">替换文件（可选）</span>
                  <input type="file" onChange={onEditFileChange} className="mt-1" />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => { setShowEdit(false); setEditWork(null); setEditFile(null) }} className="px-3 py-1 rounded-md border border-gray-300">取消</button>
                <button onClick={submitEdit} className="px-3 py-1 rounded-md bg-cyan-600 text-white">保存</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}