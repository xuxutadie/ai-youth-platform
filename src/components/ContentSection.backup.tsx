"use client"

import { useState, useEffect } from 'react'
import { apiGet } from '@/lib/api'

interface ContentSectionProps {
  title: string
  type: 'competitions' | 'works' | 'honors' | 'courses'
}

export default function ContentSection({ title, type }: ContentSectionProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiGet(`/api/${type}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()

        // 兼容对象或数组响应：优先使用 result[type]，否则使用数组本身
        let items: any[] = []
        if (Array.isArray(result)) {
          items = result
        } else if (result && Array.isArray(result[type])) {
          items = result[type]
        } else if (result && Array.isArray(result.items)) {
          items = result.items
        } else {
          items = []
        }

        // 获取置顶ID并优先展示置顶项（最多3条）
        try {
          const pinnedResp = await apiGet('/api/pinned')
          if (pinnedResp.ok) {
            const pinnedData = await pinnedResp.json()
            const pinnedIds: string[] = Array.isArray(pinnedData?.[type]) ? pinnedData[type] : []
            if (pinnedIds.length > 0) {
              const pinnedItems = items.filter((it) => pinnedIds.includes(it._id))
              const nonPinned = items.filter((it) => !pinnedIds.includes(it._id))
              items = [...pinnedItems, ...nonPinned]
            }
          }
        } catch (pinErr) {
          console.warn('置顶数据获取失败:', pinErr)
        }

        setData(items.slice(0, 3))
      } catch (error) {
        console.error(`获取${title}数据失败:`, error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [title, type])

  const getTypeName = () => {
    switch (type) {
      case 'competitions':
        return '赛事'
      case 'works':
        return '作品'
      case 'honors':
        return '荣誉'
      case 'courses':
        return '课程'
      default:
        return '内容'
    }
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">{title}</h2>
        <a 
          href={`/${type}`}
          className="text-blue-600 hover:underline"
        >
          查看更多 {getTypeName()} 
        </a>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-50"></div>
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-100 rounded w-4/5"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                <div className="h-4 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((item, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
              <div className="h-48 bg-gray-50 relative overflow-hidden">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title || item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">{getTypeName()}图片</span>
                  </div>
                )}
                {item.badge && (
                  <span className="absolute top-3 left-3 bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 leading-tight">
                  {item.title || item.name}
                </h3>
                {item.studentName && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500 text-xs">获奖人:</span>
                    <span className="text-gray-700 text-sm font-medium">{item.studentName}</span>
                  </div>
                )}
                {item.date && (
                  <div className="flex items-center space-x-1 text-gray-500 text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{item.date}</span>
                  </div>
                )}
                {item.description && (
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无{getTypeName()}数据</h3>
          <p className="text-gray-400 text-sm">请在管理页面上传或置顶需要展示的内容</p>
        </div>
      )}
    </div>
  )
}

