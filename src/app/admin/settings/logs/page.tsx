'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'

export default function Page() {
  const [lines, setLines] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [text, setText] = useState('')

  const load = () => {
    setLoading(true)
    apiGet('/api/admin/settings/logs').then(async resp => {
      const data = await resp.json()
      if (!resp.ok) setError(data.error || '加载失败')
      else setLines(data.lines || [])
      setLoading(false)
    }).catch(() => { setError('网络错误'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const writeLog = async () => {
    setMessage(''); setError('')
    const resp = await apiPost('/api/admin/settings/logs', { message: text || '测试日志' })
    const data = await resp.json()
    if (!resp.ok) setError(data.error || '写入失败')
    else { setMessage('已写入'); setText(''); load() }
  }

  return (
    <div className="p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">系统日志</h1>
      <div className="flex items-center gap-3 mb-4">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="日志内容" className="px-3 py-2 border rounded-md bg-white dark:bg-white text-black" />
        <button onClick={writeLog} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">追加日志</button>
        {message && <span className="text-green-600 text-sm">{message}</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
      {loading ? <div className="text-gray-500">加载中...</div> : (
        <pre className="bg-black text-green-400 p-3 rounded-md overflow-auto max-h-[480px] whitespace-pre-wrap">{lines.join('\n')}</pre>
      )}
    </div>
  )
}