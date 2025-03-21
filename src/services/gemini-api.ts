// Google Gemini API integration

// The API key will be provided as an environment variable or directly in the code
// For production, always use environment variables
const GEMINI_API_KEY = "AIzaSyCkfMEYWYlT0aR07OYH14RqpTGQ82KI9N0" // Replace with your actual API key


import type { Landmark } from "@/components/LocationDropdown"

export interface GeminiRequestOptions {
  prompt: string
  userLocation?: GeolocationCoordinates | null
  landmarks?: Landmark[]
  nearestPOI?: Landmark | null
  language?: string
  maxTokens?: number
  temperature?: number
}

// Update error handling in the Gemini API
export async function generateGeminiResponse(options: GeminiRequestOptions): Promise<string> {
  try {
    // Find the nearest POI if not provided
    let nearestPOI = options.nearestPOI
    if (!nearestPOI && options.userLocation && options.landmarks && options.landmarks.length > 0) {
      nearestPOI = findNearestLandmark(options.userLocation, options.landmarks)
    }

    // Find the next place based on Number_in_place
    const nextPlace = findNextPlace(nearestPOI, options.landmarks || [])

    // Calculate wind direction (relative direction to the nearest POI)
    const windDirection = calculateWindDirection(options.userLocation, nearestPOI)

    // Format user location as a string
    const userLocationStr = options.userLocation
      ? `${options.userLocation.latitude.toFixed(5)}, ${options.userLocation.longitude.toFixed(5)}`
      : "Unknown"

    // Construct the system prompt
    const systemPrompt = `You are Katsuoji Temple tour guide. You are guiding the visitor. Language: ${options.language || ""}, the user's location is ${userLocationStr}. Nearest POI: ${nearestPOI?.place_name_en || "Unknown"}, ${windDirection}. The next place is ${nextPlace?.place_name_en || "Unknown"}`

    console.log("System prompt:", systemPrompt)

    try {
      // Make the actual API call to Google Gemini
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: systemPrompt,
                  },
                  {
                    text: options.prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: options.temperature || 0.7,
              maxOutputTokens: options.maxTokens || 800,
            },
          }),
        },
      )

      if (!response.ok) {
        console.error("Gemini API error status:", response.status)
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text
      } else {
        console.error("Unexpected Gemini API response format:", data)
        throw new Error("Unexpected response format from Gemini API")
      }
    } catch (apiError) {
      console.error("API call failed:", apiError)
      throw apiError // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error("Error generating response from Gemini:", error)

    // Fallback responses if the API call fails
    if (options.prompt.toLowerCase().includes("history")) {
      return "Katsuoji Temple, founded in 727 CE during the Nara period, is famous for its Daruma dolls and is known as the 'Winner's Temple'. It's located in Minoh, Osaka Prefecture, and is dedicated to Monju Bosatsu, the Buddhist deity of wisdom."
    } else if (options.prompt.toLowerCase().includes("daruma")) {
      return "The Daruma Hall (Daruma-dō) is located in the central area of the temple complex. From the main gate, follow the path uphill for about 200 meters, and you'll see it on your right. It houses thousands of Daruma dolls of various sizes."
    } else if (options.prompt.toLowerCase().includes("festival")) {
      return "The next major festival at Katsuoji Temple is the Setsubun Festival on February 3rd. During this event, there's a bean-throwing ceremony to drive away evil spirits and welcome good fortune for the coming year."
    } else {
      return "I'm your AI guide for Katsuoji Temple. I can provide information about the temple's history, locations, festivals, and cultural significance. What would you like to know?"
    }
  }
}

// Helper function to find the nearest landmark to the user
function findNearestLandmark(userLocation: GeolocationCoordinates, landmarks: Landmark[]): Landmark | null {
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

// Helper function to find the next place based on Number_in_place
function findNextPlace(currentPlace: Landmark | null, landmarks: Landmark[]): Landmark | null {
  if (!currentPlace || landmarks.length === 0) return null

  // Parse the current place's Number_in_place
  const currentNumber = Number.parseInt(currentPlace.Number_in_place)
  if (isNaN(currentNumber)) return null

  // Find the next sequential number
  const nextNumber = currentNumber + 1

  // Find the landmark with the next number
  const nextPlace = landmarks.find((landmark) => Number.parseInt(landmark.Number_in_place) === nextNumber)

  // If there is no next number, loop back to the first one
  if (!nextPlace) {
    // Find the landmark with the smallest Number_in_place
    return landmarks.reduce(
      (min, landmark) => {
        const number = Number.parseInt(landmark.Number_in_place)
        if (isNaN(number)) return min
        if (!min || number < Number.parseInt(min.Number_in_place)) return landmark
        return min
      },
      null as Landmark | null,
    )
  }

  return nextPlace
}

// Helper function to calculate wind direction (relative direction to the nearest POI)
function calculateWindDirection(userLocation: GeolocationCoordinates | null, nearestPOI: Landmark | null): string {
  if (!userLocation || !nearestPOI) return "Unknown"

  const landmarkLat = Number.parseFloat(nearestPOI.latitude)
  const landmarkLng = Number.parseFloat(nearestPOI.longitude)

  if (isNaN(landmarkLat) || isNaN(landmarkLng)) return "Unknown"

  // Calculate bearing
  const φ1 = (userLocation.latitude * Math.PI) / 180
  const φ2 = (landmarkLat * Math.PI) / 180
  const Δλ = ((landmarkLng - userLocation.longitude) * Math.PI) / 180

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = Math.atan2(y, x)
  const bearing = ((θ * 180) / Math.PI + 360) % 360 // in degrees

  // Convert bearing to cardinal direction
  const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest", "North"]
  const index = Math.round(bearing / 45)
  return directions[index]
}

