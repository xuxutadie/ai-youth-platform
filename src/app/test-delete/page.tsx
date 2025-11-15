'use client'

import { useState } from 'react'
import useAuth from '@/hooks/useAuth'

export default function TestDeletePage() {
  const { user, token } = useAuth()
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testDelete = async (endpoint: string, id: string) => {
    setIsLoading(true)
    setResult('')

    try {
      console.log('测试删除:', endpoint, id)
      console.log('使用token:', token ? '已获取' : '未获取')

      const response = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('响应状态:', response.status)
      const data = await response.json()
      console.log('响应数据:', data)

      setResult(`状态: ${response.status}, 数据: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error('删除错误:', error)
      setResult(`错误: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>请先登录</div>
  }

  if (user.role !== 'admin') {
    return <div>需要管理员权限</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">测试删除功能</h1>
      
      <div className="mb-4">
        <p>当前用户: {user.username} ({user.role})</p>
        <p>Token状态: {token ? '已获取' : '未获取'}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">测试删除作品</h2>
          <button
            onClick={() => testDelete('/api/works', 'test-work-id')}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isLoading ? '测试中...' : '测试删除作品'}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">测试删除赛事</h2>
          <button
            onClick={() => testDelete('/api/competitions', 'test-competition-id')}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isLoading ? '测试中...' : '测试删除赛事'}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">测试删除荣誉</h2>
          <button
            onClick={() => testDelete('/api/honors', 'test-honor-id')}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isLoading ? '测试中...' : '测试删除荣誉'}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">测试删除课程</h2>
          <button
            onClick={() => testDelete('/api/courses', 'test-course-id')}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isLoading ? '测试中...' : '测试删除课程'}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">结果:</h2>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}