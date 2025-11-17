'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPut } from '@/lib/api'

type Role = 'admin' | 'teacher' | 'student'
type Perm = { viewUsers: boolean; editUsers: boolean; manageUploads: boolean; accessAdmin: boolean }

export default function Page() {
  const [perms, setPerms] = useState<Record<Role, Perm>>({
    admin: { viewUsers: true, editUsers: true, manageUploads: true, accessAdmin: true },
    teacher: { viewUsers: true, editUsers: false, manageUploads: true, accessAdmin: false },
    student: { viewUsers: false, editUsers: false, manageUploads: true, accessAdmin: false },
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiGet('/api/admin/settings/permissions').then(async resp => {
      const data = await resp.json()
      if (!mounted) return
      if (!resp.ok) setError(data.error || '加载失败')
      else setPerms(data.permissions)
      setLoading(false)
    }).catch(() => { if (mounted) { setError('网络错误'); setLoading(false) } })
    return () => { mounted = false }
  }, [])

  const toggle = (role: Role, key: keyof Perm) => {
    setPerms(prev => ({ ...prev, [role]: { ...prev[role], [key]: !prev[role][key] } }))
  }

  const save = async () => {
    setSaving(true); setMessage(''); setError('')
    try {
      const resp = await apiPut('/api/admin/settings/permissions', perms)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || '保存失败')
      setMessage('已保存')
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存错误')
    } finally { setSaving(false) }
  }

  const renderRole = (role: Role, label: string) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="font-semibold">{label}</div>
      <div className="flex flex-wrap gap-4">
        {(['viewUsers','editUsers','manageUploads','accessAdmin'] as (keyof Perm)[]).map(k => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={perms[role][k]} onChange={() => toggle(role, k)} />
            <span>{k}</span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">权限管理</h1>
      {loading ? <div className="text-gray-500">加载中...</div> : (
        <div className="space-y-6 max-w-3xl">
          {renderRole('admin','管理员')}
          {renderRole('teacher','教师')}
          {renderRole('student','学生')}
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{saving ? '保存中...' : '保存权限'}</button>
            {message && <span className="text-green-600 text-sm">{message}</span>}
            {error && <span className="text-red-600 text-sm">{error}</span>}
          </div>
        </div>
      )}
    </div>
  )
}