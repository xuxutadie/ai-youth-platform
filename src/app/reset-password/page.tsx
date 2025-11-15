"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { apiPost } from '@/lib/api'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const initialToken = params.get('token') || ''
  const initialEmail = params.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [token, setToken] = useState(initialToken)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // 若查询参数变化，更新输入框
    setToken(initialToken)
    setEmail(initialEmail)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken, initialEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!token) {
      setError('缺少重置令牌')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setError('新密码长度至少为6个字符')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }

    setLoading(true)
    try {
      const resp = await apiPost('/api/auth/reset-password', { email, token, newPassword })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || '重置失败')
      } else {
        setMessage(data.message || '密码重置成功')
        setNewPassword('')
        setConfirmPassword('')
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
          <h1 className="text-2xl font-bold text-cyan-700 dark:text-cyan-200">重置密码</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-cyan-800 dark:text-cyan-300 mb-1">邮箱（用于真实模式）</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="可留空（模拟模式不需要）"
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ring-1 ring-cyan-600 dark:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-800 dark:text-cyan-300 mb-1">重置令牌</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ring-1 ring-cyan-600 dark:ring-cyan-400"
              />
              <p className="text-xs text-gray-500 mt-1">如果是通过“忘记密码”生成的链接访问，本字段会自动填写。</p>
            </div>
            <div>
              <label className="block text-sm text-cyan-800 dark:text-cyan-300 mb-1">新密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ring-1 ring-cyan-600 dark:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-800 dark:text-cyan-300 mb-1">确认新密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ring-1 ring-cyan-600 dark:ring-cyan-400"
              />
            </div>
            {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
            {message && (
              <div className="text-green-600 dark:text-green-400 text-sm">
                {message}，<Link href="/login" className="text-cyan-700 dark:text-cyan-200 hover:underline">去登录</Link>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-md bg-cyan-600 dark:bg-cyan-500 text-white hover:bg-cyan-700 dark:hover:bg-cyan-600 disabled:opacity-50"
            >
              {loading ? '重置中…' : '提交'}
            </button>
          </form>
          <div className="text-sm">
            <Link href="/forgot-password" className="text-cyan-700 dark:text-cyan-200 hover:underline">返回忘记密码</Link>
          </div>
        </div>
      </div>
    </main>
  )
}