import React, { useState, useEffect } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { formatTimeRemaining } from '../../utils/sessionManager'
import { AlertTriangle, Clock } from 'lucide-react'

export const SessionWarningDialog: React.FC = () => {
  const { isSessionWarningVisible, sessionState, extendSession, signOut, dismissSessionWarning } = useAuth()
  const [timeRemaining, setTimeRemaining] = useState(sessionState.timeUntilTimeout)

  // Update time remaining every second when dialog is visible
  useEffect(() => {
    if (!isSessionWarningVisible) return

    const interval = setInterval(() => {
      setTimeRemaining(sessionState.timeUntilTimeout)
    }, 1000)

    return () => clearInterval(interval)
  }, [isSessionWarningVisible, sessionState.timeUntilTimeout])

  const handleStayLoggedIn = () => {
    extendSession()
  }

  const handleLogOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const handleDismiss = () => {
    dismissSessionWarning()
  }

  if (!isSessionWarningVisible) return null

  return (
    <AlertDialog.Root open={isSessionWarningVisible}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-red-200 bg-white p-6 shadow-2xl">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <AlertDialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                Session Expiring Soon
              </AlertDialog.Title>
              <AlertDialog.Description className="text-gray-700 mb-4">
                Your session will expire in <strong className="text-red-600">
                  {formatTimeRemaining(timeRemaining)}
                </strong> due to inactivity. You will be automatically logged out for security reasons.
              </AlertDialog.Description>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded-md">
                <Clock className="h-4 w-4" />
                <span>Last activity: {new Date(sessionState.lastActivity).toLocaleTimeString()}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <AlertDialog.Action asChild>
                  <Button 
                    onClick={handleStayLoggedIn}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    Stay Logged In
                  </Button>
                </AlertDialog.Action>
                
                <Button 
                  onClick={handleLogOut}
                  variant="outline-primary"
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Log Out Now
                </Button>
              </div>

              <div className="mt-3 text-center">
                <Button 
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Dismiss (session will still expire)
                </Button>
              </div>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

// Session timeout indicator for showing in header/navbar
export const SessionTimeoutIndicator: React.FC = () => {
  const { sessionState, user } = useAuth()
  const [timeRemaining, setTimeRemaining] = useState(sessionState.timeUntilTimeout)

  useEffect(() => {
    if (!user || !sessionState.showWarning) return

    const interval = setInterval(() => {
      setTimeRemaining(sessionState.timeUntilTimeout)
    }, 1000)

    return () => clearInterval(interval)
  }, [user, sessionState.showWarning, sessionState.timeUntilTimeout])

  // Only show when user is logged in and warning is active
  if (!user || !sessionState.showWarning) return null

  const minutes = Math.floor(timeRemaining / 60000)
  
  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-sm">
      <Clock className="h-4 w-4 text-amber-600" />
      <span className="text-amber-800 font-medium">
        Session expires in {minutes} min{minutes !== 1 ? 's' : ''}
      </span>
    </div>
  )
}