import React from 'react'

// Simple dropdown menu components that match the existing project patterns

export interface DropdownMenuProps {
  children: React.ReactNode
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: React.ReactNode
}

export interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end'
  children: React.ReactNode
  className?: string
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export interface DropdownMenuSeparatorProps {
  className?: string
}

// Context for managing dropdown state
const DropdownMenuContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {}
})

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsOpen(!isOpen)
      onClick?.(e)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        onClick: handleClick,
        ref
      })
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ align = 'end', children, className = '', ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen, setIsOpen, ref])

    if (!isOpen) return null

    const alignmentClasses = {
      start: 'left-0',
      center: 'left-1/2 transform -translate-x-1/2',
      end: 'right-0'
    }

    return (
      <div
        ref={ref}
        className={`
          absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border 
          bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95
          ${alignmentClasses[align]} ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

DropdownMenuContent.displayName = 'DropdownMenuContent'

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ children, className = '', onClick, ...props }, ref) => {
    const { setIsOpen } = React.useContext(DropdownMenuContext)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      setIsOpen(false)
    }

    return (
      <button
        ref={ref}
        className={`
          relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none 
          transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none 
          data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground w-full text-left
          ${className}
        `}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

DropdownMenuItem.displayName = 'DropdownMenuItem'

export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`-mx-1 my-1 h-px bg-muted ${className}`}
      {...props}
    />
  )
)

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'