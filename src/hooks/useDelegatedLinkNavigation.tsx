import { useEffect } from 'react'
import { useLocation } from 'wouter'

const isExternal = (href: string) =>
  /^https?:\/\//i.test(href) || 
  href.startsWith('mailto:') || 
  href.startsWith('tel:') ||
  href.startsWith('#')

export function useDelegatedLinkNavigation(containerId = 'app-main') {
  const [, navigate] = useLocation()

  useEffect(() => {
    const container = document.getElementById(containerId) || document.body
    
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      const targetAttr = target.getAttribute('target')
      const download = target.getAttribute('download')
      
      // Skip if no href, is anchor link, opens in new window, or is download
      if (!href || href.startsWith('#') || targetAttr === '_blank' || download) return

      // Skip external links
      if (isExternal(href)) return

      // Prevent default and navigate with client-side routing
      e.preventDefault()
      navigate(href)
    }

    container.addEventListener('click', onClick)
    return () => container.removeEventListener('click', onClick)
  }, [navigate, containerId])
}