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
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedCoordinates, setSelectedCoordinates] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(userPos)
          setLocationError(null)
          console.log('User location obtained:', userPos)
        },
        (error) => {
          console.log('Geolocation error:', error.message)
          setLocationError('Could not get your location. Using default location.')
          // Fallback to San Francisco
          setUserLocation({ lat: 37.7749, lng: -122.4194 })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
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
    const loadGoogleMaps = async () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.drawing) {
        setMapLoaded(true)
        return
      }

      if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        console.error('Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file')
        return
      }

      // Check if script is already loading/loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        // Script exists, wait for it to load
        const checkLoaded = () => {
          if (window.google && window.google.maps && window.google.maps.drawing) {
            setMapLoaded(true)
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=drawing,places&loading=async`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        // Poll for drawing library to be available
        const checkDrawingLibrary = () => {
          if (window.google && window.google.maps && window.google.maps.drawing) {
            console.log('Google Maps with Drawing Library loaded successfully')
            setMapLoaded(true)
          } else {
            setTimeout(checkDrawingLibrary, 50)
          }
        }
        checkDrawingLibrary()
      }
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error)
      }
      
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Get user location when modal opens
  useEffect(() => {
    if (isCreateModalOpen || editingArea) {
      getUserLocation()
    }
  }, [isCreateModalOpen, editingArea])

  // Initialize map when modal opens and Google Maps is loaded
  useEffect(() => {
    if (mapLoaded && (isCreateModalOpen || editingArea) && mapRef.current && !currentMap && window.google?.maps?.drawing && userLocation) {
      try {
        console.log('Initializing Google Maps with location:', userLocation)
        
        // Determine initial center - use existing coordinates if editing, otherwise user location
        let initialCenter = userLocation
        let initialZoom = 12
        
        if (editingArea && selectedCoordinates) {
          if (selectedCoordinates.type === 'circle' && selectedCoordinates.center) {
            initialCenter = selectedCoordinates.center
            initialZoom = 14
          } else if (selectedCoordinates.type === 'polygon' && selectedCoordinates.coordinates && selectedCoordinates.coordinates.length > 0) {
            // Calculate center of polygon
            const lats = selectedCoordinates.coordinates.map((coord: any) => coord.lat)
            const lngs = selectedCoordinates.coordinates.map((coord: any) => coord.lng)
            initialCenter = {
              lat: lats.reduce((a: number, b: number) => a + b, 0) / lats.length,
              lng: lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length
            }
            initialZoom = 14
          }
        }
        
        // Create map instance
        const map = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true
        })

        // Wait for map to be fully initialized
        google.maps.event.addListenerOnce(map, 'idle', () => {
          console.log('Map initialized, creating drawing manager...')
          
          try {
            const drawing = new google.maps.drawing.DrawingManager({
              drawingMode: null, // Start with no drawing mode
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
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: '#9B51E0',
                editable: true,
                draggable: true
              },
              circleOptions: {
                fillColor: '#9B51E0',
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: '#9B51E0',
                editable: true,
                draggable: true
              }
            })

            drawing.setMap(map)
            console.log('Drawing manager created successfully')

            // Handle shape completion
            google.maps.event.addListener(drawing, 'overlaycomplete', (event: any) => {
              console.log('Shape completed:', event.type)
              
              // Remove previous overlays
              if (event.overlay) {
                // Clear drawing mode after completion
                drawing.setDrawingMode(null)
                
                if (event.type === 'polygon') {
                  const paths = event.overlay.getPath().getArray()
                  const coordinates = paths.map((path: google.maps.LatLng) => ({
                    lat: path.lat(),
                    lng: path.lng()
                  }))
                  setSelectedCoordinates({ type: 'polygon', coordinates })
                  setValue('area_type', 'polygon')
                  console.log('Polygon coordinates saved:', coordinates)
                } else if (event.type === 'circle') {
                  const center = event.overlay.getCenter()
                  const radius = event.overlay.getRadius()
                  const coordinatesData = {
                    type: 'circle',
                    center: { lat: center.lat(), lng: center.lng() },
                    radius
                  }
                  setSelectedCoordinates(coordinatesData)
                  setValue('area_type', 'circle')
                  console.log('Circle coordinates saved:', coordinatesData)
                }
              }
            })

            setCurrentMap(map)
            setDrawingManager(drawing)

            // Add a user location marker if available
            if (userLocation && !editingArea) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const marker = new google.maps.Marker({
                position: userLocation,
                map: map,
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

            // If editing and has existing coordinates, display them
            if (editingArea && selectedCoordinates) {
              if (selectedCoordinates.type === 'polygon' && selectedCoordinates.coordinates) {
                const paths = selectedCoordinates.coordinates.map((coord: any) => 
                  new google.maps.LatLng(coord.lat, coord.lng)
                )
                const polygon = new google.maps.Polygon({
                  paths: paths,
                  fillColor: '#9B51E0',
                  fillOpacity: 0.3,
                  strokeWeight: 2,
                  strokeColor: '#9B51E0',
                  editable: true,
                  draggable: true
                })
                polygon.setMap(map)
                
                // Add event listeners to capture coordinate changes when editing polygon
                const updatePolygonCoordinates = () => {
                  const path = polygon.getPath()
                  const coordinates = path.getArray().map((point: google.maps.LatLng) => ({
                    lat: point.lat(),
                    lng: point.lng()
                  }))
                  const updatedCoordinates = {
                    type: 'polygon',
                    coordinates
                  }
                  console.log('🔄 Polygon coordinates updated:', updatedCoordinates)
                  setSelectedCoordinates(updatedCoordinates)
                }
                
                console.log('🎯 Setting up polygon event listeners for editing...')
                
                // Listen for path changes (when vertices are moved or added/removed)
                const path = polygon.getPath()
                google.maps.event.addListener(path, 'set_at', () => {
                  console.log('📍 Polygon vertex moved')
                  updatePolygonCoordinates()
                })
                google.maps.event.addListener(path, 'insert_at', () => {
                  console.log('➕ Polygon vertex added')
                  updatePolygonCoordinates()
                })
                google.maps.event.addListener(path, 'remove_at', () => {
                  console.log('➖ Polygon vertex removed')  
                  updatePolygonCoordinates()
                })
                
                console.log('✅ Polygon event listeners attached successfully')
                
                // Center map on polygon
                const bounds = new google.maps.LatLngBounds()
                paths.forEach((point: google.maps.LatLng) => bounds.extend(point))
                map.fitBounds(bounds)
              } else if (selectedCoordinates.type === 'circle' && selectedCoordinates.center) {
                const circle = new google.maps.Circle({
                  center: new google.maps.LatLng(selectedCoordinates.center.lat, selectedCoordinates.center.lng),
                  radius: selectedCoordinates.radius,
                  fillColor: '#9B51E0',
                  fillOpacity: 0.3,
                  strokeWeight: 2,
                  strokeColor: '#9B51E0',
                  editable: true,
                  draggable: true
                })
                circle.setMap(map)
                
                // Add event listeners to capture coordinate changes when editing
                const updateCircleCoordinates = () => {
                  const center = circle.getCenter()
                  const radius = circle.getRadius()
                  if (center) {
                    const updatedCoordinates = {
                      type: 'circle',
                      center: { lat: center.lat(), lng: center.lng() },
                      radius
                    }
                    console.log('🔄 Circle coordinates updated:', updatedCoordinates)
                    setSelectedCoordinates(updatedCoordinates)
                  }
                }
                
                console.log('🎯 Setting up circle event listeners for editing...')
                
                // Listen for center changes (when dragged)
                google.maps.event.addListener(circle, 'center_changed', () => {
                  console.log('📍 Circle center changed event fired')
                  updateCircleCoordinates()
                })
                
                // Listen for radius changes (when resized)
                google.maps.event.addListener(circle, 'radius_changed', () => {
                  console.log('📏 Circle radius changed event fired')
                  updateCircleCoordinates()
                })
                
                console.log('✅ Circle event listeners attached successfully')
                
                // Center map on circle
                map.setCenter(circle.getCenter()!)
                map.setZoom(12)
              }
            }
          } catch (drawingError) {
            console.error('Error creating drawing manager:', drawingError)
          }
        })

      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }
  }, [mapLoaded, isCreateModalOpen, editingArea, setValue, selectedCoordinates, userLocation])

  // Cleanup map when modal closes
  useEffect(() => {
    if (!isCreateModalOpen && !editingArea && currentMap) {
      console.log('Cleaning up map resources')
      // Clear the map
      setCurrentMap(null)
      setDrawingManager(null)
      setSelectedCoordinates(null)
    }
  }, [isCreateModalOpen, editingArea, currentMap])

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
    setIsCreateModalOpen(false)
    setEditingArea(null)
    reset()
    setSelectedCoordinates(null)
    setCurrentMap(null)
    setDrawingManager(null)
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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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