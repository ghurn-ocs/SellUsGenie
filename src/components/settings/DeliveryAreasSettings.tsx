import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  Settings,
  Eye,
  EyeOff,
  Map as MapIcon,
  Navigation,
  RotateCcw
} from 'lucide-react'
import { useDeliveryAreas } from '../../hooks/useDeliveryAreas'
import type { DeliveryAreaFormData, OperatingHours, DeliveryArea } from '../../types/deliveryAreas'
import { DEFAULT_OPERATING_HOURS } from '../../types/deliveryAreas'
import { useModal } from '../../contexts/ModalContext'
import { googleMapsLoader } from '../../utils/googleMapsLoader'
import { useGoogleMapsConfig } from '../../hooks/useGoogleMapsConfig'

const deliveryAreaSchema = z.object({
  name: z.string().min(1, 'Area name is required'),
  description: z.string().optional(),
  area_type: z.enum(['polygon', 'circle']),
  delivery_fee: z.number().min(0, 'Delivery fee must be 0 or greater'),
  free_delivery_threshold: z.number().min(0, 'Free delivery threshold must be 0 or greater').optional(),
  estimated_delivery_time_min: z.number().min(1, 'Minimum delivery time is required'),
  estimated_delivery_time_max: z.number().min(1, 'Maximum delivery time is required'),
  is_active: z.boolean().optional().default(true),
  max_orders_per_day: z.number().min(1, 'Maximum orders per day must be at least 1'),
  operating_hours: z.any()
})

interface DeliveryAreasSettingsProps {
  storeId: string
}

export const DeliveryAreasSettings: React.FC<DeliveryAreasSettingsProps> = ({ storeId }) => {
  const modal = useModal()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const { data: googleMapsConfig, isLoading: isLoadingGoogleMapsConfig } = useGoogleMapsConfig(storeId)
  const [currentMap, setCurrentMap] = useState<google.maps.Map | null>(null)
  const [drawingMode, setDrawingMode] = useState<'circle' | 'polygon' | null>(null)
  const [currentOverlay, setCurrentOverlay] = useState<google.maps.Polygon | google.maps.Circle | null>(null)
  const [polygonPoints, setPolygonPoints] = useState<google.maps.LatLngLiteral[]>([])
  const [isDrawingCircle, setIsDrawingCircle] = useState(false)
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedCoordinates, setSelectedCoordinates] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const mapsLoader = googleMapsLoader

  const {
    deliveryAreas,
    isLoading,
    createDeliveryArea,
    updateDeliveryArea,
    deleteDeliveryArea,
    toggleDeliveryArea
  } = useDeliveryAreas(storeId)

  const form = useForm<DeliveryAreaFormData>({
    resolver: zodResolver(deliveryAreaSchema),
    defaultValues: {
      name: '',
      description: '',
      area_type: 'circle',
      delivery_fee: 0,
      free_delivery_threshold: 0,
      estimated_delivery_time_min: 30,
      estimated_delivery_time_max: 60,
      is_active: true,
      max_orders_per_day: 50,
      operating_hours: DEFAULT_OPERATING_HOURS
    }
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = form

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLocationError(null)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(userPos)
          console.log('✅ User location obtained:', userPos)
        },
        (error) => {
          console.log('⚠️ Geolocation error:', error.message)
          setLocationError('Could not get your location. Using default location.')
          // No hardcoded fallback - user must enable location or manually set delivery areas
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000 // 5 minutes
        }
      )
    } else {
      setLocationError('Geolocation is not supported by this browser.')
      // No hardcoded fallback - user must enable location or manually set delivery areas
    }
  }

  // Google Maps API loading function (only called when modal opens)
  const initializeMaps = async () => {
    if (mapLoaded) {
      console.log('✅ Google Maps already loaded')
      return true
    }
    
    console.log('🔄 Initializing Google Maps for delivery area modal...')
    const success = await googleMapsLoader.load({ 
      libraries: ['geometry', 'places', 'marker'],
      apiKey: googleMapsConfig?.apiKey
    })
    setMapLoaded(success)
    if (success) {
      console.log('✅ Google Maps ready for use')
    } else {
      console.error('❌ Failed to load Google Maps')
    }
    return success
  }

  // Get user location when modal opens
  useEffect(() => {
    if (isCreateModalOpen || editingArea) {
      getUserLocation()
    }
  }, [isCreateModalOpen, editingArea])

  // Clean up map resources when modal closes
  useEffect(() => {
    if (!isCreateModalOpen && !editingArea && currentMap) {
      console.log('🧹 Cleaning up map resources on modal close')
      
      // Clean up click listener first
      if (clickListenerRef.current) {
        console.log('🧹 Removing click listener during cleanup')
        google.maps.event.removeListener(clickListenerRef.current)
        clickListenerRef.current = null
      }
      
      // Clean up overlay
      if (currentOverlay) {
        try {
          currentOverlay.setMap(null)
        } catch (error) {
          console.warn('Warning cleaning up overlay:', error)
        }
        setCurrentOverlay(null)
      }
      
      // Clean up map listeners
      try {
        google.maps.event.clearInstanceListeners(currentMap)
      } catch (error) {
        console.warn('Warning cleaning up map listeners:', error)
      }
      
      // Reset all state
      setDrawingMode(null)
      setPolygonPoints([])
      setIsDrawingCircle(false)
      setCurrentMap(null)
      setSelectedCoordinates(null)
    }
  }, [isCreateModalOpen, editingArea])


  // Initialize Google Maps and map when modal opens (lazy loading)
  useEffect(() => {
    console.log('🔍 Modal effect triggered:', {
      isCreateModalOpen,
      editingArea: !!editingArea,
      hasMapRef: !!mapRef.current,
      hasCurrentMap: !!currentMap,
      isLoadingConfig: isLoadingGoogleMapsConfig,
      hasConfig: !!googleMapsConfig
    })

    // Only load when modal is actually open
    if (!isCreateModalOpen && !editingArea) {
      console.log('🚫 Modal not open - skipping Google Maps loading')
      return
    }

    // Don't initialize if we already have a current map
    if (currentMap) {
      console.log('🚫 Map already exists - skipping initialization')
      return
    }

    // Wait for map ref to be available - check will happen after timeout

    const initializeGoogleMapsAndMap = async () => {
      // Check if mapRef is available after DOM render
      if (!mapRef.current) {
        console.log('🚫 Map ref still not ready after DOM delay - skipping initialization')
        return
      }

      try {
        // First, ensure Google Maps API is loaded (lazy loading only when needed)
        if (!isLoadingGoogleMapsConfig && googleMapsConfig) {
          console.log('🔄 Modal opened - loading Google Maps API lazily...')
          const success = await initializeMaps()
          if (!success) {
            console.error('❌ Failed to initialize Google Maps API')
            return
          }
        } else {
          console.log('⏳ Waiting for Google Maps config...', { isLoadingGoogleMapsConfig, hasConfig: !!googleMapsConfig })
          return
        }
      } catch (error) {
        console.error('❌ Error loading Google Maps API:', error)
        return
      }
    }

    // Wait for DOM to render before initializing maps
    const timeoutId = setTimeout(() => {
      console.log('🚀 Starting Google Maps initialization after DOM ready...')
      initializeGoogleMapsAndMap()
    }, 100) // Small delay to ensure modal DOM is rendered

    return () => clearTimeout(timeoutId)
  }, [isCreateModalOpen, editingArea, googleMapsConfig, isLoadingGoogleMapsConfig, currentMap])

  // Initialize map when Google Maps is loaded and modal is open
  useEffect(() => {
    if (!mapLoaded || (!isCreateModalOpen && !editingArea) || !mapRef.current) {
      return
    }

    // Skip if map already exists
    if (currentMap) {
      return
    }

    const initializeMap = async () => {
      try {
        console.log('🗺️ Initializing Google Maps...')
        
        // Determine initial center and zoom
        let initialCenter = userLocation || { lat: 0, lng: 0 } // Will be set dynamically
        let initialZoom = 12
        
        if (editingArea && selectedCoordinates) {
          if (selectedCoordinates.type === 'circle' && selectedCoordinates.center) {
            initialCenter = selectedCoordinates.center
            initialZoom = 13
          } else if (selectedCoordinates.type === 'polygon' && selectedCoordinates.coordinates?.length > 0) {
            const lats = selectedCoordinates.coordinates.map((coord: any) => coord.lat)
            const lngs = selectedCoordinates.coordinates.map((coord: any) => coord.lng)
            initialCenter = {
              lat: lats.reduce((a: number, b: number) => a + b, 0) / lats.length,
              lng: lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length
            }
            initialZoom = 13
          }
        }
        
        // Create map instance with Map ID for Advanced Markers
        const map = new google.maps.Map(mapRef.current!, {
          mapId: 'DELIVERY_AREAS_MAP', // Required for Advanced Markers
          center: initialCenter,
          zoom: initialZoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
          // Removed styles due to mapId conflict - mapId provides styling
          streetViewControl: false
        })

        // Wait for map to be ready
        await new Promise<void>((resolve) => {
          google.maps.event.addListenerOnce(map, 'idle', resolve)
        })

        console.log('🎨 Setting up modern click-based drawing...')
        
        // Modern click-based drawing implementation (no deprecated drawing library)
        const setupModernDrawing = () => {
          // Set initial drawing mode to circle for new areas
          if (!editingArea) {
            setDrawingMode('circle')
          }
        }
        
        setupModernDrawing()

        // Map is ready - click handler will be added in separate useEffect

        setCurrentMap(map)
        
        // Add user location marker if available using modern importLibrary
        if (userLocation && !editingArea) {
          try {
            // Import the marker library dynamically
            const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary
            
            // Create marker element
            const markerElement = document.createElement('div')
            markerElement.innerHTML = `
              <div style="
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background-color: #4285F4;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>
            `
            
            new AdvancedMarkerElement({
              position: userLocation,
              map,
              title: 'Your Location',
              content: markerElement
            })
            
            console.log('✅ User location marker added using AdvancedMarkerElement')
          } catch (error) {
            console.warn('⚠️ Failed to load marker library:', error)
            // Fallback: just log the location without marker
            console.log('📍 User location available but marker cannot be displayed:', userLocation)
          }
        }
        
        // Render existing coordinates if editing
        if (editingArea && selectedCoordinates) {
          let overlay: google.maps.Polygon | google.maps.Circle
          
          if (selectedCoordinates.type === 'polygon' && selectedCoordinates.coordinates) {
            const paths = selectedCoordinates.coordinates.map((coord: any) => 
              new google.maps.LatLng(coord.lat, coord.lng)
            )
            
            overlay = new google.maps.Polygon({
              paths,
              fillColor: '#9B51E0',
              fillOpacity: 0.25,
              strokeWeight: 3,
              strokeColor: '#9B51E0',
              editable: true,
              draggable: true
            })
            
            overlay.setMap(map)
            
            // Add edit listeners
            const updateCoordinates = () => {
              const updatedCoords = (overlay as google.maps.Polygon).getPath().getArray().map(point => ({
                lat: point.lat(),
                lng: point.lng()
              }))
              setSelectedCoordinates({ type: 'polygon', coordinates: updatedCoords })
            }
            
            const path = (overlay as google.maps.Polygon).getPath()
            google.maps.event.addListener(path, 'set_at', updateCoordinates)
            google.maps.event.addListener(path, 'insert_at', updateCoordinates)
            google.maps.event.addListener(path, 'remove_at', updateCoordinates)
            
            // Fit map to polygon
            const bounds = new google.maps.LatLngBounds()
            paths.forEach((point: google.maps.LatLng) => bounds.extend(point))
            map.fitBounds(bounds)
            
          } else if (selectedCoordinates.type === 'circle' && selectedCoordinates.center) {
            overlay = new google.maps.Circle({
              center: selectedCoordinates.center,
              radius: selectedCoordinates.radius,
              fillColor: '#9B51E0',
              fillOpacity: 0.25,
              strokeWeight: 3,
              strokeColor: '#9B51E0',
              editable: true,
              draggable: true
            })
            
            overlay.setMap(map)
            
            // Add edit listeners
            const updateCoordinates = () => {
              const center = (overlay as google.maps.Circle).getCenter()!
              const radius = (overlay as google.maps.Circle).getRadius()
              setSelectedCoordinates({
                type: 'circle',
                center: { lat: center.lat(), lng: center.lng() },
                radius
              })
            }
            
            google.maps.event.addListener(overlay, 'center_changed', updateCoordinates)
            google.maps.event.addListener(overlay, 'radius_changed', updateCoordinates)
            
            map.setCenter(selectedCoordinates.center)
          }
          
          setCurrentOverlay(overlay!)
        }
        
        console.log('✅ Map initialized successfully')
        
      } catch (error) {
        console.error('❌ Error initializing map:', error)
      }
    }

    // Initialize map for drawing
    initializeMap()
  }, [mapLoaded, isCreateModalOpen, editingArea, userLocation])


  // Manage map draggability and click handlers based on drawing mode
  useEffect(() => {
    console.log('🗺️ Map behavior effect triggered:', { hasMap: !!currentMap, drawingMode })
    if (!currentMap) return

    // Clean up any existing click listener first
    if (clickListenerRef.current) {
      console.log('🧹 Removing previous click listener')
      google.maps.event.removeListener(clickListenerRef.current)
      clickListenerRef.current = null
    }

    if (drawingMode) {
      // Disable dragging when in drawing mode
      currentMap.setOptions({ 
        draggable: false,
        disableDoubleClickZoom: true,
        draggableCursor: 'crosshair',
        draggingCursor: 'crosshair'
      })
      console.log('🎯 Drawing mode activated - map dragging disabled, mode:', drawingMode)

      // Add click handler for drawing
      const handleMapClick = (event: google.maps.MapMouseEvent) => {
        console.log('🖱️ Map click detected in drawing mode:', { 
          drawingMode, 
          hasLatLng: !!event.latLng,
          position: event.latLng ? { lat: event.latLng.lat(), lng: event.latLng.lng() } : null 
        })
        
        if (!event.latLng) {
          console.log('🚫 Click ignored - no position available')
          return
        }

        // Prevent default map behavior during drawing
        event.stop?.()

        const clickPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }

        console.log('✅ Processing click for drawing mode:', drawingMode, 'at position:', clickPosition)

        if (drawingMode === 'circle' && !isDrawingCircle) {
          // Start drawing circle - first click sets center
          console.log('🔵 Drawing circle at:', clickPosition)
          
          const circle = new google.maps.Circle({
            center: clickPosition,
            radius: 1000, // Default 1km radius
            fillColor: '#9B51E0',
            fillOpacity: 0.25,
            strokeWeight: 3,
            strokeColor: '#9B51E0',
            editable: true,
            draggable: true,
            map: currentMap
          })

          // Remove previous overlay if exists
          if (currentOverlay) {
            currentOverlay.setMap(null)
          }

          // Set states in correct order to avoid effect re-triggering issues
          setCurrentOverlay(circle)
          setSelectedCoordinates({
            type: 'circle',
            center: clickPosition,
            radius: 1000
          })
          setValue('area_type', 'circle')
          
          // Use setTimeout to defer state updates that trigger useEffect
          setTimeout(() => {
            setDrawingMode(null) // Stop drawing mode after circle is stable
            setIsDrawingCircle(false)
            
            // Re-enable map dragging after drawing is complete
            currentMap.setOptions({ 
              draggable: true,
              disableDoubleClickZoom: false,
              draggableCursor: 'grab',
              draggingCursor: 'grabbing'
            })
            console.log('🎯 Circle drawing completed - map dragging re-enabled')
          }, 100)

          // Add edit listeners
          const updateCoordinates = () => {
            const newCenter = circle.getCenter()!
            const newRadius = circle.getRadius()
            setSelectedCoordinates({
              type: 'circle',
              center: { lat: newCenter.lat(), lng: newCenter.lng() },
              radius: newRadius
            })
          }
          
          google.maps.event.addListener(circle, 'center_changed', updateCoordinates)
          google.maps.event.addListener(circle, 'radius_changed', updateCoordinates)

        } else if (drawingMode === 'polygon') {
          // Add point to polygon
          console.log('🔶 Adding polygon point:', clickPosition)
          setPolygonPoints(prevPoints => {
            const newPoints = [...prevPoints, clickPosition]
            console.log('🔶 Updated polygon points:', newPoints)
            
            // Create temporary markers to show points using modern importLibrary
            const createPointMarkers = async () => {
              try {
                // Import the marker library dynamically
                const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary
                
                newPoints.forEach((point, index) => {
                  const pointMarkerElement = document.createElement('div')
                  pointMarkerElement.innerHTML = `
                    <div style="
                      width: 12px;
                      height: 12px;
                      border-radius: 50%;
                      background-color: #9B51E0;
                      border: 2px solid white;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    "></div>
                  `
                  
                  new AdvancedMarkerElement({
                    position: point,
                    map: currentMap,
                    title: `Point ${index + 1}`,
                    content: pointMarkerElement
                  })
                })
                
                console.log(`✅ Added ${newPoints.length} polygon point markers`)
              } catch (error) {
                console.warn('⚠️ Failed to load marker library for polygon points:', error)
                // Continue without point markers
              }
            }
            
            createPointMarkers()

            if (newPoints.length >= 3) {
              console.log('🔶 Creating polygon with', newPoints.length, 'points')
              // Create/update polygon preview with current points
              if (currentOverlay) {
                currentOverlay.setMap(null)
              }

              const polygon = new google.maps.Polygon({
                paths: newPoints,
                fillColor: '#9B51E0',
                fillOpacity: 0.25,
                strokeWeight: 3,
                strokeColor: '#9B51E0',
                editable: true,
                draggable: true,
                map: currentMap
              })

              setCurrentOverlay(polygon)
              setSelectedCoordinates({ type: 'polygon', coordinates: newPoints })
              setValue('area_type', 'polygon')
              
              // Use setTimeout to defer state updates
              setTimeout(() => {
                setDrawingMode(null) // Complete drawing
                setPolygonPoints([])
                
                // Re-enable map dragging
                currentMap.setOptions({ 
                  draggable: true,
                  disableDoubleClickZoom: false,
                  draggableCursor: 'grab',
                  draggingCursor: 'grabbing'
                })
                console.log('🎯 Polygon drawing completed - map dragging re-enabled')
              }, 100)

              // Add edit listeners
              const updateCoordinates = () => {
                const updatedCoords = polygon.getPath().getArray().map(point => ({
                  lat: point.lat(),
                  lng: point.lng()
                }))
                setSelectedCoordinates({ type: 'polygon', coordinates: updatedCoords })
              }
              
              const path = polygon.getPath()
              google.maps.event.addListener(path, 'set_at', updateCoordinates)
              google.maps.event.addListener(path, 'insert_at', updateCoordinates)
              google.maps.event.addListener(path, 'remove_at', updateCoordinates)
            }
            
            return newPoints
          })
        }
      }

      // Add the click listener and store reference
      console.log('✅ Adding click listener to map for drawing mode:', drawingMode)
      clickListenerRef.current = google.maps.event.addListener(currentMap, 'click', handleMapClick)
    } else {
      // Re-enable dragging when not in drawing mode
      currentMap.setOptions({ 
        draggable: true,
        disableDoubleClickZoom: false,
        draggableCursor: 'grab',
        draggingCursor: 'grabbing'
      })
      console.log('🤏 Drawing mode deactivated - map dragging enabled')
    }

    // Cleanup function
    return () => {
      if (clickListenerRef.current) {
        console.log('🧹 Cleaning up click listener on effect cleanup')
        google.maps.event.removeListener(clickListenerRef.current)
        clickListenerRef.current = null
      }
    }
  }, [currentMap, drawingMode, isDrawingCircle, setValue])


  const onSubmit = async (data: DeliveryAreaFormData) => {
    try {
      const formData = {
        ...data,
        coordinates: selectedCoordinates
      }

      if (editingArea) {
        await updateDeliveryArea.mutateAsync({ id: editingArea.id, formData })
        setEditingArea(null)
      } else {
        await createDeliveryArea.mutateAsync(formData)
        setIsCreateModalOpen(false)
      }
      
      reset()
      setSelectedCoordinates(null)
      setCurrentMap(null)
      setDrawingMode(null)
      setPolygonPoints([])
      setIsDrawingCircle(false)
    } catch (error) {
      console.error('Error saving delivery area:', error)
    }
  }

  const handleEdit = (area: DeliveryArea) => {
    setEditingArea(area)
    reset({
      name: area.name,
      description: area.description || '',
      area_type: area.area_type,
      delivery_fee: area.delivery_fee,
      free_delivery_threshold: area.free_delivery_threshold || 0,
      estimated_delivery_time_min: area.estimated_delivery_time_min || 30,
      estimated_delivery_time_max: area.estimated_delivery_time_max || 60,
      is_active: area.is_active,
      max_orders_per_day: area.max_orders_per_day || 50,
      operating_hours: area.operating_hours || DEFAULT_OPERATING_HOURS
    })
    setSelectedCoordinates(area.coordinates)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await modal.showConfirmation({
      title: 'Delete Delivery Area',
      message: 'Are you sure you want to permanently delete this delivery area?\n\nCustomers in this area will no longer be able to place orders for delivery. This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete Area',
      cancelText: 'Keep Area',
      isDestructive: true
    })
    
    if (confirmed) {
      await deleteDeliveryArea.mutateAsync(id)
    }
  }

  const handleToggleActive = async (area: DeliveryArea) => {
    await toggleDeliveryArea.mutateAsync({
      id: area.id,
      is_active: !area.is_active
    })
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const closeModal = () => {
    console.log('🚪 Closing modal and cleaning up...')
    
    // Clean up click listener first
    if (clickListenerRef.current) {
      console.log('🧹 Removing click listener on modal close')
      google.maps.event.removeListener(clickListenerRef.current)
      clickListenerRef.current = null
    }
    
    // Clean up map resources with error handling
    if (currentOverlay) {
      try {
        currentOverlay.setMap(null)
      } catch (error) {
        console.warn('Warning cleaning up overlay on close:', error)
      }
      setCurrentOverlay(null)
    }
    
    // Reset drawing state
    setDrawingMode(null)
    setPolygonPoints([])
    setIsDrawingCircle(false)
    
    if (currentMap) {
      try {
        // Clear all overlays and listeners
        google.maps.event.clearInstanceListeners(currentMap)
      } catch (error) {
        console.warn('Warning cleaning up map listeners on close:', error)
      }
      setCurrentMap(null)
    }
    
    // Reset component state
    setIsCreateModalOpen(false)
    setEditingArea(null)
    setSelectedCoordinates(null)
    setLocationError(null)
    reset()
    
    console.log('✅ Modal cleanup complete')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Delivery Areas</h3>
          <p className="text-sm text-[#A0A0A0] mt-1">
            Define where you deliver and set delivery fees for each area
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#A051E0] rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Area</span>
        </button>
      </div>

      {/* Delivery Areas List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-[#A0A0A0]">Loading delivery areas...</div>
        ) : deliveryAreas.length === 0 ? (
          <div className="text-center py-12 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
            <MapPin className="w-12 h-12 text-[#A0A0A0] mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">No delivery areas configured</h4>
            <p className="text-[#A0A0A0] text-sm mb-4">
              Add your first delivery area to start offering delivery services
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#A051E0] rounded-lg font-medium transition-colors"
            >
              Add Delivery Area
            </button>
          </div>
        ) : (
          deliveryAreas.map((area) => (
            <div
              key={area.id}
              className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-6 hover:border-[#9B51E0] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${area.is_active ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <div>
                    <h4 className="text-white font-medium">{area.name}</h4>
                    <p className="text-sm text-[#A0A0A0]">{area.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(area)}
                    className="p-2 text-[#A0A0A0] hover:text-white transition-colors"
                    title={area.is_active ? 'Disable' : 'Enable'}
                  >
                    {area.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(area)}
                    className="p-2 text-[#A0A0A0] hover:text-[#9B51E0] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(area.id)}
                    className="p-2 text-[#A0A0A0] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-[#A0A0A0]" />
                  <span className="text-[#A0A0A0]">Delivery Fee:</span>
                  <span className="text-white font-medium">
                    {area.delivery_fee === 0 ? 'Free' : `$${area.delivery_fee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#A0A0A0]" />
                  <span className="text-[#A0A0A0]">Delivery Time:</span>
                  <span className="text-white font-medium">
                    {formatTime(area.estimated_delivery_time_min || 30)} - {formatTime(area.estimated_delivery_time_max || 60)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapIcon className="w-4 h-4 text-[#A0A0A0]" />
                  <span className="text-[#A0A0A0]">Type:</span>
                  <span className="text-white font-medium capitalize">{area.area_type.replace('_', ' ')}</span>
                </div>
              </div>

              {area.free_delivery_threshold && area.free_delivery_threshold > 0 && (
                <div className="mt-3 text-sm">
                  <span className="text-green-400">Free delivery on orders over ${area.free_delivery_threshold.toFixed(2)}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog.Root open={isCreateModalOpen || !!editingArea} onOpenChange={closeModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl w-full max-w-6xl z-50 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <Dialog.Title className="text-xl font-semibold text-white mb-2 flex items-center">
                <MapPin className="w-6 h-6 mr-3" />
                {editingArea ? 'Edit Delivery Area' : 'Create Delivery Area'}
              </Dialog.Title>
              <Dialog.Description className="text-[#A0A0A0] text-sm mb-6">
                {editingArea ? 'Update the delivery area settings and boundaries.' : 'Define a new delivery area with boundaries and settings.'}
              </Dialog.Description>

              <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Basic Information</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                          Area Name *
                        </label>
                        <input
                          {...register('name')}
                          className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                          placeholder="e.g., Downtown Area, North District"
                        />
                        {errors.name && (
                          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                          Description
                        </label>
                        <textarea
                          {...register('description')}
                          rows={3}
                          className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                          placeholder="Optional description of this delivery area"
                        />
                      </div>

                    </div>

                    {/* Delivery Settings */}
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Delivery Settings</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                            Delivery Fee ($)
                          </label>
                          <input
                            {...register('delivery_fee', { valueAsNumber: true })}
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                          />
                          {errors.delivery_fee && (
                            <p className="text-red-400 text-sm mt-1">{errors.delivery_fee.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                            Free Delivery Over ($)
                          </label>
                          <input
                            {...register('free_delivery_threshold', { valueAsNumber: true })}
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                            placeholder="0 = no threshold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                            Min Delivery Time (minutes)
                          </label>
                          <input
                            {...register('estimated_delivery_time_min', { valueAsNumber: true })}
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                          />
                          {errors.estimated_delivery_time_min && (
                            <p className="text-red-400 text-sm mt-1">{errors.estimated_delivery_time_min.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                            Max Delivery Time (minutes)
                          </label>
                          <input
                            {...register('estimated_delivery_time_max', { valueAsNumber: true })}
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                          />
                          {errors.estimated_delivery_time_max && (
                            <p className="text-red-400 text-sm mt-1">{errors.estimated_delivery_time_max.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                          Max Orders Per Day
                        </label>
                        <input
                          {...register('max_orders_per_day', { valueAsNumber: true })}
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                        />
                        {errors.max_orders_per_day && (
                          <p className="text-red-400 text-sm mt-1">{errors.max_orders_per_day.message}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          {...register('is_active')}
                          type="checkbox"
                          className="w-4 h-4 text-[#9B51E0] border-[#3A3A3A] rounded focus:ring-[#9B51E0] bg-[#1E1E1E]"
                        />
                        <label className="text-sm text-[#A0A0A0]">
                          Active (available for delivery)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Map Drawing */}
                  <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-[#A0A0A0]">
                            Draw Delivery Area
                          </label>
                          <div className="flex items-center space-x-2">
                            {locationError && (
                              <span className="text-xs text-orange-400 flex items-center">
                                <Navigation className="w-3 h-3 mr-1" />
                                {locationError}
                              </span>
                            )}
                            {userLocation && !locationError && (
                              <span className="text-xs text-green-400 flex items-center">
                                <Navigation className="w-3 h-3 mr-1" />
                                Location detected
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={getUserLocation}
                              className="text-xs text-[#9B51E0] hover:text-[#A051E0] flex items-center"
                              title="Get my location"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Refresh Location
                            </button>
                          </div>
                        </div>
                        
                        {/* Drawing Controls */}
                        {mapLoaded && (
                          <div className="flex items-center space-x-2 mb-3">
                            <button
                              type="button"
                              onClick={() => {
                                console.log('🔵 Circle drawing button clicked, previous mode:', drawingMode)
                                setDrawingMode('circle')
                                setIsDrawingCircle(false)
                                console.log('🔵 Drawing mode set to circle, current state will update on next render')
                              }}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                drawingMode === 'circle' 
                                  ? 'bg-[#9B51E0] text-white' 
                                  : 'bg-[#3A3A3A] text-[#A0A0A0] hover:bg-[#4A4A4A]'
                              }`}
                            >
                              {drawingMode === 'circle' ? '🎯 Click Map to Draw Circle' : 'Draw Circle'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                console.log('🔶 Polygon drawing button clicked')
                                setDrawingMode('polygon')
                                setPolygonPoints([])
                              }}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                drawingMode === 'polygon' 
                                  ? 'bg-[#9B51E0] text-white' 
                                  : 'bg-[#3A3A3A] text-[#A0A0A0] hover:bg-[#4A4A4A]'
                              }`}
                            >
                              {drawingMode === 'polygon' ? '🎯 Click Map Points' : 'Draw Polygon'}
                            </button>
                            {currentOverlay && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentOverlay) {
                                    currentOverlay.setMap(null)
                                    setCurrentOverlay(null)
                                    setSelectedCoordinates(null)
                                  }
                                }}
                                className="px-3 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                              >
                                Clear Area
                              </button>
                            )}
                          </div>
                        )}

                        <div className="relative">
                          <div
                            ref={mapRef}
                            className={`w-full h-96 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg ${mapLoaded ? 'block' : 'hidden'}`}
                            style={{ minHeight: '400px' }}
                          />
                          {!mapLoaded && (
                            <div className="w-full h-96 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg flex items-center justify-center">
                              {!googleMapsConfig?.isConfigured ? (
                                <div className="text-center p-8">
                                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                  </div>
                                  <p className="text-red-400 font-semibold text-lg mb-2">Google Maps API Key Missing</p>
                                  <p className="text-[#A0A0A0] text-sm max-w-md">
                                    To use delivery area mapping features, please configure your Google Maps API key.
                                  </p>
                                  <div className="mt-4 p-3 bg-[#2A2A2A] rounded-lg text-left">
                                    <p className="text-xs text-[#A0A0A0] mb-2">Options to configure:</p>
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-xs text-[#A0A0A0] mb-1">1. Environment file (.env):</p>
                                        <code className="text-xs text-[#9B51E0] font-mono">VITE_GOOGLE_MAPS_API_KEY=your_key</code>
                                      </div>
                                      <div>
                                        <p className="text-xs text-[#A0A0A0] mb-1">2. Store Settings (coming soon)</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : isLoadingGoogleMapsConfig ? (
                                <div className="text-center">
                                  <div className="w-12 h-12 border-4 border-[#9B51E0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                  <p className="text-white font-medium">Loading configuration...</p>
                                  <p className="text-xs text-[#A0A0A0] mt-1">Checking Google Maps settings</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="w-12 h-12 border-4 border-[#9B51E0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                  <p className="text-white font-medium">Loading Google Maps...</p>
                                  <p className="text-xs text-[#A0A0A0] mt-1">
                                    Using {
                                      googleMapsConfig?.source === 'system_api_keys' ? 'system platform' :
                                      googleMapsConfig?.source === 'env' ? 'environment' : 'store'
                                    } configuration
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          {selectedCoordinates && (
                            <div className="mt-2 p-2 bg-green-900/20 border border-green-400/20 rounded text-xs text-green-400">
                              ✓ {selectedCoordinates.type === 'polygon' ? 'Custom shape' : 'Circle'} area defined
                            </div>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-[#A0A0A0]">
                            {mapLoaded 
                              ? 'Use the drawing buttons above the map to define your delivery area:'
                              : 'Map is loading...'
                            }
                          </p>
                          {mapLoaded && (
                            <ul className="text-xs text-[#A0A0A0] list-disc list-inside space-y-1 ml-2">
                              <li>Click <strong>"Draw Circle"</strong>, then click on the map to place a circular delivery area</li>
                              <li>Click <strong>"Draw Polygon"</strong>, then click multiple points on the map to create a custom shape</li>
                              <li>For polygons, you need at least 3 points to create the shape</li>
                              <li>You can edit shapes after drawing by dragging the control points</li>
                              <li>Use <strong>"Clear Area"</strong> to remove the current area and start over</li>
                              {userLocation && !editingArea && (
                                <li className="text-green-400">📍 Blue dot shows your current location</li>
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-[#3A3A3A]">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 text-[#A0A0A0] bg-[#3A3A3A] rounded-lg hover:bg-[#4A4A4A] transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : editingArea ? 'Update Area' : 'Create Area'}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}