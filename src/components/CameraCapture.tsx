"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, FlipVerticalIcon as FlipCameraIcon, Loader, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { Landmark } from "@/components/LocationDropdown"

interface CameraCaptureProps {
  userLocation: GeolocationCoordinates | null
  landmarks: Landmark[]
  height?: string
  onImageCapture: (imageData: string, nearestLandmark?: Landmark) => void
}

const CameraCapture = ({ userLocation, landmarks, height = "400px", onImageCapture }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [nearestLandmark, setNearestLandmark] = useState<Landmark | null>(null)

  // Initialize camera
  useEffect(() => {
    let mounted = true

    const initCamera = async () => {
      try {
        setLoading(true)
        setError(null)

        // Stop any existing stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        // Get camera stream
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (mounted) {
          setStream(newStream)

          if (videoRef.current) {
            videoRef.current.srcObject = newStream
          }

          setLoading(false)
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        if (mounted) {
          setError(`Could not access camera: ${err instanceof Error ? err.message : String(err)}`)
          setLoading(false)
        }
      }
    }

    initCamera()

    return () => {
      mounted = false
      // Clean up stream when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  // Find nearest landmark when location changes
  useEffect(() => {
    if (!userLocation || !landmarks || landmarks.length === 0) return

    // Find the nearest landmark
    const nearest = findNearestLandmark(userLocation, landmarks)
    setNearestLandmark(nearest)
  }, [userLocation, landmarks])

  // Helper function to find nearest landmark
  const findNearestLandmark = (location: GeolocationCoordinates, landmarks: Landmark[]): Landmark | null => {
    if (!location || landmarks.length === 0) return null

    let nearestLandmark: Landmark | null = null
    let shortestDistance = Number.POSITIVE_INFINITY

    landmarks.forEach((landmark) => {
      const landmarkLat = Number.parseFloat(landmark.latitude)
      const landmarkLng = Number.parseFloat(landmark.longitude)

      if (isNaN(landmarkLat) || isNaN(landmarkLng)) return

      // Calculate distance using Haversine formula
      const R = 6371e3 // Earth radius in meters
      const φ1 = (location.latitude * Math.PI) / 180
      const φ2 = (landmarkLat * Math.PI) / 180
      const Δφ = ((landmarkLat - location.latitude) * Math.PI) / 180
      const Δλ = ((landmarkLng - location.longitude) * Math.PI) / 180

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

  // Switch camera between front and back
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  // Capture image from video stream
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data as base64 string
    const imageData = canvas.toDataURL("image/jpeg")
    setCapturedImage(imageData)

    // Pass image data and nearest landmark to parent component
    onImageCapture(imageData, nearestLandmark || undefined)
  }

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null)
  }

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg mb-6 relative" style={{ height }}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Camera Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-white">Initializing camera...</p>
          </div>
        </div>
      )}

      {/* Video preview */}
      <div className={cn("relative w-full h-full", capturedImage ? "hidden" : "block")}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {/* Camera controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-black/50 hover:bg-black/70"
            onClick={toggleCamera}
          >
            <FlipCameraIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="default"
            size="icon"
            className="rounded-full w-16 h-16"
            onClick={captureImage}
            disabled={loading}
          >
            <Camera className="h-8 w-8" />
          </Button>
        </div>

        {/* Nearest landmark indicator */}
        {nearestLandmark && (
          <div className="absolute top-4 left-4 right-4 bg-black/50 text-white p-2 rounded-md text-sm">
            <p className="font-medium">Nearby: {nearestLandmark.place_name_en || nearestLandmark.place_name_jp}</p>
          </div>
        )}
      </div>

      {/* Captured image preview */}
      <div className={cn("relative w-full h-full", capturedImage ? "block" : "hidden")}>
        {capturedImage && (
          <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
        )}

        {/* Image controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button variant="secondary" className="rounded-full bg-black/50 hover:bg-black/70" onClick={retakePhoto}>
            Retake
          </Button>

          <Button
            variant="default"
            className="rounded-full"
            onClick={() => {
              // Image is already captured and passed to parent
              // This button confirms the selection
            }}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Use Photo
          </Button>
        </div>

        {/* Landmark info on captured image */}
        {nearestLandmark && (
          <div className="absolute top-4 left-4 right-4 bg-black/50 text-white p-3 rounded-md">
            <p className="font-medium text-lg">{nearestLandmark.place_name_en || nearestLandmark.place_name_jp}</p>
            {nearestLandmark.desc_en && (
              <p className="text-sm mt-1 opacity-90">{nearestLandmark.desc_en.substring(0, 100)}...</p>
            )}
          </div>
        )}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default CameraCapture

