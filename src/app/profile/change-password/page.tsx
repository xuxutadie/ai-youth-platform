'use client'

import React, { useState } from 'react'
import { apiPost } from '@/lib/api'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (!isAuthenticated) {
      setError('请先登录')
      return
    }

    if (!oldPassword || !newPassword) {
      setError('请填写旧密码与新密码')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }

    setLoading(true)
    try {
      const res = await apiPost('/api/auth/change-password', {
        oldPassword,
        newPassword,
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || '修改密码失败')
      } else {
        setMessage(data.message || '密码修改成功')
        setOldPassword('')
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
    <main className="min-h-screen bg-slate-100 dark:bg-slate-800">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto bg-white/90 dark:bg-slate-700/70 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-cyan-700 dark:text-cyan-200 mb-2">修改密码</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">为保障账号安全，请设置更强的密码（至少8位且包含字母与数字）。</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-cyan-800 dark:text-cyan-300 mb-1">旧密码</label>
              <input
                type="password"
                className="w-full rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 ring-1 ring-gray-300 dark:ring-slate-500"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-800 dark:text-cyan-300 mb-1">新密码</label>
              <input
                type="password"
                className="w-full rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 ring-1 ring-gray-300 dark:ring-slate-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-800 dark:text-cyan-300 mb-1">确认新密码</label>
              <input
                type="password"
                className="w-full rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 ring-1 ring-gray-300 dark:ring-slate-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
            {message && <div className="text-green-600 dark:text-green-400 text-sm">{message}</div>}

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md bg-cyan-600 dark:bg-cyan-500 text-white hover:bg-cyan-700 dark:hover:bg-cyan-600 disabled:opacity-60"
              >
                {loading ? '提交中...' : '确认修改'}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-transparent ring-1 ring-cyan-600 dark:ring-cyan-400 text-cyan-700 dark:text-cyan-200 hover:bg-cyan-50 dark:hover:bg-slate-800/40"
                onClick={() => router.push('/profile')}
              >
                返回个人信息
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}