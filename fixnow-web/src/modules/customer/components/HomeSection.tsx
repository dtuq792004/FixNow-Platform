import type { ReactNode } from 'react'

export function HomeSection({
  title,
  action,
  children,
  className = '',
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
