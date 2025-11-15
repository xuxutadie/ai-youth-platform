import AdminDashboard from '@/components/AdminDashboard'

export default function AdminPage() {
  return (
    <main>
      <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">后台管理</h1>
        <AdminDashboard />
      </div>
    </main>
  )
}