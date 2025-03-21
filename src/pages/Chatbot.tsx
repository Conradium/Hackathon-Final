"use client"

import { useState, useEffect } from "react"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import ChatInterface from "@/components/ChatInterface"
import UserLocationMap from "@/components/UserLocationMap"
import LocationDropdown, { type Landmark } from "@/components/LocationDropdown"
import { fetchAndParseCSV, convertToLandmarks } from "@/utils/csv-parser"
import { Loader } from "lucide-react"

// Google Maps API Key - store in a more secure way in production
const GOOGLE_MAPS_API_KEY = "AIzaSyBpri8mwEB1oWWV_GI641DNZiB3SnQqFmA"
// Travel agent API configuration - in production, these should be stored securely
const TRAVEL_API_KEY = "travel-agent-api-key-12345" // Replace with your actual API key
const TRAVEL_API_ENDPOINT = "https://api.yourtravelagent.com/v1/chat"

// CSV file URL - use the Vercel Blob Storage URL as fallback
const LANDMARKS_CSV_URL =
  "public/data/landmarks.csv"

const ChatbotPage = () => {
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null)
  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  // Fetch landmarks data from CSV
  useEffect(() => {
    const loadLandmarks = async () => {
      try {
        setLoading(true)
        const rawData = await fetchAndParseCSV(LANDMARKS_CSV_URL)
        const landmarksData = convertToLandmarks(rawData)
        setLandmarks(landmarksData)
        setError(null)
      } catch (err) {
        console.error("Error loading landmarks:", err)
        setError("Failed to load landmarks data. Please try again later.")
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
          // We'll handle the error in the UserLocationMap component
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    }
  }, [])

  // Handle CSV upload
  const handleCsvUpload = (newLandmarks: Landmark[]) => {
    setLandmarks(newLandmarks)
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
            {/* Google Map showing user's location */}
            <UserLocationMap apiKey={GOOGLE_MAPS_API_KEY} height="400px" />


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

