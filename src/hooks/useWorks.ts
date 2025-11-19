'use client'

import { useState, useEffect } from 'react'

export default function useWorks() {
  const [works, setWorks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch('/api/works', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        })
        if (!res.ok) {
          throw new Error('Failed to fetch works')
        }
        const data = await res.json()
        setWorks(data.works || [])
      } catch (err: any) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorks()
  }, [])

  return { works, isLoading, error }
}