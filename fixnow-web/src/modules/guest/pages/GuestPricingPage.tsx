import { BadgeCheck, Banknote, ChevronRight, Info, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GuestPageLayout } from '../components/GuestPageLayout'

const featuredServices = [
  ['Vệ sinh điều hòa dưới 2HP', '179.000 VNĐ'],
  ['Vệ sinh điều hòa từ 2HP trở lên', '189.000 VNĐ'],
  ['Vệ sinh máy giặt cửa trên dưới 9kg', '269.000 VNĐ'],
  ['Vệ sinh máy giặt cửa trước dưới 9kg', '449.000 VNĐ'],
  ['Vệ sinh tủ lạnh dưới 200 lít', '429.000 VNĐ'],
  ['Vệ sinh sofa nỉ/vải (1 ghế)', '299.000 VNĐ'],
  ['Vệ sinh nệm dưới 1,5m', '279.000 VNĐ'],
  ['Thông tắc bồn cầu', '450.000 VNĐ'],
  ['Thông tắc cống', '550.000 VNĐ'],
]

const categoryPrices = [
  ['Điện dân dụng', '149.000 VNĐ'],
  ['Nước dân dụng', '149.000 VNĐ'],
  ['Máy lạnh', '179.000 VNĐ'],
  ['Sơn sửa nhà', '199.000 VNĐ'],
  ['Gia dụng', '199.000 VNĐ'],
  ['Camera', '299.000 VNĐ'],
]

export function GuestPricingPage() {
  return (
    <GuestPageLayout>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-600 text-white">
        <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="relative mx-auto grid min-h-[390px] max-w-container-max items-center gap-xl px-lg py-xxl lg:grid-cols-[1fr_380px]">
          <div className="max-w-3xl">
            <span className="mb-md inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Sparkles size={17} />
              Minh bạch chi phí, chủ động lựa chọn
            </span>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Giá tham khảo dịch vụ tại nhà
            </h1>
            <p className="mt-lg max-w-2xl text-base leading-7 text-blue-50 sm:text-lg">
              Tham khảo mức giá phổ biến trên FIXNOW trước khi đặt lịch. Chi phí thực tế
              được xác nhận rõ ràng theo tình trạng và khối lượng công việc.
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-xl shadow-2xl backdrop-blur-md">
            <div className="mb-lg flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-lg">
              <Banknote size={30} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">Giá dịch vụ từ</p>
            <p className="mt-sm text-4xl font-extrabold">149.000 VNĐ</p>
            <div className="mt-lg flex items-center gap-2 text-sm text-blue-50">
              <BadgeCheck size={18} className="shrink-0 text-cyan-300" />
              Báo giá trước khi thực hiện
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-container-max px-lg py-xxl">
        <section>
          <div className="mb-xl">
            <span className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Dịch vụ phổ biến</span>
            <h2 className="mt-sm text-3xl font-bold text-on-background">Bảng giá dịch vụ tham khảo</h2>
            <p className="mt-sm text-on-surface-variant">Các mức giá được trình bày theo từng hạng mục cụ thể để bạn dễ so sánh.</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-outline-variant bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
            <div className="hidden grid-cols-[1fr_220px] bg-gradient-to-r from-blue-700 to-blue-600 px-xl py-md text-sm font-bold uppercase tracking-wider text-white sm:grid">
              <span>Dịch vụ</span>
              <span className="text-right">Giá</span>
            </div>
            <div className="divide-y divide-slate-100">
              {featuredServices.map(([service, price], index) => (
                <div
                  key={service}
                  className="group grid gap-sm px-lg py-lg transition-colors hover:bg-blue-50/70 sm:grid-cols-[1fr_220px] sm:items-center sm:px-xl"
                >
                  <div className="flex items-start gap-md">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-extrabold text-blue-700 group-hover:bg-blue-100">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="pt-1.5 font-semibold text-slate-800">{service}</span>
                  </div>
                  <div className="pl-[52px] sm:pl-0 sm:text-right">
                    <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 font-extrabold text-emerald-700">
                      {price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-xxl">
          <div className="mb-xl">
            <span className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Theo danh mục</span>
            <h2 className="mt-sm text-3xl font-bold text-on-background">Mức giá khởi điểm</h2>
          </div>
          <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-3">
            {categoryPrices.map(([category, price]) => (
              <article
                key={category}
                className="group relative overflow-hidden rounded-2xl border border-outline-variant bg-white p-xl transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-blue-50 transition group-hover:bg-blue-100" />
                <div className="relative">
                  <p className="text-sm font-semibold text-on-surface-variant">Giá từ</p>
                  <p className="mt-xs text-2xl font-extrabold text-primary">{price}</p>
                  <div className="mt-xl flex items-center justify-between border-t border-slate-100 pt-lg">
                    <h3 className="text-lg font-bold text-slate-800">{category}</h3>
                    <ChevronRight size={21} className="text-blue-500 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-xxl flex flex-col gap-lg rounded-3xl bg-slate-900 px-xl py-xl text-white sm:flex-row sm:items-center sm:justify-between sm:px-xxl">
          <div className="flex max-w-2xl items-start gap-md">
            <Info className="mt-1 shrink-0 text-cyan-300" size={22} />
            <div>
              <h2 className="text-xl font-bold">Lưu ý về giá dịch vụ</h2>
              <p className="mt-sm leading-6 text-slate-300">
                Đây là bảng giá tham khảo. Giá cuối cùng có thể thay đổi tùy thiết bị, mức độ hư hỏng,
                vật tư và phạm vi công việc. Kỹ thuật viên sẽ trao đổi chi phí trước khi thực hiện.
              </p>
            </div>
          </div>
          <Link
            to="/auth/login"
            state={{ redirectTo: '/customer/request/new' }}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-xl py-md font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Đặt dịch vụ ngay
          </Link>
        </div>
      </div>
    </GuestPageLayout>
  )
}
