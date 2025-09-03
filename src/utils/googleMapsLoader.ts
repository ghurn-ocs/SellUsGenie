/**
 * Google Maps API Loader
 * Singleton pattern to ensure Google Maps is only loaded once across the application
 */

export interface GoogleMapsLoaderOptions {
  libraries?: string[]
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader
  private loaded = false
  private loading = false
  private callbacks: Array<(success: boolean) => void> = []
  private loadedLibraries: Set<string> = new Set()
  private requestedLibraries: Set<string> = new Set()

  private constructor() {}

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
          return !!window.google?.maps?.places
        case 'geometry':
          return !!window.google?.maps?.geometry
        case 'marker':
          return !!window.google?.maps?.marker
        default:
          return true
      }
    })
  }

  public async load(options: GoogleMapsLoaderOptions = {}): Promise<boolean> {
    const { libraries = [] } = options
    console.log('🔍 GoogleMapsLoader.load() called with libraries:', libraries)

    // Add requested libraries to the set
    libraries.forEach(lib => this.requestedLibraries.add(lib))

    // If already loaded with required libraries, return true
    if (this.isLoaded(libraries)) {
      console.log('✅ Google Maps already loaded with required libraries')
      return true
    }

    // If currently loading, add libraries to the request and wait for completion
    if (this.loading) {
      console.log('⏳ Google Maps currently loading, adding libraries to request and waiting...')
      return new Promise((resolve) => {
        this.callbacks.push(resolve)
      })
    }

    // Check if API key exists
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      console.error('❌ Google Maps API key is missing')
      return false
    }

    // Start loading
    this.loading = true
    console.log('🔄 Starting Google Maps API load process...')

    return new Promise((resolve) => {
      // Create unique callback function name FIRST
      const callbackName = `googleMapsCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Add timeout to prevent hanging promises
      const timeoutId = setTimeout(() => {
        this.loading = false
        console.error('❌ Google Maps loading timeout after 15 seconds')
        resolve(false)
        this.callbacks.forEach(callback => callback(false))
        this.callbacks = []
        delete (window as any)[callbackName]
      }, 15000) // 15 second timeout

      // Only clean up if Google Maps is not already loaded
      if (!window.google?.maps) {
        // Remove any existing failed/incomplete scripts
        const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
        existingScripts.forEach(script => script.remove())

        // Clean up global state
        delete (window as any).initGoogleMaps
        delete (window as any).googleMapsLoading
      }
      
      ;(window as any)[callbackName] = () => {
        console.log('🎉 Google Maps callback function called successfully!')
        // Clear timeout on successful callback
        clearTimeout(timeoutId)
        
        // Wait for all required libraries to be available
        let attempts = 0
        const maxAttempts = 100 // Increased for better reliability
        
        const checkLibraries = () => {
          const allRequestedLibraries = Array.from(this.requestedLibraries)
          
          // First check if basic Google Maps is loaded
          if (!window.google?.maps) {
            if (attempts < maxAttempts) {
              attempts++
              setTimeout(checkLibraries, 50) // Reduced interval for faster detection
            } else {
              this.loading = false
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
            this.loaded = true
            this.loading = false
            allRequestedLibraries.forEach(lib => this.loadedLibraries.add(lib))
            
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
              places: !!window.google?.maps?.places,
              geometry: !!window.google?.maps?.geometry,
              marker: !!window.google?.maps?.marker
            })
            setTimeout(checkLibraries, 50) // Reduced interval for faster detection
          } else {
            this.loading = false
            const allRequestedLibraries = Array.from(this.requestedLibraries)
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

      // Build libraries parameter using all requested libraries
      const allLibraries = Array.from(this.requestedLibraries)
      const librariesParam = allLibraries.length > 0 ? `&libraries=${allLibraries.join(',')}` : ''
      console.log('📚 Loading Google Maps with all requested libraries:', allLibraries)
      
      // Create and load script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}${librariesParam}&callback=${callbackName}&loading=async`
      script.async = true
      script.defer = true
      
      console.log('📡 Loading Google Maps script:', script.src)
      
      script.onload = () => {
        console.log('📡 Google Maps script loaded, waiting for callback...')
      }
      
      script.onerror = (error) => {
        clearTimeout(timeoutId) // Clear timeout on error
        this.loading = false
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
    return Array.from(this.loadedLibraries)
  }
}

// Export singleton instance
export const googleMapsLoader = GoogleMapsLoader.getInstance()

// Export class for type checking
export { GoogleMapsLoader }