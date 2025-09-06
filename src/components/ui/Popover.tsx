import React from 'react'

const PopoverContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {}
})

export interface PopoverProps {
  children: React.ReactNode
}

export const Popover: React.FC<PopoverProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </PopoverContext.Provider>
  )
}

export interface PopoverTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, asChild = false }) => {
  const { onOpenChange } = React.useContext(PopoverContext)

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => onOpenChange(true)
    })
  }

  return (
    <button onClick={() => onOpenChange(true)}>
      {children}
    </button>
  )
}

export interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
}

export const PopoverContent: React.FC<PopoverContentProps> = ({ 
  children, 
  className = '', 
  align = 'center' 
}) => {
  const { open, onOpenChange } = React.useContext(PopoverContext)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('[data-popover-content]')) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        data-popover-content
        className={`
          absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-0 text-popover-foreground shadow-md
          animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
          data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
          ${align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 transform -translate-x-1/2'}
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  )
}