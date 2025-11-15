'use client'

import { useState } from 'react'
import useAuth from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function SimpleCourseUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const { isAuthenticated, checkPermission, user } = useAuth()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // 创建预览
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUploading(true)

    try {
      // 验证输入
      if (!title.trim() || !description.trim() || !file) {
        throw new Error('请填写所有必填字段')
      }

      // 检查文件大小（限制为50MB）
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('文件大小不能超过50MB')
      }

      // 使用FormData上传文件
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('instructor', user?.username || '未知讲师')
      formData.append('duration', '待定')
      formData.append('level', '基础')
      formData.append('file', file)

      const response = await fetch('/api/courses/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '上传失败')
      }

      setSuccess('课程上传成功！')
      
      // 重置表单
      setTitle('')
      setDescription('')
      setFile(null)
      setPreview('')
      
      // 调用成功回调
      if (onUploadSuccess) {
        setTimeout(onUploadSuccess, 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传过程中发生错误')
    } finally {
      setUploading(false)
    }
  }

  // 检查用户权限
  if (!isAuthenticated) {
    return (
  <div className="bg-cyan-50 rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">请先登录以上传课程</p>
      </div>
    )
  }

  if (!checkPermission(['teacher', 'admin'])) {
    return (
  <div className="bg-cyan-50 rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">您没有权限上传课程</p>
      </div>
    )
  }

  return (
  <div className="bg-cyan-50 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">上传课程</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            课程标题 *
          </label>
          <input
            id="title"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入课程标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            课程介绍 *
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入课程介绍"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            上传文件 *
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          {preview && (
            <div className="mt-2">
              {file?.type.startsWith('image/') ? (
                <img src={preview} alt="预览" className="w-full h-40 object-contain bg-white rounded" />
              ) : file?.type.startsWith('video/') ? (
                <video src={preview} controls className="w-full h-40 object-contain bg-black rounded" />
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-500">{file?.name}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
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
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || !title.trim() || !description.trim() || !file}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '上传中...' : '确认上传'}
          </button>
        </div>
      </form>
    </div>
  )
}