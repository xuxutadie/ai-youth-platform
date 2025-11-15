'use client'

import { useState, useEffect } from 'react'

interface CarouselImage {
  url: string
  alt: string
  link: string
}

export default function HeroSection() {
  // 轮播图数据 - 使用本地图片路径
  // 建议图片尺寸：1920x600px（宽度1920像素，高度600像素）
  // 这个尺寸适合各种屏幕尺寸，保证在桌面和移动设备上都有良好的显示效果
  // 请将实际图片文件放入public/carousel文件夹
  // 第一张为主页显示图片，命名为carousel-0.jpg
  // 后面依次为：白名单赛事、学生作品、学术荣誉和公益课程
  const carouselImages: CarouselImage[] = [
    {
      url: '/carousel/carousel-0.jpg', // 主页显示图片
      alt: 'AI少儿编程展示平台',
      link: '/'
    },
    {
      url: '/carousel/carousel-1.jpg', // 白名单赛事
      alt: '白名单赛事',
      link: '/competitions'
    },
    {
      url: '/carousel/carousel-2.jpg', // 学生作品
      alt: '学生作品展示',
      link: '/works'
    },
    {
      url: '/carousel/carousel-3.jpg', // 学术荣誉
      alt: '学生荣誉墙',
      link: '/honors'
    },
    {
      url: '/carousel/carousel-4.jpg', // 公益课程
      alt: '公益课程',
      link: '/courses'
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  // 自动轮播效果
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // 每5秒切换一次图片

    return () => clearInterval(interval)
  }, [carouselImages.length])

  // 处理图片点击事件
  const handleImageClick = (link: string) => {
    window.location.href = link
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl">
      <div 
        className="flex transition-transform duration-500 ease-in-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {carouselImages.map((image, index) => (
          <div 
            key={index} 
            className="min-w-full relative h-[500px] cursor-pointer"
            onClick={() => handleImageClick(image.link)}
          >
            <img 
                src={image.url} 
                alt={image.alt} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 如果图片加载失败，使用默认图片
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/1200/600?fallback'
                }}
              />
            <a href={image.link} className="absolute inset-0 flex items-end justify-center pb-10 group">
                <div className="bg-transparent text-white font-bold py-3 px-8 rounded-full ring-2 ring-white/80 hover:ring-white transition-colors opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  立即查看
                </div>
                <span className="sr-only">查看{image.alt}</span>
              </a>
          </div>
        ))}
      </div>
      
      {/* 轮播指示器 */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
            onClick={(e) => {
              e.stopPropagation() // 防止触发图片点击事件
              setCurrentIndex(index)
            }}
            aria-label={`切换到第${index + 1}张图片`}
          />
        ))}
      </div>
      
      {/* 左右箭头 */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-transparent rounded-full flex items-center justify-center text-white ring-2 ring-white/60 hover:ring-white/90 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
          )
        }}
        aria-label="上一张"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-transparent rounded-full flex items-center justify-center text-white ring-2 ring-white/60 hover:ring-white/90 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          setCurrentIndex((prevIndex) =>
            prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
          )
        }}
        aria-label="下一张"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}