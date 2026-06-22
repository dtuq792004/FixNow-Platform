import { Link, useNavigate } from 'react-router-dom'
import { LandingFooter } from '../components/LandingFooter'
import { LandingNavbar } from '../components/LandingNavbar'

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDMapYLhCX3SjaK6lw5dpMP6F3aqXmZJ_yHTF2gQCYR9DhNCaUtgbzBcUXK-5BlDMajFgQzidYRe7Kxt15ps6mFjrpPMKUtkO2w8KGicCu7yqgjgPyHOPz9clWWsivJrGuzStRkikHhUA8UaIN7JVmqKC_b-S-uPaTKtgtIfNb_tndbJ5Pw4Q_dQITvPBxQeSm5rgE-_7_MLbwy_geAFMC23xz6WdSpREZ6b1QieP6Y8VS2J1FwoFJU9mVHMmeaQWuwGQySOnaP0_U'

const services = [
  ['bolt', 'Điện', 'Sửa điện, lắp đèn', 'bg-primary-fixed', 'text-primary'],
  ['water_drop', 'Nước', 'Ống nước, vòi sen', 'bg-secondary-fixed', 'text-secondary'],
  ['ac_unit', 'Máy lạnh', 'Vệ sinh, sửa chữa', 'bg-tertiary-fixed', 'text-tertiary'],
  ['format_paint', 'Sơn sửa', 'Tường, chống thấm', 'bg-primary-fixed', 'text-primary'],
  ['kitchen', 'Gia dụng', 'Máy giặt, tủ lạnh', 'bg-secondary-fixed', 'text-secondary'],
  ['videocam', 'Camera', 'Lắp đặt, bảo trì', 'bg-tertiary-fixed', 'text-tertiary'],
]

const benefits = [
  ['verified_user', 'Thợ chuyên nghiệp', 'Đội ngũ thợ được tuyển chọn kỹ lưỡng và đào tạo bài bản.'],
  ['payments', 'Giá cả minh bạch', 'Báo giá rõ ràng trước khi làm, không phát sinh chi phí.'],
  ['speed', 'Phản hồi nhanh chóng', 'Tiếp nhận và điều phối yêu cầu dịch vụ thuận tiện.'],
  ['handyman', 'Bảo hành dài hạn', 'An tâm với chính sách bảo hành uy tín cho mọi dịch vụ.'],
]

const processSteps = [
  ['01', 'Gửi yêu cầu', 'Mô tả vấn đề bạn đang gặp phải qua ứng dụng hoặc website FixNow.', 'bg-primary-container'],
  ['02', 'Kết nối thợ', 'Chúng tôi sẽ điều phối thợ gần nhất đến kiểm tra và báo giá.', 'bg-secondary-container'],
  ['03', 'Sửa & Thanh toán', 'Thợ tiến hành sửa chữa. Bạn hài lòng mới tiến hành thanh toán.', 'bg-tertiary-container'],
]

const emergencyServices = [
  ['bolt', 'Sửa điện chập cháy', 'Xử lý sự cố điện nhanh chóng, an toàn.'],
  ['water_damage', 'Sửa ống nước vỡ', 'Ngăn chặn tình trạng ngập nước trong nhà ngay lập tức.'],
  ['lock_open', 'Mở khóa khẩn cấp', 'Hỗ trợ khi bạn bị kẹt cửa hoặc mất chìa khóa.'],
]

function MaterialIcon({ children, className = '' }: { children: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

export function LandingPage() {
  const navigate = useNavigate()
  const book = () => navigate('/auth/login', {
    state: { redirectTo: '/customer/request/new' },
  })

  return (
    <div className="landing-page pb-16 text-on-surface md:pb-0">
      <LandingNavbar />

      <main>
        <section className="relative flex min-h-[520px] items-center overflow-hidden sm:min-h-[600px]">
          <div className="absolute inset-0 z-0">
            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${heroImage}")` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-container-max px-4 py-12 sm:px-6 sm:py-16 lg:px-gutter">
            <div className="max-w-2xl">
              <h1 className="mb-md text-4xl font-bold leading-tight text-on-background sm:text-5xl lg:text-display-lg">Giải pháp sửa chữa nhà cửa toàn diện, tin cậy</h1>
              <p className="mb-xl text-body-lg text-on-surface-variant">Kết nối ngay với đội ngũ kỹ thuật viên chuyên nghiệp, sẵn sàng hỗ trợ 24/7 cho mọi nhu cầu sửa chữa của bạn.</p>
              <div className="flex max-w-xl flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-sm shadow-lg md:flex-row">
                <div className="flex flex-1 items-center gap-xs border-b border-outline-variant px-sm py-xs md:border-r md:border-b-0">
                  <MaterialIcon className="text-primary">search</MaterialIcon>
                  <input className="w-full border-none bg-transparent text-body-md outline-none" placeholder="Bạn cần sửa gì hôm nay?" />
                </div>
                <button onClick={book} className="rounded-lg bg-header-gradient px-xl py-md text-title-lg text-white transition-all hover:opacity-90 active:scale-95 shadow-md">Đặt lịch ngay</button>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-xxl">
          <div className="mx-auto max-w-container-max px-gutter">
            <div className="mb-xl flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
              <div><h2 className="mb-xs text-headline-lg text-on-surface">Dịch vụ phổ biến</h2><p className="text-body-md text-on-surface-variant">Mọi giải pháp cho ngôi nhà của bạn chỉ trong vài lần chạm</p></div>
              <a className="flex items-center text-label-md text-primary hover:underline" href="#">Tất cả dịch vụ <MaterialIcon className="ml-xs text-[18px]">arrow_forward</MaterialIcon></a>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-md md:grid-cols-3 lg:grid-cols-6">
              {services.map(([icon, title, description, background, color]) => (
                <div key={title} onClick={book} className="group cursor-pointer rounded-2xl border border-outline-variant bg-white p-4 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl sm:p-lg">
                  <div className={`mx-auto mb-md flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${background}`}><MaterialIcon className={`text-[32px] ${color}`}>{icon}</MaterialIcon></div>
                  <h3 className="mb-xs text-base font-semibold text-on-surface sm:text-title-lg">{title}</h3><p className="mb-2 text-label-sm text-on-surface-variant sm:mb-md">{description}</p><span className="hidden text-label-sm text-primary transition-opacity group-hover:opacity-100 sm:inline sm:opacity-0">Xem thêm</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-xxl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-50/30 -z-10" />
          <div className="mx-auto mb-xl max-w-container-max px-gutter text-center"><h2 className="mb-xs text-headline-lg text-on-surface">Tại sao chọn FixNow?</h2><p className="text-body-md text-on-surface-variant">Chúng tôi cam kết mang lại trải nghiệm dịch vụ tốt nhất</p></div>
          <div className="mx-auto grid max-w-container-max grid-cols-1 gap-lg px-gutter md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(([icon, title, text]) => <div key={title} className="flex flex-col items-center rounded-2xl border border-outline-variant bg-white p-lg text-center shadow-sm"><MaterialIcon className="mb-md text-[48px] text-primary">{icon}</MaterialIcon><h4 className="mb-sm text-title-lg text-on-surface">{title}</h4><p className="text-body-md text-on-surface-variant">{text}</p></div>)}
          </div>
        </section>

        <section id="process" className="py-xxl">
          <div className="mx-auto max-w-container-max px-gutter">
            <h2 className="mb-xl text-center text-headline-lg text-on-surface">Quy trình đơn giản</h2>
            <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
              {processSteps.map(([number, title, text, background]) => <div key={number} className={`group relative overflow-hidden rounded-3xl p-xl ${background}`}><div className="relative z-10"><span className="absolute -top-8 -left-4 text-[64px] font-black text-white/20">{number}</span><h3 className="mb-md text-headline-md text-white">{title}</h3><p className="text-body-md text-white/80">{text}</p></div><div className="absolute right-0 bottom-0 h-32 w-32 rounded-tl-full bg-white/10 transition-all group-hover:scale-150" /></div>)}
            </div>
          </div>
        </section>

        <section id="support" className="bg-slate-50/50 py-xxl">
          <div className="mx-auto max-w-container-max px-gutter">
            <div className="mb-xl flex flex-col items-center justify-between gap-md md:flex-row">
              <div className="text-center md:text-left"><div className="mb-xs flex items-center justify-center gap-sm md:justify-start"><MaterialIcon className="animate-pulse text-error">emergency</MaterialIcon><h2 className="text-headline-lg text-on-surface">Dịch vụ khẩn cấp 24/7</h2></div><p className="text-body-md text-on-surface-variant">Chúng tôi luôn sẵn sàng hỗ trợ bạn trong mọi tình huống khẩn cấp, kể cả ban đêm và ngày lễ.</p></div>
              <button className="flex items-center gap-sm rounded-full bg-error px-xl py-md text-title-lg text-white transition-all hover:opacity-90 active:scale-95"><MaterialIcon>call</MaterialIcon>Hotline: 1900 1234</button>
            </div>
            <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
              {emergencyServices.map(([icon, title, text]) => <div key={title} className="flex flex-col rounded-2xl border border-outline-variant bg-white p-lg shadow-sm border-t-4 border-t-red-500"><div className="mb-md flex h-12 w-12 items-center justify-center rounded-full bg-red-50"><MaterialIcon className="text-red-500">{icon}</MaterialIcon></div><h4 className="mb-sm text-title-lg text-on-surface">{title}</h4><p className="mb-xl flex-1 text-body-md text-on-surface-variant">{text}</p><button onClick={book} className="w-full rounded-lg border border-red-500 py-sm text-label-md text-red-500 transition-colors hover:bg-red-500 hover:text-white">Yêu cầu ngay</button></div>)}
            </div>
          </div>
        </section>

        <section id="blog" className="py-xxl">
          <div className="mx-auto max-w-container-max px-gutter">
            <div className="grid grid-cols-1 gap-xl">
              <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
                <Testimonial image="https://lh3.googleusercontent.com/aida-public/AB6AXuC9KaY1SnapWmPVcnrXNtx5G5jJtp3e36H8gS_WZcjC7d_4VRxTQYACx-xM5U7foDZxr-8O3hPvQKMC-Kzqrrf_ZWC4MgKTgWenS2t2QT-aYMqHsPHUpbAglkSNOvko9m1hWb5KZHURpulwSgvssS6P50PEGAZcH7iaun9aZuOpCLTrQ0xo8fsgJZfqVd1TbeRsK_WHL5Gh2BWXVmN0qqSexR0eWX37cFIyc_2QaEyn4_PIT3RZh06tLkXDxzXXI9AC3lVc7iNzscY" name="Chị Lan Anh" location="Quận 7, TP.HCM">“Dịch vụ cực kỳ nhanh. Thợ đến sau đúng 20 phút, sửa ống nước rò rỉ rất chuyên nghiệp. Giá cả lại rất hợp lý!”</Testimonial>
                <Testimonial image="https://lh3.googleusercontent.com/aida-public/AB6AXuDprs56AHYpbXuWqKZf9w7DCCmYZM3onYYfqYSZqkbs05MzXwbigJZwEXjb2h-DHPvDdSDo9Xv9ZBUvNvBSnLxotaOAC_jn7ulL0R-s8_H0wtIqYi48abb_oG4aqMMEda3gzR0Vf1UbElnWgW_FiuBx_Ue2py9-oY_c6ueQvzJrOLiXtKmgoQZgcweDQpNcxwH1FTNeqA6YItqyeD6BOEEgwpE2MH0jC6AVDHoeItCr5dYAe0ou9t2__Qz_TwSy1aPkxRu1EaogEAY" name="Anh Minh Đức" location="Quận Hoàn Kiếm, Hà Nội">“Lần đầu tiên thấy một app sửa chữa tiện lợi như vậy. Thợ sửa máy lạnh rất kỹ, có cả hóa đơn điện tử gửi về mail.”</Testimonial>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-bright py-xxl">
          <div className="relative mx-4 flex max-w-container-max flex-col items-center gap-xl overflow-hidden rounded-3xl bg-header-gradient p-6 shadow-2xl sm:mx-6 sm:p-8 lg:mx-auto lg:flex-row lg:rounded-[40px] lg:p-xxl">
            <div className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"><svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%"><path d="M0 100 C 20 0 50 0 100 100" fill="none" stroke="white" strokeWidth=".5" /><path d="M0 80 C 20 -20 50 -20 100 80" fill="none" stroke="white" strokeWidth=".5" /></svg></div>
            <div className="z-10 text-center lg:w-1/2 lg:text-left"><h2 className="mb-md text-headline-lg font-bold text-white">Trải nghiệm FixNow trên điện thoại</h2><p className="mb-xl text-body-lg text-white/80">Đặt lịch sửa chữa mọi lúc mọi nơi, theo dõi hành trình thợ và nhận ưu đãi độc quyền hàng ngày.</p><div className="flex flex-wrap justify-center gap-md lg:justify-start"><StoreButton icon="smartphone" store="App Store" /><StoreButton icon="shop" store="Google Play" /></div></div>
            <div className="relative z-10 lg:w-1/2"><div className="relative mx-auto w-full max-w-[300px]"><div className="relative rounded-[3rem] border-[8px] border-on-background bg-on-background p-sm shadow-2xl"><div className="aspect-[9/19.5] w-full rounded-[2.5rem] bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCakHS4FcZfO508IJ81GEDUv6Nd-p5N-nXtMFwVWCq0w3XVg-ev1981ZKeMZ7IpMLL7EaWYs8SiWmwFLH1Smrnc0Zc0RUsRyR2kSghGuSvT1w94grHurmCwGXAh1M5CYmAWCyAyGzorHu_7g5Zfd3icGvgQs7NigiWq_p-_oQLTGHGQNj376FGKaaY3fbdKBjMnUd14snyGnkBn88BWbZXvPJozh3-2t5QGJB52jhtyi34B9DNv5RHpwc8WBWgCpargz1FEVjTxAfE")' }} /><div className="absolute top-0 left-1/2 h-6 w-1/3 -translate-x-1/2 rounded-b-2xl bg-on-background" /></div><div className="absolute top-1/4 -right-8 animate-bounce rounded-xl border border-outline-variant bg-white p-sm shadow-lg"><MaterialIcon className="text-tertiary">check_circle</MaterialIcon></div><div className="absolute bottom-1/4 -left-12 flex items-center gap-sm rounded-2xl border border-outline-variant bg-white p-md shadow-xl"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary"><MaterialIcon className="text-[18px] text-white">bolt</MaterialIcon></div><span className="text-label-sm font-bold">Thợ đã đến!</span></div></div></div>
          </div>
        </section>
      </main>

      <LandingFooter />

      <div className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-t border-outline-variant bg-surface-container-lowest px-lg py-xs md:hidden">
        <a className="flex flex-col items-center gap-xs text-primary" href="#">
          <MaterialIcon className="filled-icon">home</MaterialIcon>
          <span className="text-[10px] font-bold">Trang chủ</span>
        </a>
        <a className="flex flex-col items-center gap-xs text-on-surface-variant" href="#services">
          <MaterialIcon>grid_view</MaterialIcon>
          <span className="text-[10px]">Dịch vụ</span>
        </a>
        <Link className="flex flex-col items-center gap-xs text-on-surface-variant" to="/auth/login">
          <MaterialIcon>login</MaterialIcon>
          <span className="text-[10px]">Đăng nhập</span>
        </Link>
        <Link className="flex flex-col items-center gap-xs text-on-surface-variant" to="/auth/signup">
          <MaterialIcon>person_add</MaterialIcon>
          <span className="text-[10px]">Đăng ký</span>
        </Link>
      </div>
    </div>
  )
}

function Testimonial({ image, name, location, children }: { image: string; name: string; location: string; children: string }) {
  return <div className="rounded-2xl border border-outline-variant bg-white p-lg shadow-sm"><div className="mb-md flex items-center gap-md"><img className="h-12 w-12 rounded-full object-cover" src={image} alt={name} /><div><h4 className="text-title-lg text-on-surface">{name}</h4><p className="text-label-sm text-on-surface-variant">{location}</p></div></div><p className="text-body-md text-on-surface italic">{children}</p></div>
}

function StoreButton({ icon, store }: { icon: string; store: string }) {
  return <button className="flex items-center gap-md rounded-xl bg-on-background px-lg py-md text-white transition-all hover:opacity-90 active:scale-95"><MaterialIcon className="text-[32px]">{icon}</MaterialIcon><div className="text-left"><p className="text-[10px] uppercase opacity-60">Tải về trên</p><p className="text-body-md leading-none font-bold">{store}</p></div></button>
}
