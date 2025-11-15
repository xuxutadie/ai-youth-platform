'use client'

import { useState, useEffect } from 'react'

export default function HonorsList() {
  const [honors, setHonors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHonors = async () => {
      try {
        const response = await fetch('/api/honors')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        // API返回的是包含honors字段的对象，需要提取数组
        let honorsArray = []
        if (result && typeof result === 'object' && 'honors' in result) {
          if (Array.isArray(result.honors)) {
            honorsArray = result.honors
          }
        }
        
        setHonors(honorsArray)
      } catch (error) {
        console.error('获取荣誉数据失败:', error)
        // 如果API请求失败，设置空数组而不是抛出错误
        setHonors([])
      } finally {
        setLoading(false)
      }
    }

    fetchHonors()
  }, [])

  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
  <div key={index} className="ui-card p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : honors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {honors.map((honor, index) => (
  <div key={index} className="group ui-card">
              <div className="ui-card-header">
                {honor.imageUrl && (
                  <img 
                    src={honor.imageUrl} 
                    alt={honor.title} 
                    className="w-full h-full object-contain bg-gray-800"
                  />
                )}
                <div className="ui-shine"><div className="ui-shine-bar group-hover:translate-x-[120%] duration-700" /></div>
              </div>
              <div className="p-4">
                <h3 className="ui-card-title mb-2">
                  <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">{honor.title}</span>
                </h3>
                <p className="ui-card-subtle mb-2">
                  <span className="mr-1">获奖人:</span>
                  <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent font-medium">{honor.studentName}</span>
                  <span className="mx-1 text-gray-400">· 年级:</span>
                  <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">{(honor as any).className || (honor as any).grade || '未填写'}</span>
                </p>
                <p className="ui-card-muted mb-2">获奖时间: {honor.date}</p>
              </div>
              <div className="ui-card-footer-line" />
            </div>
          ))}
        </div>
      ) : (
  <div className="ui-card p-8 text-center">
          <p className="text-gray-500">暂无荣誉数据</p>
        </div>
      )}
    </div>
  )
}