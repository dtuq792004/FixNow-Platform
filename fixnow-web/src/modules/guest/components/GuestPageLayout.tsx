import type { ReactNode } from 'react'
import { LandingFooter } from './LandingFooter'
import { LandingNavbar } from './LandingNavbar'

export function GuestPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background">
      <LandingNavbar />
      <main className="flex-grow">{children}</main>
      <LandingFooter />
    </div>
  )
}
