"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { SendIcon, MapPinIcon, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { generateGeminiResponse } from "@/services/gemini-api"
import type { Landmark } from "@/components/LocationDropdown"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "location" | "translation"
  locationData?: {
    lat?: number
    lng?: number
    placeName?: string
  }
}

// Update the interface to accept a function for setting the input value
interface ChatInterfaceProps {
  mapsApiKey?: string
  travelApiKey?: string
  travelApiEndpoint?: string
  userLocation?: GeolocationCoordinates | null
  landmarks?: Landmark[]
  onSelectLocation?: (locationName: string) => void
}

// Update the component to include suggested prompts and handle location selection
const ChatInterface = ({
  mapsApiKey,
  travelApiKey,
  travelApiEndpoint,
  userLocation,
  landmarks,
  onSelectLocation,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to the bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Initialize with a welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      content:
        "👋 Hello! I'm your AI temple guide. Ask me anything about Katsuoji Temple, its history, or nearby attractions!",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    }
    setMessages([welcomeMessage])
  }, [])

  // Make this function available to parent components
  useEffect(() => {
    if (onSelectLocation) {
      onSelectLocation = (locationName: string) => {
        setInputValue((prev) => `Tell me about ${locationName}`)
      }
    }
  }, [onSelectLocation])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!inputValue.trim()) return

    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Find the nearest POI
      let nearestPOI: Landmark | null = null
      if (userLocation && landmarks && landmarks.length > 0) {
        nearestPOI = landmarks.reduce(
          (nearest, landmark) => {
            if (!nearest) return landmark

            const landmarkLat = Number.parseFloat(landmark.latitude)
            const landmarkLng = Number.parseFloat(landmark.longitude)
            const nearestLat = Number.parseFloat(nearest.latitude)
            const nearestLng = Number.parseFloat(nearest.longitude)

            if (isNaN(landmarkLat) || isNaN(landmarkLng) || isNaN(nearestLat) || isNaN(nearestLng)) {
              return nearest
            }

            const distToLandmark = Math.sqrt(
              Math.pow(landmarkLat - userLocation.latitude, 2) + Math.pow(landmarkLng - userLocation.longitude, 2),
            )

            const distToNearest = Math.sqrt(
              Math.pow(nearestLat - userLocation.latitude, 2) + Math.pow(nearestLng - userLocation.longitude, 2),
            )

            return distToLandmark < distToNearest ? landmark : nearest
          },
          null as Landmark | null,
        )
      }

      // Generate response using Gemini API
      const response = await generateGeminiResponse({
        prompt: inputValue,
        userLocation,
        landmarks,
        nearestPOI,
        language: "", // Empty for now
      })

      // Detect if the message is about location
      const isLocationRequest =
        inputValue.toLowerCase().includes("where") ||
        inputValue.toLowerCase().includes("location") ||
        inputValue.toLowerCase().includes("map") ||
        inputValue.toLowerCase().includes("direction")

      // Detect if the message is about translation
      const isTranslationRequest =
        inputValue.toLowerCase().includes("translate") || inputValue.toLowerCase().includes("language")

      let botResponse: Message

      if (isLocationRequest && nearestPOI) {
        // Location data from the nearest POI
        const locationData = {
          lat: Number.parseFloat(nearestPOI.latitude),
          lng: Number.parseFloat(nearestPOI.longitude),
          placeName: nearestPOI.place_name_en || nearestPOI.place_name_jp,
        }

        botResponse = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: "bot",
          timestamp: new Date(),
          type: "location",
          locationData,
        }
      } else if (isTranslationRequest) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: "bot",
          timestamp: new Date(),
          type: "translation",
        }
      } else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: "bot",
          timestamp: new Date(),
          type: "text",
        }
      }

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error("Error processing message:", error)
      toast({
        title: "Communication Error",
        description: "Could not process your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenMap = (locationData?: { lat?: number; lng?: number; placeName?: string }) => {
    if (!locationData?.lat || !locationData?.lng) {
      toast({
        title: "Location Error",
        description: "Could not find coordinates for this location.",
        variant: "destructive",
      })
      return
    }

    // Open Google Maps in a new tab
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${locationData.lat},${locationData.lng}`
    window.open(mapUrl, "_blank")
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt)
  }

  return (
    <div className="flex flex-col h-[500px] rounded-xl border shadow-lg overflow-hidden glass-card">
      {/* Chat Header */}
      <div className="p-4 border-b bg-primary/10 flex items-center">
        <img
          src="/logo-placeholder.png"
          alt="Katsuōji Mate Logo"
          className="h-6 w-auto mr-2"
          onError={(e) => {
            // Fallback if image doesn't exist yet
            e.currentTarget.src = "https://via.placeholder.com/24x24?text=Logo"
          }}
        />
        <h3 className="font-semibold">Temple Assistant</h3>
      </div>

      {/* Messages Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex max-w-[80%] rounded-lg p-4",
              message.sender === "user" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-secondary",
            )}
          >
            <div>
              <div className="mb-1">{message.content}</div>

              {/* Location-specific UI */}
              {message.type === "location" && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center text-xs">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>Location services</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => handleOpenMap(message.locationData)}
                  >
                    Open Map
                  </Button>
                </div>
              )}

              {/* Translation-specific UI */}
              {message.type === "translation" && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center text-xs">
                    <Globe className="h-4 w-4 mr-1" />
                    <span>Translation service</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      Listen
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>AI is typing...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 border-t flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => handleSuggestedPrompt("Explain the history of Katsuoji Temple")}
        >
          Explain the history of Katsuoji Temple
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => handleSuggestedPrompt("Where is the Daruma Hall?")}
        >
          Where is the Daruma Hall?
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => handleSuggestedPrompt("What is the next major festival?")}
        >
          What is the next major festival?
        </Button>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-900">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your travels..."
            className="min-h-[2.5rem] resize-none, bg-gray-700"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="shrink-0">
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatInterface

