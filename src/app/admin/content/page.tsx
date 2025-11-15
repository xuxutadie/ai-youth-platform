"use client"

import { useState, useEffect } from 'react'
import useAuth from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function ContentManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login')
      return
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>
  }

  if (!user || user.role !== 'admin') {
    return <div className="flex justify-center items-center min-h-screen">无权访问此页面</div>
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">内容管理</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              返回首页
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              返回管理员仪表板
            </button>
          </div>
        </div>
        
  <div className="ui-card p-6">
          <p className="text-gray-600 mb-4">
            选择下面的选项卡来管理不同类型的内容：
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              className="ui-card p-6 cursor-pointer"
              onClick={() => router.push('/admin/content/competitions')}
            >
              <h2 className="ui-card-title mb-2">赛事管理</h2>
              <p className="ui-card-muted">添加、编辑或删除白名单赛事</p>
              <div className="ui-card-footer-line" />
            </div>
            
            <div 
              className="ui-card p-6 cursor-pointer"
              onClick={() => router.push('/admin/content/works')}
            >
              <h2 className="ui-card-title mb-2">作品管理</h2>
              <p className="ui-card-muted">管理学生提交的作品</p>
              <div className="ui-card-footer-line" />
            </div>
            
            <div 
              className="ui-card p-6 cursor-pointer"
              onClick={() => router.push('/admin/content/honors')}
            >
              <h2 className="ui-card-title mb-2">荣誉管理</h2>
              <p className="ui-card-muted">管理学生获得的荣誉</p>
              <div className="ui-card-footer-line" />
            </div>
            
            <div 
              className="ui-card p-6 cursor-pointer"
              onClick={() => router.push('/admin/content/courses')}
            >
              <h2 className="ui-card-title mb-2">课程管理</h2>
              <p className="ui-card-muted">管理平台上的课程</p>
              <div className="ui-card-footer-line" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
