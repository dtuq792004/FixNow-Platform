import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, RotateCcw, ShieldCheck, UserRound, Users } from 'lucide-react'
import { useState } from 'react'
import { AdminBadge, AdminError, AdminLoading, AdminPageHeader, AdminPagination, AdminStatCard, AdminToolbar } from '../components/AdminUi'
import { adminService } from '../services/adminService'
import type { AdminUser } from '../types/adminTypes'

type RoleFilter = AdminUser['role'] | 'ALL'
type StatusFilter = AdminUser['status'] | 'ALL'

const roleLabel: Record<AdminUser['role'], string> = {
  CUSTOMER: 'Khách hàng',
  PROVIDER: 'Nhà cung cấp',
  ADMIN: 'Quản trị viên',
}

const statusConfig: Record<AdminUser['status'], { label: string; tone: 'green' | 'amber' | 'red' }> = {
  ACTIVE: { label: 'Hoạt động', tone: 'green' },
  INACTIVE: { label: 'Chưa hoạt động', tone: 'amber' },
  BANNED: { label: 'Đã khóa', tone: 'red' },
}

const roleTone: Record<AdminUser['role'], 'blue' | 'purple' | 'slate'> = {
  CUSTOMER: 'blue',
  PROVIDER: 'purple',
  ADMIN: 'slate',
}

export function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('ALL')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const client = useQueryClient()

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', page, search, role, status],
    queryFn: () => adminService.getUsers({ page, limit: 10, search, role, status }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: 'ACTIVE' | 'BANNED' }) =>
      adminService.updateUserStatus(id, nextStatus),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const changeRole = (value: RoleFilter) => {
    setRole(value)
    setPage(1)
  }

  const changeStatus = (value: StatusFilter) => {
    setStatus(value)
    setPage(1)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Theo dõi và quản lý toàn bộ khách hàng, nhà cung cấp và quản trị viên trong hệ thống."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Tổng kết quả" value={(usersQuery.data?.total ?? 0).toLocaleString('vi-VN')} icon={Users} />
        <AdminStatCard label="Vai trò đang lọc" value={role === 'ALL' ? 'Tất cả' : roleLabel[role]} icon={ShieldCheck} tone="purple" />
        <AdminStatCard label="Tài khoản trên trang" value={String(usersQuery.data?.items.length ?? 0)} icon={UserRound} tone="green" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <AdminToolbar
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Tìm theo tên, email hoặc số điện thoại..."
        >
          <select
            aria-label="Lọc theo vai trò"
            value={role}
            onChange={(event) => changeRole(event.target.value as RoleFilter)}
            className="h-11 min-w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="CUSTOMER">Khách hàng</option>
            <option value="PROVIDER">Nhà cung cấp</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
          <select
            aria-label="Lọc theo trạng thái"
            value={status}
            onChange={(event) => changeStatus(event.target.value as StatusFilter)}
            className="h-11 min-w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Chưa hoạt động</option>
            <option value="BANNED">Đã khóa</option>
          </select>
        </AdminToolbar>

        {usersQuery.isLoading ? (
          <AdminLoading />
        ) : usersQuery.error || !usersQuery.data ? (
          <AdminError />
        ) : usersQuery.data.items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">Không có người dùng phù hợp với bộ lọc.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {['Người dùng', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Ngày đăng ký', 'Thao tác'].map((heading) => (
                      <th className="px-6 py-4 font-bold" key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersQuery.data.items.map((user) => {
                    const statusInfo = statusConfig[user.status]
                    return (
                      <tr className="border-t border-slate-100 transition hover:bg-blue-50/30" key={user._id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.fullName} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
                            ) : (
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 font-extrabold text-blue-700">
                                {user.fullName.trim().charAt(0).toUpperCase()}
                              </span>
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{user.fullName}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{user.phone || '—'}</td>
                        <td className="px-6 py-4"><AdminBadge tone={roleTone[user.role]}>{roleLabel[user.role]}</AdminBadge></td>
                        <td className="px-6 py-4"><AdminBadge tone={statusInfo.tone}>{statusInfo.label}</AdminBadge></td>
                        <td className="px-6 py-4 text-slate-600">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            title={user.status === 'BANNED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            onClick={() => statusMutation.mutate({
                              id: user._id,
                              nextStatus: user.status === 'BANNED' ? 'ACTIVE' : 'BANNED',
                            })}
                            className={`rounded-lg p-2 transition disabled:opacity-50 ${user.status === 'BANNED' ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                          >
                            {user.status === 'BANNED' ? <RotateCcw size={18} /> : <Ban size={18} />}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <AdminPagination {...usersQuery.data} onPageChange={setPage} />
          </>
        )}
      </section>
    </div>
  )
}
