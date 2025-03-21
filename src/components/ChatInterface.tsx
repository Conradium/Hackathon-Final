"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { SendIcon, MapPinIcon, Globe, PlusCircle, X, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { generateGeminiResponse } from "@/services/gemini-api"
import type { Landmark } from "@/components/LocationDropdown"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"


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
  userLocation?: GeolocationCoordinates | null
  landmarks?: Landmark[]
  onSelectLocation?: (locationName: string) => void
}

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

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

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast({
                title: "Camera Access Error",
                description: "Could not access the camera. Please ensure permissions are granted.",
                variant: "destructive",
            });
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();

            tracks.forEach((track) => {
                track.stop();
            });

            videoRef.current.srcObject = null;
        }
    };

    const openCamera = () => {
        setIsCameraModalOpen(true);
        startCamera();
    };

    const closeCamera = () => {
        setIsCameraModalOpen(false);
        stopCamera();
    }

  const capturePhoto = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');

          if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                  if (blob) {
                      const file = new File([blob], "captured_photo.jpg", { type: 'image/jpeg' });
                      setSelectedImage(file);

                      const reader = new FileReader();
                      reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                      }
                      reader.readAsDataURL(file);
                      closeCamera();
                      setIsImageModalOpen(false);
                  }
              }, 'image/jpeg');
          }
      }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
          const file = event.target.files[0];
          setSelectedImage(file);

          const reader = new FileReader();
          reader.onloadend = () => {
              setImagePreview(reader.result as string);
          }
          reader.readAsDataURL(file);
          setIsImageModalOpen(false);
      }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  useEffect(() => {
    if (onSelectLocation) {
      onSelectLocation = (locationName: string) => {
        setInputValue((prev) => `Tell me about ${locationName}`)
      }
    }
  }, [onSelectLocation])

const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const userPrompt = selectedImage ? inputValue : inputValue;

    if (!userPrompt.trim() && !selectedImage) return;

    const userMessage: Message = {
        id: Date.now().toString(),
        content: selectedImage ? `Image attached: ${inputValue}` : inputValue,
        sender: "user",
        timestamp: new Date(),
        type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
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

        const response = await generateGeminiResponse({
            prompt: userPrompt,
            userLocation,
            landmarks,
            nearestPOI,
            language: "",
            image: selectedImage,
        });

      const isLocationRequest =
        inputValue.toLowerCase().includes("where") ||
        inputValue.toLowerCase().includes("location") ||
        inputValue.toLowerCase().includes("map") ||
        inputValue.toLowerCase().includes("direction")

      const isTranslationRequest =
        inputValue.toLowerCase().includes("translate") || inputValue.toLowerCase().includes("language")

      let botResponse: Message

      if (isLocationRequest && nearestPOI) {
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
          setIsLoading(false);
        setSelectedImage(null);
        setImagePreview(null);
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

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${locationData.lat},${locationData.lng}`
    window.open(mapUrl, "_blank")
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt)
  }

  return (
    <div className="flex flex-col h-[500px] rounded-xl border shadow-lg overflow-hidden glass-card">
      <div className="p-4 border-b bg-primary/10 flex items-center">
        <img
          src="/logo-placeholder.png"
          alt="Katsuōji Mate Logo"
          className="h-6 w-auto mr-2"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/24x24?text=Logo"
          }}
        />
        <h3 className="font-semibold">Temple Assistant</h3>
      </div>

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

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-900">
        <div className="flex gap-2">
            <Dialog open={isCameraModalOpen} onOpenChange={setIsCameraModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Take a photo</DialogTitle>
                        <DialogDescription>
                            Use your camera to capture a photo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center">
                        <video ref={videoRef} autoPlay className="w-full h-auto" />
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={closeCamera}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="button" variant="default" onClick={capturePhoto}>Capture</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
                  {imagePreview && (
                    <div className="relative">
                        <img src={imagePreview} alt="Selected" className="w-20 h-20 object-cover rounded-md mr-2" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0"
                            onClick={removeImage}

                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                  )}

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

            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                <DialogTrigger asChild>
                    <Button type="button" size="icon" variant="secondary" className="shrink-0" onClick={() => setIsImageModalOpen(true)}>
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Image</DialogTitle>
                    </DialogHeader>

                    <Button variant="outline" className="w-full mb-2" onClick={openCamera}>
                        <Camera className="mr-2 h-4 w-4" /> Use Camera
                    </Button>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <Button variant="outline" className="w-full" asChild>
                            <span>Choose from Gallery</span>
                        </Button>
                    </label>

                </DialogContent>
            </Dialog>

          <Button type="submit" size="icon" disabled={isLoading || (!inputValue.trim() && !selectedImage)} className="shrink-0">
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatInterface