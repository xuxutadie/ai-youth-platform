'use client'

import { useState } from 'react'
import useAuth from '@/hooks/useAuth'

export default function TestAuthPage() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleTestLogin = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '登录失败')
      }
      
      // 使用useAuth的login方法更新认证状态
      login(data.user, data.token)
      setMessage('登录成功！')
    } catch (error) {
      setMessage(`登录失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogout = () => {
    logout()
    setMessage('已退出登录')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">认证状态测试页面</h1>
      
  <div className="bg-cyan-50 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">当前认证状态</h2>
        <div className="space-y-2">
          <p><strong>是否已登录:</strong> {isAuthenticated ? '是' : '否'}</p>
          {user && (
            <>
              <p><strong>用户ID:</strong> {user._id}</p>
              <p><strong>用户名:</strong> {user.username}</p>
              <p><strong>邮箱:</strong> {user.email}</p>
              <p><strong>角色:</strong> {user.role}</p>
            </>
          )}
        </div>
      </div>
      
      {!isAuthenticated ? (
  <div className="bg-cyan-50 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试登录</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '登录中...' : '测试登录'}
            </button>
          </div>
        </div>
      ) : (
  <div className="bg-cyan-50 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试退出</h2>
          <button
            onClick={handleTestLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            退出登录
          </button>
        </div>
      )}
      
      {message && (
        <div className={`p-4 rounded-md ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">导航栏测试</h2>
        <p className="text-gray-600">登录后，请检查页面顶部的导航栏是否正确显示用户信息。</p>
      </div>
    </div>
  )
}