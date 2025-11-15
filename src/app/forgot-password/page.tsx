"use client"

import { useState } from 'react'
import { apiPost } from '@/lib/api'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [resetUrl, setResetUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setResetUrl(null)

    if (!email) {
      setError('请输入邮箱')
      return
    }

    setLoading(true)
    try {
      const resp = await apiPost('/api/auth/forgot-password', { email })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || '请求失败')
      } else {
        setMessage(data.message || '重置链接已生成')
        if (data.resetUrl) setResetUrl(data.resetUrl)
      }
    } catch (err) {
      setError('网络或服务器错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white/80 dark:bg-slate-800/70 rounded-lg shadow p-6 space-y-4">
          <h1 className="text-2xl font-bold text-cyan-700 dark:text-cyan-200">找回密码</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">输入你的注册邮箱，我们会生成一个密码重置链接。</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-cyan-800 dark:text-cyan-300 mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ring-1 ring-cyan-600 dark:ring-cyan-400"
                placeholder="name@example.com"
              />
            </div>
            {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
            {message && <div className="text-green-600 dark:text-green-400 text-sm">{message}</div>}
            {resetUrl && (
              <div className="text-sm">
                <a href={resetUrl} className="text-cyan-700 dark:text-cyan-200 hover:underline">前往重置密码链接</a>
                <div className="mt-1 break-all text-gray-700 dark:text-gray-200">{resetUrl}</div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-md bg-cyan-600 dark:bg-cyan-500 text-white hover:bg-cyan-700 dark:hover:bg-cyan-600 disabled:opacity-50"
            >
              {loading ? '生成中…' : '发送重置链接'}
            </button>
          </form>
          <div className="text-sm">
            <Link href="/login" className="text-cyan-700 dark:text-cyan-200 hover:underline">返回登录</Link>
          </div>
        </div>
      </div>
    </main>
  )
}