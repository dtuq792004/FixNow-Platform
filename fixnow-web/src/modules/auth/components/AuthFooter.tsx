import { Link } from 'react-router-dom'

export function AuthFooter() {
  return (
    <footer className="auth-footer fixed bottom-0 left-0 z-10 flex w-full flex-col items-center gap-xs px-4 pb-lg text-center">
      <div className="flex flex-wrap justify-center gap-x-lg gap-y-xs rounded-full bg-white/75 px-4 py-2 text-label-sm text-slate-600 shadow-sm backdrop-blur">
        <Link className="transition-colors hover:text-primary" to="/privacy">
          Privacy Policy
        </Link>
        <Link className="transition-colors hover:text-primary" to="/terms">
          Terms of Service
        </Link>
        <Link className="transition-colors hover:text-primary" to="/support">
          Support
        </Link>
      </div>
      <span className="rounded-full bg-white/75 px-3 py-1 text-label-sm text-slate-600 backdrop-blur">
        © {new Date().getFullYear()} FIXNOW. All rights reserved.
      </span>
    </footer>
  )
}
