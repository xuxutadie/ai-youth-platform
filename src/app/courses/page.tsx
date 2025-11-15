'use client'

import HeroSection from '@/components/HeroSection'
import CoursesList from '@/components/CoursesList'
import SimpleCourseUpload from '@/components/SimpleCourseUpload'
import { useState } from 'react'

export default function CoursesPage() {
  const [showUpload, setShowUpload] = useState(false)
  const [refreshCourses, setRefreshCourses] = useState(false)

  const handleUploadSuccess = () => {
    setRefreshCourses(prev => !prev) // 切换状态以触发重新获取数据
    setShowUpload(false)
  }

  return (
    <main>
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">公益课程</h1>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showUpload ? '取消上传' : '上传课程'}
          </button>
        </div>
        
        {showUpload && (
          <div className="mb-8">
            <SimpleCourseUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}
        
        <CoursesList key={refreshCourses ? 'refresh' : 'normal'} />
      </div>
    </main>
  )
}