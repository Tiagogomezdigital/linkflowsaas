import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar se é admin (apenas admin@linkflow.com)
  if (user.email !== 'admin@linkflow.com') {
    redirect('/dashboard/grupos')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

