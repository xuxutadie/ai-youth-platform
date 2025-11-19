'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [editUserId, setEditUserId] = useState<string>('')
  const [editRole, setEditRole] = useState<string>('student')
  const [showEditModal, setShowEditModal] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 检查用户角色
    const checkUserRole = () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('请先登录')
        router.push('/login')
        return
      }

      try {
        // 解析JWT token获取用户角色
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserRole(payload.role)
        
        // 检查是否为管理员
        if (payload.role !== 'admin') {
          setMessage('您没有权限访问此页面')
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Token解析失败:', error)
        setMessage('登录已过期，请重新登录')
        router.push('/login')
        return
      }
    }

    checkUserRole()
  }, [router])

  useEffect(() => {
    // 只有在确认用户是管理员后才获取用户数据
    if (userRole !== 'admin') return
    
    const fetchUsers = async () => {
      try {
        // 从localStorage获取token
        const token = localStorage.getItem('token')
        if (!token) {
          setMessage('请先登录')
          return
        }
        
        const params = new URLSearchParams()
        if (term.trim()) { params.set('q', term.trim()); params.set('all','1') } else { params.set('page', String(page)); params.set('pageSize','10') }
        const response = await fetch(`/api/admin/users?${params.toString()}` , {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || '获取用户数据失败')
        }
        
        const list = result.users || []
        if (page === 1) setUsers(list); else setUsers(prev => [...prev, ...list])
        setHasMore(Boolean(result.hasMore))
      } catch (error) {
        console.error('获取用户数据失败:', error)
        setMessage(error instanceof Error ? error.message : '获取用户数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [userRole])

  useEffect(() => {
    if (userRole !== 'admin') return
    setLoading(true)
    setPage(1)
    ;(async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const params = new URLSearchParams()
        if (term.trim()) { params.set('q', term.trim()); params.set('all','1') } else { params.set('page','1'); params.set('pageSize','10') }
        const resp = await fetch(`/api/admin/users?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || '加载失败')
        setUsers(data.users || [])
        setHasMore(Boolean(data.hasMore))
      } catch (e: any) { setMessage(e?.message || '加载失败') } finally { setLoading(false) }
    })()
  }, [term])

  const loadMore = async () => {
    if (loading || !hasMore || term.trim()) return
    const nextPage = page + 1
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const params = new URLSearchParams({ page: String(nextPage), pageSize: '10' })
      const resp = await fetch(`/api/admin/users?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || '加载失败')
      setUsers(prev => [...prev, ...(data.users || [])])
      setHasMore(Boolean(data.hasMore))
      setPage(nextPage)
    } catch (e: any) { setMessage(e?.message || '加载失败') } finally { setLoading(false) }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'teacher':
        return 'bg-blue-100 text-blue-800'
      case 'student':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理员'
      case 'teacher':
        return '教师'
      case 'student':
        return '学员'
      default:
        return '未知'
    }
  }

  // 处理编辑用户
  const handleEditUser = (userId: string) => {
    const u = users.find(x => x._id === userId)
    setEditUserId(userId)
    setEditRole(u?.role || 'student')
    setShowEditModal(true)
  }

  // 处理删除用户
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除此用户吗？')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessage('请先登录')
        return
      }
      
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || '删除用户失败')
      }
      
      setMessage('用户删除成功')
      // 重新获取用户列表
      const updatedUsers = users.filter(user => user._id !== userId)
      setUsers(updatedUsers)
    } catch (error) {
      console.error('删除用户失败:', error)
      setMessage(error instanceof Error ? error.message : '删除用户失败')
    }
  }

  // 处理内容管理
  const handleManageContent = (contentType: string) => {
    switch (contentType) {
      case 'competitions':
        router.push('/admin/content/competitions')
        break
      case 'works':
        router.push('/admin/content/works')
        break
      case 'honors':
        router.push('/admin/content/honors')
        break
      case 'courses':
        router.push('/admin/content/courses')
        break
      default:
        router.push('/admin/content')
    }
  }

  // 处理系统设置
  const handleSystemSettings = (settingType: string) => {
    router.push(`/admin/settings/${settingType}`)
  }

  const saveUserRole = async () => {
    if (!editUserId) return
    setSavingEdit(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) { setMessage('请先登录'); return }
      const resp = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: editUserId, role: editRole })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || '更新失败')
      setUsers(prev => prev.map(u => u._id === editUserId ? { ...u, role: data.user?.role || editRole } : u))
      setMessage('用户角色更新成功')
      setShowEditModal(false)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '更新失败')
    } finally {
      setSavingEdit(false)
    }
  }

  const AddTeacherButton = () => {
    const [pickerTerm, setPickerTerm] = useState('')
    const candidates = users.filter(u => u.role === 'student' && (`${u.username||''} ${u.email||''}`).toLowerCase().includes(pickerTerm.toLowerCase()))
    const [targetId, setTargetId] = useState('')
    const [processing, setProcessing] = useState(false)
    const upgrade = async () => {
      if (!targetId) { setMessage('请选择学员'); return }
      setProcessing(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) { setMessage('请先登录'); return }
        const resp = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ userId: targetId, role: 'teacher' })
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || '设为教师失败')
        setUsers(prev => prev.map(u => u._id === targetId ? { ...u, role: 'teacher' } : u))
        setMessage('已设为教师')
        setTargetId('')
      } catch (e) {
        setMessage(e instanceof Error ? e.message : '设为教师失败')
      } finally {
        setProcessing(false)
      }
    }
    return (
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm text-gray-700 dark:text-gray-300">添加老师：</span>
        <input value={pickerTerm} onChange={e => setPickerTerm(e.target.value)} placeholder="搜索学员" className="px-2 py-1 border rounded bg-white dark:bg-slate-900" />
        <select className="border rounded px-2 py-1 bg-white dark:bg-slate-900" value={targetId} onChange={e => setTargetId(e.target.value)}>
          <option value="">选择学员</option>
          {candidates.map(c => (
            <option key={c._id} value={c._id}>{c.username}（{c.email}）</option>
          ))}
        </select>
        <button className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50" disabled={processing} onClick={upgrade}>{processing ? '处理中...' : '设为教师'}</button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">管理员控制台</h1>
      
      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
        <div className="ui-card p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">用户管理</h2>
        <div className="flex items-center gap-3 mb-3">
          <input value={term} onChange={e => setTerm(e.target.value)} placeholder="搜索用户名或邮箱" className="px-3 py-2 border rounded-md bg-white dark:bg-slate-900" />
        </div>
        <AddTeacherButton />
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-900 uppercase tracking-wider">
                    用户名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-900 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-900 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-900 uppercase tracking-wider">
                    注册时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-900 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3 font-semibold"
                        onClick={() => handleEditUser(user._id)}
                      >
                        编辑
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 font-semibold"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center py-3">
              {!term && hasMore && (<button onClick={loadMore} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">加载更多</button>)}
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">暂无用户数据</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="ui-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">内容管理</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>赛事管理</span>
              <button 
                className="text-indigo-600 hover:text-indigo-900"
                onClick={() => handleManageContent('competitions')}
              >
                管理
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span>作品管理</span>
              <button 
                className="text-indigo-600 hover:text-indigo-900"
                onClick={() => handleManageContent('works')}
              >
                管理
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span>荣誉管理</span>
              <button 
                className="text-indigo-600 hover:text-indigo-900"
                onClick={() => handleManageContent('honors')}
              >
                管理
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span>课程管理</span>
              <button 
                className="text-indigo-600 hover:text-indigo-900"
                onClick={() => handleManageContent('courses')}
              >
                管理
              </button>
            </div>
          </div>
        </div>

        <div className="ui-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">系统设置</h2>
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>存储管理</span>
                <button 
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={() => handleSystemSettings('storage')}
                >
                  管理
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>网站设置</span>
                <button 
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={() => handleSystemSettings('website')}
                >
                  设置
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>权限管理</span>
                <button 
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={() => handleSystemSettings('permissions')}
                >
                  管理
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>数据备份</span>
                <button 
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={() => handleSystemSettings('backup')}
                >
                  备份
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>系统日志</span>
                <button 
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={() => handleSystemSettings('logs')}
                >
                  查看
                </button>
              </div>
            </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="text-lg font-semibold mb-4">编辑用户</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">用户ID</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{editUserId}</span>
              </div>
              <label className="flex items-center gap-2">
                <span className="text-sm">角色</span>
                <select className="border rounded px-2 py-1 bg-white dark:bg-slate-900" value={editRole} onChange={e => setEditRole(e.target.value)}>
                  <option value="student">学员</option>
                  <option value="teacher">教师</option>
                  <option value="admin">管理员</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button className="px-3 py-1 rounded border" onClick={() => setShowEditModal(false)}>取消</button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" disabled={savingEdit} onClick={saveUserRole}>{savingEdit ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}