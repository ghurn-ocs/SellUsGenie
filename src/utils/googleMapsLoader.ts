/**
 * Google Maps API Loader
 * Singleton pattern to ensure Google Maps is only loaded once across the application
 */

export interface GoogleMapsLoaderOptions {
  libraries?: string[]
}

// Global state to track Google Maps across entire application
declare global {
  interface Window {
    __GOOGLE_MAPS_LOADED__: boolean
    __GOOGLE_MAPS_LOADING__: boolean
    __GOOGLE_MAPS_LIBRARIES__: Set<string>
  }
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader
  private callbacks: Array<(success: boolean) => void> = []

  private constructor() {
    // Initialize global state
    if (typeof window !== 'undefined') {
      window.__GOOGLE_MAPS_LOADED__ = window.__GOOGLE_MAPS_LOADED__ || false
      window.__GOOGLE_MAPS_LOADING__ = window.__GOOGLE_MAPS_LOADING__ || false
      window.__GOOGLE_MAPS_LIBRARIES__ = window.__GOOGLE_MAPS_LIBRARIES__ || new Set()
    }
  }

  private get isLoading(): boolean {
    return typeof window !== 'undefined' ? window.__GOOGLE_MAPS_LOADING__ : false
  }

  private set isLoading(value: boolean) {
    if (typeof window !== 'undefined') {
      window.__GOOGLE_MAPS_LOADING__ = value
    }
  }

  private get isLoadedGlobally(): boolean {
    return typeof window !== 'undefined' ? window.__GOOGLE_MAPS_LOADED__ : false
  }

  private set isLoadedGlobally(value: boolean) {
    if (typeof window !== 'undefined') {
      window.__GOOGLE_MAPS_LOADED__ = value
    }
  }

  private get globalLibraries(): Set<string> {
    return typeof window !== 'undefined' ? window.__GOOGLE_MAPS_LIBRARIES__ : new Set()
  }

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader()
    }
    return GoogleMapsLoader.instance
  }

  public isLoaded(requiredLibraries: string[] = []): boolean {
    // First check if basic Google Maps is available
    if (!window.google?.maps) {
      return false
    }

    // Check if all required libraries are available
    return requiredLibraries.every(lib => {
      switch (lib) {
        case 'places':
          return !!(window.google?.maps?.places && window.google.maps.places.PlacesService)
        case 'geometry':
          return !!(window.google?.maps?.geometry && window.google.maps.geometry.spherical)
        case 'marker':
          return !!(window.google?.maps?.marker && window.google.maps.marker.AdvancedMarkerElement)
        case 'drawing':
          // Drawing library is deprecated and removed from this implementation
          console.warn('⚠️ Drawing library is deprecated (Aug 2025) and will be removed in May 2026. Use modern drawing implementation instead.')
          return false
        default:
          return true
      }
    })
  }

  public async load(options: GoogleMapsLoaderOptions & { apiKey?: string } = {}): Promise<boolean> {
    const { libraries = [], apiKey } = options
    console.log('🔍 GoogleMapsLoader.load() called with libraries:', libraries)

    // Add requested libraries to global set
    libraries.forEach(lib => this.globalLibraries.add(lib))

    // STRICT CHECK: If Google Maps has ever been successfully loaded globally, return immediately
    if (window.google?.maps && this.isLoadedGlobally) {
      // Check if all requested libraries are available
      const allLibrariesLoaded = libraries.every(lib => {
        switch (lib) {
          case 'places':
            return !!(window.google?.maps?.places && window.google.maps.places.PlacesService)
          case 'geometry':
            return !!(window.google?.maps?.geometry && window.google.maps.geometry.spherical)
          case 'marker':
            return !!(window.google?.maps?.marker && window.google.maps.marker.AdvancedMarkerElement)
          case 'drawing':
            // Drawing library is deprecated and removed from this implementation
            console.warn('⚠️ Drawing library is deprecated (Aug 2025) and will be removed in May 2026. Use modern drawing implementation instead.')
            return false
          default:
            return true
        }
      })

      console.log('✅ Google Maps already loaded globally - checking libraries:', {
        requested: libraries,
        available: {
          places: !!(window.google?.maps?.places && window.google.maps.places.PlacesService),
          geometry: !!(window.google?.maps?.geometry && window.google.maps.geometry.spherical),
          marker: !!(window.google?.maps?.marker && window.google.maps.marker.AdvancedMarkerElement)
        }
      })

      if (allLibrariesLoaded) {
        console.log('✅ All required libraries already available - skipping load')
        return true
      } else {
        console.warn('⚠️ Some libraries missing but Google Maps core is loaded. Proceeding without reload.')
        // Add missing libraries to global set for future reference
        libraries.forEach(lib => this.globalLibraries.add(lib))
        return true
      }
    }

    // If currently loading globally, wait for completion
    if (this.isLoading) {
      console.log('⏳ Google Maps currently loading globally, waiting for completion...')
      return new Promise((resolve) => {
        this.callbacks.push(resolve)
      })
    }

    // Check if API key exists (use provided apiKey or fallback to env)
    const googleMapsApiKey = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!googleMapsApiKey) {
      console.error('❌ Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file or configure it in store settings')
      this.isLoading = false
      this.callbacks.forEach(callback => callback(false))
      this.callbacks = []
      return false
    }

    // Start loading globally
    this.isLoading = true
    console.log('🔄 Starting Google Maps API load process...')

    return new Promise((resolve) => {
      // Create unique callback function name FIRST
      const callbackName = `googleMapsCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Add timeout to prevent hanging promises
      const timeoutId = setTimeout(() => {
        this.isLoading = false
        console.error('❌ Google Maps loading timeout after 15 seconds')
        resolve(false)
        this.callbacks.forEach(callback => callback(false))
        this.callbacks = []
        delete (window as any)[callbackName]
      }, 15000) // 15 second timeout

        // STRICT: Only allow ONE script - prevent multiple loading completely  
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
      
      if (existingScripts.length > 0) {
        if (window.google?.maps) {
          console.log('✅ Google Maps already loaded with existing script - aborting new script creation')
          clearTimeout(timeoutId)
          this.isLoadedGlobally = true
          this.isLoading = false
          resolve(true)
          this.callbacks.forEach(callback => callback(true))
          this.callbacks = []
          delete (window as any)[callbackName]
          return
        } else {
          // Remove broken scripts
          existingScripts.forEach(script => {
            console.log('🧹 Removing incomplete Google Maps script:', script.src)
            script.remove()
          })
        }
      }

      // Clean up any orphaned callback functions
      Object.keys(window).forEach(key => {
        if (key.startsWith('googleMapsCallback_')) {
          console.log('🧹 Cleaning up orphaned callback:', key)
          delete (window as any)[key]
        }
      })
      
      ;(window as any)[callbackName] = () => {
        console.log('🎉 Google Maps callback function called successfully!')
        // Clear timeout on successful callback
        clearTimeout(timeoutId)
        
        // Wait for all required libraries to be available
        let attempts = 0
        const maxAttempts = 100 // Increased for better reliability
        
        const checkLibraries = () => {
          const allRequestedLibraries = Array.from(this.globalLibraries)
          
          // First check if basic Google Maps is loaded
          if (!window.google?.maps) {
            if (attempts < maxAttempts) {
              attempts++
              setTimeout(checkLibraries, 50) // Reduced interval for faster detection
            } else {
              this.isLoading = false
              console.error('❌ Google Maps API failed to load basic Maps API after', maxAttempts, 'attempts')
              resolve(false)
              this.callbacks.forEach(callback => callback(false))
              this.callbacks = []
              delete (window as any)[callbackName]
            }
            return
          }
          
          // Check if all requested libraries are loaded
          console.log('🔍 Checking if requested libraries are loaded:', allRequestedLibraries)
          const isLoadedResult = this.isLoaded(allRequestedLibraries)
          console.log('🔍 isLoaded result:', isLoadedResult)
          
          if (isLoadedResult) {
            this.isLoadedGlobally = true
            this.isLoading = false
            allRequestedLibraries.forEach(lib => this.globalLibraries.add(lib))
            
            console.log('✅ Google Maps API loaded successfully with all libraries:', allRequestedLibraries)
            resolve(true)
            this.callbacks.forEach(callback => callback(true))
            this.callbacks = []
            
            // Clean up callback
            delete (window as any)[callbackName]
          } else if (attempts < maxAttempts) {
            attempts++
            console.log(`🔄 Waiting for libraries to load... attempt ${attempts}/${maxAttempts}`)
            console.log('Available:', {
              maps: !!window.google?.maps,
              places: !!(window.google?.maps?.places && window.google.maps.places.PlacesService),
              geometry: !!(window.google?.maps?.geometry && window.google.maps.geometry.spherical),
              marker: !!(window.google?.maps?.marker && window.google.maps.marker.AdvancedMarkerElement)
            })
            setTimeout(checkLibraries, 50) // Reduced interval for faster detection
          } else {
            this.isLoading = false
            const allRequestedLibraries = Array.from(this.globalLibraries)
            console.error('❌ Google Maps API libraries failed to load after', maxAttempts, 'attempts')
            console.error('Required libraries:', allRequestedLibraries)
            console.error('Available:', {
              maps: !!window.google?.maps,
              places: !!window.google?.maps?.places,
              geometry: !!window.google?.maps?.geometry,
              marker: !!window.google?.maps?.marker
            })
            
            resolve(false)
            this.callbacks.forEach(callback => callback(false))
            this.callbacks = []
            delete (window as any)[callbackName]
          }
        }
        
        checkLibraries()
      }

      // Build libraries parameter using all globally requested libraries
      const allLibraries = Array.from(this.globalLibraries)
      const librariesParam = allLibraries.length > 0 ? `&libraries=${allLibraries.join(',')}` : ''
      console.log('📚 Loading Google Maps with all requested libraries:', allLibraries)
      
      // Build the script URL with modern version for AdvancedMarkerElement support
      const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}${librariesParam}&callback=${callbackName}&loading=async&v=weekly`
      
      // Check if Google Maps is already working - if so, don't load again
      if (window.google?.maps && this.isLoaded(allLibraries)) {
        console.log('✅ Google Maps already loaded and working - skipping script creation')
        clearTimeout(timeoutId)
        this.isLoadedGlobally = true
        this.isLoading = false
        resolve(true)
        this.callbacks.forEach(callback => callback(true))
        this.callbacks = []
        delete (window as any)[callbackName]
        return
      }
      
      // Final check - if Google Maps loaded during our setup, don't create script
      if (window.google?.maps) {
        console.log('✅ Google Maps loaded during setup - canceling script creation')
        clearTimeout(timeoutId)
        this.isLoadedGlobally = true
        this.isLoading = false
        resolve(true)
        this.callbacks.forEach(callback => callback(true))
        this.callbacks = []
        delete (window as any)[callbackName]
        return
      }
      
      // Create and load script
      const script = document.createElement('script')
      script.src = scriptUrl
      script.async = true
      script.defer = true
      
      console.log('📡 Loading Google Maps script:', script.src)
      
      script.onload = () => {
        console.log('📡 Google Maps script loaded, waiting for callback...')
      }
      
      script.onerror = (error) => {
        clearTimeout(timeoutId) // Clear timeout on error
        this.isLoading = false
        console.error('❌ Failed to load Google Maps script:', error)
        console.error('Script URL:', script.src)
        resolve(false)
        this.callbacks.forEach(callback => callback(false))
        this.callbacks = []
        delete (window as any)[callbackName]
      }
      
      script.onload = () => {
        console.log('📡 Google Maps script loaded, waiting for callback...')
      }
      
      document.head.appendChild(script)
    })
  }

  public getLoadedLibraries(): string[] {
    return Array.from(this.globalLibraries)
  }

  /**
   * Reset loader state - useful for testing or handling errors
   */
  public reset(): void {
    console.log('🔄 Resetting Google Maps loader state')
    this.isLoadedGlobally = false
    this.isLoading = false
    this.callbacks = []
    this.globalLibraries.clear()
    
    // Clean up any existing scripts and callbacks
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
    existingScripts.forEach(script => script.remove())
    
    // Clean up callback functions
    Object.keys(window).forEach(key => {
      if (key.startsWith('googleMapsCallback_')) {
        delete (window as any)[key]
      }
    })
  }
}

// Export singleton instance
export const googleMapsLoader = GoogleMapsLoader.getInstance()

// Export class for type checking
export { GoogleMapsLoader }