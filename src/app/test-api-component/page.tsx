'use client'

import ApiTestComponent from '@/components/ApiTestComponent'

export default function TestPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API测试页面</h1>
      <ApiTestComponent />
    </main>
  )
}