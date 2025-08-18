import React from 'react'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div className={`bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] ${className}`}>
      {children}
    </div>
  )
}