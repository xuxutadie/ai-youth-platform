"use client"
import React, { useEffect, useRef, useState } from "react"
import Sidebar from "@/components/Sidebar"
import { usePathname } from "next/navigation"

const DEFAULT_WIDTH = 172 // 在156px基础上再增加10%，约172px
const MIN_WIDTH = 150 // 仍保留以供折叠时参考（不参与计算）
const MAX_WIDTH = 320 // 保留不使用

export default function ResizableLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const [collapsed, setCollapsed] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)

  // 初始化：从 localStorage 读取用户设置
  useEffect(() => {
    const savedCollapsed = typeof window !== "undefined" ? window.localStorage.getItem("sidebarCollapsed") : null
    if (savedCollapsed) {
      setCollapsed(savedCollapsed === "1")
    }
  }, [])

  // 持久化：保存到 localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0")
    }
  }, [collapsed])

  // 固定宽度模式：不再监听拖拽事件

  return (
    <div className="relative min-h-screen text-gray-900 dark:text-gray-200 dark:bg-black">
      {/* 浅色模式：全局渐变背景。深色模式隐藏以保持纯黑背景 */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cyan-400/20 via-teal-400/16 to-sky-500/14 dark:hidden" />
      {/* 深色模式：仅在登录页叠加柔和渐变，避免纯黑过暗 */}
      {pathname === "/login" && (
        <div className="absolute inset-0 -z-10 hidden dark:block dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900/92 dark:to-slate-800" />
      )}
      <div
        ref={containerRef}
        className="md:grid"
        style={{ gridTemplateColumns: collapsed ? `1px 1fr` : `${DEFAULT_WIDTH}px 1fr` }}
      >
        {/* 侧栏列：折叠时完全不渲染，避免内容泄露（sticky/overflow） */}
        <div style={{ width: collapsed ? 0 : DEFAULT_WIDTH }} aria-hidden={collapsed}>
          <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        </div>
        {/* 内容列，含拖拽分隔条与折叠按钮 */}
        <div className="relative min-h-screen">
          {/* 展开按钮：仅在折叠状态下显示，居中于内容左缘 */}
          {/* 折叠后显示“展开”按钮（内容区左缘中部） */}
          {collapsed && (
            <button
              type="button"
              aria-label="展开侧栏"
              title="展开侧栏"
              onClick={() => setCollapsed(false)}
              className="hidden md:inline-flex items-center gap-1 fixed left-1 top-[75%] -translate-y-1/2 z-50 px-2 py-1 rounded-md border border-cyan-200/60 dark:border-cyan-700/40 bg-white/70 dark:bg-slate-900/60 text-cyan-800 dark:text-cyan-200 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-900/80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3 12l7-7v4h7v6H10v4z" />
              </svg>
              <span className="text-xs">展开</span>
            </button>
          )}
          <div className="pt-14 md:pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}