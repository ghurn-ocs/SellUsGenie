import React from 'react'

export type GenieMood = 'happy' | 'helpful' | 'confused' | 'thinking' | 'hover' | 'main'

interface GenieMascotProps {
  mood?: GenieMood
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  className?: string
  showBackground?: boolean
  alt?: string
}

export const GenieMascot: React.FC<GenieMascotProps> = ({
  mood = 'main',
  size = 'md',
  className = '',
  showBackground = false,
  alt = 'SellUsGenie Mascot'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    xxl: 'w-32 h-32'
  }

  const getGenieImage = (mood: GenieMood) => {
    // Map mood to image filename
    const imageMap: Record<GenieMood, string> = {
      main: 'SellUsGenie-Logo-Hover-Translucent-Purple.png',
      hover: 'SellUsGenie-Logo-Hover-Translucent-Purple.png',
      happy: 'SellUsGenie-Happy.png',
      helpful: 'SellUsGenie-Helpful.png',
      confused: 'SellUsGenie-Confused.png',
      thinking: 'SellUsGenie-Thinking.png'
    }

    return `/images/genies/${imageMap[mood] || imageMap.main}`
  }

  const imageSrc = getGenieImage(mood)

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      {showBackground && (
        <div className="w-full h-full bg-gradient-to-br from-[#9B51E0]/20 to-[#00AEEF]/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <div className="w-4/5 h-4/5 bg-white rounded-full flex items-center justify-center p-1">
            <img 
              src={imageSrc}
              alt={alt}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to main logo if specific mood image not found
                const target = e.target as HTMLImageElement
                if (target.src !== '/images/genies/SellUsGenie-Logo-Hover-Translucent-Purple.png') {
                  target.src = '/images/genies/SellUsGenie-Logo-Hover-Translucent-Purple.png'
                }
              }}
            />
          </div>
        </div>
      )}
      {!showBackground && (
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-1">
          <img 
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to main logo if specific mood image not found
              const target = e.target as HTMLImageElement
              if (target.src !== '/images/genies/SellUsGenie-Logo-Hover-Translucent-Purple.png') {
                target.src = '/images/genies/SellUsGenie-Logo-Hover-Translucent-Purple.png'
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

// Additional component for the main logo usage
export const GenieLogotype: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  className?: string
}> = ({ size = 'lg', className = '' }) => {
  return (
    <GenieMascot 
      mood="main" 
      size={size} 
      className={className}
      alt="SellUsGenie Logo"
    />
  )
}