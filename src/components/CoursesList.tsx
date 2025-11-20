"use client"

import { useState, useEffect, useRef } from 'react'

function VideoThumbnail({ src, alt }: { src: string, alt: string }) {
  const [thumb, setThumb] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let canceled = false
    const video = document.createElement('video')
    // 仅对跨域地址设置 crossOrigin，避免同源被误标记
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

    const draw = () => {
      try {
        const canvas = document.createElement('canvas')
        const w = video.videoWidth || 320
        const h = video.videoHeight || 180
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

    const onMeta = () => {
      try { video.currentTime = 0.15 } catch {}
    }
    const onSeeked = () => { draw(); clearTimeout(timeout) }
    const onError = () => { if (!canceled) setError('load_error'); clearTimeout(timeout) }

    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
    video.load()

    return () => {
      canceled = true
      clearTimeout(timeout)
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }
  }, [src])

  if (!thumb) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="sr-only">{error ? '无法生成视频缩略图' : '生成视频缩略图中'}</span>
      </div>
    )
  }
  return <img src={thumb} alt={alt} className="w-full h-full object-contain bg-gray-800" />
}

export default function CoursesList() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        const result = await response.json()
        setCourses(Array.isArray(result.courses) ? result.courses : [])
      } catch (error) {
        console.error('获取课程数据失败:', error)
        setCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const getFileType = (url: string) => {
    if (!url) return 'unknown'
    const ext = url.split('.').pop()?.toLowerCase() || ''
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'image'
    if (['mp4','avi','mov','wmv','flv','webm'].includes(ext)) return 'video'
    return 'other'
  }

  const renderContentPreview = (course: any) => {
    if (course.imageUrl) {
      const fileType = getFileType(course.imageUrl)
      if (fileType === 'image') {
        return <img src={course.imageUrl} alt={course.title} className="w-full h-full object-contain bg-gray-800" />
      }
    }
    if (course.videoUrl) {
      return <VideoThumbnail src={course.videoUrl} alt={course.title} />
    }
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  const getViewButtonText = (url: string) => {
    const fileType = getFileType(url)
    switch (fileType) {
      case 'image': return '查看图片'
      case 'video': return '观看视频'
      default: return '查看文件'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
        <div key={index} className="ui-card p-4 animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
        <a key={course._id || course.title} href={`/courses/${course._id}`} className="group ui-card block">
              <div className="ui-card-header">
                {renderContentPreview(course)}
                {/* 图片闪光动效条 */}
                <div className="ui-shine">
                  <div className="ui-shine-bar group-hover:translate-x-[120%] duration-700" />
                </div>
              </div>
              <div className="p-5 space-y-2 min-h-[120px] bg-[#12C99D] text-[#FFEA00]">
                <h3 className="ui-card-title mb-1 leading-tight">
                  <span className="text-[#FFEA00]">{course.title}</span>
                </h3>
                <p className="mb-2 line-clamp-2 leading-relaxed text-[#FFEA00]">{course.description}</p>
                {(course.imageUrl || course.videoUrl) && (
                  <a 
                    href={course.videoUrl || course.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-[#FFEA00] px-3 py-2 rounded-md shadow-sm hover:bg-gray-100 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getViewButtonText(course.videoUrl || course.imageUrl)}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
              {/* 底部渐变指示条 */}
              <div className="ui-card-footer-line" />
            </a>
          ))}
        </div>
      ) : (
      <div className="ui-card p-8 text-center">
          <p className="text-gray-700">暂无课程数据</p>
        </div>
      )}
    </div>
  )
}
