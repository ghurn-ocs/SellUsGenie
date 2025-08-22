import React from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../../contexts/AuthContext'
import { GenieMascot } from './GenieMascot'
import { Button } from './Button'

interface NavigationItem {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'outline-primary' | 'accent'
  'aria-label'?: string
}

interface NavigationProps {
  variant?: 'landing' | 'features'
  showAuthButtons?: boolean
  className?: string
}

export const Navigation: React.FC<NavigationProps> = ({ 
  variant = 'landing', 
  showAuthButtons = true,
  className = ''
}) => {
  const [, navigate] = useLocation()
  const { signInWithGoogle } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google sign in failed:', error)
    }
  }

  const getNavigationItems = (): NavigationItem[] => {
    switch (variant) {
      case 'features':
        return [
          { 
            label: 'Home', 
            onClick: () => navigate('/'),
            'aria-label': 'Navigate to home page'
          },
          { 
            label: 'Pricing', 
            onClick: () => navigate('/#pricing'),
            'aria-label': 'View pricing information'
          },
          { 
            label: 'Why Not Others?', 
            onClick: () => navigate('/why-not'),
            'aria-label': 'Learn why to choose SellUsGenie over competitors'
          },
          { 
            label: 'Contact', 
            onClick: () => navigate('/contact'),
            'aria-label': 'Contact SellUsGenie support'
          }
        ]
      default: // landing
        return [
          { 
            label: 'Features', 
            onClick: () => navigate('/features')
          },
          { 
            label: 'Pricing', 
            href: '#pricing'
          },
          { 
            label: 'Why Not Others?', 
            onClick: () => navigate('/why-not')
          },
          { 
            label: 'Contact', 
            onClick: () => navigate('/contact')
          }
        ]
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <nav className={`nav-base ${className}`}>
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <GenieMascot mood="happy" size="md" showBackground={true} />
            <div>
              <h2 className="text-2xl font-bold text-[#9B51E0]">Sell Us Genie™</h2>
              <p className="text-xs text-[#A0A0A0] italic">Where wishes are real!</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {navigationItems.map((item, index) => (
              <Button
                key={index}
                variant="outline-primary"
                size="sm"
                onClick={item.onClick}
                aria-label={item['aria-label']}
              >
                {item.label}
              </Button>
            ))}
            
            {/* Auth Buttons */}
            {showAuthButtons && (
              <>
                <Button 
                  onClick={handleGoogleSignIn}
                  variant="primary"
                  size="md"
                >
                  Sign In to Store
                </Button>
                <Button 
                  onClick={handleGoogleSignIn}
                  variant="accent"
                  size="md"
                >
                  Start Free Trial
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}