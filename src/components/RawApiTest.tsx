'use client'

import { useState, useEffect } from 'react'

export default function RawApiTest() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('开始调用API...')
        const response = await fetch('/api/honors')
        console.log('API响应状态:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('API返回的完整数据:', result)
        
        setData(result)
      } catch (err) {
        console.error('API调用错误:', err)
        setData({ error: err instanceof Error ? err.message : '未知错误' })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
  <div className="p-4 bg-cyan-50 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">原始API响应测试</h2>
      
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div>
          <p className="mb-2">加载状态: 完成</p>
          <p className="mb-2">数据类型: {typeof data}</p>
          <p className="mb-2">是否包含honors字段: {data && 'honors' in data ? '是' : '否'}</p>
          {data && 'honors' in data && (
            <p className="mb-2">honors字段类型: {typeof data.honors}</p>
          )}
          {data && 'honors' in data && Array.isArray(data.honors) && (
            <p className="mb-2">honors数组长度: {data.honors.length}</p>
          )}
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">完整响应数据:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}