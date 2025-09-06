import React from 'react'
import { X } from 'lucide-react'

// Dialog Context
const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {}
})

// Dialog Root
export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

// Dialog Content
export interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className = '', ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DialogContext)

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onOpenChange(false)
        }
      }

      if (open) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
        return () => {
          document.removeEventListener('keydown', handleEscape)
          document.body.style.overflow = 'unset'
        }
      }
    }, [open, onOpenChange])

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => onOpenChange(false)}
        />
        
        {/* Content */}
        <div
          ref={ref}
          className={`
            relative bg-white border border-gray-300 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto
            transform transition-all duration-300 ease-out
            ${className}
          `}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)'
          }}
          {...props}
        >
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            style={{
              color: 'var(--text-secondary)'
            }}
          >
            <X className="h-4 w-4" />
          </button>
          {children}
        </div>
      </div>
    )
  }
)

DialogContent.displayName = "DialogContent"

// Dialog Header
export interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>
      {children}
    </div>
  )
}

// Dialog Title
export interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      style={{ color: 'var(--text-primary)' }}
    >
      {children}
    </h3>
  )
}

// Dialog Description
export interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className = '' }) => {
  return (
    <p 
      className={`text-sm ${className}`}
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </p>
  )
}