"use client"

import { useState, useEffect } from 'react'
import useAuth from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface Competition {
  _id: string
  name: string
  date: string
  description?: string
  imageUrl: string
}

interface Work {
  _id: string
  title: string
  authorName: string
  imageUrl: string
  description?: string
  createdAt: string
}

interface Honor {
  _id: string
  title: string
  studentName: string
  imageUrl: string
  date: string
  description?: string
}

interface Course {
  _id: string
  title: string
  description: string
  imageUrl: string
  instructor: string
  duration: string
  level: string
}

export default function ContentManagement({ activeTab: initialTab = 'competitions' }: { activeTab?: 'competitions' | 'works' | 'honors' | 'courses' }) {
  const { user, isLoading, token, isAuthenticated, checkPermission } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'competitions' | 'works' | 'honors' | 'courses'>(initialTab as 'competitions' | 'works' | 'honors' | 'courses')
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [works, setWorks] = useState<Work[]>([])
  const [honors, setHonors] = useState<Honor[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [dataIsLoading, setDataIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // 置顶数据
  const [pinned, setPinned] = useState<{ competitions: string[]; works: string[]; honors: string[]; courses: string[] }>({ competitions: [], works: [], honors: [], courses: [] })

  useEffect(() => {
    if (!isLoading && (!user || !isAuthenticated)) {
      router.push('/login')
      return
    }
  }, [user, isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchData()
      fetchPinned()
    }
  }, [user, activeTab, isAuthenticated])

  // 清理函数，在组件卸载时取消所有未完成的请求
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort()
      }
    }
  }, [abortController])

  const fetchPinned = async () => {
    try {
      const resp = await fetch('/api/pinned')
      if (resp.ok) {
        const json = await resp.json()
        setPinned({
          competitions: Array.isArray(json.competitions) ? json.competitions : [],
          works: Array.isArray(json.works) ? json.works : [],
          honors: Array.isArray(json.honors) ? json.honors : [],
          courses: Array.isArray(json.courses) ? json.courses : []
        })
      }
    } catch (e) {
      console.warn('获取置顶数据失败', e)
    }
  }

  const fetchData = async () => {
    if (abortController) { abortController.abort() }
    const controller = new AbortController()
    setAbortController(controller)
    setDataIsLoading(true)
    setError(null)

    try {
      let endpoint = ''
      switch (activeTab) {
        case 'competitions': endpoint = '/api/competitions'; break
        case 'works': endpoint = '/api/works'; break
        case 'honors': endpoint = '/api/honors'; break
        case 'courses': endpoint = '/api/courses'; break
      }

      const timeoutId = setTimeout(() => controller.abort(), 10000)
      const response = await fetch(endpoint, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error('获取数据失败')
      const data = await response.json()

      switch (activeTab) {
        case 'competitions': setCompetitions(data.competitions || data || []); break
        case 'works': setWorks(data.works || data || []); break
        case 'honors': setHonors(data.honors || data || []); break
        case 'courses': setCourses(data.courses || data || []); break
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        if (err.name === 'AbortError') { setError('请求超时，请稍后再试') }
        else { setError(err.message) }
      }
    } finally {
      if (!controller.signal.aborted) { setDataIsLoading(false) }
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return
    if (!token) { setError('删除失败: 没有有效的认证令牌'); return }

    try {
      let endpoint = ''
      switch (activeTab) {
        case 'competitions': endpoint = '/api/competitions'; break
        case 'works': endpoint = '/api/works'; break
        case 'honors': endpoint = '/api/honors'; break
        case 'courses': endpoint = '/api/courses'; break
      }

      const response = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || '删除失败') }
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除时发生错误')
    }
  }

  const togglePinned = async (id: string, wantPinned: boolean) => {
    try {
      if (!token) { setError('需要管理员登录才能置顶'); return }
      const resp = await fetch('/api/pinned', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: activeTab, id, pinned: wantPinned })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.error || '置顶状态更新失败')
      }
      const j = await resp.json()
      setPinned(j.pinned || pinned)
    } catch (e) {
      setError(e instanceof Error ? e.message : '置顶操作失败')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let endpoint = ''
      switch (activeTab) {
        case 'competitions': endpoint = '/api/competitions'; break
        case 'works': endpoint = '/api/works'; break
        case 'honors': endpoint = '/api/honors'; break
        case 'courses': endpoint = '/api/courses'; break
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingItem)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新失败')
      }

      setShowEditModal(false)
      setEditingItem(null)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新时发生错误')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditingItem(prev => ({ ...prev, [name]: value }))
  }

  if (isLoading) { return <div className="flex justify-center items-center min-h-screen">加载中...</div> }
  if (!user || !isAuthenticated) { return <div className="flex justify-center items-center min-h-screen">请先登录</div> }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">内容管理</h1>
        <div className="flex gap-3">
          <button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">返回首页</button>
          <button onClick={() => router.push('/admin')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">返回管理员仪表板</button>
        </div>
      </div>

      {/* 选项卡 */}
      <div className="flex space-x-4 mb-8 border-b">
        <button className={`pb-2 px-4 text-gray-900 dark:text-gray-100 ${activeTab === 'competitions' ? 'border-b-2 border-blue-500 font-semibold' : ''}`} onClick={() => setActiveTab('competitions')}>赛事管理</button>
        <button className={`pb-2 px-4 text-gray-900 dark:text-gray-100 ${activeTab === 'works' ? 'border-b-2 border-blue-500 font-semibold' : ''}`} onClick={() => setActiveTab('works')}>作品管理</button>
        <button className={`pb-2 px-4 text-gray-900 dark:text-gray-100 ${activeTab === 'honors' ? 'border-b-2 border-blue-500 font-semibold' : ''}`} onClick={() => setActiveTab('honors')}>荣誉管理</button>
        <button className={`pb-2 px-4 text-gray-900 dark:text-gray-100 ${activeTab === 'courses' ? 'border-b-2 border-blue-500 font-semibold' : ''}`} onClick={() => setActiveTab('courses')}>课程管理</button>
      </div>

      {/* 错误提示 */}
      {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>)}

      {/* 加载状态 */}
      {dataIsLoading ? (
        <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
      ) : (
        <>
          {/* 赛事列表 */}
          {activeTab === 'competitions' && (
            <div className="overflow-x-auto">
      <table className="min-w-full ui-card overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">赛事名称</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">日期</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">描述</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900 dark:text-gray-100">
                  {competitions.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-800 dark:text-gray-200">暂无赛事数据</td></tr>
                  ) : (
                    competitions.map((competition) => {
                      const isPinned = pinned.competitions.includes(competition._id)
                      return (
                        <tr key={competition._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{competition.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{competition.date}</td>
                          <td className="px-6 py-4">{competition.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button onClick={() => handleEdit(competition)} className="text-blue-600 hover:text-blue-900 font-semibold mr-4">编辑</button>
                            <button onClick={() => togglePinned(competition._id, !isPinned)} className={`${isPinned ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-800 dark:text-gray-200 hover:text-gray-900'} font-semibold mr-4`}>{isPinned ? '取消置顶' : '置顶'}</button>
                            {checkPermission(['teacher', 'admin']) && (
                              <button onClick={() => handleDelete(competition._id)} className="text-red-600 hover:text-red-900 font-semibold">删除</button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 作品列表 */}
          {activeTab === 'works' && (
            <div className="overflow-x-auto">
      <table className="min-w-full ui-card overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">作品标题</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">作者</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">描述</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900 dark:text-gray-100">
                  {works.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-800 dark:text-gray-200">暂无作品数据</td></tr>
                  ) : (
                    works.map((work) => {
                      const isPinned = pinned.works.includes(work._id)
                      return (
                        <tr key={work._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{work.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{(work as any).studentName || work.authorName}</td>
                          <td className="px-6 py-4">{work.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button onClick={() => handleEdit(work)} className="text-blue-600 hover:text-blue-900 font-semibold mr-4">编辑</button>
                            <button onClick={() => togglePinned(work._id, !isPinned)} className={`${isPinned ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-800 dark:text-gray-200 hover:text-gray-900'} font-semibold mr-4`}>{isPinned ? '取消置顶' : '置顶'}</button>
                            {checkPermission(['teacher', 'admin']) && (
                              <button onClick={() => handleDelete(work._id)} className="text-red-600 hover:text-red-900 font-semibold">删除</button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 荣誉列表 */}
          {activeTab === 'honors' && (
            <div className="overflow-x-auto">
      <table className="min-w-full ui-card overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">荣誉标题</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">学生姓名</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">获奖日期</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900 dark:text-gray-100">
                  {honors.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-800 dark:text-gray-200">暂无荣誉数据</td></tr>
                  ) : (
                    honors.map((honor) => {
                      const isPinned = pinned.honors.includes(honor._id)
                      return (
                        <tr key={honor._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{honor.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{honor.studentName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{honor.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button onClick={() => handleEdit(honor)} className="text-blue-600 hover:text-blue-900 font-semibold mr-4">编辑</button>
                            <button onClick={() => togglePinned(honor._id, !isPinned)} className={`${isPinned ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-800 dark:text-gray-200 hover:text-gray-900'} font-semibold mr-4`}>{isPinned ? '取消置顶' : '置顶'}</button>
                            {checkPermission(['teacher', 'admin']) && (
                              <button onClick={() => handleDelete(honor._id)} className="text-red-600 hover:text-red-900 font-semibold">删除</button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 课程列表 */}
          {activeTab === 'courses' && (
            <div className="overflow-x-auto">
      <table className="min-w-full ui-card overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">课程标题</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">讲师</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">级别</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900 dark:text-gray-100">
                  {courses.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-800 dark:text-gray-200">暂无课程数据</td></tr>
                  ) : (
                    courses.map((course) => {
                      const isPinned = pinned.courses.includes(course._id)
                      return (
                        <tr key={course._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{course.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{course.instructor}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{course.level}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button onClick={() => handleEdit(course)} className="text-blue-600 hover:text-blue-900 font-semibold mr-4">编辑</button>
                            <button onClick={() => togglePinned(course._id, !isPinned)} className={`${isPinned ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-800 dark:text-gray-200 hover:text-gray-900'} font-semibold mr-4`}>{isPinned ? '取消置顶' : '置顶'}</button>
                            {checkPermission(['teacher', 'admin']) && (
                              <button onClick={() => handleDelete(course._id)} className="text-red-600 hover:text-red-900 font-semibold">删除</button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* 编辑模态框 */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="ui-card p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">编辑内容</h2>
            <form onSubmit={handleUpdate}>
              {/* 赛事编辑表单 */}
              {activeTab === 'competitions' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="name">赛事名称</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="name" name="name" type="text" value={editingItem.name || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="date">日期</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="date" name="date" type="text" value={editingItem.date || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="description">描述</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="description" name="description" value={editingItem.description || ''} onChange={handleInputChange} rows={3} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="imageUrl">图片URL</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="imageUrl" name="imageUrl" type="text" value={editingItem.imageUrl || ''} onChange={handleInputChange} required />
                  </div>
                </>
              )}

              {/* 作品编辑表单 */}
              {activeTab === 'works' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="title">作品标题</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="title" name="title" type="text" value={editingItem.title || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="authorName">作者姓名</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="authorName" name="authorName" type="text" value={editingItem.authorName || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="description">描述</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="description" name="description" value={editingItem.description || ''} onChange={handleInputChange} rows={3} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="imageUrl">图片URL</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="imageUrl" name="imageUrl" type="text" value={editingItem.imageUrl || ''} onChange={handleInputChange} required />
                  </div>
                </>
              )}

              {/* 荣誉编辑表单 */}
              {activeTab === 'honors' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="title">荣誉标题</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="title" name="title" type="text" value={editingItem.title || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="studentName">学生姓名</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="studentName" name="studentName" type="text" value={editingItem.studentName || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="date">获奖日期</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="date" name="date" type="text" value={editingItem.date || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="description">描述</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="description" name="description" value={editingItem.description || ''} onChange={handleInputChange} rows={3} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="imageUrl">图片URL</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="imageUrl" name="imageUrl" type="text" value={editingItem.imageUrl || ''} onChange={handleInputChange} required />
                  </div>
                </>
              )}

              {/* 课程编辑表单 */}
              {activeTab === 'courses' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="title">课程标题</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="title" name="title" type="text" value={editingItem.title || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="description">课程描述</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="description" name="description" value={editingItem.description || ''} onChange={handleInputChange} rows={3} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="instructor">讲师</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="instructor" name="instructor" type="text" value={editingItem.instructor || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="duration">课程时长</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="duration" name="duration" type="text" value={editingItem.duration || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="level">课程级别</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="level" name="level" type="text" value={editingItem.level || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-900 dark:text-gray-100 text-sm font-bold mb-2" htmlFor="imageUrl">图片URL</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-gray-100 leading-tight focus:outline-none focus:shadow-outline" id="imageUrl" name="imageUrl" type="text" value={editingItem.imageUrl || ''} onChange={handleInputChange} required />
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <button type="button" className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2" onClick={() => setShowEditModal(false)}>取消</button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}