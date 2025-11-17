'use client'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">系统设置</h1>
      <ul className="space-y-2">
        <li><Link className="text-blue-600" href="/admin/settings/website">网站设置</Link></li>
        <li><Link className="text-blue-600" href="/admin/settings/permissions">权限管理</Link></li>
        <li><Link className="text-blue-600" href="/admin/settings/backup">数据备份</Link></li>
        <li><Link className="text-blue-600" href="/admin/settings/logs">系统日志</Link></li>
      </ul>
    </div>
  )
}