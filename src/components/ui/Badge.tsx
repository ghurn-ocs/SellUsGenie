import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground border-transparent hover:bg-primary/80',
      secondary: 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80',
      destructive: 'bg-destructive text-destructive-foreground border-transparent hover:bg-destructive/80',
      outline: 'text-foreground border-border'
    }

    const baseClasses = `
      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold 
      transition-colors focus:outline-none focus:ring-2 focus:ring-ring 
      focus:ring-offset-2 border
    `

    return (
      <span
        className={`${baseClasses} ${variants[variant]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"