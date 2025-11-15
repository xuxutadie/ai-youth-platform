'use client'

import { useState, useEffect } from 'react'

export default function TestApiPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('开始调用API...')
        const response = await fetch('/api/honors')
        console.log('API响应状态:', response.status, response.statusText)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('API返回的完整数据:', result)
        console.log('result.honors:', result.honors)
        console.log('result.honors是否为数组:', Array.isArray(result.honors))
        
        setData(result)
      } catch (err) {
        console.error('API调用错误:', err)
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API测试页面</h1>
      
      {loading && <p>加载中...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>错误: {error}</p>
        </div>
      )}
      
      {data && (
  <div className="bg-cyan-50 shadow-md rounded p-6">
          <h2 className="text-xl font-semibold mb-4">API响应数据:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
          
          <h3 className="text-lg font-semibold mt-6 mb-2">解析结果:</h3>
          <p>数据类型: {typeof data}</p>
          <p>是否包含honors字段: {data && 'honors' in data ? '是' : '否'}</p>
          <p>honors字段类型: {data && data.honors ? typeof data.honors : 'N/A'}</p>
          <p>honors是否为数组: {data && Array.isArray(data.honors) ? '是' : '否'}</p>
          <p>honors数组长度: {data && data.honors ? data.honors.length : 'N/A'}</p>
        </div>
      )}
    </div>
  )
}