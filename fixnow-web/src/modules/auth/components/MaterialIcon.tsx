import type { CSSProperties } from 'react'

interface MaterialIconProps {
  children: string
  className?: string
  filled?: boolean
}

export function MaterialIcon({
  children,
  className = '',
  filled = false,
}: MaterialIconProps) {
  const style: CSSProperties | undefined = filled
    ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
    : undefined

  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {children}
    </span>
  )
}
