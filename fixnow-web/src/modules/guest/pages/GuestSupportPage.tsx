import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GuestPageLayout } from '../components/GuestPageLayout'

const supportSchema = z.object({ name: z.string().min(2, 'Vui lòng nhập họ tên'), email: z.email('Email không hợp lệ'), issue: z.string().min(1), message: z.string().min(10, 'Nội dung cần ít nhất 10 ký tự') })
type SupportForm = z.infer<typeof supportSchema>
const faqs = [
  ['Làm thế nào để tôi thay đổi thời gian cuộc hẹn?', 'Bạn có thể thay đổi thời gian ít nhất 4 giờ trước khi dịch vụ bắt đầu trong mục Lịch hẹn của tôi.'],
  ['Chính sách hoàn tiền của FIXNOW như thế nào?', 'Yêu cầu hoàn tiền được FIXNOW tiếp nhận và xử lý theo tình trạng thực tế của đơn dịch vụ.'],
  ['Kỹ thuật viên của FIXNOW có được đào tạo chuyên môn không?', 'Đối tác cần trải qua quy trình xác minh thông tin và đánh giá chuyên môn trước khi nhận việc.'],
  ['Tôi có thể thanh toán bằng tiền mặt không?', 'FIXNOW hỗ trợ tiền mặt, ví điện tử và thẻ ngân hàng sau khi hoàn thành công việc.'],
]

export function GuestSupportPage() {
  const [chatOpen, setChatOpen] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SupportForm>({ resolver: zodResolver(supportSchema), defaultValues: { name: '', email: '', issue: 'Vấn đề về đơn hàng', message: '' } })
  const submit = async () => { await Promise.resolve(); reset() }
  return (
    <GuestPageLayout>
      <section className="bg-surface-container-low py-xxl text-center"><div className="mx-auto max-w-container-max px-lg"><h1 className="mb-md text-headline-lg font-bold md:text-display-lg">Chào bạn, chúng tôi có thể giúp gì?</h1><p className="mx-auto mb-xl max-w-2xl text-body-lg text-on-surface-variant">Tìm kiếm câu trả lời nhanh chóng hoặc liên hệ trực tiếp với đội ngũ hỗ trợ FIXNOW.</p><div className="relative mx-auto max-w-xl"><span className="material-symbols-outlined absolute top-1/2 left-md -translate-y-1/2 text-primary">search</span><input className="w-full rounded-xl border-2 border-outline-variant py-md pr-lg pl-12 shadow-sm focus:border-primary" placeholder="Mô tả vấn đề bạn đang gặp phải..." /></div></div></section>
      <section className="mx-auto grid max-w-container-max gap-xl px-lg py-xxl md:grid-cols-12">
        <div className="md:col-span-8"><div className="mb-xl"><h2 className="text-headline-md font-semibold">Câu hỏi thường gặp</h2></div><div className="space-y-md">{faqs.map(([question, answer]) => <details className="group overflow-hidden rounded-xl border border-outline-variant bg-white hover:shadow-md" key={question}><summary className="flex cursor-pointer list-none items-center justify-between p-lg"><span className="text-title-lg font-semibold">{question}</span><span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span></summary><div className="border-t border-outline-variant px-lg pt-md pb-lg text-on-surface-variant">{answer}</div></details>)}</div>
          <div className="mt-xxl rounded-2xl border border-outline-variant bg-surface-container-low p-xl"><h3 className="text-headline-md font-semibold">Gửi yêu cầu hỗ trợ</h3><p className="mb-lg text-on-surface-variant">Nếu không tìm thấy câu trả lời, hãy để lại lời nhắn cho chúng tôi.</p><form className="grid gap-md md:grid-cols-2" onSubmit={handleSubmit(submit)}><Field label="Họ và tên" error={errors.name?.message}><input className="guest-input" placeholder="Nguyễn Văn A" {...register('name')} /></Field><Field label="Email" error={errors.email?.message}><input className="guest-input" placeholder="example@gmail.com" type="email" {...register('email')} /></Field><label className="space-y-xs md:col-span-2"><span className="text-label-md">Loại vấn đề</span><select className="guest-input" {...register('issue')}><option>Vấn đề về đơn hàng</option><option>Khiếu nại kỹ thuật viên</option><option>Lỗi ứng dụng/Website</option><option>Hợp tác kinh doanh</option></select></label><Field label="Nội dung chi tiết" error={errors.message?.message} className="md:col-span-2"><textarea className="guest-input min-h-28" placeholder="Mô tả chi tiết vấn đề..." {...register('message')} /></Field><button className="rounded-xl bg-primary px-xxl py-md text-title-lg text-white disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu ngay'}</button></form></div>
        </div>
        <aside className="space-y-lg md:col-span-4"><div className="rounded-2xl bg-primary-container p-xl text-on-primary-container shadow-lg"><h3 className="mb-md text-headline-md font-semibold">Liên hệ tổng đài</h3><p className="mb-xl opacity-90">Đội ngũ FIXNOW sẵn sàng tiếp nhận và hỗ trợ các vấn đề của bạn.</p><a className="flex items-center gap-md rounded-xl bg-on-primary-container p-md text-primary-container" href="tel:19001234"><span className="material-symbols-outlined text-3xl">call</span><div><small className="uppercase">Hotline hỗ trợ</small><div className="text-headline-md font-semibold">1900 1234</div></div></a></div><div className="rounded-2xl border border-outline-variant bg-white p-lg"><h4 className="mb-md text-title-lg font-semibold">Địa chỉ của chúng tôi</h4><div className="mb-md flex aspect-video items-center justify-center rounded-xl bg-primary-fixed"><span className="material-symbols-outlined text-[64px] text-primary">location_on</span></div><p className="text-on-surface-variant">Quận Ngũ Hành Sơn, Thành phố Đà Nẵng</p></div><div className="rounded-2xl border border-outline-variant bg-white p-lg text-center"><span className="material-symbols-outlined mb-sm text-[48px] text-primary">support_agent</span><h4 className="font-semibold">Đội ngũ hỗ trợ chuyên nghiệp</h4><p className="mt-xs text-on-surface-variant">Tiếp nhận yêu cầu và đồng hành cùng khách hàng trong quá trình sử dụng dịch vụ.</p></div></aside>
      </section>
      <div className="fixed right-lg bottom-lg z-40 flex flex-col items-end gap-md">{chatOpen && <div className="w-72 rounded-2xl border border-outline-variant bg-white p-md shadow-xl"><p className="mb-md text-label-md">● Hỗ trợ viên đang online</p><p className="mb-md text-on-surface-variant">Chào bạn! Tôi có thể giúp gì ngay bây giờ?</p><button className="w-full rounded-lg bg-primary py-sm text-white">Bắt đầu chat</button></div>}<button className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl" onClick={() => setChatOpen((open) => !open)}><span className="material-symbols-outlined text-3xl">{chatOpen ? 'close' : 'chat'}</span></button></div>
    </GuestPageLayout>
  )
}

function Field({ label, error, className = '', children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return <label className={`space-y-xs ${className}`}><span className="text-label-md">{label}</span>{children}{error && <span className="block text-label-sm text-error">{error}</span>}</label>
}
