"use client"

import { useState, useEffect, useRef } from 'react'
import { apiGet } from '@/lib/api'

interface ContentSectionProps {
  title: string
  type: 'competitions' | 'works' | 'honors' | 'courses'
  limit?: number
}

export default function ContentSection({ title, type, limit = 3 }: ContentSectionProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  function getItemId(it: any) {
    const raw = it?._id || it?.id || it?.filename || it?.name || it?.title || ''
    return encodeURIComponent(String(raw))
  }

  function VideoThumbnail({ src, alt }: { src: string; alt?: string }) {
    const [thumb, setThumb] = useState<string>('')
    const [error, setError] = useState<string>('')
    useEffect(() => {
      let canceled = false
      const video = document.createElement('video')
      // 仅跨域地址才设置 crossOrigin，避免同源被错误标记
      try {
        const isAbsolute = /^https?:\/\//.test(src)
        const sameOrigin = isAbsolute ? src.startsWith(window.location.origin) : true
        if (!sameOrigin) video.crossOrigin = 'anonymous'
      } catch {}
      video.src = src
      video.muted = true
      video.playsInline = true
      video.preload = 'metadata'

      const timeout = setTimeout(() => {
        if (!canceled && !thumb) setError('timeout')
      }, 3000)

      const drawFrame = () => {
        try {
          const canvas = document.createElement('canvas')
          const w = video.videoWidth || 640
          const h = video.videoHeight || 360
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          ctx.drawImage(video, 0, 0, w, h)
          const url = canvas.toDataURL('image/jpeg', 0.85)
          if (!canceled) setThumb(url)
        } catch (e) {
          console.warn('视频缩略图生成失败', e)
          if (!canceled) setError('draw_failed')
        }
      }

      const onLoadedMeta = () => {
        try {
          // 跳到0.15s，避免部分视频第一帧是黑帧
          video.currentTime = 0.15
        } catch {}
      }
      const onSeeked = () => {
        drawFrame()
        clearTimeout(timeout)
      }
      const onError = () => {
        if (!canceled) setError('load_error')
        clearTimeout(timeout)
      }

      video.addEventListener('loadedmetadata', onLoadedMeta)
      video.addEventListener('seeked', onSeeked)
      video.addEventListener('error', onError)
      // 触发加载
      video.load()

      return () => {
        canceled = true
        clearTimeout(timeout)
        video.removeEventListener('loadedmetadata', onLoadedMeta)
        video.removeEventListener('seeked', onSeeked)
        video.removeEventListener('error', onError)
      }
    }, [src])

    if (thumb) {
      return <img src={thumb} alt={alt || '视频缩略图'} className="w-full h-full object-contain bg-gray-800" />
    }
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <span className="text-gray-400 text-sm">
          {error ? '无法生成视频缩略图' : '生成视频缩略图中…'}
        </span>
      </div>
    )
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiGet(`/api/${type}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()

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

        setData(items.slice(0, limit))
      } catch (error) {
        console.error(`获取${title}数据失败:`, error)
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [title, type, limit])

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
    <div className="mb-12 max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
          {title}
        </h2>
        <a
          href={`/${type}`}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
        >
          查看更多 {getTypeName()}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-50 dark:bg-gray-800"></div>
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
            <a
              key={index}
              href={`/${type}/${getItemId(item)}`}
            className="group ui-card block"
              aria-label={`查看${getTypeName()}：${item.title || item.name}`}
            >
              <div className="ui-card-header">
                {(() => {
                  const url: string | undefined = item?.url
                  const imgSrc: string | undefined = item?.imageUrl || (url && (() => {
                    try {
                      const ext = (url.split('.').pop() || '').toLowerCase()
                      if (['mp4','webm','ogg','mkv'].includes(ext)) return undefined
                      if (['html','htm'].includes(ext)) return undefined
                      return url
                    } catch { return url }
                  })())
                  const videoSrc: string | undefined = item?.videoUrl || (url && (() => {
                    try {
                      const ext = (url.split('.').pop() || '').toLowerCase()
                      return ['mp4','webm','ogg','mkv'].includes(ext) ? url : undefined
                    } catch { return undefined }
                  })())

                  if (imgSrc) {
                    return (
                      <img
                        src={imgSrc}
                        alt={item.title || item.name}
                        className="w-full h-full object-contain bg-gray-800 transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )
                  }
                  if (videoSrc) {
                    return <VideoThumbnail src={videoSrc} alt={item.title || item.name} />
                  }
                  return (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500 text-sm">{getTypeName()}图片</span>
                    </div>
                  )
                })()}
                {item.badge && (
                  <span className="absolute top-3 left-3 ui-chip">{item.badge}</span>
                )}
                {/* 图片闪光动效条 */}
                <div className="ui-shine">
                  <div className="ui-shine-bar group-hover:translate-x-[120%] duration-700" />
                </div>
              </div>
              <div className="p-5 space-y-2 min-h-[120px]">
                <h3 className="text-lg font-semibold mb-1 leading-tight line-clamp-1">
                  <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">{item.title || item.name}</span>
                </h3>
                {/* 作品类型：显示作者与班级（带回退） */}
                {type === 'works' && (
                  <>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600 dark:text-gray-300 text-xs">作者:</span>
                      <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent text-sm font-medium">{item.authorName || item.studentName || '未知'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600 dark:text-gray-300 text-xs">年级:</span>
                      <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent text-sm">{item.className || '未填写'}</span>
                    </div>
                  </>
                )}
                {/* 荣誉类型：显示获奖人与年级（蓝绿色渐变） */}
                {type === 'honors' && item.studentName && (
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-600 dark:text-gray-300 text-xs">获奖人:</span>
                    <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent text-sm font-medium">{item.studentName}</span>
                    <span className="text-gray-400 dark:text-gray-400 text-xs">· 年级:</span>
                    <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent text-sm">{item.className || item.grade || '未填写'}</span>
                  </div>
                )}
                {/* 移除日期与描述显示，避免多余文字 */}
              </div>
              {/* 底部渐变指示条 */}
              <div className="ui-card-footer-line" />
            </a>
          ))}
        </div>
      ) : (
          <div className="ui-card p-10 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">暂无{getTypeName()}数据</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">请在管理页面上传或置顶需要展示的内容</p>
        </div>
      )}
    </div>
  )
}