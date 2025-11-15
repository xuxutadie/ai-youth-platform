'use client'

import RawApiTest from '@/components/RawApiTest'

export default function RawTestPage() {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">原始API测试页面</h1>
        <RawApiTest />
      </div>
    </main>
  )
}