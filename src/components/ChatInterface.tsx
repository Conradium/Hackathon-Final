"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { SendIcon, MapPinIcon, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

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

interface ChatInterfaceProps {
  mapsApiKey?: string
  travelApiKey?: string
  travelApiEndpoint?: string
}

const ChatInterface = ({ mapsApiKey, travelApiKey, travelApiEndpoint }: ChatInterfaceProps) => {
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
        "👋 Hello! I'm your AI travel assistant. Ask me anything about navigation, translations, or local recommendations!",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    }
    setMessages([welcomeMessage])
  }, [])

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
      // Log the API configuration for debugging
      console.log("Using Travel API:", travelApiEndpoint)
      console.log("Using Maps API:", mapsApiKey)

      // This is where you'd integrate with your API
      // For now, let's simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1000))

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

      if (isLocationRequest) {
        // Sample location data (in a real app, this would come from geocoding)
        const locationData = {
          lat: 40.7128,
          lng: -74.006,
          placeName: "New York City",
        }

        botResponse = {
          id: (Date.now() + 1).toString(),
          content: `I've found ${locationData.placeName} on the map. Would you like directions?`,
          sender: "bot",
          timestamp: new Date(),
          type: "location",
          locationData,
        }
      } else if (isTranslationRequest) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          content: "Here's the translation of what you asked for.",
          sender: "bot",
          timestamp: new Date(),
          type: "translation",
        }
      } else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          content:
            "I'm your AI travel assistant. I can help with travel recommendations, language translation, and navigation. What would you like to know?",
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

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your travels..."
            className="min-h-[2.5rem] resize-none"
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

