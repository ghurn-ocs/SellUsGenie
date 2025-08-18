export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key not found. Address autocomplete will not work.')
}

// Google Maps configuration
export const GOOGLE_MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places'] as const,
  loading: 'async' as const
}

// Type declarations for Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}