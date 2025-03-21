"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Compass, MapPin, AlertCircle, Navigation } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Landmark } from "@/components/LocationDropdown"
import type * as THREE from "three"

interface DirectionPointerProps {
  userLocation: GeolocationCoordinates | null
  nearestPOI: Landmark | null
  heading: number | null
  height?: string
}

// Triangle component that points in the direction of the POI
const Triangle = ({ bearing, heading }: { bearing: number; heading: number | null }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  // Calculate the rotation angle based on bearing and heading
  const rotationAngle = heading !== null ? ((bearing - heading) * Math.PI) / 180 : (bearing * Math.PI) / 180

  // Animate the triangle
  useFrame(() => {
    if (meshRef.current) {
      // Smoothly rotate to the target rotation
      meshRef.current.rotation.y = rotationAngle
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} rotation={[0, rotationAngle, 0]}>
      <coneGeometry args={[1, 2, 3]} />
      <meshStandardMaterial color="#1E3A8A" />
    </mesh>
  )
}

// Label component to show POI name
const POILabel = ({ name, distance }: { name: string; distance: string }) => {
  return (
    <Text
      position={[0, 2, 0]}
      fontSize={0.5}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.05}
      outlineColor="#000000"
    >
      {`${name} (${distance})`}
    </Text>
  )
}

// Main component
const DirectionPointer = ({ userLocation, nearestPOI, heading, height = "300px" }: DirectionPointerProps) => {
  const [bearing, setBearing] = useState<number>(0)
  const [distance, setDistance] = useState<string>("Unknown")
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [manualMode, setManualMode] = useState<boolean>(false)
  const [manualBearing, setManualBearing] = useState<number>(0)

  // Calculate bearing and distance when user location or nearest POI changes
  useEffect(() => {
    if (manualMode) return // Skip if in manual mode

    if (!userLocation) {
      setDebugInfo((prev) => prev + "\nNo user location available")
      setError("Location data unavailable. Please enable location services or use manual mode.")
      return
    }

    if (!nearestPOI) {
      setDebugInfo((prev) => prev + "\nNo landmarks found")
      setError("No landmarks found. Please try again later or use manual mode.")
      return
    }

    try {
      // Parse POI coordinates
      const poiLat = Number.parseFloat(nearestPOI.latitude)
      const poiLng = Number.parseFloat(nearestPOI.longitude)

      if (isNaN(poiLat) || isNaN(poiLng)) {
        setDebugInfo((prev) => prev + `\nInvalid POI coordinates: ${nearestPOI.latitude}, ${nearestPOI.longitude}`)
        setError("Invalid POI coordinates. Please try another landmark.")
        return
      }

      setDebugInfo(
        `User: ${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}\nPOI: ${poiLat.toFixed(5)}, ${poiLng.toFixed(5)}`,
      )

      // Calculate bearing
      const φ1 = (userLocation.latitude * Math.PI) / 180
      const φ2 = (poiLat * Math.PI) / 180
      const Δλ = ((poiLng - userLocation.longitude) * Math.PI) / 180

      const y = Math.sin(Δλ) * Math.cos(φ2)
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
      const θ = Math.atan2(y, x)
      const calculatedBearing = ((θ * 180) / Math.PI + 360) % 360 // in degrees

      setBearing(calculatedBearing)
      setDebugInfo((prev) => prev + `\nCalculated bearing: ${calculatedBearing.toFixed(2)}°`)

      // Calculate distance
      const R = 6371e3 // Earth radius in meters
      const Δφ = ((poiLat - userLocation.latitude) * Math.PI) / 180

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const calculatedDistance = R * c // in meters

      // Format distance
      if (calculatedDistance < 1000) {
        setDistance(`${Math.round(calculatedDistance)}m`)
      } else {
        setDistance(`${(calculatedDistance / 1000).toFixed(1)}km`)
      }

      setDebugInfo((prev) => prev + `\nCalculated distance: ${calculatedDistance.toFixed(2)}m`)
      setError(null)
    } catch (err) {
      console.error("Error calculating bearing:", err)
      setDebugInfo((prev) => prev + `\nError: ${err instanceof Error ? err.message : String(err)}`)
      setError("Error calculating direction. Please try again.")
    }
  }, [userLocation, nearestPOI, manualMode])

  // Get cardinal direction
  const getCardinalDirection = (degrees: number): string => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"]
    return directions[Math.round(degrees / 45)]
  }

  // Get relative direction based on heading
  const getRelativeDirection = (bearing: number, heading: number | null): string => {
    if (heading === null) return getCardinalDirection(bearing)

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

  // Handle manual mode toggle
  const toggleManualMode = () => {
    setManualMode(!manualMode)
    if (!manualMode) {
      // Set initial manual bearing
      setManualBearing(0)
    }
  }

  // Rotate the triangle in manual mode
  const rotateTriangle = (direction: "left" | "right") => {
    if (direction === "left") {
      setManualBearing((prev) => (prev - 45 + 360) % 360)
    } else {
      setManualBearing((prev) => (prev + 45) % 360)
    }
  }

  // Request location permission
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Success - the page will update with the new location
          setDebugInfo((prev) => prev + "\nLocation permission granted")
          setError(null)
        },
        (err) => {
          // Error
          setDebugInfo((prev) => prev + `\nLocation error: ${err.message} (${err.code})`)
          setError(`Location access denied: ${err.message}. Please enable location services in your browser settings.`)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      setDebugInfo((prev) => prev + "\nGeolocation not supported")
      setError("Geolocation is not supported by your browser. Please use manual mode.")
    }
  }

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg mb-6">
      {/* Mode toggle and location request */}
      <div className="bg-muted p-2 flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={toggleManualMode} className="flex items-center gap-2">
          {manualMode ? <Compass className="h-4 w-4" /> : <Navigation className="h-4 w-4" />}
          {manualMode ? "Use GPS" : "Manual Mode"}
        </Button>

        {!manualMode && (
          <Button variant="outline" size="sm" onClick={requestLocationPermission} className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Request Location
          </Button>
        )}
      </div>

      {error && !manualMode ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={toggleManualMode}>
                Switch to Manual Mode
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Direction info */}
          <Card className="mb-2">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <p className="font-medium">
                      {manualMode
                        ? "Manual Navigation"
                        : nearestPOI?.place_name_en || nearestPOI?.place_name_jp || "Unknown Location"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {manualMode ? "Use controls below" : `${distance} away`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Compass className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <p className="font-medium">
                      {manualMode ? getCardinalDirection(manualBearing) : getRelativeDirection(bearing, heading)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {manualMode
                        ? `Bearing: ${manualBearing}°`
                        : heading !== null
                          ? `Heading: ${Math.round(heading)}°`
                          : "No compass data"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3D Canvas */}
          <div style={{ height }}>
            <Canvas camera={{ position: [0, 3, 5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              {manualMode ? (
                <Triangle bearing={manualBearing} heading={0} />
              ) : (
                <Triangle bearing={bearing} heading={heading} />
              )}
              {!manualMode && nearestPOI && (
                <POILabel name={nearestPOI.place_name_en || nearestPOI.place_name_jp} distance={distance} />
              )}
              {manualMode && <POILabel name="Manual Direction" distance={getCardinalDirection(manualBearing)} />}
              <OrbitControls enableZoom={false} enablePan={false} />
              <gridHelper args={[10, 10, "#888888", "#444444"]} />
            </Canvas>
          </div>

          {/* Manual controls */}
          {manualMode && (
            <div className="bg-muted p-4 flex justify-center gap-4">
              <Button onClick={() => rotateTriangle("left")} className="flex items-center gap-2">
                ← Rotate Left
              </Button>
              <Button onClick={() => rotateTriangle("right")} className="flex items-center gap-2">
                Rotate Right →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Debug info - can be removed in production */}
      {debugInfo && (
        <details className="mt-2 text-xs bg-muted p-2 rounded-md">
          <summary className="cursor-pointer font-medium">Debug Info</summary>
          <pre className="mt-2 p-2 bg-muted/50 rounded-md overflow-auto max-h-32 whitespace-pre-wrap">{debugInfo}</pre>
        </details>
      )}
    </div>
  )
}

export default DirectionPointer

