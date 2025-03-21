"use client"

import { useState, useEffect, useRef } from "react"
import { Loader, MapPin, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UserLocationMapProps {
  apiKey: string
  height?: string
}

// Declare google as a global variable to satisfy TypeScript
declare global {
  interface Window {
    google: any
  }
}

// Define simplified Google Maps types to avoid TypeScript errors
interface GoogleMap {
  setCenter: (latLng: LatLng) => void
  getCenter: () => { lat: () => number; lng: () => number }
}

interface GoogleMapOptions {
  center: LatLng
  zoom: number
  mapTypeId: string
  disableDefaultUI?: boolean
  zoomControl?: boolean
  mapTypeControl?: boolean
  scaleControl?: boolean
  streetViewControl?: boolean
  rotateControl?: boolean
  fullscreenControl?: boolean
}

interface LatLng {
  lat: number
  lng: number
}

interface GoogleMarker {
  setPosition: (latLng: LatLng) => void
  setTitle: (title: string) => void
}

interface GoogleMarkerOptions {
  position: LatLng
  map: GoogleMap
  icon?: any
  title?: string
}

const UserLocationMap = ({ apiKey, height = "300px" }: UserLocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [map, setMap] = useState<GoogleMap | null>(null)
  const [marker, setMarker] = useState<GoogleMarker | null>(null)

  // Default location (Katsuoji Temple in Japan)
  const defaultLocation: LatLng = { lat: 34.8546, lng: 135.4286 }

  // Load Google Maps API script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => initializeMap()
      script.onerror = () => setError("Failed to load Google Maps API")
      document.head.appendChild(script)
    }

    // Check if Google Maps API is already loaded
    if (!window.google?.maps) {
      loadGoogleMapsScript()
    } else {
      initializeMap()
    }

    return () => {
      // Clean up any map instances if needed
    }
  }, [apiKey])

  // Initialize map with default location first
  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) return

    setLoading(true)

    // Create map with default location first
    const mapOptions: GoogleMapOptions = {
      center: defaultLocation,
      zoom: 18,
      mapTypeId: window.google.maps.MapTypeId.SATELLITE,
      disableDefaultUI: false, // Enable some UI controls for manual navigation
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
    }

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions) as GoogleMap
    setMap(newMap)

    // Add a marker for the default position
    const newMarker = new window.google.maps.Marker({
      position: defaultLocation,
      map: newMap,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
      title: "Default Location (Katsuoji Temple)",
    }) as GoogleMarker
    setMarker(newMarker)

    // Now try to get user's location
    getUserLocation()
  }

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: LatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(userPos)
          updateMapLocation(userPos)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error("Error getting location:", err)
          setError(`Location access denied. Using default location. Error: ${err.message}`)
          setLoading(false)
          // Keep using the default location, which is already set
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
    }
  }

  // Update map with new location
  const updateMapLocation = (location: LatLng) => {
    if (!map || !marker) return

    // Update map center
    map.setCenter(location)

    // Update marker position
    marker.setPosition(location)
    marker.setTitle("Your Location")
  }

  // Handle manual location retry
  const handleRetryLocation = () => {
    setLoading(true)
    setError(null)
    getUserLocation()
  }

  // Handle manual location selection (center of current map view)
  const handleUseCurrentView = () => {
    if (!map) return

    const center = map.getCenter()
    if (center) {
      const newLocation: LatLng = {
        lat: center.lat(),
        lng: center.lng(),
      }
      setUserLocation(newLocation)

      if (marker) {
        marker.setPosition(newLocation)
        marker.setTitle("Selected Location")
      }

      setError(null)
    }
  }

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg mb-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={handleRetryLocation}>
                Retry Location Access
              </Button>
              <Button size="sm" variant="outline" onClick={handleUseCurrentView}>
                Use Current Map View
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full" style={{ height: height, display: loading ? "none" : "block" }} />

      <div className="mt-2 p-2 bg-muted/50 rounded-md text-sm text-muted-foreground">
        <p className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {userLocation
            ? `Current location: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
            : "Using default location (Katsuoji Temple)"}
        </p>
        <p className="text-xs mt-1">
          You can drag the map and zoom to navigate. If location access was denied, you can use the map controls to find
          your location manually.
        </p>
      </div>
    </div>
  )
}

export default UserLocationMap

