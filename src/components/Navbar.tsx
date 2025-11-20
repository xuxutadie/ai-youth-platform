'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import LogoImage from '@/components/LogoImage'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const router = useRouter()

  // 强制启用暗色主题
  useEffect(() => {
    try {
      const root = document.documentElement
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    } catch {}
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    root.classList.add('dark')
    localStorage.setItem('theme', 'dark')
    setIsDark(true)
  }

  const linkClass = (href: string) => {
    const active = pathname === href
    return `relative inline-flex items-center text-sm px-3 py-2 rounded-md font-semibold ${
      active
        ? 'text-white bg-gradient-to-br from-cyan-500 to-teal-600 shadow-md hover:from-cyan-600 hover:to-teal-700 hover:shadow-lg border-transparent'
        : 'text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 hover:bg-cyan-100 dark:hover:bg-slate-800'
    } transition-colors border-b-2 border-transparent hover:border-cyan-700`
  }
  // 登录/注册按钮激活样式：根据当前路由高亮对应按钮
  const authCtaClass = (href: string) => {
    const active = pathname === href
    return active
      ? 'px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-md hover:from-cyan-600 hover:to-blue-700 transition-colors shadow-sm'
      : 'px-3 py-2 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 transition-colors'
  }

  return (
    <nav className="sticky top-0 z-50 relative backdrop-blur-xl border-b border-cyan-200/30 dark:border-cyan-700/40 shadow-sm">
      {/* 青绿色磨砂底：半透明渐变叠加到导航，保证可读性且不影响交互 */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-400/20 via-teal-400/16 to-sky-500/14 dark:from-cyan-500/15 dark:via-teal-500/12 dark:to-sky-600/12" />
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <LogoImage
                src={process.env.NEXT_PUBLIC_LOGO_URL || "/logo.png"}
                alt="青少年人工智能"
                className="w-[110px] md:w-[120px] max-h-[24px] md:max-h-[26px] h-auto object-contain shrink-0"
                fallbackSrc="/logo.svg"
                focus="none"
                width={1099}
                height={233}
              />
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/" className={linkClass('/')}
            >
              首页
            </Link>
            <Link href="/competitions" className={linkClass('/competitions')}
            >
              白名单赛事
            </Link>
            <Link href="/works" className={linkClass('/works')}
            >
              学生作品
            </Link>
            <Link href="/honors" className={linkClass('/honors')}
            >
              学生荣誉
            </Link>
            <Link href="/courses" className={linkClass('/courses')}
            >
              公益课程
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className={linkClass('/admin')}
              >
                后台管理
              </Link>
            )}
          </div>
          
          {/* 桌面端：根据登录状态显示不同内容 */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 暗色固定：移除切换按钮 */}
            {isAuthenticated ? (
              // 已登录：显示用户头像和下拉菜单
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 transition-colors focus:outline-none"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="头像"
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-semibold shadow-sm">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:block">{user?.username}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-cyan-50/95 dark:bg-[#40E0D0]/70 backdrop-blur-md rounded-md shadow-lg border border-cyan-100/60 dark:border-[#40E0D0]/50 py-2 z-10">
          <div className="px-4 pb-2 border-b border-cyan-100/60 dark:border-[#40E0D0]/50">
                      <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">{user?.username}</p>
                      <p className="text-xs text-cyan-800/90 dark:text-cyan-300">{user?.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        角色: {user?.role === 'student' ? '学生' : user?.role === 'teacher' ? '教师' : '管理员'}
                      </p>
                    </div>
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      个人信息
                    </Link>
                    <Link 
                      href="/my-works" 
                      className="block px-4 py-2 text-sm text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      我的作品
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsProfileOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 未登录：显示登录和注册按钮（竖向堆叠）
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/login"
                  className={authCtaClass('/login')}
                  onClick={(e) => { e.preventDefault(); router.push('/login') }}
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className={authCtaClass('/register')}
                  onClick={(e) => { e.preventDefault(); router.push('/register') }}
                >
                  注册
                </Link>
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            {/* 暗色固定：移除移动端切换按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <Link href="/" className="block py-2 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 transition-colors">
              首页
            </Link>
            <Link href="/competitions" className="block py-2 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 transition-colors">
              白名单赛事
            </Link>
            <Link href="/works" className="block py-2 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 transition-colors">
              学生作品
            </Link>
            <Link href="/honors" className="block py-2 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 transition-colors">
              学生荣誉
            </Link>
            <Link href="/courses" className="block py-2 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 transition-colors">
              公益课程
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="block py-2 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 transition-colors">
                后台管理
              </Link>
            )}
            
            {/* 移动端：根据登录状态显示不同内容 */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="头像"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-semibold">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">{user?.username}</p>
                      <p className="text-xs text-cyan-800/90 dark:text-cyan-300">
                        {user?.role === 'student' ? '学生' : user?.role === 'teacher' ? '教师' : '管理员'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Link href="/profile" className="block text-center px-4 py-2 text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                      个人信息
                    </Link>
                    <Link href="/my-works" className="block text-center px-4 py-2 text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                      我的作品
                    </Link>
                    <button
                      onClick={logout}
                      className="block text-center px-4 py-2 text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/login"
                    className={`block text-center ${authCtaClass('/login')}`}
                    onClick={(e) => { e.preventDefault(); router.push('/login') }}
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className={`block text-center ${authCtaClass('/register')}`}
                    onClick={(e) => { e.preventDefault(); router.push('/register') }}
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}