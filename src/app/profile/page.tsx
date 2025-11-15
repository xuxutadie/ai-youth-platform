'use client'

import { useEffect, useMemo, useState } from 'react'
import HeroSection from '@/components/HeroSection'
import useAuth from '@/hooks/useAuth'
import AvatarCropper from '@/components/AvatarCropper'

type ClassTier = 'king' | 'star' | 'diamond' | 'platinum'

function getClassTier(input: string): ClassTier | null {
  const s = (input || '').trim()
  if (!s) return null
  if (s.includes('王者')) return 'king'
  if (s.includes('星耀')) return 'star'
  if (s.includes('钻石')) return 'diamond'
  if (s.includes('铂金')) return 'platinum'
  return null
}

function ClassIcon({ tier }: { tier: ClassTier }) {
  // 统一尺寸 32x32，Tailwind 控制颜色与阴影
  switch (tier) {
    case 'king':
      return (
        <svg viewBox="0 0 32 32" width="32" height="32" aria-label="王者班皇冠" className="shrink-0">
          <path d="M4 22 L8 12 L12 18 L16 10 L20 18 L24 12 L28 22 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
          <rect x="6" y="22" width="20" height="6" rx="2" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 32 32" width="32" height="32" aria-label="星耀班金边钻石" className="shrink-0">
          <defs>
            <linearGradient id="diamondFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <polygon points="16,2 30,16 16,30 2,16" fill="url(#diamondFill)" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="10" cy="8" r="2" fill="#fde68a" />
          <circle cx="22" cy="24" r="1.8" fill="#fde68a" />
        </svg>
      )
    case 'diamond':
      return (
        <svg viewBox="0 0 32 32" width="32" height="32" aria-label="钻石班发光钻石" className="shrink-0" style={{ filter: 'drop-shadow(0 0 6px #60a5fa)' }}>
          <defs>
            <linearGradient id="diamondGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <polygon points="16,2 30,16 16,30 2,16" fill="url(#diamondGlow)" stroke="#3b82f6" strokeWidth="2" />
        </svg>
      )
    case 'platinum':
      return (
        <svg viewBox="0 0 32 32" width="32" height="32" aria-label="铂金班铂金奖牌" className="shrink-0">
          <defs>
            <linearGradient id="platFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e5e7eb" />
              <stop offset="100%" stopColor="#9ca3af" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="14" r="10" fill="url(#platFill)" stroke="#6b7280" strokeWidth="2" />
          <rect x="12" y="22" width="4" height="8" fill="#ef4444" />
          <rect x="16" y="22" width="4" height="8" fill="#f59e0b" />
        </svg>
      )
    default:
      return null
  }
}

export default function ProfilePage() {
  const { isAuthenticated, user, token } = useAuth()
  const [name, setName] = useState('')
  const [className, setClassName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) setName(user.username || '')
  }, [user])

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (!token) return
        const resp = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
        if (resp.ok) {
          const data = await resp.json()
          const u = data.user || {}
          setName(u.username || u.fullName || name)
          setClassName(u.className || '')
          setPreview(u.avatarUrl || '')
        }
      } catch {}
    }
    if (isAuthenticated) fetchInfo()
  }, [isAuthenticated, token])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    if (!f) return
    setFile(f)
    setError('')
    setMessage('')
  }

  const onExport = (blob: Blob, url: string) => { setCroppedBlob(blob); setPreview(url) }

  const handleSave = async () => {
    try {
      setLoading(true); setError(''); setMessage('')
      if (!isAuthenticated || !token) {
        setLoading(false)
        setError('请先登录后再保存个人信息')
        return
      }
      let avatarUrl = preview
      if (croppedBlob) {
        const fd = new FormData()
        fd.append('file', new File([croppedBlob], 'avatar.png', { type: 'image/png' }))
        const resp = await fetch('/api/upload/avatar', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
        if (resp.ok) { const data = await resp.json(); avatarUrl = data.url }
      }
      const putResp = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, className, avatarUrl }) })
      if (!putResp.ok) { const j = await putResp.json().catch(() => ({})); throw new Error(j.error || '保存失败') }
      setMessage('保存成功')
      setTimeout(() => {
        window.location.href = '/';
      }, 1500); // 1.5秒后跳转
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...localUser, username: name, avatarUrl }))
      } catch {}
    } catch (e: any) {
      setError(e?.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main>
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700">请先登录后再编辑个人信息。</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow p-6 space-y-6 border border-gray-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-cyan-700 dark:text-cyan-200">个人信息设置</h1>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-cyan-800 dark:text-cyan-300">姓名（与用户名合并）</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-cyan-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none"
                placeholder="请输入姓名"
              />
            </label>
            <label className="block">
              <span className="text-sm text-cyan-800 dark:text-cyan-300">班级</span>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-cyan-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none"
                  placeholder="如：王者班 / 星耀班 / 钻石班 / 铂金班"
                />
                {(() => { const tier = getClassTier(className); return tier ? <ClassIcon tier={tier} /> : null })()}
              </div>
            </label>
          </div>
          <div className="space-y-3">
            <span className="text-sm text-cyan-800 dark:text-cyan-300">头像（本地上传+裁剪预览）</span>
            <input type="file" accept="image/*" onChange={onFileChange} />
            {file ? (
              <AvatarCropper file={file} onChange={setPreview} onExport={onExport} />
            ) : (preview ? (<img src={preview} alt="头像预览" className="w-24 h-24 rounded-full object-cover" />) : (<div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700" />))}
          </div>
          {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
          {message && <div className="text-green-600 dark:text-green-400 text-sm">{message}</div>}
          <div className="flex justify-end gap-3">
            <a href="/" className="px-4 py-2 rounded-md bg-transparent ring-1 ring-cyan-600 dark:ring-cyan-400 text-cyan-700 dark:text-cyan-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/20">返回</a>
            <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded-md bg-cyan-600 dark:bg-cyan-500 text-white hover:bg-cyan-700 dark:hover:bg-cyan-600 disabled:opacity-50">{loading ? '保存中…' : '保存信息'}</button>
          </div>
          <div className="flex justify-end mt-2">
            <a href="/profile/change-password" className="text-cyan-700 dark:text-cyan-200 hover:underline">修改密码</a>
          </div>
        </div>
      </div>
    </main>
  )
}