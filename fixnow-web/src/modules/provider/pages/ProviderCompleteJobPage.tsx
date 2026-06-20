import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, CheckCircle2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { AppButton } from '../../../shared/components/AppButton'
import { ErrorState } from '../../../shared/components/PageStates'
import { ProviderCard, ProviderPageHeader } from '../components/ProviderPageHeader'
import { providerKeys, useProviderJob } from '../hooks/useProvider'
import { providerService } from '../services/providerService'

const schema = z.object({ note: z.string().trim().min(20, 'Ghi chú cần ít nhất 20 ký tự') })
type FormData = z.infer<typeof schema>

export function ProviderCompleteJobPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { jobId = '' } = useParams()
  const jobQuery = useProviderJob(jobId)
  const [files, setFiles] = useState<File[]>([])
  const [submitted, setSubmitted] = useState(false)
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { note: '' } })
  const mutation = useMutation({
    mutationFn: async ({ note }: FormData) => {
      const urls = await Promise.all(files.map(providerService.uploadJobImage))
      return providerService.completeJob(jobId, note, urls)
    },
    onSuccess: (job) => {
      queryClient.setQueryData(providerKeys.job(jobId), job)
      queryClient.invalidateQueries({ queryKey: providerKeys.jobs })
      queryClient.invalidateQueries({ queryKey: providerKeys.wallet })
      setSubmitted(true)
    },
  })
  if (jobQuery.data && jobQuery.data.status !== 'IN_PROGRESS' && !submitted) {
    return <div className="mx-auto max-w-xl p-6"><ErrorState message="Chỉ có thể hoàn tất đơn đang thực hiện." /></div>
  }
  if (submitted) return <div className="mx-auto max-w-xl p-6 text-center"><ProviderCard className="p-8"><CheckCircle2 size={48} className="mx-auto text-green-600" /><h1 className="mt-4 text-2xl font-bold">Công việc đã hoàn tất</h1><AppButton className="mt-6 w-full" onClick={() => navigate('/provider/dashboard')}>Quay lại tổng quan</AppButton></ProviderCard></div>

  return <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
    <ProviderPageHeader title="Hoàn thành công việc" description="Ảnh và ghi chú sẽ được lưu trực tiếp vào đơn việc." />
    <ProviderCard className="p-5">
      <h2 className="text-lg font-bold">Minh chứng công việc</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-500">
          <Camera /><span className="mt-2 text-xs">Chọn ảnh</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => setFiles((items) => [...items, ...Array.from(event.target.files ?? [])])} />
        </label>
        {files.map((file, index) => <div key={`${file.name}-${index}`} className="relative"><img src={URL.createObjectURL(file)} alt={file.name} className="aspect-square w-full rounded-xl object-cover" /><button type="button" onClick={() => setFiles((items) => items.filter((_, i) => i !== index))} className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600"><Trash2 size={16} /></button></div>)}
      </div>
    </ProviderCard>
    <ProviderCard className="p-5">
      <label htmlFor="note" className="font-bold">Ghi chú hoàn tất</label>
      <textarea id="note" rows={6} {...form.register('note')} className="profile-input mt-3 h-auto py-3" />
      {form.formState.errors.note && <p className="mt-2 text-sm text-red-600">{form.formState.errors.note.message}</p>}
      {mutation.isError && <p className="mt-2 text-sm text-red-600">{mutation.error.message}</p>}
      <AppButton type="submit" className="mt-5 w-full" disabled={mutation.isPending}>{mutation.isPending ? 'Đang tải ảnh và hoàn tất...' : 'Xác nhận hoàn tất'}</AppButton>
    </ProviderCard>
  </form>
}
