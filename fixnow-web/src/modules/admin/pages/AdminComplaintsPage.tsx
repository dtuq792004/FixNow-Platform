import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { AdminBadge, AdminError, AdminLoading, AdminPageHeader } from '../components/AdminUi'
import { adminService } from '../services/adminService'
import type { AdminComplaint } from '../types/adminTypes'

const filters = [
  ['OPEN', 'Mới'],
  ['PROCESSING', 'Đang xử lý'],
  ['RESOLVED', 'Đã giải quyết'],
]

export function AdminComplaintsPage() {
  const [status, setStatus] = useState('OPEN')
  const [selectedId, setSelectedId] = useState<string>()
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['admin', 'complaints', status],
    queryFn: () => adminService.getComplaints({ page: 1, limit: 50, status }),
  })
  const selected: AdminComplaint | undefined = query.data?.items.find((item) => item._id === selectedId) ?? query.data?.items[0]
  const update = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: AdminComplaint['status'] }) => adminService.updateComplaintStatus(id, nextStatus),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'complaints'] }),
  })

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader title="Trung tâm khiếu nại" description="Đối chiếu nội dung và cập nhật trạng thái xử lý." />
      <div className="flex gap-2">
        {filters.map(([value, label]) => (
          <button
            key={value}
            onClick={() => { setStatus(value); setSelectedId(undefined) }}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${status === value ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {query.isLoading ? <AdminLoading /> : query.error || !query.data ? <AdminError /> : (
        <section className="grid min-h-[540px] overflow-hidden rounded-2xl border bg-white shadow-sm xl:grid-cols-[360px_1fr]">
          <div className="border-r">
            <div className="divide-y">
              {query.data.items.map((item) => (
                <button key={item._id} onClick={() => setSelectedId(item._id)} className={`w-full p-4 text-left ${selected?._id === item._id ? 'bg-blue-50' : ''}`}>
                  <p className="text-xs font-bold text-blue-600">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                  <p className="mt-1 font-bold">{item.requestId?.title || 'Khiếu nại dịch vụ'}</p>
                  <p className="line-clamp-2 text-sm text-slate-500">{item.content}</p>
                </button>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="p-7">
              <div className="flex justify-between border-b pb-5">
                <div>
                  <h2 className="text-xl font-bold">{selected.requestId?.title || 'Khiếu nại dịch vụ'}</h2>
                  <p className="text-sm text-slate-500">{new Date(selected.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <AdminBadge tone={selected.status === 'RESOLVED' ? 'green' : 'amber'}>{selected.status}</AdminBadge>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4"><p className="text-xs text-slate-500">Khách hàng</p><p className="font-bold">{selected.customerId?.fullName}</p></div>
                <div className="rounded-xl border p-4"><p className="text-xs text-slate-500">Provider</p><p className="font-bold">{selected.providerId?.fullName}</p></div>
              </div>
              <div className="mt-5 rounded-xl bg-slate-50 p-5"><p className="font-bold">Nội dung</p><p className="mt-2 text-slate-600">{selected.content}</p></div>
              <div className="mt-6 flex gap-3">
                {selected.status === 'OPEN' && <button onClick={() => update.mutate({ id: selected._id, nextStatus: 'PROCESSING' })} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-bold text-white"><Clock3 size={18} />Tiếp nhận</button>}
                {selected.status !== 'RESOLVED' && <button onClick={() => update.mutate({ id: selected._id, nextStatus: 'RESOLVED' })} className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 font-bold text-white"><CheckCircle2 size={18} />Đánh dấu đã giải quyết</button>}
              </div>
            </div>
          ) : <div className="p-10 text-slate-500">Không có khiếu nại.</div>}
        </section>
      )}
    </div>
  )
}
