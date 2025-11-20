'use client'

import HeroSection from '@/components/HeroSection'
import WorksList from '@/components/WorksList'
import FileUploadButton from '@/components/FileUploadButton'
import UploadButton from '@/components/UploadButton'
import useAuth from '@/hooks/useAuth'

export default function WorksPage() {
  const { user } = useAuth()

  return (
    <main>
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#00BCD4]">学生作品</h1>
          <div className="flex gap-2">
            {user?.role === 'student' && <FileUploadButton />}
            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <UploadButton type="works" />
            )}
          </div>
        </div>
        <WorksList />
      </div>
    </main>
  )
}