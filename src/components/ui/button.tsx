import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-sky-500 text-white shadow-sm hover:bg-sky-600 active:bg-sky-700',
  outline:
    'border border-sky-200 bg-white text-sky-700 shadow-sm hover:bg-sky-50 hover:border-sky-300',
  ghost:
    'text-sky-700 hover:bg-sky-50',
  secondary:
    'bg-sky-100 text-sky-800 shadow-sm hover:bg-sky-200',
  destructive:
    'bg-red-500 text-white shadow-sm hover:bg-red-600',
}

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-5 py-2 text-sm',
  sm: 'h-8 px-4 py-1.5 text-sm',
  lg: 'h-12 px-8 py-3 text-base',
  icon: 'h-10 w-10',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer'

    const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className)

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className),
        ref,
        ...props,
      } as Record<string, unknown>)
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
