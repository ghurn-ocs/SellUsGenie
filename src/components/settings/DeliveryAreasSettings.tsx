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

// Google Maps singleton loader
class GoogleMapsLoader {
  private static instance: GoogleMapsLoader
  private loaded = false
  private loading = false
  private callbacks: Array<(success: boolean) => void> = []

  private constructor() {}

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader
    }
    return GoogleMapsLoader.instance
  }

  public isLoaded(): boolean {
    return this.loaded && window.google?.maps?.drawing
  }

  public async load(): Promise<boolean> {
    // If already loaded, return true
    if (this.isLoaded()) {
      return true
    }

    // If currently loading, wait for completion
    if (this.loading) {
      return new Promise((resolve) => {
        this.callbacks.push(resolve)
      })
    }

    // Check if API key exists
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing')
      return false
    }

    // Start loading
    this.loading = true

    return new Promise((resolve) => {
      // Remove any existing scripts to prevent duplicates
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
      existingScripts.forEach(script => script.remove())

      // Clean up global state
      delete (window as any).initGoogleMaps
      delete (window as any).googleMapsLoading

      // Create callback function
      const callbackName = `googleMapsCallback_${Date.now()}`
      ;(window as any)[callbackName] = () => {
        // Wait for drawing library to be available
        let attempts = 0
        const maxAttempts = 50
        const checkDrawing = () => {
          if (window.google?.maps?.drawing) {
            this.loaded = true
            this.loading = false
            console.log('✅ Google Maps loaded successfully')
            resolve(true)
            this.callbacks.forEach(callback => callback(true))
            this.callbacks = []
            // Clean up callback
            delete (window as any)[callbackName]
          } else if (attempts < maxAttempts) {
            attempts++
            setTimeout(checkDrawing, 50)
          } else {
            this.loading = false
            console.error('❌ Google Maps Drawing library failed to load')
            resolve(false)
            this.callbacks.forEach(callback => callback(false))
            this.callbacks = []
            delete (window as any)[callbackName]
          }
        }
        checkDrawing()
      }

      // Create and load script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=drawing,places&callback=${callbackName}`
      script.async = true
      script.defer = true
      
      script.onerror = () => {
        this.loading = false
        console.error('❌ Failed to load Google Maps script')
        resolve(false)
        this.callbacks.forEach(callback => callback(false))
        this.callbacks = []
        delete (window as any)[callbackName]
      }
      
      document.head.appendChild(script)
    })
  }
}

const deliveryAreaSchema = z.object({
  name: z.string().min(1, 'Area name is required'),
  description: z.string().optional(),
  area_type: z.enum(['polygon', 'circle', 'postal_code', 'city']),
  postal_codes: z.array(z.string()).default([]),
  cities: z.array(z.string()).default([]),
  delivery_fee: z.number().min(0, 'Delivery fee must be 0 or greater'),
  free_delivery_threshold: z.number().min(0, 'Free delivery threshold must be 0 or greater').optional(),
  estimated_delivery_time_min: z.number().min(1, 'Minimum delivery time is required'),
  estimated_delivery_time_max: z.number().min(1, 'Maximum delivery time is required'),
  is_active: z.boolean().default(true),
  max_orders_per_day: z.number().min(1, 'Maximum orders per day must be at least 1'),
  operating_hours: z.any()
})

interface DeliveryAreasSettingsProps {
  storeId: string
}

export const DeliveryAreasSettings: React.FC<DeliveryAreasSettingsProps> = ({ storeId }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentMap, setCurrentMap] = useState<google.maps.Map | null>(null)
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null)
  const [currentOverlay, setCurrentOverlay] = useState<google.maps.Polygon | google.maps.Circle | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedCoordinates, setSelectedCoordinates] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const mapsLoader = GoogleMapsLoader.getInstance()

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
      postal_codes: [],
      cities: [],
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
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = form

  const areaType = watch('area_type')

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
          setUserLocation({ lat: 37.7749, lng: -122.4194 }) // San Francisco fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000 // 5 minutes
        }
      )
    } else {
      setLocationError('Geolocation is not supported by this browser.')
      setUserLocation({ lat: 37.7749, lng: -122.4194 })
    }
  }

  // Load Google Maps API
  useEffect(() => {
    const initializeMaps = async () => {
      console.log('🔄 Initializing Google Maps...')
      const success = await mapsLoader.load()
      setMapLoaded(success)
      if (success) {
        console.log('✅ Google Maps ready for use')
      } else {
        console.error('❌ Failed to load Google Maps')
      }
    }

    initializeMaps()
  }, [])

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
      if (currentOverlay) {
        currentOverlay.setMap(null)
        setCurrentOverlay(null)
      }
      if (drawingManager) {
        drawingManager.setMap(null)
        setDrawingManager(null)
      }
      google.maps.event.clearInstanceListeners(currentMap)
      setCurrentMap(null)
      setSelectedCoordinates(null)
    }
  }, [isCreateModalOpen, editingArea])

  // Handle area type changes - cleanup map when switching to non-map types
  useEffect(() => {
    if (currentMap && areaType !== 'circle' && areaType !== 'polygon') {
      console.log('🧹 Cleaning up map for non-map area type')
      if (currentOverlay) {
        currentOverlay.setMap(null)
        setCurrentOverlay(null)
      }
      if (drawingManager) {
        drawingManager.setMap(null)
        setDrawingManager(null)
      }
      google.maps.event.clearInstanceListeners(currentMap)
      setCurrentMap(null)
      setSelectedCoordinates(null)
    }
  }, [areaType, currentMap, currentOverlay, drawingManager])

  // Initialize map when modal opens and Google Maps is loaded
  useEffect(() => {
    if (!mapLoaded || (!isCreateModalOpen && !editingArea) || !mapRef.current) {
      return
    }

    // Only initialize for map-based area types and if no map exists
    if ((areaType !== 'circle' && areaType !== 'polygon') || currentMap) {
      return
    }

    const initializeMap = async () => {
      try {
        console.log('🗺️ Initializing Google Maps...')
        
        // Determine initial center and zoom
        let initialCenter = userLocation || { lat: 37.7749, lng: -122.4194 } // San Francisco fallback
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
        
        // Create map instance
        const map = new google.maps.Map(mapRef.current!, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        // Wait for map to be ready
        await new Promise<void>((resolve) => {
          google.maps.event.addListenerOnce(map, 'idle', resolve)
        })

        console.log('🎨 Creating drawing manager...')
        
        // Create drawing manager with default drawing mode based on area type
        const defaultDrawingMode = areaType === 'polygon' 
          ? google.maps.drawing.OverlayType.POLYGON 
          : google.maps.drawing.OverlayType.CIRCLE

        const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: editingArea ? null : defaultDrawingMode,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.CIRCLE,
              google.maps.drawing.OverlayType.POLYGON
            ]
          },
          polygonOptions: {
            fillColor: '#9B51E0',
            fillOpacity: 0.25,
            strokeWeight: 3,
            strokeColor: '#9B51E0',
            editable: true,
            draggable: true
          },
          circleOptions: {
            fillColor: '#9B51E0',
            fillOpacity: 0.25,
            strokeWeight: 3,
            strokeColor: '#9B51E0',
            editable: true,
            draggable: true
          }
        })

        drawingManager.setMap(map)

        // Handle overlay completion
        const handleOverlayComplete = (event: google.maps.drawing.OverlayCompleteEvent) => {
          console.log('✅ Shape completed:', event.type)
          
          // Remove previous overlay if exists
          if (currentOverlay) {
            currentOverlay.setMap(null)
          }
          
          // Store new overlay
          setCurrentOverlay(event.overlay as google.maps.Polygon | google.maps.Circle)
          
          // Clear drawing mode
          drawingManager.setDrawingMode(null)
          
          // Extract coordinates
          if (event.type === google.maps.drawing.OverlayType.POLYGON) {
            const polygon = event.overlay as google.maps.Polygon
            const coordinates = polygon.getPath().getArray().map(point => ({
              lat: point.lat(),
              lng: point.lng()
            }))
            setSelectedCoordinates({ type: 'polygon', coordinates })
            setValue('area_type', 'polygon')
            
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
            
          } else if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
            const circle = event.overlay as google.maps.Circle
            const center = circle.getCenter()!
            const radius = circle.getRadius()
            const coordinates = {
              type: 'circle',
              center: { lat: center.lat(), lng: center.lng() },
              radius
            }
            setSelectedCoordinates(coordinates)
            setValue('area_type', 'circle')
            
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
          }
        }
        
        google.maps.event.addListener(drawingManager, 'overlaycomplete', handleOverlayComplete)
        
        setCurrentMap(map)
        setDrawingManager(drawingManager)
        
        // Add user location marker if available
        if (userLocation && !editingArea) {
          new google.maps.Marker({
            position: userLocation,
            map,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          })
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

    // Only initialize map for map-based area types
    if (areaType === 'circle' || areaType === 'polygon') {
      initializeMap()
    }
  }, [mapLoaded, isCreateModalOpen, editingArea, areaType, userLocation])


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
      setDrawingManager(null)
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
      postal_codes: area.postal_codes || [],
      cities: area.cities || [],
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
    if (confirm('Are you sure you want to delete this delivery area?')) {
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
    
    // Clean up map resources first
    if (currentOverlay) {
      currentOverlay.setMap(null)
      setCurrentOverlay(null)
    }
    if (drawingManager) {
      drawingManager.setMap(null)
      setDrawingManager(null)
    }
    if (currentMap) {
      // Clear all overlays and listeners
      google.maps.event.clearInstanceListeners(currentMap)
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
              <Dialog.Title className="text-xl font-semibold text-white mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-3" />
                {editingArea ? 'Edit Delivery Area' : 'Create Delivery Area'}
              </Dialog.Title>

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

                      <div>
                        <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                          Area Type *
                        </label>
                        <select
                          {...register('area_type')}
                          className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                        >
                          <option value="circle">Circle (radius-based)</option>
                          <option value="polygon">Custom Shape</option>
                          <option value="postal_code">Postal Codes</option>
                          <option value="city">Cities</option>
                        </select>
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

                  {/* Right Column - Map or Location Input */}
                  <div className="space-y-6">
                    {areaType === 'postal_code' && (
                      <div>
                        <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                          Postal Codes (one per line)
                        </label>
                        <textarea
                          placeholder="94102&#10;94103&#10;94104"
                          rows={8}
                          className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                          onChange={(e) => {
                            const codes = e.target.value.split('\n').filter(code => code.trim())
                            setValue('postal_codes', codes)
                          }}
                        />
                      </div>
                    )}

                    {areaType === 'city' && (
                      <div>
                        <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                          Cities (one per line)
                        </label>
                        <textarea
                          placeholder="San Francisco&#10;Oakland&#10;Berkeley"
                          rows={8}
                          className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                          onChange={(e) => {
                            const cities = e.target.value.split('\n').filter(city => city.trim())
                            setValue('cities', cities)
                          }}
                        />
                      </div>
                    )}

                    {(areaType === 'circle' || areaType === 'polygon') && (
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
                        <div className="relative">
                          <div
                            ref={mapRef}
                            className={`w-full h-96 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg ${mapLoaded ? 'block' : 'hidden'}`}
                            style={{ minHeight: '400px' }}
                          />
                          {!mapLoaded && (
                            <div className="w-full h-96 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg flex items-center justify-center">
                              {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                                <div className="text-center">
                                  <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                  <p className="text-red-400 font-medium">Google Maps API key is missing</p>
                                  <p className="text-xs text-[#A0A0A0] mt-1">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="w-12 h-12 border-4 border-[#9B51E0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                  <p className="text-[#A0A0A0]">Loading Google Maps...</p>
                                  <p className="text-xs text-[#A0A0A0] mt-1">Please wait while we initialize the map</p>
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
                              ? 'Use the drawing tools above the map to define your delivery area:'
                              : 'Map is loading...'
                            }
                          </p>
                          {mapLoaded && (
                            <ul className="text-xs text-[#A0A0A0] list-disc list-inside space-y-1 ml-2">
                              <li>Click the <strong>circle tool</strong> to draw a circular delivery area</li>
                              <li>Click the <strong>polygon tool</strong> to draw a custom shaped area</li>
                              <li>After selecting a tool, click and drag on the map to draw</li>
                              <li>You can edit shapes after drawing by dragging the control points</li>
                              {userLocation && !editingArea && (
                                <li className="text-green-400">📍 Blue dot shows your current location</li>
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
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