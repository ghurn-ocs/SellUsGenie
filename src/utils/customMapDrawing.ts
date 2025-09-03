/**
 * Custom Map Drawing Utility
 * Replacement for deprecated Google Maps Drawing API
 */

export const DrawingMode = {
  NONE: 'none',
  CIRCLE: 'circle',
  POLYGON: 'polygon'
} as const

export type DrawingMode = typeof DrawingMode[keyof typeof DrawingMode]

export interface DrawingManagerOptions {
  map: google.maps.Map
  onOverlayComplete?: (overlay: google.maps.Polygon | google.maps.Circle, type: DrawingMode) => void
  polygonOptions?: google.maps.PolygonOptions
  circleOptions?: google.maps.CircleOptions
}

export class CustomDrawingManager {
  private map: google.maps.Map
  private drawingMode: DrawingMode = DrawingMode.NONE
  private onOverlayComplete?: (overlay: google.maps.Polygon | google.maps.Circle, type: DrawingMode) => void
  private polygonOptions: google.maps.PolygonOptions
  private circleOptions: google.maps.CircleOptions
  private drawingListeners: google.maps.MapsEventListener[] = []
  private isDrawing = false
  private polygonPath: google.maps.LatLng[] = []

  constructor(options: DrawingManagerOptions) {
    this.map = options.map
    this.onOverlayComplete = options.onOverlayComplete
    this.polygonOptions = options.polygonOptions || {
      fillColor: '#9B51E0',
      fillOpacity: 0.25,
      strokeWeight: 3,
      strokeColor: '#9B51E0',
      editable: true,
      draggable: true
    }
    this.circleOptions = options.circleOptions || {
      fillColor: '#9B51E0',
      fillOpacity: 0.25,
      strokeWeight: 3,
      strokeColor: '#9B51E0',
      editable: true,
      draggable: true
    }
  }

  setDrawingMode(mode: DrawingMode) {
    console.log('🎨 setDrawingMode called:', { oldMode: this.drawingMode, newMode: mode })
    
    // Clear any existing listeners first
    this.clearDrawingListeners()
    
    // Reset state
    this.drawingMode = mode
    this.isDrawing = false
    this.polygonPath = []

    // Update cursor and map interaction based on drawing mode
    if (mode === DrawingMode.NONE) {
      this.map.setOptions({ 
        draggableCursor: null,
        draggable: true // Enable map dragging in none mode
      })
      console.log('🎨 Drawing mode set to NONE - pan/zoom mode enabled')
    } else {
      this.map.setOptions({ 
        draggableCursor: 'crosshair',
        draggable: false // Disable map dragging in drawing mode
      })
      console.log('🎨 Drawing mode set to:', mode, '- crosshair cursor enabled, map dragging disabled')
    }

    // Set up new listeners based on mode
    if (mode === DrawingMode.CIRCLE) {
      this.setupCircleDrawing()
    } else if (mode === DrawingMode.POLYGON) {
      this.setupPolygonDrawing()
    }
  }

  private setupCircleDrawing() {
    console.log('🎨 Setting up circle drawing mode')
    const currentCircle: google.maps.Circle | null = null
    const centerPoint: google.maps.LatLng | null = null
    const mouseMoveListener: google.maps.MapsEventListener | null = null
    
    // Add a test listener to see if ANY clicks are being received
    const testClickListener = this.map.addListener('click', () => {
      console.log('🎨 TEST: Basic click detected on map')
    })
    this.drawingListeners.push(testClickListener)
    
    // Try both click and mousedown events
    const clickListener = this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      console.log('🎨 Circle drawing CLICK event:', { 
        isDrawing: this.isDrawing, 
        drawingMode: this.drawingMode, 
        hasLatLng: !!event.latLng,
        hasCurrentCircle: !!currentCircle,
        coordinates: event.latLng?.toJSON()
      })
      
      this.handleCircleDrawingClick(event, currentCircle, centerPoint, mouseMoveListener)
    })
    
    const mouseDownListener = this.map.addListener('mousedown', (event: google.maps.MapMouseEvent) => {
      console.log('🎨 Circle drawing MOUSEDOWN event:', { 
        isDrawing: this.isDrawing, 
        drawingMode: this.drawingMode, 
        hasLatLng: !!event.latLng,
        hasCurrentCircle: !!currentCircle,
        coordinates: event.latLng?.toJSON()
      })
      
      // Only handle mousedown if click isn't working
      if (this.drawingMode === DrawingMode.CIRCLE && event.latLng) {
        this.handleCircleDrawingClick(event, currentCircle, centerPoint, mouseMoveListener)
      }
    })
    
    this.drawingListeners.push(clickListener, mouseDownListener)
  }
  
  private handleCircleDrawingClick(
    event: google.maps.MapMouseEvent, 
    currentCircle: google.maps.Circle | null, 
    centerPoint: google.maps.LatLng | null, 
    mouseMoveListener: google.maps.MapsEventListener | null
  ) {
    if (this.drawingMode !== DrawingMode.CIRCLE || !event.latLng) {
      console.log('🎨 Click ignored - not in circle mode or no coordinates')
      return
    }
    
    // Prevent event from propagating to other map listeners
    event.stop?.()
    console.log('🎨 Click event captured for circle drawing')

    if (!this.isDrawing && !currentCircle) {
      // First click: Start drawing circle
      console.log('🎨 Starting circle drawing at:', event.latLng.toJSON())
      this.isDrawing = true
      
      // Store the center point for this drawing session
      const newCenterPoint = event.latLng
      
      const newCurrentCircle = new google.maps.Circle({
        ...this.circleOptions,
        center: newCenterPoint,
        radius: 1000, // Default 1km radius
        map: this.map
      })

      console.log('🎨 Created initial circle with 1km radius')

      // Set up mousemove to adjust radius as user moves mouse
      const newMouseMoveListener = this.map.addListener('mousemove', (moveEvent: google.maps.MapMouseEvent) => {
        if (!moveEvent.latLng) return
        const radius = google.maps.geometry.spherical.computeDistanceBetween(newCenterPoint, moveEvent.latLng)
        newCurrentCircle.setRadius(Math.max(radius, 10)) // Minimum 10 meter radius
      })

      this.drawingListeners.push(newMouseMoveListener)
      
      // Update the variables for the next click
      currentCircle = newCurrentCircle
      centerPoint = newCenterPoint
      mouseMoveListener = newMouseMoveListener
      
    } else if (this.isDrawing && currentCircle && centerPoint) {
      // Second click: Finish drawing circle
      console.log('🎨 Finishing circle drawing')
      
      // Calculate final radius
      const finalRadius = google.maps.geometry.spherical.computeDistanceBetween(centerPoint, event.latLng)
      currentCircle.setRadius(Math.max(finalRadius, 10)) // Minimum 10 meter radius
      console.log('🎨 Final circle radius:', finalRadius)
      
      // Clean up listeners
      if (mouseMoveListener) {
        google.maps.event.removeListener(mouseMoveListener)
        mouseMoveListener = null
      }
      
      // Reset state
      this.isDrawing = false
      this.setDrawingMode(DrawingMode.NONE)
      
      // Notify completion
      this.onOverlayComplete?.(currentCircle, DrawingMode.CIRCLE)
      
      // Reset for next drawing
      currentCircle = null
      centerPoint = null
    }
  }

  private setupPolygonDrawing() {
    console.log('🎨 Setting up polygon drawing mode')
    
    const clickListener = this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      console.log('🎨 Polygon drawing click event:', { 
        isDrawing: this.isDrawing, 
        drawingMode: this.drawingMode, 
        hasLatLng: !!event.latLng,
        pathLength: this.polygonPath.length,
        coordinates: event.latLng?.toJSON()
      })
      
      if (this.drawingMode !== DrawingMode.POLYGON || !event.latLng) {
        console.log('🎨 Click ignored - not in polygon mode or no coordinates')
        return
      }
      
      // Prevent event from propagating to other map listeners
      event.stop?.()
      console.log('🎨 Click event captured for polygon drawing')

      this.polygonPath.push(event.latLng)

      if (this.polygonPath.length === 1) {
        // Start drawing polygon
        this.isDrawing = true
      }

      // Create or update polygon
      if (this.polygonPath.length >= 2) {
        // Create polygon preview
        const polygon = new google.maps.Polygon({
          ...this.polygonOptions,
          paths: this.polygonPath,
          map: this.map
        })

        // Set up mousemove for live preview
        const mouseMoveListener = this.map.addListener('mousemove', (moveEvent: google.maps.MapMouseEvent) => {
          if (!moveEvent.latLng || !this.isDrawing) return
          const tempPath = [...this.polygonPath, moveEvent.latLng]
          polygon.setPaths(tempPath)
        })

        this.drawingListeners.push(mouseMoveListener)
      }
    })

    // Double-click or right-click to finish polygon
    const dblClickListener = this.map.addListener('dblclick', () => {
      if (this.drawingMode !== DrawingMode.POLYGON || this.polygonPath.length < 3) return

      const polygon = new google.maps.Polygon({
        ...this.polygonOptions,
        paths: this.polygonPath,
        map: this.map
      })

      this.isDrawing = false
      this.polygonPath = []
      this.setDrawingMode(DrawingMode.NONE)
      this.onOverlayComplete?.(polygon, DrawingMode.POLYGON)
    })

    this.drawingListeners.push(clickListener, dblClickListener)
  }

  private clearDrawingListeners() {
    this.drawingListeners.forEach(listener => google.maps.event.removeListener(listener))
    this.drawingListeners = []
  }

  destroy() {
    this.clearDrawingListeners()
    this.map.setOptions({ draggableCursor: null })
  }
}

// Create drawing controls UI
export function createDrawingControls(
  onModeChange: (mode: DrawingMode) => void
): HTMLElement {
  const controlDiv = document.createElement('div')
  controlDiv.className = 'drawing-controls'
  controlDiv.style.cssText = `
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    margin: 10px;
    display: flex;
    overflow: hidden;
  `

  const buttons = [
    { mode: DrawingMode.NONE, text: '✋', title: 'Stop drawing' },
    { mode: DrawingMode.CIRCLE, text: '○', title: 'Draw a circle' },
    { mode: DrawingMode.POLYGON, text: '▲', title: 'Draw a shape' }
  ]

  buttons.forEach(({ mode, text, title }) => {
    const button = document.createElement('button')
    button.textContent = text
    button.title = title
    button.style.cssText = `
      border: none;
      background: white;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
      border-right: 1px solid #e0e0e0;
      transition: background-color 0.2s;
    `
    
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#f5f5f5'
    })
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = mode === DrawingMode.NONE ? 'white' : 'white'
    })

    button.addEventListener('click', () => {
      console.log('🎨 Drawing control clicked:', mode)
      
      // Update active state
      controlDiv.querySelectorAll('button').forEach(btn => {
        btn.style.backgroundColor = 'white'
        btn.style.fontWeight = 'normal'
        btn.style.color = '#333'
      })
      
      if (mode !== DrawingMode.NONE) {
        button.style.backgroundColor = '#9B51E0'
        button.style.fontWeight = 'bold'
        button.style.color = 'white'
      }
      
      onModeChange(mode)
    })

    controlDiv.appendChild(button)
  })

  // Remove border from last button
  const lastButton = controlDiv.lastElementChild as HTMLElement
  if (lastButton) {
    lastButton.style.borderRight = 'none'
  }

  return controlDiv
}