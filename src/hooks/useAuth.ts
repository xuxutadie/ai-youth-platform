'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  _id: string
  username: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  avatarUrl?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export default function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  })
  const router = useRouter()

  useEffect(() => {
    // 从localStorage加载用户认证信息
    const loadAuth = () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          const user = JSON.parse(userStr) as User
          setAuth({
            user,
            token,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          setAuth(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false
          }))
        }
      } catch (error) {
        console.error('加载认证信息失败:', error)
        setAuth(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false
        }))
      }
    }

    loadAuth()
  }, [])

  const login = (user: User, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setAuth({
      user,
      token,
      isLoading: false,
      isAuthenticated: true
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    })
    router.push('/')
  }

  const checkPermission = (requiredRoles?: string[]) => {
    if (!auth.isAuthenticated) return false
    if (!requiredRoles || requiredRoles.length === 0) return true
    return requiredRoles.includes(auth.user?.role || '')
  }

  return {
    ...auth,
    login,
    logout,
    checkPermission
  }
}