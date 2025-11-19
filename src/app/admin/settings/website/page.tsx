'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPut } from '@/lib/api'

type Config = {
  siteTitle: string
  logoUrl: string
  primaryColor: string
  theme: 'light' | 'dark'
  uploadLimits: { imageMB: number; videoMB: number; htmlMB: number }
}

export default function Page() {
  const [form, setForm] = useState<Config>({ siteTitle: '', logoUrl: '', primaryColor: '#1677ff', theme: 'light', uploadLimits: { imageMB: 10, videoMB: 50, htmlMB: 10 } })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiGet('/api/admin/settings/website').then(async (resp) => {
      const data = await resp.json()
      if (!mounted) return
      if (!resp.ok) {
        setError(data.error || '加载失败')
      } else {
        const cfg = data.config || {}
        setForm({
          siteTitle: cfg.siteTitle || '',
          logoUrl: cfg.logoUrl || '',
          primaryColor: cfg.primaryColor || '#1677ff',
          theme: cfg.theme === 'dark' ? 'dark' : 'light',
          uploadLimits: {
            imageMB: Number(cfg.uploadLimits?.imageMB) > 0 ? Number(cfg.uploadLimits.imageMB) : 10,
            videoMB: Number(cfg.uploadLimits?.videoMB) > 0 ? Number(cfg.uploadLimits.videoMB) : 50,
            htmlMB: Number(cfg.uploadLimits?.htmlMB) > 0 ? Number(cfg.uploadLimits.htmlMB) : 10,
          }
        })
      }
      setLoading(false)
    }).catch(() => { if (mounted) { setError('网络错误'); setLoading(false) } })
    return () => { mounted = false }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const num = Math.max(1, parseInt(value || '0', 10))
    setForm(prev => ({ ...prev, uploadLimits: { ...prev.uploadLimits, [name]: num } as any }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const resp = await apiPut('/api/admin/settings/website', form)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || '保存失败')
      setMessage('已保存')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存错误')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">网站设置</h1>
      {loading ? (
        <div className="text-gray-500">加载中...</div>
      ) : (
        <form className="space-y-6 max-w-xl" onSubmit={handleSave}>
          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-gray-100 mb-1">站点标题</label>
            <input
              name="siteTitle"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base bg-white dark:bg-white text-black dark:text-black placeholder-black dark:placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: '#000', backgroundColor: '#fff' }}
              placeholder="例如：AI 青少年平台"
              value={form.siteTitle}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-gray-100 mb-1">Logo 地址</label>
            <input
              name="logoUrl"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base bg-white dark:bg-white text-black dark:text-black placeholder-black dark:placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: '#000', backgroundColor: '#fff' }}
              placeholder="http(s) 链接或以 / 开头的站内路径"
              value={form.logoUrl}
              onChange={handleChange}
            />
            {form.logoUrl ? (
              <div className="mt-2">
                <img src={form.logoUrl} alt="logo 预览" className="h-12 object-contain" />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-gray-100 mb-1">主色</label>
            <div className="flex items-center gap-3">
              <input
                name="primaryColor"
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-base bg-white dark:bg-white text-black dark:text-black placeholder-black dark:placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: '#000', backgroundColor: '#fff' }}
                placeholder="#1677ff"
                value={form.primaryColor}
                onChange={handleChange}
                required
              />
              <input
                name="primaryColor"
                type="color"
                className="h-10 w-10 p-0 border rounded-md"
                value={form.primaryColor}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-gray-100 mb-1">上传大小限制（管理员可调）</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm mb-1">图片最大MB</div>
                <input
                  name="imageMB"
                  type="number"
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-base bg-white dark:bg-white text-black"
                  value={form.uploadLimits.imageMB}
                  onChange={handleLimitChange}
                />
              </div>
              <div>
                <div className="text-sm mb-1">视频最大MB</div>
                <input
                  name="videoMB"
                  type="number"
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-base bg-white dark:bg-white text-black"
                  value={form.uploadLimits.videoMB}
                  onChange={handleLimitChange}
                />
              </div>
              <div>
                <div className="text-sm mb-1">HTML最大MB</div>
                <input
                  name="htmlMB"
                  type="number"
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-base bg-white dark:bg-white text-black"
                  value={form.uploadLimits.htmlMB}
                  onChange={handleLimitChange}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-800 dark:text-gray-100 mb-1">主题</label>
            <select
              name="theme"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base bg-white dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: '#000', backgroundColor: '#fff' }}
              value={form.theme}
              onChange={handleChange}
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}

          <div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}