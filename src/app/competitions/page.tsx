'use client'

import HeroSection from '@/components/HeroSection'
import CompetitionsList from '@/components/CompetitionsList'
import UploadButton from '@/components/UploadButton'

export default function CompetitionsPage() {
  return (
    <main>
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">白名单赛事</h1>
          <UploadButton type="competitions" />
        </div>
        <CompetitionsList />
      </div>
    </main>
  )
}