import React from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error'
  actionText?: string
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  actionText = 'OK'
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />
      case 'success':
      default:
        return <CheckCircle className="w-6 h-6 text-green-600" />
    }
  }

  const getIconBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-100'
      case 'success':
      default:
        return 'bg-green-100'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-600 hover:bg-red-700'
      case 'success':
      default:
        return 'bg-green-600 hover:bg-green-700'
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${getIconBgColor()} flex items-center justify-center`}>
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`px-6 py-2 ${getButtonColor()} text-white rounded-lg transition-colors font-medium`}
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  )
}