'use client'

import { useState, useEffect } from 'react'

export default function ApiTestComponent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('开始调用API...')
        const response = await fetch('/api/honors')
        console.log('API响应状态:', response.status, response.statusText)
        console.log('API响应头:', response.headers)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('API返回的完整数据:', result)
        console.log('result.honors:', result.honors)
        console.log('result.honors是否为数组:', Array.isArray(result.honors))
        
        if (result && result.honors && Array.isArray(result.honors)) {
          console.log('honors数组长度:', result.honors.length)
          console.log('第一个荣誉项:', result.honors[0])
        } else {
          console.error('数据格式不符合预期:', result)
        }
        
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
  <div className="bg-cyan-50 shadow-md rounded p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">API测试组件</h2>
      
      {loading && <p>加载中...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>错误: {error}</p>
        </div>
      )}
      
      {data && (
        <div>
          <h3 className="text-lg font-semibold mb-2">解析结果:</h3>
          <p>数据类型: {typeof data}</p>
          <p>是否包含honors字段: {data && 'honors' in data ? '是' : '否'}</p>
          <p>honors字段类型: {data && data.honors ? typeof data.honors : 'N/A'}</p>
          <p>honors是否为数组: {data && Array.isArray(data.honors) ? '是' : '否'}</p>
          <p>honors数组长度: {data && data.honors ? data.honors.length : 'N/A'}</p>
          
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold">查看完整响应数据</summary>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto max-h-64">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}