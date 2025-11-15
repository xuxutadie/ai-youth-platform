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
  date?: string
  studentName?: string
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

export default function HonorDetail({ params }: { params: { id: string } }) {
  const { id } = params
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const resp = await fetch('/api/honors')
        const data = await resp.json()
        const list: Item[] = Array.isArray(data) ? data : Array.isArray(data?.honors) ? data.honors : []
        const found = list.find((it) => matches(it, id)) || null
        setItem(found)
      } catch (e) {
        console.error('获取荣誉详情失败', e)
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
    return <div className="p-6">未找到该荣誉</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">{item.title || item.name}</span>
      </h1>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title || item.name || ''} className="w-full max-h-[480px] object-contain bg-white rounded" />
      ) : item.videoUrl ? (
        <video src={item.videoUrl} controls className="w-full rounded" />
      ) : null}
      {item.description && <p className="text-gray-700 leading-relaxed">{item.description}</p>}
      {item.studentName && <p className="text-sm text-gray-500">获奖人：{item.studentName}</p>}
      {item.date && <p className="text-sm text-gray-500">日期：{item.date}</p>}
    </div>
  )
}