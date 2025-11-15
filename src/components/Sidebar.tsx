'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import LogoImage from '@/components/LogoImage'
// 全站搜索改造：不再在侧栏里直接写入作品搜索 store

export default function Sidebar({ collapsed, onToggleCollapse }: { collapsed?: boolean; onToggleCollapse?: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const router = useRouter()
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  // 初始化主题：优先 localStorage，其次系统偏好
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const shouldDark = stored ? stored === 'dark' : prefersDark
      const root = document.documentElement
      if (shouldDark) {
        root.classList.add('dark')
        setIsDark(true)
      } else {
        root.classList.remove('dark')
        setIsDark(false)
      }
    } catch {}
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const next = !isDark
    if (next) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    setIsDark(next)
  }

  const linkClass = (href: string) => {
    const active = pathname === href
    return `relative w-full inline-flex items-center justify-center text-center text-sm px-4 py-2 rounded-md font-semibold tracking-wider ${
      active
        ? 'text-white bg-gradient-to-br from-cyan-500 to-teal-600 shadow-md hover:from-cyan-600 hover:to-teal-700 hover:shadow-lg'
        : 'text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 hover:bg-cyan-100 dark:hover:bg-slate-800'
    } transition-colors`
  }
  const authCtaClass = (href: string) => {
    const active = pathname === href
    return active
      ? 'px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-md hover:from-cyan-600 hover:to-blue-700 transition-colors shadow-sm'
      : 'px-4 py-2 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 transition-colors'
  }

  return (
    <>
      {/* 移动端顶部栏（替代原顶栏） */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b border-cyan-200/30 dark:border-cyan-700/40 shadow-sm">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-400/20 via-teal-400/16 to-sky-500/14 dark:from-cyan-500/15 dark:via-teal-500/12 dark:to-sky-600/12" />
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <LogoImage
              src={process.env.NEXT_PUBLIC_LOGO_URL || "/logo.svg"}
              alt="青少年人工智能"
              className="h-14 md:h-20 w-auto max-w-full"
              fallbackSrc="/logo.svg"
              focus="none"
            />
          </Link>
          <div className="flex items-center gap-3">
            <button
              aria-label={isDark ? '切换为浅色' : '切换为深色'}
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-cyan-200/60 dark:border-cyan-700/40 text-cyan-800 dark:text-cyan-200"
            >
              {isDark ? (
                // 太阳图标（浅色）
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 4.5a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75A.75.75 0 0112 4.5zM6.22 6.22a.75.75 0 011.06 0l.53.53a.75.75 0 11-1.06 1.06l-.53-.53a.75.75 0 010-1.06zM4.5 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 014.5 12zm2.25 5.25a.75.75 0 011.06 0l.53.53a.75.75 0 11-1.06 1.06l-.53-.53a.75.75 0 010-1.06zM12 18.75a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zm5.25-1.5a.75.75 0 011.06 0l.53.53a.75.75 0 11-1.06 1.06l-.53-.53a.75.75 0 010-1.06zM18.75 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm-1.5-5.25a.75.75 0 011.06 0l.53.53a.75.75 0 11-1.06 1.06l-.53-.53a.75.75 0 010-1.06z" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              ) : (
                // 月亮图标（深色）
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M21.752 15.002A9.718 9.718 0 0112 21.75 9.75 9.75 0 1112 2.25c.546 0 1.084.045 1.607.133a.75.75 0 01.286 1.373 7.5 7.5 0 009.227 9.227.75.75 0 011.373.286 9.72 9.72 0 01-2.741 1.733z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-cyan-800 dark:text-cyan-300"
              aria-label="打开菜单"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端侧滑菜单 */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-72 bg-cyan-50/95 dark:bg-[#40E0D0]/70 backdrop-blur-md shadow-xl border-r border-cyan-200/60 dark:border-[#40E0D0]/50 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
              <LogoImage
                src={process.env.NEXT_PUBLIC_LOGO_URL || "/logo.svg"}
                alt="青少年人工智能"
                className="h-12 md:h-14 w-auto max-w-full shrink-0"
                fallbackSrc="/logo.svg"
                focus="none"
              />
            </Link>
              <button onClick={() => setIsMenuOpen(false)} aria-label="关闭菜单" className="text-cyan-800 dark:text-cyan-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 space-y-4 mt-6">
              <Link href="/" className={linkClass('/')} onClick={() => setIsMenuOpen(false)}>首页</Link>
              <Link href="/competitions" className={linkClass('/competitions')} onClick={() => setIsMenuOpen(false)}>白名单赛事</Link>
              <Link href="/works" className={linkClass('/works')} onClick={() => setIsMenuOpen(false)}>学生作品</Link>
              <Link href="/honors" className={linkClass('/honors')} onClick={() => setIsMenuOpen(false)}>学生荣誉</Link>
              <Link href="/courses" className={linkClass('/courses')} onClick={() => setIsMenuOpen(false)}>公益课程</Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className={linkClass('/admin')} onClick={() => setIsMenuOpen(false)}>后台管理</Link>
              )}
            </nav>
            <div className="mt-4 border-t border-cyan-100/60 dark:border-[#40E0D0]/50 pt-4">
              {/* 登录状态区域 */}
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link href="/profile" className="block text-center px-4 py-2 text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>个人信息</Link>
                  <Link href="/my-works" className="block text-center px-4 py-2 text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>我的作品</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false) }} className="block w-full text-center px-4 py-2 text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">退出登录</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className={`block text-center ${authCtaClass('/login')}`}
                    onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); router.push('/login') }}
                  >登录</Link>
                  <Link
                    href="/register"
                    className={`block text-center ${authCtaClass('/register')}`}
                    onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); router.push('/register') }}
                  >注册</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 桌面端侧边栏（固定定位，随页面滚动） */}
      <aside className={`hidden md:flex md:flex-col md:w-[172px] md:h-screen md:fixed md:left-0 md:top-0 md:z-30 md:overflow-y-auto md:overflow-x-hidden relative backdrop-blur-xl border-r-2 border-cyan-300/50 dark:border-cyan-500/50 shadow-sm ${collapsed ? 'md:hidden' : ''}`}>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cyan-400/20 via-teal-400/16 to-sky-500/14 dark:from-cyan-500/15 dark:via-teal-500/12 dark:to-sky-600/12" />
        <div className={`px-3 py-6 ${collapsed ? 'hidden' : ''}`}>
          <Link href="/" className="flex items-center justify-center">
            <div className="flex items-center justify-center min-w-0 w-full">
              <LogoImage
                src={process.env.NEXT_PUBLIC_LOGO_URL || "/logo.svg"}
                alt="青少年人工智能"
                className="h-14 md:h-20 w-auto max-w-full shrink-0"
                fallbackSrc="/logo.svg"
                focus="none"
              />
            </div>
          </Link>
        </div>
        {/* 侧栏中部的收起/展开按钮（桌面显示） */}
        <button
          type="button"
          aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
          title={collapsed ? '展开侧栏' : '收起侧栏'}
          onClick={() => onToggleCollapse?.()}
          className="hidden md:inline-flex items-center gap-1 absolute right-1 top-[75%] -translate-y-1/2 z-50 px-2 py-1 rounded-md border border-cyan-200/60 dark:border-cyan-700/40 bg-white/70 dark:bg-slate-900/60 text-cyan-800 dark:text-cyan-200 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-900/80"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3 12l7-7v4h7v6H10v4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M21 12l-7 7v-4H7V9h7V5z" />
            </svg>
          )}
          <span className="text-xs">{collapsed ? '展开' : '收起'}</span>
        </button>
        {/* 品牌标语（Logo 下方） */}
        <div className={`px-3 mt-2 mb-2 ${collapsed ? 'hidden' : ''}`}>
          <div className="text-center text-base font-semibold tracking-wider text-cyan-900 dark:bg-gradient-to-r dark:from-[#40E0D0] dark:via-teal-300 dark:to-white dark:bg-clip-text dark:text-transparent">
            青少年人工智能
          </div>
        </div>
        <div className={`px-3 mt-4 mb-4 ${collapsed ? 'hidden' : ''}`}>
          <div className="relative flex w-full">
            <input
              type="text"
              placeholder="搜索作品、作者、赛事、荣誉、课程..."
              value={localSearchTerm}
              onChange={(e) => {
                const val = e.target.value
                setLocalSearchTerm(val)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = localSearchTerm.trim()
                  router.push(`/search?q=${encodeURIComponent(val)}`)
                }
              }}
              className="w-full px-2 py-0.5 text-[11px] leading-4 rounded-l-md border border-r-0 border-cyan-200/60 dark:border-cyan-700/40 bg-white/70 dark:bg-slate-900/60 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            <button
              onClick={() => {
                const val = localSearchTerm.trim()
                router.push(`/search?q=${encodeURIComponent(val)}`)
              }}
              className="px-2 py-0.5 text-[11px] leading-4 bg-cyan-500 text-white rounded-r-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="搜索"
            >
              搜索
            </button>
          </div>
        </div>
        <nav className={`px-2 py-2 space-y-4 mt-6 ${collapsed ? 'hidden' : ''}`}>
          <Link href="/" className={linkClass('/')}>首页</Link>
          <Link href="/competitions" className={linkClass('/competitions')}>白名单赛事</Link>
          <Link href="/works" className={linkClass('/works')}>学生作品</Link>
          <Link href="/honors" className={linkClass('/honors')}>学生荣誉</Link>
          <Link href="/courses" className={linkClass('/courses')}>公益课程</Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className={linkClass('/admin')}>后台管理</Link>
          )}
        </nav>

      <div className={`mt-auto px-4 py-6 border-t-2 border-cyan-200/60 dark:border-cyan-700/40 ${collapsed ? 'hidden' : ''}`}>
          <div className="flex items-center justify-center gap-2 text-center">
            <span className="text-xs text-cyan-800/80 dark:text-cyan-300/80">主题</span>
            <button
              aria-label={isDark ? '切换为浅色' : '切换为深色'}
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-cyan-200/60 dark:border-cyan-700/40 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-100/60 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? '浅色模式' : '深色模式'}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 4.5a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75A.75.75 0 0112 4.5zM6.22 6.22a.75.75 0 011.06 0l.53.53a.75.75 0 11-1.06 1.06l-.53-.53a.75.75 0 010-1.06zM4.5 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 014.5 12zm2.25 5.25a.75.75 0 011.06 0l.53.53a.75.75 0 11-1.06 1.06l-.53-.53a.75.75 0 010-1.06zM12 18.75a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zm5.25-1.5a.75.75 0 011.06 0l.53.53a.75.75 0 11-1.06 1.06l-.53-.53a.75.75 0 010-1.06zM18.75 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm-1.5-5.25a.75.75 0 011.06 0l.53.53a.75.75 0 11-1.06 1.06l-.53-.53a.75.75 0 010-1.06z" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M21.752 15.002A9.718 9.718 0 0112 21.75 9.75 9.75 0 1112 2.25c.546 0 1.084.045 1.607.133a.75.75 0 01.286 1.373 7.5 7.5 0 009.227 9.227.75.75 0 011.373.286 9.72 9.72 0 01-2.741 1.733z" />
                </svg>
              )}
            </button>
          </div>

          {/* 登录状态区域 */}
          {isAuthenticated ? (
            <div className="mt-4 relative flex justify-center">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 transition-colors focus:outline-none"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="头像" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-semibold shadow-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden lg:block text-sm">{user?.username}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isProfileOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-40 md:w-40 max-w-[160px] bg-cyan-50/95 dark:bg-[#40E0D0]/70 backdrop-blur-md rounded-md shadow-lg border border-cyan-100/60 dark:border-[#40E0D0]/50 py-2 z-10 max-h-[60vh] overflow-y-auto">
                  <div className="px-4 pb-2 border-b border-cyan-100/60 dark:border-[#40E0D0]/50">
                    <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">{user?.username}</p>
                    <p className="text-xs text-cyan-800/90 dark:text-cyan-300">{user?.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">角色: {user?.role === 'student' ? '学生' : user?.role === 'teacher' ? '教师' : '管理员'}</p>
                  </div>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsProfileOpen(false)}>个人信息</Link>
                  <Link href="/my-works" className="block px-4 py-2 text-sm text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsProfileOpen(false)}>个人作品</Link>
                  <button onClick={() => { logout(); setIsProfileOpen(false) }} className="block w-full text-left px-4 py-2 text-sm text-cyan-800 dark:text-cyan-200 hover:bg-gray-100 dark:hover:bg-gray-800">退出登录</button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-3">
              <Link
                href="/login"
                className={`w-full text-center ${authCtaClass('/login')}`}
                onClick={(e) => { e.preventDefault(); router.push('/login') }}
              >登录</Link>
              <Link
                href="/register"
                className={`w-full text-center ${authCtaClass('/register')}`}
                onClick={(e) => { e.preventDefault(); router.push('/register') }}
              >注册</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}