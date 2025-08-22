import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'elevated' | 'interactive'
  className?: string
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'base', className = '', children, ...props }, ref) => {
    const variantClasses = {
      'base': 'card-base',
      'elevated': 'card-elevated',
      'interactive': 'card-interactive',
    }

    const classes = [
      variantClasses[variant],
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }