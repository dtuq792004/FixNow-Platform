import { Link } from 'react-router-dom'

export function LandingFooter() {
  return (
    <footer className="border-t border-blue-800 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="mx-auto grid w-full max-w-container-max gap-6 px-4 py-8 text-center sm:px-6 md:grid-cols-[1fr_auto] md:text-left lg:grid-cols-[1fr_2fr_auto] lg:items-center lg:px-gutter">
        <div className="flex flex-col items-center gap-sm md:items-start">
          <Link className="text-headline-md font-extrabold tracking-tight text-blue-300" to="/">
            FIXNOW
          </Link>
          <p className="text-center text-body-md text-blue-100/70 md:text-left">
            © 2026 FIXNOW - Dịch vụ sửa chữa nhà cửa chuyên nghiệp
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-3 md:justify-end lg:justify-center" aria-label="Điều hướng chân trang">
          <Link className="text-body-md text-blue-100/80 transition-colors hover:text-white" to="/about">Về chúng tôi</Link>
          <span className="cursor-pointer text-body-md text-blue-100/80 transition-colors hover:text-white">Điều khoản sử dụng</span>
          <span className="cursor-pointer text-body-md text-blue-100/80 transition-colors hover:text-white">Chính sách bảo mật</span>
          <Link className="text-body-md font-bold text-blue-300 hover:text-white" to="/support">Liên hệ hỗ trợ: 1900 1234</Link>
        </nav>

        <div className="flex justify-center gap-md text-blue-100 md:col-span-2 lg:col-span-1">
          <SocialIcon type="facebook" />
          <SocialIcon type="youtube" />
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ type }: { type: 'facebook' | 'youtube' }) {
  return (
    <a className="rounded-lg p-xs transition-colors hover:bg-white/10 hover:text-white" href="#" aria-label={type}>
      {type === 'facebook' ? (
        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ) : (
        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )}
    </a>
  )
}
