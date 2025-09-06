import React from 'react'
import { ChevronDown, Check } from 'lucide-react'

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {}
})

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, onOpenChange: setOpen }}>
      {children}
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  placeholder?: string
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className = '', placeholder, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(SelectContext)

    return (
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className={`
          flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm 
          ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring 
          focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        ref={ref}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)

SelectTrigger.displayName = "SelectTrigger"

export interface SelectValueProps {
  placeholder?: string
  className?: string
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder = "Select..." }) => {
  const { value } = React.useContext(SelectContext)
  
  return (
    <span className={!value ? "text-muted-foreground" : ""}>
      {value || placeholder}
    </span>
  )
}

export interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export const SelectContent: React.FC<SelectContentProps> = ({ children, className = '' }) => {
  const { open, onOpenChange } = React.useContext(SelectContext)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" onClick={() => onOpenChange(false)}>
      <div className="relative">
        <div 
          className={`
            absolute top-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground 
            shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 
            data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 
            data-[side=top]:slide-in-from-bottom-2
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, className = '' }) => {
  const { value: selectedValue, onValueChange, onOpenChange } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  const handleClick = () => {
    onValueChange?.(value)
    onOpenChange(false)
  }

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none 
        hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground 
        data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        ${className}
      `}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  )
}