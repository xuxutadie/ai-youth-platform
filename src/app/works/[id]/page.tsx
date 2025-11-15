"use client"

import { useEffect, useState } from 'react'

interface Item {
  _id?: string
  id?: string
  filename?: string
  name?: string
  title?: string
  description?: string
  imageUrl?: string
  videoUrl?: string
  htmlUrl?: string
  url?: string
  type?: 'image' | 'video' | 'html'
  date?: string
  studentName?: string
  authorName?: string
  className?: string
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function matches(item: Item, id: string) {
  const decoded = safeDecode(id)
  return (
    item._id === id ||
    item.id === id ||
    item.filename === id ||
    item.name === decoded ||
    item.title === decoded
  )
}

export default function WorkDetail({ params }: { params: { id: string } }) {
  const { id } = params
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const resp = await fetch('/api/works')
        const data = await resp.json()
        const list: Item[] = Array.isArray(data) ? data : Array.isArray(data?.works) ? data.works : []
        const found = list.find((it) => matches(it, id)) || null
        setItem(found)
      } catch (e) {
        console.error('获取作品详情失败', e)
        setItem(null)
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id])

  if (loading) {
    return <div className="p-6">加载中…</div>
  }
  if (!item) {
    return <div className="p-6">未找到该作品</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">{item.title || item.name}</span>
      </h1>
      {(() => {
        const url = item.imageUrl || item.videoUrl || item.htmlUrl || (item as any).url || ''
        const ext = typeof url === 'string' ? url.split('.').pop()?.toLowerCase() : ''
        const type = item.type || (
          ['mp4','webm','ogg'].includes(ext || '') ? 'video' :
          ['html','htm'].includes(ext || '') ? 'html' : 'image'
        )
        if (!url) return null
        if (type === 'image') {
          return <img src={url} alt={item.title || item.name || ''} className="w-full max-h-[480px] object-contain bg-white rounded" />
        }
        if (type === 'video') {
          return <video src={url} controls className="w-full rounded" />
        }
        if (type === 'html') {
          return <iframe src={url} className="w-full h-[480px] bg-white rounded" />
        }
        return null
      })()}
      {item.description && <p className="text-gray-700 leading-relaxed">{item.description}</p>}
      {item.authorName && (
        <p className="text-sm text-gray-500">作者：<span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent font-medium">{item.authorName}</span></p>
      )}
      {item.className && (
        <p className="text-sm text-gray-500">班级：<span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">{item.className}</span></p>
      )}
      {item.date && <p className="text-sm text-gray-500">日期：{item.date}</p>}
    </div>
  )
}