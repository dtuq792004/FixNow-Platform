import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminHeader } from '../modules/admin/components/AdminHeader'
import { AdminSidebar } from '../modules/admin/components/AdminSidebar'

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="admin-shell min-h-screen bg-[#f4f7fb] text-slate-900">
      <AdminHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="min-h-screen pt-[72px] lg:pl-[264px]">
        <div className="mx-auto w-full max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
