'use client'

import { useState, useRef } from 'react'
import useAuth from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface UploadButtonProps {
  type: 'competitions' | 'works' | 'honors' | 'courses'
  className?: string
}

export default function UploadButton({ type, className }: UploadButtonProps) {
  const { isAuthenticated, checkPermission, isLoading, user } = useAuth()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const uploadFileInputRef = useRef<HTMLInputElement>(null)

  const typeConfig = {
    competitions: {
      title: '赛事',
      endpoint: '/api/competitions',
      fields: [
        { name: 'name', label: '赛事名称', placeholder: '请输入赛事名称' },
        { name: 'date', label: '赛事日期', placeholder: 'YYYY-MM-DD', type: 'date' },
        { name: 'imageUrl', label: '赛事图片', placeholder: '请输入图片URL' }
      ],
      requiredRoles: ['teacher', 'admin']
    },
    works: {
      title: '作品',
      endpoint: '/api/works',
      fields: [
        { name: 'title', label: '作品标题', placeholder: '请输入作品标题' },
        { name: 'authorName', label: '作者名字', placeholder: '请输入作者名字' },
        { name: 'className', label: '班级', placeholder: '请输入班级' },
        { name: 'type', label: '作品类型', placeholder: '请选择作品类型（图片/视频/网页）' }
      ],
      requiredRoles: ['student', 'teacher', 'admin']
    },
    honors: {
      title: '荣誉',
      endpoint: '/api/honors',
      fields: [
        { name: 'title', label: '荣誉标题', placeholder: '请输入荣誉标题' },
        { name: 'studentName', label: '学生姓名', placeholder: '请输入学生姓名' },
        { name: 'imageUrl', label: '荣誉图片', placeholder: '请输入图片URL' },
        { name: 'date', label: '获奖日期', placeholder: 'YYYY-MM-DD', type: 'date' }
      ],
      requiredRoles: ['teacher', 'admin']
    },
    courses: {
      title: '课程',
      endpoint: '/api/courses',
      fields: [
        { name: 'title', label: '课程标题', placeholder: '请输入课程标题' },
        { name: 'description', label: '课程简介', placeholder: '请输入课程简介' },
        { name: 'imageUrl', label: '课程封面', placeholder: '请输入图片URL' },
        { name: 'videoUrl', label: '视频地址', placeholder: '请输入视频地址' }
      ],
      requiredRoles: ['teacher', 'admin']
    }
  }

  const config = typeConfig[type]

  const handleClick = () => {
    if (!isAuthenticated) {
      // 未登录用户重定向到登录页面
      alert('请先登录')
      router.push('/login')
      return
    }

    if (!checkPermission(config.requiredRoles)) {
      // 权限不足
      alert('您没有权限上传此内容')
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
      // 检查所有必填字段
      const missingFields = config.fields.filter(field => {
        // 对于图片/URL字段，如果选择了文件上传方式且有文件，则视为已填写
        if ((field.name === 'imageUrl' || field.name === 'url') && file) {
          return false
        }
        // 否则检查formData中是否有值
        return !formData[field.name]
      })
      if (missingFields.length > 0) {
        throw new Error(`请填写所有必填字段: ${missingFields.map(f => f.label).join(', ')}`)
      }

      // works 类型额外校验：仅允许 图片/视频/网页，并且必须上传本地文件
      if (type === 'works') {
        const t = (formData.type || '').toLowerCase()
        if (!file) {
          throw new Error('请上传本地文件：仅支持图片、视频或 .html 网页')
        }
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
      }

      // 如果是学生上传作品，自动关联用户信息
      let submitData = type === 'works' && user?.role === 'student' 
        ? { ...formData, studentId: user._id, studentName: user.username }
        : formData

      let response, data

      // 如果有文件上传，使用FormData和上传API
      if (file) {
        const formDataObj = new FormData()
        Object.keys(submitData).forEach(key => {
          formDataObj.append(key, submitData[key])
        })
        formDataObj.append('file', file)

        response = await fetch(`${config.endpoint}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataObj
        })
      } else {
        throw new Error('请选择要上传的文件')
      }

      data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '上传失败')
      }

      setSuccess(`上传${config.title}成功！`)
      // 重置表单
      setFormData({})
      setFile(null)
      setPreview('')
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

  // 未登录或无权限用户不显示上传按钮（游客不可见；仅允许配置的角色显示）
  const canRenderButton = isAuthenticated && checkPermission(config.requiredRoles)
  if (!canRenderButton) {
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
        上传{config.title}
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
  <div className={`upload-modal  bg-cyan-50 dark:bg-slate-900/90 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">上传{config.title}</h3>
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
              {config.fields.map(field => {
                const isImageOrUrlField = field.name === 'imageUrl' || field.name === 'url'
                return (
                  <div key={field.name}>
                    <label htmlFor={field.name} className="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      {field.label}
                    </label>
                    {isImageOrUrlField ? (
                      <>
                        <div className="flex items-center gap-3">
                          <input
                            ref={uploadFileInputRef}
                            id="uploadFile"
                            type="file"
                            onChange={handleFileChange}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-white text-black cursor-pointer pointer-events-auto relative z-50"
                            accept="image/*,video/*,.pdf,.doc,.docx"
                            aria-label="选择本地文件"
                          />
                        </div>
                        {preview && (
                          <div className="mt-2">
                            {file &&
                              (file.type.startsWith('image/') ? (
                                <img src={preview} alt="预览" className="w-full h-40 object-contain bg-white dark:bg-slate-800 rounded" />
                              ) : file.type.startsWith('video/') ? (
                                <video src={preview} controls className="w-full h-40 rounded bg-white dark:bg-slate-800" />
                              ) : (
                                <div className="w-full h-40 bg-gray-100 dark:bg-slate-800 rounded flex items-center justify-center">
                                  <span className="text-gray-800 dark:text-white">{file.name}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    ) : (
                      field.name === 'type' && type === 'works' ? (
                        <select
                          id={field.name}
                          name={field.name}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-white text-black"
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        >
                          <option value="">请选择作品类型</option>
                          <option value="image">图片</option>
                          <option value="video">视频</option>
                          <option value="html">网页</option>
                        </select>
                      ) : (
                        <input
                          id={field.name}
                          name={field.name}
                          type={(field as any).type || 'text'}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-white text-black placeholder-gray-800 font-medium"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                        />
                      )
                    )}
                  </div>
                )
              })}

              {type === 'works' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    选择文件
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={uploadFileInputRef}
                      id="uploadWorksFile"
                      type="file"
                      onChange={handleFileChange}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 cursor-pointer pointer-events-auto relative z-50"
                      accept="image/*,video/*,.html"
                      aria-label="选择本地文件"
                    />
                  </div>

                  {file && (
                    <div className="mt-2">
                      {file.type.startsWith('image/') ? (
                        <img src={preview} alt="预览" className="w-full h-40 object-contain bg-white dark:bg-slate-800 rounded" />
                      ) : file.type.startsWith('video/') ? (
                        <video src={preview} controls className="w-full h-40 rounded bg-white dark:bg-slate-800" />
                      ) : null}
                    </div>
                  )}
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
                  disabled={uploading || !file}
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
