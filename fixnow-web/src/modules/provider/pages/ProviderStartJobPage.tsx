import { Camera, CheckCircle2, Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppButton } from '../../../shared/components/AppButton'
import { AppSkeleton, ErrorState } from '../../../shared/components/PageStates'
import { ProviderCard, ProviderPageHeader } from '../components/ProviderPageHeader'
import { useProviderJob } from '../hooks/useProvider'

export function ProviderStartJobPage() {
  const navigate = useNavigate()
  const { jobId = '' } = useParams()
  const query = useProviderJob(jobId)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [isRunning])
  if (query.isLoading) return <div className="p-6"><AppSkeleton /></div>
  if (query.isError || !query.data) return <div className="p-6"><ErrorState /></div>
  if (query.data.status !== 'IN_PROGRESS') {
    return <div className="mx-auto max-w-xl p-6"><ErrorState message="Đơn việc chưa ở trạng thái đang thực hiện." /></div>
  }
  const time = new Date(seconds * 1000).toISOString().slice(11, 19)
  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
    <ProviderPageHeader title="Đang thực hiện công việc" description={`${query.data.title || query.data.categoryId?.name || 'Dịch vụ'} · ${query.data.customerId?.fullName}`} />
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <ProviderCard className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-cyan-500 p-8 text-white">
          <p className="flex gap-2 text-sm"><Clock3 size={18} /> Thời gian theo dõi trên thiết bị</p>
          <p className="mt-4 font-mono text-5xl font-black">{time}</p>
        </div>
        <div className="flex gap-3 p-5">
          <AppButton variant="outline" className="flex-1" onClick={() => setIsRunning((value) => !value)}>{isRunning ? 'Tạm dừng bộ đếm' : 'Tiếp tục bộ đếm'}</AppButton>
          <AppButton className="flex-1" onClick={() => navigate(`/provider/jobs/${jobId}/complete`)}>Hoàn tất</AppButton>
        </div>
      </ProviderCard>
      <div className="space-y-4">
        <ProviderCard className="p-5"><p className="flex gap-2 text-sm font-semibold text-green-700"><CheckCircle2 size={18} /> FixNow đã ghi nhận công việc bắt đầu.</p></ProviderCard>
        <ProviderCard className="p-5"><Camera className="text-blue-600" /><p className="mt-3 text-sm text-slate-600">Ảnh minh chứng được tải lên ở bước hoàn tất và lưu cùng đơn việc.</p></ProviderCard>
      </div>
    </div>
  </div>
}
