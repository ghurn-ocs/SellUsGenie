import React from 'react'
import { Link } from 'wouter'

const isExternal = (href: string) =>
  /^https?:\/\//i.test(href) || 
  href.startsWith('mailto:') || 
  href.startsWith('tel:') ||
  href.startsWith('#')

type Props = React.ComponentProps<'a'> & { 
  href: string
  to?: string // Support both href and to for flexibility
}

export function SmartLink({ href, to, children, onClick, ...rest }: Props & { onClick?: (e: React.MouseEvent) => void }) {
  const linkTarget = to || href
  
  const handleClick = (e: React.MouseEvent) => {
    console.log('🖱️ SmartLink navigating to:', linkTarget)
    if (onClick) {
      onClick(e)
    }
  }
  
  if (isExternal(linkTarget)) {
    return <a href={linkTarget} onClick={handleClick} {...rest}>{children}</a>
  }
  
  // Extract props that wouter Link doesn't understand
  const linkProps = { ...rest }
  delete (linkProps as any).href
  delete (linkProps as any).to
  
  return (
    <Link to={linkTarget} onClick={handleClick} {...linkProps}>
      {children}
    </Link>
  )
}