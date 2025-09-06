import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range'
  selected?: Date | Date[] | null
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
  initialFocus?: boolean
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export const Calendar: React.FC<CalendarProps> = ({
  mode = 'single',
  selected,
  onSelect,
  disabled,
  className = '',
  initialFocus = false
}) => {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = React.useState(
    selected instanceof Date ? selected : today
  )

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())

  const endDate = new Date(lastDayOfMonth)
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()))

  const calendarDays = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    calendarDays.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const isSelected = (date: Date) => {
    if (mode === 'single' && selected instanceof Date) {
      return date.toDateString() === selected.toDateString()
    }
    return false
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const handleDateClick = (date: Date) => {
    if (disabled?.(date)) return
    if (mode === 'single') {
      onSelect?.(date)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className={`p-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div key={day} className="h-9 w-9 text-center text-xs font-medium text-muted-foreground flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const isDisabled = disabled?.(date)
          const dateIsSelected = isSelected(date)
          const dateIsToday = isToday(date)
          const inCurrentMonth = isCurrentMonth(date)

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={`
                h-9 w-9 text-center text-sm font-normal rounded-md transition-colors
                ${inCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                ${dateIsSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}
                ${dateIsToday && !dateIsSelected ? 'bg-accent text-accent-foreground' : ''}
                ${isDisabled ? 'text-muted-foreground opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}