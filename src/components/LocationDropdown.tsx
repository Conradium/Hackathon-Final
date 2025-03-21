"use client"

import { useState, useEffect } from "react"
import { MapPin, ChevronDown, Compass, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

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
}

const LocationDropdown = ({ userLocation, landmarks, className }: LocationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [sortedLandmarks, setSortedLandmarks] = useState<Landmark[]>([])
  const [heading, setHeading] = useState<number | null>(null)
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null)
  const [orientationSupported, setOrientationSupported] = useState(true)

  // Request device orientation permission
  useEffect(() => {
    // Check if DeviceOrientationEvent is available
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      // iOS 13+ requires permission
      const requestPermission = async () => {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission()
          setPermissionState(permission)
        } catch (error) {
          console.error("Error requesting device orientation permission:", error)
          setPermissionState("denied")
        }
      }

      requestPermission()
    } else if (window.DeviceOrientationEvent) {
      // Other browsers don't need permission
      setPermissionState("granted")
    } else {
      // Device orientation not supported (common on laptops/desktops)
      setOrientationSupported(false)
    }
  }, [])

  // Handle device orientation for compass heading
  useEffect(() => {
    if (permissionState !== "granted" || !orientationSupported) return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Check if we have the alpha value (compass direction)
      if (event.alpha !== null) {
        setHeading(event.alpha)
      } else {
        // Some devices don't provide alpha even though they support the event
        setOrientationSupported(false)
      }
    }

    window.addEventListener("deviceorientation", handleOrientation)

    // Set a timeout to check if we're getting orientation data
    const timeoutId = setTimeout(() => {
      if (heading === null) {
        setOrientationSupported(false)
      }
    }, 3000)

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
      clearTimeout(timeoutId)
    }
  }, [permissionState, heading])

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

  const openInMaps = (latitude: string, longitude: string) => {
    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng)) {
      console.error("Invalid coordinates:", latitude, longitude)
      return
    }

    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank")
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
      {!orientationSupported && (
        <Alert className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Compass orientation is not available on your device. Direction information will not be shown.
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

      <Button variant="outline" className="w-full justify-between" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4" />
          <span className="mr-1">Nearest landmark:</span>
          <span className="font-medium">{sortedLandmarks[0]?.place_name_en || sortedLandmarks[0]?.place_name_jp}</span>
          <span className={cn("ml-2 text-sm", getDistanceClass(sortedLandmarks[0]?.distance))}>
            ({getDistanceText(sortedLandmarks[0]?.distance)})
          </span>
        </div>
        <div className="flex items-center">
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
                        className="w-full justify-between px-2 py-1 h-auto"
                        onClick={() => openInMaps(landmark.latitude, landmark.longitude)}
                      >
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span className="text-left">
                            {landmark.place_name_en || landmark.place_name_jp}
                            {landmark.Toilet && <span className="ml-1 text-blue-500 text-xs">(🚻)</span>}
                            {landmark.Parking && <span className="ml-1 text-blue-500 text-xs">(🅿️)</span>}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {heading !== null && landmark.bearing !== undefined && (
                            <span
                              className={cn(
                                "mr-2 text-xs",
                                getDirectionColor(getRelativeDirection(landmark.bearing, heading)),
                              )}
                            >
                              {getRelativeDirection(landmark.bearing, heading)}
                            </span>
                          )}
                          <span className={cn("text-sm", getDistanceClass(landmark.distance))}>
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

