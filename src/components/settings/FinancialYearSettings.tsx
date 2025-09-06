import React, { useState, useEffect } from 'react'
import { Calendar, Save, AlertCircle, DollarSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { CURRENCIES, getCurrencyByCode } from '../../lib/internationalData'

interface FinancialYearSettingsProps {
  storeId: string
}

const MONTHS = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' }
]

export const FinancialYearSettings: React.FC<FinancialYearSettingsProps> = ({ storeId }) => {
  const [startMonth, setStartMonth] = useState(1)
  const [startDay, setStartDay] = useState(1)
  const [currency, setCurrency] = useState('USD')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Get days for selected month (handle leap year by using 28 for February)
  const getDaysInMonth = (month: number) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return Array.from({ length: daysInMonth[month - 1] }, (_, i) => i + 1)
  }

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('financial_year_start_month, financial_year_start_day')
          .eq('id', storeId)
          .single()

        if (error) {
          console.error('Error loading financial year settings:', error)
          setMessage({ type: 'error', text: 'Failed to load financial year settings' })
          return
        }

        if (data) {
          setStartMonth(data.financial_year_start_month || 1)
          setStartDay(data.financial_year_start_day || 1)
          setCurrency('USD') // Default for now
        }
      } catch (error) {
        console.error('Error loading financial year settings:', error)
        setMessage({ type: 'error', text: 'Failed to load financial year settings' })
      } finally {
        setIsLoading(false)
      }
    }

    if (storeId) {
      loadSettings()
    }
  }, [storeId])

  // Adjust day if it's invalid for the selected month
  useEffect(() => {
    const maxDays = getDaysInMonth(startMonth).length
    if (startDay > maxDays) {
      setStartDay(maxDays)
    }
  }, [startMonth, startDay])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('stores')
        .update({
          financial_year_start_month: startMonth,
          financial_year_start_day: startDay
        })
        .eq('id', storeId)

      if (error) {
        console.error('Error saving financial year settings:', error)
        setMessage({ type: 'error', text: 'Failed to save financial year settings' })
        return
      }

      setMessage({ type: 'success', text: 'Financial settings saved successfully!' })
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null)
      }, 3000)

    } catch (error) {
      console.error('Error saving financial year settings:', error)
      setMessage({ type: 'error', text: 'Failed to save financial year settings' })
    } finally {
      setIsSaving(false)
    }
  }

  const getFormattedDate = () => {
    const monthName = MONTHS.find(m => m.value === startMonth)?.name || 'January'
    return `${monthName} ${startDay}`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-[#9B51E0]" />
          <h3 className="text-xl font-semibold text-white">Financial Settings</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[#3A3A3A] rounded w-1/2"></div>
          <div className="h-8 bg-[#3A3A3A] rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Calendar className="w-6 h-6 text-[#9B51E0]" />
        <h3 className="text-xl font-semibold text-white">Financial Settings</h3>
      </div>

      <div className="space-y-4">
        <p className="text-[#A0A0A0]">
          Configure your financial year period and currency. These settings affect financial reporting, analytics calculations, and pricing display.
        </p>

        {/* Current Settings Display */}
        <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#9B51E0]" />
              </div>
              <div>
                <p className="text-white font-medium">Financial Year Starts</p>
                <p className="text-[#A0A0A0] text-sm">{getFormattedDate()} each year</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#9B51E0]" />
              </div>
              <div>
                <p className="text-white font-medium">Store Currency</p>
                <p className="text-[#A0A0A0] text-sm">{getCurrencyByCode(currency)?.name || 'US Dollar'} ({getCurrencyByCode(currency)?.symbol || '$'})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Month and Day Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Start Month
            </label>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
              disabled={isSaving}
            >
              {MONTHS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
              Start Day
            </label>
            <select
              value={startDay}
              onChange={(e) => setStartDay(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
              disabled={isSaving}
            >
              {getDaysInMonth(startMonth).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Currency Selector */}
        <div>
          <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
            Store Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
            disabled={isSaving}
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.name} ({curr.symbol}) - {curr.code}
              </option>
            ))}
          </select>
        </div>

        {/* Examples */}
        <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
          <p className="text-sm font-medium text-white mb-2">Common Financial Year Periods:</p>
          <div className="space-y-1 text-sm text-[#A0A0A0]">
            <p>• Calendar Year: January 1st - December 31st</p>
            <p>• US Federal: October 1st - September 30th</p>
            <p>• UK Financial: April 6th - April 5th</p>
            <p>• Australia: July 1st - June 30th</p>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg border flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full md:w-auto px-6 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#8A47D0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Financial Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}