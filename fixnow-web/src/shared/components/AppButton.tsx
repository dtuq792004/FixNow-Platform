import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-header-gradient text-white shadow-md hover:brightness-105 active:scale-[0.98]',
        secondary: 'bg-slate-900 text-white hover:bg-slate-800',
        outline: 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100',
        ghost: 'text-slate-600 hover:bg-slate-100',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode
    asChild?: boolean
  }

export function AppButton({
  children,
  className,
  variant,
  size,
  asChild = false,
  type = 'button',
  ...props
}: AppButtonProps) {
  const Component = asChild ? Slot : 'button'
  return (
    <Component
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}
