'use client'

import { useState } from 'react'
import VideoPoster from '@/components/VideoPoster'
import useWorkSearchStore from '@/stores/useWorkSearchStore'
import useWorks from '@/hooks/useWorks'
import WorksListSkeleton from './WorksListSkeleton'

export default function WorksList() {
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'html'>('all')
  const { works, isLoading, error } = useWorks()
  const searchTerm = useWorkSearchStore((s) => s.searchTerm)
  const setSearchTerm = useWorkSearchStore((s) => s.setSearchTerm)
  const [failedMap, setFailedMap] = useState<Record<string, boolean>>({})

  const isLikelyInvalidDemoUrl = (url?: string) => {
    if (!url) return true
    try {
      const u = new URL(url)
      const host = u.host.toLowerCase()
      const path = u.pathname.toLowerCase()
      if (host === 'res.cloudinary.com' && path.startsWith('/demo/')) {
        return true
      }
    } catch {}
    return false
  }

  if (isLoading) {
    return <WorksListSkeleton />
  }

  if (error) {
    return <div className="text-red-500">Error loading works.</div>
  }

  const renderWorkContent = (work: any) => {
    console.log("Rendering work:", work); // Log the work object to the console
    // 确定作品的URL
    const workUrl = work.url;
    const failed = failedMap[work._id]
    const invalid = isLikelyInvalidDemoUrl(workUrl)

    if (work.type === 'image') {
      return (
        <div className="ui-card-header">
          {failed || invalid ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-300">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14H11v-2h2v2zm0-4H11V6h2v6z" /></svg>
                <span>图片资源不可用</span>
              </div>
            </div>
          ) : (
            <img
              src={workUrl}
              alt={work.title}
              className="w-full h-full object-contain bg-gray-800 cursor-pointer"
              loading="lazy"
              onClick={() => window.open(workUrl, '_blank')}
              onError={() => setFailedMap((m) => ({ ...m, [work._id]: true }))}
            />
          )}
          <div className="ui-shine"><div className="ui-shine-bar group-hover:translate-x-[120%] duration-700" /></div>
        </div>
      )
    } else if (work.type === 'video') {
      return (
        <div className="ui-card-header flex items-center justify-center">
          <div className="relative w-full h-full" onClick={() => window.open(workUrl, '_blank')}>
            <VideoPoster
              src={workUrl}
              controls={false}
              className="w-full h-full object-contain bg-gray-800 cursor-pointer"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-12 h-12 text-white bg-gray-900 bg-opacity-50 rounded-full p-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ui-shine"><div className="ui-shine-bar group-hover:translate-x-[120%] duration-700" /></div>
        </div>
      )
    } else if (work.type === 'html') {
      return (
        <div className="ui-card-header flex items-center justify-center">
          <div className="relative w-full h-full">
            {failed || invalid ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-300">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14H11v-2h2v2zm0-4H11V6h2v6z" /></svg>
                  <span>网页资源不可用</span>
                </div>
              </div>
            ) : (
              <iframe
                src={workUrl}
                className="w-full h-full"
                title={work.title}
                sandbox="allow-same-origin allow-scripts"
                loading="lazy"
                onError={() => setFailedMap((m) => ({ ...m, [work._id]: true }))}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-900 bg-opacity-10">
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ui-shine"><div className="ui-shine-bar group-hover:translate-x-[120%] duration-700" /></div>
        </div>
      )
    }
    
    return (
      <div className="ui-card-header flex items-center justify-center">
        <p className="text-gray-400">未知类型</p>
      </div>
    )
  }

  const filteredWorksByType = selectedType === 'all' ? works : works.filter(w => w.type === selectedType)

  const term = (searchTerm || '').trim().toLowerCase()
  const filteredWorks = term
    ? filteredWorksByType.filter(work => {
        const title = (work.title || '').toLowerCase()
        const author = (work.authorName || '').toLowerCase()
        const student = (work.studentName || '').toLowerCase()
        const cls = (work.className || '').toLowerCase()
        const grade = (work.grade || '').toLowerCase()
        const typeStr = (work.type || '').toLowerCase()
        const fileName = (work.url || '').split('/').pop()?.toLowerCase() || ''
        return (
          title.includes(term) ||
          author.includes(term) ||
          student.includes(term) ||
          cls.includes(term) ||
          grade.includes(term) ||
          typeStr.includes(term) ||
          fileName.includes(term)
        )
      })
    : filteredWorksByType

  return (
    <div>
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
                ? 'border-[#00BCD4] text-[#00BCD4] bg-[#00BCD4]/20'
                : 'border-[#00BCD4] text-[#00BCD4] bg-transparent hover:bg-[#00BCD4]/10')
            }
          >
            {opt.label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="text"
            placeholder="搜索作品、作者、文件名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-1 text-sm rounded-md border border-[#00BCD4] text-[#00BCD4] placeholder-[#00BCD4] bg-transparent dark:bg-transparent"
          />
          {term && (
            <span className="text-sm text-[#00BCD4]">当前搜索：{searchTerm}（{filteredWorks.length} 项）</span>
          )}
        </div>
      </div>
      {filteredWorks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredWorks.map((work, index) => (
            <div key={index} className="group ui-card border-[#00BCD4]">
              {renderWorkContent(work)}
              <div className="p-3 space-y-1 min-h-[60px] bg-[#00BCD4] text-white">
                <h3 className="ui-card-title mb-2 line-clamp-1 min-h-[1.75rem]">
                  <span className="text-white">{work.title}</span>
                </h3>
                <p className="mb-1 text-sm text-white">
                  作者: <span className="font-bold">{work.authorName || work.studentName || '未知'}</span> · 年级: <span className="font-bold">{work.grade || '未填写'}</span> · 班级: <span className="font-bold">{work.className || '未填写'}</span>
                </p>
                <p className="mb-1 text-sm text-white">
                  类型: {work.type === 'image' ? '图片' : work.type === 'video' ? '视频' : '网页'}
                </p>
                <p className="mb-1 text-sm text-white">
                  上传时间: {new Date(work.createdAt).toLocaleDateString()}
                </p>
                <a 
                  href={work.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-3 py-1 text-sm rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                >
                  查看作品
                </a>
              </div>
              <div className="ui-card-footer-line" />
            </div>
          ))}
        </div>
      ) : (
  <div className="ui-card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无{selectedType === 'all' ? '' : (selectedType === 'image' ? '图片' : selectedType === 'video' ? '视频' : '网页')}作品</p>
        </div>
      )}
    </div>
  )
}