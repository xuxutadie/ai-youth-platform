'use client'

// API请求工具函数
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // 从localStorage获取token
  const token = localStorage.getItem('token')
  
  // 设置默认请求头
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  // 创建请求配置
  const config: RequestInit = {
    ...options,
    headers,
  }

  // 发送请求
  const response = await fetch(url, config)
  return response
}

// GET请求
export async function apiGet(url: string): Promise<Response> {
  return apiRequest(url, { method: 'GET' })
}

// POST请求
export async function apiPost(url: string, data?: any): Promise<Response> {
  return apiRequest(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// PUT请求
export async function apiPut(url: string, data?: any): Promise<Response> {
  return apiRequest(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// DELETE请求
export async function apiDelete(url: string): Promise<Response> {
  return apiRequest(url, { method: 'DELETE' })
}