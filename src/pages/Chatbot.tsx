
import { useState } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ChatInterface from '@/components/ChatInterface';

// Google Maps API Key - store in a more secure way in production
const GOOGLE_MAPS_API_KEY = 'AIzaSyC-zhUgXOMpO5JYq0rYyAUxhvVco50YCS0';
// Travel agent API configuration - in production, these should be stored securely
const TRAVEL_API_KEY = 'travel-agent-api-key-12345'; // Replace with your actual API key
const TRAVEL_API_ENDPOINT = 'https://api.yourtravelagent.com/v1/chat';

const ChatbotPage = () => {
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null)
  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* 🔥 Improved Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Travel Assistant</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with our intelligent travel agent to solve problems, get directions, and translate languages while you explore the world.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <ChatInterface 
                mapsApiKey={GOOGLE_MAPS_API_KEY} 
                travelApiKey={TRAVEL_API_KEY}
                travelApiEndpoint={TRAVEL_API_ENDPOINT}
              />
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ChatbotPage

