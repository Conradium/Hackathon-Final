"use client"

import { useState, useEffect } from "react"
import {
  Compass,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  CheckCircle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Landmark } from "@/components/LocationDropdown"

interface DirectionIndicatorProps {
  userLocation: GeolocationCoordinates | null
  nearestPOI: Landmark | null
  nextPOI: Landmark | null
  allPOIs: Landmark[]
  className?: string
  onReachedPOI?: (poi: Landmark) => void
}

// Distance threshold in meters to consider a POI as "reached"
const REACHED_THRESHOLD = 5

const DirectionIndicator = ({
  userLocation,
  nearestPOI,
  nextPOI,
  allPOIs,
  className,
  onReachedPOI,
}: DirectionIndicatorProps) => {
  const [bearing, setBearing] = useState<number>(0)
  const [distance, setDistance] = useState<string>("Unknown")
  const [distanceValue, setDistanceValue] = useState<number>(0)
  const [heading, setHeading] = useState<number | null>(null)
  const [direction, setDirection] = useState<string>("Unknown")
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null)
  const [targetPOI, setTargetPOI] = useState<Landmark | null>(null)
  const [reachedCurrentPOI, setReachedCurrentPOI] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)

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
    }
  }, [])

  const requestOrientationPermission = async () => {
    try {
      // This is the iOS-specific API
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        setPermissionState(permission)
      }
    } catch (error) {
      console.error("Error requesting device orientation permission:", error)
      setPermissionState("denied")
    }
  }

  // Handle device orientation for compass heading
  useEffect(() => {
    if (permissionState !== "granted") return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Check if we have the alpha value (compass direction)
      if (event.alpha !== null) {
        setHeading(event.alpha)
      }
    }

    window.addEventListener("deviceorientation", handleOrientation)

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [permissionState])

  // Determine which POI to target based on distance to nearest POI
  useEffect(() => {
    if (!userLocation || !nearestPOI) {
      setTargetPOI(null)
      setReachedCurrentPOI(false)
      return
    }

    // Calculate distance to nearest POI
    const distance = calculateDistance(userLocation, nearestPOI)
    setDistanceValue(distance)

    // If we're within the threshold of the nearest POI, target the next POI
    if (distance <= REACHED_THRESHOLD) {
      setReachedCurrentPOI(true)

      // If we have a next POI, target it
      if (nextPOI) {
        setTargetPOI(nextPOI)

        // Notify parent component that we've reached the current POI
        if (onReachedPOI) {
          onReachedPOI(nearestPOI)
        }
      } else {
        // If no next POI, keep targeting the nearest one
        setTargetPOI(nearestPOI)
      }
    } else {
      // If we're not close enough to the nearest POI, target it
      setReachedCurrentPOI(false)
      setTargetPOI(nearestPOI)
    }

    // Calculate progress through all POIs
    if (allPOIs.length > 0 && nearestPOI) {
      const currentIndex = allPOIs.findIndex((poi) => poi.Number_in_place === nearestPOI.Number_in_place)

      if (currentIndex >= 0) {
        const progressPercent = ((currentIndex + 1) / allPOIs.length) * 100
        setProgress(progressPercent)
      }
    }
  }, [userLocation, nearestPOI, nextPOI, allPOIs, onReachedPOI])

  // Calculate bearing and distance when user location or target POI changes
  useEffect(() => {
    if (!userLocation || !targetPOI) {
      setError("Location data unavailable. Please enable location services.")
      return
    }

    try {
      // Parse POI coordinates
      const poiLat = Number.parseFloat(targetPOI.latitude)
      const poiLng = Number.parseFloat(targetPOI.longitude)

      if (isNaN(poiLat) || isNaN(poiLng)) {
        setError("Invalid POI coordinates")
        return
      }

      // Calculate bearing
      const φ1 = (userLocation.latitude * Math.PI) / 180
      const φ2 = (poiLat * Math.PI) / 180
      const Δλ = ((poiLng - userLocation.longitude) * Math.PI) / 180

      const y = Math.sin(Δλ) * Math.cos(φ2)
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
      const θ = Math.atan2(y, x)
      const calculatedBearing = ((θ * 180) / Math.PI + 360) % 360 // in degrees

      setBearing(calculatedBearing)

      // Calculate distance
      const calculatedDistance = calculateDistance(userLocation, targetPOI)

      // Format distance
      if (calculatedDistance < 1000) {
        setDistance(`${Math.round(calculatedDistance)}m`)
      } else {
        setDistance(`${(calculatedDistance / 1000).toFixed(1)}km`)
      }

      // Update direction based on heading and bearing
      updateDirection(calculatedBearing, heading)

      setError(null)
    } catch (err) {
      console.error("Error calculating bearing:", err)
      setError("Error calculating direction")
    }
  }, [userLocation, targetPOI, heading])

  // Helper function to calculate distance between user and POI
  const calculateDistance = (userLocation: GeolocationCoordinates, poi: Landmark): number => {
    const poiLat = Number.parseFloat(poi.latitude)
    const poiLng = Number.parseFloat(poi.longitude)

    if (isNaN(poiLat) || isNaN(poiLng)) {
      return Number.POSITIVE_INFINITY
    }

    // Calculate distance using Haversine formula
    const R = 6371e3 // Earth radius in meters
    const φ1 = (userLocation.latitude * Math.PI) / 180
    const φ2 = (poiLat * Math.PI) / 180
    const Δφ = ((poiLat - userLocation.latitude) * Math.PI) / 180
    const Δλ = ((poiLng - userLocation.longitude) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // in meters
  }

  // Update direction when bearing or heading changes
  const updateDirection = (bearing: number, heading: number | null) => {
    if (heading === null) {
      // If no heading available, just show cardinal direction
      setDirection(getCardinalDirection(bearing))
      return
    }

    // Calculate the relative bearing
    const relativeBearing = (bearing - heading + 360) % 360

    // Convert to relative direction
    setDirection(getRelativeDirection(relativeBearing))
  }

  // Get cardinal direction
  const getCardinalDirection = (degrees: number): string => {
    const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest", "North"]
    return directions[Math.round(degrees / 45)]
  }

  // Get relative direction
  const getRelativeDirection = (relativeBearing: number): string => {
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

  // Get direction arrow
  const DirectionArrow = () => {
    switch (direction) {
      case "Ahead":
        return <ArrowUp className="h-24 w-24 text-primary" />
      case "Ahead-Right":
        return <ArrowUpRight className="h-24 w-24 text-primary" />
      case "Right":
        return <ArrowRight className="h-24 w-24 text-primary" />
      case "Behind-Right":
        return <ArrowDownRight className="h-24 w-24 text-primary" />
      case "Behind":
        return <ArrowDown className="h-24 w-24 text-primary" />
      case "Behind-Left":
        return <ArrowDownLeft className="h-24 w-24 text-primary" />
      case "Left":
        return <ArrowLeft className="h-24 w-24 text-primary" />
      case "Ahead-Left":
        return <ArrowUpLeft className="h-24 w-24 text-primary" />
      default:
        return <Compass className="h-24 w-24 text-muted-foreground" />
    }
  }

  return (
    <div className={cn("w-full rounded-xl overflow-hidden shadow-lg mb-6", className)}>
      {permissionState === "prompt" && (
        <div className="mb-4 p-4 bg-primary/10 rounded-lg">
          <p className="mb-2 text-sm">Compass functionality requires device orientation permission</p>
          <Button size="sm" onClick={requestOrientationPermission} className="w-full">
            Enable Compass
          </Button>
        </div>
      )}

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {/* Progress Bar */}
              <div className="w-full mb-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {Math.round(progress)}% of tour completed
                </p>
              </div>

              {/* POI Information */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {targetPOI?.place_name_en || targetPOI?.place_name_jp || "Unknown Location"}
                  </h3>
                  {reachedCurrentPOI && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {reachedCurrentPOI ? "You've reached this location! Proceed to next point." : `${distance} away`}
                </p>
                {reachedCurrentPOI && nextPOI && (
                  <p className="text-xs text-primary mt-1">Next: {nextPOI.place_name_en || nextPOI.place_name_jp}</p>
                )}
              </div>

              {/* Direction Arrow */}
              <div className="my-6 flex items-center justify-center">
                {reachedCurrentPOI ? <CheckCircle className="h-24 w-24 text-green-500" /> : <DirectionArrow />}
              </div>

              {/* Direction Text */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  <p className="text-xl font-semibold">{reachedCurrentPOI ? "Destination Reached" : direction}</p>
                </div>
                {heading !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Heading: {Math.round(heading)}° | Bearing: {Math.round(bearing)}°
                  </p>
                )}
              </div>

              {/* Description */}
              {targetPOI?.desc_en && (
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm">{targetPOI.desc_en}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DirectionIndicator

