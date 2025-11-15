'use client'

import { useState, useRef } from 'react'
import useAuth from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface FileUploadButtonProps {
  className?: string
}

export default function FileUploadButton({ className }: FileUploadButtonProps) {
  const { isAuthenticated, checkPermission, isLoading, user } = useAuth()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (!isAuthenticated) {
      alert('请先登录')
      router.push('/login')
      return
    }

    if (!checkPermission(['student', 'teacher', 'admin'])) {
      alert('您没有权限上传作品')
      return
    }

    setShowForm(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // 创建预览URL：图片用DataURL，视频用ObjectURL，网页不预览
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else if (selectedFile.type.startsWith('video/')) {
        const objectUrl = URL.createObjectURL(selectedFile)
        setPreviewUrl(objectUrl)
      } else {
        setPreviewUrl('')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUploading(true)

    try {
      // 检查必填字段
      if (!formData.title || !formData.type) {
        throw new Error('请填写作品标题和类型')
      }

      // 作者与年级必填；班级自动取自个人信息
      const finalAuthorName = (formData.authorName ?? user?.username ?? '').trim()
      const finalClassName = (user?.className ?? '').trim()
      const finalGrade = (formData.grade ?? '').trim()
      if (!finalAuthorName) {
        throw new Error('请填写作者姓名')
      }
      if (!finalGrade) {
        throw new Error('请填写年级')
      }

      if (!file) {
        throw new Error('请选择要上传的文件')
      }

      // 类型与文件匹配校验（仅允许 图片/视频/网页）
      const t = (formData.type || '').toLowerCase()
      if (!['image', 'video', 'html'].includes(t)) {
        throw new Error('作品类型仅支持：图片、视频、网页')
      }
      if (t === 'image' && !file.type.startsWith('image/')) {
        throw new Error('所选类型为图片，请上传图片文件')
      }
      if (t === 'video' && !file.type.startsWith('video/')) {
        throw new Error('所选类型为视频，请上传视频文件')
      }
      if (t === 'html' && !/\.html?$/i.test(file.name)) {
        throw new Error('所选类型为网页，请上传 .html 文件')
      }

      // 创建FormData对象
      const submitFormData = new FormData()
      submitFormData.append('title', formData.title)
      submitFormData.append('type', formData.type)
      submitFormData.append('authorName', finalAuthorName)
      if (finalClassName) submitFormData.append('className', finalClassName)
      submitFormData.append('grade', finalGrade)
      submitFormData.append('file', file)
      
      // 如果是学生上传，自动关联用户信息
      if (user?.role === 'student') {
        submitFormData.append('studentId', user._id || '')
        submitFormData.append('studentName', user.username || '')
      }

      const response = await fetch('/api/works/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitFormData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '上传失败')
      }

      setSuccess('作品上传成功！')
      // 重置表单
      setFormData({})
      setFile(null)
      setPreviewUrl('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // 重新加载页面以显示新上传的内容
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传过程中发生错误')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        上传作品
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
  <div className="bg-cyan-50 rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">上传作品</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  作品标题
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入作品标题"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  作品类型
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.type || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="">请选择作品类型</option>
                  <option value="image">图片</option>
                  <option value="video">视频</option>
                  <option value="html">网页</option>
                </select>
              </div>

              <div>
                <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
                  作者姓名
                </label>
                <input
                  id="authorName"
                  name="authorName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入作者姓名"
                  value={formData.authorName ?? user?.username ?? ''}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  年级
                </label>
                <input
                  id="grade"
                  name="grade"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如：一年级、二年级、六年级、高一"
                  value={formData.grade ?? ''}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="file"
                  onClick={() => {
                    const el = fileInputRef.current
                    if (!el) return
                    // @ts-ignore
                    if (typeof el.showPicker === 'function') {
                      // @ts-ignore
                      el.showPicker()
                    } else {
                      el.click()
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      const el = fileInputRef.current
                      if (!el) return
                      // @ts-ignore
                      if (typeof el.showPicker === 'function') {
                        // @ts-ignore
                        el.showPicker()
                      } else {
                        el.click()
                      }
                    }
                  }}
                  tabIndex={0}
                  className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
                >
                  选择文件
                </label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    id="file"
                    name="file"
                    type="file"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer pointer-events-auto relative z-50"
                    onChange={handleFileChange}
                    accept="image/*,video/*,.html"
                    aria-label="选择本地文件"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = fileInputRef.current
                      if (!el) return
                      // 优先使用原生 showPicker（更兼容受信任的用户交互）
                      // @ts-ignore
                      if (typeof el.showPicker === 'function') {
                        // @ts-ignore
                        el.showPicker()
                      } else {
                        el.click()
                      }
                    }}
                    className="px-3 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 whitespace-nowrap"
                  >
                    选择本地文件
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">支持图片、视频、.html 网页文件</p>
              </div>

              {previewUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文件预览
                  </label>
                  {formData.type === 'image' ? (
                    <img
                      src={previewUrl}
                      alt="图片预览"
                      className="w-full h-48 object-contain bg-white rounded-md"
                    />
                  ) : formData.type === 'video' ? (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-48 bg-black rounded-md"
                    />
                  ) : null}
                </div>
              )}

              {file && (
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    已选择文件: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                  <div>
                    作者信息: {(formData.authorName ?? user?.username ?? '') || '未填写'} · 年级: {(formData.grade ?? '') || '未填写'} · 班级: {(user?.className ?? '') || '未填写'}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? '上传中...' : '确认上传'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}