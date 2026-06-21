import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Clock3, ImageOff, Tag, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { AdminBadge, AdminError, AdminLoading, AdminPageHeader, AdminPagination, AdminToolbar } from '../components/AdminUi'
import { adminService } from '../services/adminService'

const statusLabels = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' } as const
const money = (value: number) => `${value.toLocaleString('vi-VN')} ₫`

export function AdminServicesPage() {
  const client = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const query = useQuery({
    queryKey: ['admin', 'provider-services', page, search, status],
    queryFn: () => adminService.getServices({ page, limit: 9, search, status }),
  })
  const refresh = () => client.invalidateQueries({ queryKey: ['admin', 'provider-services'] })
  const approve = useMutation({ mutationFn: adminService.approveService, onSuccess: refresh })
  const reject = useMutation({ mutationFn: adminService.rejectService, onSuccess: refresh })

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader title="Dịch vụ Provider" description="Quản lý và kiểm duyệt các dịch vụ do Provider đăng ký trên hệ thống." />
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/90 via-white to-cyan-50/80 shadow-sm">
        <AdminToolbar value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Tìm tên hoặc mô tả dịch vụ...">
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="h-11 rounded-xl border px-3 text-sm">
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </AdminToolbar>

        {query.isLoading ? <AdminLoading /> : query.error || !query.data ? <AdminError /> : (
          <>
            <div className="grid gap-5 p-5 md:grid-cols-2 2xl:grid-cols-3">
              {query.data.items.map((service, index) => {
                const image = service.image?.[0]
                const tones = ['from-blue-600 to-cyan-500', 'from-indigo-600 to-blue-500', 'from-sky-600 to-teal-500']
                return (
                  <article key={service._id} className="group overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_16px_40px_-24px_rgba(30,64,175,.55)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-22px_rgba(14,116,144,.55)]">
                    <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${tones[index % tones.length]}`}>
                      {image ? <img src={image} alt={service.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-white/70"><ImageOff size={38} /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                      <div className="absolute left-4 top-4"><AdminBadge tone={service.status === 'APPROVED' ? 'green' : service.status === 'REJECTED' ? 'red' : 'amber'}>{statusLabels[service.status]}</AdminBadge></div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                        <h2 className="line-clamp-2 text-xl font-extrabold">{service.name}</h2>
                        <span className="shrink-0 rounded-xl bg-white/20 px-3 py-1.5 text-sm font-black backdrop-blur">{money(service.price)}</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{service.description || 'Provider chưa thêm mô tả cho dịch vụ này.'}</p>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-blue-50 p-3 text-blue-900">
                          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-blue-500"><UserRound size={14} />Provider</p>
                          <p className="mt-1 truncate text-sm font-bold">{service.providerId?.fullName || 'Chưa xác định'}</p>
                        </div>
                        <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-900">
                          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-cyan-600"><Tag size={14} />Danh mục</p>
                          <p className="mt-1 truncate text-sm font-bold">{service.categoryId?.name || 'Chưa phân loại'}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Clock3 size={14} />{new Date(service.createdAt).toLocaleDateString('vi-VN')} · theo {service.unit === 'hour' ? 'giờ' : 'lần'}</span>
                        {service.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button type="button" title="Từ chối" disabled={reject.isPending} onClick={() => reject.mutate(service._id)} className="rounded-xl bg-red-50 p-2.5 text-red-600 hover:bg-red-100"><X size={18} /></button>
                            <button type="button" title="Duyệt dịch vụ" disabled={approve.isPending} onClick={() => approve.mutate(service._id)} className="rounded-xl bg-emerald-500 p-2.5 text-white shadow-sm hover:bg-emerald-600"><Check size={18} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
            {query.data.items.length === 0 && <p className="px-6 py-16 text-center text-sm text-slate-500">Không có dịch vụ phù hợp.</p>}
            <AdminPagination {...query.data} onPageChange={setPage} />
          </>
        )}
      </section>
    </div>
  )
}
