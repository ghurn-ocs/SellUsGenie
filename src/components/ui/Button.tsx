import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline-primary' | 'outline-secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    const baseClasses = 'btn-base'
    
    const sizeClasses = {
      'sm': 'btn-sm',
      'md': 'btn-md', 
      'lg': 'btn-lg',
      'xl': 'btn-xl',
    }
    
    const variantClasses = {
      'primary': 'btn-primary',
      'secondary': 'btn-secondary',
      'accent': 'btn-accent',
      'outline-primary': 'btn-outline-primary',
      'outline-secondary': 'btn-outline-secondary',
      'ghost': 'btn-ghost',
    }

    const classes = [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? 'w-full' : '',
      loading ? 'opacity-75 cursor-wait' : '',
      className
    ].filter(Boolean).join(' ')

    return (
      <button
        className={classes}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }