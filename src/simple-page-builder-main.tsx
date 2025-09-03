/**
 * Simple Page Builder Entry Point
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SimplePageBuilder from './SimplePageBuilder.tsx'

console.log('Simple Page Builder starting...')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimplePageBuilder />
  </StrictMode>,
)