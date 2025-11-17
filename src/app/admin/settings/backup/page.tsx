'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'

export default function Page() {
  const [backups, setBackups] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    apiGet('/api/admin/settings/backup').then(async resp => {
      const data = await resp.json()
      if (!resp.ok) setError(data.error || '加载失败')
      else setBackups(data.backups || [])
      setLoading(false)
    }).catch(() => { setError('网络错误'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const backup = async () => {
    setMessage(''); setError('')
    const resp = await apiPost('/api/admin/settings/backup', { action: 'backup' })
    const data = await resp.json()
    if (!resp.ok) { setError(data.error || '备份失败') } else { setMessage('已备份'); load() }
  }

  const restore = async (name: string) => {
    setMessage(''); setError('')
    const resp = await apiPost('/api/admin/settings/backup', { action: 'restore', name })
    const data = await resp.json()
    if (!resp.ok) { setError(data.error || '恢复失败') } else { setMessage('已恢复') }
  }

  return (
    <div className="p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">数据备份</h1>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={backup} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">立即备份</button>
        {message && <span className="text-green-600 text-sm">{message}</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
      {loading ? <div className="text-gray-500">加载中...</div> : (
        <div className="space-y-3">
          {backups.length === 0 ? (
            <div className="text-gray-500">暂无备份</div>
          ) : backups.map(name => (
            <div key={name} className="flex items-center justify-between border rounded-md px-3 py-2">
              <span>{name}</span>
              <button onClick={() => restore(name)} className="px-3 py-1 rounded-md bg-slate-700 text-white hover:bg-slate-800">恢复</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}