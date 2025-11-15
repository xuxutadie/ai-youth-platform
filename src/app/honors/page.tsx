'use client'

import { useEffect } from 'react'
import HeroSection from '@/components/HeroSection'
import HonorsList from '@/components/HonorsList'
import UploadButton from '@/components/UploadButton'

export default function HonorsPage() {
  useEffect(() => {
    console.log('荣誉页面已加载')
  }, [])
  
  return (
    <main>
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">学生荣誉</h1>
          <UploadButton type="honors" />
        </div>
        <HonorsList />
      </div>
    </main>
  )
}