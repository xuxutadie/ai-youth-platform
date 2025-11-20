'use client'

import { useState, useEffect } from 'react'

export default function CompetitionsList() {
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch('/api/competitions')
        const result = await response.json()
        // API返回的是包含competitions字段的对象，需要提取数组
        setCompetitions(Array.isArray(result.competitions) ? result.competitions : [])
      } catch (error) {
        console.error('获取赛事数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitions()
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
      ) : competitions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition, index) => (
  <div key={index} className="group ui-card">
              <div className="ui-card-header">
                {competition.imageUrl && (
                  <img 
                    src={competition.imageUrl} 
                    alt={competition.name} 
                    className="w-full h-full object-contain bg-gray-800"
                  />
                )}
                <div className="ui-shine"><div className="ui-shine-bar group-hover:translate-x-[120%] duration-700" /></div>
              </div>
              <div className="p-4 bg-[#d242ff] text-white">
                <h3 className="ui-card-title mb-2">
                  <span className="text-white">
                    {competition.name}
                  </span>
                </h3>
                <p className="ui-card-subtle mb-2 text-white">
                  <span>
                    举办时间: {competition.date}
                  </span>
                </p>
                <p className="ui-card-muted text-white">
                  {competition.description || '暂无描述'}
                </p>
              </div>
              <div className="ui-card-footer-line" />
            </div>
          ))}
        </div>
      ) : (
  <div className="ui-card p-8 text-center">
          <p className="text-gray-500">暂无赛事数据</p>
        </div>
      )}
    </div>
  )
}