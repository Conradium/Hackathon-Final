"use client"

import { useState, useEffect } from "react"
import { MapPin, ChevronDown, Compass, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Add TypeScript declaration for window.orientation
declare global {
  interface Window {
    onwebkitcompassheading?: any
  }
}

// Interface for landmark data from CSV
export interface Landmark {
  Number_in_place: string
  Toilet?: string
  Parking?: string
  place_name_raw: string
  place_name_jp: string
  place_name_en: string
  desc_jp: string
  desc_en: string
  latitude: string
  longitude: string
  // Calculated fields
  distance?: number
  bearing?: number
}

interface LocationDropdownProps {
  userLocation: GeolocationCoordinates | null
  landmarks: Landmark[]
  className?: string
  onSelectLocation?: (locationName: string) => void
}

const LocationDropdown = ({ userLocation, landmarks, className, onSelectLocation }: LocationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [sortedLandmarks, setSortedLandmarks] = useState<Landmark[]>([])
  const [heading, setHeading] = useState<number | null>(null)
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null)
  const [orientationSupported, setOrientationSupported] = useState(true)

  // Request device orientation permission
  useEffect(() => {
    // Check if DeviceOrientationEvent is available
    if (window.DeviceOrientationEvent) {
      // For non-iOS devices, permission is typically granted by default
      if (typeof (DeviceOrientationEvent as any).requestPermission !== "function") {
        setPermissionState("granted")
      } else {
        // For iOS, we'll need to show a button to request permission
        setPermissionState("prompt")
      }
    } else {
      // Device orientation not supported (common on laptops/desktops)
      setOrientationSupported(false)
    }
  }, [])

  const requestOrientationPermission = async () => {
    try {
      // This is the iOS-specific API
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        setPermissionState(permission)

        if (permission === "granted") {
          // Re-initialize orientation detection
          window.addEventListener("deviceorientation", handleOrientation)
        }
      }
    } catch (error) {
      console.error("Error requesting device orientation permission:", error)
      setPermissionState("denied")
      setOrientationSupported(false)
    }
  }

  // Define the handleOrientation function outside useEffect so we can reuse it
  const handleOrientation = (event: DeviceOrientationEvent) => {
    // Check if we have the alpha value (compass direction)
    if (event.alpha !== null) {
      setHeading(event.alpha)
    } else {
      // Some devices don't provide alpha even though they support the event
      setOrientationSupported(false)
    }
  }

  // Handle device orientation for compass heading
  useEffect(() => {
    if (permissionState !== "granted" || !orientationSupported) return

    let compassHeadingAvailable = false
    let orientationInitialized = false

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Check if we have the alpha value (compass direction)
      if (event.alpha !== null) {
        // For iOS devices, alpha is the compass heading
        setHeading(event.alpha)
        compassHeadingAvailable = true
        orientationInitialized = true
      } else if (
        // For some Android devices, we need to calculate the heading from beta and gamma
        event.beta !== null &&
        event.gamma !== null
      ) {
        try {
          // Get device orientation using screen orientation if available
          let orientationAngle = 0
          if (window.screen && window.screen.orientation) {
            orientationAngle = window.screen.orientation.angle
          }

          // Convert beta and gamma to heading
          const beta = event.beta
          const gamma = event.gamma

          // Calculate heading based on device orientation
          let heading = 0

          if (orientationAngle === 0) {
            heading = (Math.atan2(-gamma, beta) * 180) / Math.PI + 180
          } else if (orientationAngle === 90) {
            heading = (Math.atan2(beta, gamma) * 180) / Math.PI + 180
          } else if (orientationAngle === -90 || orientationAngle === 270) {
            heading = (Math.atan2(-beta, -gamma) * 180) / Math.PI + 180
          } else if (orientationAngle === 180) {
            heading = (Math.atan2(gamma, -beta) * 180) / Math.PI + 180
          }

          // Normalize heading to 0-360
          heading = (heading + 360) % 360

          setHeading(heading)
          compassHeadingAvailable = true
          orientationInitialized = true
        } catch (error) {
          console.error("Error calculating heading from beta/gamma:", error)
        }
      }
    }

    // For Android devices that support the WebKit implementation
    const handleWebkitOrientation = (event: any) => {
      if (event.webkitCompassHeading) {
        // WebKit compass heading is measured clockwise from north, so we need to convert
        const heading = 360 - event.webkitCompassHeading
        setHeading(heading)
        compassHeadingAvailable = true
        orientationInitialized = true
      }
    }

    // Add event listeners for both standard and webkit implementations
    window.addEventListener("deviceorientation", handleOrientation)
    window.addEventListener("deviceorientationabsolute", handleOrientation)

    // For older iOS/Safari versions
    if ("onwebkitcompassheading" in window) {
      window.addEventListener("webkitcompassheading", handleWebkitOrientation)
    }

    // Set a timeout to check if we're getting orientation data
    const timeoutId = setTimeout(() => {
      if (!orientationInitialized) {
        console.warn("Device orientation not providing heading data")
        setOrientationSupported(false)
      }
    }, 3000)

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
      window.removeEventListener("deviceorientationabsolute", handleOrientation)

      if ("onwebkitcompassheading" in window) {
        window.removeEventListener("webkitcompassheading", handleWebkitOrientation)
      }

      clearTimeout(timeoutId)
    }
  }, [permissionState, orientationSupported])

  // Add a fallback method for manual orientation
  const handleManualOrientation = () => {
    // Prompt user to point their device north and press a button
    setOrientationSupported(true)
    setHeading(0)
  }

  useEffect(() => {
    if (!userLocation || landmarks.length === 0) return

    // Calculate distances and bearings to all landmarks
    const landmarksWithDistance = landmarks.map((landmark) => {
      // Parse latitude and longitude
      const landmarkLat = Number.parseFloat(landmark.latitude)
      const landmarkLng = Number.parseFloat(landmark.longitude)

      // Skip invalid coordinates
      if (isNaN(landmarkLat) || isNaN(landmarkLng)) {
        return { ...landmark, distance: Number.POSITIVE_INFINITY, bearing: 0 }
      }

      // Calculate distance using Haversine formula
      const R = 6371e3 // Earth radius in meters
      const φ1 = (userLocation.latitude * Math.PI) / 180
      const φ2 = (landmarkLat * Math.PI) / 180
      const Δφ = ((landmarkLat - userLocation.latitude) * Math.PI) / 180
      const Δλ = ((landmarkLng - userLocation.longitude) * Math.PI) / 180

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      // Calculate bearing
      const y = Math.sin(Δλ) * Math.cos(φ2)
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
      const θ = Math.atan2(y, x)
      const bearing = ((θ * 180) / Math.PI + 360) % 360 // in degrees

      return {
        ...landmark,
        distance,
        bearing,
      }
    })

    // Sort by distance
    const sorted = [...landmarksWithDistance].sort(
      (a, b) => (a.distance || Number.POSITIVE_INFINITY) - (b.distance || Number.POSITIVE_INFINITY),
    )

    // Filter out landmarks with invalid coordinates
    const validLandmarks = sorted.filter(
      (landmark) => (landmark.distance || Number.POSITIVE_INFINITY) !== Number.POSITIVE_INFINITY,
    )

    setSortedLandmarks(validLandmarks)
  }, [userLocation, landmarks])

  const getDistanceText = (distance?: number) => {
    if (!distance) return "Unknown"

    if (distance < 1000) {
      return `${distance.toFixed(0)}m`
    } else {
      return `${(distance / 1000).toFixed(1)}km`
    }
  }

  const getDistanceClass = (distance?: number) => {
    if (!distance) return "text-muted-foreground"

    if (distance <= 100) return "text-green-500"
    if (distance <= 500) return "text-yellow-500"
    return "text-muted-foreground"
  }

  const getCardinalDirection = (bearing: number): string => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"]
    return directions[Math.round(bearing / 45)]
  }

  const getRelativeDirection = (bearing?: number, heading?: number | null): string => {
    if (heading === null || bearing === undefined) return "Unknown"

    // Calculate the relative bearing
    const relativeBearing = (bearing - heading + 360) % 360

    // Convert to relative direction
    if (relativeBearing >= 337.5 || relativeBearing < 22.5) return "Ahead"
    if (relativeBearing >= 22.5 && relativeBearing < 67.5) return "Ahead-Right"
    if (relativeBearing >= 67.5 && relativeBearing < 112.5) return "Right"
    if (relativeBearing >= 112.5 && relativeBearing < 157.5) return "Behind-Right"
    if (relativeBearing >= 157.5 && relativeBearing < 202.5) return "Behind"
    if (relativeBearing >= 202.5 && relativeBearing < 247.5) return "Behind-Left"
    if (relativeBearing >= 247.5 && relativeBearing < 292.5) return "Left"
    if (relativeBearing >= 292.5 && relativeBearing < 337.5) return "Ahead-Left"

    return "Unknown"
  }

  const getDirectionColor = (direction: string): string => {
    switch (direction) {
      case "Ahead":
        return "text-green-500"
      case "Ahead-Right":
      case "Ahead-Left":
        return "text-emerald-500"
      case "Right":
      case "Left":
        return "text-yellow-500"
      case "Behind-Right":
      case "Behind-Left":
        return "text-orange-500"
      case "Behind":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const selectLocation = (landmark: Landmark) => {
    if (onSelectLocation) {
      onSelectLocation(landmark.place_name_en || landmark.place_name_jp)
    }
  }

  if (sortedLandmarks.length === 0) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No landmarks found or location data is unavailable.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={cn("w-full mb-4", className)}>
      {permissionState === "prompt" && (
        <div className="mb-4 p-4 bg-primary/10 rounded-lg">
          <p className="mb-2 text-sm">Compass functionality requires device orientation permission</p>
          <Button size="sm" onClick={requestOrientationPermission} className="w-full">
            Enable Compass
          </Button>
        </div>
      )}
      {!orientationSupported && (
        <Alert className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <p>Compass orientation is not available on your device.</p>
              <Button size="sm" onClick={handleManualOrientation} className="w-full">
                Set North Manually
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {heading !== null && (
        <div className="rounded-lg bg-muted p-2 mb-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Compass className="h-4 w-4" />
            <p className="text-sm">
              Heading: {heading.toFixed(0)}° ({getCardinalDirection(heading)})
            </p>
          </div>
        </div>
      )}

      <Button variant="outline" className="w-full justify-between text-sm" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center overflow-hidden">
          <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="mr-1 whitespace-nowrap">Nearest:</span>
          <span className="font-medium truncate max-w-[100px] sm:max-w-[200px]">
            {sortedLandmarks[0]?.place_name_en || sortedLandmarks[0]?.place_name_jp}
          </span>
          <span className={cn("ml-2 text-xs whitespace-nowrap", getDistanceClass(sortedLandmarks[0]?.distance))}>
            ({getDistanceText(sortedLandmarks[0]?.distance)})
          </span>
        </div>
        <div className="flex items-center ml-1 flex-shrink-0">
          {heading !== null && sortedLandmarks[0]?.bearing !== undefined && (
            <span
              className={cn(
                "mr-2 text-xs",
                getDirectionColor(getRelativeDirection(sortedLandmarks[0]?.bearing, heading)),
              )}
            >
              {getRelativeDirection(sortedLandmarks[0]?.bearing, heading)}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </div>
      </Button>

      {isOpen && (
        <Card className="w-full mt-1">
          <CardContent className="p-1">
            <div className="space-y-1">
              {sortedLandmarks.slice(1, 10).map((landmark) => (
                <TooltipProvider key={landmark.Number_in_place}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between px-2 py-1 h-auto text-sm"
                        onClick={() => selectLocation(landmark)}
                      >
                        <div className="flex items-center overflow-hidden">
                          <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="text-left truncate max-w-[120px] sm:max-w-[200px]">
                            {landmark.place_name_en || landmark.place_name_jp}
                            {landmark.Toilet && <span className="ml-1 text-blue-500 text-xs">(🚻)</span>}
                            {landmark.Parking && <span className="ml-1 text-blue-500 text-xs">(🅿️)</span>}
                          </span>
                        </div>
                        <div className="flex items-center ml-1 flex-shrink-0">
                          {heading !== null && landmark.bearing !== undefined && (
                            <span
                              className={cn(
                                "mr-2 text-xs whitespace-nowrap",
                                getDirectionColor(getRelativeDirection(landmark.bearing, heading)),
                              )}
                            >
                              {getRelativeDirection(landmark.bearing, heading)}
                            </span>
                          )}
                          <span className={cn("text-xs whitespace-nowrap", getDistanceClass(landmark.distance))}>
                            {getDistanceText(landmark.distance)}
                          </span>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold">{landmark.place_name_en || landmark.place_name_jp}</p>
                      {landmark.desc_en && <p className="text-xs mt-1">{landmark.desc_en.substring(0, 150)}...</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LocationDropdown

