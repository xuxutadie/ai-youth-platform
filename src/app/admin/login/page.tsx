'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import { apiPost } from '@/lib/api'

export default function Page() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const resp = await apiPost('/api/auth/login', formData)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || '登录失败')
      if (data.user?.role !== 'admin') throw new Error('非管理员账号')
      login(data.user, data.token)
      router.push('/admin')
      setTimeout(() => { try { window.location.href = '/admin' } catch {} }, 50)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl p-8 shadow-xl border border-slate-700/40 bg-white/90 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="space-y-8">
            <div>
              <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">管理员登录</h2>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱地址</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请输入邮箱地址"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '登录中...' : '登录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}