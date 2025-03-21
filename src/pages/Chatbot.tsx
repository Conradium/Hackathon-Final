"use client"

import { useState, useEffect } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import ChatInterface from "@/components/ChatInterface"
import DirectionPointer from "@/components/DirectionPointer"
import LocationDropdown, { type Landmark } from "@/components/LocationDropdown"
import { fetchAndParseCSV, convertToLandmarks } from "@/utils/csv-parser"
import { Loader } from "lucide-react"

// Google Maps API Key - store in a more secure way in production
const GOOGLE_MAPS_API_KEY = "AIzaSyBpri8mwEB1oWWV_GI641DNZiB3SnQqFmA"
// Travel agent API configuration - in production, these should be stored securely
const TRAVEL_API_KEY = "travel-agent-api-key-12345" // Replace with your actual API key
const TRAVEL_API_ENDPOINT = "https://api.yourtravelagent.com/v1/chat"

// CSV file URL - use the Vercel Blob Storage URL as fallback
const LANDMARKS_CSV_URL = "/data/landmarks.csv"

// Add fallback landmarks data
const FALLBACK_LANDMARKS: Landmark[] = [
  {
    Number_in_place: "1",
    place_name_raw: "main_gate",
    place_name_jp: "山門",
    place_name_en: "Main Gate",
    desc_jp: "勝尾寺の正門です。",
    desc_en: "The main entrance gate to Katsuoji Temple.",
    latitude: "34.8546",
    longitude: "135.4286",
  },
  {
    Number_in_place: "2",
    place_name_raw: "main_hall",
    place_name_jp: "本堂",
    place_name_en: "Main Hall",
    desc_jp: "勝尾寺の本堂です。",
    desc_en: "The main hall of Katsuoji Temple where the principal image is enshrined.",
    latitude: "34.8548",
    longitude: "135.4288",
  },
  {
    Number_in_place: "3",
    place_name_raw: "daruma_hall",
    place_name_jp: "達磨堂",
    place_name_en: "Daruma Hall",
    desc_jp: "勝尾寺の達磨堂です。多くの達磨人形が奉納されています。",
    desc_en: "The Daruma Hall where thousands of Daruma dolls are dedicated for good fortune.",
    latitude: "34.8550",
    longitude: "135.4290",
  },
  {
    Number_in_place: "4",
    place_name_raw: "bell_tower",
    place_name_jp: "鐘楼",
    place_name_en: "Bell Tower",
    desc_jp: "勝尾寺の鐘楼です。",
    desc_en: "The bell tower of Katsuoji Temple.",
    latitude: "34.8552",
    longitude: "135.4292",
  },
  {
    Number_in_place: "5",
    place_name_raw: "pagoda",
    place_name_jp: "五重塔",
    place_name_en: "Five-storied Pagoda",
    desc_jp: "勝尾寺の五重塔です。",
    desc_en: "The five-storied pagoda of Katsuoji Temple.",
    latitude: "34.8554",
    longitude: "135.4294",
  },
]

const ChatbotPage = () => {
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null)
  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [nearestPOI, setNearestPOI] = useState<Landmark | null>(null)
  const [heading, setHeading] = useState<number | null>(null)

  // Fetch landmarks data from CSV
  useEffect(() => {
    const loadLandmarks = async () => {
      try {
        setLoading(true)

        try {
          const rawData = await fetchAndParseCSV(LANDMARKS_CSV_URL)
          const landmarksData = convertToLandmarks(rawData)

          if (landmarksData && landmarksData.length > 0) {
            setLandmarks(landmarksData)
            setError(null)
            return
          }
        } catch (fetchError) {
          console.error("Error fetching CSV:", fetchError)
          // Continue to fallback
        }

        // Use fallback data if fetch fails or returns empty data
        console.log("Using fallback landmarks data")
        setLandmarks(FALLBACK_LANDMARKS)
        setError(null)
      } catch (err) {
        console.error("Error loading landmarks:", err)
        setError("Failed to load landmarks data. Using default landmarks.")
        // Still use fallback data even if there's an error
        setLandmarks(FALLBACK_LANDMARKS)
      } finally {
        setLoading(false)
      }
    }

    loadLandmarks()
  }, [])

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position.coords)
        },
        (error) => {
          console.error("Error getting location:", error)
          // We'll handle the error in the DirectionPointer component
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    }
  }, [])

  // Get device orientation for compass heading
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(event.alpha)
      }
    }

    window.addEventListener("deviceorientation", handleOrientation)

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [])

  // Find nearest POI when user location or landmarks change
  useEffect(() => {
    if (currentLocation && landmarks.length > 0) {
      const nearest = findNearestLandmark(currentLocation, landmarks)
      setNearestPOI(nearest)

      // If we couldn't find a nearest landmark, use the first one as fallback
      if (!nearest && landmarks.length > 0) {
        setNearestPOI(landmarks[0])
      }
    } else if (landmarks.length > 0) {
      // If no location but we have landmarks, use the first one
      setNearestPOI(landmarks[0])
    }
  }, [currentLocation, landmarks])

  // Helper function to find the nearest landmark
  const findNearestLandmark = (userLocation: GeolocationCoordinates, landmarks: Landmark[]): Landmark | null => {
    if (!userLocation || landmarks.length === 0) return null

    let nearestLandmark: Landmark | null = null
    let shortestDistance = Number.POSITIVE_INFINITY

    landmarks.forEach((landmark) => {
      const landmarkLat = Number.parseFloat(landmark.latitude)
      const landmarkLng = Number.parseFloat(landmark.longitude)

      if (isNaN(landmarkLat) || isNaN(landmarkLng)) return

      // Calculate distance using Haversine formula
      const R = 6371e3 // Earth radius in meters
      const φ1 = (userLocation.latitude * Math.PI) / 180
      const φ2 = (landmarkLat * Math.PI) / 180
      const Δφ = ((landmarkLat - userLocation.latitude) * Math.PI) / 180
      const Δλ = ((landmarkLng - userLocation.longitude) * Math.PI) / 180

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      if (distance < shortestDistance) {
        shortestDistance = distance
        nearestLandmark = landmark
      }
    })

    return nearestLandmark
  }

  // Handle location selection
  const handleLocationSelect = (locationName: string) => {
    setSelectedLocation(locationName)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Katsuoji Temple Guide</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore Katsuoji Temple with our AI-powered guide. Find landmarks, get directions, and learn about the
              temple's rich history.
            </p>
          </div>

          <div className="flex justify-center flex-col">
            {/* 3D Direction Pointer */}
            <DirectionPointer userLocation={currentLocation} nearestPOI={nearestPOI} heading={heading} height="400px" />

            {/* Location dropdown */}
            <div className="mb-4">
              {loading ? (
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                  <p>Loading landmarks data...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                  <p>{error}</p>
                </div>
              ) : (
                <LocationDropdown
                  userLocation={currentLocation}
                  landmarks={landmarks}
                  onSelectLocation={handleLocationSelect}
                />
              )}
            </div>

            {/* Chat interface */}
            <ChatInterface
              mapsApiKey={GOOGLE_MAPS_API_KEY}
              travelApiKey={TRAVEL_API_KEY}
              travelApiEndpoint={TRAVEL_API_ENDPOINT}
              userLocation={currentLocation}
              landmarks={landmarks}
              onSelectLocation={setSelectedLocation}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ChatbotPage

