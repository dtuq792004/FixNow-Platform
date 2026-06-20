import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, HelpCircle, ShieldAlert, X } from 'lucide-react'
import { useConfirmStore, type ConfirmVariant } from '../store/confirmStore'
import './ConfirmModal.css'

const iconByVariant = {
  danger: ShieldAlert,
  warning: AlertTriangle,
  primary: HelpCircle,
} satisfies Record<ConfirmVariant, typeof ShieldAlert>

export function ConfirmModal() {
  const { isOpen, options, resolve } = useConfirmStore()
  const variant = options?.variant ?? 'danger'
  const Icon = iconByVariant[variant]

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') resolve(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen, resolve])

  if (!isOpen || !options) return null

  return createPortal(
    <div
      className="fixnow-confirm-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) resolve(false)
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        className="fixnow-confirm-dialog"
        data-variant={variant}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="fixnow-confirm-accent" aria-hidden="true" />

        <button
          type="button"
          aria-label="Đóng hộp thoại xác nhận"
          onClick={() => resolve(false)}
          className="fixnow-confirm-close"
        >
          <X aria-hidden="true" size={20} />
        </button>

        <div className="fixnow-confirm-content">
          <span className="fixnow-confirm-icon">
            <Icon aria-hidden="true" size={30} strokeWidth={2.2} />
          </span>

          <h2 id="confirm-modal-title" className="fixnow-confirm-title">
            {options.title}
          </h2>

          <p id="confirm-modal-description" className="fixnow-confirm-description">
            {options.description}
          </p>

          <div className="fixnow-confirm-actions">
            <button
              type="button"
              className="fixnow-confirm-button fixnow-confirm-button--cancel"
              onClick={() => resolve(false)}
            >
              {options.cancelLabel ?? 'Quay lại'}
            </button>
            <button
              type="button"
              className="fixnow-confirm-button fixnow-confirm-button--confirm"
              onClick={() => resolve(true)}
            >
              {options.confirmLabel ?? 'Xác nhận'}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  )
}
