import { create } from 'zustand'

export type ConfirmVariant = 'danger' | 'warning' | 'primary'

export type ConfirmOptions = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
}

type ConfirmState = {
  isOpen: boolean
  options: ConfirmOptions | null
  resolver: ((confirmed: boolean) => void) | null
  confirm: (options: ConfirmOptions) => Promise<boolean>
  resolve: (confirmed: boolean) => void
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: null,
  resolver: null,
  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      get().resolver?.(false)
      set({ isOpen: true, options, resolver: resolve })
    }),
  resolve: (confirmed) => {
    const resolver = get().resolver
    set({ isOpen: false, options: null, resolver: null })
    resolver?.(confirmed)
  },
}))

export function useConfirm() {
  return useConfirmStore((state) => state.confirm)
}
