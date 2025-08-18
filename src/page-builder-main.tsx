/**
 * Standalone Page Builder Application Entry Point
 * Separate from the main SellUsGenie application
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PageBuilderApp from './PageBuilderApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageBuilderApp />
  </StrictMode>,
)