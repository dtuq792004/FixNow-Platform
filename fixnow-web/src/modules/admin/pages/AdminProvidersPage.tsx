import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BriefcaseBusiness, CalendarDays, Check, FileText, Mail, MapPin, Phone, ShieldCheck, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AdminBadge, AdminError, AdminLoading, AdminPageHeader, AdminPagination, AdminToolbar } from '../components/AdminUi'
import { adminService } from '../services/adminService'
import type { ProviderApplication } from '../types/adminTypes'

const statusFilters = [
  ['PENDING', 'Đang chờ'],
  ['APPROVED', 'Đã duyệt'],
  ['REJECTED', 'Đã từ chối'],
]

export function AdminProvidersPage() {
  const [status, setStatus] = useState('PENDING')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ProviderApplication>()
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['admin', 'providers', status, page, search],
    queryFn: () => adminService.getProviderApplications({ status, page, limit: 10, search }),
  })
  const refresh = () => client.invalidateQueries({ queryKey: ['admin', 'providers'] })
  const approve = useMutation({
    mutationFn: adminService.approveProvider,
    onSuccess: () => { setSelected(undefined); refresh() },
  })
  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminService.rejectProvider(id, reason),
    onSuccess: () => { setSelected(undefined); refresh() },
  })

  const rejectApplication = (application: ProviderApplication) => {
    const reason = window.prompt('Lý do từ chối', 'Hồ sơ chưa đáp ứng yêu cầu')
    if (reason) reject.mutate({ id: application._id, reason })
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader title="Hồ sơ Provider" description="Chọn một hồ sơ trong bảng để xem đầy đủ thông tin đơn đăng ký." />
      <div className="flex flex-wrap gap-2">
        {statusFilters.map(([value, label]) => (
          <button key={value} onClick={() => { setStatus(value); setPage(1) }} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${status === value ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <AdminToolbar value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Tìm hồ sơ Provider..." />
        {query.isLoading ? <AdminLoading /> : query.error || !query.data ? <AdminError /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50"><tr>{['Ứng viên', 'Kinh nghiệm', 'Chuyên môn', 'Khu vực', 'Ngày gửi', 'Thao tác'].map((heading) => <th className="px-6 py-4" key={heading}>{heading}</th>)}</tr></thead>
                <tbody>
                  {query.data.items.map((item) => (
                    <tr onClick={() => setSelected(item)} className="cursor-pointer border-t transition hover:bg-blue-50/70" key={item._id}>
                      <td className="px-6 py-4 font-bold">{item.fullName}<p className="text-xs font-normal text-slate-500">{item.userId?.email || item.phone}</p></td>
                      <td className="px-6 py-4">{item.experience}</td>
                      <td className="px-6 py-4">{item.specialties.map((specialty) => specialty.name).join(', ') || '—'}</td>
                      <td className="px-6 py-4">{item.serviceArea}</td>
                      <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4">
                        {item.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button title="Duyệt hồ sơ" onClick={(event) => { event.stopPropagation(); approve.mutate(item._id) }} className="rounded-lg bg-green-50 p-2 text-green-700 hover:bg-green-100"><Check size={18} /></button>
                            <button title="Từ chối hồ sơ" onClick={(event) => { event.stopPropagation(); rejectApplication(item) }} className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100"><X size={18} /></button>
                          </div>
                        ) : <AdminBadge tone={item.status === 'APPROVED' ? 'green' : 'red'}>{item.status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'}</AdminBadge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination {...query.data} onPageChange={setPage} />
          </>
        )}
      </section>

      {selected && (
        <ProviderApplicationModal
          application={selected}
          isWorking={approve.isPending || reject.isPending}
          onClose={() => setSelected(undefined)}
          onApprove={() => approve.mutate(selected._id)}
          onReject={() => rejectApplication(selected)}
        />
      )}
    </div>
  )
}

function ProviderApplicationModal({ application, isWorking, onClose, onApprove, onReject }: {
  application: ProviderApplication
  isWorking: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="provider-modal-title" onMouseDown={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white bg-gradient-to-br from-white via-blue-50/45 to-slate-50 shadow-2xl shadow-slate-950/20">
        <header className="relative overflow-hidden border-b border-blue-100 px-6 py-6 sm:px-8">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-200/45 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xl font-black text-white shadow-lg shadow-blue-200">
                {application.fullName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Đơn đăng ký Provider</p>
                <h2 id="provider-modal-title" className="mt-1 truncate text-2xl font-extrabold text-slate-900">{application.fullName}</h2>
                <div className="mt-2"><AdminBadge tone={application.status === 'APPROVED' ? 'green' : application.status === 'REJECTED' ? 'red' : 'amber'}>{application.status === 'APPROVED' ? 'Đã duyệt' : application.status === 'REJECTED' ? 'Đã từ chối' : 'Đang chờ duyệt'}</AdminBadge></div>
              </div>
            </div>
            <button onClick={onClose} className="rounded-xl bg-white p-2.5 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Đóng"><X size={20} /></button>
          </div>
        </header>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail icon={Phone} label="Số điện thoại" value={application.phone} />
            <Detail icon={Mail} label="Email tài khoản" value={application.userId?.email || 'Chưa cập nhật'} />
            <Detail icon={MapPin} label="Khu vực hoạt động" value={application.serviceArea} />
            <Detail icon={CalendarDays} label="Ngày gửi hồ sơ" value={new Date(application.createdAt).toLocaleString('vi-VN')} />
            <Detail icon={BriefcaseBusiness} label="Kinh nghiệm" value={application.experience} />
            <Detail icon={ShieldCheck} label="CCCD/CMND" value={application.idCard || 'Chưa cập nhật'} />
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><UserRound size={17} className="text-blue-600" />Chuyên môn đăng ký</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {application.specialties.length ? application.specialties.map((specialty) => <span key={specialty._id} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 ring-1 ring-blue-100">{specialty.name}</span>) : <span className="text-sm text-slate-500">Chưa chọn chuyên môn.</span>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><FileText size={17} className="text-blue-600" />Giới thiệu và động lực</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{application.motivation || 'Ứng viên chưa cung cấp nội dung giới thiệu.'}</p>
          </div>

          {application.rejectionReason && <div className="rounded-2xl border border-red-100 bg-red-50 p-5"><p className="text-sm font-extrabold text-red-800">Lý do từ chối</p><p className="mt-2 text-sm text-red-700">{application.rejectionReason}</p></div>}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-blue-100 bg-white/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Đóng</button>
          {application.status === 'PENDING' && (
            <>
              <button disabled={isWorking} onClick={onReject} className="rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50">Từ chối</button>
              <button disabled={isWorking} onClick={onApprove} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50"><Check size={17} />Duyệt hồ sơ</button>
            </>
          )}
        </footer>
      </section>
    </div>
  )
}

function Detail({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400"><Icon size={15} className="text-blue-500" />{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-slate-800">{value}</p>
    </div>
  )
}
