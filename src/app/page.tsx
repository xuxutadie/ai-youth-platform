import HeroSection from '@/components/HeroSection'
import ContentSection from '@/components/ContentSection'

export default function HomePage() {
  return (
    <main className="relative">
      <HeroSection />
      {/* 容器磨砂叠加：与全局浅色渐变协调（青-蓝系），降低透明度避免双重背景冲突 */}
      <div className="relative container mx-auto px-4 py-8">
        <div
          className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-cyan-400/14 via-teal-400/10 to-sky-500/8 backdrop-blur-md dark:hidden"
        />
        <ContentSection title="最新赛事" type="competitions" />
        <ContentSection title="优秀作品" type="works" limit={6} />
        <ContentSection title="学生荣誉" type="honors" />
        <ContentSection title="公益课程" type="courses" />
      </div>
    </main>
  )
}